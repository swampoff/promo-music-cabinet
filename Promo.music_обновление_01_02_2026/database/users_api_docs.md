# 📚 PROMO.MUSIC - USERS MANAGEMENT API DOCUMENTATION

Полная документация REST API для управления пользователями платформы promo.music

---

## 📋 Содержание

1. [Аутентификация](#аутентификация)
2. [Управление пользователями](#управление-пользователями)
3. [Администрирование](#администрирование)
4. [Баланс и транзакции](#баланс-и-транзакции)
5. [Уведомления](#уведомления)
6. [Отзывы и рейтинги](#отзывы-и-рейтинги)
7. [Статистика](#статистика)

---

## 🔐 Аутентификация

### POST `/api/auth/register`

Регистрация нового пользователя

**Request Body:**
```json
{
  "name": "Александр Иванов",
  "email": "alexandr@example.com",
  "password": "SecurePassword123!",
  "username": "alexandr_music",
  "phone": "+7 (999) 123-45-67",
  "country": "Россия",
  "city": "Москва",
  "referral_code": "PROMO2024"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Александр Иванов",
      "email": "alexandr@example.com",
      "username": "alexandr_music",
      "role": "artist",
      "subscription_tier": "free",
      "status": "pending",
      "email_verified": false,
      "created_at": "2024-02-01T12:00:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 604800
    }
  },
  "message": "Регистрация успешна. Проверьте email для подтверждения."
}
```

**Errors:**
- `400` - Некорректные данные
- `409` - Email уже используется

---

### POST `/api/auth/login`

Вход в систему

**Request Body:**
```json
{
  "email": "alexandr@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "Александр Иванов",
      "email": "alexandr@example.com",
      "role": "artist",
      "subscription_tier": "pro",
      "balance": 5000.00,
      "avatar_url": "https://...",
      "status": "active"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 604800
    }
  }
}
```

**Errors:**
- `401` - Неверные учетные данные
- `403` - Аккаунт заблокирован

---

### POST `/api/auth/logout`

Выход из системы

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Вы успешно вышли из системы"
}
```

---

### POST `/api/auth/refresh`

Обновление токена доступа

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 604800
  }
}
```

---

### POST `/api/auth/verify-email`

Подтверждение email

**Request Body:**
```json
{
  "token": "abc123verification456token"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Email успешно подтвержден"
}
```

---

### POST `/api/auth/forgot-password`

Запрос на сброс пароля

**Request Body:**
```json
{
  "email": "alexandr@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Инструкции по сбросу пароля отправлены на email"
}
```

---

### POST `/api/auth/reset-password`

Сброс пароля

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePassword123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

---

## 👤 Управление пользователями

### GET `/api/users/me`

Получение профиля текущего пользователя

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Александр Иванов",
    "username": "alexandr_music",
    "email": "alexandr@example.com",
    "phone": "+7 (999) 123-45-67",
    "avatar_url": "https://...",
    "bio": "Электронный музыкант из Москвы",
    "role": "artist",
    "subscription_tier": "pro",
    "subscription_expires_at": "2024-12-31T23:59:59Z",
    "balance": 5000.00,
    "currency": "RUB",
    "personal_discount_percentage": 10.00,
    "country": "Россия",
    "city": "Москва",
    "social_links": {
      "instagram": "@alexandr.music",
      "vk": "vk.com/alexandr",
      "youtube": "UC..."
    },
    "rating": 4.8,
    "reviews_count": 42,
    "total_campaigns_created": 15,
    "total_orders_completed": 128,
    "email_verified": true,
    "phone_verified": true,
    "created_at": "2023-01-15T10:00:00Z",
    "last_login_at": "2024-02-01T08:30:00Z",
    "statistics": {
      "active_sessions_count": 2,
      "unread_notifications_count": 5,
      "total_transactions_count": 47,
      "total_deposited": 15000.00
    }
  }
}
```

---

### PATCH `/api/users/me`

Обновление профиля

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "Александр Иванов",
  "bio": "Обновленное описание",
  "phone": "+7 (999) 123-45-67",
  "country": "Россия",
  "city": "Санкт-Петербург",
  "social_links": {
    "instagram": "@new.instagram",
    "vk": "vk.com/newpage"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Александр Иванов",
    "bio": "Обновленное описание",
    "updated_at": "2024-02-01T12:00:00Z"
  },
  "message": "Профиль успешно обновлен"
}
```

---

### POST `/api/users/me/avatar`

Загрузка аватара

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
avatar: [file]
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://cdn.promo.music/avatars/123/avatar.jpg"
  },
  "message": "Аватар успешно загружен"
}
```

---

### GET `/api/users/:id`

Получение публичного профиля пользователя

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Александр Иванов",
    "username": "alexandr_music",
    "avatar_url": "https://...",
    "bio": "Электронный музыкант",
    "country": "Россия",
    "city": "Москва",
    "rating": 4.8,
    "reviews_count": 42,
    "total_campaigns_created": 15,
    "total_orders_completed": 128,
    "created_at": "2023-01-15T10:00:00Z"
  }
}
```

---

### GET `/api/users/search`

Поиск пользователей

**Query Parameters:**
- `q` - Поисковый запрос
- `role` - Роль (artist, partner, etc.)
- `country` - Страна
- `subscription_tier` - Уровень подписки
- `limit` - Лимит (default: 20)
- `offset` - Смещение (default: 0)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "name": "Александр Иванов",
        "username": "alexandr_music",
        "avatar_url": "https://...",
        "role": "artist",
        "country": "Россия",
        "rating": 4.8
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

## 🛡️ Администрирование

### GET `/api/admin/users`

Получение списка пользователей (только для админов)

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Query Parameters:**
- `role` - Фильтр по роли
- `status` - Фильтр по статусу
- `subscription_tier` - Фильтр по подписке
- `country` - Фильтр по стране
- `search` - Поиск по имени/email
- `sort_by` - Сортировка
- `limit` - Лимит
- `offset` - Смещение

**Response 200:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Александр Иванов",
        "email": "alexandr@example.com",
        "phone": "+7 (999) 123-45-67",
        "role": "artist",
        "subscription_tier": "pro",
        "balance": 5000.00,
        "status": "active",
        "country": "Россия",
        "city": "Москва",
        "rating": 4.8,
        "total_campaigns_created": 15,
        "created_at": "2023-01-15T10:00:00Z",
        "last_login_at": "2024-02-01T08:30:00Z"
      }
    ],
    "pagination": {
      "total": 1247,
      "limit": 50,
      "offset": 0
    },
    "statistics": {
      "total_users": 1247,
      "active_users": 1100,
      "blocked_users": 23,
      "pending_users": 124,
      "total_balance": 5000000.00
    }
  }
}
```

---

### POST `/api/admin/users`

Создание пользователя админом

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Request Body:**
```json
{
  "name": "Новый Пользователь",
  "email": "newuser@example.com",
  "password": "TempPassword123!",
  "phone": "+7 (999) 000-00-00",
  "role": "artist",
  "subscription_tier": "free",
  "country": "Россия",
  "city": "Москва",
  "balance": 1000.00
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "name": "Новый Пользователь",
    "email": "newuser@example.com",
    "created_at": "2024-02-01T12:00:00Z"
  },
  "message": "Пользователь успешно создан"
}
```

---

### PATCH `/api/admin/users/:id/block`

Блокировка пользователя

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Request Body:**
```json
{
  "reason": "Нарушение правил платформы",
  "blocked_until": "2024-03-01T00:00:00Z"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Пользователь заблокирован"
}
```

---

### PATCH `/api/admin/users/:id/unblock`

Разблокировка пользователя

**Response 200:**
```json
{
  "success": true,
  "message": "Пользователь разблокирован"
}
```

---

### PATCH `/api/admin/users/:id/role`

Изменение роли пользователя

**Request Body:**
```json
{
  "role": "moderator"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "role": "moderator"
  },
  "message": "Роль изменена"
}
```

---

### PATCH `/api/admin/users/:id/subscription`

Изменение подписки

**Request Body:**
```json
{
  "subscription_tier": "premium",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Подписка обновлена"
}
```

---

### POST `/api/admin/users/:id/balance/adjust`

Ручная корректировка баланса

**Request Body:**
```json
{
  "amount": 1000.00,
  "description": "Бонус за активность"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "new_balance": 6000.00,
    "transaction_id": 789
  },
  "message": "Баланс успешно скорректирован"
}
```

---

### POST `/api/admin/users/:id/discount`

Установка персональной скидки

**Request Body:**
```json
{
  "percentage": 15.00,
  "reason": "VIP клиент",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Персональная скидка установлена"
}
```

---

### GET `/api/admin/users/:id/activity-log`

История активности пользователя

**Response 200:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1001,
        "action_type": "login",
        "description": "Пользователь вошел в систему",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-02-01T08:30:00Z"
      },
      {
        "id": 1002,
        "action_type": "balance_changed",
        "description": "Баланс изменен с 4000.00 на 5000.00",
        "old_values": {"balance": 4000.00},
        "new_values": {"balance": 5000.00},
        "created_at": "2024-02-01T10:15:00Z"
      }
    ],
    "pagination": {
      "total": 523,
      "limit": 50,
      "offset": 0
    }
  }
}
```

---

## 💰 Баланс и транзакции

### GET `/api/users/me/balance`

Получение информации о балансе

**Response 200:**
```json
{
  "success": true,
  "data": {
    "balance": 5000.00,
    "currency": "RUB",
    "total_spent": 25000.00,
    "total_earned": 3000.00,
    "referral_earnings": 500.00,
    "pending_transactions": 2
  }
}
```

---

### GET `/api/users/me/transactions`

История транзакций

**Query Parameters:**
- `type` - Тип транзакции
- `status` - Статус
- `limit` - Лимит
- `offset` - Смещение

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 789,
        "uuid": "550e8400-e29b-41d4-a716-446655440001",
        "type": "payment",
        "amount": -500.00,
        "currency": "RUB",
        "balance_before": 5500.00,
        "balance_after": 5000.00,
        "status": "completed",
        "description": "Оплата питчинг-кампании #123",
        "reference_type": "campaign",
        "reference_id": 123,
        "payment_method": "balance",
        "created_at": "2024-02-01T10:00:00Z",
        "completed_at": "2024-02-01T10:00:01Z"
      }
    ],
    "pagination": {
      "total": 47,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### POST `/api/users/me/balance/deposit`

Пополнение баланса

**Request Body:**
```json
{
  "amount": 1000.00,
  "payment_method": "yookassa",
  "return_url": "https://promo.music/payment/success"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transaction_id": 790,
    "payment_url": "https://yookassa.ru/checkout/...",
    "amount": 1000.00
  },
  "message": "Перейдите по ссылке для оплаты"
}
```

---

### POST `/api/users/me/balance/withdraw`

Вывод средств

**Request Body:**
```json
{
  "amount": 500.00,
  "method": "card",
  "card_number": "1234567890123456"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transaction_id": 791,
    "status": "pending",
    "estimated_completion": "2024-02-03T12:00:00Z"
  },
  "message": "Заявка на вывод создана"
}
```

---

## 🔔 Уведомления

### GET `/api/users/me/notifications`

Получение уведомлений

**Query Parameters:**
- `is_read` - Прочитано (true/false)
- `type` - Тип уведомления
- `limit` - Лимит
- `offset` - Смещение

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 5001,
        "uuid": "550e8400-e29b-41d4-a716-446655440002",
        "type": "campaign_update",
        "title": "Обновление кампании",
        "message": "Ваша кампания #123 получила новый отклик",
        "action_url": "/campaigns/123",
        "priority": "high",
        "is_read": false,
        "created_at": "2024-02-01T11:30:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0
    },
    "unread_count": 5
  }
}
```

---

### PATCH `/api/users/me/notifications/:id/read`

Отметить уведомление как прочитанное

**Response 200:**
```json
{
  "success": true,
  "message": "Уведомление отмечено как прочитанное"
}
```

---

### PATCH `/api/users/me/notifications/read-all`

Отметить все уведомления как прочитанные

**Response 200:**
```json
{
  "success": true,
  "data": {
    "marked_count": 5
  },
  "message": "Все уведомления отмечены как прочитанные"
}
```

---

## ⭐ Отзывы и рейтинги

### GET `/api/users/:id/reviews`

Получение отзывов о пользователе

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 101,
        "rating": 5,
        "review_text": "Отличный артист!",
        "pros": "Профессионализм, качество",
        "cons": "",
        "communication_rating": 5,
        "quality_rating": 5,
        "professionalism_rating": 5,
        "timeliness_rating": 4,
        "helpful_count": 12,
        "reviewer": {
          "name": "Иван Петров",
          "avatar_url": "https://..."
        },
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 10,
      "offset": 0
    },
    "summary": {
      "average_rating": 4.8,
      "total_reviews": 42,
      "rating_distribution": {
        "5": 35,
        "4": 5,
        "3": 2,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

---

### POST `/api/users/:id/reviews`

Создание отзыва

**Request Body:**
```json
{
  "order_id": 456,
  "rating": 5,
  "review_text": "Отличная работа!",
  "pros": "Быстро, качественно",
  "cons": "",
  "communication_rating": 5,
  "quality_rating": 5,
  "professionalism_rating": 5,
  "timeliness_rating": 5
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
  "message": "Отзыв успешно создан"
}
```

---

## 📊 Статистика

### GET `/api/admin/users/statistics`

Общая статистика пользователей

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_users": 1247,
    "active_users": 1100,
    "blocked_users": 23,
    "pending_users": 124,
    "verified_users": 980,
    "new_users_30d": 156,
    "active_7d": 523,
    "total_balance": 5000000.00,
    "average_balance": 4008.03,
    "by_role": {
      "artist": 1100,
      "admin": 5,
      "partner": 142
    },
    "by_subscription": {
      "free": 800,
      "basic": 200,
      "pro": 200,
      "premium": 47
    },
    "by_country": {
      "Россия": 950,
      "Украина": 150,
      "Беларусь": 80
    }
  }
}
```

---

### GET `/api/admin/users/analytics/registrations`

Аналитика регистраций

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
        "registrations": 15,
        "verified": 12
      },
      {
        "date": "2024-01-02",
        "registrations": 22,
        "verified": 18
      }
    ],
    "summary": {
      "total_registrations": 450,
      "total_verified": 380,
      "verification_rate": 84.44
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
| 404 | Not Found - Не найдено |
| 409 | Conflict - Конфликт данных |
| 422 | Unprocessable Entity - Ошибка валидации |
| 429 | Too Many Requests - Превышен лимит запросов |
| 500 | Internal Server Error - Внутренняя ошибка |

**Формат ошибки:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные",
    "details": {
      "email": "Email уже используется",
      "phone": "Некорректный формат телефона"
    }
  }
}
```

---

## 📝 Примечания

1. Все даты в формате ISO 8601 (UTC)
2. Токены имеют срок действия 7 дней
3. Refresh токен используется для обновления access токена
4. Rate limit: 100 запросов в минуту для обычных пользователей, 1000 для админов
5. Все суммы в копейках (для RUB - в рублях с 2 знаками после запятой)
