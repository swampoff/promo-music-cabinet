# 🚀 SUPABASE + VERCEL DEPLOYMENT ROADMAP
## promo.music - Полная дорожная карта развертывания

---

## 📋 ОГЛАВЛЕНИЕ

1. [Архитектура системы](#архитектура-системы)
2. [Supabase Setup](#supabase-setup)
3. [Database Schema](#database-schema)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Storage Buckets](#storage-buckets)
6. [Authentication](#authentication)
7. [Realtime Subscriptions](#realtime-subscriptions)
8. [Edge Functions](#edge-functions)
9. [Frontend Integration](#frontend-integration)
10. [Vercel Deployment](#vercel-deployment)
11. [Environment Variables](#environment-variables)
12. [CI/CD Pipeline](#cicd-pipeline)
13. [Monitoring & Analytics](#monitoring--analytics)

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   React    │  │  Motion    │  │  Tailwind  │        │
│  │  App.tsx   │  │ Animations │  │    CSS     │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│         │                │                │              │
│         └────────────────┴────────────────┘              │
│                         │                                │
│              Supabase Client SDK                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                  │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │  │
│  │  │ Users  │ │ Tracks │ │ Videos │ │Concerts│   │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘   │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │  │
│  │  │Donations│ │Messages│ │ News  │ │Sessions│   │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Storage Buckets                      │  │
│  │  • avatars/      • track-covers/                  │  │
│  │  • audio-files/  • video-files/                   │  │
│  │  • concert-posters/ • news-images/                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Auth & Security                      │  │
│  │  • JWT Tokens    • Row Level Security (RLS)      │  │
│  │  • OAuth Providers • 2FA (TOTP)                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Realtime Engine                      │  │
│  │  • Messages    • Notifications                    │  │
│  │  • Live Stats  • Presence                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Edge Functions                       │  │
│  │  • payment-webhook  • send-email                  │  │
│  │  • analytics-aggregation • ai-recommendations     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                        │
│  • Payment Providers (Stripe/YooKassa)                  │
│  • Email Service (SendGrid/Resend)                      │
│  • Analytics (Plausible/Umami)                          │
│  • CDN (Cloudflare/Vercel Edge Network)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 SUPABASE SETUP

### Шаг 1: Создание проекта

```bash
# 1. Зайти на https://supabase.com
# 2. Create New Project
# 3. Заполнить:
#    - Project Name: promo-music-production
#    - Database Password: [генерировать сильный пароль]
#    - Region: Europe (Frankfurt) или ближайший к вашей аудитории
#    - Pricing Plan: Pro ($25/month) для production

# 4. Получить credentials:
#    - Project URL: https://xxxxx.supabase.co
#    - anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
#    - service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (секретный!)
```

### Шаг 2: Установка Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Шаг 3: Инициализация проекта

```bash
# В корне проекта promo.music
supabase init

# Логин в Supabase
supabase login

# Link к существующему проекту
supabase link --project-ref xxxxx

# Или создать новый локальный проект для разработки
supabase start
```

---

## 🗄️ DATABASE SCHEMA

### Создание всех таблиц

Создайте файл миграции:

```bash
supabase migration new initial_schema
```

Затем добавьте SQL:

```sql
-- ============================================
-- USERS & PROFILES
-- ============================================

-- Расширенный профиль пользователя
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'paused')),
  subscription_ends_at TIMESTAMPTZ,
  
  -- Stats
  total_plays BIGINT DEFAULT 0,
  total_followers BIGINT DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  
  -- Settings
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'followers')),
  allow_messages TEXT DEFAULT 'everyone' CHECK (allow_messages IN ('everyone', 'followers', 'none')),
  show_online_status BOOLEAN DEFAULT true,
  show_last_seen BOOLEAN DEFAULT true,
  
  -- Notifications
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  
  -- Appearance
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto')),
  language TEXT DEFAULT 'ru',
  accent_color TEXT DEFAULT 'cyan',
  
  -- Security
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Index для быстрого поиска
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Trigger для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRACKS
-- ============================================

CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Track info
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  genre TEXT,
  duration INTEGER, -- seconds
  
  -- Files
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  waveform_data JSONB, -- для визуализации волны
  
  -- Stats
  plays_count BIGINT DEFAULT 0,
  likes_count BIGINT DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Monetization
  price DECIMAL(10,2) DEFAULT 0, -- 0 = free
  downloads_count INTEGER DEFAULT 0,
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  
  -- Metadata
  lyrics TEXT,
  description TEXT,
  tags TEXT[],
  release_date DATE,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT title_not_empty CHECK (char_length(title) > 0)
);

CREATE INDEX idx_tracks_user_id ON public.tracks(user_id);
CREATE INDEX idx_tracks_genre ON public.tracks(genre);
CREATE INDEX idx_tracks_created_at ON public.tracks(created_at DESC);
CREATE INDEX idx_tracks_plays_count ON public.tracks(plays_count DESC);

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIDEOS
-- ============================================

CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Video info
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER, -- seconds
  
  -- Stats
  views_count BIGINT DEFAULT 0,
  likes_count BIGINT DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT true,
  
  -- Metadata
  tags TEXT[],
  category TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_views_count ON public.videos(views_count DESC);

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONCERTS
-- ============================================

CREATE TABLE public.concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Concert info
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  
  -- Location
  venue TEXT,
  city TEXT,
  country TEXT,
  address TEXT,
  coordinates POINT, -- PostGIS для карт
  
  -- Date & Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  doors_open_time TIME,
  
  -- Ticketing
  ticket_price DECIMAL(10,2),
  ticket_url TEXT,
  tickets_available INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  
  -- Stats
  interested_count INTEGER DEFAULT 0,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_concerts_user_id ON public.concerts(user_id);
CREATE INDEX idx_concerts_start_date ON public.concerts(start_date);
CREATE INDEX idx_concerts_status ON public.concerts(status);
CREATE INDEX idx_concerts_city ON public.concerts(city);

CREATE TRIGGER update_concerts_updated_at
  BEFORE UPDATE ON public.concerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NEWS
-- ============================================

CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_url TEXT,
  excerpt TEXT,
  
  -- Media
  images TEXT[], -- array of image URLs
  video_url TEXT,
  
  -- Stats
  views_count BIGINT DEFAULT 0,
  likes_count BIGINT DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  
  -- Metadata
  tags TEXT[],
  category TEXT,
  
  -- Publishing
  published_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_user_id ON public.news(user_id);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_is_pinned ON public.news(is_pinned);

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONATIONS
-- ============================================

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- может быть анонимным
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Donation info
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'RUB',
  message TEXT,
  
  -- Donor info (если анонимный)
  donor_name TEXT,
  donor_email TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Payment
  payment_provider TEXT, -- 'stripe', 'yookassa', etc
  payment_id TEXT, -- external payment ID
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Settings
  show_in_public BOOLEAN DEFAULT true,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_recipient_id ON public.donations(recipient_id);
CREATE INDEX idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX idx_donations_payment_status ON public.donations(payment_status);

-- ============================================
-- MESSAGES (Messenger)
-- ============================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants (2 users for direct message)
  user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Last message info (денормализация для производительности)
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID,
  
  -- Unread counts
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: unique conversation between 2 users
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

CREATE INDEX idx_conversations_user1 ON public.conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON public.conversations(user2_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  
  -- Sender
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  text TEXT,
  
  -- Attachments
  attachments JSONB, -- [{type: 'image', url: '...', name: '...'}, ...]
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PITCHING
-- ============================================

CREATE TABLE public.pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  
  -- Pitch info
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  
  -- Media
  pitch_deck_url TEXT, -- PDF/презентация
  demo_url TEXT, -- аудио/видео демо
  
  -- Budget
  budget_amount DECIMAL(10,2),
  budget_currency TEXT DEFAULT 'RUB',
  
  -- Timeline
  deadline DATE,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected')),
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX idx_pitches_status ON public.pitches(status);
CREATE INDEX idx_pitches_submitted_at ON public.pitches(submitted_at DESC);

CREATE TRIGGER update_pitches_updated_at
  BEFORE UPDATE ON public.pitches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE public.play_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  
  -- Listener info
  listener_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- null if anonymous
  
  -- Play info
  duration_played INTEGER, -- seconds
  completed BOOLEAN DEFAULT false, -- прослушал до конца?
  
  -- Context
  source TEXT, -- 'profile', 'search', 'playlist', etc
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  
  -- Location (опционально)
  country TEXT,
  city TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_play_events_track_id ON public.play_events(track_id);
CREATE INDEX idx_play_events_listener_id ON public.play_events(listener_id);
CREATE INDEX idx_play_events_created_at ON public.play_events(created_at DESC);

-- Партиционирование по месяцам для больших объемов
-- CREATE TABLE play_events_2026_01 PARTITION OF play_events
-- FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification info
  type TEXT NOT NULL, -- 'donation', 'message', 'comment', 'like', 'follow', etc
  title TEXT NOT NULL,
  message TEXT,
  
  -- Related entity
  entity_type TEXT, -- 'track', 'video', 'concert', etc
  entity_id UUID,
  
  -- Actor (who triggered this notification)
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_avatar TEXT,
  
  -- Action URL
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- SESSIONS (Security)
-- ============================================

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Device info
  device_name TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT,
  os TEXT,
  
  -- Location
  ip_address INET,
  country TEXT,
  city TEXT,
  
  -- Session info
  is_current BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_last_active_at ON public.sessions(last_active_at DESC);

-- ============================================
-- PAYMENT METHODS
-- ============================================

CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Provider info
  provider TEXT NOT NULL, -- 'stripe', 'yookassa'
  provider_payment_method_id TEXT NOT NULL, -- external ID
  
  -- Card info (last 4 digits only!)
  type TEXT, -- 'visa', 'mastercard', 'paypal', etc
  last4 TEXT,
  expires_month INTEGER,
  expires_year INTEGER,
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON public.payment_methods(is_default);

-- ============================================
-- COINS (Virtual Currency)
-- ============================================

CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction info
  amount INTEGER NOT NULL, -- can be negative for spending
  type TEXT NOT NULL CHECK (type IN ('purchase', 'reward', 'refund', 'promotion_spent', 'subscription_bonus')),
  description TEXT,
  
  -- Related entity (если покупка продвижения)
  entity_type TEXT, -- 'track', 'video', etc
  entity_id UUID,
  
  -- Balance after transaction
  balance_after INTEGER NOT NULL,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);

-- ============================================
-- FOLLOWERS
-- ============================================

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- ============================================
-- LIKES
-- ============================================

CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Likeable entity
  entity_type TEXT NOT NULL, -- 'track', 'video', 'news', 'comment'
  entity_id UUID NOT NULL,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: one like per user per entity
  CONSTRAINT unique_like UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_entity ON public.likes(entity_type, entity_id);

-- ============================================
-- COMMENTS
-- ============================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Commentable entity
  entity_type TEXT NOT NULL, -- 'track', 'video', 'news'
  entity_id UUID NOT NULL,
  
  -- Content
  text TEXT NOT NULL,
  
  -- Nested comments (replies)
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  -- Status
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT text_not_empty CHECK (char_length(text) > 0)
);

CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Автоматическое создание профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Обновление last_seen при активности
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment plays_count
CREATE OR REPLACE FUNCTION public.increment_plays_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tracks
  SET plays_count = plays_count + 1
  WHERE id = NEW.track_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_play_event_created
  AFTER INSERT ON public.play_events
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_plays_count();

-- Update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_text = NEW.text,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW(),
    -- Increment unread count for recipient
    unread_count_user1 = CASE 
      WHEN user1_id != NEW.sender_id THEN unread_count_user1 + 1
      ELSE unread_count_user1
    END,
    unread_count_user2 = CASE
      WHEN user2_id != NEW.sender_id THEN unread_count_user2 + 1
      ELSE unread_count_user2
    END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- ============================================
-- VIEWS (Полезные представления)
-- ============================================

-- Top tracks by plays
CREATE OR REPLACE VIEW public.top_tracks AS
SELECT
  t.*,
  p.username,
  p.full_name,
  p.avatar_url
FROM public.tracks t
JOIN public.profiles p ON t.user_id = p.id
WHERE t.is_public = true
ORDER BY t.plays_count DESC
LIMIT 100;

-- User statistics
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  p.id,
  p.username,
  p.full_name,
  COUNT(DISTINCT t.id) as tracks_count,
  COUNT(DISTINCT v.id) as videos_count,
  COUNT(DISTINCT c.id) as concerts_count,
  COUNT(DISTINCT n.id) as news_count,
  COALESCE(SUM(t.plays_count), 0) as total_plays,
  COALESCE(SUM(d.amount), 0) as total_donations_received
FROM public.profiles p
LEFT JOIN public.tracks t ON t.user_id = p.id
LEFT JOIN public.videos v ON v.user_id = p.id
LEFT JOIN public.concerts c ON c.user_id = p.id
LEFT JOIN public.news n ON n.user_id = p.id
LEFT JOIN public.donations d ON d.recipient_id = p.id AND d.payment_status = 'completed'
GROUP BY p.id, p.username, p.full_name;

```

---

## 🔒 ROW LEVEL SECURITY (RLS)

Включите RLS и создайте политики:

```sql
-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (через trigger)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TRACKS POLICIES
-- ============================================

-- Anyone can view public tracks
CREATE POLICY "Public tracks are viewable by everyone"
  ON public.tracks FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- Users can insert their own tracks
CREATE POLICY "Users can insert own tracks"
  ON public.tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracks
CREATE POLICY "Users can update own tracks"
  ON public.tracks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tracks
CREATE POLICY "Users can delete own tracks"
  ON public.tracks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VIDEOS POLICIES
-- ============================================

CREATE POLICY "Public videos are viewable by everyone"
  ON public.videos FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CONCERTS POLICIES
-- ============================================

CREATE POLICY "Public concerts are viewable by everyone"
  ON public.concerts FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own concerts"
  ON public.concerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own concerts"
  ON public.concerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own concerts"
  ON public.concerts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- NEWS POLICIES
-- ============================================

CREATE POLICY "Public news are viewable by everyone"
  ON public.news FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own news"
  ON public.news FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news"
  ON public.news FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own news"
  ON public.news FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DONATIONS POLICIES
-- ============================================

-- Anyone can view public donations
CREATE POLICY "Public donations are viewable by everyone"
  ON public.donations FOR SELECT
  USING (show_in_public = true OR donor_id = auth.uid() OR recipient_id = auth.uid());

-- Anyone can insert donations (даже анонимные)
CREATE POLICY "Anyone can insert donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- Recipients can update donation visibility
CREATE POLICY "Recipients can update donations"
  ON public.donations FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (user1_id = auth.uid() OR user2_id = auth.uid())
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can create notifications (через edge functions)
CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SESSIONS POLICIES
-- ============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert sessions
CREATE POLICY "System can insert sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PAYMENT METHODS POLICIES
-- ============================================

-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON public.payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON public.payment_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON public.payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COIN TRANSACTIONS POLICIES
-- ============================================

-- Users can view their own coin transactions
CREATE POLICY "Users can view own coin transactions"
  ON public.coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert coin transactions
CREATE POLICY "System can insert coin transactions"
  ON public.coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FOLLOWS POLICIES
-- ============================================

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  USING (true);

-- Users can create follows
CREATE POLICY "Users can create follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- LIKES POLICIES
-- ============================================

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
  ON public.likes FOR SELECT
  USING (true);

-- Users can create likes
CREATE POLICY "Users can create likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Anyone can view comments on public entities
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PLAY EVENTS POLICIES
-- ============================================

-- Users can view their own play events
CREATE POLICY "Users can view own play events"
  ON public.play_events FOR SELECT
  USING (auth.uid() = listener_id);

-- Anyone can insert play events (anonymous tracking)
CREATE POLICY "Anyone can insert play events"
  ON public.play_events FOR INSERT
  WITH CHECK (true);

-- Track owners can view plays on their tracks
CREATE POLICY "Track owners can view plays on own tracks"
  ON public.play_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tracks
      WHERE tracks.id = play_events.track_id
      AND tracks.user_id = auth.uid()
    )
  );

-- ============================================
-- PITCHES POLICIES
-- ============================================

-- Anyone can view approved pitches
CREATE POLICY "Anyone can view approved pitches"
  ON public.pitches FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

-- Users can create their own pitches
CREATE POLICY "Users can create own pitches"
  ON public.pitches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pitches
CREATE POLICY "Users can update own pitches"
  ON public.pitches FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pitches
CREATE POLICY "Users can delete own pitches"
  ON public.pitches FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📦 STORAGE BUCKETS

Создайте buckets в Supabase Dashboard или через SQL:

```sql
-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('track-covers', 'track-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('audio-files', 'audio-files', true, 104857600, ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg']),
  ('video-files', 'video-files', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('concert-posters', 'concert-posters', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('news-images', 'news-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('pitch-decks', 'pitch-decks', true, 20971520, ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']);
```

### Storage Policies:

```sql
-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Avatars: anyone can view, users can upload their own
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Track covers: same as avatars
CREATE POLICY "Anyone can view track covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'track-covers');

CREATE POLICY "Users can upload own track covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'track-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Audio files: public read, authenticated upload
CREATE POLICY "Anyone can view audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Video files: same as audio
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'video-files');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'video-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Concert posters
CREATE POLICY "Anyone can view concert posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'concert-posters');

CREATE POLICY "Users can upload concert posters"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'concert-posters'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- News images
CREATE POLICY "Anyone can view news images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "Users can upload news images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'news-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Pitch decks: private
CREATE POLICY "Users can view own pitch decks"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pitch-decks'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload pitch decks"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pitch-decks'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 🔐 AUTHENTICATION

### Email/Password Setup

```sql
-- В Supabase Dashboard:
-- Authentication > Providers > Enable Email

-- Настройки:
-- ✅ Enable Email Signup
-- ✅ Enable Email Confirmations
-- ✅ Email Templates (кастомизировать)
```

### OAuth Providers (опционально)

```sql
-- Google OAuth
-- Authentication > Providers > Google
-- Client ID: ваш Google Client ID
-- Client Secret: ваш Google Client Secret

-- GitHub OAuth
-- Authentication > Providers > GitHub
-- Client ID: ваш GitHub Client ID
-- Client Secret: ваш GitHub Client Secret

-- VK OAuth (для русской аудитории)
-- Authentication > Providers > VK
```

### 2FA (Two-Factor Authentication)

```typescript
// Включить 2FA для пользователя
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'promo.music 2FA'
});

// Verify 2FA
const { data: verified, error: verifyError } = await supabase.auth.mfa.verify({
  factorId: data.id,
  challengeId: challenge.id,
  code: userEnteredCode
});
```

---

## 🔄 REALTIME SUBSCRIPTIONS

### Включить Realtime для таблиц:

```sql
-- В Supabase Dashboard:
-- Database > Replication > Enable для таблиц:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.play_events;
```

### Frontend Realtime Integration:

```typescript
// Subscribe to new messages
const messagesChannel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Добавить сообщение в UI
    }
  )
  .subscribe();

// Subscribe to notifications
const notificationsChannel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
      // Показать toast notification
    }
  )
  .subscribe();

// Presence (online status)
const presenceChannel = supabase.channel('online-users', {
  config: { presence: { key: userId } }
});

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    console.log('Online users:', state);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({ online_at: new Date().toISOString() });
    }
  });
```

---

## ⚡ EDGE FUNCTIONS

Создайте Edge Functions для серверной логики:

### 1. Payment Webhook

```bash
supabase functions new payment-webhook
```

```typescript
// supabase/functions/payment-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    // Verify webhook signature
    // ... stripe verification logic
    
    const event = JSON.parse(body);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    if (event.type === 'payment_intent.succeeded') {
      // Update donation status
      await supabase
        .from('donations')
        .update({ payment_status: 'completed' })
        .eq('payment_id', event.data.object.id);
      
      // Send notification to recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: event.data.object.metadata.recipient_id,
          type: 'donation',
          title: 'Новый донат!',
          message: `Вы получили ${event.data.object.amount / 100} ₽`
        });
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

### 2. Send Email Notification

```bash
supabase functions new send-email
```

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { to, subject, html } = await req.json();
  
  // Используем Resend или SendGrid
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@promo.music',
      to,
      subject,
      html
    })
  });
  
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### 3. Analytics Aggregation

```bash
supabase functions new analytics-aggregation
```

```typescript
// supabase/functions/analytics-aggregation/index.ts
// Запускается по CRON каждый день в 00:00
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Aggregate play events for yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const { data: tracks } = await supabase
    .from('play_events')
    .select('track_id, COUNT(*)')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', new Date().toISOString())
    .group('track_id');
  
  // Update tracks stats
  // ... logic
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### Deploy Edge Functions:

```bash
# Deploy single function
supabase functions deploy payment-webhook --no-verify-jwt

# Deploy all functions
supabase functions deploy

# Set environment variables
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🎨 FRONTEND INTEGRATION

### Установка Supabase Client

```bash
cd promo.music
npm install @supabase/supabase-js
# или
pnpm add @supabase/supabase-js
```

### Создайте Supabase Client:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

### Generate TypeScript Types:

```bash
# Generate types from database
supabase gen types typescript --project-id xxxxx > src/types/supabase.ts
```

### Auth Hook:

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };
}
```

### Пример использования в компонентах:

```typescript
// src/app/components/auth-provider.tsx
import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

### Wrap App with AuthProvider:

```typescript
// src/app/App.tsx
import { AuthProvider } from '@/app/components/auth-provider';

function App() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  );
}
```

### Protected Route Example:

```typescript
// src/app/components/protected-route.tsx
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/app/components/auth-provider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### CRUD Operations Examples:

```typescript
// Fetch user's tracks
const { data: tracks, error } = await supabase
  .from('tracks')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// Create new track
const { data, error } = await supabase
  .from('tracks')
  .insert({
    user_id: user.id,
    title: 'My New Track',
    audio_url: 'https://...',
    is_public: true
  })
  .select()
  .single();

// Upload audio file
const file = event.target.files[0];
const fileName = `${user.id}/${Date.now()}-${file.name}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('audio-files')
  .upload(fileName, file);

if (uploadData) {
  const { data: publicUrl } = supabase.storage
    .from('audio-files')
    .getPublicUrl(fileName);
  
  // Save publicUrl.publicUrl to track
}

// Real-time messages
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [conversationId]);
```

---

## 🚀 VERCEL DEPLOYMENT

### Шаг 1: Подготовка проекта

```bash
# Убедитесь что проект билдится локально
npm run build
# или
pnpm build

# Проверьте что .gitignore содержит:
# node_modules
# dist
# .env
# .env.local
```

### Шаг 2: Создайте vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Шаг 3: Deploy на Vercel

```bash
# Установите Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### Или через GitHub Integration:

1. Пуш код на GitHub
2. Зайти на https://vercel.com
3. New Project
4. Import Git Repository
5. Select promo.music repo
6. Configure Project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Add Environment Variables (см. ниже)
8. Deploy

---

## 🔑 ENVIRONMENT VARIABLES

### Локальная разработка (.env.local):

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (опционально)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Analytics (опционально)
VITE_PLAUSIBLE_DOMAIN=promo.music
```

### Vercel Environment Variables:

В Vercel Dashboard > Project > Settings > Environment Variables добавьте:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx (для production)
```

### Supabase Edge Functions Secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow:

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        continue-on-error: true
      
      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel (Production)
        if: github.ref == 'refs/heads/main'
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Deploy to Vercel (Preview)
        if: github.event_name == 'pull_request'
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Supabase Migrations CI/CD:

```yaml
name: Supabase Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Run migrations
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 📊 MONITORING & ANALYTICS

### Supabase Dashboard Monitoring:

1. **Database Performance**
   - Query performance
   - Connection pool usage
   - Slow queries
   
2. **Storage Usage**
   - Bandwidth
   - File count
   - Storage size

3. **Auth Metrics**
   - Active users
   - Sign-ups
   - Failed login attempts

4. **API Usage**
   - Requests per second
   - Error rates
   - Response times

### Vercel Analytics:

```typescript
// src/app/App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Error Tracking (Sentry):

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

### Custom Analytics:

```typescript
// src/lib/analytics.ts
import { supabase } from '@/lib/supabase';

export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  await supabase.from('analytics_events').insert({
    event_name: eventName,
    properties,
    user_id: (await supabase.auth.getUser()).data.user?.id,
    timestamp: new Date().toISOString()
  });
}

// Usage
trackEvent('track_played', { track_id: 'xxx', duration: 180 });
trackEvent('donation_sent', { amount: 500, recipient_id: 'yyy' });
```

---

## 🎯 DEPLOYMENT CHECKLIST

### Pre-Deploy:

- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Storage buckets created
- [ ] Edge functions deployed
- [ ] Environment variables set
- [ ] TypeScript types generated
- [ ] Build successful locally
- [ ] Tests passing

### Post-Deploy:

- [ ] Database accessible
- [ ] Authentication working
- [ ] File uploads working
- [ ] Real-time subscriptions active
- [ ] Edge functions responding
- [ ] Analytics tracking
- [ ] Error monitoring active
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Domain configured (если свой домен)

### Security:

- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] Environment secrets secured
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] 2FA available for users
- [ ] HTTPS enforced

---

## 📝 ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ

```bash
# Local development
supabase start                    # Start local Supabase
supabase stop                     # Stop local Supabase
supabase db reset                 # Reset local database
supabase db push                  # Push migrations to remote
supabase db pull                  # Pull schema from remote
supabase gen types typescript     # Generate TypeScript types

# Edge Functions
supabase functions serve          # Serve functions locally
supabase functions deploy         # Deploy all functions
supabase functions logs           # View function logs

# Storage
supabase storage ls               # List buckets
supabase storage cp               # Copy files

# Database
supabase db dump                  # Export database
supabase db restore               # Import database

# Vercel
vercel                            # Deploy preview
vercel --prod                     # Deploy production
vercel logs                       # View logs
vercel domains                    # Manage domains
vercel env                        # Manage env vars
```

---

## 🚀 ГОТОВО К ДЕПЛОЮ!

Следуйте этому roadmap пошагово, и ваш promo.music будет успешно развернут на Supabase + Vercel с полным функционалом backend и frontend!

**Следующие шаги:**
1. Создать Supabase проект
2. Применить все миграции
3. Настроить Storage и Auth
4. Интегрировать в frontend
5. Deploy на Vercel
6. Мониторинг и оптимизация

🎉 Удачи с запуском!
