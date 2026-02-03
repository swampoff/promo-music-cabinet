-- ============================================
-- PROMOTION SYSTEM - SQL TABLES
-- ============================================
-- 
-- ВАЖНО: Выполните этот SQL в Supabase Dashboard:
-- 1. Откройте Supabase Dashboard
-- 2. Перейдите в SQL Editor
-- 3. Скопируйте и выполните весь этот SQL
-- 
-- ============================================

-- ============================================
-- ТАБЛИЦА: pitching_requests
-- Заявки на питчинг треков
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  pitch_type TEXT NOT NULL CHECK (pitch_type IN ('standard', 'premium_direct_to_editor')),
  target_channels JSONB DEFAULT '[]'::jsonb,
  message TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_payment' 
    CHECK (status IN ('draft', 'pending_payment', 'pending_review', 'in_progress', 'completed', 'rejected', 'cancelled')),
  responses_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  added_to_rotation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_artist ON pitching_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_pitching_status ON pitching_requests(status);
CREATE INDEX IF NOT EXISTS idx_pitching_created ON pitching_requests(created_at DESC);

COMMENT ON TABLE pitching_requests IS 'Заявки на питчинг треков на радио и плейлисты';

-- ============================================
-- ТАБЛИЦА: editor_responses
-- Ответы редакторов на питчинг
-- ============================================
CREATE TABLE IF NOT EXISTS editor_responses (
  id TEXT PRIMARY KEY,
  pitching_request_id TEXT NOT NULL REFERENCES pitching_requests(id) ON DELETE CASCADE,
  editor_id TEXT NOT NULL,
  editor_name TEXT NOT NULL,
  editor_type TEXT DEFAULT 'radio' CHECK (editor_type IN ('radio', 'playlist')),
  response_type TEXT NOT NULL 
    CHECK (response_type IN ('interested', 'not_interested', 'added_to_rotation', 'need_more_info')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editor_request ON editor_responses(pitching_request_id);
CREATE INDEX IF NOT EXISTS idx_editor_response_type ON editor_responses(response_type);

COMMENT ON TABLE editor_responses IS 'Ответы редакторов на заявки питчинга';

-- ============================================
-- ТАБЛИЦА: production_360_requests
-- Заявки на 360° продакшн (съёмка, монтаж, дизайн)
-- ============================================
CREATE TABLE IF NOT EXISTS production_360_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  service_type TEXT NOT NULL 
    CHECK (service_type IN ('video_shooting', 'video_editing', 'cover_design', 'full_package')),
  project_title TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('draft', 'pending_payment', 'in_review', 'in_production', 'revision', 'completed', 'cancelled')),
  attachments JSONB DEFAULT '[]'::jsonb,
  team_assigned JSONB DEFAULT '{}'::jsonb,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_artist ON production_360_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_production_status ON production_360_requests(status);
CREATE INDEX IF NOT EXISTS idx_production_type ON production_360_requests(service_type);

COMMENT ON TABLE production_360_requests IS 'Заявки на 360° продакшн контента';

-- ============================================
-- ТАБЛИЦА: marketing_campaigns
-- Маркетинговые кампании
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL
    CHECK (campaign_type IN ('social_ads', 'influencer', 'email', 'content', 'full_package')),
  target_audience JSONB DEFAULT '{}'::jsonb,
  budget INTEGER NOT NULL,
  duration_days INTEGER DEFAULT 30,
  platforms JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'cancelled')),
  metrics JSONB DEFAULT '{}'::jsonb,
  roi DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketing_artist ON marketing_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_marketing_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_type ON marketing_campaigns(campaign_type);

COMMENT ON TABLE marketing_campaigns IS 'Маркетинговые кампании для продвижения';

-- ============================================
-- ТАБЛИЦА: media_outreach_requests
-- Заявки на PR и работу со СМИ
-- ============================================
CREATE TABLE IF NOT EXISTS media_outreach_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  outreach_type TEXT NOT NULL
    CHECK (outreach_type IN ('press_release', 'interview', 'feature', 'podcast', 'full_pr')),
  topic TEXT NOT NULL,
  angle TEXT DEFAULT '',
  target_media JSONB DEFAULT '[]'::jsonb,
  budget INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('draft', 'pending_payment', 'outreach', 'scheduled', 'published', 'declined', 'cancelled')),
  publications JSONB DEFAULT '[]'::jsonb,
  reach_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_artist ON media_outreach_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON media_outreach_requests(status);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_outreach_requests(outreach_type);

COMMENT ON TABLE media_outreach_requests IS 'Заявки на PR и работу со СМИ';

-- ============================================
-- ТАБЛИЦА: event_requests
-- Заявки на организацию концертов и событий
-- ============================================
CREATE TABLE IF NOT EXISTS event_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('concert', 'festival', 'club_show', 'online_event', 'tour')),
  event_name TEXT NOT NULL,
  city TEXT,
  venue TEXT,
  event_date DATE,
  expected_audience INTEGER,
  budget INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'booking', 'confirmed', 'promotion', 'completed', 'cancelled')),
  tickets_sold INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  team JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_artist ON event_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_status ON event_requests(status);
CREATE INDEX IF NOT EXISTS idx_event_date ON event_requests(event_date);

COMMENT ON TABLE event_requests IS 'Заявки на организацию концертов и событий';

-- ============================================
-- ТАБЛИЦА: promo_lab_experiments
-- PROMO Lab - экспериментальное продвижение
-- ============================================
CREATE TABLE IF NOT EXISTS promo_lab_experiments (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  experiment_type TEXT NOT NULL
    CHECK (experiment_type IN ('ai_targeting', 'viral_challenge', 'nft_drop', 'meta_collab', 'custom')),
  hypothesis TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'running', 'analyzing', 'completed', 'failed', 'cancelled')),
  metrics JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  learning TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_artist ON promo_lab_experiments(artist_id);
CREATE INDEX IF NOT EXISTS idx_lab_status ON promo_lab_experiments(status);
CREATE INDEX IF NOT EXISTS idx_lab_type ON promo_lab_experiments(experiment_type);

COMMENT ON TABLE promo_lab_experiments IS 'PROMO Lab - экспериментальные кампании';

-- ============================================
-- ТАБЛИЦА: promotion_transactions
-- Транзакции оплаты за услуги продвижения
-- ============================================
CREATE TABLE IF NOT EXISTS promotion_transactions (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('pitching', 'production', 'marketing', 'media', 'event', 'promo_lab')),
  reference_id TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'coins'
    CHECK (payment_method IN ('coins', 'card', 'bank_transfer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_artist ON promotion_transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON promotion_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transaction_reference ON promotion_transactions(reference_id);

COMMENT ON TABLE promotion_transactions IS 'Транзакции оплаты услуг продвижения';
