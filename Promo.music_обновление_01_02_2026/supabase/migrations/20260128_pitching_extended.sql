/**
 * PITCHING EXTENDED SYSTEM - РАСШИРЕННАЯ СИСТЕМА ПИТЧИНГА
 * Дата создания: 28 января 2026
 * 
 * Расширение базовой системы питчинга с детальной аналитикой,
 * историей взаимодействий с редакторами, рейтингами каналов и результатами.
 * 
 * Дополняет: 001_promotion_tables.sql (pitching_requests, editor_responses)
 * 
 * Структура:
 * 1. pitching_channels - каталог каналов (радио, стриминги, ТВ, заведения)
 * 2. pitching_analytics - аналитика кампаний
 * 3. pitching_feedback - детальный фидбек от редакторов
 * 4. pitching_playlists - треки попали в плейлисты
 * 5. pitching_blacklist - блэклист каналов/редакторов
 */

-- ============================================================================
-- 1. PITCHING CHANNELS - КАТАЛОГ КАНАЛОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitching_channels (
  -- Identity
  id TEXT PRIMARY KEY,
  
  -- Channel info
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'radio',        -- Радиостанция
      'streaming',    -- Стриминговый сервис
      'vk_music',     -- VK Музыка
      'yandex_music', -- Яндекс.Музыка
      'tv',           -- ТВ канал
      'venue'         -- Заведение (кафе, клубы)
    )
  ),
  
  -- Contact
  email TEXT,
  website TEXT,
  submission_url TEXT,
  
  -- Location
  country TEXT DEFAULT 'RU',
  city TEXT,
  region TEXT,
  
  -- Details
  description TEXT,
  genres TEXT[], -- Принимают треки этих жанров
  audience_size INTEGER, -- Размер аудитории
  
  -- Pricing (доплата за этот канал)
  extra_cost INTEGER DEFAULT 0,
  
  -- Stats
  acceptance_rate DECIMAL(5, 2) DEFAULT 0, -- % одобренных заявок
  avg_response_time INTEGER DEFAULT 0, -- дней
  
  total_submissions INTEGER DEFAULT 0,
  total_acceptances INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  
  -- Rating
  quality_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  artist_rating DECIMAL(3, 1) DEFAULT 0, -- 0-5 (от артистов)
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_channels_type ON pitching_channels(type);
CREATE INDEX IF NOT EXISTS idx_pitching_channels_country ON pitching_channels(country);
CREATE INDEX IF NOT EXISTS idx_pitching_channels_city ON pitching_channels(city);
CREATE INDEX IF NOT EXISTS idx_pitching_channels_active ON pitching_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_channels_rating ON pitching_channels(artist_rating DESC);
CREATE INDEX IF NOT EXISTS idx_pitching_channels_acceptance ON pitching_channels(acceptance_rate DESC);

COMMENT ON TABLE pitching_channels IS 'Каталог каналов для питчинга';

-- Вставка демо-данных
INSERT INTO pitching_channels (id, name, type, city, audience_size, extra_cost, genres) VALUES
('radio_europa_plus', 'Европа Плюс', 'radio', 'Москва', 5000000, 3000, ARRAY['Pop', 'Dance']),
('radio_energy', 'Energy', 'radio', 'Москва', 3000000, 3000, ARRAY['Pop', 'Dance', 'Electronic']),
('radio_record', 'Радио Рекорд', 'radio', 'Москва', 4000000, 3000, ARRAY['Dance', 'Electronic']),
('streaming_spotify_ru', 'Spotify Russia Playlists', 'streaming', NULL, 10000000, 5000, ARRAY['Pop', 'Rock', 'Hip-Hop']),
('streaming_apple_music', 'Apple Music Russia', 'streaming', NULL, 8000000, 5000, ARRAY['Pop', 'Rock', 'Alternative']),
('vk_music_top', 'VK Музыка - Топ', 'vk_music', NULL, 15000000, 2000, ARRAY['Pop', 'Hip-Hop', 'Rock']),
('yandex_music_new', 'Яндекс.Музыка - Новинки', 'yandex_music', NULL, 12000000, 2500, ARRAY['Pop', 'Rock', 'Electronic']),
('tv_mtv_russia', 'MTV Россия', 'tv', 'Москва', 2000000, 7000, ARRAY['Pop', 'Hip-Hop', 'Rock']),
('venue_gipsy', 'Gipsy', 'venue', 'Москва', 50000, 1500, ARRAY['Rock', 'Alternative', 'Indie'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. PITCHING ANALYTICS - АНАЛИТИКА КАМПАНИЙ
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitching_analytics (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL, -- FK к pitching_requests
  artist_id TEXT NOT NULL,
  
  -- Campaign metrics
  total_channels INTEGER DEFAULT 0,
  channels_sent INTEGER DEFAULT 0,
  channels_responded INTEGER DEFAULT 0,
  channels_accepted INTEGER DEFAULT 0,
  channels_rejected INTEGER DEFAULT 0,
  channels_pending INTEGER DEFAULT 0,
  
  -- Response rates
  response_rate DECIMAL(5, 2) DEFAULT 0, -- %
  acceptance_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Timing
  avg_response_time DECIMAL(5, 2) DEFAULT 0, -- дней
  first_response_at TIMESTAMP WITH TIME ZONE,
  last_response_at TIMESTAMP WITH TIME ZONE,
  
  -- Results
  total_plays INTEGER DEFAULT 0, -- Всего проигрываний на всех каналах
  total_reach INTEGER DEFAULT 0, -- Общий охват
  
  playlists_added INTEGER DEFAULT 0,
  radio_plays INTEGER DEFAULT 0,
  
  -- Value
  estimated_value DECIMAL(10, 2) DEFAULT 0, -- Оценочная стоимость размещения
  
  -- Channel breakdown (JSON для гибкости)
  channel_stats JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(request_id)
);

CREATE INDEX IF NOT EXISTS idx_pitching_analytics_request ON pitching_analytics(request_id);
CREATE INDEX IF NOT EXISTS idx_pitching_analytics_artist ON pitching_analytics(artist_id);
CREATE INDEX IF NOT EXISTS idx_pitching_analytics_acceptance ON pitching_analytics(acceptance_rate DESC);

COMMENT ON TABLE pitching_analytics IS 'Агрегированная аналитика питчинг кампаний';

-- ============================================================================
-- 3. PITCHING FEEDBACK - ДЕТАЛЬНЫЙ ФИДБЕК
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitching_feedback (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL,
  channel_id TEXT NOT NULL REFERENCES pitching_channels(id),
  artist_id TEXT NOT NULL,
  
  -- Feedback from editor
  status TEXT NOT NULL CHECK (
    status IN ('accepted', 'rejected', 'maybe_later', 'no_response')
  ),
  
  editor_name TEXT,
  editor_email TEXT,
  
  -- Feedback content
  feedback_text TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  
  -- Specific reasons (для rejected)
  rejection_reasons TEXT[], -- ['wrong_genre', 'low_quality', 'not_fitting']
  
  -- Actions taken
  added_to_playlist BOOLEAN DEFAULT FALSE,
  playlist_name TEXT,
  playlist_url TEXT,
  
  scheduled_airplay BOOLEAN DEFAULT FALSE,
  airplay_date TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  plays_count INTEGER DEFAULT 0,
  estimated_reach INTEGER DEFAULT 0,
  
  -- Follow-up
  follow_up_requested BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_feedback_request ON pitching_feedback(request_id);
CREATE INDEX IF NOT EXISTS idx_pitching_feedback_channel ON pitching_feedback(channel_id);
CREATE INDEX IF NOT EXISTS idx_pitching_feedback_artist ON pitching_feedback(artist_id);
CREATE INDEX IF NOT EXISTS idx_pitching_feedback_status ON pitching_feedback(status);
CREATE INDEX IF NOT EXISTS idx_pitching_feedback_playlist ON pitching_feedback(added_to_playlist);

COMMENT ON TABLE pitching_feedback IS 'Детальный фидбек от каналов и редакторов';

-- ============================================================================
-- 4. PITCHING PLAYLISTS - ДОБАВЛЕНИЯ В ПЛЕЙЛИСТЫ
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitching_playlists (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  
  -- Playlist info
  playlist_name TEXT NOT NULL,
  playlist_url TEXT,
  platform TEXT NOT NULL CHECK (
    platform IN ('spotify', 'apple_music', 'yandex_music', 'vk_music', 'soundcloud', 'other')
  ),
  
  curator_name TEXT,
  
  -- Stats
  playlist_followers INTEGER DEFAULT 0,
  position_in_playlist INTEGER,
  
  -- Performance
  plays_from_playlist INTEGER DEFAULT 0,
  saves_from_playlist INTEGER DEFAULT 0,
  
  -- Dates
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  removed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_playlists_request ON pitching_playlists(request_id);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_track ON pitching_playlists(track_id);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_artist ON pitching_playlists(artist_id);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_platform ON pitching_playlists(platform);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_active ON pitching_playlists(is_active);

COMMENT ON TABLE pitching_playlists IS 'Треки добавленные в плейлисты через питчинг';

-- ============================================================================
-- 5. PITCHING BLACKLIST - БЛЭКЛИСТ
-- ============================================================================

CREATE TABLE IF NOT EXISTS pitching_blacklist (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL,
  
  -- Target
  channel_id TEXT REFERENCES pitching_channels(id),
  editor_email TEXT,
  
  -- Reason
  reason TEXT NOT NULL,
  blocked_type TEXT NOT NULL CHECK (
    blocked_type IN ('spam', 'harassment', 'poor_quality', 'contractual', 'other')
  ),
  
  -- Details
  notes TEXT,
  evidence_urls TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Appeal
  can_appeal BOOLEAN DEFAULT TRUE,
  appeal_after DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_blacklist_artist ON pitching_blacklist(artist_id);
CREATE INDEX IF NOT EXISTS idx_pitching_blacklist_channel ON pitching_blacklist(channel_id);
CREATE INDEX IF NOT EXISTS idx_pitching_blacklist_active ON pitching_blacklist(is_active);

COMMENT ON TABLE pitching_blacklist IS 'Блэклист артистов/каналов';

-- ============================================================================
-- 6. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at
CREATE OR REPLACE FUNCTION update_pitching_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры
DROP TRIGGER IF EXISTS trigger_pitching_channels_updated ON pitching_channels;
CREATE TRIGGER trigger_pitching_channels_updated
  BEFORE UPDATE ON pitching_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_pitching_updated_at();

DROP TRIGGER IF EXISTS trigger_pitching_analytics_updated ON pitching_analytics;
CREATE TRIGGER trigger_pitching_analytics_updated
  BEFORE UPDATE ON pitching_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_pitching_updated_at();

DROP TRIGGER IF EXISTS trigger_pitching_feedback_updated ON pitching_feedback;
CREATE TRIGGER trigger_pitching_feedback_updated
  BEFORE UPDATE ON pitching_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_pitching_updated_at();

DROP TRIGGER IF EXISTS trigger_pitching_playlists_updated ON pitching_playlists;
CREATE TRIGGER trigger_pitching_playlists_updated
  BEFORE UPDATE ON pitching_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_pitching_updated_at();

-- Функция: Обновление статистики канала
CREATE OR REPLACE FUNCTION update_channel_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pitching_channels
  SET 
    total_submissions = (
      SELECT COUNT(*) FROM pitching_feedback WHERE channel_id = NEW.channel_id
    ),
    total_acceptances = (
      SELECT COUNT(*) FROM pitching_feedback 
      WHERE channel_id = NEW.channel_id AND status = 'accepted'
    ),
    acceptance_rate = (
      SELECT CASE WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / COUNT(*) * 100)
        ELSE 0 
      END
      FROM pitching_feedback WHERE channel_id = NEW.channel_id
    ),
    updated_at = NOW()
  WHERE id = NEW.channel_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_channel_stats ON pitching_feedback;
CREATE TRIGGER trigger_update_channel_stats
  AFTER INSERT OR UPDATE ON pitching_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_stats();

-- Функция: Обновление аналитики кампании
CREATE OR REPLACE FUNCTION update_pitching_campaign_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pitching_analytics (request_id, artist_id)
  VALUES (NEW.request_id, NEW.artist_id)
  ON CONFLICT (request_id) DO UPDATE SET
    channels_responded = (
      SELECT COUNT(*) FROM pitching_feedback 
      WHERE request_id = NEW.request_id
    ),
    channels_accepted = (
      SELECT COUNT(*) FROM pitching_feedback 
      WHERE request_id = NEW.request_id AND status = 'accepted'
    ),
    channels_rejected = (
      SELECT COUNT(*) FROM pitching_feedback 
      WHERE request_id = NEW.request_id AND status = 'rejected'
    ),
    response_rate = (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*)::DECIMAL / (SELECT total_channels FROM pitching_analytics WHERE request_id = NEW.request_id) * 100)
        ELSE 0 
      END
      FROM pitching_feedback WHERE request_id = NEW.request_id
    ),
    acceptance_rate = (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / COUNT(*) * 100)
        ELSE 0 
      END
      FROM pitching_feedback WHERE request_id = NEW.request_id
    ),
    playlists_added = (
      SELECT COUNT(*) FROM pitching_playlists 
      WHERE request_id = NEW.request_id AND is_active = TRUE
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_campaign_analytics ON pitching_feedback;
CREATE TRIGGER trigger_update_campaign_analytics
  AFTER INSERT OR UPDATE ON pitching_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_pitching_campaign_analytics();

-- ============================================================================
-- 7. VIEWS - ПРЕДСТАВЛЕНИЯ
-- ============================================================================

-- View: Топ каналы по рейтингу
CREATE OR REPLACE VIEW pitching_top_channels AS
SELECT 
  pc.*,
  CASE 
    WHEN pc.total_submissions > 0 THEN
      ROUND((pc.total_acceptances::DECIMAL / pc.total_submissions) * 100, 2)
    ELSE 0
  END as calculated_acceptance_rate
FROM pitching_channels pc
WHERE pc.is_active = TRUE
ORDER BY pc.artist_rating DESC, pc.acceptance_rate DESC;

COMMENT ON VIEW pitching_top_channels IS 'Топ каналы по рейтингу и acceptance rate';

-- View: Успешные кампании
CREATE OR REPLACE VIEW pitching_successful_campaigns AS
SELECT 
  pa.*,
  pr.track_name,
  pr.artist_name,
  pr.status as campaign_status,
  pr.created_at as campaign_created
FROM pitching_analytics pa
JOIN pitching_requests pr ON pr.id = pa.request_id
WHERE pa.acceptance_rate >= 20 -- Минимум 20% acceptance rate
ORDER BY pa.acceptance_rate DESC, pa.total_reach DESC;

COMMENT ON VIEW pitching_successful_campaigns IS 'Успешные питчинг кампании';

-- View: Статистика артиста по питчингу
CREATE OR REPLACE VIEW pitching_artist_stats AS
SELECT 
  artist_id,
  COUNT(DISTINCT request_id) as total_campaigns,
  AVG(acceptance_rate) as avg_acceptance_rate,
  SUM(total_plays) as total_plays,
  SUM(total_reach) as total_reach,
  SUM(playlists_added) as total_playlists,
  MAX(updated_at) as last_campaign_date
FROM pitching_analytics
GROUP BY artist_id;

COMMENT ON VIEW pitching_artist_stats IS 'Агрегированная статистика артиста по питчингу';

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE pitching_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_blacklist ENABLE ROW LEVEL SECURITY;

-- Каналы доступны всем на чтение
CREATE POLICY pitching_channels_read_policy ON pitching_channels
  FOR SELECT USING (is_active = TRUE);

-- Аналитику видит только владелец
CREATE POLICY pitching_analytics_user_policy ON pitching_analytics
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY pitching_feedback_user_policy ON pitching_feedback
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY pitching_playlists_user_policy ON pitching_playlists
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY pitching_blacklist_user_policy ON pitching_blacklist
  FOR SELECT USING (artist_id = auth.uid()::TEXT);

-- Админы видят всё
CREATE POLICY pitching_channels_admin_policy ON pitching_channels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY pitching_analytics_admin_policy ON pitching_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY pitching_feedback_admin_policy ON pitching_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Pitching Extended System created successfully';
  RAISE NOTICE '📻 Tables: 5 pitching extension tables';
  RAISE NOTICE '📊 Channels: Pre-loaded with demo channels';
  RAISE NOTICE '⚡ Functions: 3 automation functions';
  RAISE NOTICE '📈 Views: 3 analytical views';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
