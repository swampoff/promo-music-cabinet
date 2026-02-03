-- =====================================================
-- PROMO.MUSIC - RADIO FINANCIAL SYSTEM
-- Финансовая система для радиостанций
-- =====================================================

-- =====================================================
-- CUSTOM TYPES
-- =====================================================

-- Тип транзакции баланса
CREATE TYPE balance_transaction_type AS ENUM (
  'donation',       -- Донат/пополнение
  'royalty',        -- Роялти от заказов (85%)
  'withdrawal',     -- Вывод средств
  'fee',            -- Комиссия/штраф
  'refund',         -- Возврат средств
  'bonus',          -- Бонус/награда
  'adjustment'      -- Ручная корректировка
);

-- Статус транзакции
CREATE TYPE transaction_status AS ENUM (
  'pending',        -- Ожидает
  'completed',      -- Завершена
  'failed',         -- Ошибка
  'cancelled'       -- Отменена
);

-- Метод вывода средств
CREATE TYPE payment_method AS ENUM (
  'bank_transfer',  -- Банковский перевод
  'yoomoney',       -- ЮMoney
  'card',           -- На карту
  'qiwi',           -- QIWI кошелек
  'webmoney'        -- WebMoney
);

-- Статус заявки на вывод
CREATE TYPE withdrawal_status AS ENUM (
  'pending',        -- Ожидает рассмотрения
  'approved',       -- Одобрена
  'processing',     -- В обработке (деньги отправлены)
  'completed',      -- Завершена
  'rejected',       -- Отклонена
  'cancelled'       -- Отменена пользователем
);

-- =====================================================
-- РАСШИРЕНИЕ ТАБЛИЦЫ: users
-- Добавление баланса
-- =====================================================

-- Проверяем, существует ли колонка balance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'balance'
  ) THEN
    ALTER TABLE users ADD COLUMN balance DECIMAL(12, 2) DEFAULT 0 NOT NULL;
    ALTER TABLE users ADD CONSTRAINT valid_balance CHECK (balance >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance) WHERE balance > 0;

-- =====================================================
-- ТАБЛИЦА: balance_transactions
-- История движения средств
-- =====================================================
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связь с пользователем
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  user_email VARCHAR(255) NOT NULL,
  
  -- Тип и сумма транзакции
  transaction_type balance_transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Может быть + или -
  
  -- Описание
  description TEXT,
  
  -- Связь с другими сущностями
  related_entity_type VARCHAR(100), -- 'advertisement_order', 'rotation_order', 'withdrawal_request'
  related_entity_id UUID,
  
  -- Статус
  status transaction_status NOT NULL DEFAULT 'pending',
  
  -- Баланс до и после
  balance_before DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  
  -- Метаданные (JSONB)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Ограничения
  CONSTRAINT valid_transaction_amount CHECK (amount != 0),
  CONSTRAINT valid_balance_calculation CHECK (balance_after = balance_before + amount)
);

CREATE INDEX idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX idx_balance_transactions_type ON balance_transactions(transaction_type);
CREATE INDEX idx_balance_transactions_status ON balance_transactions(status);
CREATE INDEX idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX idx_balance_transactions_related ON balance_transactions(related_entity_type, related_entity_id);

-- =====================================================
-- ТАБЛИЦА: withdrawal_requests
-- Заявки на вывод средств
-- =====================================================
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Связь с пользователем
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  
  -- Сумма вывода
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Метод и реквизиты
  payment_method payment_method NOT NULL,
  payment_details JSONB NOT NULL, -- {bank_name, account_number, card_number, etc}
  
  -- Статус
  status withdrawal_status NOT NULL DEFAULT 'pending',
  
  -- Административная информация
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Обработка
  processed_by UUID REFERENCES users(id),
  processed_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  
  -- Связь с транзакцией баланса
  transaction_id UUID REFERENCES balance_transactions(id),
  
  -- Подтверждение выплаты
  payment_confirmation_id VARCHAR(255), -- ID транзакции в платежной системе
  payment_receipt_url TEXT,
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ограничения
  CONSTRAINT valid_withdrawal_amount CHECK (amount >= 500), -- Минимум 500 ₽
  CONSTRAINT valid_payment_details CHECK (jsonb_typeof(payment_details) = 'object')
);

CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);
CREATE INDEX idx_withdrawal_requests_pending ON withdrawal_requests(status) 
  WHERE status IN ('pending', 'approved', 'processing');

-- =====================================================
-- ТАБЛИЦА: radio_financial_snapshots
-- Снимки финансовых показателей (ежедневно)
-- =====================================================
CREATE TABLE radio_financial_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Радиостанция
  radio_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Дата снимка
  snapshot_date DATE NOT NULL,
  
  -- Показатели за день
  daily_revenue DECIMAL(12, 2) DEFAULT 0, -- Валовой доход
  daily_net_revenue DECIMAL(12, 2) DEFAULT 0, -- Чистый доход (после комиссии)
  daily_commission DECIMAL(12, 2) DEFAULT 0, -- Комиссия платформе
  daily_orders INTEGER DEFAULT 0, -- Количество заказов
  
  -- Накопительные показатели
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_net_revenue DECIMAL(12, 2) DEFAULT 0,
  total_commission DECIMAL(12, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Баланс на конец дня
  ending_balance DECIMAL(12, 2) DEFAULT 0,
  
  -- Выводы
  daily_withdrawals DECIMAL(12, 2) DEFAULT 0,
  total_withdrawals DECIMAL(12, 2) DEFAULT 0,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Уникальность
  CONSTRAINT unique_radio_snapshot_date UNIQUE (radio_id, snapshot_date)
);

CREATE INDEX idx_radio_snapshots_radio_id ON radio_financial_snapshots(radio_id);
CREATE INDEX idx_radio_snapshots_date ON radio_financial_snapshots(snapshot_date DESC);

-- =====================================================
-- ФУНКЦИЯ: Начисление средств из заказа
-- =====================================================
CREATE OR REPLACE FUNCTION credit_radio_from_order(
  p_radio_user_id UUID,
  p_order_type VARCHAR, -- 'advertisement' или 'rotation'
  p_order_id UUID,
  p_net_amount DECIMAL
) RETURNS UUID AS $$
DECLARE
  v_user_balance DECIMAL;
  v_transaction_id UUID;
  v_user_email VARCHAR;
BEGIN
  -- Получаем текущий баланс и email
  SELECT balance, email INTO v_user_balance, v_user_email
  FROM users
  WHERE id = p_radio_user_id
  FOR UPDATE; -- Блокируем строку для предотвращения race condition
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_radio_user_id;
  END IF;
  
  -- Создаем транзакцию баланса
  INSERT INTO balance_transactions (
    user_id,
    user_email,
    transaction_type,
    amount,
    description,
    related_entity_type,
    related_entity_id,
    status,
    balance_before,
    balance_after,
    metadata,
    completed_at
  ) VALUES (
    p_radio_user_id,
    v_user_email,
    'royalty',
    p_net_amount,
    CASE 
      WHEN p_order_type = 'advertisement' THEN 'Доход от рекламного заказа'
      WHEN p_order_type = 'rotation' THEN 'Доход от заказа ротации'
      ELSE 'Доход от заказа'
    END,
    p_order_type || '_order',
    p_order_id,
    'completed',
    v_user_balance,
    v_user_balance + p_net_amount,
    jsonb_build_object(
      'order_type', p_order_type,
      'order_id', p_order_id,
      'net_amount', p_net_amount
    ),
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  -- Обновляем баланс пользователя
  UPDATE users
  SET balance = balance + p_net_amount
  WHERE id = p_radio_user_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИЯ: Создание заявки на вывод
-- =====================================================
CREATE OR REPLACE FUNCTION create_withdrawal_request(
  p_user_id UUID,
  p_amount DECIMAL,
  p_payment_method payment_method,
  p_payment_details JSONB
) RETURNS UUID AS $$
DECLARE
  v_user_balance DECIMAL;
  v_pending_withdrawals DECIMAL;
  v_available_balance DECIMAL;
  v_withdrawal_id UUID;
  v_transaction_id UUID;
  v_user_email VARCHAR;
  v_user_name VARCHAR;
BEGIN
  -- Проверяем баланс
  SELECT 
    u.balance,
    u.email,
    u.full_name,
    COALESCE(SUM(CASE WHEN w.status IN ('pending', 'approved', 'processing') THEN w.amount ELSE 0 END), 0)
  INTO v_user_balance, v_user_email, v_user_name, v_pending_withdrawals
  FROM users u
  LEFT JOIN withdrawal_requests w ON w.user_id = u.id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.balance, u.email, u.full_name
  FOR UPDATE OF u;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Рассчитываем доступный баланс
  v_available_balance := v_user_balance - v_pending_withdrawals;
  
  -- Проверки
  IF p_amount < 500 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is 500 RUB';
  END IF;
  
  IF p_amount > v_available_balance THEN
    RAISE EXCEPTION 'Insufficient balance. Available: % RUB', v_available_balance;
  END IF;
  
  -- Создаем транзакцию баланса (pending)
  INSERT INTO balance_transactions (
    user_id,
    user_email,
    transaction_type,
    amount,
    description,
    status,
    balance_before,
    balance_after
  ) VALUES (
    p_user_id,
    v_user_email,
    'withdrawal',
    -p_amount,
    'Заявка на вывод средств',
    'pending',
    v_user_balance,
    v_user_balance - p_amount
  ) RETURNING id INTO v_transaction_id;
  
  -- Создаем заявку на вывод
  INSERT INTO withdrawal_requests (
    user_id,
    user_email,
    user_name,
    amount,
    payment_method,
    payment_details,
    transaction_id,
    status
  ) VALUES (
    p_user_id,
    v_user_email,
    v_user_name,
    p_amount,
    p_payment_method,
    p_payment_details,
    v_transaction_id,
    'pending'
  ) RETURNING id INTO v_withdrawal_id;
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИЯ: Обработка заявки на вывод (админ)
-- =====================================================
CREATE OR REPLACE FUNCTION process_withdrawal_request(
  p_withdrawal_id UUID,
  p_admin_user_id UUID,
  p_action VARCHAR, -- 'approve' или 'reject'
  p_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_withdrawal RECORD;
  v_new_status withdrawal_status;
BEGIN
  -- Получаем заявку
  SELECT * INTO v_withdrawal
  FROM withdrawal_requests
  WHERE id = p_withdrawal_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found';
  END IF;
  
  IF v_withdrawal.status != 'pending' THEN
    RAISE EXCEPTION 'Withdrawal request is not pending (current status: %)', v_withdrawal.status;
  END IF;
  
  IF p_action = 'approve' THEN
    v_new_status := 'approved';
    
    -- Обновляем заявку
    UPDATE withdrawal_requests
    SET 
      status = v_new_status,
      admin_notes = p_notes,
      processed_by = p_admin_user_id,
      processed_date = NOW(),
      updated_at = NOW()
    WHERE id = p_withdrawal_id;
    
    -- Обновляем транзакцию (но баланс еще не снимаем, ждем completed)
    UPDATE balance_transactions
    SET status = 'pending'
    WHERE id = v_withdrawal.transaction_id;
    
    RETURN TRUE;
    
  ELSIF p_action = 'reject' THEN
    v_new_status := 'rejected';
    
    -- Обновляем заявку
    UPDATE withdrawal_requests
    SET 
      status = v_new_status,
      rejection_reason = p_rejection_reason,
      admin_notes = p_notes,
      processed_by = p_admin_user_id,
      processed_date = NOW(),
      updated_at = NOW()
    WHERE id = p_withdrawal_id;
    
    -- Отменяем транзакцию
    UPDATE balance_transactions
    SET 
      status = 'cancelled',
      completed_at = NOW()
    WHERE id = v_withdrawal.transaction_id;
    
    RETURN TRUE;
    
  ELSE
    RAISE EXCEPTION 'Invalid action: %. Use "approve" or "reject"', p_action;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИЯ: Завершение вывода средств
-- =====================================================
CREATE OR REPLACE FUNCTION complete_withdrawal_request(
  p_withdrawal_id UUID,
  p_payment_confirmation_id VARCHAR DEFAULT NULL,
  p_payment_receipt_url TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_withdrawal RECORD;
BEGIN
  -- Получаем заявку
  SELECT * INTO v_withdrawal
  FROM withdrawal_requests
  WHERE id = p_withdrawal_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal request not found';
  END IF;
  
  IF v_withdrawal.status NOT IN ('approved', 'processing') THEN
    RAISE EXCEPTION 'Withdrawal must be approved or processing (current: %)', v_withdrawal.status;
  END IF;
  
  -- Обновляем заявку
  UPDATE withdrawal_requests
  SET 
    status = 'completed',
    completed_date = NOW(),
    payment_confirmation_id = p_payment_confirmation_id,
    payment_receipt_url = p_payment_receipt_url,
    updated_at = NOW()
  WHERE id = p_withdrawal_id;
  
  -- Завершаем транзакцию и списываем деньги с баланса
  UPDATE balance_transactions
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = v_withdrawal.transaction_id;
  
  -- Списываем с баланса пользователя
  UPDATE users
  SET balance = balance - v_withdrawal.amount
  WHERE id = v_withdrawal.user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИЯ: Получение финансовой статистики радио
-- =====================================================
CREATE OR REPLACE FUNCTION get_radio_financial_stats(
  p_radio_user_id UUID,
  p_period_days INTEGER DEFAULT 30
) RETURNS TABLE (
  total_revenue DECIMAL,
  total_net_revenue DECIMAL,
  total_commission DECIMAL,
  total_orders BIGINT,
  avg_order_value DECIMAL,
  current_balance DECIMAL,
  available_balance DECIMAL,
  pending_withdrawals DECIMAL,
  completed_withdrawals DECIMAL,
  growth_percent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH period_stats AS (
    SELECT 
      COALESCE(SUM(ao.payment_amount), 0) as revenue,
      COALESCE(SUM(ao.net_amount_to_radio), 0) as net_revenue,
      COALESCE(SUM(ao.commission_amount), 0) as commission,
      COUNT(ao.id) as orders
    FROM advertisement_orders ao
    WHERE ao.seller_radio_id = (SELECT id FROM radio_stations WHERE user_id = p_radio_user_id)
      AND ao.status IN ('paid', 'approved_by_radio', 'fulfilled')
      AND ao.created_at >= NOW() - (p_period_days || ' days')::INTERVAL
  ),
  previous_period_stats AS (
    SELECT 
      COALESCE(SUM(ao.net_amount_to_radio), 0) as prev_net_revenue
    FROM advertisement_orders ao
    WHERE ao.seller_radio_id = (SELECT id FROM radio_stations WHERE user_id = p_radio_user_id)
      AND ao.status IN ('paid', 'approved_by_radio', 'fulfilled')
      AND ao.created_at >= NOW() - (p_period_days * 2 || ' days')::INTERVAL
      AND ao.created_at < NOW() - (p_period_days || ' days')::INTERVAL
  ),
  balance_info AS (
    SELECT 
      u.balance as curr_balance,
      COALESCE(SUM(CASE WHEN w.status IN ('pending', 'approved', 'processing') THEN w.amount ELSE 0 END), 0) as pending,
      COALESCE(SUM(CASE WHEN w.status = 'completed' THEN w.amount ELSE 0 END), 0) as completed
    FROM users u
    LEFT JOIN withdrawal_requests w ON w.user_id = u.id
    WHERE u.id = p_radio_user_id
    GROUP BY u.balance
  )
  SELECT 
    ps.revenue,
    ps.net_revenue,
    ps.commission,
    ps.orders,
    CASE WHEN ps.orders > 0 THEN ps.net_revenue / ps.orders ELSE 0 END as avg_value,
    bi.curr_balance,
    bi.curr_balance - bi.pending as available,
    bi.pending,
    bi.completed,
    CASE 
      WHEN pps.prev_net_revenue > 0 THEN 
        ROUND(((ps.net_revenue - pps.prev_net_revenue) / pps.prev_net_revenue * 100)::NUMERIC, 1)
      ELSE 0 
    END as growth
  FROM period_stats ps, previous_period_stats pps, balance_info bi;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ТРИГГЕР: Автоматическое создание снимка
-- =====================================================
CREATE OR REPLACE FUNCTION update_financial_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем или создаем снимок за сегодня
  INSERT INTO radio_financial_snapshots (
    radio_id,
    snapshot_date,
    daily_revenue,
    daily_net_revenue,
    daily_commission,
    daily_orders
  )
  SELECT 
    NEW.seller_radio_id,
    CURRENT_DATE,
    COALESCE(SUM(payment_amount), 0),
    COALESCE(SUM(net_amount_to_radio), 0),
    COALESCE(SUM(commission_amount), 0),
    COUNT(*)
  FROM advertisement_orders
  WHERE seller_radio_id = NEW.seller_radio_id
    AND DATE(created_at) = CURRENT_DATE
    AND status IN ('paid', 'approved_by_radio', 'fulfilled')
  ON CONFLICT (radio_id, snapshot_date) 
  DO UPDATE SET
    daily_revenue = EXCLUDED.daily_revenue,
    daily_net_revenue = EXCLUDED.daily_net_revenue,
    daily_commission = EXCLUDED.daily_commission,
    daily_orders = EXCLUDED.daily_orders;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_snapshot
AFTER INSERT OR UPDATE ON advertisement_orders
FOR EACH ROW
WHEN (NEW.status IN ('paid', 'approved_by_radio', 'fulfilled'))
EXECUTE FUNCTION update_financial_snapshot();

-- =====================================================
-- ПРЕДСТАВЛЕНИЕ: Детализация транзакций
-- =====================================================
CREATE VIEW radio_transaction_details AS
SELECT 
  bt.id,
  bt.user_id,
  bt.user_email,
  bt.transaction_type,
  bt.amount,
  bt.description,
  bt.status,
  bt.balance_before,
  bt.balance_after,
  bt.created_at,
  bt.completed_at,
  -- Связанная сущность
  CASE 
    WHEN bt.related_entity_type = 'advertisement_order' THEN 
      (SELECT jsonb_build_object(
        'order_id', ao.id,
        'package_title', rap.title,
        'buyer_name', ao.buyer_venue_name,
        'total_amount', ao.payment_amount
      )
      FROM advertisement_orders ao
      LEFT JOIN radio_advertisement_packages rap ON rap.id = ao.package_id
      WHERE ao.id = bt.related_entity_id)
    WHEN bt.related_entity_type = 'withdrawal_request' THEN
      (SELECT jsonb_build_object(
        'withdrawal_id', wr.id,
        'payment_method', wr.payment_method,
        'status', wr.status
      )
      FROM withdrawal_requests wr
      WHERE wr.id = bt.related_entity_id)
    ELSE NULL
  END as related_entity_details
FROM balance_transactions bt;

-- =====================================================
-- КОММЕНТАРИИ
-- =====================================================
COMMENT ON TABLE balance_transactions IS 'История движения средств на балансе пользователей';
COMMENT ON TABLE withdrawal_requests IS 'Заявки на вывод средств';
COMMENT ON TABLE radio_financial_snapshots IS 'Ежедневные снимки финансовых показателей радиостанций';
COMMENT ON FUNCTION credit_radio_from_order IS 'Начисление средств радио из завершенного заказа';
COMMENT ON FUNCTION create_withdrawal_request IS 'Создание заявки на вывод средств с проверками';
COMMENT ON FUNCTION process_withdrawal_request IS 'Обработка заявки админом (одобрение/отклонение)';
COMMENT ON FUNCTION complete_withdrawal_request IS 'Завершение вывода средств и списание с баланса';
COMMENT ON FUNCTION get_radio_financial_stats IS 'Получение финансовой статистики радио за период';

-- =====================================================
-- SEED DATA (для тестирования)
-- =====================================================

-- Добавляем начальный баланс тестовой радиостанции
UPDATE users 
SET balance = 125000.00
WHERE email = 'radio@promo.fm';

-- Примеры транзакций
INSERT INTO balance_transactions (
  user_id,
  user_email,
  transaction_type,
  amount,
  description,
  status,
  balance_before,
  balance_after,
  completed_at
) VALUES
  (
    (SELECT id FROM users WHERE email = 'radio@promo.fm'),
    'radio@promo.fm',
    'royalty',
    42500.00,
    'Доход от рекламного заказа #001',
    'completed',
    82500.00,
    125000.00,
    NOW() - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM users WHERE email = 'radio@promo.fm'),
    'radio@promo.fm',
    'royalty',
    35700.00,
    'Доход от рекламного заказа #002',
    'completed',
    46800.00,
    82500.00,
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT DO NOTHING;
