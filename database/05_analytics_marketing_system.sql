-- =====================================================
-- PROMO.MUSIC - ANALYTICS, MARKETING & SYSTEM MODULES
-- Аналитика, маркетинг, системные таблицы
-- =====================================================

-- =====================================================
-- ANALYTICS MODULE
-- =====================================================

-- ТАБЛИЦА: daily_analytics
-- Ежедневная аналитика платформы
-- =====================================================
CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Дата
  analytics_date DATE NOT NULL UNIQUE,
  
  -- Пользователи
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,
  
  -- Артисты
  total_artists INTEGER DEFAULT 0,
  verified_artists INTEGER DEFAULT 0,
  active_artists INTEGER DEFAULT 0,
  
  -- Треки
  total_tracks INTEGER DEFAULT 0,
  new_tracks INTEGER DEFAULT 0,
  verified_tracks INTEGER DEFAULT 0,
  
  -- Плейлисты
  total_playlists INTEGER DEFAULT 0,
  active_playlists INTEGER DEFAULT 0,
  
  -- Питчинг
  total_pitches INTEGER DEFAULT 0,
  pitches_created INTEGER DEFAULT 0,
  pitches_submitted INTEGER DEFAULT 0,
  pitches_accepted INTEGER DEFAULT 0,
  pitches_rejected INTEGER DEFAULT 0,
  pitch_success_rate DECIMAL(5,2),
  
  -- Финансы
  revenue_total DECIMAL(12,2) DEFAULT 0.00,
  revenue_subscriptions DECIMAL(12,2) DEFAULT 0.00,
  revenue_pitches DECIMAL(12,2) DEFAULT 0.00,
  refunds_total DECIMAL(12,2) DEFAULT 0.00,
  
  -- Транзакции
  transactions_count INTEGER DEFAULT 0,
  transactions_completed INTEGER DEFAULT 0,
  transactions_failed INTEGER DEFAULT 0,
  avg_transaction_value DECIMAL(12,2),
  
  -- Подписки
  new_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0.00, -- Monthly Recurring Revenue
  
  -- Поддержка
  new_tickets INTEGER DEFAULT 0,
  resolved_tickets INTEGER DEFAULT 0,
  open_tickets INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(8,2),
  
  -- Партнеры
  partner_clicks INTEGER DEFAULT 0,
  partner_conversions INTEGER DEFAULT 0,
  partner_commissions DECIMAL(12,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_analytics_date ON daily_analytics(analytics_date DESC);

COMMENT ON TABLE daily_analytics IS 'Ежедневная агрегированная аналитика платформы';

-- =====================================================
-- ТАБЛИЦА: user_analytics
-- Аналитика по пользователям
-- =====================================================
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Период
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, yearly
  
  -- Активность
  sessions_count INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  pages_viewed INTEGER DEFAULT 0,
  
  -- Питчинг
  pitches_created INTEGER DEFAULT 0,
  pitches_submitted INTEGER DEFAULT 0,
  pitches_accepted INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  -- Финансы
  amount_spent DECIMAL(12,2) DEFAULT 0.00,
  amount_earned DECIMAL(12,2) DEFAULT 0.00,
  
  -- Engagement
  messages_sent INTEGER DEFAULT 0,
  reviews_left INTEGER DEFAULT 0,
  support_tickets INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, period_start, period_type)
);

CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id, period_start DESC);
CREATE INDEX idx_user_analytics_period ON user_analytics(period_type, period_start DESC);

COMMENT ON TABLE user_analytics IS 'Периодическая аналитика пользователей';

-- =====================================================
-- ТАБЛИЦА: platform_metrics
-- Реалтайм метрики платформы
-- =====================================================
CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Метрика
  metric_key VARCHAR(100) NOT NULL,
  metric_value DECIMAL(20,4) NOT NULL,
  
  -- Дополнительные измерения
  dimensions JSONB DEFAULT '{}'::jsonb,
  
  -- Период
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT metric_key_timestamp UNIQUE (metric_key, timestamp)
);

CREATE INDEX idx_platform_metrics_key ON platform_metrics(metric_key, timestamp DESC);
CREATE INDEX idx_platform_metrics_timestamp ON platform_metrics(timestamp DESC);

COMMENT ON TABLE platform_metrics IS 'Реалтайм метрики платформы';

-- =====================================================
-- MARKETING MODULE
-- =====================================================

-- ТАБЛИЦА: email_campaigns
-- Email маркетинговые кампании
-- =====================================================
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Основная информация
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preview_text VARCHAR(255),
  
  -- Контент
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Шаблон
  template_id VARCHAR(100),
  
  -- Отправка
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) NOT NULL,
  reply_to VARCHAR(255),
  
  -- Целевая аудитория
  target_segment VARCHAR(100), -- all, free_users, paid_users, artists, curators, etc.
  target_user_ids UUID[],
  target_filters JSONB,
  
  -- Статус
  status campaign_status DEFAULT 'draft',
  
  -- Запланировано
  scheduled_for TIMESTAMPTZ,
  
  -- Статистика
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  complained_count INTEGER DEFAULT 0,
  
  -- Показатели
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  conversion_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  -- A/B тестирование
  is_ab_test BOOLEAN DEFAULT FALSE,
  ab_variant VARCHAR(10), -- A, B
  ab_test_group_id UUID,
  
  -- Кто создал
  created_by UUID REFERENCES users(id),
  
  -- Даты
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_for);
CREATE INDEX idx_email_campaigns_segment ON email_campaigns(target_segment);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);

COMMENT ON TABLE email_campaigns IS 'Email маркетинговые кампании';

-- =====================================================
-- ТАБЛИЦА: campaign_recipients
-- Получатели email кампаний
-- =====================================================
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Email
  email VARCHAR(255) NOT NULL,
  
  -- Статус отправки
  send_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, bounced
  sent_at TIMESTAMPTZ,
  
  -- Взаимодействие
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  
  -- Провайдер
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),
  
  -- Ошибки
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user_id ON campaign_recipients(user_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(send_status);

COMMENT ON TABLE campaign_recipients IS 'Получатели email кампаний';

-- =====================================================
-- ТАБЛИЦА: marketing_automation
-- Автоматизированные маркетинговые сценарии
-- =====================================================
CREATE TABLE marketing_automation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Триггер
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(100) NOT NULL, -- user_signup, pitch_created, payment_completed, etc.
  trigger_conditions JSONB,
  
  -- Действия
  actions JSONB NOT NULL, -- массив действий
  
  -- Задержки
  delay_value INTEGER,
  delay_unit VARCHAR(20), -- minutes, hours, days
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Статистика
  triggered_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_automation_trigger ON marketing_automation(trigger_type);
CREATE INDEX idx_marketing_automation_active ON marketing_automation(is_active);

COMMENT ON TABLE marketing_automation IS 'Автоматизированные маркетинговые сценарии';

-- =====================================================
-- SYSTEM MODULE
-- =====================================================

-- ТАБЛИЦА: system_logs
-- Системные логи
-- =====================================================
CREATE TABLE system_logs (
  id BIGSERIAL PRIMARY KEY,
  
  -- Уровень
  log_level log_type NOT NULL,
  
  -- Сообщение
  message TEXT NOT NULL,
  
  -- Контекст
  context VARCHAR(100),
  module VARCHAR(100),
  
  -- Пользователь (если применимо)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Технические данные
  stack_trace TEXT,
  error_code VARCHAR(50),
  
  -- Запрос
  request_id VARCHAR(100),
  request_method VARCHAR(10),
  request_url TEXT,
  request_ip INET,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_logs_level ON system_logs(log_level, created_at DESC);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_context ON system_logs(context, created_at DESC);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);

COMMENT ON TABLE system_logs IS 'Системные логи для мониторинга';

-- =====================================================
-- ТАБЛИЦА: audit_logs
-- Аудит важных действий
-- =====================================================
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  
  -- Пользователь
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_role user_role,
  
  -- Действие
  action VARCHAR(100) NOT NULL,
  action_description TEXT,
  
  -- Ресурс
  resource_type VARCHAR(50),
  resource_id UUID,
  
  -- Изменения
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  
  -- IP и устройство
  ip_address INET,
  user_agent TEXT,
  
  -- Результат
  status VARCHAR(20), -- success, failed
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Аудит важных действий пользователей';

-- =====================================================
-- ТАБЛИЦА: api_keys
-- API ключи для интеграций
-- =====================================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ключ
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(100) UNIQUE NOT NULL,
  api_secret VARCHAR(255),
  
  -- Разрешения
  permissions TEXT[] DEFAULT '{}',
  scopes TEXT[] DEFAULT '{}',
  
  -- Лимиты
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Использование
  requests_count BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- IP whitelist
  allowed_ips INET[],
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Истечение
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(api_key);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at);

COMMENT ON TABLE api_keys IS 'API ключи для интеграций';

-- =====================================================
-- ТАБЛИЦА: api_requests
-- Логи API запросов
-- =====================================================
CREATE TABLE api_requests (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Запрос
  request_method VARCHAR(10) NOT NULL,
  request_path TEXT NOT NULL,
  request_query JSONB,
  request_body JSONB,
  request_headers JSONB,
  
  -- Ответ
  response_status INTEGER,
  response_body JSONB,
  response_time_ms INTEGER,
  
  -- IP
  ip_address INET,
  
  -- Ошибка
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_requests_key_id ON api_requests(api_key_id, created_at DESC);
CREATE INDEX idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX idx_api_requests_status ON api_requests(response_status);
CREATE INDEX idx_api_requests_created_at ON api_requests(created_at DESC);

COMMENT ON TABLE api_requests IS 'Логи API запросов';

-- =====================================================
-- ТАБЛИЦА: feature_flags
-- Feature flags для A/B тестирования и rollout
-- =====================================================
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Флаг
  flag_key VARCHAR(100) UNIQUE NOT NULL,
  flag_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Статус
  is_enabled BOOLEAN DEFAULT FALSE,
  
  -- Rollout процент (0-100)
  rollout_percentage INTEGER DEFAULT 0,
  
  -- Целевая аудитория
  target_user_roles user_role[],
  target_user_ids UUID[],
  target_conditions JSONB,
  
  -- Даты
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_rollout CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

COMMENT ON TABLE feature_flags IS 'Feature flags для A/B тестов';

-- =====================================================
-- ТАБЛИЦА: webhooks
-- Webhooks для интеграций
-- =====================================================
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- URL
  url TEXT NOT NULL,
  
  -- События
  events TEXT[] NOT NULL,
  
  -- Секрет для подписи
  secret VARCHAR(100),
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Статистика
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);

COMMENT ON TABLE webhooks IS 'Webhooks для интеграций';

-- =====================================================
-- ТАБЛИЦА: webhook_deliveries
-- История доставки webhook событий
-- =====================================================
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Событие
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  -- Попытки доставки
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Результат
  status VARCHAR(20) DEFAULT 'pending', -- pending, delivered, failed
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Следующая попытка
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id, created_at DESC);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) 
  WHERE status = 'pending';

COMMENT ON TABLE webhook_deliveries IS 'История доставки webhook событий';
