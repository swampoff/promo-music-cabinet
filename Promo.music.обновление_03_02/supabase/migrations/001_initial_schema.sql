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
