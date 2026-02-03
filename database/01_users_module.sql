-- =====================================================
-- PROMO.MUSIC - USERS MODULE
-- Управление пользователями, профилями, ролями
-- =====================================================

-- =====================================================
-- ТАБЛИЦА: users
-- Основная таблица пользователей (расширяет auth.users Supabase)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Основная информация
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  display_name VARCHAR(100),
  
  -- Роль и статус
  role user_role NOT NULL DEFAULT 'artist',
  status user_status NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  
  -- Профиль
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  country_code CHAR(2),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  
  -- Соцсети и контакты
  website_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  phone VARCHAR(20),
  
  -- Настройки
  settings JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Метрики
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0.00,
  account_balance DECIMAL(12,2) DEFAULT 0.00,
  credits INTEGER DEFAULT 0,
  
  -- Даты
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_-]{3,50}$'),
  CONSTRAINT positive_balance CHECK (account_balance >= 0),
  CONSTRAINT positive_credits CHECK (credits >= 0)
);

-- Индексы
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', 
  COALESCE(full_name, '') || ' ' || 
  COALESCE(username, '') || ' ' || 
  COALESCE(bio, '')
));

COMMENT ON TABLE users IS 'Основная таблица пользователей системы';

-- =====================================================
-- ТАБЛИЦА: artist_profiles
-- Профили артистов с музыкальной информацией
-- =====================================================
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Артист информация
  artist_name VARCHAR(255) NOT NULL,
  stage_name VARCHAR(255),
  label_name VARCHAR(255),
  management_company VARCHAR(255),
  
  -- Музыкальные параметры
  primary_genre music_genre NOT NULL,
  secondary_genres music_genre[] DEFAULT '{}',
  subgenres TEXT[],
  moods TEXT[],
  
  -- Статистика на платформах
  spotify_artist_id VARCHAR(100),
  spotify_monthly_listeners INTEGER DEFAULT 0,
  spotify_followers INTEGER DEFAULT 0,
  
  apple_music_artist_id VARCHAR(100),
  apple_music_followers INTEGER DEFAULT 0,
  
  soundcloud_artist_id VARCHAR(100),
  soundcloud_followers INTEGER DEFAULT 0,
  
  youtube_channel_id VARCHAR(100),
  youtube_subscribers INTEGER DEFAULT 0,
  
  instagram_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  
  -- Достижения
  total_streams BIGINT DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  chart_entries INTEGER DEFAULT 0,
  awards TEXT[],
  press_mentions TEXT[],
  
  -- Верификация
  is_verified_artist BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_documents JSONB DEFAULT '[]'::jsonb,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_primary_genre ON artist_profiles(primary_genre);
CREATE INDEX idx_artist_profiles_verified ON artist_profiles(is_verified_artist);
CREATE INDEX idx_artist_profiles_spotify_id ON artist_profiles(spotify_artist_id);

COMMENT ON TABLE artist_profiles IS 'Расширенные профили артистов с музыкальной информацией';

-- =====================================================
-- ТАБЛИЦА: user_sessions
-- Сессии пользователей для безопасности и аналитики
-- =====================================================
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Сессия
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Устройство
  device_type VARCHAR(50),
  device_name VARCHAR(100),
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- География
  country VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Активность
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX idx_sessions_ip ON user_sessions(ip_address);

COMMENT ON TABLE user_sessions IS 'Активные сессии пользователей';

-- =====================================================
-- ТАБЛИЦА: user_permissions
-- Детальные разрешения для ролей
-- =====================================================
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Разрешения
  permission_key VARCHAR(100) NOT NULL,
  permission_value BOOLEAN DEFAULT TRUE,
  
  -- Метаданные
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id, permission_key)
);

CREATE INDEX idx_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_permissions_key ON user_permissions(permission_key);

COMMENT ON TABLE user_permissions IS 'Детальные разрешения пользователей';

-- =====================================================
-- ТАБЛИЦА: user_settings
-- Настройки и предпочтения пользователей
-- =====================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Email уведомления
  email_pitch_updates BOOLEAN DEFAULT TRUE,
  email_payment_confirmations BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,
  email_support_replies BOOLEAN DEFAULT TRUE,
  
  -- Push уведомления
  push_pitch_updates BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  push_promotions BOOLEAN DEFAULT FALSE,
  
  -- SMS уведомления
  sms_enabled BOOLEAN DEFAULT FALSE,
  sms_pitch_updates BOOLEAN DEFAULT FALSE,
  sms_payment_alerts BOOLEAN DEFAULT FALSE,
  
  -- Приватность
  profile_visibility VARCHAR(20) DEFAULT 'public', -- public, private, friends
  show_statistics BOOLEAN DEFAULT TRUE,
  show_social_links BOOLEAN DEFAULT TRUE,
  allow_messages_from VARCHAR(20) DEFAULT 'all', -- all, verified, none
  
  -- UI/UX
  theme VARCHAR(20) DEFAULT 'dark', -- dark, light, auto
  dashboard_layout JSONB DEFAULT '[]'::jsonb,
  notifications_sound BOOLEAN DEFAULT TRUE,
  
  -- Безопасность
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  login_alerts BOOLEAN DEFAULT TRUE,
  
  -- Дополнительно
  custom_settings JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

COMMENT ON TABLE user_settings IS 'Настройки и предпочтения пользователей';

-- =====================================================
-- ТАБЛИЦА: user_activity_log
-- Логирование активности пользователей
-- =====================================================
CREATE TABLE user_activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Активность
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT,
  
  -- Контекст
  resource_type VARCHAR(50),
  resource_id UUID,
  
  -- Дополнительные данные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Сессия
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_action_type ON user_activity_log(action_type);
CREATE INDEX idx_activity_resource ON user_activity_log(resource_type, resource_id);
CREATE INDEX idx_activity_created_at ON user_activity_log(created_at DESC);

COMMENT ON TABLE user_activity_log IS 'Журнал активности пользователей';

-- =====================================================
-- ТАБЛИЦА: user_referrals
-- Реферальная система пользователей
-- =====================================================
CREATE TABLE user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Реферальный код
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
  is_reward_claimed BOOLEAN DEFAULT FALSE,
  
  -- Вознаграждения
  referrer_reward_amount DECIMAL(12,2) DEFAULT 0.00,
  referrer_reward_credits INTEGER DEFAULT 0,
  referred_reward_amount DECIMAL(12,2) DEFAULT 0.00,
  referred_reward_credits INTEGER DEFAULT 0,
  
  -- Даты
  completed_at TIMESTAMPTZ,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX idx_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON user_referrals(referred_id);
CREATE INDEX idx_referrals_code ON user_referrals(referral_code);
CREATE INDEX idx_referrals_status ON user_referrals(status);

COMMENT ON TABLE user_referrals IS 'Реферальная система пользователей';

-- =====================================================
-- ТАБЛИЦА: user_badges
-- Бейджи и достижения пользователей
-- =====================================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Бейдж
  badge_key VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  badge_tier VARCHAR(20), -- bronze, silver, gold, platinum
  
  -- Прогресс
  progress INTEGER DEFAULT 0,
  target INTEGER,
  is_unlocked BOOLEAN DEFAULT FALSE,
  
  -- Даты
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_key)
);

CREATE INDEX idx_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_badges_unlocked ON user_badges(is_unlocked);

COMMENT ON TABLE user_badges IS 'Бейджи и достижения пользователей';
