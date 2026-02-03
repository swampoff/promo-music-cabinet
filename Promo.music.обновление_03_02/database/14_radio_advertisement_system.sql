-- =====================================================
-- PROMO.MUSIC - RADIO ADVERTISEMENT SYSTEM
-- Модуль рекламных пакетов и слотов для радиостанций
-- =====================================================

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Тип ценообразования
CREATE TYPE pricing_type AS ENUM (
  'fixed',           -- Фиксированная цена
  'auction'          -- Аукцион
);

-- Временной слот
CREATE TYPE time_slot_type AS ENUM (
  'morning',         -- Утро (06:00-12:00)
  'afternoon',       -- День (12:00-18:00)
  'evening',         -- Вечер (18:00-22:00)
  'night',           -- Ночь (22:00-06:00)
  'prime_time',      -- Прайм-тайм (18:00-21:00)
  'any'              -- Любое время
);

-- Статус слота вещания
CREATE TYPE broadcast_slot_status AS ENUM (
  'available',       -- Доступен
  'booked',          -- Забронирован
  'paid',            -- Оплачен
  'broadcasted',     -- Вышел в эфир
  'cancelled'        -- Отменен
);

-- Статус заказа рекламы
CREATE TYPE advertisement_order_status AS ENUM (
  'pending_payment',     -- Ожидает оплаты
  'paid',                -- Оплачен
  'in_review',           -- На модерации
  'approved_by_radio',   -- Одобрен радио
  'rejected_by_radio',   -- Отклонен радио
  'fulfilled',           -- Выполнен
  'refunded',            -- Возвращен
  'cancelled'            -- Отменен
);

-- Статус комиссии
CREATE TYPE commission_status AS ENUM (
  'pending',         -- Ожидает
  'collected',       -- Собрана
  'refunded'         -- Возвращена
);

-- =====================================================
-- ТАБЛИЦА: radio_advertisement_packages
-- Шаблоны рекламных пакетов
-- =====================================================
CREATE TABLE radio_advertisement_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связь с радиостанцией
  radio_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Параметры ролика
  spot_duration_seconds INTEGER NOT NULL, -- 5, 10, 15, 30, 60
  
  -- Ротация
  rotations_per_day INTEGER NOT NULL DEFAULT 1, -- Количество выходов в день
  time_slot time_slot_type NOT NULL DEFAULT 'any',
  
  -- Ценообразование
  pricing_type pricing_type NOT NULL DEFAULT 'fixed',
  base_price DECIMAL(12, 2) NOT NULL, -- Базовая цена за слот
  
  -- Конфигурация ценообразования (JSONB)
  pricing_config JSONB DEFAULT '{
    "bulk_discount": {
      "enabled": true,
      "min_slots": 5,
      "discount_percent": 10
    },
    "dynamic_demand": {
      "enabled": true,
      "threshold_percent": 80,
      "price_multiplier": 1.2
    }
  }'::jsonb,
  
  -- Аукцион (если pricing_type = 'auction')
  auction_config JSONB DEFAULT '{
    "starting_bid": 0,
    "min_increment": 100,
    "auto_extend": true,
    "extend_minutes": 5
  }'::jsonb,
  
  -- Лимиты
  max_slots INTEGER NOT NULL DEFAULT 100, -- Максимум слотов
  slots_taken INTEGER NOT NULL DEFAULT 0, -- Занято слотов
  
  -- Комиссия платформы
  platform_commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.15, -- 15%
  
  -- Статус
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Медиа
  package_image_url TEXT,
  sample_audio_url TEXT,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Индексы
  CONSTRAINT valid_duration CHECK (spot_duration_seconds IN (5, 10, 15, 30, 60)),
  CONSTRAINT valid_rotations CHECK (rotations_per_day >= 1 AND rotations_per_day <= 100),
  CONSTRAINT valid_price CHECK (base_price >= 0),
  CONSTRAINT valid_commission CHECK (platform_commission_rate >= 0 AND platform_commission_rate <= 1),
  CONSTRAINT valid_slots CHECK (max_slots > 0 AND slots_taken >= 0 AND slots_taken <= max_slots)
);

CREATE INDEX idx_radio_ad_packages_radio_id ON radio_advertisement_packages(radio_id);
CREATE INDEX idx_radio_ad_packages_active ON radio_advertisement_packages(is_active) WHERE is_active = true;
CREATE INDEX idx_radio_ad_packages_featured ON radio_advertisement_packages(is_featured) WHERE is_featured = true;
CREATE INDEX idx_radio_ad_packages_pricing_type ON radio_advertisement_packages(pricing_type);

-- =====================================================
-- ТАБЛИЦА: radio_broadcast_slots
-- Конкретные слоты вещания
-- =====================================================
CREATE TABLE radio_broadcast_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связи
  radio_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES radio_advertisement_packages(id) ON DELETE CASCADE,
  
  -- Дата и время вещания
  broadcast_date DATE NOT NULL,
  broadcast_time TIME NOT NULL,
  duration_seconds INTEGER NOT NULL,
  
  -- Цена этого слота (может отличаться от базовой из-за спроса)
  slot_price DECIMAL(12, 2) NOT NULL,
  
  -- Статус
  status broadcast_slot_status NOT NULL DEFAULT 'available',
  
  -- Связь с заказом (если забронирован)
  advertisement_order_id UUID REFERENCES advertisement_orders(id) ON DELETE SET NULL,
  
  -- Информация о рекламе (заполняется после бронирования)
  buyer_venue_name VARCHAR(255),
  ad_creative_file_url TEXT,
  ad_creative_text TEXT,
  
  -- Отметка о вещании
  broadcasted_at TIMESTAMPTZ,
  broadcast_confirmed BOOLEAN DEFAULT false,
  broadcast_notes TEXT,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Индексы и ограничения
  CONSTRAINT valid_duration CHECK (duration_seconds > 0),
  CONSTRAINT valid_slot_price CHECK (slot_price >= 0),
  CONSTRAINT unique_radio_slot_time UNIQUE (radio_id, broadcast_date, broadcast_time)
);

CREATE INDEX idx_radio_broadcast_slots_radio_id ON radio_broadcast_slots(radio_id);
CREATE INDEX idx_radio_broadcast_slots_package_id ON radio_broadcast_slots(package_id);
CREATE INDEX idx_radio_broadcast_slots_status ON radio_broadcast_slots(status);
CREATE INDEX idx_radio_broadcast_slots_date ON radio_broadcast_slots(broadcast_date);
CREATE INDEX idx_radio_broadcast_slots_order_id ON radio_broadcast_slots(advertisement_order_id);
CREATE INDEX idx_radio_broadcast_slots_available ON radio_broadcast_slots(status, broadcast_date) 
  WHERE status = 'available';

-- =====================================================
-- ТАБЛИЦА: advertisement_orders
-- Заказы рекламы
-- =====================================================
CREATE TABLE advertisement_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связи
  package_id UUID NOT NULL REFERENCES radio_advertisement_packages(id) ON DELETE RESTRICT,
  seller_radio_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE RESTRICT,
  
  -- Покупатель
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  buyer_user_email VARCHAR(255) NOT NULL,
  buyer_user_name VARCHAR(255),
  buyer_venue_name VARCHAR(255), -- Если покупатель - заведение
  
  -- Забронированные слоты
  broadcast_slot_ids UUID[] NOT NULL,
  total_slots INTEGER NOT NULL,
  
  -- Креатив
  ad_creative_file_url TEXT,
  ad_creative_text TEXT,
  ad_creative_type VARCHAR(50), -- 'audio_file', 'text_to_speech', 'both'
  
  -- Статус
  status advertisement_order_status NOT NULL DEFAULT 'pending_payment',
  
  -- Финансы
  base_amount DECIMAL(12, 2) NOT NULL, -- Базовая стоимость
  discount_amount DECIMAL(12, 2) DEFAULT 0, -- Скидка
  demand_surcharge DECIMAL(12, 2) DEFAULT 0, -- Наценка за спрос
  payment_amount DECIMAL(12, 2) NOT NULL, -- Итоговая сумма к оплате
  commission_amount DECIMAL(12, 2) NOT NULL, -- Комиссия платформы (15%)
  net_amount_to_radio DECIMAL(12, 2) NOT NULL, -- Чистая выручка радио (85%)
  
  -- Статус комиссии
  commission_status commission_status NOT NULL DEFAULT 'pending',
  commission_collected_at TIMESTAMPTZ,
  
  -- Динамическое ценообразование (для аудита)
  pricing_details JSONB DEFAULT '{
    "base_price_per_slot": 0,
    "total_slots": 0,
    "occupancy_percent": 0,
    "demand_multiplier_applied": false,
    "bulk_discount_applied": false,
    "discount_percent": 0
  }'::jsonb,
  
  -- Отчет о вещании
  play_report JSONB DEFAULT '{
    "total_plays": 0,
    "play_dates": [],
    "detailed_schedule": [],
    "completion_percent": 0
  }'::jsonb,
  
  -- Модерация
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Выполнение
  fulfilled_at TIMESTAMPTZ,
  fulfillment_notes TEXT,
  
  -- Оплата
  paid_at TIMESTAMPTZ,
  payment_id VARCHAR(255), -- ID транзакции
  refund_amount DECIMAL(12, 2) DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ограничения
  CONSTRAINT valid_amounts CHECK (
    payment_amount >= 0 AND 
    commission_amount >= 0 AND 
    net_amount_to_radio >= 0 AND
    payment_amount = (base_amount - discount_amount + demand_surcharge)
  ),
  CONSTRAINT valid_commission CHECK (
    commission_amount = payment_amount * 0.15
  ),
  CONSTRAINT valid_net_amount CHECK (
    net_amount_to_radio = payment_amount - commission_amount
  )
);

CREATE INDEX idx_advertisement_orders_package_id ON advertisement_orders(package_id);
CREATE INDEX idx_advertisement_orders_radio_id ON advertisement_orders(seller_radio_id);
CREATE INDEX idx_advertisement_orders_buyer_id ON advertisement_orders(buyer_user_id);
CREATE INDEX idx_advertisement_orders_status ON advertisement_orders(status);
CREATE INDEX idx_advertisement_orders_created_at ON advertisement_orders(created_at DESC);
CREATE INDEX idx_advertisement_orders_pending ON advertisement_orders(status) 
  WHERE status = 'pending_payment';

-- =====================================================
-- ТАБЛИЦА: advertisement_auction_bids
-- Ставки в аукционных пакетах
-- =====================================================
CREATE TABLE advertisement_auction_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связи
  package_id UUID NOT NULL REFERENCES radio_advertisement_packages(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES radio_broadcast_slots(id) ON DELETE CASCADE,
  
  -- Участник
  bidder_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bidder_user_email VARCHAR(255) NOT NULL,
  bidder_venue_name VARCHAR(255),
  
  -- Ставка
  bid_amount DECIMAL(12, 2) NOT NULL,
  auto_bid_enabled BOOLEAN DEFAULT false,
  max_auto_bid_amount DECIMAL(12, 2),
  
  -- Статус
  is_winning BOOLEAN DEFAULT false,
  is_outbid BOOLEAN DEFAULT false,
  
  -- Креатив (опционально при ставке)
  ad_creative_file_url TEXT,
  ad_creative_text TEXT,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_bid CHECK (bid_amount > 0)
);

CREATE INDEX idx_auction_bids_package_id ON advertisement_auction_bids(package_id);
CREATE INDEX idx_auction_bids_slot_id ON advertisement_auction_bids(slot_id);
CREATE INDEX idx_auction_bids_bidder_id ON advertisement_auction_bids(bidder_user_id);
CREATE INDEX idx_auction_bids_winning ON advertisement_auction_bids(is_winning) WHERE is_winning = true;

-- =====================================================
-- ТАБЛИЦА: radio_advertisement_analytics
-- Аналитика вещания рекламы
-- =====================================================
CREATE TABLE radio_advertisement_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связи
  radio_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES advertisement_orders(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES radio_broadcast_slots(id) ON DELETE CASCADE,
  
  -- Дата вещания
  broadcast_date DATE NOT NULL,
  broadcast_time TIME NOT NULL,
  actual_broadcast_time TIMESTAMPTZ,
  
  -- Аналитика
  estimated_listeners INTEGER,
  actual_listeners INTEGER,
  engagement_score DECIMAL(5, 2), -- 0-100
  
  -- Качество
  audio_quality_score DECIMAL(5, 2), -- 0-10
  broadcast_quality VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
  
  -- Обратная связь
  client_rating INTEGER, -- 1-5
  client_feedback TEXT,
  
  -- Метаданные
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_listeners CHECK (estimated_listeners >= 0 AND actual_listeners >= 0),
  CONSTRAINT valid_rating CHECK (client_rating >= 1 AND client_rating <= 5)
);

CREATE INDEX idx_radio_ad_analytics_radio_id ON radio_advertisement_analytics(radio_id);
CREATE INDEX idx_radio_ad_analytics_order_id ON radio_advertisement_analytics(order_id);
CREATE INDEX idx_radio_ad_analytics_date ON radio_advertisement_analytics(broadcast_date);

-- =====================================================
-- ФУНКЦИЯ: Генерация слотов из пакета
-- =====================================================
CREATE OR REPLACE FUNCTION generate_broadcast_slots_from_package(
  p_package_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS INTEGER AS $$
DECLARE
  v_package RECORD;
  v_current_date DATE;
  v_slots_generated INTEGER := 0;
  v_slot_time TIME;
  v_rotation_index INTEGER;
BEGIN
  -- Получаем пакет
  SELECT * INTO v_package 
  FROM radio_advertisement_packages 
  WHERE id = p_package_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package not found';
  END IF;
  
  -- Генерируем слоты для каждой даты
  v_current_date := p_start_date;
  
  WHILE v_current_date <= p_end_date LOOP
    -- Генерируем N слотов в день (rotations_per_day)
    FOR v_rotation_index IN 1..v_package.rotations_per_day LOOP
      
      -- Определяем время слота на основе time_slot
      v_slot_time := CASE v_package.time_slot
        WHEN 'morning' THEN TIME '08:00:00' + (v_rotation_index * INTERVAL '2 hours')
        WHEN 'afternoon' THEN TIME '13:00:00' + (v_rotation_index * INTERVAL '1.5 hours')
        WHEN 'evening' THEN TIME '19:00:00' + (v_rotation_index * INTERVAL '1 hour')
        WHEN 'night' THEN TIME '23:00:00' + (v_rotation_index * INTERVAL '1 hour')
        WHEN 'prime_time' THEN TIME '19:00:00' + (v_rotation_index * INTERVAL '45 minutes')
        ELSE TIME '10:00:00' + (v_rotation_index * INTERVAL '2 hours')
      END;
      
      -- Вставляем слот (если не существует)
      INSERT INTO radio_broadcast_slots (
        radio_id,
        package_id,
        broadcast_date,
        broadcast_time,
        duration_seconds,
        slot_price,
        status
      )
      VALUES (
        v_package.radio_id,
        p_package_id,
        v_current_date,
        v_slot_time,
        v_package.spot_duration_seconds,
        v_package.base_price,
        'available'
      )
      ON CONFLICT (radio_id, broadcast_date, broadcast_time) DO NOTHING;
      
      v_slots_generated := v_slots_generated + 1;
    END LOOP;
    
    v_current_date := v_current_date + 1;
  END LOOP;
  
  -- Обновляем счетчик слотов в пакете
  UPDATE radio_advertisement_packages
  SET 
    max_slots = max_slots + v_slots_generated,
    updated_at = NOW()
  WHERE id = p_package_id;
  
  RETURN v_slots_generated;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИЯ: Расчет динамической цены
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_dynamic_price(
  p_package_id UUID,
  p_slot_count INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_package RECORD;
  v_occupancy DECIMAL;
  v_base_cost DECIMAL;
  v_discount DECIMAL := 0;
  v_surcharge DECIMAL := 0;
  v_final_cost DECIMAL;
  v_result JSONB;
BEGIN
  -- Получаем пакет
  SELECT * INTO v_package 
  FROM radio_advertisement_packages 
  WHERE id = p_package_id;
  
  -- Базовая стоимость
  v_base_cost := v_package.base_price * p_slot_count;
  
  -- Вычисляем занятость
  v_occupancy := (v_package.slots_taken::DECIMAL / v_package.max_slots::DECIMAL) * 100;
  
  -- Динамическая наценка за спрос
  IF (v_package.pricing_config->'dynamic_demand'->>'enabled')::boolean = true THEN
    IF v_occupancy >= (v_package.pricing_config->'dynamic_demand'->>'threshold_percent')::decimal THEN
      v_surcharge := v_base_cost * (
        (v_package.pricing_config->'dynamic_demand'->>'price_multiplier')::decimal - 1
      );
    END IF;
  END IF;
  
  -- Скидка за объем
  IF (v_package.pricing_config->'bulk_discount'->>'enabled')::boolean = true THEN
    IF p_slot_count >= (v_package.pricing_config->'bulk_discount'->>'min_slots')::integer THEN
      v_discount := (v_base_cost + v_surcharge) * 
        ((v_package.pricing_config->'bulk_discount'->>'discount_percent')::decimal / 100);
    END IF;
  END IF;
  
  -- Итоговая стоимость
  v_final_cost := v_base_cost + v_surcharge - v_discount;
  
  -- Формируем результат
  v_result := jsonb_build_object(
    'base_price_per_slot', v_package.base_price,
    'total_slots', p_slot_count,
    'base_cost', v_base_cost,
    'occupancy_percent', v_occupancy,
    'demand_surcharge', v_surcharge,
    'demand_multiplier_applied', v_surcharge > 0,
    'bulk_discount', v_discount,
    'bulk_discount_applied', v_discount > 0,
    'payment_amount', v_final_cost,
    'commission_amount', v_final_cost * v_package.platform_commission_rate,
    'net_amount_to_radio', v_final_cost * (1 - v_package.platform_commission_rate)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИЯ: Обновление счетчика занятых слотов
-- =====================================================
CREATE OR REPLACE FUNCTION update_package_slots_count()
RETURNS TRIGGER AS $$
BEGIN
  -- При изменении статуса слота обновляем счетчик
  IF TG_OP = 'UPDATE' THEN
    -- Если слот стал занят (booked, paid, broadcasted)
    IF NEW.status IN ('booked', 'paid', 'broadcasted') AND 
       OLD.status = 'available' THEN
      UPDATE radio_advertisement_packages
      SET slots_taken = slots_taken + 1
      WHERE id = NEW.package_id;
    END IF;
    
    -- Если слот освободился (cancelled, стал available)
    IF NEW.status IN ('available', 'cancelled') AND 
       OLD.status IN ('booked', 'paid', 'broadcasted') THEN
      UPDATE radio_advertisement_packages
      SET slots_taken = GREATEST(0, slots_taken - 1)
      WHERE id = NEW.package_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_package_slots
AFTER UPDATE OF status ON radio_broadcast_slots
FOR EACH ROW
EXECUTE FUNCTION update_package_slots_count();

-- =====================================================
-- ПРЕДСТАВЛЕНИЕ: Статистика пакетов
-- =====================================================
CREATE VIEW radio_package_stats AS
SELECT 
  p.id,
  p.radio_id,
  p.title,
  p.base_price,
  p.max_slots,
  p.slots_taken,
  ROUND((p.slots_taken::DECIMAL / NULLIF(p.max_slots, 0)::DECIMAL) * 100, 2) as occupancy_percent,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'paid') as total_orders,
  COALESCE(SUM(o.payment_amount) FILTER (WHERE o.status IN ('paid', 'fulfilled')), 0) as total_revenue,
  COALESCE(SUM(o.commission_amount) FILTER (WHERE o.status IN ('paid', 'fulfilled')), 0) as total_commission,
  COALESCE(SUM(o.net_amount_to_radio) FILTER (WHERE o.status IN ('paid', 'fulfilled')), 0) as total_net_revenue,
  COUNT(s.id) FILTER (WHERE s.status = 'available') as available_slots,
  COUNT(s.id) FILTER (WHERE s.status = 'broadcasted') as broadcasted_slots
FROM radio_advertisement_packages p
LEFT JOIN advertisement_orders o ON o.package_id = p.id
LEFT JOIN radio_broadcast_slots s ON s.package_id = p.id
GROUP BY p.id;

COMMENT ON VIEW radio_package_stats IS 'Агрегированная статистика по рекламным пакетам';

-- =====================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- =====================================================
COMMENT ON TABLE radio_advertisement_packages IS 'Шаблоны рекламных пакетов радиостанций';
COMMENT ON TABLE radio_broadcast_slots IS 'Конкретные слоты вещания';
COMMENT ON TABLE advertisement_orders IS 'Заказы рекламы с финансовой логикой';
COMMENT ON TABLE advertisement_auction_bids IS 'Ставки в аукционных пакетах';
COMMENT ON TABLE radio_advertisement_analytics IS 'Аналитика вещания рекламы';

-- =====================================================
-- SEED DATA (для тестирования)
-- =====================================================

-- Пример пакета
INSERT INTO radio_advertisement_packages (
  radio_id,
  title,
  description,
  spot_duration_seconds,
  rotations_per_day,
  time_slot,
  pricing_type,
  base_price,
  max_slots,
  platform_commission_rate
) VALUES (
  (SELECT id FROM radio_stations LIMIT 1),
  'Утренний эфир - 30 секунд',
  'Рекламный ролик 30 секунд в утреннем эфире с максимальной аудиторией',
  30,
  5,
  'morning',
  'fixed',
  5000.00,
  100,
  0.15
) ON CONFLICT DO NOTHING;
