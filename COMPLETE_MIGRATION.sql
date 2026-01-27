-- ============================================
-- PROMO.MUSIC DATABASE SCHEMA
-- Initial Migration - Full Schema Setup
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================
-- ARTISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  phone TEXT,
  
  -- Social media
  instagram TEXT,
  twitter TEXT,
  facebook TEXT,
  youtube TEXT,
  spotify TEXT,
  apple_music TEXT,
  
  -- Coins system
  coins_balance INTEGER DEFAULT 0 NOT NULL,
  total_coins_spent INTEGER DEFAULT 0 NOT NULL,
  total_coins_earned INTEGER DEFAULT 0 NOT NULL,
  
  -- Statistics
  total_plays INTEGER DEFAULT 0 NOT NULL,
  total_followers INTEGER DEFAULT 0 NOT NULL,
  total_concerts INTEGER DEFAULT 0 NOT NULL,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for artists
CREATE INDEX idx_artists_email ON artists(email);
CREATE INDEX idx_artists_username ON artists(username);
CREATE INDEX idx_artists_created_at ON artists(created_at DESC);

-- ============================================
-- CONCERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Concert details
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_type TEXT NOT NULL, -- 'Концерт', 'Фестиваль', etc
  
  -- Banner
  banner_image_url TEXT,
  
  -- Tickets
  ticket_price_min DECIMAL(10, 2),
  ticket_price_max DECIMAL(10, 2),
  ticket_link TEXT,
  ticket_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Moderation
  moderation_status TEXT DEFAULT 'draft' NOT NULL 
    CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT false,
  promotion_starts_at TIMESTAMPTZ,
  promotion_ends_at TIMESTAMPTZ,
  promotion_cost INTEGER, -- Coins spent
  
  -- Visibility
  is_hidden BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  
  -- Analytics
  views_count INTEGER DEFAULT 0 NOT NULL,
  clicks_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_promotion_dates CHECK (
    (is_promoted = false) OR 
    (promotion_starts_at IS NOT NULL AND promotion_ends_at IS NOT NULL)
  )
);

-- Indexes for concerts
CREATE INDEX idx_concerts_artist_id ON concerts(artist_id);
CREATE INDEX idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_moderation_status ON concerts(moderation_status);
CREATE INDEX idx_concerts_is_promoted ON concerts(is_promoted) WHERE is_promoted = true;
CREATE INDEX idx_concerts_created_at ON concerts(created_at DESC);
CREATE INDEX idx_concerts_views ON concerts(views_count DESC);

-- Full-text search index for concerts
CREATE INDEX idx_concerts_search ON concerts USING GIN (
  to_tsvector('russian', coalesce(title, '') || ' ' || 
              coalesce(description, '') || ' ' || 
              coalesce(city, '') || ' ' || 
              coalesce(venue_name, ''))
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  
  -- Type and content
  notification_type TEXT NOT NULL 
    CHECK (notification_type IN ('reminder', 'announcement', 'ticket_update', 'promotion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery
  channel TEXT NOT NULL 
    CHECK (channel IN ('email', 'push', 'both')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Engagement
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_concert_id ON notifications(concert_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- ============================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Channels
  email_enabled BOOLEAN DEFAULT true NOT NULL,
  push_enabled BOOLEAN DEFAULT true NOT NULL,
  
  -- Reminder days (JSONB array)
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 3, 1] NOT NULL,
  
  -- Notification types
  announcements_enabled BOOLEAN DEFAULT true NOT NULL,
  promotions_enabled BOOLEAN DEFAULT true NOT NULL,
  ticket_updates_enabled BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE SET NULL,
  
  -- Content
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  
  -- Recipients
  recipient_count INTEGER DEFAULT 0 NOT NULL,
  recipient_filter JSONB, -- Criteria for selecting recipients
  
  -- Status
  status TEXT DEFAULT 'draft' NOT NULL 
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  
  -- Schedule
  scheduled_for TIMESTAMPTZ,
  
  -- Delivery
  sent_at TIMESTAMPTZ,
  delivery_started_at TIMESTAMPTZ,
  delivery_completed_at TIMESTAMPTZ,
  
  -- Analytics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_complained INTEGER DEFAULT 0,
  
  open_rate DECIMAL(5, 4), -- e.g., 0.4523 = 45.23%
  click_rate DECIMAL(5, 4),
  bounce_rate DECIMAL(5, 4),
  
  -- Error handling
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for email campaigns
CREATE INDEX idx_campaigns_artist_id ON email_campaigns(artist_id);
CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_scheduled_for ON email_campaigns(scheduled_for);
CREATE INDEX idx_campaigns_created_at ON email_campaigns(created_at DESC);

-- ============================================
-- TICKET PROVIDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_providers (
  id TEXT PRIMARY KEY, -- 'kassir', 'ticketland', etc
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  api_endpoint TEXT,
  commission_rate DECIMAL(5, 2) NOT NULL, -- e.g., 5.00 = 5%
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default providers
INSERT INTO ticket_providers (id, name, logo_url, commission_rate) VALUES
  ('kassir', 'Кассир.ру', 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=100', 5.00),
  ('ticketland', 'Ticketland.ru', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100', 7.00),
  ('afisha', 'Яндекс Афиша', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100', 8.00),
  ('ticketmaster', 'TicketMaster', 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=100', 10.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ARTIST TICKET PROVIDER CONNECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS artist_ticket_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES ticket_providers(id) ON DELETE CASCADE,
  
  -- Connection settings
  api_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ,
  
  -- Unique constraint
  UNIQUE(artist_id, provider_id)
);

-- Indexes
CREATE INDEX idx_artist_providers_artist_id ON artist_ticket_providers(artist_id);
CREATE INDEX idx_artist_providers_provider_id ON artist_ticket_providers(provider_id);

-- ============================================
-- TICKET SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  provider_id TEXT REFERENCES ticket_providers(id) ON DELETE SET NULL,
  
  -- Sale details
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Fees
  commission_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  
  -- Buyer info (optional)
  buyer_email TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'confirmed' NOT NULL 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  
  -- Refund info
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  
  -- External reference
  external_transaction_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for ticket sales
CREATE INDEX idx_sales_concert_id ON ticket_sales(concert_id);
CREATE INDEX idx_sales_artist_id ON ticket_sales(artist_id);
CREATE INDEX idx_sales_provider_id ON ticket_sales(provider_id);
CREATE INDEX idx_sales_status ON ticket_sales(status);
CREATE INDEX idx_sales_purchased_at ON ticket_sales(purchased_at DESC);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Concert analytics view
CREATE OR REPLACE VIEW concert_analytics AS
SELECT 
  c.id,
  c.artist_id,
  c.title,
  c.city,
  c.event_date,
  c.views_count,
  c.clicks_count,
  c.is_promoted,
  COALESCE(SUM(ts.quantity), 0) AS total_tickets_sold,
  COALESCE(SUM(ts.total_amount), 0) AS total_revenue,
  COALESCE(SUM(ts.net_amount), 0) AS net_revenue,
  COALESCE(SUM(ts.commission_amount), 0) AS total_commission,
  CASE 
    WHEN c.views_count > 0 THEN (c.clicks_count::DECIMAL / c.views_count) * 100
    ELSE 0 
  END AS click_through_rate,
  CASE 
    WHEN c.clicks_count > 0 THEN (COALESCE(COUNT(DISTINCT ts.id), 0)::DECIMAL / c.clicks_count) * 100
    ELSE 0 
  END AS conversion_rate
FROM concerts c
LEFT JOIN ticket_sales ts ON ts.concert_id = c.id AND ts.status = 'confirmed'
GROUP BY c.id;

-- Artist statistics view
CREATE OR REPLACE VIEW artist_statistics AS
SELECT 
  a.id,
  a.full_name,
  a.username,
  COUNT(DISTINCT c.id) AS total_concerts,
  COUNT(DISTINCT c.id) FILTER (WHERE c.event_date >= CURRENT_DATE) AS upcoming_concerts,
  COUNT(DISTINCT c.id) FILTER (WHERE c.event_date < CURRENT_DATE) AS past_concerts,
  COALESCE(SUM(c.views_count), 0) AS total_concert_views,
  COALESCE(SUM(ts.quantity), 0) AS total_tickets_sold,
  COALESCE(SUM(ts.net_amount), 0) AS total_revenue,
  a.coins_balance,
  a.total_coins_spent
FROM artists a
LEFT JOIN concerts c ON c.artist_id = a.id
LEFT JOIN ticket_sales ts ON ts.artist_id = a.id AND ts.status = 'confirmed'
GROUP BY a.id;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concerts_updated_at BEFORE UPDATE ON concerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_providers_updated_at BEFORE UPDATE ON ticket_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_sales_updated_at BEFORE UPDATE ON ticket_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment concert views
CREATE OR REPLACE FUNCTION increment_concert_views(concert_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE concerts 
  SET views_count = views_count + 1 
  WHERE id = concert_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment concert clicks
CREATE OR REPLACE FUNCTION increment_concert_clicks(concert_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE concerts 
  SET clicks_count = clicks_count + 1 
  WHERE id = concert_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate campaign metrics
CREATE OR REPLACE FUNCTION calculate_campaign_metrics(campaign_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    open_rate = CASE WHEN emails_delivered > 0 
      THEN (emails_opened::DECIMAL / emails_delivered) 
      ELSE 0 END,
    click_rate = CASE WHEN emails_delivered > 0 
      THEN (emails_clicked::DECIMAL / emails_delivered) 
      ELSE 0 END,
    bounce_rate = CASE WHEN emails_sent > 0 
      THEN (emails_bounced::DECIMAL / emails_sent) 
      ELSE 0 END
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE artists IS 'Artists/musicians profiles';
COMMENT ON TABLE concerts IS 'Concert tour dates and events';
COMMENT ON TABLE notifications IS 'User notifications and reminders';
COMMENT ON TABLE notification_settings IS 'User notification preferences';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns';
COMMENT ON TABLE ticket_providers IS 'Ticket platform integrations';
COMMENT ON TABLE artist_ticket_providers IS 'Artist connections to ticket providers';
COMMENT ON TABLE ticket_sales IS 'Ticket sales transactions';

-- ============================================
-- END OF MIGRATION
-- ============================================
-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security policies for multi-tenant data isolation
-- ============================================

-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_ticket_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ARTISTS POLICIES
-- ============================================

-- Artists can view their own profile
CREATE POLICY "Artists can view own profile"
  ON artists FOR SELECT
  USING (auth.uid()::text = id::text);

-- Artists can update their own profile
CREATE POLICY "Artists can update own profile"
  ON artists FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Artists can insert their own profile (sign up)
CREATE POLICY "Artists can insert own profile"
  ON artists FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Public can view verified artist profiles (for public pages)
CREATE POLICY "Public can view verified artists"
  ON artists FOR SELECT
  USING (is_verified = true AND is_active = true);

-- ============================================
-- CONCERTS POLICIES
-- ============================================

-- Artists can view their own concerts
CREATE POLICY "Artists can view own concerts"
  ON concerts FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can create concerts
CREATE POLICY "Artists can create concerts"
  ON concerts FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);

-- Artists can update their own concerts
CREATE POLICY "Artists can update own concerts"
  ON concerts FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can delete their own concerts
CREATE POLICY "Artists can delete own concerts"
  ON concerts FOR DELETE
  USING (artist_id::text = auth.uid()::text);

-- Public can view approved and promoted concerts
CREATE POLICY "Public can view approved concerts"
  ON concerts FOR SELECT
  USING (
    moderation_status = 'approved' 
    AND is_hidden = false 
    AND is_cancelled = false
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- System can create notifications (service role only)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Service role bypass

-- ============================================
-- NOTIFICATION SETTINGS POLICIES
-- ============================================

-- Users can view their own settings
CREATE POLICY "Users can view own notification settings"
  ON notification_settings FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Users can update their own settings
CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Users can insert their own settings
CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- ============================================
-- EMAIL CAMPAIGNS POLICIES
-- ============================================

-- Artists can view their own campaigns
CREATE POLICY "Artists can view own campaigns"
  ON email_campaigns FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can create campaigns
CREATE POLICY "Artists can create campaigns"
  ON email_campaigns FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);

-- Artists can update their own campaigns
CREATE POLICY "Artists can update own campaigns"
  ON email_campaigns FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can delete their own campaigns
CREATE POLICY "Artists can delete own campaigns"
  ON email_campaigns FOR DELETE
  USING (artist_id::text = auth.uid()::text);

-- ============================================
-- TICKET PROVIDERS POLICIES
-- ============================================

-- Everyone can view active providers (public list)
CREATE POLICY "Everyone can view active providers"
  ON ticket_providers FOR SELECT
  USING (is_active = true);

-- ============================================
-- ARTIST TICKET PROVIDER CONNECTIONS POLICIES
-- ============================================

-- Artists can view their own connections
CREATE POLICY "Artists can view own provider connections"
  ON artist_ticket_providers FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can create connections
CREATE POLICY "Artists can create provider connections"
  ON artist_ticket_providers FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);

-- Artists can update their own connections
CREATE POLICY "Artists can update own provider connections"
  ON artist_ticket_providers FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can delete their own connections
CREATE POLICY "Artists can delete own provider connections"
  ON artist_ticket_providers FOR DELETE
  USING (artist_id::text = auth.uid()::text);

-- ============================================
-- TICKET SALES POLICIES
-- ============================================

-- Artists can view sales for their concerts
CREATE POLICY "Artists can view own concert sales"
  ON ticket_sales FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- System can create sales (service role / webhook)
CREATE POLICY "System can create ticket sales"
  ON ticket_sales FOR INSERT
  WITH CHECK (true); -- Service role bypass

-- Artists can update sales status (refunds)
CREATE POLICY "Artists can update own sales"
  ON ticket_sales FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Function to check if user is artist owner
CREATE OR REPLACE FUNCTION is_artist_owner(artist_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN artist_uuid::text = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns concert
CREATE OR REPLACE FUNCTION is_concert_owner(concert_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM concerts 
    WHERE id = concert_uuid 
    AND artist_id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on all tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Artists can view own profile" ON artists IS 
  'Artists can only view their own profile data';

COMMENT ON POLICY "Public can view approved concerts" ON concerts IS 
  'Public users can view approved, visible, non-cancelled concerts';

COMMENT ON POLICY "Artists can view own concert sales" ON ticket_sales IS 
  'Artists can view ticket sales for their own concerts';

-- ============================================
-- END OF RLS MIGRATION
-- ============================================
-- ============================================
-- PROMO.MUSIC - MIGRATION 003
-- Content & Media: Tracks, Videos, Playlists
-- ============================================

-- ============================================
-- ТАБЛИЦА: tracks (треки)
-- ============================================
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- секунды
  
  audio_file_url TEXT,
  cover_image_url TEXT,
  
  genre TEXT,
  mood TEXT,
  tags TEXT[],
  
  release_date DATE,
  is_explicit BOOLEAN DEFAULT false,
  
  -- Streaming links
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_music_url TEXT,
  soundcloud_url TEXT,
  
  -- Stats
  plays_count INTEGER DEFAULT 0 NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Moderation
  moderation_status TEXT DEFAULT 'draft' NOT NULL 
    CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT false,
  promotion_starts_at TIMESTAMPTZ,
  promotion_ends_at TIMESTAMPTZ,
  promotion_cost INTEGER,
  
  is_hidden BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_release_date ON tracks(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_moderation_status ON tracks(moderation_status);
CREATE INDEX IF NOT EXISTS idx_tracks_plays ON tracks(plays_count DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_tags ON tracks USING gin(tags);

-- Full-text search для треков
CREATE INDEX IF NOT EXISTS idx_tracks_search ON tracks 
  USING gin(to_tsvector('russian', title || ' ' || COALESCE(description, '')));

-- ============================================
-- ТАБЛИЦА: videos (видео)
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- секунды
  
  video_file_url TEXT,
  thumbnail_url TEXT,
  
  video_type TEXT NOT NULL CHECK (video_type IN ('music_video', 'live', 'behind_scenes', 'interview', 'other')),
  
  -- Streaming links
  youtube_url TEXT,
  vimeo_url TEXT,
  
  -- Stats
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Moderation
  moderation_status TEXT DEFAULT 'draft' NOT NULL 
    CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT false,
  promotion_starts_at TIMESTAMPTZ,
  promotion_ends_at TIMESTAMPTZ,
  promotion_cost INTEGER,
  
  is_hidden BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_videos_artist_id ON videos(artist_id);
CREATE INDEX IF NOT EXISTS idx_videos_track_id ON videos(track_id);
CREATE INDEX IF NOT EXISTS idx_videos_video_type ON videos(video_type);
CREATE INDEX IF NOT EXISTS idx_videos_moderation_status ON videos(moderation_status);
CREATE INDEX IF NOT EXISTS idx_videos_views ON videos(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- ============================================
-- ТАБЛИЦА: playlists (плейлисты)
-- ============================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  is_public BOOLEAN DEFAULT true,
  is_collaborative BOOLEAN DEFAULT false,
  
  tracks_count INTEGER DEFAULT 0 NOT NULL,
  total_duration INTEGER DEFAULT 0, -- секунды
  
  plays_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_playlists_artist_id ON playlists(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON playlists(is_public);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at DESC);

-- ============================================
-- ТАБЛИЦА: playlist_tracks (треки в плейлистах)
-- ============================================
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  
  position INTEGER NOT NULL,
  
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  added_by UUID REFERENCES artists(id),
  
  UNIQUE(playlist_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track_id ON playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Автообновление updated_at
DROP TRIGGER IF EXISTS update_tracks_updated_at ON tracks;
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Увеличить счётчик прослушиваний трека
CREATE OR REPLACE FUNCTION increment_track_plays(track_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE tracks SET plays_count = plays_count + 1 WHERE id = track_uuid;
  UPDATE artists SET total_plays = total_plays + 1 
    WHERE id = (SELECT artist_id FROM tracks WHERE id = track_uuid);
END;
$$ LANGUAGE plpgsql;

-- Увеличить счётчик просмотров видео
CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views_count = views_count + 1 WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql;

-- Обновить статистику плейлиста
CREATE OR REPLACE FUNCTION update_playlist_stats(playlist_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE playlists
  SET 
    tracks_count = (
      SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = playlist_uuid
    ),
    total_duration = (
      SELECT COALESCE(SUM(t.duration), 0)
      FROM playlist_tracks pt
      JOIN tracks t ON t.id = pt.track_id
      WHERE pt.playlist_id = playlist_uuid
    )
  WHERE id = playlist_uuid;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автообновления статистики плейлиста
CREATE OR REPLACE FUNCTION trigger_update_playlist_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_playlist_stats(OLD.playlist_id);
  ELSE
    PERFORM update_playlist_stats(NEW.playlist_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS playlist_tracks_stats_trigger ON playlist_tracks;
CREATE TRIGGER playlist_tracks_stats_trigger
  AFTER INSERT OR DELETE ON playlist_tracks
  FOR EACH ROW EXECUTE FUNCTION trigger_update_playlist_stats();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- TRACKS POLICIES
DROP POLICY IF EXISTS "Artists can view own tracks" ON tracks;
CREATE POLICY "Artists can view own tracks" ON tracks FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create tracks" ON tracks;
CREATE POLICY "Artists can create tracks" ON tracks FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own tracks" ON tracks;
CREATE POLICY "Artists can update own tracks" ON tracks FOR UPDATE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own tracks" ON tracks;
CREATE POLICY "Artists can delete own tracks" ON tracks FOR DELETE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view approved tracks" ON tracks;
CREATE POLICY "Public can view approved tracks" ON tracks FOR SELECT 
  USING (moderation_status = 'approved' AND is_hidden = false);

-- VIDEOS POLICIES
DROP POLICY IF EXISTS "Artists can view own videos" ON videos;
CREATE POLICY "Artists can view own videos" ON videos FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create videos" ON videos;
CREATE POLICY "Artists can create videos" ON videos FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own videos" ON videos;
CREATE POLICY "Artists can update own videos" ON videos FOR UPDATE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own videos" ON videos;
CREATE POLICY "Artists can delete own videos" ON videos FOR DELETE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view approved videos" ON videos;
CREATE POLICY "Public can view approved videos" ON videos FOR SELECT 
  USING (moderation_status = 'approved' AND is_hidden = false);

-- PLAYLISTS POLICIES
DROP POLICY IF EXISTS "Artists can view own playlists" ON playlists;
CREATE POLICY "Artists can view own playlists" ON playlists FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create playlists" ON playlists;
CREATE POLICY "Artists can create playlists" ON playlists FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own playlists" ON playlists;
CREATE POLICY "Artists can update own playlists" ON playlists FOR UPDATE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own playlists" ON playlists;
CREATE POLICY "Artists can delete own playlists" ON playlists FOR DELETE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view public playlists" ON playlists;
CREATE POLICY "Public can view public playlists" ON playlists FOR SELECT 
  USING (is_public = true);

-- PLAYLIST_TRACKS POLICIES
DROP POLICY IF EXISTS "Playlist owners can manage tracks" ON playlist_tracks;
CREATE POLICY "Playlist owners can manage tracks" ON playlist_tracks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE id = playlist_tracks.playlist_id 
      AND artist_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Public can view public playlist tracks" ON playlist_tracks;
CREATE POLICY "Public can view public playlist tracks" ON playlist_tracks FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE id = playlist_tracks.playlist_id 
      AND is_public = true
    )
  );

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- 4 новые таблицы: tracks, videos, playlists, playlist_tracks
-- 3 функции: increment_track_plays, increment_video_views, update_playlist_stats
-- 12+ RLS политик
-- 10+ индексов
-- Full-text search для треков
-- ============================================
-- ============================================
-- PROMO.MUSIC - MIGRATION 004
-- Social & Engagement: Followers, Likes, Comments, News
-- ============================================

-- ============================================
-- ТАБЛИЦА: followers (подписчики)
-- ============================================
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  follower_email TEXT NOT NULL,
  follower_name TEXT,
  follower_avatar_url TEXT,
  
  source TEXT, -- откуда подписался (web, mobile, concert, etc)
  
  is_active BOOLEAN DEFAULT true,
  
  followed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unfollowed_at TIMESTAMPTZ,
  
  UNIQUE(artist_id, follower_email)
);

CREATE INDEX IF NOT EXISTS idx_followers_artist_id ON followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_followers_email ON followers(follower_email);
CREATE INDEX IF NOT EXISTS idx_followers_is_active ON followers(is_active);
CREATE INDEX IF NOT EXISTS idx_followers_followed_at ON followers(followed_at DESC);

-- ============================================
-- ТАБЛИЦА: likes (лайки)
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Polymorphic association
  likeable_type TEXT NOT NULL CHECK (likeable_type IN ('track', 'video', 'concert', 'news', 'playlist')),
  likeable_id UUID NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, likeable_type, likeable_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_likeable ON likes(likeable_type, likeable_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

-- ============================================
-- ТАБЛИЦА: comments (комментарии)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Polymorphic association
  commentable_type TEXT NOT NULL CHECK (commentable_type IN ('track', 'video', 'concert', 'news')),
  commentable_id UUID NOT NULL,
  
  content TEXT NOT NULL,
  
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  likes_count INTEGER DEFAULT 0 NOT NULL,
  replies_count INTEGER DEFAULT 0 NOT NULL,
  
  is_edited BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_commentable ON comments(commentable_type, commentable_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- ТАБЛИЦА: news (новости артиста)
-- ============================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  cover_image_url TEXT,
  images_urls TEXT[],
  
  category TEXT CHECK (category IN ('announcement', 'release', 'tour', 'achievement', 'personal', 'other')),
  
  -- Stats
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_artist_id ON news(artist_id);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Full-text search для новостей
CREATE INDEX IF NOT EXISTS idx_news_search ON news 
  USING gin(to_tsvector('russian', title || ' ' || COALESCE(content, '')));

-- ============================================
-- ТАБЛИЦА: shares (репосты/шеринг)
-- ============================================
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Polymorphic association
  shareable_type TEXT NOT NULL CHECK (shareable_type IN ('track', 'video', 'concert', 'news', 'playlist')),
  shareable_id UUID NOT NULL,
  
  platform TEXT NOT NULL CHECK (platform IN ('vk', 'telegram', 'whatsapp', 'twitter', 'facebook', 'instagram', 'copy_link', 'other')),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_shareable ON shares(shareable_type, shareable_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);

-- ============================================
-- ТАБЛИЦА: analytics_events (события для аналитики)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES artists(id),
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view', 'track_play', 'video_view', 'download', 'share', 
    'like', 'comment', 'follow', 'concert_view', 'ticket_click'
  )),
  
  -- Связанные объекты
  resource_type TEXT,
  resource_id UUID,
  
  -- Дополнительные данные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Session info
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_resource ON analytics_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);

-- Партиционирование по датам (опционально, для больших данных)
-- CREATE INDEX IF NOT EXISTS idx_analytics_created_at_brin ON analytics_events USING brin(created_at);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Автообновление updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Увеличить счётчик подписчиков артиста
CREATE OR REPLACE FUNCTION update_followers_count(artist_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE artists 
  SET total_followers = (
    SELECT COUNT(*) FROM followers 
    WHERE artist_id = artist_uuid AND is_active = true
  )
  WHERE id = artist_uuid;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автообновления счётчика подписчиков
CREATE OR REPLACE FUNCTION trigger_update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_followers_count(OLD.artist_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active != NEW.is_active THEN
    PERFORM update_followers_count(NEW.artist_id);
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM update_followers_count(NEW.artist_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS followers_count_trigger ON followers;
CREATE TRIGGER followers_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION trigger_update_followers_count();

-- Увеличить счётчик лайков
CREATE OR REPLACE FUNCTION increment_likes_count(entity_type TEXT, entity_id UUID)
RETURNS void AS $$
BEGIN
  CASE entity_type
    WHEN 'track' THEN
      UPDATE tracks SET likes_count = likes_count + 1 WHERE id = entity_id;
    WHEN 'video' THEN
      UPDATE videos SET likes_count = likes_count + 1 WHERE id = entity_id;
    WHEN 'concert' THEN
      UPDATE concerts SET shares_count = shares_count + 1 WHERE id = entity_id; -- reusing shares_count field
    WHEN 'news' THEN
      UPDATE news SET likes_count = likes_count + 1 WHERE id = entity_id;
    WHEN 'playlist' THEN
      UPDATE playlists SET likes_count = likes_count + 1 WHERE id = entity_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Уменьшить счётчик лайков
CREATE OR REPLACE FUNCTION decrement_likes_count(entity_type TEXT, entity_id UUID)
RETURNS void AS $$
BEGIN
  CASE entity_type
    WHEN 'track' THEN
      UPDATE tracks SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = entity_id;
    WHEN 'video' THEN
      UPDATE videos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = entity_id;
    WHEN 'concert' THEN
      UPDATE concerts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = entity_id;
    WHEN 'news' THEN
      UPDATE news SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = entity_id;
    WHEN 'playlist' THEN
      UPDATE playlists SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = entity_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для лайков
CREATE OR REPLACE FUNCTION trigger_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_likes_count(NEW.likeable_type, NEW.likeable_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_likes_count(OLD.likeable_type, OLD.likeable_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS likes_count_trigger ON likes;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION trigger_likes_count();

-- Увеличить счётчик комментариев
CREATE OR REPLACE FUNCTION increment_comments_count(entity_type TEXT, entity_id UUID)
RETURNS void AS $$
BEGIN
  CASE entity_type
    WHEN 'track' THEN
      UPDATE tracks SET comments_count = comments_count + 1 WHERE id = entity_id;
    WHEN 'video' THEN
      UPDATE videos SET comments_count = comments_count + 1 WHERE id = entity_id;
    WHEN 'news' THEN
      UPDATE news SET comments_count = comments_count + 1 WHERE id = entity_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Уменьшить счётчик комментариев
CREATE OR REPLACE FUNCTION decrement_comments_count(entity_type TEXT, entity_id UUID)
RETURNS void AS $$
BEGIN
  CASE entity_type
    WHEN 'track' THEN
      UPDATE tracks SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = entity_id;
    WHEN 'video' THEN
      UPDATE videos SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = entity_id;
    WHEN 'news' THEN
      UPDATE news SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = entity_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для комментариев
CREATE OR REPLACE FUNCTION trigger_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NULL THEN
    PERFORM increment_comments_count(NEW.commentable_type, NEW.commentable_id);
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NULL THEN
    PERFORM decrement_comments_count(OLD.commentable_type, OLD.commentable_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_count_trigger ON comments;
CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION trigger_comments_count();

-- Увеличить счётчик репостов
CREATE OR REPLACE FUNCTION increment_shares_count(entity_type TEXT, entity_id UUID)
RETURNS void AS $$
BEGIN
  CASE entity_type
    WHEN 'track' THEN
      UPDATE tracks SET shares_count = shares_count + 1 WHERE id = entity_id;
    WHEN 'video' THEN
      UPDATE videos SET shares_count = shares_count + 1 WHERE id = entity_id;
    WHEN 'concert' THEN
      UPDATE concerts SET shares_count = shares_count + 1 WHERE id = entity_id;
    WHEN 'news' THEN
      UPDATE news SET shares_count = shares_count + 1 WHERE id = entity_id;
    WHEN 'playlist' THEN
      UPDATE playlists SET shares_count = shares_count + 1 WHERE id = entity_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Триггер для репостов
CREATE OR REPLACE FUNCTION trigger_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_shares_count(NEW.shareable_type, NEW.shareable_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shares_count_trigger ON shares;
CREATE TRIGGER shares_count_trigger
  AFTER INSERT ON shares
  FOR EACH ROW EXECUTE FUNCTION trigger_shares_count();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- FOLLOWERS POLICIES
DROP POLICY IF EXISTS "Artists can view own followers" ON followers;
CREATE POLICY "Artists can view own followers" ON followers FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can manage own followers" ON followers;
CREATE POLICY "Artists can manage own followers" ON followers FOR ALL 
  USING (artist_id::text = auth.uid()::text);

-- LIKES POLICIES
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes" ON likes FOR ALL 
  USING (user_id::text = auth.uid()::text);

-- COMMENTS POLICIES
DROP POLICY IF EXISTS "Everyone can view non-hidden comments" ON comments;
CREATE POLICY "Everyone can view non-hidden comments" ON comments FOR SELECT 
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments FOR INSERT 
  WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE 
  USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE 
  USING (user_id::text = auth.uid()::text);

-- NEWS POLICIES
DROP POLICY IF EXISTS "Artists can view own news" ON news;
CREATE POLICY "Artists can view own news" ON news FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create news" ON news;
CREATE POLICY "Artists can create news" ON news FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own news" ON news;
CREATE POLICY "Artists can update own news" ON news FOR UPDATE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own news" ON news;
CREATE POLICY "Artists can delete own news" ON news FOR DELETE 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view published news" ON news;
CREATE POLICY "Public can view published news" ON news FOR SELECT 
  USING (is_published = true);

-- SHARES POLICIES
DROP POLICY IF EXISTS "Everyone can view shares" ON shares;
CREATE POLICY "Everyone can view shares" ON shares FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can create shares" ON shares;
CREATE POLICY "Users can create shares" ON shares FOR INSERT 
  WITH CHECK (true); -- Allow anonymous sharing

-- ANALYTICS POLICIES
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT 
  USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can create analytics events" ON analytics_events;
CREATE POLICY "Anyone can create analytics events" ON analytics_events FOR INSERT 
  WITH CHECK (true); -- Allow anonymous tracking

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- 6 новых таблиц: followers, likes, comments, news, shares, analytics_events
-- 10+ функций для счётчиков
-- 15+ RLS политик
-- 15+ индексов
-- Full-text search для новостей
-- Автообновление всех счётчиков через триггеры
-- ============================================
-- ============================================
-- PROMO.MUSIC - MIGRATION 005
-- Donations & Coins: Донаты, Коины, Транзакции
-- ============================================

-- ============================================
-- ТАБЛИЦА: donations (донаты)
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Донатер
  donor_name TEXT,
  donor_email TEXT,
  donor_message TEXT,
  
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  -- Payment info
  payment_method TEXT CHECK (payment_method IN ('card', 'yoomoney', 'qiwi', 'paypal', 'crypto', 'other')),
  payment_provider TEXT,
  external_transaction_id TEXT,
  
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Commission
  commission_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 5.00 NOT NULL, -- процент комиссии
  net_amount DECIMAL(10, 2) NOT NULL, -- после комиссии
  
  -- Публичность
  is_public BOOLEAN DEFAULT true, -- показывать в публичном списке
  is_anonymous BOOLEAN DEFAULT false, -- скрыть имя донатера
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_artist_id ON donations(artist_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_completed_at ON donations(completed_at DESC);

-- ============================================
-- ТАБЛИЦА: coin_packages (пакеты коинов)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_packages (
  id TEXT PRIMARY KEY,
  
  name TEXT NOT NULL,
  description TEXT,
  
  coins_amount INTEGER NOT NULL CHECK (coins_amount > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  bonus_coins INTEGER DEFAULT 0 NOT NULL, -- бонусные коины
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Предустановленные пакеты коинов
INSERT INTO coin_packages (id, name, coins_amount, price, bonus_coins, discount_percent, is_popular, display_order) VALUES
  ('starter', 'Стартовый', 100, 99.00, 0, 0, false, 1),
  ('basic', 'Базовый', 500, 449.00, 50, 10, false, 2),
  ('popular', 'Популярный', 1000, 799.00, 200, 20, true, 3),
  ('premium', 'Премиум', 2500, 1799.00, 500, 28, false, 4),
  ('ultimate', 'Максимум', 5000, 2999.00, 1500, 40, false, 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ТАБЛИЦА: coin_purchases (покупки коинов)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES coin_packages(id),
  
  coins_amount INTEGER NOT NULL,
  bonus_coins INTEGER DEFAULT 0 NOT NULL,
  total_coins INTEGER NOT NULL, -- coins_amount + bonus_coins
  
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  -- Payment info
  payment_method TEXT CHECK (payment_method IN ('card', 'yoomoney', 'qiwi', 'paypal', 'crypto', 'other')),
  payment_provider TEXT,
  external_transaction_id TEXT,
  
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coin_purchases_artist_id ON coin_purchases(artist_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_package_id ON coin_purchases(package_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_status ON coin_purchases(status);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_created_at ON coin_purchases(created_at DESC);

-- ============================================
-- ТАБЛИЦА: coin_transactions (история транзакций коинов)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'purchase',      -- покупка коинов
    'bonus',         -- бонусные коины
    'spent',         -- потрачены
    'refund',        -- возврат
    'gift',          -- подарок
    'reward',        -- награда
    'admin_adjust'   -- корректировка админом
  )),
  
  amount INTEGER NOT NULL, -- может быть отрицательным для spent
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  description TEXT,
  
  -- Связанные объекты
  related_type TEXT, -- concert, track, video, etc
  related_id UUID,
  
  coin_purchase_id UUID REFERENCES coin_purchases(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_artist_id ON coin_transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_related ON coin_transactions(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_purchase_id ON coin_transactions(coin_purchase_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

-- ============================================
-- ТАБЛИЦА: promotion_prices (цены на продвижение)
-- ============================================
CREATE TABLE IF NOT EXISTS promotion_prices (
  id TEXT PRIMARY KEY,
  
  name TEXT NOT NULL,
  description TEXT,
  
  item_type TEXT NOT NULL CHECK (item_type IN ('concert', 'track', 'video', 'news', 'playlist')),
  
  coins_per_day INTEGER NOT NULL CHECK (coins_per_day > 0),
  min_days INTEGER DEFAULT 1 NOT NULL,
  max_days INTEGER DEFAULT 30 NOT NULL,
  
  boost_level TEXT DEFAULT 'basic' CHECK (boost_level IN ('basic', 'medium', 'premium')),
  
  reach_multiplier DECIMAL(5, 2) DEFAULT 1.0, -- коэффициент охвата
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Предустановленные цены на продвижение
INSERT INTO promotion_prices (id, name, item_type, coins_per_day, min_days, max_days, boost_level, reach_multiplier) VALUES
  ('concert_basic', 'Концерт - Базовый', 'concert', 50, 1, 30, 'basic', 2.0),
  ('concert_medium', 'Концерт - Средний', 'concert', 100, 3, 30, 'medium', 5.0),
  ('concert_premium', 'Концерт - Премиум', 'concert', 200, 7, 30, 'premium', 10.0),
  
  ('track_basic', 'Трек - Базовый', 'track', 30, 1, 30, 'basic', 2.0),
  ('track_medium', 'Трек - Средний', 'track', 60, 3, 30, 'medium', 5.0),
  ('track_premium', 'Трек - Премиум', 'track', 120, 7, 30, 'premium', 10.0),
  
  ('video_basic', 'Видео - Базовый', 'video', 40, 1, 30, 'basic', 2.0),
  ('video_medium', 'Видео - Средний', 'video', 80, 3, 30, 'medium', 5.0),
  ('video_premium', 'Видео - Премиум', 'video', 150, 7, 30, 'premium', 10.0),
  
  ('news_basic', 'Новость - Базовый', 'news', 20, 1, 14, 'basic', 2.0),
  ('playlist_basic', 'Плейлист - Базовый', 'playlist', 25, 1, 30, 'basic', 2.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ТАБЛИЦА: withdrawal_requests (запросы на вывод средств)
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  withdrawal_method TEXT NOT NULL CHECK (withdrawal_method IN ('card', 'bank_account', 'yoomoney', 'paypal', 'other')),
  
  -- Payment details (encrypted in production)
  payment_details JSONB NOT NULL,
  
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES artists(id),
  
  rejection_reason TEXT,
  admin_comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_artist_id ON withdrawal_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_created_at ON withdrawal_requests(created_at DESC);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coin_packages_updated_at ON coin_packages;
CREATE TRIGGER update_coin_packages_updated_at BEFORE UPDATE ON coin_packages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coin_purchases_updated_at ON coin_purchases;
CREATE TRIGGER update_coin_purchases_updated_at BEFORE UPDATE ON coin_purchases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotion_prices_updated_at ON promotion_prices;
CREATE TRIGGER update_promotion_prices_updated_at BEFORE UPDATE ON promotion_prices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_updated_at BEFORE UPDATE ON withdrawal_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Добавить коины артисту
CREATE OR REPLACE FUNCTION add_coins_to_artist(
  artist_uuid UUID,
  coins_to_add INTEGER,
  trans_type TEXT,
  trans_description TEXT DEFAULT NULL,
  purchase_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Получаем текущий баланс
  SELECT coins_balance INTO current_balance FROM artists WHERE id = artist_uuid;
  
  -- Вычисляем новый баланс
  new_balance := current_balance + coins_to_add;
  
  -- Обновляем баланс артиста
  UPDATE artists 
  SET 
    coins_balance = new_balance,
    total_coins_earned = total_coins_earned + CASE WHEN coins_to_add > 0 THEN coins_to_add ELSE 0 END
  WHERE id = artist_uuid;
  
  -- Создаём транзакцию
  INSERT INTO coin_transactions (
    artist_id, transaction_type, amount, 
    balance_before, balance_after, description, coin_purchase_id
  ) VALUES (
    artist_uuid, trans_type, coins_to_add, 
    current_balance, new_balance, trans_description, purchase_id
  );
END;
$$ LANGUAGE plpgsql;

-- Списать коины с артиста
CREATE OR REPLACE FUNCTION spend_coins_from_artist(
  artist_uuid UUID,
  coins_to_spend INTEGER,
  trans_description TEXT,
  related_entity_type TEXT DEFAULT NULL,
  related_entity_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Получаем текущий баланс
  SELECT coins_balance INTO current_balance FROM artists WHERE id = artist_uuid;
  
  -- Проверяем достаточно ли коинов
  IF current_balance < coins_to_spend THEN
    RETURN false;
  END IF;
  
  -- Вычисляем новый баланс
  new_balance := current_balance - coins_to_spend;
  
  -- Обновляем баланс артиста
  UPDATE artists 
  SET 
    coins_balance = new_balance,
    total_coins_spent = total_coins_spent + coins_to_spend
  WHERE id = artist_uuid;
  
  -- Создаём транзакцию
  INSERT INTO coin_transactions (
    artist_id, transaction_type, amount, 
    balance_before, balance_after, description,
    related_type, related_id
  ) VALUES (
    artist_uuid, 'spent', -coins_to_spend, 
    current_balance, new_balance, trans_description,
    related_entity_type, related_entity_id
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Завершить покупку коинов
CREATE OR REPLACE FUNCTION complete_coin_purchase(purchase_uuid UUID)
RETURNS void AS $$
DECLARE
  purchase_record RECORD;
BEGIN
  -- Получаем данные покупки
  SELECT * INTO purchase_record FROM coin_purchases WHERE id = purchase_uuid;
  
  IF purchase_record.status != 'pending' THEN
    RAISE EXCEPTION 'Purchase is not pending';
  END IF;
  
  -- Обновляем статус покупки
  UPDATE coin_purchases 
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = purchase_uuid;
  
  -- Добавляем коины артисту
  PERFORM add_coins_to_artist(
    purchase_record.artist_id,
    purchase_record.total_coins,
    'purchase',
    format('Покупка пакета "%s"', purchase_record.package_id),
    purchase_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Завершить донат
CREATE OR REPLACE FUNCTION complete_donation(donation_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE donations 
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = donation_uuid AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Рассчитать стоимость продвижения
CREATE OR REPLACE FUNCTION calculate_promotion_cost(
  item_type TEXT,
  boost_level TEXT,
  days_count INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  price_per_day INTEGER;
BEGIN
  SELECT coins_per_day INTO price_per_day
  FROM promotion_prices
  WHERE 
    promotion_prices.item_type = calculate_promotion_cost.item_type
    AND promotion_prices.boost_level = calculate_promotion_cost.boost_level
    AND is_active = true
  LIMIT 1;
  
  IF price_per_day IS NULL THEN
    RAISE EXCEPTION 'Promotion price not found for type=% level=%', item_type, boost_level;
  END IF;
  
  RETURN price_per_day * days_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- DONATIONS POLICIES
DROP POLICY IF EXISTS "Artists can view own donations" ON donations;
CREATE POLICY "Artists can view own donations" ON donations FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view public donations" ON donations;
CREATE POLICY "Public can view public donations" ON donations FOR SELECT 
  USING (is_public = true AND status = 'completed');

DROP POLICY IF EXISTS "Anyone can create donations" ON donations;
CREATE POLICY "Anyone can create donations" ON donations FOR INSERT 
  WITH CHECK (true);

-- COIN PACKAGES POLICIES
DROP POLICY IF EXISTS "Everyone can view active packages" ON coin_packages;
CREATE POLICY "Everyone can view active packages" ON coin_packages FOR SELECT 
  USING (is_active = true);

-- COIN PURCHASES POLICIES
DROP POLICY IF EXISTS "Artists can view own purchases" ON coin_purchases;
CREATE POLICY "Artists can view own purchases" ON coin_purchases FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create purchases" ON coin_purchases;
CREATE POLICY "Artists can create purchases" ON coin_purchases FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

-- COIN TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Artists can view own transactions" ON coin_transactions;
CREATE POLICY "Artists can view own transactions" ON coin_transactions FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

-- PROMOTION PRICES POLICIES
DROP POLICY IF EXISTS "Everyone can view active prices" ON promotion_prices;
CREATE POLICY "Everyone can view active prices" ON promotion_prices FOR SELECT 
  USING (is_active = true);

-- WITHDRAWAL REQUESTS POLICIES
DROP POLICY IF EXISTS "Artists can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Artists can view own withdrawals" ON withdrawal_requests FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create withdrawals" ON withdrawal_requests;
CREATE POLICY "Artists can create withdrawals" ON withdrawal_requests FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can cancel own withdrawals" ON withdrawal_requests;
CREATE POLICY "Artists can cancel own withdrawals" ON withdrawal_requests FOR UPDATE 
  USING (artist_id::text = auth.uid()::text AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- 6 новых таблиц: donations, coin_packages, coin_purchases, coin_transactions, promotion_prices, withdrawal_requests
-- 5 пакетов коинов предустановлено
-- 11 тарифов продвижения предустановлено
-- 6 функций: add_coins, spend_coins, complete_purchase, complete_donation, calculate_cost
-- 12+ RLS политик
-- 10+ индексов
-- Полная система донатов и коинов
-- ============================================
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
-- Create tour_dates table for managing concerts and performances
CREATE TABLE IF NOT EXISTS tour_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tour and event details
  tour_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Venue information
  venue_name TEXT NOT NULL,
  venue_id UUID, -- Optional venue reference (no FK constraint)
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Россия',
  
  -- Date and time
  date DATE NOT NULL,
  doors_open TIME,
  show_start TIME NOT NULL,
  
  -- Ticketing
  ticket_url TEXT,
  ticket_price_min NUMERIC(10, 2),
  ticket_price_max NUMERIC(10, 2),
  venue_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Event type and status
  event_type TEXT NOT NULL DEFAULT 'Концерт',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'announced', 'on_sale', 'sold_out', 'cancelled', 'postponed', 'completed')),
  
  -- Moderation (if needed)
  moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Media
  banner_url TEXT,
  photos TEXT[], -- Array of photo URLs
  
  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT tour_dates_date_check CHECK (date >= CURRENT_DATE OR status = 'completed')
);

-- Create artist_profiles table extension for performance history
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  
  -- Location
  city TEXT,
  country TEXT DEFAULT 'Россия',
  studio_address TEXT,
  
  -- Social links
  social_links JSONB DEFAULT '{}',
  streaming_links JSONB DEFAULT '{}',
  
  -- Genres and influences
  genres TEXT[],
  influences TEXT[],
  
  -- EPK and riders
  epk_url TEXT,
  tech_rider_url TEXT,
  hospitality_rider_url TEXT,
  
  -- Performance history (array of past performances)
  performance_history JSONB DEFAULT '[]',
  -- Structure: [{ event_name, venue_name, city, date, audience_size, type, description, photos }]
  
  -- Calendars
  release_calendar JSONB DEFAULT '[]',
  events_calendar JSONB DEFAULT '[]',
  
  -- Stats
  total_streams INTEGER DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  total_fans INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tour_dates_artist_id ON tour_dates(artist_id);
CREATE INDEX IF NOT EXISTS idx_tour_dates_date ON tour_dates(date);
CREATE INDEX IF NOT EXISTS idx_tour_dates_status ON tour_dates(status);
CREATE INDEX IF NOT EXISTS idx_tour_dates_moderation ON tour_dates(moderation_status);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tour_dates
CREATE TRIGGER update_tour_dates_updated_at
  BEFORE UPDATE ON tour_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to artist_profiles
CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tour_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_dates
-- Artists can view their own concerts
CREATE POLICY "Artists can view own tour dates"
  ON tour_dates FOR SELECT
  USING (artist_id = auth.uid());

-- Artists can insert their own concerts
CREATE POLICY "Artists can insert own tour dates"
  ON tour_dates FOR INSERT
  WITH CHECK (artist_id = auth.uid());

-- Artists can update their own concerts
CREATE POLICY "Artists can update own tour dates"
  ON tour_dates FOR UPDATE
  USING (artist_id = auth.uid());

-- Artists can delete their own concerts
CREATE POLICY "Artists can delete own tour dates"
  ON tour_dates FOR DELETE
  USING (artist_id = auth.uid());

-- Public can view approved concerts
CREATE POLICY "Public can view approved tour dates"
  ON tour_dates FOR SELECT
  USING (moderation_status = 'approved' AND status NOT IN ('draft', 'cancelled'));

-- RLS Policies for artist_profiles
-- Artists can view their own profile
CREATE POLICY "Artists can view own profile"
  ON artist_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Artists can update their own profile
CREATE POLICY "Artists can update own profile"
  ON artist_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Public can view all profiles (for discovery)
CREATE POLICY "Public can view profiles"
  ON artist_profiles FOR SELECT
  USING (true);

-- Insert initial artist profile on user signup (via trigger or function)
CREATE OR REPLACE FUNCTION create_artist_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO artist_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Артист'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_artist_profile_on_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON tour_dates TO authenticated;
GRANT ALL ON artist_profiles TO authenticated;
GRANT SELECT ON tour_dates TO anon;
GRANT SELECT ON artist_profiles TO anon;
/**
 * BANNER ADS TABLES - БАННЕРНАЯ РЕКЛАМА
 * Дата создания: 27 января 2026
 * 
 * Структура:
 * 1. banner_ads - основная таблица баннерных кампаний
 * 2. banner_events - события баннеров (показы, клики)
 * 3. banner_analytics_daily - дневная аналитика
 */

-- ============================================================================
-- 1. BANNER ADS - БАННЕРНЫЕ КАМПАНИИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS banner_ads (
  -- Identity
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Campaign info
  campaign_name TEXT NOT NULL,
  banner_type TEXT NOT NULL CHECK (banner_type IN ('top_banner', 'sidebar_large', 'sidebar_small')),
  dimensions TEXT NOT NULL, -- '1920x400', '300x600', '300x250'
  
  -- Media
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  
  -- Pricing
  price INTEGER NOT NULL, -- В рублях
  duration_days INTEGER NOT NULL CHECK (duration_days >= 1 AND duration_days <= 90),
  
  -- Schedule
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending_moderation' CHECK (
    status IN (
      'pending_moderation',  -- На модерации
      'payment_pending',     -- Ожидает оплаты
      'approved',            -- Одобрено
      'active',              -- Активно
      'expired',             -- Завершено
      'rejected',            -- Отклонено
      'cancelled'            -- Отменено
    )
  ),
  
  -- Moderation
  rejection_reason TEXT,
  admin_notes TEXT,
  moderated_by TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics (real-time counters)
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_banner_ads_user_id ON banner_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_ads_status ON banner_ads(status);
CREATE INDEX IF NOT EXISTS idx_banner_ads_dates ON banner_ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banner_ads_created ON banner_ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_ads_type ON banner_ads(banner_type);

-- Комментарии
COMMENT ON TABLE banner_ads IS 'Баннерные рекламные кампании';
COMMENT ON COLUMN banner_ads.banner_type IS 'Тип баннера: top_banner (1920×400), sidebar_large (300×600), sidebar_small (300×250)';
COMMENT ON COLUMN banner_ads.status IS 'Статус баннера в жизненном цикле';
COMMENT ON COLUMN banner_ads.views IS 'Счётчик показов (real-time)';
COMMENT ON COLUMN banner_ads.clicks IS 'Счётчик кликов (real-time)';

-- ============================================================================
-- 2. BANNER EVENTS - СОБЫТИЯ БАННЕРОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS banner_events (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  banner_id TEXT NOT NULL REFERENCES banner_ads(id) ON DELETE CASCADE,
  
  -- Event info
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  
  -- Context
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  session_id TEXT,
  
  -- Location (optional)
  country TEXT,
  city TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для аналитики
CREATE INDEX IF NOT EXISTS idx_banner_events_banner_id ON banner_events(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_events_type ON banner_events(event_type);
CREATE INDEX IF NOT EXISTS idx_banner_events_created ON banner_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_events_session ON banner_events(session_id);

-- Комментарии
COMMENT ON TABLE banner_events IS 'События баннеров (показы и клики) для детальной аналитики';
COMMENT ON COLUMN banner_events.event_type IS 'Тип события: view (показ) или click (клик)';

-- ============================================================================
-- 3. BANNER ANALYTICS DAILY - ДНЕВНАЯ АНАЛИТИКА
-- ============================================================================

CREATE TABLE IF NOT EXISTS banner_analytics_daily (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  banner_id TEXT NOT NULL REFERENCES banner_ads(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  
  -- Derived metrics
  ctr DECIMAL(5, 2), -- Click-through rate (%)
  cost_per_click DECIMAL(10, 2), -- Стоимость клика
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(banner_id, date)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner_id ON banner_analytics_daily(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_date ON banner_analytics_daily(date DESC);

-- Комментарии
COMMENT ON TABLE banner_analytics_daily IS 'Агрегированная дневная статистика баннеров';
COMMENT ON COLUMN banner_analytics_daily.ctr IS 'Click-through rate = (clicks / views) * 100';
COMMENT ON COLUMN banner_analytics_daily.cost_per_click IS 'Стоимость одного клика';

-- ============================================================================
-- 4. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at при изменении записи
CREATE OR REPLACE FUNCTION update_banner_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_banner_ads_updated_at ON banner_ads;
CREATE TRIGGER trigger_update_banner_ads_updated_at
  BEFORE UPDATE ON banner_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_ads_updated_at();

-- Функция: Автоматическое истечение баннеров
CREATE OR REPLACE FUNCTION expire_banner_ads()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Обновляем статус активных баннеров, у которых истёк срок
  UPDATE banner_ads
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_banner_ads IS 'Автоматически переводит активные баннеры в статус expired при истечении срока';

-- Функция: Расчёт CTR для дневной аналитики
CREATE OR REPLACE FUNCTION calculate_banner_ctr()
RETURNS TRIGGER AS $$
BEGIN
  -- Рассчитываем CTR автоматически
  IF NEW.views > 0 THEN
    NEW.ctr = (NEW.clicks::DECIMAL / NEW.views::DECIMAL) * 100;
  ELSE
    NEW.ctr = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического расчёта CTR
DROP TRIGGER IF EXISTS trigger_calculate_banner_ctr ON banner_analytics_daily;
CREATE TRIGGER trigger_calculate_banner_ctr
  BEFORE INSERT OR UPDATE ON banner_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION calculate_banner_ctr();

-- ============================================================================
-- 5. VIEWS - ПРЕДСТАВЛЕНИЯ ДЛЯ АНАЛИТИКИ
-- ============================================================================

-- View: Статистика баннеров с рассчитанными метриками
CREATE OR REPLACE VIEW banner_ads_with_stats AS
SELECT 
  ba.*,
  -- Рассчитанные метрики
  CASE 
    WHEN ba.views > 0 THEN ROUND((ba.clicks::DECIMAL / ba.views::DECIMAL) * 100, 2)
    ELSE 0
  END as ctr,
  CASE 
    WHEN ba.clicks > 0 THEN ROUND(ba.price::DECIMAL / ba.clicks::DECIMAL, 2)
    ELSE 0
  END as cost_per_click,
  ROUND(ba.price::DECIMAL / ba.duration_days::DECIMAL, 2) as cost_per_day,
  
  -- Статус дат
  CASE 
    WHEN ba.status = 'active' AND ba.end_date > NOW() THEN 
      EXTRACT(DAY FROM (ba.end_date - NOW()))
    ELSE 0
  END as days_remaining,
  
  CASE 
    WHEN ba.status = 'active' THEN
      EXTRACT(DAY FROM (NOW() - ba.start_date))
    ELSE 0
  END as days_running

FROM banner_ads ba;

COMMENT ON VIEW banner_ads_with_stats IS 'Баннеры с рассчитанными метриками (CTR, CPC, etc)';

-- View: Топ баннеры по эффективности
CREATE OR REPLACE VIEW banner_ads_top_performers AS
SELECT 
  ba.id,
  ba.user_id,
  ba.campaign_name,
  ba.banner_type,
  ba.status,
  ba.views,
  ba.clicks,
  CASE 
    WHEN ba.views > 0 THEN ROUND((ba.clicks::DECIMAL / ba.views::DECIMAL) * 100, 2)
    ELSE 0
  END as ctr,
  CASE 
    WHEN ba.clicks > 0 THEN ROUND(ba.price::DECIMAL / ba.clicks::DECIMAL, 2)
    ELSE 0
  END as cost_per_click,
  ba.created_at
FROM banner_ads ba
WHERE ba.status IN ('active', 'expired')
  AND ba.views > 100 -- Минимум 100 показов для статистики
ORDER BY 
  CASE 
    WHEN ba.views > 0 THEN (ba.clicks::DECIMAL / ba.views::DECIMAL)
    ELSE 0
  END DESC;

COMMENT ON VIEW banner_ads_top_performers IS 'Топ баннеров по CTR (минимум 100 показов)';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Включаем RLS
ALTER TABLE banner_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователь видит только свои баннеры
CREATE POLICY banner_ads_user_select ON banner_ads
  FOR SELECT
  USING (user_id = auth.uid()::TEXT);

-- Политика: Пользователь может создавать свои баннеры
CREATE POLICY banner_ads_user_insert ON banner_ads
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Политика: Пользователь может обновлять свои баннеры (но не статус)
CREATE POLICY banner_ads_user_update ON banner_ads
  FOR UPDATE
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (
    user_id = auth.uid()::TEXT 
    AND status = OLD.status -- Нельзя менять статус
  );

-- Политика: Админы видят все баннеры
CREATE POLICY banner_ads_admin_all ON banner_ads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Политика: События баннеров - только владелец
CREATE POLICY banner_events_user_select ON banner_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM banner_ads
      WHERE banner_ads.id = banner_events.banner_id
      AND banner_ads.user_id = auth.uid()::TEXT
    )
  );

-- Политика: Аналитика - только владелец
CREATE POLICY banner_analytics_user_select ON banner_analytics_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM banner_ads
      WHERE banner_ads.id = banner_analytics_daily.banner_id
      AND banner_ads.user_id = auth.uid()::TEXT
    )
  );

-- ============================================================================
-- 7. НАЧАЛЬНЫЕ ДАННЫЕ (для тестирования)
-- ============================================================================

-- Примечание: В production эти данные не нужны
-- Раскомментируйте для локального тестирования

/*
INSERT INTO banner_ads (
  id, user_id, user_email, campaign_name, banner_type, dimensions,
  image_url, target_url, price, duration_days, status, views, clicks
) VALUES
  (
    'banner_demo_001',
    'artist_demo_001',
    'artist@promo.fm',
    'Новый альбом "Звёздная пыль"',
    'top_banner',
    '1920x400',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=400&fit=crop',
    '/artist/profile',
    210000,
    14,
    'active',
    145230,
    3254
  )
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================================

-- Успешное завершение
DO $$
BEGIN
  RAISE NOTICE '✅ Banner Ads tables created successfully';
  RAISE NOTICE '📊 Tables: banner_ads, banner_events, banner_analytics_daily';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers and functions ready';
END $$;
-- ========================================
-- PAYMENTS SYSTEM - ПОЛНАЯ МИГРАЦИЯ
-- Создано: 27 января 2026
-- Назначение: Система платежей для promo.music
-- ========================================

-- Создание enum типов
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'withdraw');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_category AS ENUM (
    'donate',
    'concert', 
    'radio',
    'streaming',
    'ticket_sales',
    'venue_royalties',
    'marketing',
    'coins',
    'subscription',
    'pitching',
    'banner',
    'withdraw'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('completed', 'processing', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('card', 'yoomoney', 'bank_transfer', 'crypto', 'auto');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE withdraw_status AS ENUM ('pending', 'processing', 'completed', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- ТАБЛИЦА: transactions
-- Все транзакции пользователя
-- ========================================
CREATE TABLE IF NOT EXISTS make_transactions_84730125 (
  id TEXT PRIMARY KEY DEFAULT 'TRX-' || to_char(now(), 'YYYY-MMDD-') || lpad(nextval('make_transactions_seq_84730125')::text, 4, '0'),
  user_id TEXT NOT NULL,
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  
  -- Финансовые данные
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  fee DECIMAL(10, 2) DEFAULT 0 CHECK (fee >= 0),
  net_amount DECIMAL(10, 2) NOT NULL CHECK (net_amount >= 0),
  
  -- Участники транзакции
  from_name TEXT,
  from_email TEXT,
  to_name TEXT,
  to_email TEXT,
  
  -- Детали платежа
  description TEXT NOT NULL,
  message TEXT,
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  
  -- Временные метки
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_time TIME NOT NULL DEFAULT CURRENT_TIME,
  status transaction_status DEFAULT 'processing',
  
  -- Дополнительные данные (JSONB для гибкости)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Специфичные поля для билетов
  tickets_sold INTEGER,
  ticket_price DECIMAL(10, 2),
  event_name TEXT,
  event_date DATE,
  venue TEXT,
  
  -- Специфичные поля для заведений
  tracks JSONB,
  plays_count INTEGER,
  venues JSONB,
  venues_count INTEGER,
  period TEXT,
  
  -- Специфичные поля для коинов
  coins_amount INTEGER,
  coins_spent INTEGER,
  
  -- Специфичные поля для подписки
  subscription_period TEXT,
  next_billing DATE,
  
  -- Чек
  receipt_url TEXT,
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание последовательности для ID
CREATE SEQUENCE IF NOT EXISTS make_transactions_seq_84730125 START 1;

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON make_transactions_84730125(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON make_transactions_84730125(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON make_transactions_84730125(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON make_transactions_84730125(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON make_transactions_84730125(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON make_transactions_84730125(created_at DESC);

-- Полнотекстовый поиск
CREATE INDEX IF NOT EXISTS idx_transactions_search ON make_transactions_84730125 
  USING gin(to_tsvector('russian', coalesce(description, '') || ' ' || coalesce(from_name, '') || ' ' || coalesce(to_name, '')));

-- ========================================
-- ТАБЛИЦА: payment_methods
-- Привязанные карты и методы оплаты
-- ========================================
CREATE TABLE IF NOT EXISTS make_payment_methods_84730125 (
  id TEXT PRIMARY KEY DEFAULT 'PM-' || to_char(now(), 'YYYYMMDD-') || lpad(nextval('make_payment_methods_seq_84730125')::text, 4, '0'),
  user_id TEXT NOT NULL,
  
  type payment_method_type NOT NULL,
  
  -- Данные карты (зашифрованы)
  card_number_masked TEXT, -- Например: "4532 **** **** 1234"
  card_holder TEXT,
  card_expires TEXT, -- Формат: "MM/YY"
  card_brand TEXT, -- visa, mastercard, mir
  
  -- Другие методы
  yoomoney_wallet TEXT,
  bank_account_masked TEXT,
  crypto_address TEXT,
  
  -- Статус
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Создание последовательности
CREATE SEQUENCE IF NOT EXISTS make_payment_methods_seq_84730125 START 1;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON make_payment_methods_84730125(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON make_payment_methods_84730125(is_default) WHERE is_default = true;

-- Ограничение: только одна карта по умолчанию на пользователя
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_per_user ON make_payment_methods_84730125(user_id) WHERE is_default = true;

-- ========================================
-- ТАБЛИЦА: withdraw_requests
-- Заявки на вывод средств
-- ========================================
CREATE TABLE IF NOT EXISTS make_withdraw_requests_84730125 (
  id TEXT PRIMARY KEY DEFAULT 'WD-' || to_char(now(), 'YYYYMMDD-') || lpad(nextval('make_withdraw_requests_seq_84730125')::text, 4, '0'),
  user_id TEXT NOT NULL,
  
  -- Финансовые данные
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 1000),
  fee DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  
  -- Метод вывода
  payment_method_id TEXT REFERENCES make_payment_methods_84730125(id),
  payment_method_details JSONB,
  
  -- Статус
  status withdraw_status DEFAULT 'pending',
  status_message TEXT,
  
  -- Временные метки
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Связанная транзакция
  transaction_id TEXT REFERENCES make_transactions_84730125(id),
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание последовательности
CREATE SEQUENCE IF NOT EXISTS make_withdraw_requests_seq_84730125 START 1;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id ON make_withdraw_requests_84730125(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON make_withdraw_requests_84730125(status);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_created ON make_withdraw_requests_84730125(created_at DESC);

-- ========================================
-- ТАБЛИЦА: user_balances
-- Балансы пользователей
-- ========================================
CREATE TABLE IF NOT EXISTS make_user_balances_84730125 (
  user_id TEXT PRIMARY KEY,
  
  -- Балансы
  balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0),
  available_balance DECIMAL(10, 2) DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance DECIMAL(10, 2) DEFAULT 0 CHECK (pending_balance >= 0),
  total_income DECIMAL(10, 2) DEFAULT 0 CHECK (total_income >= 0),
  total_expense DECIMAL(10, 2) DEFAULT 0 CHECK (total_expense >= 0),
  total_withdrawn DECIMAL(10, 2) DEFAULT 0 CHECK (total_withdrawn >= 0),
  
  -- Статистика
  transactions_count INTEGER DEFAULT 0,
  last_transaction_at TIMESTAMPTZ,
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс
CREATE INDEX IF NOT EXISTS idx_user_balances_updated ON make_user_balances_84730125(updated_at DESC);

-- ========================================
-- ФУНКЦИЯ: Обновление баланса при транзакции
-- ========================================
CREATE OR REPLACE FUNCTION update_user_balance_84730125()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаём запись баланса если её нет
  INSERT INTO make_user_balances_84730125 (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Обновляем баланс в зависимости от типа транзакции
  IF NEW.status = 'completed' THEN
    CASE NEW.type
      WHEN 'income' THEN
        UPDATE make_user_balances_84730125
        SET 
          balance = balance + NEW.net_amount,
          available_balance = available_balance + NEW.net_amount,
          total_income = total_income + NEW.net_amount,
          transactions_count = transactions_count + 1,
          last_transaction_at = NOW(),
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'expense' THEN
        UPDATE make_user_balances_84730125
        SET 
          balance = balance - NEW.amount,
          available_balance = available_balance - NEW.amount,
          total_expense = total_expense + NEW.amount,
          transactions_count = transactions_count + 1,
          last_transaction_at = NOW(),
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'withdraw' THEN
        UPDATE make_user_balances_84730125
        SET 
          balance = balance - NEW.amount,
          available_balance = available_balance - NEW.amount,
          total_withdrawn = total_withdrawn + NEW.net_amount,
          transactions_count = transactions_count + 1,
          last_transaction_at = NOW(),
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления баланса
DROP TRIGGER IF EXISTS trigger_update_user_balance ON make_transactions_84730125;
CREATE TRIGGER trigger_update_user_balance
  AFTER INSERT OR UPDATE OF status ON make_transactions_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance_84730125();

-- ========================================
-- ФУНКЦИЯ: Автообновление updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_84730125()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для всех таблиц
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON make_transactions_84730125;
CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON make_transactions_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON make_payment_methods_84730125;
CREATE TRIGGER trigger_payment_methods_updated_at
  BEFORE UPDATE ON make_payment_methods_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

DROP TRIGGER IF EXISTS trigger_withdraw_requests_updated_at ON make_withdraw_requests_84730125;
CREATE TRIGGER trigger_withdraw_requests_updated_at
  BEFORE UPDATE ON make_withdraw_requests_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

DROP TRIGGER IF EXISTS trigger_user_balances_updated_at ON make_user_balances_84730125;
CREATE TRIGGER trigger_user_balances_updated_at
  BEFORE UPDATE ON make_user_balances_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

-- ========================================
-- ФУНКЦИЯ: Создание транзакции
-- ========================================
CREATE OR REPLACE FUNCTION create_transaction_84730125(
  p_user_id TEXT,
  p_type transaction_type,
  p_category transaction_category,
  p_amount DECIMAL,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_fee DECIMAL;
  v_net_amount DECIMAL;
BEGIN
  -- Расчёт комиссии (можно настроить по категориям)
  CASE p_category
    WHEN 'donate' THEN
      v_fee := p_amount * 0.03; -- 3%
    WHEN 'ticket_sales' THEN
      v_fee := p_amount * 0.20; -- 20%
    WHEN 'venue_royalties' THEN
      v_fee := p_amount * 0.10; -- 10%
    WHEN 'concert' THEN
      v_fee := p_amount * 0.05; -- 5%
    WHEN 'radio' THEN
      v_fee := p_amount * 0.10; -- 10%
    WHEN 'streaming' THEN
      v_fee := p_amount * 0.15; -- 15%
    ELSE
      v_fee := 0;
  END CASE;
  
  v_net_amount := p_amount - v_fee;
  
  -- Создание транзакции
  INSERT INTO make_transactions_84730125 (
    user_id,
    type,
    category,
    amount,
    fee,
    net_amount,
    description,
    status,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_category,
    p_amount,
    v_fee,
    v_net_amount,
    p_description,
    'completed',
    p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ФУНКЦИЯ: Создание заявки на вывод
-- ========================================
CREATE OR REPLACE FUNCTION create_withdraw_request_84730125(
  p_user_id TEXT,
  p_amount DECIMAL,
  p_payment_method_id TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_request_id TEXT;
  v_fee DECIMAL;
  v_net_amount DECIMAL;
  v_available_balance DECIMAL;
BEGIN
  -- Проверка баланса
  SELECT available_balance INTO v_available_balance
  FROM make_user_balances_84730125
  WHERE user_id = p_user_id;
  
  IF v_available_balance IS NULL THEN
    RAISE EXCEPTION 'Пользователь не найден';
  END IF;
  
  IF p_amount > v_available_balance THEN
    RAISE EXCEPTION 'Недостаточно средств. Доступно: %', v_available_balance;
  END IF;
  
  IF p_amount < 1000 THEN
    RAISE EXCEPTION 'Минимальная сумма вывода: 1000 ₽';
  END IF;
  
  -- Расчёт комиссии (2.5%)
  v_fee := p_amount * 0.025;
  v_net_amount := p_amount - v_fee;
  
  -- Создание заявки
  INSERT INTO make_withdraw_requests_84730125 (
    user_id,
    amount,
    fee,
    net_amount,
    payment_method_id,
    status
  ) VALUES (
    p_user_id,
    p_amount,
    v_fee,
    v_net_amount,
    p_payment_method_id,
    'pending'
  )
  RETURNING id INTO v_request_id;
  
  -- Резервирование средств
  UPDATE make_user_balances_84730125
  SET 
    available_balance = available_balance - p_amount,
    pending_balance = pending_balance + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ФУНКЦИЯ: Получение статистики пользователя
-- ========================================
CREATE OR REPLACE FUNCTION get_user_stats_84730125(p_user_id TEXT)
RETURNS TABLE (
  balance DECIMAL,
  total_income DECIMAL,
  total_expense DECIMAL,
  month_income DECIMAL,
  month_expense DECIMAL,
  transactions_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ub.balance,
    ub.total_income,
    ub.total_expense,
    COALESCE(SUM(t.net_amount) FILTER (WHERE t.type = 'income' AND t.transaction_date >= date_trunc('month', CURRENT_DATE)), 0) as month_income,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense' AND t.transaction_date >= date_trunc('month', CURRENT_DATE)), 0) as month_expense,
    ub.transactions_count
  FROM make_user_balances_84730125 ub
  LEFT JOIN make_transactions_84730125 t ON t.user_id = ub.user_id
  WHERE ub.user_id = p_user_id
  GROUP BY ub.user_id, ub.balance, ub.total_income, ub.total_expense, ub.transactions_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- RLS (Row Level Security) ПОЛИТИКИ
-- ========================================

-- Включаем RLS для всех таблиц
ALTER TABLE make_transactions_84730125 ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_payment_methods_84730125 ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_withdraw_requests_84730125 ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_user_balances_84730125 ENABLE ROW LEVEL SECURITY;

-- Политики для транзакций
CREATE POLICY transactions_select_own ON make_transactions_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY transactions_insert_own ON make_transactions_84730125
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Политики для методов оплаты
CREATE POLICY payment_methods_select_own ON make_payment_methods_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY payment_methods_insert_own ON make_payment_methods_84730125
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY payment_methods_update_own ON make_payment_methods_84730125
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY payment_methods_delete_own ON make_payment_methods_84730125
  FOR DELETE USING (user_id = current_setting('app.current_user_id', TRUE));

-- Политики для заявок на вывод
CREATE POLICY withdraw_requests_select_own ON make_withdraw_requests_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY withdraw_requests_insert_own ON make_withdraw_requests_84730125
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Политики для балансов
CREATE POLICY user_balances_select_own ON make_user_balances_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

-- ========================================
-- ВСТАВКА ДЕМО ДАННЫХ
-- ========================================

-- Демо баланс
INSERT INTO make_user_balances_84730125 (user_id, balance, available_balance, total_income, total_expense)
VALUES ('artist_demo_001', 125430, 115430, 116750, 10490)
ON CONFLICT (user_id) DO NOTHING;

-- Демо метод оплаты
INSERT INTO make_payment_methods_84730125 (user_id, type, card_number_masked, card_holder, card_expires, card_brand, is_default, is_verified)
VALUES 
  ('artist_demo_001', 'card', '4532 **** **** 1234', 'IVAN PETROV', '12/27', 'visa', true, true),
  ('artist_demo_001', 'card', '5421 **** **** 5678', 'IVAN PETROV', '06/28', 'mastercard', false, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ========================================

COMMENT ON TABLE make_transactions_84730125 IS 'Все транзакции пользователей (доходы, расходы, выводы)';
COMMENT ON TABLE make_payment_methods_84730125 IS 'Привязанные методы оплаты пользователей';
COMMENT ON TABLE make_withdraw_requests_84730125 IS 'Заявки на вывод средств';
COMMENT ON TABLE make_user_balances_84730125 IS 'Балансы и статистика пользователей';

COMMENT ON FUNCTION create_transaction_84730125 IS 'Создание новой транзакции с автоматическим расчётом комиссии';
COMMENT ON FUNCTION create_withdraw_request_84730125 IS 'Создание заявки на вывод средств с проверкой баланса';
COMMENT ON FUNCTION get_user_stats_84730125 IS 'Получение статистики пользователя';

-- ========================================
-- ЗАВЕРШЕНО
-- ========================================
