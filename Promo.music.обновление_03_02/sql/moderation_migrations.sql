-- ============================================================
-- PROMO.MUSIC MODERATION SYSTEM - SQL MIGRATIONS
-- Database: PostgreSQL 14+
-- Date: 2026-02-01
-- Version: 1.0.0
-- ============================================================

-- Подключаем расширения PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE 1: TRACKS (Треки)
-- ============================================================

CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  cover TEXT NOT NULL,
  genre VARCHAR(100) NOT NULL,
  duration VARCHAR(20) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tracks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_upload_date ON tracks(upload_date DESC);
CREATE INDEX idx_tracks_artist ON tracks(artist);

-- Trigger для updated_at
CREATE OR REPLACE FUNCTION update_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tracks_updated_at_trigger
BEFORE UPDATE ON tracks
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 2: VIDEOS (Видео)
-- ============================================================

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  thumbnail TEXT NOT NULL,
  video_file TEXT,
  video_url TEXT,
  video_source VARCHAR(10) CHECK (video_source IN ('file', 'link')),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  tags TEXT[],
  duration VARCHAR(20) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  moderation_note TEXT,
  rejection_reason TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 10000.00,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  genre VARCHAR(100),
  release_date DATE,
  creators JSONB,
  user_id VARCHAR(100) NOT NULL,
  user_role VARCHAR(20) DEFAULT 'artist' CHECK (user_role IN ('artist', 'label')),
  subscription_plan VARCHAR(30) CHECK (subscription_plan IN ('basic', 'artist_start', 'artist_pro', 'artist_elite')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_videos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_payment_status ON videos(payment_status);
CREATE INDEX idx_videos_subscription_plan ON videos(subscription_plan);
CREATE INDEX idx_videos_upload_date ON videos(upload_date DESC);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_tags ON videos USING GIN(tags);

-- Trigger
CREATE TRIGGER videos_updated_at_trigger
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 3: CONCERTS (Концерты)
-- ============================================================

CREATE TABLE concerts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  banner TEXT NOT NULL,
  ticket_price_from VARCHAR(50),
  ticket_price_to VARCHAR(50),
  ticket_link TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_concerts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_concerts_status ON concerts(status);
CREATE INDEX idx_concerts_date ON concerts(date DESC);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_user_id ON concerts(user_id);
CREATE INDEX idx_concerts_type ON concerts(type);

-- Trigger
CREATE TRIGGER concerts_updated_at_trigger
BEFORE UPDATE ON concerts
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 4: NEWS (Новости)
-- ============================================================

CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  publish_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_news_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_publish_date ON news(publish_date DESC);
CREATE INDEX idx_news_user_id ON news(user_id);
CREATE INDEX idx_news_date ON news(date DESC);

-- Trigger
CREATE TRIGGER news_updated_at_trigger
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 5: BANNERS (Баннеры)
-- ============================================================

CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  image TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('header', 'sidebar', 'popup', 'footer')),
  position VARCHAR(20) NOT NULL CHECK (position IN ('home', 'catalog', 'artist', 'all')),
  link TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 15000.00,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_banners_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT check_dates CHECK (end_date > start_date)
);

-- Индексы
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_type ON banners(type);
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_start_date ON banners(start_date);
CREATE INDEX idx_banners_user_id ON banners(user_id);

-- Trigger
CREATE TRIGGER banners_updated_at_trigger
BEFORE UPDATE ON banners
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 6: PITCHINGS (Питчинг)
-- ============================================================

CREATE TABLE pitchings (
  id SERIAL PRIMARY KEY,
  track_title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  track_cover TEXT NOT NULL,
  playlist_type VARCHAR(20) NOT NULL CHECK (playlist_type IN ('editorial', 'curator', 'algorithmic')),
  playlist_name VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  mood VARCHAR(100),
  target_audience TEXT,
  description TEXT NOT NULL,
  spotify_link TEXT,
  apple_music_link TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  expected_reach INTEGER DEFAULT 0,
  actual_reach INTEGER DEFAULT 0,
  playlists INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 20000.00,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pitchings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_pitchings_status ON pitchings(status);
CREATE INDEX idx_pitchings_playlist_type ON pitchings(playlist_type);
CREATE INDEX idx_pitchings_genre ON pitchings(genre);
CREATE INDEX idx_pitchings_user_id ON pitchings(user_id);

-- Trigger
CREATE TRIGGER pitchings_updated_at_trigger
BEFORE UPDATE ON pitchings
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 7: MARKETING (Маркетинг)
-- ============================================================

CREATE TABLE marketing (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  campaign_type VARCHAR(20) NOT NULL CHECK (campaign_type IN ('smm', 'email', 'influencer', 'pr', 'ads', 'content')),
  platform VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  budget DECIMAL(12,2) NOT NULL,
  duration INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'completed')),
  rejection_reason TEXT,
  expected_reach INTEGER DEFAULT 0,
  actual_reach INTEGER DEFAULT 0,
  engagement DECIMAL(5,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  creatives TEXT[],
  landing_url TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 25000.00,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_marketing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT check_marketing_dates CHECK (end_date > start_date)
);

-- Индексы
CREATE INDEX idx_marketing_status ON marketing(status);
CREATE INDEX idx_marketing_campaign_type ON marketing(campaign_type);
CREATE INDEX idx_marketing_start_date ON marketing(start_date);
CREATE INDEX idx_marketing_user_id ON marketing(user_id);

-- Trigger
CREATE TRIGGER marketing_updated_at_trigger
BEFORE UPDATE ON marketing
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 8: PRODUCTION_360 (Полный цикл)
-- ============================================================

CREATE TABLE production_360 (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('artist', 'label')),
  subscription_plan VARCHAR(30) NOT NULL CHECK (subscription_plan IN ('basic', 'artist_start', 'artist_pro', 'artist_elite')),
  genre VARCHAR(100) NOT NULL,
  project_description TEXT NOT NULL,
  project_goals TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  services JSONB NOT NULL,
  references TEXT[],
  existing_material TEXT,
  base_price DECIMAL(10,2) DEFAULT 50000.00,
  discount DECIMAL(5,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  estimated_full_price DECIMAL(12,2),
  is_paid BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  status VARCHAR(30) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'pending_review', 'approved', 'rejected', 'in_progress', 'completed')),
  rejection_reason TEXT,
  moderation_note TEXT,
  progress JSONB,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_date TIMESTAMP,
  completed_date TIMESTAMP,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_production_360_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_production_360_status ON production_360(status);
CREATE INDEX idx_production_360_subscription_plan ON production_360(subscription_plan);
CREATE INDEX idx_production_360_user_id ON production_360(user_id);
CREATE INDEX idx_production_360_payment_status ON production_360(payment_status);

-- Trigger
CREATE TRIGGER production_360_updated_at_trigger
BEFORE UPDATE ON production_360
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- TABLE 9: PROMO_LAB (Собственный лейбл)
-- ============================================================

CREATE TABLE promo_lab (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  genre VARCHAR(100) NOT NULL,
  project_description TEXT NOT NULL,
  motivation TEXT NOT NULL,
  portfolio JSONB NOT NULL,
  demo_tracks TEXT[],
  video_links TEXT[],
  press_kit TEXT,
  experience TEXT NOT NULL,
  achievements TEXT[],
  collaborations TEXT[],
  goals TEXT NOT NULL,
  expected_support TEXT[],
  status VARCHAR(30) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'in_progress', 'completed')),
  rejection_reason TEXT,
  moderation_note TEXT,
  progress JSONB,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_date TIMESTAMP,
  approved_date TIMESTAMP,
  completed_date TIMESTAMP,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_promo_lab_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_promo_lab_status ON promo_lab(status);
CREATE INDEX idx_promo_lab_genre ON promo_lab(genre);
CREATE INDEX idx_promo_lab_user_id ON promo_lab(user_id);
CREATE INDEX idx_promo_lab_submitted_date ON promo_lab(submitted_date DESC);

-- Trigger
CREATE TRIGGER promo_lab_updated_at_trigger
BEFORE UPDATE ON promo_lab
FOR EACH ROW
EXECUTE FUNCTION update_tracks_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) для Supabase
-- ============================================================

-- Включаем RLS для всех таблиц
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitchings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_360 ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_lab ENABLE ROW LEVEL SECURITY;

-- Политика: Артисты видят только свой контент
CREATE POLICY "Users can view own content" ON tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON concerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON news
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON banners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON pitchings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON marketing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON production_360
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content" ON promo_lab
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: Админы видят всё
CREATE POLICY "Admins can view all" ON tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON concerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON news
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON banners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON pitchings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON marketing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON production_360
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all" ON promo_lab
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================
-- VIEWS для аналитики
-- ============================================================

-- Статистика модерации
CREATE OR REPLACE VIEW moderation_stats AS
SELECT 
  'tracks' AS content_type,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
  COUNT(*) AS total
FROM tracks
UNION ALL
SELECT 
  'videos',
  COUNT(*) FILTER (WHERE status = 'pending'),
  COUNT(*) FILTER (WHERE status = 'approved'),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM videos
UNION ALL
SELECT 
  'concerts',
  COUNT(*) FILTER (WHERE status = 'pending'),
  COUNT(*) FILTER (WHERE status = 'approved'),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM concerts
UNION ALL
SELECT 
  'news',
  COUNT(*) FILTER (WHERE status = 'pending'),
  COUNT(*) FILTER (WHERE status = 'approved'),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM news
UNION ALL
SELECT 
  'banners',
  COUNT(*) FILTER (WHERE status = 'pending'),
  COUNT(*) FILTER (WHERE status = 'approved'),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM banners
UNION ALL
SELECT 
  'pitchings',
  COUNT(*) FILTER (WHERE status = 'pending'),
  COUNT(*) FILTER (WHERE status = 'approved'),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM pitchings
UNION ALL
SELECT 
  'marketing',
  COUNT(*) FILTER (WHERE status = 'pending'),
  COUNT(*) FILTER (WHERE status = 'approved'),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM marketing
UNION ALL
SELECT 
  'production_360',
  COUNT(*) FILTER (WHERE status IN ('pending_payment', 'pending_review')),
  COUNT(*) FILTER (WHERE status IN ('approved', 'in_progress')),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM production_360
UNION ALL
SELECT 
  'promo_lab',
  COUNT(*) FILTER (WHERE status = 'pending_review'),
  COUNT(*) FILTER (WHERE status IN ('approved', 'in_progress', 'completed')),
  COUNT(*) FILTER (WHERE status = 'rejected'),
  COUNT(*)
FROM promo_lab;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Процедура для автоматического списания баланса при переходе в pending
CREATE OR REPLACE FUNCTION deduct_balance_on_pending()
RETURNS TRIGGER AS $$
DECLARE
  content_price DECIMAL(10,2);
  user_balance DECIMAL(10,2);
BEGIN
  -- Проверяем переход в статус pending
  IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
    -- Получаем баланс пользователя
    SELECT balance INTO user_balance FROM users WHERE id = NEW.user_id;
    
    -- Получаем цену контента
    content_price := NEW.price;
    
    -- Проверяем достаточность средств
    IF user_balance < content_price THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Списываем средства
    UPDATE users SET balance = balance - content_price WHERE id = NEW.user_id;
    
    -- Создаём транзакцию
    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (NEW.user_id, 'expense', content_price, 'Оплата за контент', 'completed');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер к таблицам с ценой
CREATE TRIGGER deduct_balance_videos
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION deduct_balance_on_pending();

CREATE TRIGGER deduct_balance_banners
BEFORE UPDATE ON banners
FOR EACH ROW
EXECUTE FUNCTION deduct_balance_on_pending();

CREATE TRIGGER deduct_balance_pitchings
BEFORE UPDATE ON pitchings
FOR EACH ROW
EXECUTE FUNCTION deduct_balance_on_pending();

CREATE TRIGGER deduct_balance_marketing
BEFORE UPDATE ON marketing
FOR EACH ROW
EXECUTE FUNCTION deduct_balance_on_pending();

-- ============================================================
-- ФИНАЛИЗАЦИЯ
-- ============================================================

-- Комментарии к таблицам
COMMENT ON TABLE tracks IS 'Треки артистов - базовая цена ₽5,000';
COMMENT ON TABLE videos IS 'Видео контент - базовая цена ₽10,000 со скидками';
COMMENT ON TABLE concerts IS 'Концерты и мероприятия - базовая цена ₽5,000 со скидками';
COMMENT ON TABLE news IS 'Новости артистов - базовая цена ₽3,000 со скидками';
COMMENT ON TABLE banners IS 'Рекламные баннеры - базовая цена ₽15,000 со скидками';
COMMENT ON TABLE pitchings IS 'Питчинг в плейлисты - базовая цена ₽20,000 со скидками';
COMMENT ON TABLE marketing IS 'Маркетинговые кампании - базовая цена ₽25,000 со скидками';
COMMENT ON TABLE production_360 IS 'Полный цикл производства - базовая цена ₽50,000 со скидками';
COMMENT ON TABLE promo_lab IS 'Собственный лейбл PROMO.FM - БЕСПЛАТНО';

-- Успешное завершение
SELECT 'MODERATION SYSTEM MIGRATION COMPLETED SUCCESSFULLY! ✅' AS status;
