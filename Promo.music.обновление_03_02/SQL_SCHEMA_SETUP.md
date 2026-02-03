# 🗄️ SQL SCHEMA SETUP - PROMO.MUSIC

**Дата:** 27 января 2026  
**Версия:** 1.0  
**Автор:** AI Assistant

---

## 📋 ОГЛАВЛЕНИЕ

1. [Обзор](#обзор)
2. [Структура таблиц](#структура-таблиц)
3. [Установка через Supabase Dashboard](#установка-через-supabase-dashboard)
4. [Установка через SQL Editor](#установка-через-sql-editor)
5. [Проверка установки](#проверка-установки)
6. [Миграция данных из KV](#миграция-данных-из-kv)
7. [Row Level Security (RLS)](#row-level-security)
8. [Индексы и производительность](#индексы-и-производительность)

---

## 📊 ОБЗОР

Система продвижения Promo.Music использует **7 основных таблиц** в PostgreSQL:

| Таблица | Назначение | Записей (ожидается) |
|---------|------------|---------------------|
| `pitching_requests` | Заявки на питчинг | ~1000/месяц |
| `editor_responses` | Ответы редакторов | ~300/месяц |
| `production_360_requests` | 360° продакшн | ~200/месяц |
| `marketing_campaigns` | Маркетинговые кампании | ~500/месяц |
| `media_outreach_requests` | PR и СМИ | ~100/месяц |
| `event_requests` | Концерты и события | ~300/месяц |
| `promo_lab_experiments` | Экспериментальное продвижение | ~50/месяц |
| `promotion_transactions` | Транзакции оплаты | ~2000/месяц |

**Общий объём:** ~4500 записей/месяц

---

## 🏗️ СТРУКТУРА ТАБЛИЦ

### 1. pitching_requests

**Описание:** Заявки на питчинг треков на радио и в плейлисты

```sql
CREATE TABLE pitching_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  pitch_type TEXT NOT NULL CHECK (pitch_type IN ('standard', 'premium_direct_to_editor')),
  target_channels JSONB DEFAULT '[]'::jsonb,
  message TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_payment' 
    CHECK (status IN ('draft', 'pending_payment', 'pending_review', 'in_progress', 'completed', 'rejected', 'cancelled')),
  responses_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  added_to_rotation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_pitching_artist ON pitching_requests(artist_id);
CREATE INDEX idx_pitching_status ON pitching_requests(status);
CREATE INDEX idx_pitching_created ON pitching_requests(created_at DESC);

-- Комментарий
COMMENT ON TABLE pitching_requests IS 'Заявки на питчинг треков на радио и плейлисты';
```

**Колонки:**
- `id` - Уникальный идентификатор (формат: `pitch-timestamp-random`)
- `artist_id` - ID артиста (из auth.users)
- `track_id` - ID трека
- `track_title` - Название трека (макс 200 символов)
- `pitch_type` - Тип: `standard` или `premium_direct_to_editor`
- `target_channels` - JSON массив: `['radio', 'playlists']`
- `message` - Сообщение для редакторов (макс 2000 символов)
- `budget` - Стоимость в коинах
- `status` - Статус заявки
- `responses_count` - Количество ответов
- `interested_count` - Количество заинтересованных
- `added_to_rotation_count` - Количество добавлений в ротацию
- `created_at` - Дата создания
- `updated_at` - Дата обновления

---

### 2. editor_responses

**Описание:** Ответы редакторов на питчинг заявки

```sql
CREATE TABLE editor_responses (
  id TEXT PRIMARY KEY,
  pitching_request_id TEXT NOT NULL REFERENCES pitching_requests(id) ON DELETE CASCADE,
  editor_id TEXT NOT NULL,
  editor_name TEXT NOT NULL,
  editor_type TEXT DEFAULT 'radio' CHECK (editor_type IN ('radio', 'playlist')),
  response_type TEXT NOT NULL 
    CHECK (response_type IN ('interested', 'not_interested', 'added_to_rotation', 'need_more_info')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_editor_request ON editor_responses(pitching_request_id);
CREATE INDEX idx_editor_response_type ON editor_responses(response_type);

-- Комментарий
COMMENT ON TABLE editor_responses IS 'Ответы редакторов на заявки питчинга';
```

**Связи:**
- `pitching_request_id` → `pitching_requests.id` (CASCADE DELETE)

---

### 3. production_360_requests

**Описание:** Заявки на 360° продакшн (видео, дизайн, контент)

```sql
CREATE TABLE production_360_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  service_type TEXT NOT NULL 
    CHECK (service_type IN ('video_shooting', 'video_editing', 'cover_design', 'full_package')),
  project_title TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('draft', 'pending_payment', 'in_review', 'in_production', 'revision', 'completed', 'cancelled')),
  attachments JSONB DEFAULT '[]'::jsonb,
  team_assigned JSONB DEFAULT '{}'::jsonb,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_production_artist ON production_360_requests(artist_id);
CREATE INDEX idx_production_status ON production_360_requests(status);
CREATE INDEX idx_production_type ON production_360_requests(service_type);

-- Комментарий
COMMENT ON TABLE production_360_requests IS 'Заявки на 360° продакшн контента';
```

**Service Types:**
- `video_shooting` - Съёмка видео
- `video_editing` - Монтаж видео
- `cover_design` - Дизайн обложки
- `full_package` - Полный пакет

---

### 4. marketing_campaigns

**Описание:** Маркетинговые кампании

```sql
CREATE TABLE marketing_campaigns (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL
    CHECK (campaign_type IN ('social_ads', 'influencer', 'email', 'content', 'full_package')),
  target_audience JSONB DEFAULT '{}'::jsonb,
  budget INTEGER NOT NULL,
  duration_days INTEGER DEFAULT 30,
  platforms JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'completed', 'cancelled')),
  metrics JSONB DEFAULT '{}'::jsonb,
  roi DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- Индексы
CREATE INDEX idx_marketing_artist ON marketing_campaigns(artist_id);
CREATE INDEX idx_marketing_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_type ON marketing_campaigns(campaign_type);

-- Комментарий
COMMENT ON TABLE marketing_campaigns IS 'Маркетинговые кампании для продвижения';
```

**Platforms (JSONB):**
```json
["instagram", "facebook", "tiktok", "youtube", "vk"]
```

**Goals (JSONB):**
```json
{
  "followers": 1000,
  "streams": 10000,
  "engagement_rate": 5.5
}
```

---

### 5. media_outreach_requests

**Описание:** Заявки на PR и работу со СМИ

```sql
CREATE TABLE media_outreach_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  outreach_type TEXT NOT NULL
    CHECK (outreach_type IN ('press_release', 'interview', 'feature', 'podcast', 'full_pr')),
  topic TEXT NOT NULL,
  angle TEXT DEFAULT '',
  target_media JSONB DEFAULT '[]'::jsonb,
  budget INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('draft', 'pending_payment', 'outreach', 'scheduled', 'published', 'declined', 'cancelled')),
  publications JSONB DEFAULT '[]'::jsonb,
  reach_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_media_artist ON media_outreach_requests(artist_id);
CREATE INDEX idx_media_status ON media_outreach_requests(status);
CREATE INDEX idx_media_type ON media_outreach_requests(outreach_type);

-- Комментарий
COMMENT ON TABLE media_outreach_requests IS 'Заявки на PR и работу со СМИ';
```

**Publications (JSONB):**
```json
[
  {
    "outlet": "Music Magazine",
    "url": "https://example.com/article",
    "published_at": "2026-01-27",
    "reach": 50000
  }
]
```

---

### 6. event_requests

**Описание:** Заявки на организацию концертов и событий

```sql
CREATE TABLE event_requests (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('concert', 'festival', 'club_show', 'online_event', 'tour')),
  event_name TEXT NOT NULL,
  city TEXT,
  venue TEXT,
  event_date DATE,
  expected_audience INTEGER,
  budget INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'booking', 'confirmed', 'promotion', 'completed', 'cancelled')),
  tickets_sold INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  team JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_event_artist ON event_requests(artist_id);
CREATE INDEX idx_event_status ON event_requests(status);
CREATE INDEX idx_event_date ON event_requests(event_date);

-- Комментарий
COMMENT ON TABLE event_requests IS 'Заявки на организацию концертов и событий';
```

**Team (JSONB):**
```json
{
  "manager": "John Doe",
  "sound_engineer": "Jane Smith",
  "photographer": "Bob Johnson"
}
```

---

### 7. promo_lab_experiments

**Описание:** PROMO Lab - экспериментальное продвижение

```sql
CREATE TABLE promo_lab_experiments (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  experiment_name TEXT NOT NULL,
  experiment_type TEXT NOT NULL
    CHECK (experiment_type IN ('ai_targeting', 'viral_challenge', 'nft_drop', 'meta_collab', 'custom')),
  hypothesis TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'running', 'analyzing', 'completed', 'failed', 'cancelled')),
  metrics JSONB DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  learning TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_lab_artist ON promo_lab_experiments(artist_id);
CREATE INDEX idx_lab_status ON promo_lab_experiments(status);
CREATE INDEX idx_lab_type ON promo_lab_experiments(experiment_type);

-- Комментарий
COMMENT ON TABLE promo_lab_experiments IS 'PROMO Lab - экспериментальные кампании';
```

**Metrics (JSONB):**
```json
{
  "views": 50000,
  "engagement_rate": 8.5,
  "conversion_rate": 2.3,
  "cost_per_click": 15
}
```

---

### 8. promotion_transactions

**Описание:** Транзакции оплаты услуг продвижения

```sql
CREATE TABLE promotion_transactions (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('pitching', 'production', 'marketing', 'media', 'event', 'promo_lab')),
  reference_id TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'coins'
    CHECK (payment_method IN ('coins', 'card', 'bank_transfer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_transaction_artist ON promotion_transactions(artist_id);
CREATE INDEX idx_transaction_status ON promotion_transactions(status);
CREATE INDEX idx_transaction_reference ON promotion_transactions(reference_id);

-- Комментарий
COMMENT ON TABLE promotion_transactions IS 'Транзакции оплаты услуг продвижения';
```

---

## 🚀 УСТАНОВКА ЧЕРЕЗ SUPABASE DASHBOARD

### Способ 1: SQL Editor (Рекомендуется)

1. Откройте **Supabase Dashboard** → ваш проект
2. Перейдите в **SQL Editor** (левое меню)
3. Нажмите **New Query**
4. Скопируйте и вставьте SQL из файла `/SQL_FULL_SCHEMA.sql`
5. Нажмите **Run** (Ctrl+Enter)
6. Дождитесь выполнения (30-60 секунд)
7. Проверьте в **Table Editor**, что все 8 таблиц созданы

### Способ 2: Через код (Автоматически)

Backend автоматически создаст таблицы при первом запуске сервера.

**Файл:** `/supabase/functions/server/db-init.tsx`

**Как работает:**
1. При старте сервера вызывается `initializeDatabase()`
2. Проверяется наличие таблиц
3. Если таблиц нет - создаются
4. Логи в консоль: `✅ Database tables initialized successfully`

**Запуск вручную:**
```bash
# В Supabase Functions
deno run --allow-all /supabase/functions/server/index.tsx
```

---

## ✅ ПРОВЕРКА УСТАНОВКИ

### SQL команды для проверки:

```sql
-- 1. Проверить, что все таблицы созданы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%pitching%' 
  OR table_name LIKE '%production%'
  OR table_name LIKE '%marketing%'
  OR table_name LIKE '%media%'
  OR table_name LIKE '%event%'
  OR table_name LIKE '%promo_lab%'
  OR table_name LIKE '%transaction%';

-- 2. Проверить индексы
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN (
    'pitching_requests', 
    'editor_responses', 
    'production_360_requests',
    'marketing_campaigns',
    'media_outreach_requests',
    'event_requests',
    'promo_lab_experiments',
    'promotion_transactions'
  );

-- 3. Проверить колонки таблицы pitching_requests
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pitching_requests';

-- 4. Подсчитать записи в каждой таблице
SELECT 
  'pitching_requests' AS table, COUNT(*) FROM pitching_requests
UNION ALL SELECT 'editor_responses', COUNT(*) FROM editor_responses
UNION ALL SELECT 'production_360_requests', COUNT(*) FROM production_360_requests
UNION ALL SELECT 'marketing_campaigns', COUNT(*) FROM marketing_campaigns
UNION ALL SELECT 'media_outreach_requests', COUNT(*) FROM media_outreach_requests
UNION ALL SELECT 'event_requests', COUNT(*) FROM event_requests
UNION ALL SELECT 'promo_lab_experiments', COUNT(*) FROM promo_lab_experiments
UNION ALL SELECT 'promotion_transactions', COUNT(*) FROM promotion_transactions;
```

**Ожидаемый результат:**
```
table                      | count
---------------------------+-------
pitching_requests          | 0
editor_responses           | 0
production_360_requests    | 0
marketing_campaigns        | 0
media_outreach_requests    | 0
event_requests             | 0
promo_lab_experiments      | 0
promotion_transactions     | 0
```

---

## 🔄 МИГРАЦИЯ ДАННЫХ ИЗ KV

Если у вас уже есть данные в `kv_store_84730125`, можно мигрировать их:

```sql
-- Миграция питчинг заявок из KV в SQL
INSERT INTO pitching_requests (
  id, artist_id, track_id, track_title, pitch_type, 
  target_channels, message, budget, status, 
  responses_count, interested_count, added_to_rotation_count,
  created_at, updated_at
)
SELECT 
  value->>'id',
  value->>'artist_id',
  value->>'track_id',
  value->>'track_title',
  value->>'pitch_type',
  (value->'target_channels')::jsonb,
  value->>'message',
  (value->>'budget')::integer,
  value->>'status',
  (value->>'responses_count')::integer,
  (value->>'interested_count')::integer,
  (value->>'added_to_rotation_count')::integer,
  (value->>'created_at')::timestamptz,
  (value->>'updated_at')::timestamptz
FROM kv_store_84730125
WHERE key LIKE 'pitching:%';
```

**Проверка после миграции:**
```sql
SELECT COUNT(*) FROM pitching_requests;
-- Должно совпадать с количеством записей в KV
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

Для безопасности нужно включить RLS и создать политики:

### Включить RLS

```sql
ALTER TABLE pitching_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_360_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_outreach_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_transactions ENABLE ROW LEVEL SECURITY;
```

### Создать политики

```sql
-- Артист видит только свои заявки
CREATE POLICY "Artists can view own pitching requests"
  ON pitching_requests FOR SELECT
  USING (auth.uid()::text = artist_id);

-- Артист может создавать заявки
CREATE POLICY "Artists can create pitching requests"
  ON pitching_requests FOR INSERT
  WITH CHECK (auth.uid()::text = artist_id);

-- Артист может обновлять свои заявки
CREATE POLICY "Artists can update own pitching requests"
  ON pitching_requests FOR UPDATE
  USING (auth.uid()::text = artist_id);

-- Редакторы могут видеть все заявки (если role = 'editor')
CREATE POLICY "Editors can view all pitching requests"
  ON pitching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'editor'
    )
  );

-- Аналогично для других таблиц...
```

---

## ⚡ ИНДЕКСЫ И ПРОИЗВОДИТЕЛЬНОСТЬ

### Проверить использование индексов

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN (
  'pitching_requests',
  'editor_responses',
  'marketing_campaigns'
)
ORDER BY idx_scan DESC;
```

### Создать дополнительные индексы (если нужно)

```sql
-- Composite index для частых запросов
CREATE INDEX idx_pitching_artist_status 
  ON pitching_requests(artist_id, status);

-- Full-text search для поиска по названию
CREATE INDEX idx_pitching_title_search 
  ON pitching_requests USING GIN(to_tsvector('russian', track_title));

-- JSONB index для быстрого поиска в target_channels
CREATE INDEX idx_pitching_channels 
  ON pitching_requests USING GIN(target_channels);
```

### Анализ производительности

```sql
EXPLAIN ANALYZE
SELECT * FROM pitching_requests
WHERE artist_id = 'demo-user-123'
  AND status = 'in_progress'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📊 МОНИТОРИНГ И ОБСЛУЖИВАНИЕ

### Размер таблиц

```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%pitching%' OR tablename LIKE '%promotion%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Vacuum и Analyze (обслуживание)

```sql
-- Очистка и оптимизация
VACUUM ANALYZE pitching_requests;
VACUUM ANALYZE editor_responses;
VACUUM ANALYZE promotion_transactions;
```

### Backup

```bash
# Экспорт схемы
pg_dump -U postgres -s -t pitching_requests > pitching_schema.sql

# Экспорт данных
pg_dump -U postgres -a -t pitching_requests > pitching_data.sql
```

---

## ✅ ЧЕКЛИСТ УСТАНОВКИ

- [ ] Открыт Supabase Dashboard
- [ ] Создан новый SQL Query
- [ ] Скопирован и выполнен SQL код
- [ ] Проверено создание всех 8 таблиц
- [ ] Проверены индексы
- [ ] Включен RLS
- [ ] Созданы политики безопасности
- [ ] Протестирован INSERT/SELECT/UPDATE
- [ ] Настроен мониторинг размера
- [ ] Создан backup

---

## 🆘 TROUBLESHOOTING

### Ошибка: "relation already exists"

**Решение:**
```sql
DROP TABLE IF EXISTS pitching_requests CASCADE;
-- Затем создать заново
```

### Ошибка: "permission denied"

**Решение:**
Используйте Service Role Key, а не Anon Key

### Ошибка: "invalid input syntax for type jsonb"

**Решение:**
```sql
-- Проверить JSON синтаксис
SELECT '["radio", "playlists"]'::jsonb;
```

### Медленные запросы

**Решение:**
1. Проверить план выполнения: `EXPLAIN ANALYZE SELECT ...`
2. Добавить недостающие индексы
3. Обновить статистику: `ANALYZE tablename`

---

## 📞 ПОДДЕРЖКА

**Вопросы?**
- Документация Supabase: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

**Created by:** AI Assistant  
**Date:** 27 января 2026  
**Version:** 1.0
