# PROMO.MUSIC - PITCHING MODULE API DOCUMENTATION

## 📚 Полная документация API для системы питчинга

---

## 🎯 Базовый URL

```
https://{projectId}.supabase.co/functions/v1/make-server-84730125
```

---

## 🔐 Аутентификация

Все запросы требуют JWT токен в заголовке:

```http
Authorization: Bearer {access_token}
```

---

## 📋 ENDPOINTS

### 1. CAMPAIGNS (Кампании)

#### 1.1 Получить все кампании пользователя

```http
GET /pitching/campaigns
```

**Query Parameters:**
- `status` (optional): `draft`, `active`, `completed`, `cancelled`
- `type` (optional): `radio`, `playlist`, `blogger`, `media`, `venue`
- `page` (optional): номер страницы (default: 1)
- `limit` (optional): количество на странице (default: 20)
- `sort` (optional): `created_at`, `deadline`, `cost` (default: `created_at`)
- `order` (optional): `asc`, `desc` (default: `desc`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "campaign_name": "Summer Vibes Promotion",
        "campaign_type": "radio",
        "status": "active",
        "total_partners_count": 5,
        "responses_count": 3,
        "approvals_count": 2,
        "rejections_count": 1,
        "total_cost": 15000.00,
        "final_cost": 12750.00,
        "created_at": "2026-02-01T10:00:00Z",
        "deadline": "2026-02-15",
        "track": {
          "id": 123,
          "title": "Summer Vibes",
          "artist_name": "DJ Alex",
          "cover_url": "https://...",
          "duration_seconds": 210
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

#### 1.2 Получить детали кампании

```http
GET /pitching/campaigns/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "campaign_name": "Summer Vibes Promotion",
      "campaign_type": "radio",
      "pitch_text": "Здравствуйте! Представляю трек...",
      "additional_info": {
        "genre": "Electronic",
        "mood": "Happy",
        "bpm": 128,
        "key": "Am"
      },
      "status": "active",
      "priority": "normal",
      "total_partners_count": 5,
      "responses_count": 3,
      "approvals_count": 2,
      "rejections_count": 1,
      "views_count": 4,
      "clicks_count": 3,
      "total_cost": 15000.00,
      "discount_percentage": 15.00,
      "final_cost": 12750.00,
      "currency": "RUB",
      "payment_status": "paid",
      "start_date": "2026-02-01",
      "end_date": "2026-03-01",
      "deadline": "2026-02-15",
      "created_at": "2026-02-01T10:00:00Z",
      "track": {
        "id": 123,
        "title": "Summer Vibes",
        "artist_name": "DJ Alex",
        "audio_url": "https://...",
        "cover_url": "https://...",
        "duration_seconds": 210,
        "genre": "Electronic"
      },
      "submissions": [
        {
          "id": 1,
          "partner": {
            "id": 10,
            "name": "Русское Радио",
            "category": "radio",
            "logo_url": "https://...",
            "rating": 4.8,
            "audience_size": 1000000
          },
          "status": "approved",
          "opened_at": "2026-02-02T14:30:00Z",
          "responded_at": "2026-02-03T10:00:00Z",
          "partner_response": "Отличный трек!",
          "partner_rating": 5,
          "placement_details": {
            "airplay_date": "2026-02-15",
            "time_slot": "Prime time",
            "estimated_listeners": 50000
          }
        }
      ]
    }
  }
}
```

---

#### 1.3 Создать новую кампанию

```http
POST /pitching/campaigns
```

**Request Body:**
```json
{
  "track_id": 123,
  "campaign_name": "Summer Vibes Promotion",
  "campaign_type": "radio",
  "pitch_text": "Здравствуйте! Представляю новый трек...",
  "additional_info": {
    "genre": "Electronic",
    "mood": "Happy",
    "bpm": 128,
    "key": "Am",
    "similar_artists": ["Artist 1", "Artist 2"]
  },
  "press_kit_url": "https://...",
  "target_partners": [
    {"id": 1, "name": "Русское Радио", "price": 5000},
    {"id": 2, "name": "Европа Плюс", "price": 7000}
  ],
  "start_date": "2026-02-10",
  "end_date": "2026-03-10",
  "deadline": "2026-02-20",
  "priority": "normal"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": "draft",
      "total_cost": 12000.00,
      "final_cost": 10200.00,
      "created_at": "2026-02-01T10:00:00Z"
    }
  },
  "message": "Кампания создана"
}
```

---

#### 1.4 Обновить кампанию

```http
PATCH /pitching/campaigns/:id
```

**Request Body:**
```json
{
  "campaign_name": "New Campaign Name",
  "pitch_text": "Updated pitch text...",
  "target_partners": [...],
  "deadline": "2026-02-25"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaign": { ... }
  },
  "message": "Кампания обновлена"
}
```

---

#### 1.5 Отправить кампанию на модерацию

```http
POST /pitching/campaigns/:id/submit
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "status": "in_moderation",
      "submitted_at": "2026-02-01T12:00:00Z"
    }
  },
  "message": "Кампания отправлена на модерацию"
}
```

---

#### 1.6 Отменить кампанию

```http
POST /pitching/campaigns/:id/cancel
```

**Response 200:**
```json
{
  "success": true,
  "message": "Кампания отменена"
}
```

---

#### 1.7 Удалить кампанию (soft delete)

```http
DELETE /pitching/campaigns/:id
```

**Response 200:**
```json
{
  "success": true,
  "message": "Кампания удалена"
}
```

---

### 2. SUBMISSIONS (Отправки партнерам)

#### 2.1 Получить отправки для кампании

```http
GET /pitching/campaigns/:id/submissions
```

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`, `opened`
- `sort` (optional): `created_at`, `responded_at` (default: `created_at`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": 1,
        "status": "approved",
        "partner": {
          "id": 10,
          "name": "Русское Радио",
          "category": "radio",
          "logo_url": "https://...",
          "rating": 4.8
        },
        "opened_at": "2026-02-02T14:30:00Z",
        "clicked_at": "2026-02-02T14:35:00Z",
        "responded_at": "2026-02-03T10:00:00Z",
        "partner_response": "Отличный трек! Включим в эфир.",
        "partner_rating": 5,
        "placement_details": {
          "airplay_date": "2026-02-15",
          "time_slot": "Prime time (18:00-21:00)"
        },
        "created_at": "2026-02-01T10:00:00Z"
      }
    ],
    "statistics": {
      "total": 5,
      "pending": 1,
      "opened": 1,
      "approved": 2,
      "rejected": 1
    }
  }
}
```

---

### 3. PARTNERS (Партнеры)

#### 3.1 Получить список партнеров

```http
GET /pitching/partners
```

**Query Parameters:**
- `category` (optional): `radio`, `playlist`, `blogger`, `media`, `venue`
- `country` (optional): название страны
- `city` (optional): название города
- `genre` (optional): жанр музыки
- `min_rating` (optional): минимальный рейтинг (0-5)
- `min_approval_rate` (optional): минимальный процент одобрений (0-100)
- `sort` (optional): `rating`, `approval_rate`, `audience_size`, `base_price`
- `page`, `limit`

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
        "logo_url": "https://...",
        "status": "active",
        "country": "Россия",
        "city": "Москва",
        "genres": ["Pop", "Dance", "Electronic"],
        "audience_size": 1000000,
        "reach_monthly": 5000000,
        "base_price": 5000.00,
        "currency": "RUB",
        "rating": 4.8,
        "total_pitches_received": 450,
        "total_pitches_approved": 180,
        "approval_rate": 40.00,
        "average_response_time_hours": 48,
        "description": "Крупнейшая радиостанция России...",
        "pitch_guidelines": "Принимаем треки в жанрах Pop, Dance..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

---

#### 3.2 Получить детали партнера

```http
GET /pitching/partners/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": 1,
      "name": "Русское Радио",
      "category": "radio",
      "logo_url": "https://...",
      "email": "promo@rusradio.ru",
      "phone": "+7 (495) 123-45-67",
      "website": "https://rusradio.ru",
      "country": "Россия",
      "city": "Москва",
      "address": "Москва, ул. Примерная, д. 1",
      "verified": true,
      "genres": ["Pop", "Dance", "Electronic"],
      "languages": ["Русский"],
      "audience_size": 1000000,
      "reach_monthly": 5000000,
      "base_price": 5000.00,
      "currency": "RUB",
      "commission_percentage": 15.00,
      "rating": 4.8,
      "total_pitches_received": 450,
      "total_pitches_approved": 180,
      "approval_rate": 40.00,
      "average_response_time_hours": 48,
      "contact_person": "Иван Петров",
      "contact_email": "ivan@rusradio.ru",
      "description": "Крупнейшая радиостанция...",
      "pitch_guidelines": "Принимаем треки в жанрах...",
      "social_links": {
        "instagram": "@rusradio",
        "vk": "vk.com/rusradio"
      },
      "last_activity_at": "2026-02-01T10:00:00Z"
    }
  }
}
```

---

### 4. PAYMENTS (Платежи)

#### 4.1 Создать платеж за кампанию

```http
POST /pitching/campaigns/:id/payment
```

**Request Body:**
```json
{
  "payment_method": "card",
  "return_url": "https://promo.music/pitching/campaigns/1"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": 555,
      "uuid": "...",
      "amount": 10200.00,
      "currency": "RUB",
      "status": "pending",
      "created_at": "2026-02-01T10:00:00Z"
    },
    "payment_url": "https://yookassa.ru/checkout/..." // Ссылка для оплаты
  }
}
```

---

#### 4.2 Подтвердить платеж (webhook)

```http
POST /pitching/payments/webhook
```

**Request Body (от платежной системы):**
```json
{
  "event": "payment.succeeded",
  "object": {
    "id": "payment_id",
    "status": "succeeded",
    "amount": {
      "value": "10200.00",
      "currency": "RUB"
    },
    "metadata": {
      "payment_id": "555",
      "campaign_id": "1"
    }
  }
}
```

---

#### 4.3 История платежей пользователя

```http
GET /pitching/payments
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 555,
        "campaign_id": 1,
        "campaign_name": "Summer Vibes",
        "amount": 10200.00,
        "currency": "RUB",
        "status": "completed",
        "payment_method": "card",
        "created_at": "2026-02-01T10:00:00Z",
        "completed_at": "2026-02-01T10:05:00Z"
      }
    ]
  }
}
```

---

### 5. TEMPLATES (Шаблоны)

#### 5.1 Получить шаблоны питчей

```http
GET /pitching/templates
```

**Query Parameters:**
- `category` (optional): `radio`, `playlist`, `blogger`, `media`, `venue`
- `is_public` (optional): `true`, `false`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": 1,
        "template_name": "Радио - Стандартный",
        "template_category": "radio",
        "pitch_text": "Здравствуйте!\n\nПредставляю трек {{TRACK_NAME}}...",
        "placeholders": {
          "TRACK_NAME": "Название трека",
          "GENRE": "Жанр",
          "BPM": "128"
        },
        "is_system_template": true,
        "is_public": true,
        "usage_count": 450,
        "success_rate": 38.50
      }
    ]
  }
}
```

---

#### 5.2 Создать свой шаблон

```http
POST /pitching/templates
```

**Request Body:**
```json
{
  "template_name": "Мой шаблон для радио",
  "template_category": "radio",
  "pitch_text": "Привет! Вот мой трек {{TRACK_NAME}}...",
  "placeholders": {
    "TRACK_NAME": "Название трека"
  },
  "is_public": false
}
```

---

### 6. STATISTICS (Статистика)

#### 6.1 Общая статистика пользователя

```http
GET /pitching/statistics
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_campaigns": 15,
      "active_campaigns": 3,
      "completed_campaigns": 10,
      "total_pitches_sent": 75,
      "total_approvals": 28,
      "total_rejections": 35,
      "pending_responses": 12,
      "overall_approval_rate": 37.33,
      "total_spent": 153000.00,
      "average_campaign_cost": 10200.00,
      "by_type": {
        "radio": {
          "campaigns": 8,
          "approval_rate": 42.50
        },
        "playlist": {
          "campaigns": 5,
          "approval_rate": 30.00
        },
        "blogger": {
          "campaigns": 2,
          "approval_rate": 35.00
        }
      }
    }
  }
}
```

---

#### 6.2 Статистика по кампании

```http
GET /pitching/campaigns/:id/statistics
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_partners": 5,
      "responses_count": 3,
      "approvals_count": 2,
      "rejections_count": 1,
      "pending_count": 2,
      "approval_rate": 66.67,
      "views_count": 4,
      "clicks_count": 3,
      "average_response_time_hours": 36,
      "timeline": [
        {
          "date": "2026-02-01",
          "event": "created",
          "description": "Кампания создана"
        },
        {
          "date": "2026-02-01",
          "event": "paid",
          "description": "Оплата завершена"
        },
        {
          "date": "2026-02-02",
          "event": "approved",
          "description": "Одобрено админом"
        }
      ]
    }
  }
}
```

---

### 7. ADMIN ENDPOINTS (Админ-панель)

#### 7.1 Получить кампании на модерации

```http
GET /admin/pitching/moderation
```

**Требуется роль: admin**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "campaign_name": "Summer Vibes",
        "artist_name": "DJ Alex",
        "artist_email": "alex@example.com",
        "track_title": "Summer Vibes",
        "campaign_type": "radio",
        "total_partners_count": 5,
        "final_cost": 10200.00,
        "submitted_at": "2026-02-01T12:00:00Z"
      }
    ]
  }
}
```

---

#### 7.2 Одобрить кампанию

```http
POST /admin/pitching/campaigns/:id/approve
```

**Request Body:**
```json
{
  "notes": "Кампания одобрена"
}
```

---

#### 7.3 Отклонить кампанию

```http
POST /admin/pitching/campaigns/:id/reject
```

**Request Body:**
```json
{
  "reason": "Контент не соответствует правилам платформы",
  "notes": "Необходимо..."
}
```

---

#### 7.4 Платформенная статистика

```http
GET /admin/pitching/statistics
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_campaigns": 1250,
      "active_campaigns": 85,
      "campaigns_this_month": 120,
      "total_revenue": 12750000.00,
      "revenue_this_month": 1020000.00,
      "average_approval_rate": 36.80,
      "total_partners": 156,
      "active_partners": 142,
      "by_type": {
        "radio": {
          "campaigns": 680,
          "revenue": 6800000.00
        },
        "playlist": {
          "campaigns": 350,
          "revenue": 3500000.00
        }
      }
    }
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации",
    "details": {
      "track_id": "Трек не найден",
      "target_partners": "Выберите хотя бы одного партнера"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Требуется аутентификация"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Недостаточно прав для выполнения операции"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Кампания не найдена"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Внутренняя ошибка сервера"
  }
}
```

---

## 📊 Rate Limiting

- **Общие запросы**: 1000 запросов в час
- **Создание кампаний**: 50 в час
- **Платежи**: 100 в час

Headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643723400
```

---

## 🔔 Webhooks

### События для подписки:

- `campaign.created` - Кампания создана
- `campaign.submitted` - Отправлена на модерацию
- `campaign.approved` - Одобрена
- `campaign.rejected` - Отклонена
- `submission.opened` - Партнер открыл питч
- `submission.responded` - Партнер ответил
- `payment.completed` - Платеж завершен
- `payment.failed` - Платеж отклонен

### Webhook Payload:
```json
{
  "event": "submission.responded",
  "timestamp": "2026-02-01T10:00:00Z",
  "data": {
    "campaign_id": 1,
    "submission_id": 10,
    "partner_id": 5,
    "status": "approved",
    "partner_response": "Отличный трек!"
  }
}
```

---

## 📝 Примечания

1. Все даты в формате ISO 8601 (UTC)
2. Суммы в формате Decimal с 2 знаками после запятой
3. UUID используются для публичных ссылок
4. Мягкое удаление (soft delete) для всех сущностей
5. Автоматическое логирование всех действий
