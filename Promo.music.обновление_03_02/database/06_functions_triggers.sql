-- =====================================================
-- PROMO.MUSIC - FUNCTIONS & TRIGGERS
-- Автоматизация бизнес-логики
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации уникального реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGH IJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации API ключа
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'pm_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Функция для расчета комиссии партнера
CREATE OR REPLACE FUNCTION calculate_partner_commission(
  p_partner_id UUID,
  p_transaction_amount DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
BEGIN
  -- Получаем ставку комиссии партнера
  SELECT commission_rate INTO v_commission_rate
  FROM partners
  WHERE id = p_partner_id AND status = 'active';
  
  IF v_commission_rate IS NULL THEN
    RETURN 0;
  END IF;
  
  v_commission_amount := p_transaction_amount * (v_commission_rate / 100);
  
  RETURN ROUND(v_commission_amount, 2);
END;
$$ LANGUAGE plpgsql;

-- Функция для подсчета успешных питчингов
CREATE OR REPLACE FUNCTION calculate_pitch_success_rate(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total INTEGER;
  v_successful INTEGER;
  v_rate DECIMAL;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'accepted')
  INTO v_total, v_successful
  FROM pitches
  WHERE user_id = p_user_id AND status IN ('accepted', 'rejected');
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  v_rate := (v_successful::DECIMAL / v_total) * 100;
  
  RETURN ROUND(v_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Функция для проверки лимита питчей в подписке
CREATE OR REPLACE FUNCTION check_pitch_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT 
    pitches_used_this_period,
    pitches_limit,
    sp.is_pitches_unlimited
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Если нет подписки
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Безлимитный план
  IF v_subscription.is_pitches_unlimited THEN
    RETURN TRUE;
  END IF;
  
  -- Проверка лимита
  RETURN v_subscription.pitches_used_this_period < v_subscription.pitches_limit;
END;
$$ LANGUAGE plpgsql;

-- Функция для применения скидки
CREATE OR REPLACE FUNCTION apply_discount_code(
  p_code VARCHAR,
  p_amount DECIMAL,
  p_user_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL,
  final_amount DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  v_discount RECORD;
  v_usage_count INTEGER;
  v_calculated_discount DECIMAL;
BEGIN
  -- Проверяем код
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = p_code 
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, p_amount, 'Invalid or expired discount code';
    RETURN;
  END IF;
  
  -- Проверяем минимальную сумму
  IF p_amount < v_discount.min_purchase_amount THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, p_amount, 
      'Minimum purchase amount not met: ' || v_discount.min_purchase_amount;
    RETURN;
  END IF;
  
  -- Проверяем лимит использования
  IF v_discount.max_uses IS NOT NULL THEN
    IF v_discount.current_uses >= v_discount.max_uses THEN
      RETURN QUERY SELECT FALSE, 0::DECIMAL, p_amount, 'Discount code usage limit reached';
      RETURN;
    END IF;
  END IF;
  
  -- Проверяем использование пользователем
  SELECT COUNT(*) INTO v_usage_count
  FROM discount_usages
  WHERE discount_code_id = v_discount.id AND user_id = p_user_id;
  
  IF v_usage_count >= v_discount.max_uses_per_user THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, p_amount, 'You have already used this code';
    RETURN;
  END IF;
  
  -- Рассчитываем скидку
  IF v_discount.discount_type = 'percentage' THEN
    v_calculated_discount := p_amount * (v_discount.discount_value / 100);
    IF v_discount.max_discount_amount IS NOT NULL THEN
      v_calculated_discount := LEAST(v_calculated_discount, v_discount.max_discount_amount);
    END IF;
  ELSIF v_discount.discount_type = 'fixed' THEN
    v_calculated_discount := LEAST(v_discount.discount_value, p_amount);
  ELSE
    v_calculated_discount := 0;
  END IF;
  
  v_calculated_discount := ROUND(v_calculated_discount, 2);
  
  RETURN QUERY SELECT 
    TRUE, 
    v_calculated_discount, 
    p_amount - v_calculated_discount,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Функция для расчета MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS DECIMAL AS $$
DECLARE
  v_mrr DECIMAL;
BEGIN
  SELECT SUM(
    CASE 
      WHEN billing_period = 'monthly' THEN final_price
      WHEN billing_period = 'quarterly' THEN final_price / 3
      WHEN billing_period = 'yearly' THEN final_price / 12
      ELSE 0
    END
  ) INTO v_mrr
  FROM user_subscriptions
  WHERE status = 'active' AND current_period_end > NOW();
  
  RETURN COALESCE(ROUND(v_mrr, 2), 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS - updated_at
-- =====================================================

-- Применяем триггер updated_at ко всем нужным таблицам
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitches_updated_at BEFORE UPDATE ON pitches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS - Business Logic
-- =====================================================

-- Триггер: Обновление счетчиков при создании питча
CREATE OR REPLACE FUNCTION update_pitch_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем счетчик у пользователя
  UPDATE users 
  SET total_pitches = total_pitches + 1
  WHERE id = NEW.user_id;
  
  -- Обновляем счетчик у трека
  UPDATE tracks
  SET total_pitches = total_pitches + 1
  WHERE id = NEW.track_id;
  
  -- Обновляем использование питчей в подписке
  UPDATE user_subscriptions
  SET pitches_used_this_period = pitches_used_this_period + 1
  WHERE user_id = NEW.user_id 
    AND status = 'active'
    AND current_period_end > NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pitch_created_counters AFTER INSERT ON pitches
  FOR EACH ROW EXECUTE FUNCTION update_pitch_counters();

-- Триггер: Обновление при успешном питче
CREATE OR REPLACE FUNCTION update_successful_pitch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Обновляем счетчик успешных питчей у пользователя
    UPDATE users 
    SET successful_pitches = successful_pitches + 1
    WHERE id = NEW.user_id;
    
    -- Обновляем счетчик у трека
    UPDATE tracks
    SET successful_pitches = successful_pitches + 1
    WHERE id = NEW.track_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pitch_accepted_update AFTER UPDATE ON pitches
  FOR EACH ROW EXECUTE FUNCTION update_successful_pitch();

-- Триггер: Создание кошелька при регистрации пользователя
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, currency)
  VALUES (NEW.id, 'USD');
  
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_created_wallet AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Триггер: Обновление баланса при транзакции
CREATE OR REPLACE FUNCTION update_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_amount DECIMAL;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Определяем знак изменения баланса
    v_amount := CASE 
      WHEN NEW.transaction_type IN ('deposit', 'refund', 'bonus', 'partner_payout') THEN NEW.amount
      WHEN NEW.transaction_type IN ('withdrawal', 'pitch_payment', 'subscription') THEN -NEW.amount
      ELSE 0
    END;
    
    -- Обновляем баланс пользователя
    UPDATE users
    SET account_balance = account_balance + v_amount,
        total_spent = total_spent + CASE WHEN v_amount < 0 THEN ABS(v_amount) ELSE 0 END
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_completed_balance AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_balance_on_transaction();

-- Триггер: Обновление кредитов пользователя
CREATE OR REPLACE FUNCTION update_user_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET credits = NEW.balance_after
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_credits_changed AFTER INSERT ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_user_credits_balance();

-- Триггер: Обновление статистики партнеров
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE partners
  SET total_earnings = total_earnings + NEW.commission_amount,
      pending_earnings = pending_earnings + NEW.commission_amount
  WHERE id = NEW.partner_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partner_commission_created AFTER INSERT ON partner_commissions
  FOR EACH ROW EXECUTE FUNCTION update_partner_stats();

-- Триггер: Автогенерация реферального кода для партнера
CREATE OR REPLACE FUNCTION generate_partner_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partner_referral_code_gen BEFORE INSERT ON partners
  FOR EACH ROW EXECUTE FUNCTION generate_partner_referral_code();

-- Триггер: Генерация API ключа
CREATE OR REPLACE FUNCTION generate_api_key_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL OR NEW.api_key = '' THEN
    NEW.api_key := generate_api_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_key_generation BEFORE INSERT ON api_keys
  FOR EACH ROW EXECUTE FUNCTION generate_api_key_on_insert();

-- Триггер: Обновление SLA тикета
CREATE OR REPLACE FUNCTION check_ticket_sla()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем нарушение SLA при первом ответе
  IF NEW.first_response_at IS NOT NULL AND OLD.first_response_at IS NULL THEN
    IF NEW.first_response_at > NEW.sla_response_deadline THEN
      NEW.is_sla_breached := TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_sla_check BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION check_ticket_sla();

-- Триггер: Создание уведомления при изменении статуса питча
CREATE OR REPLACE FUNCTION create_pitch_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      related_pitch_id,
      action_url
    ) VALUES (
      NEW.user_id,
      'pitch_status',
      'Pitch Status Updated',
      'Your pitch status changed to: ' || NEW.status,
      NEW.id,
      '/pitches/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pitch_status_changed_notification AFTER UPDATE ON pitches
  FOR EACH ROW EXECUTE FUNCTION create_pitch_status_notification();

-- Триггер: Обновление счетчика использования промокода
CREATE OR REPLACE FUNCTION increment_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discount_codes
  SET current_uses = current_uses + 1
  WHERE id = NEW.discount_code_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discount_used AFTER INSERT ON discount_usages
  FOR EACH ROW EXECUTE FUNCTION increment_discount_usage();

COMMENT ON FUNCTION update_updated_at_column() IS 'Автоматическое обновление поля updated_at';
COMMENT ON FUNCTION calculate_partner_commission(UUID, DECIMAL) IS 'Расчет комиссии партнера';
COMMENT ON FUNCTION calculate_pitch_success_rate(UUID) IS 'Расчет процента успешных питчингов';
COMMENT ON FUNCTION check_pitch_limit(UUID) IS 'Проверка лимита питчей в подписке';
COMMENT ON FUNCTION apply_discount_code(VARCHAR, DECIMAL, UUID) IS 'Применение промокода со всеми проверками';
COMMENT ON FUNCTION calculate_mrr() IS 'Расчет месячного повторяющегося дохода (MRR)';
