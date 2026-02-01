-- ============================================
-- EMAIL SUBSCRIBERS - Подписчики для рассылок
-- ============================================
-- Таблица для хранения email-подписчиков
-- из маркетинговых систем (SendPulse и т.д.)
-- ============================================

CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Оригинальный ID из CRM
  external_id TEXT,

  -- Контактные данные
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,

  -- Статусы
  email_status TEXT DEFAULT 'active',
  phone_status TEXT,

  -- Тип подписчика
  subscriber_type TEXT DEFAULT 'artist' CHECK (subscriber_type IN (
    'artist', 'venue', 'radio', 'playlist_curator', 'label', 'promoter', 'other'
  )),

  -- Теги для сегментации
  tags TEXT[] DEFAULT '{}',

  -- Метаданные
  source TEXT DEFAULT 'import', -- откуда пришёл: import, website, api
  imported_at TIMESTAMPTZ, -- когда был добавлен в оригинальную систему

  -- Согласия
  marketing_consent BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,

  -- Стандартные поля
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Уникальность email
  CONSTRAINT unique_subscriber_email UNIQUE (email)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_type ON email_subscribers(subscriber_type);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(email_status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_tags ON email_subscribers USING gin(tags);

-- RLS
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Политика: только service_role имеет доступ (через Edge Functions)
-- Публичного доступа нет - это внутренняя база для рассылок

-- Триггер updated_at
CREATE TRIGGER update_email_subscribers_updated_at
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_subscribers IS 'Email-подписчики для маркетинговых рассылок';

-- ============================================
-- ГОТОВО!
-- ============================================
