# 🚀 ПРИМЕНИТЬ ВСЕ SQL МИГРАЦИИ

## 📋 Обзор

Пошаговая инструкция по применению всех SQL миграций для полного развёртывания базы данных promo.music.

**Всего миграций:** 17  
**Всего таблиц:** 75+  
**Время применения:** ~5-10 минут  
**Требования:** PostgreSQL 13+, Supabase

---

## ⚠️ ВАЖНО ПЕРЕД НАЧАЛОМ

1. **Бэкап:** Создайте резервную копию БД если она уже существует
2. **Права доступа:** Используйте Service Role Key (не Anon Key)
3. **Порядок:** Строго следуйте порядку миграций
4. **Проверка:** После каждого шага проверяйте успешность
5. **Время:** Не прерывайте процесс

---

## 🎯 Способ 1: Через Supabase Dashboard (рекомендуется)

### Подготовка:

1. Откройте [Supabase Dashboard](https://supabase.com)
2. Войдите в свой проект
3. Перейдите в **SQL Editor**
4. Откройте папку `/supabase/migrations/` в вашем проекте

### Применение миграций:

#### 📦 ШАГ 1: Базовые таблицы

```sql
-- 1.1. Базовая схема (артисты, концерты, уведомления)
-- Файл: /supabase/migrations/001_initial_schema.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 1.2. Контент и медиа (треки, видео, плейлисты)
-- Файл: /supabase/migrations/003_content_and_media.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 1.3. Социальное взаимодействие (подписчики, лайки, комментарии)
-- Файл: /supabase/migrations/004_social_and_engagement.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 1.4. Донаты и коины
-- Файл: /supabase/migrations/005_donations_and_coins.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 1.5. Продвижение (питчинг, production, маркетинг, PROMO Lab base)
-- Файл: /supabase/migrations/001_promotion_tables.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка Шага 1:**
```sql
SELECT COUNT(*) as базовых_таблиц 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Ожидается: ~25-30 таблиц
```

---

#### 🔒 ШАГ 2: Безопасность и расширения

```sql
-- 2.1. Row Level Security
-- Файл: /supabase/migrations/002_row_level_security.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 2.2. Медиа и PR расширения
-- Файл: /supabase/migrations/006_media_pr_extended.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 2.3. Event Management расширения
-- Файл: /supabase/migrations/007_event_management_extended.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 2.4. Концерты и туры
-- Файл: /supabase/migrations/20260126_create_concerts_tables.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 2.5. Система платежей
-- Файл: /supabase/migrations/20260127_payments_system.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

```sql
-- 2.6. Тест трека
-- Файл: /supabase/migrations/20260128_track_test_system.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка Шага 2:**
```sql
SELECT COUNT(*) as всех_таблиц 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Ожидается: ~40-45 таблиц
```

---

#### ⭐ ШАГ 3: Новые системы 2026

```sql
-- 3.1. Баннерная реклама (3 таблицы, аналитика, события)
-- Файл: /supabase/migrations/20260127_create_banner_ads_tables.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'banner%';
-- Ожидается: banner_ads, banner_events, banner_analytics_daily
```

```sql
-- 3.2. PROMO Lab расширенный (5 таблиц, AI инсайты, метрики)
-- Файл: /supabase/migrations/20260128_promo_lab_extended.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'promo_lab%';
-- Ожидается: 5 таблиц
```

```sql
-- 3.3. Система аналитики (8 таблиц, география, источники, AI)
-- Файл: /supabase/migrations/20260128_analytics_system.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'analytics%';
-- Ожидается: 8 таблиц
```

```sql
-- 3.4. Система подписок (5 таблиц, 5 уровней, автопродление)
-- Файл: /supabase/migrations/20260128_subscription_system.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'subscription%' OR table_name LIKE 'user_subscriptions%';
-- Ожидается: 5 таблиц

SELECT COUNT(*) as планов FROM subscription_plans;
-- Ожидается: 5 планов (FREE, BASIC, START, PRO, ЭЛИТ)
```

```sql
-- 3.5. Настройки и профиль (6 таблиц, верификация, соцсети)
-- Файл: /supabase/migrations/20260128_settings_and_profile.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN (
  'user_profiles', 'user_settings', 'social_links', 
  'verification_requests', 'user_preferences', 'sessions'
);
-- Ожидается: 6 таблиц
```

```sql
-- 3.6. Питчинг расширенный (5 таблиц, каналы, аналитика, плейлисты)
-- Файл: /supabase/migrations/20260128_pitching_extended.sql
```
▶️ Скопируйте → Вставьте → Run → ✅ Проверьте

**✅ Проверка:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'pitching%';
-- Ожидается: 7 таблиц (2 базовые + 5 новых)

SELECT COUNT(*) as каналов FROM pitching_channels;
-- Ожидается: 9 предзагруженных каналов
```

**✅ Финальная проверка Шага 3:**
```sql
SELECT COUNT(*) as всего_таблиц 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Ожидается: 75+ таблиц
```

---

## ✅ Финальная проверка всей БД

### 1. Все таблицы:
```sql
SELECT 
  schemaname,
  COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;
```
**Ожидается:** 75+ таблиц

### 2. Все функции:
```sql
SELECT COUNT(*) as total_functions
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';
```
**Ожидается:** 25+ функций

### 3. Все views:
```sql
SELECT COUNT(*) as total_views
FROM information_schema.views
WHERE table_schema = 'public';
```
**Ожидается:** 15+ views

### 4. RLS включён:
```sql
SELECT 
  COUNT(DISTINCT tablename) as tables_with_rls
FROM pg_policies
WHERE schemaname = 'public';
```
**Ожидается:** 30+ таблиц с RLS

### 5. Индексы:
```sql
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';
```
**Ожидается:** 200+ индексов

---

## 🎯 Способ 2: Через Supabase CLI

### Требования:
```bash
# Установить Supabase CLI
npm install -g supabase

# Залогиниться
supabase login

# Линковать проект
supabase link --project-ref YOUR_PROJECT_ID
```

### Применение:
```bash
# Применить все миграции
supabase db push

# Проверить статус
supabase db diff
```

---

## 🎯 Способ 3: Автоматический скрипт (Bash)

Создайте файл `apply_all_migrations.sh`:

```bash
#!/bin/bash

SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

MIGRATIONS=(
  "001_initial_schema.sql"
  "003_content_and_media.sql"
  "004_social_and_engagement.sql"
  "005_donations_and_coins.sql"
  "001_promotion_tables.sql"
  "002_row_level_security.sql"
  "006_media_pr_extended.sql"
  "007_event_management_extended.sql"
  "20260126_create_concerts_tables.sql"
  "20260127_payments_system.sql"
  "20260128_track_test_system.sql"
  "20260127_create_banner_ads_tables.sql"
  "20260128_promo_lab_extended.sql"
  "20260128_analytics_system.sql"
  "20260128_subscription_system.sql"
  "20260128_settings_and_profile.sql"
  "20260128_pitching_extended.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  echo "📦 Applying: $migration"
  
  psql "$SUPABASE_URL" \
    -f "./supabase/migrations/$migration"
  
  if [ $? -eq 0 ]; then
    echo "✅ Success: $migration"
  else
    echo "❌ Failed: $migration"
    exit 1
  fi
  
  sleep 1
done

echo "🎉 All migrations applied successfully!"
```

Запуск:
```bash
chmod +x apply_all_migrations.sh
./apply_all_migrations.sh
```

---

## 🐛 Решение проблем

### Ошибка: "relation already exists"
**Причина:** Таблица уже существует  
**Решение:** Используются `CREATE TABLE IF NOT EXISTS`, безопасно

### Ошибка: "permission denied"
**Причина:** Недостаточно прав  
**Решение:** Используйте Service Role Key

### Ошибка: "foreign key constraint"
**Причина:** Неправильный порядок миграций  
**Решение:** Следуйте порядку из этой инструкции

### Ошибка: "syntax error"
**Причина:** Не весь код скопирован  
**Решение:** Скопируйте весь файл целиком

### Таблицы созданы, но нет данных
**Причина:** Предзагрузка не выполнена  
**Решение:** 
- Для подписок: проверьте `subscription_plans`
- Для каналов: проверьте `pitching_channels`

---

## 📊 Что дальше?

### 1. Создайте тестового пользователя:
```sql
-- Через Supabase Auth или вручную
INSERT INTO user_profiles (
  user_id, display_name, email
) VALUES (
  'test_user_001',
  'Тестовый Артист',
  'test@promo.fm'
);
```

### 2. Создайте тестовые данные:
```sql
-- Трек
INSERT INTO tracks (
  id, artist_id, title, genre, status
) VALUES (
  gen_random_uuid(),
  'test_user_001',
  'Тестовый трек',
  'Pop',
  'published'
);

-- Подписка
INSERT INTO user_subscriptions (
  user_id, plan_id, status, 
  current_period_start, current_period_end
) VALUES (
  'test_user_001',
  'free',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
);
```

### 3. Проверьте views:
```sql
-- Подписка с деталями
SELECT * FROM user_subscriptions_detailed 
WHERE user_id = 'test_user_001';

-- Топ каналы для питчинга
SELECT * FROM pitching_top_channels LIMIT 10;

-- Активные инсайты
SELECT * FROM analytics_active_insights 
WHERE artist_id = 'test_user_001';
```

### 4. Настройте cron jobs (опционально):
```sql
-- Истечение баннеров (каждый час)
SELECT cron.schedule(
  'expire-banners',
  '0 * * * *',
  $$ SELECT expire_banner_ads(); $$
);

-- Истечение подписок (каждый день в 01:00)
SELECT cron.schedule(
  'expire-subscriptions',
  '0 1 * * *',
  $$ SELECT expire_subscriptions(); $$
);

-- Очистка сессий (каждый день в 02:00)
SELECT cron.schedule(
  'cleanup-sessions',
  '0 2 * * *',
  $$ SELECT cleanup_expired_sessions(); $$
);
```

---

## 📚 Документация

После применения всех миграций изучите:

1. **`/SQL_MIGRATIONS_COMPLETE.md`** - Полный каталог
2. **`/docs/BANNER_ADS_SQL_REFERENCE.md`** - Баннерная реклама
3. **`/docs/PROMO_LAB_SQL_REFERENCE.md`** - PROMO Lab
4. **`/BANNER_SQL_QUICK_START.md`** - Быстрый старт баннеры
5. **`/PROMO_LAB_SQL_QUICK_START.md`** - Быстрый старт PROMO Lab

---

## ✅ Чеклист готовности

- [ ] Все 17 миграций применены
- [ ] 75+ таблиц созданы
- [ ] 25+ функций работают
- [ ] 15+ views доступны
- [ ] 200+ индексов созданы
- [ ] 50+ RLS политик включены
- [ ] 5 планов подписок загружены
- [ ] 9 каналов питчинга загружены
- [ ] Тестовый пользователь создан
- [ ] Views возвращают данные
- [ ] Cron jobs настроены (опционально)

---

## 🎉 Готово!

База данных promo.music полностью развёрнута!

**Что получено:**
- ✅ 75+ таблиц
- ✅ 11+ разделов функционала
- ✅ 5 систем монетизации
- ✅ AI инсайты и аналитика
- ✅ Полная безопасность (RLS)
- ✅ Автоматизация (триггеры, функции)
- ✅ Масштабируемость (индексы, партиции)

**Статус:** ✅ Production Ready  
**Версия:** 1.0  
**Дата:** 28 января 2026

---

**Следующий шаг:** Интеграция с Frontend и Backend! 🚀
