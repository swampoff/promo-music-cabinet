-- =====================================================
-- PROMO.MUSIC - OPTIMIZATION & PERFORMANCE INDEXES
-- Дополнительные индексы для производительности
-- =====================================================

-- =====================================================
-- COMPOSITE INDEXES для частых запросов
-- =====================================================

-- Поиск активных питчей пользователя
CREATE INDEX idx_pitches_user_status_created ON pitches(user_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- Поиск питчей плейлиста по статусу
CREATE INDEX idx_pitches_playlist_status_priority ON pitches(playlist_id, status, priority)
  WHERE status IN ('submitted', 'in_review');

-- Транзакции пользователя по типу и статусу
CREATE INDEX idx_transactions_user_type_status ON transactions(user_id, transaction_type, status, created_at DESC);

-- Активные подписки
CREATE INDEX idx_subscriptions_active_period ON user_subscriptions(user_id, status, current_period_end)
  WHERE status = 'active';

-- Непрочитанные уведомления
CREATE INDEX idx_notifications_user_unread_created ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

-- Открытые тикеты поддержки
CREATE INDEX idx_support_tickets_open_priority ON support_tickets(status, priority, created_at)
  WHERE status IN ('open', 'waiting_response', 'in_progress');

-- Назначенные тикеты агенту
CREATE INDEX idx_support_tickets_assigned_status ON support_tickets(assigned_to, status, created_at DESC)
  WHERE assigned_to IS NOT NULL;

-- Активные партнеры с кликами
CREATE INDEX idx_partner_clicks_partner_converted ON partner_clicks(partner_id, converted, created_at DESC);

-- Pending комиссии партнеров
CREATE INDEX idx_partner_commissions_status_partner ON partner_commissions(status, partner_id, created_at DESC)
  WHERE status = 'pending';

-- Поиск треков по жанру и верификации
CREATE INDEX idx_tracks_genre_verified_active ON tracks(primary_genre, is_verified, is_active)
  WHERE deleted_at IS NULL;

-- Плейлисты по платформе и активности
CREATE INDEX idx_playlists_platform_active_accepting ON playlists(platform, is_active, is_accepting_pitches);

-- Сессии пользователя активные
CREATE INDEX idx_user_sessions_user_active_expires ON user_sessions(user_id, is_active, expires_at DESC)
  WHERE is_active = TRUE;

-- =====================================================
-- PARTIAL INDEXES для специфичных случаев
-- =====================================================

-- Только verified артисты
CREATE INDEX idx_artist_profiles_verified_only ON artist_profiles(user_id, verified_at)
  WHERE is_verified_artist = TRUE;

-- Только expired подписки для cleanup
CREATE INDEX idx_subscriptions_expired ON user_subscriptions(current_period_end)
  WHERE status = 'active' AND current_period_end < NOW();

-- Только активные промокоды
CREATE INDEX idx_discount_codes_active_valid ON discount_codes(code, is_active, valid_from, valid_until)
  WHERE is_active = TRUE;

-- Только pending транзакции
CREATE INDEX idx_transactions_pending_created ON transactions(created_at)
  WHERE status = 'pending';

-- Только failed транзакции для retry
CREATE INDEX idx_email_queue_failed_retry ON email_queue(last_attempt_at, attempts)
  WHERE status = 'failed' AND attempts < max_attempts;

-- Только scheduled emails
CREATE INDEX idx_email_queue_scheduled_pending ON email_queue(scheduled_for)
  WHERE status = 'pending' AND scheduled_for IS NOT NULL;

-- =====================================================
-- GIN INDEXES для JSONB и arrays
-- =====================================================

-- Поиск по features в планах
CREATE INDEX idx_subscription_plans_features ON subscription_plans USING gin(features);

-- Поиск по genres в плейлистах
CREATE INDEX idx_playlists_accepted_genres ON playlists USING gin(accepted_genres);

-- Поиск по tags в треках
CREATE INDEX idx_tracks_tags ON tracks USING gin(tags);

-- Поиск по permissions
CREATE INDEX idx_user_permissions_key_value ON user_permissions USING gin(
  jsonb_build_object(permission_key, permission_value)
);

-- Метаданные транзакций
CREATE INDEX idx_transactions_metadata ON transactions USING gin(payment_metadata);

-- Settings пользователей
CREATE INDEX idx_user_settings_custom ON user_settings USING gin(custom_settings);

-- =====================================================
-- EXPRESSION INDEXES для вычисляемых значений
-- =====================================================

-- Lowercase email для case-insensitive поиска
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Lowercase username
CREATE INDEX idx_users_username_lower ON users(LOWER(username));

-- Year/Month для группировки по периодам
CREATE INDEX idx_transactions_year_month ON transactions(
  DATE_TRUNC('month', created_at), 
  transaction_type
) WHERE status = 'completed';

CREATE INDEX idx_pitches_year_month ON pitches(
  DATE_TRUNC('month', created_at),
  status
);

-- Расчет оставшихся дней подписки
CREATE INDEX idx_subscriptions_days_remaining ON user_subscriptions(
  EXTRACT(DAY FROM (current_period_end - NOW()))
) WHERE status = 'active';

-- =====================================================
-- COVERING INDEXES (Include columns)
-- =====================================================

-- Часто запрашиваемые поля pitches
CREATE INDEX idx_pitches_user_status_include ON pitches(user_id, status) 
  INCLUDE (track_id, playlist_id, payment_amount, created_at);

-- User info с email
CREATE INDEX idx_users_id_include_email ON users(id) 
  INCLUDE (email, username, role, status);

-- Transactions с amount
CREATE INDEX idx_transactions_user_type_include ON transactions(user_id, transaction_type)
  INCLUDE (amount, status, created_at);

-- =====================================================
-- STATISTICS для query planner
-- =====================================================

-- Увеличиваем statistics для часто фильтруемых колонок
ALTER TABLE pitches ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE pitches ALTER COLUMN priority SET STATISTICS 500;
ALTER TABLE transactions ALTER COLUMN transaction_type SET STATISTICS 1000;
ALTER TABLE transactions ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE users ALTER COLUMN role SET STATISTICS 500;
ALTER TABLE tracks ALTER COLUMN primary_genre SET STATISTICS 500;

-- =====================================================
-- VACUUM и ANALYZE настройки
-- =====================================================

-- Автовакуум для часто обновляемых таблиц
ALTER TABLE user_sessions SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE notifications SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE user_activity_log SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

ALTER TABLE email_queue SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- =====================================================
-- PARTITIONING подготовка для больших таблиц
-- =====================================================

-- Примечание: для партицирования по датам (для будущего масштабирования)
COMMENT ON TABLE user_activity_log IS 
  'Рекомендуется партицирование по created_at (monthly) при достижении 10M+ записей';

COMMENT ON TABLE system_logs IS 
  'Рекомендуется партицирование по created_at (weekly) при достижении 5M+ записей';

COMMENT ON TABLE api_requests IS 
  'Рекомендуется партицирование по created_at (daily) при достижении 50M+ записей';

COMMENT ON TABLE email_queue IS 
  'Рекомендуется партицирование по created_at (monthly) при достижении 10M+ записей';

-- =====================================================
-- MAINTENANCE QUERIES (для cron jobs)
-- =====================================================

-- Очистка старых логов (>90 дней)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM user_activity_log WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM api_requests WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Очистка expired сессий
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Обновление материализованных views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_playlists;
  REFRESH MATERIALIZED VIEW CONCURRENTLY partner_performance;
END;
$$ LANGUAGE plpgsql;

-- Проверка health базы данных
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
  metric VARCHAR,
  value TEXT,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Total Users'::VARCHAR,
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'WARNING' END
  FROM users
  
  UNION ALL
  
  SELECT 
    'Active Subscriptions'::VARCHAR,
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'INFO' END
  FROM user_subscriptions
  WHERE status = 'active'
  
  UNION ALL
  
  SELECT 
    'Total Pitches (24h)'::VARCHAR,
    COUNT(*)::TEXT,
    'OK'::VARCHAR
  FROM pitches
  WHERE created_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  SELECT 
    'Failed Transactions (24h)'::VARCHAR,
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 10 THEN 'WARNING' ELSE 'OK' END
  FROM transactions
  WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  SELECT 
    'Open Tickets'::VARCHAR,
    COUNT(*)::TEXT,
    CASE WHEN COUNT(*) > 100 THEN 'WARNING' ELSE 'OK' END
  FROM support_tickets
  WHERE status IN ('open', 'waiting_response', 'in_progress');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE MONITORING
-- =====================================================

-- Функция для поиска медленных запросов
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- более 100ms
ORDER BY mean_exec_time DESC
LIMIT 50;

-- Размеры таблиц
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Неиспользуемые индексы
CREATE OR REPLACE VIEW unused_indexes AS
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname !~ '^pg_toast'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Cache hit ratio
CREATE OR REPLACE VIEW cache_hit_ratio AS
SELECT 
  'Index Hit Rate' AS metric,
  ROUND(
    sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) * 100,
    2
  ) AS percentage
FROM pg_statio_user_indexes

UNION ALL

SELECT 
  'Table Hit Rate' AS metric,
  ROUND(
    sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0) * 100,
    2
  ) AS percentage
FROM pg_statio_user_tables;

COMMENT ON FUNCTION cleanup_old_logs() IS 'Очистка логов старше 90 дней - запускать ежедневно';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Очистка expired сессий - запускать ежедневно';
COMMENT ON FUNCTION refresh_all_materialized_views() IS 'Обновление всех materialized views - запускать каждые 15 минут';
COMMENT ON FUNCTION database_health_check() IS 'Health check базы данных';

COMMENT ON VIEW slow_queries IS 'Медленные запросы (требует pg_stat_statements extension)';
COMMENT ON VIEW table_sizes IS 'Размеры всех таблиц в БД';
COMMENT ON VIEW unused_indexes IS 'Неиспользуемые индексы (кандидаты на удаление)';
COMMENT ON VIEW cache_hit_ratio IS 'Процент попаданий в кеш (должен быть >95%)';

-- =====================================================
-- RECOMMENDATIONS
-- =====================================================

/*
РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ:

1. CRON JOBS (pg_cron или внешний scheduler):
   - Каждые 15 минут: SELECT refresh_all_materialized_views();
   - Ежедневно в 3:00: SELECT cleanup_old_logs();
   - Ежедневно в 3:30: SELECT cleanup_expired_sessions();
   - Еженедельно: VACUUM ANALYZE;

2. MONITORING:
   - Следить за cache_hit_ratio (должен быть >95%)
   - Проверять slow_queries регулярно
   - Удалять unused_indexes если не используются >30 дней

3. SCALING:
   - При 10M+ записей в user_activity_log - партицировать
   - При 100K+ активных пользователей - добавить read replicas
   - При 1M+ питчей в день - рассмотреть sharding

4. BACKUP:
   - Полный backup ежедневно
   - Point-in-time recovery включен
   - Тестировать recovery ежемесячно

5. CONNECTION POOLING:
   - Использовать PgBouncer для connection pooling
   - Max connections: 100-200
   - Pool size: 20-30 per app instance

6. SECURITY:
   - Регулярно ротировать API ключи
   - Мониторить failed login attempts
   - Включить SSL для всех соединений
   - Регулярный audit через audit_logs

7. PERFORMANCE:
   - Enable jit для сложных запросов
   - Настроить work_mem для агрегаций
   - Увеличить shared_buffers до 25% RAM
   - Настроить effective_cache_size
*/
