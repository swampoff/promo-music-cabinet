-- ============================================
-- Добавление колонок для миграции к существующим таблицам
-- Таблицы: artists, tracks, videos
-- ============================================

-- ARTISTS: добавляем колонки для миграции
ALTER TABLE artists ADD COLUMN IF NOT EXISTS legacy_user_id INTEGER;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;

-- Создаём уникальный индекс для legacy_user_id если его нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artists_legacy_user_id') THEN
        CREATE UNIQUE INDEX idx_artists_legacy_user_id ON artists(legacy_user_id) WHERE legacy_user_id IS NOT NULL;
    END IF;
END $$;

-- TRACKS: добавляем колонки для миграции
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS legacy_track_id INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS legacy_file_path TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracks_legacy_track_id') THEN
        CREATE UNIQUE INDEX idx_tracks_legacy_track_id ON tracks(legacy_track_id) WHERE legacy_track_id IS NOT NULL;
    END IF;
END $$;

-- VIDEOS: добавляем колонки для миграции
ALTER TABLE videos ADD COLUMN IF NOT EXISTS legacy_clip_id INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS external_embed TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_legacy_clip_id') THEN
        CREATE UNIQUE INDEX idx_videos_legacy_clip_id ON videos(legacy_clip_id) WHERE legacy_clip_id IS NOT NULL;
    END IF;
END $$;

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

-- Проверка
SELECT 'Колонки добавлены!' as status;
