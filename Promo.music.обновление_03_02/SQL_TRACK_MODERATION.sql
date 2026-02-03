-- ============================================
-- СИСТЕМА МОДЕРАЦИИ ТРЕКОВ - SQL SCHEMA
-- ============================================
-- Версия: 1.0.0
-- Дата: 29 января 2026
-- Платформа: Supabase PostgreSQL
-- ============================================

-- ============================================
-- ТАБЛИЦА: pending_tracks_84730125
-- Очередь модерации треков
-- ============================================

CREATE TABLE IF NOT EXISTS pending_tracks_84730125 (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ========================================
  -- ОСНОВНЫЕ ДАННЫЕ ТРЕКА
  -- ========================================
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  cover_image_url TEXT NOT NULL,
  audio_file_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- в секундах
  genre VARCHAR(100) NOT NULL,
  
  -- ========================================
  -- ССЫЛКИ НА СТРИМИНГОВЫЕ ПЛАТФОРМЫ
  -- ========================================
  yandex_music_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  
  -- ========================================
  -- ИНФОРМАЦИЯ О ЗАГРУЗИВШЕМ
  -- ========================================
  uploaded_by_email VARCHAR(255) NOT NULL,
  uploaded_by_user_id UUID NOT NULL,
  
  -- ========================================
  -- СТАТУСЫ
  -- ========================================
  moderation_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending → approved → approved_and_migrated
  --        ↘ rejected
  
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending → paid → (модерация)
  --        ↘ failed
  
  price DECIMAL(10, 2) DEFAULT 500.00,
  
  -- ========================================
  -- ДАННЫЕ МОДЕРАЦИИ
  -- ========================================
  overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 10),
  moderator_notes TEXT,
  rejection_reason TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by_user_id UUID,
  
  -- ========================================
  -- СВЯЗИ С ПРОФИЛЯМИ
  -- ========================================
  artist_profile_id UUID,
  label_id UUID,
  
  -- ========================================
  -- ССЫЛКА НА ОПУБЛИКОВАННЫЙ ТРЕК
  -- ========================================
  published_track_id UUID,
  
  -- ========================================
  -- МЕТАДАННЫЕ
  -- ========================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ========================================
  -- CONSTRAINTS
  -- ========================================
  CONSTRAINT fk_uploaded_by_user 
    FOREIGN KEY (uploaded_by_user_id) 
    REFERENCES users_84730125(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_artist_profile 
    FOREIGN KEY (artist_profile_id) 
    REFERENCES artist_profiles_84730125(id) 
    ON DELETE SET NULL,
    
  CONSTRAINT fk_label 
    FOREIGN KEY (label_id) 
    REFERENCES label_profiles_84730125(id) 
    ON DELETE SET NULL,
    
  CONSTRAINT fk_published_track 
    FOREIGN KEY (published_track_id) 
    REFERENCES tracks_84730125(id) 
    ON DELETE SET NULL,
    
  CONSTRAINT fk_moderated_by 
    FOREIGN KEY (moderated_by_user_id) 
    REFERENCES users_84730125(id) 
    ON DELETE SET NULL,
    
  CONSTRAINT check_moderation_status 
    CHECK (moderation_status IN ('pending', 'approved', 'approved_and_migrated', 'rejected')),
    
  CONSTRAINT check_payment_status 
    CHECK (payment_status IN ('pending', 'paid', 'failed'))
);

-- ========================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ========================================

CREATE INDEX IF NOT EXISTS idx_pending_tracks_moderation_status 
  ON pending_tracks_84730125(moderation_status);

CREATE INDEX IF NOT EXISTS idx_pending_tracks_uploaded_by_email 
  ON pending_tracks_84730125(uploaded_by_email);

CREATE INDEX IF NOT EXISTS idx_pending_tracks_uploaded_by_user 
  ON pending_tracks_84730125(uploaded_by_user_id);

CREATE INDEX IF NOT EXISTS idx_pending_tracks_genre 
  ON pending_tracks_84730125(genre);

CREATE INDEX IF NOT EXISTS idx_pending_tracks_created_at 
  ON pending_tracks_84730125(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pending_tracks_artist_profile 
  ON pending_tracks_84730125(artist_profile_id);

CREATE INDEX IF NOT EXISTS idx_pending_tracks_label 
  ON pending_tracks_84730125(label_id);

-- ========================================
-- TRIGGER: Автообновление updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_pending_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pending_tracks_updated_at
  BEFORE UPDATE ON pending_tracks_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_tracks_updated_at();

-- ============================================
-- ОБНОВЛЕНИЕ ТАБЛИЦЫ: tracks_84730125
-- Добавление полей для связи с модерацией
-- ============================================

-- Добавить поле source_pending_id (если еще не существует)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks_84730125' 
    AND column_name = 'source_pending_id'
  ) THEN
    ALTER TABLE tracks_84730125 
    ADD COLUMN source_pending_id UUID;
    
    ALTER TABLE tracks_84730125
    ADD CONSTRAINT fk_source_pending
    FOREIGN KEY (source_pending_id)
    REFERENCES pending_tracks_84730125(id)
    ON DELETE SET NULL;
    
    CREATE INDEX idx_tracks_source_pending 
    ON tracks_84730125(source_pending_id);
  END IF;
END $$;

-- Добавить поле uploaded_by_user_id (если еще не существует)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks_84730125' 
    AND column_name = 'uploaded_by_user_id'
  ) THEN
    ALTER TABLE tracks_84730125 
    ADD COLUMN uploaded_by_user_id UUID;
    
    ALTER TABLE tracks_84730125
    ADD CONSTRAINT fk_tracks_uploaded_by_user
    FOREIGN KEY (uploaded_by_user_id)
    REFERENCES users_84730125(id)
    ON DELETE SET NULL;
    
    CREATE INDEX idx_tracks_uploaded_by_user 
    ON tracks_84730125(uploaded_by_user_id);
  END IF;
END $$;

-- ============================================
-- ФУНКЦИЯ: Получить количество загрузок за месяц
-- ============================================

CREATE OR REPLACE FUNCTION get_monthly_upload_count_84730125(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM pending_tracks_84730125
  WHERE uploaded_by_user_id = p_user_id
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
    
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ФУНКЦИЯ: Получить лимит загрузок по подписке
-- ============================================

CREATE OR REPLACE FUNCTION get_upload_limit_by_subscription_84730125(
  p_subscription_type VARCHAR(50)
)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE p_subscription_type
    WHEN 'basic' THEN 1
    WHEN 'artist_start' THEN 3
    WHEN 'artist_pro' THEN 10
    WHEN 'artist_elite' THEN 999
    ELSE 1 -- По умолчанию базовый план
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- VIEW: pending_tracks_with_user_info
-- Удобное представление с данными пользователя
-- ============================================

CREATE OR REPLACE VIEW pending_tracks_with_user_info_84730125 AS
SELECT 
  pt.*,
  u.email as uploader_email,
  u.app_role as uploader_role,
  u.subscription_type as uploader_subscription,
  ap.stage_name as artist_stage_name,
  lp.name as label_name,
  t.title as published_track_title,
  t.status as published_track_status
FROM pending_tracks_84730125 pt
LEFT JOIN users_84730125 u ON pt.uploaded_by_user_id = u.id
LEFT JOIN artist_profiles_84730125 ap ON pt.artist_profile_id = ap.id
LEFT JOIN label_profiles_84730125 lp ON pt.label_id = lp.id
LEFT JOIN tracks_84730125 t ON pt.published_track_id = t.id;

-- ============================================
-- RLS (Row Level Security) ПОЛИТИКИ
-- ============================================

-- Включить RLS
ALTER TABLE pending_tracks_84730125 ENABLE ROW LEVEL SECURITY;

-- Политика: Админы видят все
CREATE POLICY "Admins can view all pending tracks"
  ON pending_tracks_84730125
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_84730125
      WHERE id = auth.uid()
      AND app_role IN ('admin', 'supervisor_admin', 'owner')
    )
  );

-- Политика: Пользователи видят только свои треки
CREATE POLICY "Users can view their own pending tracks"
  ON pending_tracks_84730125
  FOR SELECT
  USING (uploaded_by_user_id = auth.uid());

-- Политика: Артисты и лейблы могут создавать
CREATE POLICY "Artists and labels can create pending tracks"
  ON pending_tracks_84730125
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_84730125
      WHERE id = auth.uid()
      AND app_role IN ('artist', 'label')
    )
    AND uploaded_by_user_id = auth.uid()
  );

-- Политика: Пользователи могут обновлять свои треки (до модерации)
CREATE POLICY "Users can update their own pending tracks"
  ON pending_tracks_84730125
  FOR UPDATE
  USING (
    uploaded_by_user_id = auth.uid()
    AND moderation_status = 'pending'
  );

-- Политика: Админы могут обновлять все треки
CREATE POLICY "Admins can update all pending tracks"
  ON pending_tracks_84730125
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users_84730125
      WHERE id = auth.uid()
      AND app_role IN ('admin', 'supervisor_admin', 'owner')
    )
  );

-- ============================================
-- СТАТИСТИКА ДЛЯ АДМИНКИ
-- ============================================

CREATE OR REPLACE VIEW pending_tracks_stats_84730125 AS
SELECT 
  moderation_status,
  COUNT(*) as count,
  AVG(overall_score) as avg_score
FROM pending_tracks_84730125
GROUP BY moderation_status;

-- ============================================
-- КОММЕНТАРИИ К ТАБЛИЦЕ
-- ============================================

COMMENT ON TABLE pending_tracks_84730125 IS 'Очередь модерации треков перед публикацией';
COMMENT ON COLUMN pending_tracks_84730125.moderation_status IS 'Статус модерации: pending/approved/approved_and_migrated/rejected';
COMMENT ON COLUMN pending_tracks_84730125.payment_status IS 'Статус оплаты: pending/paid/failed';
COMMENT ON COLUMN pending_tracks_84730125.overall_score IS 'Оценка модератора от 1 до 10';
COMMENT ON COLUMN pending_tracks_84730125.published_track_id IS 'Ссылка на опубликованный трек после одобрения';
COMMENT ON COLUMN pending_tracks_84730125.source_pending_id IS 'Обратная ссылка из tracks на pending_tracks';

-- ============================================
-- ГОТОВО! ✅
-- ============================================

-- Проверка созданных объектов:
SELECT 
  'pending_tracks_84730125' as table_name,
  COUNT(*) as row_count
FROM pending_tracks_84730125
UNION ALL
SELECT 
  'indexes',
  COUNT(*)
FROM pg_indexes
WHERE tablename = 'pending_tracks_84730125'
UNION ALL
SELECT 
  'constraints',
  COUNT(*)
FROM information_schema.table_constraints
WHERE table_name = 'pending_tracks_84730125';

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ (для разработки)
-- ============================================

-- Вставить тестовый pending трек (раскомментировать при необходимости)
/*
INSERT INTO pending_tracks_84730125 (
  title, artist, cover_image_url, audio_file_url,
  duration, genre,
  uploaded_by_email, uploaded_by_user_id,
  moderation_status, payment_status
) VALUES (
  'Test Track',
  'Test Artist',
  'https://example.com/cover.jpg',
  'https://example.com/audio.mp3',
  180,
  'Rock',
  'test@example.com',
  (SELECT id FROM users_84730125 WHERE email = 'test@example.com' LIMIT 1),
  'pending',
  'pending'
);
*/
