-- ============================================
-- МИГРАЦИЯ ВИДЕО/КЛИПОВ promo.fm -> PROMO.MUSIC
-- ============================================

-- ============================================
-- ШАГ 1: Создание временной таблицы для импорта
-- ============================================

CREATE TEMP TABLE IF NOT EXISTS tmp_old_clips (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    date_added BIGINT,
    date_approved_unix BIGINT,
    order_number INTEGER,
    information TEXT,
    embed TEXT,
    original VARCHAR(255),
    director VARCHAR(250),
    songname VARCHAR(255),
    songtime_m INTEGER,
    songtime_s INTEGER,
    vocal INTEGER,
    language VARCHAR(3),
    mainsinger VARCHAR(1),
    song_authors TEXT,
    music_authors TEXT,
    song_rights TEXT,
    song_official TEXT,
    status INTEGER,
    delete_reason TEXT,
    singers VARCHAR(255),
    song_style VARCHAR(255),
    archive INTEGER DEFAULT 0,
    clip VARCHAR(255),
    cover VARCHAR(255)
);

-- ============================================
-- ШАГ 2: Статистика
-- ============================================

SELECT COUNT(*) as total_clips FROM tmp_old_clips;

SELECT
    status,
    CASE status
        WHEN 0 THEN 'На модерации'
        WHEN 1 THEN 'Одобрен'
        WHEN 2 THEN 'Отклонён'
        ELSE 'Другое'
    END as status_name,
    COUNT(*) as count
FROM tmp_old_clips
GROUP BY status;

-- ============================================
-- ШАГ 3: Извлечение YouTube URL из embed кодов
-- ============================================

-- Функция для извлечения YouTube ID из embed
CREATE OR REPLACE FUNCTION extract_youtube_id(embed_code TEXT)
RETURNS TEXT AS $$
DECLARE
    youtube_id TEXT;
BEGIN
    -- Паттерны для YouTube
    -- youtube.com/embed/VIDEO_ID
    -- youtube.com/watch?v=VIDEO_ID
    -- youtu.be/VIDEO_ID

    -- Попытка найти ID в embed iframe
    SELECT (regexp_matches(embed_code, 'youtube\.com/embed/([a-zA-Z0-9_-]{11})', 'i'))[1]
    INTO youtube_id;

    IF youtube_id IS NOT NULL THEN
        RETURN youtube_id;
    END IF;

    -- Попытка найти в watch URL
    SELECT (regexp_matches(embed_code, 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})', 'i'))[1]
    INTO youtube_id;

    IF youtube_id IS NOT NULL THEN
        RETURN youtube_id;
    END IF;

    -- Попытка найти в короткой ссылке
    SELECT (regexp_matches(embed_code, 'youtu\.be/([a-zA-Z0-9_-]{11})', 'i'))[1]
    INTO youtube_id;

    RETURN youtube_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ШАГ 4: Подготовка данных
-- ============================================

CREATE TEMP TABLE videos_to_import AS
SELECT
    c.id as legacy_clip_id,
    c.user_id as legacy_user_id,
    ap.id as artist_id,

    -- Название
    COALESCE(NULLIF(TRIM(c.songname), ''), 'Видео #' || c.id) as title,

    -- Описание
    NULLIF(TRIM(c.information), '') as description,

    -- Тип видео
    'music_video' as video_type,

    -- Файлы
    CASE
        WHEN c.clip IS NOT NULL AND c.clip != ''
        THEN 'https://your-project.supabase.co/storage/v1/object/public/video-files/' ||
             c.user_id || '/' || c.clip
        ELSE NULL
    END as video_url,

    CASE
        WHEN c.cover IS NOT NULL AND c.cover != ''
        THEN 'https://your-project.supabase.co/storage/v1/object/public/video-thumbnails/' ||
             c.user_id || '/' || c.cover
        ELSE NULL
    END as thumbnail_url,

    -- YouTube
    CASE
        WHEN extract_youtube_id(c.embed) IS NOT NULL
        THEN 'https://www.youtube.com/watch?v=' || extract_youtube_id(c.embed)
        ELSE NULL
    END as youtube_url,

    -- Оригинальный embed (для fallback)
    c.embed as external_embed,

    -- Длительность
    COALESCE(c.songtime_m, 0) * 60 + COALESCE(c.songtime_s, 0) as duration,

    -- Авторство
    jsonb_build_object(
        'director', NULLIF(TRIM(c.director), ''),
        'lyrics', NULLIF(TRIM(c.song_authors), ''),
        'music', NULLIF(TRIM(c.music_authors), '')
    ) as credits,

    -- Теги (из жанра)
    CASE
        WHEN c.song_style IS NOT NULL AND c.song_style != ''
        THEN ARRAY[TRIM(c.song_style)]
        ELSE '{}'::TEXT[]
    END as tags,

    -- Статус
    CASE
        WHEN c.archive = 1 THEN 'archived'
        WHEN c.status = 1 THEN 'published'
        ELSE 'draft'
    END as status,

    CASE c.status
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        WHEN 2 THEN 'rejected'
        ELSE 'draft'
    END as moderation_status,

    CASE
        WHEN c.status = 2 THEN NULLIF(TRIM(c.delete_reason), '')
        ELSE NULL
    END as rejection_reason,

    -- Даты
    to_timestamp(c.date_added) as created_at,
    CASE
        WHEN c.date_approved_unix > 0
        THEN to_timestamp(c.date_approved_unix)
        ELSE NULL
    END as approved_at,

    -- Legacy путь
    c.clip as legacy_file_path

FROM tmp_old_clips c
LEFT JOIN artist_profiles ap ON ap.legacy_user_id = c.user_id
WHERE c.user_id IS NOT NULL;

-- ============================================
-- ШАГ 5: Поиск связанных треков
-- ============================================

-- Попытка связать видео с треками по названию и артисту
ALTER TABLE videos_to_import ADD COLUMN track_id UUID;

UPDATE videos_to_import v
SET track_id = t.id
FROM tracks t
WHERE t.artist_id = v.artist_id
    AND LOWER(TRIM(t.title)) = LOWER(TRIM(v.title));

-- ============================================
-- ШАГ 6: Вставка видео
-- ============================================

INSERT INTO videos (
    legacy_clip_id,
    artist_id,
    track_id,
    title,
    description,
    video_type,
    video_url,
    thumbnail_url,
    youtube_url,
    external_embed,
    duration,
    credits,
    tags,
    status,
    moderation_status,
    rejection_reason,
    created_at,
    legacy_file_path,
    migrated_at
)
SELECT
    legacy_clip_id,
    artist_id,
    track_id,
    title,
    description,
    video_type,
    video_url,
    thumbnail_url,
    youtube_url,
    external_embed,
    duration,
    credits,
    tags,
    status,
    moderation_status,
    rejection_reason,
    COALESCE(created_at, NOW()),
    legacy_file_path,
    NOW()
FROM videos_to_import
WHERE artist_id IS NOT NULL;

-- ============================================
-- ШАГ 7: Запись маппинга
-- ============================================

INSERT INTO migration_mapping (entity_type, legacy_id, new_id)
SELECT 'clip', legacy_clip_id, id
FROM videos
WHERE legacy_clip_id IS NOT NULL AND migrated_at IS NOT NULL
ON CONFLICT (entity_type, legacy_id) DO NOTHING;

-- ============================================
-- ШАГ 8: Обновление счётчиков
-- ============================================

UPDATE artist_profiles ap
SET total_videos = (
    SELECT COUNT(*)
    FROM videos v
    WHERE v.artist_id = ap.id
)
WHERE ap.migrated_at IS NOT NULL;

-- ============================================
-- ПРОВЕРКА
-- ============================================

-- Количество мигрированных
SELECT COUNT(*) as migrated_videos FROM videos WHERE migrated_at IS NOT NULL;

-- Видео с YouTube
SELECT COUNT(*) as youtube_videos
FROM videos
WHERE youtube_url IS NOT NULL AND migrated_at IS NOT NULL;

-- Видео со связанными треками
SELECT COUNT(*) as videos_with_tracks
FROM videos
WHERE track_id IS NOT NULL AND migrated_at IS NOT NULL;

-- Примеры данных
SELECT
    v.legacy_clip_id,
    v.title,
    v.youtube_url,
    v.status,
    ap.display_name as artist,
    t.title as linked_track
FROM videos v
JOIN artist_profiles ap ON ap.id = v.artist_id
LEFT JOIN tracks t ON t.id = v.track_id
WHERE v.migrated_at IS NOT NULL
LIMIT 20;
