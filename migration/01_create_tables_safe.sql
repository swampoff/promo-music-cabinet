-- ============================================
-- PROMO.MUSIC - Создание таблиц (безопасная версия)
-- Можно запускать повторно
-- ============================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. СПРАВОЧНИКИ
-- ============================================

CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE,
    country_id UUID REFERENCES countries(id),
    name_ru VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE,
    region_id UUID REFERENCES regions(id),
    country_id UUID REFERENCES countries(id),
    name_ru VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    population INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ru VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ПРОФИЛИ АРТИСТОВ
-- ============================================

CREATE TABLE IF NOT EXISTS artist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    legacy_user_id INTEGER UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    artist_type VARCHAR(20) DEFAULT 'solo',
    founded_year INTEGER,
    label_name VARCHAR(100),
    avatar_url TEXT,
    cover_image_url TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Россия',
    city_id UUID REFERENCES cities(id),
    social_links JSONB DEFAULT '{}'::jsonb,
    streaming_links JSONB DEFAULT '{}'::jsonb,
    contact_email VARCHAR(128),
    contact_phone VARCHAR(32),
    genres TEXT[] DEFAULT '{}',
    team_members JSONB DEFAULT '[]'::jsonb,
    epk_url TEXT,
    tech_rider_url TEXT,
    total_tracks INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_plays INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    migrated_at TIMESTAMPTZ,
    migration_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. ТРЕКИ
-- ============================================

CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_track_id INTEGER UNIQUE,
    artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    mood VARCHAR(100),
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    waveform_data JSONB,
    duration INTEGER NOT NULL,
    bpm INTEGER,
    key VARCHAR(10),
    language VARCHAR(10) DEFAULT 'ru',
    has_vocal BOOLEAN DEFAULT TRUE,
    is_remix BOOLEAN DEFAULT FALSE,
    featuring_artists TEXT[],
    credits JSONB DEFAULT '{}'::jsonb,
    rights_holder VARCHAR(255),
    label_name VARCHAR(100),
    isrc VARCHAR(20),
    status VARCHAR(20) DEFAULT 'draft',
    moderation_status VARCHAR(20) DEFAULT 'draft',
    rejection_reason TEXT,
    current_rank INTEGER DEFAULT 0,
    previous_rank INTEGER DEFAULT 0,
    release_date DATE,
    approved_at TIMESTAMPTZ,
    plays INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_promoted BOOLEAN DEFAULT FALSE,
    promotion_expires_at TIMESTAMPTZ,
    is_new BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    migrated_at TIMESTAMPTZ,
    legacy_file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ВИДЕО
-- ============================================

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

-- ============================================
-- 5. ПЛАТЕЖИ
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_payment_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    payment_type VARCHAR(50),
    subscription_id UUID,
    track_id UUID REFERENCES tracks(id),
    video_id UUID REFERENCES videos(id),
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    external_payment_id VARCHAR(100),
    payment_system VARCHAR(50),
    description TEXT,
    receipt_url TEXT,
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    completed_at TIMESTAMPTZ,
    migrated_at TIMESTAMPTZ,
    legacy_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ОТЗЫВЫ НА ТРЕКИ
-- ============================================

CREATE TABLE IF NOT EXISTS track_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_review_id INTEGER UNIQUE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    reviewer_user_id UUID REFERENCES auth.users(id),
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_visible BOOLEAN DEFAULT FALSE,
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ТАБЛИЦА МАППИНГА
-- ============================================

CREATE TABLE IF NOT EXISTS migration_mapping (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    legacy_id INTEGER NOT NULL,
    new_id UUID NOT NULL,
    migrated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(entity_type, legacy_id)
);

-- ============================================
-- 8. ИНДЕКСЫ (с проверкой существования)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artist_profiles_user_id') THEN
        CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artist_profiles_legacy_id') THEN
        CREATE INDEX idx_artist_profiles_legacy_id ON artist_profiles(legacy_user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artist_profiles_display_name') THEN
        CREATE INDEX idx_artist_profiles_display_name ON artist_profiles(display_name);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artist_profiles_city') THEN
        CREATE INDEX idx_artist_profiles_city ON artist_profiles(city);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_artist_id') THEN
        CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_legacy_id') THEN
        CREATE INDEX idx_tracks_legacy_id ON tracks(legacy_track_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_status') THEN
        CREATE INDEX idx_tracks_status ON tracks(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_genre') THEN
        CREATE INDEX idx_tracks_genre ON tracks(genre);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_created_at') THEN
        CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_artist_id') THEN
        CREATE INDEX idx_videos_artist_id ON videos(artist_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_legacy_id') THEN
        CREATE INDEX idx_videos_legacy_id ON videos(legacy_clip_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_track_id') THEN
        CREATE INDEX idx_videos_track_id ON videos(track_id);
    END IF;
END $$;

-- ============================================
-- 9. RLS POLICIES (с проверкой)
-- ============================================

ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть и создаём новые
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON artist_profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON artist_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON artist_profiles;
CREATE POLICY "Users can update own profile"
    ON artist_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON artist_profiles;
CREATE POLICY "Service role can insert profiles"
    ON artist_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Published tracks are viewable by everyone" ON tracks;
CREATE POLICY "Published tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (status = 'published' OR artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Artists can manage own tracks" ON tracks;
CREATE POLICY "Artists can manage own tracks"
    ON tracks FOR ALL
    USING (artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Service role can insert tracks" ON tracks;
CREATE POLICY "Service role can insert tracks"
    ON tracks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Published videos are viewable by everyone" ON videos;
CREATE POLICY "Published videos are viewable by everyone"
    ON videos FOR SELECT
    USING (status = 'published' OR artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Artists can manage own videos" ON videos;
CREATE POLICY "Artists can manage own videos"
    ON videos FOR ALL
    USING (artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Service role can insert videos" ON videos;
CREATE POLICY "Service role can insert videos"
    ON videos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 10. ТРИГГЕРЫ
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at
    BEFORE UPDATE ON artist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tracks_updated_at ON tracks;
CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_artist_track_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artist_profiles SET total_tracks = total_tracks + 1 WHERE id = NEW.artist_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artist_profiles SET total_tracks = total_tracks - 1 WHERE id = OLD.artist_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS track_count_trigger ON tracks;
CREATE TRIGGER track_count_trigger
    AFTER INSERT OR DELETE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_artist_track_count();

-- Готово!
SELECT 'Таблицы созданы успешно!' as status;
