-- ============================================================================
-- PROMO.MUSIC - USERS MANAGEMENT SQL QUERIES
-- Готовые SQL запросы для работы с пользователями
-- ============================================================================


-- ============================================================================
-- 1. CRUD ОПЕРАЦИИ
-- ============================================================================

-- 1.1 Создание нового пользователя
INSERT INTO users (
    name,
    email,
    password_hash,
    username,
    phone,
    country,
    city,
    role,
    subscription_tier,
    referral_code,
    referred_by_user_id
) VALUES (
    'Александр Иванов',
    'alexandr@example.com',
    '$2b$10$...', -- Хешированный пароль
    'alexandr_music',
    '+7 (999) 123-45-67',
    'Россия',
    'Москва',
    'artist',
    'free',
    'ALEX2024',
    NULL
) RETURNING id, uuid, name, email;


-- 1.2 Получение пользователя по ID
SELECT 
    id,
    uuid,
    name,
    username,
    email,
    phone,
    avatar_url,
    bio,
    role,
    subscription_tier,
    balance,
    currency,
    status,
    country,
    city,
    social_links,
    rating,
    reviews_count,
    total_campaigns_created,
    total_orders_completed,
    email_verified,
    phone_verified,
    created_at,
    last_login_at
FROM users
WHERE id = $1
  AND deleted_at IS NULL;


-- 1.3 Получение пользователя по email
SELECT *
FROM users
WHERE email = $1
  AND deleted_at IS NULL;


-- 1.4 Обновление профиля пользователя
UPDATE users
SET 
    name = $2,
    bio = $3,
    phone = $4,
    country = $5,
    city = $6,
    social_links = $7,
    updated_at = NOW()
WHERE id = $1
RETURNING *;


-- 1.5 Обновление аватара
UPDATE users
SET 
    avatar_url = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, avatar_url;


-- 1.6 Мягкое удаление пользователя
UPDATE users
SET 
    deleted_at = NOW(),
    deletion_reason = $2,
    status = 'deleted',
    updated_at = NOW()
WHERE id = $1
RETURNING id;


-- 1.7 Полное удаление (только для админов)
DELETE FROM users
WHERE id = $1
  AND deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '30 days'; -- Удаляем только через 30 дней


-- ============================================================================
-- 2. АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ
-- ============================================================================

-- 2.1 Проверка учетных данных при входе
SELECT 
    id,
    uuid,
    email,
    password_hash,
    name,
    role,
    status,
    email_verified
FROM users
WHERE email = $1
  AND deleted_at IS NULL
  AND status IN ('active', 'pending');


-- 2.2 Обновление данных входа
UPDATE users
SET 
    last_login_at = NOW(),
    last_login_ip = $2,
    last_login_user_agent = $3,
    last_activity_at = NOW(),
    failed_login_attempts = 0
WHERE id = $1;


-- 2.3 Увеличение счетчика неудачных попыток входа
UPDATE users
SET 
    failed_login_attempts = failed_login_attempts + 1,
    last_failed_login_at = NOW()
WHERE email = $1
RETURNING failed_login_attempts;


-- 2.4 Создание сессии
INSERT INTO user_sessions (
    user_id,
    access_token,
    refresh_token,
    ip_address,
    user_agent,
    device_type,
    browser,
    os,
    expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    NOW() + INTERVAL '7 days'
) RETURNING id, uuid, access_token;


-- 2.5 Проверка и получение сессии
SELECT 
    s.*,
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    u.status
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.access_token = $1
  AND s.is_active = TRUE
  AND s.expires_at > NOW()
  AND u.deleted_at IS NULL;


-- 2.6 Отзыв сессии (logout)
UPDATE user_sessions
SET 
    is_active = FALSE,
    revoked_at = NOW(),
    revoked_reason = 'user_logout'
WHERE access_token = $1;


-- 2.7 Отзыв всех сессий пользователя
UPDATE user_sessions
SET 
    is_active = FALSE,
    revoked_at = NOW(),
    revoked_reason = 'logout_all_devices'
WHERE user_id = $1
  AND is_active = TRUE;


-- 2.8 Сброс пароля - создание токена
UPDATE users
SET 
    password_reset_token = $2,
    password_reset_expires_at = NOW() + INTERVAL '1 hour',
    updated_at = NOW()
WHERE email = $1
  AND deleted_at IS NULL
RETURNING id, email, name;


-- 2.9 Подтверждение сброса пароля
UPDATE users
SET 
    password_hash = $2,
    password_reset_token = NULL,
    password_reset_expires_at = NULL,
    updated_at = NOW()
WHERE password_reset_token = $1
  AND password_reset_expires_at > NOW()
RETURNING id, email;


-- 2.10 Верификация email
UPDATE users
SET 
    email_verified = TRUE,
    email_verified_at = NOW(),
    email_verification_token = NULL,
    status = CASE WHEN status = 'pending' THEN 'active' ELSE status END
WHERE email_verification_token = $1
RETURNING id, email, name;


-- ============================================================================
-- 3. АДМИНИСТРИРОВАНИЕ
-- ============================================================================

-- 3.1 Получение всех пользователей с фильтрами и пагинацией
SELECT 
    u.id,
    u.uuid,
    u.name,
    u.username,
    u.email,
    u.phone,
    u.avatar_url,
    u.role,
    u.subscription_tier,
    u.balance,
    u.status,
    u.country,
    u.city,
    u.rating,
    u.total_campaigns_created,
    u.total_orders_completed,
    u.created_at,
    u.last_login_at,
    COUNT(*) OVER() AS total_count
FROM users u
WHERE u.deleted_at IS NULL
  -- Фильтры
  AND ($1::VARCHAR IS NULL OR u.role = $1)
  AND ($2::VARCHAR IS NULL OR u.status = $2)
  AND ($3::VARCHAR IS NULL OR u.subscription_tier = $3)
  AND ($4::VARCHAR IS NULL OR u.country = $4)
  AND ($5::TEXT IS NULL OR 
       u.name ILIKE '%' || $5 || '%' OR 
       u.email ILIKE '%' || $5 || '%' OR 
       u.username ILIKE '%' || $5 || '%')
ORDER BY 
    CASE WHEN $6 = 'created_at_desc' THEN u.created_at END DESC,
    CASE WHEN $6 = 'created_at_asc' THEN u.created_at END ASC,
    CASE WHEN $6 = 'name_asc' THEN u.name END ASC,
    CASE WHEN $6 = 'name_desc' THEN u.name END DESC,
    CASE WHEN $6 = 'balance_desc' THEN u.balance END DESC,
    CASE WHEN $6 = 'balance_asc' THEN u.balance END ASC,
    u.created_at DESC
LIMIT $7 OFFSET $8;


-- 3.2 Блокировка пользователя
UPDATE users
SET 
    status = 'blocked',
    block_reason = $2,
    blocked_until = $3,
    blocked_by_admin_id = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, status;


-- 3.3 Разблокировка пользователя
UPDATE users
SET 
    status = 'active',
    block_reason = NULL,
    blocked_until = NULL,
    blocked_by_admin_id = NULL,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, status;


-- 3.4 Изменение роли пользователя
UPDATE users
SET 
    role = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, role;


-- 3.5 Изменение подписки
UPDATE users
SET 
    subscription_tier = $2,
    subscription_expires_at = $3,
    subscription_started_at = COALESCE(subscription_started_at, NOW()),
    updated_at = NOW()
WHERE id = $1
RETURNING id, subscription_tier, subscription_expires_at;


-- 3.6 Ручная корректировка баланса
WITH transaction AS (
    INSERT INTO user_balance_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        status,
        description,
        created_by_admin_id
    )
    SELECT 
        $1,
        'correction',
        $2,
        balance,
        balance + $2,
        'completed',
        $3,
        $4
    FROM users WHERE id = $1
    RETURNING balance_after
)
UPDATE users
SET 
    balance = (SELECT balance_after FROM transaction),
    updated_at = NOW()
WHERE id = $1
RETURNING id, balance;


-- 3.7 Установка персональной скидки
UPDATE users
SET 
    personal_discount_percentage = $2,
    discount_reason = $3,
    discount_expires_at = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING id, personal_discount_percentage, discount_expires_at;


-- ============================================================================
-- 4. СТАТИСТИКА И ОТЧЕТЫ
-- ============================================================================

-- 4.1 Общая статистика пользователей
SELECT 
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE status = 'active') AS active_users,
    COUNT(*) FILTER (WHERE status = 'blocked') AS blocked_users,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_users,
    COUNT(*) FILTER (WHERE role = 'artist') AS artists_count,
    COUNT(*) FILTER (WHERE role = 'admin') AS admins_count,
    COUNT(*) FILTER (WHERE role = 'partner') AS partners_count,
    COUNT(*) FILTER (WHERE subscription_tier = 'free') AS free_tier_count,
    COUNT(*) FILTER (WHERE subscription_tier = 'basic') AS basic_tier_count,
    COUNT(*) FILTER (WHERE subscription_tier = 'pro') AS pro_tier_count,
    COUNT(*) FILTER (WHERE subscription_tier = 'premium') AS premium_tier_count,
    COUNT(*) FILTER (WHERE email_verified = TRUE) AS verified_users,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS new_users_30d,
    COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '7 days') AS active_7d,
    SUM(balance) AS total_balance,
    AVG(balance) AS average_balance
FROM users
WHERE deleted_at IS NULL;


-- 4.2 Топ пользователей по балансу
SELECT 
    id,
    name,
    email,
    balance,
    subscription_tier,
    total_spent,
    created_at
FROM users
WHERE deleted_at IS NULL
ORDER BY balance DESC
LIMIT 100;


-- 4.3 Топ пользователей по активности
SELECT 
    u.id,
    u.name,
    u.email,
    u.total_campaigns_created,
    u.total_orders_completed,
    u.rating,
    u.reviews_count,
    u.last_login_at,
    COUNT(DISTINCT ual.id) AS total_activities
FROM users u
LEFT JOIN users_activity_log ual ON u.id = ual.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id
ORDER BY total_activities DESC, u.total_campaigns_created DESC
LIMIT 100;


-- 4.4 Аналитика по странам
SELECT 
    country,
    COUNT(*) AS users_count,
    COUNT(*) FILTER (WHERE status = 'active') AS active_users,
    AVG(balance) AS avg_balance,
    SUM(total_spent) AS total_spent,
    COUNT(*) FILTER (WHERE subscription_tier != 'free') AS paid_users
FROM users
WHERE deleted_at IS NULL
GROUP BY country
ORDER BY users_count DESC;


-- 4.5 Аналитика по подпискам
SELECT 
    subscription_tier,
    COUNT(*) AS users_count,
    SUM(balance) AS total_balance,
    AVG(balance) AS avg_balance,
    SUM(total_spent) AS total_spent,
    AVG(total_campaigns_created) AS avg_campaigns
FROM users
WHERE deleted_at IS NULL
GROUP BY subscription_tier
ORDER BY 
    CASE subscription_tier
        WHEN 'premium' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'basic' THEN 3
        WHEN 'free' THEN 4
    END;


-- 4.6 Регистрации по дням за последний месяц
SELECT 
    DATE(created_at) AS registration_date,
    COUNT(*) AS registrations_count,
    COUNT(*) FILTER (WHERE email_verified = TRUE) AS verified_count
FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
  AND deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY registration_date DESC;


-- 4.7 Активность входов по дням
SELECT 
    DATE(last_login_at) AS login_date,
    COUNT(DISTINCT id) AS unique_logins
FROM users
WHERE last_login_at > NOW() - INTERVAL '30 days'
  AND deleted_at IS NULL
GROUP BY DATE(last_login_at)
ORDER BY login_date DESC;


-- ============================================================================
-- 5. БАЛАНСОВЫЕ ОПЕРАЦИИ
-- ============================================================================

-- 5.1 История транзакций пользователя
SELECT 
    id,
    uuid,
    transaction_type,
    amount,
    currency,
    balance_before,
    balance_after,
    status,
    description,
    reference_type,
    reference_id,
    payment_method,
    created_at,
    completed_at
FROM user_balance_transactions
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;


-- 5.2 Пополнение баланса
WITH new_transaction AS (
    INSERT INTO user_balance_transactions (
        user_id,
        transaction_type,
        amount,
        currency,
        balance_before,
        balance_after,
        status,
        description,
        payment_method,
        external_transaction_id
    )
    SELECT 
        $1,
        'deposit',
        $2,
        $3,
        balance,
        balance + $2,
        'completed',
        $4,
        $5,
        $6
    FROM users WHERE id = $1
    RETURNING *
)
UPDATE users
SET 
    balance = (SELECT balance_after FROM new_transaction),
    updated_at = NOW()
WHERE id = $1
RETURNING id, balance;


-- 5.3 Списание с баланса (оплата)
WITH new_transaction AS (
    INSERT INTO user_balance_transactions (
        user_id,
        transaction_type,
        amount,
        currency,
        balance_before,
        balance_after,
        status,
        description,
        reference_type,
        reference_id
    )
    SELECT 
        $1,
        'payment',
        -ABS($2), -- Отрицательная сумма
        $3,
        balance,
        balance - ABS($2),
        'completed',
        $4,
        $5,
        $6
    FROM users 
    WHERE id = $1 
      AND balance >= ABS($2) -- Проверка достаточности средств
    RETURNING *
)
UPDATE users
SET 
    balance = (SELECT balance_after FROM new_transaction),
    total_spent = total_spent + ABS($2),
    updated_at = NOW()
WHERE id = $1
  AND EXISTS (SELECT 1 FROM new_transaction)
RETURNING id, balance;


-- 5.4 Возврат средств
WITH refund_transaction AS (
    INSERT INTO user_balance_transactions (
        user_id,
        transaction_type,
        amount,
        currency,
        balance_before,
        balance_after,
        status,
        description,
        reference_type,
        reference_id
    )
    SELECT 
        $1,
        'refund',
        $2,
        'RUB',
        balance,
        balance + $2,
        'completed',
        $3,
        $4,
        $5
    FROM users WHERE id = $1
    RETURNING *
)
UPDATE users
SET 
    balance = (SELECT balance_after FROM refund_transaction),
    updated_at = NOW()
WHERE id = $1
RETURNING id, balance;


-- 5.5 Начисление реферального бонуса
WITH referral_bonus AS (
    INSERT INTO user_balance_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        status,
        description
    )
    SELECT 
        $1,
        'referral_reward',
        $2,
        balance,
        balance + $2,
        'completed',
        'Бонус за приглашение: ' || $3
    FROM users WHERE id = $1
    RETURNING *
)
UPDATE users
SET 
    balance = (SELECT balance_after FROM referral_bonus),
    referral_earnings = referral_earnings + $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, balance, referral_earnings;


-- ============================================================================
-- 6. УВЕДОМЛЕНИЯ
-- ============================================================================

-- 6.1 Создание уведомления
INSERT INTO user_notifications (
    user_id,
    notification_type,
    title,
    message,
    action_url,
    priority,
    metadata
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING id, uuid, created_at;


-- 6.2 Получение непрочитанных уведомлений
SELECT 
    id,
    uuid,
    notification_type,
    title,
    message,
    action_url,
    priority,
    created_at
FROM user_notifications
WHERE user_id = $1
  AND is_read = FALSE
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY 
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    created_at DESC
LIMIT 50;


-- 6.3 Пометка уведомления как прочитанное
UPDATE user_notifications
SET 
    is_read = TRUE,
    read_at = NOW()
WHERE id = $1
  AND user_id = $2
RETURNING id;


-- 6.4 Пометка всех уведомлений как прочитанные
UPDATE user_notifications
SET 
    is_read = TRUE,
    read_at = NOW()
WHERE user_id = $1
  AND is_read = FALSE
RETURNING COUNT(*);


-- 6.5 Удаление старых прочитанных уведомлений
DELETE FROM user_notifications
WHERE is_read = TRUE
  AND read_at < NOW() - INTERVAL '30 days'
RETURNING COUNT(*);


-- ============================================================================
-- 7. ОТЗЫВЫ И РЕЙТИНГИ
-- ============================================================================

-- 7.1 Создание отзыва
INSERT INTO user_reviews (
    reviewer_id,
    reviewed_user_id,
    order_id,
    rating,
    review_text,
    pros,
    cons,
    communication_rating,
    quality_rating,
    professionalism_rating,
    timeliness_rating
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING id, uuid, created_at;


-- 7.2 Получение отзывов о пользователе
SELECT 
    r.id,
    r.uuid,
    r.rating,
    r.review_text,
    r.pros,
    r.cons,
    r.communication_rating,
    r.quality_rating,
    r.professionalism_rating,
    r.timeliness_rating,
    r.helpful_count,
    r.not_helpful_count,
    r.response_text,
    r.created_at,
    u.name AS reviewer_name,
    u.avatar_url AS reviewer_avatar
FROM user_reviews r
JOIN users u ON r.reviewer_id = u.id
WHERE r.reviewed_user_id = $1
  AND r.moderation_status = 'approved'
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3;


-- 7.3 Модерация отзыва
UPDATE user_reviews
SET 
    moderation_status = $2,
    moderated_by_admin_id = $3,
    moderation_notes = $4,
    moderated_at = NOW(),
    updated_at = NOW()
WHERE id = $1
RETURNING id, moderation_status;


-- ============================================================================
-- 8. ПОИСК И ФИЛЬТРАЦИЯ
-- ============================================================================

-- 8.1 Полнотекстовый поиск пользователей
SELECT 
    id,
    uuid,
    name,
    username,
    email,
    avatar_url,
    role,
    subscription_tier,
    country,
    city,
    rating,
    ts_rank(to_tsvector('russian', name || ' ' || COALESCE(bio, '') || ' ' || email), 
            plainto_tsquery('russian', $1)) AS rank
FROM users
WHERE deleted_at IS NULL
  AND to_tsvector('russian', name || ' ' || COALESCE(bio, '') || ' ' || email) @@ plainto_tsquery('russian', $1)
ORDER BY rank DESC, rating DESC
LIMIT 50;


-- 8.2 Поиск по реферальному коду
SELECT 
    id,
    name,
    username,
    email,
    referral_code,
    referrals_count,
    referral_earnings
FROM users
WHERE referral_code = $1
  AND deleted_at IS NULL;


-- 8.3 Получение рефералов пользователя
SELECT 
    id,
    name,
    email,
    subscription_tier,
    total_spent,
    created_at
FROM users
WHERE referred_by_user_id = $1
  AND deleted_at IS NULL
ORDER BY created_at DESC;


-- ============================================================================
-- КОНЕЦ ЗАПРОСОВ
-- ============================================================================
