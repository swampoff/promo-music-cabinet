-- ============================================
-- PROMO.MUSIC DATABASE SCHEMA - SIMPLIFIED
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CORE TABLES
-- ============================================

-- Artists table
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
  instagram TEXT,
  twitter TEXT,
  facebook TEXT,
  youtube TEXT,
  spotify TEXT,
  apple_music TEXT,
  coins_balance INTEGER DEFAULT 0 NOT NULL,
  total_coins_spent INTEGER DEFAULT 0 NOT NULL,
  total_coins_earned INTEGER DEFAULT 0 NOT NULL,
  total_plays INTEGER DEFAULT 0 NOT NULL,
  total_followers INTEGER DEFAULT 0 NOT NULL,
  total_concerts INTEGER DEFAULT 0 NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Concerts table
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'Концерт',
  banner_image_url TEXT,
  ticket_price_min DECIMAL(10, 2),
  ticket_price_max DECIMAL(10, 2),
  ticket_link TEXT,
  ticket_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'draft' NOT NULL CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  is_promoted BOOLEAN DEFAULT false,
  promotion_starts_at TIMESTAMPTZ,
  promotion_ends_at TIMESTAMPTZ,
  promotion_cost INTEGER,
  is_hidden BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0 NOT NULL,
  clicks_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  duration INTEGER,
  audio_url TEXT,
  cover_url TEXT,
  lyrics TEXT,
  release_date DATE,
  is_explicit BOOLEAN DEFAULT false,
  plays_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  moderation_status TEXT DEFAULT 'draft' CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  is_promoted BOOLEAN DEFAULT false,
  promotion_ends_at TIMESTAMPTZ,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT DEFAULT 'music_video' CHECK (video_type IN ('music_video', 'live', 'behind_scenes', 'interview', 'lyric_video', 'other')),
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  moderation_status TEXT DEFAULT 'draft' CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  is_promoted BOOLEAN DEFAULT false,
  promotion_ends_at TIMESTAMPTZ,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  tracks_count INTEGER DEFAULT 0 NOT NULL,
  total_duration INTEGER DEFAULT 0,
  plays_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Playlist tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  added_by UUID REFERENCES artists(id),
  UNIQUE(playlist_id, track_id)
);

-- Followers table
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  follower_email TEXT NOT NULL,
  follower_name TEXT,
  source TEXT DEFAULT 'website',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(artist_id, follower_email)
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('track', 'video', 'concert', 'playlist', 'news')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, target_type, target_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('track', 'video', 'concert', 'news')),
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  category TEXT DEFAULT 'announcement',
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0 NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'announcement', 'ticket_update', 'promotion', 'system', 'like', 'comment', 'follow')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'push' CHECK (channel IN ('email', 'push', 'both')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  sent_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  donor_name TEXT,
  donor_email TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Coin packages table
CREATE TABLE IF NOT EXISTS coin_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  coins_amount INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  bonus_coins INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default coin packages
INSERT INTO coin_packages (id, name, coins_amount, price, bonus_coins, is_popular, sort_order) VALUES
  ('starter', 'Стартовый', 100, 99.00, 0, false, 1),
  ('basic', 'Базовый', 500, 449.00, 50, false, 2),
  ('popular', 'Популярный', 1000, 849.00, 150, true, 3),
  ('pro', 'Профессиональный', 2500, 1999.00, 500, false, 4),
  ('enterprise', 'Корпоративный', 5000, 3799.00, 1200, false, 5)
ON CONFLICT (id) DO NOTHING;

-- Coin transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund', 'bonus', 'transfer')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_type TEXT,
  reference_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Banner ads table
CREATE TABLE IF NOT EXISTS banner_ads (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_type TEXT DEFAULT 'external' CHECK (link_type IN ('external', 'track', 'concert', 'video', 'news')),
  link_target_id UUID,
  placement TEXT DEFAULT 'home' CHECK (placement IN ('home', 'tracks', 'concerts', 'videos', 'search', 'all')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  daily_budget INTEGER,
  total_budget INTEGER,
  coins_spent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'rejected')),
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_username ON artists(username);
CREATE INDEX IF NOT EXISTS idx_concerts_artist_id ON concerts(artist_id);
CREATE INDEX IF NOT EXISTS idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_concerts_city ON concerts(city);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_videos_artist_id ON videos(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_artist_id ON playlists(artist_id);
CREATE INDEX IF NOT EXISTS idx_followers_artist_id ON followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_news_artist_id ON news(artist_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_artist_id ON donations(artist_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_artist_id ON coin_transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_banner_ads_artist_id ON banner_ads(artist_id);
CREATE INDEX IF NOT EXISTS idx_banner_ads_status ON banner_ads(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('artists', 'concerts', 'tracks', 'videos', 'playlists', 'news', 'notifications', 'donations', 'banner_ads', 'comments')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_ads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Artists policies
DROP POLICY IF EXISTS "artists_select_own" ON artists;
DROP POLICY IF EXISTS "artists_select_public" ON artists;
DROP POLICY IF EXISTS "artists_insert_own" ON artists;
DROP POLICY IF EXISTS "artists_update_own" ON artists;

CREATE POLICY "artists_select_own" ON artists FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "artists_select_public" ON artists FOR SELECT USING (is_active = true);
CREATE POLICY "artists_insert_own" ON artists FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "artists_update_own" ON artists FOR UPDATE USING (auth.uid()::text = id::text);

-- Concerts policies
DROP POLICY IF EXISTS "concerts_select_own" ON concerts;
DROP POLICY IF EXISTS "concerts_select_public" ON concerts;
DROP POLICY IF EXISTS "concerts_insert_own" ON concerts;
DROP POLICY IF EXISTS "concerts_update_own" ON concerts;
DROP POLICY IF EXISTS "concerts_delete_own" ON concerts;

CREATE POLICY "concerts_select_own" ON concerts FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "concerts_select_public" ON concerts FOR SELECT USING (moderation_status = 'approved' AND is_hidden = false);
CREATE POLICY "concerts_insert_own" ON concerts FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "concerts_update_own" ON concerts FOR UPDATE USING (artist_id::text = auth.uid()::text);
CREATE POLICY "concerts_delete_own" ON concerts FOR DELETE USING (artist_id::text = auth.uid()::text);

-- Tracks policies
DROP POLICY IF EXISTS "tracks_select_own" ON tracks;
DROP POLICY IF EXISTS "tracks_select_public" ON tracks;
DROP POLICY IF EXISTS "tracks_insert_own" ON tracks;
DROP POLICY IF EXISTS "tracks_update_own" ON tracks;
DROP POLICY IF EXISTS "tracks_delete_own" ON tracks;

CREATE POLICY "tracks_select_own" ON tracks FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "tracks_select_public" ON tracks FOR SELECT USING (moderation_status = 'approved' AND is_hidden = false);
CREATE POLICY "tracks_insert_own" ON tracks FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "tracks_update_own" ON tracks FOR UPDATE USING (artist_id::text = auth.uid()::text);
CREATE POLICY "tracks_delete_own" ON tracks FOR DELETE USING (artist_id::text = auth.uid()::text);

-- Videos policies
DROP POLICY IF EXISTS "videos_select_own" ON videos;
DROP POLICY IF EXISTS "videos_select_public" ON videos;
DROP POLICY IF EXISTS "videos_insert_own" ON videos;
DROP POLICY IF EXISTS "videos_update_own" ON videos;
DROP POLICY IF EXISTS "videos_delete_own" ON videos;

CREATE POLICY "videos_select_own" ON videos FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "videos_select_public" ON videos FOR SELECT USING (moderation_status = 'approved' AND is_hidden = false);
CREATE POLICY "videos_insert_own" ON videos FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "videos_update_own" ON videos FOR UPDATE USING (artist_id::text = auth.uid()::text);
CREATE POLICY "videos_delete_own" ON videos FOR DELETE USING (artist_id::text = auth.uid()::text);

-- Playlists policies
DROP POLICY IF EXISTS "playlists_select_own" ON playlists;
DROP POLICY IF EXISTS "playlists_select_public" ON playlists;
DROP POLICY IF EXISTS "playlists_insert_own" ON playlists;
DROP POLICY IF EXISTS "playlists_update_own" ON playlists;
DROP POLICY IF EXISTS "playlists_delete_own" ON playlists;

CREATE POLICY "playlists_select_own" ON playlists FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "playlists_select_public" ON playlists FOR SELECT USING (is_public = true);
CREATE POLICY "playlists_insert_own" ON playlists FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "playlists_update_own" ON playlists FOR UPDATE USING (artist_id::text = auth.uid()::text);
CREATE POLICY "playlists_delete_own" ON playlists FOR DELETE USING (artist_id::text = auth.uid()::text);

-- Playlist tracks policies
DROP POLICY IF EXISTS "playlist_tracks_select" ON playlist_tracks;
DROP POLICY IF EXISTS "playlist_tracks_insert" ON playlist_tracks;
DROP POLICY IF EXISTS "playlist_tracks_delete" ON playlist_tracks;

CREATE POLICY "playlist_tracks_select" ON playlist_tracks FOR SELECT USING (true);
CREATE POLICY "playlist_tracks_insert" ON playlist_tracks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND artist_id::text = auth.uid()::text)
);
CREATE POLICY "playlist_tracks_delete" ON playlist_tracks FOR DELETE USING (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND artist_id::text = auth.uid()::text)
);

-- Followers policies
DROP POLICY IF EXISTS "followers_select_own" ON followers;
DROP POLICY IF EXISTS "followers_insert_own" ON followers;
DROP POLICY IF EXISTS "followers_delete_own" ON followers;

CREATE POLICY "followers_select_own" ON followers FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "followers_insert_own" ON followers FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "followers_delete_own" ON followers FOR DELETE USING (artist_id::text = auth.uid()::text);

-- Likes policies
DROP POLICY IF EXISTS "likes_select" ON likes;
DROP POLICY IF EXISTS "likes_insert" ON likes;
DROP POLICY IF EXISTS "likes_delete" ON likes;

CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (user_id::text = auth.uid()::text);

-- Comments policies
DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_update_own" ON comments;
DROP POLICY IF EXISTS "comments_delete_own" ON comments;

CREATE POLICY "comments_select" ON comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (user_id::text = auth.uid()::text);

-- News policies
DROP POLICY IF EXISTS "news_select_own" ON news;
DROP POLICY IF EXISTS "news_select_public" ON news;
DROP POLICY IF EXISTS "news_insert_own" ON news;
DROP POLICY IF EXISTS "news_update_own" ON news;
DROP POLICY IF EXISTS "news_delete_own" ON news;

CREATE POLICY "news_select_own" ON news FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "news_select_public" ON news FOR SELECT USING (is_published = true);
CREATE POLICY "news_insert_own" ON news FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "news_update_own" ON news FOR UPDATE USING (artist_id::text = auth.uid()::text);
CREATE POLICY "news_delete_own" ON news FOR DELETE USING (artist_id::text = auth.uid()::text);

-- Notifications policies
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- Donations policies
DROP POLICY IF EXISTS "donations_select_own" ON donations;
DROP POLICY IF EXISTS "donations_insert" ON donations;

CREATE POLICY "donations_select_own" ON donations FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "donations_insert" ON donations FOR INSERT WITH CHECK (true);

-- Coin transactions policies
DROP POLICY IF EXISTS "coin_transactions_select_own" ON coin_transactions;
DROP POLICY IF EXISTS "coin_transactions_insert" ON coin_transactions;

CREATE POLICY "coin_transactions_select_own" ON coin_transactions FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "coin_transactions_insert" ON coin_transactions FOR INSERT WITH CHECK (true);

-- Banner ads policies
DROP POLICY IF EXISTS "banner_ads_select_own" ON banner_ads;
DROP POLICY IF EXISTS "banner_ads_select_active" ON banner_ads;
DROP POLICY IF EXISTS "banner_ads_insert_own" ON banner_ads;
DROP POLICY IF EXISTS "banner_ads_update_own" ON banner_ads;
DROP POLICY IF EXISTS "banner_ads_delete_own" ON banner_ads;

CREATE POLICY "banner_ads_select_own" ON banner_ads FOR SELECT USING (artist_id::text = auth.uid()::text);
CREATE POLICY "banner_ads_select_active" ON banner_ads FOR SELECT USING (status = 'active' AND moderation_status = 'approved');
CREATE POLICY "banner_ads_insert_own" ON banner_ads FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);
CREATE POLICY "banner_ads_update_own" ON banner_ads FOR UPDATE USING (artist_id::text = auth.uid()::text);
CREATE POLICY "banner_ads_delete_own" ON banner_ads FOR DELETE USING (artist_id::text = auth.uid()::text);

-- ============================================
-- GRANTS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- DONE
-- ============================================

SELECT 'Migration completed successfully!' as status;
