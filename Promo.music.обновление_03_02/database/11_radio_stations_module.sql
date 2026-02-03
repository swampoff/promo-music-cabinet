-- =====================================================
-- PROMO.MUSIC - RADIO STATIONS MODULE
-- Модуль радиостанций (Radio Cabinet)
-- =====================================================

-- =====================================================
-- CUSTOM TYPES для радиостанций
-- =====================================================

-- Тип радиостанции
CREATE TYPE radio_station_type AS ENUM (
  'online',          -- Интернет-радио
  'fm',              -- FM радио
  'am',              -- AM радио
  'dab',             -- Digital Audio Broadcasting
  'satellite',       -- Спутниковое радио
  'podcast'          -- Подкаст-платформа
);

-- Статус радиостанции
CREATE TYPE radio_station_status AS ENUM (
  'pending',         -- На модерации
  'active',          -- Активна
  'suspended',       -- Приостановлена
  'closed'           -- Закрыта
);

-- Жанр радиостанции
CREATE TYPE radio_genre AS ENUM (
  'pop',
  'rock',
  'hip_hop',
  'electronic',
  'jazz',
  'classical',
  'country',
  'indie',
  'metal',
  'rnb',
  'mixed',           -- Смешанный формат
  'talk',            -- Разговорное радио
  'news'             -- Новости
);

-- Размер аудитории
CREATE TYPE audience_size AS ENUM (
  'small',           -- < 1K слушателей
  'medium',          -- 1K - 10K
  'large',           -- 10K - 100K
  'very_large',      -- 100K - 1M
  'massive'          -- > 1M
);

-- Статус заявки на трек
CREATE TYPE radio_request_status AS ENUM (
  'pending',         -- Ожидает
  'reviewing',       -- На рассмотрении
  'approved',        -- Одобрена
  'rejected',        -- Отклонена
  'scheduled',       -- Запланирована в ротацию
  'in_rotation',     -- В ротации
  'archived'         -- В архиве
);

-- Тип ротации
CREATE TYPE rotation_type AS ENUM (
  'heavy',           -- Тяжелая (много раз в день)
  'medium',          -- Средняя
  'light',           -- Легкая
  'special',         -- Специальная (по расписанию)
  'one_time'         -- Разовое воспроизведение
);

-- Статус передачи
CREATE TYPE show_status AS ENUM (
  'scheduled',       -- Запланирована
  'live',            -- В эфире
  'completed',       -- Завершена
  'cancelled'        -- Отменена
);

-- =====================================================
-- ТАБЛИЦА: radio_stations
-- Профили радиостанций
-- =====================================================
CREATE TABLE radio_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связь с пользователем
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  station_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Описание
  tagline VARCHAR(500),
  description TEXT,
  about TEXT,
  
  -- Тип и жанр
  station_type radio_station_type NOT NULL DEFAULT 'online',
  primary_genre radio_genre NOT NULL,
  secondary_genres radio_genre[],
  
  -- Контакты
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(500),
  
  -- Социальные сети
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  youtube VARCHAR(255),
  tiktok VARCHAR(255),
  
  -- Локация
  country VARCHAR(2), -- ISO code
  city VARCHAR(100),
  timezone VARCHAR(100) DEFAULT 'UTC',
  
  -- Вещание
  broadcast_url TEXT, -- URL потока
  backup_stream_url TEXT,
  stream_format VARCHAR(50), -- mp3, aac, ogg, etc.
  bitrate INTEGER, -- kbps
  
  -- FM/AM (если применимо)
  frequency VARCHAR(20), -- 100.5 FM
  signal_coverage TEXT, -- Описание зоны покрытия
  
  -- Аудитория
  audience_size audience_size DEFAULT 'small',
  listeners_count INTEGER DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  peak_listeners INTEGER DEFAULT 0,
  
  -- Статистика
  total_plays BIGINT DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  total_shows INTEGER DEFAULT 0,
  
  -- Медиа
  logo_url TEXT,
  cover_image_url TEXT,
  station_images TEXT[], -- Дополнительные изображения
  
  -- Рейтинг
  rating DECIMAL(3,2) DEFAULT 0.00,
  reviews_count INTEGER DEFAULT 0,
  
  -- Верификация
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Подписка и тарифы
  subscription_plan VARCHAR(50) DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  
  -- Статус
  status radio_station_status DEFAULT 'pending',
  
  -- Настройки
  settings JSONB DEFAULT '{
    "auto_accept_requests": false,
    "public_profile": true,
    "show_statistics": true,
    "allow_track_requests": true,
    "moderation_enabled": true,
    "explicit_content": false,
    "accept_indie_artists": true,
    "accept_labels": true,
    "response_time": "48h",
    "min_track_quality": "128kbps",
    "preferred_genres": [],
    "blacklisted_artists": [],
    "notification_email": true,
    "notification_sms": false
  }'::jsonb,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Даты
  founded_year INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_broadcast_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_bitrate CHECK (bitrate IS NULL OR (bitrate >= 64 AND bitrate <= 320)),
  CONSTRAINT valid_founded_year CHECK (founded_year IS NULL OR (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW())))
);

-- Индексы
CREATE INDEX idx_radio_stations_user_id ON radio_stations(user_id);
CREATE INDEX idx_radio_stations_slug ON radio_stations(slug);
CREATE INDEX idx_radio_stations_status ON radio_stations(status) WHERE status = 'active';
CREATE INDEX idx_radio_stations_type ON radio_stations(station_type);
CREATE INDEX idx_radio_stations_genre ON radio_stations(primary_genre);
CREATE INDEX idx_radio_stations_country ON radio_stations(country) WHERE country IS NOT NULL;
CREATE INDEX idx_radio_stations_verified ON radio_stations(is_verified) WHERE is_verified = TRUE;
CREATE INDEX idx_radio_stations_audience ON radio_stations(audience_size);
CREATE INDEX idx_radio_stations_rating ON radio_stations(rating DESC);
CREATE INDEX idx_radio_stations_search ON radio_stations USING gin(
  to_tsvector('english', 
    COALESCE(station_name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(city, '')
  )
);

COMMENT ON TABLE radio_stations IS 'Профили радиостанций';

-- =====================================================
-- ТАБЛИЦА: radio_playlists
-- Плейлисты радиостанций
-- =====================================================
CREATE TABLE radio_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Информация о плейлисте
  playlist_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Настройки
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Жанры
  genres radio_genre[],
  
  -- Временные слоты (когда играет этот плейлист)
  time_slots JSONB, -- [{"day": "monday", "start": "06:00", "end": "12:00"}, ...]
  
  -- Статистика
  tracks_count INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_radio_playlists_station ON radio_playlists(station_id);
CREATE INDEX idx_radio_playlists_active ON radio_playlists(station_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE radio_playlists IS 'Плейлисты радиостанций';

-- =====================================================
-- ТАБЛИЦА: radio_rotation
-- Ротация треков на радио
-- =====================================================
CREATE TABLE radio_rotation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES radio_playlists(id) ON DELETE SET NULL,
  
  -- Тип ротации
  rotation_type rotation_type NOT NULL DEFAULT 'medium',
  
  -- Частота воспроизведения
  plays_per_day INTEGER DEFAULT 3,
  min_interval_minutes INTEGER DEFAULT 60, -- Минимальный интервал между воспроизведениями
  
  -- Временные ограничения
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Временные слоты (когда можно играть)
  allowed_hours INTEGER[], -- [6,7,8,9,...,22,23] - часы дня
  allowed_days INTEGER[], -- [1,2,3,4,5] - дни недели (1=понедельник)
  
  -- Приоритет
  priority INTEGER DEFAULT 50, -- 1-100, чем выше - тем чаще играет
  weight DECIMAL(5,2) DEFAULT 1.00, -- Вес в ротации
  
  -- Статистика
  total_plays INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Метаданные
  notes TEXT,
  added_by UUID REFERENCES users(id),
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_plays_per_day CHECK (plays_per_day >= 0 AND plays_per_day <= 100),
  CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 100),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT unique_station_track UNIQUE (station_id, track_id)
);

CREATE INDEX idx_radio_rotation_station ON radio_rotation(station_id);
CREATE INDEX idx_radio_rotation_track ON radio_rotation(track_id);
CREATE INDEX idx_radio_rotation_playlist ON radio_rotation(playlist_id);
CREATE INDEX idx_radio_rotation_active ON radio_rotation(station_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_radio_rotation_type ON radio_rotation(rotation_type);
CREATE INDEX idx_radio_rotation_dates ON radio_rotation(start_date, end_date);

COMMENT ON TABLE radio_rotation IS 'Ротация треков на радио';

-- =====================================================
-- ТАБЛИЦА: radio_track_requests
-- Заявки от артистов на добавление в ротацию
-- =====================================================
CREATE TABLE radio_track_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Кто подал заявку
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Куда подана заявка
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Сообщение от артиста
  message TEXT,
  pitch_text TEXT, -- Почему стоит добавить трек
  
  -- Предпочтения по ротации
  preferred_rotation_type rotation_type,
  preferred_start_date DATE,
  
  -- Статус заявки
  status radio_request_status DEFAULT 'pending',
  
  -- Рассмотрение
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Если одобрена
  approved_rotation_id UUID REFERENCES radio_rotation(id),
  scheduled_date DATE,
  
  -- Приоритет
  is_priority BOOLEAN DEFAULT FALSE, -- Платная заявка с приоритетом
  
  -- Статистика
  views_count INTEGER DEFAULT 0,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Даты
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Срок рассмотрения
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_artist_track_station UNIQUE (artist_id, track_id, station_id)
);

CREATE INDEX idx_radio_requests_artist ON radio_track_requests(artist_id);
CREATE INDEX idx_radio_requests_track ON radio_track_requests(track_id);
CREATE INDEX idx_radio_requests_station ON radio_track_requests(station_id, status);
CREATE INDEX idx_radio_requests_status ON radio_track_requests(status);
CREATE INDEX idx_radio_requests_priority ON radio_track_requests(is_priority) WHERE is_priority = TRUE;
CREATE INDEX idx_radio_requests_dates ON radio_track_requests(submitted_at DESC);

COMMENT ON TABLE radio_track_requests IS 'Заявки артистов на добавление треков в ротацию';

-- =====================================================
-- ТАБЛИЦА: radio_shows
-- Радиопередачи и шоу
-- =====================================================
CREATE TABLE radio_shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Информация о передаче
  show_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Категория
  category VARCHAR(100), -- music, talk, news, interview, etc.
  genres radio_genre[],
  
  -- Ведущий
  host_name VARCHAR(255),
  host_bio TEXT,
  host_image_url TEXT,
  
  -- Изображения
  cover_image_url TEXT,
  
  -- Расписание
  schedule_type VARCHAR(50), -- daily, weekly, monthly, one_time
  air_days INTEGER[], -- [1,2,3,4,5] - дни недели
  air_time TIME, -- Время начала
  duration_minutes INTEGER, -- Длительность
  
  -- Статус
  status show_status DEFAULT 'scheduled',
  
  -- Статистика
  episodes_count INTEGER DEFAULT 0,
  total_listeners INTEGER DEFAULT 0,
  average_listeners INTEGER DEFAULT 0,
  
  -- Настройки
  is_recurring BOOLEAN DEFAULT TRUE,
  allow_call_in BOOLEAN DEFAULT FALSE,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Даты
  first_aired_at TIMESTAMPTZ,
  last_aired_at TIMESTAMPTZ,
  next_airing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_radio_shows_station ON radio_shows(station_id);
CREATE INDEX idx_radio_shows_status ON radio_shows(status);
CREATE INDEX idx_radio_shows_schedule ON radio_shows(schedule_type, air_days);
CREATE INDEX idx_radio_shows_next_airing ON radio_shows(next_airing_at) WHERE next_airing_at IS NOT NULL;

COMMENT ON TABLE radio_shows IS 'Радиопередачи и шоу';

-- =====================================================
-- ТАБЛИЦА: radio_show_episodes
-- Эпизоды передач
-- =====================================================
CREATE TABLE radio_show_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  show_id UUID NOT NULL REFERENCES radio_shows(id) ON DELETE CASCADE,
  
  -- Информация об эпизоде
  episode_number INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Треклист
  tracklist JSONB, -- [{track_id, played_at, artist, title}, ...]
  
  -- Запись
  recording_url TEXT,
  duration_seconds INTEGER,
  
  -- Эфир
  aired_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  
  -- Статистика
  listeners_count INTEGER DEFAULT 0,
  peak_listeners INTEGER DEFAULT 0,
  
  -- Статус
  status show_status DEFAULT 'scheduled',
  
  -- Метаданные
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_show_episodes_show ON radio_show_episodes(show_id);
CREATE INDEX idx_show_episodes_aired ON radio_show_episodes(aired_at DESC);
CREATE INDEX idx_show_episodes_status ON radio_show_episodes(status);

COMMENT ON TABLE radio_show_episodes IS 'Эпизоды радиопередач';

-- =====================================================
-- ТАБЛИЦА: radio_statistics
-- Статистика прослушиваний
-- =====================================================
CREATE TABLE radio_statistics (
  id BIGSERIAL PRIMARY KEY,
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Что воспроизводилось
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  show_id UUID REFERENCES radio_shows(id) ON DELETE SET NULL,
  
  -- Когда
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Статистика
  listeners_count INTEGER DEFAULT 0,
  
  -- Локация слушателей (агрегированная)
  listener_countries JSONB, -- {RU: 45, US: 30, ...}
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Дата (для партиционирования)
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Партиционирование по датам (для больших объемов)
CREATE INDEX idx_radio_stats_station ON radio_statistics(station_id, stat_date DESC);
CREATE INDEX idx_radio_stats_track ON radio_statistics(track_id) WHERE track_id IS NOT NULL;
CREATE INDEX idx_radio_stats_date ON radio_statistics(stat_date DESC);
CREATE INDEX idx_radio_stats_played ON radio_statistics(played_at DESC);

COMMENT ON TABLE radio_statistics IS 'Статистика прослушиваний радио';

-- =====================================================
-- ТАБЛИЦА: radio_ads
-- Рекламные блоки на радио
-- =====================================================
CREATE TABLE radio_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Информация о рекламе
  ad_name VARCHAR(255) NOT NULL,
  advertiser_name VARCHAR(255),
  
  -- Файл
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  
  -- Расписание
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Частота показа
  plays_per_day INTEGER DEFAULT 5,
  allowed_hours INTEGER[],
  
  -- Стоимость
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Статистика
  total_plays INTEGER DEFAULT 0,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_radio_ads_station ON radio_ads(station_id);
CREATE INDEX idx_radio_ads_dates ON radio_ads(start_date, end_date);
CREATE INDEX idx_radio_ads_active ON radio_ads(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE radio_ads IS 'Рекламные блоки на радио';

-- =====================================================
-- ТАБЛИЦА: radio_reviews
-- Отзывы о радиостанциях
-- =====================================================
CREATE TABLE radio_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Рейтинг
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Отзыв
  title VARCHAR(255),
  review_text TEXT,
  
  -- Модерация
  is_approved BOOLEAN DEFAULT FALSE,
  moderated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_station_review UNIQUE (user_id, station_id)
);

CREATE INDEX idx_radio_reviews_station ON radio_reviews(station_id);
CREATE INDEX idx_radio_reviews_rating ON radio_reviews(rating);
CREATE INDEX idx_radio_reviews_approved ON radio_reviews(is_approved) WHERE is_approved = TRUE;

COMMENT ON TABLE radio_reviews IS 'Отзывы о радиостанциях';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Обновление updated_at
CREATE TRIGGER update_radio_stations_updated_at 
  BEFORE UPDATE ON radio_stations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radio_playlists_updated_at 
  BEFORE UPDATE ON radio_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radio_rotation_updated_at 
  BEFORE UPDATE ON radio_rotation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radio_requests_updated_at 
  BEFORE UPDATE ON radio_track_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radio_shows_updated_at 
  BEFORE UPDATE ON radio_shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Автоматическое обновление счетчиков
CREATE OR REPLACE FUNCTION update_radio_station_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE radio_stations
    SET 
      total_tracks = (SELECT COUNT(*) FROM radio_rotation WHERE station_id = NEW.station_id AND is_active = TRUE),
      updated_at = NOW()
    WHERE id = NEW.station_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_station_tracks_count
  AFTER INSERT ON radio_rotation
  FOR EACH ROW
  EXECUTE FUNCTION update_radio_station_stats();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_rotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_track_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_shows ENABLE ROW LEVEL SECURITY;

-- Радиостанции видят свои данные
CREATE POLICY radio_stations_owner ON radio_stations
  FOR ALL
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Публичный просмотр активных станций
CREATE POLICY radio_stations_public_view ON radio_stations
  FOR SELECT
  USING (status = 'active' AND is_verified = TRUE);

-- Админы видят всё
CREATE POLICY radio_stations_admin ON radio_stations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Артисты могут подавать заявки
CREATE POLICY radio_requests_artist_create ON radio_track_requests
  FOR INSERT
  WITH CHECK (
    artist_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Артисты видят свои заявки
CREATE POLICY radio_requests_artist_view ON radio_track_requests
  FOR SELECT
  USING (
    artist_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Радиостанции видят свои заявки
CREATE POLICY radio_requests_station_view ON radio_track_requests
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

COMMENT ON TYPE radio_station_type IS 'Тип радиостанции';
COMMENT ON TYPE radio_station_status IS 'Статус радиостанции';
COMMENT ON TYPE radio_genre IS 'Жанр радиостанции';
COMMENT ON TYPE audience_size IS 'Размер аудитории';
COMMENT ON TYPE radio_request_status IS 'Статус заявки на трек';
COMMENT ON TYPE rotation_type IS 'Тип ротации трека';
COMMENT ON TYPE show_status IS 'Статус передачи';
