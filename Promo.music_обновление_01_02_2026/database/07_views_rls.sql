-- =====================================================
-- PROMO.MUSIC - VIEWS & ROW LEVEL SECURITY
-- Представления и политики безопасности
-- =====================================================

-- =====================================================
-- MATERIALIZED VIEWS для производительности
-- =====================================================

-- VIEW: Статистика пользователей
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  u.id AS user_id,
  u.username,
  u.role,
  u.created_at AS registered_at,
  
  -- Питчинг
  COUNT(DISTINCT p.id) AS total_pitches,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'accepted') AS accepted_pitches,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'rejected') AS rejected_pitches,
  CASE 
    WHEN COUNT(DISTINCT p.id) > 0 
    THEN ROUND((COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'accepted')::DECIMAL / 
                COUNT(DISTINCT p.id)) * 100, 2)
    ELSE 0
  END AS success_rate,
  
  -- Финансы
  COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type IN ('pitch_payment', 'subscription')), 0) AS total_spent,
  COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'deposit'), 0) AS total_deposited,
  
  -- Треки
  COUNT(DISTINCT tr.id) AS total_tracks,
  
  -- Активность
  MAX(us.last_activity_at) AS last_activity,
  COUNT(DISTINCT us.id) AS total_sessions,
  
  -- Поддержка
  COUNT(DISTINCT st.id) AS total_tickets,
  COUNT(DISTINCT st.id) FILTER (WHERE st.status = 'resolved') AS resolved_tickets
  
FROM users u
LEFT JOIN pitches p ON p.user_id = u.id
LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'completed'
LEFT JOIN tracks tr ON tr.user_id = u.id
LEFT JOIN user_sessions us ON us.user_id = u.id
LEFT JOIN support_tickets st ON st.user_id = u.id
GROUP BY u.id, u.username, u.role, u.created_at;

CREATE UNIQUE INDEX ON user_statistics (user_id);
COMMENT ON MATERIALIZED VIEW user_statistics IS 'Агрегированная статистика пользователей';

-- VIEW: Популярные плейлисты
CREATE MATERIALIZED VIEW popular_playlists AS
SELECT 
  pl.id,
  pl.name,
  pl.platform,
  pl.curator_id,
  u.username AS curator_username,
  pl.followers_count,
  pl.genres,
  
  -- Статистика питчинга
  COUNT(DISTINCT p.id) AS total_pitches,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'accepted') AS accepted_pitches,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'rejected') AS rejected_pitches,
  CASE 
    WHEN COUNT(DISTINCT p.id) > 0 
    THEN ROUND((COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'accepted')::DECIMAL / 
                COUNT(DISTINCT p.id)) * 100, 2)
    ELSE 0
  END AS acceptance_rate,
  
  -- Средний response time
  AVG(EXTRACT(EPOCH FROM (p.curator_reviewed_at - p.submitted_at)) / 3600) 
    AS avg_response_hours,
  
  -- Доход от питчинга
  COALESCE(SUM(p.payment_amount) FILTER (WHERE p.status = 'accepted'), 0) AS total_revenue,
  
  pl.is_active,
  pl.is_accepting_pitches
  
FROM playlists pl
JOIN users u ON pl.curator_id = u.id
LEFT JOIN pitches p ON p.playlist_id = pl.id
GROUP BY pl.id, pl.name, pl.platform, pl.curator_id, u.username, 
         pl.followers_count, pl.genres, pl.is_active, pl.is_accepting_pitches;

CREATE UNIQUE INDEX ON popular_playlists (id);
COMMENT ON MATERIALIZED VIEW popular_playlists IS 'Популярные плейлисты с статистикой';

-- VIEW: Активные партнеры
CREATE MATERIALIZED VIEW partner_performance AS
SELECT 
  ptr.id AS partner_id,
  ptr.user_id,
  u.username,
  ptr.referral_code,
  ptr.tier,
  ptr.commission_rate,
  ptr.status,
  
  -- Рефералы
  COUNT(DISTINCT ur.referred_id) AS total_referrals,
  COUNT(DISTINCT ur.referred_id) FILTER (WHERE ur.status = 'completed') AS active_referrals,
  
  -- Клики
  COUNT(DISTINCT pc.id) AS total_clicks,
  COUNT(DISTINCT pc.id) FILTER (WHERE pc.converted = TRUE) AS total_conversions,
  CASE 
    WHEN COUNT(DISTINCT pc.id) > 0 
    THEN ROUND((COUNT(DISTINCT pc.id) FILTER (WHERE pc.converted = TRUE)::DECIMAL / 
                COUNT(DISTINCT pc.id)) * 100, 2)
    ELSE 0
  END AS conversion_rate,
  
  -- Заработок
  COALESCE(SUM(pcom.commission_amount), 0) AS total_earnings,
  COALESCE(SUM(pcom.commission_amount) FILTER (WHERE pcom.status = 'pending'), 0) AS pending_earnings,
  COALESCE(SUM(pcom.commission_amount) FILTER (WHERE pcom.status = 'paid'), 0) AS paid_earnings,
  
  -- Даты
  ptr.created_at,
  MAX(pc.created_at) AS last_click_at,
  MAX(pcom.created_at) AS last_commission_at
  
FROM partners ptr
JOIN users u ON ptr.user_id = u.id
LEFT JOIN user_referrals ur ON ur.referrer_id = ptr.user_id
LEFT JOIN partner_clicks pc ON pc.partner_id = ptr.id
LEFT JOIN partner_commissions pcom ON pcom.partner_id = ptr.id
GROUP BY ptr.id, ptr.user_id, u.username, ptr.referral_code, ptr.tier, 
         ptr.commission_rate, ptr.status, ptr.created_at;

CREATE UNIQUE INDEX ON partner_performance (partner_id);
COMMENT ON MATERIALIZED VIEW partner_performance IS 'Производительность партнеров';

-- =====================================================
-- REGULAR VIEWS (не материализованные)
-- =====================================================

-- VIEW: Активные подписки
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  us.id AS subscription_id,
  us.user_id,
  u.username,
  u.email,
  sp.name AS plan_name,
  sp.plan_type,
  us.billing_period,
  us.final_price,
  us.status,
  us.current_period_start,
  us.current_period_end,
  us.pitches_used_this_period,
  us.pitches_limit,
  sp.is_pitches_unlimited,
  CASE 
    WHEN sp.is_pitches_unlimited THEN 0
    WHEN us.pitches_limit > 0 THEN 
      ROUND(((us.pitches_limit - us.pitches_used_this_period)::DECIMAL / us.pitches_limit) * 100, 0)
    ELSE 0
  END AS remaining_percentage
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active' AND us.current_period_end > NOW();

COMMENT ON VIEW active_subscriptions IS 'Активные подписки пользователей';

-- VIEW: Pending модерация
CREATE OR REPLACE VIEW pending_moderation AS
SELECT 
  'track' AS content_type,
  t.id,
  t.user_id,
  u.username,
  t.title AS content_title,
  t.moderation_status,
  t.created_at,
  NULL::UUID AS pitch_id
FROM tracks t
JOIN users u ON t.user_id = u.id
WHERE t.moderation_status = 'pending'

UNION ALL

SELECT 
  'pitch' AS content_type,
  p.id,
  p.user_id,
  u.username,
  tr.title AS content_title,
  p.moderation_status,
  p.created_at,
  p.id AS pitch_id
FROM pitches p
JOIN users u ON p.user_id = u.id
JOIN tracks tr ON p.track_id = tr.id
WHERE p.moderation_status = 'pending'

ORDER BY created_at ASC;

COMMENT ON VIEW pending_moderation IS 'Контент ожидающий модерации';

-- VIEW: Revenue breakdown
CREATE OR REPLACE VIEW revenue_breakdown AS
SELECT 
  DATE_TRUNC('day', t.created_at) AS date,
  
  -- По типам
  SUM(t.amount) FILTER (WHERE t.transaction_type = 'subscription') AS subscription_revenue,
  SUM(t.amount) FILTER (WHERE t.transaction_type = 'pitch_payment') AS pitch_revenue,
  SUM(t.amount) FILTER (WHERE t.transaction_type = 'deposit') AS deposit_revenue,
  
  -- Комиссии
  SUM(t.platform_fee) AS platform_fees,
  SUM(t.partner_commission) AS partner_commissions,
  
  -- Refunds
  SUM(t.amount) FILTER (WHERE t.transaction_type = 'refund') AS refunds,
  
  -- Net
  SUM(t.net_amount) AS net_revenue,
  
  -- Количество
  COUNT(*) AS transaction_count,
  AVG(t.amount) AS avg_transaction_value
  
FROM transactions t
WHERE t.status = 'completed'
GROUP BY DATE_TRUNC('day', t.created_at)
ORDER BY date DESC;

COMMENT ON VIEW revenue_breakdown IS 'Разбивка доходов по дням';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Включаем RLS на всех основных таблицах
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: users
-- =====================================================

-- Пользователи могут видеть свой профиль
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Админы видят всех
CREATE POLICY users_select_admin ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- RLS POLICIES: tracks
-- =====================================================

-- Пользователи видят свои треки
CREATE POLICY tracks_select_own ON tracks
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Пользователи могут создавать треки
CREATE POLICY tracks_insert_own ON tracks
  FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Пользователи могут обновлять свои треки
CREATE POLICY tracks_update_own ON tracks
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Модераторы видят все треки
CREATE POLICY tracks_select_moderator ON tracks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- RLS POLICIES: pitches
-- =====================================================

-- Пользователи видят свои питчи
CREATE POLICY pitches_select_own ON pitches
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR
    -- Кураторы видят питчи на свои плейлисты
    playlist_id IN (
      SELECT id FROM playlists 
      WHERE curator_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- Пользователи могут создавать питчи
CREATE POLICY pitches_insert_own ON pitches
  FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Пользователи обновляют свои питчи, кураторы - питчи на свои плейлисты
CREATE POLICY pitches_update_own_or_curator ON pitches
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR
    playlist_id IN (
      SELECT id FROM playlists 
      WHERE curator_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- =====================================================
-- RLS POLICIES: transactions
-- =====================================================

-- Пользователи видят свои транзакции
CREATE POLICY transactions_select_own ON transactions
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Админы видят все транзакции
CREATE POLICY transactions_select_admin ON transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES: subscriptions
-- =====================================================

-- Пользователи видят свои подписки
CREATE POLICY subscriptions_select_own ON user_subscriptions
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- RLS POLICIES: support_tickets
-- =====================================================

-- Пользователи видят свои тикеты
CREATE POLICY support_tickets_select_own ON support_tickets
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR
    -- Назначенные агенты видят свои тикеты
    assigned_to IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Пользователи создают тикеты
CREATE POLICY support_tickets_insert_own ON support_tickets
  FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Support агенты видят все тикеты
CREATE POLICY support_tickets_select_support ON support_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'support', 'moderator')
    )
  );

-- Support агенты обновляют тикеты
CREATE POLICY support_tickets_update_support ON support_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'support', 'moderator')
    )
  );

-- =====================================================
-- RLS POLICIES: notifications
-- =====================================================

-- Пользователи видят свои уведомления
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Пользователи обновляют свои уведомления (отметка прочитанным)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- =====================================================
-- RLS POLICIES: partners
-- =====================================================

-- Партнеры видят свои данные
CREATE POLICY partners_select_own ON partners
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Партнеры обновляют свои данные
CREATE POLICY partners_update_own ON partners
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Админы видят всех партнеров
CREATE POLICY partners_select_admin ON partners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- RLS POLICIES: partner_commissions
-- =====================================================

-- Партнеры видят свои комиссии
CREATE POLICY partner_commissions_select_own ON partner_commissions
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

COMMENT ON POLICY users_select_own ON users IS 'Пользователи видят свой профиль';
COMMENT ON POLICY tracks_select_own ON tracks IS 'Пользователи видят свои треки';
COMMENT ON POLICY pitches_select_own ON pitches IS 'Пользователи/кураторы видят свои питчи';
COMMENT ON POLICY transactions_select_own ON transactions IS 'Пользователи видят свои транзакции';
COMMENT ON POLICY notifications_select_own ON notifications IS 'Пользователи видят свои уведомления';

-- Команды для обновления материализованных view
COMMENT ON MATERIALIZED VIEW user_statistics IS 
  'Обновить: REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics';
COMMENT ON MATERIALIZED VIEW popular_playlists IS 
  'Обновить: REFRESH MATERIALIZED VIEW CONCURRENTLY popular_playlists';
COMMENT ON MATERIALIZED VIEW partner_performance IS 
  'Обновить: REFRESH MATERIALIZED VIEW CONCURRENTLY partner_performance';
