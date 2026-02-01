-- ============================================
-- PR И СМИ - РАСШИРЕННАЯ СИСТЕМА
-- ============================================
-- 
-- ВАЖНО: Выполните этот SQL в Supabase Dashboard:
-- 1. Откройте https://supabase.com/dashboard/project/qzpmiiqfwkcnrhvubdgt
-- 2. Перейдите в SQL Editor
-- 3. Скопируйте и выполните весь этот SQL
-- 
-- Эта миграция дополняет 001_promotion_tables.sql
-- и добавляет расширенные возможности для PR
-- ============================================

-- ============================================
-- ТАБЛИЦА: media_contacts
-- База контактов медиа (журналисты, редакторы, блогеры)
-- ============================================
CREATE TABLE IF NOT EXISTS media_contacts (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  media_outlet TEXT NOT NULL,
  media_type TEXT NOT NULL
    CHECK (media_type IN ('newspaper', 'magazine', 'online_media', 'tv', 'radio', 'podcast', 'blog', 'youtube')),
  email TEXT,
  phone TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  coverage_tier TEXT DEFAULT 'local'
    CHECK (coverage_tier IN ('local', 'regional', 'national', 'international')),
  audience_size INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  relationship_status TEXT DEFAULT 'cold'
    CHECK (relationship_status IN ('cold', 'warm', 'hot', 'partner')),
  last_contact_date DATE,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_contacts_artist ON media_contacts(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_contacts_outlet ON media_contacts(media_outlet);
CREATE INDEX IF NOT EXISTS idx_media_contacts_type ON media_contacts(media_type);
CREATE INDEX IF NOT EXISTS idx_media_contacts_relationship ON media_contacts(relationship_status);

COMMENT ON TABLE media_contacts IS 'База контактов журналистов, редакторов и медиа-персон';

-- ============================================
-- ТАБЛИЦА: press_releases
-- Пресс-релизы артиста
-- ============================================
CREATE TABLE IF NOT EXISTS press_releases (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text/html',
  category TEXT NOT NULL
    CHECK (category IN ('new_release', 'tour_announcement', 'award', 'collaboration', 'statement', 'other')),
  release_date TIMESTAMPTZ NOT NULL,
  embargo_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  media_kit_url TEXT,
  press_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  contact_person TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  distribution_list TEXT[] DEFAULT ARRAY[]::TEXT[],
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  published_count INTEGER DEFAULT 0,
  seo_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_press_releases_artist ON press_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_press_releases_status ON press_releases(status);
CREATE INDEX IF NOT EXISTS idx_press_releases_date ON press_releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_press_releases_category ON press_releases(category);

COMMENT ON TABLE press_releases IS 'Пресс-релизы для распространения в СМИ';

-- ============================================
-- ТАБЛИЦА: media_mentions
-- Упоминания артиста в СМИ
-- ============================================
CREATE TABLE IF NOT EXISTS media_mentions (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  outreach_request_id TEXT REFERENCES media_outreach_requests(id) ON DELETE SET NULL,
  press_release_id TEXT REFERENCES press_releases(id) ON DELETE SET NULL,
  media_outlet TEXT NOT NULL,
  media_type TEXT NOT NULL
    CHECK (media_type IN ('newspaper', 'magazine', 'online_media', 'tv', 'radio', 'podcast', 'blog', 'youtube', 'social_media')),
  article_title TEXT NOT NULL,
  article_url TEXT,
  author TEXT DEFAULT '',
  published_date DATE NOT NULL,
  content_snippet TEXT DEFAULT '',
  sentiment TEXT DEFAULT 'neutral'
    CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  mention_type TEXT DEFAULT 'feature'
    CHECK (mention_type IN ('feature', 'interview', 'review', 'news', 'mention', 'listicle')),
  reach_estimate INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  ave_value INTEGER DEFAULT 0,
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_mentions_artist ON media_mentions(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_mentions_outlet ON media_mentions(media_outlet);
CREATE INDEX IF NOT EXISTS idx_media_mentions_date ON media_mentions(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_media_mentions_sentiment ON media_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_media_mentions_type ON media_mentions(mention_type);

COMMENT ON TABLE media_mentions IS 'Отслеживание упоминаний артиста в СМИ';

-- ============================================
-- ТАБЛИЦА: interview_requests
-- Заявки на интервью
-- ============================================
CREATE TABLE IF NOT EXISTS interview_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  outreach_request_id TEXT REFERENCES media_outreach_requests(id) ON DELETE SET NULL,
  media_contact_id TEXT REFERENCES media_contacts(id) ON DELETE SET NULL,
  media_outlet TEXT NOT NULL,
  interviewer_name TEXT NOT NULL,
  interview_format TEXT NOT NULL
    CHECK (interview_format IN ('text_email', 'text_in_person', 'video', 'audio', 'live_stream', 'podcast')),
  topic TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  suggested_date TIMESTAMPTZ,
  scheduled_date TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT DEFAULT '',
  is_remote BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'scheduled', 'completed', 'published', 'cancelled')),
  preparation_notes TEXT DEFAULT '',
  talking_points TEXT[] DEFAULT ARRAY[]::TEXT[],
  published_url TEXT,
  published_date DATE,
  views_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_artist ON interview_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_interview_status ON interview_requests(status);
CREATE INDEX IF NOT EXISTS idx_interview_date ON interview_requests(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interview_outlet ON interview_requests(media_outlet);

COMMENT ON TABLE interview_requests IS 'Управление интервью с медиа';

-- ============================================
-- ТАБЛИЦА: media_packages
-- Медиа-пакеты (EPK - Electronic Press Kit)
-- ============================================
CREATE TABLE IF NOT EXISTS media_packages (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  package_type TEXT DEFAULT 'general'
    CHECK (package_type IN ('general', 'album_release', 'tour', 'event', 'award', 'custom')),
  bio_short TEXT DEFAULT '',
  bio_long TEXT DEFAULT '',
  key_facts TEXT[] DEFAULT ARRAY[]::TEXT[],
  press_photos JSONB DEFAULT '[]'::jsonb,
  logos JSONB DEFAULT '[]'::jsonb,
  music_samples JSONB DEFAULT '[]'::jsonb,
  video_links TEXT[] DEFAULT ARRAY[]::TEXT[],
  press_quotes JSONB DEFAULT '[]'::jsonb,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  social_stats JSONB DEFAULT '{}'::jsonb,
  streaming_stats JSONB DEFAULT '{}'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  brand_colors JSONB DEFAULT '{}'::jsonb,
  downloads_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  public_url TEXT,
  password_protected BOOLEAN DEFAULT false,
  access_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_packages_artist ON media_packages(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_packages_type ON media_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_media_packages_public ON media_packages(is_public);

COMMENT ON TABLE media_packages IS 'Electronic Press Kit (EPK) - медиа-пакеты артиста';

-- ============================================
-- ТАБЛИЦА: pr_campaigns
-- PR кампании
-- ============================================
CREATE TABLE IF NOT EXISTS pr_campaigns (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_goal TEXT NOT NULL
    CHECK (campaign_goal IN ('brand_awareness', 'album_launch', 'tour_promotion', 'reputation_management', 'crisis_management', 'thought_leadership')),
  start_date DATE NOT NULL,
  end_date DATE,
  budget INTEGER DEFAULT 0,
  target_audience TEXT DEFAULT '',
  key_messages TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_media_outlets TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')),
  kpi_goals JSONB DEFAULT '{}'::jsonb,
  actual_metrics JSONB DEFAULT '{}'::jsonb,
  total_reach INTEGER DEFAULT 0,
  total_mentions INTEGER DEFAULT 0,
  total_ave_value INTEGER DEFAULT 0,
  sentiment_score DECIMAL(3,2) DEFAULT 0,
  team_members TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pr_campaigns_artist ON pr_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_pr_campaigns_status ON pr_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_pr_campaigns_dates ON pr_campaigns(start_date, end_date);

COMMENT ON TABLE pr_campaigns IS 'Управление PR кампаниями';

-- ============================================
-- ТАБЛИЦА: media_monitoring
-- Мониторинг упоминаний в реальном времени
-- ============================================
CREATE TABLE IF NOT EXISTS media_monitoring (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  source_type TEXT NOT NULL
    CHECK (source_type IN ('news', 'social_media', 'blogs', 'forums', 'video', 'audio')),
  source_name TEXT NOT NULL,
  found_text TEXT NOT NULL,
  url TEXT NOT NULL,
  author TEXT DEFAULT '',
  sentiment TEXT DEFAULT 'neutral'
    CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  reach_estimate INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  mentioned_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_monitoring_artist ON media_monitoring(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_monitoring_keyword ON media_monitoring(keyword);
CREATE INDEX IF NOT EXISTS idx_media_monitoring_date ON media_monitoring(mentioned_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_monitoring_sentiment ON media_monitoring(sentiment);
CREATE INDEX IF NOT EXISTS idx_media_monitoring_important ON media_monitoring(is_important) WHERE is_important = true;

COMMENT ON TABLE media_monitoring IS 'Автоматический мониторинг упоминаний в интернете';

-- ============================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================

-- Статистика PR кампаний
CREATE OR REPLACE VIEW pr_campaign_stats AS
SELECT 
  pc.id,
  pc.artist_id,
  pc.campaign_name,
  pc.status,
  pc.budget,
  pc.start_date,
  pc.end_date,
  COUNT(DISTINCT mm.id) as mentions_count,
  SUM(mm.reach_estimate) as total_reach,
  SUM(mm.ave_value) as total_ave_value,
  AVG(CASE mm.sentiment 
    WHEN 'positive' THEN 1.0 
    WHEN 'neutral' THEN 0.5 
    WHEN 'negative' THEN 0.0 
    ELSE 0.5 
  END) as sentiment_score
FROM pr_campaigns pc
LEFT JOIN media_mentions mm ON mm.artist_id = pc.artist_id 
  AND mm.published_date BETWEEN pc.start_date AND COALESCE(pc.end_date, CURRENT_DATE)
GROUP BY pc.id, pc.artist_id, pc.campaign_name, pc.status, pc.budget, pc.start_date, pc.end_date;

-- Топ медиа-контактов по эффективности
CREATE OR REPLACE VIEW top_media_contacts AS
SELECT 
  mc.id,
  mc.artist_id,
  mc.full_name,
  mc.media_outlet,
  mc.media_type,
  mc.relationship_status,
  COUNT(DISTINCT mm.id) as mentions_count,
  SUM(mm.reach_estimate) as total_reach,
  AVG(mm.engagement_count) as avg_engagement
FROM media_contacts mc
LEFT JOIN media_mentions mm ON mm.media_outlet = mc.media_outlet
GROUP BY mc.id, mc.artist_id, mc.full_name, mc.media_outlet, mc.media_type, mc.relationship_status
ORDER BY mentions_count DESC, total_reach DESC;

-- Аналитика пресс-релизов
CREATE OR REPLACE VIEW press_release_analytics AS
SELECT 
  pr.id,
  pr.artist_id,
  pr.title,
  pr.status,
  pr.release_date,
  pr.sent_count,
  pr.opened_count,
  pr.clicked_count,
  pr.published_count,
  CASE WHEN pr.sent_count > 0 THEN (pr.opened_count::DECIMAL / pr.sent_count * 100) ELSE 0 END as open_rate,
  CASE WHEN pr.opened_count > 0 THEN (pr.clicked_count::DECIMAL / pr.opened_count * 100) ELSE 0 END as click_rate,
  CASE WHEN pr.sent_count > 0 THEN (pr.published_count::DECIMAL / pr.sent_count * 100) ELSE 0 END as publish_rate
FROM press_releases pr;

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_media_contacts_updated_at BEFORE UPDATE ON media_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_press_releases_updated_at BEFORE UPDATE ON press_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_mentions_updated_at BEFORE UPDATE ON media_mentions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_requests_updated_at BEFORE UPDATE ON interview_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_packages_updated_at BEFORE UPDATE ON media_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pr_campaigns_updated_at BEFORE UPDATE ON pr_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- КОММЕНТАРИИ К СТОЛБЦАМ
-- ============================================

-- media_contacts
COMMENT ON COLUMN media_contacts.coverage_tier IS 'Уровень охвата: local (локальный), regional (региональный), national (национальный), international (международный)';
COMMENT ON COLUMN media_contacts.relationship_status IS 'Статус отношений: cold (холодный), warm (теплый), hot (горячий), partner (партнер)';
COMMENT ON COLUMN media_contacts.audience_size IS 'Размер аудитории медиа';
COMMENT ON COLUMN media_contacts.engagement_rate IS 'Процент вовлеченности аудитории';

-- press_releases
COMMENT ON COLUMN press_releases.embargo_until IS 'Эмбарго - запрет на публикацию до указанной даты';
COMMENT ON COLUMN press_releases.sent_count IS 'Количество отправленных пресс-релизов';
COMMENT ON COLUMN press_releases.opened_count IS 'Количество открытий';
COMMENT ON COLUMN press_releases.published_count IS 'Количество публикаций в СМИ';

-- media_mentions
COMMENT ON COLUMN media_mentions.ave_value IS 'Advertising Value Equivalency - эквивалент рекламной стоимости';
COMMENT ON COLUMN media_mentions.sentiment IS 'Тональность упоминания';
COMMENT ON COLUMN media_mentions.reach_estimate IS 'Оценка охвата аудитории';

-- pr_campaigns
COMMENT ON COLUMN pr_campaigns.kpi_goals IS 'KPI цели кампании (JSON)';
COMMENT ON COLUMN pr_campaigns.actual_metrics IS 'Фактические метрики (JSON)';
COMMENT ON COLUMN pr_campaigns.total_ave_value IS 'Общая рекламная ценность';

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (DEMO)
-- ============================================

-- Типовые категории медиа-контактов
INSERT INTO media_contacts (id, artist_id, full_name, position, media_outlet, media_type, email, coverage_tier, audience_size, relationship_status)
VALUES 
  ('demo_contact_1', 'demo_artist', 'Иван Петров', 'Главный редактор', 'Афиша Daily', 'online_media', 'i.petrov@example.com', 'national', 500000, 'warm'),
  ('demo_contact_2', 'demo_artist', 'Мария Сидорова', 'Музыкальный журналист', 'The Village', 'online_media', 'm.sidorova@example.com', 'national', 300000, 'hot'),
  ('demo_contact_3', 'demo_artist', 'Алексей Смирнов', 'Ведущий', 'Радио Maximum', 'radio', 'a.smirnov@example.com', 'national', 1000000, 'partner')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- УСПЕХ!
-- ============================================
-- 
-- ✅ Создано 8 таблиц:
--    1. media_contacts - База медиа-контактов
--    2. press_releases - Пресс-релизы
--    3. media_mentions - Упоминания в СМИ
--    4. interview_requests - Управление интервью
--    5. media_packages - EPK пакеты
--    6. pr_campaigns - PR кампании
--    7. media_monitoring - Мониторинг упоминаний
-- 
-- ✅ Создано 3 представления (views):
--    - pr_campaign_stats
--    - top_media_contacts
--    - press_release_analytics
-- 
-- ✅ Добавлены триггеры для автообновления
-- ✅ Добавлены демо-данные
-- 
-- 🎉 База данных для PR и СМИ готова!
-- 
-- ============================================
