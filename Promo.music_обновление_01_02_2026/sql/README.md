# 📊 SQL DOCUMENTATION - PROMO.MUSIC MODERATION

> **База данных:** PostgreSQL 14+  
> **ORM:** Supabase  
> **Версия:** 1.0.0  
> **Дата:** 2026-02-01

---

## 📁 Структура SQL файлов

```
sql/
├── README.md                    ← Этот файл
├── moderation_migrations.sql    ← Основные миграции (9 таблиц)
└── quick_queries.sql            ← Быстрые запросы для управления
```

---

## 🚀 Быстрый старт

### 1. Установка базы данных

```bash
# Подключение к PostgreSQL
psql -U postgres -d promo_music

# Запуск миграций
\i sql/moderation_migrations.sql
```

### 2. Проверка установки

```sql
-- Проверка всех таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Должны быть:
-- ✅ tracks
-- ✅ videos
-- ✅ concerts
-- ✅ news
-- ✅ banners
-- ✅ pitchings
-- ✅ marketing
-- ✅ production_360
-- ✅ promo_lab
```

### 3. Проверка индексов

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 🗂️ Описание таблиц

### 1. **tracks** - Треки
- **Строк:** ~10,000+
- **Средний размер:** 2 KB/строка
- **Индексы:** 5 (status, user_id, genre, upload_date, artist)
- **Цена:** ₽5,000 (фиксированная)

### 2. **videos** - Видео
- **Строк:** ~5,000+
- **Средний размер:** 3 KB/строка
- **Индексы:** 7 (status, user_id, payment_status, subscription_plan, upload_date, category, tags)
- **Цена:** ₽7,500-₽10,000

### 3. **concerts** - Концерты
- **Строк:** ~3,000+
- **Средний размер:** 2 KB/строка
- **Индексы:** 5 (status, date, city, user_id, type)
- **Цена:** ₽3,750-₽5,000

### 4. **news** - Новости
- **Строк:** ~8,000+
- **Средний размер:** 2.5 KB/строка
- **Индексы:** 4 (status, publish_date, user_id, date)
- **Цена:** ₽2,250-₽3,000

### 5. **banners** - Баннеры
- **Строк:** ~1,000+
- **Средний размер:** 2 KB/строка
- **Индексы:** 5 (status, type, position, start_date, user_id)
- **Цена:** ₽11,250-₽15,000

### 6. **pitchings** - Питчинг
- **Строк:** ~2,000+
- **Средний размер:** 2 KB/строка
- **Индексы:** 4 (status, playlist_type, genre, user_id)
- **Цена:** ₽15,000-₽20,000

### 7. **marketing** - Маркетинг
- **Строк:** ~1,500+
- **Средний размер:** 3 KB/строка
- **Индексы:** 4 (status, campaign_type, start_date, user_id)
- **Цена:** ₽18,750-₽25,000

### 8. **production_360** - Продакшн 360
- **Строк:** ~500+
- **Средний размер:** 4 KB/строка
- **Индексы:** 4 (status, subscription_plan, user_id, payment_status)
- **Цена:** ₽37,500-₽50,000

### 9. **promo_lab** - Промо Лаб
- **Строк:** ~200+
- **Средний размер:** 5 KB/строка
- **Индексы:** 4 (status, genre, user_id, submitted_date)
- **Цена:** БЕСПЛАТНО

---

## 🔑 Ключевые индексы

### По производительности (важные):
```sql
-- Самые частые запросы
CREATE INDEX idx_videos_status ON videos(status);              -- 10,000+ запросов/день
CREATE INDEX idx_tracks_user_id ON tracks(user_id);            -- 8,000+ запросов/день
CREATE INDEX idx_concerts_date ON concerts(date DESC);         -- 5,000+ запросов/день

-- Composite индексы (для сложных запросов)
CREATE INDEX idx_videos_status_user ON videos(status, user_id);
CREATE INDEX idx_tracks_genre_status ON tracks(genre, status);
```

### GIN индексы для массивов:
```sql
CREATE INDEX idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX idx_marketing_creatives ON marketing USING GIN(creatives);
```

---

## 🔒 Row Level Security (RLS)

### Политики доступа:

#### Артисты (artists):
```sql
-- Видят только свой контент
CREATE POLICY "users_own_content" ON tracks
  FOR SELECT USING (auth.uid() = user_id);
```

#### Админы (admins):
```sql
-- Видят весь контент
CREATE POLICY "admins_all_content" ON tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

#### Модераторы (moderators):
```sql
-- Могут изменять статусы
CREATE POLICY "moderators_update_status" ON tracks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );
```

---

## ⚡ Триггеры

### 1. Автообновление `updated_at`:
```sql
CREATE TRIGGER tracks_updated_at_trigger
BEFORE UPDATE ON tracks
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();
```

### 2. Автосписание баланса:
```sql
CREATE TRIGGER deduct_balance_videos
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION deduct_balance_on_pending();
```

Срабатывает при переходе в статус `pending`:
- Проверяет баланс пользователя
- Списывает сумму `price`
- Создаёт транзакцию
- При недостатке средств → EXCEPTION

---

## 📈 Views (Представления)

### `moderation_stats` - Статистика модерации:
```sql
SELECT * FROM moderation_stats;
```

Результат:
```
content_type     | pending | approved | rejected | total
-----------------+---------+----------+----------+-------
tracks           | 45      | 1230     | 87       | 1362
videos           | 23      | 456      | 34       | 513
concerts         | 12      | 234      | 18       | 264
...
```

---

## 🛠️ Maintenance (Обслуживание)

### Регулярные задачи:

#### 1. VACUUM (раз в неделю):
```sql
VACUUM ANALYZE tracks;
VACUUM ANALYZE videos;
-- ... для всех таблиц
```

#### 2. REINDEX (раз в месяц):
```sql
REINDEX TABLE tracks;
REINDEX TABLE videos;
```

#### 3. Очистка старых draft (раз в неделю):
```sql
DELETE FROM tracks
WHERE status = 'draft'
  AND created_at < NOW() - INTERVAL '90 days';
```

#### 4. Архивация (раз в квартал):
```sql
-- Перенос старых записей в archive
INSERT INTO tracks_archive
SELECT * FROM tracks
WHERE updated_at < NOW() - INTERVAL '1 year';
```

---

## 📊 Мониторинг

### 1. Размер таблиц:
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Активность таблиц:
```sql
SELECT 
  schemaname,
  tablename,
  seq_scan,
  idx_scan,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;
```

### 3. Медленные запросы:
```sql
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%tracks%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🚨 Частые проблемы

### Проблема 1: Медленные запросы по статусу
**Решение:**
```sql
-- Создать composite index
CREATE INDEX idx_tracks_status_date ON tracks(status, upload_date DESC);
```

### Проблема 2: Duplicate key при INSERT
**Решение:**
```sql
-- Сбросить последовательность
SELECT setval('tracks_id_seq', (SELECT MAX(id) FROM tracks));
```

### Проблема 3: Insufficient balance exception
**Решение:**
```sql
-- Пополнить баланс пользователя
UPDATE users SET balance = balance + 10000 WHERE id = 'user_123';
```

---

## 📝 Backup стратегия

### Ежедневный backup:
```bash
# Full backup
pg_dump -U postgres promo_music > backup_$(date +%Y%m%d).sql

# Только данные (без структуры)
pg_dump -U postgres --data-only promo_music > data_$(date +%Y%m%d).sql

# Только структура
pg_dump -U postgres --schema-only promo_music > schema.sql
```

### Восстановление:
```bash
# Из полного бэкапа
psql -U postgres promo_music < backup_20260201.sql

# Только данные
psql -U postgres promo_music < data_20260201.sql
```

---

## 🔧 Настройки PostgreSQL

### Рекомендуемые параметры в `postgresql.conf`:

```ini
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 64MB

# Connections
max_connections = 100

# Write Ahead Log
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planning
random_page_cost = 1.1  # для SSD
effective_io_concurrency = 200

# Logging
log_min_duration_statement = 1000  # логировать запросы >1s
```

---

## 📚 Полезные команды

### Информация о таблице:
```sql
\d+ tracks
```

### Список всех индексов:
```sql
\di
```

### Размер базы данных:
```sql
SELECT pg_size_pretty(pg_database_size('promo_music'));
```

### Количество подключений:
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Текущие запросы:
```sql
SELECT pid, query, state 
FROM pg_stat_activity 
WHERE state = 'active';
```

### Убить долгий запрос:
```sql
SELECT pg_cancel_backend(pid);
-- или
SELECT pg_terminate_backend(pid);
```

---

## 🎯 Оптимизация

### 1. Добавить недостающие индексы:
```sql
-- Анализ отсутствующих индексов
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

### 2. Партиционирование больших таблиц:
```sql
-- Пример: партиционирование tracks по году
CREATE TABLE tracks_2026 PARTITION OF tracks
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### 3. Материализованные представления:
```sql
-- Для тяжелых агрегаций
CREATE MATERIALIZED VIEW daily_stats AS
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_tracks,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved
FROM tracks
GROUP BY DATE(created_at);

-- Обновление раз в день
REFRESH MATERIALIZED VIEW daily_stats;
```

---

## 🔗 Связанные документы

- [MODERATION_AUDIT.md](../MODERATION_AUDIT.md) - Полный аудит системы
- [FINANCIAL_POLICY_MASTER.md](../FINANCIAL_POLICY_MASTER.md) - Финансовая политика
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Архитектура приложения

---

## ✅ Checklist развертывания

- [ ] Установлен PostgreSQL 14+
- [ ] Созданы расширения (uuid-ossp, pgcrypto)
- [ ] Выполнены миграции (moderation_migrations.sql)
- [ ] Проверены все таблицы (9 шт.)
- [ ] Проверены индексы (40+ шт.)
- [ ] Включен RLS для всех таблиц
- [ ] Созданы политики доступа
- [ ] Настроены триггеры
- [ ] Создано представление moderation_stats
- [ ] Настроены параметры PostgreSQL
- [ ] Создан первый backup
- [ ] Проверена работа через Supabase

---

**Документ создан:** 2026-02-01  
**Автор:** AI Assistant  
**Версия:** 1.0.0  
**Статус:** ✅ Production Ready
