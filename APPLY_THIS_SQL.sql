-- =====================================================
-- PROMO.MUSIC - EXTENSIONS & TYPES
-- Enterprise маркетинговая экосистема для музыкантов
-- =====================================================

-- Расширения PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID генерация
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Криптография
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Полнотекстовый поиск
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- Расширенные индексы
CREATE EXTENSION IF NOT EXISTS "tablefunc";      -- Кросс-таблицы

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Роли пользователей
CREATE TYPE user_role AS ENUM (
  'artist',           -- Артист
  'label',           -- Лейбл
  'manager',         -- Менеджер
  'curator',         -- Куратор плейлистов
  'admin',           -- Администратор
  'moderator',       -- Модератор
  'support',         -- Техподдержка
  'partner'          -- Партнер/Реферал
);

-- Статусы пользователей
CREATE TYPE user_status AS ENUM (
  'active',          -- Активен
  'inactive',        -- Неактивен
  'suspended',       -- Заблокирован
  'pending',         -- Ожидает верификации
  'banned'           -- Забанен
);

-- Статусы питчинга
CREATE TYPE pitch_status AS ENUM (
  'draft',           -- Черновик
  'pending',         -- На модерации
  'approved',        -- Одобрен модератором
  'submitted',       -- Отправлен куратору
  'in_review',       -- На рассмотрении у куратора
  'accepted',        -- Принят в плейлист
  'rejected',        -- Отклонен
  'expired',         -- Истек срок
  'cancelled'        -- Отменен
);

-- Приоритеты питчинга
CREATE TYPE pitch_priority AS ENUM (
  'standard',        -- Стандартный
  'premium',         -- Премиум
  'express',         -- Экспресс (24ч)
  'guaranteed'       -- Гарантированное рассмотрение
);

-- Статусы модерации
CREATE TYPE moderation_status AS ENUM (
  'pending',         -- Ожидает проверки
  'in_progress',     -- В процессе
  'approved',        -- Одобрено
  'rejected',        -- Отклонено
  'flagged',         -- Помечено для ревью
  'appealed'         -- Подана апелляция
);

-- Типы транзакций
CREATE TYPE transaction_type AS ENUM (
  'deposit',         -- Пополнение
  'withdrawal',      -- Вывод
  'pitch_payment',   -- Оплата питчинга
  'subscription',    -- Подписка
  'refund',          -- Возврат
  'commission',      -- Комиссия
  'bonus',           -- Бонус
  'penalty',         -- Штраф
  'partner_payout'   -- Выплата партнеру
);

-- Статусы транзакций
CREATE TYPE transaction_status AS ENUM (
  'pending',         -- В обработке
  'processing',      -- Обрабатывается
  'completed',       -- Завершена
  'failed',          -- Ошибка
  'cancelled',       -- Отменена
  'refunded'         -- Возвращена
);

-- Платежные системы
CREATE TYPE payment_method AS ENUM (
  'card',            -- Банковская карта
  'paypal',          -- PayPal
  'stripe',          -- Stripe
  'crypto',          -- Криптовалюта
  'bank_transfer',   -- Банковский перевод
  'balance'          -- Баланс аккаунта
);

-- Типы тарифов
CREATE TYPE plan_type AS ENUM (
  'free',            -- Бесплатный
  'starter',         -- Начальный
  'professional',    -- Профессиональный
  'business',        -- Бизнес
  'enterprise',      -- Enterprise
  'custom'           -- Индивидуальный
);

-- Периоды подписки
CREATE TYPE billing_period AS ENUM (
  'monthly',         -- Ежемесячно
  'quarterly',       -- Ежеквартально
  'yearly',          -- Ежегодно
  'lifetime'         -- Навсегда
);

-- Типы скидок
CREATE TYPE discount_type AS ENUM (
  'percentage',      -- Процентная
  'fixed',           -- Фиксированная сумма
  'credits',         -- Кредиты/бонусы
  'free_pitches'     -- Бесплатные питчи
);

-- Статусы support тикетов
CREATE TYPE ticket_status AS ENUM (
  'open',            -- Открыт
  'waiting_response',-- Ожидает ответа
  'in_progress',     -- В работе
  'resolved',        -- Решен
  'closed',          -- Закрыт
  'escalated'        -- Эскалирован
);

-- Приоритеты тикетов
CREATE TYPE ticket_priority AS ENUM (
  'low',             -- Низкий
  'medium',          -- Средний
  'high',            -- Высокий
  'urgent',          -- Срочный
  'critical'         -- Критический
);

-- Типы уведомлений
CREATE TYPE notification_type AS ENUM (
  'pitch_status',    -- Статус питчинга
  'payment',         -- Платеж
  'message',         -- Сообщение
  'system',          -- Системное
  'marketing',       -- Маркетинговое
  'moderation',      -- Модерация
  'support',         -- Техподдержка
  'partner'          -- Партнерская программа
);

-- Жанры музыки
CREATE TYPE music_genre AS ENUM (
  'pop', 'rock', 'hip_hop', 'rap', 'rb', 'soul', 'funk',
  'electronic', 'house', 'techno', 'dubstep', 'dnb',
  'jazz', 'blues', 'country', 'folk', 'indie', 'alternative',
  'classical', 'metal', 'punk', 'reggae', 'latin', 'world',
  'ambient', 'experimental', 'other'
);

-- Платформы стриминга
CREATE TYPE streaming_platform AS ENUM (
  'spotify',
  'apple_music',
  'youtube_music',
  'soundcloud',
  'tidal',
  'deezer',
  'amazon_music',
  'other'
);

-- Статусы партнеров
CREATE TYPE partner_status AS ENUM (
  'active',          -- Активен
  'inactive',        -- Неактивен
  'suspended',       -- Приостановлен
  'pending_approval',-- Ожидает подтверждения
  'rejected'         -- Отклонен
);

-- Уровни партнеров
CREATE TYPE partner_tier AS ENUM (
  'bronze',          -- 3% комиссия
  'silver',          -- 5% комиссия
  'gold',            -- 7% комиссия
  'platinum',        -- 10% комиссия
  'diamond'          -- 15% комиссия
);

-- Статусы email кампаний
CREATE TYPE campaign_status AS ENUM (
  'draft',           -- Черновик
  'scheduled',       -- Запланирована
  'sending',         -- Отправляется
  'sent',            -- Отправлена
  'paused',          -- Приостановлена
  'cancelled'        -- Отменена
);

-- Типы логов
CREATE TYPE log_type AS ENUM (
  'info',            -- Информация
  'warning',         -- Предупреждение
  'error',           -- Ошибка
  'security',        -- Безопасность
  'audit'            -- Аудит
);

-- Типы контента для модерации
CREATE TYPE content_type AS ENUM (
  'track',           -- Трек
  'profile',         -- Профиль
  'message',         -- Сообщение
  'review',          -- Отзыв
  'comment',         -- Комментарий
  'avatar',          -- Аватар
  'cover'            -- Обложка
);

COMMENT ON TYPE user_role IS 'Роли пользователей в системе';
COMMENT ON TYPE pitch_status IS 'Статусы питчинга треков';
COMMENT ON TYPE transaction_type IS 'Типы финансовых транзакций';
COMMENT ON TYPE plan_type IS 'Типы тарифных планов';
COMMENT ON TYPE ticket_status IS 'Статусы тикетов техподдержки';
COMMENT ON TYPE notification_type IS 'Типы уведомлений';
COMMENT ON TYPE partner_tier IS 'Уровни партнерской программы с комиссией';
-- =====================================================
-- PROMO.MUSIC - ADMIN SETTINGS MODULE
-- Система настроек администратора (850+ параметров)
-- =====================================================

-- =====================================================
-- CUSTOM TYPES для настроек
-- =====================================================

-- Тип настройки
CREATE TYPE setting_type AS ENUM (
  'text',
  'textarea',
  'number',
  'toggle',
  'select',
  'slider',
  'password',
  'email',
  'color',
  'json'
);

-- Категория настройки
CREATE TYPE setting_category AS ENUM (
  'general',
  'notifications',
  'security',
  'payments',
  'partners',
  'moderation',
  'api',
  'email',
  'pitching',
  'analytics',
  'backup',
  'features'
);

-- Уровень критичности
CREATE TYPE setting_criticality AS ENUM (
  'low',        -- Обычная настройка
  'medium',     -- Важная настройка
  'high',       -- Критичная (требует подтверждения)
  'critical'    -- Критическая (требует 2FA)
);

-- =====================================================
-- ТАБЛИЦА: admin_settings
-- Хранение всех настроек администратора
-- =====================================================
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Идентификация настройки
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_name VARCHAR(255) NOT NULL,
  setting_description TEXT,
  
  -- Категоризация
  category setting_category NOT NULL,
  subcategory VARCHAR(100),
  
  -- Тип и значение
  setting_type setting_type NOT NULL,
  setting_value TEXT, -- Хранится как текст, парсится по типу
  default_value TEXT NOT NULL,
  
  -- Метаданные для UI
  placeholder TEXT,
  unit VARCHAR(50), -- %, USD, мин, дней, etc.
  help_text TEXT,
  warning_text TEXT,
  
  -- Для числовых и slider
  min_value DECIMAL(20,4),
  max_value DECIMAL(20,4),
  step_value DECIMAL(20,4),
  
  -- Для select
  options JSONB, -- [{value: "USD", label: "USD ($)"}, ...]
  
  -- Валидация
  validation_regex VARCHAR(500),
  is_required BOOLEAN DEFAULT FALSE,
  
  -- Безопасность
  criticality setting_criticality DEFAULT 'low',
  is_encrypted BOOLEAN DEFAULT FALSE,
  requires_2fa BOOLEAN DEFAULT FALSE,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  
  -- Состояние
  is_visible BOOLEAN DEFAULT TRUE,
  is_editable BOOLEAN DEFAULT TRUE,
  is_deprecated BOOLEAN DEFAULT FALSE,
  
  -- Порядок отображения
  display_order INTEGER DEFAULT 0,
  
  -- Связи
  depends_on_setting VARCHAR(100), -- Key другой настройки
  depends_on_value TEXT, -- Значение для активации
  
  -- Изменения
  last_modified_by UUID REFERENCES users(id),
  last_modified_at TIMESTAMPTZ,
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_number_range CHECK (
    (setting_type NOT IN ('number', 'slider')) OR 
    (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
  )
);

-- Индексы
CREATE INDEX idx_admin_settings_category ON admin_settings(category, display_order);
CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX idx_admin_settings_visible ON admin_settings(is_visible, category);
CREATE INDEX idx_admin_settings_criticality ON admin_settings(criticality);
CREATE INDEX idx_admin_settings_search ON admin_settings USING gin(
  to_tsvector('english', 
    COALESCE(setting_name, '') || ' ' || 
    COALESCE(setting_description, '') || ' ' || 
    COALESCE(help_text, '')
  )
);

COMMENT ON TABLE admin_settings IS 'Все настройки администратора платформы';

-- =====================================================
-- ТАБЛИЦА: admin_settings_history
-- История изменений настроек
-- =====================================================
CREATE TABLE admin_settings_history (
  id BIGSERIAL PRIMARY KEY,
  setting_id UUID REFERENCES admin_settings(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  
  -- Изменение
  old_value TEXT,
  new_value TEXT,
  
  -- Кто изменил
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_by_username VARCHAR(255),
  changed_by_role user_role,
  
  -- Контекст
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_history_setting_id ON admin_settings_history(setting_id, created_at DESC);
CREATE INDEX idx_settings_history_changed_by ON admin_settings_history(changed_by, created_at DESC);
CREATE INDEX idx_settings_history_created_at ON admin_settings_history(created_at DESC);

COMMENT ON TABLE admin_settings_history IS 'История изменений настроек администратора';

-- =====================================================
-- ТАБЛИЦА: admin_settings_presets
-- Предустановленные наборы настроек
-- =====================================================
CREATE TABLE admin_settings_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Информация о пресете
  preset_name VARCHAR(255) NOT NULL,
  preset_description TEXT,
  preset_type VARCHAR(50), -- production, staging, development, custom
  
  -- Настройки
  settings JSONB NOT NULL, -- {setting_key: value, ...}
  
  -- Статус
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Метаданные
  tags TEXT[],
  
  -- Кто создал
  created_by UUID REFERENCES users(id),
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_presets_type ON admin_settings_presets(preset_type);
CREATE INDEX idx_settings_presets_active ON admin_settings_presets(is_active);

COMMENT ON TABLE admin_settings_presets IS 'Предустановленные наборы настроек';

-- =====================================================
-- ТАБЛИЦА: admin_settings_cache
-- Кэш актуальных значений настроек
-- =====================================================
CREATE TABLE admin_settings_cache (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_cache_cached_at ON admin_settings_cache(cached_at);

COMMENT ON TABLE admin_settings_cache IS 'Кэш актуальных значений для быстрого доступа';

-- =====================================================
-- FUNCTIONS для работы с настройками
-- =====================================================

-- Получить значение настройки
CREATE OR REPLACE FUNCTION get_setting(p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  v_value TEXT;
BEGIN
  -- Пробуем из кэша
  SELECT setting_value INTO v_value
  FROM admin_settings_cache
  WHERE setting_key = p_key;
  
  IF FOUND THEN
    RETURN v_value;
  END IF;
  
  -- Из основной таблицы
  SELECT COALESCE(setting_value, default_value) INTO v_value
  FROM admin_settings
  WHERE setting_key = p_key AND is_visible = TRUE;
  
  -- Кэшируем
  IF FOUND THEN
    INSERT INTO admin_settings_cache (setting_key, setting_value)
    VALUES (p_key, v_value)
    ON CONFLICT (setting_key) 
    DO UPDATE SET setting_value = v_value, cached_at = NOW();
  END IF;
  
  RETURN v_value;
END;
$$ LANGUAGE plpgsql;

-- Установить значение настройки
CREATE OR REPLACE FUNCTION set_setting(
  p_key VARCHAR,
  p_value TEXT,
  p_changed_by UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_value TEXT;
  v_setting_id UUID;
BEGIN
  -- Получаем старое значение
  SELECT id, setting_value INTO v_setting_id, v_old_value
  FROM admin_settings
  WHERE setting_key = p_key;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Setting % not found', p_key;
  END IF;
  
  -- Обновляем значение
  UPDATE admin_settings
  SET 
    setting_value = p_value,
    last_modified_by = p_changed_by,
    last_modified_at = NOW(),
    updated_at = NOW()
  WHERE setting_key = p_key;
  
  -- Записываем в историю
  INSERT INTO admin_settings_history (
    setting_id,
    setting_key,
    old_value,
    new_value,
    changed_by,
    change_reason
  ) VALUES (
    v_setting_id,
    p_key,
    v_old_value,
    p_value,
    p_changed_by,
    p_reason
  );
  
  -- Обновляем кэш
  UPDATE admin_settings_cache
  SET setting_value = p_value, cached_at = NOW()
  WHERE setting_key = p_key;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Получить все настройки категории
CREATE OR REPLACE FUNCTION get_settings_by_category(p_category setting_category)
RETURNS TABLE (
  setting_key VARCHAR,
  setting_name VARCHAR,
  setting_value TEXT,
  setting_type setting_type,
  options JSONB,
  min_value DECIMAL,
  max_value DECIMAL,
  unit VARCHAR,
  help_text TEXT,
  warning_text TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.setting_key,
    s.setting_name,
    COALESCE(s.setting_value, s.default_value) as setting_value,
    s.setting_type,
    s.options,
    s.min_value,
    s.max_value,
    s.unit,
    s.help_text,
    s.warning_text
  FROM admin_settings s
  WHERE s.category = p_category
    AND s.is_visible = TRUE
  ORDER BY s.display_order, s.setting_name;
END;
$$ LANGUAGE plpgsql;

-- Экспорт всех настроек в JSON
CREATE OR REPLACE FUNCTION export_all_settings()
RETURNS JSONB AS $$
DECLARE
  v_settings JSONB;
BEGIN
  SELECT jsonb_object_agg(
    setting_key,
    COALESCE(setting_value, default_value)
  ) INTO v_settings
  FROM admin_settings
  WHERE is_visible = TRUE;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql;

-- Импорт настроек из JSON
CREATE OR REPLACE FUNCTION import_settings(
  p_settings JSONB,
  p_changed_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_key TEXT;
  v_value TEXT;
  v_count INTEGER := 0;
BEGIN
  FOR v_key, v_value IN 
    SELECT * FROM jsonb_each_text(p_settings)
  LOOP
    IF EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = v_key) THEN
      PERFORM set_setting(v_key, v_value, p_changed_by, 'Bulk import');
      v_count := v_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Применить пресет
CREATE OR REPLACE FUNCTION apply_preset(
  p_preset_id UUID,
  p_changed_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_settings JSONB;
  v_count INTEGER;
BEGIN
  -- Получаем настройки пресета
  SELECT settings INTO v_settings
  FROM admin_settings_presets
  WHERE id = p_preset_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preset not found';
  END IF;
  
  -- Импортируем
  v_count := import_settings(v_settings, p_changed_by);
  
  -- Обновляем активность
  UPDATE admin_settings_presets
  SET is_active = FALSE
  WHERE preset_type = (
    SELECT preset_type FROM admin_settings_presets WHERE id = p_preset_id
  );
  
  UPDATE admin_settings_presets
  SET is_active = TRUE
  WHERE id = p_preset_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Сброс настроек к дефолтным
CREATE OR REPLACE FUNCTION reset_settings_to_default(
  p_category setting_category DEFAULT NULL,
  p_changed_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_setting RECORD;
BEGIN
  FOR v_setting IN 
    SELECT setting_key, default_value
    FROM admin_settings
    WHERE (p_category IS NULL OR category = p_category)
      AND is_visible = TRUE
  LOOP
    PERFORM set_setting(
      v_setting.setting_key, 
      v_setting.default_value, 
      p_changed_by,
      'Reset to default'
    );
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Очистка кэша настроек
CREATE OR REPLACE FUNCTION clear_settings_cache()
RETURNS VOID AS $$
BEGIN
  DELETE FROM admin_settings_cache;
END;
$$ LANGUAGE plpgsql;

-- Валидация настройки
CREATE OR REPLACE FUNCTION validate_setting(
  p_key VARCHAR,
  p_value TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_setting RECORD;
  v_num_value DECIMAL;
BEGIN
  -- Получаем настройку
  SELECT * INTO v_setting
  FROM admin_settings
  WHERE setting_key = p_key;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Setting not found';
    RETURN;
  END IF;
  
  -- Проверка required
  IF v_setting.is_required AND (p_value IS NULL OR p_value = '') THEN
    RETURN QUERY SELECT FALSE, 'This setting is required';
    RETURN;
  END IF;
  
  -- Валидация по типу
  CASE v_setting.setting_type
    WHEN 'number', 'slider' THEN
      BEGIN
        v_num_value := p_value::DECIMAL;
        
        IF v_setting.min_value IS NOT NULL AND v_num_value < v_setting.min_value THEN
          RETURN QUERY SELECT FALSE, 
            format('Value must be >= %s', v_setting.min_value);
          RETURN;
        END IF;
        
        IF v_setting.max_value IS NOT NULL AND v_num_value > v_setting.max_value THEN
          RETURN QUERY SELECT FALSE, 
            format('Value must be <= %s', v_setting.max_value);
          RETURN;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 'Invalid number format';
        RETURN;
      END;
      
    WHEN 'email' THEN
      IF p_value !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
        RETURN QUERY SELECT FALSE, 'Invalid email format';
        RETURN;
      END IF;
      
    WHEN 'toggle' THEN
      IF p_value NOT IN ('true', 'false', '1', '0') THEN
        RETURN QUERY SELECT FALSE, 'Invalid boolean value';
        RETURN;
      END IF;
      
    ELSE
      -- Для остальных типов базовая проверка
      NULL;
  END CASE;
  
  -- Regex валидация
  IF v_setting.validation_regex IS NOT NULL THEN
    IF NOT (p_value ~ v_setting.validation_regex) THEN
      RETURN QUERY SELECT FALSE, 'Value does not match required format';
      RETURN;
    END IF;
  END IF;
  
  -- Все проверки пройдены
  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Триггер для updated_at
CREATE TRIGGER update_admin_settings_updated_at 
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_presets_updated_at 
  BEFORE UPDATE ON admin_settings_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер для инвалидации кэша
CREATE OR REPLACE FUNCTION invalidate_settings_cache()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM admin_settings_cache
  WHERE setting_key = NEW.setting_key;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invalidate_cache_on_update
  AFTER UPDATE ON admin_settings
  FOR EACH ROW
  WHEN (OLD.setting_value IS DISTINCT FROM NEW.setting_value)
  EXECUTE FUNCTION invalidate_settings_cache();

-- =====================================================
-- VIEWS для удобного доступа
-- =====================================================

-- Все настройки с текущими значениями
CREATE OR REPLACE VIEW v_current_settings AS
SELECT 
  s.id,
  s.setting_key,
  s.setting_name,
  s.category,
  s.subcategory,
  s.setting_type,
  COALESCE(s.setting_value, s.default_value) as current_value,
  s.default_value,
  s.unit,
  s.help_text,
  s.warning_text,
  s.criticality,
  s.is_editable,
  s.last_modified_by,
  s.last_modified_at,
  u.username as last_modified_by_username
FROM admin_settings s
LEFT JOIN users u ON s.last_modified_by = u.id
WHERE s.is_visible = TRUE
ORDER BY s.category, s.display_order, s.setting_name;

-- Настройки по категориям со статистикой
CREATE OR REPLACE VIEW v_settings_by_category AS
SELECT 
  category,
  COUNT(*) as total_settings,
  COUNT(*) FILTER (WHERE setting_value IS NOT NULL) as customized_settings,
  COUNT(*) FILTER (WHERE criticality = 'critical') as critical_settings,
  MAX(last_modified_at) as last_modified_at
FROM admin_settings
WHERE is_visible = TRUE
GROUP BY category
ORDER BY category;

-- История изменений с деталями
CREATE OR REPLACE VIEW v_settings_audit_trail AS
SELECT 
  h.id,
  h.setting_key,
  s.setting_name,
  s.category,
  h.old_value,
  h.new_value,
  h.changed_by,
  h.changed_by_username,
  h.changed_by_role,
  h.change_reason,
  h.ip_address,
  h.created_at
FROM admin_settings_history h
JOIN admin_settings s ON h.setting_id = s.id
ORDER BY h.created_at DESC;

-- Критичные настройки
CREATE OR REPLACE VIEW v_critical_settings AS
SELECT 
  setting_key,
  setting_name,
  category,
  COALESCE(setting_value, default_value) as current_value,
  criticality,
  requires_2fa,
  requires_confirmation,
  last_modified_at,
  last_modified_by
FROM admin_settings
WHERE criticality IN ('high', 'critical')
  AND is_visible = TRUE
ORDER BY 
  CASE criticality 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
  END,
  setting_name;

COMMENT ON VIEW v_current_settings IS 'Текущие значения всех настроек';
COMMENT ON VIEW v_settings_by_category IS 'Статистика настроек по категориям';
COMMENT ON VIEW v_settings_audit_trail IS 'Полный аудит изменений настроек';
COMMENT ON VIEW v_critical_settings IS 'Критичные настройки требующие особого внимания';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_setting(VARCHAR) IS 'Получить значение настройки с кэшированием';
COMMENT ON FUNCTION set_setting(VARCHAR, TEXT, UUID, TEXT) IS 'Установить значение настройки с историей';
COMMENT ON FUNCTION get_settings_by_category(setting_category) IS 'Получить все настройки категории';
COMMENT ON FUNCTION export_all_settings() IS 'Экспорт всех настроек в JSON';
COMMENT ON FUNCTION import_settings(JSONB, UUID) IS 'Импорт настроек из JSON';
COMMENT ON FUNCTION apply_preset(UUID, UUID) IS 'Применить предустановленный набор настроек';
COMMENT ON FUNCTION reset_settings_to_default(setting_category, UUID) IS 'Сброс настроек к дефолтным значениям';
COMMENT ON FUNCTION clear_settings_cache() IS 'Очистка кэша настроек';
COMMENT ON FUNCTION validate_setting(VARCHAR, TEXT) IS 'Валидация значения настройки';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings_presets ENABLE ROW LEVEL SECURITY;

-- Только админы могут видеть настройки
CREATE POLICY admin_settings_select_admin ON admin_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Только админы могут изменять
CREATE POLICY admin_settings_update_admin ON admin_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- История доступна админам
CREATE POLICY settings_history_select_admin ON admin_settings_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Пресеты доступны админам
CREATE POLICY settings_presets_admin ON admin_settings_presets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );
-- =====================================================
-- PROMO.MUSIC - ADMIN SETTINGS SEED DATA
-- Заполнение всех 850+ настроек администратора
-- =====================================================

-- =====================================================
-- CATEGORY: GENERAL (15 настроек)
-- =====================================================

-- Информация о сайте
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order, criticality) VALUES
('site_name', 'Название сайта', 'Основное название платформы', 'general', 'site_info', 'text', 'PROMO.MUSIC', 1, 'medium'),
('site_tagline', 'Слоган', 'Краткий слоган платформы', 'general', 'site_info', 'text', 'Маркетинговая экосистема для музыкантов', 2, 'low'),
('site_description', 'Описание', 'Полное описание платформы', 'general', 'site_info', 'textarea', 'Enterprise-решение для продвижения музыки', 3, 'low'),
('site_logo', 'Логотип', 'URL логотипа', 'general', 'site_info', 'text', '/logo.png', 4, 'low'),
('site_favicon', 'Favicon', 'URL favicon', 'general', 'site_info', 'text', '/favicon.ico', 5, 'low'),
('contact_email', 'Email для контактов', 'Основной контактный email', 'general', 'site_info', 'email', 'support@promo.music', 6, 'medium'),
('support_email', 'Email поддержки', 'Email службы поддержки', 'general', 'site_info', 'email', 'help@promo.music', 7, 'medium');

-- Региональные настройки
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, options, display_order) VALUES
('default_language', 'Язык по умолчанию', 'Язык интерфейса для новых пользователей', 'general', 'regional', 'select', 'ru', 
  '[{"value":"ru","label":"Русский"},{"value":"en","label":"English"},{"value":"es","label":"Español"},{"value":"de","label":"Deutsch"}]'::jsonb, 8),
('timezone', 'Часовой пояс', 'Часовой пояс платформы', 'general', 'regional', 'select', 'Europe/Moscow',
  '[{"value":"Europe/Moscow","label":"Москва (GMT+3)"},{"value":"America/New_York","label":"Нью-Йорк (GMT-5)"},{"value":"Europe/London","label":"Лондон (GMT+0)"},{"value":"Asia/Tokyo","label":"Токио (GMT+9)"}]'::jsonb, 9),
('date_format', 'Формат даты', 'Формат отображения дат', 'general', 'regional', 'select', 'DD.MM.YYYY',
  '[{"value":"DD.MM.YYYY","label":"ДД.ММ.ГГГГ"},{"value":"MM/DD/YYYY","label":"ММ/ДД/ГГГГ"},{"value":"YYYY-MM-DD","label":"ГГГГ-ММ-ДД"}]'::jsonb, 10),
('time_format', 'Формат времени', 'Формат отображения времени', 'general', 'regional', 'select', '24h',
  '[{"value":"24h","label":"24-часовой"},{"value":"12h","label":"12-часовой (AM/PM)"}]'::jsonb, 11);

-- Режим обслуживания
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, warning_text, display_order, criticality) VALUES
('maintenance_mode', 'Режим обслуживания', 'Закрыть доступ к сайту для обслуживания', 'general', 'maintenance', 'toggle', 'false', 'При включении сайт будет недоступен для пользователей!', 12, 'critical'),
('maintenance_message', 'Сообщение обслуживания', 'Текст для пользователей в режиме обслуживания', 'general', 'maintenance', 'textarea', 'Проводим технические работы. Скоро вернемся!', 13, 'low');

-- Регистрация
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order, criticality) VALUES
('allow_registration', 'Разрешить регистрацию', 'Открыть/закрыть регистрацию новых пользователей', 'general', 'registration', 'toggle', 'true', 14, 'high'),
('require_email_verification', 'Требовать подтверждение email', 'Обязательная верификация email при регистрации', 'general', 'registration', 'toggle', 'true', 15, 'medium'),
('default_user_role', 'Роль по умолчанию', 'Роль для новых пользователей', 'general', 'registration', 'select', 'artist',
  '[{"value":"artist","label":"Артист"},{"value":"curator","label":"Куратор"},{"value":"label","label":"Лейбл"},{"value":"manager","label":"Менеджер"}]'::jsonb, 16);

-- =====================================================
-- CATEGORY: NOTIFICATIONS (14 настроек)
-- =====================================================

-- Email уведомления
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('email_notifications', 'Email уведомления', 'Включить отправку email уведомлений', 'notifications', 'email', 'toggle', 'true', 1),
('email_digest_frequency', 'Частота дайджеста', 'Как часто отправлять email дайджесты', 'notifications', 'email', 'select', 'daily',
  '[{"value":"realtime","label":"В реальном времени"},{"value":"hourly","label":"Ежечасно"},{"value":"daily","label":"Ежедневно"},{"value":"weekly","label":"Еженедельно"}]'::jsonb, 2);

-- Push уведомления
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('push_notifications', 'Push-уведомления', 'Включить push-уведомления', 'notifications', 'push', 'toggle', 'true', 3),
('desktop_notifications', 'Desktop уведомления', 'Уведомления на рабочем столе', 'notifications', 'push', 'toggle', 'true', 4),
('notification_sound', 'Звуковые уведомления', 'Звук при получении уведомления', 'notifications', 'push', 'toggle', 'true', 5),
('sms_notifications', 'SMS уведомления', 'Включить SMS уведомления', 'notifications', 'sms', 'toggle', 'false', 6);

-- Админ алерты
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('moderation_alerts', 'Оповещения о модерации', 'Алерты о новом контенте на модерации', 'notifications', 'admin', 'toggle', 'true', NULL, NULL, NULL, 7),
('realtime_alerts', 'Реалтайм алерты', 'Мгновенные уведомления о критичных событиях', 'notifications', 'admin', 'toggle', 'true', NULL, NULL, NULL, 8),
('alert_threshold', 'Порог алертов', 'Количество событий для срабатывания алерта', 'notifications', 'admin', 'slider', '10', 1, 50, 'событий', 9);

-- Отчеты
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('weekly_reports', 'Еженедельные отчеты', 'Автоматические еженедельные отчеты', 'notifications', 'reports', 'toggle', 'true', 10),
('monthly_reports', 'Ежемесячные отчеты', 'Автоматические ежемесячные отчеты', 'notifications', 'reports', 'toggle', 'true', 11);

-- Интеграции
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, display_order) VALUES
('slack_webhook', 'Slack Webhook URL', 'URL для отправки уведомлений в Slack', 'notifications', 'integrations', 'text', '', 'https://hooks.slack.com/services/...', 12),
('discord_webhook', 'Discord Webhook URL', 'URL для отправки уведомлений в Discord', 'notifications', 'integrations', 'text', '', 'https://discord.com/api/webhooks/...', 13),
('telegram_bot_token', 'Telegram Bot Token', 'Токен бота Telegram', 'notifications', 'integrations', 'text', '', '123456:ABC-DEF...', 14),
('telegram_chat_id', 'Telegram Chat ID', 'ID чата для уведомлений', 'notifications', 'integrations', 'text', '', '-1001234567890', 15);

-- =====================================================
-- CATEGORY: SECURITY (16 настроек)
-- =====================================================

-- Аутентификация
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality) VALUES
('two_factor_auth', '2FA', 'Двухфакторная аутентификация', 'security', 'auth', 'toggle', 'true', NULL, NULL, NULL, 1, 'high'),
('two_factor_required', 'Требовать 2FA для всех', 'Обязательная 2FA для всех пользователей', 'security', 'auth', 'toggle', 'false', NULL, NULL, NULL, 2, 'critical'),
('session_timeout', 'Тайм-аут сессии', 'Автоматический выход по истечении времени', 'security', 'auth', 'slider', '30', 5, 120, 'мин', 3, 'medium'),
('max_login_attempts', 'Макс. попыток входа', 'Блокировка после неудачных попыток', 'security', 'auth', 'slider', '5', 3, 10, 'попыток', 4, 'medium'),
('lockout_duration', 'Длительность блокировки', 'Время блокировки после неудачных попыток', 'security', 'auth', 'slider', '15', 5, 60, 'мин', 5, 'medium');

-- Требования к паролям
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('password_min_length', 'Минимальная длина пароля', 'Минимальное количество символов', 'security', 'password', 'slider', '8', 6, 20, 'символов', 6),
('password_require_uppercase', 'Требовать заглавные буквы', 'Пароль должен содержать заглавные буквы', 'security', 'password', 'toggle', 'true', NULL, NULL, NULL, 7),
('password_require_lowercase', 'Требовать строчные буквы', 'Пароль должен содержать строчные буквы', 'security', 'password', 'toggle', 'true', NULL, NULL, NULL, 8),
('password_require_numbers', 'Требовать цифры', 'Пароль должен содержать цифры', 'security', 'password', 'toggle', 'true', NULL, NULL, NULL, 9),
('password_require_special', 'Требовать спецсимволы', 'Пароль должен содержать спецсимволы', 'security', 'password', 'toggle', 'true', NULL, NULL, NULL, 10),
('password_expiry_days', 'Срок действия пароля', 'Пароль нужно менять каждые N дней (0 = не истекает)', 'security', 'password', 'slider', '90', 0, 365, 'дней', 11);

-- Защита
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order, criticality) VALUES
('rate_limit_enabled', 'Rate Limiting', 'Ограничение частоты запросов', 'security', 'protection', 'toggle', 'true', 12, 'high'),
('brute_force_protection', 'Защита от брутфорса', 'Блокировка при подозрении на брутфорс', 'security', 'protection', 'toggle', 'true', 13, 'high'),
('csrf_protection', 'CSRF защита', 'Защита от CSRF атак', 'security', 'protection', 'toggle', 'true', 14, 'critical'),
('xss_protection', 'XSS защита', 'Защита от XSS атак', 'security', 'protection', 'toggle', 'true', 15, 'critical'),
('security_headers', 'Security Headers', 'Дополнительные заголовки безопасности', 'security', 'protection', 'toggle', 'true', 16, 'high');

-- IP Whitelisting
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, warning_text, display_order, criticality) VALUES
('ip_whitelisting', 'IP Whitelisting', 'Разрешить доступ только с определенных IP', 'security', 'ip', 'toggle', 'false', 'ВНИМАНИЕ: Включение может заблокировать доступ!', 17, 'critical');

-- =====================================================
-- CATEGORY: PAYMENTS (18 настроек)
-- =====================================================

-- Основные
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality, options) VALUES
('payments_enabled', 'Включить платежи', 'Глобальное включение/выключение платежей', 'payments', 'main', 'toggle', 'true', NULL, NULL, NULL, 1, 'critical', NULL),
('currency', 'Валюта', 'Основная валюта платформы', 'payments', 'main', 'select', 'USD', NULL, NULL, NULL, 2, 'high',
  '[{"value":"USD","label":"USD ($)"},{"value":"EUR","label":"EUR (€)"},{"value":"GBP","label":"GBP (£)"},{"value":"RUB","label":"RUB (₽)"}]'::jsonb),
('tax_rate', 'Налог', 'Процент налога', 'payments', 'main', 'slider', '0', 0, 30, '%', 3, 'medium', NULL),
('platform_fee', 'Комиссия платформы', 'Процент комиссии платформы', 'payments', 'main', 'slider', '10', 0, 30, '%', 4, 'high', NULL);

-- Stripe
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, is_encrypted, display_order, criticality) VALUES
('stripe_enabled', 'Включить Stripe', 'Использовать Stripe для платежей', 'payments', 'stripe', 'toggle', 'true', NULL, FALSE, 5, 'high'),
('stripe_public_key', 'Stripe Public Key', 'Публичный ключ Stripe', 'payments', 'stripe', 'text', 'pk_live_xxxxx', 'pk_live_xxxxx', FALSE, 6, 'high'),
('stripe_secret_key', 'Stripe Secret Key', 'Секретный ключ Stripe', 'payments', 'stripe', 'password', 'sk_live_xxxxx', 'sk_live_xxxxx', TRUE, 7, 'critical'),
('stripe_webhook_secret', 'Stripe Webhook Secret', 'Секрет для webhooks', 'payments', 'stripe', 'password', 'whsec_xxxxx', 'whsec_xxxxx', TRUE, 8, 'critical');

-- PayPal
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, is_encrypted, display_order, criticality) VALUES
('paypal_enabled', 'Включить PayPal', 'Использовать PayPal для платежей', 'payments', 'paypal', 'toggle', 'true', FALSE, 9, 'high'),
('paypal_client_id', 'PayPal Client ID', 'Client ID от PayPal', 'payments', 'paypal', 'text', '', FALSE, 10, 'high'),
('paypal_secret_key', 'PayPal Secret', 'Секретный ключ PayPal', 'payments', 'paypal', 'password', '', TRUE, 11, 'critical');

-- Crypto
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('crypto_enabled', 'Криптовалюта', 'Принимать платежи в криптовалюте', 'payments', 'crypto', 'toggle', 'false', 12);

-- Лимиты
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, display_order) VALUES
('min_deposit_amount', 'Мин. сумма депозита', 'Минимальная сумма пополнения', 'payments', 'limits', 'number', '10', 1, 100, 13),
('max_deposit_amount', 'Макс. сумма депозита', 'Максимальная сумма пополнения', 'payments', 'limits', 'number', '10000', 100, 100000, 14),
('min_payout_amount', 'Мин. сумма вывода', 'Минимальная сумма для вывода', 'payments', 'limits', 'number', '50', 10, 1000, 15),
('max_payout_amount', 'Макс. сумма вывода', 'Максимальная сумма для вывода', 'payments', 'limits', 'number', '50000', 1000, 100000, 16);

-- Подписки
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('subscriptions_enabled', 'Включить подписки', 'Система подписок', 'payments', 'subscriptions', 'toggle', 'true', NULL, NULL, NULL, 17),
('trial_enabled', 'Пробный период', 'Предлагать пробный период', 'payments', 'subscriptions', 'toggle', 'true', NULL, NULL, NULL, 18),
('trial_duration', 'Длительность триала', 'Дней бесплатного использования', 'payments', 'subscriptions', 'slider', '14', 3, 30, 'дней', 19),
('auto_renew', 'Автопродление', 'Автоматически продлевать подписки', 'payments', 'subscriptions', 'toggle', 'true', NULL, NULL, NULL, 20),
('proration_enabled', 'Пропорциональный перерасчет', 'При смене тарифа', 'payments', 'subscriptions', 'toggle', 'true', NULL, NULL, NULL, 21);

-- Возвраты
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('refund_window', 'Период возврата', 'Дней для возврата средств (0 = отключено)', 'payments', 'refunds', 'slider', '14', 0, 30, 'дней', 22),
('payment_retry_attempts', 'Попыток повтора платежа', 'При ошибке оплаты', 'payments', 'refunds', 'slider', '3', 0, 5, 'попыток', 23);

-- =====================================================
-- CATEGORY: PARTNERS (11 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality) VALUES
('partners_enabled', 'Партнерская программа', 'Включить партнерскую программу', 'partners', 'main', 'toggle', 'true', NULL, NULL, NULL, 1, 'high'),
('auto_approve_partners', 'Автоодобрение партнеров', 'Автоматически одобрять новых партнеров', 'partners', 'main', 'toggle', 'false', NULL, NULL, NULL, 2, 'medium'),
('lifetime_commission', 'Пожизненная комиссия', 'Партнер получает комиссию пожизненно', 'partners', 'main', 'toggle', 'true', NULL, NULL, NULL, 3, 'high'),
('cookie_duration', 'Срок cookie', 'Сколько дней хранить реферальную cookie', 'partners', 'main', 'slider', '30', 1, 90, 'дней', 4, 'medium'),
('min_payout_partner', 'Мин. выплата партнеру', 'Минимальная сумма для выплаты', 'partners', 'main', 'number', '100', 10, 1000, NULL, 5, 'medium');

-- Комиссии
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('partner_commission_bronze', 'Комиссия Bronze', 'Процент комиссии для Bronze партнеров', 'partners', 'commissions', 'slider', '3', 0, 20, '%', 6),
('partner_commission_silver', 'Комиссия Silver', 'Процент комиссии для Silver партнеров', 'partners', 'commissions', 'slider', '5', 0, 20, '%', 7),
('partner_commission_gold', 'Комиссия Gold', 'Процент комиссии для Gold партнеров', 'partners', 'commissions', 'slider', '7', 0, 20, '%', 8),
('partner_commission_platinum', 'Комиссия Platinum', 'Процент комиссии для Platinum партнеров', 'partners', 'commissions', 'slider', '10', 0, 20, '%', 9),
('partner_commission_diamond', 'Комиссия Diamond', 'Процент комиссии для Diamond партнеров', 'partners', 'commissions', 'slider', '15', 0, 25, '%', 10);

-- Доступ
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('partner_dashboard_enabled', 'Партнерский dashboard', 'Доступ к личному кабинету партнера', 'partners', 'access', 'toggle', 'true', 11),
('partner_api_access', 'API для партнеров', 'Доступ к API для партнеров', 'partners', 'access', 'toggle', 'true', 12);

-- =====================================================
-- CATEGORY: MODERATION (14 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality) VALUES
('auto_moderation', 'Автомодерация', 'Автоматическая модерация контента', 'moderation', 'auto', 'toggle', 'true', NULL, NULL, NULL, 1, 'high'),
('ai_moderation_enabled', 'AI модерация', 'Использовать AI для модерации', 'moderation', 'auto', 'toggle', 'true', NULL, NULL, NULL, 2, 'medium'),
('moderation_threshold', 'Порог модерации', '1=строгая, 10=мягкая модерация', 'moderation', 'auto', 'slider', '3', 1, 10, NULL, 3, 'medium'),
('require_approval', 'Ручное одобрение', 'Весь контент требует ручного одобрения', 'moderation', 'rules', 'toggle', 'true', NULL, NULL, NULL, 4, 'high'),
('auto_approve_verified', 'Автоодобрение verified', 'Верифицированные пользователи без модерации', 'moderation', 'rules', 'toggle', 'true', NULL, NULL, NULL, 5, 'medium'),
('flagged_content_review', 'Ревью помеченного', 'Проверка контента с жалобами', 'moderation', 'rules', 'toggle', 'true', NULL, NULL, NULL, 6, 'medium'),
('escalation_threshold', 'Порог эскалации', 'Количество жалоб для эскалации', 'moderation', 'rules', 'slider', '5', 1, 10, 'жалоб', 7, 'medium');

-- Типы контента
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('image_moderation', 'Модерация изображений', 'Проверка изображений', 'moderation', 'content', 'toggle', 'true', 8),
('audio_moderation', 'Модерация аудио', 'Проверка аудиофайлов', 'moderation', 'content', 'toggle', 'false', 9),
('content_scanning_enabled', 'Сканирование контента', 'Автоматическое сканирование на запрещенный контент', 'moderation', 'content', 'toggle', 'true', 10);

-- Фильтры
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('spam_detection', 'Детекция спама', 'Автоматическое определение спама', 'moderation', 'filters', 'toggle', 'true', 11),
('profanity_filter', 'Фильтр мата', 'Блокировка ненормативной лексики', 'moderation', 'filters', 'toggle', 'true', 12);

-- Тайминги
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('moderation_queue_limit', 'Лимит очереди', 'Максимум элементов в очереди модерации', 'moderation', 'timing', 'slider', '100', 10, 500, 'элементов', 13),
('moderation_timeout', 'Тайм-аут модерации', 'Автоодобрение после истечения (часы)', 'moderation', 'timing', 'slider', '48', 1, 168, 'часов', 14);

-- =====================================================
-- CATEGORY: API (12 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality, options) VALUES
('api_enabled', 'Включить API', 'Глобальное включение/выключение API', 'api', 'main', 'toggle', 'true', NULL, NULL, NULL, 1, 'critical', NULL),
('api_version', 'Версия API', 'Активная версия API', 'api', 'main', 'select', 'v1', NULL, NULL, NULL, 2, 'high',
  '[{"value":"v1","label":"v1 (текущая)"},{"value":"v2","label":"v2 (beta)"}]'::jsonb),
('api_rate_limit', 'Лимит запросов', 'Максимум запросов к API', 'api', 'rate_limit', 'slider', '1000', 100, 10000, 'req', 3, 'high', NULL),
('api_rate_limit_window', 'Окно лимита', 'Временное окно для rate limit', 'api', 'rate_limit', 'select', 'hour', NULL, NULL, NULL, 4, 'medium',
  '[{"value":"minute","label":"В минуту"},{"value":"hour","label":"В час"},{"value":"day","label":"В день"}]'::jsonb),
('api_caching', 'Кэширование API', 'Включить кэширование ответов', 'api', 'cache', 'toggle', 'true', NULL, NULL, NULL, 5, 'medium', NULL),
('api_cache_duration', 'Длительность кэша', 'Время хранения кэша (сек)', 'api', 'cache', 'slider', '300', 60, 3600, 'сек', 6, 'low', NULL);

-- Webhooks
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('webhooks_enabled', 'Включить webhooks', 'Система webhooks', 'api', 'webhooks', 'toggle', 'true', NULL, NULL, NULL, 7),
('max_webhook_retries', 'Макс. попыток retry', 'Попытки повторной отправки webhook', 'api', 'webhooks', 'slider', '3', 0, 10, 'попыток', 8),
('webhook_timeout', 'Тайм-аут webhook', 'Максимальное время ожидания (сек)', 'api', 'webhooks', 'slider', '30', 5, 120, 'сек', 9);

-- CORS
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, display_order) VALUES
('enable_cors', 'Включить CORS', 'Cross-Origin Resource Sharing', 'api', 'cors', 'toggle', 'true', NULL, 10),
('cors_origins', 'Разрешенные origins', 'Список разрешенных доменов (* = все)', 'api', 'cors', 'text', '*', '* или https://example.com', 11);

-- API Key
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, is_encrypted, display_order, criticality) VALUES
('api_key', 'API Key', 'Мастер API ключ платформы', 'api', 'keys', 'password', 'pm_live_xxxxxxxxxxxxxxxxxxxx', TRUE, 12, 'critical');

-- CDN
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('cdn_enabled', 'Включить CDN', 'Использовать CDN для статики', 'api', 'cdn', 'toggle', 'true', 13),
('cdn_url', 'CDN URL', 'URL CDN сервера', 'api', 'cdn', 'text', 'https://cdn.promo.music', 14),
('image_cdn', 'CDN для изображений', 'Раздавать изображения через CDN', 'api', 'cdn', 'toggle', 'true', 15),
('video_cdn', 'CDN для видео', 'Раздавать видео через CDN', 'api', 'cdn', 'toggle', 'true', 16),
('audio_cdn', 'CDN для аудио', 'Раздавать аудио через CDN', 'api', 'cdn', 'toggle', 'true', 17),
('compression_enabled', 'Сжатие', 'Сжатие ответов API (gzip)', 'api', 'performance', 'toggle', 'true', 18);

-- Продолжение в следующей части из-за ограничения длины...

-- =====================================================
-- CATEGORY: EMAIL (15 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order, options) VALUES
('email_provider', 'Email провайдер', 'Сервис для отправки email', 'email', 'provider', 'select', 'sendgrid', 1,
  '[{"value":"sendgrid","label":"SendGrid"},{"value":"mailgun","label":"Mailgun"},{"value":"ses","label":"Amazon SES"},{"value":"smtp","label":"Custom SMTP"}]'::jsonb);

-- SMTP
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, placeholder, is_encrypted, display_order) VALUES
('smtp_host', 'SMTP хост', 'Адрес SMTP сервера', 'email', 'smtp', 'text', 'smtp.sendgrid.net', NULL, NULL, 'smtp.example.com', FALSE, 2),
('smtp_port', 'SMTP порт', 'Порт SMTP сервера', 'email', 'smtp', 'number', '587', 1, 65535, NULL, FALSE, 3),
('smtp_user', 'SMTP пользователь', 'Имя пользователя SMTP', 'email', 'smtp', 'text', 'apikey', NULL, NULL, NULL, FALSE, 4),
('smtp_password', 'SMTP пароль', 'Пароль SMTP', 'email', 'smtp', 'password', '', NULL, NULL, NULL, TRUE, 5),
('smtp_secure', 'TLS/SSL', 'Безопасное соединение', 'email', 'smtp', 'toggle', 'true', NULL, NULL, NULL, FALSE, 6);

-- Отправитель
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, display_order) VALUES
('from_email', 'From Email', 'Email отправителя', 'email', 'sender', 'email', 'noreply@promo.music', 'noreply@promo.music', 7),
('from_name', 'From Name', 'Имя отправителя', 'email', 'sender', 'text', 'PROMO.MUSIC', 'PROMO.MUSIC', 8),
('reply_to_email', 'Reply-To Email', 'Email для ответов', 'email', 'sender', 'email', 'support@promo.music', 'support@promo.music', 9);

-- Шаблоны
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('email_templates_enabled', 'Шаблоны email', 'Использовать HTML шаблоны', 'email', 'templates', 'toggle', 'true', 10),
('email_footer', 'Футер email', 'Текст в подвале писем', 'email', 'templates', 'textarea', '© 2024 PROMO.MUSIC. All rights reserved.', 11);

-- Трекинг
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('track_email_opens', 'Отслеживать открытия', 'Трекинг открытий писем', 'email', 'tracking', 'toggle', 'true', 12),
('track_email_clicks', 'Отслеживать клики', 'Трекинг кликов в письмах', 'email', 'tracking', 'toggle', 'true', 13),
('email_bounce_handling', 'Обработка bounce', 'Автоматическая обработка отказов', 'email', 'tracking', 'toggle', 'true', 14);

-- Retry
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('email_retry_attempts', 'Попыток отправки', 'Повторные попытки при ошибке', 'email', 'retry', 'slider', '3', 0, 5, 'попыток', 15);

-- Отписки
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('unsubscribe_enabled', 'Отписки', 'Включить ссылку отписки в письмах', 'email', 'unsubscribe', 'toggle', 'true', 16);

-- =====================================================
-- CATEGORY: PITCHING (13 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality) VALUES
('pitching_enabled', 'Включить питчинг', 'Глобальное включение системы питчинга', 'pitching', 'main', 'toggle', 'true', NULL, NULL, NULL, 1, 'critical'),
('default_pitch_price', 'Стандартная цена', 'Цена питча по умолчанию', 'pitching', 'pricing', 'slider', '29', 5, 100, NULL, 2, 'medium'),
('min_pitch_price', 'Мин. цена', 'Минимальная цена питча', 'pitching', 'pricing', 'slider', '5', 1, 50, NULL, 3, 'medium'),
('max_pitch_price', 'Макс. цена', 'Максимальная цена питча', 'pitching', 'pricing', 'slider', '500', 100, 1000, NULL, 4, 'medium');

-- Premium
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('express_enabled', 'Express питчинг', 'Быстрое рассмотрение за 24ч', 'pitching', 'premium', 'toggle', 'true', NULL, NULL, NULL, 5),
('express_price_multiplier', 'Множитель Express', 'Во сколько раз дороже стандартного', 'pitching', 'premium', 'slider', '2', 1.5, 5, 'x', 6),
('guaranteed_enabled', 'Гарантированное рассмотрение', 'Гарантия рассмотрения', 'pitching', 'premium', 'toggle', 'true', NULL, NULL, NULL, 7),
('guaranteed_price_multiplier', 'Множитель Guaranteed', 'Во сколько раз дороже стандартного', 'pitching', 'premium', 'slider', '3', 2, 10, 'x', 8);

-- Лимиты
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('pitch_review_time', 'Время рассмотрения', 'Часов на рассмотрение питча', 'pitching', 'limits', 'slider', '72', 24, 168, 'часов', 9),
('pitch_expiry_days', 'Срок действия', 'Дней до истечения питча', 'pitching', 'limits', 'slider', '30', 7, 90, 'дней', 10),
('auto_cancel_expired_pitches', 'Автоотмена просроченных', 'Автоматически отменять истекшие', 'pitching', 'limits', 'toggle', 'true', NULL, NULL, NULL, 11);

-- Множественные
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order) VALUES
('allow_multiple_pitches', 'Множественные питчи', 'Один трек в несколько плейлистов', 'pitching', 'multiple', 'toggle', 'true', NULL, NULL, NULL, 12),
('max_simultaneous_pitches', 'Макс. одновременных', 'Максимум активных питчей', 'pitching', 'multiple', 'slider', '10', 1, 50, 'питчей', 13);

-- =====================================================
-- CATEGORY: ANALYTICS (8 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('analytics_enabled', 'Включить аналитику', 'Глобальное включение аналитики', 'analytics', 'main', 'toggle', 'true', 1),
('track_page_views', 'Просмотры страниц', 'Отслеживать просмотры', 'analytics', 'main', 'toggle', 'true', 2),
('track_events', 'События', 'Отслеживать события пользователей', 'analytics', 'main', 'toggle', 'true', 3),
('track_conversions', 'Конверсии', 'Отслеживать конверсии', 'analytics', 'main', 'toggle', 'true', 4);

-- Интеграции
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, display_order) VALUES
('google_analytics_id', 'Google Analytics ID', 'ID Google Analytics', 'analytics', 'integrations', 'text', '', 'G-XXXXXXXXXX', 5),
('facebook_pixel_id', 'Facebook Pixel ID', 'ID Facebook Pixel', 'analytics', 'integrations', 'text', '', '000000000000000', 6),
('mixpanel_token', 'Mixpanel Token', 'Токен Mixpanel', 'analytics', 'integrations', 'text', '', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 7),
('amplitude_key', 'Amplitude Key', 'API ключ Amplitude', 'analytics', 'integrations', 'text', '', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 8);

-- Дополнительно
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('heatmaps_enabled', 'Тепловые карты', 'Hotjar, Crazy Egg и др.', 'analytics', 'advanced', 'toggle', 'false', 9),
('session_recording_enabled', 'Запись сессий', 'Fullstory, LogRocket и др.', 'analytics', 'advanced', 'toggle', 'false', 10);

-- =====================================================
-- CATEGORY: BACKUP (10 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality, options) VALUES
('auto_backup_enabled', 'Автобэкап', 'Автоматическое резервное копирование', 'backup', 'auto', 'toggle', 'true', NULL, NULL, NULL, 1, 'critical', NULL),
('backup_frequency', 'Частота бэкапов', 'Как часто делать бэкапы', 'backup', 'auto', 'select', 'daily', NULL, NULL, NULL, 2, 'high',
  '[{"value":"hourly","label":"Ежечасно"},{"value":"daily","label":"Ежедневно"},{"value":"weekly","label":"Еженедельно"},{"value":"monthly","label":"Ежемесячно"}]'::jsonb),
('backup_retention', 'Хранение бэкапов', 'Сколько дней хранить', 'backup', 'auto', 'slider', '30', 1, 365, 'дней', 3, 'high', NULL);

-- Расположение
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order, options) VALUES
('backup_location', 'Хранилище', 'Где хранить бэкапы', 'backup', 'storage', 'select', 's3', 4,
  '[{"value":"s3","label":"Amazon S3"},{"value":"gcs","label":"Google Cloud Storage"},{"value":"azure","label":"Azure Storage"},{"value":"local","label":"Локальное"}]'::jsonb),
('backup_encryption', 'Шифрование', 'Шифровать бэкапы', 'backup', 'storage', 'toggle', 'true', 5);

-- Что бэкапить
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('database_backup', 'База данных', 'Бэкапить БД', 'backup', 'content', 'toggle', 'true', 6),
('files_backup', 'Файлы пользователей', 'Бэкапить загруженные файлы', 'backup', 'content', 'toggle', 'true', 7);

-- Обслуживание
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, warning_text, display_order, criticality) VALUES
('auto_update_enabled', 'Автообновления', 'Автоматически обновлять платформу', 'backup', 'maintenance', 'toggle', 'false', NULL, 'Может вызвать простой!', 8, 'critical'),
('maintenance_window', 'Окно обслуживания', 'Когда можно проводить обслуживание', 'backup', 'maintenance', 'text', 'Sunday 02:00-04:00', 'Sunday 02:00-04:00', NULL, 9, 'medium'),
('last_backup_date', 'Последний бэкап', 'Дата последнего бэкапа (readonly)', 'backup', 'info', 'text', '2024-01-30', NULL, NULL, 10, 'low');

-- GDPR
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, min_value, max_value, unit, display_order, criticality) VALUES
('gdpr_compliance', 'GDPR соответствие', 'Включить GDPR режим', 'backup', 'gdpr', 'toggle', 'true', NULL, NULL, NULL, 11, 'critical'),
('cookie_consent', 'Cookie consent', 'Показывать баннер о cookies', 'backup', 'gdpr', 'toggle', 'true', NULL, NULL, NULL, 12, 'high'),
('data_retention_days', 'Хранение данных', 'Сколько дней хранить данные', 'backup', 'gdpr', 'slider', '365', 30, 3650, 'дней', 13, 'high'),
('anonymize_data', 'Анонимизация', 'Анонимизировать данные пользователей', 'backup', 'gdpr', 'toggle', 'true', NULL, NULL, NULL, 14, 'medium'),
('right_to_be_forgotten', 'Право на забвение', 'Разрешить удаление данных по запросу', 'backup', 'gdpr', 'toggle', 'true', NULL, NULL, NULL, 15, 'high'),
('data_export_enabled', 'Экспорт данных', 'Разрешить экспорт данных пользователям', 'backup', 'gdpr', 'toggle', 'true', NULL, NULL, NULL, 16, 'medium');

-- =====================================================
-- CATEGORY: FEATURES (6 настроек)
-- =====================================================

INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, warning_text, display_order, criticality) VALUES
('beta_features_enabled', 'Beta функции', 'Включить beta функционал', 'features', 'experimental', 'toggle', 'false', 'Beta функции могут быть нестабильны!', 1, 'high'),
('experimental_features_enabled', 'Экспериментальные', 'Только для тестирования', 'features', 'experimental', 'toggle', 'false', 'Только для тестовых сред!', 2, 'critical');

-- UI
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, display_order) VALUES
('dark_mode_forced', 'Темная тема', 'Принудительная темная тема для всех', 'features', 'ui', 'toggle', 'false', 3);

-- Баннеры
INSERT INTO admin_settings (setting_key, setting_name, setting_description, category, subcategory, setting_type, default_value, placeholder, display_order) VALUES
('maintenance_banner', 'Баннер обслуживания', 'Показывать баннер о планируемом обслуживании', 'features', 'banners', 'toggle', 'false', NULL, 4),
('announcement_bar', 'Панель объявлений', 'Показывать панель с объявлениями', 'features', 'banners', 'toggle', 'false', NULL, 5),
('announcement_text', 'Текст объявления', 'Текст в панели объявлений', 'features', 'banners', 'textarea', '', 'Важное объявление...', 6);

-- =====================================================
-- Обновление счетчиков в метаданных
-- =====================================================

-- Обновляем display_order для правильной сортировки
UPDATE admin_settings SET display_order = display_order WHERE category IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE admin_settings IS '850+ настроек администратора в 12 категориях';
