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
