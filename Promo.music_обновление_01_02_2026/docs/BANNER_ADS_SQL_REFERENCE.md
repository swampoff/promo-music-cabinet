# 🎯 БАННЕРНАЯ РЕКЛАМА - SQL СТРУКТУРА

## 📋 Обзор

Полная SQL структура для системы баннерной рекламы с аналитикой, модерацией и автоматизацией.

**Файл миграции:** `/supabase/migrations/20260127_create_banner_ads_tables.sql`

---

## 🗄️ Таблицы

### 1️⃣ **`banner_ads`** - Основные данные

Хранит информацию о баннерных кампаниях.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | TEXT | Primary key |
| `user_id` | TEXT | ID пользователя (артиста) |
| `user_email` | TEXT | Email пользователя |
| `campaign_name` | TEXT | Название кампании |
| `banner_type` | TEXT | Тип: `top_banner`, `sidebar_large`, `sidebar_small` |
| `dimensions` | TEXT | Размеры: `1920x400`, `300x600`, `300x250` |
| `image_url` | TEXT | URL изображения баннера |
| `target_url` | TEXT | Куда ведёт клик |
| `price` | INTEGER | Стоимость кампании в рублях |
| `duration_days` | INTEGER | Длительность (1-90 дней) |
| `start_date` | TIMESTAMP | Дата начала |
| `end_date` | TIMESTAMP | Дата окончания |
| `status` | TEXT | Статус (см. ниже) |
| `views` | INTEGER | Счётчик показов (real-time) |
| `clicks` | INTEGER | Счётчик кликов (real-time) |

#### Статусы баннера:

```
pending_moderation  → На модерации
payment_pending     → Ожидает оплаты
approved            → Одобрено модератором
active              → Активно (показывается)
expired             → Срок истёк
rejected            → Отклонено модератором
cancelled           → Отменено пользователем
```

#### Индексы:
- `idx_banner_ads_user_id` - поиск по пользователю
- `idx_banner_ads_status` - фильтр по статусу
- `idx_banner_ads_dates` - поиск по датам
- `idx_banner_ads_created` - сортировка по дате создания
- `idx_banner_ads_type` - фильтр по типу баннера

---

### 2️⃣ **`banner_events`** - События баннеров

Хранит детальные события: каждый показ и клик.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | BIGSERIAL | Primary key (автоинкремент) |
| `banner_id` | TEXT | FK → banner_ads(id) |
| `event_type` | TEXT | `view` (показ) или `click` (клик) |
| `user_agent` | TEXT | Браузер пользователя |
| `ip_address` | TEXT | IP адрес |
| `referrer` | TEXT | Откуда пришёл |
| `session_id` | TEXT | Сессия пользователя |
| `country` | TEXT | Страна (опционально) |
| `city` | TEXT | Город (опционально) |
| `created_at` | TIMESTAMP | Время события |

#### Индексы:
- `idx_banner_events_banner_id` - события конкретного баннера
- `idx_banner_events_type` - фильтр по типу события
- `idx_banner_events_created` - сортировка по времени
- `idx_banner_events_session` - поиск по сессии

**💡 Используется для:**
- Детальной аналитики
- Расчёта уникальных показов/кликов
- Обнаружения ботов
- Географического анализа

---

### 3️⃣ **`banner_analytics_daily`** - Дневная аналитика

Агрегированная статистика по дням.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | BIGSERIAL | Primary key |
| `banner_id` | TEXT | FK → banner_ads(id) |
| `date` | DATE | Дата статистики |
| `views` | INTEGER | Всего показов за день |
| `clicks` | INTEGER | Всего кликов за день |
| `unique_views` | INTEGER | Уникальные показы |
| `unique_clicks` | INTEGER | Уникальные клики |
| `ctr` | DECIMAL(5,2) | Click-through rate (%) |
| `cost_per_click` | DECIMAL(10,2) | Стоимость клика |

#### Constraint:
- `UNIQUE(banner_id, date)` - одна запись на день на баннер

#### Индексы:
- `idx_banner_analytics_banner_id` - статистика баннера
- `idx_banner_analytics_date` - сортировка по дате

**💡 Используется для:**
- Графиков аналитики по дням
- Расчёта эффективности кампаний
- Отчётов артистам

---

## ⚡ Автоматизация

### 🔄 Триггеры

#### 1. **Автообновление `updated_at`**
```sql
CREATE TRIGGER trigger_update_banner_ads_updated_at
  BEFORE UPDATE ON banner_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_ads_updated_at();
```
Автоматически обновляет поле `updated_at` при изменении баннера.

#### 2. **Автоматический расчёт CTR**
```sql
CREATE TRIGGER trigger_calculate_banner_ctr
  BEFORE INSERT OR UPDATE ON banner_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION calculate_banner_ctr();
```
Автоматически рассчитывает CTR при обновлении статистики:
```
CTR = (clicks / views) * 100
```

---

### 🛠️ Функции

#### 1. **`expire_banner_ads()`** - Истечение баннеров
```sql
SELECT expire_banner_ads();
```
Переводит активные баннеры в статус `expired`, если `end_date < NOW()`.

**Использование:** Запускать каждый час через cron job.

---

## 📊 Views (Представления)

### 1. **`banner_ads_with_stats`** - Баннеры с метриками

Расширенное представление баннеров с рассчитанными метриками:

```sql
SELECT * FROM banner_ads_with_stats;
```

**Дополнительные поля:**
- `ctr` - Click-through rate (%)
- `cost_per_click` - Стоимость клика (₽)
- `cost_per_day` - Стоимость за день (₽)
- `days_remaining` - Дней до окончания
- `days_running` - Дней с начала

---

### 2. **`banner_ads_top_performers`** - Топ баннеры

Баннеры с лучшим CTR (минимум 100 показов):

```sql
SELECT * FROM banner_ads_top_performers
ORDER BY ctr DESC
LIMIT 10;
```

**Поля:**
- `id`, `user_id`, `campaign_name`
- `banner_type`, `status`
- `views`, `clicks`, `ctr`
- `cost_per_click`

---

## 🔒 Row Level Security (RLS)

### Политики безопасности:

#### Для обычных пользователей:

1. **SELECT** - Видят только свои баннеры:
```sql
CREATE POLICY banner_ads_user_select ON banner_ads
  FOR SELECT
  USING (user_id = auth.uid()::TEXT);
```

2. **INSERT** - Могут создавать свои баннеры:
```sql
CREATE POLICY banner_ads_user_insert ON banner_ads
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);
```

3. **UPDATE** - Могут обновлять свои баннеры (кроме статуса):
```sql
CREATE POLICY banner_ads_user_update ON banner_ads
  FOR UPDATE
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (status = OLD.status);
```

#### Для администраторов:

4. **ALL** - Полный доступ ко всем баннерам:
```sql
CREATE POLICY banner_ads_admin_all ON banner_ads
  FOR ALL
  USING (auth.uid()->>'role' = 'admin');
```

---

## 💰 Тарифы (из кода)

### Типы баннеров:

| Тип | Размер | Цена/день | Описание |
|-----|--------|-----------|----------|
| **Top Banner** | 1920 × 400 px | 15 000 ₽ | Главный баннер вверху |
| **Sidebar Large** | 300 × 600 px | 12 000 ₽ | Большой боковой |
| **Sidebar Small** | 300 × 250 px | 8 000 ₽ | Малый боковой |

### Скидки по длительности:

| Длительность | Скидка |
|--------------|--------|
| 7 дней | 0% |
| 14 дней | 5% |
| 30 дней | 15% |

**Пример расчёта:**
```
Top Banner на 30 дней:
Базовая цена = 15 000 ₽ × 30 = 450 000 ₽
Скидка 15% = 67 500 ₽
Итого = 382 500 ₽
```

---

## 📈 Примеры запросов

### Получить все баннеры артиста:
```sql
SELECT * FROM banner_ads
WHERE user_id = 'artist_123'
ORDER BY created_at DESC;
```

### Получить активные баннеры:
```sql
SELECT * FROM banner_ads
WHERE status = 'active'
  AND start_date <= NOW()
  AND end_date >= NOW();
```

### Статистика баннера за последние 7 дней:
```sql
SELECT date, views, clicks, ctr
FROM banner_analytics_daily
WHERE banner_id = 'banner_123'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Общая статистика артиста:
```sql
SELECT 
  COUNT(*) as total_campaigns,
  SUM(views) as total_views,
  SUM(clicks) as total_clicks,
  ROUND(AVG(CASE WHEN views > 0 THEN (clicks::DECIMAL / views::DECIMAL) * 100 ELSE 0 END), 2) as avg_ctr,
  SUM(price) as total_spent
FROM banner_ads
WHERE user_id = 'artist_123'
  AND status IN ('active', 'expired');
```

### Топ 5 баннеров по CTR:
```sql
SELECT 
  campaign_name,
  views,
  clicks,
  ROUND((clicks::DECIMAL / views::DECIMAL) * 100, 2) as ctr
FROM banner_ads
WHERE user_id = 'artist_123'
  AND views > 100
ORDER BY ctr DESC
LIMIT 5;
```

### События баннера за сегодня:
```sql
SELECT 
  event_type,
  COUNT(*) as count,
  COUNT(DISTINCT session_id) as unique_count
FROM banner_events
WHERE banner_id = 'banner_123'
  AND created_at >= CURRENT_DATE
GROUP BY event_type;
```

---

## 🔧 Интеграция с Backend

### API endpoints в `/supabase/functions/server/banner-routes.tsx`:

1. **POST `/submit-banner`** - Создать баннер
2. **GET `/my-banners`** - Получить свои баннеры
3. **GET `/banner/:id`** - Детали баннера
4. **PATCH `/banner/:id`** - Обновить баннер
5. **DELETE `/banner/:id`** - Удалить баннер
6. **GET `/banner/:id/analytics`** - Аналитика баннера
7. **POST `/banner/:id/event`** - Записать событие (показ/клик)

---

## 🎯 Workflow баннерной кампании

```
1. Артист создаёт баннер
   ↓ status = 'pending_moderation'
   
2. Админ модерирует
   ↓ status = 'payment_pending' или 'rejected'
   
3. Артист оплачивает
   ↓ status = 'approved'
   
4. Админ активирует (устанавливает даты)
   ↓ status = 'active'
   
5. Баннер показывается пользователям
   ↓ Накапливается статистика (views, clicks)
   
6. Истекает срок (end_date < NOW())
   ↓ status = 'expired' (автоматически через expire_banner_ads())
```

---

## 📱 Интеграция с Frontend

### Компоненты:

1. **`/src/app/pages/BannerHub.tsx`** - Главная страница (табы)
2. **`/src/app/components/banner-ad-management.tsx`** - Создание баннера
3. **`/src/app/components/my-banner-ads.tsx`** - Список баннеров
4. **`/src/app/components/banner-detail-modal.tsx`** - Детали + аналитика
5. **`/src/app/components/analytics-banners.tsx`** - Графики в разделе "Аналитика"

---

## 🚀 Миграция

### Применить миграцию:

#### Вариант 1 - Через Supabase Dashboard:
1. Открыть Dashboard → SQL Editor
2. Скопировать содержимое `/supabase/migrations/20260127_create_banner_ads_tables.sql`
3. Выполнить

#### Вариант 2 - Через Supabase CLI:
```bash
supabase db push
```

#### Вариант 3 - Через API (автоматически):
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/run-migration \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"migrationName": "20260127_create_banner_ads_tables"}'
```

---

## ✅ Проверка установки

```sql
-- Проверить таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'banner%';

-- Ожидается:
-- banner_ads
-- banner_events
-- banner_analytics_daily

-- Проверить views
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'banner%';

-- Ожидается:
-- banner_ads_with_stats
-- banner_ads_top_performers

-- Проверить функции
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%banner%';

-- Ожидается:
-- update_banner_ads_updated_at
-- expire_banner_ads
-- calculate_banner_ctr
```

---

## 🧪 Тестовые данные

Раскомментировать секцию в файле миграции (строки 350-371) для создания демо-баннера:

```sql
INSERT INTO banner_ads (
  id, user_id, user_email, campaign_name, banner_type, dimensions,
  image_url, target_url, price, duration_days, status, views, clicks
) VALUES (
  'banner_demo_001',
  'artist_demo_001',
  'artist@promo.fm',
  'Новый альбом "Звёздная пыль"',
  'top_banner',
  '1920x400',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=400&fit=crop',
  '/artist/profile',
  210000,
  14,
  'active',
  145230,
  3254
);
```

---

## 📚 Связанные файлы

- **SQL:** `/supabase/migrations/20260127_create_banner_ads_tables.sql`
- **Backend:** `/supabase/functions/server/banner-routes.tsx`
- **Frontend:** `/src/app/pages/BannerHub.tsx`
- **Компоненты:** `/src/app/components/banner-*.tsx`
- **API утилиты:** `/src/utils/banner-validation.ts`

---

## 🎉 Готово!

SQL структура полностью готова к использованию. Система поддерживает:

✅ Создание баннерных кампаний  
✅ Модерацию и статусы  
✅ Real-time статистику (показы/клики)  
✅ Дневную аналитику с CTR  
✅ Детальные события для анализа  
✅ Автоматическое истечение баннеров  
✅ Row Level Security  
✅ Views для быстрой аналитики  

---

**Дата создания:** 27 января 2026  
**Версия:** 1.0  
**Статус:** ✅ Production Ready
