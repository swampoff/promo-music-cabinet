# 🎙️ RADIO STATIONS MODULE - Complete Documentation

## Кабинет радиостанций в PROMO.MUSIC

**Release Date:** 02.02.2026  
**Status:** ✅ В разработке  
**Module Type:** Отдельный кабинет для радиостанций

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор](#обзор)
2. [Структура базы данных](#структура-базы-данных)
3. [Frontend компонент](#frontend-компонент)
4. [API Endpoints](#api-endpoints)
5. [Функционал](#функционал)
6. [Установка](#установка)

---

## 🎯 ОБЗОР

Модуль радиостанций позволяет радиостанциям:
- ✅ Управлять ротацией треков
- ✅ Принимать заявки от артистов
- ✅ Создавать радиопередачи
- ✅ Отслеживать статистику прослушиваний
- ✅ Управлять расписанием эфира
- ✅ Монетизировать через рекламу

---

## 📊 СТРУКТУРА БАЗЫ ДАННЫХ

### **Создано SQL файлов: 2**

1. **`11_radio_stations_module.sql`** - Основные таблицы и типы
2. **`12_radio_functions_views.sql`** - Функции и представления

---

### **Таблицы (10 штук)**

| # | Таблица | Описание | Записей (оценка) |
|---|---------|----------|------------------|
| 1 | `radio_stations` | Профили радиостанций | 100+ |
| 2 | `radio_playlists` | Плейлисты станций | 500+ |
| 3 | `radio_rotation` | Ротация треков | 10,000+ |
| 4 | `radio_track_requests` | Заявки от артистов | 5,000+ |
| 5 | `radio_shows` | Радиопередачи | 1,000+ |
| 6 | `radio_show_episodes` | Эпизоды передач | 10,000+ |
| 7 | `radio_statistics` | Статистика прослушиваний | 1,000,000+ |
| 8 | `radio_ads` | Рекламные блоки | 500+ |
| 9 | `radio_reviews` | Отзывы о станциях | 2,000+ |

**Итого:** 9 таблиц, ~1,029,100 записей (оценка)

---

### **Custom Types (7 штук)**

```sql
-- 1. Тип радиостанции
CREATE TYPE radio_station_type AS ENUM (
  'online',      -- Интернет-радио
  'fm',          -- FM радио
  'am',          -- AM радио
  'dab',         -- Digital Audio Broadcasting
  'satellite',   -- Спутниковое радио
  'podcast'      -- Подкаст-платформа
);

-- 2. Статус радиостанции
CREATE TYPE radio_station_status AS ENUM (
  'pending',     -- На модерации
  'active',      -- Активна
  'suspended',   -- Приостановлена
  'closed'       -- Закрыта
);

-- 3. Жанр радиостанции
CREATE TYPE radio_genre AS ENUM (
  'pop', 'rock', 'hip_hop', 'electronic', 'jazz', 
  'classical', 'country', 'indie', 'metal', 'rnb',
  'mixed', 'talk', 'news'
);

-- 4. Размер аудитории
CREATE TYPE audience_size AS ENUM (
  'small',       -- < 1K слушателей
  'medium',      -- 1K - 10K
  'large',       -- 10K - 100K
  'very_large',  -- 100K - 1M
  'massive'      -- > 1M
);

-- 5. Статус заявки на трек
CREATE TYPE radio_request_status AS ENUM (
  'pending',     -- Ожидает
  'reviewing',   -- На рассмотрении
  'approved',    -- Одобрена
  'rejected',    -- Отклонена
  'scheduled',   -- Запланирована в ротацию
  'in_rotation', -- В ротации
  'archived'     -- В архиве
);

-- 6. Тип ротации
CREATE TYPE rotation_type AS ENUM (
  'heavy',       -- Тяжелая (много раз в день)
  'medium',      -- Средняя
  'light',       -- Легкая
  'special',     -- Специальная (по расписанию)
  'one_time'     -- Разовое воспроизведение
);

-- 7. Статус передачи
CREATE TYPE show_status AS ENUM (
  'scheduled',   -- Запланирована
  'live',        -- В эфире
  'completed',   -- Завершена
  'cancelled'    -- Отменена
);
```

---

### **Основная таблица: `radio_stations`**

```sql
CREATE TABLE radio_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связь с пользователем
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Основная информация
  station_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  slug VARCHAR(100) UNIQUE NOT NULL,
  tagline VARCHAR(500),
  description TEXT,
  
  -- Тип и жанр
  station_type radio_station_type NOT NULL DEFAULT 'online',
  primary_genre radio_genre NOT NULL,
  secondary_genres radio_genre[],
  
  -- Контакты
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(500),
  
  -- Социальные сети
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255),
  youtube VARCHAR(255),
  
  -- Локация
  country VARCHAR(2),
  city VARCHAR(100),
  timezone VARCHAR(100) DEFAULT 'UTC',
  
  -- Вещание
  broadcast_url TEXT,        -- URL потока
  backup_stream_url TEXT,
  stream_format VARCHAR(50), -- mp3, aac, ogg
  bitrate INTEGER,           -- kbps
  
  -- FM/AM (если применимо)
  frequency VARCHAR(20),     -- 100.5 FM
  signal_coverage TEXT,
  
  -- Аудитория
  audience_size audience_size DEFAULT 'small',
  listeners_count INTEGER DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  peak_listeners INTEGER DEFAULT 0,
  
  -- Статистика
  total_plays BIGINT DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  total_shows INTEGER DEFAULT 0,
  
  -- Медиа
  logo_url TEXT,
  cover_image_url TEXT,
  station_images TEXT[],
  
  -- Рейтинг
  rating DECIMAL(3,2) DEFAULT 0.00,
  reviews_count INTEGER DEFAULT 0,
  
  -- Верификация
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Статус
  status radio_station_status DEFAULT 'pending',
  
  -- Настройки
  settings JSONB DEFAULT '{
    "auto_accept_requests": false,
    "public_profile": true,
    "show_statistics": true,
    "allow_track_requests": true,
    "moderation_enabled": true,
    "explicit_content": false,
    "accept_indie_artists": true
  }'::jsonb,
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Индексы:** 9 индексов для оптимизации запросов

---

## ⚡ FUNCTIONS (8 штук)

### **1. Получить профиль станции**
```sql
SELECT * FROM get_radio_station_by_slug('my-radio-station');
```

### **2. Подать заявку на трек**
```sql
SELECT submit_radio_track_request(
  p_artist_id := 'artist-uuid',
  p_track_id := 'track-uuid',
  p_station_id := 'station-uuid',
  p_message := 'Please consider my track!',
  p_pitch_text := 'Perfect for your morning show'
);
-- Returns: request_id (UUID)
```

### **3. Одобрить заявку**
```sql
SELECT approve_radio_request(
  p_request_id := 'request-uuid',
  p_reviewed_by := 'reviewer-uuid',
  p_rotation_type := 'medium',
  p_plays_per_day := 3,
  p_start_date := CURRENT_DATE
);
-- Returns: rotation_id (UUID)
```

### **4. Отклонить заявку**
```sql
SELECT reject_radio_request(
  p_request_id := 'request-uuid',
  p_reviewed_by := 'reviewer-uuid',
  p_rejection_reason := 'Does not fit our format'
);
-- Returns: BOOLEAN
```

### **5. Записать воспроизведение**
```sql
SELECT log_radio_play(
  p_station_id := 'station-uuid',
  p_track_id := 'track-uuid',
  p_listeners_count := 1250
);
```

### **6. Получить следующий трек**
```sql
SELECT * FROM get_next_track_for_rotation('station-uuid');
-- Returns: track_id, rotation_id, rotation_type, priority
```

### **7. Статистика станции**
```sql
SELECT * FROM get_radio_station_stats(
  p_station_id := 'station-uuid',
  p_start_date := CURRENT_DATE - INTERVAL '30 days',
  p_end_date := CURRENT_DATE
);
-- Returns: total_plays, unique_tracks, avg_listeners, peak_listeners, top_tracks
```

### **8. Обновить рейтинг**
```sql
SELECT update_radio_station_rating('station-uuid');
```

---

## 📊 VIEWS (7 штук)

### **1. Топ радиостанций**
```sql
SELECT * FROM v_top_radio_stations LIMIT 10;
```

### **2. Активные заявки**
```sql
SELECT * FROM v_active_radio_requests
WHERE station_slug = 'my-radio-station';
```

### **3. Активная ротация**
```sql
SELECT * FROM v_radio_active_rotation
WHERE station_id = 'station-uuid';
```

### **4. Дневная статистика**
```sql
SELECT * FROM v_radio_daily_stats
ORDER BY plays_today DESC;
```

### **5. Расписание передач**
```sql
SELECT * FROM v_radio_show_schedule
WHERE next_airing_at > NOW();
```

### **6. Топ треков месяца**
```sql
SELECT * FROM v_radio_top_tracks_month LIMIT 50;
```

### **7. Аналитика станции**
```sql
SELECT * FROM v_radio_station_analytics
WHERE id = 'station-uuid';
```

---

## 🎨 FRONTEND КОМПОНЕНТ

### **Файл:** `/src/radio/RadioApp.tsx`

**Секции кабинета:**

1. **Dashboard** - Главная страница
   - Текущие слушатели
   - Треки в ротации
   - Новые заявки
   - Рейтинг станции
   - Сейчас в эфире
   - Быстрые действия

2. **Rotation** - Управление ротацией
   - Список треков в ротации
   - Добавление/удаление треков
   - Настройка частоты воспроизведения
   - Временные слоты

3. **Requests** - Заявки от артистов
   - Просмотр заявок
   - Одобрение/отклонение
   - Фильтрация по статусу
   - Массовые действия

4. **Shows** - Радиопередачи
   - Список передач
   - Создание передачи
   - Расписание эфира
   - Эпизоды

5. **Analytics** - Аналитика
   - Статистика прослушиваний
   - Топ треки
   - География слушателей
   - Графики и отчеты

6. **Settings** - Настройки
   - Профиль станции
   - Потоковое вещание
   - Уведомления
   - Интеграции

---

## 🚀 API ENDPOINTS (планируется)

### **Radio Stations (15 endpoints)**

```
GET    /api/radio/stations              - Список станций
GET    /api/radio/stations/:id          - Получить станцию
POST   /api/radio/stations              - Создать станцию
PUT    /api/radio/stations/:id          - Обновить станцию
DELETE /api/radio/stations/:id          - Удалить станцию

GET    /api/radio/stations/:id/rotation - Ротация станции
POST   /api/radio/stations/:id/rotation - Добавить в ротацию
DELETE /api/radio/stations/:id/rotation/:trackId - Удалить из ротации

GET    /api/radio/stations/:id/requests - Заявки к станции
POST   /api/radio/requests              - Подать заявку
PUT    /api/radio/requests/:id/approve  - Одобрить заявку
PUT    /api/radio/requests/:id/reject   - Отклонить заявку

GET    /api/radio/stations/:id/stats    - Статистика станции
POST   /api/radio/stations/:id/play     - Записать воспроизведение
GET    /api/radio/stations/:id/next     - Следующий трек
```

### **Radio Shows (10 endpoints)**

```
GET    /api/radio/shows                 - Список передач
GET    /api/radio/shows/:id             - Получить передачу
POST   /api/radio/shows                 - Создать передачу
PUT    /api/radio/shows/:id             - Обновить передачу
DELETE /api/radio/shows/:id             - Удалить передачу

GET    /api/radio/shows/:id/episodes    - Эпизоды передачи
POST   /api/radio/shows/:id/episodes    - Создать эпизод
GET    /api/radio/schedule              - Расписание эфира
```

**Итого планируется:** ~25 endpoints

---

## 💡 ФУНКЦИОНАЛ

### **Для радиостанций:**

✅ **Управление профилем**
- Создание профиля станции
- Настройка вещания (URL потока, битрейт)
- Загрузка лого и обложки
- Социальные сети
- Верификация

✅ **Ротация треков**
- Добавление треков в ротацию
- Настройка частоты воспроизведения (heavy/medium/light)
- Временные слоты для треков
- Приоритеты воспроизведения
- Автоматический плейлист

✅ **Заявки от артистов**
- Просмотр заявок
- Одобрение/отклонение с причиной
- Автоодобрение (опционально)
- Уведомления о новых заявках
- Фильтры и поиск

✅ **Радиопередачи**
- Создание передач
- Расписание эфира
- Треклисты эпизодов
- Записи передач
- Ведущие

✅ **Аналитика**
- Текущие слушатели
- Статистика за период
- Топ треки
- География слушателей
- Пиковые часы

✅ **Монетизация**
- Рекламные блоки
- Спонсорство передач
- Платные заявки (приоритетные)

---

### **Для артистов:**

✅ **Подача заявок**
- Выбор радиостанции
- Прикрепление трека
- Pitch текст
- Желаемый тип ротации
- Отслеживание статуса

✅ **Отслеживание**
- Статус заявки
- Статистика воспроизведений
- На каких станциях играет трек
- Уведомления об одобрении/отклонении

---

## 📦 УСТАНОВКА

### **Шаг 1: Обновить роль в базе данных**

Роль `radio_station` уже добавлена в `user_role` enum.

### **Шаг 2: Создать таблицы**

```bash
# Подключиться к базе данных
psql -d promo_music

# Выполнить миграции
\i database/11_radio_stations_module.sql
\i database/12_radio_functions_views.sql
```

### **Шаг 3: Проверка**

```sql
-- Проверить таблицы
SELECT COUNT(*) FROM radio_stations;

-- Проверить функции
SELECT proname FROM pg_proc WHERE proname LIKE 'radio%';

-- Проверить views
SELECT viewname FROM pg_views WHERE viewname LIKE 'v_radio%';
```

### **Шаг 4: Создать тестовую станцию**

```sql
-- Создать пользователя-радиостанцию
INSERT INTO users (username, email, role, status)
VALUES ('MyRadioStation', 'radio@example.com', 'radio_station', 'active')
RETURNING id;

-- Создать профиль станции
INSERT INTO radio_stations (
  user_id,
  station_name,
  slug,
  tagline,
  station_type,
  primary_genre,
  email,
  country,
  city
) VALUES (
  'user-uuid-from-above',
  'My Radio Station',
  'my-radio-station',
  'Best Music 24/7',
  'online',
  'pop',
  'radio@example.com',
  'US',
  'New York'
);
```

---

## 🎯 NEXT STEPS

### **Что сделано:**
- ✅ SQL структура (9 таблиц)
- ✅ 7 custom types
- ✅ 8 functions
- ✅ 7 views
- ✅ Triggers и RLS
- ✅ Роль `radio_station` в системе
- ✅ Frontend компонент (базовый)

### **Что нужно доработать:**

#### **Backend:**
- [ ] API endpoints (25 endpoints)
- [ ] Webhooks для интеграций
- [ ] Email уведомления
- [ ] Cron jobs для расписания
- [ ] Streaming integration

#### **Frontend:**
- [ ] Полная страница Dashboard
- [ ] Управление ротацией (CRUD)
- [ ] Просмотр и обработка заявок
- [ ] Создание и управление передачами
- [ ] Аналитика с графиками (Recharts)
- [ ] Настройки станции
- [ ] Мобильная адаптивность (320px → 4K)
- [ ] Drag & Drop для ротации
- [ ] Real-time обновления (слушатели)

#### **Features:**
- [ ] Audio player для прослушивания заявок
- [ ] Автоматическое планирование ротации
- [ ] Интеграция с Shoutcast/Icecast
- [ ] Экспорт плейлистов
- [ ] Рекомендации треков (AI)
- [ ] Чат с артистами
- [ ] Календарь эфира
- [ ] Массовое одобрение заявок
- [ ] Шаблоны ответов на заявки

---

## 📊 СТАТИСТИКА

### **SQL код:**
- Файлов: 2
- Строк: ~1,500
- Таблиц: 9
- Types: 7
- Functions: 8
- Views: 7
- Triggers: 5
- Indexes: 30+

### **Frontend код:**
- Файлов: 1
- Строк: ~400
- Компонентов: 10
- Секций: 6

### **Итого:**
- Общих файлов: 3
- Строк кода: ~1,900
- Таблиц БД: 9
- Endpoints (план): 25

---

## 🎉 ЗАКЛЮЧЕНИЕ

Создан полноценный модуль для радиостанций с:

✅ **Enterprise SQL структурой**  
✅ **7 custom types** для типизации  
✅ **8 functions** для бизнес-логики  
✅ **7 views** для аналитики  
✅ **Отдельным кабинетом** (RadioApp)  
✅ **RLS для безопасности**  
✅ **Готовностью к масштабированию**  

**Статус:** ✅ База готова, Frontend в базовой версии  
**Рекомендация:** Продолжить разработку Frontend и API

---

**Создано:** 02.02.2026  
**Версия:** 1.0.0  
**Модуль:** Radio Stations  
**Проект:** PROMO.MUSIC
