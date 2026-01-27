# 🏗️ АРХИТЕКТУРА СИСТЕМЫ PROMO.MUSIC

## 📊 ОБЗОР

Полнофункциональная платформа управления музыкальной карьерой с glassmorphism дизайном, интеграцией Supabase и системой маркетинга.

---

## 🗄️ BACKEND АРХИТЕКТУРА (Supabase)

### **Storage Options**

Система поддерживает **два режима хранения данных**:

1. **KV Store Mode** (по умолчанию в Figma Make)
   - Единственная таблица `kv_store_84730125`
   - Key-value хранилище
   - Нет SQL запросов
   - Ограниченные возможности фильтрации

2. **PostgreSQL Mode** (для production)
   - Полноценная SQL схема (8 таблиц)
   - Row Level Security (RLS)
   - Индексы и оптимизация
   - Powerful queries с JOIN'ами

### **Database Adapter**

Универсальный адаптер (`db-adapter.tsx`) позволяет переключаться между режимами через environment variable:

```bash
STORAGE_MODE=kv   # KV Store (default)
STORAGE_MODE=sql  # PostgreSQL
```

### **Edge Functions**
Расположение: `/supabase/functions/server/`

```
├── index.tsx                    # Главный сервер (Hono)
├── kv_store.tsx                 # KV утилиты (ЗАЩИЩЁННЫЙ)
├── db-adapter.tsx               # 🆕 Database адаптер (KV/SQL)
├── routes.tsx                   # Базовые API роуты
├── concerts-routes.tsx          # API концертов
├── notifications-routes.tsx     # API уведомлений
├── ticketing-routes.tsx         # API билетных систем
├── storage-routes.tsx           # 🆕 API управления Storage
└── storage-setup.tsx            # 🆕 Инициализация Storage buckets
```

### **SQL Migrations** (опционально)

```
/supabase/migrations/
├── 001_initial_schema.sql       # 🆕 Основная схема БД
└── 002_row_level_security.sql   # 🆕 RLS политики
```

⚠️ **Важно**: SQL миграции НЕ работают в Figma Make, но готовы для production deployment.

### **API Endpoints**

#### **Concerts API** (`/make-server-84730125/concerts`)
- `GET /` - Получить все концерты
- `POST /` - Создать концерт
- `PUT /:id` - Обновить концерт
- `DELETE /:id` - Удалить концерт
- `POST /:id/promote` - Продвинуть концерт (за коины)
- `POST /:id/view` - Инкремент просмотров
- `POST /:id/click` - Инкремент кликов
- `POST /generate-demo` - Генерация демо-данных

#### **Notifications API** (`/make-server-84730125/notifications`)
- `GET /user/:userId` - Получить уведомления пользователя
- `GET /settings/:userId` - Получить настройки уведомлений
- `PUT /settings/:userId` - Обновить настройки
- `POST /reminder` - Создать напоминание
- `POST /auto-reminders/:concertId` - Создать авто-напоминания
- `GET /campaigns/:artistId` - Получить email-кампании
- `POST /campaigns` - Создать email-кампанию
- `POST /campaigns/:campaignId/send` - Отправить кампанию
- `DELETE /:userId/:notificationId` - Удалить уведомление
- `PUT /:userId/:notificationId/read` - Отметить прочитанным
- `GET /stats/:userId` - Статистика уведомлений

#### **Ticketing API** (`/make-server-84730125/ticketing`)
- `GET /providers` - Список билетных провайдеров
- `POST /providers/:providerId/connect` - Подключить провайдера
- `GET /providers/connected/:artistId` - Подключённые провайдеры
- `POST /sales` - Создать продажу
- `GET /sales/:concertId` - Получить продажи концерта
- `GET /sales/:concertId/stats` - Статистика продаж
- `GET /funnel/:concertId` - Воронка продаж
- `POST /generate-test-sales/:concertId` - Генерация тестовых продаж
- `PUT /sales/:saleId/cancel` - Отменить продажу

---

## 💾 DATA STORAGE (KV Store)

### **Ключевые схемы хранения**

#### **Концерты**
```typescript
Key: concert:{concertId}
Value: TourDate {
  id: string
  artist_id: string
  title: string
  city: string
  venue_name: string
  date: string
  time: string
  event_type: string
  description: string
  banner_image: string
  ticket_price_from: number
  ticket_price_to: number
  ticket_link: string
  moderation_status: 'draft' | 'pending' | 'approved' | 'rejected'
  is_promoted: boolean
  promotion_ends_at?: string
  views: number
  clicks: number
  created_at: string
  updated_at: string
}
```

#### **Уведомления**
```typescript
Key: notification:{userId}:{notificationId}
Value: Notification {
  id: string
  userId: string
  concertId: string
  type: 'reminder' | 'announcement' | 'ticket_update' | 'promotion'
  title: string
  message: string
  scheduledFor: string
  status: 'pending' | 'sent' | 'failed'
  channel: 'email' | 'push' | 'both'
  createdAt: string
  sentAt?: string
  metadata?: Record<string, any>
}
```

#### **Настройки уведомлений**
```typescript
Key: notification_settings:{userId}
Value: NotificationSettings {
  userId: string
  emailEnabled: boolean
  pushEnabled: boolean
  reminderDaysBefore: number[]  // [7, 3, 1]
  announcements: boolean
  promotions: boolean
  ticketUpdates: boolean
}
```

#### **Email-кампании**
```typescript
Key: campaign:{artistId}:{campaignId}
Value: EmailCampaign {
  id: string
  artistId: string
  concertId?: string
  subject: string
  content: string
  recipientCount: number
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduledFor?: string
  sentAt?: string
  openRate?: number
  clickRate?: number
  createdAt: string
}
```

#### **Билетные провайдеры (подключения)**
```typescript
Key: ticket_provider:{artistId}:{providerId}
Value: TicketProvider {
  id: string
  artistId: string
  name: string
  apiKey: string
  enabled: boolean
  commission: number
  connectedAt: string
}
```

#### **Продажи билетов**
```typescript
Key: ticket_sale:{concertId}:{saleId}
Value: TicketSale {
  id: string
  concertId: string
  artistId: string
  provider: string
  quantity: number
  price: number
  totalAmount: number
  commission: number
  netAmount: number
  buyerEmail?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  purchasedAt: string
  metadata?: Record<string, any>
}
```

---

## 🎨 FRONTEND АРХИТЕКТУРА

### **Структура компонентов**

```
/src/app/components/
├── App.tsx                          # Главный компонент
├── home-page.tsx                    # Главная страница
├── analytics-page.tsx               # Аналитика
├── profile-page.tsx                 # Публичный профиль
├── tracks-page.tsx                  # Управление треками
├── video-page.tsx                   # Управление видео
├── my-concerts-page.tsx             # Управление концертами
├── news-page.tsx                    # Управление новостями
├── donations-page.tsx               # Донаты
├── pitching-page.tsx                # Питчинг
├── messages-page.tsx                # Сообщения
├── settings-page.tsx                # Настройки
│
├── marketing-page.tsx               # 🆕 Маркетинг (3 вкладки)
├── notifications-manager.tsx        # 🆕 Управление уведомлениями
├── email-campaigns.tsx              # 🆕 Email-рассылки
├── ticketing-integration.tsx        # 🆕 Билетные системы
│
├── concerts-analytics.tsx           # 🆕 Аналитика концертов
├── concerts-filters.tsx             # 🆕 Фильтры концертов
├── public-concerts-widget.tsx       # 🆕 Виджет для профиля
├── concert-form-modal.tsx           # Модалка создания концерта
├── performance-history-tab.tsx      # История выступлений
│
└── ...другие компоненты
```

### **Главные страницы**

1. **Главная** - Dashboard с метриками
2. **Аналитика** - Графики прослушиваний, доходов
3. **Публичный профиль** - Редактор публичного профиля
4. **Мои треки** - Управление музыкой
5. **Мои видео** - Управление видеоконтентом
6. **Мои концерты** - Управление турами (3 вкладки)
7. **🆕 Маркетинг и продажи** - Уведомления, рассылки, билеты (3 вкладки)
8. **Питчинг** - Продвижение треков
9. **Мои новости** - Управление новостями
10. **Донаты** - Управление донатами
11. **Сообщения** - Чат с фанатами
12. **Настройки** - Настройки аккаунта

---

## 📱 АДАПТИВНОСТЬ

### **Breakpoints (Tailwind CSS)**
- `sm:` - 640px+ (мобильные горизонтально)
- `md:` - 768px+ (планшеты)
- `lg:` - 1024px+ (десктоп)
- `xl:` - 1280px+ (большие экраны)

### **Адаптивные компоненты**

✅ **App.tsx**
- Боковое меню: скрыто на мобильных, фиксировано на десктопе
- Burger menu на мобильных
- Overlay при открытом меню
- Адаптивные отступы (`p-4 sm:p-6 lg:p-8`)

✅ **MarketingPage**
- Адаптивный заголовок (`text-2xl sm:text-3xl lg:text-4xl`)
- Горизонтальный скролл табов на мобильных
- Сокращённые названия на малых экранах
- Адаптивные иконки (`w-4 h-4 sm:w-5 sm:h-5`)

✅ **NotificationsManager**
- Grid 1 колонка → 3 колонки (`grid-cols-1 md:grid-cols-3`)
- Стеки карточек на мобильных

✅ **EmailCampaigns**
- Stats grid: 1 → 4 колонки (`grid-cols-1 md:grid-cols-4`)
- Модалка на весь экран на мобильных

✅ **TicketingIntegration**
- Providers grid: 1 → 2 колонки (`grid-cols-1 md:grid-cols-2`)
- Funnel stats: 2 → 5 колонок (`grid-cols-2 md:grid-cols-5`)
- Key metrics: 1 → 3 колонки (`grid-cols-1 md:grid-cols-3`)

✅ **ConcertsAnalytics**
- Stats grid: 1 → 2 → 4 колонки (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- Charts grid: 1 → 2 колонки (`grid-cols-1 lg:grid-cols-2`)
- Responsive charts (Recharts ResponsiveContainer)

---

## 🎯 INTEGRATION POINTS

### **Supabase Integration**
```typescript
// Конфигурация
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Пример запроса
const response = await fetch(`${API_URL}/concerts`, {
  headers: { Authorization: `Bearer ${publicAnonKey}` },
});
```

### **CORS Settings**
```typescript
// В index.tsx
cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-User-Id"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
})
```

---

## 🔐 SECURITY

### **API Authorization**
- Все запросы используют `Authorization: Bearer ${publicAnonKey}`
- Service Role Key только на сервере (не течёт на фронтенд)

### **Protected Files**
```typescript
// НЕЛЬЗЯ редактировать:
- /supabase/functions/server/kv_store.tsx
- /src/app/components/figma/ImageWithFallback.tsx
- /pnpm-lock.yaml
- /utils/supabase/info.tsx
```

### **Environment Variables**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
```

---

## 📊 ANALYTICS & METRICS

### **Concert Metrics**
- **Views** - просмотры карточки концерта
- **Clicks** - клики по кнопке "Купить билет"
- **Conversion Rate** - клики / просмотры

### **Email Campaign Metrics**
- **Open Rate** - процент открытий
- **Click Rate** - процент кликов по ссылкам
- **Recipients** - количество получателей

### **Sales Funnel**
1. **Views** (просмотры)
2. **Clicks** (клики по билетам)
3. **Cart Adds** (добавление в корзину)
4. **Checkout Initiated** (начало оформления)
5. **Purchases** (покупки)

### **Ticket Sales**
- **Total Sales** - общее количество продаж
- **Total Revenue** - общая выручка
- **Commission** - комиссия платформ
- **Net Revenue** - чистая выручка
- **Average Ticket Price** - средний чек

---

## 🎨 UI/UX FEATURES

### **Design System**
- **Стиль**: Glassmorphism
- **Цветовая палитра**:
  - Cyan: `#06b6d4`
  - Purple: `#8b5cf6`
  - Pink: `#ec4899`
  - Green: `#10b981`
  - Yellow: `#f59e0b`
- **Шрифт**: Manrope (русский)
- **Анимации**: Framer Motion
- **Иконки**: Lucide React
- **Графики**: Recharts
- **Уведомления**: Sonner (toast)

### **Animation Patterns**
```typescript
// Fade in + slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 20 }}

// Stagger animations
transition={{ delay: index * 0.1 }}

// Hover effects
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### **Environment: Figma Make**
- ✅ Используется KV Store (единственная доступная таблица)
- ❌ Нельзя создавать SQL миграции
- ❌ Нельзя модифицировать схему БД
- ✅ Edge Functions работают
- ✅ Supabase Storage может использоваться (создаётся программно)

### **Performance**
- Lazy loading компонентов
- useMemo для тяжёлых вычислений
- ResponsiveContainer для графиков
- Debounce для поиска/фильтрации
- AnimatePresence для плавных переходов

---

## 📦 DEPENDENCIES

### **Core**
- React 18.3.1
- TypeScript
- Vite 6.3.5
- Tailwind CSS 4.1.12

### **UI Libraries**
- framer-motion 11.15.0
- lucide-react 0.487.0
- sonner 2.0.3 (toast notifications)
- recharts 2.15.2 (charts)

### **Supabase**
- @supabase/supabase-js 2.93.1

### **Backend (Edge Functions)**
- Hono (npm:hono)
- Deno runtime

---

## 🔄 DATA FLOW

```
Frontend Component
    ↓
API Call (fetch)
    ↓
Edge Function (Hono route)
    ↓
KV Store (get/set/del)
    ↓
Response (JSON)
    ↓
State Update (useState)
    ↓
UI Re-render
```

---

## 🎯 FUTURE ENHANCEMENTS

### **Готово к добавлению**
1. **Supabase Auth** - полная система авторизации
2. **Real-time subscriptions** - live обновления
3. **File uploads** - загрузка медиа в Storage
4. **Payment integration** - Stripe/PayPal
5. **Social login** - OAuth провайдеры
6. **Multi-language** - i18n
7. **PWA** - оффлайн режим
8. **Push notifications** - Web Push API

---

**Последнее обновление**: 26 января 2026

**Версия**: 3.0.0 (Фаза 3 завершена)

**Статус**: ✅ Production Ready