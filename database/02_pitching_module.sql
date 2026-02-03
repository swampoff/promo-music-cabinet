-- =====================================================
-- PROMO.MUSIC - PITCHING MODULE
-- Питчинг треков на плейлисты, модерация, статистика
-- =====================================================

-- =====================================================
-- ТАБЛИЦА: tracks
-- Музыкальные треки для питчинга
-- =====================================================
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  featuring_artists TEXT[],
  
  -- ISRC и идентификаторы
  isrc VARCHAR(20) UNIQUE,
  upc VARCHAR(20),
  
  -- Платформы
  spotify_track_id VARCHAR(100),
  spotify_track_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,
  
  -- Аудио файл
  audio_file_url TEXT NOT NULL,
  audio_file_size INTEGER,
  duration_ms INTEGER,
  
  -- Обложка
  cover_image_url TEXT,
  cover_image_thumbnail_url TEXT,
  
  -- Музыкальные параметры
  primary_genre music_genre NOT NULL,
  secondary_genres music_genre[],
  subgenres TEXT[],
  moods TEXT[],
  tags TEXT[],
  
  -- Характеристики трека
  bpm INTEGER,
  key VARCHAR(10), -- C, C#, D, etc.
  mode VARCHAR(10), -- major, minor
  energy_level INTEGER, -- 1-10
  danceability INTEGER, -- 1-10
  
  -- Метаданные
  release_date DATE,
  label_name VARCHAR(255),
  copyright_info TEXT,
  lyrics TEXT,
  language VARCHAR(10),
  explicit_content BOOLEAN DEFAULT FALSE,
  
  -- Статистика
  total_streams BIGINT DEFAULT 0,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  moderation_status moderation_status DEFAULT 'pending',
  moderation_notes TEXT,
  
  -- Даты
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_bpm CHECK (bpm IS NULL OR (bpm >= 20 AND bpm <= 300)),
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms > 0)
);

CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_spotify_id ON tracks(spotify_track_id);
CREATE INDEX idx_tracks_isrc ON tracks(isrc);
CREATE INDEX idx_tracks_primary_genre ON tracks(primary_genre);
CREATE INDEX idx_tracks_moderation_status ON tracks(moderation_status);
CREATE INDEX idx_tracks_active ON tracks(is_active, deleted_at);
CREATE INDEX idx_tracks_search ON tracks USING gin(to_tsvector('english', 
  COALESCE(title, '') || ' ' || 
  COALESCE(artist_name, '') || ' ' || 
  COALESCE(array_to_string(tags, ' '), '')
));

COMMENT ON TABLE tracks IS 'Музыкальные треки для питчинга';

-- =====================================================
-- ТАБЛИЦА: playlists
-- Плейлисты кураторов
-- =====================================================
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Платформа
  platform streaming_platform NOT NULL,
  platform_playlist_id VARCHAR(100) NOT NULL,
  playlist_url TEXT NOT NULL,
  
  -- Обложка
  cover_image_url TEXT,
  
  -- Музыкальные параметры
  genres music_genre[] DEFAULT '{}',
  moods TEXT[],
  tags TEXT[],
  
  -- Статистика
  followers_count INTEGER DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  avg_monthly_listeners INTEGER DEFAULT 0,
  
  -- Требования для питчинга
  min_followers INTEGER DEFAULT 0,
  min_monthly_listeners INTEGER DEFAULT 0,
  accepted_genres music_genre[],
  
  -- Цены питчинга
  pitch_price_standard DECIMAL(10,2) DEFAULT 0.00,
  pitch_price_premium DECIMAL(10,2) DEFAULT 0.00,
  pitch_price_express DECIMAL(10,2) DEFAULT 0.00,
  
  -- Настройки
  is_active BOOLEAN DEFAULT TRUE,
  is_accepting_pitches BOOLEAN DEFAULT TRUE,
  auto_accept_verified BOOLEAN DEFAULT FALSE,
  max_pitches_per_day INTEGER DEFAULT 10,
  
  -- Верификация
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Даты
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(platform, platform_playlist_id)
);

CREATE INDEX idx_playlists_curator_id ON playlists(curator_id);
CREATE INDEX idx_playlists_platform ON playlists(platform);
CREATE INDEX idx_playlists_active ON playlists(is_active, is_accepting_pitches);
CREATE INDEX idx_playlists_genres ON playlists USING gin(genres);
CREATE INDEX idx_playlists_verified ON playlists(is_verified);

COMMENT ON TABLE playlists IS 'Плейлисты кураторов для питчинга';

-- =====================================================
-- ТАБЛИЦА: pitches
-- Питчинги треков на плейлисты
-- =====================================================
CREATE TABLE pitches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  
  -- Статус и приоритет
  status pitch_status DEFAULT 'draft',
  priority pitch_priority DEFAULT 'standard',
  
  -- Сообщение куратору
  message_to_curator TEXT,
  curator_notes TEXT,
  
  -- Модерация
  moderation_status moderation_status DEFAULT 'pending',
  moderator_id UUID REFERENCES users(id),
  moderation_notes TEXT,
  moderated_at TIMESTAMPTZ,
  
  -- Рассмотрение куратором
  curator_reviewed_at TIMESTAMPTZ,
  curator_decision VARCHAR(50), -- accepted, rejected, maybe
  curator_feedback TEXT,
  
  -- Плейсмент
  added_to_playlist_at TIMESTAMPTZ,
  playlist_position INTEGER,
  days_in_playlist INTEGER DEFAULT 0,
  removed_from_playlist_at TIMESTAMPTZ,
  
  -- Платеж
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_transaction_id UUID,
  refund_amount DECIMAL(10,2) DEFAULT 0.00,
  refund_reason TEXT,
  
  -- Гарантии
  has_guarantee BOOLEAN DEFAULT FALSE,
  guarantee_type VARCHAR(50), -- placement, review_time, refund
  guarantee_deadline TIMESTAMPTZ,
  guarantee_fulfilled BOOLEAN DEFAULT FALSE,
  
  -- Статистика после размещения
  streams_before_pitch BIGINT DEFAULT 0,
  streams_after_pitch BIGINT DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  
  -- Оценки
  artist_rating INTEGER, -- 1-5
  artist_review TEXT,
  curator_rating INTEGER, -- 1-5
  
  -- Дедлайны
  submitted_at TIMESTAMPTZ,
  response_deadline TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_ratings CHECK (
    (artist_rating IS NULL OR (artist_rating >= 1 AND artist_rating <= 5)) AND
    (curator_rating IS NULL OR (curator_rating >= 1 AND curator_rating <= 5))
  )
);

CREATE INDEX idx_pitches_user_id ON pitches(user_id, created_at DESC);
CREATE INDEX idx_pitches_track_id ON pitches(track_id);
CREATE INDEX idx_pitches_playlist_id ON pitches(playlist_id);
CREATE INDEX idx_pitches_status ON pitches(status);
CREATE INDEX idx_pitches_moderation_status ON pitches(moderation_status);
CREATE INDEX idx_pitches_priority ON pitches(priority);
CREATE INDEX idx_pitches_deadlines ON pitches(response_deadline, expires_at);
CREATE INDEX idx_pitches_curator_review ON pitches(playlist_id, status) 
  WHERE status IN ('submitted', 'in_review');

COMMENT ON TABLE pitches IS 'Питчинги треков на плейлисты';

-- =====================================================
-- ТАБЛИЦА: pitch_analytics
-- Детальная аналитика по питчингам
-- =====================================================
CREATE TABLE pitch_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  
  -- Временные метрики
  time_to_moderation_hours DECIMAL(8,2),
  time_to_curator_review_hours DECIMAL(8,2),
  time_to_decision_hours DECIMAL(8,2),
  total_processing_hours DECIMAL(8,2),
  
  -- Статистика стримов (по дням)
  streams_day_1 INTEGER DEFAULT 0,
  streams_day_7 INTEGER DEFAULT 0,
  streams_day_14 INTEGER DEFAULT 0,
  streams_day_30 INTEGER DEFAULT 0,
  streams_day_60 INTEGER DEFAULT 0,
  streams_day_90 INTEGER DEFAULT 0,
  
  -- Рост фолловеров
  followers_gained_day_1 INTEGER DEFAULT 0,
  followers_gained_day_7 INTEGER DEFAULT 0,
  followers_gained_day_30 INTEGER DEFAULT 0,
  
  -- Engagement метрики
  saves_count INTEGER DEFAULT 0,
  playlist_adds INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  skip_rate DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  
  -- ROI
  total_investment DECIMAL(12,2),
  estimated_revenue DECIMAL(12,2),
  roi_percentage DECIMAL(8,2),
  
  -- Дополнительные данные
  analytics_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pitch_analytics_pitch_id ON pitch_analytics(pitch_id);

COMMENT ON TABLE pitch_analytics IS 'Детальная аналитика эффективности питчингов';

-- =====================================================
-- ТАБЛИЦА: pitch_messages
-- Сообщения между артистами и кураторами
-- =====================================================
CREATE TABLE pitch_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Сообщение
  message TEXT NOT NULL,
  
  -- Вложения
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Статус
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Тип
  is_system_message BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pitch_messages_pitch_id ON pitch_messages(pitch_id, created_at);
CREATE INDEX idx_pitch_messages_sender_id ON pitch_messages(sender_id);
CREATE INDEX idx_pitch_messages_unread ON pitch_messages(is_read) WHERE NOT is_read;

COMMENT ON TABLE pitch_messages IS 'Сообщения в рамках питчинга';

-- =====================================================
-- ТАБЛИЦА: pitch_reviews
-- Отзывы о питчингах
-- =====================================================
CREATE TABLE pitch_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewer_type VARCHAR(20) NOT NULL, -- artist, curator
  
  -- Оценка
  rating INTEGER NOT NULL,
  review_text TEXT,
  
  -- Детальные оценки
  communication_rating INTEGER,
  quality_rating INTEGER,
  value_rating INTEGER,
  
  -- Статус
  is_verified_review BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Реакция
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT valid_detailed_ratings CHECK (
    (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)) AND
    (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)) AND
    (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5))
  ),
  UNIQUE(pitch_id, reviewer_id)
);

CREATE INDEX idx_pitch_reviews_pitch_id ON pitch_reviews(pitch_id);
CREATE INDEX idx_pitch_reviews_reviewer_id ON pitch_reviews(reviewer_id);
CREATE INDEX idx_pitch_reviews_rating ON pitch_reviews(rating);

COMMENT ON TABLE pitch_reviews IS 'Отзывы артистов и кураторов о питчингах';

-- =====================================================
-- ТАБЛИЦА: playlist_statistics
-- Статистика плейлистов (обновляется ежедневно)
-- =====================================================
CREATE TABLE playlist_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  
  -- Дата снимка
  snapshot_date DATE NOT NULL,
  
  -- Метрики
  followers_count INTEGER DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  total_duration_ms BIGINT DEFAULT 0,
  
  -- Активность
  new_followers INTEGER DEFAULT 0,
  lost_followers INTEGER DEFAULT 0,
  tracks_added INTEGER DEFAULT 0,
  tracks_removed INTEGER DEFAULT 0,
  
  -- Engagement
  total_streams BIGINT DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  avg_listen_duration_ms INTEGER DEFAULT 0,
  
  -- Рейтинг
  popularity_score INTEGER,
  engagement_score DECIMAL(8,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(playlist_id, snapshot_date)
);

CREATE INDEX idx_playlist_stats_playlist_date ON playlist_statistics(playlist_id, snapshot_date DESC);

COMMENT ON TABLE playlist_statistics IS 'Ежедневная статистика плейлистов';
