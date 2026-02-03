# 📚 PROMO.MUSIC - PARTNERS MANAGEMENT API DOCUMENTATION

Полная документация REST API для управления партнерами платформы promo.music

---

## 📋 Содержание

1. [Публичные методы](#публичные-методы)
2. [Партнерский кабинет](#партнерский-кабинет)
3. [Услуги партнеров](#услуги-партнеров)
4. [Отзывы](#отзывы)
5. [Выплаты](#выплаты)
6. [Администрирование](#администрирование)
7. [Статистика](#статистика)

---

## 🌐 Публичные методы

### GET `/api/partners`

Получение списка партнеров с фильтрацией

**Query Parameters:**
```
category: string - Категория (radio, playlist, blogger, media, venue)
country: string - Страна
city: string - Город
verified: boolean - Только верифицированные
premium: boolean - Только премиум
price_min: number - Минимальная цена
price_max: number - Максимальная цена
rating_min: number - Минимальный рейтинг (0-5)
genres: string[] - Жанры (массив)
search: string - Текстовый поиск
sort_by: string - Сортировка (rating_desc, price_asc, popular, newest)
limit: number - Лимит (default: 20)
offset: number - Смещение (default: 0)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "partners": [
      {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Русское Радио",
        "slug": "russkoe-radio-550e8400",
        "category": "radio",
        "logo_url": "https://cdn.promo.music/partners/1/logo.jpg",
        "banner_url": "https://cdn.promo.music/partners/1/banner.jpg",
        "short_description": "Крупнейшая радиостанция России",
        "country": "Россия",
        "city": "Москва",
        "base_price": 5000.00,
        "price_range_min": 3000.00,
        "price_range_max": 15000.00,
        "currency": "RUB",
        "rating": 4.8,
        "reviews_count": 342,
        "verified": true,
        "premium": true,
        "featured": true,
        "audience_size": 5000000,
        "monthly_reach": 8000000,
        "genres": ["Pop", "Dance", "Electronic"],
        "approval_rate": 45.5,
        "average_response_time_hours": 48
      }
    ],
    "pagination": {
      "total": 1247,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

### GET `/api/partners/:id`

Получение детальной информации о партнере

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Русское Радио",
    "legal_name": "ООО \"Русское Радио\"",
    "slug": "russkoe-radio-550e8400",
    "category": "radio",
    "subcategory": "FM Radio",
    "logo_url": "https://...",
    "banner_url": "https://...",
    "gallery": [
      "https://cdn.promo.music/partners/1/photo1.jpg",
      "https://cdn.promo.music/partners/1/photo2.jpg"
    ],
    "email": "promo@rusradio.ru",
    "phone": "+7 (495) 123-45-67",
    "website": "https://rusradio.ru",
    "social_links": {
      "instagram": "@rusradio",
      "vk": "vk.com/rusradio",
      "youtube": "UCxxx",
      "telegram": "@rusradio"
    },
    "country": "Россия",
    "city": "Москва",
    "address": "ул. Примерная, д. 1",
    "description": "Полное описание партнера...",
    "pitch_guidelines": "Инструкции для артистов...",
    "about_audience": "О нашей аудитории...",
    "audience_size": 5000000,
    "monthly_reach": 8000000,
    "audience_demographics": {
      "age_18_24": 30,
      "age_25_34": 45,
      "age_35_44": 20,
      "age_45_plus": 5,
      "male": 60,
      "female": 40
    },
    "genres": ["Pop", "Dance", "Electronic"],
    "languages": ["Русский", "English"],
    "base_price": 5000.00,
    "price_range_min": 3000.00,
    "price_range_max": 15000.00,
    "rating": 4.8,
    "reviews_count": 342,
    "response_quality_rating": 4.7,
    "professionalism_rating": 4.9,
    "value_for_money_rating": 4.6,
    "verified": true,
    "premium": true,
    "featured": true,
    "total_orders": 1250,
    "completed_orders": 1180,
    "approval_rate": 45.5,
    "average_response_time_hours": 48,
    "working_hours": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-18:00",
      "saturday": "Closed",
      "sunday": "Closed"
    },
    "is_available": true,
    "tags": ["top", "verified", "fast-response"],
    "created_at": "2023-01-15T10:00:00Z",
    "services_count": 5,
    "approved_reviews_count": 342
  }
}
```

---

### GET `/api/partners/slug/:slug`

Получение партнера по slug (URL-friendly идентификатор)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "russkoe-radio-550e8400",
    "name": "Русское Радио"
    // ... остальные поля
  }
}
```

---

### GET `/api/partners/search`

Полнотекстовый поиск партнеров

**Query Parameters:**
- `q` - Поисковый запрос (обязательно)
- `limit` - Лимит (default: 50)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 1,
        "name": "Русское Радио",
        "category": "radio",
        "city": "Москва",
        "rating": 4.8,
        "rank": 0.98
      }
    ],
    "total": 15
  }
}
```

---

### GET `/api/partners/featured`

Рекомендуемые партнеры

**Response 200:**
```json
{
  "success": true,
  "data": {
    "partners": [
      // Массив партнеров с флагом featured=true
    ]
  }
}
```

---

### GET `/api/partners/top`

Топ партнеров по рейтингу

**Query Parameters:**
- `category` - Фильтр по категории
- `limit` - Лимит (default: 20)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "partners": [
      // Массив топовых партнеров
    ]
  }
}
```

---

## 🏢 Партнерский кабинет

### GET `/api/partner/me`

Получение профиля партнера

**Headers:**
```
Authorization: Bearer {partner_access_token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Русское Радио",
    "status": "active",
    "verified": true,
    "balance": 125000.00,
    "pending_payout": 25000.00,
    "total_earned": 500000.00,
    "total_orders": 1250,
    "active_orders": 12,
    "completed_orders": 1180,
    "approval_rate": 45.5,
    "rating": 4.8
    // ... остальные поля
  }
}
```

---

### PATCH `/api/partner/me`

Обновление профиля партнера

**Request Body:**
```json
{
  "name": "Новое Название",
  "description": "Обновленное описание",
  "phone": "+7 (495) 999-99-99",
  "website": "https://newwebsite.com",
  "social_links": {
    "instagram": "@new_instagram"
  },
  "genres": ["Pop", "Rock"],
  "working_hours": {
    "monday": "10:00-19:00"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Новое Название",
    "updated_at": "2024-02-01T12:00:00Z"
  },
  "message": "Профиль успешно обновлен"
}
```

---

### POST `/api/partner/me/logo`

Загрузка логотипа

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {partner_access_token}
```

**Request Body (FormData):**
```
logo: [file]
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "logo_url": "https://cdn.promo.music/partners/1/logo.jpg"
  },
  "message": "Логотип успешно загружен"
}
```

---

### PATCH `/api/partner/me/availability`

Изменение доступности для заказов

**Request Body:**
```json
{
  "is_available": false,
  "availability_notes": "В отпуске до 15 марта"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Статус доступности обновлен"
}
```

---

## 🛍️ Услуги партнеров

### GET `/api/partners/:id/services`

Получение услуг партнера

**Response 200:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440001",
        "partner_id": 1,
        "service_name": "Ротация в прайм-тайм",
        "service_type": "airplay",
        "description": "Эфир в лучшее время 18:00-21:00",
        "price": 8000.00,
        "currency": "RUB",
        "discount_percentage": 0,
        "duration_days": 30,
        "guaranteed_plays": 50,
        "guaranteed_reach": 500000,
        "delivery_time_days": 7,
        "is_active": true,
        "is_popular": true,
        "total_orders": 145
      }
    ]
  }
}
```

---

### POST `/api/partner/me/services`

Создание услуги (для партнера)

**Request Body:**
```json
{
  "service_name": "VIP Ротация",
  "service_type": "airplay",
  "description": "Максимальная ротация",
  "price": 15000.00,
  "duration_days": 30,
  "guaranteed_plays": 100,
  "delivery_time_days": 3
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "service_name": "VIP Ротация",
    "created_at": "2024-02-01T12:00:00Z"
  },
  "message": "Услуга создана"
}
```

---

### PATCH `/api/partner/me/services/:id`

Обновление услуги

**Request Body:**
```json
{
  "price": 12000.00,
  "description": "Обновленное описание"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Услуга обновлена"
}
```

---

### DELETE `/api/partner/me/services/:id`

Деактивация услуги

**Response 200:**
```json
{
  "success": true,
  "message": "Услуга деактивирована"
}
```

---

## ⭐ Отзывы

### GET `/api/partners/:id/reviews`

Получение отзывов о партнере

**Query Parameters:**
- `limit` - Лимит (default: 10)
- `offset` - Смещение (default: 0)
- `sort_by` - Сортировка (newest, highest_rated, most_helpful)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 101,
        "overall_rating": 5,
        "review_title": "Отличная работа!",
        "review_text": "Все было выполнено быстро и качественно",
        "pros": "Быстрый ответ, профессионализм",
        "cons": "",
        "response_quality_rating": 5,
        "professionalism_rating": 5,
        "value_for_money_rating": 5,
        "communication_rating": 5,
        "would_recommend": true,
        "is_verified_purchase": true,
        "helpful_count": 24,
        "not_helpful_count": 1,
        "partner_response": "Спасибо за отзыв!",
        "partner_responded_at": "2024-01-20T14:00:00Z",
        "reviewer_name": "Иван Петров",
        "reviewer_avatar": "https://...",
        "created_at": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 342,
      "limit": 10,
      "offset": 0
    },
    "summary": {
      "average_rating": 4.8,
      "total_reviews": 342,
      "rating_distribution": {
        "5": 280,
        "4": 45,
        "3": 12,
        "2": 3,
        "1": 2
      },
      "recommendation_percentage": 95.2
    }
  }
}
```

---

### POST `/api/partners/:id/reviews`

Создание отзыва о партнере

**Headers:**
```
Authorization: Bearer {user_access_token}
```

**Request Body:**
```json
{
  "order_id": 456,
  "overall_rating": 5,
  "review_title": "Отличный партнер!",
  "review_text": "Все прошло отлично",
  "pros": "Быстро, качественно",
  "cons": "",
  "response_quality_rating": 5,
  "professionalism_rating": 5,
  "value_for_money_rating": 5,
  "communication_rating": 5,
  "would_recommend": true
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 102,
    "created_at": "2024-02-01T12:00:00Z"
  },
  "message": "Отзыв успешно создан и отправлен на модерацию"
}
```

---

### PATCH `/api/partner/me/reviews/:id/response`

Ответ партнера на отзыв

**Request Body:**
```json
{
  "response": "Спасибо за отзыв! Рады были с вами работать!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Ответ опубликован"
}
```

---

### POST `/api/partners/:partnerId/reviews/:id/helpful`

Пометка отзыва как полезный/бесполезный

**Request Body:**
```json
{
  "is_helpful": true
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "helpful_count": 25,
    "not_helpful_count": 1
  }
}
```

---

## 💰 Выплаты

### GET `/api/partner/me/payouts`

История выплат партнера

**Headers:**
```
Authorization: Bearer {partner_access_token}
```

**Query Parameters:**
- `status` - Фильтр по статусу
- `limit` - Лимит (default: 20)
- `offset` - Смещение (default: 0)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440002",
        "amount": 50000.00,
        "currency": "RUB",
        "period_start": "2024-01-01",
        "period_end": "2024-01-31",
        "total_orders": 45,
        "commission_amount": 7500.00,
        "status": "completed",
        "payout_method": "bank_transfer",
        "transaction_id": "TRX123456",
        "invoice_number": "INV-2024-001",
        "created_at": "2024-02-01T10:00:00Z",
        "processed_at": "2024-02-03T15:00:00Z"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0
    },
    "summary": {
      "total_paid": 500000.00,
      "pending_amount": 25000.00,
      "available_for_payout": 125000.00
    }
  }
}
```

---

### POST `/api/partner/me/payouts/request`

Запрос выплаты

**Request Body:**
```json
{
  "amount": 50000.00,
  "payout_method": "bank_transfer",
  "payout_details": {
    "bank_name": "Сбербанк",
    "account_number": "40817810123456789012",
    "bic": "044525225"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "amount": 50000.00,
    "status": "pending",
    "estimated_completion": "2024-02-05T12:00:00Z"
  },
  "message": "Заявка на выплату создана"
}
```

---

### GET `/api/partner/me/balance`

Информация о балансе партнера

**Response 200:**
```json
{
  "success": true,
  "data": {
    "balance": 125000.00,
    "pending_payout": 25000.00,
    "total_earned": 500000.00,
    "available_for_payout": 100000.00,
    "currency": "RUB",
    "last_payout_date": "2024-01-15T12:00:00Z",
    "last_payout_amount": 50000.00
  }
}
```

---

## 🛡️ Администрирование

### GET `/api/admin/partners`

Получение всех партнеров (админ)

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Query Parameters:**
- `status` - Фильтр по статусу
- `moderation_status` - Статус модерации
- `verified` - Верифицированные
- `category` - Категория
- `search` - Поиск
- `sort_by` - Сортировка
- `limit` - Лимит
- `offset` - Смещение

**Response 200:**
```json
{
  "success": true,
  "data": {
    "partners": [
      // Массив партнеров
    ],
    "pagination": {
      "total": 1247,
      "limit": 50,
      "offset": 0
    },
    "statistics": {
      "total_partners": 1247,
      "active_partners": 980,
      "pending_partners": 125,
      "blocked_partners": 15,
      "verified_partners": 856,
      "total_platform_earned": 15000000.00
    }
  }
}
```

---

### POST `/api/admin/partners`

Создание партнера админом

**Request Body:**
```json
{
  "name": "Новый Партнер",
  "category": "radio",
  "email": "partner@example.com",
  "phone": "+7 (999) 000-00-00",
  "country": "Россия",
  "city": "Москва",
  "base_price": 3000.00,
  "genres": ["Pop", "Rock"]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "name": "Новый Партнер",
    "created_at": "2024-02-01T12:00:00Z"
  },
  "message": "Партнер создан"
}
```

---

### PATCH `/api/admin/partners/:id/moderate`

Модерация партнера

**Request Body:**
```json
{
  "moderation_status": "approved",
  "moderation_notes": "Все проверено, одобрено"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Партнер одобрен"
}
```

**Для отклонения:**
```json
{
  "moderation_status": "rejected",
  "rejection_reason": "Недостаточно информации"
}
```

---

### PATCH `/api/admin/partners/:id/verify`

Верификация партнера

**Response 200:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "verification_date": "2024-02-01T12:00:00Z"
  },
  "message": "Партнер верифицирован"
}
```

---

### PATCH `/api/admin/partners/:id/status`

Изменение статуса

**Request Body:**
```json
{
  "status": "blocked"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Статус изменен"
}
```

---

### PATCH `/api/admin/partners/:id/premium`

Установка премиум статуса

**Request Body:**
```json
{
  "premium": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Премиум статус установлен"
}
```

---

### PATCH `/api/admin/partners/:id/featured`

Установка флага "Рекомендуемый"

**Request Body:**
```json
{
  "featured": true
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Партнер добавлен в рекомендуемые"
}
```

---

### GET `/api/admin/partners/:id/activity-log`

История активности партнера

**Response 200:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1001,
        "action_type": "verified",
        "action_description": "Партнер верифицирован",
        "admin_name": "Администратор",
        "created_at": "2024-02-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 48,
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

### POST `/api/admin/partners/:id/payouts/process`

Обработка выплаты партнеру

**Request Body:**
```json
{
  "payout_id": 5,
  "transaction_id": "TRX789012"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Выплата обработана"
}
```

---

### PATCH `/api/admin/reviews/:id/moderate`

Модерация отзыва

**Request Body:**
```json
{
  "moderation_status": "approved",
  "moderation_notes": "Отзыв проверен"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Отзыв одобрен"
}
```

---

## 📊 Статистика

### GET `/api/admin/partners/statistics`

Общая статистика партнеров

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_partners": 1247,
    "active_partners": 980,
    "pending_partners": 125,
    "blocked_partners": 15,
    "verified_partners": 856,
    "premium_partners": 124,
    "average_rating": 4.6,
    "total_platform_earned": 15000000.00,
    "total_partner_balance": 2500000.00,
    "by_category": {
      "radio": 450,
      "playlist": 380,
      "blogger": 250,
      "media": 120,
      "venue": 47
    },
    "by_country": {
      "Россия": 980,
      "Украина": 150,
      "Беларусь": 80
    }
  }
}
```

---

### GET `/api/admin/partners/top`

Топ партнеров

**Query Parameters:**
- `by` - Критерий (rating, earnings, orders)
- `category` - Фильтр по категории
- `limit` - Лимит (default: 100)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "partners": [
      {
        "id": 1,
        "name": "Русское Радио",
        "category": "radio",
        "rating": 4.9,
        "reviews_count": 520,
        "total_earned": 850000.00,
        "total_orders": 1500
      }
    ]
  }
}
```

---

### GET `/api/admin/partners/analytics/activity`

Аналитика активности партнеров

**Query Parameters:**
- `period` - Период (7d, 30d, 90d, 1y)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "chart_data": [
      {
        "date": "2024-01-01",
        "new_partners": 12,
        "verified_partners": 8
      }
    ],
    "summary": {
      "total_new": 350,
      "total_verified": 280,
      "verification_rate": 80.0
    }
  }
}
```

---

## 🔧 Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request - Некорректные данные |
| 401 | Unauthorized - Не авторизован |
| 403 | Forbidden - Нет доступа |
| 404 | Not Found - Партнер не найден |
| 409 | Conflict - Email уже используется |
| 422 | Unprocessable Entity - Ошибка валидации |
| 429 | Too Many Requests - Превышен лимит |
| 500 | Internal Server Error - Внутренняя ошибка |

**Формат ошибки:**
```json
{
  "success": false,
  "error": {
    "code": "PARTNER_NOT_FOUND",
    "message": "Партнер не найден",
    "details": {}
  }
}
```

---

## 📝 Примечания

1. Все даты в формате ISO 8601 (UTC)
2. Токены имеют срок действия 7 дней
3. Rate limit: 100 запросов в минуту
4. Все суммы в валюте с 2 знаками после запятой
5. Slug генерируется автоматически из названия
6. Загружаемые файлы: max 10MB (логотип), max 5MB (баннер)
7. Модерация отзывов обязательна
8. Выплаты обрабатываются в течение 3-5 рабочих дней
