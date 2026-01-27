/**
 * BANNER ADS TABLES - БАННЕРНАЯ РЕКЛАМА
 * Дата создания: 27 января 2026
 * 
 * Структура:
 * 1. banner_ads - основная таблица баннерных кампаний
 * 2. banner_events - события баннеров (показы, клики)
 * 3. banner_analytics_daily - дневная аналитика
 */

-- ============================================================================
-- 1. BANNER ADS - БАННЕРНЫЕ КАМПАНИИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS banner_ads (
  -- Identity
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Campaign info
  campaign_name TEXT NOT NULL,
  banner_type TEXT NOT NULL CHECK (banner_type IN ('top_banner', 'sidebar_large', 'sidebar_small')),
  dimensions TEXT NOT NULL, -- '1920x400', '300x600', '300x250'
  
  -- Media
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  
  -- Pricing
  price INTEGER NOT NULL, -- В рублях
  duration_days INTEGER NOT NULL CHECK (duration_days >= 1 AND duration_days <= 90),
  
  -- Schedule
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending_moderation' CHECK (
    status IN (
      'pending_moderation',  -- На модерации
      'payment_pending',     -- Ожидает оплаты
      'approved',            -- Одобрено
      'active',              -- Активно
      'expired',             -- Завершено
      'rejected',            -- Отклонено
      'cancelled'            -- Отменено
    )
  ),
  
  -- Moderation
  rejection_reason TEXT,
  admin_notes TEXT,
  moderated_by TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics (real-time counters)
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_banner_ads_user_id ON banner_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_ads_status ON banner_ads(status);
CREATE INDEX IF NOT EXISTS idx_banner_ads_dates ON banner_ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banner_ads_created ON banner_ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_ads_type ON banner_ads(banner_type);

-- Комментарии
COMMENT ON TABLE banner_ads IS 'Баннерные рекламные кампании';
COMMENT ON COLUMN banner_ads.banner_type IS 'Тип баннера: top_banner (1920×400), sidebar_large (300×600), sidebar_small (300×250)';
COMMENT ON COLUMN banner_ads.status IS 'Статус баннера в жизненном цикле';
COMMENT ON COLUMN banner_ads.views IS 'Счётчик показов (real-time)';
COMMENT ON COLUMN banner_ads.clicks IS 'Счётчик кликов (real-time)';

-- ============================================================================
-- 2. BANNER EVENTS - СОБЫТИЯ БАННЕРОВ
-- ============================================================================

CREATE TABLE IF NOT EXISTS banner_events (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  banner_id TEXT NOT NULL REFERENCES banner_ads(id) ON DELETE CASCADE,
  
  -- Event info
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  
  -- Context
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  session_id TEXT,
  
  -- Location (optional)
  country TEXT,
  city TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для аналитики
CREATE INDEX IF NOT EXISTS idx_banner_events_banner_id ON banner_events(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_events_type ON banner_events(event_type);
CREATE INDEX IF NOT EXISTS idx_banner_events_created ON banner_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_events_session ON banner_events(session_id);

-- Комментарии
COMMENT ON TABLE banner_events IS 'События баннеров (показы и клики) для детальной аналитики';
COMMENT ON COLUMN banner_events.event_type IS 'Тип события: view (показ) или click (клик)';

-- ============================================================================
-- 3. BANNER ANALYTICS DAILY - ДНЕВНАЯ АНАЛИТИКА
-- ============================================================================

CREATE TABLE IF NOT EXISTS banner_analytics_daily (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  banner_id TEXT NOT NULL REFERENCES banner_ads(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  
  -- Derived metrics
  ctr DECIMAL(5, 2), -- Click-through rate (%)
  cost_per_click DECIMAL(10, 2), -- Стоимость клика
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(banner_id, date)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner_id ON banner_analytics_daily(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_date ON banner_analytics_daily(date DESC);

-- Комментарии
COMMENT ON TABLE banner_analytics_daily IS 'Агрегированная дневная статистика баннеров';
COMMENT ON COLUMN banner_analytics_daily.ctr IS 'Click-through rate = (clicks / views) * 100';
COMMENT ON COLUMN banner_analytics_daily.cost_per_click IS 'Стоимость одного клика';

-- ============================================================================
-- 4. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at при изменении записи
CREATE OR REPLACE FUNCTION update_banner_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_banner_ads_updated_at ON banner_ads;
CREATE TRIGGER trigger_update_banner_ads_updated_at
  BEFORE UPDATE ON banner_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_banner_ads_updated_at();

-- Функция: Автоматическое истечение баннеров
CREATE OR REPLACE FUNCTION expire_banner_ads()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Обновляем статус активных баннеров, у которых истёк срок
  UPDATE banner_ads
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_banner_ads IS 'Автоматически переводит активные баннеры в статус expired при истечении срока';

-- Функция: Расчёт CTR для дневной аналитики
CREATE OR REPLACE FUNCTION calculate_banner_ctr()
RETURNS TRIGGER AS $$
BEGIN
  -- Рассчитываем CTR автоматически
  IF NEW.views > 0 THEN
    NEW.ctr = (NEW.clicks::DECIMAL / NEW.views::DECIMAL) * 100;
  ELSE
    NEW.ctr = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического расчёта CTR
DROP TRIGGER IF EXISTS trigger_calculate_banner_ctr ON banner_analytics_daily;
CREATE TRIGGER trigger_calculate_banner_ctr
  BEFORE INSERT OR UPDATE ON banner_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION calculate_banner_ctr();

-- ============================================================================
-- 5. VIEWS - ПРЕДСТАВЛЕНИЯ ДЛЯ АНАЛИТИКИ
-- ============================================================================

-- View: Статистика баннеров с рассчитанными метриками
CREATE OR REPLACE VIEW banner_ads_with_stats AS
SELECT 
  ba.*,
  -- Рассчитанные метрики
  CASE 
    WHEN ba.views > 0 THEN ROUND((ba.clicks::DECIMAL / ba.views::DECIMAL) * 100, 2)
    ELSE 0
  END as ctr,
  CASE 
    WHEN ba.clicks > 0 THEN ROUND(ba.price::DECIMAL / ba.clicks::DECIMAL, 2)
    ELSE 0
  END as cost_per_click,
  ROUND(ba.price::DECIMAL / ba.duration_days::DECIMAL, 2) as cost_per_day,
  
  -- Статус дат
  CASE 
    WHEN ba.status = 'active' AND ba.end_date > NOW() THEN 
      EXTRACT(DAY FROM (ba.end_date - NOW()))
    ELSE 0
  END as days_remaining,
  
  CASE 
    WHEN ba.status = 'active' THEN
      EXTRACT(DAY FROM (NOW() - ba.start_date))
    ELSE 0
  END as days_running

FROM banner_ads ba;

COMMENT ON VIEW banner_ads_with_stats IS 'Баннеры с рассчитанными метриками (CTR, CPC, etc)';

-- View: Топ баннеры по эффективности
CREATE OR REPLACE VIEW banner_ads_top_performers AS
SELECT 
  ba.id,
  ba.user_id,
  ba.campaign_name,
  ba.banner_type,
  ba.status,
  ba.views,
  ba.clicks,
  CASE 
    WHEN ba.views > 0 THEN ROUND((ba.clicks::DECIMAL / ba.views::DECIMAL) * 100, 2)
    ELSE 0
  END as ctr,
  CASE 
    WHEN ba.clicks > 0 THEN ROUND(ba.price::DECIMAL / ba.clicks::DECIMAL, 2)
    ELSE 0
  END as cost_per_click,
  ba.created_at
FROM banner_ads ba
WHERE ba.status IN ('active', 'expired')
  AND ba.views > 100 -- Минимум 100 показов для статистики
ORDER BY 
  CASE 
    WHEN ba.views > 0 THEN (ba.clicks::DECIMAL / ba.views::DECIMAL)
    ELSE 0
  END DESC;

COMMENT ON VIEW banner_ads_top_performers IS 'Топ баннеров по CTR (минимум 100 показов)';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Включаем RLS
ALTER TABLE banner_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователь видит только свои баннеры
CREATE POLICY banner_ads_user_select ON banner_ads
  FOR SELECT
  USING (user_id = auth.uid()::TEXT);

-- Политика: Пользователь может создавать свои баннеры
CREATE POLICY banner_ads_user_insert ON banner_ads
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Политика: Пользователь может обновлять свои баннеры (но не статус)
CREATE POLICY banner_ads_user_update ON banner_ads
  FOR UPDATE
  USING (user_id = auth.uid()::TEXT)
  WITH CHECK (
    user_id = auth.uid()::TEXT 
    AND status = OLD.status -- Нельзя менять статус
  );

-- Политика: Админы видят все баннеры
CREATE POLICY banner_ads_admin_all ON banner_ads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Политика: События баннеров - только владелец
CREATE POLICY banner_events_user_select ON banner_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM banner_ads
      WHERE banner_ads.id = banner_events.banner_id
      AND banner_ads.user_id = auth.uid()::TEXT
    )
  );

-- Политика: Аналитика - только владелец
CREATE POLICY banner_analytics_user_select ON banner_analytics_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM banner_ads
      WHERE banner_ads.id = banner_analytics_daily.banner_id
      AND banner_ads.user_id = auth.uid()::TEXT
    )
  );

-- ============================================================================
-- 7. НАЧАЛЬНЫЕ ДАННЫЕ (для тестирования)
-- ============================================================================

-- Примечание: В production эти данные не нужны
-- Раскомментируйте для локального тестирования

/*
INSERT INTO banner_ads (
  id, user_id, user_email, campaign_name, banner_type, dimensions,
  image_url, target_url, price, duration_days, status, views, clicks
) VALUES
  (
    'banner_demo_001',
    'artist_demo_001',
    'artist@promo.fm',
    'Новый альбом "Звёздная пыль"',
    'top_banner',
    '1920x400',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=400&fit=crop',
    '/artist/profile',
    210000,
    14,
    'active',
    145230,
    3254
  )
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================================

-- Успешное завершение
DO $$
BEGIN
  RAISE NOTICE '✅ Banner Ads tables created successfully';
  RAISE NOTICE '📊 Tables: banner_ads, banner_events, banner_analytics_daily';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Triggers and functions ready';
END $$;
