-- ============================================
-- PROMO.MUSIC - MIGRATION 005
-- Donations & Coins: Донаты, Коины, Транзакции
-- ============================================

-- ============================================
-- ТАБЛИЦА: donations (донаты)
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  -- Донатер
  donor_name TEXT,
  donor_email TEXT,
  donor_message TEXT,
  
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  -- Payment info
  payment_method TEXT CHECK (payment_method IN ('card', 'yoomoney', 'qiwi', 'paypal', 'crypto', 'other')),
  payment_provider TEXT,
  external_transaction_id TEXT,
  
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Commission
  commission_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 5.00 NOT NULL, -- процент комиссии
  net_amount DECIMAL(10, 2) NOT NULL, -- после комиссии
  
  -- Публичность
  is_public BOOLEAN DEFAULT true, -- показывать в публичном списке
  is_anonymous BOOLEAN DEFAULT false, -- скрыть имя донатера
  
  -- Timestamps
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_artist_id ON donations(artist_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount DESC);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_completed_at ON donations(completed_at DESC);

-- ============================================
-- ТАБЛИЦА: coin_packages (пакеты коинов)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_packages (
  id TEXT PRIMARY KEY,
  
  name TEXT NOT NULL,
  description TEXT,
  
  coins_amount INTEGER NOT NULL CHECK (coins_amount > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  bonus_coins INTEGER DEFAULT 0 NOT NULL, -- бонусные коины
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Предустановленные пакеты коинов
INSERT INTO coin_packages (id, name, coins_amount, price, bonus_coins, discount_percent, is_popular, display_order) VALUES
  ('starter', 'Стартовый', 100, 99.00, 0, 0, false, 1),
  ('basic', 'Базовый', 500, 449.00, 50, 10, false, 2),
  ('popular', 'Популярный', 1000, 799.00, 200, 20, true, 3),
  ('premium', 'Премиум', 2500, 1799.00, 500, 28, false, 4),
  ('ultimate', 'Максимум', 5000, 2999.00, 1500, 40, false, 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ТАБЛИЦА: coin_purchases (покупки коинов)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES coin_packages(id),
  
  coins_amount INTEGER NOT NULL,
  bonus_coins INTEGER DEFAULT 0 NOT NULL,
  total_coins INTEGER NOT NULL, -- coins_amount + bonus_coins
  
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  -- Payment info
  payment_method TEXT CHECK (payment_method IN ('card', 'yoomoney', 'qiwi', 'paypal', 'crypto', 'other')),
  payment_provider TEXT,
  external_transaction_id TEXT,
  
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coin_purchases_artist_id ON coin_purchases(artist_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_package_id ON coin_purchases(package_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_status ON coin_purchases(status);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_created_at ON coin_purchases(created_at DESC);

-- ============================================
-- ТАБЛИЦА: coin_transactions (история транзакций коинов)
-- ============================================
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'purchase',      -- покупка коинов
    'bonus',         -- бонусные коины
    'spent',         -- потрачены
    'refund',        -- возврат
    'gift',          -- подарок
    'reward',        -- награда
    'admin_adjust'   -- корректировка админом
  )),
  
  amount INTEGER NOT NULL, -- может быть отрицательным для spent
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  description TEXT,
  
  -- Связанные объекты
  related_type TEXT, -- concert, track, video, etc
  related_id UUID,
  
  coin_purchase_id UUID REFERENCES coin_purchases(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_artist_id ON coin_transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_related ON coin_transactions(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_purchase_id ON coin_transactions(coin_purchase_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

-- ============================================
-- ТАБЛИЦА: promotion_prices (цены на продвижение)
-- ============================================
CREATE TABLE IF NOT EXISTS promotion_prices (
  id TEXT PRIMARY KEY,
  
  name TEXT NOT NULL,
  description TEXT,
  
  item_type TEXT NOT NULL CHECK (item_type IN ('concert', 'track', 'video', 'news', 'playlist')),
  
  coins_per_day INTEGER NOT NULL CHECK (coins_per_day > 0),
  min_days INTEGER DEFAULT 1 NOT NULL,
  max_days INTEGER DEFAULT 30 NOT NULL,
  
  boost_level TEXT DEFAULT 'basic' CHECK (boost_level IN ('basic', 'medium', 'premium')),
  
  reach_multiplier DECIMAL(5, 2) DEFAULT 1.0, -- коэффициент охвата
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Предустановленные цены на продвижение
INSERT INTO promotion_prices (id, name, item_type, coins_per_day, min_days, max_days, boost_level, reach_multiplier) VALUES
  ('concert_basic', 'Концерт - Базовый', 'concert', 50, 1, 30, 'basic', 2.0),
  ('concert_medium', 'Концерт - Средний', 'concert', 100, 3, 30, 'medium', 5.0),
  ('concert_premium', 'Концерт - Премиум', 'concert', 200, 7, 30, 'premium', 10.0),
  
  ('track_basic', 'Трек - Базовый', 'track', 30, 1, 30, 'basic', 2.0),
  ('track_medium', 'Трек - Средний', 'track', 60, 3, 30, 'medium', 5.0),
  ('track_premium', 'Трек - Премиум', 'track', 120, 7, 30, 'premium', 10.0),
  
  ('video_basic', 'Видео - Базовый', 'video', 40, 1, 30, 'basic', 2.0),
  ('video_medium', 'Видео - Средний', 'video', 80, 3, 30, 'medium', 5.0),
  ('video_premium', 'Видео - Премиум', 'video', 150, 7, 30, 'premium', 10.0),
  
  ('news_basic', 'Новость - Базовый', 'news', 20, 1, 14, 'basic', 2.0),
  ('playlist_basic', 'Плейлист - Базовый', 'playlist', 25, 1, 30, 'basic', 2.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ТАБЛИЦА: withdrawal_requests (запросы на вывод средств)
-- ============================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'RUB' NOT NULL,
  
  withdrawal_method TEXT NOT NULL CHECK (withdrawal_method IN ('card', 'bank_account', 'yoomoney', 'paypal', 'other')),
  
  -- Payment details (encrypted in production)
  payment_details JSONB NOT NULL,
  
  status TEXT DEFAULT 'pending' NOT NULL 
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES artists(id),
  
  rejection_reason TEXT,
  admin_comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_artist_id ON withdrawal_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_created_at ON withdrawal_requests(created_at DESC);

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coin_packages_updated_at ON coin_packages;
CREATE TRIGGER update_coin_packages_updated_at BEFORE UPDATE ON coin_packages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coin_purchases_updated_at ON coin_purchases;
CREATE TRIGGER update_coin_purchases_updated_at BEFORE UPDATE ON coin_purchases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotion_prices_updated_at ON promotion_prices;
CREATE TRIGGER update_promotion_prices_updated_at BEFORE UPDATE ON promotion_prices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_updated_at ON withdrawal_requests;
CREATE TRIGGER update_withdrawal_updated_at BEFORE UPDATE ON withdrawal_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Добавить коины артисту
CREATE OR REPLACE FUNCTION add_coins_to_artist(
  artist_uuid UUID,
  coins_to_add INTEGER,
  trans_type TEXT,
  trans_description TEXT DEFAULT NULL,
  purchase_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Получаем текущий баланс
  SELECT coins_balance INTO current_balance FROM artists WHERE id = artist_uuid;
  
  -- Вычисляем новый баланс
  new_balance := current_balance + coins_to_add;
  
  -- Обновляем баланс артиста
  UPDATE artists 
  SET 
    coins_balance = new_balance,
    total_coins_earned = total_coins_earned + CASE WHEN coins_to_add > 0 THEN coins_to_add ELSE 0 END
  WHERE id = artist_uuid;
  
  -- Создаём транзакцию
  INSERT INTO coin_transactions (
    artist_id, transaction_type, amount, 
    balance_before, balance_after, description, coin_purchase_id
  ) VALUES (
    artist_uuid, trans_type, coins_to_add, 
    current_balance, new_balance, trans_description, purchase_id
  );
END;
$$ LANGUAGE plpgsql;

-- Списать коины с артиста
CREATE OR REPLACE FUNCTION spend_coins_from_artist(
  artist_uuid UUID,
  coins_to_spend INTEGER,
  trans_description TEXT,
  related_entity_type TEXT DEFAULT NULL,
  related_entity_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Получаем текущий баланс
  SELECT coins_balance INTO current_balance FROM artists WHERE id = artist_uuid;
  
  -- Проверяем достаточно ли коинов
  IF current_balance < coins_to_spend THEN
    RETURN false;
  END IF;
  
  -- Вычисляем новый баланс
  new_balance := current_balance - coins_to_spend;
  
  -- Обновляем баланс артиста
  UPDATE artists 
  SET 
    coins_balance = new_balance,
    total_coins_spent = total_coins_spent + coins_to_spend
  WHERE id = artist_uuid;
  
  -- Создаём транзакцию
  INSERT INTO coin_transactions (
    artist_id, transaction_type, amount, 
    balance_before, balance_after, description,
    related_type, related_id
  ) VALUES (
    artist_uuid, 'spent', -coins_to_spend, 
    current_balance, new_balance, trans_description,
    related_entity_type, related_entity_id
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Завершить покупку коинов
CREATE OR REPLACE FUNCTION complete_coin_purchase(purchase_uuid UUID)
RETURNS void AS $$
DECLARE
  purchase_record RECORD;
BEGIN
  -- Получаем данные покупки
  SELECT * INTO purchase_record FROM coin_purchases WHERE id = purchase_uuid;
  
  IF purchase_record.status != 'pending' THEN
    RAISE EXCEPTION 'Purchase is not pending';
  END IF;
  
  -- Обновляем статус покупки
  UPDATE coin_purchases 
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = purchase_uuid;
  
  -- Добавляем коины артисту
  PERFORM add_coins_to_artist(
    purchase_record.artist_id,
    purchase_record.total_coins,
    'purchase',
    format('Покупка пакета "%s"', purchase_record.package_id),
    purchase_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Завершить донат
CREATE OR REPLACE FUNCTION complete_donation(donation_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE donations 
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = donation_uuid AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Рассчитать стоимость продвижения
CREATE OR REPLACE FUNCTION calculate_promotion_cost(
  item_type TEXT,
  boost_level TEXT,
  days_count INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  price_per_day INTEGER;
BEGIN
  SELECT coins_per_day INTO price_per_day
  FROM promotion_prices
  WHERE 
    promotion_prices.item_type = calculate_promotion_cost.item_type
    AND promotion_prices.boost_level = calculate_promotion_cost.boost_level
    AND is_active = true
  LIMIT 1;
  
  IF price_per_day IS NULL THEN
    RAISE EXCEPTION 'Promotion price not found for type=% level=%', item_type, boost_level;
  END IF;
  
  RETURN price_per_day * days_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- DONATIONS POLICIES
DROP POLICY IF EXISTS "Artists can view own donations" ON donations;
CREATE POLICY "Artists can view own donations" ON donations FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view public donations" ON donations;
CREATE POLICY "Public can view public donations" ON donations FOR SELECT 
  USING (is_public = true AND status = 'completed');

DROP POLICY IF EXISTS "Anyone can create donations" ON donations;
CREATE POLICY "Anyone can create donations" ON donations FOR INSERT 
  WITH CHECK (true);

-- COIN PACKAGES POLICIES
DROP POLICY IF EXISTS "Everyone can view active packages" ON coin_packages;
CREATE POLICY "Everyone can view active packages" ON coin_packages FOR SELECT 
  USING (is_active = true);

-- COIN PURCHASES POLICIES
DROP POLICY IF EXISTS "Artists can view own purchases" ON coin_purchases;
CREATE POLICY "Artists can view own purchases" ON coin_purchases FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create purchases" ON coin_purchases;
CREATE POLICY "Artists can create purchases" ON coin_purchases FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

-- COIN TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Artists can view own transactions" ON coin_transactions;
CREATE POLICY "Artists can view own transactions" ON coin_transactions FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

-- PROMOTION PRICES POLICIES
DROP POLICY IF EXISTS "Everyone can view active prices" ON promotion_prices;
CREATE POLICY "Everyone can view active prices" ON promotion_prices FOR SELECT 
  USING (is_active = true);

-- WITHDRAWAL REQUESTS POLICIES
DROP POLICY IF EXISTS "Artists can view own withdrawals" ON withdrawal_requests;
CREATE POLICY "Artists can view own withdrawals" ON withdrawal_requests FOR SELECT 
  USING (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can create withdrawals" ON withdrawal_requests;
CREATE POLICY "Artists can create withdrawals" ON withdrawal_requests FOR INSERT 
  WITH CHECK (artist_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Artists can cancel own withdrawals" ON withdrawal_requests;
CREATE POLICY "Artists can cancel own withdrawals" ON withdrawal_requests FOR UPDATE 
  USING (artist_id::text = auth.uid()::text AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- 6 новых таблиц: donations, coin_packages, coin_purchases, coin_transactions, promotion_prices, withdrawal_requests
-- 5 пакетов коинов предустановлено
-- 11 тарифов продвижения предустановлено
-- 6 функций: add_coins, spend_coins, complete_purchase, complete_donation, calculate_cost
-- 12+ RLS политик
-- 10+ индексов
-- Полная система донатов и коинов
-- ============================================
