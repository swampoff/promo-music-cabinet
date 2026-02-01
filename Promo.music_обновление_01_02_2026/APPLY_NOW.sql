-- ============================================
-- PROMO.MUSIC - ПОЛНАЯ SQL МИГРАЦИЯ
-- Скопируйте ВСЁ и вставьте в Supabase SQL Editor
-- ============================================

-- Включаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ТАБЛИЦА: artists
-- ============================================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  phone TEXT,
  instagram TEXT,
  twitter TEXT,
  facebook TEXT,
  youtube TEXT,
  spotify TEXT,
  apple_music TEXT,
  coins_balance INTEGER DEFAULT 0 NOT NULL,
  total_coins_spent INTEGER DEFAULT 0 NOT NULL,
  total_coins_earned INTEGER DEFAULT 0 NOT NULL,
  total_plays INTEGER DEFAULT 0 NOT NULL,
  total_followers INTEGER DEFAULT 0 NOT NULL,
  total_concerts INTEGER DEFAULT 0 NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_username ON artists(username);
CREATE INDEX IF NOT EXISTS idx_artists_created_at ON artists(created_at DESC);

-- ============================================
-- ТАБЛИЦА: concerts
-- ============================================
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_type TEXT NOT NULL,
  banner_image_url TEXT,
  ticket_price_min DECIMAL(10, 2),
  ticket_price_max DECIMAL(10, 2),
  ticket_link TEXT,
  ticket_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'draft' NOT NULL CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  moderation_comment TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES artists(id),
  is_promoted BOOLEAN DEFAULT false,
  promotion_starts_at TIMESTAMPTZ,
  promotion_ends_at TIMESTAMPTZ,
  promotion_cost INTEGER,
  is_hidden BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0 NOT NULL,
  clicks_count INTEGER DEFAULT 0 NOT NULL,
  shares_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_promotion_dates CHECK ((is_promoted = false) OR (promotion_starts_at IS NOT NULL AND promotion_ends_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_concerts_artist_id ON concerts(artist_id);
CREATE INDEX IF NOT EXISTS idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_concerts_city ON concerts(city);
CREATE INDEX IF NOT EXISTS idx_concerts_moderation_status ON concerts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_concerts_created_at ON concerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_concerts_views ON concerts(views_count DESC);

-- ============================================
-- ТАБЛИЦА: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder', 'announcement', 'ticket_update', 'promotion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push', 'both')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_concert_id ON notifications(concert_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- ============================================
-- ТАБЛИЦА: notification_settings
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true NOT NULL,
  push_enabled BOOLEAN DEFAULT true NOT NULL,
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 3, 1] NOT NULL,
  announcements_enabled BOOLEAN DEFAULT true NOT NULL,
  promotions_enabled BOOLEAN DEFAULT true NOT NULL,
  ticket_updates_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ТАБЛИЦА: email_campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  recipient_count INTEGER DEFAULT 0 NOT NULL,
  recipient_filter JSONB,
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivery_started_at TIMESTAMPTZ,
  delivery_completed_at TIMESTAMPTZ,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_complained INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 4),
  click_rate DECIMAL(5, 4),
  bounce_rate DECIMAL(5, 4),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON email_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_for ON email_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON email_campaigns(created_at DESC);

-- ============================================
-- ТАБЛИЦА: ticket_providers
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  api_endpoint TEXT,
  commission_rate DECIMAL(5, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Добавляем провайдеров билетов
INSERT INTO ticket_providers (id, name, logo_url, commission_rate) VALUES
  ('kassir', 'Кассир.ру', 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=100', 5.00),
  ('ticketland', 'Ticketland.ru', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100', 7.00),
  ('afisha', 'Яндекс Афиша', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100', 8.00),
  ('ticketmaster', 'TicketMaster', 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=100', 10.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ТАБЛИЦА: artist_ticket_providers
-- ============================================
CREATE TABLE IF NOT EXISTS artist_ticket_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL REFERENCES ticket_providers(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sync_at TIMESTAMPTZ,
  UNIQUE(artist_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_artist_providers_artist_id ON artist_ticket_providers(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_providers_provider_id ON artist_ticket_providers(provider_id);

-- ============================================
-- ТАБЛИЦА: ticket_sales
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  provider_id TEXT REFERENCES ticket_providers(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  buyer_email TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  status TEXT DEFAULT 'confirmed' NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  external_transaction_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_concert_id ON ticket_sales(concert_id);
CREATE INDEX IF NOT EXISTS idx_sales_artist_id ON ticket_sales(artist_id);
CREATE INDEX IF NOT EXISTS idx_sales_provider_id ON ticket_sales(provider_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON ticket_sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_purchased_at ON ticket_sales(purchased_at DESC);

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_concerts_updated_at ON concerts;
CREATE TRIGGER update_concerts_updated_at BEFORE UPDATE ON concerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ticket_sales_updated_at ON ticket_sales;
CREATE TRIGGER update_ticket_sales_updated_at BEFORE UPDATE ON ticket_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функции для аналитики
CREATE OR REPLACE FUNCTION increment_concert_views(concert_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE concerts SET views_count = views_count + 1 WHERE id = concert_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_concert_clicks(concert_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE concerts SET clicks_count = clicks_count + 1 WHERE id = concert_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_campaign_metrics(campaign_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    open_rate = CASE WHEN emails_delivered > 0 THEN (emails_opened::DECIMAL / emails_delivered) ELSE 0 END,
    click_rate = CASE WHEN emails_delivered > 0 THEN (emails_clicked::DECIMAL / emails_delivered) ELSE 0 END,
    bounce_rate = CASE WHEN emails_sent > 0 THEN (emails_bounced::DECIMAL / emails_sent) ELSE 0 END
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Включаем RLS на всех таблицах
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_ticket_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;

-- RLS политики для artists
DROP POLICY IF EXISTS "Artists can view own profile" ON artists;
CREATE POLICY "Artists can view own profile" ON artists FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Artists can update own profile" ON artists;
CREATE POLICY "Artists can update own profile" ON artists FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Artists can insert own profile" ON artists;
CREATE POLICY "Artists can insert own profile" ON artists FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Public can view verified artists" ON artists;
CREATE POLICY "Public can view verified artists" ON artists FOR SELECT USING (is_verified = true AND is_active = true);

-- RLS политики для concerts
DROP POLICY IF EXISTS "Artists can view own concerts" ON concerts;
CREATE POLICY "Artists can view own concerts" ON concerts FOR SELECT USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create concerts" ON concerts;
CREATE POLICY "Artists can create concerts" ON concerts FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own concerts" ON concerts;
CREATE POLICY "Artists can update own concerts" ON concerts FOR UPDATE USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own concerts" ON concerts;
CREATE POLICY "Artists can delete own concerts" ON concerts FOR DELETE USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view approved concerts" ON concerts;
CREATE POLICY "Public can view approved concerts" ON concerts FOR SELECT USING (moderation_status = 'approved' AND is_hidden = false AND is_cancelled = false);

-- RLS политики для notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (user_id::text = auth.uid()::text);

-- RLS политики для notification_settings
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
CREATE POLICY "Users can view own notification settings" ON notification_settings FOR SELECT USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;
CREATE POLICY "Users can update own notification settings" ON notification_settings FOR UPDATE USING (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
CREATE POLICY "Users can insert own notification settings" ON notification_settings FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- RLS политики для email_campaigns
DROP POLICY IF EXISTS "Artists can view own campaigns" ON email_campaigns;
CREATE POLICY "Artists can view own campaigns" ON email_campaigns FOR SELECT USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create campaigns" ON email_campaigns;
CREATE POLICY "Artists can create campaigns" ON email_campaigns FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own campaigns" ON email_campaigns;
CREATE POLICY "Artists can update own campaigns" ON email_campaigns FOR UPDATE USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own campaigns" ON email_campaigns;
CREATE POLICY "Artists can delete own campaigns" ON email_campaigns FOR DELETE USING (artist_id::text = auth.uid()::text);

-- RLS политики для ticket_providers
DROP POLICY IF EXISTS "Everyone can view active providers" ON ticket_providers;
CREATE POLICY "Everyone can view active providers" ON ticket_providers FOR SELECT USING (is_active = true);

-- RLS политики для artist_ticket_providers
DROP POLICY IF EXISTS "Artists can view own provider connections" ON artist_ticket_providers;
CREATE POLICY "Artists can view own provider connections" ON artist_ticket_providers FOR SELECT USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create provider connections" ON artist_ticket_providers;
CREATE POLICY "Artists can create provider connections" ON artist_ticket_providers FOR INSERT WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own provider connections" ON artist_ticket_providers;
CREATE POLICY "Artists can update own provider connections" ON artist_ticket_providers FOR UPDATE USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can delete own provider connections" ON artist_ticket_providers;
CREATE POLICY "Artists can delete own provider connections" ON artist_ticket_providers FOR DELETE USING (artist_id::text = auth.uid()::text);

-- RLS политики для ticket_sales
DROP POLICY IF EXISTS "Artists can view own concert sales" ON ticket_sales;
CREATE POLICY "Artists can view own concert sales" ON ticket_sales FOR SELECT USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can update own sales" ON ticket_sales;
CREATE POLICY "Artists can update own sales" ON ticket_sales FOR UPDATE USING (artist_id::text = auth.uid()::text);

-- Helper функции для RLS
CREATE OR REPLACE FUNCTION is_artist_owner(artist_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN artist_uuid::text = auth.uid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_concert_owner(concert_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM concerts WHERE id = concert_uuid AND artist_id::text = auth.uid()::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Права доступа
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- 8 таблиц созданы
-- 20+ RLS политик установлены
-- 4 функции созданы
-- 6 триггеров настроены
-- 20+ индексов созданы
-- 4 билетных провайдера добавлены
-- ============================================
