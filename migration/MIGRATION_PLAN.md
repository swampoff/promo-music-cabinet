# План миграции promo.fm -> PROMO.MUSIC

## Обзор старой базы данных

### Основные таблицы для миграции:

| Старая таблица | Записей | Новая таблица | Описание |
|----------------|---------|---------------|----------|
| `users` | ~5078 | `auth.users` + `artist_profiles` | Пользователи и профили |
| `tracks` | ~8671 | `tracks` | Треки |
| `clips` | ~510 | `videos` | Видеоклипы |
| `photo` | ~9352 | Storage + `artist_profiles.avatar_url` | Фотографии |
| `payments` | ~8101 | `payments` | История платежей |
| `reviews` | ~399 | `track_reviews` | Отзывы |
| `city_` | ~17609 | `cities` | Справочник городов |
| `country_` | ~220 | `countries` | Справочник стран |

---

## Маппинг полей

### 1. USERS -> auth.users + artist_profiles

#### auth.users (Supabase Auth)
```
OLD                    -> NEW
-----------------------------------------
email                  -> email
password2 (bcrypt)     -> encrypted_password (нужен rehash)
reg_date               -> created_at
```

#### artist_profiles
```
OLD                         -> NEW
-----------------------------------------
id                          -> legacy_user_id (для связи)
ProfileArtistName           -> display_name
ProfileArtistAbout          -> bio
ProfileArtistStyle          -> genres[] (нужен парсинг)
ProfileArtistFoundation     -> founded_year
ProfileArtistTeam           -> team_members (JSON)
ProfileCity + ProfileCity2  -> city
ProfileCountry              -> country
ProfileRegion               -> region
ProfileLabel                -> label_name

-- Социальные сети
ProfileVkontakte            -> social_links.vk
ProfileFacebook             -> social_links.facebook
ProfileTwitter              -> social_links.twitter
Profileinst                 -> social_links.instagram
ProfileTiktok               -> social_links.tiktok
ProfileOndoklassniki        -> social_links.ok
ProfileSkype                -> social_links.skype
ProfileSite                 -> social_links.website

-- Стриминговые платформы
ProfileSpotify              -> streaming_links.spotify
ProfileMusic                -> streaming_links.apple_music
ProfileMyspace              -> streaming_links.myspace

-- Контакты
ProfilePhone                -> contact_phone
ProfileEmail                -> contact_email

-- Группы пользователей (поле `group`)
1 = Артист (Solo)           -> role: 'artist', artist_type: 'solo'
2 = Артист (Группа)         -> role: 'artist', artist_type: 'band'
3 = Радио                   -> role: 'radio' (отдельная таблица)
4 = Рецензент               -> role: 'reviewer'
5 = Админ                   -> role: 'admin'
```

### 2. TRACKS -> tracks

```
OLD                    -> NEW
-----------------------------------------
id                     -> legacy_track_id
user_id                -> artist_id (через маппинг)
songname               -> title
information            -> description
song_style             -> genre
file_uploaded          -> audio_url (нужен перенос файлов)
songtime_m * 60 + songtime_s -> duration
singers                -> featuring_artists
song_authors           -> credits.lyrics
music_authors          -> credits.music
song_rights            -> rights_holder
song_official          -> official_contact
label                  -> label_name
language               -> language
vocal                  -> has_vocal (1=да, 0=нет)

-- Статус (поле `status`)
0 = На модерации       -> moderation_status: 'pending'
1 = Одобрен            -> moderation_status: 'approved', status: 'published'
2 = Отклонён           -> moderation_status: 'rejected'
3 = В архиве           -> status: 'archived'

-- Рейтинги
cur_rank               -> current_rank
last_rank              -> previous_rank

-- Флаги
archive                -> status: 'archived' if 1
new                    -> is_new
remix                  -> is_remix

-- Даты
date_added             -> created_at (unix timestamp)
date_approved_unix     -> approved_at
```

### 3. CLIPS -> videos

```
OLD                    -> NEW
-----------------------------------------
id                     -> legacy_clip_id
user_id                -> artist_id (через маппинг)
songname               -> title
information            -> description
embed                  -> youtube_url / external_embed
original               -> video_url
clip                   -> video_file_url
cover                  -> thumbnail_url
director               -> credits.director
songtime_m * 60 + songtime_s -> duration
song_style             -> tags[]

-- Статус
status (0,1,2)         -> moderation_status (аналогично tracks)
archive                -> status: 'archived'
```

### 4. PHOTO -> Storage

```
OLD                    -> NEW
-----------------------------------------
filename               -> Storage: artist-avatars/{user_id}/{filename}
is_avatar = 1          -> artist_profiles.avatar_url
is_avatar = 0          -> artist_profiles.gallery[]
```

### 5. PAYMENTS -> payments

```
OLD                    -> NEW
-----------------------------------------
id                     -> legacy_payment_id
user_id                -> user_id
p_total                -> amount
pg_currency            -> currency
p_date                 -> created_at
p_done                 -> status: 'completed' if 1
pg_payment_system      -> payment_method
item_type              -> payment_type (track/clip promotion)
track_id               -> related_track_id
clip_id                -> related_video_id
```

---

## Порядок миграции

### Этап 1: Подготовка
1. Создать таблицы в Supabase
2. Создать Storage buckets
3. Настроить RLS policies

### Этап 2: Справочники
1. Мигрировать `country_` -> `countries`
2. Мигрировать `city_` -> `cities`
3. Мигрировать `styles` -> `genres`

### Этап 3: Пользователи
1. Создать записи в `auth.users`
2. Создать `artist_profiles` с `legacy_user_id`
3. Сгенерировать временные пароли и отправить email

### Этап 4: Контент
1. Перенести файлы в Supabase Storage
2. Мигрировать `tracks`
3. Мигрировать `clips` -> `videos`
4. Мигрировать `photo` в Storage

### Этап 5: Связи и история
1. Мигрировать `payments`
2. Мигрировать `reviews`
3. Мигрировать статистику

---

## Важные замечания

### Пароли
Старые пароли в MD5 (`password`) или bcrypt (`password2`).
**Рекомендация:** Отправить всем пользователям письмо для сброса пароля.

### Файлы
Нужен доступ к старому серверу для переноса:
- Аудиофайлы треков
- Видеофайлы клипов
- Фотографии пользователей

### Дубликаты email
Проверить на дубликаты email перед миграцией.

### Неактивные пользователи
Решить, мигрировать ли пользователей без контента.

---

## Файлы миграции

1. `01_create_tables.sql` - Создание таблиц в Supabase
2. `02_migrate_users.sql` - Миграция пользователей
3. `03_migrate_tracks.sql` - Миграция треков
4. `04_migrate_videos.sql` - Миграция видео
5. `migrate_files.ts` - Скрипт переноса файлов
6. `verify_migration.sql` - Проверка миграции
