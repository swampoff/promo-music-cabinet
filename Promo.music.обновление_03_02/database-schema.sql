-- =====================================================
-- PROMO.MUSIC - DATABASE SCHEMA
-- Полная SQL схема для PostgreSQL (Supabase)
-- =====================================================

-- =====================================================
-- 1. ПОЛЬЗОВАТЕЛИ И АУТЕНТИФИКАЦИЯ
-- =====================================================

-- Основная таблица пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('artist', 'admin', 'partner')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}',
  
  -- Индексы для быстрого поиска
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Профили артистов
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  display_name VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  
  -- Контактная информация
  location VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  website VARCHAR(255),
  
  -- Социальные сети
  social_links JSONB DEFAULT '{}', -- {instagram, youtube, spotify, apple_music, vk, telegram}
  
  -- Музыкальная информация
  genres TEXT[], -- Массив жанров
  languages TEXT[], -- Языки исполнения
  
  -- Статистика
  total_tracks INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  total_concerts INTEGER DEFAULT 0,
  total_news INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  total_plays INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  
  -- Верификация
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_badge VARCHAR(50), -- 'basic', 'premium', 'pro'
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX idx_artist_profiles_verified ON artist_profiles(is_verified);
CREATE INDEX idx_artist_profiles_genres ON artist_profiles USING GIN(genres);

-- Профили админов
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  position VARCHAR(100), -- 'super_admin', 'moderator', 'support', 'finance'
  
  -- Права доступа
  permissions JSONB DEFAULT '{}', -- {can_moderate_tracks, can_moderate_videos, can_moderate_concerts, can_moderate_news, can_manage_users, can_manage_finances}
  
  -- Статистика работы
  total_moderated_tracks INTEGER DEFAULT 0,
  total_moderated_videos INTEGER DEFAULT 0,
  total_moderated_concerts INTEGER DEFAULT 0,
  total_moderated_news INTEGER DEFAULT 0,
  total_resolved_tickets INTEGER DEFAULT 0,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX idx_admin_profiles_position ON admin_profiles(position);

-- =====================================================
-- 2. ТРЕКИ
-- =====================================================

CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  featuring TEXT[], -- Массив артистов (feat.)
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  
  -- Музыкальная информация
  genre VARCHAR(100) NOT NULL,
  subgenre VARCHAR(100),
  mood VARCHAR(100), -- 'happy', 'sad', 'energetic', 'calm', 'aggressive'
  duration INTEGER NOT NULL, -- В секундах
  bpm INTEGER,
  music_key VARCHAR(10), -- 'C', 'D#', 'F minor' и т.д.
  
  -- Метаданные
  isrc VARCHAR(50), -- International Standard Recording Code
  release_date DATE,
  copyright_holder VARCHAR(255),
  label VARCHAR(255),
  language VARCHAR(50),
  lyrics TEXT,
  
  -- Статус модерации
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_note TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Статистика
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  
  -- SEO и теги
  tags TEXT[],
  description TEXT,
  
  -- Временные метки
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_upload_date ON tracks(upload_date DESC);
CREATE INDEX idx_tracks_plays ON tracks(plays DESC);
CREATE INDEX idx_tracks_tags ON tracks USING GIN(tags);

-- =====================================================
-- 3. ВИДЕО
-- =====================================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  
  -- Источник видео
  video_source VARCHAR(20) NOT NULL CHECK (video_source IN ('file', 'link')),
  video_file_url TEXT, -- Если загружено как файл
  video_external_url TEXT, -- Если ссылка на YouTube/Vimeo
  
  -- Метаданные
  category VARCHAR(100), -- 'music_video', 'live_performance', 'behind_the_scenes', 'interview'
  genre VARCHAR(100) NOT NULL,
  duration INTEGER NOT NULL, -- В секундах
  
  -- Создатели
  creators JSONB DEFAULT '{}', -- {director, cinematographer, editor, producer, etc.}
  
  -- Теги
  tags TEXT[],
  
  -- Статус модерации
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_note TEXT,
  rejection_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Продвижение
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Статистика
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Временные метки
  release_date DATE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_genre ON videos(genre);
CREATE INDEX idx_videos_upload_date ON videos(upload_date DESC);
CREATE INDEX idx_videos_views ON videos(views DESC);
CREATE INDEX idx_videos_is_paid ON videos(is_paid);

-- =====================================================
-- 4. КОНЦЕРТЫ
-- =====================================================

CREATE TABLE concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  description TEXT,
  banner_url TEXT,
  
  -- Место проведения
  venue VARCHAR(255) NOT NULL,
  venue_address TEXT,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Россия',
  coordinates JSONB, -- {lat: number, lng: number}
  
  -- Дата и время
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  doors_open_time TIME,
  duration_minutes INTEGER,
  
  -- Тип мероприятия
  event_type VARCHAR(100), -- 'concert', 'festival', 'tour', 'private_event'
  
  -- Билеты
  ticket_price_from DECIMAL(10, 2),
  ticket_price_to DECIMAL(10, 2),
  ticket_currency VARCHAR(10) DEFAULT 'RUB',
  ticket_link TEXT,
  ticket_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Статус модерации
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed')),
  moderation_note TEXT,
  rejection_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Продвижение
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Статистика
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_concerts_user_id ON concerts(user_id);
CREATE INDEX idx_concerts_status ON concerts(status);
CREATE INDEX idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_event_type ON concerts(event_type);
CREATE INDEX idx_concerts_is_paid ON concerts(is_paid);

-- =====================================================
-- 5. НОВОСТИ
-- =====================================================

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview TEXT, -- Краткое описание (первые 150-200 символов)
  cover_image_url TEXT NOT NULL,
  
  -- Категория
  category VARCHAR(100), -- 'announcement', 'behind_the_scenes', 'tour', 'release', 'collaboration', 'opinion'
  
  -- Статус модерации
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_note TEXT,
  rejection_reason TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Продвижение
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Статистика
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Временные метки
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_user_id ON news(user_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_publish_date ON news(publish_date DESC);
CREATE INDEX idx_news_views ON news(views DESC);
CREATE INDEX idx_news_is_paid ON news(is_paid);

-- =====================================================
-- 6. ФИНАНСЫ
-- =====================================================

-- Балансы пользователей
CREATE TABLE user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Балансы
  coins_balance DECIMAL(15, 2) DEFAULT 0, -- Внутренняя валюта (коины)
  money_balance DECIMAL(15, 2) DEFAULT 0, -- Реальные деньги (рубли)
  currency VARCHAR(10) DEFAULT 'RUB',
  
  -- Лимиты
  daily_withdrawal_limit DECIMAL(15, 2) DEFAULT 100000,
  monthly_withdrawal_limit DECIMAL(15, 2) DEFAULT 1000000,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);

-- Транзакции
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Тип транзакции
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'withdrawal', 'deposit', 'purchase', 'refund', 'commission')),
  
  -- Сумма
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  
  -- Описание
  description TEXT NOT NULL,
  category VARCHAR(100), -- 'track_promotion', 'video_promotion', 'concert_promotion', 'news_promotion', 'subscription', 'withdrawal'
  
  -- Связанные объекты
  related_track_id UUID REFERENCES tracks(id),
  related_video_id UUID REFERENCES videos(id),
  related_concert_id UUID REFERENCES concerts(id),
  related_news_id UUID REFERENCES news(id),
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected')),
  
  -- Метаданные платежа
  payment_method VARCHAR(50), -- 'card', 'bank_transfer', 'yookassa', 'paypal'
  payment_provider VARCHAR(50),
  payment_id VARCHAR(255), -- ID платежа в системе провайдера
  
  -- Комиссии
  platform_fee DECIMAL(15, 2) DEFAULT 0,
  payment_fee DECIMAL(15, 2) DEFAULT 0,
  
  -- Временные метки
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

-- История пополнений/выводов
CREATE TABLE payment_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  
  -- Тип операции
  operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('deposit', 'withdrawal')),
  
  -- Сумма
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RUB',
  
  -- Реквизиты
  payment_details JSONB, -- {card_number, bank_name, account_number, etc.}
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payment_operations_user_id ON payment_operations(user_id);
CREATE INDEX idx_payment_operations_type ON payment_operations(operation_type);
CREATE INDEX idx_payment_operations_status ON payment_operations(status);

-- =====================================================
-- 7. ПОДПИСКИ
-- =====================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Ценообразование
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'RUB',
  
  -- Характеристики
  features JSONB NOT NULL, -- {max_tracks, max_videos, max_concerts, max_news, analytics_access, priority_support}
  
  -- Лимиты
  max_tracks_per_month INTEGER,
  max_videos_per_month INTEGER,
  max_concerts_per_month INTEGER,
  max_news_per_month INTEGER,
  
  -- Визуальное оформление
  badge_color VARCHAR(50),
  is_popular BOOLEAN DEFAULT FALSE,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Период подписки
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'suspended')),
  billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  
  -- Даты
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Автопродление
  auto_renew BOOLEAN DEFAULT TRUE,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- =====================================================
-- 8. ПОДДЕРЖКА
-- =====================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Информация о заявке
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'technical', 'billing', 'content', 'account', 'other'
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Статус
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_user', 'resolved', 'closed')),
  
  -- Назначение
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Разрешение
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  -- Содержание
  message TEXT NOT NULL,
  attachments JSONB, -- [{url, filename, size, type}]
  
  -- Тип сообщения
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'support', 'admin')),
  is_internal_note BOOLEAN DEFAULT FALSE, -- Видно только админам
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_sender_id ON support_messages(sender_id);

-- =====================================================
-- 9. УВЕДОМЛЕНИЯ
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Тип уведомления
  type VARCHAR(50) NOT NULL, -- 'track_approved', 'video_rejected', 'concert_moderation', 'new_follower', 'comment', 'like', 'system'
  
  -- Содержание
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  -- Связанные объекты
  related_track_id UUID REFERENCES tracks(id),
  related_video_id UUID REFERENCES videos(id),
  related_concert_id UUID REFERENCES concerts(id),
  related_news_id UUID REFERENCES news(id),
  related_user_id UUID REFERENCES users(id),
  
  -- Метаданные
  metadata JSONB,
  
  -- Статус
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 10. АНАЛИТИКА
-- =====================================================

-- События взаимодействия с контентом
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Пользователь (может быть NULL для анонимных)
  user_id UUID REFERENCES users(id),
  session_id UUID,
  
  -- Тип контента
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('track', 'video', 'concert', 'news')),
  content_id UUID NOT NULL,
  
  -- Тип события
  event_type VARCHAR(50) NOT NULL, -- 'view', 'play', 'like', 'share', 'comment', 'click', 'download'
  
  -- Метаданные
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  referrer TEXT,
  
  -- IP и геолокация
  ip_address INET,
  coordinates JSONB,
  
  -- Временная метка
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX idx_content_analytics_event_type ON content_analytics(event_type);
CREATE INDEX idx_content_analytics_created_at ON content_analytics(created_at DESC);
CREATE INDEX idx_content_analytics_user_id ON content_analytics(user_id);

-- Дневная агрегированная статистика
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  
  -- Общие метрики
  total_plays INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  
  -- По типам контента
  track_plays INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  concert_clicks INTEGER DEFAULT 0,
  news_views INTEGER DEFAULT 0,
  
  -- Доход
  revenue DECIMAL(15, 2) DEFAULT 0,
  
  -- Аудитория
  unique_visitors INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, stat_date)
);

CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(stat_date DESC);

-- =====================================================
-- 11. ПАРТНЕРЫ
-- =====================================================

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Адрес
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  
  -- Тип партнера
  partner_type VARCHAR(50), -- 'venue', 'label', 'distributor', 'promoter', 'media'
  
  -- Логотип и описание
  logo_url TEXT,
  description TEXT,
  website TEXT,
  
  -- Условия сотрудничества
  commission_rate DECIMAL(5, 2), -- Процент комиссии
  contract_details JSONB,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_status ON partners(status);

-- =====================================================
-- 12. СИСТЕМА KV (Key-Value Store)
-- =====================================================

CREATE TABLE kv_store_84730125 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kv_store_key_prefix ON kv_store_84730125(key text_pattern_ops);

-- =====================================================
-- 13. ТРИГГЕРЫ ДЛЯ АВТООБНОВЛЕНИЯ updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер ко всем таблицам
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_concerts_updated_at BEFORE UPDATE ON concerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON user_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_operations_updated_at BEFORE UPDATE ON payment_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kv_store_updated_at BEFORE UPDATE ON kv_store_84730125 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. ПРЕДСТАВЛЕНИЯ (VIEWS) ДЛЯ ДАШБОРДА
-- =====================================================

-- Статистика модерации для дашборда
CREATE OR REPLACE VIEW admin_moderation_stats AS
SELECT 
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tracks,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_tracks,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_tracks
FROM tracks
UNION ALL
SELECT 
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_videos,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_videos,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_videos
FROM videos
UNION ALL
SELECT 
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_concerts,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_concerts,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_concerts
FROM concerts
UNION ALL
SELECT 
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_news,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_news,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_news
FROM news;

-- Общая статистика платформы
CREATE OR REPLACE VIEW platform_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'artist') as total_artists,
  (SELECT COUNT(*) FROM users WHERE role = 'artist' AND last_login_at > NOW() - INTERVAL '30 days') as active_artists,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM tracks WHERE status = 'approved') as total_tracks,
  (SELECT COUNT(*) FROM videos WHERE status = 'approved') as total_videos,
  (SELECT COUNT(*) FROM concerts WHERE status = 'approved') as total_concerts,
  (SELECT COUNT(*) FROM news WHERE status = 'approved') as total_news,
  (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')) as open_tickets,
  (SELECT SUM(amount) FROM transactions WHERE type = 'income' AND status = 'completed' AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', NOW())) as monthly_revenue;

-- Топ артистов по просмотрам
CREATE OR REPLACE VIEW top_artists_by_views AS
SELECT 
  u.id,
  ap.display_name,
  ap.avatar_url,
  SUM(t.plays) + SUM(v.views) + SUM(c.views) + SUM(n.views) as total_views,
  ap.total_followers
FROM users u
LEFT JOIN artist_profiles ap ON u.id = ap.user_id
LEFT JOIN tracks t ON u.id = t.user_id AND t.status = 'approved'
LEFT JOIN videos v ON u.id = v.user_id AND v.status = 'approved'
LEFT JOIN concerts c ON u.id = c.user_id AND c.status = 'approved'
LEFT JOIN news n ON u.id = n.user_id AND n.status = 'approved'
WHERE u.role = 'artist'
GROUP BY u.id, ap.display_name, ap.avatar_url, ap.total_followers
ORDER BY total_views DESC
LIMIT 100;

-- =====================================================
-- 15. RLS (ROW LEVEL SECURITY) - ПОЛИТИКИ БЕЗОПАСНОСТИ
-- =====================================================

-- Включаем RLS для всех основных таблиц
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Политики для треков
CREATE POLICY "Users can view their own tracks" ON tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tracks" ON tracks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tracks" ON tracks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tracks" ON tracks FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update all tracks" ON tracks FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Политики для видео
CREATE POLICY "Users can view their own videos" ON videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own videos" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own videos" ON videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own videos" ON videos FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all videos" ON videos FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update all videos" ON videos FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Политики для концертов
CREATE POLICY "Users can view their own concerts" ON concerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own concerts" ON concerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own concerts" ON concerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own concerts" ON concerts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all concerts" ON concerts FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update all concerts" ON concerts FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Политики для новостей
CREATE POLICY "Users can view their own news" ON news FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own news" ON news FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own news" ON news FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own news" ON news FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all news" ON news FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update all news" ON news FOR UPDATE USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Политики для транзакций
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Политики для балансов
CREATE POLICY "Users can view their own balance" ON user_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all balances" ON user_balances FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =====================================================
-- 16. ДЕМО-ДАННЫЕ
-- =====================================================

-- Вставка демо-пользователей
INSERT INTO users (id, email, password_hash, role, email_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'artist@promo.music', '$2a$10$demo_hash_artist', 'artist', true),
  ('00000000-0000-0000-0000-000000000002', 'admin@promo.music', '$2a$10$demo_hash_admin', 'admin', true);

-- Профиль демо-артиста
INSERT INTO artist_profiles (user_id, display_name, artist_name, bio, genres) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Александр Иванов', 'Alex Sound', 'Музыкант и продюсер', ARRAY['Pop', 'Electronic']);

-- Профиль демо-админа
INSERT INTO admin_profiles (user_id, full_name, position) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Администратор Системы', 'super_admin');

-- Балансы
INSERT INTO user_balances (user_id, coins_balance, money_balance) VALUES
  ('00000000-0000-0000-0000-000000000001', 5000.00, 10000.00),
  ('00000000-0000-0000-0000-000000000002', 0.00, 0.00);

-- =====================================================
-- КОНЕЦ СХЕМЫ
-- =====================================================
