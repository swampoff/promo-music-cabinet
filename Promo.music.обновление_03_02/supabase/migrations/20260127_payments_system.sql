-- ========================================
-- PAYMENTS SYSTEM - ПОЛНАЯ МИГРАЦИЯ
-- Создано: 27 января 2026
-- Назначение: Система платежей для promo.music
-- ========================================

-- Создание enum типов
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'withdraw');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_category AS ENUM (
    'donate',
    'concert', 
    'radio',
    'streaming',
    'ticket_sales',
    'venue_royalties',
    'marketing',
    'coins',
    'subscription',
    'pitching',
    'banner',
    'withdraw'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('completed', 'processing', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM ('card', 'yoomoney', 'bank_transfer', 'crypto', 'auto');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE withdraw_status AS ENUM ('pending', 'processing', 'completed', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- ТАБЛИЦА: transactions
-- Все транзакции пользователя
-- ========================================
CREATE TABLE IF NOT EXISTS make_transactions_84730125 (
  id TEXT PRIMARY KEY DEFAULT 'TRX-' || to_char(now(), 'YYYY-MMDD-') || lpad(nextval('make_transactions_seq_84730125')::text, 4, '0'),
  user_id TEXT NOT NULL,
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  
  -- Финансовые данные
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  fee DECIMAL(10, 2) DEFAULT 0 CHECK (fee >= 0),
  net_amount DECIMAL(10, 2) NOT NULL CHECK (net_amount >= 0),
  
  -- Участники транзакции
  from_name TEXT,
  from_email TEXT,
  to_name TEXT,
  to_email TEXT,
  
  -- Детали платежа
  description TEXT NOT NULL,
  message TEXT,
  payment_method TEXT,
  transaction_id TEXT UNIQUE,
  
  -- Временные метки
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_time TIME NOT NULL DEFAULT CURRENT_TIME,
  status transaction_status DEFAULT 'processing',
  
  -- Дополнительные данные (JSONB для гибкости)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Специфичные поля для билетов
  tickets_sold INTEGER,
  ticket_price DECIMAL(10, 2),
  event_name TEXT,
  event_date DATE,
  venue TEXT,
  
  -- Специфичные поля для заведений
  tracks JSONB,
  plays_count INTEGER,
  venues JSONB,
  venues_count INTEGER,
  period TEXT,
  
  -- Специфичные поля для коинов
  coins_amount INTEGER,
  coins_spent INTEGER,
  
  -- Специфичные поля для подписки
  subscription_period TEXT,
  next_billing DATE,
  
  -- Чек
  receipt_url TEXT,
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание последовательности для ID
CREATE SEQUENCE IF NOT EXISTS make_transactions_seq_84730125 START 1;

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON make_transactions_84730125(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON make_transactions_84730125(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON make_transactions_84730125(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON make_transactions_84730125(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON make_transactions_84730125(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON make_transactions_84730125(created_at DESC);

-- Полнотекстовый поиск
CREATE INDEX IF NOT EXISTS idx_transactions_search ON make_transactions_84730125 
  USING gin(to_tsvector('russian', coalesce(description, '') || ' ' || coalesce(from_name, '') || ' ' || coalesce(to_name, '')));

-- ========================================
-- ТАБЛИЦА: payment_methods
-- Привязанные карты и методы оплаты
-- ========================================
CREATE TABLE IF NOT EXISTS make_payment_methods_84730125 (
  id TEXT PRIMARY KEY DEFAULT 'PM-' || to_char(now(), 'YYYYMMDD-') || lpad(nextval('make_payment_methods_seq_84730125')::text, 4, '0'),
  user_id TEXT NOT NULL,
  
  type payment_method_type NOT NULL,
  
  -- Данные карты (зашифрованы)
  card_number_masked TEXT, -- Например: "4532 **** **** 1234"
  card_holder TEXT,
  card_expires TEXT, -- Формат: "MM/YY"
  card_brand TEXT, -- visa, mastercard, mir
  
  -- Другие методы
  yoomoney_wallet TEXT,
  bank_account_masked TEXT,
  crypto_address TEXT,
  
  -- Статус
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Создание последовательности
CREATE SEQUENCE IF NOT EXISTS make_payment_methods_seq_84730125 START 1;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON make_payment_methods_84730125(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON make_payment_methods_84730125(is_default) WHERE is_default = true;

-- Ограничение: только одна карта по умолчанию на пользователя
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_per_user ON make_payment_methods_84730125(user_id) WHERE is_default = true;

-- ========================================
-- ТАБЛИЦА: withdraw_requests
-- Заявки на вывод средств
-- ========================================
CREATE TABLE IF NOT EXISTS make_withdraw_requests_84730125 (
  id TEXT PRIMARY KEY DEFAULT 'WD-' || to_char(now(), 'YYYYMMDD-') || lpad(nextval('make_withdraw_requests_seq_84730125')::text, 4, '0'),
  user_id TEXT NOT NULL,
  
  -- Финансовые данные
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 1000),
  fee DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  
  -- Метод вывода
  payment_method_id TEXT REFERENCES make_payment_methods_84730125(id),
  payment_method_details JSONB,
  
  -- Статус
  status withdraw_status DEFAULT 'pending',
  status_message TEXT,
  
  -- Временные метки
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Связанная транзакция
  transaction_id TEXT REFERENCES make_transactions_84730125(id),
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создание последовательности
CREATE SEQUENCE IF NOT EXISTS make_withdraw_requests_seq_84730125 START 1;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user_id ON make_withdraw_requests_84730125(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON make_withdraw_requests_84730125(status);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_created ON make_withdraw_requests_84730125(created_at DESC);

-- ========================================
-- ТАБЛИЦА: user_balances
-- Балансы пользователей
-- ========================================
CREATE TABLE IF NOT EXISTS make_user_balances_84730125 (
  user_id TEXT PRIMARY KEY,
  
  -- Балансы
  balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0),
  available_balance DECIMAL(10, 2) DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance DECIMAL(10, 2) DEFAULT 0 CHECK (pending_balance >= 0),
  total_income DECIMAL(10, 2) DEFAULT 0 CHECK (total_income >= 0),
  total_expense DECIMAL(10, 2) DEFAULT 0 CHECK (total_expense >= 0),
  total_withdrawn DECIMAL(10, 2) DEFAULT 0 CHECK (total_withdrawn >= 0),
  
  -- Статистика
  transactions_count INTEGER DEFAULT 0,
  last_transaction_at TIMESTAMPTZ,
  
  -- Системные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс
CREATE INDEX IF NOT EXISTS idx_user_balances_updated ON make_user_balances_84730125(updated_at DESC);

-- ========================================
-- ФУНКЦИЯ: Обновление баланса при транзакции
-- ========================================
CREATE OR REPLACE FUNCTION update_user_balance_84730125()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаём запись баланса если её нет
  INSERT INTO make_user_balances_84730125 (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Обновляем баланс в зависимости от типа транзакции
  IF NEW.status = 'completed' THEN
    CASE NEW.type
      WHEN 'income' THEN
        UPDATE make_user_balances_84730125
        SET 
          balance = balance + NEW.net_amount,
          available_balance = available_balance + NEW.net_amount,
          total_income = total_income + NEW.net_amount,
          transactions_count = transactions_count + 1,
          last_transaction_at = NOW(),
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'expense' THEN
        UPDATE make_user_balances_84730125
        SET 
          balance = balance - NEW.amount,
          available_balance = available_balance - NEW.amount,
          total_expense = total_expense + NEW.amount,
          transactions_count = transactions_count + 1,
          last_transaction_at = NOW(),
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
      WHEN 'withdraw' THEN
        UPDATE make_user_balances_84730125
        SET 
          balance = balance - NEW.amount,
          available_balance = available_balance - NEW.amount,
          total_withdrawn = total_withdrawn + NEW.net_amount,
          transactions_count = transactions_count + 1,
          last_transaction_at = NOW(),
          updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления баланса
DROP TRIGGER IF EXISTS trigger_update_user_balance ON make_transactions_84730125;
CREATE TRIGGER trigger_update_user_balance
  AFTER INSERT OR UPDATE OF status ON make_transactions_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance_84730125();

-- ========================================
-- ФУНКЦИЯ: Автообновление updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_84730125()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для всех таблиц
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON make_transactions_84730125;
CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON make_transactions_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON make_payment_methods_84730125;
CREATE TRIGGER trigger_payment_methods_updated_at
  BEFORE UPDATE ON make_payment_methods_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

DROP TRIGGER IF EXISTS trigger_withdraw_requests_updated_at ON make_withdraw_requests_84730125;
CREATE TRIGGER trigger_withdraw_requests_updated_at
  BEFORE UPDATE ON make_withdraw_requests_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

DROP TRIGGER IF EXISTS trigger_user_balances_updated_at ON make_user_balances_84730125;
CREATE TRIGGER trigger_user_balances_updated_at
  BEFORE UPDATE ON make_user_balances_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_84730125();

-- ========================================
-- ФУНКЦИЯ: Создание транзакции
-- ========================================
CREATE OR REPLACE FUNCTION create_transaction_84730125(
  p_user_id TEXT,
  p_type transaction_type,
  p_category transaction_category,
  p_amount DECIMAL,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_fee DECIMAL;
  v_net_amount DECIMAL;
BEGIN
  -- Расчёт комиссии (можно настроить по категориям)
  CASE p_category
    WHEN 'donate' THEN
      v_fee := p_amount * 0.03; -- 3%
    WHEN 'ticket_sales' THEN
      v_fee := p_amount * 0.20; -- 20%
    WHEN 'venue_royalties' THEN
      v_fee := p_amount * 0.10; -- 10%
    WHEN 'concert' THEN
      v_fee := p_amount * 0.05; -- 5%
    WHEN 'radio' THEN
      v_fee := p_amount * 0.10; -- 10%
    WHEN 'streaming' THEN
      v_fee := p_amount * 0.15; -- 15%
    ELSE
      v_fee := 0;
  END CASE;
  
  v_net_amount := p_amount - v_fee;
  
  -- Создание транзакции
  INSERT INTO make_transactions_84730125 (
    user_id,
    type,
    category,
    amount,
    fee,
    net_amount,
    description,
    status,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_category,
    p_amount,
    v_fee,
    v_net_amount,
    p_description,
    'completed',
    p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ФУНКЦИЯ: Создание заявки на вывод
-- ========================================
CREATE OR REPLACE FUNCTION create_withdraw_request_84730125(
  p_user_id TEXT,
  p_amount DECIMAL,
  p_payment_method_id TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_request_id TEXT;
  v_fee DECIMAL;
  v_net_amount DECIMAL;
  v_available_balance DECIMAL;
BEGIN
  -- Проверка баланса
  SELECT available_balance INTO v_available_balance
  FROM make_user_balances_84730125
  WHERE user_id = p_user_id;
  
  IF v_available_balance IS NULL THEN
    RAISE EXCEPTION 'Пользователь не найден';
  END IF;
  
  IF p_amount > v_available_balance THEN
    RAISE EXCEPTION 'Недостаточно средств. Доступно: %', v_available_balance;
  END IF;
  
  IF p_amount < 1000 THEN
    RAISE EXCEPTION 'Минимальная сумма вывода: 1000 ₽';
  END IF;
  
  -- Расчёт комиссии (2.5%)
  v_fee := p_amount * 0.025;
  v_net_amount := p_amount - v_fee;
  
  -- Создание заявки
  INSERT INTO make_withdraw_requests_84730125 (
    user_id,
    amount,
    fee,
    net_amount,
    payment_method_id,
    status
  ) VALUES (
    p_user_id,
    p_amount,
    v_fee,
    v_net_amount,
    p_payment_method_id,
    'pending'
  )
  RETURNING id INTO v_request_id;
  
  -- Резервирование средств
  UPDATE make_user_balances_84730125
  SET 
    available_balance = available_balance - p_amount,
    pending_balance = pending_balance + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ФУНКЦИЯ: Получение статистики пользователя
-- ========================================
CREATE OR REPLACE FUNCTION get_user_stats_84730125(p_user_id TEXT)
RETURNS TABLE (
  balance DECIMAL,
  total_income DECIMAL,
  total_expense DECIMAL,
  month_income DECIMAL,
  month_expense DECIMAL,
  transactions_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ub.balance,
    ub.total_income,
    ub.total_expense,
    COALESCE(SUM(t.net_amount) FILTER (WHERE t.type = 'income' AND t.transaction_date >= date_trunc('month', CURRENT_DATE)), 0) as month_income,
    COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense' AND t.transaction_date >= date_trunc('month', CURRENT_DATE)), 0) as month_expense,
    ub.transactions_count
  FROM make_user_balances_84730125 ub
  LEFT JOIN make_transactions_84730125 t ON t.user_id = ub.user_id
  WHERE ub.user_id = p_user_id
  GROUP BY ub.user_id, ub.balance, ub.total_income, ub.total_expense, ub.transactions_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- RLS (Row Level Security) ПОЛИТИКИ
-- ========================================

-- Включаем RLS для всех таблиц
ALTER TABLE make_transactions_84730125 ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_payment_methods_84730125 ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_withdraw_requests_84730125 ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_user_balances_84730125 ENABLE ROW LEVEL SECURITY;

-- Политики для транзакций
CREATE POLICY transactions_select_own ON make_transactions_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY transactions_insert_own ON make_transactions_84730125
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Политики для методов оплаты
CREATE POLICY payment_methods_select_own ON make_payment_methods_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY payment_methods_insert_own ON make_payment_methods_84730125
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY payment_methods_update_own ON make_payment_methods_84730125
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY payment_methods_delete_own ON make_payment_methods_84730125
  FOR DELETE USING (user_id = current_setting('app.current_user_id', TRUE));

-- Политики для заявок на вывод
CREATE POLICY withdraw_requests_select_own ON make_withdraw_requests_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

CREATE POLICY withdraw_requests_insert_own ON make_withdraw_requests_84730125
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE));

-- Политики для балансов
CREATE POLICY user_balances_select_own ON make_user_balances_84730125
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE));

-- ========================================
-- ВСТАВКА ДЕМО ДАННЫХ
-- ========================================

-- Демо баланс
INSERT INTO make_user_balances_84730125 (user_id, balance, available_balance, total_income, total_expense)
VALUES ('artist_demo_001', 125430, 115430, 116750, 10490)
ON CONFLICT (user_id) DO NOTHING;

-- Демо метод оплаты
INSERT INTO make_payment_methods_84730125 (user_id, type, card_number_masked, card_holder, card_expires, card_brand, is_default, is_verified)
VALUES 
  ('artist_demo_001', 'card', '4532 **** **** 1234', 'IVAN PETROV', '12/27', 'visa', true, true),
  ('artist_demo_001', 'card', '5421 **** **** 5678', 'IVAN PETROV', '06/28', 'mastercard', false, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ========================================

COMMENT ON TABLE make_transactions_84730125 IS 'Все транзакции пользователей (доходы, расходы, выводы)';
COMMENT ON TABLE make_payment_methods_84730125 IS 'Привязанные методы оплаты пользователей';
COMMENT ON TABLE make_withdraw_requests_84730125 IS 'Заявки на вывод средств';
COMMENT ON TABLE make_user_balances_84730125 IS 'Балансы и статистика пользователей';

COMMENT ON FUNCTION create_transaction_84730125 IS 'Создание новой транзакции с автоматическим расчётом комиссии';
COMMENT ON FUNCTION create_withdraw_request_84730125 IS 'Создание заявки на вывод средств с проверкой баланса';
COMMENT ON FUNCTION get_user_stats_84730125 IS 'Получение статистики пользователя';

-- ========================================
-- ЗАВЕРШЕНО
-- ========================================
