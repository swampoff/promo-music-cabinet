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
