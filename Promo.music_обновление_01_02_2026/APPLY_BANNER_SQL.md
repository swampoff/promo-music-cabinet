# 🚀 ПРИМЕНИТЬ SQL ДЛЯ БАННЕРНОЙ РЕКЛАМЫ

## ✅ Что будет создано

После применения миграции в вашей базе данных появятся:

### 📦 3 таблицы:
1. **`banner_ads`** - Баннерные кампании (основная таблица)
2. **`banner_events`** - События баннеров (показы и клики)
3. **`banner_analytics_daily`** - Дневная аналитика

### 📊 2 представления (views):
1. **`banner_ads_with_stats`** - Баннеры с расчётными метриками
2. **`banner_ads_top_performers`** - Топ баннеры по CTR

### ⚡ 3 функции:
1. **`update_banner_ads_updated_at()`** - Автообновление временных меток
2. **`expire_banner_ads()`** - Автоматическое истечение баннеров
3. **`calculate_banner_ctr()`** - Автоматический расчёт CTR

### 🔄 2 триггера:
1. Автообновление `updated_at` при изменении
2. Автоматический расчёт CTR в аналитике

### 🔒 RLS политики:
- Пользователи видят только свои баннеры
- Админы видят всё
- Защита от изменения статуса

---

## 📁 Файл миграции

```
/supabase/migrations/20260127_create_banner_ads_tables.sql
```

**Размер:** ~385 строк кода  
**Дата создания:** 27 января 2026  
**Версия:** 1.0

---

## 🎯 Способ 1: Через Supabase Dashboard (рекомендуется)

### Шаг 1: Откройте Dashboard
1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в свой проект
3. Откройте раздел **SQL Editor** (в левом меню)

### Шаг 2: Создайте новый запрос
1. Нажмите **New Query**
2. Дайте название: `Banner Ads Migration`

### Шаг 3: Скопируйте код
1. Откройте файл `/supabase/migrations/20260127_create_banner_ads_tables.sql`
2. Скопируйте **весь код** (Ctrl+A → Ctrl+C)
3. Вставьте в SQL Editor

### Шаг 4: Выполните
1. Нажмите **Run** (или Ctrl+Enter)
2. Дождитесь завершения (~2-3 секунды)

### ✅ Проверка:
Вы увидите сообщение:
```
✅ Banner Ads tables created successfully
📊 Tables: banner_ads, banner_events, banner_analytics_daily
🔒 RLS policies enabled
⚡ Triggers and functions ready
```

---

## 🎯 Способ 2: Через Supabase CLI

### Требования:
- Установлен [Supabase CLI](https://supabase.com/docs/guides/cli)
- Вы находитесь в корне проекта

### Команда:
```bash
supabase db push
```

### Что произойдёт:
1. CLI прочитает все файлы из `/supabase/migrations/`
2. Применит миграции в правильном порядке
3. Создаст все таблицы и объекты

### ✅ Проверка:
```bash
supabase db diff
```
Не должно быть различий.

---

## 🎯 Способ 3: Через API (автоматизация)

### Если у вас есть endpoint для миграций:

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/run-migration \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "migrationName": "20260127_create_banner_ads_tables"
  }'
```

**Замените:**
- `YOUR_PROJECT_ID` - ID вашего проекта
- `YOUR_ANON_KEY` - Anon key из настроек

---

## 🔍 Проверка установки

### После применения выполните эти запросы:

#### 1. Проверить таблицы:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'banner%'
ORDER BY table_name;
```

**Ожидается:**
```
banner_ads
banner_analytics_daily
banner_events
```

#### 2. Проверить views:
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'banner%'
ORDER BY table_name;
```

**Ожидается:**
```
banner_ads_top_performers
banner_ads_with_stats
```

#### 3. Проверить функции:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%banner%'
ORDER BY routine_name;
```

**Ожидается:**
```
calculate_banner_ctr
expire_banner_ads
update_banner_ads_updated_at
```

#### 4. Проверить индексы:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename LIKE 'banner%'
ORDER BY indexname;
```

**Ожидается:** ~10 индексов

#### 5. Проверить RLS:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'banner%'
ORDER BY tablename, policyname;
```

**Ожидается:** ~6 политик

---

## 🧪 Тест: Создание демо-баннера

После установки создайте тестовый баннер:

```sql
INSERT INTO banner_ads (
  id, 
  user_id, 
  user_email, 
  campaign_name, 
  banner_type, 
  dimensions,
  image_url, 
  target_url, 
  price, 
  duration_days, 
  status
) VALUES (
  'test_banner_001',
  auth.uid()::TEXT,  -- Ваш user_id
  'your@email.com',   -- Ваш email
  'Тестовая кампания',
  'top_banner',
  '1920x400',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=400',
  'https://promo.fm',
  150000,
  14,
  'pending_moderation'
);
```

### Проверить:
```sql
SELECT * FROM banner_ads WHERE id = 'test_banner_001';
```

### Удалить тест:
```sql
DELETE FROM banner_ads WHERE id = 'test_banner_001';
```

---

## ❌ Откат миграции (если нужно)

### Удалить всё созданное:

```sql
-- Удалить политики RLS
DROP POLICY IF EXISTS banner_ads_user_select ON banner_ads;
DROP POLICY IF EXISTS banner_ads_user_insert ON banner_ads;
DROP POLICY IF EXISTS banner_ads_user_update ON banner_ads;
DROP POLICY IF EXISTS banner_ads_admin_all ON banner_ads;
DROP POLICY IF EXISTS banner_events_user_select ON banner_events;
DROP POLICY IF EXISTS banner_analytics_user_select ON banner_analytics_daily;

-- Удалить views
DROP VIEW IF EXISTS banner_ads_top_performers;
DROP VIEW IF EXISTS banner_ads_with_stats;

-- Удалить триггеры
DROP TRIGGER IF EXISTS trigger_update_banner_ads_updated_at ON banner_ads;
DROP TRIGGER IF EXISTS trigger_calculate_banner_ctr ON banner_analytics_daily;

-- Удалить функции
DROP FUNCTION IF EXISTS update_banner_ads_updated_at();
DROP FUNCTION IF EXISTS expire_banner_ads();
DROP FUNCTION IF EXISTS calculate_banner_ctr();

-- Удалить таблицы (каскадно)
DROP TABLE IF EXISTS banner_analytics_daily CASCADE;
DROP TABLE IF EXISTS banner_events CASCADE;
DROP TABLE IF EXISTS banner_ads CASCADE;
```

---

## 🐛 Решение проблем

### Ошибка: "relation already exists"
**Причина:** Таблицы уже созданы  
**Решение:** Миграция безопасна, использует `CREATE TABLE IF NOT EXISTS`

### Ошибка: "permission denied"
**Причина:** Недостаточно прав  
**Решение:** Используйте Service Role Key, а не Anon Key

### Ошибка: "syntax error"
**Причина:** Не весь код скопирован  
**Решение:** Скопируйте весь файл целиком (385 строк)

### Миграция прошла, но RLS не работает
**Причина:** Не настроена аутентификация  
**Решение:** Проверьте, что `auth.uid()` возвращает значение

---

## 📊 Что дальше?

### 1. Настроить автоматизацию
Создайте cron job для истечения баннеров:
```sql
-- Запускать каждый час
SELECT cron.schedule(
  'expire-banners',
  '0 * * * *',  -- Каждый час
  $$ SELECT expire_banner_ads(); $$
);
```

### 2. Создать агрегацию статистики
Создайте cron job для дневной аналитики:
```sql
-- Запускать каждый день в 01:00
SELECT cron.schedule(
  'aggregate-banner-stats',
  '0 1 * * *',
  $$ 
    INSERT INTO banner_analytics_daily (banner_id, date, views, clicks, ...)
    SELECT ...
    FROM banner_events
    WHERE created_at::DATE = CURRENT_DATE - INTERVAL '1 day'
    ...
  $$
);
```

### 3. Протестировать Frontend
Откройте в браузере:
```
https://your-app.com/banner-list
```

Проверьте:
- ✅ Создание баннера
- ✅ Список баннеров
- ✅ Детали и аналитика
- ✅ Статусы и модерация

---

## 📚 Документация

### Полная документация:
- **SQL Reference:** `/docs/BANNER_ADS_SQL_REFERENCE.md`
- **Database Schema:** `/docs/BANNER_DATABASE_SCHEMA.md`
- **Quick Start:** `/BANNER_SQL_QUICK_START.md`

### Frontend компоненты:
- `/src/app/pages/BannerHub.tsx`
- `/src/app/components/banner-ad-management.tsx`
- `/src/app/components/my-banner-ads.tsx`
- `/src/app/components/banner-detail-modal.tsx`

### Backend API:
- `/supabase/functions/server/banner-routes.tsx`

---

## 💬 Поддержка

### Если что-то пошло не так:

1. **Проверьте логи Supabase:**
   - Dashboard → Logs → Database

2. **Проверьте версию PostgreSQL:**
   ```sql
   SELECT version();
   ```
   Требуется: PostgreSQL 13+

3. **Проверьте расширения:**
   ```sql
   SELECT * FROM pg_extension;
   ```
   Требуется: `uuid-ossp`, `pg_cron` (опционально)

---

## ✅ Чеклист

Перед тем как закрыть эту инструкцию:

- [ ] SQL миграция применена
- [ ] Все 3 таблицы созданы
- [ ] Views доступны
- [ ] Функции работают
- [ ] RLS политики включены
- [ ] Тестовый баннер создан и удалён
- [ ] Frontend может читать данные
- [ ] Backend API работает

---

## 🎉 Готово!

SQL структура для баннерной рекламы установлена и готова к использованию!

**Статус:** ✅ Production Ready  
**Дата:** 27 января 2026  
**Версия:** 1.0

---

**Следующий шаг:** Откройте `/BANNER_SQL_QUICK_START.md` для быстрой работы с API
