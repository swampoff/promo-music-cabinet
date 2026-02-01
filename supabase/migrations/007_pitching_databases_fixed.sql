-- ============================================
-- PITCHING DATABASES - Базы для рассылок
-- FIXED VERSION - без зависимостей
-- ============================================

-- Создаём функцию updated_at если её нет
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- ТАБЛИЦА: pitching_playlists
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'other',
  playlist_url TEXT,
  curator_name TEXT,
  curator_email TEXT,
  curator_phone TEXT,
  curator_social JSONB DEFAULT '{}'::jsonb,
  genres TEXT[] DEFAULT '{}',
  moods TEXT[] DEFAULT '{}',
  followers_count INTEGER DEFAULT 0,
  tracks_count INTEGER DEFAULT 0,
  accepts_submissions BOOLEAN DEFAULT true,
  submission_fee INTEGER DEFAULT 0,
  average_response_days INTEGER DEFAULT 7,
  requirements TEXT,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА: pitching_venues
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  venue_type TEXT NOT NULL DEFAULT 'club',
  city TEXT NOT NULL DEFAULT '',
  address TEXT,
  region TEXT,
  country TEXT DEFAULT 'Россия',
  contact_name TEXT,
  contact_position TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_social JSONB DEFAULT '{}'::jsonb,
  music_genres TEXT[] DEFAULT '{}',
  capacity INTEGER,
  working_hours JSONB DEFAULT '{}'::jsonb,
  has_live_music BOOLEAN DEFAULT false,
  has_dj BOOLEAN DEFAULT false,
  accepts_music BOOLEAN DEFAULT true,
  collaboration_type TEXT[] DEFAULT '{}',
  payment_terms TEXT,
  average_budget INTEGER DEFAULT 0,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА: pitching_radio
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_radio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slogan TEXT,
  radio_type TEXT NOT NULL DEFAULT 'other',
  frequency TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Россия',
  coverage TEXT,
  listeners_count INTEGER DEFAULT 0,
  website TEXT,
  email TEXT,
  phone TEXT,
  editor_name TEXT,
  editor_email TEXT,
  editor_phone TEXT,
  editor_social JSONB DEFAULT '{}'::jsonb,
  music_genres TEXT[] DEFAULT '{}',
  target_audience TEXT,
  format TEXT,
  programs JSONB DEFAULT '[]'::jsonb,
  accepts_submissions BOOLEAN DEFAULT true,
  submission_email TEXT,
  submission_requirements TEXT,
  average_response_days INTEGER DEFAULT 14,
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  added_to_rotation INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА: pitching_campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pitching_request_id TEXT,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'mixed',
  recipients_playlists UUID[] DEFAULT '{}',
  recipients_venues UUID[] DEFAULT '{}',
  recipients_radio UUID[] DEFAULT '{}',
  total_recipients INTEGER DEFAULT 0,
  subject TEXT,
  message_template TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  responded_count INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ТАБЛИЦА: pitching_campaign_responses
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_campaign_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES pitching_campaigns(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL DEFAULT 'venue',
  recipient_id UUID NOT NULL,
  recipient_name TEXT,
  response_type TEXT NOT NULL DEFAULT 'no_response',
  response_text TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_platform ON pitching_playlists(platform);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_active ON pitching_playlists(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_type ON pitching_venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_city ON pitching_venues(city);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_active ON pitching_venues(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_type ON pitching_radio(radio_type);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_city ON pitching_radio(city);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_active ON pitching_radio(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_campaigns_status ON pitching_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_responses_campaign ON pitching_campaign_responses(campaign_id);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE pitching_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_campaign_responses ENABLE ROW LEVEL SECURITY;

-- Политики для чтения
DROP POLICY IF EXISTS "Public can view active playlists" ON pitching_playlists;
CREATE POLICY "Public can view active playlists" ON pitching_playlists FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active venues" ON pitching_venues;
CREATE POLICY "Public can view active venues" ON pitching_venues FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active radio" ON pitching_radio;
CREATE POLICY "Public can view active radio" ON pitching_radio FOR SELECT USING (is_active = true);

-- ============================================
-- ГОТОВО!
-- ============================================
