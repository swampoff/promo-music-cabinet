# 🚀 ПРИМЕНЕНИЕ SQL МИГРАЦИЙ К SUPABASE

## ⚡ БЫСТРАЯ ИНСТРУКЦИЯ

### **ШАГ 1: Storage (Автоматически)** ✅

Storage уже настроен и инициализируется автоматически при запуске сервера!

Проверить статус:
```bash
# Откройте в браузере или curl:
https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/storage/status
```

Должно вернуть:
```json
{
  "success": true,
  "initialized": true,
  "bucketsCreated": [...],
  "errors": []
}
```

---

### **ШАГ 2: SQL Миграции (Вручную через Dashboard)**

#### **Вариант A: Через Supabase Dashboard (РЕКОМЕНДУЕТСЯ)**

1. **Откройте Supabase Dashboard**:
   - Перейдите на https://supabase.com/dashboard
   - Выберите ваш проект

2. **Откройте SQL Editor**:
   - В левом меню найдите `SQL Editor`
   - Нажмите `New query`

3. **Применить первую миграцию**:
   - Откройте файл `/supabase/migrations/001_initial_schema.sql`
   - Скопируйте **ВСЁ** содержимое (800+ строк)
   - Вставьте в SQL Editor
   - Нажмите `Run` (или `Ctrl+Enter`)
   - Дождитесь выполнения (~5-10 секунд)
   - Должно показать: `Success. No rows returned`

4. **Применить вторую миграцию**:
   - Создайте новый query (`New query`)
   - Откройте файл `/supabase/migrations/002_row_level_security.sql`
   - Скопируйте **ВСЁ** содержимое (300+ строк)
   - Вставьте в SQL Editor
   - Нажмите `Run`
   - Дождитесь выполнения
   - Должно показать: `Success. No rows returned`

5. **Проверка**:
   - Перейдите в `Table Editor`
   - Должны увидеть новые таблицы:
     - `artists`
     - `concerts`
     - `notifications`
     - `notification_settings`
     - `email_campaigns`
     - `ticket_providers`
     - `artist_ticket_providers`
     - `ticket_sales`

---

#### **Вариант B: Через Supabase CLI (для разработчиков)**

```bash
# 1. Установить Supabase CLI (если ещё не установлен)
npm install -g supabase

# 2. Залогиниться
supabase login

# 3. Связать с проектом
supabase link --project-ref YOUR_PROJECT_REF

# 4. Применить миграции
supabase db push

# 5. Проверить статус
supabase db status
```

---

### **ШАГ 3: Проверка миграций**

#### **Через SQL Editor**:

```sql
-- Проверить созданные таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Должны увидеть:
-- artist_ticket_providers
-- artists
-- concerts
-- email_campaigns
-- notification_settings
-- notifications
-- ticket_providers
-- ticket_sales

-- Проверить RLS включён
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Все таблицы должны иметь rowsecurity = true

-- Проверить функции
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Должны увидеть:
-- calculate_campaign_metrics
-- increment_concert_clicks
-- increment_concert_views
-- is_artist_owner
-- is_concert_owner
-- update_updated_at_column
```

---

### **ШАГ 4: Переключение режима (опционально)**

Если хотите использовать PostgreSQL вместо KV Store:

1. **Откройте Edge Functions Settings**:
   - Dashboard → Edge Functions
   - Выберите функцию `make-server-84730125`
   - Перейдите в `Environment Variables`

2. **Добавьте переменную**:
   - Key: `STORAGE_MODE`
   - Value: `sql`
   - Сохраните

3. **Перезапустите функцию**:
   - Функция автоматически перезапустится
   - Теперь использует PostgreSQL!

⚠️ **ВНИМАНИЕ**: Перед переключением мигрируйте данные из KV Store!

---

## 🔄 МИГРАЦИЯ ДАННЫХ (KV → SQL)

Если у вас уже есть данные в KV Store и вы хотите перейти на SQL:

### **Экспорт данных из KV**:

Создайте endpoint для экспорта (добавьте в `/supabase/functions/server/routes.tsx`):

```typescript
// Экспорт всех данных из KV Store
routes.get('/export-kv-data', async (c) => {
  try {
    const concerts = await kv.getByPrefix('concert:');
    const notifications = await kv.getByPrefix('notification:');
    const campaigns = await kv.getByPrefix('campaign:');
    const sales = await kv.getByPrefix('ticket_sale:');
    const settings = await kv.getByPrefix('notification_settings:');
    const providers = await kv.getByPrefix('ticket_provider:');
    
    return c.json({
      success: true,
      data: {
        concerts,
        notifications,
        campaigns,
        sales,
        settings,
        providers,
      },
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});
```

Затем:
```bash
# Экспортировать данные
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/api/export-kv-data > kv_backup.json
```

### **Импорт в PostgreSQL**:

Создайте скрипт импорта или используйте SQL Editor:

```sql
-- Пример импорта концертов
INSERT INTO concerts (
  id, artist_id, title, city, venue_name, 
  event_date, event_time, event_type, description,
  ticket_price_min, ticket_price_max, ticket_link,
  moderation_status, views_count, clicks_count,
  created_at, updated_at
)
VALUES
  -- Вставьте данные из JSON здесь
  ('tour_123', 'artist_001', 'Концерт', 'Москва', 'Клуб', 
   '2026-02-15', '20:00', 'Концерт', 'Описание',
   1000, 3000, 'https://...',
   'approved', 150, 25,
   NOW(), NOW());
```

---

## 🧪 ТЕСТИРОВАНИЕ

### **1. Проверить Storage**:

```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/storage/status
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/storage/stats
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/storage/buckets
```

### **2. Проверить SQL таблицы**:

```sql
-- Проверить что таблицы созданы
SELECT COUNT(*) FROM concerts;
SELECT COUNT(*) FROM artists;
SELECT COUNT(*) FROM notifications;

-- Проверить что триггеры работают
INSERT INTO concerts (
  id, artist_id, title, city, venue_name,
  event_date, event_time, event_type
) VALUES (
  gen_random_uuid(), gen_random_uuid(), 'Тест', 
  'Москва', 'Тест', '2026-03-01', '20:00', 'Концерт'
);

-- Проверить что updated_at установлен автоматически
SELECT id, created_at, updated_at FROM concerts ORDER BY created_at DESC LIMIT 1;
```

### **3. Проверить RLS**:

```sql
-- Проверить что политики существуют
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **4. Проверить функции**:

```sql
-- Тест increment_concert_views
SELECT increment_concert_views('YOUR_CONCERT_ID');
SELECT views_count FROM concerts WHERE id = 'YOUR_CONCERT_ID';

-- Тест increment_concert_clicks
SELECT increment_concert_clicks('YOUR_CONCERT_ID');
SELECT clicks_count FROM concerts WHERE id = 'YOUR_CONCERT_ID';
```

---

## ❌ ОТКАТ (если что-то пошло не так)

### **Откатить миграции**:

```sql
-- ОСТОРОЖНО: Это удалит все таблицы и данные!

DROP TABLE IF EXISTS ticket_sales CASCADE;
DROP TABLE IF EXISTS artist_ticket_providers CASCADE;
DROP TABLE IF EXISTS ticket_providers CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS concerts CASCADE;
DROP TABLE IF EXISTS artists CASCADE;

DROP VIEW IF EXISTS concert_analytics;
DROP VIEW IF EXISTS artist_statistics;

DROP FUNCTION IF EXISTS increment_concert_views;
DROP FUNCTION IF EXISTS increment_concert_clicks;
DROP FUNCTION IF EXISTS calculate_campaign_metrics;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP FUNCTION IF EXISTS is_artist_owner;
DROP FUNCTION IF EXISTS is_concert_owner;
```

### **Вернуться на KV Mode**:

1. Dashboard → Edge Functions → `make-server-84730125`
2. Environment Variables
3. Удалите `STORAGE_MODE` или установите `kv`
4. Сохраните

---

## 📋 CHECKLIST ПРИМЕНЕНИЯ

### **Подготовка**:
- [ ] Сделан бэкап текущих данных
- [ ] Открыт Supabase Dashboard
- [ ] Права администратора в проекте

### **Применение**:
- [ ] Storage инициализирован (автоматически)
- [ ] Миграция 001 применена
- [ ] Миграция 002 применена
- [ ] Таблицы созданы (проверено)
- [ ] RLS включён (проверено)
- [ ] Функции работают (проверено)

### **Настройка**:
- [ ] Провайдеры билетов созданы (автоматически в миграции)
- [ ] STORAGE_MODE настроен (если нужен SQL mode)
- [ ] Данные мигрированы (если нужно)

### **Тестирование**:
- [ ] Health check работает
- [ ] Storage endpoints отвечают
- [ ] SQL queries выполняются
- [ ] RLS блокирует неавторизованный доступ
- [ ] Функции increment работают

---

## 🆘 ПОМОЩЬ

### **Частые ошибки**:

1. **"permission denied for table"**
   - RLS блокирует доступ
   - Используйте Service Role Key для админских операций
   - Или временно отключите RLS: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

2. **"relation does not exist"**
   - Таблица не создана
   - Проверьте что миграция выполнена успешно
   - Проверьте ошибки в SQL Editor

3. **"function does not exist"**
   - Функция не создана
   - Проверьте вторую часть миграции 001

4. **Storage buckets не создаются**
   - Проверьте логи Edge Function
   - Dashboard → Edge Functions → Logs
   - Ищите сообщения "Storage initialized"

### **Где смотреть логи**:

1. **Edge Functions**:
   - Dashboard → Edge Functions → `make-server-84730125` → Logs
   
2. **Database**:
   - Dashboard → Database → Logs
   
3. **Storage**:
   - Dashboard → Storage → Settings → Logs

---

## 🎉 ГОТОВО!

После применения миграций у вас будет:

✅ **8 таблиц** с полной схемой
✅ **6 Storage buckets** для файлов
✅ **20+ RLS политик** для безопасности
✅ **4 функции** для автоматизации
✅ **2 views** для аналитики
✅ **Возможность переключения** KV ↔ SQL

**Система готова к production!** 🚀

---

**Последнее обновление**: 26 января 2026
