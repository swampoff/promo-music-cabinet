# 🚀 DEPLOYMENT GUIDE - Promo.Music Artist Cabinet

Полное руководство по деплою на Supabase

---

## 📋 Содержание

1. [Предварительные требования](#предварительные-требования)
2. [Деплой SQL миграций](#деплой-sql-миграций)
3. [Деплой Edge Functions](#деплой-edge-functions)
4. [Настройка переменных окружения](#настройка-переменных-окружения)
5. [Проверка работы](#проверка-работы)

---

## 🔧 Предварительные требования

### 1. Установите Supabase CLI

```bash
# macOS / Linux
brew install supabase/tap/supabase

# Windows (через Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Войдите в Supabase

```bash
supabase login
```

### 3. Свяжите проект с Supabase

```bash
# В корне проекта
supabase link --project-ref <YOUR_PROJECT_ID>
```

---

## 💾 Деплой SQL миграций

### Список всех миграций:

1. `001_initial_schema.sql` - Базовая структура (KV store)
2. `001_promotion_tables.sql` - Таблицы продвижения
3. `002_row_level_security.sql` - RLS политики
4. `003_content_and_media.sql` - Контент и медиа
5. `004_social_and_engagement.sql` - Социальные функции
6. `005_donations_and_coins.sql` - Донаты и коины
7. `20260126_create_concerts_tables.sql` - Система концертов
8. `20260127_create_banner_ads_tables.sql` - Баннерная реклама
9. `20260127_payments_system.sql` - **Финансовая система** (самая важная!)

### Деплой всех миграций:

```bash
# Из корня проекта
supabase db push
```

**Или по отдельности:**

```bash
# Выполнить в Supabase Dashboard -> SQL Editor
cat supabase/migrations/20260127_payments_system.sql | pbcopy
```

Затем вставьте в SQL Editor и запустите.

---

## ⚡ Деплой Edge Functions

### 1. Деплой основного сервера

```bash
# Деплой всех функций
supabase functions deploy make-server-84730125

# Или деплой конкретной функции
supabase functions deploy make-server-84730125 --no-verify-jwt
```

### 2. Установка переменных окружения для функций

```bash
# Устанавливаем секреты
supabase secrets set SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
```

### 3. Проверка деплоя

```bash
# Список задеплоенных функций
supabase functions list

# Логи функции
supabase functions logs make-server-84730125
```

---

## 🔐 Настройка переменных окружения

### Frontend переменные (в `.env`)

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
```

### Backend переменные (Supabase Secrets)

```bash
# Обязательные секреты
supabase secrets set SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
supabase secrets set SUPABASE_DB_URL="<YOUR_DB_CONNECTION_STRING>"

# Опциональные секреты (если используете)
supabase secrets set ORCHESTRATOR="<YOUR_ORCHESTRATOR_KEY>"
supabase secrets set PROMOFM="<YOUR_PROMOFM_KEY>"
```

---

## ✅ Проверка работы

### 1. Проверка Edge Function

```bash
curl https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/make-server-84730125/health \
  -H "Authorization: Bearer <YOUR_ANON_KEY>"
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T..."
}
```

### 2. Проверка базы данных

В Supabase Dashboard -> SQL Editor:

```sql
-- Проверка таблиц
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'make_%'
ORDER BY tablename;

-- Проверка демо данных
SELECT * FROM make_user_balances_84730125 WHERE user_id = 'artist_demo_001';
```

### 3. Проверка Storage Buckets

```bash
# Получить список бакетов
curl https://<YOUR_PROJECT_ID>.supabase.co/storage/v1/bucket \
  -H "Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>"
```

**Ожидаемые бакеты:**
- `make-84730125-artists`
- `make-84730125-tracks`
- `make-84730125-videos`
- `make-84730125-covers`
- `make-84730125-avatars`
- `make-84730125-banners`
- `make-84730125-receipts`
- `make-84730125-documents`

---

## 🎯 API Endpoints

После деплоя доступны следующие endpoints:

### Health Check
```
GET /make-server-84730125/health
```

### Платежи
```
GET    /make-server-84730125/payments/transactions/:userId
POST   /make-server-84730125/payments/transaction
GET    /make-server-84730125/payments/balance/:userId
POST   /make-server-84730125/payments/withdraw
GET    /make-server-84730125/payments/methods/:userId
POST   /make-server-84730125/payments/method
```

### Баннеры
```
GET    /make-server-84730125/banner/list/:userId
POST   /make-server-84730125/banner/submit
GET    /make-server-84730125/banner/:id
PUT    /make-server-84730125/banner/:id
DELETE /make-server-84730125/banner/:id
```

### Концерты
```
GET    /make-server-84730125/concerts/:userId
POST   /make-server-84730125/concerts
PUT    /make-server-84730125/concerts/:id
DELETE /make-server-84730125/concerts/:id
```

### Продвижение
```
POST   /make-server-84730125/promotion/pitching/submit
GET    /make-server-84730125/promotion/pitching/:userId
```

### Уведомления
```
GET    /make-server-84730125/notifications-messenger/user/:userId
POST   /make-server-84730125/notifications-messenger/mark-read
```

### Подписки
```
GET    /make-server-84730125/subscriptions/:userId
POST   /make-server-84730125/subscriptions/subscribe
POST   /make-server-84730125/subscriptions/cancel
```

---

## 🐛 Troubleshooting

### Проблема: "Function not found"

```bash
# Переделать деплой
supabase functions deploy make-server-84730125 --no-verify-jwt
```

### Проблема: "Database connection failed"

Проверьте переменные окружения:
```bash
supabase secrets list
```

### Проблема: "Storage bucket not found"

Функция создаёт бакеты автоматически при первом запуске. Вызовите:
```bash
curl https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/make-server-84730125/health
```

### Логи для отладки

```bash
# Смотреть логи в реальном времени
supabase functions logs make-server-84730125 --tail

# История логов
supabase functions logs make-server-84730125 --limit 100
```

---

## 📊 Мониторинг

### Supabase Dashboard

1. **Database** -> Проверить таблицы и данные
2. **Storage** -> Проверить бакеты
3. **Edge Functions** -> Мониторинг вызовов и логов
4. **Logs** -> SQL логи и ошибки

### Metrics API

```bash
# Статистика вызовов
curl https://<YOUR_PROJECT_ID>.supabase.co/rest/v1/rpc/get_function_stats \
  -H "apikey: <YOUR_SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>"
```

---

## 🎉 Готово!

После успешного деплоя ваше приложение полностью работает на Supabase с:

- ✅ 4 основными таблицами платежей
- ✅ 10+ API endpoints
- ✅ Автоматическими триггерами и функциями
- ✅ RLS безопасностью
- ✅ Storage бакетами
- ✅ Edge Functions сервером

**Следующий шаг:** Обновите `projectId` и `publicAnonKey` в `/utils/supabase/info.tsx` вашего frontend!

---

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи: `supabase functions logs make-server-84730125`
2. Проверьте SQL: Supabase Dashboard -> SQL Editor
3. Проверьте переменные: `supabase secrets list`

Хорошего деплоя! 🚀
