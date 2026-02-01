# 📡 API Reference - PROMO.MUSIC

**Версия API:** v1.0  
**Дата:** 28 января 2026  
**Base URL:** `https://{projectId}.supabase.co/functions/v1/make-server-84730125`

---

## 📖 Содержание

- [Аутентификация](#аутентификация)
- [Track Test API](#track-test-api)
- [Concerts API](#concerts-api)
- [Banners API](#banners-api)
- [Payments API](#payments-api)
- [Settings API](#settings-api)
- [Notifications API](#notifications-api)
- [Storage API](#storage-api)
- [Subscriptions API](#subscriptions-api)
- [Коды ошибок](#коды-ошибок)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Аутентификация

Все API запросы требуют аутентификации через Supabase Auth.

### Headers

```typescript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Получение токена

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const accessToken = data.session.access_token;
```

---

## 🎵 Track Test API

API для системы профессиональной оценки треков экспертами.

### POST /api/track-test/submit

Создать заявку на тестирование трека.

**Request Body:**

```typescript
interface SubmitTrackTestRequest {
  user_id?: string;           // UUID пользователя (опционально для гостей)
  track_id?: string;          // UUID трека из библиотеки
  guest_email?: string;       // Email гостя (если user_id не указан)
  guest_name?: string;        // Имя гостя
  guest_track_url?: string;   // URL трека гостя
  guest_cover_url?: string;   // URL обложки
  track_title: string;        // Название трека (обязательно)
  artist_name: string;        // Имя артиста (обязательно)
  genre?: string;             // Жанр
}
```

**Example:**

```typescript
/**
 * Создание заявки на тест трека
 * @param {SubmitTrackTestRequest} data - Данные заявки
 * @returns {Promise<SubmitTrackTestResponse>} Результат создания
 */
const response = await fetch(`${API_URL}/api/track-test/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    user_id: 'user-uuid',
    track_title: 'My New Track',
    artist_name: 'DJ Cool',
    genre: 'Electronic'
  })
});

const data = await response.json();
```

**Response (201):**

```typescript
interface SubmitTrackTestResponse {
  success: boolean;
  request_id: string;          // UUID заявки
  status: 'pending_payment';   // Начальный статус
  payment_amount: number;      // 1000 RUB
  message: string;
}
```

**Example Response:**

```json
{
  "success": true,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending_payment",
  "payment_amount": 1000,
  "message": "Track test request created. Please proceed with payment."
}
```

---

### POST /api/track-test/payment

Обработать оплату за тестирование.

**Request Body:**

```typescript
interface TrackTestPaymentRequest {
  request_id: string;          // UUID заявки
  payment_method: string;      // 'card' | 'sbp' | 'wallet'
  transaction_id?: string;     // ID транзакции (опционально)
}
```

**Example:**

```typescript
/**
 * Обработка оплаты за тест трека
 * @param {TrackTestPaymentRequest} data - Данные платежа
 * @returns {Promise<TrackTestPaymentResponse>} Результат оплаты
 */
const response = await fetch(`${API_URL}/api/track-test/payment`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    request_id: '550e8400-e29b-41d4-a716-446655440000',
    payment_method: 'card'
  })
});

const data = await response.json();
```

**Response (200):**

```typescript
interface TrackTestPaymentResponse {
  success: boolean;
  status: 'pending_moderation';
  message: string;
}
```

---

### GET /api/track-test/requests

Получить список заявок пользователя.

**Query Parameters:**

```typescript
interface GetRequestsParams {
  user_id: string;    // UUID пользователя (обязательно)
}
```

**Example:**

```typescript
/**
 * Получение списка заявок на тест треков
 * @param {string} userId - ID пользователя
 * @returns {Promise<TrackTestRequestsResponse>} Список заявок
 */
const response = await fetch(
  `${API_URL}/api/track-test/requests?user_id=${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const data = await response.json();
```

**Response (200):**

```typescript
interface TrackTestRequest {
  id: string;
  user_id: string | null;
  track_id: string | null;
  track_title: string;
  artist_name: string;
  genre?: string;
  status: TrackTestStatus;
  payment_status: PaymentStatus;
  payment_amount: number;
  required_expert_count: number;
  completed_reviews_count: number;
  average_rating?: number;
  category_averages?: {
    mixing_mastering: number;
    arrangement: number;
    originality: number;
    commercial_potential: number;
  };
  consolidated_feedback?: string;
  consolidated_recommendations?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface TrackTestRequestsResponse {
  success: boolean;
  requests: TrackTestRequest[];
  total: number;
}
```

**Status Types:**

```typescript
type TrackTestStatus = 
  | 'pending_payment'
  | 'pending_moderation'
  | 'moderation_rejected'
  | 'pending_expert_assignment'
  | 'experts_assigned'
  | 'review_in_progress'
  | 'pending_admin_review'
  | 'completed'
  | 'rejected';

type PaymentStatus = 'pending' | 'completed' | 'refunded';
```

---

### GET /api/track-test/requests/:id

Получить детали заявки.

**Path Parameters:**

- `id` - UUID заявки

**Example:**

```typescript
/**
 * Получение деталей заявки на тест трека
 * @param {string} requestId - ID заявки
 * @returns {Promise<TrackTestRequestDetailsResponse>} Детали заявки
 */
const response = await fetch(
  `${API_URL}/api/track-test/requests/${requestId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const data = await response.json();
```

**Response (200):**

```typescript
interface ExpertReview {
  id: string;
  request_id: string;
  expert_email: string;
  expert_name: string;
  status: 'assigned' | 'in_progress' | 'completed';
  
  // Оценки (1-10)
  mixing_mastering_score: number;
  arrangement_score: number;
  originality_score: number;
  commercial_potential_score: number;
  overall_score: number;
  
  // Фидбек
  mixing_mastering_feedback: string;
  arrangement_feedback: string;
  originality_feedback: string;
  commercial_potential_feedback: string;
  general_feedback: string;
  recommendations: string;
  
  reward_points: number;    // 50
  reward_paid: boolean;
  
  created_at: string;
  completed_at?: string;
}

interface TrackTestRequestDetailsResponse {
  success: boolean;
  request: TrackTestRequest;
  reviews: ExpertReview[];
  reviews_count: number;
}
```

---

### POST /api/track-test/moderate

Модерация заявки (администратор).

**Request Body:**

```typescript
interface ModerateRequestBody {
  request_id: string;           // UUID заявки
  action: 'approve' | 'reject'; // Действие
  notes?: string;               // Заметки модератора
}
```

**Example:**

```typescript
/**
 * Модерация заявки на тест трека
 * @param {ModerateRequestBody} data - Данные модерации
 * @returns {Promise<ModerateResponse>} Результат модерации
 * @requires Admin role
 */
const response = await fetch(`${API_URL}/api/track-test/moderate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminAccessToken}`
  },
  body: JSON.stringify({
    request_id: '550e8400-e29b-41d4-a716-446655440000',
    action: 'approve',
    notes: 'Track quality is good'
  })
});
```

**Response (200):**

```typescript
interface ModerateResponse {
  success: boolean;
  status: string;
  message: string;
}
```

---

### POST /api/track-test/assign-experts

Назначить экспертов для оценки (администратор).

**Request Body:**

```typescript
interface AssignExpertsRequest {
  request_id: string;           // UUID заявки
  expert_emails: string[];      // Массив email экспертов (1-10)
  required_count?: number;      // Требуемое количество оценок
}
```

**Example:**

```typescript
/**
 * Назначение экспертов для оценки трека
 * @param {AssignExpertsRequest} data - Данные назначения
 * @returns {Promise<AssignExpertsResponse>} Результат назначения
 * @requires Admin role
 */
const response = await fetch(`${API_URL}/api/track-test/assign-experts`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminAccessToken}`
  },
  body: JSON.stringify({
    request_id: '550e8400-e29b-41d4-a716-446655440000',
    expert_emails: [
      'expert1@promo.music',
      'expert2@promo.music',
      'expert3@promo.music',
      'expert4@promo.music',
      'expert5@promo.music'
    ],
    required_count: 5
  })
});
```

**Response (200):**

```typescript
interface AssignExpertsResponse {
  success: boolean;
  assigned_experts: number;
  status: 'experts_assigned';
  message: string;
}
```

---

### POST /api/track-test/submit-review

Отправить оценку трека (эксперт).

**Request Body:**

```typescript
interface SubmitReviewRequest {
  review_id: string;                          // UUID оценки
  
  // Оценки (1-10, обязательно)
  mixing_mastering_score: number;
  arrangement_score: number;
  originality_score: number;
  commercial_potential_score: number;
  overall_score: number;
  
  // Фидбек (рекомендуется)
  mixing_mastering_feedback?: string;
  arrangement_feedback?: string;
  originality_feedback?: string;
  commercial_potential_feedback?: string;
  general_feedback?: string;
  recommendations?: string;
}
```

**Example:**

```typescript
/**
 * Отправка оценки трека экспертом
 * @param {SubmitReviewRequest} data - Данные оценки
 * @returns {Promise<SubmitReviewResponse>} Результат отправки
 * @requires Expert role
 */
const response = await fetch(`${API_URL}/api/track-test/submit-review`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${expertAccessToken}`
  },
  body: JSON.stringify({
    review_id: 'review-uuid',
    mixing_mastering_score: 8,
    arrangement_score: 9,
    originality_score: 7,
    commercial_potential_score: 8,
    overall_score: 8,
    mixing_mastering_feedback: 'Отличное качество звука, баланс хороший',
    arrangement_feedback: 'Интересная структура, динамика присутствует',
    originality_feedback: 'Свежее звучание, но есть отсылки к известным треками',
    commercial_potential_feedback: 'Хороший потенциал для радио и плейлистов',
    general_feedback: 'Качественный трек с хорошим потенциалом',
    recommendations: 'Рекомендую доработать вокал и добавить более яркий дроп'
  })
});
```

**Response (200):**

```typescript
interface SubmitReviewResponse {
  success: boolean;
  message: string;
  reward: number;    // 50 коинов
}
```

---

### POST /api/track-test/finalize

Финализировать заявку и отправить результаты (администратор).

**Request Body:**

```typescript
interface FinalizeRequestBody {
  request_id: string;    // UUID заявки
}
```

**Example:**

```typescript
/**
 * Финализация заявки и отправка результатов артисту
 * @param {FinalizeRequestBody} data - Данные финализации
 * @returns {Promise<FinalizeResponse>} Результат финализации
 * @requires Admin role
 */
const response = await fetch(`${API_URL}/api/track-test/finalize`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminAccessToken}`
  },
  body: JSON.stringify({
    request_id: '550e8400-e29b-41d4-a716-446655440000'
  })
});
```

**Response (200):**

```typescript
interface FinalizeResponse {
  success: boolean;
  status: 'completed';
  message: string;
}
```

---

### GET /api/track-test/expert/reviews

Получить назначенные оценки для эксперта.

**Query Parameters:**

```typescript
interface GetExpertReviewsParams {
  email: string;    // Email эксперта (обязательно)
}
```

**Example:**

```typescript
/**
 * Получение списка назначенных оценок для эксперта
 * @param {string} expertEmail - Email эксперта
 * @returns {Promise<ExpertReviewsResponse>} Список оценок
 * @requires Expert role
 */
const response = await fetch(
  `${API_URL}/api/track-test/expert/reviews?email=${expertEmail}`,
  {
    headers: {
      'Authorization': `Bearer ${expertAccessToken}`
    }
  }
);
```

**Response (200):**

```typescript
interface ExpertReviewWithRequest {
  review: ExpertReview;
  request: TrackTestRequest;
}

interface ExpertReviewsResponse {
  success: boolean;
  reviews: ExpertReviewWithRequest[];
  total: number;
}
```

---

## 🎪 Concerts API

API для управления концертами и событиями.

### POST /api/concerts/create

Создать концерт.

**Request Body:**

```typescript
interface CreateConcertRequest {
  title: string;           // Название
  date: string;            // ISO date
  time: string;            // HH:mm
  city: string;            // Город
  venue: string;           // Площадка
  type: string;            // Тип события
  description: string;     // Описание
  banner: string;          // URL баннера
  ticketPriceFrom: string; // Цена от
  ticketPriceTo: string;   // Цена до
  ticketLink: string;      // Ссылка на билеты
}
```

**Example:**

```typescript
/**
 * Создание нового концерта
 * @param {CreateConcertRequest} data - Данные концерта
 * @returns {Promise<CreateConcertResponse>} Результат создания
 */
const response = await fetch(`${API_URL}/api/concerts/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    title: 'Summer Music Fest 2026',
    date: '2026-06-15',
    time: '19:00',
    city: 'Москва',
    venue: 'Олимпийский',
    type: 'Фестиваль',
    description: 'Грандиозный летний фестиваль',
    banner: 'https://example.com/banner.jpg',
    ticketPriceFrom: '2000',
    ticketPriceTo: '8000',
    ticketLink: 'https://tickets.example.com'
  })
});
```

---

### GET /api/concerts/list

Получить список концертов.

**Query Parameters:**

```typescript
interface GetConcertsParams {
  user_id?: string;         // Фильтр по пользователю
  status?: ConcertStatus;   // Фильтр по статусу
  limit?: number;           // Лимит (default: 10)
  offset?: number;          // Offset (default: 0)
}

type ConcertStatus = 'draft' | 'pending' | 'approved' | 'rejected';
```

**Example:**

```typescript
/**
 * Получение списка концертов
 * @param {GetConcertsParams} params - Параметры запроса
 * @returns {Promise<ConcertsListResponse>} Список концертов
 */
const response = await fetch(
  `${API_URL}/api/concerts/list?user_id=${userId}&status=approved`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

---

## 🎨 Banners API

API для управления баннерной рекламой.

### POST /api/banners/submit

Создать баннер.

**Request Body:**

```typescript
interface CreateBannerRequest {
  campaign_name: string;      // Название кампании
  banner_url: string;         // URL баннера
  destination_url: string;    // URL перехода
  placement: BannerPlacement; // Место размещения
  duration_days: number;      // Длительность (дни)
}

type BannerPlacement = 
  | 'home_top'
  | 'home_sidebar'
  | 'tracks_list'
  | 'video_player';
```

**Example:**

```typescript
/**
 * Создание баннера
 * @param {CreateBannerRequest} data - Данные баннера
 * @returns {Promise<CreateBannerResponse>} Результат создания
 */
const response = await fetch(`${API_URL}/api/banners/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    campaign_name: 'New Album Promo',
    banner_url: 'https://example.com/banner.jpg',
    destination_url: 'https://music.apple.com/album',
    placement: 'home_top',
    duration_days: 7
  })
});
```

---

## 💳 Payments API

API для управления платежами и транзакциями.

### GET /payments/history

Получить историю платежей.

**Query Parameters:**

```typescript
interface GetPaymentHistoryParams {
  user_id: string;      // UUID пользователя
  limit?: number;       // Лимит (default: 20)
  offset?: number;      // Offset (default: 0)
  type?: PaymentType;   // Тип транзакции
}

type PaymentType = 
  | 'track_test'
  | 'concert_promotion'
  | 'banner_ad'
  | 'subscription'
  | 'coins_purchase';
```

**Example:**

```typescript
/**
 * Получение истории платежей
 * @param {GetPaymentHistoryParams} params - Параметры запроса
 * @returns {Promise<PaymentHistoryResponse>} История платежей
 */
const response = await fetch(
  `${API_URL}/payments/history?user_id=${userId}&limit=20`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

---

## ⚙️ Settings API

API для управления настройками пользователя.

### GET /api/settings/profile

Получить настройки профиля.

**Example:**

```typescript
/**
 * Получение настроек профиля
 * @param {string} userId - ID пользователя
 * @returns {Promise<ProfileSettingsResponse>} Настройки профиля
 */
const response = await fetch(
  `${API_URL}/api/settings/profile?user_id=${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

### PUT /api/settings/profile

Обновить настройки профиля.

**Request Body:**

```typescript
interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}
```

---

## 🔔 Notifications API

API для уведомлений.

### GET /notifications/list

Получить список уведомлений.

**Example:**

```typescript
/**
 * Получение списка уведомлений
 * @param {string} userId - ID пользователя
 * @returns {Promise<NotificationsListResponse>} Список уведомлений
 */
const response = await fetch(
  `${API_URL}/notifications/list?user_id=${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);
```

---

## ❌ Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | OK - Успешный запрос |
| 201 | Created - Ресурс создан |
| 400 | Bad Request - Неверные параметры |
| 401 | Unauthorized - Требуется аутентификация |
| 403 | Forbidden - Доступ запрещен |
| 404 | Not Found - Ресурс не найден |
| 409 | Conflict - Конфликт данных |
| 422 | Unprocessable Entity - Ошибка валидации |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Внутренняя ошибка |

**Example Error Response:**

```json
{
  "error": "Invalid parameters",
  "message": "Track title is required",
  "code": "VALIDATION_ERROR"
}
```

---

## ⏱️ Rate Limiting

**Лимиты:**
- 100 запросов в 15 минут для обычных users
- 1000 запросов в 15 минут для premium users
- Unlimited для admin

**Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📝 Примечания

- Все даты в формате ISO 8601
- Все ID в формате UUID v4
- Все цены в рублях (RUB)
- Все текстовые поля поддерживают UTF-8

---

**Дата обновления:** 28 января 2026  
**Версия:** 1.0
