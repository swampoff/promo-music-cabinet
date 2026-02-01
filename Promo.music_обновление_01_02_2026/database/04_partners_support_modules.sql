-- =====================================================
-- PROMO.MUSIC - PARTNERS & SUPPORT MODULES
-- Партнерская программа, рефералы, техподдержка
-- =====================================================

-- =====================================================
-- PARTNERS MODULE
-- =====================================================

-- ТАБЛИЦА: partners
-- Партнеры и их программы
-- =====================================================
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Статус партнера
  status partner_status DEFAULT 'pending_approval',
  tier partner_tier DEFAULT 'bronze',
  
  -- Реферальный код
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  custom_landing_page_url TEXT,
  
  -- Комиссия
  commission_rate DECIMAL(5,2) NOT NULL, -- процент от продаж
  lifetime_commission BOOLEAN DEFAULT TRUE,
  
  -- Статистика
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  pending_earnings DECIMAL(12,2) DEFAULT 0.00,
  paid_earnings DECIMAL(12,2) DEFAULT 0.00,
  
  -- Цели и бонусы
  monthly_referral_goal INTEGER DEFAULT 10,
  bonus_on_goal_reached DECIMAL(10,2) DEFAULT 0.00,
  
  -- Платежные данные
  payout_method payment_method,
  payout_details JSONB,
  min_payout_threshold DECIMAL(10,2) DEFAULT 100.00,
  
  -- Маркетинговые материалы
  marketing_materials JSONB DEFAULT '[]'::jsonb,
  
  -- Аналитика
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  -- Одобрение
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Контракт
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMPTZ,
  contract_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_code ON partners(referral_code);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_tier ON partners(tier);

COMMENT ON TABLE partners IS 'Партнеры и их программы';

-- =====================================================
-- ТАБЛИЦА: partner_commissions
-- История комиссий партнеров
-- =====================================================
CREATE TABLE partner_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id),
  
  -- Комиссия
  transaction_amount DECIMAL(12,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid, rejected
  
  -- Выплата
  payout_request_id UUID REFERENCES payout_requests(id),
  paid_at TIMESTAMPTZ,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_commissions_partner_id ON partner_commissions(partner_id, created_at DESC);
CREATE INDEX idx_partner_commissions_user_id ON partner_commissions(referred_user_id);
CREATE INDEX idx_partner_commissions_transaction_id ON partner_commissions(transaction_id);
CREATE INDEX idx_partner_commissions_status ON partner_commissions(status);

COMMENT ON TABLE partner_commissions IS 'История комиссий партнеров';

-- =====================================================
-- ТАБЛИЦА: partner_clicks
-- Отслеживание кликов по партнерским ссылкам
-- =====================================================
CREATE TABLE partner_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Источник клика
  referral_code VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- География
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Устройство
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- UTM параметры
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Конверсия
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  converted_user_id UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_clicks_partner_id ON partner_clicks(partner_id, created_at DESC);
CREATE INDEX idx_partner_clicks_code ON partner_clicks(referral_code);
CREATE INDEX idx_partner_clicks_converted ON partner_clicks(converted);
CREATE INDEX idx_partner_clicks_ip ON partner_clicks(ip_address);

COMMENT ON TABLE partner_clicks IS 'Отслеживание кликов по партнерским ссылкам';

-- =====================================================
-- SUPPORT MODULE
-- =====================================================

-- ТАБЛИЦА: support_tickets
-- Тикеты техподдержки
-- =====================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Основная информация
  subject VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Статус и приоритет
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  
  -- Назначение
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Теги
  tags TEXT[] DEFAULT '{}',
  
  -- Связанные объекты
  related_pitch_id UUID REFERENCES pitches(id),
  related_transaction_id UUID REFERENCES transactions(id),
  
  -- SLA
  sla_response_deadline TIMESTAMPTZ,
  sla_resolution_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  is_sla_breached BOOLEAN DEFAULT FALSE,
  
  -- Оценка
  satisfaction_rating INTEGER, -- 1-5
  satisfaction_feedback TEXT,
  rated_at TIMESTAMPTZ,
  
  -- Метаданные
  browser_info TEXT,
  os_info TEXT,
  device_info TEXT,
  user_ip INET,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_satisfaction_rating CHECK (
    satisfaction_rating IS NULL OR 
    (satisfaction_rating >= 1 AND satisfaction_rating <= 5)
  )
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id, created_at DESC);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to, status);
CREATE INDEX idx_support_tickets_sla ON support_tickets(sla_response_deadline, status) 
  WHERE status IN ('open', 'waiting_response', 'in_progress');
CREATE INDEX idx_support_tickets_category ON support_tickets(category);

COMMENT ON TABLE support_tickets IS 'Тикеты техподдержки';

-- =====================================================
-- ТАБЛИЦА: support_messages
-- Сообщения в тикетах
-- =====================================================
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Тип отправителя
  sender_type VARCHAR(20) NOT NULL, -- user, admin, system
  
  -- Сообщение
  message TEXT NOT NULL,
  
  -- Вложения
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Статус
  is_internal BOOLEAN DEFAULT FALSE, -- внутренняя заметка
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id, created_at);
CREATE INDEX idx_support_messages_sender_id ON support_messages(sender_id);
CREATE INDEX idx_support_messages_unread ON support_messages(is_read, sender_type) 
  WHERE NOT is_read;

COMMENT ON TABLE support_messages IS 'Сообщения в тикетах техподдержки';

-- =====================================================
-- ТАБЛИЦА: support_templates
-- Шаблоны ответов для поддержки
-- =====================================================
CREATE TABLE support_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Основная информация
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  
  -- Параметры
  variables JSONB DEFAULT '[]'::jsonb, -- список переменных
  
  -- Использование
  usage_count INTEGER DEFAULT 0,
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Кто создал
  created_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_templates_category ON support_templates(category);
CREATE INDEX idx_support_templates_active ON support_templates(is_active);

COMMENT ON TABLE support_templates IS 'Шаблоны ответов для техподдержки';

-- =====================================================
-- ТАБЛИЦА: support_knowledge_base
-- База знаний для поддержки и пользователей
-- =====================================================
CREATE TABLE support_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Контент
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Категория
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  
  -- Теги
  tags TEXT[] DEFAULT '{}',
  
  -- Статус
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Метрики
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Автор
  author_id UUID REFERENCES users(id),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Даты
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_base_slug ON support_knowledge_base(slug);
CREATE INDEX idx_knowledge_base_category ON support_knowledge_base(category);
CREATE INDEX idx_knowledge_base_published ON support_knowledge_base(is_published, published_at DESC);
CREATE INDEX idx_knowledge_base_search ON support_knowledge_base USING gin(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(content, '') || ' ' || 
    COALESCE(array_to_string(tags, ' '), '')
  )
);

COMMENT ON TABLE support_knowledge_base IS 'База знаний для поддержки';

-- =====================================================
-- ТАБЛИЦА: notifications
-- Уведомления пользователей
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Тип уведомления
  notification_type notification_type NOT NULL,
  
  -- Содержание
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Ссылка
  action_url TEXT,
  action_text VARCHAR(100),
  
  -- Связанные объекты
  related_pitch_id UUID REFERENCES pitches(id),
  related_ticket_id UUID REFERENCES support_tickets(id),
  related_transaction_id UUID REFERENCES transactions(id),
  
  -- Статус
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Отправка
  sent_via VARCHAR(20)[] DEFAULT '{}', -- email, push, sms
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Уведомления пользователей';

-- =====================================================
-- ТАБЛИЦА: email_queue
-- Очередь email сообщений
-- =====================================================
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Получатель
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Отправитель
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  reply_to VARCHAR(255),
  
  -- Контент
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Шаблон
  template_id VARCHAR(100),
  template_variables JSONB,
  
  -- Приоритет
  priority INTEGER DEFAULT 5, -- 1-10
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending', -- pending, sending, sent, failed, cancelled
  
  -- Отправка
  provider VARCHAR(50), -- sendgrid, mailgun, ses, etc.
  provider_message_id VARCHAR(255),
  
  -- Попытки
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  
  -- Результат
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Метрики
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  
  -- Запланировано
  scheduled_for TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status, priority DESC, created_at);
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for) 
  WHERE status = 'pending' AND scheduled_for IS NOT NULL;

COMMENT ON TABLE email_queue IS 'Очередь email сообщений';
