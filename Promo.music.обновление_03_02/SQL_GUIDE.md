# 📊 SQL Database Structure - PROMO.MUSIC

## 🗄️ Структура базы данных

### Созданные миграции:

```
/supabase/migrations/
├── 20260128000001_core_tables.sql       # Основные таблицы
├── 20260128000002_admin_functions.sql   # SQL функции для админки
└── 20260128000003_demo_data.sql         # Демо данные
```

---

## 📋 Таблицы базы данных

### 1. **users_extended** - Расширенная таблица пользователей
```sql
Поля:
- id (UUID, PK)
- auth_user_id (FK to auth.users)
- username, display_name, email, phone
- avatar_url, bio, location, website
- role (artist, dj, label, venue, radio, tv, media, blogger, producer, sound_engineer, expert, admin)
- status (pending, active, suspended, banned)
- verified (boolean)
- social_* (Instagram, Twitter, Facebook, YouTube, TikTok, VK)
- followers_count, following_count, total_plays, total_likes
- balance, coins_balance
- subscription_tier (free, basic, pro, premium)
- subscription_expires_at
- created_at, updated_at, last_active_at

Индексы:
- role, status, email, username
```

### 2. **tracks** - Треки
```sql
Поля:
- id (UUID, PK)
- user_id (FK)
- title, artist_name, featuring
- genre, subgenre, mood, language
- audio_url, cover_url, waveform_url
- duration_seconds, bpm, key
- release_date, label, isrc, upc
- status (draft, pending, approved, rejected, published, archived)
- moderation_notes, moderated_by, moderated_at
- plays_count, likes_count, shares_count, comments_count, downloads_count
- is_monetized, price
- lyrics, credits, tags[]
- published_at, created_at, updated_at

Индексы:
- user_id, status, genre, created_at DESC
```

### 3. **videos** - Видео клипы
```sql
Поля:
- id (UUID, PK)
- user_id, track_id (FK)
- title, description
- video_url, thumbnail_url
- duration_seconds
- status (draft, pending, approved, rejected, published, archived)
- moderation_notes, moderated_by, moderated_at
- views_count, likes_count, shares_count, comments_count
- tags[]
- published_at, created_at, updated_at

Индексы:
- user_id, status, created_at DESC
```

### 4. **concerts** - Концерты
```sql
Поля:
- id (UUID, PK)
- user_id (FK)
- title, description, type
- city, venue, address
- event_date, event_time, doors_open_time
- ticket_price_from, ticket_price_to, ticket_link, capacity
- banner_url
- status (draft, pending, approved, rejected, published, cancelled, completed)
- moderation_notes, moderated_by, moderated_at
- views_count, interested_count, going_count
- is_promoted, promotion_expires_at
- created_at, updated_at

Индексы:
- user_id, status, event_date
```

### 5. **news** - Новости
```sql
Поля:
- id (UUID, PK)
- user_id (FK)
- title, preview, content, cover_url
- category (release, interview, review, announcement, event, industry, other)
- status (draft, pending, approved, rejected, published, archived)
- moderation_notes, moderated_by, moderated_at
- views_count, likes_count, shares_count, comments_count
- is_promoted, promotion_expires_at
- tags[]
- published_at, created_at, updated_at

Индексы:
- user_id, status, category, created_at DESC
```

### 6. **pitching_requests** - Заявки на питчинг
```sql
Поля:
- id (UUID, PK)
- user_id, track_id (FK)
- campaign_name
- target_channels[] (radio, playlist, blog, media, tv, influencer)
- basic_service (boolean) - 5000₽
- premium_distribution (boolean) - +15000₽
- base_price, discount_percent, final_price
- status (pending, in_progress, completed, cancelled, rejected)
- admin_notes
- channels_reached, total_plays, total_impressions
- paid, paid_at
- created_at, updated_at, completed_at

Индексы:
- user_id, status, created_at DESC
```

### 7. **transactions** - Финансовые транзакции
```sql
Поля:
- id (UUID, PK)
- user_id (FK)
- type (deposit, withdrawal, purchase, earning, refund, fee, bonus)
- amount, currency (RUB)
- description
- related_entity_type, related_entity_id
- status (pending, completed, failed, cancelled)
- payment_method, payment_id
- created_at, completed_at

Индексы:
- user_id, type, status, created_at DESC
```

### 8. **notifications** - Уведомления
```sql
Поля:
- id (UUID, PK)
- user_id (FK)
- type (system, moderation, payment, social, marketing, alert)
- title, message
- action_url, action_label
- is_read
- priority (low, normal, high, urgent)
- read_at, created_at

Индексы:
- user_id, is_read, created_at DESC
```

---

## ⚙️ SQL Функции

### 1. **get_admin_stats()** - Общая статистика
```sql
Возвращает JSON:
{
  "users": {
    "total": 2453,
    "active": 2340,
    "pending": 23,
    "new_today": 156,
    "by_role": { "artist": 1234, "dj": 567, ... }
  },
  "content": {
    "tracks_total": 18492,
    "tracks_pending": 12,
    "videos_pending": 8,
    ...
  },
  "requests": {
    "pitching_pending": 5,
    ...
  },
  "finance": {
    "total_revenue": 2400000,
    "pending_payouts": 12890,
    ...
  }
}

Использование:
SELECT get_admin_stats();
```

### 2. **get_pending_moderation()** - Контент на модерации
```sql
Возвращает JSON:
{
  "tracks": [...],
  "videos": [...],
  "concerts": [...],
  "news": [...]
}

Использование:
SELECT get_pending_moderation();
```

### 3. **moderate_track()** - Модерация трека
```sql
Параметры:
- p_track_id UUID
- p_admin_id UUID
- p_action TEXT ('approve' or 'reject')
- p_notes TEXT (опционально)

Действия:
1. Обновляет статус трека
2. Записывает заметки модератора
3. Создает уведомление пользователю

Использование:
SELECT moderate_track(
  'track-uuid',
  'admin-uuid',
  'approve',
  'Отличный трек!'
);
```

### 4. **moderate_video()** - Модерация видео
```sql
Параметры: аналогично moderate_track()

Использование:
SELECT moderate_video(
  'video-uuid',
  'admin-uuid',
  'reject',
  'Нарушение авторских прав'
);
```

### 5. **get_users_by_role()** - Получить пользователей по роли
```sql
Параметры:
- p_role TEXT (опционально)
- p_status TEXT (опционально)
- p_limit INTEGER (default: 50)
- p_offset INTEGER (default: 0)

Возвращает:
{
  "users": [...],
  "total": 1234
}

Использование:
-- Все артисты
SELECT get_users_by_role('artist');

-- Pending DJ
SELECT get_users_by_role('dj', 'pending');

-- Все активные
SELECT get_users_by_role(NULL, 'active');
```

### 6. **update_user_status()** - Обновить статус пользователя
```sql
Параметры:
- p_user_id UUID
- p_admin_id UUID
- p_status TEXT ('active', 'suspended', 'banned')
- p_reason TEXT (опционально)

Действия:
1. Обновляет статус
2. Создает уведомление

Использование:
SELECT update_user_status(
  'user-uuid',
  'admin-uuid',
  'suspended',
  'Нарушение правил'
);
```

### 7. **get_financial_stats()** - Финансовая статистика
```sql
Параметры:
- p_period TEXT ('day', 'week', 'month', 'year')

Возвращает:
{
  "revenue": 2400000,
  "payouts": 890000,
  "pending_payouts": 12890,
  "transactions_count": 5678,
  "by_type": {
    "deposit": 1500000,
    "withdrawal": 890000,
    ...
  }
}

Использование:
-- За месяц
SELECT get_financial_stats('month');

-- За неделю
SELECT get_financial_stats('week');
```

---

## 🔄 Триггеры

### Auto-update `updated_at`
```sql
Автоматически обновляет поле updated_at при изменении записи

Применяется к таблицам:
- users_extended
- tracks
- videos
- concerts
- news
- pitching_requests
```

---

## 📊 Демо данные

### Пользователи (13 штук):
- 3 артиста (1 pro, 1 basic, 1 pending)
- 2 DJ (1 premium, 1 pending)
- 2 лейбла
- 2 заведения
- 2 радиостанции
- 2 pending

### Треки (10 штук):
- Разные жанры: Electronic, Pop, Rock
- Разные статусы: pending, approved, rejected
- С реальной статистикой (plays, likes)

### Видео (5 штук):
- Официальные клипы, live session, BTS
- pending и approved

### Концерты (4 штуки):
- Разные типы: festival, concert, club
- Будущие даты
- С ценами билетов

### Новости (4 штуки):
- Релизы, анонсы, события
- pending и approved

### Pitching заявки (5 штук):
- Разные статусы
- Разные треки

### Транзакции (50 штук):
- Deposit, withdrawal, purchase, earning
- С реальными суммами

### Уведомления (20 штук):
- Разные типы
- Прочитанные и непрочитанные

---

## 🚀 Как использовать

### 1. Запустить миграции:
```bash
# В Supabase Studio:
SQL Editor → New Query → Вставить содержимое миграции → Run

# Или через CLI:
supabase migration up
```

### 2. Проверить данные:
```sql
-- Посмотреть всех пользователей
SELECT * FROM users_extended;

-- Посмотреть треки на модерации
SELECT * FROM tracks WHERE status = 'pending';

-- Получить статистику
SELECT get_admin_stats();
```

### 3. Тестировать функции:
```sql
-- Одобрить трек
SELECT moderate_track(
  (SELECT id FROM tracks WHERE status = 'pending' LIMIT 1),
  (SELECT id FROM users_extended WHERE role = 'admin' LIMIT 1),
  'approve'
);

-- Получить артистов
SELECT get_users_by_role('artist');
```

---

## 🔐 Безопасность

### RLS (Row Level Security)
TODO: Добавить политики RLS для защиты данных

```sql
-- Пример политики:
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracks"
  ON tracks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracks"
  ON tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_extended
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 📝 Заметки

1. ✅ Все таблицы созданы
2. ✅ Все индексы добавлены
3. ✅ SQL функции работают
4. ✅ Демо данные загружены
5. ⏳ TODO: RLS политики
6. ⏳ TODO: Дополнительные функции для статистики
7. ⏳ TODO: Функции для экспорта данных

---

**Версия:** 1.0.0  
**Дата:** 28 января 2026  
**Статус:** ✅ Базовая структура готова
