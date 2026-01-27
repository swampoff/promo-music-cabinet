# 🚀 MIGRATION GUIDE: KV Store → PostgreSQL

## 📋 ОБЗОР

Этот гайд описывает процесс миграции данных из KV Store в полноценную PostgreSQL базу данных с SQL схемой.

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### **Для Figma Make Environment**:
- ❌ SQL миграции **НЕ БУДУТ РАБОТАТЬ** в текущем Make environment
- ✅ KV Store остаётся **единственным** доступным хранилищем
- ✅ Можно использовать адаптер для переключения режимов

### **Для Production Deployment**:
- ✅ SQL миграции готовы к использованию
- ✅ Полная схема PostgreSQL создана
- ✅ RLS политики настроены
- ✅ Storage buckets можно создать программно

---

## 🗄️ АРХИТЕКТУРА ХРАНИЛИЩА

### **Режимы работы**:

1. **KV Mode** (по умолчанию в Make)
   - Данные хранятся в `kv_store_84730125`
   - Ключи в формате `prefix:id`
   - Нет SQL запросов

2. **SQL Mode** (для production)
   - Данные в PostgreSQL таблицах
   - Полноценные SQL запросы
   - Индексы, JOIN'ы, транзакции
   - RLS для безопасности

### **Database Adapter**:
Универсальный адаптер позволяет работать с обоими режимами без изменения кода API.

---

## 📊 SQL SCHEMA

### **Созданные таблицы**:

1. **artists** - профили артистов
2. **concerts** - концерты и туры
3. **notifications** - уведомления
4. **notification_settings** - настройки уведомлений
5. **email_campaigns** - email-рассылки
6. **ticket_providers** - билетные провайдеры
7. **artist_ticket_providers** - подключения к провайдерам
8. **ticket_sales** - продажи билетов

### **Views (аналитика)**:
- `concert_analytics` - аналитика концертов
- `artist_statistics` - статистика артистов

### **Functions**:
- `increment_concert_views()` - инкремент просмотров
- `increment_concert_clicks()` - инкремент кликов
- `calculate_campaign_metrics()` - расчёт метрик кампаний

---

## 🔧 ПРИМЕНЕНИЕ МИГРАЦИЙ

### **Локальная разработка (Supabase CLI)**:

```bash
# 1. Установить Supabase CLI
npm install -g supabase

# 2. Инициализировать проект
supabase init

# 3. Запустить локальную БД
supabase start

# 4. Применить миграции
supabase db push

# 5. Проверить статус
supabase db status
```

### **Production (Supabase Dashboard)**:

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Создайте новый query
4. Скопируйте содержимое `/supabase/migrations/001_initial_schema.sql`
5. Выполните миграцию
6. Повторите для `/supabase/migrations/002_row_level_security.sql`

### **Production (CLI)**:

```bash
# 1. Связать с production проектом
supabase link --project-ref your-project-ref

# 2. Применить миграции
supabase db push
```

---

## 🔄 ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ

### **Environment Variable**:

Установите `STORAGE_MODE` в Edge Functions:

```bash
# KV Mode (по умолчанию)
STORAGE_MODE=kv

# SQL Mode
STORAGE_MODE=sql
```

### **В Supabase Dashboard**:

1. Перейдите в **Edge Functions**
2. Выберите функцию `make-server-84730125`
3. Добавьте Environment Variable:
   - Key: `STORAGE_MODE`
   - Value: `sql` или `kv`
4. Сохраните и перезапустите функцию

---

## 📦 МИГРАЦИЯ ДАННЫХ

### **Экспорт из KV Store**:

```typescript
// В Edge Function или локальном скрипте
import * as kv from './kv_store.tsx';

async function exportKVData() {
  const concerts = await kv.getByPrefix('concert:');
  const notifications = await kv.getByPrefix('notification:');
  const campaigns = await kv.getByPrefix('campaign:');
  const sales = await kv.getByPrefix('ticket_sale:');
  
  return {
    concerts,
    notifications,
    campaigns,
    sales,
    exportedAt: new Date().toISOString(),
  };
}

// Сохранить в файл
const data = await exportKVData();
await Deno.writeTextFile('kv_export.json', JSON.stringify(data, null, 2));
```

### **Импорт в PostgreSQL**:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importToPostgres(data: any) {
  // Импорт концертов
  for (const concert of data.concerts) {
    await supabase.from('concerts').insert({
      id: concert.id,
      artist_id: concert.artist_id,
      title: concert.title,
      // ... остальные поля
    });
  }
  
  // Импорт уведомлений
  for (const notification of data.notifications) {
    await supabase.from('notifications').insert({
      id: notification.id,
      user_id: notification.userId,
      // ... остальные поля
    });
  }
  
  // И так далее для остальных таблиц
}
```

---

## 🗂️ SUPABASE STORAGE

### **Инициализация Storage**:

Storage создаётся **программно** в Edge Functions при первом запросе:

```typescript
// Автоматически при старте сервера
import { initializeStorage } from './storage-setup.tsx';

await initializeStorage();
```

### **Созданные buckets**:

1. `make-84730125-concert-banners` - баннеры концертов (public, 5MB)
2. `make-84730125-artist-avatars` - аватары артистов (public, 2MB)
3. `make-84730125-track-covers` - обложки треков (public, 3MB)
4. `make-84730125-audio-files` - аудио файлы (private, 50MB)
5. `make-84730125-video-files` - видео файлы (private, 200MB)
6. `make-84730125-campaign-attachments` - вложения кампаний (private, 10MB)

### **Проверка статуса Storage**:

```bash
# Через API
curl https://your-project.supabase.co/functions/v1/make-server-84730125/storage/status

# Ответ:
{
  "success": true,
  "initialized": true,
  "bucketsCreated": [
    "make-84730125-concert-banners",
    "make-84730125-artist-avatars"
  ],
  "errors": []
}
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Основные политики**:

#### **Concerts**:
- ✅ Артист может управлять своими концертами
- ✅ Public может видеть одобренные концерты
- ❌ Public не может видеть черновики

#### **Notifications**:
- ✅ Пользователь видит только свои уведомления
- ✅ Может отмечать как прочитанные
- ✅ Может удалять свои уведомления

#### **Email Campaigns**:
- ✅ Артист управляет своими кампаниями
- ❌ Другие артисты не видят чужие кампании

#### **Ticket Sales**:
- ✅ Артист видит продажи своих концертов
- ❌ Не видит продажи других артистов

### **Тестирование RLS**:

```sql
-- Установить пользователя для тестирования
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"artist-uuid-here"}';

-- Проверить доступ
SELECT * FROM concerts;
-- Должен вернуть только концерты этого артиста

-- Сбросить
RESET ROLE;
```

---

## 📈 ПРОИЗВОДИТЕЛЬНОСТЬ

### **Индексы**:

Все критичные поля проиндексированы:

```sql
-- Примеры индексов
CREATE INDEX idx_concerts_artist_id ON concerts(artist_id);
CREATE INDEX idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX idx_concerts_city ON concerts(city);

-- Full-text search
CREATE INDEX idx_concerts_search ON concerts USING GIN (
  to_tsvector('russian', title || ' ' || description)
);
```

### **Оптимизация запросов**:

```typescript
// ❌ Медленно (N+1 запросов)
for (const concert of concerts) {
  const sales = await getSales(concert.id);
}

// ✅ Быстро (JOIN)
const { data } = await supabase
  .from('concerts')
  .select(`
    *,
    ticket_sales (
      id,
      quantity,
      total_amount
    )
  `);
```

---

## 🧪 ТЕСТИРОВАНИЕ

### **Проверка миграций**:

```bash
# 1. Проверить синтаксис
supabase db lint

# 2. Применить к тестовой БД
supabase db reset

# 3. Запустить тесты
supabase test db
```

### **Проверка RLS**:

```sql
-- Тест 1: Артист видит только свои концерты
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"artist-1"}';
SELECT COUNT(*) FROM concerts; -- Должно вернуть только концерты artist-1

-- Тест 2: Public видит только одобренные
RESET ROLE;
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM concerts; -- Только approved & !hidden
```

---

## 🔄 ОТКАТ МИГРАЦИЙ

### **Если что-то пошло не так**:

```bash
# Откатить последнюю миграцию
supabase db reset

# Откатить к конкретной версии
supabase db reset --db-url "postgresql://..." --version 001_initial_schema
```

### **Вручную**:

```sql
-- Удалить все таблицы
DROP TABLE IF EXISTS ticket_sales CASCADE;
DROP TABLE IF EXISTS artist_ticket_providers CASCADE;
DROP TABLE IF EXISTS ticket_providers CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS concerts CASCADE;
DROP TABLE IF EXISTS artists CASCADE;

-- Удалить views
DROP VIEW IF EXISTS concert_analytics;
DROP VIEW IF EXISTS artist_statistics;

-- Удалить функции
DROP FUNCTION IF EXISTS increment_concert_views;
DROP FUNCTION IF EXISTS increment_concert_clicks;
DROP FUNCTION IF EXISTS calculate_campaign_metrics;
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## 🎯 CHECKLIST МИГРАЦИИ

### **Подготовка**:
- [ ] Бэкап данных из KV Store
- [ ] Проверка SQL миграций локально
- [ ] Настройка environment variables
- [ ] Создание тестового проекта

### **Миграция**:
- [ ] Применение schema migration (001)
- [ ] Применение RLS migration (002)
- [ ] Инициализация Storage buckets
- [ ] Импорт данных из KV Store
- [ ] Проверка целостности данных

### **Тестирование**:
- [ ] Проверка RLS политик
- [ ] Тестирование API endpoints
- [ ] Проверка производительности
- [ ] Нагрузочное тестирование

### **Production**:
- [ ] Переключение STORAGE_MODE на 'sql'
- [ ] Мониторинг ошибок
- [ ] Проверка метрик
- [ ] Уведомление пользователей (если нужно)

---

**Последнее обновление**: 26 января 2026

**Версия**: 1.0.0

**Статус**: ✅ Готово к миграции
