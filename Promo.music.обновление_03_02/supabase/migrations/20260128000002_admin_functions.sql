-- =====================================================
-- ADMIN FUNCTIONS - Функции для админ-панели
-- =====================================================

-- =====================================================
-- GET ADMIN STATS - Получить общую статистику
-- =====================================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM users_extended),
      'active', (SELECT COUNT(*) FROM users_extended WHERE status = 'active'),
      'pending', (SELECT COUNT(*) FROM users_extended WHERE status = 'pending'),
      'new_today', (SELECT COUNT(*) FROM users_extended WHERE DATE(created_at) = CURRENT_DATE),
      'by_role', (
        SELECT json_object_agg(role, count)
        FROM (
          SELECT role, COUNT(*) as count
          FROM users_extended
          GROUP BY role
        ) t
      )
    ),
    'content', json_build_object(
      'tracks_total', (SELECT COUNT(*) FROM tracks),
      'tracks_pending', (SELECT COUNT(*) FROM tracks WHERE status = 'pending'),
      'tracks_approved', (SELECT COUNT(*) FROM tracks WHERE status = 'approved'),
      'videos_total', (SELECT COUNT(*) FROM videos),
      'videos_pending', (SELECT COUNT(*) FROM videos WHERE status = 'pending'),
      'videos_approved', (SELECT COUNT(*) FROM videos WHERE status = 'approved'),
      'concerts_total', (SELECT COUNT(*) FROM concerts),
      'concerts_pending', (SELECT COUNT(*) FROM concerts WHERE status = 'pending'),
      'news_total', (SELECT COUNT(*) FROM news),
      'news_pending', (SELECT COUNT(*) FROM news WHERE status = 'pending')
    ),
    'requests', json_build_object(
      'pitching_total', (SELECT COUNT(*) FROM pitching_requests),
      'pitching_pending', (SELECT COUNT(*) FROM pitching_requests WHERE status = 'pending'),
      'pitching_in_progress', (SELECT COUNT(*) FROM pitching_requests WHERE status = 'in_progress')
    ),
    'finance', json_build_object(
      'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'completed'),
      'total_payouts', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal' AND status = 'completed'),
      'pending_payouts', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdrawal' AND status = 'pending')
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET PENDING MODERATION - Получить контент на модерации
-- =====================================================
CREATE OR REPLACE FUNCTION get_pending_moderation()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'tracks', (
      SELECT json_agg(
        json_build_object(
          'id', t.id,
          'title', t.title,
          'artist_name', t.artist_name,
          'genre', t.genre,
          'cover_url', t.cover_url,
          'duration_seconds', t.duration_seconds,
          'created_at', t.created_at,
          'user', json_build_object(
            'id', u.id,
            'display_name', u.display_name,
            'avatar_url', u.avatar_url
          )
        )
      )
      FROM tracks t
      LEFT JOIN users_extended u ON t.user_id = u.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at DESC
      LIMIT 50
    ),
    'videos', (
      SELECT json_agg(
        json_build_object(
          'id', v.id,
          'title', v.title,
          'thumbnail_url', v.thumbnail_url,
          'duration_seconds', v.duration_seconds,
          'created_at', v.created_at,
          'user', json_build_object(
            'id', u.id,
            'display_name', u.display_name,
            'avatar_url', u.avatar_url
          )
        )
      )
      FROM videos v
      LEFT JOIN users_extended u ON v.user_id = u.id
      WHERE v.status = 'pending'
      ORDER BY v.created_at DESC
      LIMIT 50
    ),
    'concerts', (
      SELECT json_agg(
        json_build_object(
          'id', c.id,
          'title', c.title,
          'city', c.city,
          'venue', c.venue,
          'event_date', c.event_date,
          'created_at', c.created_at,
          'user', json_build_object(
            'id', u.id,
            'display_name', u.display_name
          )
        )
      )
      FROM concerts c
      LEFT JOIN users_extended u ON c.user_id = u.id
      WHERE c.status = 'pending'
      ORDER BY c.created_at DESC
      LIMIT 50
    ),
    'news', (
      SELECT json_agg(
        json_build_object(
          'id', n.id,
          'title', n.title,
          'category', n.category,
          'created_at', n.created_at,
          'user', json_build_object(
            'id', u.id,
            'display_name', u.display_name
          )
        )
      )
      FROM news n
      LEFT JOIN users_extended u ON n.user_id = u.id
      WHERE n.status = 'pending'
      ORDER BY n.created_at DESC
      LIMIT 50
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MODERATE TRACK - Модерация трека
-- =====================================================
CREATE OR REPLACE FUNCTION moderate_track(
  p_track_id UUID,
  p_admin_id UUID,
  p_action TEXT, -- 'approve' or 'reject'
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  result JSON;
BEGIN
  -- Проверка действия
  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid action. Must be approve or reject';
  END IF;
  
  -- Получить user_id трека
  SELECT user_id INTO v_user_id FROM tracks WHERE id = p_track_id;
  
  -- Обновить статус трека
  UPDATE tracks
  SET 
    status = CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'rejected' END,
    moderation_notes = p_notes,
    moderated_by = p_admin_id,
    moderated_at = NOW(),
    published_at = CASE WHEN p_action = 'approve' THEN NOW() ELSE NULL END
  WHERE id = p_track_id;
  
  -- Создать уведомление пользователю
  INSERT INTO notifications (user_id, type, title, message, priority)
  VALUES (
    v_user_id,
    'moderation',
    CASE WHEN p_action = 'approve' THEN 'Трек одобрен ✅' ELSE 'Трек отклонен ❌' END,
    CASE 
      WHEN p_action = 'approve' THEN 'Ваш трек прошел модерацию и опубликован!'
      ELSE 'Ваш трек не прошел модерацию. ' || COALESCE(p_notes, 'Причина не указана.')
    END,
    CASE WHEN p_action = 'approve' THEN 'normal' ELSE 'high' END
  );
  
  -- Вернуть результат
  SELECT json_build_object(
    'success', true,
    'action', p_action,
    'track_id', p_track_id
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MODERATE VIDEO - Модерация видео
-- =====================================================
CREATE OR REPLACE FUNCTION moderate_video(
  p_video_id UUID,
  p_admin_id UUID,
  p_action TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  result JSON;
BEGIN
  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;
  
  SELECT user_id INTO v_user_id FROM videos WHERE id = p_video_id;
  
  UPDATE videos
  SET 
    status = CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'rejected' END,
    moderation_notes = p_notes,
    moderated_by = p_admin_id,
    moderated_at = NOW(),
    published_at = CASE WHEN p_action = 'approve' THEN NOW() ELSE NULL END
  WHERE id = p_video_id;
  
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    v_user_id,
    'moderation',
    CASE WHEN p_action = 'approve' THEN 'Видео одобрено ✅' ELSE 'Видео отклонено ❌' END,
    CASE 
      WHEN p_action = 'approve' THEN 'Ваше видео прошло модерацию!'
      ELSE 'Ваше видео не прошло модерацию. ' || COALESCE(p_notes, '')
    END
  );
  
  SELECT json_build_object('success', true, 'action', p_action) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET USERS BY ROLE - Получить пользователей по роли
-- =====================================================
CREATE OR REPLACE FUNCTION get_users_by_role(
  p_role TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', (
      SELECT json_agg(t)
      FROM (
        SELECT 
          id,
          username,
          display_name,
          email,
          phone,
          avatar_url,
          role,
          status,
          verified,
          followers_count,
          total_plays,
          balance,
          coins_balance,
          subscription_tier,
          last_active_at,
          created_at
        FROM users_extended
        WHERE 
          (p_role IS NULL OR role = p_role) AND
          (p_status IS NULL OR status = p_status)
        ORDER BY created_at DESC
        LIMIT p_limit
        OFFSET p_offset
      ) t
    ),
    'total', (
      SELECT COUNT(*)
      FROM users_extended
      WHERE 
        (p_role IS NULL OR role = p_role) AND
        (p_status IS NULL OR status = p_status)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE USER STATUS - Обновить статус пользователя
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_status(
  p_user_id UUID,
  p_admin_id UUID,
  p_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  IF p_status NOT IN ('active', 'suspended', 'banned') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  
  UPDATE users_extended
  SET status = p_status
  WHERE id = p_user_id;
  
  INSERT INTO notifications (user_id, type, title, message, priority)
  VALUES (
    p_user_id,
    'system',
    'Изменение статуса аккаунта',
    'Статус вашего аккаунта изменен на: ' || p_status || '. ' || COALESCE(p_reason, ''),
    'high'
  );
  
  RETURN json_build_object('success', true, 'status', p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GET FINANCIAL STATS - Финансовая статистика
-- =====================================================
CREATE OR REPLACE FUNCTION get_financial_stats(
  p_period TEXT DEFAULT 'month' -- 'day', 'week', 'month', 'year'
)
RETURNS JSON AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  result JSON;
BEGIN
  -- Определить начало периода
  v_period_start := CASE p_period
    WHEN 'day' THEN CURRENT_DATE
    WHEN 'week' THEN CURRENT_DATE - INTERVAL '7 days'
    WHEN 'month' THEN CURRENT_DATE - INTERVAL '30 days'
    WHEN 'year' THEN CURRENT_DATE - INTERVAL '365 days'
    ELSE CURRENT_DATE - INTERVAL '30 days'
  END;
  
  SELECT json_build_object(
    'revenue', (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE type IN ('deposit', 'purchase') 
        AND status = 'completed'
        AND created_at >= v_period_start
    ),
    'payouts', (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE type = 'withdrawal'
        AND status = 'completed'
        AND created_at >= v_period_start
    ),
    'pending_payouts', (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE type = 'withdrawal'
        AND status = 'pending'
    ),
    'transactions_count', (
      SELECT COUNT(*)
      FROM transactions
      WHERE created_at >= v_period_start
    ),
    'by_type', (
      SELECT json_object_agg(type, total)
      FROM (
        SELECT type, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE created_at >= v_period_start AND status = 'completed'
        GROUP BY type
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_moderation() TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_track(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION moderate_video(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_role(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_status(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_stats(TEXT) TO authenticated;
