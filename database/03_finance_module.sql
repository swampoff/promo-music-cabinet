-- =====================================================
-- PROMO.MUSIC - FINANCE MODULE
-- Тарифы, платежи, транзакции, скидки, балансы
-- =====================================================

-- =====================================================
-- ТАБЛИЦА: subscription_plans
-- Тарифные планы
-- =====================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Основная информация
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  plan_type plan_type NOT NULL,
  
  -- Цены
  price_monthly DECIMAL(10,2) NOT NULL,
  price_quarterly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  price_lifetime DECIMAL(10,2),
  
  -- Скидки при долгосрочной подписке
  discount_quarterly_percent DECIMAL(5,2) DEFAULT 0.00,
  discount_yearly_percent DECIMAL(5,2) DEFAULT 0.00,
  
  -- Лимиты
  pitches_per_month INTEGER,
  pitches_per_year INTEGER,
  is_pitches_unlimited BOOLEAN DEFAULT FALSE,
  
  free_credits_monthly INTEGER DEFAULT 0,
  max_tracks INTEGER,
  max_playlists_per_pitch INTEGER DEFAULT 1,
  
  -- Функции
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Priority и поддержка
  has_priority_support BOOLEAN DEFAULT FALSE,
  has_express_pitching BOOLEAN DEFAULT FALSE,
  has_guaranteed_review BOOLEAN DEFAULT FALSE,
  has_analytics_advanced BOOLEAN DEFAULT FALSE,
  has_api_access BOOLEAN DEFAULT FALSE,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Порядок отображения
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_plans_type ON subscription_plans(plan_type);
CREATE INDEX idx_plans_active ON subscription_plans(is_active, is_visible);

COMMENT ON TABLE subscription_plans IS 'Тарифные планы подписок';

-- =====================================================
-- ТАБЛИЦА: user_subscriptions
-- Подписки пользователей
-- =====================================================
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  -- Период подписки
  billing_period billing_period NOT NULL,
  
  -- Цена (сохраняется на момент покупки)
  original_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  final_price DECIMAL(10,2) NOT NULL,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, suspended, trial
  is_trial BOOLEAN DEFAULT FALSE,
  
  -- Даты
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  
  -- Автопродление
  auto_renew BOOLEAN DEFAULT TRUE,
  
  -- Использование лимитов
  pitches_used_this_period INTEGER DEFAULT 0,
  pitches_limit INTEGER,
  
  -- Платежный метод
  payment_method_id UUID,
  last_payment_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_active ON user_subscriptions(user_id, status) 
  WHERE status = 'active';

COMMENT ON TABLE user_subscriptions IS 'Подписки пользователей на тарифные планы';

-- =====================================================
-- ТАБЛИЦА: transactions
-- Все финансовые транзакции
-- =====================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Тип и сумма
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Статус
  status transaction_status DEFAULT 'pending',
  
  -- Связанные объекты
  related_pitch_id UUID REFERENCES pitches(id),
  related_subscription_id UUID REFERENCES user_subscriptions(id),
  related_transaction_id UUID REFERENCES transactions(id), -- для refund
  
  -- Платежная система
  payment_method payment_method NOT NULL,
  payment_provider VARCHAR(50), -- stripe, paypal, etc.
  payment_provider_id VARCHAR(255),
  payment_provider_fee DECIMAL(10,2) DEFAULT 0.00,
  
  -- Комиссии
  platform_fee DECIMAL(10,2) DEFAULT 0.00,
  partner_commission DECIMAL(10,2) DEFAULT 0.00,
  net_amount DECIMAL(12,2),
  
  -- Описание
  description TEXT,
  receipt_url TEXT,
  invoice_url TEXT,
  
  -- Метаданные платежной системы
  payment_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Даты
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Причина ошибки/отказа
  failure_reason TEXT,
  failure_code VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_net_amount CHECK (net_amount IS NULL OR net_amount >= 0)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_pitch_id ON transactions(related_pitch_id);
CREATE INDEX idx_transactions_subscription_id ON transactions(related_subscription_id);
CREATE INDEX idx_transactions_provider ON transactions(payment_provider, payment_provider_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

COMMENT ON TABLE transactions IS 'Все финансовые транзакции в системе';

-- =====================================================
-- ТАБЛИЦА: payment_methods
-- Сохраненные платежные методы пользователей
-- =====================================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Тип метода
  method_type payment_method NOT NULL,
  
  -- Провайдер
  payment_provider VARCHAR(50) NOT NULL,
  provider_payment_method_id VARCHAR(255) NOT NULL,
  
  -- Карта (если применимо)
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_country VARCHAR(2),
  
  -- PayPal/другие
  email VARCHAR(255),
  account_name VARCHAR(255),
  
  -- Статус
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Даты
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_card_expiry CHECK (
    (card_exp_month IS NULL OR (card_exp_month >= 1 AND card_exp_month <= 12)) AND
    (card_exp_year IS NULL OR card_exp_year >= 2024)
  )
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) 
  WHERE is_default = TRUE;
CREATE INDEX idx_payment_methods_provider ON payment_methods(payment_provider, provider_payment_method_id);

COMMENT ON TABLE payment_methods IS 'Сохраненные платежные методы пользователей';

-- =====================================================
-- ТАБЛИЦА: invoices
-- Счета и инвойсы
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES user_subscriptions(id),
  
  -- Номер инвойса
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Суммы
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Статус
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled, refunded
  
  -- Даты
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- PDF
  pdf_url TEXT,
  
  -- Billing информация
  billing_name VARCHAR(255),
  billing_email VARCHAR(255),
  billing_address JSONB,
  
  -- Позиции (items)
  line_items JSONB DEFAULT '[]'::jsonb,
  
  -- Примечания
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

COMMENT ON TABLE invoices IS 'Счета и инвойсы для пользователей';

-- =====================================================
-- ТАБЛИЦА: discount_codes
-- Промокоды и скидки
-- =====================================================
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Код
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  description TEXT,
  
  -- Тип скидки
  discount_type discount_type NOT NULL,
  
  -- Значение скидки
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount_amount DECIMAL(10,2), -- макс. сумма для процентных
  
  -- Применимость
  applicable_to VARCHAR(50), -- all, subscription, pitch, credits
  applicable_plan_ids UUID[],
  
  -- Лимиты использования
  max_uses INTEGER, -- NULL = безлимит
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Минимальная сумма покупки
  min_purchase_amount DECIMAL(10,2) DEFAULT 0.00,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Даты
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Кто создал
  created_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_discount_value CHECK (discount_value > 0),
  CONSTRAINT valid_dates CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, valid_from, valid_until);
CREATE INDEX idx_discount_codes_type ON discount_codes(discount_type);

COMMENT ON TABLE discount_codes IS 'Промокоды и скидки';

-- =====================================================
-- ТАБЛИЦА: discount_usages
-- Использование промокодов
-- =====================================================
CREATE TABLE discount_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id),
  
  -- Применение
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discount_usages_code_id ON discount_usages(discount_code_id);
CREATE INDEX idx_discount_usages_user_id ON discount_usages(user_id);
CREATE INDEX idx_discount_usages_transaction_id ON discount_usages(transaction_id);

COMMENT ON TABLE discount_usages IS 'История использования промокодов';

-- =====================================================
-- ТАБЛИЦА: user_credits
-- История начислений и списаний кредитов
-- =====================================================
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Изменение
  amount INTEGER NOT NULL, -- может быть отрицательным
  balance_after INTEGER NOT NULL,
  
  -- Причина
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Связанные объекты
  related_transaction_id UUID REFERENCES transactions(id),
  related_pitch_id UUID REFERENCES pitches(id),
  
  -- Срок действия
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_balance CHECK (balance_after >= 0)
);

CREATE INDEX idx_user_credits_user_id ON user_credits(user_id, created_at DESC);
CREATE INDEX idx_user_credits_expiry ON user_credits(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE user_credits IS 'История начислений и списаний кредитов';

-- =====================================================
-- ТАБЛИЦА: payout_requests
-- Запросы на вывод средств (для кураторов/партнеров)
-- =====================================================
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Сумма
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Метод выплаты
  payout_method payment_method NOT NULL,
  payout_details JSONB NOT NULL, -- банк. данные, PayPal email, etc.
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, rejected, cancelled
  
  -- Обработка
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Транзакция
  transaction_id UUID REFERENCES transactions(id),
  
  -- Провайдер выплаты
  payout_provider VARCHAR(50),
  payout_provider_id VARCHAR(255),
  payout_fee DECIMAL(10,2) DEFAULT 0.00,
  net_payout DECIMAL(12,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_payout CHECK (amount > 0)
);

CREATE INDEX idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
CREATE INDEX idx_payout_requests_created_at ON payout_requests(created_at DESC);

COMMENT ON TABLE payout_requests IS 'Запросы на вывод средств';

-- =====================================================
-- ТАБЛИЦА: user_wallets
-- Кошельки пользователей для разных валют
-- =====================================================
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Валюта
  currency VARCHAR(3) NOT NULL,
  
  -- Балансы
  available_balance DECIMAL(12,2) DEFAULT 0.00,
  pending_balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Минимальная сумма для вывода
  min_payout_amount DECIMAL(10,2) DEFAULT 50.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, currency),
  CONSTRAINT positive_balances CHECK (
    available_balance >= 0 AND 
    pending_balance >= 0 AND 
    total_earned >= 0 AND 
    total_withdrawn >= 0
  )
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);

COMMENT ON TABLE user_wallets IS 'Кошельки пользователей для разных валют';
