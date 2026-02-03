# 🗄️ SQL интеграция раздела "Баннерная реклама"

**Дата создания:** 27 января 2026  
**Статус:** ✅ Готово к применению

---

## 📊 Обзор

Раздел "Баннерная реклама" теперь полностью интегрирован с PostgreSQL через Supabase, что обеспечивает:
- ✅ Надёжное хранение данных
- ✅ Мощную аналитику через SQL views
- ✅ Автоматизацию через триггеры
- ✅ Интеграцию с разделом "Аналитика"

---

## 🗂️ Структура базы данных

### 1. Таблица: `banner_ads`
**Основная таблица баннерных кампаний**

```sql
CREATE TABLE banner_ads (
  -- Identity
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Campaign
  campaign_name TEXT NOT NULL,
  banner_type TEXT NOT NULL CHECK (...),
  dimensions TEXT NOT NULL,
  
  -- Media
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  
  -- Pricing
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  
  -- Schedule
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending_moderation',
  
  -- Moderation
  rejection_reason TEXT,
  admin_notes TEXT,
  moderated_by TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Индексы:**
- `idx_banner_ads_user_id` - по пользователю
- `idx_banner_ads_status` - по статусу
- `idx_banner_ads_dates` - по датам
- `idx_banner_ads_created` - по дате создания
- `idx_banner_ads_type` - по типу баннера

---

### 2. Таблица: `banner_events`
**События баннеров (показы и клики)**

```sql
CREATE TABLE banner_events (
  id BIGSERIAL PRIMARY KEY,
  banner_id TEXT NOT NULL REFERENCES banner_ads(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  
  -- Context
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  session_id TEXT,
  
  -- Location
  country TEXT,
  city TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Индексы:**
- `idx_banner_events_banner_id` - по ID баннера
- `idx_banner_events_type` - по типу события
- `idx_banner_events_created` - по дате
- `idx_banner_events_session` - по сессии

**Назначение:**
- Детальный трекинг каждого показа/клика
- Возможность аналитики по геолокации
- Расчёт уникальных метрик

---

### 3. Таблица: `banner_analytics_daily`
**Агрегированная дневная статистика**

```sql
CREATE TABLE banner_analytics_daily (
  id BIGSERIAL PRIMARY KEY,
  banner_id TEXT NOT NULL REFERENCES banner_ads(id),
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  
  -- Derived
  ctr DECIMAL(5, 2),
  cost_per_click DECIMAL(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(banner_id, date)
);
```

**Индексы:**
- `idx_banner_analytics_banner_id` - по баннеру
- `idx_banner_analytics_date` - по дате

**Назначение:**
- Быстрая аналитика по дням
- Исторические данные
- Тренды производительности

---

## ⚡ Автоматизация

### Триггер 1: Обновление `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_banner_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_banner_ads_updated_at
  BEFORE UPDATE ON banner_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_ads_updated_at();
```

**Назначение:** Автоматически обновляет `updated_at` при изменении записи

---

### Триггер 2: Расчёт CTR

```sql
CREATE OR REPLACE FUNCTION calculate_banner_ctr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.views > 0 THEN
    NEW.ctr = (NEW.clicks::DECIMAL / NEW.views::DECIMAL) * 100;
  ELSE
    NEW.ctr = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_banner_ctr
  BEFORE INSERT OR UPDATE ON banner_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION calculate_banner_ctr();
```

**Назначение:** Автоматически рассчитывает CTR при вставке/обновлении аналитики

---

### Функция: Истечение баннеров

```sql
CREATE OR REPLACE FUNCTION expire_banner_ads()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE banner_ads
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;
```

**Использование:**
```sql
-- Вызов через SQL
SELECT expire_banner_ads();

-- Вызов через Edge Function
const { data, error } = await supabase.rpc('expire_banner_ads');
```

**Назначение:** Автоматически переводит активные баннеры в `expired` при истечении срока

**Cron задача (рекомендуется):**
```bash
# Каждый час проверяем истекшие баннеры
0 * * * * curl -X POST https://your-project.supabase.co/functions/v1/make-server-84730125/banner/expire-check
```

---

## 📊 Views для аналитики

### View 1: `banner_ads_with_stats`
**Баннеры с рассчитанными метриками**

```sql
CREATE OR REPLACE VIEW banner_ads_with_stats AS
SELECT 
  ba.*,
  -- CTR
  CASE 
    WHEN ba.views > 0 THEN ROUND((ba.clicks::DECIMAL / ba.views::DECIMAL) * 100, 2)
    ELSE 0
  END as ctr,
  -- CPC (Cost Per Click)
  CASE 
    WHEN ba.clicks > 0 THEN ROUND(ba.price::DECIMAL / ba.clicks::DECIMAL, 2)
    ELSE 0
  END as cost_per_click,
  -- CPD (Cost Per Day)
  ROUND(ba.price::DECIMAL / ba.duration_days::DECIMAL, 2) as cost_per_day,
  -- Days remaining
  CASE 
    WHEN ba.status = 'active' AND ba.end_date > NOW() THEN 
      EXTRACT(DAY FROM (ba.end_date - NOW()))
    ELSE 0
  END as days_remaining,
  -- Days running
  CASE 
    WHEN ba.status = 'active' THEN
      EXTRACT(DAY FROM (NOW() - ba.start_date))
    ELSE 0
  END as days_running
FROM banner_ads ba;
```

**Использование:**
```typescript
const { data } = await supabase
  .from('banner_ads_with_stats')
  .select('*')
  .eq('user_id', userId);

// Результат включает рассчитанные поля:
// - ctr (Click-Through Rate)
// - cost_per_click
// - cost_per_day
// - days_remaining
// - days_running
```

---

### View 2: `banner_ads_top_performers`
**Топ баннеров по эффективности**

```sql
CREATE OR REPLACE VIEW banner_ads_top_performers AS
SELECT 
  ba.id,
  ba.user_id,
  ba.campaign_name,
  ba.banner_type,
  ba.status,
  ba.views,
  ba.clicks,
  CASE 
    WHEN ba.views > 0 THEN ROUND((ba.clicks::DECIMAL / ba.views::DECIMAL) * 100, 2)
    ELSE 0
  END as ctr,
  CASE 
    WHEN ba.clicks > 0 THEN ROUND(ba.price::DECIMAL / ba.clicks::DECIMAL, 2)
    ELSE 0
  END as cost_per_click,
  ba.created_at
FROM banner_ads ba
WHERE ba.status IN ('active', 'expired')
  AND ba.views > 100 -- Минимум 100 показов для статистики
ORDER BY 
  CASE 
    WHEN ba.views > 0 THEN (ba.clicks::DECIMAL / ba.views::DECIMAL)
    ELSE 0
  END DESC;
```

**Назначение:** Показывает самые эффективные баннеры по CTR

---

## 🔒 Row Level Security (RLS)

### Политики для `banner_ads`

```sql
-- Пользователь видит только свои баннеры
CREATE POLICY banner_ads_user_select ON banner_ads
  FOR SELECT
  USING (user_id = auth.uid()::TEXT);

-- Пользователь может создавать свои баннеры
CREATE POLICY banner_ads_user_insert ON banner_ads
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Пользователь может обновлять свои баннеры (но не статус)
CREATE POLICY banner_ads_user_update ON banner_ads
  FOR UPDATE
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (
    user_id = auth.uid()::TEXT 
    AND status = OLD.status -- Нельзя менять статус
  );

-- Админы видят все баннеры
CREATE POLICY banner_ads_admin_all ON banner_ads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Политики для `banner_events`

```sql
-- События баннеров - только владелец
CREATE POLICY banner_events_user_select ON banner_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM banner_ads
      WHERE banner_ads.id = banner_events.banner_id
      AND banner_ads.user_id = auth.uid()::TEXT
    )
  );
```

---

## 🔌 Backend интеграция

### Файлы

1. **`submitBannerAd-sql.tsx`** - Создание баннеров (SQL версия)
2. **`manageBannerAd-sql.tsx`** - Управление баннерами (SQL версия)
3. **`banner-routes.tsx`** - API endpoints (обновлён для SQL)

### Использование SQL версий

```typescript
// В banner-routes.tsx
import { submitBannerAd } from './submitBannerAd-sql.tsx';
import { getUserBannerAds, getAllBannerAds } from './submitBannerAd-sql.tsx';
import { 
  manageBannerAd, 
  recordBannerEvent, 
  checkAndExpireBanners 
} from './manageBannerAd-sql.tsx';
```

**Переключение между KV Store и SQL:**

```typescript
// Для прототипа (KV Store)
import { submitBannerAd } from './submitBannerAd.js';

// Для production (SQL)
import { submitBannerAd } from './submitBannerAd-sql.tsx';
```

---

## 📊 Интеграция с разделом "Аналитика"

### Компонент: `AnalyticsBanners`

**Файл:** `/src/app/components/analytics-banners.tsx`

**Функционал:**
- ✅ Обзорные карточки (всего баннеров, показы, клики, потрачено)
- ✅ График динамики показов и кликов
- ✅ График CTR (Click-Through Rate)
- ✅ Таблица производительности кампаний
- ✅ Pie chart распределения по типам

**Использование:**

```tsx
// В разделе Аналитика
import { AnalyticsBanners } from '@/app/components/analytics-banners';

<AnalyticsBanners userId={userId} />
```

### API для аналитики

```typescript
// Получить статистику пользователя
const stats = await getUserBannerStats(userId);
/*
{
  banners: [...], // Все баннеры со статистикой
  stats: {
    total_banners: 5,
    total_views: 287654,
    total_clicks: 8234,
    total_spent: 893500,
    average_ctr: 2.86,
    active_banners: 2,
  }
}
*/

// Получить дневную аналитику баннера
const daily = await getBannerDailyAnalytics(
  bannerId, 
  '2025-01-01', 
  '2025-01-31'
);
/*
[
  {
    date: '2025-01-27',
    views: 21340,
    clicks: 698,
    unique_views: 18450,
    unique_clicks: 612,
    ctr: 3.27,
    cost_per_click: 21.49,
  },
  ...
]
*/
```

---

## 🚀 Применение миграции

### Шаг 1: Применить SQL миграцию

```bash
# Через Supabase CLI
supabase migration up

# Или через Dashboard
# SQL Editor → Загрузить файл 20260127_create_banner_ads_tables.sql → Run
```

### Шаг 2: Обновить backend routes

```typescript
// В /supabase/functions/server/banner-routes.tsx
// Изменить импорты с .js на -sql.tsx

// БЫЛО:
import { submitBannerAd } from './submitBannerAd.js';

// СТАЛО:
import { submitBannerAd } from './submitBannerAd-sql.tsx';
```

### Шаг 3: Задеплоить Edge Function

```bash
supabase functions deploy make-server-84730125
```

### Шаг 4: Настроить Cron (опционально)

```bash
# Через Supabase Dashboard → Database → Cron
# Или через pg_cron:

SELECT cron.schedule(
  'expire-banners-hourly',
  '0 * * * *',
  $$SELECT expire_banner_ads()$$
);
```

---

## 📈 Преимущества SQL версии

### vs KV Store

| Критерий | KV Store | PostgreSQL |
|----------|----------|------------|
| **Запросы** | Линейный поиск | Индексированные запросы ⚡ |
| **Аналитика** | Ручная агрегация | SQL агрегация, Views 📊 |
| **Связи** | Нет | Foreign Keys, JOIN |
| **Триггеры** | Нет | Автоматизация ⚙️ |
| **Транзакции** | Нет | ACID гарантии 🔒 |
| **Масштабирование** | Ограниченное | Horizontal scaling |

---

## 🎯 Рекомендации

### Для production:

1. **Используйте SQL версию** - лучшая производительность и аналитика
2. **Настройте Cron** - автоматическое истечение баннеров
3. **Включите Connection Pooling** - для высокой нагрузки
4. **Используйте Prepared Statements** - защита от SQL injection
5. **Мониторинг** - отслеживайте slow queries

### Для прототипа:

1. **KV Store версия подходит** - простота, не требует миграций
2. **Mock данные работают** - быстрая демонстрация
3. **Переключение простое** - меняете только импорты

---

## 📋 Чеклист применения

- [ ] Применена миграция `20260127_create_banner_ads_tables.sql`
- [ ] Обновлены импорты в `banner-routes.tsx`
- [ ] Задеплоена Edge Function
- [ ] Протестированы endpoints
- [ ] Настроен Cron для автоистечения (опционально)
- [ ] Добавлен `AnalyticsBanners` в раздел Аналитика
- [ ] Проверена RLS политика
- [ ] Создан backup базы данных

---

## 🔗 Связанные документы

- `20260127_create_banner_ads_tables.sql` - SQL миграция
- `submitBannerAd-sql.tsx` - Backend логика (SQL)
- `manageBannerAd-sql.tsx` - Управление (SQL)
- `analytics-banners.tsx` - Компонент аналитики
- `BANNER_ARCHITECTURE.md` - Общая архитектура

---

**Статус:** ✅ Готово к применению  
**Дата:** 27 января 2026  
**Версия:** 1.0.0
