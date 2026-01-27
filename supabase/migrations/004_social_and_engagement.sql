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
