-- ============================================
-- PROMO.MUSIC - Создание таблиц для миграции
-- ============================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. СПРАВОЧНИКИ
-- ============================================

-- Страны
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE, -- старый id из country_
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Регионы
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER UNIQUE,
    country_id UUID REFERENCES countries(id),
    name_ru VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Города
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

-- Жанры
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
    legacy_user_id INTEGER UNIQUE, -- для связи со старой базой

    -- Основная информация
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    artist_type VARCHAR(20) DEFAULT 'solo', -- solo, band, dj, producer
    founded_year INTEGER,
    label_name VARCHAR(100),

    -- Медиа
    avatar_url TEXT,
    cover_image_url TEXT,
    gallery JSONB DEFAULT '[]'::jsonb, -- массив URL фотографий

    -- Локация
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Россия',
    city_id UUID REFERENCES cities(id),

    -- Социальные сети
    social_links JSONB DEFAULT '{}'::jsonb,
    -- {vk, facebook, instagram, twitter, tiktok, ok, youtube, telegram, website}

    -- Стриминговые платформы
    streaming_links JSONB DEFAULT '{}'::jsonb,
    -- {spotify, apple_music, yandex_music, vk_music, soundcloud, deezer}

    -- Контакты
    contact_email VARCHAR(128),
    contact_phone VARCHAR(32),

    -- Жанры (массив)
    genres TEXT[] DEFAULT '{}',

    -- Команда
    team_members JSONB DEFAULT '[]'::jsonb,

    -- EPK
    epk_url TEXT,
    tech_rider_url TEXT,

    -- Статистика
    total_tracks INTEGER DEFAULT 0,
    total_videos INTEGER DEFAULT 0,
    total_plays INTEGER DEFAULT 0,

    -- Верификация
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,

    -- Статус
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked

    -- Метаданные миграции
    migrated_at TIMESTAMPTZ,
    migration_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_legacy_id ON artist_profiles(legacy_user_id);
CREATE INDEX idx_artist_profiles_display_name ON artist_profiles(display_name);
CREATE INDEX idx_artist_profiles_city ON artist_profiles(city);

-- ============================================
-- 3. ТРЕКИ
-- ============================================

CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_track_id INTEGER UNIQUE,
    artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,

    -- Основная информация
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    mood VARCHAR(100),

    -- Файлы
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    waveform_data JSONB,

    -- Метаданные трека
    duration INTEGER NOT NULL, -- в секундах
    bpm INTEGER,
    key VARCHAR(10),
    language VARCHAR(10) DEFAULT 'ru',
    has_vocal BOOLEAN DEFAULT TRUE,
    is_remix BOOLEAN DEFAULT FALSE,

    -- Участники
    featuring_artists TEXT[],

    -- Авторство и права
    credits JSONB DEFAULT '{}'::jsonb,
    -- {lyrics: [], music: [], arrangement: [], mix: [], master: []}
    rights_holder VARCHAR(255),
    label_name VARCHAR(100),
    isrc VARCHAR(20),

    -- Статус
    status VARCHAR(20) DEFAULT 'draft', -- draft, processing, ready, published, archived
    moderation_status VARCHAR(20) DEFAULT 'draft', -- draft, pending, approved, rejected
    rejection_reason TEXT,

    -- Рейтинг (миграция старых данных)
    current_rank INTEGER DEFAULT 0,
    previous_rank INTEGER DEFAULT 0,

    -- Даты
    release_date DATE,
    approved_at TIMESTAMPTZ,

    -- Аналитика
    plays INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,

    -- Продвижение
    is_promoted BOOLEAN DEFAULT FALSE,
    promotion_expires_at TIMESTAMPTZ,

    -- Флаги
    is_new BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Метаданные миграции
    migrated_at TIMESTAMPTZ,
    legacy_file_path TEXT, -- путь к файлу на старом сервере

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_legacy_id ON tracks(legacy_track_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);

-- ============================================
-- 4. ВИДЕО
-- ============================================

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_clip_id INTEGER UNIQUE,
    artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id), -- связь с треком если это клип на песню

    -- Основная информация
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_type VARCHAR(50) DEFAULT 'music_video', -- music_video, live, behind_scenes, interview, lyric

    -- Файлы
    video_url TEXT, -- URL загруженного видео
    thumbnail_url TEXT,

    -- Внешние ссылки
    youtube_url TEXT,
    rutube_url TEXT,
    vk_video_url TEXT,
    external_embed TEXT, -- для старых embed кодов

    -- Метаданные
    duration INTEGER, -- в секундах

    -- Авторство
    credits JSONB DEFAULT '{}'::jsonb,
    -- {director: "", producer: "", editor: ""}

    -- Статус
    status VARCHAR(20) DEFAULT 'draft',
    moderation_status VARCHAR(20) DEFAULT 'draft',
    rejection_reason TEXT,

    -- Аналитика
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,

    -- Продвижение
    is_promoted BOOLEAN DEFAULT FALSE,
    promotion_expires_at TIMESTAMPTZ,

    -- Теги
    tags TEXT[] DEFAULT '{}',

    -- Метаданные миграции
    migrated_at TIMESTAMPTZ,
    legacy_file_path TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_videos_artist_id ON videos(artist_id);
CREATE INDEX idx_videos_legacy_id ON videos(legacy_clip_id);
CREATE INDEX idx_videos_track_id ON videos(track_id);

-- ============================================
-- 5. ПЛАТЕЖИ
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_payment_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id),

    -- Сумма
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',

    -- Тип платежа
    payment_type VARCHAR(50), -- subscription, track_promotion, video_promotion

    -- Связи
    subscription_id UUID,
    track_id UUID REFERENCES tracks(id),
    video_id UUID REFERENCES videos(id),

    -- Статус
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded

    -- Платёжная система
    payment_method VARCHAR(50), -- card, yookassa, sbp
    external_payment_id VARCHAR(100),
    payment_system VARCHAR(50), -- данные из старой базы

    -- Детали
    description TEXT,
    receipt_url TEXT,

    -- Возврат
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,

    -- Даты
    completed_at TIMESTAMPTZ,

    -- Метаданные миграции
    migrated_at TIMESTAMPTZ,
    legacy_data JSONB, -- сырые данные из старой базы

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

    -- Контент
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),

    -- Статус
    is_visible BOOLEAN DEFAULT FALSE,

    -- Метаданные миграции
    migrated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ТАБЛИЦА МАППИНГА (для миграции)
-- ============================================

CREATE TABLE IF NOT EXISTS migration_mapping (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- user, track, clip, payment
    legacy_id INTEGER NOT NULL,
    new_id UUID NOT NULL,
    migrated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,

    UNIQUE(entity_type, legacy_id)
);

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Включаем RLS
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Профили: чтение всем, редактирование владельцу
CREATE POLICY "Profiles are viewable by everyone"
    ON artist_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON artist_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Треки: чтение опубликованных всем, все действия владельцу
CREATE POLICY "Published tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (status = 'published' OR artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Artists can manage own tracks"
    ON tracks FOR ALL
    USING (artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

-- Видео: аналогично трекам
CREATE POLICY "Published videos are viewable by everyone"
    ON videos FOR SELECT
    USING (status = 'published' OR artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Artists can manage own videos"
    ON videos FOR ALL
    USING (artist_id IN (
        SELECT id FROM artist_profiles WHERE user_id = auth.uid()
    ));

-- Платежи: только владелец
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- 9. ТРИГГЕРЫ
-- ============================================

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artist_profiles_updated_at
    BEFORE UPDATE ON artist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Обновление счётчиков в профиле
CREATE OR REPLACE FUNCTION update_artist_track_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artist_profiles
        SET total_tracks = total_tracks + 1
        WHERE id = NEW.artist_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artist_profiles
        SET total_tracks = total_tracks - 1
        WHERE id = OLD.artist_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER track_count_trigger
    AFTER INSERT OR DELETE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_artist_track_count();
