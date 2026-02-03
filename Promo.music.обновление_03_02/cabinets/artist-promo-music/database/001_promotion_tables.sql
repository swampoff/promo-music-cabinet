-- =====================================================
-- PROMOTION SYSTEM TABLES
-- Version: 1.0.0
-- Description: Система продвижения для артистов
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PITCHING REQUESTS
-- Заявки на питчинг треков на радио и плейлисты
-- =====================================================

CREATE TABLE IF NOT EXISTS pitching_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  track_title VARCHAR(200) NOT NULL,
  track_url TEXT,
  pitch_type VARCHAR(50) NOT NULL, -- radio_small, radio_medium, radio_top, playlist_indie, playlist_major
  target_audience TEXT,
  additional_info TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment', -- pending_payment, pending_review, in_progress, completed, rejected
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pitching_artist ON pitching_requests(artist_id);
CREATE INDEX idx_pitching_status ON pitching_requests(status);
CREATE INDEX idx_pitching_created ON pitching_requests(created_at DESC);

-- =====================================================
-- 2. PRODUCTION 360 REQUESTS
-- Заказы на видеопродакшн, монтаж, дизайн
-- =====================================================

CREATE TABLE IF NOT EXISTS production_360_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  service_type VARCHAR(50) NOT NULL, -- video_shooting, video_editing, cover_design, full_package
  project_title VARCHAR(200) NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment', -- pending_payment, in_review, in_production, revision, completed, cancelled
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_production_artist ON production_360_requests(artist_id);
CREATE INDEX idx_production_status ON production_360_requests(status);
CREATE INDEX idx_production_deadline ON production_360_requests(deadline);

-- =====================================================
-- 3. MARKETING CAMPAIGNS
-- Маркетинговые кампании (таргет, SMM, PR)
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  campaign_type VARCHAR(50) NOT NULL, -- targeted_ads, smm_management, pr_campaign, influencer_collab
  campaign_name VARCHAR(200) NOT NULL,
  target_audience TEXT,
  budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration_days INT NOT NULL DEFAULT 7,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, pending_payment, active, paused, completed, cancelled
  metrics JSONB DEFAULT '{}', -- { impressions, clicks, conversions, engagement_rate }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_marketing_artist ON marketing_campaigns(artist_id);
CREATE INDEX idx_marketing_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_dates ON marketing_campaigns(start_date, end_date);

-- =====================================================
-- 4. MEDIA OUTREACH REQUESTS
-- Обращения в СМИ, блоги, подкасты
-- =====================================================

CREATE TABLE IF NOT EXISTS media_outreach_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  media_type VARCHAR(50) NOT NULL, -- music_magazines, blogs, podcasts, interviews, press_release
  campaign_title VARCHAR(200) NOT NULL,
  message TEXT,
  target_media TEXT, -- Список целевых СМИ
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment', -- pending_payment, in_review, outreach_sent, responses_received, completed
  responses_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_artist ON media_outreach_requests(artist_id);
CREATE INDEX idx_media_status ON media_outreach_requests(status);

-- =====================================================
-- 5. EVENT REQUESTS
-- Организация концертов, промо-ивентов
-- =====================================================

CREATE TABLE IF NOT EXISTS event_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- club_booking, festival_application, showcase, promo_tour
  event_title VARCHAR(200) NOT NULL,
  event_date DATE,
  venue_preferences TEXT,
  expected_audience INT,
  budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_review', -- pending_review, searching_venue, confirmed, completed, cancelled
  venue_confirmed VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_event_artist ON event_requests(artist_id);
CREATE INDEX idx_event_status ON event_requests(status);
CREATE INDEX idx_event_date ON event_requests(event_date);

-- =====================================================
-- 6. PROMO LAB EXPERIMENTS
-- A/B тесты, эксперименты с обложками и промо
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_lab_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  experiment_type VARCHAR(50) NOT NULL, -- cover_ab_test, title_test, snippet_test, release_strategy
  experiment_name VARCHAR(200) NOT NULL,
  hypothesis TEXT,
  variant_a JSONB NOT NULL, -- { cover_url, title, description }
  variant_b JSONB NOT NULL,
  target_audience TEXT,
  budget DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, running, completed, cancelled
  results JSONB DEFAULT '{}', -- { winner, a_metrics, b_metrics, confidence }
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_promolab_artist ON promo_lab_experiments(artist_id);
CREATE INDEX idx_promolab_status ON promo_lab_experiments(status);

-- =====================================================
-- 7. EDITOR RESPONSES
-- Ответы редакторов и кураторов
-- =====================================================

CREATE TABLE IF NOT EXISTS editor_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL, -- ID заявки (pitching, media, etc)
  request_type VARCHAR(50) NOT NULL, -- pitching, media_outreach, event
  editor_name VARCHAR(200),
  editor_contact VARCHAR(200),
  response_type VARCHAR(50), -- accepted, rejected, interested, needs_revision
  message TEXT,
  response_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_responses_request ON editor_responses(request_id);
CREATE INDEX idx_responses_type ON editor_responses(request_type);

-- =====================================================
-- 8. PROMOTION TRANSACTIONS
-- История транзакций (оплаты, списание коинов)
-- =====================================================

CREATE TABLE IF NOT EXISTS promotion_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL,
  request_id UUID NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- pitching, production360, marketing, media, event, promolab
  transaction_type VARCHAR(50) NOT NULL, -- payment, coin_deduction, refund
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  payment_method VARCHAR(50), -- card, coins, bank_transfer
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_artist ON promotion_transactions(artist_id);
CREATE INDEX idx_transactions_request ON promotion_transactions(request_id);
CREATE INDEX idx_transactions_status ON promotion_transactions(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE pitching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_360_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_outreach_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_transactions ENABLE ROW LEVEL SECURITY;

-- Pitching Requests Policies
CREATE POLICY "Users can view own pitching requests"
  ON pitching_requests FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own pitching requests"
  ON pitching_requests FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update own pitching requests"
  ON pitching_requests FOR UPDATE
  USING (auth.uid() = artist_id);

-- Production 360 Policies
CREATE POLICY "Users can view own production requests"
  ON production_360_requests FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own production requests"
  ON production_360_requests FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update own production requests"
  ON production_360_requests FOR UPDATE
  USING (auth.uid() = artist_id);

-- Marketing Campaigns Policies
CREATE POLICY "Users can view own marketing campaigns"
  ON marketing_campaigns FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own marketing campaigns"
  ON marketing_campaigns FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update own marketing campaigns"
  ON marketing_campaigns FOR UPDATE
  USING (auth.uid() = artist_id);

-- Media Outreach Policies
CREATE POLICY "Users can view own media requests"
  ON media_outreach_requests FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own media requests"
  ON media_outreach_requests FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update own media requests"
  ON media_outreach_requests FOR UPDATE
  USING (auth.uid() = artist_id);

-- Event Requests Policies
CREATE POLICY "Users can view own event requests"
  ON event_requests FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own event requests"
  ON event_requests FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update own event requests"
  ON event_requests FOR UPDATE
  USING (auth.uid() = artist_id);

-- Promo Lab Policies
CREATE POLICY "Users can view own experiments"
  ON promo_lab_experiments FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own experiments"
  ON promo_lab_experiments FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Users can update own experiments"
  ON promo_lab_experiments FOR UPDATE
  USING (auth.uid() = artist_id);

-- Editor Responses Policies (read-only for users)
CREATE POLICY "Users can view responses to their requests"
  ON editor_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM pitching_requests WHERE id = editor_responses.request_id AND artist_id = auth.uid()
    UNION
    SELECT 1 FROM media_outreach_requests WHERE id = editor_responses.request_id AND artist_id = auth.uid()
    UNION
    SELECT 1 FROM event_requests WHERE id = editor_responses.request_id AND artist_id = auth.uid()
  ));

-- Promotion Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON promotion_transactions FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Users can create own transactions"
  ON promotion_transactions FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_pitching_updated_at
  BEFORE UPDATE ON pitching_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_updated_at
  BEFORE UPDATE ON production_360_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media_outreach_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_updated_at
  BEFORE UPDATE ON event_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promolab_updated_at
  BEFORE UPDATE ON promo_lab_experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- You can add some sample data here if needed
-- For prototype, this is optional

-- =====================================================
-- COMPLETE!
-- =====================================================
-- All 8 tables created with:
-- ✅ Primary keys (UUID)
-- ✅ Indexes for performance
-- ✅ Row Level Security policies
-- ✅ Automatic updated_at triggers
-- ✅ Ready for production use
-- =====================================================
