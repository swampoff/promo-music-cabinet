-- ============================================================================
-- PROMO.MUSIC - USERS MANAGEMENT MODULE DATABASE SCHEMA
-- Полная структура БД для управления пользователями
-- PostgreSQL / Supabase compatible
-- ============================================================================

-- ============================================================================
-- 1. ОСНОВНАЯ ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (РАСШИРЕННАЯ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Аутентификация
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    
    -- Профиль
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    avatar_url VARCHAR(500),
    bio TEXT,
    
    -- Роль и права
    role VARCHAR(50) DEFAULT 'artist' NOT NULL, 
    -- 'artist', 'admin', 'partner', 'manager', 'moderator'
    permissions JSONB DEFAULT '[]', -- Массив разрешений
    
    -- Подписка
    subscription_tier VARCHAR(50) DEFAULT 'free' NOT NULL,
    -- 'free', 'basic', 'pro', 'premium'
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    auto_renewal BOOLEAN DEFAULT TRUE,
    
    -- Финансы
    balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Личные скидки
    personal_discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_reason TEXT,
    discount_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Контакты
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Россия',
    city VARCHAR(100),
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    
    -- Социальные сети
    social_links JSONB, 
    -- {'instagram': '@username', 'vk': 'vk.com/page', 'youtube': 'channel_id'}
    
    -- Верификация
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verification_code VARCHAR(10),
    identity_verified BOOLEAN DEFAULT FALSE, -- KYC верификация
    
    -- Статус и модерация
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    -- 'active', 'blocked', 'pending', 'suspended', 'deleted'
    block_reason TEXT,
    blocked_until TIMESTAMP WITH TIME ZONE,
    blocked_by_admin_id BIGINT,
    
    -- Настройки уведомлений
    notification_settings JSONB DEFAULT '{
        "email_notifications": true,
        "push_notifications": true,
        "sms_notifications": false,
        "marketing_emails": true,
        "campaign_updates": true,
        "payment_alerts": true
    }',
    
    -- Настройки приватности
    privacy_settings JSONB DEFAULT '{
        "profile_visibility": "public",
        "show_email": false,
        "show_phone": false,
        "show_statistics": true,
        "allow_messages": true
    }',
    
    -- Профессиональная информация
    artist_type VARCHAR(100), -- 'Musician', 'Producer', 'DJ', 'Band', 'Label'
    genres JSONB DEFAULT '[]', -- Массив жанров
    experience_years INT,
    professional_gear TEXT, -- Оборудование
    studio_availability BOOLEAN DEFAULT FALSE,
    
    -- Статистика активности
    total_tracks_uploaded INT DEFAULT 0,
    total_campaigns_created INT DEFAULT 0,
    total_orders_completed INT DEFAULT 0,
    total_orders_pending INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    reviews_count INT DEFAULT 0,
    
    -- IP и безопасность
    last_login_ip INET,
    last_login_user_agent TEXT,
    failed_login_attempts INT DEFAULT 0,
    last_failed_login_at TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Реферальная система
    referral_code VARCHAR(50) UNIQUE,
    referred_by_user_id BIGINT,
    referrals_count INT DEFAULT 0,
    referral_earnings DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Мягкое удаление
    deleted_at TIMESTAMP WITH TIME ZONE,
    deletion_reason TEXT,
    
    -- Ограничения
    CONSTRAINT fk_referred_by FOREIGN KEY (referred_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_blocked_by FOREIGN KEY (blocked_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_valid_role CHECK (role IN ('artist', 'admin', 'partner', 'manager', 'moderator')),
    CONSTRAINT check_valid_status CHECK (status IN ('active', 'blocked', 'pending', 'suspended', 'deleted')),
    CONSTRAINT check_valid_subscription CHECK (subscription_tier IN ('free', 'basic', 'pro', 'premium')),
    CONSTRAINT check_balance_non_negative CHECK (balance >= 0)
);

-- Индексы для оптимизации
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_country_city ON users(country, city);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email_verified ON users(email_verified) WHERE email_verified = FALSE;

-- Полнотекстовый поиск
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('russian', name || ' ' || COALESCE(bio, '') || ' ' || email));

COMMENT ON TABLE users IS 'Основная таблица пользователей платформы';
COMMENT ON COLUMN users.permissions IS 'JSON массив с детальными разрешениями пользователя';
COMMENT ON COLUMN users.social_links IS 'JSON объект с ссылками на социальные сети';
COMMENT ON COLUMN users.notification_settings IS 'JSON настройки уведомлений';
COMMENT ON COLUMN users.privacy_settings IS 'JSON настройки приватности профиля';


-- ============================================================================
-- 2. ТАБЛИЦА ИСТОРИИ ИЗМЕНЕНИЙ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

CREATE TABLE users_activity_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Связи
    user_id BIGINT NOT NULL,
    admin_id BIGINT, -- Кто совершил действие (NULL для самого пользователя)
    
    -- Тип действия
    action_type VARCHAR(100) NOT NULL,
    -- 'created', 'updated', 'login', 'logout', 'password_changed', 
    -- 'email_changed', 'status_changed', 'blocked', 'unblocked',
    -- 'subscription_upgraded', 'subscription_downgraded', 'balance_changed'
    
    -- Детали действия
    action_description TEXT,
    old_values JSONB, -- Старые значения
    new_values JSONB, -- Новые значения
    
    -- Контекст
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_log_user_id ON users_activity_log(user_id);
CREATE INDEX idx_user_log_admin_id ON users_activity_log(admin_id);
CREATE INDEX idx_user_log_action_type ON users_activity_log(action_type);
CREATE INDEX idx_user_log_created_at ON users_activity_log(created_at DESC);

COMMENT ON TABLE users_activity_log IS 'Логи всех действий пользователей и администраторов';


-- ============================================================================
-- 3. ТАБЛИЦА СЕССИЙ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связь с пользователем
    user_id BIGINT NOT NULL,
    
    -- Токены
    access_token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    
    -- Информация о сессии
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(100),
    os VARCHAR(100),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    
    -- Срок действия
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Статус
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_access_token ON user_sessions(access_token);
CREATE INDEX idx_sessions_is_active ON user_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

COMMENT ON TABLE user_sessions IS 'Активные сессии пользователей';


-- ============================================================================
-- 4. ТАБЛИЦА БАЛАНСА И ТРАНЗАКЦИЙ
-- ============================================================================

CREATE TABLE user_balance_transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связь с пользователем
    user_id BIGINT NOT NULL,
    
    -- Тип транзакции
    transaction_type VARCHAR(50) NOT NULL,
    -- 'deposit', 'withdrawal', 'payment', 'refund', 'bonus', 
    -- 'referral_reward', 'penalty', 'correction'
    
    -- Сумма
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Баланс до и после
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'completed' NOT NULL,
    -- 'pending', 'completed', 'failed', 'cancelled'
    
    -- Описание
    description TEXT NOT NULL,
    reference_type VARCHAR(100), -- 'campaign', 'order', 'subscription', etc.
    reference_id BIGINT, -- ID связанной сущности
    
    -- Платежная система
    payment_method VARCHAR(50), -- 'card', 'yookassa', 'balance', 'manual'
    payment_provider VARCHAR(50), -- 'yookassa', 'stripe', 'paypal'
    external_transaction_id VARCHAR(255),
    
    -- Метаданные
    metadata JSONB,
    
    -- Кто совершил (для ручных транзакций)
    created_by_admin_id BIGINT,
    
    -- Даты
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_admin FOREIGN KEY (created_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_transaction_type CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'refund', 'bonus', 'referral_reward', 'penalty', 'correction')),
    CONSTRAINT check_transaction_status CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_balance_user_id ON user_balance_transactions(user_id);
CREATE INDEX idx_balance_transaction_type ON user_balance_transactions(transaction_type);
CREATE INDEX idx_balance_status ON user_balance_transactions(status);
CREATE INDEX idx_balance_created_at ON user_balance_transactions(created_at DESC);
CREATE INDEX idx_balance_reference ON user_balance_transactions(reference_type, reference_id);

COMMENT ON TABLE user_balance_transactions IS 'История всех транзакций баланса пользователей';


-- ============================================================================
-- 5. ТАБЛИЦА УВЕДОМЛЕНИЙ
-- ============================================================================

CREATE TABLE user_notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Получатель
    user_id BIGINT NOT NULL,
    
    -- Тип уведомления
    notification_type VARCHAR(100) NOT NULL,
    -- 'campaign_update', 'payment_success', 'payment_failed', 
    -- 'order_completed', 'subscription_expiring', 'new_message',
    -- 'partner_response', 'system_announcement'
    
    -- Контент
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500), -- Ссылка для перехода
    
    -- Приоритет
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Каналы отправки
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    
    -- Статус прочтения
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Метаданные
    metadata JSONB,
    
    -- Даты
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- После этой даты можно удалить
    
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_notification_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_notifications_type ON user_notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON user_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON user_notifications(priority);

COMMENT ON TABLE user_notifications IS 'Уведомления пользователей';


-- ============================================================================
-- 6. ТАБЛИЦА ОТЗЫВОВ О ПОЛЬЗОВАТЕЛЯХ
-- ============================================================================

CREATE TABLE user_reviews (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    reviewer_id BIGINT NOT NULL, -- Кто оставил отзыв
    reviewed_user_id BIGINT NOT NULL, -- О ком отзыв
    
    -- Контекст
    order_id BIGINT, -- Связь с заказом (если применимо)
    campaign_id BIGINT, -- Связь с кампанией (если применимо)
    
    -- Оценка
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    
    -- Отзыв
    review_text TEXT,
    pros TEXT, -- Плюсы
    cons TEXT, -- Минусы
    
    -- Категории оценок
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    professionalism_rating INT CHECK (professionalism_rating BETWEEN 1 AND 5),
    timeliness_rating INT CHECK (timeliness_rating BETWEEN 1 AND 5),
    
    -- Модерация
    moderation_status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected', 'hidden'
    moderated_by_admin_id BIGINT,
    moderation_notes TEXT,
    moderated_at TIMESTAMP WITH TIME ZONE,
    
    -- Полезность отзыва
    helpful_count INT DEFAULT 0, -- Сколько людей нашли отзыв полезным
    not_helpful_count INT DEFAULT 0,
    
    -- Ответ на отзыв
    response_text TEXT, -- Ответ от пользователя
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: один отзыв на один заказ/кампанию
    CONSTRAINT unique_review_per_order UNIQUE (reviewer_id, reviewed_user_id, order_id),
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewed FOREIGN KEY (reviewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_moderator FOREIGN KEY (moderated_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_review_moderation_status CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'hidden'))
);

CREATE INDEX idx_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_user_id ON user_reviews(reviewed_user_id);
CREATE INDEX idx_reviews_moderation_status ON user_reviews(moderation_status);
CREATE INDEX idx_reviews_rating ON user_reviews(rating DESC);
CREATE INDEX idx_reviews_created_at ON user_reviews(created_at DESC);

COMMENT ON TABLE user_reviews IS 'Отзывы пользователей друг о друге';


-- ============================================================================
-- 7. ПРЕДСТАВЛЕНИЯ (VIEWS) ДЛЯ УДОБНЫХ ЗАПРОСОВ
-- ============================================================================

-- Представление: Полная информация о пользователе с статистикой
CREATE VIEW v_users_full_info AS
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
    u.currency,
    u.status,
    u.country,
    u.city,
    u.rating,
    u.reviews_count,
    u.total_campaigns_created,
    u.total_orders_completed,
    u.created_at,
    u.last_login_at,
    u.email_verified,
    u.phone_verified,
    u.identity_verified,
    COUNT(DISTINCT s.id) AS active_sessions_count,
    COUNT(DISTINCT n.id) FILTER (WHERE n.is_read = FALSE) AS unread_notifications_count,
    (SELECT COUNT(*) FROM user_balance_transactions WHERE user_id = u.id) AS total_transactions_count,
    (SELECT SUM(amount) FROM user_balance_transactions WHERE user_id = u.id AND transaction_type = 'deposit' AND status = 'completed') AS total_deposited
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = TRUE AND s.expires_at > NOW()
LEFT JOIN user_notifications n ON u.id = n.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id;

COMMENT ON VIEW v_users_full_info IS 'Полная информация о пользователе со статистикой';


-- Представление: Статистика пользователей для админки
CREATE VIEW v_users_admin_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.status,
    u.subscription_tier,
    u.balance,
    u.total_spent,
    u.total_earned,
    u.total_campaigns_created,
    u.total_orders_completed,
    u.rating,
    u.created_at,
    u.last_login_at,
    (SELECT COUNT(*) FROM users_activity_log WHERE user_id = u.id) AS total_activities,
    (SELECT COUNT(*) FROM user_balance_transactions WHERE user_id = u.id AND transaction_type = 'payment') AS total_payments,
    CASE 
        WHEN u.last_login_at > NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_login_at > NOW() - INTERVAL '30 days' THEN 'moderate'
        ELSE 'inactive'
    END AS activity_status
FROM users u
WHERE u.deleted_at IS NULL;

COMMENT ON VIEW v_users_admin_stats IS 'Статистика пользователей для администратора';


-- ============================================================================
-- 8. ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================================================

-- Функция: Обновление updated_at при изменении записи
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_reviews_timestamp
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Функция: Автоматический подсчет рейтинга пользователя
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM user_reviews
            WHERE reviewed_user_id = NEW.reviewed_user_id
              AND moderation_status = 'approved'
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM user_reviews
            WHERE reviewed_user_id = NEW.reviewed_user_id
              AND moderation_status = 'approved'
        )
    WHERE id = NEW.reviewed_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating
    AFTER INSERT OR UPDATE ON user_reviews
    FOR EACH ROW
    WHEN (NEW.moderation_status = 'approved')
    EXECUTE FUNCTION update_user_rating();


-- Функция: Логирование изменений пользователя
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO users_activity_log (user_id, action_type, action_description, new_values)
        VALUES (NEW.id, 'created', 'Пользователь зарегистрирован', row_to_json(NEW)::jsonb);
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Логируем изменение статуса
        IF OLD.status != NEW.status THEN
            INSERT INTO users_activity_log (user_id, action_type, action_description, old_values, new_values)
            VALUES (
                NEW.id,
                'status_changed',
                format('Статус изменен с %s на %s', OLD.status, NEW.status),
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status)
            );
        END IF;
        
        -- Логируем изменение баланса
        IF OLD.balance != NEW.balance THEN
            INSERT INTO users_activity_log (user_id, action_type, action_description, old_values, new_values)
            VALUES (
                NEW.id,
                'balance_changed',
                format('Баланс изменен с %.2f на %.2f', OLD.balance, NEW.balance),
                jsonb_build_object('balance', OLD.balance),
                jsonb_build_object('balance', NEW.balance)
            );
        END IF;
        
        -- Логируем вход
        IF OLD.last_login_at IS DISTINCT FROM NEW.last_login_at AND NEW.last_login_at IS NOT NULL THEN
            INSERT INTO users_activity_log (user_id, action_type, action_description, ip_address)
            VALUES (
                NEW.id,
                'login',
                'Пользователь вошел в систему',
                NEW.last_login_ip
            );
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_user_changes
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_changes();


-- Функция: Обновление баланса при транзакции
CREATE OR REPLACE FUNCTION update_user_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE users
        SET 
            balance = NEW.balance_after,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance_on_transaction
    AFTER INSERT OR UPDATE ON user_balance_transactions
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_user_balance_on_transaction();


-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Включаем RLS для таблицы users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователь может видеть свой профиль
CREATE POLICY users_select_own 
    ON users FOR SELECT 
    USING (id = current_setting('app.current_user_id')::bigint OR role = 'admin');

-- Политика: Пользователь может обновлять свой профиль
CREATE POLICY users_update_own 
    ON users FOR UPDATE 
    USING (id = current_setting('app.current_user_id')::bigint OR role = 'admin');

-- Политика: Только админы могут удалять пользователей
CREATE POLICY users_delete_admin_only 
    ON users FOR DELETE 
    USING (role = 'admin');


-- Включаем RLS для уведомлений
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователь видит только свои уведомления
CREATE POLICY notifications_select_own 
    ON user_notifications FOR SELECT 
    USING (user_id = current_setting('app.current_user_id')::bigint OR 
           EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::bigint AND role = 'admin'));


-- ============================================================================
-- 10. НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- ============================================================================

-- Создание админа по умолчанию (пароль нужно хешировать отдельно)
INSERT INTO users (
    name, 
    email, 
    username,
    role, 
    status, 
    subscription_tier,
    email_verified,
    balance,
    country,
    city
) VALUES 
(
    'Администратор',
    'admin@promo.music',
    'admin',
    'admin',
    'active',
    'premium',
    TRUE,
    100000.00,
    'Россия',
    'Москва'
)
ON CONFLICT (email) DO NOTHING;


-- ============================================================================
-- КОНЕЦ СХЕМЫ
-- ============================================================================
