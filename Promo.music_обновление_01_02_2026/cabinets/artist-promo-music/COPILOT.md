# 🤖 Инструкция для Supabase Copilot

## Что нужно сделать

Привет! Мне нужно развернуть кабинет артиста в Supabase. Вот что нужно:

### 1️⃣ Создать 8 таблиц в PostgreSQL

Выполни SQL из файла `database/001_promotion_tables.sql`. Это создаст:

- ✅ `pitching_requests` - заявки на питчинг треков
- ✅ `production_360_requests` - заказы на видео/дизайн
- ✅ `marketing_campaigns` - маркетинговые кампании
- ✅ `media_outreach_requests` - обращения в СМИ  
- ✅ `event_requests` - организация концертов
- ✅ `promo_lab_experiments` - A/B тесты
- ✅ `editor_responses` - ответы редакторов
- ✅ `promotion_transactions` - транзакции с коинами

Каждая таблица включает:
- Первичный ключ `id` (uuid)
- `artist_id` (uuid) - связь с пользователем
- Временные метки `created_at`, `updated_at`
- RLS (Row Level Security) политики

### 2️⃣ Задеплоить Edge Function

Функция находится в `backend/index.tsx` с именем `make-server-84730125`.

Эта функция:
- Обрабатывает 15 API эндпоинтов для всех разделов продвижения
- Использует Hono как веб-фреймворк
- Подключается к PostgreSQL через Supabase Client
- Роуты определены в `backend/promotion-routes-sql.tsx`

### 3️⃣ Создать Storage Bucket

Создай приватный bucket с названием: `make-84730125-media`

Настройки:
- Public: `false` (приватный)
- File size limit: `52428800` (50 MB)
- Allowed MIME types: `image/*`, `video/*`, `audio/*`

### 4️⃣ Проверить Auth

Убедись что включена Email аутентификация:
- Email/Password provider: ✅ Enabled
- Email confirmation: ❌ Disabled (для прототипа)
- Опционально: Google OAuth (можно включить позже)

## Быстрые команды

Если у тебя есть доступ к CLI:

```bash
# Создать таблицы
psql $DATABASE_URL -f database/001_promotion_tables.sql

# Задеплоить функцию
supabase functions deploy make-server-84730125 \
  --import-map backend/import_map.json

# Создать bucket
supabase storage buckets create make-84730125-media \
  --public false \
  --file-size-limit 52428800
```

## Структура API

После деплоя будут доступны эндпоинты:

```
GET  /promotion/pitching/:userId
POST /promotion/pitching/submit

GET  /promotion/production360/:userId  
POST /promotion/production360/submit

GET  /promotion/marketing/:userId
POST /promotion/marketing/submit

GET  /promotion/media/:userId
POST /promotion/media/submit

GET  /promotion/event/:userId
POST /promotion/event/submit

GET  /promotion/promolab/:userId
POST /promotion/promolab/submit
```

## Переменные окружения

Функция использует стандартные Supabase env vars:
- `SUPABASE_URL` - автоматически
- `SUPABASE_ANON_KEY` - автоматически  
- `SUPABASE_SERVICE_ROLE_KEY` - автоматически
- `SUPABASE_DB_URL` - автоматически

Дополнительных переменных не требуется!

## Проверка

После деплоя проверь:

1. **Таблицы**: Dashboard → Database → Tables (должно быть 8 таблиц)
2. **Функция**: Dashboard → Edge Functions → `make-server-84730125` (статус: Active)
3. **Storage**: Dashboard → Storage → `make-84730125-media` (должен существовать)

Проверить работу API:
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/promotion/pitching/test-user-id \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Должен вернуть:
```json
{
  "success": true,
  "data": [],
  "_meta": { "needsSetup": false }
}
```

## Помощь

Если что-то пошло не так:
- SQL файл: `database/001_promotion_tables.sql`
- Backend код: `backend/index.tsx`
- Конфигурация: `deploy.config.json`

---

**Спасибо! 🚀**
