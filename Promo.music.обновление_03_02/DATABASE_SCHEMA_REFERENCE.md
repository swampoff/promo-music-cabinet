# 🗄️ DATABASE SCHEMA REFERENCE

## ⚠️ ВАЖНОЕ РАЗЪЯСНЕНИЕ

**Текущая реализация:** KV Store (`kv_store_84730125`)  
**SQL схемы ниже:** Документация для reference и будущих версий  
**Статус:** НЕ выполняются в Figma Make, используются для документации

---

## 📊 ТЕКУЩАЯ АРХИТЕКТУРА: KV STORE

### Как работает сейчас

```typescript
// Все данные хранятся в виде ключ-значение
await kv.set('users:123:profile', { name: 'Artist', ... });
await kv.get('users:123:profile');

// Ключи структурированы для имитации таблиц
// Это позволяет работать без SQL
```

### Структура ключей (текущая реализация)

```
┌──────────────────────────────────────────────────────────┐
│ CATEGORY          │ KEY PATTERN                          │
├──────────────────────────────────────────────────────────┤
│ Users             │ users:{userId}:profile               │
│                   │ users:{userId}:settings              │
│                   │ users:{userId}:subscription          │
│                   │                                       │
│ Tracks            │ tracks:{userId}:{trackId}            │
│                   │ tracks:{userId}:list                 │
│                   │                                       │
│ Videos            │ videos:{userId}:{videoId}            │
│                   │ videos:{userId}:list                 │
│                   │                                       │
│ Concerts          │ concerts:{userId}:{concertId}        │
│                   │ concerts:{userId}:list               │
│                   │ concerts:public:promoted             │
│                   │                                       │
│ News              │ news:{userId}:{newsId}               │
│                   │ news:{userId}:list                   │
│                   │ news:public:promoted                 │
│                   │                                       │
│ Donations         │ donations:{userId}:list              │
│                   │ donations:{userId}:{donationId}      │
│                   │                                       │
│ Coins             │ coins:{userId}:balance               │
│                   │ coins:{userId}:transactions          │
│                   │                                       │
│ Banners           │ banners:{userId}:{bannerId}          │
│                   │ banners:{userId}:list                │
│                   │ banners:active:list                  │
│                   │                                       │
│ Promotion         │ promotion:{userId}:{campaignId}      │
│                   │ promotion:{userId}:list              │
│                   │                                       │
│ Messages          │ messages:{conversationId}:list       │
│                   │ messages:{userId}:conversations      │
│                   │                                       │
│ Notifications     │ notifications:{userId}:list          │
│                   │ notifications:{userId}:unread        │
│                   │                                       │
│ Email             │ email:{userId}:subscriptions         │
│                   │ email:{userId}:history               │
│                   │                                       │
│ Tickets           │ tickets:{userId}:list                │
│                   │ tickets:{ticketId}:details           │
│                   │                                       │
│ Payments          │ payments:{userId}:transactions       │
│                   │ payments:{userId}:methods            │
│                   │                                       │
│ Settings          │ settings:{userId}:profile            │
│                   │ settings:{userId}:security           │
│                   │ settings:{userId}:notifications      │
│                   │ settings:{userId}:privacy            │
│                   │ settings:{userId}:payment_methods    │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 SQL REFERENCE SCHEMA (для документации)

### ⚠️ Примечание
Эти SQL схемы показывают **ожидаемую структуру данных** для будущих версий.  
В текущей версии все данные хранятся в KV Store как JSON.

---

## 1. USERS & PROFILES

### users (базовая информация)
```sql
-- Reference schema (не выполняется)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KV Store equivalent:
-- Key: users:{userId}:base
-- Value: { id, email, username, created_at, updated_at }
```

### profiles (расширенная информация)
```sql
-- Reference schema
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(50),
  socials JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KV Store equivalent:
-- Key: users:{userId}:profile
-- Value: { name, bio, avatar_url, location, website, phone, socials, verified }
```

---

## 2. CONTENT TABLES

### tracks (музыкальные треки)
```sql
-- Reference schema
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  authors VARCHAR(255),
  cover_url TEXT,
  audio_url TEXT,
  duration INTEGER, -- seconds
  release_date DATE,
  status VARCHAR(20) DEFAULT 'draft', -- draft, pending, approved, rejected
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_genre ON tracks(genre);

-- KV Store equivalent:
-- Key: tracks:{userId}:{trackId}
-- Value: { id, title, genre, authors, cover_url, audio_url, ... }
-- Key: tracks:{userId}:list (массив trackId)
```

### videos (видеоклипы)
```sql
-- Reference schema
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube/Rutube URL
  thumbnail_url TEXT,
  platform VARCHAR(50), -- youtube, rutube
  duration INTEGER, -- seconds
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);

-- KV Store equivalent:
-- Key: videos:{userId}:{videoId}
-- Key: videos:{userId}:list
```

### concerts (концерты и мероприятия)
```sql
-- Reference schema
CREATE TABLE concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  city VARCHAR(100),
  venue VARCHAR(255),
  address TEXT,
  type VARCHAR(50), -- concert, festival, private
  banner_url TEXT,
  ticket_price_from DECIMAL(10, 2),
  ticket_price_to DECIMAL(10, 2),
  ticket_link TEXT,
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_concerts_user_id ON concerts(user_id);
CREATE INDEX idx_concerts_date ON concerts(date);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_promoted ON concerts(is_promoted) WHERE is_promoted = TRUE;

-- KV Store equivalent:
-- Key: concerts:{userId}:{concertId}
-- Key: concerts:{userId}:list
-- Key: concerts:public:promoted (для продвигаемых)
```

### news (новости и публикации)
```sql
-- Reference schema
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview TEXT,
  cover_image TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_news_user_id ON news(user_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_promoted ON news(is_promoted) WHERE is_promoted = TRUE;

-- KV Store equivalent:
-- Key: news:{userId}:{newsId}
-- Key: news:{userId}:list
-- Key: news:public:promoted
```

---

## 3. FINANCIAL TABLES

### donations (донаты от пользователей)
```sql
-- Reference schema
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES users(id) ON DELETE CASCADE,
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  donor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'completed', -- pending, completed, refunded
  payment_method VARCHAR(50), -- card, yoomoney, etc
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donations_artist_id ON donations(artist_id);
CREATE INDEX idx_donations_donor_user_id ON donations(donor_user_id);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- KV Store equivalent:
-- Key: donations:{userId}:list
-- Key: donations:{userId}:{donationId}
```

### coins_balance (баланс коинов)
```sql
-- Reference schema
CREATE TABLE coins_balance (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KV Store equivalent:
-- Key: coins:{userId}:balance
-- Value: { balance, lifetime_earned, lifetime_spent, updated_at }
```

### coins_transactions (транзакции коинов)
```sql
-- Reference schema
CREATE TABLE coins_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earn, negative for spend
  type VARCHAR(50) NOT NULL, -- purchase, earn, spend, refund
  description TEXT,
  related_entity_type VARCHAR(50), -- banner, promotion, etc
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_coins_transactions_user_id ON coins_transactions(user_id);
CREATE INDEX idx_coins_transactions_created_at ON coins_transactions(created_at DESC);

-- KV Store equivalent:
-- Key: coins:{userId}:transactions (массив)
```

### subscriptions (подписки пользователей)
```sql
-- Reference schema
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL, -- free, basic, pro, premium
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- KV Store equivalent:
-- Key: users:{userId}:subscription
```

### payment_transactions (история платежей)
```sql
-- Reference schema
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  type VARCHAR(50) NOT NULL, -- donation_received, coin_purchase, subscription, promotion
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50),
  provider VARCHAR(50), -- stripe, yoomoney, etc
  provider_transaction_id VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_type ON payment_transactions(type);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- KV Store equivalent:
-- Key: payments:{userId}:transactions
-- Key: payments:{userId}:{transactionId}
```

---

## 4. PROMOTION & MARKETING

### banner_ads (баннерная реклама)
```sql
-- Reference schema
CREATE TABLE banner_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  target_url TEXT,
  placement VARCHAR(50), -- homepage, sidebar, concerts, etc
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  targeting JSONB, -- { cities: [], genres: [] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_banner_ads_user_id ON banner_ads(user_id);
CREATE INDEX idx_banner_ads_status ON banner_ads(status);
CREATE INDEX idx_banner_ads_placement ON banner_ads(placement);
CREATE INDEX idx_banner_ads_active ON banner_ads(status) WHERE status = 'active';

-- KV Store equivalent:
-- Key: banners:{userId}:{bannerId}
-- Key: banners:{userId}:list
-- Key: banners:active:list (активные баннеры)
```

### promotion_campaigns (маркетинговые кампании)
```sql
-- Reference schema
CREATE TABLE promotion_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- track_promotion, concert_promotion, profile_boost
  target_entity_type VARCHAR(50), -- track, concert, profile
  target_entity_id UUID,
  status VARCHAR(20) DEFAULT 'draft',
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  reach INTEGER DEFAULT 0, -- сколько людей увидели
  engagement INTEGER DEFAULT 0, -- сколько взаимодействовали
  conversions INTEGER DEFAULT 0, -- сколько совершили действие
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  settings JSONB, -- настройки кампании
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_promotion_campaigns_user_id ON promotion_campaigns(user_id);
CREATE INDEX idx_promotion_campaigns_status ON promotion_campaigns(status);
CREATE INDEX idx_promotion_campaigns_type ON promotion_campaigns(type);

-- KV Store equivalent:
-- Key: promotion:{userId}:{campaignId}
-- Key: promotion:{userId}:list
```

### pitching_submissions (питчинг треков/видео)
```sql
-- Reference schema
CREATE TABLE pitching_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL, -- track, video
  content_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- radio, playlist, festival, label
  target_name VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pitching_user_id ON pitching_submissions(user_id);
CREATE INDEX idx_pitching_status ON pitching_submissions(status);
CREATE INDEX idx_pitching_content ON pitching_submissions(content_type, content_id);

-- KV Store equivalent:
-- Key: pitching:{userId}:list
-- Key: pitching:{userId}:{submissionId}
```

---

## 5. COMMUNICATION

### messages (сообщения в чатах)
```sql
-- Reference schema
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB, -- [{ type, url, name }]
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- KV Store equivalent:
-- Key: messages:{conversationId}:list
-- Key: messages:{userId}:conversations (список разговоров)
```

### conversations (разговоры)
```sql
-- Reference schema
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count_p1 INTEGER DEFAULT 0,
  unread_count_p2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- KV Store equivalent:
-- Key: conversations:{userId}:list
-- Key: conversations:{conversationId}:details
```

### notifications (уведомления)
```sql
-- Reference schema
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- donation, message, concert_reminder, etc
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link TEXT, -- куда ведёт уведомление
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- дополнительные данные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- KV Store equivalent:
-- Key: notifications:{userId}:list
-- Key: notifications:{userId}:unread (счётчик)
```

---

## 6. EMAIL SYSTEM

### email_subscriptions (подписки на рассылки)
```sql
-- Reference schema
CREATE TABLE email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- news, updates, marketing
  is_subscribed BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_email_subscriptions_user_id ON email_subscriptions(user_id);
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_category ON email_subscriptions(category);

-- KV Store equivalent:
-- Key: email:{userId}:subscriptions
```

### email_history (история отправки)
```sql
-- Reference schema
CREATE TABLE email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  template_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, bounced
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_history_user_id ON email_history(user_id);
CREATE INDEX idx_email_history_status ON email_history(status);
CREATE INDEX idx_email_history_sent_at ON email_history(sent_at DESC);

-- KV Store equivalent:
-- Key: email:{userId}:history
```

---

## 7. TICKETING & SUPPORT

### tickets (тикеты поддержки)
```sql
-- Reference schema
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50), -- technical, billing, content, other
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to UUID REFERENCES users(id),
  messages JSONB, -- [{ user_id, message, created_at }]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- KV Store equivalent:
-- Key: tickets:{userId}:list
-- Key: tickets:{ticketId}:details
```

---

## 8. SETTINGS & PREFERENCES

### user_settings (настройки пользователя)
```sql
-- Reference schema
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_push BOOLEAN DEFAULT TRUE,
  notifications_sms BOOLEAN DEFAULT FALSE,
  
  -- Privacy settings
  profile_visibility VARCHAR(20) DEFAULT 'public', -- public, private, followers
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_messages_from VARCHAR(20) DEFAULT 'everyone', -- everyone, followers, none
  
  -- Content preferences
  content_language VARCHAR(5) DEFAULT 'ru',
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  
  -- Marketing preferences
  marketing_emails BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KV Store equivalent:
-- Key: settings:{userId}:profile
-- Key: settings:{userId}:notifications
-- Key: settings:{userId}:privacy
```

### payment_methods (методы оплаты)
```sql
-- Reference schema
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- card, yoomoney, paypal
  provider VARCHAR(50), -- stripe, yoomoney
  last4 VARCHAR(4), -- последние 4 цифры карты
  brand VARCHAR(50), -- visa, mastercard, mir
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default) WHERE is_default = TRUE;

-- KV Store equivalent:
-- Key: payments:{userId}:methods
-- Key: payments:{userId}:method:{methodId}
```

---

## 9. ANALYTICS & STATS

### track_analytics (аналитика треков)
```sql
-- Reference schema
CREATE TABLE track_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  plays INTEGER DEFAULT 0,
  unique_listeners INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  playlist_adds INTEGER DEFAULT 0,
  platform_stats JSONB, -- { spotify: {}, apple: {}, etc }
  geographic_stats JSONB, -- { RU: 100, US: 50 }
  UNIQUE(track_id, date)
);

-- Indexes
CREATE INDEX idx_track_analytics_track_id ON track_analytics(track_id);
CREATE INDEX idx_track_analytics_date ON track_analytics(date DESC);

-- KV Store equivalent:
-- Key: analytics:tracks:{trackId}:{date}
-- Key: analytics:tracks:{trackId}:summary
```

### concert_analytics (аналитика концертов)
```sql
-- Reference schema
CREATE TABLE concert_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ticket_views INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  referral_sources JSONB, -- { instagram: 50, facebook: 30 }
  UNIQUE(concert_id, date)
);

-- Indexes
CREATE INDEX idx_concert_analytics_concert_id ON concert_analytics(concert_id);
CREATE INDEX idx_concert_analytics_date ON concert_analytics(date DESC);

-- KV Store equivalent:
-- Key: analytics:concerts:{concertId}:{date}
```

---

## 📊 SUMMARY: KV STORE MAPPING

### Все ключи в одной таблице

```typescript
// ==================== USERS ====================
'users:{userId}:base'                           // User базовые данные
'users:{userId}:profile'                        // Profile данные
'users:{userId}:settings'                       // Настройки
'users:{userId}:subscription'                   // Подписка

// ==================== CONTENT ====================
'tracks:{userId}:{trackId}'                     // Трек
'tracks:{userId}:list'                          // Список треков
'videos:{userId}:{videoId}'                     // Видео
'videos:{userId}:list'                          // Список видео
'concerts:{userId}:{concertId}'                 // Концерт
'concerts:{userId}:list'                        // Список концертов
'concerts:public:promoted'                      // Продвигаемые концерты
'news:{userId}:{newsId}'                        // Новость
'news:{userId}:list'                            // Список новостей
'news:public:promoted'                          // Продвигаемые новости

// ==================== FINANCIAL ====================
'donations:{userId}:list'                       // Список донатов
'donations:{userId}:{donationId}'               // Детали доната
'coins:{userId}:balance'                        // Баланс коинов
'coins:{userId}:transactions'                   // Транзакции коинов
'payments:{userId}:transactions'                // Платежи
'payments:{userId}:methods'                     // Методы оплаты
'payments:{userId}:method:{methodId}'           // Детали метода

// ==================== PROMOTION ====================
'banners:{userId}:{bannerId}'                   // Баннер
'banners:{userId}:list'                         // Список баннеров
'banners:active:list'                           // Активные баннеры
'promotion:{userId}:{campaignId}'               // Кампания
'promotion:{userId}:list'                       // Список кампаний
'pitching:{userId}:list'                        // Питчинг заявки
'pitching:{userId}:{submissionId}'              // Детали питчинга

// ==================== COMMUNICATION ====================
'messages:{conversationId}:list'                // Сообщения в чате
'messages:{userId}:conversations'               // Список чатов
'conversations:{userId}:list'                   // Список разговоров
'conversations:{conversationId}:details'        // Детали разговора
'notifications:{userId}:list'                   // Уведомления
'notifications:{userId}:unread'                 // Непрочитанные

// ==================== EMAIL ====================
'email:{userId}:subscriptions'                  // Email подписки
'email:{userId}:history'                        // История email

// ==================== SUPPORT ====================
'tickets:{userId}:list'                         // Список тикетов
'tickets:{ticketId}:details'                    // Детали тикета

// ==================== SETTINGS ====================
'settings:{userId}:profile'                     // Настройки профиля
'settings:{userId}:security'                    // Безопасность
'settings:{userId}:notifications'               // Уведомления
'settings:{userId}:privacy'                     // Приватность
'settings:{userId}:payment_methods'             // Методы оплаты

// ==================== ANALYTICS ====================
'analytics:tracks:{trackId}:{date}'             // Аналитика трека
'analytics:tracks:{trackId}:summary'            // Сводка
'analytics:concerts:{concertId}:{date}'         // Аналитика концерта
'analytics:user:{userId}:dashboard'             // Dashboard stats
```

---

## 🔧 HELPER FUNCTIONS

### Функции для работы с KV Store

```typescript
// === USER FUNCTIONS ===

async function getUser(userId: string) {
  return await kv.get(`users:${userId}:profile`);
}

async function updateUser(userId: string, data: any) {
  await kv.set(`users:${userId}:profile`, data);
}

// === TRACK FUNCTIONS ===

async function createTrack(userId: string, trackData: any) {
  const trackId = crypto.randomUUID();
  await kv.set(`tracks:${userId}:${trackId}`, trackData);
  
  // Добавить в список
  const list = await kv.get(`tracks:${userId}:list`) || [];
  list.push(trackId);
  await kv.set(`tracks:${userId}:list`, list);
  
  return trackId;
}

async function getUserTracks(userId: string) {
  const trackIds = await kv.get(`tracks:${userId}:list`) || [];
  const tracks = await Promise.all(
    trackIds.map(id => kv.get(`tracks:${userId}:${id}`))
  );
  return tracks.filter(Boolean);
}

// === COINS FUNCTIONS ===

async function getCoinsBalance(userId: string) {
  return await kv.get(`coins:${userId}:balance`) || { balance: 0 };
}

async function addCoins(userId: string, amount: number, description: string) {
  const balance = await getCoinsBalance(userId);
  balance.balance += amount;
  balance.lifetime_earned += amount;
  await kv.set(`coins:${userId}:balance`, balance);
  
  // Добавить транзакцию
  const transactions = await kv.get(`coins:${userId}:transactions`) || [];
  transactions.push({
    id: crypto.randomUUID(),
    amount,
    type: 'earn',
    description,
    created_at: new Date().toISOString()
  });
  await kv.set(`coins:${userId}:transactions`, transactions);
}

async function spendCoins(userId: string, amount: number, description: string) {
  const balance = await getCoinsBalance(userId);
  if (balance.balance < amount) {
    throw new Error('Insufficient coins');
  }
  
  balance.balance -= amount;
  balance.lifetime_spent += amount;
  await kv.set(`coins:${userId}:balance`, balance);
  
  // Добавить транзакцию
  const transactions = await kv.get(`coins:${userId}:transactions`) || [];
  transactions.push({
    id: crypto.randomUUID(),
    amount: -amount,
    type: 'spend',
    description,
    created_at: new Date().toISOString()
  });
  await kv.set(`coins:${userId}:transactions`, transactions);
}

// === BANNER FUNCTIONS ===

async function createBanner(userId: string, bannerData: any) {
  const bannerId = crypto.randomUUID();
  await kv.set(`banners:${userId}:${bannerId}`, bannerData);
  
  // Добавить в список пользователя
  const userList = await kv.get(`banners:${userId}:list`) || [];
  userList.push(bannerId);
  await kv.set(`banners:${userId}:list`, userList);
  
  // Если активный, добавить в глобальный список
  if (bannerData.status === 'active') {
    const activeList = await kv.get('banners:active:list') || [];
    activeList.push(bannerId);
    await kv.set('banners:active:list', activeList);
  }
  
  return bannerId;
}

async function getActiveBanners() {
  const bannerIds = await kv.get('banners:active:list') || [];
  const banners = await Promise.all(
    bannerIds.map(id => {
      // Баннер может быть от любого пользователя
      // Нужно найти по всем ключам или хранить полный путь
      return kv.getByPrefix(`banners:`).then(results => 
        results.find(b => b.id === id)
      );
    })
  );
  return banners.filter(Boolean);
}

// === NOTIFICATION FUNCTIONS ===

async function createNotification(userId: string, notification: any) {
  const notifications = await kv.get(`notifications:${userId}:list`) || [];
  notifications.unshift({
    id: crypto.randomUUID(),
    ...notification,
    is_read: false,
    created_at: new Date().toISOString()
  });
  await kv.set(`notifications:${userId}:list`, notifications);
  
  // Обновить счётчик непрочитанных
  const unread = await kv.get(`notifications:${userId}:unread`) || 0;
  await kv.set(`notifications:${userId}:unread`, unread + 1);
}

async function markNotificationAsRead(userId: string, notificationId: string) {
  const notifications = await kv.get(`notifications:${userId}:list`) || [];
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification && !notification.is_read) {
    notification.is_read = true;
    notification.read_at = new Date().toISOString();
    await kv.set(`notifications:${userId}:list`, notifications);
    
    // Уменьшить счётчик
    const unread = await kv.get(`notifications:${userId}:unread`) || 0;
    await kv.set(`notifications:${userId}:unread`, Math.max(0, unread - 1));
  }
}

// === MESSAGE FUNCTIONS ===

async function sendMessage(conversationId: string, senderId: string, recipientId: string, content: string) {
  const messages = await kv.get(`messages:${conversationId}:list`) || [];
  const message = {
    id: crypto.randomUUID(),
    sender_id: senderId,
    recipient_id: recipientId,
    content,
    is_read: false,
    created_at: new Date().toISOString()
  };
  
  messages.push(message);
  await kv.set(`messages:${conversationId}:list`, messages);
  
  // Обновить последнее сообщение в разговоре
  const conversation = await kv.get(`conversations:${conversationId}:details`) || {};
  conversation.last_message = content;
  conversation.last_message_at = message.created_at;
  await kv.set(`conversations:${conversationId}:details`, conversation);
  
  return message;
}
```

---

## 📝 NOTES

### Важные замечания:

1. **SQL схемы выше** - это REFERENCE документация
   - Показывают ожидаемую структуру данных
   - НЕ выполняются в Figma Make
   - Используются для понимания архитектуры

2. **KV Store** - текущая реализация
   - Работает автоматически
   - Не требует настройки
   - Все функции уже реализованы в `/supabase/functions/server/`

3. **Миграция на SQL** (будущее)
   - Когда проект выйдет из Figma Make
   - Можно будет применить SQL схемы
   - Данные можно будет мигрировать из KV в SQL

4. **Backup стратегия**
   - KV Store данные можно экспортировать
   - Используйте `getByPrefix` для экспорта всех данных
   - Регулярно делайте backup важных данных

---

**Создано:** 28 января 2026  
**Версия:** v1.0.0 Reference Schema  
**Статус:** Документация для текущей и будущих версий
