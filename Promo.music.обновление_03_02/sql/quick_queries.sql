-- ============================================================
-- PROMO.MUSIC MODERATION - QUICK SQL QUERIES
-- Быстрые запросы для управления системой модерации
-- ============================================================

-- ============================================================
-- 1. СТАТИСТИКА МОДЕРАЦИИ
-- ============================================================

-- Общая статистика по всем типам контента
SELECT * FROM moderation_stats ORDER BY content_type;

-- Подробная статистика с процентами
SELECT 
  content_type,
  pending,
  approved,
  rejected,
  total,
  ROUND((approved::DECIMAL / NULLIF(total, 0)) * 100, 2) AS approval_rate,
  ROUND((rejected::DECIMAL / NULLIF(total, 0)) * 100, 2) AS rejection_rate
FROM moderation_stats;

-- Топ артистов по количеству контента на модерации
SELECT 
  user_id,
  COUNT(*) AS pending_count,
  SUM(price) AS total_amount
FROM (
  SELECT user_id, price FROM videos WHERE status = 'pending'
  UNION ALL
  SELECT user_id, price FROM banners WHERE status = 'pending'
  UNION ALL
  SELECT user_id, price FROM pitchings WHERE status = 'pending'
  UNION ALL
  SELECT user_id, price FROM marketing WHERE status = 'pending'
) AS pending_content
GROUP BY user_id
ORDER BY pending_count DESC
LIMIT 10;

-- ============================================================
-- 2. ФИНАНСОВЫЕ ЗАПРОСЫ
-- ============================================================

-- Общий доход от модерации за последний месяц
SELECT 
  SUM(amount) AS total_revenue,
  COUNT(*) AS transactions_count
FROM transactions
WHERE type = 'expense' 
  AND status = 'completed'
  AND date >= NOW() - INTERVAL '30 days';

-- Доход по типам контента (последние 30 дней)
SELECT 
  'videos' AS content_type,
  SUM(price) AS revenue,
  COUNT(*) AS count
FROM videos
WHERE status = 'approved' 
  AND updated_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
  'banners',
  SUM(price),
  COUNT(*)
FROM banners
WHERE status = 'approved' 
  AND updated_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
  'pitchings',
  SUM(price),
  COUNT(*)
FROM pitchings
WHERE status = 'approved' 
  AND updated_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
  'marketing',
  SUM(price),
  COUNT(*)
FROM marketing
WHERE status = 'approved' 
  AND updated_at >= NOW() - INTERVAL '30 days'
UNION ALL
SELECT 
  'production_360',
  SUM(final_price),
  COUNT(*)
FROM production_360
WHERE status IN ('approved', 'in_progress') 
  AND updated_at >= NOW() - INTERVAL '30 days'
ORDER BY revenue DESC;

-- Средний чек по типам контента
SELECT 
  'videos' AS content_type,
  AVG(price) AS avg_price,
  MIN(price) AS min_price,
  MAX(price) AS max_price
FROM videos
WHERE status = 'approved'
UNION ALL
SELECT 'banners', AVG(price), MIN(price), MAX(price)
FROM banners WHERE status = 'approved'
UNION ALL
SELECT 'pitchings', AVG(price), MIN(price), MAX(price)
FROM pitchings WHERE status = 'approved'
UNION ALL
SELECT 'marketing', AVG(price), MIN(price), MAX(price)
FROM marketing WHERE status = 'approved'
UNION ALL
SELECT 'production_360', AVG(final_price), MIN(final_price), MAX(final_price)
FROM production_360 WHERE status IN ('approved', 'in_progress');

-- ============================================================
-- 3. УПРАВЛЕНИЕ МОДЕРАЦИЕЙ
-- ============================================================

-- Одобрить видео
UPDATE videos 
SET status = 'approved', 
    moderation_note = 'Контент соответствует требованиям',
    updated_at = CURRENT_TIMESTAMP
WHERE id = :video_id;

-- Отклонить видео с причиной
UPDATE videos 
SET status = 'rejected', 
    rejection_reason = 'Низкое качество контента',
    moderation_note = 'Требуется повторная загрузка',
    updated_at = CURRENT_TIMESTAMP
WHERE id = :video_id;

-- Массовое одобрение треков
UPDATE tracks
SET status = 'approved',
    moderation_note = 'Автоматическое одобрение',
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'pending' 
  AND upload_date < NOW() - INTERVAL '7 days';

-- Отклонить просроченные заявки (более 30 дней без изменений)
UPDATE videos
SET status = 'rejected',
    rejection_reason = 'Заявка просрочена',
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'pending'
  AND upload_date < NOW() - INTERVAL '30 days';

-- ============================================================
-- 4. ПОИСК И ФИЛЬТРАЦИЯ
-- ============================================================

-- Поиск видео по артисту
SELECT * FROM videos
WHERE artist ILIKE '%название артиста%'
  AND status = 'pending'
ORDER BY upload_date DESC;

-- Поиск по жанру
SELECT * FROM tracks
WHERE genre = 'Hip-Hop'
  AND status = 'approved'
ORDER BY plays DESC
LIMIT 20;

-- Поиск концертов в определенном городе
SELECT * FROM concerts
WHERE city = 'Москва'
  AND date >= CURRENT_DATE
  AND status = 'approved'
ORDER BY date ASC;

-- Все контент конкретного артиста (все типы)
SELECT 'track' AS type, id, title AS name, status, created_at 
FROM tracks WHERE user_id = :user_id
UNION ALL
SELECT 'video', id, title, status, created_at 
FROM videos WHERE user_id = :user_id
UNION ALL
SELECT 'concert', id, title, status, created_at 
FROM concerts WHERE user_id = :user_id
UNION ALL
SELECT 'news', id, title, status, created_at 
FROM news WHERE user_id = :user_id
UNION ALL
SELECT 'banner', id, title, status, created_at 
FROM banners WHERE user_id = :user_id
UNION ALL
SELECT 'pitching', id, track_title, status, created_at 
FROM pitchings WHERE user_id = :user_id
UNION ALL
SELECT 'marketing', id, campaign_name, status, created_at 
FROM marketing WHERE user_id = :user_id
UNION ALL
SELECT 'production360', id, project_name, status, created_at 
FROM production_360 WHERE user_id = :user_id
UNION ALL
SELECT 'promolab', id, project_name, status, created_at 
FROM promo_lab WHERE user_id = :user_id
ORDER BY created_at DESC;

-- ============================================================
-- 5. АНАЛИТИКА
-- ============================================================

-- Время модерации (среднее время от pending до approved/rejected)
SELECT 
  'videos' AS content_type,
  AVG(EXTRACT(EPOCH FROM (updated_at - upload_date))/3600) AS avg_hours
FROM videos
WHERE status IN ('approved', 'rejected')
  AND upload_date >= NOW() - INTERVAL '30 days'
GROUP BY content_type;

-- Самые активные модераторы (по количеству одобренных)
SELECT 
  moderation_note,
  COUNT(*) AS moderated_count
FROM (
  SELECT moderation_note FROM videos WHERE status IN ('approved', 'rejected')
  UNION ALL
  SELECT moderation_note FROM concerts WHERE status IN ('approved', 'rejected')
  UNION ALL
  SELECT moderation_note FROM news WHERE status IN ('approved', 'rejected')
) AS moderated
GROUP BY moderation_note
ORDER BY moderated_count DESC
LIMIT 10;

-- Процент одобрения по подпискам (для videos)
SELECT 
  subscription_plan,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
  ROUND((COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / COUNT(*)) * 100, 2) AS approval_rate
FROM videos
WHERE subscription_plan IS NOT NULL
GROUP BY subscription_plan
ORDER BY approval_rate DESC;

-- Топ жанров по количеству загрузок
SELECT 
  genre,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved
FROM (
  SELECT genre FROM tracks
  UNION ALL
  SELECT genre FROM videos
  UNION ALL
  SELECT genre FROM production_360
  UNION ALL
  SELECT genre FROM promo_lab
) AS all_genres
GROUP BY genre
ORDER BY count DESC
LIMIT 10;

-- ============================================================
-- 6. MAINTENANCE (Обслуживание)
-- ============================================================

-- Очистка устаревших draft (более 90 дней)
DELETE FROM tracks
WHERE status = 'draft'
  AND created_at < NOW() - INTERVAL '90 days';

DELETE FROM videos
WHERE status = 'draft'
  AND created_at < NOW() - INTERVAL '90 days';

-- Обновление счетчиков views/plays (пример)
UPDATE tracks
SET plays = plays + 1
WHERE id = :track_id;

UPDATE videos
SET views = views + 1
WHERE id = :video_id;

-- Архивация старых записей (перенос в archive таблицы)
-- CREATE TABLE tracks_archive AS TABLE tracks WITH NO DATA;
INSERT INTO tracks_archive
SELECT * FROM tracks
WHERE status IN ('approved', 'rejected')
  AND updated_at < NOW() - INTERVAL '1 year';

-- Удаление после архивации
DELETE FROM tracks
WHERE id IN (SELECT id FROM tracks_archive);

-- ============================================================
-- 7. PROMO LAB СПЕЦИФИЧНЫЕ ЗАПРОСЫ
-- ============================================================

-- Текущие проекты в работе
SELECT 
  id,
  project_name,
  artist,
  genre,
  status,
  progress->>'currentStage' AS current_stage,
  progress->>'completedPercentage' AS progress_percent,
  approved_date
FROM promo_lab
WHERE status = 'in_progress'
ORDER BY approved_date DESC;

-- Статистика успешности Promo Lab
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending_review') AS pending,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  ROUND((COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / COUNT(*)) * 100, 2) AS approval_rate
FROM promo_lab;

-- ============================================================
-- 8. PRODUCTION 360 СПЕЦИФИЧНЫЕ ЗАПРОСЫ
-- ============================================================

-- Текущие проекты Production 360
SELECT 
  id,
  project_name,
  artist,
  subscription_plan,
  final_price,
  status,
  progress->>'currentStage' AS current_stage,
  progress->>'completedPercentage' AS progress_percent
FROM production_360
WHERE status IN ('in_progress', 'approved')
ORDER BY submitted_date DESC;

-- Финансовая статистика Production 360
SELECT 
  subscription_plan,
  COUNT(*) AS projects,
  AVG(final_price) AS avg_price,
  SUM(final_price) AS total_revenue
FROM production_360
WHERE status IN ('approved', 'in_progress', 'completed')
  AND is_paid = TRUE
GROUP BY subscription_plan
ORDER BY total_revenue DESC;

-- ============================================================
-- 9. УВЕДОМЛЕНИЯ И АЛЕРТЫ
-- ============================================================

-- Контент, ожидающий модерации более 24 часов
SELECT 
  'video' AS type,
  id,
  title AS name,
  artist,
  EXTRACT(EPOCH FROM (NOW() - upload_date))/3600 AS hours_waiting
FROM videos
WHERE status = 'pending'
  AND upload_date < NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'concert',
  id,
  title,
  artist,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600
FROM concerts
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '24 hours'
ORDER BY hours_waiting DESC;

-- Контент с низким балансом пользователя (риск неоплаты)
SELECT 
  v.id,
  v.title,
  v.artist,
  v.price,
  u.balance,
  (v.price - u.balance) AS shortage
FROM videos v
JOIN users u ON v.user_id = u.id
WHERE v.status = 'draft'
  AND u.balance < v.price
ORDER BY shortage DESC;

-- ============================================================
-- 10. BACKUP И ВОССТАНОВЛЕНИЕ
-- ============================================================

-- Экспорт данных в JSON (пример для videos)
SELECT json_agg(row_to_json(videos.*))
FROM videos
WHERE status = 'approved'
  AND upload_date >= '2026-01-01';

-- Подсчет записей для проверки целостности
SELECT 
  'tracks' AS table_name, COUNT(*) AS count FROM tracks
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'concerts', COUNT(*) FROM concerts
UNION ALL
SELECT 'news', COUNT(*) FROM news
UNION ALL
SELECT 'banners', COUNT(*) FROM banners
UNION ALL
SELECT 'pitchings', COUNT(*) FROM pitchings
UNION ALL
SELECT 'marketing', COUNT(*) FROM marketing
UNION ALL
SELECT 'production_360', COUNT(*) FROM production_360
UNION ALL
SELECT 'promo_lab', COUNT(*) FROM promo_lab
ORDER BY count DESC;

-- ============================================================
-- КОНЕЦ ФАЙЛА
-- ============================================================

-- Для выполнения запросов замените :parameter на реальные значения
-- Пример: WHERE id = :video_id  →  WHERE id = 123
