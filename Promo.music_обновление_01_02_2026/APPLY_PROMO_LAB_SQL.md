# 🚀 ПРИМЕНИТЬ SQL ДЛЯ PROMO LAB

## ✅ Что будет создано

После применения миграций в вашей базе данных появятся:

### 📦 5 таблиц:
1. **`promo_lab_experiments`** - Эксперименты (уже существует из 001_promotion_tables.sql)
2. **`promo_lab_events`** - События эксперимента (NEW)
3. **`promo_lab_metrics_daily`** - Дневная аналитика (NEW)
4. **`promo_lab_insights`** - AI инсайты (NEW)
5. **`promo_lab_resources`** - Ресурсы и материалы (NEW)

### 📊 3 представления (views):
1. **`promo_lab_experiments_with_stats`** - Эксперименты с агрегированной статистикой
2. **`promo_lab_top_performers`** - Топ эксперименты по ROI
3. **`promo_lab_active_insights`** - Активные инсайты с приоритетом

### ⚡ 3 функции:
1. **`calculate_promo_lab_metrics()`** - Автоматический расчёт метрик
2. **`log_experiment_status_change()`** - Логирование смены статуса
3. **`update_promo_lab_updated_at()`** - Обновление временных меток

### 🔄 3 триггера:
1. Автообновление `updated_at` при изменении
2. Автоматический расчёт всех производных метрик
3. Автоматическое создание события при смене статуса

### 🔒 RLS политики:
- Артисты видят только свои эксперименты
- Админы видят всё
- Защита через FK к `promo_lab_experiments`

---

## 📁 Файлы миграций

### 1. Базовая таблица (уже должна быть):
```
/supabase/migrations/001_promotion_tables.sql
```
Создаёт основную таблицу `promo_lab_experiments`

### 2. Расширенная система (NEW):
```
/supabase/migrations/20260128_promo_lab_extended.sql
```
**~650 строк кода** - полная расширенная система

---

## 🎯 Способ 1: Через Supabase Dashboard (рекомендуется)

### Шаг 1: Откройте Dashboard
1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в свой проект
3. Откройте раздел **SQL Editor** (в левом меню)

### Шаг 2: Проверьте базовую таблицу
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'promo_lab_experiments';
```

Если таблица **есть** → переходите к Шагу 3.  
Если таблицы **нет** → сначала примените `/supabase/migrations/001_promotion_tables.sql`

### Шаг 3: Создайте новый запрос
1. Нажмите **New Query**
2. Дайте название: `Promo Lab Extended`

### Шаг 4: Скопируйте код
1. Откройте файл `/supabase/migrations/20260128_promo_lab_extended.sql`
2. Скопируйте **весь код** (Ctrl+A → Ctrl+C)
3. Вставьте в SQL Editor

### Шаг 5: Выполните
1. Нажмите **Run** (или Ctrl+Enter)
2. Дождитесь завершения (~3-5 секунд)

### ✅ Проверка:
Вы увидите сообщение:
```
✅ Promo Lab Extended tables created successfully
📊 New tables: promo_lab_events, promo_lab_metrics_daily, promo_lab_insights, promo_lab_resources
🔒 RLS policies enabled
⚡ Triggers and functions ready
📈 Views created: promo_lab_experiments_with_stats, promo_lab_top_performers, promo_lab_active_insights
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
    "migrationName": "20260128_promo_lab_extended"
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
  AND table_name LIKE 'promo_lab%'
ORDER BY table_name;
```

**Ожидается:**
```
promo_lab_events
promo_lab_experiments
promo_lab_insights
promo_lab_metrics_daily
promo_lab_resources
```

#### 2. Проверить views:
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'promo_lab%'
ORDER BY table_name;
```

**Ожидается:**
```
promo_lab_active_insights
promo_lab_experiments_with_stats
promo_lab_top_performers
```

#### 3. Проверить функции:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%promo_lab%'
ORDER BY routine_name;
```

**Ожидается:**
```
calculate_promo_lab_metrics
log_experiment_status_change
update_promo_lab_updated_at
```

#### 4. Проверить индексы:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename LIKE 'promo_lab%'
ORDER BY indexname;
```

**Ожидается:** ~15 индексов

#### 5. Проверить RLS:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'promo_lab%'
ORDER BY tablename, policyname;
```

**Ожидается:** ~12 политик

---

## 🧪 Тест: Создание тестового эксперимента

После установки создайте тестовый эксперимент:

```sql
-- 1. Создать эксперимент
INSERT INTO promo_lab_experiments (
  id, 
  artist_id, 
  experiment_name, 
  experiment_type, 
  hypothesis,
  description,
  budget, 
  duration_days, 
  status
) VALUES (
  'test_exp_001',
  auth.uid()::TEXT,  -- Ваш user_id
  'Тестовый AI таргетинг',
  'ai_targeting',
  'ML алгоритмы увеличат конверсию на 30%',
  'Проверка работы AI-таргетинга',
  25000,
  14,
  'draft'
);

-- 2. Добавить метрики за день
INSERT INTO promo_lab_metrics_daily (
  experiment_id,
  date,
  reach,
  impressions,
  likes,
  comments,
  shares,
  conversions,
  spend
) VALUES (
  'test_exp_001',
  CURRENT_DATE,
  5000,
  15000,
  450,
  120,
  180,
  75,
  1785.50
);

-- 3. Добавить инсайт
INSERT INTO promo_lab_insights (
  experiment_id,
  insight_type,
  title,
  description,
  importance,
  confidence,
  ai_generated
) VALUES (
  'test_exp_001',
  'ai_recommendation',
  'Тестовый инсайт AI',
  'Рекомендация оптимизировать время публикаций',
  'high',
  87.5,
  TRUE
);

-- 4. Добавить ресурс
INSERT INTO promo_lab_resources (
  experiment_id,
  resource_type,
  title,
  description,
  file_url
) VALUES (
  'test_exp_001',
  'creative',
  'Тестовый баннер',
  'Креатив для A/B теста',
  'https://example.com/banner.jpg'
);

-- 5. Создать событие
INSERT INTO promo_lab_events (
  experiment_id,
  event_type,
  event_title,
  event_description,
  severity
) VALUES (
  'test_exp_001',
  'milestone',
  'Тестовое событие',
  'Проверка системы событий',
  'info'
);
```

### Проверить:
```sql
-- Эксперимент с агрегированной статистикой
SELECT * FROM promo_lab_experiments_with_stats 
WHERE id = 'test_exp_001';

-- Метрики (должны быть auto-calculated поля)
SELECT 
  date,
  reach,
  engagement_rate,  -- должен быть рассчитан автоматически
  conversion_rate,  -- должен быть рассчитан автоматически
  cpm, cpc, cpa    -- должны быть рассчитаны автоматически
FROM promo_lab_metrics_daily 
WHERE experiment_id = 'test_exp_001';

-- Инсайты
SELECT * FROM promo_lab_insights 
WHERE experiment_id = 'test_exp_001';

-- Ресурсы
SELECT * FROM promo_lab_resources 
WHERE experiment_id = 'test_exp_001';

-- События
SELECT * FROM promo_lab_events 
WHERE experiment_id = 'test_exp_001';
```

### Удалить тест:
```sql
DELETE FROM promo_lab_experiments WHERE id = 'test_exp_001';
-- Все связанные записи удалятся автоматически (CASCADE)
```

---

## ❌ Откат миграции (если нужно)

### Удалить расширенную систему:

```sql
-- Удалить политики RLS
DROP POLICY IF EXISTS promo_lab_events_select ON promo_lab_events;
DROP POLICY IF EXISTS promo_lab_events_insert ON promo_lab_events;
DROP POLICY IF EXISTS promo_lab_events_admin ON promo_lab_events;
DROP POLICY IF EXISTS promo_lab_metrics_select ON promo_lab_metrics_daily;
DROP POLICY IF EXISTS promo_lab_metrics_insert ON promo_lab_metrics_daily;
DROP POLICY IF EXISTS promo_lab_metrics_update ON promo_lab_metrics_daily;
DROP POLICY IF EXISTS promo_lab_metrics_admin ON promo_lab_metrics_daily;
DROP POLICY IF EXISTS promo_lab_insights_select ON promo_lab_insights;
DROP POLICY IF EXISTS promo_lab_insights_insert ON promo_lab_insights;
DROP POLICY IF EXISTS promo_lab_insights_update ON promo_lab_insights;
DROP POLICY IF EXISTS promo_lab_insights_admin ON promo_lab_insights;
DROP POLICY IF EXISTS promo_lab_resources_select ON promo_lab_resources;
DROP POLICY IF EXISTS promo_lab_resources_insert ON promo_lab_resources;
DROP POLICY IF EXISTS promo_lab_resources_update ON promo_lab_resources;
DROP POLICY IF EXISTS promo_lab_resources_delete ON promo_lab_resources;
DROP POLICY IF EXISTS promo_lab_resources_admin ON promo_lab_resources;

-- Удалить views
DROP VIEW IF EXISTS promo_lab_active_insights;
DROP VIEW IF EXISTS promo_lab_top_performers;
DROP VIEW IF EXISTS promo_lab_experiments_with_stats;

-- Удалить триггеры
DROP TRIGGER IF EXISTS trigger_update_lab_metrics_updated_at ON promo_lab_metrics_daily;
DROP TRIGGER IF EXISTS trigger_update_lab_insights_updated_at ON promo_lab_insights;
DROP TRIGGER IF EXISTS trigger_update_lab_resources_updated_at ON promo_lab_resources;
DROP TRIGGER IF EXISTS trigger_calculate_lab_metrics ON promo_lab_metrics_daily;
DROP TRIGGER IF EXISTS trigger_log_experiment_status ON promo_lab_experiments;

-- Удалить функции
DROP FUNCTION IF EXISTS calculate_promo_lab_metrics();
DROP FUNCTION IF EXISTS log_experiment_status_change();
DROP FUNCTION IF EXISTS update_promo_lab_updated_at();

-- Удалить таблицы (каскадно)
DROP TABLE IF EXISTS promo_lab_resources CASCADE;
DROP TABLE IF EXISTS promo_lab_insights CASCADE;
DROP TABLE IF EXISTS promo_lab_metrics_daily CASCADE;
DROP TABLE IF EXISTS promo_lab_events CASCADE;

-- Базовая таблица остаётся:
-- promo_lab_experiments (из 001_promotion_tables.sql)
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
**Решение:** Скопируйте весь файл целиком (~650 строк)

### Ошибка: "table promo_lab_experiments does not exist"
**Причина:** Базовая миграция не применена  
**Решение:** Сначала примените `/supabase/migrations/001_promotion_tables.sql`

### Миграция прошла, но RLS не работает
**Причина:** Не настроена аутентификация  
**Решение:** Проверьте, что `auth.uid()` возвращает значение

### Ошибка при создании триггера на promo_lab_resources
**Причина:** Опечатка в имени функции в SQL  
**Решение:** Исправлено в файле - функция должна называться `update_promo_lab_updated_at()`, а не `update_promo_lab_resources()`

---

## 📊 Что дальше?

### 1. Тестирование через Frontend
Откройте страницу PROMO Lab:
```
https://your-app.com/promotion
→ Выбрать "PROMO Lab"
```

Проверьте:
- ✅ Создание эксперимента
- ✅ Отображение списка
- ✅ Расчёт стоимости со скидкой

### 2. Настройка автоматического сбора метрик
Создайте cron job для ежедневного обновления метрик:
```sql
SELECT cron.schedule(
  'update-promo-lab-metrics',
  '0 2 * * *',  -- Каждый день в 02:00
  $$ 
    -- Ваш код сбора метрик из внешних источников
    -- (Facebook Ads API, Google Analytics API, etc.)
  $$
);
```

### 3. Интеграция с AI для генерации инсайтов
Настройте регулярную генерацию AI инсайтов:
```sql
SELECT cron.schedule(
  'generate-ai-insights',
  '0 12 * * *',  -- Каждый день в 12:00
  $$ 
    -- Вызов вашего AI endpoint для анализа метрик
    -- и создания инсайтов
  $$
);
```

---

## 📚 Документация

### Полная документация:
- **SQL Reference:** `/docs/PROMO_LAB_SQL_REFERENCE.md`
- **Database Schema:** `/docs/PROMO_LAB_DATABASE_SCHEMA.md`
- **Quick Start:** `/PROMO_LAB_SQL_QUICK_START.md`

### Frontend компонент:
- `/src/app/pages/PromotionPromoLab.tsx`

### Backend API:
- `/supabase/functions/server/promotion-routes.tsx`

---

## ✅ Чеклист

Перед тем как закрыть эту инструкцию:

- [ ] Базовая таблица `promo_lab_experiments` существует
- [ ] SQL расширенная миграция применена
- [ ] Все 5 таблиц созданы
- [ ] 3 views доступны
- [ ] 3 функции работают
- [ ] 3 триггера активны
- [ ] RLS политики включены (проверить pg_policies)
- [ ] Тестовый эксперимент создан
- [ ] Метрики автоматически рассчитываются
- [ ] События логируются
- [ ] Инсайты добавляются
- [ ] Ресурсы сохраняются
- [ ] Тестовые данные удалены
- [ ] Frontend может читать данные
- [ ] Backend API работает

---

## 🎉 Готово!

SQL структура для PROMO Lab установлена и готова к использованию!

**Система включает:**
- 🧪 5 типов экспериментов (AI, вирусные, NFT, коллаборации, кастомные)
- 📊 20+ метрик с автоматическим расчётом
- 🤖 AI инсайты и рекомендации
- 🦠 Вирусные метрики (K-factor, trending)
- 📦 Управление ресурсами
- 📅 Хронология событий
- 💰 ROI и cost аналитика

**Статус:** ✅ Production Ready  
**Дата:** 28 января 2026  
**Версия:** 1.0

---

**Следующий шаг:** Откройте `/PROMO_LAB_SQL_QUICK_START.md` для быстрого начала работы
