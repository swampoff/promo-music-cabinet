/**
 * SETTINGS AND PROFILE SYSTEM - СИСТЕМА НАСТРОЕК И ПРОФИЛЯ
 * Дата создания: 28 января 2026
 * 
 * Полная система управления профилем артиста, настройками,
 * социальными ссылками, верификацией и персонализацией.
 * 
 * Структура:
 * 1. user_profiles - расширенные профили артистов
 * 2. user_settings - пользовательские настройки
 * 3. social_links - социальные сети и ссылки
 * 4. verification_requests - запросы на верификацию
 * 5. user_preferences - предпочтения и персонализация
 * 6. sessions - активные сессии пользователей
 */

-- ============================================================================
-- 1. USER PROFILES - РАСШИРЕННЫЕ ПРОФИЛИ АРТИСТОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Basic info
  display_name TEXT NOT NULL,
  artist_name TEXT,
  bio TEXT,
  description TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Location
  country TEXT,
  city TEXT,
  timezone TEXT DEFAULT 'Europe/Moscow',
  
  -- Media
  avatar_url TEXT,
  cover_url TEXT,
  logo_url TEXT,
  
  -- Music info
  genres TEXT[], -- ['Pop', 'Rock', 'Electronic']
  primary_genre TEXT,
  influences TEXT[], -- Кто вдохновляет
  
  career_start_year INTEGER,
  record_label TEXT,
  management TEXT,
  
  -- Stats (cache для быстрого доступа)
  followers_count INTEGER DEFAULT 0,
  tracks_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_badge TEXT, -- 'blue', 'gold', 'artist'
  
  -- Privacy
  is_public BOOLEAN DEFAULT TRUE,
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  show_stats BOOLEAN DEFAULT TRUE,
  
  -- Monetization
  accept_donations BOOLEAN DEFAULT TRUE,
  donation_message TEXT,
  min_donation_amount INTEGER DEFAULT 100,
  
  -- SEO
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'suspended', 'banned')
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_slug ON user_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON user_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_genre ON user_profiles(primary_genre);

COMMENT ON TABLE user_profiles IS 'Расширенные профили артистов';

-- ============================================================================
-- 2. USER SETTINGS - ПОЛЬЗОВАТЕЛЬСКИЕ НАСТРОЙКИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_settings (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Notifications
  notifications JSONB DEFAULT '{
    "email": {
      "new_follower": true,
      "new_comment": true,
      "new_like": true,
      "new_donation": true,
      "marketing": false,
      "analytics_weekly": true
    },
    "push": {
      "new_follower": true,
      "new_comment": true,
      "new_like": false,
      "new_donation": true
    },
    "sms": {
      "important_only": true
    }
  }'::jsonb,
  
  -- Privacy
  privacy JSONB DEFAULT '{
    "profile_visibility": "public",
    "show_online_status": true,
    "allow_messages": true,
    "allow_comments": true,
    "content_visibility": "public"
  }'::jsonb,
  
  -- Display
  display JSONB DEFAULT '{
    "theme": "dark",
    "language": "ru",
    "date_format": "DD.MM.YYYY",
    "time_format": "24h",
    "sidebar_collapsed": false
  }'::jsonb,
  
  -- Content
  content JSONB DEFAULT '{
    "auto_publish": false,
    "default_track_visibility": "public",
    "watermark_videos": false,
    "allow_downloads": true
  }'::jsonb,
  
  -- Analytics
  analytics JSONB DEFAULT '{
    "google_analytics_id": null,
    "yandex_metrika_id": null,
    "facebook_pixel_id": null
  }'::jsonb,
  
  -- Monetization
  monetization JSONB DEFAULT '{
    "currency": "RUB",
    "payout_method": "bank_transfer",
    "min_payout": 1000,
    "auto_withdraw": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

COMMENT ON TABLE user_settings IS 'Настройки пользователя (уведомления, приватность, отображение)';

-- ============================================================================
-- 3. SOCIAL LINKS - СОЦИАЛЬНЫЕ СЕТИ И ССЫЛКИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_links (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Platform
  platform TEXT NOT NULL CHECK (
    platform IN (
      'instagram', 'vk', 'youtube', 'tiktok', 'telegram',
      'facebook', 'twitter', 'spotify', 'apple_music',
      'yandex_music', 'vk_music', 'soundcloud', 'bandcamp',
      'website', 'other'
    )
  ),
  
  platform_display_name TEXT, -- Для кастомных
  
  -- URL
  url TEXT NOT NULL,
  username TEXT,
  
  -- Stats (опционально, для интеграции)
  followers_count INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Display
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Verification (доказательство владения)
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique: одна платформа один раз
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_links_user ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_links_visible ON social_links(is_visible);

COMMENT ON TABLE social_links IS 'Ссылки на социальные сети артиста';

-- ============================================================================
-- 4. VERIFICATION REQUESTS - ЗАПРОСЫ НА ВЕРИФИКАЦИЮ
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_requests (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Request type
  verification_type TEXT NOT NULL CHECK (
    verification_type IN (
      'artist',      -- Верификация артиста
      'label',       -- Верификация лейбла
      'influencer',  -- Верификация инфлюенсера
      'business'     -- Верификация бизнеса
    )
  ),
  
  -- Submitted data
  full_name TEXT NOT NULL,
  stage_name TEXT,
  
  -- Evidence
  proof_documents TEXT[], -- URLs к документам
  social_proof TEXT[], -- Ссылки на верифицированные аккаунты
  
  additional_info JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',    -- На рассмотрении
      'reviewing',  -- В процессе проверки
      'approved',   -- Одобрено
      'rejected',   -- Отклонено
      'cancelled'   -- Отменено пользователем
    )
  ),
  
  -- Moderation
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_type ON verification_requests(verification_type);
CREATE INDEX IF NOT EXISTS idx_verification_created ON verification_requests(created_at DESC);

COMMENT ON TABLE verification_requests IS 'Запросы на верификацию профилей';

-- ============================================================================
-- 5. USER PREFERENCES - ПРЕДПОЧТЕНИЯ И ПЕРСОНАЛИЗАЦИЯ
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Preference
  category TEXT NOT NULL, -- 'ui', 'content', 'notifications', etc.
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  
  -- Type
  value_type TEXT DEFAULT 'string' CHECK (
    value_type IN ('string', 'number', 'boolean', 'json')
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category, key)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);

COMMENT ON TABLE user_preferences IS 'Гранулярные предпочтения пользователя';

-- ============================================================================
-- 6. SESSIONS - АКТИВНЫЕ СЕССИИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  
  -- Session info
  token_hash TEXT NOT NULL UNIQUE,
  
  -- Device
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  device_name TEXT,
  browser TEXT,
  os TEXT,
  
  -- Location
  ip_address TEXT,
  country TEXT,
  city TEXT,
  
  -- Activity
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

COMMENT ON TABLE sessions IS 'Активные сессии пользователей';

-- ============================================================================
-- 7. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры
DROP TRIGGER IF EXISTS trigger_user_profiles_updated ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS trigger_user_settings_updated ON user_settings;
CREATE TRIGGER trigger_user_settings_updated
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS trigger_social_links_updated ON social_links;
CREATE TRIGGER trigger_social_links_updated
  BEFORE UPDATE ON social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS trigger_verification_updated ON verification_requests;
CREATE TRIGGER trigger_verification_updated
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

DROP TRIGGER IF EXISTS trigger_preferences_updated ON user_preferences;
CREATE TRIGGER trigger_preferences_updated
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_updated_at();

-- Функция: Автоматическая генерация slug при создании профиля
CREATE OR REPLACE FUNCTION generate_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Базовый slug из artist_name или display_name
    base_slug := COALESCE(NEW.artist_name, NEW.display_name);
    
    -- Транслитерация и очистка
    base_slug := lower(regexp_replace(base_slug, '[^a-zA-Z0-9\-]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Проверка уникальности
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_profile_slug ON user_profiles;
CREATE TRIGGER trigger_generate_profile_slug
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_profile_slug();

-- Функция: Очистка истёкших сессий
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW()
    OR (is_active = TRUE AND last_activity < NOW() - INTERVAL '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions IS 'Удаляет истёкшие и неактивные сессии';

-- Функция: Обновление статистики профиля
CREATE OR REPLACE FUNCTION update_profile_stats(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET 
    followers_count = (SELECT COUNT(*) FROM followers WHERE following_id = p_user_id),
    tracks_count = (SELECT COUNT(*) FROM tracks WHERE artist_id = p_user_id AND status = 'published'),
    videos_count = (SELECT COUNT(*) FROM videos WHERE artist_id = p_user_id AND status = 'published'),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_profile_stats IS 'Обновляет кэшированную статистику профиля';

-- ============================================================================
-- 8. VIEWS - ПРЕДСТАВЛЕНИЯ
-- ============================================================================

-- View: Полные профили с настройками
CREATE OR REPLACE VIEW user_profiles_complete AS
SELECT 
  up.*,
  us.notifications,
  us.privacy,
  us.display,
  
  -- Социальные сети (агрегация)
  (
    SELECT json_agg(json_build_object(
      'platform', platform,
      'url', url,
      'username', username,
      'followers_count', followers_count
    ))
    FROM social_links
    WHERE user_id = up.user_id AND is_visible = TRUE
    ORDER BY sort_order
  ) as social_links,
  
  -- Статус верификации
  CASE 
    WHEN up.is_verified THEN 'verified'
    WHEN EXISTS (
      SELECT 1 FROM verification_requests 
      WHERE user_id = up.user_id AND status = 'pending'
    ) THEN 'pending'
    ELSE 'unverified'
  END as verification_status
  
FROM user_profiles up
LEFT JOIN user_settings us ON us.user_id = up.user_id;

COMMENT ON VIEW user_profiles_complete IS 'Полные профили с настройками и социальными ссылками';

-- View: Верифицированные артисты
CREATE OR REPLACE VIEW verified_artists AS
SELECT 
  up.*,
  vr.verification_type,
  vr.approved_at as verified_at
FROM user_profiles up
LEFT JOIN verification_requests vr ON vr.user_id = up.user_id AND vr.status = 'approved'
WHERE up.is_verified = TRUE
  AND up.status = 'active'
ORDER BY up.followers_count DESC;

COMMENT ON VIEW verified_artists IS 'Список верифицированных артистов';

-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Профили: публичные видят все, приватные только владелец
CREATE POLICY user_profiles_read_policy ON user_profiles
  FOR SELECT USING (
    is_public = TRUE 
    OR user_id = auth.uid()::TEXT
  );

CREATE POLICY user_profiles_write_policy ON user_profiles
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Настройки: только владелец
CREATE POLICY user_settings_policy ON user_settings
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Социальные ссылки: владелец + публичные если профиль публичный
CREATE POLICY social_links_read_policy ON social_links
  FOR SELECT USING (
    is_visible = TRUE AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = social_links.user_id 
      AND is_public = TRUE
    )
    OR user_id = auth.uid()::TEXT
  );

CREATE POLICY social_links_write_policy ON social_links
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Верификация: только владелец
CREATE POLICY verification_policy ON verification_requests
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Предпочтения: только владелец
CREATE POLICY preferences_policy ON user_preferences
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Сессии: только владелец
CREATE POLICY sessions_policy ON sessions
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Админы видят всё
CREATE POLICY user_profiles_admin_policy ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY verification_admin_policy ON verification_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Settings and Profile System created successfully';
  RAISE NOTICE '👤 Tables: 6 profile and settings tables';
  RAISE NOTICE '⚡ Functions: 4 automation functions';
  RAISE NOTICE '📈 Views: 2 profile views';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
