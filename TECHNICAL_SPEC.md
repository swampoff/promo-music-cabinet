# 🔧 PROMO.MUSIC - Техническая спецификация

## 📋 Содержание

1. [Системные требования](#системные-требования)
2. [API спецификация](#api-спецификация)
3. [Схема базы данных](#схема-базы-данных)
4. [Типы данных](#типы-данных)
5. [Валидация](#валидация)
6. [Backend endpoints](#backend-endpoints)
7. [Интеграция Supabase](#интеграция-supabase)

---

## 💻 Системные требования

### Минимальные:
- Node.js >= 18.0.0
- npm >= 9.0.0 или pnpm >= 8.0.0
- Браузер с поддержкой ES6+
- 2GB RAM

### Рекомендуемые:
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Современный браузер (Chrome, Firefox, Safari, Edge)
- 4GB+ RAM

---

## 🔌 API спецификация

### REST API Endpoints:

```typescript
// Base URL
const API_URL = 'https://your-project.supabase.co/rest/v1'

// Headers
{
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${userToken}`
}
```

---

## 🗄️ Схема базы данных (PostgreSQL)

### 1. USERS Table:

```sql
CREATE TABLE users (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  
  -- Profile
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  
  -- Contact
  location TEXT,
  website TEXT,
  phone TEXT,
  
  -- Socials
  instagram TEXT,
  twitter TEXT,
  facebook TEXT,
  youtube TEXT,
  
  -- Game
  coins INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  
  -- Stats
  total_plays INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  
  -- Settings
  notifications_push BOOLEAN DEFAULT TRUE,
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_sms BOOLEAN DEFAULT FALSE,
  privacy_profile TEXT DEFAULT 'public',
  privacy_messages TEXT DEFAULT 'everyone',
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'ru',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### 2. TRACKS Table:

```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  artist TEXT,
  genre TEXT,
  release_date DATE,
  
  -- Files
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  
  -- Stats
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_starts_at TIMESTAMP WITH TIME ZONE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_is_promoted ON tracks(is_promoted);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);

-- RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all approved tracks"
  ON tracks FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks"
  ON tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks"
  ON tracks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks"
  ON tracks FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. VIDEOS Table:

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Files/URLs
  video_type TEXT CHECK (video_type IN ('youtube', 'rutube', 'upload')),
  video_url TEXT,
  thumbnail_url TEXT,
  
  -- Stats
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Similar indexes and RLS as tracks
```

### 4. CONCERTS Table:

```sql
CREATE TABLE concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event details
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  type TEXT,
  description TEXT,
  
  -- Media
  banner_url TEXT,
  
  -- Tickets
  ticket_price_from TEXT,
  ticket_price_to TEXT,
  ticket_link TEXT,
  
  -- Stats
  views INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. NEWS Table:

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[],
  
  -- Stats
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  
  -- Promotion
  is_promoted BOOLEAN DEFAULT FALSE,
  promotion_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. DONATIONS Table:

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Donor
  donor_name TEXT,
  donor_email TEXT,
  
  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  
  -- Message
  message TEXT,
  
  -- Payment
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
```

### 7. MESSAGES Table:

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  text TEXT,
  
  -- Media
  image_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  voice_url TEXT,
  voice_duration INTEGER,
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  
  -- Features
  reply_to UUID REFERENCES messages(id),
  edited BOOLEAN DEFAULT FALSE,
  pinned BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);
```

### 8. REACTIONS Table:

```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(message_id, user_id, emoji)
);
```

### 9. CAMPAIGNS Table:

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content_type TEXT CHECK (content_type IN ('track', 'video', 'concert', 'news')),
  content_id UUID NOT NULL,
  
  -- Budget
  duration INTEGER NOT NULL, -- days
  coins_spent INTEGER NOT NULL,
  
  -- Stats
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Period
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
```

### 10. ANALYTICS Table:

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Time
  date DATE NOT NULL,
  
  -- Metrics
  plays INTEGER DEFAULT 0,
  unique_listeners INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- seconds
  
  -- Demographics
  country TEXT,
  city TEXT,
  age_group TEXT,
  gender TEXT,
  
  -- Platform
  platform TEXT, -- spotify, apple_music, etc
  device TEXT, -- mobile, desktop, tablet
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(track_id, date, country, platform)
);

-- Indexes
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_track_id ON analytics(track_id);
CREATE INDEX idx_analytics_date ON analytics(date DESC);
CREATE INDEX idx_analytics_country ON analytics(country);
```

### 11. ACHIEVEMENTS Table:

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  
  -- Rewards
  points INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  
  -- Requirements
  requirement_type TEXT, -- plays, followers, donations, etc
  requirement_value INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);
```

---

## 📝 Типы данных (TypeScript)

### User Types:

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  location: string;
  website: string;
  phone: string;
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
  coins: number;
  level: number;
  points: number;
  total_plays: number;
  total_followers: number;
  created_at: string;
}

export interface UserSettings {
  notifications_push: boolean;
  notifications_email: boolean;
  notifications_sms: boolean;
  privacy_profile: 'public' | 'private' | 'followers';
  privacy_messages: 'everyone' | 'followers' | 'none';
  theme: 'dark' | 'light' | 'auto';
  language: string;
}
```

### Content Types:

```typescript
export interface Track {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  genre: string;
  release_date: string;
  audio_url: string;
  cover_url: string;
  plays: number;
  likes: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  is_promoted: boolean;
  promotion_starts_at?: string;
  promotion_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_type: 'youtube' | 'rutube' | 'upload';
  video_url: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_promoted: boolean;
  promotion_ends_at?: string;
  created_at: string;
}

export interface Concert {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  type: string;
  description: string;
  banner_url: string;
  ticket_price_from: string;
  ticket_price_to: string;
  ticket_link: string;
  views: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_promoted: boolean;
  created_at: string;
}

export interface News {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string;
  tags: string[];
  views: number;
  likes: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_promoted: boolean;
  created_at: string;
}
```

### Messaging Types:

```typescript
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text?: string;
  image_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  voice_url?: string;
  voice_duration?: number;
  status: 'sent' | 'delivered' | 'read';
  reply_to?: string;
  edited: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  read_at?: string;
}

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
  pinned: boolean;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}
```

### Campaign Types:

```typescript
export interface Campaign {
  id: string;
  user_id: string;
  content_type: 'track' | 'video' | 'concert' | 'news';
  content_id: string;
  duration: number;
  coins_spent: number;
  views: number;
  clicks: number;
  conversions: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  created_at: string;
}
```

### Analytics Types:

```typescript
export interface AnalyticsData {
  id: string;
  user_id: string;
  track_id: string;
  date: string;
  plays: number;
  unique_listeners: number;
  total_duration: number;
  country: string;
  city: string;
  age_group: string;
  gender: string;
  platform: string;
  device: string;
}

export interface AnalyticsSummary {
  total_plays: number;
  total_listeners: number;
  avg_duration: string;
  growth: string;
  top_countries: { country: string; plays: number; percentage: number }[];
  top_platforms: { platform: string; plays: number; percentage: number }[];
  demographics: {
    age_groups: { group: string; percentage: number }[];
    gender: { male: number; female: number; other: number };
  };
}
```

---

## ✅ Валидация

### File Upload Validation:

```typescript
// Audio files
export const AUDIO_VALIDATION = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/flac'],
  allowedExtensions: ['.mp3', '.wav', '.flac']
};

// Video files
export const VIDEO_VALIDATION = {
  maxSize: 500 * 1024 * 1024, // 500MB
  allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedExtensions: ['.mp4', '.webm', '.mov']
};

// Images
export const IMAGE_VALIDATION = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
};

// Banners
export const BANNER_VALIDATION = {
  maxSize: 5 * 1024 * 1024,
  dimensions: { width: 800, height: 400 },
  allowedTypes: ['image/jpeg', 'image/png']
};

// Avatars
export const AVATAR_VALIDATION = {
  maxSize: 2 * 1024 * 1024,
  dimensions: { width: 400, height: 400 },
  allowedTypes: ['image/jpeg', 'image/png']
};
```

### Input Validation:

```typescript
// Username
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Email
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL
export const URL_REGEX = /^https?:\/\/.+/;

// Phone
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// YouTube URL
export const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

// Rutube URL
export const RUTUBE_REGEX = /^(https?:\/\/)?(www\.)?rutube\.ru\/.+/;
```

---

## 🔌 Backend Endpoints

### Authentication:

```typescript
POST /auth/signup
Body: { email, password, username }
Response: { user, session }

POST /auth/login
Body: { email, password }
Response: { user, session }

POST /auth/logout
Headers: { Authorization: Bearer token }
Response: { success: true }

GET /auth/user
Headers: { Authorization: Bearer token }
Response: { user }
```

### Profile:

```typescript
GET /users/:id
Response: { user }

PATCH /users/:id
Body: { name, bio, avatar_url, ... }
Response: { user }

GET /users/:id/stats
Response: { plays, followers, tracks_count, ... }
```

### Tracks:

```typescript
GET /tracks
Query: { user_id?, status?, is_promoted?, limit, offset }
Response: { tracks[], count }

POST /tracks
Body: { title, artist, audio_url, cover_url, ... }
Response: { track }

PATCH /tracks/:id
Body: { title, ... }
Response: { track }

DELETE /tracks/:id
Response: { success: true }

POST /tracks/:id/promote
Body: { duration, coins }
Response: { campaign }
```

### Messages:

```typescript
GET /messages
Query: { conversation_with }
Response: { messages[] }

POST /messages
Body: { receiver_id, text, image_url, ... }
Response: { message }

PATCH /messages/:id
Body: { text }
Response: { message }

DELETE /messages/:id
Response: { success: true }

PATCH /messages/:id/read
Response: { message }
```

### Campaigns:

```typescript
GET /campaigns
Query: { user_id, status }
Response: { campaigns[] }

POST /campaigns
Body: { content_type, content_id, duration, coins }
Response: { campaign }

PATCH /campaigns/:id
Body: { status }
Response: { campaign }

GET /campaigns/:id/stats
Response: { views, clicks, conversions, roi }
```

### Analytics:

```typescript
GET /analytics
Query: { user_id, track_id, start_date, end_date }
Response: { analytics[] }

GET /analytics/summary
Query: { user_id, period }
Response: { summary }

GET /analytics/geo
Query: { user_id, period }
Response: { countries[] }
```

---

## 🚀 Интеграция Supabase

### Установка:

```bash
npm install @supabase/supabase-js
```

### Конфигурация:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Использование:

```typescript
// Auth
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Select
const { data: tracks } = await supabase
  .from('tracks')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Insert
const { data: track } = await supabase
  .from('tracks')
  .insert({
    user_id: userId,
    title: 'New Track',
    audio_url: 'https://...'
  })
  .select()
  .single()

// Update
const { data } = await supabase
  .from('tracks')
  .update({ title: 'Updated Title' })
  .eq('id', trackId)

// Delete
const { error } = await supabase
  .from('tracks')
  .delete()
  .eq('id', trackId)

// Upload file
const { data, error } = await supabase.storage
  .from('tracks')
  .upload(`${userId}/${fileName}`, file)

// Realtime
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    console.log('New message:', payload.new)
  })
  .subscribe()
```

---

## 🔐 Row Level Security (RLS) Examples:

```sql
-- Users can only view their own profile
CREATE POLICY "Users view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own tracks
CREATE POLICY "Users update own tracks"
  ON tracks FOR UPDATE
  USING (auth.uid() = user_id);

-- Everyone can view approved tracks
CREATE POLICY "View approved tracks"
  ON tracks FOR SELECT
  USING (status = 'approved');

-- Users can only send messages as themselves
CREATE POLICY "Users send own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

---

## 📊 Storage Buckets Configuration:

```typescript
// Create buckets
const buckets = [
  { name: 'avatars', public: true },
  { name: 'covers', public: true },
  { name: 'tracks', public: false },
  { name: 'track-covers', public: true },
  { name: 'videos', public: false },
  { name: 'thumbnails', public: true },
  { name: 'banners', public: true },
  { name: 'news-images', public: true },
  { name: 'voice-messages', public: false }
];

// Upload helper
async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
```

---

**Техническая спецификация v1.0.0**  
*Обновлено: 24 января 2026*
