-- ============================================
-- EVENT MANAGEMENT - РАСШИРЕННАЯ СИСТЕМА
-- ============================================
-- 
-- ВАЖНО: Выполните этот SQL в Supabase Dashboard:
-- 1. Откройте https://supabase.com/dashboard/project/qzpmiiqfwkcnrhvubdgt
-- 2. Перейдите в SQL Editor
-- 3. Скопируйте и выполните весь этот SQL
-- 
-- Эта миграция дополняет 001_promotion_tables.sql
-- и добавляет расширенные возможности для управления мероприятиями
-- ============================================

-- ============================================
-- ТАБЛИЦА: event_venues
-- Площадки для проведения мероприятий
-- ============================================
CREATE TABLE IF NOT EXISTS event_venues (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_type TEXT NOT NULL
    CHECK (venue_type IN ('club', 'concert_hall', 'arena', 'stadium', 'festival_ground', 'bar', 'restaurant', 'outdoor', 'theater', 'other')),
  city TEXT NOT NULL,
  address TEXT DEFAULT '',
  capacity INTEGER NOT NULL,
  standing_capacity INTEGER DEFAULT 0,
  seated_capacity INTEGER DEFAULT 0,
  stage_size TEXT DEFAULT '',
  equipment_available TEXT[] DEFAULT ARRAY[]::TEXT[],
  has_sound_system BOOLEAN DEFAULT false,
  has_lighting BOOLEAN DEFAULT false,
  has_backstage BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  contact_person TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  rental_price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'RUB',
  website TEXT DEFAULT '',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_venues_artist ON event_venues(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_venues_city ON event_venues(city);
CREATE INDEX IF NOT EXISTS idx_event_venues_type ON event_venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_event_venues_capacity ON event_venues(capacity);
CREATE INDEX IF NOT EXISTS idx_event_venues_favorite ON event_venues(is_favorite) WHERE is_favorite = true;

COMMENT ON TABLE event_venues IS 'База площадок для проведения мероприятий';

-- ============================================
-- ТАБЛИЦА: event_tickets
-- Управление билетами и продажами
-- ============================================
CREATE TABLE IF NOT EXISTS event_tickets (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL
    CHECK (ticket_type IN ('early_bird', 'standard', 'vip', 'backstage', 'table', 'fan_zone', 'seated', 'standing', 'online')),
  ticket_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  quantity_total INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_total - quantity_sold - quantity_reserved) STORED,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  includes TEXT[] DEFAULT ARRAY[]::TEXT[],
  restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_type ON event_tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_event_tickets_active ON event_tickets(is_active) WHERE is_active = true;

COMMENT ON TABLE event_tickets IS 'Билеты на мероприятия и их продажа';

-- ============================================
-- ТАБЛИЦА: event_sales
-- Продажи билетов (транзакции)
-- ============================================
CREATE TABLE IF NOT EXISTS event_sales (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL REFERENCES event_tickets(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  currency TEXT DEFAULT 'RUB',
  payment_method TEXT DEFAULT 'online'
    CHECK (payment_method IN ('online', 'cash', 'card', 'bank_transfer', 'crypto')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  promo_code TEXT DEFAULT '',
  discount_amount INTEGER DEFAULT 0,
  service_fee INTEGER DEFAULT 0,
  sale_channel TEXT DEFAULT 'website'
    CHECK (sale_channel IN ('website', 'mobile_app', 'box_office', 'partner', 'social_media')),
  ticket_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_sales_event ON event_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sales_ticket ON event_sales(ticket_id);
CREATE INDEX IF NOT EXISTS idx_event_sales_buyer_email ON event_sales(buyer_email);
CREATE INDEX IF NOT EXISTS idx_event_sales_status ON event_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_sales_created ON event_sales(created_at DESC);

COMMENT ON TABLE event_sales IS 'Транзакции продажи билетов';

-- ============================================
-- ТАБЛИЦА: event_team
-- Команда мероприятия
-- ============================================
CREATE TABLE IF NOT EXISTS event_team (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN ('manager', 'sound_engineer', 'light_engineer', 'stage_manager', 'security', 'photographer', 'videographer', 'promoter', 'dj', 'host', 'backup_artist', 'other')),
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  compensation INTEGER DEFAULT 0,
  compensation_type TEXT DEFAULT 'fixed'
    CHECK (compensation_type IN ('fixed', 'hourly', 'percentage', 'free')),
  currency TEXT DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'confirmed', 'declined', 'cancelled', 'completed')),
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_team_event ON event_team(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_role ON event_team(role);
CREATE INDEX IF NOT EXISTS idx_event_team_status ON event_team(status);

COMMENT ON TABLE event_team IS 'Команда и персонал мероприятия';

-- ============================================
-- ТАБЛИЦА: event_riders
-- Технические райдеры
-- ============================================
CREATE TABLE IF NOT EXISTS event_riders (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  rider_type TEXT NOT NULL
    CHECK (rider_type IN ('technical', 'hospitality', 'stage_plot', 'input_list', 'lighting', 'backline')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  requirements JSONB DEFAULT '[]'::jsonb,
  equipment_list JSONB DEFAULT '[]'::jsonb,
  hospitality_items JSONB DEFAULT '[]'::jsonb,
  special_requests TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'negotiating')),
  file_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_riders_event ON event_riders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_riders_type ON event_riders(rider_type);
CREATE INDEX IF NOT EXISTS idx_event_riders_status ON event_riders(status);

COMMENT ON TABLE event_riders IS 'Технические и hospitality райдеры';

-- ============================================
-- ТАБЛИЦА: event_budget
-- Бюджет мероприятия (детализация)
-- ============================================
CREATE TABLE IF NOT EXISTS event_budget (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  category TEXT NOT NULL
    CHECK (category IN ('venue_rental', 'equipment', 'sound', 'lighting', 'team', 'marketing', 'hospitality', 'transportation', 'accommodation', 'permits', 'insurance', 'merchandise', 'other')),
  item_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget_type TEXT NOT NULL
    CHECK (budget_type IN ('expense', 'income')),
  amount_planned INTEGER NOT NULL,
  amount_actual INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'approved', 'paid', 'pending', 'cancelled')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT DEFAULT '',
  invoice_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_budget_event ON event_budget(event_id);
CREATE INDEX IF NOT EXISTS idx_event_budget_category ON event_budget(category);
CREATE INDEX IF NOT EXISTS idx_event_budget_type ON event_budget(budget_type);
CREATE INDEX IF NOT EXISTS idx_event_budget_status ON event_budget(status);

COMMENT ON TABLE event_budget IS 'Детальный бюджет мероприятия';

-- ============================================
-- ТАБЛИЦА: event_promotion
-- Продвижение мероприятия
-- ============================================
CREATE TABLE IF NOT EXISTS event_promotion (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  channel TEXT NOT NULL
    CHECK (channel IN ('social_media', 'email', 'sms', 'poster', 'radio', 'tv', 'online_ads', 'press', 'influencer', 'street_team', 'partner')),
  channel_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'RUB',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost_per_click DECIMAL(10,2) DEFAULT 0,
  cost_per_conversion DECIMAL(10,2) DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  creative_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_promotion_event ON event_promotion(event_id);
CREATE INDEX IF NOT EXISTS idx_event_promotion_channel ON event_promotion(channel);
CREATE INDEX IF NOT EXISTS idx_event_promotion_status ON event_promotion(status);

COMMENT ON TABLE event_promotion IS 'Каналы продвижения мероприятий';

-- ============================================
-- ТАБЛИЦА: event_timeline
-- Тайминг и расписание мероприятия
-- ============================================
CREATE TABLE IF NOT EXISTS event_timeline (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  timeline_type TEXT NOT NULL
    CHECK (timeline_type IN ('load_in', 'soundcheck', 'doors_open', 'opener', 'main_act', 'break', 'encore', 'load_out', 'other')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  actual_time TIMESTAMPTZ,
  actual_duration INTEGER,
  responsible_person TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_timeline_event ON event_timeline(event_id);
CREATE INDEX IF NOT EXISTS idx_event_timeline_type ON event_timeline(timeline_type);
CREATE INDEX IF NOT EXISTS idx_event_timeline_scheduled ON event_timeline(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_event_timeline_status ON event_timeline(status);

COMMENT ON TABLE event_timeline IS 'Таймлайн и расписание мероприятия';

-- ============================================
-- ТАБЛИЦА: event_feedback
-- Отзывы и обратная связь после мероприятия
-- ============================================
CREATE TABLE IF NOT EXISTS event_feedback (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL
    CHECK (feedback_type IN ('attendee', 'venue', 'team_member', 'sponsor', 'partner', 'internal')),
  author_name TEXT DEFAULT '',
  author_email TEXT DEFAULT '',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  likes TEXT[] DEFAULT ARRAY[]::TEXT[],
  dislikes TEXT[] DEFAULT ARRAY[]::TEXT[],
  suggestions TEXT DEFAULT '',
  would_attend_again BOOLEAN,
  source TEXT DEFAULT 'email'
    CHECK (source IN ('email', 'website', 'social_media', 'in_person', 'phone', 'survey')),
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_event ON event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_type ON event_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_event_feedback_rating ON event_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_event_feedback_public ON event_feedback(is_public) WHERE is_public = true;

COMMENT ON TABLE event_feedback IS 'Отзывы и обратная связь о мероприятиях';

-- ============================================
-- ТАБЛИЦА: event_setlists
-- Сет-листы выступлений
-- ============================================
CREATE TABLE IF NOT EXISTS event_setlists (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  setlist_type TEXT DEFAULT 'main'
    CHECK (setlist_type IN ('main', 'opener', 'encore', 'dj_set', 'soundcheck')),
  title TEXT NOT NULL,
  songs JSONB DEFAULT '[]'::jsonb,
  total_duration_minutes INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  is_final BOOLEAN DEFAULT false,
  performed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_setlists_event ON event_setlists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_setlists_type ON event_setlists(setlist_type);

COMMENT ON TABLE event_setlists IS 'Сет-листы для выступлений';

-- ============================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ============================================

-- Финансовая сводка по мероприятию
CREATE OR REPLACE VIEW event_financial_summary AS
SELECT 
  e.id as event_id,
  e.artist_id,
  e.event_name,
  e.event_date,
  e.status,
  -- Доход от билетов
  COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.total_price ELSE 0 END), 0) as ticket_revenue,
  -- Количество проданных билетов
  COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END), 0) as tickets_sold,
  -- Запланированные расходы
  COALESCE((SELECT SUM(amount_planned) FROM event_budget WHERE event_id = e.id AND budget_type = 'expense'), 0) as expenses_planned,
  -- Фактические расходы
  COALESCE((SELECT SUM(amount_actual) FROM event_budget WHERE event_id = e.id AND budget_type = 'expense'), 0) as expenses_actual,
  -- Прибыль (фактическая)
  COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.total_price ELSE 0 END), 0) - 
  COALESCE((SELECT SUM(amount_actual) FROM event_budget WHERE event_id = e.id AND budget_type = 'expense'), 0) as profit,
  -- Бюджет маркетинга
  COALESCE((SELECT SUM(budget) FROM event_promotion WHERE event_id = e.id), 0) as marketing_budget,
  -- ROI маркетинга
  CASE 
    WHEN (SELECT SUM(budget) FROM event_promotion WHERE event_id = e.id) > 0 
    THEN ROUND((COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.total_price ELSE 0 END), 0)::DECIMAL / 
         (SELECT SUM(budget) FROM event_promotion WHERE event_id = e.id) - 1) * 100, 2)
    ELSE 0 
  END as marketing_roi
FROM event_requests e
LEFT JOIN event_sales es ON es.event_id = e.id
GROUP BY e.id, e.artist_id, e.event_name, e.event_date, e.status;

-- Предстоящие мероприятия
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
  e.id,
  e.artist_id,
  e.event_name,
  e.event_type,
  e.city,
  e.venue,
  e.event_date,
  e.status,
  v.capacity,
  v.venue_type,
  COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END), 0) as tickets_sold,
  v.capacity - COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END), 0) as tickets_remaining,
  CASE 
    WHEN v.capacity > 0 THEN 
      ROUND((COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END), 0)::DECIMAL / v.capacity * 100), 2)
    ELSE 0 
  END as fill_rate_percent,
  e.created_at
FROM event_requests e
LEFT JOIN event_venues v ON v.venue_name = e.venue AND v.city = e.city
LEFT JOIN event_sales es ON es.event_id = e.id
WHERE e.event_date >= CURRENT_DATE
  AND e.status NOT IN ('cancelled', 'completed')
GROUP BY e.id, e.artist_id, e.event_name, e.event_type, e.city, e.venue, e.event_date, e.status, v.capacity, v.venue_type, e.created_at
ORDER BY e.event_date ASC;

-- Статистика посещаемости мероприятий
CREATE OR REPLACE VIEW event_attendance_stats AS
SELECT 
  e.id as event_id,
  e.artist_id,
  e.event_name,
  e.event_type,
  e.city,
  e.event_date,
  v.capacity as venue_capacity,
  COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END), 0) as tickets_sold,
  COALESCE(SUM(CASE WHEN es.checked_in = true THEN es.quantity ELSE 0 END), 0) as checked_in,
  CASE 
    WHEN v.capacity > 0 THEN 
      ROUND((COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END), 0)::DECIMAL / v.capacity * 100), 2)
    ELSE 0 
  END as sell_through_rate,
  CASE 
    WHEN SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END) > 0 THEN
      ROUND((COALESCE(SUM(CASE WHEN es.checked_in = true THEN es.quantity ELSE 0 END), 0)::DECIMAL / 
             SUM(CASE WHEN es.payment_status = 'completed' THEN es.quantity ELSE 0 END) * 100), 2)
    ELSE 0
  END as attendance_rate,
  AVG(f.rating) as average_rating,
  COUNT(DISTINCT f.id) as feedback_count
FROM event_requests e
LEFT JOIN event_venues v ON v.venue_name = e.venue AND v.city = e.city
LEFT JOIN event_sales es ON es.event_id = e.id
LEFT JOIN event_feedback f ON f.event_id = e.id
GROUP BY e.id, e.artist_id, e.event_name, e.event_type, e.city, e.event_date, v.capacity;

-- Топ площадок по выручке
CREATE OR REPLACE VIEW top_venues_by_revenue AS
SELECT 
  v.id,
  v.venue_name,
  v.city,
  v.venue_type,
  v.capacity,
  COUNT(DISTINCT e.id) as events_count,
  COALESCE(SUM(CASE WHEN es.payment_status = 'completed' THEN es.total_price ELSE 0 END), 0) as total_revenue,
  COALESCE(AVG(CASE WHEN es.payment_status = 'completed' THEN es.total_price END), 0) as avg_revenue_per_event,
  AVG(f.rating) as avg_venue_rating
FROM event_venues v
LEFT JOIN event_requests e ON e.venue = v.venue_name AND e.city = v.city
LEFT JOIN event_sales es ON es.event_id = e.id
LEFT JOIN event_feedback f ON f.event_id = e.id AND f.feedback_type = 'venue'
GROUP BY v.id, v.venue_name, v.city, v.venue_type, v.capacity
ORDER BY total_revenue DESC;

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_event_venues_updated_at BEFORE UPDATE ON event_venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_tickets_updated_at BEFORE UPDATE ON event_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_sales_updated_at BEFORE UPDATE ON event_sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_team_updated_at BEFORE UPDATE ON event_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_riders_updated_at BEFORE UPDATE ON event_riders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_budget_updated_at BEFORE UPDATE ON event_budget
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_promotion_updated_at BEFORE UPDATE ON event_promotion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_timeline_updated_at BEFORE UPDATE ON event_timeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_setlists_updated_at BEFORE UPDATE ON event_setlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического обновления количества проданных билетов
CREATE OR REPLACE FUNCTION update_ticket_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
    UPDATE event_tickets 
    SET quantity_sold = quantity_sold + NEW.quantity
    WHERE id = NEW.ticket_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.payment_status != 'completed' AND NEW.payment_status = 'completed' THEN
      UPDATE event_tickets 
      SET quantity_sold = quantity_sold + NEW.quantity
      WHERE id = NEW.ticket_id;
    ELSIF OLD.payment_status = 'completed' AND NEW.payment_status != 'completed' THEN
      UPDATE event_tickets 
      SET quantity_sold = quantity_sold - OLD.quantity
      WHERE id = OLD.ticket_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.payment_status = 'completed' THEN
    UPDATE event_tickets 
    SET quantity_sold = quantity_sold - OLD.quantity
    WHERE id = OLD.ticket_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_sold_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_sales
  FOR EACH ROW EXECUTE FUNCTION update_ticket_sold_count();

-- ============================================
-- КОММЕНТАРИИ К СТОЛБЦАМ
-- ============================================

-- event_venues
COMMENT ON COLUMN event_venues.capacity IS 'Общая вместимость площадки';
COMMENT ON COLUMN event_venues.standing_capacity IS 'Количество стоячих мест';
COMMENT ON COLUMN event_venues.seated_capacity IS 'Количество сидячих мест';
COMMENT ON COLUMN event_venues.rental_price IS 'Стоимость аренды площадки';

-- event_tickets
COMMENT ON COLUMN event_tickets.quantity_available IS 'Вычисляемое поле: доступно = всего - продано - зарезервировано';
COMMENT ON COLUMN event_tickets.includes IS 'Что включено в билет (массив)';
COMMENT ON COLUMN event_tickets.restrictions IS 'Ограничения (возраст, дресс-код и т.д.)';

-- event_sales
COMMENT ON COLUMN event_sales.service_fee IS 'Сервисный сбор';
COMMENT ON COLUMN event_sales.promo_code IS 'Промокод для скидки';
COMMENT ON COLUMN event_sales.ticket_codes IS 'Коды билетов (массив)';
COMMENT ON COLUMN event_sales.checked_in IS 'Прошел регистрацию на входе';

-- event_budget
COMMENT ON COLUMN event_budget.budget_type IS 'Тип: expense (расход) или income (доход)';
COMMENT ON COLUMN event_budget.amount_planned IS 'Запланированная сумма';
COMMENT ON COLUMN event_budget.amount_actual IS 'Фактическая сумма';

-- event_promotion
COMMENT ON COLUMN event_promotion.roi IS 'Return on Investment - возврат инвестиций в %';
COMMENT ON COLUMN event_promotion.cost_per_click IS 'Стоимость клика';
COMMENT ON COLUMN event_promotion.cost_per_conversion IS 'Стоимость конверсии (продажи билета)';

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (DEMO)
-- ============================================

-- Демо-площадки
INSERT INTO event_venues (id, artist_id, venue_name, venue_type, city, address, capacity, standing_capacity, seated_capacity, has_sound_system, has_lighting, has_backstage, contact_person, rental_price)
VALUES 
  ('demo_venue_1', 'demo_artist', 'Клуб 16 тонн', 'club', 'Москва', 'Пресненская наб., 6с2', 500, 500, 0, true, true, true, 'Иван Менеджеров', 150000),
  ('demo_venue_2', 'demo_artist', 'ГлавClub', 'concert_hall', 'Москва', 'Орджоникидзе, 11', 1500, 1000, 500, true, true, true, 'Мария Площадкина', 350000),
  ('demo_venue_3', 'demo_artist', 'Космонавт', 'club', 'Санкт-Петербург', 'Бронницкая ул., 24', 800, 800, 0, true, true, true, 'Петр Звукарев', 200000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- УСПЕХ!
-- ============================================
-- 
-- ✅ Создано 10 таблиц:
--    1. event_venues - Площадки для мероприятий
--    2. event_tickets - Типы билетов
--    3. event_sales - Продажи билетов
--    4. event_team - Команда мероприятия
--    5. event_riders - Технические райдеры
--    6. event_budget - Детальный бюджет
--    7. event_promotion - Продвижение
--    8. event_timeline - Расписание/тайминг
--    9. event_feedback - Отзывы
--    10. event_setlists - Сет-листы
-- 
-- ✅ Создано 4 представления (views):
--    - event_financial_summary
--    - upcoming_events
--    - event_attendance_stats
--    - top_venues_by_revenue
-- 
-- ✅ Добавлены триггеры для автообновления
-- ✅ Автоматический подсчет проданных билетов
-- ✅ Добавлены демо-данные (3 площадки)
-- 
-- 🎉 База данных для Event Management готова!
-- 
-- ============================================
