-- ============================================================================
-- PROMO.MUSIC - PARTNERS MANAGEMENT SQL QUERIES
-- Готовые SQL запросы для работы с партнерами
-- ============================================================================


-- ============================================================================
-- 1. CRUD ОПЕРАЦИИ
-- ============================================================================

-- 1.1 Создание партнера
INSERT INTO partners (
    name,
    legal_name,
    category,
    email,
    phone,
    website,
    country,
    city,
    description,
    short_description,
    genres,
    base_price,
    audience_size,
    added_by,
    added_by_admin_id
) VALUES (
    'Русское Радио',
    'ООО "Русское Радио"',
    'radio',
    'promo@rusradio.ru',
    '+7 (495) 123-45-67',
    'https://rusradio.ru',
    'Россия',
    'Москва',
    'Крупнейшая радиостанция России с аудиторией более 5 млн слушателей',
    'Топовая радиостанция',
    '["Pop", "Dance", "Electronic"]'::jsonb,
    5000.00,
    5000000,
    'admin',
    $1
) RETURNING id, uuid, name;


-- 1.2 Получение партнера по ID
SELECT 
    p.*,
    COUNT(DISTINCT ps.id) AS services_count,
    COUNT(DISTINCT pr.id) AS reviews_count,
    AVG(pr.overall_rating) AS avg_rating
FROM partners p
LEFT JOIN partner_services ps ON p.id = ps.partner_id AND ps.is_active = TRUE
LEFT JOIN partner_reviews pr ON p.id = pr.partner_id AND pr.moderation_status = 'approved'
WHERE p.id = $1
  AND p.deleted_at IS NULL
GROUP BY p.id;


-- 1.3 Получение партнера по slug
SELECT *
FROM partners
WHERE slug = $1
  AND deleted_at IS NULL;


-- 1.4 Обновление профиля партнера
UPDATE partners
SET 
    name = $2,
    description = $3,
    phone = $4,
    website = $5,
    genres = $6,
    social_links = $7,
    working_hours = $8,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 1.5 Обновление цен
UPDATE partners
SET 
    base_price = $2,
    price_range_min = $3,
    price_range_max = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING id, base_price, price_range_min, price_range_max;


-- 1.6 Загрузка логотипа
UPDATE partners
SET 
    logo_url = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, logo_url;


-- 1.7 Мягкое удаление партнера
UPDATE partners
SET 
    deleted_at = NOW(),
    deletion_reason = $2,
    status = 'archived',
    updated_at = NOW()
WHERE id = $1
RETURNING id;


-- ============================================================================
-- 2. ПОИСК И ФИЛЬТРАЦИЯ
-- ============================================================================

-- 2.1 Получение всех партнеров с фильтрами
SELECT 
    p.id,
    p.uuid,
    p.name,
    p.category,
    p.logo_url,
    p.country,
    p.city,
    p.base_price,
    p.rating,
    p.reviews_count,
    p.approval_rate,
    p.verified,
    p.premium,
    p.featured,
    p.audience_size,
    p.created_at,
    COUNT(*) OVER() AS total_count
FROM partners p
WHERE p.deleted_at IS NULL
  -- Фильтры
  AND ($1::VARCHAR IS NULL OR p.category = $1)
  AND ($2::VARCHAR IS NULL OR p.status = $2)
  AND ($3::VARCHAR IS NULL OR p.country = $3)
  AND ($4::VARCHAR IS NULL OR p.city = $4)
  AND ($5::BOOLEAN IS NULL OR p.verified = $5)
  AND ($6::BOOLEAN IS NULL OR p.premium = $6)
  AND ($7::DECIMAL IS NULL OR p.base_price >= $7)
  AND ($8::DECIMAL IS NULL OR p.base_price <= $8)
  AND ($9::DECIMAL IS NULL OR p.rating >= $9)
  -- Поиск по жанрам (JSONB contains)
  AND ($10::JSONB IS NULL OR p.genres @> $10)
  -- Текстовый поиск
  AND ($11::TEXT IS NULL OR 
       to_tsvector('russian', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('russian', $11))
ORDER BY 
    CASE WHEN $12 = 'rating_desc' THEN p.rating END DESC,
    CASE WHEN $12 = 'rating_asc' THEN p.rating END ASC,
    CASE WHEN $12 = 'price_desc' THEN p.base_price END DESC,
    CASE WHEN $12 = 'price_asc' THEN p.base_price END ASC,
    CASE WHEN $12 = 'popular' THEN p.reviews_count END DESC,
    CASE WHEN $12 = 'newest' THEN p.created_at END DESC,
    p.rating DESC
LIMIT $13 OFFSET $14;


-- 2.2 Полнотекстовый поиск партнеров
SELECT 
    p.id,
    p.name,
    p.category,
    p.logo_url,
    p.city,
    p.rating,
    p.base_price,
    ts_rank(
        to_tsvector('russian', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.city, '')),
        plainto_tsquery('russian', $1)
    ) AS rank
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND to_tsvector('russian', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('russian', $1)
ORDER BY rank DESC, p.rating DESC
LIMIT 50;


-- 2.3 Фильтрация по жанрам
SELECT 
    p.*
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.genres ?| $1 -- Содержит хотя бы один из жанров
ORDER BY p.rating DESC
LIMIT 100;


-- 2.4 Партнеры в определенном городе
SELECT 
    p.id,
    p.name,
    p.category,
    p.logo_url,
    p.address,
    p.phone,
    p.rating,
    p.reviews_count
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.country = $1
  AND p.city = $2
ORDER BY p.rating DESC;


-- 2.5 Рекомендуемые партнеры
SELECT 
    p.*
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.featured = TRUE
  AND p.verified = TRUE
ORDER BY p.rating DESC, p.reviews_count DESC
LIMIT 20;


-- 2.6 Премиум партнеры
SELECT 
    p.*
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.premium = TRUE
ORDER BY p.rating DESC
LIMIT 50;


-- ============================================================================
-- 3. МОДЕРАЦИЯ И ВЕРИФИКАЦИЯ
-- ============================================================================

-- 3.1 Партнеры на модерации
SELECT 
    p.id,
    p.name,
    p.category,
    p.email,
    p.moderation_status,
    p.created_at,
    p.added_by
FROM partners p
WHERE p.moderation_status = 'pending'
  AND p.deleted_at IS NULL
ORDER BY p.created_at ASC;


-- 3.2 Одобрение партнера
UPDATE partners
SET 
    moderation_status = 'approved',
    status = 'active',
    moderated_at = NOW(),
    moderated_by_admin_id = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, moderation_status, status;


-- 3.3 Отклонение партнера
UPDATE partners
SET 
    moderation_status = 'rejected',
    status = 'blocked',
    rejection_reason = $2,
    moderated_at = NOW(),
    moderated_by_admin_id = $3,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, moderation_status;


-- 3.4 Верификация партнера
UPDATE partners
SET 
    verified = TRUE,
    verification_date = NOW(),
    verified_by_admin_id = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, verified;


-- 3.5 Снятие верификации
UPDATE partners
SET 
    verified = FALSE,
    verification_date = NULL,
    verified_by_admin_id = NULL,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, verified;


-- ============================================================================
-- 4. СТАТУС И ДОСТУПНОСТЬ
-- ============================================================================

-- 4.1 Изменение статуса
UPDATE partners
SET 
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, status;


-- 4.2 Блокировка партнера
UPDATE partners
SET 
    status = 'blocked',
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, status;


-- 4.3 Разблокировка партнера
UPDATE partners
SET 
    status = 'active',
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, status;


-- 4.4 Установка премиум статуса
UPDATE partners
SET 
    premium = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, premium;


-- 4.5 Установка флага "Рекомендуемый"
UPDATE partners
SET 
    featured = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, featured;


-- 4.6 Изменение доступности
UPDATE partners
SET 
    is_available = $2,
    availability_notes = $3,
    updated_at = NOW()
WHERE id = $1
RETURNING id, is_available;


-- ============================================================================
-- 5. УСЛУГИ ПАРТНЕРОВ
-- ============================================================================

-- 5.1 Создание услуги
INSERT INTO partner_services (
    partner_id,
    service_name,
    service_type,
    description,
    price,
    duration_days,
    guaranteed_reach,
    delivery_time_days
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;


-- 5.2 Получение услуг партнера
SELECT 
    ps.*
FROM partner_services ps
WHERE ps.partner_id = $1
  AND ps.is_active = TRUE
ORDER BY ps.is_popular DESC, ps.total_orders DESC;


-- 5.3 Обновление услуги
UPDATE partner_services
SET 
    service_name = $2,
    description = $3,
    price = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 5.4 Деактивация услуги
UPDATE partner_services
SET 
    is_active = FALSE,
    updated_at = NOW()
WHERE id = $1
RETURNING id;


-- ============================================================================
-- 6. ОТЗЫВЫ
-- ============================================================================

-- 6.1 Создание отзыва о партнере
INSERT INTO partner_reviews (
    partner_id,
    user_id,
    order_id,
    overall_rating,
    response_quality_rating,
    professionalism_rating,
    value_for_money_rating,
    communication_rating,
    review_title,
    review_text,
    pros,
    cons,
    would_recommend,
    is_verified_purchase
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
) RETURNING id, uuid;


-- 6.2 Получение отзывов о партнере
SELECT 
    pr.id,
    pr.overall_rating,
    pr.review_title,
    pr.review_text,
    pr.pros,
    pr.cons,
    pr.would_recommend,
    pr.is_verified_purchase,
    pr.helpful_count,
    pr.partner_response,
    pr.created_at,
    u.name AS reviewer_name,
    u.avatar_url AS reviewer_avatar
FROM partner_reviews pr
JOIN users u ON pr.user_id = u.id
WHERE pr.partner_id = $1
  AND pr.moderation_status = 'approved'
ORDER BY pr.created_at DESC
LIMIT $2 OFFSET $3;


-- 6.3 Модерация отзыва
UPDATE partner_reviews
SET 
    moderation_status = $2,
    moderated_at = NOW(),
    moderated_by_admin_id = $3,
    moderation_notes = $4
WHERE id = $1
RETURNING id, moderation_status;


-- 6.4 Ответ партнера на отзыв
UPDATE partner_reviews
SET 
    partner_response = $2,
    partner_responded_at = NOW()
WHERE id = $1
  AND partner_id = (SELECT id FROM partners WHERE email = current_setting('app.current_user_email', TRUE))
RETURNING id;


-- 6.5 Пометка отзыва как полезный/бесполезный
UPDATE partner_reviews
SET 
    helpful_count = CASE WHEN $2 = TRUE THEN helpful_count + 1 ELSE helpful_count END,
    not_helpful_count = CASE WHEN $2 = FALSE THEN not_helpful_count + 1 ELSE not_helpful_count END
WHERE id = $1
RETURNING id, helpful_count, not_helpful_count;


-- ============================================================================
-- 7. ВЫПЛАТЫ
-- ============================================================================

-- 7.1 Создание выплаты
INSERT INTO partner_payouts (
    partner_id,
    amount,
    period_start,
    period_end,
    total_orders,
    commission_amount,
    payout_method,
    payout_details
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING id, uuid;


-- 7.2 Получение выплат партнера
SELECT 
    pp.*
FROM partner_payouts pp
WHERE pp.partner_id = $1
ORDER BY pp.created_at DESC
LIMIT $2 OFFSET $3;


-- 7.3 Одобрение выплаты
UPDATE partner_payouts
SET 
    status = 'processing',
    processed_by_admin_id = $2,
    processed_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 7.4 Завершение выплаты
UPDATE partner_payouts
SET 
    status = 'completed',
    transaction_id = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 7.5 Отмена выплаты
UPDATE partner_payouts
SET 
    status = 'cancelled',
    notes = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id;


-- 7.6 Подсчет суммы для выплаты партнеру
SELECT 
    p.id,
    p.name,
    p.balance,
    p.pending_payout,
    SUM(pp.amount) FILTER (WHERE pp.status = 'completed') AS total_paid_out,
    p.total_earned - COALESCE(SUM(pp.amount) FILTER (WHERE pp.status = 'completed'), 0) AS available_for_payout
FROM partners p
LEFT JOIN partner_payouts pp ON p.id = pp.partner_id
WHERE p.id = $1
GROUP BY p.id;


-- ============================================================================
-- 8. СТАТИСТИКА И АНАЛИТИКА
-- ============================================================================

-- 8.1 Общая статистика партнеров
SELECT 
    COUNT(*) AS total_partners,
    COUNT(*) FILTER (WHERE status = 'active') AS active_partners,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_partners,
    COUNT(*) FILTER (WHERE status = 'blocked') AS blocked_partners,
    COUNT(*) FILTER (WHERE verified = TRUE) AS verified_partners,
    COUNT(*) FILTER (WHERE premium = TRUE) AS premium_partners,
    COUNT(*) FILTER (WHERE category = 'radio') AS radio_count,
    COUNT(*) FILTER (WHERE category = 'playlist') AS playlist_count,
    COUNT(*) FILTER (WHERE category = 'blogger') AS blogger_count,
    COUNT(*) FILTER (WHERE category = 'media') AS media_count,
    COUNT(*) FILTER (WHERE category = 'venue') AS venue_count,
    AVG(rating) AS average_rating,
    SUM(total_earned) AS total_platform_earned,
    SUM(balance) AS total_partner_balance
FROM partners
WHERE deleted_at IS NULL;


-- 8.2 Топ партнеров по рейтингу
SELECT 
    p.id,
    p.name,
    p.category,
    p.rating,
    p.reviews_count,
    p.total_orders,
    p.completed_orders,
    p.approval_rate,
    p.total_earned
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.verified = TRUE
ORDER BY p.rating DESC, p.reviews_count DESC
LIMIT 100;


-- 8.3 Топ партнеров по заработку
SELECT 
    p.id,
    p.name,
    p.category,
    p.total_earned,
    p.total_orders,
    p.rating,
    (p.total_earned / NULLIF(p.total_orders, 0)) AS avg_order_value
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
ORDER BY p.total_earned DESC
LIMIT 100;


-- 8.4 Статистика по категориям
SELECT 
    category,
    COUNT(*) AS partners_count,
    AVG(rating) AS avg_rating,
    SUM(total_orders) AS total_orders,
    SUM(total_earned) AS total_earned,
    AVG(base_price) AS avg_price
FROM partners
WHERE deleted_at IS NULL
  AND status = 'active'
GROUP BY category
ORDER BY partners_count DESC;


-- 8.5 Статистика по странам
SELECT 
    country,
    COUNT(*) AS partners_count,
    AVG(rating) AS avg_rating,
    SUM(total_earned) AS total_earned
FROM partners
WHERE deleted_at IS NULL
  AND status = 'active'
GROUP BY country
ORDER BY partners_count DESC;


-- 8.6 Активность партнеров за период
SELECT 
    DATE(created_at) AS registration_date,
    COUNT(*) AS new_partners,
    COUNT(*) FILTER (WHERE verified = TRUE) AS verified_count
FROM partners
WHERE created_at > $1
  AND created_at < $2
  AND deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;


-- 8.7 Средний approval rate по категориям
SELECT 
    category,
    AVG(approval_rate) AS avg_approval_rate,
    AVG(average_response_time_hours) AS avg_response_time
FROM partners
WHERE deleted_at IS NULL
  AND status = 'active'
  AND total_pitches_received > 10 -- Минимум 10 питчей для статистики
GROUP BY category
ORDER BY avg_approval_rate DESC;


-- ============================================================================
-- 9. ИЗБРАННОЕ
-- ============================================================================

-- 9.1 Добавить партнера в избранное
INSERT INTO user_favorite_partners (user_id, partner_id, notes)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, partner_id) DO UPDATE
SET notes = EXCLUDED.notes
RETURNING id;


-- 9.2 Удалить из избранного
DELETE FROM user_favorite_partners
WHERE user_id = $1 AND partner_id = $2
RETURNING id;


-- 9.3 Получить избранных партнеров пользователя
SELECT 
    p.*,
    ufp.notes,
    ufp.created_at AS favorited_at
FROM user_favorite_partners ufp
JOIN partners p ON ufp.partner_id = p.id
WHERE ufp.user_id = $1
  AND p.deleted_at IS NULL
ORDER BY ufp.created_at DESC;


-- 9.4 Проверить, в избранном ли партнер
SELECT EXISTS(
    SELECT 1 
    FROM user_favorite_partners 
    WHERE user_id = $1 AND partner_id = $2
) AS is_favorite;


-- ============================================================================
-- 10. ИСТОРИЯ АКТИВНОСТИ
-- ============================================================================

-- 10.1 Получение истории активности партнера
SELECT 
    pal.id,
    pal.action_type,
    pal.action_description,
    pal.old_values,
    pal.new_values,
    pal.created_at,
    u.name AS admin_name
FROM partners_activity_log pal
LEFT JOIN users u ON pal.admin_id = u.id
WHERE pal.partner_id = $1
ORDER BY pal.created_at DESC
LIMIT $2 OFFSET $3;


-- 10.2 Логирование ручного действия
INSERT INTO partners_activity_log (
    partner_id,
    admin_id,
    action_type,
    action_description,
    ip_address
) VALUES (
    $1, $2, $3, $4, $5::inet
);


-- ============================================================================
-- 11. ОБНОВЛЕНИЕ СТАТИСТИКИ
-- ============================================================================

-- 11.1 Обновление счетчиков партнера после заказа
UPDATE partners
SET 
    total_orders = total_orders + 1,
    active_orders = active_orders + 1,
    last_activity_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING total_orders, active_orders;


-- 11.2 Обновление при завершении заказа
UPDATE partners
SET 
    completed_orders = completed_orders + 1,
    active_orders = active_orders - 1,
    total_earned = total_earned + $2,
    balance = balance + $2,
    updated_at = NOW()
WHERE id = $1
RETURNING completed_orders, total_earned, balance;


-- 11.3 Пересчет approval rate
UPDATE partners
SET 
    approval_rate = (
        total_pitches_approved::FLOAT / NULLIF(total_pitches_received, 0) * 100
    ),
    updated_at = NOW()
WHERE id = $1
RETURNING approval_rate;


-- ============================================================================
-- 12. МАССОВЫЕ ОПЕРАЦИИ
-- ============================================================================

-- 12.1 Массовая деактивация партнеров
UPDATE partners
SET 
    status = 'archived',
    updated_at = NOW()
WHERE id = ANY($1::BIGINT[])
RETURNING id, name;


-- 12.2 Массовая установка премиум статуса
UPDATE partners
SET 
    premium = $2,
    updated_at = NOW()
WHERE id = ANY($1::BIGINT[])
RETURNING id, name, premium;


-- 12.3 Экспорт партнеров в CSV формат
COPY (
    SELECT 
        id,
        name,
        category,
        email,
        phone,
        country,
        city,
        status,
        verified,
        rating,
        total_orders,
        total_earned,
        created_at
    FROM partners
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
) TO STDOUT WITH CSV HEADER;


-- ============================================================================
-- КОНЕЦ ЗАПРОСОВ
-- ============================================================================
