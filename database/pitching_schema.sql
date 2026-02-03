-- ============================================================================
-- PROMO.MUSIC - PITCHING MODULE DATABASE SCHEMA
-- Полная структура БД для системы питчинга треков
-- PostgreSQL / Supabase compatible
-- ============================================================================

-- ============================================================================
-- 1. ОСНОВНАЯ ТАБЛИЦА ПИТЧИНГ-КАМПАНИЙ
-- ============================================================================

CREATE TABLE pitching_campaigns (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    user_id BIGINT NOT NULL, -- ID артиста (владельца кампании)
    track_id BIGINT NOT NULL, -- ID трека из таблицы tracks
    
    -- Основная информация
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- 'radio', 'playlist', 'blogger', 'media', 'venue'
    
    -- Контент кампании
    pitch_text TEXT NOT NULL, -- Основной текст питча
    additional_info JSONB, -- Дополнительная информация (жанры, настроение, похожие артисты)
    press_kit_url VARCHAR(500), -- Ссылка на пресс-кит
    
    -- Статус и жизненный цикл
    status VARCHAR(50) DEFAULT 'draft' NOT NULL, 
    -- Возможные значения: 'draft', 'pending_payment', 'paid', 'in_moderation', 
    --                     'approved', 'rejected', 'active', 'completed', 'cancelled'
    
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Целевые партнеры
    target_partners JSONB NOT NULL DEFAULT '[]', -- Массив ID выбранных партнеров
    total_partners_count INT DEFAULT 0,
    
    -- Финансы
    total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'RUB',
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
    payment_id BIGINT, -- Связь с таблицей payments
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    final_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Даты и расписание
    start_date DATE,
    end_date DATE,
    deadline DATE, -- Дедлайн для ответов партнеров
    
    -- Статистика
    views_count INT DEFAULT 0, -- Сколько партнеров открыли
    clicks_count INT DEFAULT 0, -- Клики по ссылкам
    responses_count INT DEFAULT 0, -- Количество ответов
    approvals_count INT DEFAULT 0, -- Положительные ответы
    rejections_count INT DEFAULT 0, -- Отказы
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE, -- Когда отправлено на модерацию
    approved_at TIMESTAMP WITH TIME ZONE, -- Когда одобрено админом
    completed_at TIMESTAMP WITH TIME ZONE, -- Когда завершено
    
    -- Мягкое удаление
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Индексы
    CONSTRAINT fk_pitching_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pitching_track FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
    CONSTRAINT check_valid_status CHECK (status IN ('draft', 'pending_payment', 'paid', 'in_moderation', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
    CONSTRAINT check_positive_cost CHECK (total_cost >= 0 AND final_cost >= 0)
);

-- Индексы для оптимизации
CREATE INDEX idx_pitching_user_id ON pitching_campaigns(user_id);
CREATE INDEX idx_pitching_track_id ON pitching_campaigns(track_id);
CREATE INDEX idx_pitching_status ON pitching_campaigns(status);
CREATE INDEX idx_pitching_campaign_type ON pitching_campaigns(campaign_type);
CREATE INDEX idx_pitching_created_at ON pitching_campaigns(created_at DESC);
CREATE INDEX idx_pitching_payment_status ON pitching_campaigns(payment_status);
CREATE INDEX idx_pitching_deleted_at ON pitching_campaigns(deleted_at) WHERE deleted_at IS NULL;

-- Полнотекстовый поиск
CREATE INDEX idx_pitching_search ON pitching_campaigns USING gin(to_tsvector('russian', campaign_name || ' ' || pitch_text));

COMMENT ON TABLE pitching_campaigns IS 'Основная таблица питчинг-кампаний';
COMMENT ON COLUMN pitching_campaigns.target_partners IS 'JSON массив с ID и информацией о выбранных партнерах';
COMMENT ON COLUMN pitching_campaigns.additional_info IS 'JSON объект с жанрами, настроением, BPM, ключом и т.д.';


-- ============================================================================
-- 2. ТАБЛИЦА ОТПРАВОК ПАРТНЕРАМ (PIVOT)
-- ============================================================================

CREATE TABLE pitching_submissions (
    -- Идентификация
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    campaign_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL, -- ID партнера из таблицы partners
    
    -- Статус отправки
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'sent', 'opened', 'clicked', 'approved', 'rejected', 'no_response'
    
    -- Отклик партнера
    partner_response TEXT,
    partner_rating INT CHECK (partner_rating BETWEEN 1 AND 5),
    partner_feedback JSONB, -- Структурированный отзыв
    
    -- Детали размещения (если одобрено)
    placement_details JSONB, -- Дата эфира, плейлист, позиция и т.д.
    playlist_url VARCHAR(500),
    airplay_date TIMESTAMP WITH TIME ZONE,
    airplay_time_slot VARCHAR(100), -- Например "Prime time (18:00-21:00)"
    
    -- Статистика взаимодействия
    opened_at TIMESTAMP WITH TIME ZONE, -- Когда партнер открыл
    clicked_at TIMESTAMP WITH TIME ZONE, -- Когда кликнул по треку
    responded_at TIMESTAMP WITH TIME ZONE, -- Когда дал ответ
    
    views_count INT DEFAULT 0,
    track_plays_count INT DEFAULT 0, -- Сколько раз партнер прослушал трек
    
    -- Финансы для партнера
    partner_commission DECIMAL(10, 2) DEFAULT 0.00,
    partner_paid BOOLEAN DEFAULT FALSE,
    partner_payout_date DATE,
    
    -- Приоритет
    is_priority BOOLEAN DEFAULT FALSE, -- Приоритетная отправка (за доп. плату)
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: одна кампания -> один партнер
    CONSTRAINT unique_campaign_partner UNIQUE (campaign_id, partner_id),
    CONSTRAINT fk_submission_campaign FOREIGN KEY (campaign_id) REFERENCES pitching_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT check_valid_submission_status CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'approved', 'rejected', 'no_response'))
);

-- Индексы
CREATE INDEX idx_submissions_campaign_id ON pitching_submissions(campaign_id);
CREATE INDEX idx_submissions_partner_id ON pitching_submissions(partner_id);
CREATE INDEX idx_submissions_status ON pitching_submissions(status);
CREATE INDEX idx_submissions_created_at ON pitching_submissions(created_at DESC);
CREATE INDEX idx_submissions_partner_paid ON pitching_submissions(partner_paid) WHERE partner_paid = FALSE;

COMMENT ON TABLE pitching_submissions IS 'Отправки питчей конкретным партнерам';
COMMENT ON COLUMN pitching_submissions.placement_details IS 'JSON с деталями размещения после одобрения';


-- ============================================================================
-- 3. ТАБЛИЦА ПАРТНЕРОВ (если еще не создана)
-- ============================================================================

CREATE TABLE IF NOT EXISTS partners (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Основная информация
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'radio', 'playlist', 'blogger', 'media', 'venue'
    logo_url VARCHAR(500),
    
    -- Контакты
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    website VARCHAR(500),
    
    -- Локация
    country VARCHAR(100) DEFAULT 'Россия',
    city VARCHAR(100),
    address TEXT,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'pending', 'blocked', 'archived'
    verified BOOLEAN DEFAULT FALSE,
    
    -- Аудитория
    audience_size INT DEFAULT 0, -- Размер аудитории (подписчики, слушатели)
    reach_monthly INT DEFAULT 0, -- Ежемесячный охват
    
    -- Жанры и специализация
    genres JSONB DEFAULT '[]', -- Массив жанров
    languages JSONB DEFAULT '["Русский"]', -- Языки контента
    
    -- Цены
    base_price DECIMAL(10, 2) DEFAULT 0.00, -- Базовая цена за питчинг
    currency VARCHAR(3) DEFAULT 'RUB',
    commission_percentage DECIMAL(5, 2) DEFAULT 15.00, -- Комиссия платформы
    
    -- Рейтинг и статистика
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    total_pitches_received INT DEFAULT 0,
    total_pitches_approved INT DEFAULT 0,
    approval_rate DECIMAL(5, 2) DEFAULT 0.00, -- Процент одобрений
    average_response_time_hours INT DEFAULT 72, -- Среднее время ответа в часах
    
    -- Контактное лицо
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Описание
    description TEXT,
    pitch_guidelines TEXT, -- Гайдлайны для питчинга
    
    -- Соцсети
    social_links JSONB, -- {'instagram': '@username', 'vk': 'vk.com/page'}
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Кто добавил
    added_by VARCHAR(50) DEFAULT 'admin', -- 'admin', 'auto', 'user'
    
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_country_city ON partners(country, city);
CREATE INDEX idx_partners_rating ON partners(rating DESC);
CREATE INDEX idx_partners_deleted_at ON partners(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE partners IS 'Партнеры для питчинга: радио, плейлисты, блогеры, СМИ, заведения';


-- ============================================================================
-- 4. ТАБЛИЦА ТРЕКОВ (если еще не создана)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tracks (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    user_id BIGINT NOT NULL,
    
    -- Основная информация
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    featuring VARCHAR(500), -- Feat. артисты
    
    -- Файлы
    audio_url VARCHAR(500) NOT NULL, -- Ссылка на аудио
    cover_url VARCHAR(500), -- Обложка
    waveform_data JSONB, -- Данные волновой формы
    
    -- Метаданные
    duration_seconds INT NOT NULL, -- Длительность в секундах
    genre VARCHAR(100),
    subgenre VARCHAR(100),
    mood VARCHAR(100), -- 'Happy', 'Sad', 'Energetic', etc.
    bpm INT, -- Beats per minute
    key VARCHAR(10), -- Музыкальный ключ (C, Am, etc.)
    
    -- Релиз
    release_date DATE,
    isrc VARCHAR(50), -- Международный код записи
    label VARCHAR(255),
    
    -- Тексты и описание
    lyrics TEXT,
    description TEXT,
    
    -- Права
    copyright_holder VARCHAR(255),
    is_original BOOLEAN DEFAULT TRUE,
    
    -- Ссылки
    spotify_url VARCHAR(500),
    apple_music_url VARCHAR(500),
    youtube_url VARCHAR(500),
    soundcloud_url VARCHAR(500),
    
    -- Статистика
    plays_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    
    -- Модерация
    moderation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    moderation_notes TEXT,
    
    -- Статус
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'deleted'
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_track_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_moderation_status ON tracks(moderation_status);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);

COMMENT ON TABLE tracks IS 'Треки пользователей для питчинга и промо';


-- ============================================================================
-- 5. ТАБЛИЦА ПЛАТЕЖЕЙ ЗА ПИТЧИНГ
-- ============================================================================

CREATE TABLE pitching_payments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    campaign_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Сумма
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Детали платежа
    payment_method VARCHAR(50), -- 'card', 'balance', 'yookassa', 'stripe'
    transaction_id VARCHAR(255), -- ID транзакции в платежной системе
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    
    -- Описание
    description TEXT,
    invoice_number VARCHAR(100),
    
    -- Метаданные платежа
    payment_metadata JSONB, -- Доп. данные от платежной системы
    
    -- Даты
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_payment_campaign FOREIGN KEY (campaign_id) REFERENCES pitching_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT check_payment_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'))
);

CREATE INDEX idx_payments_campaign_id ON pitching_payments(campaign_id);
CREATE INDEX idx_payments_user_id ON pitching_payments(user_id);
CREATE INDEX idx_payments_status ON pitching_payments(status);
CREATE INDEX idx_payments_created_at ON pitching_payments(created_at DESC);

COMMENT ON TABLE pitching_payments IS 'Платежи за питчинг-кампании';


-- ============================================================================
-- 6. ТАБЛИЦА ШАБЛОНОВ ПИТЧЕЙ
-- ============================================================================

CREATE TABLE pitching_templates (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Связи
    user_id BIGINT, -- NULL если это системный шаблон
    
    -- Контент шаблона
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(50), -- 'radio', 'playlist', 'blogger', 'media', 'venue'
    
    pitch_text TEXT NOT NULL,
    placeholders JSONB, -- Плейсхолдеры для замены ({{TRACK_NAME}}, {{ARTIST_NAME}})
    
    -- Тип шаблона
    is_system_template BOOLEAN DEFAULT FALSE, -- Системный или пользовательский
    is_public BOOLEAN DEFAULT FALSE, -- Доступен другим пользователям
    
    -- Статистика использования
    usage_count INT DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0.00, -- Процент успешных питчей с этим шаблоном
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_template_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_templates_user_id ON pitching_templates(user_id);
CREATE INDEX idx_templates_category ON pitching_templates(template_category);
CREATE INDEX idx_templates_is_public ON pitching_templates(is_public) WHERE is_public = TRUE;

COMMENT ON TABLE pitching_templates IS 'Шаблоны питчей для быстрого создания кампаний';


-- ============================================================================
-- 7. ТАБЛИЦА ИСТОРИИ ДЕЙСТВИЙ
-- ============================================================================

CREATE TABLE pitching_activity_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Связи
    campaign_id BIGINT NOT NULL,
    user_id BIGINT, -- Кто совершил действие (может быть NULL для системных событий)
    submission_id BIGINT, -- Связь с конкретной отправкой (опционально)
    
    -- Тип события
    action_type VARCHAR(100) NOT NULL,
    -- 'created', 'updated', 'submitted', 'payment_completed', 'approved', 'rejected',
    -- 'partner_opened', 'partner_clicked', 'partner_responded', 'completed', 'cancelled'
    
    -- Детали события
    action_description TEXT,
    old_values JSONB, -- Старые значения (для update)
    new_values JSONB, -- Новые значения (для update)
    
    -- Метаданные
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_log_campaign FOREIGN KEY (campaign_id) REFERENCES pitching_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_submission FOREIGN KEY (submission_id) REFERENCES pitching_submissions(id) ON DELETE SET NULL
);

CREATE INDEX idx_log_campaign_id ON pitching_activity_log(campaign_id);
CREATE INDEX idx_log_user_id ON pitching_activity_log(user_id);
CREATE INDEX idx_log_action_type ON pitching_activity_log(action_type);
CREATE INDEX idx_log_created_at ON pitching_activity_log(created_at DESC);

COMMENT ON TABLE pitching_activity_log IS 'Лог всех действий в системе питчинга';


-- ============================================================================
-- 8. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (базовая, если еще не создана)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Аутентификация
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    
    -- Профиль
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    avatar_url VARCHAR(500),
    
    -- Роль
    role VARCHAR(50) DEFAULT 'artist', -- 'artist', 'admin', 'partner', 'manager'
    
    -- Подписка
    subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'basic', 'pro', 'premium'
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Баланс
    balance DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Контакты
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Статус
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'blocked', 'pending'
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

COMMENT ON TABLE users IS 'Пользователи платформы';


-- ============================================================================
-- 9. ПРЕДСТАВЛЕНИЯ (VIEWS) ДЛЯ УДОБНЫХ ЗАПРОСОВ
-- ============================================================================

-- Представление: Активные кампании с полной информацией
CREATE VIEW v_active_campaigns AS
SELECT 
    pc.id,
    pc.uuid,
    pc.campaign_name,
    pc.campaign_type,
    pc.status,
    pc.total_cost,
    pc.final_cost,
    pc.responses_count,
    pc.approvals_count,
    pc.rejections_count,
    pc.created_at,
    pc.deadline,
    u.name AS artist_name,
    u.email AS artist_email,
    t.title AS track_title,
    t.genre AS track_genre,
    t.duration_seconds,
    t.audio_url,
    (pc.approvals_count::FLOAT / NULLIF(pc.total_partners_count, 0) * 100) AS approval_rate_percentage
FROM pitching_campaigns pc
JOIN users u ON pc.user_id = u.id
JOIN tracks t ON pc.track_id = t.id
WHERE pc.deleted_at IS NULL
  AND pc.status NOT IN ('cancelled', 'completed');

COMMENT ON VIEW v_active_campaigns IS 'Активные питчинг-кампании с основной информацией';


-- Представление: Статистика по партнерам
CREATE VIEW v_partner_statistics AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.status,
    p.rating,
    p.total_pitches_received,
    p.total_pitches_approved,
    p.approval_rate,
    p.average_response_time_hours,
    COUNT(ps.id) AS current_pending_pitches,
    AVG(CASE WHEN ps.status = 'approved' THEN ps.partner_rating END) AS average_given_rating
FROM partners p
LEFT JOIN pitching_submissions ps ON p.id = ps.partner_id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

COMMENT ON VIEW v_partner_statistics IS 'Статистика по партнерам';


-- Представление: Статистика пользователя по питчингу
CREATE VIEW v_user_pitching_stats AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(DISTINCT pc.id) AS total_campaigns,
    COUNT(DISTINCT CASE WHEN pc.status = 'active' THEN pc.id END) AS active_campaigns,
    COUNT(DISTINCT CASE WHEN pc.status = 'completed' THEN pc.id END) AS completed_campaigns,
    SUM(pc.total_partners_count) AS total_pitches_sent,
    SUM(pc.approvals_count) AS total_approvals,
    SUM(pc.rejections_count) AS total_rejections,
    (SUM(pc.approvals_count)::FLOAT / NULLIF(SUM(pc.total_partners_count), 0) * 100) AS overall_approval_rate,
    SUM(pc.final_cost) AS total_spent
FROM users u
LEFT JOIN pitching_campaigns pc ON u.id = pc.user_id AND pc.deleted_at IS NULL
GROUP BY u.id, u.name, u.email;

COMMENT ON VIEW v_user_pitching_stats IS 'Статистика пользователей по питчингу';


-- ============================================================================
-- 10. ФУНКЦИИ И ТРИГГЕРЫ
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
CREATE TRIGGER trigger_update_campaigns_timestamp
    BEFORE UPDATE ON pitching_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_submissions_timestamp
    BEFORE UPDATE ON pitching_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_partners_timestamp
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tracks_timestamp
    BEFORE UPDATE ON tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Функция: Автоматический подсчет статистики кампании
CREATE OR REPLACE FUNCTION update_campaign_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pitching_campaigns
    SET 
        responses_count = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE campaign_id = NEW.campaign_id 
              AND status IN ('approved', 'rejected')
        ),
        approvals_count = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE campaign_id = NEW.campaign_id 
              AND status = 'approved'
        ),
        rejections_count = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE campaign_id = NEW.campaign_id 
              AND status = 'rejected'
        ),
        views_count = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE campaign_id = NEW.campaign_id 
              AND opened_at IS NOT NULL
        ),
        clicks_count = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE campaign_id = NEW.campaign_id 
              AND clicked_at IS NOT NULL
        )
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_stats
    AFTER INSERT OR UPDATE ON pitching_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_statistics();


-- Функция: Автоматический подсчет статистики партнера
CREATE OR REPLACE FUNCTION update_partner_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partners
    SET 
        total_pitches_received = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE partner_id = NEW.partner_id
        ),
        total_pitches_approved = (
            SELECT COUNT(*) 
            FROM pitching_submissions 
            WHERE partner_id = NEW.partner_id 
              AND status = 'approved'
        ),
        approval_rate = (
            SELECT COALESCE(
                (COUNT(*) FILTER (WHERE status = 'approved')::FLOAT / 
                 NULLIF(COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')), 0) * 100),
                0
            )
            FROM pitching_submissions 
            WHERE partner_id = NEW.partner_id
        ),
        last_activity_at = NOW()
    WHERE id = NEW.partner_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_stats
    AFTER INSERT OR UPDATE ON pitching_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_statistics();


-- Функция: Логирование действий в pitching_activity_log
CREATE OR REPLACE FUNCTION log_campaign_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO pitching_activity_log (campaign_id, user_id, action_type, action_description, new_values)
        VALUES (NEW.id, NEW.user_id, 'created', 'Кампания создана', row_to_json(NEW)::jsonb);
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO pitching_activity_log (campaign_id, user_id, action_type, action_description, old_values, new_values)
            VALUES (
                NEW.id, 
                NEW.user_id, 
                'status_changed', 
                format('Статус изменен с %s на %s', OLD.status, NEW.status),
                jsonb_build_object('status', OLD.status),
                jsonb_build_object('status', NEW.status)
            );
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO pitching_activity_log (campaign_id, user_id, action_type, action_description)
        VALUES (OLD.id, OLD.user_id, 'deleted', 'Кампания удалена');
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_campaign_changes
    AFTER INSERT OR UPDATE OR DELETE ON pitching_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION log_campaign_changes();


-- ============================================================================
-- 11. НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- ============================================================================

-- Системные шаблоны питчей
INSERT INTO pitching_templates (template_name, template_category, pitch_text, is_system_template, is_public, placeholders) VALUES
('Радио - Стандартный', 'radio', 
'Здравствуйте!

Представляю вашему вниманию трек "{{TRACK_NAME}}" в жанре {{GENRE}}.

Трек отлично подходит для эфира в {{TIME_SLOT}} слот благодаря своей {{MOOD}} энергетике и {{BPM}} BPM.

Основные характеристики:
- Жанр: {{GENRE}}
- Настроение: {{MOOD}}
- BPM: {{BPM}}
- Длительность: {{DURATION}}

Буду рад услышать ваше мнение и обсудить возможность эфира!

С уважением,
{{ARTIST_NAME}}', 
TRUE, TRUE, 
'{"TRACK_NAME": "Название трека", "GENRE": "Жанр", "TIME_SLOT": "временной", "MOOD": "энергичной", "BPM": "128", "DURATION": "3:30", "ARTIST_NAME": "Имя артиста"}'::jsonb),

('Плейлист - Энергичный', 'playlist',
'Привет!

Хотел бы предложить свой трек "{{TRACK_NAME}}" для вашего плейлиста.

Это {{GENRE}} трек с {{BPM}} BPM, который отлично впишется в атмосферу вашей подборки.

Похожие артисты: {{SIMILAR_ARTISTS}}

Трек уже набрал {{PLAYS_COUNT}} прослушиваний на стриминговых платформах.

Буду благодарен за прослушивание!

{{ARTIST_NAME}}',
TRUE, TRUE,
'{"TRACK_NAME": "Название", "GENRE": "жанр", "BPM": "128", "SIMILAR_ARTISTS": "Artist1, Artist2", "PLAYS_COUNT": "5000", "ARTIST_NAME": "Артист"}'::jsonb),

('Блогер - Личный', 'blogger',
'Здравствуй, {{BLOGGER_NAME}}!

Давно слежу за твоим контентом и очень ценю твой вкус в музыке.

Недавно выпустил трек "{{TRACK_NAME}}" в стиле {{GENRE}}, и подумал, что он может зайти твоей аудитории.

История трека: {{TRACK_STORY}}

Буду рад любому фидбеку!

С уважением,
{{ARTIST_NAME}}',
TRUE, TRUE,
'{"BLOGGER_NAME": "Имя блогера", "TRACK_NAME": "Название", "GENRE": "жанр", "TRACK_STORY": "История создания", "ARTIST_NAME": "Артист"}'::jsonb);


-- ============================================================================
-- 12. RLS (ROW LEVEL SECURITY) ПОЛИТИКИ
-- ============================================================================

-- Включаем RLS
ALTER TABLE pitching_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_templates ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи видят только свои кампании
CREATE POLICY campaigns_user_access ON pitching_campaigns
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::bigint);

-- Политика: Админы видят все кампании
CREATE POLICY campaigns_admin_access ON pitching_campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::bigint 
            AND role = 'admin'
        )
    );

-- Политика: Пользователи видят свои платежи
CREATE POLICY payments_user_access ON pitching_payments
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::bigint);

-- Политика: Пользователи видят свои шаблоны + публичные
CREATE POLICY templates_access ON pitching_templates
    FOR SELECT
    USING (
        user_id = current_setting('app.current_user_id')::bigint 
        OR is_public = TRUE
    );


-- ============================================================================
-- 13. ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ============================================================================

-- Составные индексы для частых запросов
CREATE INDEX idx_campaigns_user_status ON pitching_campaigns(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type_status ON pitching_campaigns(campaign_type, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_submissions_campaign_status ON pitching_submissions(campaign_id, status);
CREATE INDEX idx_submissions_partner_status ON pitching_submissions(partner_id, status);

-- Индексы для JSON полей (GIN)
CREATE INDEX idx_campaigns_target_partners ON pitching_campaigns USING gin(target_partners);
CREATE INDEX idx_campaigns_additional_info ON pitching_campaigns USING gin(additional_info);
CREATE INDEX idx_partners_genres ON partners USING gin(genres);
CREATE INDEX idx_submissions_placement_details ON pitching_submissions USING gin(placement_details);


-- ============================================================================
-- ЗАВЕРШЕНИЕ
-- ============================================================================

COMMENT ON SCHEMA public IS 'Promo.Music Pitching Module - Production Ready Database Schema';

-- Вывод итоговой информации
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PROMO.MUSIC PITCHING DATABASE SCHEMA';
    RAISE NOTICE 'Successfully created:';
    RAISE NOTICE '- 8 main tables';
    RAISE NOTICE '- 3 views';
    RAISE NOTICE '- 5 triggers';
    RAISE NOTICE '- 4 functions';
    RAISE NOTICE '- RLS policies';
    RAISE NOTICE '- Comprehensive indexes';
    RAISE NOTICE '- Seed data (3 templates)';
    RAISE NOTICE '============================================';
END $$;
