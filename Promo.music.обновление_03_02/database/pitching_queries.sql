-- ============================================================================
-- PROMO.MUSIC - PITCHING MODULE SQL QUERIES
-- Примеры запросов для работы с системой питчинга
-- ============================================================================

-- ============================================================================
-- 1. СОЗДАНИЕ НОВОЙ ПИТЧИНГ-КАМПАНИИ
-- ============================================================================

-- Создание черновика кампании
INSERT INTO pitching_campaigns (
    user_id,
    track_id,
    campaign_name,
    campaign_type,
    pitch_text,
    additional_info,
    target_partners,
    total_partners_count,
    total_cost,
    final_cost,
    start_date,
    end_date,
    deadline,
    status
) VALUES (
    123, -- ID пользователя
    456, -- ID трека
    'Промо нового сингла "Summer Vibes"',
    'radio',
    'Здравствуйте! Представляю новый летний трек...',
    '{"genre": "Electronic", "mood": "Happy", "bpm": 128, "key": "Am"}'::jsonb,
    '[
        {"id": 1, "name": "Русское Радио", "price": 5000},
        {"id": 2, "name": "Европа Плюс", "price": 7000}
    ]'::jsonb,
    2,
    12000.00,
    10200.00, -- С учетом 15% скидки
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '14 days',
    'draft'
) RETURNING id, uuid;


-- ============================================================================
-- 2. СОЗДАНИЕ ОТПРАВОК ПАРТНЕРАМ
-- ============================================================================

-- Массовое создание отправок для выбранных партнеров
INSERT INTO pitching_submissions (campaign_id, partner_id, status, is_priority)
SELECT 
    789, -- ID кампании
    (jsonb_array_elements(target_partners)->>'id')::bigint,
    'pending',
    FALSE
FROM pitching_campaigns
WHERE id = 789;


-- ============================================================================
-- 3. ОБНОВЛЕНИЕ СТАТУСА КАМПАНИИ
-- ============================================================================

-- Отправка кампании на модерацию
UPDATE pitching_campaigns
SET 
    status = 'in_moderation',
    submitted_at = NOW()
WHERE id = 789
  AND status = 'paid'
  AND user_id = 123;

-- Одобрение кампании админом
UPDATE pitching_campaigns
SET 
    status = 'active',
    approved_at = NOW()
WHERE id = 789
  AND status = 'in_moderation';

-- Завершение кампании
UPDATE pitching_campaigns
SET 
    status = 'completed',
    completed_at = NOW()
WHERE id = 789
  AND end_date < CURRENT_DATE;


-- ============================================================================
-- 4. ОБРАБОТКА ОТВЕТОВ ПАРТНЕРОВ
-- ============================================================================

-- Партнер открыл питч
UPDATE pitching_submissions
SET 
    status = 'opened',
    opened_at = NOW(),
    views_count = views_count + 1
WHERE id = 999
  AND partner_id = 1;

-- Партнер одобрил трек
UPDATE pitching_submissions
SET 
    status = 'approved',
    responded_at = NOW(),
    partner_response = 'Отличный трек! Включим в эфир в прайм-тайм.',
    partner_rating = 5,
    placement_details = '{
        "airplay_date": "2026-02-15",
        "time_slot": "Prime time (18:00-21:00)",
        "rotation": "Medium",
        "estimated_listeners": 50000
    }'::jsonb
WHERE id = 999
  AND partner_id = 1;

-- Партнер отклонил трек
UPDATE pitching_submissions
SET 
    status = 'rejected',
    responded_at = NOW(),
    partner_response = 'Спасибо за питч, но трек не подходит под формат станции.',
    partner_rating = 3
WHERE id = 999
  AND partner_id = 2;


-- ============================================================================
-- 5. ЗАПРОСЫ ДЛЯ ДАШБОРДА АРТИСТА
-- ============================================================================

-- Все кампании пользователя с основной статистикой
SELECT 
    pc.id,
    pc.campaign_name,
    pc.campaign_type,
    pc.status,
    pc.total_partners_count,
    pc.responses_count,
    pc.approvals_count,
    pc.rejections_count,
    ROUND((pc.approvals_count::DECIMAL / NULLIF(pc.responses_count, 0) * 100), 2) AS approval_rate,
    pc.final_cost,
    pc.created_at,
    pc.deadline,
    t.title AS track_title,
    t.cover_url
FROM pitching_campaigns pc
JOIN tracks t ON pc.track_id = t.id
WHERE pc.user_id = 123
  AND pc.deleted_at IS NULL
ORDER BY pc.created_at DESC;

-- Детальная информация о конкретной кампании
SELECT 
    pc.*,
    t.title AS track_title,
    t.artist_name,
    t.audio_url,
    t.cover_url,
    t.duration_seconds,
    COUNT(ps.id) AS total_submissions,
    COUNT(ps.id) FILTER (WHERE ps.status = 'approved') AS approved_count,
    COUNT(ps.id) FILTER (WHERE ps.status = 'rejected') AS rejected_count,
    COUNT(ps.id) FILTER (WHERE ps.status = 'pending') AS pending_count
FROM pitching_campaigns pc
JOIN tracks t ON pc.track_id = t.id
LEFT JOIN pitching_submissions ps ON pc.id = ps.campaign_id
WHERE pc.id = 789
GROUP BY pc.id, t.id;

-- Список отправок для кампании
SELECT 
    ps.id,
    ps.status,
    ps.opened_at,
    ps.responded_at,
    ps.partner_response,
    ps.partner_rating,
    ps.placement_details,
    p.name AS partner_name,
    p.category AS partner_category,
    p.logo_url AS partner_logo,
    p.audience_size,
    p.rating AS partner_rating_overall
FROM pitching_submissions ps
JOIN partners p ON ps.partner_id = p.id
WHERE ps.campaign_id = 789
ORDER BY 
    CASE ps.status
        WHEN 'approved' THEN 1
        WHEN 'opened' THEN 2
        WHEN 'pending' THEN 3
        WHEN 'rejected' THEN 4
        ELSE 5
    END,
    ps.created_at DESC;


-- ============================================================================
-- 6. ЗАПРОСЫ ДЛЯ АДМИН-ПАНЕЛИ
-- ============================================================================

-- Все кампании на модерации
SELECT 
    pc.id,
    pc.campaign_name,
    pc.campaign_type,
    pc.submitted_at,
    u.name AS artist_name,
    u.email AS artist_email,
    t.title AS track_title,
    pc.total_partners_count,
    pc.final_cost
FROM pitching_campaigns pc
JOIN users u ON pc.user_id = u.id
JOIN tracks t ON pc.track_id = t.id
WHERE pc.status = 'in_moderation'
  AND pc.deleted_at IS NULL
ORDER BY pc.submitted_at ASC;

-- Общая статистика платформы
SELECT 
    COUNT(*) FILTER (WHERE status = 'active') AS active_campaigns,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_campaigns,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS campaigns_last_30_days,
    SUM(final_cost) FILTER (WHERE payment_status = 'paid') AS total_revenue,
    SUM(final_cost) FILTER (WHERE payment_status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS revenue_last_30_days,
    ROUND(AVG(approvals_count::DECIMAL / NULLIF(total_partners_count, 0) * 100), 2) AS avg_approval_rate
FROM pitching_campaigns
WHERE deleted_at IS NULL;

-- Топ партнеров по количеству одобренных питчей
SELECT 
    p.id,
    p.name,
    p.category,
    p.total_pitches_received,
    p.total_pitches_approved,
    p.approval_rate,
    p.rating,
    p.audience_size,
    COUNT(ps.id) FILTER (WHERE ps.status = 'pending') AS pending_pitches
FROM partners p
LEFT JOIN pitching_submissions ps ON p.id = ps.partner_id
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
GROUP BY p.id
ORDER BY p.total_pitches_approved DESC
LIMIT 20;


-- ============================================================================
-- 7. АНАЛИТИКА И СТАТИСТИКА
-- ============================================================================

-- Конверсия по типам кампаний
SELECT 
    campaign_type,
    COUNT(*) AS total_campaigns,
    SUM(total_partners_count) AS total_pitches,
    SUM(approvals_count) AS total_approvals,
    ROUND(AVG(approvals_count::DECIMAL / NULLIF(total_partners_count, 0) * 100), 2) AS avg_approval_rate,
    SUM(final_cost) AS total_revenue
FROM pitching_campaigns
WHERE deleted_at IS NULL
  AND status IN ('active', 'completed')
GROUP BY campaign_type
ORDER BY total_campaigns DESC;

-- Динамика создания кампаний по дням (последние 30 дней)
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS campaigns_count,
    SUM(final_cost) AS daily_revenue
FROM pitching_campaigns
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Средняя стоимость кампании по типам
SELECT 
    campaign_type,
    ROUND(AVG(final_cost), 2) AS avg_cost,
    MIN(final_cost) AS min_cost,
    MAX(final_cost) AS max_cost,
    COUNT(*) AS campaigns_count
FROM pitching_campaigns
WHERE deleted_at IS NULL
  AND payment_status = 'paid'
GROUP BY campaign_type;

-- Топ артистов по активности
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT pc.id) AS total_campaigns,
    SUM(pc.total_partners_count) AS total_pitches_sent,
    SUM(pc.approvals_count) AS total_approvals,
    ROUND(AVG(pc.approvals_count::DECIMAL / NULLIF(pc.total_partners_count, 0) * 100), 2) AS avg_success_rate,
    SUM(pc.final_cost) AS total_spent
FROM users u
JOIN pitching_campaigns pc ON u.id = pc.user_id
WHERE pc.deleted_at IS NULL
  AND u.deleted_at IS NULL
GROUP BY u.id
ORDER BY total_campaigns DESC
LIMIT 50;


-- ============================================================================
-- 8. ПОИСК И ФИЛЬТРАЦИЯ
-- ============================================================================

-- Поиск кампаний по тексту (полнотекстовый поиск)
SELECT 
    id,
    campaign_name,
    campaign_type,
    status,
    ts_rank(to_tsvector('russian', campaign_name || ' ' || pitch_text), 
            to_tsquery('russian', 'электронная & музыка')) AS rank
FROM pitching_campaigns
WHERE to_tsvector('russian', campaign_name || ' ' || pitch_text) @@ 
      to_tsquery('russian', 'электронная & музыка')
  AND deleted_at IS NULL
ORDER BY rank DESC;

-- Фильтрация кампаний с множественными условиями
SELECT 
    pc.id,
    pc.campaign_name,
    pc.status,
    pc.created_at,
    u.name AS artist_name
FROM pitching_campaigns pc
JOIN users u ON pc.user_id = u.id
WHERE pc.deleted_at IS NULL
  AND pc.campaign_type = 'radio' -- Фильтр по типу
  AND pc.status = 'active' -- Фильтр по статусу
  AND pc.created_at >= '2026-01-01' -- Фильтр по дате
  AND pc.final_cost BETWEEN 5000 AND 20000 -- Фильтр по стоимости
ORDER BY pc.created_at DESC;

-- Поиск партнеров для питчинга по критериям
SELECT 
    p.id,
    p.name,
    p.category,
    p.rating,
    p.approval_rate,
    p.audience_size,
    p.base_price,
    p.genres
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.category = 'radio'
  AND p.rating >= 4.0
  AND p.approval_rate >= 30.0
  AND p.genres @> '["Electronic"]'::jsonb -- Поддерживает жанр Electronic
ORDER BY p.rating DESC, p.approval_rate DESC
LIMIT 20;


-- ============================================================================
-- 9. РАБОТА С ПЛАТЕЖАМИ
-- ============================================================================

-- Создание платежа за кампанию
INSERT INTO pitching_payments (
    campaign_id,
    user_id,
    amount,
    payment_method,
    status,
    description
) VALUES (
    789,
    123,
    10200.00,
    'card',
    'pending',
    'Оплата питчинг-кампании "Summer Vibes"'
) RETURNING id, uuid;

-- Подтверждение платежа
UPDATE pitching_payments
SET 
    status = 'completed',
    completed_at = NOW(),
    transaction_id = 'yookassa_abc123xyz'
WHERE id = 555
  AND status = 'pending';

-- Обновление статуса кампании после оплаты
UPDATE pitching_campaigns
SET 
    payment_status = 'paid',
    status = 'paid'
WHERE id = 789
  AND payment_id = 555;

-- История платежей пользователя
SELECT 
    pp.id,
    pp.amount,
    pp.currency,
    pp.status,
    pp.payment_method,
    pp.created_at,
    pp.completed_at,
    pc.campaign_name
FROM pitching_payments pp
JOIN pitching_campaigns pc ON pp.campaign_id = pc.id
WHERE pp.user_id = 123
ORDER BY pp.created_at DESC;


-- ============================================================================
-- 10. ШАБЛОНЫ ПИТЧЕЙ
-- ============================================================================

-- Получить все публичные шаблоны для категории
SELECT 
    id,
    template_name,
    template_category,
    pitch_text,
    placeholders,
    usage_count,
    success_rate
FROM pitching_templates
WHERE (is_public = TRUE OR user_id = 123)
  AND template_category = 'radio'
ORDER BY success_rate DESC, usage_count DESC;

-- Создать свой шаблон
INSERT INTO pitching_templates (
    user_id,
    template_name,
    template_category,
    pitch_text,
    placeholders,
    is_public
) VALUES (
    123,
    'Мой шаблон для радио',
    'radio',
    'Привет! Вот мой трек {{TRACK_NAME}}...',
    '{"TRACK_NAME": "Название трека"}'::jsonb,
    FALSE
);


-- ============================================================================
-- 11. ЛОГИ И АУДИТ
-- ============================================================================

-- История изменений кампании
SELECT 
    pal.id,
    pal.action_type,
    pal.action_description,
    pal.old_values,
    pal.new_values,
    pal.created_at,
    u.name AS user_name
FROM pitching_activity_log pal
LEFT JOIN users u ON pal.user_id = u.id
WHERE pal.campaign_id = 789
ORDER BY pal.created_at DESC;

-- Все действия пользователя
SELECT 
    pal.action_type,
    pal.action_description,
    pal.created_at,
    pc.campaign_name
FROM pitching_activity_log pal
JOIN pitching_campaigns pc ON pal.campaign_id = pc.id
WHERE pal.user_id = 123
ORDER BY pal.created_at DESC
LIMIT 100;


-- ============================================================================
-- 12. УВЕДОМЛЕНИЯ И ДЕДЛАЙНЫ
-- ============================================================================

-- Кампании с приближающимся дедлайном (осталось < 3 дней)
SELECT 
    pc.id,
    pc.campaign_name,
    pc.deadline,
    pc.deadline - CURRENT_DATE AS days_left,
    u.name AS artist_name,
    u.email AS artist_email
FROM pitching_campaigns pc
JOIN users u ON pc.user_id = u.id
WHERE pc.status = 'active'
  AND pc.deadline IS NOT NULL
  AND pc.deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
  AND pc.deleted_at IS NULL;

-- Партнеры, которые давно не отвечают
SELECT 
    ps.id,
    ps.campaign_id,
    p.name AS partner_name,
    p.email AS partner_email,
    ps.created_at,
    EXTRACT(DAY FROM NOW() - ps.created_at) AS days_waiting
FROM pitching_submissions ps
JOIN partners p ON ps.partner_id = p.id
WHERE ps.status = 'pending'
  AND ps.created_at < NOW() - INTERVAL '7 days'
ORDER BY ps.created_at ASC;


-- ============================================================================
-- 13. МАССОВЫЕ ОПЕРАЦИИ
-- ============================================================================

-- Автоматическое завершение просроченных кампаний
UPDATE pitching_campaigns
SET 
    status = 'completed',
    completed_at = NOW()
WHERE status = 'active'
  AND end_date < CURRENT_DATE
  AND deleted_at IS NULL;

-- Пометка неотвеченных питчей как "no_response"
UPDATE pitching_submissions
SET status = 'no_response'
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '30 days';

-- Обновление рейтинга партнеров на основе отзывов
UPDATE partners p
SET rating = (
    SELECT COALESCE(AVG(partner_rating), 0)
    FROM pitching_submissions
    WHERE partner_id = p.id
      AND partner_rating IS NOT NULL
)
WHERE p.deleted_at IS NULL;


-- ============================================================================
-- 14. ОТЧЕТЫ
-- ============================================================================

-- Месячный отчет по доходам
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS campaigns_count,
    SUM(final_cost) AS total_revenue,
    SUM(final_cost * commission_percentage / 100) AS platform_commission,
    AVG(final_cost) AS avg_campaign_cost
FROM pitching_campaigns
WHERE payment_status = 'paid'
  AND created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Отчет по эффективности партнеров
SELECT 
    p.name,
    p.category,
    COUNT(ps.id) AS total_pitches_received,
    COUNT(ps.id) FILTER (WHERE ps.status = 'approved') AS approved,
    COUNT(ps.id) FILTER (WHERE ps.status = 'rejected') AS rejected,
    COUNT(ps.id) FILTER (WHERE ps.status = 'no_response') AS no_response,
    ROUND(AVG(EXTRACT(EPOCH FROM (ps.responded_at - ps.created_at)) / 3600), 2) AS avg_response_hours,
    p.rating
FROM partners p
LEFT JOIN pitching_submissions ps ON p.id = ps.partner_id
WHERE p.deleted_at IS NULL
GROUP BY p.id
HAVING COUNT(ps.id) > 0
ORDER BY approved DESC;


-- ============================================================================
-- 15. ОПТИМИЗАЦИЯ И ОБСЛУЖИВАНИЕ
-- ============================================================================

-- Удаление старых логов (старше 6 месяцев)
DELETE FROM pitching_activity_log
WHERE created_at < NOW() - INTERVAL '6 months';

-- Архивация завершенных кампаний (мягкое удаление старых)
UPDATE pitching_campaigns
SET deleted_at = NOW()
WHERE status = 'completed'
  AND completed_at < NOW() - INTERVAL '2 years'
  AND deleted_at IS NULL;

-- Vacuum и Analyze для оптимизации
VACUUM ANALYZE pitching_campaigns;
VACUUM ANALYZE pitching_submissions;
VACUUM ANALYZE partners;

-- Проверка размеров таблиц
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'pitching%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


-- ============================================================================
-- КОНЕЦ ФАЙЛА
-- ============================================================================
