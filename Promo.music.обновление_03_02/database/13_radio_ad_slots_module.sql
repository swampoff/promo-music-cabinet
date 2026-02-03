-- =====================================================
-- PROMO.FM - RADIO AD SLOTS & ROTATION PACKAGES
-- Модуль рекламных слотов и пакетов ротации
-- =====================================================

-- =====================================================
-- CUSTOM TYPES для рекламы и пакетов
-- =====================================================

-- Тип рекламного пакета
CREATE TYPE ad_package_type AS ENUM (
  'slot_5sec',       -- 5 секунд
  'slot_10sec',      -- 10 секунд
  'slot_15sec',      -- 15 секунд
  'slot_30sec'       -- 30 секунд
);

-- Временной слот
CREATE TYPE time_slot_type AS ENUM (
  'morning',         -- 06:00-12:00 (утро)
  'day',             -- 12:00-18:00 (день)
  'evening',         -- 18:00-00:00 (вечер)
  'night',           -- 00:00-06:00 (ночь)
  'prime_time',      -- Прайм-тайм (пиковые часы)
  'any_time'         -- Любое время
);

-- Тип ценообразования
CREATE TYPE pricing_type AS ENUM (
  'fixed',           -- Фиксированная цена
  'auction',         -- Аукцион
  'dynamic',         -- Динамическое ценообразование
  'bulk_discount'    -- Скидка за объем
);

-- Статус рекламной кампании
CREATE TYPE ad_campaign_status AS ENUM (
  'draft',           -- Черновик
  'pending',         -- На модерации
  'active',          -- Активна
  'paused',          -- Приостановлена
  'completed',       -- Завершена
  'cancelled'        -- Отменена
);

-- Тип пакета ротации трека
CREATE TYPE track_rotation_package AS ENUM (
  'light',           -- Light rotation (3-5 раз/день)
  'medium',          -- Medium rotation (6-10 раз/день)
  'heavy',           -- Heavy rotation (11-20 раз/день)
  'power'            -- Power rotation (21+ раз/день)
);

-- Статус оценки трека
CREATE TYPE track_review_status AS ENUM (
  'pending',         -- Ожидает оценки
  'reviewed',        -- Оценен
  'approved',        -- Одобрен
  'rejected'         -- Отклонен
);

-- =====================================================
-- ТАБЛИЦА: radio_rotation_packages
-- Пакеты ротации треков
-- =====================================================
CREATE TABLE radio_rotation_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Информация о пакете
  package_name VARCHAR(255) NOT NULL,
  package_type track_rotation_package NOT NULL,
  
  -- Параметры ротации
  plays_per_day_min INTEGER NOT NULL, -- Минимум проигрываний в день
  plays_per_day_max INTEGER NOT NULL, -- Максимум проигрываний в день
  duration_days INTEGER NOT NULL,      -- Длительность пакета (дни)
  
  -- Временные слоты
  allowed_time_slots time_slot_type[] DEFAULT ARRAY['any_time']::time_slot_type[],
  
  -- Ценообразование
  base_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Скидки
  bulk_discount_enabled BOOLEAN DEFAULT FALSE,
  bulk_discount_percent DECIMAL(5,2), -- Скидка за объем (%)
  bulk_min_tracks INTEGER,             -- Минимум треков для скидки
  
  -- Комиссия платформы (по умолчанию 15%)
  platform_commission_percent DECIMAL(5,2) DEFAULT 15.00,
  
  -- Описание
  description TEXT,
  features JSONB, -- ["Гарантированные слоты", "Прайм-тайм", ...]
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_plays_range CHECK (plays_per_day_min <= plays_per_day_max),
  CONSTRAINT valid_duration CHECK (duration_days > 0),
  CONSTRAINT valid_price CHECK (base_price >= 0)
);

CREATE INDEX idx_rotation_packages_station ON radio_rotation_packages(station_id);
CREATE INDEX idx_rotation_packages_type ON radio_rotation_packages(package_type);
CREATE INDEX idx_rotation_packages_active ON radio_rotation_packages(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE radio_rotation_packages IS 'Пакеты ротации треков для продажи артистам';

-- =====================================================
-- ТАБЛИЦА: radio_track_reviews
-- Оценка треков радиостанцией (10-балльная шкала)
-- =====================================================
CREATE TABLE radio_track_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES radio_track_requests(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Кто оценил
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewer_name VARCHAR(255),
  
  -- Оценки (1-10 баллов)
  mix_quality_score INTEGER CHECK (mix_quality_score >= 1 AND mix_quality_score <= 10),
  arrangement_score INTEGER CHECK (arrangement_score >= 1 AND arrangement_score <= 10),
  commercial_potential_score INTEGER CHECK (commercial_potential_score >= 1 AND commercial_potential_score <= 10),
  
  -- Общая оценка (среднее)
  overall_score DECIMAL(3,1),
  
  -- Обратная связь
  feedback_text TEXT,
  strengths TEXT,       -- Сильные стороны
  weaknesses TEXT,      -- Слабые стороны
  recommendations TEXT, -- Рекомендации
  
  -- Решение
  decision track_review_status DEFAULT 'pending',
  rejection_reason TEXT,
  
  -- Рекомендуемый пакет ротации
  recommended_package track_rotation_package,
  
  -- Метаданные
  review_duration_seconds INTEGER, -- Сколько времени заняла оценка
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_station_request_review UNIQUE (station_id, request_id)
);

CREATE INDEX idx_track_reviews_station ON radio_track_reviews(station_id);
CREATE INDEX idx_track_reviews_request ON radio_track_reviews(request_id);
CREATE INDEX idx_track_reviews_track ON radio_track_reviews(track_id);
CREATE INDEX idx_track_reviews_decision ON radio_track_reviews(decision);
CREATE INDEX idx_track_reviews_score ON radio_track_reviews(overall_score DESC);

-- Триггер для автоматического расчета overall_score
CREATE OR REPLACE FUNCTION calculate_overall_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mix_quality_score IS NOT NULL AND 
     NEW.arrangement_score IS NOT NULL AND 
     NEW.commercial_potential_score IS NOT NULL THEN
    NEW.overall_score := ROUND(
      (NEW.mix_quality_score + NEW.arrangement_score + NEW.commercial_potential_score) / 3.0,
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_overall_score
  BEFORE INSERT OR UPDATE ON radio_track_reviews
  FOR EACH ROW
  EXECUTE FUNCTION calculate_overall_score();

COMMENT ON TABLE radio_track_reviews IS 'Профессиональная оценка треков радиостанциями';

-- =====================================================
-- ТАБЛИЦА: radio_purchased_rotations
-- Купленные артистами пакеты ротации
-- =====================================================
CREATE TABLE radio_purchased_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES radio_rotation_packages(id),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES radio_track_requests(id),
  
  -- Параметры купленного пакета
  package_type track_rotation_package NOT NULL,
  plays_per_day INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  time_slots time_slot_type[],
  
  -- Финансы
  total_price DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(10,2) DEFAULT 0,
  platform_commission DECIMAL(10,2) NOT NULL,
  station_payout DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Статус
  status VARCHAR(50) DEFAULT 'active',
  
  -- Даты ротации
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Статистика выполнения
  total_plays_scheduled INTEGER DEFAULT 0,
  total_plays_confirmed INTEGER DEFAULT 0,
  completion_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Метрики
  total_reach INTEGER DEFAULT 0,        -- Общий охват
  total_listeners INTEGER DEFAULT 0,    -- Всего слушателей
  peak_listeners INTEGER DEFAULT 0,     -- Пиковые слушатели
  avg_listeners DECIMAL(10,2) DEFAULT 0,
  
  -- Отчетность
  report_generated BOOLEAN DEFAULT FALSE,
  report_url TEXT,
  report_generated_at TIMESTAMPTZ,
  
  -- Подтверждения проигрываний
  confirmations JSONB DEFAULT '[]'::jsonb, -- [{played_at, listeners, confirmed_by}, ...]
  
  -- Транзакция
  transaction_id UUID REFERENCES transactions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_completion CHECK (completion_percent >= 0 AND completion_percent <= 100)
);

CREATE INDEX idx_purchased_rotations_station ON radio_purchased_rotations(station_id);
CREATE INDEX idx_purchased_rotations_artist ON radio_purchased_rotations(artist_id);
CREATE INDEX idx_purchased_rotations_track ON radio_purchased_rotations(track_id);
CREATE INDEX idx_purchased_rotations_dates ON radio_purchased_rotations(start_date, end_date);
CREATE INDEX idx_purchased_rotations_status ON radio_purchased_rotations(status);

COMMENT ON TABLE radio_purchased_rotations IS 'Купленные пакеты ротации треков';

-- =====================================================
-- ТАБЛИЦА: radio_ad_packages
-- Рекламные пакеты
-- =====================================================
CREATE TABLE radio_ad_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Информация о пакете
  package_name VARCHAR(255) NOT NULL,
  package_type ad_package_type NOT NULL,
  
  -- Параметры
  duration_seconds INTEGER NOT NULL,   -- Длительность ролика
  plays_per_day INTEGER NOT NULL,      -- Количество выходов в день
  campaign_duration_days INTEGER NOT NULL, -- Длительность кампании
  
  -- Временные слоты
  time_slots time_slot_type[] NOT NULL,
  
  -- Ценообразование
  pricing_type pricing_type NOT NULL DEFAULT 'fixed',
  base_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),        -- Текущая цена (для dynamic)
  min_bid DECIMAL(10,2),              -- Минимальная ставка (для auction)
  
  -- Динамическое ценообразование
  dynamic_multiplier DECIMAL(5,2) DEFAULT 1.00, -- Множитель при высокой занятости
  occupancy_threshold INTEGER DEFAULT 80,        -- Порог занятости (%) для повышения цены
  
  -- Bulk discount
  bulk_discount_percent DECIMAL(5,2),
  bulk_min_days INTEGER,
  
  -- Комиссия платформы
  platform_commission_percent DECIMAL(5,2) DEFAULT 15.00,
  
  -- Описание
  description TEXT,
  features TEXT[],
  
  -- Доступность
  total_slots_available INTEGER,
  slots_occupied INTEGER DEFAULT 0,
  occupancy_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_duration CHECK (duration_seconds IN (5, 10, 15, 30)),
  CONSTRAINT valid_occupancy CHECK (occupancy_percent >= 0 AND occupancy_percent <= 100)
);

CREATE INDEX idx_ad_packages_station ON radio_ad_packages(station_id);
CREATE INDEX idx_ad_packages_type ON radio_ad_packages(package_type);
CREATE INDEX idx_ad_packages_pricing ON radio_ad_packages(pricing_type);
CREATE INDEX idx_ad_packages_active ON radio_ad_packages(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE radio_ad_packages IS 'Рекламные пакеты для продажи рекламодателям';

-- =====================================================
-- ТАБЛИЦА: radio_ad_campaigns
-- Рекламные кампании
-- =====================================================
CREATE TABLE radio_ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES radio_ad_packages(id),
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Информация о кампании
  campaign_name VARCHAR(255) NOT NULL,
  advertiser_company VARCHAR(255),
  
  -- Рекламный контент
  ad_audio_url TEXT NOT NULL,
  ad_duration_seconds INTEGER NOT NULL,
  
  -- Параметры
  plays_per_day INTEGER NOT NULL,
  time_slots time_slot_type[],
  
  -- Даты
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Финансы
  pricing_type pricing_type NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  bid_amount DECIMAL(10,2),           -- Ставка (для auction)
  discount_applied DECIMAL(10,2) DEFAULT 0,
  platform_commission DECIMAL(10,2) NOT NULL,
  station_payout DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Статус
  status ad_campaign_status DEFAULT 'draft',
  
  -- Модерация контента
  is_approved BOOLEAN DEFAULT FALSE,
  moderated_by UUID REFERENCES users(id),
  moderation_notes TEXT,
  
  -- Статистика
  total_plays_scheduled INTEGER DEFAULT 0,
  total_plays_actual INTEGER DEFAULT 0,
  total_listeners INTEGER DEFAULT 0,
  avg_listeners DECIMAL(10,2) DEFAULT 0,
  
  -- Транзакция
  transaction_id UUID REFERENCES transactions(id),
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_campaign_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_ad_campaigns_station ON radio_ad_campaigns(station_id);
CREATE INDEX idx_ad_campaigns_advertiser ON radio_ad_campaigns(advertiser_id);
CREATE INDEX idx_ad_campaigns_package ON radio_ad_campaigns(package_id);
CREATE INDEX idx_ad_campaigns_status ON radio_ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_dates ON radio_ad_campaigns(start_date, end_date);

COMMENT ON TABLE radio_ad_campaigns IS 'Рекламные кампании рекламодателей';

-- =====================================================
-- ТАБЛИЦА: radio_ad_bids
-- Ставки в аукционах (для auction pricing)
-- =====================================================
CREATE TABLE radio_ad_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  package_id UUID NOT NULL REFERENCES radio_ad_packages(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ставка
  bid_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Параметры кампании
  desired_start_date DATE NOT NULL,
  desired_duration_days INTEGER NOT NULL,
  
  -- Статус
  status VARCHAR(50) DEFAULT 'active', -- active, outbid, won, expired
  
  -- Метаданные
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT valid_bid_amount CHECK (bid_amount > 0)
);

CREATE INDEX idx_ad_bids_package ON radio_ad_bids(package_id);
CREATE INDEX idx_ad_bids_advertiser ON radio_ad_bids(advertiser_id);
CREATE INDEX idx_ad_bids_status ON radio_ad_bids(status);
CREATE INDEX idx_ad_bids_amount ON radio_ad_bids(bid_amount DESC);

COMMENT ON TABLE radio_ad_bids IS 'Ставки рекламодателей в аукционах';

-- =====================================================
-- ТАБЛИЦА: radio_venue_requests
-- Заявки от заведений (для будущего функционала)
-- =====================================================
CREATE TABLE radio_venue_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Информация о заведении
  venue_name VARCHAR(255) NOT NULL,
  venue_type VARCHAR(100), -- bar, restaurant, club, cafe, etc.
  
  -- Локация
  country VARCHAR(2),
  city VARCHAR(100),
  address TEXT,
  
  -- Контакты
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Запрос
  request_type VARCHAR(100), -- partnership, streaming, custom_playlist, etc.
  message TEXT,
  
  -- Статус
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Рассмотрение
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_requests_station ON radio_venue_requests(station_id);
CREATE INDEX idx_venue_requests_venue ON radio_venue_requests(venue_id);
CREATE INDEX idx_venue_requests_status ON radio_venue_requests(status);

COMMENT ON TABLE radio_venue_requests IS 'Заявки от заведений (будущий функционал)';

-- =====================================================
-- FUNCTIONS для работы со слотами и пакетами
-- =====================================================

-- Купить пакет ротации
CREATE OR REPLACE FUNCTION purchase_rotation_package(
  p_artist_id UUID,
  p_track_id UUID,
  p_station_id UUID,
  p_package_id UUID,
  p_start_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_package RECORD;
  v_total_price DECIMAL(10,2);
  v_discount DECIMAL(10,2) := 0;
  v_commission DECIMAL(10,2);
  v_payout DECIMAL(10,2);
  v_rotation_id UUID;
BEGIN
  -- Получаем пакет
  SELECT * INTO v_package
  FROM radio_rotation_packages
  WHERE id = p_package_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package not found or inactive';
  END IF;
  
  -- Рассчитываем цену
  v_total_price := v_package.base_price;
  
  -- Применяем bulk discount если нужно
  IF v_package.bulk_discount_enabled THEN
    -- TODO: проверить количество купленных пакетов и применить скидку
    v_discount := 0;
  END IF;
  
  v_total_price := v_total_price - v_discount;
  v_commission := v_total_price * (v_package.platform_commission_percent / 100);
  v_payout := v_total_price - v_commission;
  
  -- Создаем купленную ротацию
  INSERT INTO radio_purchased_rotations (
    station_id,
    package_id,
    track_id,
    artist_id,
    package_type,
    plays_per_day,
    duration_days,
    time_slots,
    total_price,
    discount_applied,
    platform_commission,
    station_payout,
    start_date,
    end_date,
    total_plays_scheduled
  ) VALUES (
    p_station_id,
    p_package_id,
    p_track_id,
    p_artist_id,
    v_package.package_type,
    (v_package.plays_per_day_min + v_package.plays_per_day_max) / 2,
    v_package.duration_days,
    v_package.allowed_time_slots,
    v_total_price,
    v_discount,
    v_commission,
    v_payout,
    p_start_date,
    p_start_date + v_package.duration_days,
    ((v_package.plays_per_day_min + v_package.plays_per_day_max) / 2) * v_package.duration_days
  )
  RETURNING id INTO v_rotation_id;
  
  RETURN v_rotation_id;
END;
$$ LANGUAGE plpgsql;

-- Подтвердить проигрывание
CREATE OR REPLACE FUNCTION confirm_rotation_play(
  p_rotation_id UUID,
  p_listeners_count INTEGER,
  p_confirmed_by UUID
)
RETURNS VOID AS $$
DECLARE
  v_confirmation JSONB;
BEGIN
  -- Создаем объект подтверждения
  v_confirmation := jsonb_build_object(
    'played_at', NOW(),
    'listeners', p_listeners_count,
    'confirmed_by', p_confirmed_by
  );
  
  -- Обновляем ротацию
  UPDATE radio_purchased_rotations
  SET
    total_plays_confirmed = total_plays_confirmed + 1,
    total_listeners = total_listeners + p_listeners_count,
    peak_listeners = GREATEST(peak_listeners, p_listeners_count),
    confirmations = confirmations || v_confirmation,
    completion_percent = ROUND(
      (total_plays_confirmed + 1)::DECIMAL / NULLIF(total_plays_scheduled, 0) * 100,
      2
    ),
    updated_at = NOW()
  WHERE id = p_rotation_id;
  
  -- Обновляем avg_listeners
  UPDATE radio_purchased_rotations
  SET avg_listeners = ROUND(total_listeners::DECIMAL / NULLIF(total_plays_confirmed, 0), 2)
  WHERE id = p_rotation_id;
END;
$$ LANGUAGE plpgsql;

-- Обновить динамическую цену пакета
CREATE OR REPLACE FUNCTION update_dynamic_pricing(p_package_id UUID)
RETURNS VOID AS $$
DECLARE
  v_package RECORD;
  v_new_price DECIMAL(10,2);
BEGIN
  SELECT * INTO v_package
  FROM radio_ad_packages
  WHERE id = p_package_id AND pricing_type = 'dynamic';
  
  IF FOUND THEN
    -- Если занятость выше порога, повышаем цену
    IF v_package.occupancy_percent >= v_package.occupancy_threshold THEN
      v_new_price := v_package.base_price * v_package.dynamic_multiplier;
    ELSE
      v_new_price := v_package.base_price;
    END IF;
    
    UPDATE radio_ad_packages
    SET current_price = v_new_price
    WHERE id = p_package_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_rotation_packages_updated_at 
  BEFORE UPDATE ON radio_rotation_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_reviews_updated_at 
  BEFORE UPDATE ON radio_track_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchased_rotations_updated_at 
  BEFORE UPDATE ON radio_purchased_rotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_packages_updated_at 
  BEFORE UPDATE ON radio_ad_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at 
  BEFORE UPDATE ON radio_ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE radio_rotation_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_track_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_purchased_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_ad_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_venue_requests ENABLE ROW LEVEL SECURITY;

-- Станции видят свои пакеты
CREATE POLICY rotation_packages_station ON radio_rotation_packages
  FOR ALL
  USING (
    station_id IN (
      SELECT id FROM radio_stations 
      WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Публичный просмотр активных пакетов
CREATE POLICY rotation_packages_public_view ON radio_rotation_packages
  FOR SELECT
  USING (is_active = TRUE);

-- Артисты видят свои купленные ротации
CREATE POLICY purchased_rotations_artist_view ON radio_purchased_rotations
  FOR SELECT
  USING (
    artist_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Станции видят все купленные ротации
CREATE POLICY purchased_rotations_station_view ON radio_purchased_rotations
  FOR ALL
  USING (
    station_id IN (
      SELECT id FROM radio_stations 
      WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION purchase_rotation_package(UUID, UUID, UUID, UUID, DATE) IS 'Купить пакет ротации трека';
COMMENT ON FUNCTION confirm_rotation_play(UUID, INTEGER, UUID) IS 'Подтвердить проигрывание трека';
COMMENT ON FUNCTION update_dynamic_pricing(UUID) IS 'Обновить динамическую цену рекламного пакета';
