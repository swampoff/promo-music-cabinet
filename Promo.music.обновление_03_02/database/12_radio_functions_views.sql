-- =====================================================
-- PROMO.MUSIC - RADIO STATIONS FUNCTIONS & VIEWS
-- Функции и представления для радиостанций
-- =====================================================

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Получить профиль радиостанции по slug
CREATE OR REPLACE FUNCTION get_radio_station_by_slug(p_slug VARCHAR)
RETURNS TABLE (
  id UUID,
  station_name VARCHAR,
  tagline VARCHAR,
  description TEXT,
  station_type radio_station_type,
  primary_genre radio_genre,
  logo_url TEXT,
  rating DECIMAL,
  listeners_count INTEGER,
  is_verified BOOLEAN,
  status radio_station_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id,
    rs.station_name,
    rs.tagline,
    rs.description,
    rs.station_type,
    rs.primary_genre,
    rs.logo_url,
    rs.rating,
    rs.listeners_count,
    rs.is_verified,
    rs.status
  FROM radio_stations rs
  WHERE rs.slug = p_slug
    AND rs.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Подать заявку на добавление трека
CREATE OR REPLACE FUNCTION submit_radio_track_request(
  p_artist_id UUID,
  p_track_id UUID,
  p_station_id UUID,
  p_message TEXT DEFAULT NULL,
  p_pitch_text TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- Проверка: станция активна
  IF NOT EXISTS (
    SELECT 1 FROM radio_stations 
    WHERE id = p_station_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Station is not active';
  END IF;
  
  -- Проверка: трек существует
  IF NOT EXISTS (SELECT 1 FROM tracks WHERE id = p_track_id) THEN
    RAISE EXCEPTION 'Track not found';
  END IF;
  
  -- Создание заявки
  INSERT INTO radio_track_requests (
    artist_id,
    track_id,
    station_id,
    message,
    pitch_text,
    expires_at
  ) VALUES (
    p_artist_id,
    p_track_id,
    p_station_id,
    p_message,
    p_pitch_text,
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (artist_id, track_id, station_id) 
  DO UPDATE SET
    message = EXCLUDED.message,
    pitch_text = EXCLUDED.pitch_text,
    status = 'pending',
    submitted_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_request_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Одобрить заявку и добавить в ротацию
CREATE OR REPLACE FUNCTION approve_radio_request(
  p_request_id UUID,
  p_reviewed_by UUID,
  p_rotation_type rotation_type DEFAULT 'medium',
  p_plays_per_day INTEGER DEFAULT 3,
  p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID AS $$
DECLARE
  v_rotation_id UUID;
  v_track_id UUID;
  v_station_id UUID;
BEGIN
  -- Получаем данные заявки
  SELECT track_id, station_id INTO v_track_id, v_station_id
  FROM radio_track_requests
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  
  -- Добавляем в ротацию
  INSERT INTO radio_rotation (
    station_id,
    track_id,
    rotation_type,
    plays_per_day,
    start_date,
    added_by
  ) VALUES (
    v_station_id,
    v_track_id,
    p_rotation_type,
    p_plays_per_day,
    p_start_date,
    p_reviewed_by
  )
  ON CONFLICT (station_id, track_id)
  DO UPDATE SET
    rotation_type = EXCLUDED.rotation_type,
    plays_per_day = EXCLUDED.plays_per_day,
    is_active = TRUE,
    updated_at = NOW()
  RETURNING id INTO v_rotation_id;
  
  -- Обновляем статус заявки
  UPDATE radio_track_requests
  SET
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    approved_rotation_id = v_rotation_id,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN v_rotation_id;
END;
$$ LANGUAGE plpgsql;

-- Отклонить заявку
CREATE OR REPLACE FUNCTION reject_radio_request(
  p_request_id UUID,
  p_reviewed_by UUID,
  p_rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE radio_track_requests
  SET
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Записать воспроизведение трека
CREATE OR REPLACE FUNCTION log_radio_play(
  p_station_id UUID,
  p_track_id UUID,
  p_listeners_count INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  -- Записываем статистику
  INSERT INTO radio_statistics (
    station_id,
    track_id,
    played_at,
    listeners_count,
    stat_date
  ) VALUES (
    p_station_id,
    p_track_id,
    NOW(),
    p_listeners_count,
    CURRENT_DATE
  );
  
  -- Обновляем счетчик в ротации
  UPDATE radio_rotation
  SET
    total_plays = total_plays + 1,
    last_played_at = NOW()
  WHERE station_id = p_station_id
    AND track_id = p_track_id;
    
  -- Обновляем общую статистику станции
  UPDATE radio_stations
  SET
    total_plays = total_plays + 1,
    last_broadcast_at = NOW()
  WHERE id = p_station_id;
END;
$$ LANGUAGE plpgsql;

-- Получить следующий трек для воспроизведения
CREATE OR REPLACE FUNCTION get_next_track_for_rotation(
  p_station_id UUID,
  p_current_hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW())
)
RETURNS TABLE (
  track_id UUID,
  rotation_id UUID,
  rotation_type rotation_type,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rr.track_id,
    rr.id as rotation_id,
    rr.rotation_type,
    rr.priority
  FROM radio_rotation rr
  WHERE rr.station_id = p_station_id
    AND rr.is_active = TRUE
    AND CURRENT_DATE BETWEEN rr.start_date AND COALESCE(rr.end_date, CURRENT_DATE + INTERVAL '100 years')
    AND (rr.allowed_hours IS NULL OR p_current_hour = ANY(rr.allowed_hours))
    AND (
      rr.last_played_at IS NULL OR
      rr.last_played_at < NOW() - (rr.min_interval_minutes || ' minutes')::INTERVAL
    )
  ORDER BY 
    rr.priority DESC,
    RANDOM() -- Случайность с учетом приоритета
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Получить статистику радиостанции за период
CREATE OR REPLACE FUNCTION get_radio_station_stats(
  p_station_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_plays BIGINT,
  unique_tracks INTEGER,
  avg_listeners NUMERIC,
  peak_listeners INTEGER,
  top_tracks JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_plays,
    COUNT(DISTINCT track_id)::INTEGER as unique_tracks,
    AVG(listeners_count)::NUMERIC(10,2) as avg_listeners,
    MAX(listeners_count)::INTEGER as peak_listeners,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'track_id', track_id,
          'plays', plays_count
        )
        ORDER BY plays_count DESC
      )
      FROM (
        SELECT track_id, COUNT(*) as plays_count
        FROM radio_statistics
        WHERE station_id = p_station_id
          AND stat_date BETWEEN p_start_date AND p_end_date
        GROUP BY track_id
        ORDER BY plays_count DESC
        LIMIT 10
      ) top
    ) as top_tracks
  FROM radio_statistics
  WHERE station_id = p_station_id
    AND stat_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Обновить рейтинг радиостанции
CREATE OR REPLACE FUNCTION update_radio_station_rating(p_station_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg_rating DECIMAL(3,2);
  v_count INTEGER;
BEGIN
  SELECT 
    AVG(rating)::DECIMAL(3,2),
    COUNT(*)::INTEGER
  INTO v_avg_rating, v_count
  FROM radio_reviews
  WHERE station_id = p_station_id
    AND is_approved = TRUE;
  
  UPDATE radio_stations
  SET
    rating = COALESCE(v_avg_rating, 0.00),
    reviews_count = v_count
  WHERE id = p_station_id;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автообновления рейтинга
CREATE OR REPLACE FUNCTION trigger_update_radio_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_radio_station_rating(NEW.station_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_review
  AFTER INSERT OR UPDATE ON radio_reviews
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE)
  EXECUTE FUNCTION trigger_update_radio_rating();

-- =====================================================
-- VIEWS
-- =====================================================

-- Топ радиостанций
CREATE OR REPLACE VIEW v_top_radio_stations AS
SELECT 
  rs.id,
  rs.station_name,
  rs.slug,
  rs.tagline,
  rs.logo_url,
  rs.primary_genre,
  rs.station_type,
  rs.country,
  rs.city,
  rs.rating,
  rs.reviews_count,
  rs.listeners_count,
  rs.monthly_listeners,
  rs.is_verified,
  rs.audience_size,
  u.username as owner_username
FROM radio_stations rs
JOIN users u ON rs.user_id = u.id
WHERE rs.status = 'active'
ORDER BY rs.rating DESC, rs.listeners_count DESC;

-- Активные заявки на треки
CREATE OR REPLACE VIEW v_active_radio_requests AS
SELECT 
  rtr.id,
  rtr.status,
  rtr.submitted_at,
  rtr.is_priority,
  
  -- Артист
  u.username as artist_username,
  u.email as artist_email,
  
  -- Трек
  t.title as track_title,
  t.artist as track_artist,
  t.genre as track_genre,
  t.duration as track_duration,
  t.audio_url,
  
  -- Станция
  rs.station_name,
  rs.slug as station_slug,
  rs.primary_genre as station_genre,
  
  -- Сообщение
  rtr.message,
  rtr.pitch_text
FROM radio_track_requests rtr
JOIN users u ON rtr.artist_id = u.id
JOIN tracks t ON rtr.track_id = t.id
JOIN radio_stations rs ON rtr.station_id = rs.id
WHERE rtr.status IN ('pending', 'reviewing')
ORDER BY 
  rtr.is_priority DESC,
  rtr.submitted_at ASC;

-- Активная ротация станции
CREATE OR REPLACE VIEW v_radio_active_rotation AS
SELECT 
  rr.id,
  rr.station_id,
  rs.station_name,
  
  -- Трек
  t.id as track_id,
  t.title as track_title,
  t.artist as track_artist,
  t.genre as track_genre,
  t.duration as track_duration,
  
  -- Ротация
  rr.rotation_type,
  rr.plays_per_day,
  rr.priority,
  rr.total_plays,
  rr.last_played_at,
  rr.start_date,
  rr.end_date,
  
  -- Статистика
  (
    SELECT COUNT(*)
    FROM radio_statistics
    WHERE station_id = rr.station_id
      AND track_id = rr.track_id
      AND stat_date >= CURRENT_DATE - INTERVAL '7 days'
  ) as plays_last_7_days
FROM radio_rotation rr
JOIN radio_stations rs ON rr.station_id = rs.id
JOIN tracks t ON rr.track_id = t.id
WHERE rr.is_active = TRUE
  AND CURRENT_DATE BETWEEN rr.start_date AND COALESCE(rr.end_date, CURRENT_DATE + INTERVAL '100 years')
ORDER BY rs.station_name, rr.priority DESC;

-- Статистика станций за сегодня
CREATE OR REPLACE VIEW v_radio_daily_stats AS
SELECT 
  rs.id as station_id,
  rs.station_name,
  
  -- Сегодняшняя статистика
  COUNT(rst.id) as plays_today,
  COUNT(DISTINCT rst.track_id) as unique_tracks_today,
  AVG(rst.listeners_count)::INTEGER as avg_listeners_today,
  MAX(rst.listeners_count) as peak_listeners_today,
  
  -- Общая статистика
  rs.total_plays,
  rs.listeners_count as current_listeners,
  rs.rating
FROM radio_stations rs
LEFT JOIN radio_statistics rst ON rs.id = rst.station_id 
  AND rst.stat_date = CURRENT_DATE
WHERE rs.status = 'active'
GROUP BY rs.id, rs.station_name, rs.total_plays, rs.listeners_count, rs.rating
ORDER BY plays_today DESC;

-- Расписание передач на неделю
CREATE OR REPLACE VIEW v_radio_show_schedule AS
SELECT 
  rsh.id,
  rsh.station_id,
  rs.station_name,
  rsh.show_name,
  rsh.host_name,
  rsh.air_days,
  rsh.air_time,
  rsh.duration_minutes,
  rsh.status,
  rsh.next_airing_at,
  rsh.cover_image_url
FROM radio_shows rsh
JOIN radio_stations rs ON rsh.station_id = rs.id
WHERE rsh.status != 'cancelled'
  AND (
    rsh.next_airing_at IS NULL OR
    rsh.next_airing_at <= NOW() + INTERVAL '7 days'
  )
ORDER BY rsh.next_airing_at ASC NULLS LAST;

-- Топ треки в ротации (за месяц)
CREATE OR REPLACE VIEW v_radio_top_tracks_month AS
SELECT 
  t.id as track_id,
  t.title,
  t.artist,
  t.genre,
  t.cover_url,
  
  COUNT(DISTINCT rst.station_id) as stations_count,
  COUNT(rst.id) as total_plays,
  AVG(rst.listeners_count)::INTEGER as avg_listeners,
  
  jsonb_agg(DISTINCT 
    jsonb_build_object(
      'station_id', rs.id,
      'station_name', rs.station_name
    )
  ) as stations
FROM tracks t
JOIN radio_statistics rst ON t.id = rst.track_id
JOIN radio_stations rs ON rst.station_id = rs.id
WHERE rst.stat_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.id, t.title, t.artist, t.genre, t.cover_url
HAVING COUNT(rst.id) >= 10
ORDER BY total_plays DESC, stations_count DESC
LIMIT 100;

-- Аналитика для радиостанции
CREATE OR REPLACE VIEW v_radio_station_analytics AS
SELECT 
  rs.id,
  rs.station_name,
  rs.station_type,
  rs.primary_genre,
  
  -- Контент
  rs.total_tracks,
  (SELECT COUNT(*) FROM radio_rotation WHERE station_id = rs.id AND is_active = TRUE) as active_tracks,
  (SELECT COUNT(*) FROM radio_shows WHERE station_id = rs.id) as total_shows,
  
  -- Заявки
  (SELECT COUNT(*) FROM radio_track_requests WHERE station_id = rs.id AND status = 'pending') as pending_requests,
  (SELECT COUNT(*) FROM radio_track_requests WHERE station_id = rs.id AND status = 'approved') as approved_requests,
  (SELECT COUNT(*) FROM radio_track_requests WHERE station_id = rs.id) as total_requests,
  
  -- Статистика за неделю
  (SELECT COUNT(*) FROM radio_statistics WHERE station_id = rs.id AND stat_date >= CURRENT_DATE - 7) as plays_last_week,
  
  -- Статистика за месяц
  (SELECT COUNT(*) FROM radio_statistics WHERE station_id = rs.id AND stat_date >= CURRENT_DATE - 30) as plays_last_month,
  
  -- Рейтинг
  rs.rating,
  rs.reviews_count,
  
  -- Аудитория
  rs.listeners_count,
  rs.monthly_listeners,
  rs.audience_size,
  
  -- Даты
  rs.last_broadcast_at,
  rs.last_active_at
FROM radio_stations rs
WHERE rs.status = 'active';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_radio_station_by_slug(VARCHAR) IS 'Получить профиль радиостанции по slug';
COMMENT ON FUNCTION submit_radio_track_request(UUID, UUID, UUID, TEXT, TEXT) IS 'Подать заявку на добавление трека';
COMMENT ON FUNCTION approve_radio_request(UUID, UUID, rotation_type, INTEGER, DATE) IS 'Одобрить заявку и добавить в ротацию';
COMMENT ON FUNCTION reject_radio_request(UUID, UUID, TEXT) IS 'Отклонить заявку на трек';
COMMENT ON FUNCTION log_radio_play(UUID, UUID, INTEGER) IS 'Записать воспроизведение трека';
COMMENT ON FUNCTION get_next_track_for_rotation(UUID, INTEGER) IS 'Получить следующий трек для воспроизведения';
COMMENT ON FUNCTION get_radio_station_stats(UUID, DATE, DATE) IS 'Получить статистику радиостанции за период';
COMMENT ON FUNCTION update_radio_station_rating(UUID) IS 'Обновить рейтинг радиостанции';

COMMENT ON VIEW v_top_radio_stations IS 'Топ радиостанций по рейтингу и аудитории';
COMMENT ON VIEW v_active_radio_requests IS 'Активные заявки на добавление треков';
COMMENT ON VIEW v_radio_active_rotation IS 'Активная ротация всех станций';
COMMENT ON VIEW v_radio_daily_stats IS 'Ежедневная статистика радиостанций';
COMMENT ON VIEW v_radio_show_schedule IS 'Расписание передач на неделю';
COMMENT ON VIEW v_radio_top_tracks_month IS 'Топ треков в ротации за месяц';
COMMENT ON VIEW v_radio_station_analytics IS 'Аналитика для радиостанций';
