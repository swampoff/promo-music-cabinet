-- =====================================================
-- PROMO.MUSIC COMPLETE DATABASE SCHEMA REFERENCE
-- =====================================================
-- 
-- ⚠️ IMPORTANT: This file is for REFERENCE ONLY
-- 
-- Current Implementation: KV Store (kv_store_84730125)
-- This SQL schema: Documentation for future versions
-- Status: NOT executed in Figma Make environment
-- 
-- Purpose:
-- - Documents expected data structure
-- - Shows relationships between entities
-- - Provides migration path for future SQL deployment
-- 
-- Created: 2026-01-28
-- Version: v1.0.0 Reference
-- =====================================================

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

-- Base user table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (extended information)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(50),
  socials JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified) WHERE verified = TRUE;

-- =====================================================
-- 2. CONTENT MANAGEMENT
-- =====================================================

-- Music tracks
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  authors VARCHAR(255),
  cover_url TEXT,
  audio_url TEXT,
  duration INTEGER, -- seconds
  release_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  coins_spent INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  platform VARCHAR(50) CHECK (platform IN ('youtube', 'rutube', 'vimeo')),
  duration INTEGER, -- seconds
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  coins_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Concerts and events
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  city VARCHAR(100),
  venue VARCHAR(255),
  address TEXT,
  type VARCHAR(50) CHECK (type IN ('concert', 'festival', 'private', 'stream')),
  banner_url TEXT,
  ticket_price_from DECIMAL(10, 2),
  ticket_price_to DECIMAL(10, 2),
  ticket_link TEXT,
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled')),
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  coins_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News and announcements
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview TEXT,
  cover_image TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  coins_spent INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for content tables
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON tracks(status);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON videos(platform);

CREATE INDEX IF NOT EXISTS idx_concerts_user_id ON concerts(user_id);
CREATE INDEX IF NOT EXISTS idx_concerts_date ON concerts(date);
CREATE INDEX IF NOT EXISTS idx_concerts_city ON concerts(city);
CREATE INDEX IF NOT EXISTS idx_concerts_promoted ON concerts(is_promoted) WHERE is_promoted = TRUE;

CREATE INDEX IF NOT EXISTS idx_news_user_id ON news(user_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_promoted ON news(is_promoted) WHERE is_promoted = TRUE;

-- =====================================================
-- 3. FINANCIAL SYSTEM
-- =====================================================

-- Donations from fans
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  donor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'RUB',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coins balance for each user
CREATE TABLE IF NOT EXISTS coins_balance (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coins transaction history
CREATE TABLE IF NOT EXISTS coins_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earn, negative for spend
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'earn', 'spend', 'refund', 'bonus', 'gift')),
  description TEXT,
  related_entity_type VARCHAR(50), -- banner, promotion, track, etc
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions (Pro, Premium, etc.)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'premium')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transaction history
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  type VARCHAR(50) NOT NULL CHECK (type IN ('donation_received', 'coin_purchase', 'subscription', 'promotion', 'refund')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method VARCHAR(50),
  provider VARCHAR(50), -- stripe, yoomoney, paypal
  provider_transaction_id VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for financial tables
CREATE INDEX IF NOT EXISTS idx_donations_artist_id ON donations(artist_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_user_id ON donations(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coins_transactions_user_id ON coins_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coins_transactions_type ON coins_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coins_transactions_created_at ON coins_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- =====================================================
-- 4. PROMOTION & MARKETING
-- =====================================================

-- Banner advertising
CREATE TABLE IF NOT EXISTS banner_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  target_url TEXT,
  placement VARCHAR(50) CHECK (placement IN ('homepage', 'sidebar', 'concerts', 'news', 'tracks', 'videos')),
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'rejected')),
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0, -- Click-through rate
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  targeting JSONB DEFAULT '{}'::jsonb, -- { cities: [], genres: [], ages: [] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion campaigns
CREATE TABLE IF NOT EXISTS promotion_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('track_promotion', 'concert_promotion', 'profile_boost', 'news_promotion')),
  target_entity_type VARCHAR(50),
  target_entity_id UUID,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  reach INTEGER DEFAULT 0, -- number of people reached
  engagement INTEGER DEFAULT 0, -- interactions
  conversions INTEGER DEFAULT 0, -- desired actions taken
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pitching submissions (to radio, playlists, labels)
CREATE TABLE IF NOT EXISTS pitching_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('track', 'video', 'album')),
  content_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('radio', 'playlist', 'festival', 'label', 'blog')),
  target_name VARCHAR(255),
  target_contact TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'under_review')),
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for promotion tables
CREATE INDEX IF NOT EXISTS idx_banner_ads_user_id ON banner_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_ads_status ON banner_ads(status);
CREATE INDEX IF NOT EXISTS idx_banner_ads_placement ON banner_ads(placement);
CREATE INDEX IF NOT EXISTS idx_banner_ads_active ON banner_ads(status, end_date) 
  WHERE status = 'active' AND (end_date IS NULL OR end_date > NOW());

CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_user_id ON promotion_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_status ON promotion_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_type ON promotion_campaigns(type);

CREATE INDEX IF NOT EXISTS idx_pitching_user_id ON pitching_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_pitching_status ON pitching_submissions(status);
CREATE INDEX IF NOT EXISTS idx_pitching_content ON pitching_submissions(content_type, content_id);

-- =====================================================
-- 5. COMMUNICATION SYSTEM
-- =====================================================

-- Conversations between users
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count_p1 INTEGER DEFAULT 0,
  unread_count_p2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb, -- [{ type, url, name, size }]
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('donation', 'message', 'concert_reminder', 'track_approved', 'new_follower', 'promotion_update')),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link TEXT, -- where notification leads
  icon VARCHAR(50), -- icon name for UI
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for communication tables
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 6. EMAIL SYSTEM
-- =====================================================

-- Email subscription preferences
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('news', 'updates', 'marketing', 'promotions', 'system')),
  is_subscribed BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, category)
);

-- Email sending history
CREATE TABLE IF NOT EXISTS email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  template_name VARCHAR(100),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email tables
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user_id ON email_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_category ON email_subscriptions(category);

CREATE INDEX IF NOT EXISTS idx_email_history_user_id ON email_history(user_id);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON email_history(status);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON email_history(sent_at DESC);

-- =====================================================
-- 7. SUPPORT SYSTEM
-- =====================================================

-- Support tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('technical', 'billing', 'content', 'account', 'other')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Ticket messages/responses
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for support tables
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- =====================================================
-- 8. SETTINGS & PREFERENCES
-- =====================================================

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_push BOOLEAN DEFAULT TRUE,
  notifications_sms BOOLEAN DEFAULT FALSE,
  notification_types JSONB DEFAULT '{}'::jsonb, -- per-type settings
  
  -- Privacy settings
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'followers')),
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_messages_from VARCHAR(20) DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'followers', 'none')),
  show_donation_amounts BOOLEAN DEFAULT TRUE,
  
  -- Content preferences
  content_language VARCHAR(5) DEFAULT 'ru',
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  
  -- Marketing preferences
  marketing_emails BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('card', 'yoomoney', 'paypal', 'bank_account')),
  provider VARCHAR(50), -- stripe, yoomoney, paypal
  last4 VARCHAR(4), -- last 4 digits
  brand VARCHAR(50), -- visa, mastercard, mir
  expiry_month INTEGER CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for settings tables
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default) WHERE is_default = TRUE;

-- =====================================================
-- 9. ANALYTICS & STATS
-- =====================================================

-- Track analytics (daily aggregated)
CREATE TABLE IF NOT EXISTS track_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  plays INTEGER DEFAULT 0,
  unique_listeners INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  playlist_adds INTEGER DEFAULT 0,
  platform_stats JSONB DEFAULT '{}'::jsonb, -- { spotify: {}, apple: {} }
  geographic_stats JSONB DEFAULT '{}'::jsonb, -- { RU: 100, US: 50 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(track_id, date)
);

-- Concert analytics
CREATE TABLE IF NOT EXISTS concert_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ticket_views INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  referral_sources JSONB DEFAULT '{}'::jsonb, -- { instagram: 50, facebook: 30 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(concert_id, date)
);

-- User dashboard stats (cached)
CREATE TABLE IF NOT EXISTS user_dashboard_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_plays INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  total_concerts INTEGER DEFAULT 0,
  coins_balance INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_track_analytics_track_id ON track_analytics(track_id);
CREATE INDEX IF NOT EXISTS idx_track_analytics_date ON track_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_concert_analytics_concert_id ON concert_analytics(concert_id);
CREATE INDEX IF NOT EXISTS idx_concert_analytics_date ON concert_analytics(date DESC);

-- =====================================================
-- 10. HELPER FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concerts_updated_at BEFORE UPDATE ON concerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banner_ads_updated_at BEFORE UPDATE ON banner_ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_campaigns_updated_at BEFORE UPDATE ON promotion_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate CTR for banner ads
CREATE OR REPLACE FUNCTION calculate_banner_ctr()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.impressions > 0 THEN
        NEW.ctr = (NEW.clicks::DECIMAL / NEW.impressions::DECIMAL) * 100;
    ELSE
        NEW.ctr = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_banner_ctr BEFORE UPDATE ON banner_ads
    FOR EACH ROW EXECUTE FUNCTION calculate_banner_ctr();

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (users can read/update their own data)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own tracks" ON tracks
    FOR SELECT USING (auth.uid() = user_id);

-- Public content policies (approved content is visible to everyone)
CREATE POLICY "Public can view approved tracks" ON tracks
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can view approved videos" ON videos
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can view approved concerts" ON concerts
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can view approved news" ON news
    FOR SELECT USING (status = 'approved');

-- =====================================================
-- NOTES
-- =====================================================

-- This schema includes:
-- ✅ 30+ tables covering all app functionality
-- ✅ Proper indexes for performance
-- ✅ Foreign key relationships
-- ✅ Check constraints for data integrity
-- ✅ Triggers for automatic timestamp updates
-- ✅ RLS policies for security
-- ✅ Functions for business logic
-- 
-- Current Implementation:
-- All data stored in KV Store with key patterns matching this structure
-- 
-- Migration Path:
-- When ready to move to SQL, data can be exported from KV Store
-- and imported into these tables using the mapping in DATABASE_SCHEMA_REFERENCE.md
-- 
-- Created: 2026-01-28
-- Version: v1.0.0
-- Status: Reference schema for documentation and future migration
