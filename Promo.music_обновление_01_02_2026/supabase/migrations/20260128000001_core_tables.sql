-- =====================================================
-- CORE TABLES - Основные таблицы системы
-- =====================================================

-- USERS - Расширенная таблица пользователей
CREATE TABLE IF NOT EXISTS users_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  
  -- Role and status
  role TEXT NOT NULL CHECK (role IN ('artist', 'dj', 'label', 'venue', 'radio', 'tv', 'media', 'blogger', 'producer', 'sound_engineer', 'expert', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  verified BOOLEAN DEFAULT false,
  
  -- Social links
  social_instagram TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_youtube TEXT,
  social_tiktok TEXT,
  social_vk TEXT,
  
  -- Stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  
  -- Financial
  balance DECIMAL(10,2) DEFAULT 0,
  coins_balance INTEGER DEFAULT 0,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  
  -- Metadata
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users_extended(role);
CREATE INDEX idx_users_status ON users_extended(status);
CREATE INDEX idx_users_email ON users_extended(email);
CREATE INDEX idx_users_username ON users_extended(username);

-- =====================================================
-- TRACKS - Треки
-- =====================================================
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  
  -- Track info
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  featuring TEXT,
  genre TEXT NOT NULL,
  subgenre TEXT,
  mood TEXT,
  language TEXT DEFAULT 'ru',
  
  -- Files
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  waveform_url TEXT,
  
  -- Duration and technical
  duration_seconds INTEGER NOT NULL,
  bpm INTEGER,
  key TEXT,
  
  -- Release info
  release_date DATE,
  label TEXT,
  isrc TEXT,
  upc TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published', 'archived')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users_extended(id),
  moderated_at TIMESTAMPTZ,
  
  -- Stats
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  
  -- Monetization
  is_monetized BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  
  -- Metadata
  lyrics TEXT,
  credits TEXT,
  tags TEXT[],
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracks_user ON tracks(user_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_created ON tracks(created_at DESC);

-- =====================================================
-- VIDEOS - Видео клипы
-- =====================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  
  -- Video info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Files
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Duration
  duration_seconds INTEGER NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published', 'archived')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users_extended(id),
  moderated_at TIMESTAMPTZ,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created ON videos(created_at DESC);

-- =====================================================
-- CONCERTS - Концерты
-- =====================================================
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  
  -- Concert info
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('concert', 'festival', 'club', 'private', 'online')),
  
  -- Location
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  address TEXT,
  
  -- Date and time
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  doors_open_time TIME,
  
  -- Tickets
  ticket_price_from DECIMAL(10,2),
  ticket_price_to DECIMAL(10,2),
  ticket_link TEXT,
  capacity INTEGER,
  
  -- Media
  banner_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published', 'cancelled', 'completed')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users_extended(id),
  moderated_at TIMESTAMPTZ,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  going_count INTEGER DEFAULT 0,
  
  -- Paid promotion
  is_promoted BOOLEAN DEFAULT false,
  promotion_expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_concerts_user ON concerts(user_id);
CREATE INDEX idx_concerts_status ON concerts(status);
CREATE INDEX idx_concerts_date ON concerts(event_date);

-- =====================================================
-- NEWS - Новости
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  
  -- News info
  title TEXT NOT NULL,
  preview TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_url TEXT,
  
  -- Category
  category TEXT CHECK (category IN ('release', 'interview', 'review', 'announcement', 'event', 'industry', 'other')),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published', 'archived')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users_extended(id),
  moderated_at TIMESTAMPTZ,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Paid promotion
  is_promoted BOOLEAN DEFAULT false,
  promotion_expires_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[],
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_user ON news(user_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_created ON news(created_at DESC);

-- =====================================================
-- PITCHING_REQUESTS - Заявки на питчинг
-- =====================================================
CREATE TABLE IF NOT EXISTS pitching_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Request info
  campaign_name TEXT NOT NULL,
  target_channels TEXT[] NOT NULL, -- ['radio', 'playlist', 'blog', 'media', 'tv', 'influencer']
  
  -- Options
  basic_service BOOLEAN DEFAULT true, -- 5000₽
  premium_distribution BOOLEAN DEFAULT false, -- +15000₽
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'rejected')),
  admin_notes TEXT,
  
  -- Results
  channels_reached INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  
  -- Payment
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_pitching_user ON pitching_requests(user_id);
CREATE INDEX idx_pitching_status ON pitching_requests(status);
CREATE INDEX idx_pitching_created ON pitching_requests(created_at DESC);

-- =====================================================
-- TRANSACTIONS - Финансовые транзакции
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  
  -- Transaction info
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'earning', 'refund', 'fee', 'bonus')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  
  -- Details
  description TEXT NOT NULL,
  related_entity_type TEXT, -- 'track', 'pitching', 'subscription', etc.
  related_entity_id UUID,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  
  -- Payment info
  payment_method TEXT,
  payment_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- =====================================================
-- NOTIFICATIONS - Уведомления
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_extended(id) ON DELETE CASCADE,
  
  -- Notification info
  type TEXT NOT NULL CHECK (type IN ('system', 'moderation', 'payment', 'social', 'marketing', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Timestamps
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users_extended FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_concerts_updated_at BEFORE UPDATE ON concerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pitching_updated_at BEFORE UPDATE ON pitching_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
