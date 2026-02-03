/**
 * SUBSCRIPTION SYSTEM - СИСТЕМА ПОДПИСОК
 * Дата создания: 28 января 2026
 * 
 * Единая система подписок для всей экосистемы promo.music
 * с разными уровнями, лимитами, пробными периодами и автопродлением.
 * 
 * Уровни подписок:
 * - FREE (бесплатный)
 * - BASIC (базовый)
 * - START (стартовый)
 * - PRO (профессиональный)
 * - ЭЛИТ (максимальный)
 * 
 * Структура:
 * 1. subscription_plans - планы подписок
 * 2. user_subscriptions - активные подписки пользователей
 * 3. subscription_history - история подписок
 * 4. subscription_features - фичи и лимиты
 * 5. subscription_invoices - счета и платежи
 */

-- ============================================================================
-- 1. SUBSCRIPTION PLANS - ПЛАНЫ ПОДПИСОК
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  -- Identity
  id TEXT PRIMARY KEY,
  
  -- Plan info
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly INTEGER NOT NULL DEFAULT 0, -- рубли
  price_yearly INTEGER, -- годовая цена со скидкой
  currency TEXT DEFAULT 'RUB',
  
  -- Trial
  trial_days INTEGER DEFAULT 0,
  
  -- Features (JSON для гибкости)
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Лимиты
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Display
  highlight BOOLEAN DEFAULT FALSE, -- выделить как рекомендуемый
  color TEXT, -- цвет для UI
  badge TEXT, -- "Популярный", "Лучшее предложение"
  
  -- Availability
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE, -- показывать на странице тарифов
  
  -- Position
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_public ON subscription_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort ON subscription_plans(sort_order);

COMMENT ON TABLE subscription_plans IS 'Планы подписок с тарифами и лимитами';

-- Вставка стандартных планов
INSERT INTO subscription_plans (
  id, name, display_name, description, 
  price_monthly, price_yearly, 
  features, limits, 
  highlight, color, sort_order
) VALUES 
(
  'free',
  'FREE',
  'Бесплатный',
  'Базовые функции для начинающих артистов',
  0,
  0,
  '{
    "tracks_upload": true,
    "videos_upload": true,
    "basic_analytics": true,
    "community": true
  }'::jsonb,
  '{
    "max_tracks": 5,
    "max_videos": 2,
    "storage_gb": 1,
    "analytics_days": 7,
    "marketing_discount": 0,
    "pitching_discount": 0,
    "banner_discount": 0
  }'::jsonb,
  false,
  'gray',
  1
),
(
  'basic',
  'BASIC',
  'Базовый',
  'Для активных артистов с регулярным контентом',
  990,
  9900,
  '{
    "tracks_upload": true,
    "videos_upload": true,
    "advanced_analytics": true,
    "community": true,
    "email_support": true
  }'::jsonb,
  '{
    "max_tracks": 20,
    "max_videos": 10,
    "storage_gb": 10,
    "analytics_days": 30,
    "marketing_discount": 0,
    "pitching_discount": 0,
    "banner_discount": 0
  }'::jsonb,
  false,
  'blue',
  2
),
(
  'start',
  'START',
  'Стартовый',
  'Для растущих артистов с амбициями',
  2990,
  29900,
  '{
    "tracks_upload": true,
    "videos_upload": true,
    "full_analytics": true,
    "ai_insights": true,
    "priority_support": true,
    "marketing_tools": true,
    "discounts": true
  }'::jsonb,
  '{
    "max_tracks": 50,
    "max_videos": 25,
    "storage_gb": 50,
    "analytics_days": 90,
    "marketing_discount": 0.05,
    "pitching_discount": 0.05,
    "banner_discount": 0.05
  }'::jsonb,
  false,
  'purple',
  3
),
(
  'pro',
  'PRO',
  'Профессиональный',
  'Для профессиональных артистов и лейблов',
  5990,
  59900,
  '{
    "tracks_upload": true,
    "videos_upload": true,
    "unlimited_analytics": true,
    "ai_insights": true,
    "ai_recommendations": true,
    "priority_support": true,
    "marketing_tools": true,
    "advanced_promo": true,
    "api_access": true,
    "white_label": true,
    "discounts": true
  }'::jsonb,
  '{
    "max_tracks": 200,
    "max_videos": 100,
    "storage_gb": 200,
    "analytics_days": 365,
    "marketing_discount": 0.15,
    "pitching_discount": 0.15,
    "banner_discount": 0.15
  }'::jsonb,
  true,
  'gold',
  4
),
(
  'elite',
  'ЭЛИТ',
  'Элитный',
  'Максимальные возможности для звёзд',
  14990,
  149900,
  '{
    "everything": true,
    "dedicated_manager": true,
    "custom_features": true,
    "vip_support": true
  }'::jsonb,
  '{
    "max_tracks": -1,
    "max_videos": -1,
    "storage_gb": 1000,
    "analytics_days": -1,
    "marketing_discount": 0.25,
    "pitching_discount": 0.25,
    "banner_discount": 0.25,
    "coins_bonus": 10000
  }'::jsonb,
  false,
  'platinum',
  5
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. USER SUBSCRIPTIONS - АКТИВНЫЕ ПОДПИСКИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN (
      'trial',           -- Пробный период
      'active',          -- Активна
      'past_due',        -- Просрочена
      'cancelled',       -- Отменена (но ещё действует)
      'expired',         -- Истекла
      'paused'           -- Приостановлена
    )
  ),
  
  -- Billing
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (
    billing_period IN ('monthly', 'yearly')
  ),
  
  price_paid INTEGER NOT NULL, -- сколько заплатили
  currency TEXT DEFAULT 'RUB',
  
  -- Dates
  trial_start DATE,
  trial_end DATE,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  
  -- Renewal
  auto_renew BOOLEAN DEFAULT TRUE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment
  payment_method TEXT, -- 'card', 'coins', 'bank_transfer'
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_billing_date DATE,
  
  -- Usage tracking
  usage_stats JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_next_billing ON user_subscriptions(next_billing_date);

-- Unique: один активный план на пользователя
CREATE UNIQUE INDEX idx_user_active_subscription 
  ON user_subscriptions(user_id) 
  WHERE status IN ('trial', 'active');

COMMENT ON TABLE user_subscriptions IS 'Активные подписки пользователей';

-- ============================================================================
-- 3. SUBSCRIPTION HISTORY - ИСТОРИЯ ПОДПИСОК
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_history (
  -- Identity
  id BIGSERIAL PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Event
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'created',         -- Подписка создана
      'trial_started',   -- Пробный период начат
      'trial_ended',     -- Пробный период окончен
      'activated',       -- Активирована
      'renewed',         -- Продлена
      'upgraded',        -- Повышена
      'downgraded',      -- Понижена
      'cancelled',       -- Отменена
      'expired',         -- Истекла
      'payment_failed',  -- Платёж не прошёл
      'paused',          -- Приостановлена
      'resumed'          -- Возобновлена
    )
  ),
  
  -- Changes
  from_plan_id TEXT REFERENCES subscription_plans(id),
  to_plan_id TEXT REFERENCES subscription_plans(id),
  
  from_status TEXT,
  to_status TEXT,
  
  -- Details
  reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_event ON subscription_history(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created ON subscription_history(created_at DESC);

COMMENT ON TABLE subscription_history IS 'История изменений подписок';

-- ============================================================================
-- 4. SUBSCRIPTION FEATURES - ФИЧИ И ЛИМИТЫ
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_features (
  -- Identity
  id TEXT PRIMARY KEY,
  
  -- Feature
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'content', 'analytics', 'promotion', 'support'
  
  -- Type
  feature_type TEXT NOT NULL CHECK (
    feature_type IN (
      'boolean',    -- да/нет
      'limit',      -- числовой лимит
      'discount',   -- процент скидки
      'custom'      -- кастомное значение
    )
  ),
  
  -- Default values по планам (JSONB для гибкости)
  plan_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Display
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_features_category ON subscription_features(category);
CREATE INDEX IF NOT EXISTS idx_subscription_features_visible ON subscription_features(is_visible);

COMMENT ON TABLE subscription_features IS 'Определение фич и их значений по планам';

-- ============================================================================
-- 5. SUBSCRIPTION INVOICES - СЧЕТА И ПЛАТЕЖИ
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_invoices (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
  user_id TEXT NOT NULL,
  
  -- Invoice info
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  billing_period TEXT NOT NULL,
  
  -- Amount
  subtotal INTEGER NOT NULL, -- до скидок
  discount INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',       -- Черновик
      'open',        -- Открыт (ожидает оплаты)
      'paid',        -- Оплачен
      'failed',      -- Не оплачен
      'refunded',    -- Возвращён
      'cancelled'    -- Отменён
    )
  ),
  
  -- Payment
  payment_method TEXT,
  payment_intent_id TEXT, -- ID в платёжной системе
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Files
  pdf_url TEXT,
  receipt_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON subscription_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON subscription_invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON subscription_invoices(invoice_number);

COMMENT ON TABLE subscription_invoices IS 'Счета и платежи по подпискам';

-- ============================================================================
-- 6. ФУНКЦИИ - АВТОМАТИЗАЦИЯ
-- ============================================================================

-- Функция: Обновление updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры
DROP TRIGGER IF EXISTS trigger_subscription_plans_updated ON subscription_plans;
CREATE TRIGGER trigger_subscription_plans_updated
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

DROP TRIGGER IF EXISTS trigger_user_subscriptions_updated ON user_subscriptions;
CREATE TRIGGER trigger_user_subscriptions_updated
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

DROP TRIGGER IF EXISTS trigger_subscription_features_updated ON subscription_features;
CREATE TRIGGER trigger_subscription_features_updated
  BEFORE UPDATE ON subscription_features
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

DROP TRIGGER IF EXISTS trigger_invoices_updated ON subscription_invoices;
CREATE TRIGGER trigger_invoices_updated
  BEFORE UPDATE ON subscription_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Функция: Логирование изменений подписки
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- При создании
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_history (
      subscription_id, user_id, event_type,
      to_plan_id, to_status, reason
    ) VALUES (
      NEW.id, NEW.user_id, 'created',
      NEW.plan_id, NEW.status, 'Subscription created'
    );
    
  -- При изменении статуса или плана
  ELSIF TG_OP = 'UPDATE' THEN
    -- Смена плана
    IF OLD.plan_id IS DISTINCT FROM NEW.plan_id THEN
      INSERT INTO subscription_history (
        subscription_id, user_id, event_type,
        from_plan_id, to_plan_id, from_status, to_status
      ) VALUES (
        NEW.id, NEW.user_id,
        CASE 
          WHEN (SELECT price_monthly FROM subscription_plans WHERE id = NEW.plan_id) >
               (SELECT price_monthly FROM subscription_plans WHERE id = OLD.plan_id)
          THEN 'upgraded'
          ELSE 'downgraded'
        END,
        OLD.plan_id, NEW.plan_id, OLD.status, NEW.status
      );
    END IF;
    
    -- Смена статуса
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO subscription_history (
        subscription_id, user_id, event_type,
        from_status, to_status, to_plan_id
      ) VALUES (
        NEW.id, NEW.user_id,
        CASE NEW.status
          WHEN 'trial' THEN 'trial_started'
          WHEN 'active' THEN 'activated'
          WHEN 'cancelled' THEN 'cancelled'
          WHEN 'expired' THEN 'expired'
          WHEN 'paused' THEN 'paused'
          ELSE 'renewed'
        END,
        OLD.status, NEW.status, NEW.plan_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_subscription_change ON user_subscriptions;
CREATE TRIGGER trigger_log_subscription_change
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- Функция: Автоматическое истечение подписок
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE user_subscriptions
  SET status = 'expired',
      updated_at = NOW()
  WHERE status IN ('active', 'trial')
    AND current_period_end < CURRENT_DATE
    AND auto_renew = FALSE;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_subscriptions IS 'Автоматически истекает подписки без автопродления';

-- Функция: Проверка лимита
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_user_id TEXT,
  p_limit_name TEXT,
  p_current_value INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_plan_limits JSONB;
BEGIN
  -- Получаем лимиты активного плана пользователя
  SELECT sp.limits INTO v_plan_limits
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
    AND us.status IN ('trial', 'active')
  LIMIT 1;
  
  -- Если подписки нет, используем FREE план
  IF v_plan_limits IS NULL THEN
    SELECT limits INTO v_plan_limits
    FROM subscription_plans
    WHERE id = 'free';
  END IF;
  
  -- Получаем конкретный лимит
  v_limit := (v_plan_limits->>p_limit_name)::INTEGER;
  
  -- -1 означает безлимит
  IF v_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Проверяем лимит
  RETURN p_current_value < v_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_subscription_limit IS 'Проверяет, не превышен ли лимит подписки';

-- ============================================================================
-- 7. VIEWS - ПРЕДСТАВЛЕНИЯ
-- ============================================================================

-- View: Активные подписки с деталями плана
CREATE OR REPLACE VIEW user_subscriptions_detailed AS
SELECT 
  us.*,
  sp.name as plan_name,
  sp.display_name as plan_display_name,
  sp.features as plan_features,
  sp.limits as plan_limits,
  
  -- Статус подписки
  CASE 
    WHEN us.status = 'trial' AND us.trial_end < CURRENT_DATE THEN 'trial_expired'
    WHEN us.status = 'active' AND us.current_period_end < CURRENT_DATE THEN 'pending_renewal'
    ELSE us.status
  END as computed_status,
  
  -- Дней до окончания
  CASE 
    WHEN us.status = 'trial' THEN us.trial_end - CURRENT_DATE
    WHEN us.status = 'active' THEN us.current_period_end - CURRENT_DATE
    ELSE 0
  END as days_remaining
  
FROM user_subscriptions us
JOIN subscription_plans sp ON sp.id = us.plan_id;

COMMENT ON VIEW user_subscriptions_detailed IS 'Подписки с деталями планов и расчётными полями';

-- View: Статистика по планам
CREATE OR REPLACE VIEW subscription_plan_stats AS
SELECT 
  sp.id,
  sp.name,
  sp.display_name,
  sp.price_monthly,
  
  COUNT(us.id) FILTER (WHERE us.status IN ('trial', 'active')) as active_subscribers,
  COUNT(us.id) FILTER (WHERE us.status = 'trial') as trial_subscribers,
  
  SUM(CASE 
    WHEN us.status IN ('trial', 'active') AND us.billing_period = 'monthly' 
    THEN sp.price_monthly 
    WHEN us.status IN ('trial', 'active') AND us.billing_period = 'yearly' 
    THEN sp.price_yearly / 12
    ELSE 0 
  END) as monthly_revenue,
  
  AVG(EXTRACT(DAY FROM (us.current_period_end - us.current_period_start))) as avg_subscription_length
  
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON us.plan_id = sp.id
GROUP BY sp.id, sp.name, sp.display_name, sp.price_monthly;

COMMENT ON VIEW subscription_plan_stats IS 'Статистика по планам подписок';

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Пользователи видят только свои подписки
CREATE POLICY user_subscriptions_user_policy ON user_subscriptions
  FOR ALL USING (user_id = auth.uid()::TEXT);

CREATE POLICY subscription_history_user_policy ON subscription_history
  FOR SELECT USING (user_id = auth.uid()::TEXT);

CREATE POLICY subscription_invoices_user_policy ON subscription_invoices
  FOR SELECT USING (user_id = auth.uid()::TEXT);

-- Админы видят всё
CREATE POLICY user_subscriptions_admin_policy ON user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY subscription_history_admin_policy ON subscription_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY subscription_invoices_admin_policy ON subscription_invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Планы подписок доступны всем на чтение
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_plans_read_policy ON subscription_plans
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY subscription_plans_admin_policy ON subscription_plans
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
  RAISE NOTICE '✅ Subscription System created successfully';
  RAISE NOTICE '💳 Tables: 5 subscription tables';
  RAISE NOTICE '📊 Plans: 5 pre-configured plans (FREE, BASIC, START, PRO, ЭЛИТ)';
  RAISE NOTICE '⚡ Functions: 4 automation functions';
  RAISE NOTICE '📈 Views: 2 analytical views';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
