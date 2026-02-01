-- =====================================================
-- TRACK TEST SYSTEM - SQL SCHEMA
-- =====================================================
-- Дата: 28 января 2026
-- Версия: 1.0
-- Описание: Система профессиональной оценки треков экспертами

-- =====================================================
-- 1. ТАБЛИЦА ЗАЯВОК НА ТЕСТ ТРЕКОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS track_test_requests (
  -- Основные поля
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Пользователь (может быть NULL для гостей)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID,
  
  -- Гостевые данные (для незарегистрированных)
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  guest_track_url TEXT,
  guest_cover_url TEXT,
  
  -- Информация о треке
  track_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  
  -- Статусы
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Платеж
  payment_amount DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  payment_transaction_id VARCHAR(255),
  payment_method VARCHAR(50),
  
  -- Эксперты
  required_expert_count INTEGER NOT NULL DEFAULT 5 CHECK (required_expert_count BETWEEN 1 AND 10),
  completed_reviews_count INTEGER NOT NULL DEFAULT 0,
  assigned_experts JSONB DEFAULT '[]'::jsonb,
  
  -- Результаты
  average_rating DECIMAL(3, 1),
  category_averages JSONB,
  consolidated_feedback TEXT,
  consolidated_recommendations TEXT,
  
  -- Модерация
  moderation_notes TEXT,
  rejection_reason TEXT,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Индексы
  CONSTRAINT chk_status CHECK (status IN (
    'pending_payment',
    'pending_moderation',
    'moderation_rejected',
    'pending_expert_assignment',
    'experts_assigned',
    'review_in_progress',
    'pending_admin_review',
    'completed',
    'rejected'
  )),
  
  CONSTRAINT chk_payment_status CHECK (payment_status IN (
    'pending',
    'completed',
    'refunded'
  ))
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_track_test_requests_user_id ON track_test_requests(user_id);
CREATE INDEX idx_track_test_requests_status ON track_test_requests(status);
CREATE INDEX idx_track_test_requests_payment_status ON track_test_requests(payment_status);
CREATE INDEX idx_track_test_requests_created_at ON track_test_requests(created_at DESC);
CREATE INDEX idx_track_test_requests_guest_email ON track_test_requests(guest_email);

-- =====================================================
-- 2. ТАБЛИЦА ОЦЕНОК ЭКСПЕРТОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS track_test_reviews (
  -- Основные поля
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES track_test_requests(id) ON DELETE CASCADE,
  
  -- Информация об эксперте
  expert_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expert_email VARCHAR(255) NOT NULL,
  expert_name VARCHAR(255) NOT NULL,
  
  -- Статус оценки
  status VARCHAR(50) NOT NULL DEFAULT 'assigned',
  
  -- Оценки (1-10)
  mixing_mastering_score INTEGER CHECK (mixing_mastering_score BETWEEN 1 AND 10),
  arrangement_score INTEGER CHECK (arrangement_score BETWEEN 1 AND 10),
  originality_score INTEGER CHECK (originality_score BETWEEN 1 AND 10),
  commercial_potential_score INTEGER CHECK (commercial_potential_score BETWEEN 1 AND 10),
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 10),
  
  -- Фидбек (детальный)
  mixing_mastering_feedback TEXT,
  arrangement_feedback TEXT,
  originality_feedback TEXT,
  commercial_potential_feedback TEXT,
  general_feedback TEXT,
  recommendations TEXT,
  
  -- Награда за оценку
  reward_points INTEGER NOT NULL DEFAULT 50,
  reward_paid BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Индексы
  CONSTRAINT chk_review_status CHECK (status IN (
    'assigned',
    'in_progress',
    'completed'
  ))
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_track_test_reviews_request_id ON track_test_reviews(request_id);
CREATE INDEX idx_track_test_reviews_expert_id ON track_test_reviews(expert_id);
CREATE INDEX idx_track_test_reviews_expert_email ON track_test_reviews(expert_email);
CREATE INDEX idx_track_test_reviews_status ON track_test_reviews(status);
CREATE INDEX idx_track_test_reviews_created_at ON track_test_reviews(created_at DESC);

-- =====================================================
-- 3. ТАБЛИЦА ЭКСПЕРТОВ
-- =====================================================

CREATE TABLE IF NOT EXISTS track_test_experts (
  -- Основные поля
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Информация об эксперте
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  
  -- Специализация
  genres JSONB DEFAULT '[]'::jsonb,
  specializations JSONB DEFAULT '[]'::jsonb,
  
  -- Опыт и квалификация
  years_of_experience INTEGER,
  credentials TEXT,
  portfolio_url TEXT,
  
  -- Статистика
  total_reviews INTEGER NOT NULL DEFAULT 0,
  average_expert_rating DECIMAL(3, 1),
  total_rewards_earned INTEGER NOT NULL DEFAULT 0,
  
  -- Статус
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Настройки
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": false
  }'::jsonb,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT chk_expert_status CHECK (status IN (
    'active',
    'inactive',
    'suspended'
  ))
);

-- Индексы
CREATE INDEX idx_track_test_experts_email ON track_test_experts(email);
CREATE INDEX idx_track_test_experts_status ON track_test_experts(status);
CREATE INDEX idx_track_test_experts_genres ON track_test_experts USING GIN (genres);

-- =====================================================
-- 4. ТРИГГЕРЫ
-- =====================================================

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_track_test_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применить триггер к таблицам
CREATE TRIGGER track_test_requests_updated_at
  BEFORE UPDATE ON track_test_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_track_test_updated_at();

CREATE TRIGGER track_test_reviews_updated_at
  BEFORE UPDATE ON track_test_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_track_test_updated_at();

CREATE TRIGGER track_test_experts_updated_at
  BEFORE UPDATE ON track_test_experts
  FOR EACH ROW
  EXECUTE FUNCTION update_track_test_updated_at();

-- =====================================================
-- 5. ФУНКЦИИ БАЗЫ ДАННЫХ
-- =====================================================

-- Функция для расчета средних оценок заявки
CREATE OR REPLACE FUNCTION calculate_request_averages(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'mixing_mastering', ROUND(AVG(mixing_mastering_score)::numeric, 1),
    'arrangement', ROUND(AVG(arrangement_score)::numeric, 1),
    'originality', ROUND(AVG(originality_score)::numeric, 1),
    'commercial_potential', ROUND(AVG(commercial_potential_score)::numeric, 1),
    'overall', ROUND(AVG(overall_score)::numeric, 1)
  )
  INTO v_result
  FROM track_test_reviews
  WHERE request_id = p_request_id
    AND status = 'completed';
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики эксперта
CREATE OR REPLACE FUNCTION get_expert_statistics(p_expert_email VARCHAR)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_reviews', COUNT(*),
    'completed_reviews', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_reviews', COUNT(*) FILTER (WHERE status IN ('assigned', 'in_progress')),
    'total_rewards', SUM(reward_points) FILTER (WHERE reward_paid = TRUE),
    'average_scores', jsonb_build_object(
      'mixing_mastering', ROUND(AVG(mixing_mastering_score)::numeric, 1),
      'arrangement', ROUND(AVG(arrangement_score)::numeric, 1),
      'originality', ROUND(AVG(originality_score)::numeric, 1),
      'commercial_potential', ROUND(AVG(commercial_potential_score)::numeric, 1),
      'overall', ROUND(AVG(overall_score)::numeric, 1)
    )
  )
  INTO v_result
  FROM track_test_reviews
  WHERE expert_email = p_expert_email;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения заявок пользователя
CREATE OR REPLACE FUNCTION get_user_track_test_requests(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  track_title VARCHAR,
  artist_name VARCHAR,
  status VARCHAR,
  payment_status VARCHAR,
  average_rating DECIMAL,
  completed_reviews_count INTEGER,
  required_expert_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.track_title,
    r.artist_name,
    r.status,
    r.payment_status,
    r.average_rating,
    r.completed_reviews_count,
    r.required_expert_count,
    r.created_at,
    r.completed_at
  FROM track_test_requests r
  WHERE r.user_id = p_user_id
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения оценок заявки с деталями экспертов
CREATE OR REPLACE FUNCTION get_request_reviews_with_experts(p_request_id UUID)
RETURNS TABLE (
  review_id UUID,
  expert_name VARCHAR,
  expert_email VARCHAR,
  status VARCHAR,
  mixing_mastering_score INTEGER,
  arrangement_score INTEGER,
  originality_score INTEGER,
  commercial_potential_score INTEGER,
  overall_score INTEGER,
  general_feedback TEXT,
  recommendations TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.expert_name,
    r.expert_email,
    r.status,
    r.mixing_mastering_score,
    r.arrangement_score,
    r.originality_score,
    r.commercial_potential_score,
    r.overall_score,
    r.general_feedback,
    r.recommendations,
    r.completed_at
  FROM track_test_reviews r
  WHERE r.request_id = p_request_id
  ORDER BY r.completed_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Включить RLS
ALTER TABLE track_test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_test_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_test_experts ENABLE ROW LEVEL SECURITY;

-- Политики для track_test_requests

-- Пользователи видят только свои заявки
CREATE POLICY "Users can view own requests"
  ON track_test_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут создавать заявки
CREATE POLICY "Users can create requests"
  ON track_test_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои заявки (до определенного статуса)
CREATE POLICY "Users can update own pending requests"
  ON track_test_requests FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pending_payment', 'pending_moderation'));

-- Администраторы видят все заявки
CREATE POLICY "Admins can view all requests"
  ON track_test_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Администраторы могут обновлять любые заявки
CREATE POLICY "Admins can update all requests"
  ON track_test_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Политики для track_test_reviews

-- Эксперты видят только назначенные им оценки
CREATE POLICY "Experts can view assigned reviews"
  ON track_test_reviews FOR SELECT
  USING (expert_id = auth.uid() OR expert_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Эксперты могут обновлять свои оценки
CREATE POLICY "Experts can update own reviews"
  ON track_test_reviews FOR UPDATE
  USING (expert_id = auth.uid() OR expert_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

-- Пользователи видят оценки своих заявок
CREATE POLICY "Users can view reviews of own requests"
  ON track_test_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM track_test_requests
    WHERE id = track_test_reviews.request_id
      AND user_id = auth.uid()
      AND status = 'completed'
  ));

-- Администраторы видят все оценки
CREATE POLICY "Admins can view all reviews"
  ON track_test_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Политики для track_test_experts

-- Все авторизованные пользователи видят экспертов
CREATE POLICY "Authenticated users can view experts"
  ON track_test_experts FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'active');

-- Эксперты могут обновлять свои профили
CREATE POLICY "Experts can update own profile"
  ON track_test_experts FOR UPDATE
  USING (user_id = auth.uid());

-- Администраторы могут управлять экспертами
CREATE POLICY "Admins can manage experts"
  ON track_test_experts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  ));

-- =====================================================
-- 7. ПРЕДСТАВЛЕНИЯ (VIEWS)
-- =====================================================

-- Представление для полной информации о заявках
CREATE OR REPLACE VIEW track_test_requests_full AS
SELECT 
  r.*,
  COUNT(rev.id) as total_reviews,
  COUNT(rev.id) FILTER (WHERE rev.status = 'completed') as completed_reviews,
  COALESCE(AVG(rev.overall_score) FILTER (WHERE rev.status = 'completed'), 0) as calculated_average_rating
FROM track_test_requests r
LEFT JOIN track_test_reviews rev ON rev.request_id = r.id
GROUP BY r.id;

-- Представление для статистики экспертов
CREATE OR REPLACE VIEW track_test_expert_stats AS
SELECT 
  e.*,
  COUNT(r.id) as total_reviews_count,
  COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_reviews_count,
  AVG(r.overall_score) FILTER (WHERE r.status = 'completed') as average_rating_given,
  SUM(r.reward_points) FILTER (WHERE r.reward_paid = TRUE) as total_rewards_earned
FROM track_test_experts e
LEFT JOIN track_test_reviews r ON r.expert_email = e.email
GROUP BY e.id;

-- =====================================================
-- 8. НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- =====================================================

-- Добавить тестовых экспертов
INSERT INTO track_test_experts (email, name, bio, genres, specializations, years_of_experience, status, is_verified)
VALUES 
  ('expert1@promo.music', 'Алексей Громов', 'Профессиональный звукорежиссер с 15-летним опытом. Работал с топовыми российскими артистами.', 
   '["Electronic", "Pop", "Hip-Hop"]'::jsonb, 
   '["Mixing", "Mastering"]'::jsonb, 
   15, 'active', TRUE),
  
  ('expert2@promo.music', 'Мария Светлова', 'Композитор и аранжировщик. Специализируюсь на поп и электронной музыке.', 
   '["Pop", "Electronic", "Dance"]'::jsonb, 
   '["Arrangement", "Composition"]'::jsonb, 
   10, 'active', TRUE),
  
  ('expert3@promo.music', 'Дмитрий Басов', 'A&R менеджер с опытом работы в крупном лейбле. Эксперт по коммерческому потенциалу.', 
   '["Pop", "Rock", "Hip-Hop", "R&B"]'::jsonb, 
   '["Commercial Potential", "Marketing"]'::jsonb, 
   12, 'active', TRUE),
  
  ('expert4@promo.music', 'Елена Мелодина', 'Музыкальный продюсер и композитор. Фокус на оригинальности и инновациях.', 
   '["Indie", "Alternative", "Experimental"]'::jsonb, 
   '["Production", "Originality"]'::jsonb, 
   8, 'active', TRUE),
  
  ('expert5@promo.music', 'Сергей Ритмов', 'Диджей и продюсер электронной музыки. Эксперт по современным трендам.', 
   '["Electronic", "House", "Techno", "EDM"]'::jsonb, 
   '["Electronic Production", "Trends"]'::jsonb, 
   7, 'active', TRUE)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 9. КОММЕНТАРИИ К ТАБЛИЦАМ
-- =====================================================

COMMENT ON TABLE track_test_requests IS 'Заявки на профессиональную оценку треков экспертами';
COMMENT ON TABLE track_test_reviews IS 'Оценки треков от экспертов';
COMMENT ON TABLE track_test_experts IS 'Профили экспертов для оценки треков';

COMMENT ON COLUMN track_test_requests.status IS 'Статус заявки в workflow';
COMMENT ON COLUMN track_test_requests.payment_status IS 'Статус оплаты (pending/completed/refunded)';
COMMENT ON COLUMN track_test_requests.required_expert_count IS 'Количество требуемых оценок (1-10)';
COMMENT ON COLUMN track_test_requests.category_averages IS 'JSON с средними оценками по категориям';

COMMENT ON COLUMN track_test_reviews.mixing_mastering_score IS 'Оценка качества сведения и мастеринга (1-10)';
COMMENT ON COLUMN track_test_reviews.arrangement_score IS 'Оценка аранжировки (1-10)';
COMMENT ON COLUMN track_test_reviews.originality_score IS 'Оценка оригинальности (1-10)';
COMMENT ON COLUMN track_test_reviews.commercial_potential_score IS 'Оценка коммерческого потенциала (1-10)';
COMMENT ON COLUMN track_test_reviews.overall_score IS 'Общая оценка (1-10)';

-- =====================================================
-- ЗАВЕРШЕНО
-- =====================================================
