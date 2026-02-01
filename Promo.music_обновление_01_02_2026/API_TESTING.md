# 🧪 API TESTING GUIDE

Примеры запросов к API после деплоя

---

## 🔗 BASE URL

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125
```

Замените `YOUR_PROJECT_ID` на ваш project ID из Supabase Dashboard.

---

## 🔐 АВТОРИЗАЦИЯ

Все запросы требуют header:
```
Authorization: Bearer YOUR_ANON_KEY
```

---

## 💰 PAYMENTS API

### 1. Получить баланс пользователя
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/balance/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "balance": 125430.00,
    "available_balance": 115430.00,
    "pending_balance": 10000.00,
    "total_income": 116750.00,
    "total_expense": 10490.00,
    "total_withdrawn": 0.00
  }
}
```

### 2. Получить транзакции
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/transactions/artist_demo_001?limit=10" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Параметры:**
- `limit` - кол-во транзакций (по умолчанию 50)
- `offset` - смещение для пагинации
- `type` - фильтр по типу (income/expense/withdraw)
- `category` - фильтр по категории

### 3. Создать транзакцию (донат)
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/transaction" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "type": "income",
    "category": "donate",
    "amount": 500,
    "description": "Донат от фаната",
    "from_name": "Иван Петров",
    "from_email": "ivan@example.com",
    "message": "Спасибо за музыку!",
    "payment_method": "card"
  }'
```

### 4. Заявка на вывод средств
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/withdraw" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "amount": 5000,
    "payment_method_id": "PM-20260127-0001"
  }'
```

### 5. Получить методы оплаты
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/methods/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 6. Добавить метод оплаты
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/method" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "type": "card",
    "card_number_masked": "4532 **** **** 1234",
    "card_holder": "IVAN PETROV",
    "card_expires": "12/27",
    "card_brand": "visa",
    "is_default": false
  }'
```

### 7. Получить статистику
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/stats/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🎪 BANNER ADS API

### 1. Получить список баннеров
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/banner/list/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Создать баннер
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/banner/submit" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "user_email": "artist@example.com",
    "banner_type": "hero",
    "title": "Новый альбом 2026",
    "description": "Слушайте мой новый альбом",
    "image_url": "https://example.com/banner.jpg",
    "link_url": "https://music.apple.com/album/123",
    "duration_days": 7,
    "placement": "homepage"
  }'
```

### 3. Обновить баннер
```bash
curl -X PUT \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/banner/BA-20260127-0001" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Обновлённый заголовок",
    "status": "active"
  }'
```

### 4. Удалить баннер
```bash
curl -X DELETE \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/banner/BA-20260127-0001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🎤 CONCERTS API

### 1. Получить концерты
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/concerts/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Создать концерт
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/concerts" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "title": "Summer Fest 2026",
    "date": "2026-07-15",
    "time": "20:00",
    "city": "Москва",
    "venue": "Олимпийский",
    "type": "festival",
    "description": "Летний фестиваль",
    "ticket_price_from": 2000,
    "ticket_price_to": 5000,
    "ticket_link": "https://tickets.com/summer-fest"
  }'
```

---

## 🔔 NOTIFICATIONS API

### 1. Получить уведомления
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/notifications-messenger/user/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Отметить как прочитанное
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/notifications-messenger/mark-read" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": "NOT-001",
    "user_id": "artist_demo_001"
  }'
```

### 3. Получить conversations
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/notifications-messenger/conversations/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 👑 SUBSCRIPTIONS API

### 1. Получить подписку
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/subscriptions/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. Оформить подписку
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/subscriptions/subscribe" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "tier": "pro",
    "payment_method_id": "PM-20260127-0001"
  }'
```

### 3. Отменить подписку
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/subscriptions/cancel" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001"
  }'
```

---

## 🎯 PROMOTION API (Pitching)

### 1. Отправить трек на питчинг
```bash
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/promotion/pitching/submit" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "track_title": "Summer Vibes",
    "artist_name": "DJ Alex",
    "genre": "House",
    "audio_url": "https://storage.supabase.co/track.mp3",
    "cover_url": "https://storage.supabase.co/cover.jpg",
    "target_radios": ["energy", "record", "maximum"],
    "budget": 1500
  }'
```

### 2. Получить историю питчинга
```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/promotion/pitching/artist_demo_001" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🏥 HEALTH CHECK

```bash
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T12:00:00.000Z"
}
```

---

## 🧪 POSTMAN COLLECTION

Импортируйте в Postman для быстрого тестирования:

```json
{
  "info": {
    "name": "Promo.Music API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125"
    },
    {
      "key": "anon_key",
      "value": "YOUR_ANON_KEY"
    }
  ]
}
```

---

## 📊 RESPONSE CODES

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Нет прав доступа
- `404` - Не найдено
- `500` - Ошибка сервера

---

## 🎉 ГОТОВО!

Теперь можно тестировать все API endpoints! 

Для более подробной документации смотрите код в `/supabase/functions/server/`.
