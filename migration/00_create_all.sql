-- ============================================
-- СОЗДАНИЕ ВСЕХ ТАБЛИЦ С НУЛЯ
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ARTIST_PROFILES
CREATE TABLE IF NOT EXISTS artist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    legacy_user_id INTEGER UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    artist_type VARCHAR(20) DEFAULT 'solo',
    avatar_url TEXT,
    cover_image_url TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Россия',
    social_links JSONB DEFAULT '{}'::jsonb,
    genres TEXT[] DEFAULT '{}',
    contact_email VARCHAR(128),
    total_tracks INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRACKS
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_track_id INTEGER UNIQUE,
    artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    moderation_status VARCHAR(20) DEFAULT 'draft',
    plays INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    current_rank INTEGER DEFAULT 0,
    release_date DATE,
    migrated_at TIMESTAMPTZ,
    legacy_file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VIDEOS
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_clip_id INTEGER UNIQUE,
    artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_type VARCHAR(50) DEFAULT 'music_video',
    youtube_url TEXT,
    external_embed TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    status VARCHAR(20) DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MIGRATION_MAPPING
CREATE TABLE IF NOT EXISTS migration_mapping (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    legacy_id INTEGER NOT NULL,
    new_id UUID NOT NULL,
    migrated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, legacy_id)
);

-- ИНДЕКСЫ
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_legacy_id ON artist_profiles(legacy_user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_legacy_id ON tracks(legacy_track_id);
CREATE INDEX IF NOT EXISTS idx_videos_artist_id ON videos(artist_id);
CREATE INDEX IF NOT EXISTS idx_videos_legacy_id ON videos(legacy_clip_id);

-- RLS
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Политики: разрешить всё для service role (миграция)
DROP POLICY IF EXISTS "Enable all for service role" ON artist_profiles;
CREATE POLICY "Enable all for service role" ON artist_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for service role" ON tracks;
CREATE POLICY "Enable all for service role" ON tracks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for service role" ON videos;
CREATE POLICY "Enable all for service role" ON videos FOR ALL USING (true) WITH CHECK (true);

SELECT 'Таблицы созданы!' as result;
