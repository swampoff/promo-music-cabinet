-- ============================================
-- Добавление недостающих колонок для миграции
-- ============================================

-- TRACKS: добавляем колонки для миграции
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS legacy_track_id INTEGER UNIQUE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS legacy_file_path TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS current_rank INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS previous_rank INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMPTZ;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS waveform_data JSONB;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS mood VARCHAR(100);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS key VARCHAR(10);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'ru';
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS has_vocal BOOLEAN DEFAULT TRUE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_remix BOOLEAN DEFAULT FALSE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS featuring_artists TEXT[];
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS credits JSONB DEFAULT '{}'::jsonb;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS rights_holder VARCHAR(255);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS label_name VARCHAR(100);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS isrc VARCHAR(20);

-- ARTIST_PROFILES: добавляем колонки для миграции
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS legacy_user_id INTEGER UNIQUE;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS migration_notes TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS artist_type VARCHAR(20) DEFAULT 'solo';
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS label_name VARCHAR(100);
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS streaming_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS contact_email VARCHAR(128);
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(32);
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS epk_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS tech_rider_url TEXT;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS total_tracks INTEGER DEFAULT 0;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS total_videos INTEGER DEFAULT 0;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS total_plays INTEGER DEFAULT 0;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- VIDEOS: создаём таблицу если нет
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_clip_id INTEGER UNIQUE,
    artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_type VARCHAR(50) DEFAULT 'music_video',
    video_url TEXT,
    thumbnail_url TEXT,
    youtube_url TEXT,
    rutube_url TEXT,
    vk_video_url TEXT,
    external_embed TEXT,
    duration INTEGER,
    credits JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'draft',
    moderation_status VARCHAR(20) DEFAULT 'draft',
    rejection_reason TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_promoted BOOLEAN DEFAULT FALSE,
    promotion_expires_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    migrated_at TIMESTAMPTZ,
    legacy_file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRATION_MAPPING: таблица для отслеживания миграции
CREATE TABLE IF NOT EXISTS migration_mapping (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    legacy_id INTEGER NOT NULL,
    new_id UUID NOT NULL,
    migrated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
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
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_artist_id') THEN
        CREATE INDEX idx_videos_artist_id ON videos(artist_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_legacy_id') THEN
        CREATE INDEX idx_videos_legacy_id ON videos(legacy_clip_id);
    END IF;
END $$;

-- RLS для videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published videos are viewable by everyone" ON videos;
CREATE POLICY "Published videos are viewable by everyone"
    ON videos FOR SELECT
    USING (status = 'published' OR artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Service role can insert videos" ON videos;
CREATE POLICY "Service role can insert videos"
    ON videos FOR INSERT WITH CHECK (true);

-- Проверка результата
SELECT 'Колонки добавлены!' as status;

-- Показать структуру таблиц
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('artist_profiles', 'tracks', 'videos')
ORDER BY table_name, ordinal_position;
