-- ============================================
-- МИГРАЦИЯ ТРЕКОВ promo.fm -> PROMO.MUSIC
-- ============================================

-- ============================================
-- ШАГ 1: Создание временной таблицы для импорта
-- ============================================

CREATE TEMP TABLE IF NOT EXISTS tmp_old_tracks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    file_name VARCHAR(255),
    file_uploaded VARCHAR(255),
    date_added BIGINT,
    date_approved_unix BIGINT,
    order_number INTEGER,
    information TEXT,
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
    track_number VARCHAR(12),
    cur_rank INTEGER DEFAULT 200,
    last_rank INTEGER DEFAULT 200,
    singers VARCHAR(255),
    song_style VARCHAR(255),
    archive INTEGER DEFAULT 0,
    "new" INTEGER DEFAULT 0,
    mark INTEGER DEFAULT 0,
    photo VARCHAR(32),
    remix INTEGER DEFAULT 0,
    label VARCHAR(255)
);

-- ============================================
-- ШАГ 2: Статистика по трекам
-- ============================================

-- Общее количество
SELECT COUNT(*) as total_tracks FROM tmp_old_tracks;

-- По статусам
SELECT
    status,
    CASE status
        WHEN 0 THEN 'На модерации'
        WHEN 1 THEN 'Одобрен'
        WHEN 2 THEN 'Отклонён'
        ELSE 'Другое'
    END as status_name,
    COUNT(*) as count
FROM tmp_old_tracks
GROUP BY status
ORDER BY status;

-- Архивные
SELECT COUNT(*) as archived_tracks
FROM tmp_old_tracks
WHERE archive = 1;

-- По жанрам (топ 20)
SELECT song_style, COUNT(*) as count
FROM tmp_old_tracks
WHERE song_style IS NOT NULL AND song_style != ''
GROUP BY song_style
ORDER BY count DESC
LIMIT 20;

-- ============================================
-- ШАГ 3: Подготовка данных для миграции
-- ============================================

CREATE TEMP TABLE tracks_to_import AS
SELECT
    t.id as legacy_track_id,
    t.user_id as legacy_user_id,
    ap.id as artist_id,

    -- Название
    COALESCE(NULLIF(TRIM(t.songname), ''), 'Без названия #' || t.id) as title,

    -- Описание
    NULLIF(TRIM(t.information), '') as description,

    -- Жанр (нормализация)
    CASE
        WHEN LOWER(TRIM(t.song_style)) IN ('поп', 'pop', 'попса') THEN 'Pop'
        WHEN LOWER(TRIM(t.song_style)) IN ('рок', 'rock') THEN 'Rock'
        WHEN LOWER(TRIM(t.song_style)) IN ('хип-хоп', 'hip-hop', 'рэп', 'rap') THEN 'Hip-Hop'
        WHEN LOWER(TRIM(t.song_style)) IN ('электроника', 'electronic', 'edm') THEN 'Electronic'
        WHEN LOWER(TRIM(t.song_style)) IN ('r&b', 'rnb', 'рнб') THEN 'R&B'
        WHEN LOWER(TRIM(t.song_style)) IN ('джаз', 'jazz') THEN 'Jazz'
        WHEN LOWER(TRIM(t.song_style)) IN ('классика', 'classical') THEN 'Classical'
        WHEN LOWER(TRIM(t.song_style)) IN ('фолк', 'folk', 'народная') THEN 'Folk'
        WHEN LOWER(TRIM(t.song_style)) IN ('шансон', 'chanson') THEN 'Chanson'
        WHEN LOWER(TRIM(t.song_style)) IN ('dance', 'дэнс', 'танцевальная') THEN 'Dance'
        ELSE COALESCE(NULLIF(TRIM(t.song_style), ''), 'Other')
    END as genre,

    -- Файл (путь для миграции)
    t.file_uploaded as legacy_file_path,
    'https://your-project.supabase.co/storage/v1/object/public/audio-files/tracks/' ||
        t.user_id || '/' || t.file_uploaded as audio_url,

    -- Обложка
    CASE
        WHEN t.photo IS NOT NULL AND t.photo != ''
        THEN 'https://your-project.supabase.co/storage/v1/object/public/track-covers/' ||
             t.user_id || '/' || t.photo
        ELSE NULL
    END as cover_url,

    -- Длительность в секундах
    COALESCE(t.songtime_m, 0) * 60 + COALESCE(t.songtime_s, 0) as duration,

    -- Язык
    CASE t.language
        WHEN 'ru' THEN 'ru'
        WHEN 'en' THEN 'en'
        WHEN 'ua' THEN 'uk'
        ELSE 'ru'
    END as language,

    -- Вокал
    CASE t.vocal
        WHEN 1 THEN true
        ELSE false
    END as has_vocal,

    -- Ремикс
    CASE t.remix
        WHEN 1 THEN true
        ELSE false
    END as is_remix,

    -- Участники
    CASE
        WHEN t.singers IS NOT NULL AND t.singers != ''
        THEN string_to_array(t.singers, ',')
        ELSE '{}'::TEXT[]
    END as featuring_artists,

    -- Авторство
    jsonb_build_object(
        'lyrics', NULLIF(TRIM(t.song_authors), ''),
        'music', NULLIF(TRIM(t.music_authors), '')
    ) as credits,

    -- Права
    NULLIF(TRIM(t.song_rights), '') as rights_holder,
    NULLIF(TRIM(t.label), '') as label_name,

    -- Статус
    CASE
        WHEN t.archive = 1 THEN 'archived'
        WHEN t.status = 1 THEN 'published'
        WHEN t.status = 0 THEN 'draft'
        ELSE 'draft'
    END as status,

    -- Статус модерации
    CASE t.status
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        WHEN 2 THEN 'rejected'
        ELSE 'draft'
    END as moderation_status,

    -- Причина отклонения
    CASE
        WHEN t.status = 2 THEN NULLIF(TRIM(t.delete_reason), '')
        ELSE NULL
    END as rejection_reason,

    -- Рейтинг
    COALESCE(t.cur_rank, 0) as current_rank,
    COALESCE(t.last_rank, 0) as previous_rank,

    -- Флаг "новый"
    CASE t."new"
        WHEN 1 THEN true
        ELSE false
    END as is_new,

    -- Даты
    to_timestamp(t.date_added) as created_at,
    CASE
        WHEN t.date_approved_unix > 0
        THEN to_timestamp(t.date_approved_unix)
        ELSE NULL
    END as approved_at

FROM tmp_old_tracks t
LEFT JOIN artist_profiles ap ON ap.legacy_user_id = t.user_id
WHERE t.user_id IS NOT NULL;

-- ============================================
-- ШАГ 4: Вставка треков
-- ============================================

INSERT INTO tracks (
    legacy_track_id,
    artist_id,
    title,
    description,
    genre,
    audio_url,
    cover_url,
    duration,
    language,
    has_vocal,
    is_remix,
    featuring_artists,
    credits,
    rights_holder,
    label_name,
    status,
    moderation_status,
    rejection_reason,
    current_rank,
    previous_rank,
    is_new,
    created_at,
    approved_at,
    legacy_file_path,
    migrated_at
)
SELECT
    legacy_track_id,
    artist_id,
    title,
    description,
    genre,
    audio_url,
    cover_url,
    duration,
    language,
    has_vocal,
    is_remix,
    featuring_artists,
    credits,
    rights_holder,
    label_name,
    status,
    moderation_status,
    rejection_reason,
    current_rank,
    previous_rank,
    is_new,
    COALESCE(created_at, NOW()),
    approved_at,
    legacy_file_path,
    NOW()
FROM tracks_to_import
WHERE artist_id IS NOT NULL;  -- Только если есть связь с артистом

-- ============================================
-- ШАГ 5: Запись маппинга
-- ============================================

INSERT INTO migration_mapping (entity_type, legacy_id, new_id)
SELECT 'track', legacy_track_id, id
FROM tracks
WHERE legacy_track_id IS NOT NULL AND migrated_at IS NOT NULL
ON CONFLICT (entity_type, legacy_id) DO NOTHING;

-- ============================================
-- ШАГ 6: Обновление счётчиков артистов
-- ============================================

UPDATE artist_profiles ap
SET total_tracks = (
    SELECT COUNT(*)
    FROM tracks t
    WHERE t.artist_id = ap.id
)
WHERE ap.migrated_at IS NOT NULL;

-- ============================================
-- ПРОВЕРКА МИГРАЦИИ
-- ============================================

-- Общее количество мигрированных треков
SELECT COUNT(*) as migrated_tracks
FROM tracks
WHERE migrated_at IS NOT NULL;

-- Треки без артиста (проблемы с маппингом)
SELECT t.legacy_track_id, t.legacy_user_id
FROM tracks_to_import t
WHERE t.artist_id IS NULL
LIMIT 20;

-- Распределение по статусам
SELECT status, moderation_status, COUNT(*)
FROM tracks
WHERE migrated_at IS NOT NULL
GROUP BY status, moderation_status;

-- Топ артистов по количеству треков
SELECT ap.display_name, COUNT(t.id) as track_count
FROM artist_profiles ap
JOIN tracks t ON t.artist_id = ap.id
WHERE ap.migrated_at IS NOT NULL
GROUP BY ap.id, ap.display_name
ORDER BY track_count DESC
LIMIT 20;

-- Проверка данных
SELECT
    t.legacy_track_id,
    t.title,
    t.genre,
    t.duration,
    t.status,
    ap.display_name as artist
FROM tracks t
JOIN artist_profiles ap ON ap.id = t.artist_id
WHERE t.migrated_at IS NOT NULL
LIMIT 20;
