# 📊 Database Schema - Promotion System

## Обзор

8 таблиц PostgreSQL для системы продвижения музыкантов.

## Таблицы

### 1. pitching_requests
Заявки на питчинг треков на радио и плейлисты

**Поля:**
- `id` - UUID, primary key
- `artist_id` - UUID, связь с пользователем
- `track_title` - название трека (до 200 символов)
- `track_url` - ссылка на трек
- `pitch_type` - тип питчинга (radio_small, radio_medium, radio_top, playlist_indie, playlist_major)
- `target_audience` - целевая аудитория
- `price` - стоимость
- `status` - статус заявки
- `progress` - прогресс (0-100%)

**Индексы:**
- `idx_pitching_artist` - по artist_id
- `idx_pitching_status` - по status
- `idx_pitching_created` - по created_at (DESC)

### 2. production_360_requests
Заказы на видеопродакшн, монтаж, дизайн

**Поля:**
- `id` - UUID
- `artist_id` - UUID
- `service_type` - тип услуги (video_shooting, video_editing, cover_design, full_package)
- `project_title` - название проекта
- `description` - описание
- `budget` - бюджет
- `deadline` - дедлайн
- `status` - статус
- `progress` - прогресс (0-100%)

### 3. marketing_campaigns
Маркетинговые кампании

**Поля:**
- `id` - UUID
- `artist_id` - UUID
- `campaign_type` - тип кампании (targeted_ads, smm_management, pr_campaign, influencer_collab)
- `campaign_name` - название
- `target_audience` - целевая аудитория
- `budget` - бюджет
- `duration_days` - длительность в днях
- `start_date`, `end_date` - даты начала и конца
- `status` - статус
- `metrics` - JSONB метрики (impressions, clicks, conversions, engagement_rate)

### 4. media_outreach_requests
Обращения в СМИ, блоги, подкасты

**Поля:**
- `id` - UUID
- `artist_id` - UUID
- `media_type` - тип СМИ (music_magazines, blogs, podcasts, interviews, press_release)
- `campaign_title` - название кампании
- `message` - сообщение
- `target_media` - список целевых СМИ
- `price` - стоимость
- `status` - статус
- `responses_count` - количество ответов

### 5. event_requests
Организация концертов и промо-ивентов

**Поля:**
- `id` - UUID
- `artist_id` - UUID
- `event_type` - тип ивента (club_booking, festival_application, showcase, promo_tour)
- `event_title` - название
- `event_date` - дата мероприятия
- `venue_preferences` - предпочтения по площадке
- `expected_audience` - ожидаемая аудитория
- `budget` - бюджет
- `status` - статус
- `venue_confirmed` - подтвержденная площадка

### 6. promo_lab_experiments
A/B тесты и эксперименты

**Поля:**
- `id` - UUID
- `artist_id` - UUID
- `experiment_type` - тип эксперимента (cover_ab_test, title_test, snippet_test, release_strategy)
- `experiment_name` - название
- `hypothesis` - гипотеза
- `variant_a`, `variant_b` - JSONB варианты
- `target_audience` - целевая аудитория
- `budget` - бюджет
- `status` - статус
- `results` - JSONB результаты (winner, a_metrics, b_metrics, confidence)
- `start_date`, `end_date` - даты

### 7. editor_responses
Ответы редакторов и кураторов

**Поля:**
- `id` - UUID
- `request_id` - UUID связанной заявки
- `request_type` - тип заявки (pitching, media_outreach, event)
- `editor_name` - имя редактора
- `editor_contact` - контакт
- `response_type` - тип ответа (accepted, rejected, interested, needs_revision)
- `message` - сообщение
- `response_date` - дата ответа

### 8. promotion_transactions
История транзакций

**Поля:**
- `id` - UUID
- `artist_id` - UUID
- `request_id` - UUID заявки
- `request_type` - тип заявки
- `transaction_type` - тип транзакции (payment, coin_deduction, refund)
- `amount` - сумма
- `currency` - валюта (по умолчанию RUB)
- `payment_method` - способ оплаты (card, coins, bank_transfer)
- `status` - статус (pending, completed, failed, refunded)

## Security (RLS)

Все таблицы защищены Row Level Security:

- **SELECT** - пользователь видит только свои данные
- **INSERT** - пользователь может создавать только свои записи
- **UPDATE** - пользователь может изменять только свои записи
- **DELETE** - не разрешено (для истории)

## Triggers

Автоматическое обновление `updated_at`:
- Срабатывает при каждом UPDATE
- Устанавливает `updated_at = NOW()`

## Установка

```sql
-- Выполните весь файл 001_promotion_tables.sql в Supabase Dashboard → SQL Editor
```

## Проверка

```sql
-- Проверить созданные таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%request%' OR table_name LIKE '%promo%';

-- Проверить RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Проверить политики
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

## Миграции

При добавлении новых таблиц:
1. Создайте новый файл `002_next_feature.sql`
2. Добавьте в `deploy.config.json` → `database.migrations`
3. Запустите `deploy-direct.ts`
