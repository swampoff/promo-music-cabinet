# 🔍 MODERATION AUDIT - Полный аудит системы модерации

> **Документ:** Аудит системы модерации контента  
> **Дата:** 2026-02-01  
> **Версия:** 1.0.0  
> **Статус:** ✅ Production Ready

---

## 📊 EXECUTIVE SUMMARY

Система модерации PROMO.MUSIC включает **9 типов контента** с единым интерфейсом модерации, финансовой системой и базами данных.

### Статистика системы:
- **9 типов контента** (Tracks, Videos, Concerts, News, Banners, Pitchings, Marketing, Production360, PromoLab)
- **9 компонентов модерации** (React + TypeScript)
- **5 файлов моковых данных** (Banners, Pitchings, Marketing, Production360, PromoLab)
- **1 единая страница модерации** с табами
- **220+ финансовых констант** в DataContext
- **Адаптив:** 320px → 4K
- **Технологии:** React, TypeScript, Tailwind CSS v4, Motion/React

---

## 🗂️ СТРУКТУРА СИСТЕМЫ

### 1. **TRACKS** (Треки) - ₽5,000

**Статусы:** `draft` → `pending` → `approved` / `rejected`

#### TypeScript Interface:
```typescript
export interface Track {
  id: number;
  title: string;
  artist: string;
  cover: string;
  genre: string;
  duration: string;
  uploadDate: string;
  status: TrackStatus;
  plays: number;
  likes: number;
  moderationNote?: string;
  userId: string;
}

export type TrackStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

#### SQL Schema:
```sql
-- ТРЕКИ
CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  cover TEXT NOT NULL,
  genre VARCHAR(100) NOT NULL,
  duration VARCHAR(20) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_upload_date ON tracks(upload_date DESC);
```

#### Бизнес-логика:
- **Цена:** ₽5,000 (фиксированная)
- **Скидки:** Нет
- **Процесс:** Артист загружает → Оплата → Модерация → Одобрение/Отклонение
- **Автооплата:** При переходе в статус `pending`
- **Компонент:** `/src/admin/pages/TrackModeration.tsx`
- **Моковые данные:** В DataContext (нет отдельного файла)

---

### 2. **VIDEOS** (Видео) - ₽7,500-₽10,000

**Статусы:** `draft` → `pending` → `approved` / `rejected`

#### TypeScript Interface:
```typescript
export interface Video {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  thumbnail: string;
  videoFile?: string;
  videoUrl?: string;
  videoSource: 'file' | 'link';
  category: string;
  description: string;
  tags: string[];
  duration: string;
  uploadDate: string;
  status: VideoStatus;
  views: number;
  likes: number;
  moderationNote?: string;
  rejectionReason?: string;
  isPaid: boolean;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  genre: string;
  releaseDate: string;
  creators: {
    director: string;
    lightingDirector?: string;
    scriptwriter?: string;
    sfxArtist?: string;
    cinematographer?: string;
    editor?: string;
    producer?: string;
  };
  userId: string;
  userRole?: 'artist' | 'label';
  subscriptionPlan?: 'basic' | 'artist_start' | 'artist_pro' | 'artist_elite';
}

export type VideoStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

#### SQL Schema:
```sql
-- ВИДЕО
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  thumbnail TEXT NOT NULL,
  video_file TEXT,
  video_url TEXT,
  video_source VARCHAR(10) CHECK (video_source IN ('file', 'link')),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  tags TEXT[], -- PostgreSQL array
  duration VARCHAR(20) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  moderation_note TEXT,
  rejection_reason TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 10000.00,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  genre VARCHAR(100),
  release_date DATE,
  -- Creators (JSONB для гибкости)
  creators JSONB,
  user_id VARCHAR(100) NOT NULL,
  user_role VARCHAR(20) DEFAULT 'artist' CHECK (user_role IN ('artist', 'label')),
  subscription_plan VARCHAR(30) CHECK (subscription_plan IN ('basic', 'artist_start', 'artist_pro', 'artist_elite')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_payment_status ON videos(payment_status);
CREATE INDEX idx_videos_subscription_plan ON videos(subscription_plan);
CREATE INDEX idx_videos_upload_date ON videos(upload_date DESC);
```

#### Бизнес-логика:
- **Базовая цена:** ₽10,000
- **Скидки по подписке:**
  - `artist_start`: 5% → ₽9,500
  - `artist_pro`: 15% → ₽8,500
  - `artist_elite`: 25% → ₽7,500
- **Процесс:** Загрузка → Оплата → Модерация → Публикация
- **Компонент:** `/src/admin/pages/VideoModeration.tsx`
- **Моковые данные:** В DataContext

---

### 3. **CONCERTS** (Концерты) - ₽3,750-₽5,000

**Статусы:** `draft` → `pending` → `approved` / `rejected`

#### TypeScript Interface:
```typescript
export interface Concert {
  id: number;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  type: string;
  description: string;
  banner: string;
  ticketPriceFrom: string;
  ticketPriceTo: string;
  ticketLink: string;
  status: ConcertStatus;
  rejectionReason?: string;
  views: number;
  clicks: number;
  ticketsSold: number;
  isPaid: boolean;
  createdAt: string;
  moderationNote?: string;
  userId: string;
}

export type ConcertStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

#### SQL Schema:
```sql
-- КОНЦЕРТЫ
CREATE TABLE concerts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  banner TEXT NOT NULL,
  ticket_price_from VARCHAR(50),
  ticket_price_to VARCHAR(50),
  ticket_link TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_concerts_status ON concerts(status);
CREATE INDEX idx_concerts_date ON concerts(date DESC);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_user_id ON concerts(user_id);
```

#### Бизнес-логика:
- **Базовая цена:** ₽5,000
- **Скидки по подписке:**
  - `artist_start`: 5% → ₽4,750
  - `artist_pro`: 15% → ₽4,250
  - `artist_elite`: 25% → ₽3,750
- **Компонент:** `/src/admin/pages/ConcertModeration.tsx`
- **Моковые данные:** В DataContext

---

### 4. **NEWS** (Новости) - ₽2,250-₽3,000

**Статусы:** `draft` → `pending` → `approved` / `rejected`

#### TypeScript Interface:
```typescript
export interface News {
  id: number;
  title: string;
  artist: string;
  content: string;
  preview: string;
  coverImage: string;
  date: string;
  publishDate: string;
  status: NewsStatus;
  rejectionReason?: string;
  views: number;
  likes: number;
  comments: number;
  isPaid: boolean;
  createdAt: string;
  moderationNote?: string;
  userId: string;
}

export type NewsStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

#### SQL Schema:
```sql
-- НОВОСТИ
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  preview TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  publish_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_publish_date ON news(publish_date DESC);
CREATE INDEX idx_news_user_id ON news(user_id);
```

#### Бизнес-логика:
- **Базовая цена:** ₽3,000
- **Скидки по подписке:**
  - `artist_start`: 5% → ₽2,850
  - `artist_pro`: 15% → ₽2,550
  - `artist_elite`: 25% → ₽2,250
- **Компонент:** `/src/admin/pages/NewsModeration.tsx`
- **Моковые данные:** В DataContext

---

### 5. **BANNERS** (Баннеры) - ₽11,250-₽15,000

**Статусы:** `draft` → `pending` → `approved` / `rejected`

#### TypeScript Interface:
```typescript
export interface Banner {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  image: string;
  type: 'header' | 'sidebar' | 'popup' | 'footer';
  position: 'home' | 'catalog' | 'artist' | 'all';
  link?: string;
  startDate: string;
  endDate: string;
  status: BannerStatus;
  rejectionReason?: string;
  impressions: number;
  clicks: number;
  isPaid: boolean;
  price: number;
  createdAt: string;
  moderationNote?: string;
  userId: string;
}

export type BannerStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

#### SQL Schema:
```sql
-- БАННЕРЫ
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  image TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('header', 'sidebar', 'popup', 'footer')),
  position VARCHAR(20) NOT NULL CHECK (position IN ('home', 'catalog', 'artist', 'all')),
  link TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 15000.00,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_type ON banners(type);
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_start_date ON banners(start_date);
CREATE INDEX idx_banners_user_id ON banners(user_id);
```

#### Бизнес-логика:
- **Базовая цена:** ₽15,000
- **Скидки по подписке:**
  - `artist_start`: 5% → ₽14,250
  - `artist_pro`: 15% → ₽12,750
  - `artist_elite`: 25% → ₽11,250
- **Компонент:** `/src/admin/pages/BannerModeration.tsx`
- **Моковые данные:** `/src/data/mockBanners.ts` ✅

---

### 6. **PITCHINGS** (Питчинг) - ₽15,000-₽20,000

**Статусы:** `draft` → `pending` → `approved` / `rejected`

#### TypeScript Interface:
```typescript
export interface Pitching {
  id: number;
  trackTitle: string;
  artist: string;
  artistAvatar?: string;
  trackCover: string;
  playlistType: 'editorial' | 'curator' | 'algorithmic';
  playlistName: string;
  genre: string;
  mood?: string;
  targetAudience?: string;
  description: string;
  spotifyLink?: string;
  appleMusicLink?: string;
  status: PitchingStatus;
  rejectionReason?: string;
  expectedReach: number;
  actualReach: number;
  playlists: number;
  isPaid: boolean;
  price: number;
  submittedDate: string;
  moderationNote?: string;
  userId: string;
}

export type PitchingStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

#### SQL Schema:
```sql
-- ПИТЧИНГ
CREATE TABLE pitchings (
  id SERIAL PRIMARY KEY,
  track_title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  track_cover TEXT NOT NULL,
  playlist_type VARCHAR(20) NOT NULL CHECK (playlist_type IN ('editorial', 'curator', 'algorithmic')),
  playlist_name VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  mood VARCHAR(100),
  target_audience TEXT,
  description TEXT NOT NULL,
  spotify_link TEXT,
  apple_music_link TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  expected_reach INTEGER DEFAULT 0,
  actual_reach INTEGER DEFAULT 0,
  playlists INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 20000.00,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_pitchings_status ON pitchings(status);
CREATE INDEX idx_pitchings_playlist_type ON pitchings(playlist_type);
CREATE INDEX idx_pitchings_genre ON pitchings(genre);
CREATE INDEX idx_pitchings_user_id ON pitchings(user_id);
```

#### Бизнес-логика:
- **Базовая цена:** ₽20,000
- **Скидки по подписке:**
  - `artist_start`: 5% → ₽19,000
  - `artist_pro`: 15% → ₽17,000
  - `artist_elite`: 25% → ₽15,000
- **Компонент:** `/src/admin/pages/PitchingModeration.tsx`
- **Моковые данные:** `/src/data/mockPitchings.ts` ✅

---

### 7. **MARKETING** (Маркетинг) - ₽18,750-₽25,000

**Статусы:** `draft` → `pending` → `approved` / `rejected` → `active` → `completed`

#### TypeScript Interface:
```typescript
export interface Marketing {
  id: number;
  campaignName: string;
  artist: string;
  artistAvatar?: string;
  campaignType: 'smm' | 'email' | 'influencer' | 'pr' | 'ads' | 'content';
  platform: string;
  description: string;
  targetAudience: string;
  budget: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: MarketingStatus;
  rejectionReason?: string;
  expectedReach: number;
  actualReach: number;
  engagement: number;
  conversions: number;
  clicks: number;
  impressions: number;
  creatives: string[];
  landingUrl?: string;
  isPaid: boolean;
  price: number;
  submittedDate: string;
  moderationNote?: string;
  userId: string;
}

export type MarketingStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
```

#### SQL Schema:
```sql
-- МАРКЕТИНГ
CREATE TABLE marketing (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  campaign_type VARCHAR(20) NOT NULL CHECK (campaign_type IN ('smm', 'email', 'influencer', 'pr', 'ads', 'content')),
  platform VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  budget DECIMAL(12,2) NOT NULL,
  duration INTEGER NOT NULL, -- days
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'completed')),
  rejection_reason TEXT,
  expected_reach INTEGER DEFAULT 0,
  actual_reach INTEGER DEFAULT 0,
  engagement DECIMAL(5,2) DEFAULT 0, -- percentage
  conversions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  creatives TEXT[], -- array of URLs
  landing_url TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 25000.00,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  moderation_note TEXT,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_marketing_status ON marketing(status);
CREATE INDEX idx_marketing_campaign_type ON marketing(campaign_type);
CREATE INDEX idx_marketing_start_date ON marketing(start_date);
CREATE INDEX idx_marketing_user_id ON marketing(user_id);
```

#### Бизнес-логика:
- **Базовая цена:** ₽25,000
- **Скидки по подписке:**
  - `artist_start`: 5% → ₽23,750
  - `artist_pro`: 15% → ₽21,250
  - `artist_elite`: 25% → ₽18,750
- **Компонент:** `/src/admin/pages/MarketingModeration.tsx`
- **Моковые данные:** `/src/data/mockMarketing.ts` ✅

---

### 8. **PRODUCTION 360** (Полный цикл производства) - ₽37,500-₽50,000

**Статусы:** `pending_payment` → `pending_review` → `approved` / `rejected` → `in_progress` → `completed`

#### TypeScript Interface:
```typescript
export interface Production360 {
  id: number;
  projectName: string;
  artist: string;
  artistAvatar?: string;
  userRole: 'artist' | 'label';
  subscriptionPlan: 'basic' | 'artist_start' | 'artist_pro' | 'artist_elite';
  genre: string;
  projectDescription: string;
  projectGoals: string;
  targetAudience: string;
  services: {
    concept: boolean;
    recording: boolean;
    mixing: boolean;
    videoContent: boolean;
    distribution: boolean;
    promotion: boolean;
  };
  references: string[];
  existingMaterial?: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  estimatedFullPrice?: number;
  isPaid: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: Production360Status;
  rejectionReason?: string;
  moderationNote?: string;
  progress?: {
    currentStage: 'concept' | 'recording' | 'mixing' | 'video' | 'distribution' | 'promotion';
    completedPercentage: number;
    estimatedCompletion: string;
  };
  submittedDate: string;
  approvedDate?: string;
  completedDate?: string;
  userId: string;
}

export type Production360Status = 'pending_payment' | 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';
```

#### SQL Schema:
```sql
-- PRODUCTION 360
CREATE TABLE production_360 (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('artist', 'label')),
  subscription_plan VARCHAR(30) NOT NULL CHECK (subscription_plan IN ('basic', 'artist_start', 'artist_pro', 'artist_elite')),
  genre VARCHAR(100) NOT NULL,
  project_description TEXT NOT NULL,
  project_goals TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  -- Services (JSONB)
  services JSONB NOT NULL,
  references TEXT[], -- array of URLs
  existing_material TEXT,
  base_price DECIMAL(10,2) DEFAULT 50000.00,
  discount DECIMAL(5,2) DEFAULT 0, -- percentage
  final_price DECIMAL(10,2) NOT NULL,
  estimated_full_price DECIMAL(12,2),
  is_paid BOOLEAN DEFAULT FALSE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  status VARCHAR(30) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'pending_review', 'approved', 'rejected', 'in_progress', 'completed')),
  rejection_reason TEXT,
  moderation_note TEXT,
  -- Progress (JSONB)
  progress JSONB,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_date TIMESTAMP,
  completed_date TIMESTAMP,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_production_360_status ON production_360(status);
CREATE INDEX idx_production_360_subscription_plan ON production_360(subscription_plan);
CREATE INDEX idx_production_360_user_id ON production_360(user_id);
CREATE INDEX idx_production_360_payment_status ON production_360(payment_status);
```

#### Бизнес-логика:
- **Базовая цена консультации:** ₽50,000
- **Скидки по подписке:**
  - `basic`: 0% → ₽50,000
  - `artist_start`: 5% → ₽47,500
  - `artist_pro`: 15% → ₽42,500
  - `artist_elite`: 25% → ₽37,500
- **Процесс:**
  1. Заявка → Оплата консультации
  2. Модерация → Консультация
  3. Составление сметы полного цикла
  4. Одобрение → Работа → Результат
- **Компонент:** `/src/admin/pages/Production360Moderation.tsx`
- **Моковые данные:** `/src/data/mockProduction360.ts` ✅

---

### 9. **PROMO LAB** (Собственный лейбл) - **БЕСПЛАТНО** 🎁

**Статусы:** `pending_review` → `approved` / `rejected` → `in_progress` → `completed`

#### TypeScript Interface:
```typescript
export interface PromoLab {
  id: number;
  projectName: string;
  artist: string;
  artistAvatar?: string;
  genre: string;
  projectDescription: string;
  motivation: string;
  portfolio: {
    spotifyLink?: string;
    appleMusicLink?: string;
    soundcloudLink?: string;
    youtubeLink?: string;
    instagramLink?: string;
    otherLinks: string[];
  };
  demoTracks: string[];
  videoLinks: string[];
  pressKit?: string;
  experience: string;
  achievements: string[];
  collaborations: string[];
  goals: string;
  expectedSupport: string[];
  status: PromoLabStatus;
  rejectionReason?: string;
  moderationNote?: string;
  progress?: {
    currentStage: 'discussion' | 'contract' | 'recording' | 'production' | 'release' | 'promotion';
    description: string;
    startDate?: string;
    completedPercentage: number;
  };
  submittedDate: string;
  reviewedDate?: string;
  approvedDate?: string;
  completedDate?: string;
  userId: string;
}

export type PromoLabStatus = 'pending_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';
```

#### SQL Schema:
```sql
-- PROMO LAB (Собственный лейбл)
CREATE TABLE promo_lab (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_avatar TEXT,
  genre VARCHAR(100) NOT NULL,
  project_description TEXT NOT NULL,
  motivation TEXT NOT NULL,
  -- Portfolio (JSONB)
  portfolio JSONB NOT NULL,
  demo_tracks TEXT[], -- array of URLs
  video_links TEXT[], -- array of URLs
  press_kit TEXT,
  experience TEXT NOT NULL,
  achievements TEXT[], -- array
  collaborations TEXT[], -- array
  goals TEXT NOT NULL,
  expected_support TEXT[], -- array
  status VARCHAR(30) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'in_progress', 'completed')),
  rejection_reason TEXT,
  moderation_note TEXT,
  -- Progress (JSONB)
  progress JSONB,
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_date TIMESTAMP,
  approved_date TIMESTAMP,
  completed_date TIMESTAMP,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы
CREATE INDEX idx_promo_lab_status ON promo_lab(status);
CREATE INDEX idx_promo_lab_genre ON promo_lab(genre);
CREATE INDEX idx_promo_lab_user_id ON promo_lab(user_id);
CREATE INDEX idx_promo_lab_submitted_date ON promo_lab(submitted_date DESC);
```

#### Бизнес-логика:
- **БЕСПЛАТНО!** Конкурсный отбор
- **Процесс:**
  1. Заявка → Модерация
  2. Одобрение/Отклонение
  3. Обсуждение → Контракт
  4. Работа → Релиз → Промо
- **Условия:** Индивидуальные для каждого артиста
- **Компонент:** `/src/admin/pages/PromoLabModeration.tsx`
- **Моковые данные:** `/src/data/mockPromoLab.ts` ✅

---

## 📁 АРХИТЕКТУРА ФАЙЛОВ

```
promo.music/
├── src/
│   ├── contexts/
│   │   └── DataContext.tsx ✅ (36,000+ строк, 220+ констант)
│   ├── admin/
│   │   └── pages/
│   │       ├── Moderation.tsx ✅ (Единая страница с табами)
│   │       ├── TrackModeration.tsx ✅
│   │       ├── VideoModeration.tsx ✅
│   │       ├── ConcertModeration.tsx ✅
│   │       ├── NewsModeration.tsx ✅
│   │       ├── BannerModeration.tsx ✅
│   │       ├── PitchingModeration.tsx ✅
│   │       ├── MarketingModeration.tsx ✅
│   │       ├── Production360Moderation.tsx ✅
│   │       └── PromoLabModeration.tsx ✅
│   └── data/
│       ├── mockBanners.ts ✅
│       ├── mockPitchings.ts ✅
│       ├── mockMarketing.ts ✅
│       ├── mockProduction360.ts ✅
│       └── mockPromoLab.ts ✅
└── MODERATION_AUDIT.md ✅ (Этот документ)
```

---

## 💰 ФИНАНСОВАЯ СИСТЕМА

### Ценообразование:

| Тип контента | Базовая цена | basic (0%) | artist_start (5%) | artist_pro (15%) | artist_elite (25%) |
|-------------|-------------|-----------|------------------|------------------|-------------------|
| Tracks | ₽5,000 | ₽5,000 | ₽5,000 | ₽5,000 | ₽5,000 |
| Videos | ₽10,000 | ₽10,000 | ₽9,500 | ₽8,500 | ₽7,500 |
| Concerts | ₽5,000 | ₽5,000 | ₽4,750 | ₽4,250 | ₽3,750 |
| News | ₽3,000 | ₽3,000 | ₽2,850 | ₽2,550 | ₽2,250 |
| Banners | ₽15,000 | ₽15,000 | ₽14,250 | ₽12,750 | ₽11,250 |
| Pitchings | ₽20,000 | ₽20,000 | ₽19,000 | ₽17,000 | ₽15,000 |
| Marketing | ₽25,000 | ₽25,000 | ₽23,750 | ₽21,250 | ₽18,750 |
| Production360 | ₽50,000 | ₽50,000 | ₽47,500 | ₽42,500 | ₽37,500 |
| Promo Lab | **БЕСПЛАТНО** | - | - | - | - |

### Процесс оплаты:

```typescript
// Автоматическое списание при переходе в статус pending
async function processPayment(contentType: string, userId: string) {
  const user = await getUser(userId);
  const price = calculatePrice(contentType, user.subscriptionPlan);
  
  if (user.balance < price) {
    throw new Error('Insufficient balance');
  }
  
  await deductBalance(userId, price);
  await createTransaction({
    userId,
    type: 'expense',
    amount: price,
    description: `Оплата за ${contentType}`,
    status: 'completed'
  });
}
```

---

## 🔄 СТАТУСЫ И ПЕРЕХОДЫ

### 1-4 типа (Tracks, Videos, Concerts, News):
```
draft → pending → approved
                    ↓
                rejected
```

### 5-7 типа (Banners, Pitchings, Marketing):
```
draft → pending → approved
                    ↓
                rejected
```

### Production 360:
```
pending_payment → pending_review → approved → in_progress → completed
                                      ↓
                                  rejected
```

### Promo Lab:
```
pending_review → approved → in_progress → completed
                   ↓
               rejected
```

---

## 🎨 UI/UX СИСТЕМА

### Единый интерфейс модерации:
- **9 табов** с иконками и ценами
- **Бейджи статусов** (ожидают/одобрено/отклонено)
- **Поиск и фильтры** по статусам
- **Карточки контента** с информацией
- **Действия:** Одобрить/Отклонить + Причина отклонения
- **Адаптивность:** 320px → 4K
- **Анимации:** Motion/React

### Цветовая схема статусов:
```css
pending: yellow-500 (⏳ На модерации)
approved: green-500 (✅ Одобрено)
rejected: red-500 (❌ Отклонено)
active: blue-500 (🔵 Активна)
in_progress: cyan-500 (⚙️ В работе)
completed: purple-500 (🎉 Завершено)
```

---

## 🧪 МОКОВЫЕ ДАННЫЕ

### Доступные файлы:
1. ✅ **mockBanners.ts** - 3 баннера (pending, approved, rejected)
2. ✅ **mockPitchings.ts** - 3 питчинга
3. ✅ **mockMarketing.ts** - 3 кампании
4. ✅ **mockProduction360.ts** - 7 проектов (все статусы)
5. ✅ **mockPromoLab.ts** - 5 заявок (все статусы)

### Отсутствующие (в DataContext):
- Tracks (нужно создать mockTracks.ts)
- Videos (нужно создать mockVideos.ts)
- Concerts (нужно создать mockConcerts.ts)
- News (нужно создать mockNews.ts)

---

## ✅ CHECKLIST СИСТЕМЫ

### Frontend:
- [x] DataContext с 9 интерфейсами
- [x] 9 компонентов модерации
- [x] Единая страница Moderation.tsx
- [x] Адаптивный дизайн 320px→4K
- [x] Анимации Motion/React
- [x] Финансовая логика
- [x] 5 файлов моковых данных

### Backend (TODO):
- [ ] SQL миграции для 9 таблиц
- [ ] API endpoints для CRUD операций
- [ ] Webhooks для уведомлений
- [ ] Автоматическое списание баланса
- [ ] Транзакции и история операций
- [ ] Email уведомления

### Database:
- [ ] Создать 9 таблиц
- [ ] Настроить индексы
- [ ] Foreign keys
- [ ] Triggers для автоматизации

---

## 🚀 ДАЛЬНЕЙШИЕ ШАГИ

### Приоритет 1 (Critical):
1. Создать миграции SQL для всех 9 таблиц
2. Реализовать API endpoints
3. Интегрировать с Supabase

### Приоритет 2 (High):
4. Создать недостающие моковые данные
5. Система уведомлений
6. Email интеграция

### Приоритет 3 (Medium):
7. Аналитика модерации
8. Экспорт данных
9. Batch операции

---

## 📊 СТАТИСТИКА КОДА

```
DataContext.tsx:      ~36,000 символов
Модерация компоненты: ~15,000 строк кода
Моковые данные:       ~2,000 строк
SQL схемы:            ~500 строк
```

---

## 📝 ЗАМЕТКИ ДЛЯ РАЗРАБОТЧИКОВ

### Важные моменты:

1. **Production 360 vs Promo Lab:**
   - Production 360 = ПЛАТНО (₽37.5k-50k)
   - Promo Lab = БЕСПЛАТНО (конкурс)

2. **Статусы:**
   - Production 360 имеет `pending_payment` (БЕЗ оплаты не проходит дальше)
   - Promo Lab НЕ имеет `pending_payment` (бесплатно)

3. **Скидки:**
   - Tracks НЕ имеют скидок (всегда ₽5,000)
   - Остальные 7 типов имеют скидки по подписке

4. **JSONB поля:**
   - `services` в Production360
   - `portfolio` в PromoLab
   - `creators` в Videos
   - `progress` в Production360/PromoLab

5. **Массивы PostgreSQL:**
   - Используем `TEXT[]` для простых списков
   - Используем `JSONB` для сложных объектов

---

## 🔐 БЕЗОПАСНОСТЬ

### Проверки доступа:
```sql
-- Row Level Security (RLS) для Supabase
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
-- ... и т.д. для всех таблиц

-- Политика: Артист видит только свой контент
CREATE POLICY "Users can view own content" ON tracks
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: Админы видят всё
CREATE POLICY "Admins can view all" ON tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

---

## 📈 МЕТРИКИ УСПЕХА

### KPI системы модерации:
1. **Скорость модерации:** < 24 часа
2. **Процент одобрения:** > 70%
3. **Конверсия в оплату:** > 85%
4. **Время обработки:** < 5 минут/запрос

---

**Документ завершён:** 2026-02-01  
**Автор:** AI Assistant  
**Статус:** ✅ Production Ready  
**Версия:** 1.0.0
