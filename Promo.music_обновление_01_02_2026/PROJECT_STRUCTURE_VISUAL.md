# 🗺️ ВИЗУАЛЬНАЯ СТРУКТУРА ПРОЕКТА PROMO.MUSIC

**Дата:** 28 января 2026

---

## 📂 ПОЛНАЯ СТРУКТУРА ФАЙЛОВ

```
promo-music/
│
├── 📁 src/                           # Исходный код
│   ├── 📁 app/                       # Приложение
│   │   ├── 📄 App.tsx               # ⭐ Главный компонент
│   │   ├── 📄 AppWrapper.tsx        # Провайдеры (Auth, Subscription)
│   │   │
│   │   ├── 📁 components/           # Компоненты (60+)
│   │   │   ├── 📁 ui/              # UI Kit (Radix UI)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── ... (47 компонентов)
│   │   │   │
│   │   │   ├── 📁 track-test/      # 🆕 Тест трека
│   │   │   │   ├── NewTrackTestModal.tsx
│   │   │   │   └── TrackTestDetailsModal.tsx
│   │   │   │
│   │   │   ├── 📁 figma/
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   │
│   │   │   ├── analytics-page.tsx
│   │   │   ├── home-page.tsx
│   │   │   ├── tracks-page.tsx
│   │   │   ├── video-page.tsx
│   │   │   ├── my-concerts-page.tsx
│   │   │   ├── settings-page.tsx
│   │   │   ├── payments-page.tsx
│   │   │   ├── notifications-page.tsx
│   │   │   ├── messages-page.tsx
│   │   │   ├── coins-modal.tsx
│   │   │   ├── notification-bell.tsx
│   │   │   └── ... (40+ компонентов)
│   │   │
│   │   ├── 📁 pages/               # Страницы
│   │   │   ├── TrackTestPage.tsx   # 🆕 Тест трека
│   │   │   ├── BannerHub.tsx
│   │   │   ├── PromotionHub.tsx
│   │   │   ├── PromotionPitching.tsx
│   │   │   ├── PromotionMarketing.tsx
│   │   │   ├── PromotionMedia.tsx
│   │   │   ├── PromotionEvent.tsx
│   │   │   ├── PromotionProduction360.tsx
│   │   │   ├── PromotionPromoLab.tsx
│   │   │   └── TestStorage.tsx
│   │   │
│   │   ├── 📁 data/
│   │   │   └── transactions-data.ts
│   │   │
│   │   └── 📁 utils/
│   │       └── settings-api.ts
│   │
│   ├── 📁 contexts/                 # React Context
│   │   ├── AuthContext.tsx
│   │   └── SubscriptionContext.tsx
│   │
│   ├── 📁 hooks/                    # Custom Hooks
│   │   └── useApi.ts
│   │
│   ├── 📁 lib/                      # Библиотеки
│   │   ├── supabase.ts
│   │   └── README.md
│   │
│   ├── 📁 services/                 # API адаптеры
│   │   ├── concerts-api.ts
│   │   ├── concerts-api-adapter.ts
│   │   ├── performance-history-adapter.ts
│   │   └── ...
│   │
│   ├── 📁 schemas/                  # Zod схемы
│   │   ├── concert-schema.ts
│   │   └── performance-history-schema.ts
│   │
│   ├── 📁 styles/                   # Стили
│   │   ├── index.css              # Main CSS
│   │   ├── theme.css              # Tailwind theme
│   │   ├── tailwind.css           # Tailwind base
│   │   └── fonts.css              # Шрифты
│   │
│   ├── 📁 types/                    # TypeScript типы
│   │   └── database.ts
│   │
│   ├── 📁 utils/                    # Утилиты
│   │   ├── api.ts
│   │   ├── banner-validation.ts
│   │   ├── news-image-validation.ts
│   │   ├── video-utils.ts
│   │   ├── initDemoData.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── info.tsx
│   │
│   ├── 📁 config/
│   │   └── environment.ts
│   │
│   └── 📄 main.tsx                  # Entry point
│
├── 📁 supabase/                      # Backend
│   └── 📁 functions/
│       └── 📁 server/               # Edge Functions
│           ├── 📄 index.tsx        # ⭐ Main server
│           │
│           ├── auth-routes.tsx
│           ├── banner-routes.tsx
│           ├── concerts-routes.tsx
│           ├── track-test-routes.tsx   # 🆕 Тест трека API
│           ├── payments-routes.tsx
│           ├── settings-routes.tsx
│           ├── notifications-routes.tsx
│           ├── notifications-messenger-routes.tsx
│           ├── storage-routes.tsx
│           ├── subscriptions-routes.tsx
│           ├── promotion-routes.tsx
│           ├── promotion-routes-sql.tsx
│           ├── marketing-campaigns-routes.tsx
│           ├── email-routes.tsx
│           ├── ticketing-routes.tsx
│           ├── tickets-system-routes.tsx
│           ├── migration-routes.tsx
│           │
│           ├── kv_store.tsx        # KV Store
│           ├── kv-utils.tsx
│           ├── db-adapter.tsx      # SQL адаптер
│           ├── db-init.tsx         # Инициализация БД
│           ├── storage-setup.tsx
│           ├── supabase-client.tsx
│           ├── migration-runner.tsx
│           │
│           └── ... (25+ файлов роутов)
│
├── 📁 supabase/migrations/          # SQL миграции
│   ├── 001_initial_schema.sql
│   ├── 001_promotion_tables.sql
│   ├── 002_row_level_security.sql
│   ├── 003_content_and_media.sql
│   ├── 004_social_and_engagement.sql
│   ├── 005_donations_and_coins.sql
│   ├── 20260126_create_concerts_tables.sql
│   ├── 20260127_create_banner_ads_tables.sql
│   ├── 20260127_payments_system.sql
│   └── 999_complete_schema_reference.sql
│
├── 📁 public/                        # Статика
│   ├── vite.svg
│   └── _redirects/
│
├── 📁 docker/                        # Docker конфиги
│   ├── nginx.conf
│   └── kong/
│       └── kong.yml
│
├── 📁 scripts/                       # Скрипты деплоя
│   ├── deploy-all.sh
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   ├── init-git.sh
│   └── setup-secrets.sh
│
├── 📁 workflows/                     # CI/CD
│   └── deploy.yml
│
├── 📁 cabinets/                      # Другие кабинеты
│   └── artist-promo-music/
│       ├── README.md
│       ├── TROUBLESHOOTING.md
│       ├── database/
│       └── docs/
│
├── 📄 package.json                   # Dependencies
├── 📄 tsconfig.json                  # TypeScript конфиг
├── 📄 vite.config.ts                 # Vite конфиг
├── 📄 vercel.json                    # Vercel конфиг
├── 📄 docker-compose.yml             # Docker compose
├── 📄 index.html                     # HTML entry
│
└── 📁 docs/                          # Документация (80+ файлов)
    ├── README.md
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    ├── FULL_AUDIT_2026_v2.md
    ├── AUDIT_SUMMARY_QUICK.md
    └── ... (75+ других MD файлов)
```

---

## 🎯 КЛЮЧЕВЫЕ КОМПОНЕНТЫ

### Frontend (React)

```
App.tsx
  ├── AuthProvider
  ├── SubscriptionProvider
  └── AppContent
       ├── Sidebar Menu (9 пунктов)
       │   ├── Главная
       │   ├── Аналитика
       │   ├── Мои треки
       │   ├── Тест трека 🆕
       │   ├── Мои видео
       │   ├── Концерты
       │   ├── Продвижение
       │   ├── Баннерная реклама
       │   └── Настройки
       │
       ├── Top Actions
       │   ├── Wallet Button
       │   └── Notification Bell
       │
       ├── CoinsModal
       └── Page Router
           ├── HomePage
           ├── AnalyticsPage
           ├── TracksPage
           ├── TrackTestPage 🆕
           ├── VideoPage
           ├── MyConcertsPage
           ├── PromotionHub
           ├── BannerHub
           ├── SettingsPage
           ├── PaymentsPage
           ├── NotificationsPage
           └── MessagesPage
```

### Backend (Supabase Edge Functions)

```
Hono Server
  ├── CORS Middleware
  ├── Logger Middleware
  ├── Database Init
  ├── Storage Init
  │
  └── Routes
       ├── /health                    GET
       ├── /auth                      
       │   ├── /signup               POST
       │   ├── /signin               POST
       │   └── /signout              POST
       │
       ├── /api/concerts             
       │   ├── /list                 GET
       │   ├── /create               POST
       │   ├── /update/:id           PUT
       │   └── /delete/:id           DELETE
       │
       ├── /api/track-test 🆕        
       │   ├── /submit               POST
       │   ├── /list                 GET
       │   ├── /details/:id          GET
       │   ├── /update-status/:id    PUT
       │   ├── /add-review/:id       POST
       │   ├── /experts              GET
       │   ├── /payment              POST
       │   └── ... (10 endpoints)
       │
       ├── /api/banners              
       ├── /payments                 
       ├── /notifications            
       ├── /settings                 
       ├── /storage                  
       ├── /subscriptions            
       └── /promotion                
```

---

## 📦 ЗАВИСИМОСТИ

### Production Dependencies (50):

```typescript
// Core
react: 18.3.1
react-dom: 18.3.1
typescript

// Build Tool
vite: 6.3.5

// Styling
tailwindcss: 4.1.12
@tailwindcss/vite: 4.1.12

// UI Components
@radix-ui/* (30+ компонентов)
lucide-react: 0.487.0

// Animation
framer-motion: 11.15.0

// Backend
@supabase/supabase-js: 2.93.1

// Charts
recharts: 2.15.2

// Forms
react-hook-form: 7.55.0
zod: 4.3.6

// Utilities
date-fns: 3.6.0
clsx: 2.1.1
class-variance-authority: 0.7.1

// Notifications
sonner: 2.0.3

// Material UI (опционально)
@mui/material: 7.3.5
@emotion/react: 11.14.0
@emotion/styled: 11.14.1

// Drag & Drop
react-dnd: 16.0.1

// Carousel
react-slick: 0.31.0

// Masonry
react-responsive-masonry: 2.7.1
```

---

## 🗄️ БАЗА ДАННЫХ

### Таблицы (SQL):

```sql
📊 Основные таблицы:
├── users                    -- Пользователи
├── profiles                 -- Профили артистов
├── subscriptions            -- Подписки
├── tracks                   -- Треки
├── videos                   -- Видео
├── concerts                 -- Концерты
├── banner_ads               -- Баннерная реклама
├── track_tests 🆕           -- Тесты треков
├── track_test_reviews 🆕    -- Отзывы экспертов
├── notifications            -- Уведомления
├── messages                 -- Сообщения
├── payments                 -- Платежи
├── transactions             -- Транзакции
└── kv_store_84730125       -- Key-Value хранилище
```

### Storage Buckets:

```
📦 Supabase Storage:
├── make-84730125-avatars      -- Аватары
├── make-84730125-tracks       -- Аудио треки
├── make-84730125-videos       -- Видео
├── make-84730125-covers       -- Обложки
├── make-84730125-banners      -- Баннеры
└── make-84730125-documents    -- Документы
```

---

## 🎨 СТИЛИ И ТЕМЫ

### Tailwind CSS v4 Theme:

```css
/* theme.css */

Colors:
├── Primary: cyan-400, cyan-500
├── Secondary: purple-500, pink-500
├── Background: slate-900, purple-900
├── Text: white, gray-400, gray-300
└── Borders: white/10, white/20

Effects:
├── Glassmorphism: backdrop-blur-xl, bg-white/5
├── Gradients: from-cyan-500/20 to-purple-500/20
├── Shadows: shadow-lg, shadow-cyan-500/10
└── Animations: animate-pulse, motion prefers-reduced

Typography:
├── Font Family: system-ui
├── Headings: h1 (2.5rem), h2 (2rem), h3 (1.5rem)
├── Body: 1rem
└── Small: 0.875rem
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Supabase Auth:

```
┌─────────────────────────────────────┐
│  Row Level Security (RLS)          │
│  ├── users: own data only          │
│  ├── tracks: own tracks only       │
│  ├── concerts: own concerts only   │
│  └── payments: own payments only   │
│                                     │
│  JWT Tokens                         │
│  ├── Access Token (frontend)       │
│  └── Service Role Key (backend)    │
│                                     │
│  Session Management                 │
│  └── Auto refresh tokens           │
└─────────────────────────────────────┘
```

---

## 📊 МЕТРИКИ ПРОЕКТА

```
┌─────────────────────────────────────────┐
│  📂 Файлы                              │
│  ├── TypeScript/TSX: 120+             │
│  ├── SQL: 9 миграций                  │
│  ├── Markdown: 80+                    │
│  └── Config: 10+                      │
│                                         │
│  💻 Код                                │
│  ├── Frontend: ~15,000 LOC            │
│  ├── Backend: ~5,000 LOC              │
│  ├── Styles: ~2,000 LOC               │
│  └── ИТОГО: ~22,000 LOC               │
│                                         │
│  📦 Размеры                            │
│  ├── Repo: ~50MB                      │
│  ├── node_modules: ~400MB             │
│  ├── Build: ~2.5MB (uncomp)           │
│  └── Gzipped: ~650KB                  │
│                                         │
│  🧩 Компоненты                         │
│  ├── React компоненты: 60+            │
│  ├── UI компоненты: 47                │
│  ├── Страницы: 15+                    │
│  └── Backend routes: 25+              │
└─────────────────────────────────────────┘
```

---

## 🚀 ДЕПЛОЙ

### Платформы:

```
✅ Vercel (Frontend)
├── Auto deploy from git
├── Environment variables
└── Custom domain ready

✅ Supabase (Backend)
├── Edge Functions
├── Database
├── Storage
└── Auth
```

---

## 📈 ROADMAP

```
Phase 1: Beta Launch (Текущая) ✅
├── Основной функционал
├── UI/UX полировка
├── Backend API
└── Тест трека 🆕

Phase 2: Optimization (1-2 месяца)
├── Performance optimization
├── Testing coverage
├── Documentation
└── Accessibility

Phase 3: Production Launch (2-3 месяца)
├── SEO optimization
├── Advanced analytics
├── Security audit
└── Full compliance

Phase 4: Scale (3+ месяца)
├── Mobile apps (iOS/Android)
├── Advanced features
├── International expansion
└── API для партнеров
```

---

**Создано:** 28 января 2026  
**Версия:** v2.0
