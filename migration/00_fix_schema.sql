-- ============================================
-- ИСПРАВЛЕНИЕ СХЕМЫ: добавление недостающих колонок
-- ============================================

-- Сначала добавим колонки к существующим таблицам

-- TRACKS: добавляем legacy_track_id если нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tracks' AND column_name = 'legacy_track_id') THEN
        ALTER TABLE tracks ADD COLUMN legacy_track_id INTEGER UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tracks' AND column_name = 'migrated_at') THEN
        ALTER TABLE tracks ADD COLUMN migrated_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tracks' AND column_name = 'legacy_file_path') THEN
        ALTER TABLE tracks ADD COLUMN legacy_file_path TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tracks' AND column_name = 'current_rank') THEN
        ALTER TABLE tracks ADD COLUMN current_rank INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tracks' AND column_name = 'moderation_status') THEN
        ALTER TABLE tracks ADD COLUMN moderation_status VARCHAR(20) DEFAULT 'draft';
    END IF;
END $$;

-- ARTIST_PROFILES: создаём если нет
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

-- Добавляем колонки к artist_profiles если они отсутствуют
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'artist_profiles' AND column_name = 'legacy_user_id') THEN
        ALTER TABLE artist_profiles ADD COLUMN legacy_user_id INTEGER UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'artist_profiles' AND column_name = 'migrated_at') THEN
        ALTER TABLE artist_profiles ADD COLUMN migrated_at TIMESTAMPTZ;
    END IF;
END $$;

-- VIDEOS: создаём если нет
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

-- MIGRATION_MAPPING
CREATE TABLE IF NOT EXISTS migration_mapping (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    legacy_id INTEGER NOT NULL,
    new_id UUID NOT NULL,
    migrated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, legacy_id)
);

-- Индексы (безопасно)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_legacy_id') THEN
        CREATE INDEX idx_tracks_legacy_id ON tracks(legacy_track_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artist_profiles_legacy_id') THEN
        CREATE INDEX idx_artist_profiles_legacy_id ON artist_profiles(legacy_user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_legacy_id') THEN
        CREATE INDEX idx_videos_legacy_id ON videos(legacy_clip_id);
    END IF;
END $$;

-- RLS
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON artist_profiles;
CREATE POLICY "Allow all" ON artist_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON tracks;
CREATE POLICY "Allow all" ON tracks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON videos;
CREATE POLICY "Allow all" ON videos FOR ALL USING (true) WITH CHECK (true);

-- Проверка
SELECT 'Готово!' as status;
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('tracks', 'artist_profiles', 'videos')
AND column_name LIKE 'legacy%'
ORDER BY table_name;
