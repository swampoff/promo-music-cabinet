-- ============================================
-- МИГРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ promo.fm -> PROMO.MUSIC
-- ============================================

-- ВАЖНО: Этот скрипт предполагает, что данные из MySQL
-- уже импортированы во временные таблицы в Supabase

-- ============================================
-- ШАГ 1: Создание временных таблиц для импорта
-- ============================================

-- Временная таблица для пользователей
CREATE TEMP TABLE IF NOT EXISTS tmp_old_users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(128),
    password VARCHAR(32),
    password2 VARCHAR(255),
    "group" INTEGER,
    getmail INTEGER DEFAULT 1,
    ProfileContactName VARCHAR(250),
    ProfileSurname VARCHAR(64),
    ProfileName VARCHAR(64),
    ProfileSecondName VARCHAR(64),
    ProfilePhone VARCHAR(32),
    ProfileBirthDay INTEGER,
    ProfileBirthMonth INTEGER,
    ProfileBirthYear INTEGER,
    ProfileCountry VARCHAR(12),
    ProfileCity VARCHAR(64),
    ProfileCity2 VARCHAR(64),
    ProfileGender VARCHAR(1),
    ProfileArtistType VARCHAR(4),
    ProfileArtistName VARCHAR(64),
    ProfileArtistFoundation INTEGER,
    ProfileArtistStyle VARCHAR(32),
    ProfileArtistAbout TEXT,
    ProfileArtistTeam TEXT,
    ProfileEmail VARCHAR(128),
    ProfileSite VARCHAR(128),
    ProfileSkype VARCHAR(128),
    ProfileTwitter VARCHAR(128),
    ProfileOndoklassniki VARCHAR(128),
    ProfileVkontakte VARCHAR(128),
    ProfileFacebook VARCHAR(128),
    ProfileMyspace VARCHAR(128),
    ProfileTiktok VARCHAR(128),
    ProfileMusic VARCHAR(128),
    ProfileSpotify VARCHAR(128),
    Profileinst VARCHAR(128),
    IP VARCHAR(15),
    reg_date INTEGER,
    logo VARCHAR(32),
    ProfileRegion VARCHAR(64),
    ProfileLabel VARCHAR(64),
    registered INTEGER DEFAULT 1,
    full_profile INTEGER,
    last_visit INTEGER
);

-- ============================================
-- ШАГ 2: Подсчёт пользователей по группам
-- ============================================

-- Статистика перед миграцией
SELECT
    "group",
    CASE "group"
        WHEN 1 THEN 'Артист (Solo)'
        WHEN 2 THEN 'Артист (Группа)'
        WHEN 3 THEN 'Радио'
        WHEN 4 THEN 'Рецензент'
        WHEN 5 THEN 'Админ'
        ELSE 'Неизвестно'
    END as group_name,
    COUNT(*) as count
FROM tmp_old_users
GROUP BY "group"
ORDER BY "group";

-- ============================================
-- ШАГ 3: Проверка на дубликаты email
-- ============================================

SELECT email, COUNT(*) as cnt
FROM tmp_old_users
WHERE email IS NOT NULL AND email != ''
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================
-- ШАГ 4: Миграция артистов (группы 1 и 2)
-- ============================================

-- Создаём пользователей в auth.users
-- ПРИМЕЧАНИЕ: В Supabase нельзя напрямую вставлять в auth.users через SQL
-- Используйте Admin API или Edge Function

-- Подготовка данных для импорта через API
CREATE TEMP TABLE users_to_import AS
SELECT
    u.id as legacy_id,
    LOWER(TRIM(u.email)) as email,
    -- Генерируем временный пароль (нужно будет сбросить)
    encode(gen_random_bytes(12), 'base64') as temp_password,
    COALESCE(NULLIF(TRIM(u.ProfileArtistName), ''), 'Артист #' || u.id) as display_name,
    u.ProfileArtistAbout as bio,
    CASE u."group"
        WHEN 1 THEN 'solo'
        WHEN 2 THEN 'band'
        ELSE 'solo'
    END as artist_type,
    u.ProfileArtistFoundation as founded_year,
    u.ProfileLabel as label_name,
    COALESCE(NULLIF(TRIM(u.ProfileCity), ''), NULLIF(TRIM(u.ProfileCity2), '')) as city,
    u.ProfileRegion as region,
    u.ProfileCountry as country_code,
    -- Социальные сети
    jsonb_build_object(
        'vk', NULLIF(TRIM(u.ProfileVkontakte), ''),
        'facebook', NULLIF(TRIM(u.ProfileFacebook), ''),
        'instagram', NULLIF(TRIM(u.Profileinst), ''),
        'twitter', NULLIF(TRIM(u.ProfileTwitter), ''),
        'tiktok', NULLIF(TRIM(u.ProfileTiktok), ''),
        'ok', NULLIF(TRIM(u.ProfileOndoklassniki), ''),
        'website', NULLIF(TRIM(u.ProfileSite), ''),
        'skype', NULLIF(TRIM(u.ProfileSkype), '')
    ) as social_links,
    -- Стриминг
    jsonb_build_object(
        'spotify', NULLIF(TRIM(u.ProfileSpotify), ''),
        'apple_music', NULLIF(TRIM(u.ProfileMusic), ''),
        'myspace', NULLIF(TRIM(u.ProfileMyspace), '')
    ) as streaming_links,
    NULLIF(TRIM(u.ProfileEmail), '') as contact_email,
    NULLIF(TRIM(u.ProfilePhone), '') as contact_phone,
    -- Жанр в массив
    CASE
        WHEN u.ProfileArtistStyle IS NOT NULL AND TRIM(u.ProfileArtistStyle) != ''
        THEN ARRAY[TRIM(u.ProfileArtistStyle)]
        ELSE '{}'::TEXT[]
    END as genres,
    -- Аватар (нужен путь к файлу)
    CASE
        WHEN u.logo IS NOT NULL AND u.logo != ''
        THEN 'legacy/avatars/' || u.logo
        ELSE NULL
    END as legacy_avatar,
    to_timestamp(u.reg_date) as registered_at,
    to_timestamp(u.last_visit) as last_visit_at
FROM tmp_old_users u
WHERE u."group" IN (1, 2)  -- Только артисты
    AND u.email IS NOT NULL
    AND TRIM(u.email) != ''
    AND u.registered = 1;

-- ============================================
-- ШАГ 5: Вставка в artist_profiles
-- (после создания auth.users через API)
-- ============================================

-- Этот запрос выполняется ПОСЛЕ создания пользователей в auth.users
-- и получения маппинга legacy_id -> new user_id

INSERT INTO artist_profiles (
    user_id,
    legacy_user_id,
    display_name,
    bio,
    artist_type,
    founded_year,
    label_name,
    city,
    region,
    country,
    social_links,
    streaming_links,
    contact_email,
    contact_phone,
    genres,
    status,
    migrated_at,
    created_at
)
SELECT
    mm.new_id as user_id,  -- из таблицы маппинга
    u.legacy_id,
    u.display_name,
    u.bio,
    u.artist_type,
    u.founded_year,
    u.label_name,
    u.city,
    u.region,
    CASE u.country_code
        WHEN '1' THEN 'Россия'
        WHEN '2' THEN 'Украина'
        WHEN '3' THEN 'Беларусь'
        WHEN '4' THEN 'Казахстан'
        ELSE 'Россия'
    END as country,
    -- Убираем null значения из JSON
    (SELECT jsonb_object_agg(key, value)
     FROM jsonb_each_text(u.social_links)
     WHERE value IS NOT NULL AND value != '') as social_links,
    (SELECT jsonb_object_agg(key, value)
     FROM jsonb_each_text(u.streaming_links)
     WHERE value IS NOT NULL AND value != '') as streaming_links,
    u.contact_email,
    u.contact_phone,
    u.genres,
    'active',
    NOW(),
    COALESCE(u.registered_at, NOW())
FROM users_to_import u
JOIN migration_mapping mm ON mm.legacy_id = u.legacy_id AND mm.entity_type = 'user';

-- ============================================
-- ШАГ 6: Обновление аватаров
-- (после переноса файлов в Storage)
-- ============================================

UPDATE artist_profiles ap
SET avatar_url = 'https://your-project.supabase.co/storage/v1/object/public/artist-avatars/' || u.legacy_avatar
FROM users_to_import u
WHERE ap.legacy_user_id = u.legacy_id
    AND u.legacy_avatar IS NOT NULL;

-- ============================================
-- ВСПОМОГАТЕЛЬНЫЕ ЗАПРОСЫ
-- ============================================

-- Количество успешно мигрированных
SELECT COUNT(*) as migrated_artists
FROM artist_profiles
WHERE migrated_at IS NOT NULL;

-- Проверка данных
SELECT
    legacy_user_id,
    display_name,
    city,
    country,
    array_length(genres, 1) as genres_count,
    social_links,
    created_at
FROM artist_profiles
WHERE migrated_at IS NOT NULL
LIMIT 20;

-- Артисты без треков (для анализа)
SELECT ap.legacy_user_id, ap.display_name
FROM artist_profiles ap
LEFT JOIN tracks t ON t.artist_id = ap.id
WHERE t.id IS NULL AND ap.migrated_at IS NOT NULL;
