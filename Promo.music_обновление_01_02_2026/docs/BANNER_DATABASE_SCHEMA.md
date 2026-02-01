# 🗂️ БАННЕРНАЯ РЕКЛАМА - СХЕМА БД

## 📊 Визуальная схема

```
┌─────────────────────────────────────────────────────────────┐
│                        BANNER_ADS                           │
│                    (Основная таблица)                       │
├─────────────────────────────────────────────────────────────┤
│ PK  id                TEXT                                  │
│     user_id           TEXT                                  │
│     user_email        TEXT                                  │
│                                                             │
│ 📋 КАМПАНИЯ:                                                │
│     campaign_name     TEXT                                  │
│     banner_type       TEXT (top/sidebar_large/small)        │
│     dimensions        TEXT (1920x400, 300x600, 300x250)     │
│                                                             │
│ 🖼️  МЕДИА:                                                  │
│     image_url         TEXT                                  │
│     target_url        TEXT                                  │
│                                                             │
│ 💰 ОПЛАТА:                                                  │
│     price             INTEGER (рубли)                       │
│     duration_days     INTEGER (1-90)                        │
│                                                             │
│ 📅 РАСПИСАНИЕ:                                              │
│     start_date        TIMESTAMP                             │
│     end_date          TIMESTAMP                             │
│                                                             │
│ 🔄 СТАТУС:                                                  │
│     status            TEXT (pending → active → expired)     │
│     rejection_reason  TEXT                                  │
│     admin_notes       TEXT                                  │
│     moderated_by      TEXT                                  │
│     moderated_at      TIMESTAMP                             │
│                                                             │
│ 📈 СТАТИСТИКА:                                              │
│     views             INTEGER (real-time)                   │
│     clicks            INTEGER (real-time)                   │
│                                                             │
│     created_at        TIMESTAMP                             │
│     updated_at        TIMESTAMP                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ FK: banner_id
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      BANNER_EVENTS                          │
│                  (События: показы/клики)                    │
├─────────────────────────────────────────────────────────────┤
│ PK  id                BIGSERIAL                             │
│ FK  banner_id         TEXT → banner_ads(id)                 │
│                                                             │
│ 📊 СОБЫТИЕ:                                                 │
│     event_type        TEXT (view/click)                     │
│                                                             │
│ 🌐 КОНТЕКСТ:                                                │
│     user_agent        TEXT                                  │
│     ip_address        TEXT                                  │
│     referrer          TEXT                                  │
│     session_id        TEXT                                  │
│                                                             │
│ 🗺️  ГЕОЛОКАЦИЯ:                                             │
│     country           TEXT                                  │
│     city              TEXT                                  │
│                                                             │
│     created_at        TIMESTAMP                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Агрегация по дням
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 BANNER_ANALYTICS_DAILY                      │
│                  (Дневная статистика)                       │
├─────────────────────────────────────────────────────────────┤
│ PK  id                BIGSERIAL                             │
│ FK  banner_id         TEXT → banner_ads(id)                 │
│     date              DATE                                  │
│                                                             │
│ 📊 МЕТРИКИ:                                                 │
│     views             INTEGER (всего за день)               │
│     clicks            INTEGER (всего за день)               │
│     unique_views      INTEGER (уникальные)                  │
│     unique_clicks     INTEGER (уникальные)                  │
│                                                             │
│ 📈 РАСЧЁТНЫЕ:                                               │
│     ctr               DECIMAL(5,2) (автоматически)          │
│     cost_per_click    DECIMAL(10,2)                         │
│                                                             │
│     created_at        TIMESTAMP                             │
│     updated_at        TIMESTAMP                             │
│                                                             │
│ UNIQUE (banner_id, date)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Связи

```
banner_ads (1) ──┬── (N) banner_events
                 │      Все события конкретного баннера
                 │      ON DELETE CASCADE
                 │
                 └── (N) banner_analytics_daily
                        Статистика по дням
                        ON DELETE CASCADE
```

---

## 📐 Индексы

### `banner_ads`:
```sql
idx_banner_ads_user_id      ON user_id
idx_banner_ads_status       ON status
idx_banner_ads_dates        ON (start_date, end_date)
idx_banner_ads_created      ON created_at DESC
idx_banner_ads_type         ON banner_type
```

### `banner_events`:
```sql
idx_banner_events_banner_id ON banner_id
idx_banner_events_type      ON event_type
idx_banner_events_created   ON created_at DESC
idx_banner_events_session   ON session_id
```

### `banner_analytics_daily`:
```sql
idx_banner_analytics_banner_id ON banner_id
idx_banner_analytics_date      ON date DESC
```

---

## 🎯 Views (Расширенные представления)

### 1. `banner_ads_with_stats`

```
banner_ads + РАСЧЁТНЫЕ МЕТРИКИ:
├── ctr = (clicks / views) * 100
├── cost_per_click = price / clicks
├── cost_per_day = price / duration_days
├── days_remaining = end_date - NOW()
└── days_running = NOW() - start_date
```

### 2. `banner_ads_top_performers`

```
Топ баннеры (views > 100) с:
├── ctr
├── cost_per_click
└── ORDER BY ctr DESC
```

---

## ⚡ Триггеры

### 1. **Auto-update `updated_at`**
```
TRIGGER: trigger_update_banner_ads_updated_at
ON: banner_ads BEFORE UPDATE
FUNCTION: update_banner_ads_updated_at()
```

### 2. **Auto-calculate CTR**
```
TRIGGER: trigger_calculate_banner_ctr
ON: banner_analytics_daily BEFORE INSERT OR UPDATE
FUNCTION: calculate_banner_ctr()
```

---

## 🔒 Row Level Security

### Политики:

#### Обычные пользователи:
```
SELECT:  WHERE user_id = auth.uid()
INSERT:  WITH CHECK user_id = auth.uid()
UPDATE:  WHERE user_id = auth.uid() 
         AND status = OLD.status (нельзя менять статус)
```

#### Администраторы:
```
ALL:     WHERE auth.uid()->>'role' = 'admin'
```

#### События и аналитика:
```
SELECT:  Только для своих баннеров (через FK)
```

---

## 🔄 Жизненный цикл баннера

```
┌─────────────────────┐
│  Создание           │
│  pending_moderation │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐     ┌─────────────┐
│  Модерация          │────→│  rejected   │
│  payment_pending    │     └─────────────┘
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Оплата             │
│  approved           │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Запуск             │
│  active             │
│  (показывается)     │
└──────────┬──────────┘
           │
           │ end_date < NOW()
           ↓
┌─────────────────────┐
│  Завершение         │
│  expired            │
└─────────────────────┘
```

**Автоматический переход:** `active` → `expired` через функцию `expire_banner_ads()`

---

## 📊 Поток данных

### Показ баннера:

```
1. Frontend запрашивает активные баннеры:
   SELECT * FROM banner_ads 
   WHERE status = 'active' AND banner_type = 'top_banner'

2. Баннер показан → создаётся событие:
   INSERT INTO banner_events (banner_id, event_type, ...)
   VALUES ('banner_123', 'view', ...)

3. Счётчик в banner_ads обновляется:
   UPDATE banner_ads SET views = views + 1 
   WHERE id = 'banner_123'

4. В конце дня агрегируется статистика:
   INSERT INTO banner_analytics_daily (banner_id, date, views, ...)
   VALUES ('banner_123', CURRENT_DATE, 1543, ...)
   ON CONFLICT (banner_id, date) DO UPDATE ...
```

### Клик по баннеру:

```
1. Пользователь кликает

2. Создаётся событие клика:
   INSERT INTO banner_events (banner_id, event_type, ...)
   VALUES ('banner_123', 'click', ...)

3. Счётчик обновляется:
   UPDATE banner_ads SET clicks = clicks + 1 
   WHERE id = 'banner_123'

4. Пользователь перенаправляется на target_url
```

---

## 💾 Размеры данных (примерная оценка)

### `banner_ads`:
```
~1 KB на баннер
10 000 баннеров = ~10 MB
```

### `banner_events`:
```
~200 bytes на событие
1 000 000 событий/день = ~200 MB/день
30 дней = ~6 GB
```
**💡 Рекомендация:** Архивировать события старше 30 дней.

### `banner_analytics_daily`:
```
~150 bytes на запись
10 000 баннеров × 365 дней = ~550 MB/год
```

---

## 🛠️ Maintenance задачи

### Ежечасно:
```sql
-- Истечение баннеров
SELECT expire_banner_ads();
```

### Ежедневно:
```sql
-- Агрегация статистики
INSERT INTO banner_analytics_daily (banner_id, date, views, clicks, ...)
SELECT 
  banner_id,
  CURRENT_DATE - INTERVAL '1 day',
  COUNT(*) FILTER (WHERE event_type = 'view'),
  COUNT(*) FILTER (WHERE event_type = 'click'),
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'view'),
  COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'click')
FROM banner_events
WHERE created_at::DATE = CURRENT_DATE - INTERVAL '1 day'
GROUP BY banner_id
ON CONFLICT (banner_id, date) DO UPDATE
SET views = EXCLUDED.views,
    clicks = EXCLUDED.clicks,
    unique_views = EXCLUDED.unique_views,
    unique_clicks = EXCLUDED.unique_clicks;
```

### Ежемесячно:
```sql
-- Архивация старых событий
DELETE FROM banner_events 
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 🎯 Оптимизация производительности

### Индексы покрывают:
✅ Поиск по пользователю (`user_id`)  
✅ Фильтр по статусу (`status`)  
✅ Поиск по датам (`start_date`, `end_date`)  
✅ Сортировка по дате создания  
✅ События конкретного баннера  

### Partitioning (для больших объёмов):
```sql
-- Разделение banner_events по месяцам:
CREATE TABLE banner_events_2026_01 PARTITION OF banner_events
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE banner_events_2026_02 PARTITION OF banner_events
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

## 📚 Связанные файлы

- **SQL:** `/supabase/migrations/20260127_create_banner_ads_tables.sql`
- **Backend:** `/supabase/functions/server/banner-routes.tsx`
- **Документация:** `/docs/BANNER_ADS_SQL_REFERENCE.md`
- **Quick Start:** `/BANNER_SQL_QUICK_START.md`

---

**Дата создания:** 27 января 2026  
**Версия:** 1.0  
**Статус:** ✅ Production Ready
