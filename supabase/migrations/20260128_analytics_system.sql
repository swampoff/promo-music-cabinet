/**
 * ANALYTICS SYSTEM - СИСТЕМА АНАЛИТИКИ
 * Дата создания: 28 января 2026
 * 
 * Полная система аналитики для артистов с детальной статистикой,
 * агрегацией по периодам, географией, источникам трафика и AI инсайтами.
 * 
 * Структура:
 * 1. analytics_daily - дневная статистика по всем метрикам
 * 2. analytics_tracks - статистика треков
 * 3. analytics_videos - статистика видео
 * 4. analytics_concerts - статистика концертов
 * 5. analytics_geography - географическое распределение
 * 6. analytics_sources - источники трафика
 * 7. analytics_audience - демография аудитории
 * 8. analytics_insights - AI инсайты и рекомендации
 */

-- ============================================================================
-- 1. ANALYTICS DAILY - ДНЕВНАЯ АГРЕГИРОВАННАЯ СТАТИСТИКА
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_daily (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Охват и просмотры
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_streams INTEGER DEFAULT 0,
  
  -- Профиль артиста
  profile_views INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  
  -- Треки
  track_plays INTEGER DEFAULT 0,
  track_downloads INTEGER DEFAULT 0,
  track_shares INTEGER DEFAULT 0,
  track_likes INTEGER DEFAULT 0,
  
  -- Видео
  video_views INTEGER DEFAULT 0,
  video_watch_time INTEGER DEFAULT 0, -- секунды
  video_likes INTEGER DEFAULT 0,
  video_shares INTEGER DEFAULT 0,
  
  -- Концерты
  concert_views INTEGER DEFAULT 0,
  tickets_clicked INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Вовлечённость
  comments INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  followers_lost INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Монетизация
  donations_count INTEGER DEFAULT 0,
  donations_amount DECIMAL(10, 2) DEFAULT 0,
  coins_spent INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Время на сайте
  avg_session_duration INTEGER DEFAULT 0, -- секунды
  bounce_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(artist_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_artist ON analytics_daily(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_artist_date ON analytics_daily(artist_id, date DESC);

COMMENT ON TABLE analytics_daily IS 'Агрегированная дневная статистика артиста';

-- ============================================================================
-- 2. ANALYTICS TRACKS - ДЕТАЛЬНАЯ СТАТИСТИКА ТРЕКОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_tracks (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  track_id UUID NOT NULL,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Прослушивания
  plays INTEGER DEFAULT 0,
  unique_listeners INTEGER DEFAULT 0,
  complete_plays INTEGER DEFAULT 0, -- дослушаны до конца
  
  -- Среднее время прослушивания
  avg_listen_duration INTEGER DEFAULT 0, -- секунды
  completion_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Действия
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  playlist_adds INTEGER DEFAULT 0,
  
  -- Стриминг платформы
  spotify_streams INTEGER DEFAULT 0,
  apple_music_streams INTEGER DEFAULT 0,
  yandex_music_streams INTEGER DEFAULT 0,
  vk_music_streams INTEGER DEFAULT 0,
  
  -- Engagement
  comments INTEGER DEFAULT 0,
  skip_rate DECIMAL(5, 2) DEFAULT 0, -- % пропусков
  
  -- Монетизация
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(track_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_tracks_track ON analytics_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tracks_artist ON analytics_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_tracks_date ON analytics_tracks(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_tracks_plays ON analytics_tracks(plays DESC);

COMMENT ON TABLE analytics_tracks IS 'Детальная статистика треков по дням';

-- ============================================================================
-- 3. ANALYTICS VIDEOS - СТАТИСТИКА ВИДЕО
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_videos (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  video_id UUID NOT NULL,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Просмотры
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  
  -- Время просмотра
  total_watch_time INTEGER DEFAULT 0, -- секунды
  avg_watch_time INTEGER DEFAULT 0, -- секунды
  avg_percentage_watched DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Engagement
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  -- Retention
  retention_30s INTEGER DEFAULT 0, -- осталось через 30 сек
  retention_60s INTEGER DEFAULT 0,
  retention_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Платформы
  youtube_views INTEGER DEFAULT 0,
  vk_views INTEGER DEFAULT 0,
  rutube_views INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(video_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_videos_video ON analytics_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_analytics_videos_artist ON analytics_videos(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_videos_date ON analytics_videos(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_videos_views ON analytics_videos(views DESC);

COMMENT ON TABLE analytics_videos IS 'Статистика видео по дням';

-- ============================================================================
-- 4. ANALYTICS CONCERTS - СТАТИСТИКА КОНЦЕРТОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_concerts (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  concert_id UUID NOT NULL,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Просмотры страницы
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  
  -- Билеты
  tickets_clicked INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  tickets_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Конверсия
  conversion_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Engagement
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Источники
  traffic_direct INTEGER DEFAULT 0,
  traffic_social INTEGER DEFAULT 0,
  traffic_search INTEGER DEFAULT 0,
  traffic_referral INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(concert_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_concerts_concert ON analytics_concerts(concert_id);
CREATE INDEX IF NOT EXISTS idx_analytics_concerts_artist ON analytics_concerts(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_concerts_date ON analytics_concerts(date DESC);

COMMENT ON TABLE analytics_concerts IS 'Статистика концертов и мероприятий';

-- ============================================================================
-- 5. ANALYTICS GEOGRAPHY - ГЕОГРАФИЧЕСКОЕ РАСПРЕДЕЛЕНИЕ
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_geography (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Локация
  country TEXT NOT NULL,
  country_code TEXT, -- ISO 3166-1 alpha-2
  city TEXT,
  
  -- Метрики
  visitors INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Доход
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(artist_id, date, country, city)
);

CREATE INDEX IF NOT EXISTS idx_analytics_geo_artist ON analytics_geography(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_geo_date ON analytics_geography(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_geo_country ON analytics_geography(country);
CREATE INDEX IF NOT EXISTS idx_analytics_geo_visitors ON analytics_geography(visitors DESC);

COMMENT ON TABLE analytics_geography IS 'Географическое распределение аудитории';

-- ============================================================================
-- 6. ANALYTICS SOURCES - ИСТОЧНИКИ ТРАФИКА
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_sources (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Источник
  source_type TEXT NOT NULL CHECK (
    source_type IN (
      'direct',       -- Прямой переход
      'search',       -- Поисковые системы
      'social',       -- Социальные сети
      'referral',     -- Рефералы
      'email',        -- Email рассылки
      'ad',           -- Реклама
      'qr',           -- QR коды
      'other'
    )
  ),
  source_name TEXT, -- Google, VK, Instagram, etc.
  
  -- Метрики
  sessions INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  
  -- Engagement
  avg_session_duration INTEGER DEFAULT 0, -- секунды
  bounce_rate DECIMAL(5, 2) DEFAULT 0, -- %
  
  -- Конверсии
  conversions INTEGER DEFAULT 0, -- подписки, покупки, и т.д.
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(artist_id, date, source_type, source_name)
);

CREATE INDEX IF NOT EXISTS idx_analytics_sources_artist ON analytics_sources(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sources_date ON analytics_sources(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sources_type ON analytics_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_analytics_sources_sessions ON analytics_sources(sessions DESC);

COMMENT ON TABLE analytics_sources IS 'Источники трафика и их эффективность';

-- ============================================================================
-- 7. ANALYTICS AUDIENCE - ДЕМОГРАФИЯ АУДИТОРИИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_audience (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Демография
  age_group TEXT CHECK (
    age_group IN ('13-17', '18-24', '25-34', '35-44', '45-54', '55+', 'unknown')
  ),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  
  -- Метрики
  users INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Поведение
  avg_plays_per_user DECIMAL(5, 2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  
  -- Конверсия
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(artist_id, date, age_group, gender)
);

CREATE INDEX IF NOT EXISTS idx_analytics_audience_artist ON analytics_audience(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_audience_date ON analytics_audience(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_audience_age ON analytics_audience(age_group);
CREATE INDEX IF NOT EXISTS idx_analytics_audience_users ON analytics_audience(users DESC);

COMMENT ON TABLE analytics_audience IS 'Демографический профиль аудитории';

-- ============================================================================
-- 8. ANALYTICS INSIGHTS - AI ИНСАЙТЫ И РЕКОМЕНДАЦИИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_insights (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL,
  
  -- Инсайт
  insight_type TEXT NOT NULL CHECK (
    insight_type IN (
      'growth_opportunity',  -- Возможность роста
      'audience_shift',      -- Изменение аудитории
      'content_performance', -- Эффективность контента
      'engagement_drop',     -- Падение вовлечённости
      'monetization',        -- Монетизация
      'trending',            -- Трендовость
      'optimization',        -- Оптимизация
      'warning'              -- Предупреждение
    )
  ),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Приоритет
  importance TEXT DEFAULT 'medium' CHECK (
    importance IN ('low', 'medium', 'high', 'critical')
  ),
  
  -- Данные
  metric_name TEXT, -- На какую метрику влияет
  metric_value DECIMAL(10, 2),
  metric_change DECIMAL(10, 2), -- изменение в %
  
  supporting_data JSONB DEFAULT '{}'::jsonb,
  
  -- Рекомендация
  actionable BOOLEAN DEFAULT TRUE,
  recommended_action TEXT,
  expected_impact TEXT,
  
  -- AI
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_model TEXT,
  confidence DECIMAL(5, 2) DEFAULT 0, -- 0-100%
  
  -- Статус
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'applied', 'dismissed', 'expired')
  ),
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- Период данных
  period_start DATE,
  period_end DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_insights_artist ON analytics_insights(artist_id);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_type ON analytics_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_importance ON analytics_insights(importance);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_status ON analytics_insights(status);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_created ON analytics_insights(created_at DESC);

COMMENT ON TABLE analytics_insights IS 'AI инсайты и рекомендации для артистов';

-- ============================================================================
-- 9. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для всех таблиц
DROP TRIGGER IF EXISTS trigger_analytics_daily_updated_at ON analytics_daily;
CREATE TRIGGER trigger_analytics_daily_updated_at
  BEFORE UPDATE ON analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_tracks_updated_at ON analytics_tracks;
CREATE TRIGGER trigger_analytics_tracks_updated_at
  BEFORE UPDATE ON analytics_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_videos_updated_at ON analytics_videos;
CREATE TRIGGER trigger_analytics_videos_updated_at
  BEFORE UPDATE ON analytics_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_concerts_updated_at ON analytics_concerts;
CREATE TRIGGER trigger_analytics_concerts_updated_at
  BEFORE UPDATE ON analytics_concerts
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_geo_updated_at ON analytics_geography;
CREATE TRIGGER trigger_analytics_geo_updated_at
  BEFORE UPDATE ON analytics_geography
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_sources_updated_at ON analytics_sources;
CREATE TRIGGER trigger_analytics_sources_updated_at
  BEFORE UPDATE ON analytics_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_audience_updated_at ON analytics_audience;
CREATE TRIGGER trigger_analytics_audience_updated_at
  BEFORE UPDATE ON analytics_audience
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

DROP TRIGGER IF EXISTS trigger_analytics_insights_updated_at ON analytics_insights;
CREATE TRIGGER trigger_analytics_insights_updated_at
  BEFORE UPDATE ON analytics_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

-- Функция: Расчёт engagement_rate для дневной статистики
CREATE OR REPLACE FUNCTION calculate_daily_engagement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_views > 0 THEN
    NEW.engagement_rate = (
      (NEW.track_likes + NEW.video_likes + NEW.comments + NEW.track_shares + NEW.video_shares)::DECIMAL 
      / NEW.total_views::DECIMAL
    ) * 100;
  ELSE
    NEW.engagement_rate = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_daily_engagement ON analytics_daily;
CREATE TRIGGER trigger_calculate_daily_engagement
  BEFORE INSERT OR UPDATE ON analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_engagement();

-- ============================================================================
-- 10. VIEWS - ПРЕДСТАВЛЕНИЯ ДЛЯ БЫСТРОЙ АНАЛИТИКИ
-- ============================================================================

-- View: Топ треки за последние 30 дней
CREATE OR REPLACE VIEW analytics_top_tracks_30d AS
SELECT 
  t.id,
  t.title,
  t.artist_id,
  SUM(at.plays) as total_plays,
  SUM(at.unique_listeners) as total_listeners,
  AVG(at.completion_rate) as avg_completion_rate,
  SUM(at.likes) as total_likes,
  SUM(at.shares) as total_shares
FROM tracks t
JOIN analytics_tracks at ON at.track_id = t.id
WHERE at.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.id, t.title, t.artist_id
ORDER BY total_plays DESC;

-- View: Топ видео за последние 30 дней
CREATE OR REPLACE VIEW analytics_top_videos_30d AS
SELECT 
  v.id,
  v.title,
  v.artist_id,
  SUM(av.views) as total_views,
  SUM(av.total_watch_time) as total_watch_time,
  AVG(av.avg_percentage_watched) as avg_percentage_watched,
  SUM(av.likes) as total_likes,
  SUM(av.shares) as total_shares
FROM videos v
JOIN analytics_videos av ON av.video_id = v.id
WHERE av.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY v.id, v.title, v.artist_id
ORDER BY total_views DESC;

-- View: Сводка по артисту за последние 7 дней
CREATE OR REPLACE VIEW analytics_artist_summary_7d AS
SELECT 
  artist_id,
  SUM(total_views) as total_views,
  SUM(unique_visitors) as unique_visitors,
  SUM(track_plays) as track_plays,
  SUM(video_views) as video_views,
  SUM(followers_gained) as followers_gained,
  SUM(followers_lost) as followers_lost,
  AVG(engagement_rate) as avg_engagement_rate,
  SUM(donations_amount) as total_donations,
  SUM(revenue) as total_revenue
FROM analytics_daily
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY artist_id;

-- View: Топ источники трафика за последние 30 дней
CREATE OR REPLACE VIEW analytics_top_sources_30d AS
SELECT 
  artist_id,
  source_type,
  source_name,
  SUM(sessions) as total_sessions,
  SUM(users) as total_users,
  AVG(conversion_rate) as avg_conversion_rate,
  AVG(bounce_rate) as avg_bounce_rate
FROM analytics_sources
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY artist_id, source_type, source_name
ORDER BY total_sessions DESC;

-- View: Активные инсайты с приоритетом
CREATE OR REPLACE VIEW analytics_active_insights AS
SELECT 
  *,
  (CASE importance
    WHEN 'critical' THEN 4
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 1
  END) * confidence as priority_score
FROM analytics_insights
WHERE status = 'active'
ORDER BY priority_score DESC, created_at DESC;

-- ============================================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_geography ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;

-- Политики: Артисты видят только свою статистику
CREATE POLICY analytics_daily_user_policy ON analytics_daily
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_tracks_user_policy ON analytics_tracks
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_videos_user_policy ON analytics_videos
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_concerts_user_policy ON analytics_concerts
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_geography_user_policy ON analytics_geography
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_sources_user_policy ON analytics_sources
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_audience_user_policy ON analytics_audience
  FOR ALL USING (artist_id = auth.uid()::TEXT);

CREATE POLICY analytics_insights_user_policy ON analytics_insights
  FOR ALL USING (artist_id = auth.uid()::TEXT);

-- Админы видят всё
CREATE POLICY analytics_admin_policy_daily ON analytics_daily
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY analytics_admin_policy_tracks ON analytics_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY analytics_admin_policy_videos ON analytics_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY analytics_admin_policy_concerts ON analytics_concerts
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
  RAISE NOTICE '✅ Analytics System created successfully';
  RAISE NOTICE '📊 Tables: 8 analytics tables';
  RAISE NOTICE '📈 Views: 5 analytical views';
  RAISE NOTICE '⚡ Functions: 2 automation functions';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
