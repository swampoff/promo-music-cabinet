-- ============================================
-- PITCHING DATABASES - Базы для рассылок
-- ============================================
--
-- Три направления питчинга:
-- 1. Плейлисты (Spotify, Apple Music, Яндекс.Музыка и др.)
-- 2. Заведения (клубы, бары, рестораны)
-- 3. Радиостанции
--
-- ============================================

-- ============================================
-- ТАБЛИЦА: pitching_playlists
-- База плейлистов для питчинга
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Основная информация
  name TEXT NOT NULL,
  description TEXT,

  -- Платформа
  platform TEXT NOT NULL CHECK (platform IN (
    'spotify', 'apple_music', 'yandex_music', 'vk_music',
    'deezer', 'soundcloud', 'youtube_music', 'tidal', 'other'
  )),
  playlist_url TEXT,

  -- Владелец/куратор
  curator_name TEXT,
  curator_email TEXT,
  curator_phone TEXT,
  curator_social JSONB DEFAULT '{}'::jsonb, -- {instagram, telegram, vk, etc}

  -- Характеристики
  genres TEXT[] DEFAULT '{}',
  moods TEXT[] DEFAULT '{}',
  followers_count INTEGER DEFAULT 0,
  tracks_count INTEGER DEFAULT 0,

  -- Условия размещения
  accepts_submissions BOOLEAN DEFAULT true,
  submission_fee INTEGER DEFAULT 0, -- в копейках
  average_response_days INTEGER DEFAULT 7,
  requirements TEXT, -- требования к треку

  -- Статистика питчинга
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,

  -- Статус
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0, -- для сортировки (выше = важнее)

  -- Заметки админа
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_playlists_platform ON pitching_playlists(platform);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_genres ON pitching_playlists USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_active ON pitching_playlists(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_playlists_followers ON pitching_playlists(followers_count DESC);

COMMENT ON TABLE pitching_playlists IS 'База плейлистов для питчинга треков';

-- ============================================
-- ТАБЛИЦА: pitching_venues
-- База заведений для питчинга
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Основная информация
  name TEXT NOT NULL,
  description TEXT,

  -- Тип заведения
  venue_type TEXT NOT NULL CHECK (venue_type IN (
    'club', 'bar', 'restaurant', 'cafe', 'lounge',
    'hotel', 'shopping_center', 'fitness', 'spa', 'other'
  )),

  -- Локация
  city TEXT NOT NULL,
  address TEXT,
  region TEXT,
  country TEXT DEFAULT 'Россия',

  -- Контакты
  contact_name TEXT,
  contact_position TEXT, -- должность
  contact_email TEXT,
  contact_phone TEXT,
  contact_social JSONB DEFAULT '{}'::jsonb,

  -- Характеристики
  music_genres TEXT[] DEFAULT '{}', -- какую музыку играют
  capacity INTEGER, -- вместимость
  working_hours JSONB DEFAULT '{}'::jsonb, -- {mon: "10:00-22:00", ...}
  has_live_music BOOLEAN DEFAULT false,
  has_dj BOOLEAN DEFAULT false,

  -- Условия сотрудничества
  accepts_music BOOLEAN DEFAULT true,
  collaboration_type TEXT[] DEFAULT '{}', -- ['background', 'live', 'dj_set', 'event']
  payment_terms TEXT, -- условия оплаты
  average_budget INTEGER DEFAULT 0,

  -- Статистика
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,

  -- Статус
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,

  -- Заметки
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_venues_type ON pitching_venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_city ON pitching_venues(city);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_genres ON pitching_venues USING gin(music_genres);
CREATE INDEX IF NOT EXISTS idx_pitching_venues_active ON pitching_venues(is_active);

COMMENT ON TABLE pitching_venues IS 'База заведений для питчинга музыки';

-- ============================================
-- ТАБЛИЦА: pitching_radio
-- База радиостанций для питчинга
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_radio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Основная информация
  name TEXT NOT NULL,
  description TEXT,
  slogan TEXT,

  -- Тип радио
  radio_type TEXT NOT NULL CHECK (radio_type IN (
    'fm', 'online', 'podcast', 'internet_radio', 'satellite', 'other'
  )),

  -- Частота и охват
  frequency TEXT, -- "101.2 FM"
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Россия',
  coverage TEXT, -- зона вещания
  listeners_count INTEGER DEFAULT 0,

  -- Контакты
  website TEXT,
  email TEXT,
  phone TEXT,

  -- Музыкальный редактор
  editor_name TEXT,
  editor_email TEXT,
  editor_phone TEXT,
  editor_social JSONB DEFAULT '{}'::jsonb,

  -- Характеристики
  music_genres TEXT[] DEFAULT '{}',
  target_audience TEXT, -- целевая аудитория
  format TEXT, -- формат вещания (CHR, AC, Rock, etc)

  -- Программы
  programs JSONB DEFAULT '[]'::jsonb, -- [{name, time, host, accepts_new_music}]

  -- Условия
  accepts_submissions BOOLEAN DEFAULT true,
  submission_email TEXT,
  submission_requirements TEXT,
  average_response_days INTEGER DEFAULT 14,

  -- Статистика
  total_pitches INTEGER DEFAULT 0,
  successful_pitches INTEGER DEFAULT 0,
  added_to_rotation INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,

  -- Статус
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,

  -- Заметки
  admin_notes TEXT,
  last_contacted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_radio_type ON pitching_radio(radio_type);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_city ON pitching_radio(city);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_genres ON pitching_radio USING gin(music_genres);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_active ON pitching_radio(is_active);
CREATE INDEX IF NOT EXISTS idx_pitching_radio_listeners ON pitching_radio(listeners_count DESC);

COMMENT ON TABLE pitching_radio IS 'База радиостанций для питчинга треков';

-- ============================================
-- ТАБЛИЦА: pitching_campaigns
-- Рассылки питчинга (для отслеживания)
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Связь с заявкой артиста
  pitching_request_id TEXT REFERENCES pitching_requests(id) ON DELETE CASCADE,

  -- Информация о кампании
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('playlists', 'venues', 'radio', 'mixed')),

  -- Получатели
  recipients_playlists UUID[] DEFAULT '{}',
  recipients_venues UUID[] DEFAULT '{}',
  recipients_radio UUID[] DEFAULT '{}',
  total_recipients INTEGER DEFAULT 0,

  -- Контент рассылки
  subject TEXT,
  message_template TEXT,
  attachments JSONB DEFAULT '[]'::jsonb, -- ссылки на трек, пресс-кит и т.д.

  -- Статус
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'sending', 'sent', 'completed', 'cancelled'
  )),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Статистика
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  responded_count INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,

  -- Админ
  created_by UUID, -- admin user id

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pitching_campaigns_request ON pitching_campaigns(pitching_request_id);
CREATE INDEX IF NOT EXISTS idx_pitching_campaigns_type ON pitching_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_pitching_campaigns_status ON pitching_campaigns(status);

COMMENT ON TABLE pitching_campaigns IS 'Рассылки питчинга администратором';

-- ============================================
-- ТАБЛИЦА: pitching_campaign_responses
-- Ответы на рассылки
-- ============================================
CREATE TABLE IF NOT EXISTS pitching_campaign_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  campaign_id UUID NOT NULL REFERENCES pitching_campaigns(id) ON DELETE CASCADE,

  -- Кто ответил
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('playlist', 'venue', 'radio')),
  recipient_id UUID NOT NULL,
  recipient_name TEXT,

  -- Ответ
  response_type TEXT NOT NULL CHECK (response_type IN (
    'interested', 'not_interested', 'added', 'need_info', 'no_response'
  )),
  response_text TEXT,

  -- Даты
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_responses_campaign ON pitching_campaign_responses(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_responses_type ON pitching_campaign_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_campaign_responses_recipient ON pitching_campaign_responses(recipient_type, recipient_id);

COMMENT ON TABLE pitching_campaign_responses IS 'Ответы получателей на рассылки питчинга';

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE pitching_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitching_campaign_responses ENABLE ROW LEVEL SECURITY;

-- Публичный доступ на чтение активных записей (для показа артистам)
CREATE POLICY "Public can view active playlists" ON pitching_playlists
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active venues" ON pitching_venues
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active radio" ON pitching_radio
  FOR SELECT USING (is_active = true);

-- Полный доступ для service_role (админ через Edge Functions)
-- Edge Functions используют service_role key, который обходит RLS

-- ============================================
-- ТРИГГЕРЫ
-- ============================================

-- Автообновление updated_at
CREATE TRIGGER update_pitching_playlists_updated_at
  BEFORE UPDATE ON pitching_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitching_venues_updated_at
  BEFORE UPDATE ON pitching_venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitching_radio_updated_at
  BEFORE UPDATE ON pitching_radio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pitching_campaigns_updated_at
  BEFORE UPDATE ON pitching_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Созданы таблицы:
-- - pitching_playlists (база плейлистов)
-- - pitching_venues (база заведений)
-- - pitching_radio (база радиостанций)
-- - pitching_campaigns (рассылки)
-- - pitching_campaign_responses (ответы)
-- ============================================
