-- ============================================================================
-- PROMO.MUSIC - PARTNERS MANAGEMENT MODULE DATABASE SCHEMA
-- Полная структура БД для управления партнерами
-- PostgreSQL / Supabase compatible
-- ============================================================================

-- ============================================================================
-- 1. ОСНОВНАЯ ТАБЛИЦА ПАРТНЕРОВ (РАСШИРЕННАЯ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS partners (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Основная информация
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255), -- Юридическое название
    brand_name VARCHAR(255), -- Бренд
    slug VARCHAR(255) UNIQUE, -- URL-friendly идентификатор
    
    -- Категория и тип
    category VARCHAR(50) NOT NULL,
    -- 'radio', 'playlist', 'blogger', 'media', 'venue', 'label', 'agency', 'studio'
    subcategory VARCHAR(100), -- Подкатегория
    
    -- Визуал
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    gallery JSONB DEFAULT '[]', -- Массив фото
    
    -- Контактная информация
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    website VARCHAR(500),
    
    -- Социальные сети
    social_links JSONB,
    -- {'instagram': '@username', 'vk': 'vk.com/page', 'youtube': 'channel_id', 'telegram': '@channel'}
    
    -- Адрес и локация
    country VARCHAR(100) DEFAULT 'Россия',
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    coordinates JSONB, -- {'lat': 55.7558, 'lng': 37.6173}
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    
    -- Описание и информация
    description TEXT,
    short_description VARCHAR(500), -- Краткое описание для карточек
    pitch_guidelines TEXT, -- Инструкции для артистов
    requirements TEXT, -- Требования к контенту
    about_audience TEXT, -- О целевой аудитории
    
    -- Аудитория и охват
    audience_size INT DEFAULT 0, -- Размер аудитории
    monthly_reach INT DEFAULT 0, -- Ежемесячный охват
    audience_demographics JSONB, -- Демография аудитории
    -- {'age_18_24': 30, 'age_25_34': 45, 'male': 60, 'female': 40}
    
    -- Жанры и специализация
    genres JSONB DEFAULT '[]', -- Массив жанров
    languages JSONB DEFAULT '["Русский"]', -- Языки контента
    music_styles JSONB DEFAULT '[]', -- Стили музыки
    content_types JSONB DEFAULT '[]', -- Типы контента
    
    -- Верификация и статус
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'active', 'blocked', 'suspended', 'archived', 'on_hold'
    verified BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE, -- Премиум партнер
    featured BOOLEAN DEFAULT FALSE, -- Рекомендуемый
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by_admin_id BIGINT,
    
    -- Модерация
    moderation_status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected', 'requires_changes'
    moderation_notes TEXT,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderated_by_admin_id BIGINT,
    rejection_reason TEXT,
    
    -- Цены и условия
    base_price DECIMAL(10, 2) DEFAULT 0.00, -- Базовая цена за услугу
    currency VARCHAR(3) DEFAULT 'RUB',
    price_range_min DECIMAL(10, 2) DEFAULT 0.00,
    price_range_max DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Комиссии и выплаты
    commission_percentage DECIMAL(5, 2) DEFAULT 15.00, -- Комиссия платформы
    partner_payout_percentage DECIMAL(5, 2) DEFAULT 85.00, -- Процент партнера
    total_earned DECIMAL(10, 2) DEFAULT 0.00, -- Всего заработано
    balance DECIMAL(10, 2) DEFAULT 0.00, -- Текущий баланс
    pending_payout DECIMAL(10, 2) DEFAULT 0.00, -- Ожидает выплаты
    
    -- Банковские реквизиты
    payment_details JSONB, 
    -- {'bank_name': 'Сбербанк', 'account_number': '..., 'inn': '...', 'kpp': '...'}
    
    -- Статистика работы
    total_pitches_received INT DEFAULT 0,
    total_pitches_approved INT DEFAULT 0,
    total_pitches_rejected INT DEFAULT 0,
    approval_rate DECIMAL(5, 2) DEFAULT 0.00, -- Процент одобрений
    average_response_time_hours INT DEFAULT 72, -- Среднее время ответа
    
    -- Рейтинг и отзывы
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    reviews_count INT DEFAULT 0,
    response_quality_rating DECIMAL(3, 2) DEFAULT 0.00, -- Качество ответов
    professionalism_rating DECIMAL(3, 2) DEFAULT 0.00, -- Профессионализм
    value_for_money_rating DECIMAL(3, 2) DEFAULT 0.00, -- Соотношение цена/качество
    
    -- Заказы и услуги
    total_orders INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    active_orders INT DEFAULT 0,
    
    -- Контактное лицо
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_position VARCHAR(100), -- Должность
    
    -- Рабочие часы и доступность
    working_hours JSONB, -- График работы
    -- {'monday': '09:00-18:00', 'tuesday': '09:00-18:00', ...}
    is_available BOOLEAN DEFAULT TRUE, -- Доступен для заказов
    availability_notes TEXT,
    
    -- Настройки уведомлений
    notification_settings JSONB DEFAULT '{
        "email_notifications": true,
        "new_pitch_notification": true,
        "deadline_reminder": true,
        "payment_notification": true
    }',
    
    -- Настройки автоответа
    auto_response_enabled BOOLEAN DEFAULT FALSE,
    auto_response_message TEXT,
    response_template TEXT,
    
    -- Теги и категоризация
    tags JSONB DEFAULT '[]', -- Теги для поиска
    search_keywords TEXT, -- Ключевые слова для поиска
    
    -- Политики и условия
    cancellation_policy TEXT, -- Политика отмены
    refund_policy TEXT, -- Политика возврата
    terms_and_conditions TEXT, -- Условия работы
    
    -- Минимальные требования
    min_track_quality VARCHAR(50), -- '128kbps', '320kbps', 'WAV'
    min_followers INT DEFAULT 0, -- Минимум подписчиков у артиста
    min_plays INT DEFAULT 0, -- Минимум прослушиваний
    
    -- Документы
    documents JSONB, -- Сканы документов, сертификаты
    -- [{'type': 'license', 'url': '...', 'expires': '2025-12-31'}]
    
    -- Специальные возможности
    features JSONB DEFAULT '[]', 
    -- ['priority_support', 'custom_branding', 'analytics_access', 'api_access']
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Кто добавил
    added_by VARCHAR(50) DEFAULT 'admin', -- 'admin', 'auto', 'self_registered'
    added_by_admin_id BIGINT,
    
    -- Источник
    source VARCHAR(100), -- 'manual', 'api', 'import', 'self_registration'
    import_id VARCHAR(255), -- ID из внешней системы
    
    -- Мягкое удаление
    deleted_at TIMESTAMP WITH TIME ZONE,
    deletion_reason TEXT,
    
    -- Ограничения
    CONSTRAINT fk_verified_by FOREIGN KEY (verified_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_moderated_by FOREIGN KEY (moderated_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_added_by_admin FOREIGN KEY (added_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_valid_category CHECK (category IN ('radio', 'playlist', 'blogger', 'media', 'venue', 'label', 'agency', 'studio')),
    CONSTRAINT check_valid_status CHECK (status IN ('pending', 'active', 'blocked', 'suspended', 'archived', 'on_hold')),
    CONSTRAINT check_valid_moderation CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'requires_changes')),
    CONSTRAINT check_positive_prices CHECK (base_price >= 0 AND price_range_min >= 0 AND price_range_max >= price_range_min),
    CONSTRAINT check_commission_range CHECK (commission_percentage BETWEEN 0 AND 100 AND partner_payout_percentage BETWEEN 0 AND 100)
);

-- Индексы для оптимизации
CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_moderation_status ON partners(moderation_status);
CREATE INDEX idx_partners_country_city ON partners(country, city);
CREATE INDEX idx_partners_rating ON partners(rating DESC);
CREATE INDEX idx_partners_verified ON partners(verified) WHERE verified = TRUE;
CREATE INDEX idx_partners_premium ON partners(premium) WHERE premium = TRUE;
CREATE INDEX idx_partners_featured ON partners(featured) WHERE featured = TRUE;
CREATE INDEX idx_partners_slug ON partners(slug);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_created_at ON partners(created_at DESC);
CREATE INDEX idx_partners_deleted_at ON partners(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_partners_approval_rate ON partners(approval_rate DESC);

-- JSONB индексы
CREATE INDEX idx_partners_genres ON partners USING gin(genres);
CREATE INDEX idx_partners_tags ON partners USING gin(tags);
CREATE INDEX idx_partners_features ON partners USING gin(features);

-- Полнотекстовый поиск
CREATE INDEX idx_partners_search ON partners USING gin(
    to_tsvector('russian', 
        name || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(search_keywords, '') || ' ' ||
        COALESCE(city, '')
    )
);

COMMENT ON TABLE partners IS 'Партнеры платформы: радио, плейлисты, блогеры, СМИ, заведения и т.д.';
COMMENT ON COLUMN partners.audience_demographics IS 'JSON с демографией аудитории';
COMMENT ON COLUMN partners.working_hours IS 'JSON с графиком работы по дням недели';


-- ============================================================================
-- 2. ТАБЛИЦА УСЛУГ ПАРТНЕРОВ
-- ============================================================================

CREATE TABLE partner_services (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связь с партнером
    partner_id BIGINT NOT NULL,
    
    -- Информация об услуге
    service_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    -- 'airplay', 'playlist_placement', 'review', 'interview', 'live_performance', 'production'
    
    description TEXT,
    
    -- Цены
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Детали услуги
    duration_days INT, -- Длительность услуги
    guaranteed_plays INT, -- Гарантированные прослушивания
    guaranteed_reach INT, -- Гарантированный охват
    
    delivery_time_days INT, -- Время выполнения
    
    -- Требования
    requirements TEXT,
    restrictions TEXT,
    
    -- Доп. опции
    extras JSONB, -- Дополнительные услуги
    
    -- Статус
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    
    -- Статистика
    total_orders INT DEFAULT 0,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_service_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

CREATE INDEX idx_services_partner_id ON partner_services(partner_id);
CREATE INDEX idx_services_type ON partner_services(service_type);
CREATE INDEX idx_services_is_active ON partner_services(is_active);

COMMENT ON TABLE partner_services IS 'Услуги, предоставляемые партнерами';


-- ============================================================================
-- 3. ТАБЛИЦА ОТЗЫВОВ О ПАРТНЕРАХ
-- ============================================================================

CREATE TABLE partner_reviews (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    partner_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL, -- Кто оставил отзыв
    order_id BIGINT, -- Связь с заказом
    
    -- Оценки
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    response_quality_rating INT CHECK (response_quality_rating BETWEEN 1 AND 5),
    professionalism_rating INT CHECK (professionalism_rating BETWEEN 1 AND 5),
    value_for_money_rating INT CHECK (value_for_money_rating BETWEEN 1 AND 5),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    
    -- Отзыв
    review_title VARCHAR(255),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    
    -- Рекомендация
    would_recommend BOOLEAN,
    
    -- Медиа
    media_urls JSONB, -- Скриншоты, фото результатов
    
    -- Модерация
    moderation_status VARCHAR(50) DEFAULT 'pending',
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderated_by_admin_id BIGINT,
    moderation_notes TEXT,
    
    -- Полезность
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    
    -- Ответ партнера
    partner_response TEXT,
    partner_responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Видимость
    is_featured BOOLEAN DEFAULT FALSE, -- Избранный отзыв
    is_verified_purchase BOOLEAN DEFAULT FALSE, -- Подтвержденная покупка
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_review_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_moderator FOREIGN KEY (moderated_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_partner_reviews_partner_id ON partner_reviews(partner_id);
CREATE INDEX idx_partner_reviews_user_id ON partner_reviews(user_id);
CREATE INDEX idx_partner_reviews_moderation_status ON partner_reviews(moderation_status);
CREATE INDEX idx_partner_reviews_created_at ON partner_reviews(created_at DESC);
CREATE INDEX idx_partner_reviews_rating ON partner_reviews(overall_rating DESC);

COMMENT ON TABLE partner_reviews IS 'Отзывы пользователей о партнерах';


-- ============================================================================
-- 4. ТАБЛИЦА ВЫПЛАТ ПАРТНЕРАМ
-- ============================================================================

CREATE TABLE partner_payouts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связь с партнером
    partner_id BIGINT NOT NULL,
    
    -- Сумма
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Период
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Детали
    total_orders INT DEFAULT 0,
    commission_amount DECIMAL(10, 2) DEFAULT 0.00, -- Комиссия платформы
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    
    -- Метод выплаты
    payout_method VARCHAR(50), -- 'bank_transfer', 'card', 'paypal', 'yoomoney'
    
    -- Реквизиты
    payout_details JSONB, -- Банковские реквизиты или другие данные
    
    -- Транзакция
    transaction_id VARCHAR(255), -- ID транзакции в платежной системе
    
    -- Документы
    invoice_number VARCHAR(100),
    invoice_url VARCHAR(500),
    
    -- Обработка
    processed_by_admin_id BIGINT,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Примечания
    notes TEXT,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_payout_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_payout_processed_by FOREIGN KEY (processed_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT check_payout_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_payouts_partner_id ON partner_payouts(partner_id);
CREATE INDEX idx_payouts_status ON partner_payouts(status);
CREATE INDEX idx_payouts_period ON partner_payouts(period_start, period_end);
CREATE INDEX idx_payouts_created_at ON partner_payouts(created_at DESC);

COMMENT ON TABLE partner_payouts IS 'Выплаты партнерам';


-- ============================================================================
-- 5. ТАБЛИЦА ИСТОРИИ ДЕЙСТВИЙ ПАРТНЕРОВ
-- ============================================================================

CREATE TABLE partners_activity_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Связи
    partner_id BIGINT NOT NULL,
    admin_id BIGINT, -- Кто совершил действие
    
    -- Тип действия
    action_type VARCHAR(100) NOT NULL,
    -- 'created', 'updated', 'verified', 'blocked', 'unblocked',
    -- 'status_changed', 'payout_requested', 'payout_completed'
    
    -- Детали
    action_description TEXT,
    old_values JSONB,
    new_values JSONB,
    
    -- Контекст
    ip_address INET,
    user_agent TEXT,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_partner_log_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT fk_partner_log_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_partner_log_partner_id ON partners_activity_log(partner_id);
CREATE INDEX idx_partner_log_action_type ON partners_activity_log(action_type);
CREATE INDEX idx_partner_log_created_at ON partners_activity_log(created_at DESC);

COMMENT ON TABLE partners_activity_log IS 'Лог действий партнеров и админов';


-- ============================================================================
-- 6. ТАБЛИЦА ИЗБРАННЫХ ПАРТНЕРОВ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

CREATE TABLE user_favorite_partners (
    id BIGSERIAL PRIMARY KEY,
    
    user_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL,
    
    notes TEXT, -- Заметки пользователя
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_partner_favorite UNIQUE (user_id, partner_id),
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorites_user_id ON user_favorite_partners(user_id);
CREATE INDEX idx_favorites_partner_id ON user_favorite_partners(partner_id);

COMMENT ON TABLE user_favorite_partners IS 'Избранные партнеры пользователей';


-- ============================================================================
-- 7. ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================================================

-- View: Полная информация о партнерах с статистикой
CREATE VIEW v_partners_full_info AS
SELECT 
    p.id,
    p.uuid,
    p.name,
    p.category,
    p.logo_url,
    p.email,
    p.phone,
    p.country,
    p.city,
    p.status,
    p.verified,
    p.premium,
    p.rating,
    p.reviews_count,
    p.approval_rate,
    p.total_pitches_received,
    p.total_pitches_approved,
    p.total_orders,
    p.completed_orders,
    p.total_earned,
    p.balance,
    p.audience_size,
    p.monthly_reach,
    p.base_price,
    p.created_at,
    p.last_activity_at,
    COUNT(DISTINCT ps.id) AS services_count,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.moderation_status = 'approved') AS approved_reviews_count,
    AVG(pr.overall_rating) AS average_review_rating
FROM partners p
LEFT JOIN partner_services ps ON p.id = ps.partner_id AND ps.is_active = TRUE
LEFT JOIN partner_reviews pr ON p.id = pr.partner_id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

COMMENT ON VIEW v_partners_full_info IS 'Полная информация о партнерах со статистикой';


-- View: Топ партнеров
CREATE VIEW v_top_partners AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.rating,
    p.reviews_count,
    p.total_orders,
    p.approval_rate,
    p.total_earned,
    p.verified,
    p.premium
FROM partners p
WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.verified = TRUE
ORDER BY p.rating DESC, p.reviews_count DESC
LIMIT 100;

COMMENT ON VIEW v_top_partners IS 'Топ-100 партнеров по рейтингу';


-- ============================================================================
-- 8. ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================================================

-- Функция: Обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER trigger_update_partners_timestamp
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_services_timestamp
    BEFORE UPDATE ON partner_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_partner_reviews_timestamp
    BEFORE UPDATE ON partner_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Функция: Автоматический подсчет рейтинга партнера
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partners
    SET 
        rating = (
            SELECT COALESCE(AVG(overall_rating), 0)
            FROM partner_reviews
            WHERE partner_id = NEW.partner_id
              AND moderation_status = 'approved'
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM partner_reviews
            WHERE partner_id = NEW.partner_id
              AND moderation_status = 'approved'
        ),
        response_quality_rating = (
            SELECT COALESCE(AVG(response_quality_rating), 0)
            FROM partner_reviews
            WHERE partner_id = NEW.partner_id
              AND moderation_status = 'approved'
              AND response_quality_rating IS NOT NULL
        ),
        professionalism_rating = (
            SELECT COALESCE(AVG(professionalism_rating), 0)
            FROM partner_reviews
            WHERE partner_id = NEW.partner_id
              AND moderation_status = 'approved'
              AND professionalism_rating IS NOT NULL
        ),
        value_for_money_rating = (
            SELECT COALESCE(AVG(value_for_money_rating), 0)
            FROM partner_reviews
            WHERE partner_id = NEW.partner_id
              AND moderation_status = 'approved'
              AND value_for_money_rating IS NOT NULL
        )
    WHERE id = NEW.partner_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_rating
    AFTER INSERT OR UPDATE ON partner_reviews
    FOR EACH ROW
    WHEN (NEW.moderation_status = 'approved')
    EXECUTE FUNCTION update_partner_rating();


-- Функция: Логирование изменений партнера
CREATE OR REPLACE FUNCTION log_partner_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO partners_activity_log (partner_id, action_type, action_description, new_values)
        VALUES (NEW.id, 'created', 'Партнер создан', row_to_json(NEW)::jsonb);
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Логируем изменение статуса
        IF OLD.status != NEW.status THEN
            INSERT INTO partners_activity_log (partner_id, action_type, action_description, old_values, new_values)
            VALUES (
                NEW.id,
                'status_changed',
                format('Статус изменен с %s на %s', OLD.status, NEW.status),
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status)
            );
        END IF;
        
        -- Логируем верификацию
        IF OLD.verified = FALSE AND NEW.verified = TRUE THEN
            INSERT INTO partners_activity_log (partner_id, action_type, action_description, admin_id)
            VALUES (
                NEW.id,
                'verified',
                'Партнер верифицирован',
                NEW.verified_by_admin_id
            );
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_partner_changes
    AFTER INSERT OR UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION log_partner_changes();


-- Функция: Генерация slug
CREATE OR REPLACE FUNCTION generate_partner_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = lower(regexp_replace(
            translate(NEW.name, 
                'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
                'abvgdeejzijklmnoprstufhccss_y_euaABVGDEEJZIJKLMNOPRSTUFHCCSS_Y_EUA'
            ),
            '[^a-zA-Z0-9]+', '-', 'g'
        )) || '-' || SUBSTRING(NEW.uuid::text, 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_slug
    BEFORE INSERT OR UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION generate_partner_slug();


-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Все видят активных партнеров
CREATE POLICY partners_select_active 
    ON partners FOR SELECT 
    USING (status = 'active' AND verified = TRUE AND deleted_at IS NULL);

-- Партнер видит свой профиль
CREATE POLICY partners_select_own 
    ON partners FOR SELECT 
    USING (email = current_setting('app.current_user_email', TRUE));

-- Только админы могут модифицировать
CREATE POLICY partners_modify_admin_only 
    ON partners FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = current_setting('app.current_user_id')::bigint 
          AND role = 'admin'
    ));


-- ============================================================================
-- 10. НАЧАЛЬНЫЕ ДАННЫЕ (SEED)
-- ============================================================================

-- Создание тестового партнера
INSERT INTO partners (
    name,
    category,
    email,
    phone,
    country,
    city,
    description,
    status,
    verified,
    base_price,
    genres,
    audience_size
) VALUES 
(
    'Русское Радио',
    'radio',
    'promo@rusradio.ru',
    '+7 (495) 123-45-67',
    'Россия',
    'Москва',
    'Крупнейшая радиостанция России',
    'active',
    TRUE,
    5000.00,
    '["Pop", "Dance", "Electronic"]'::jsonb,
    5000000
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- КОНЕЦ СХЕМЫ
-- ============================================================================
