# 📡 API Документация promo.music

## 🎯 Базовая информация

**Base URL**: `https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-84730125/api`

**Authentication**: Bearer token (Supabase Anon Key)

**User Identification**: Header `X-User-Id` (по умолчанию: `demo-user`)

---

## 🔑 Заголовки запросов

```http
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
X-User-Id: user-123
```

---

## 📊 Стандартные ответы

### Успешный ответ

```json
{
  "success": true,
  "data": { ... }
}
```

### Ошибка

```json
{
  "success": false,
  "error": "Error description"
}
```

---

## 🎵 TRACKS API

### GET /tracks

Получить все треки текущего пользователя.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1706184123456-abc123",
      "title": "Midnight Dreams",
      "artist": "John Doe",
      "album": "Summer Vibes",
      "genre": "Electronic",
      "duration": 245,
      "coverUrl": "https://...",
      "audioUrl": "https://...",
      "plays": 12500,
      "likes": 340,
      "downloads": 120,
      "createdAt": "2024-01-25T10:00:00.000Z",
      "updatedAt": "2024-01-25T10:00:00.000Z",
      "userId": "demo-user"
    }
  ]
}
```

---

### GET /tracks/:id

Получить трек по ID.

**Parameters:**
- `id` (path) - ID трека

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-abc123",
    "title": "Midnight Dreams",
    ...
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "error": "Track not found"
}
```

---

### POST /tracks

Создать новый трек.

**Body:**

```json
{
  "title": "My New Song",
  "artist": "Artist Name",
  "album": "Album Name",
  "genre": "Pop",
  "duration": 180,
  "coverUrl": "https://example.com/cover.jpg",
  "audioUrl": "https://example.com/track.mp3"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-xyz789",
    "title": "My New Song",
    "artist": "Artist Name",
    "album": "Album Name",
    "genre": "Pop",
    "duration": 180,
    "coverUrl": "https://example.com/cover.jpg",
    "audioUrl": "https://example.com/track.mp3",
    "plays": 0,
    "likes": 0,
    "downloads": 0,
    "createdAt": "2024-01-25T12:00:00.000Z",
    "updatedAt": "2024-01-25T12:00:00.000Z",
    "userId": "demo-user"
  }
}
```

---

### PUT /tracks/:id

Обновить трек.

**Parameters:**
- `id` (path) - ID трека

**Body:**

```json
{
  "title": "Updated Title",
  "genre": "Rock"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-abc123",
    "title": "Updated Title",
    "genre": "Rock",
    "updatedAt": "2024-01-25T13:00:00.000Z",
    ...
  }
}
```

---

### DELETE /tracks/:id

Удалить трек.

**Parameters:**
- `id` (path) - ID трека

**Response:**

```json
{
  "success": true
}
```

---

## 📈 ANALYTICS API

### GET /analytics/track/:id

Получить аналитику трека.

**Parameters:**
- `id` (path) - ID трека

**Response:**

```json
{
  "success": true,
  "data": {
    "trackId": "1706184123456-abc123",
    "plays": 12500,
    "likes": 340,
    "downloads": 120,
    "shares": 45,
    "comments": 23,
    "dailyStats": [
      {
        "date": "2024-01-25",
        "plays": 1250,
        "likes": 34
      }
    ]
  }
}
```

---

### POST /analytics/track/:id/play

Записать прослушивание трека.

**Parameters:**
- `id` (path) - ID трека

**Response:**

```json
{
  "success": true,
  "data": {
    "trackId": "1706184123456-abc123",
    "plays": 12501,
    ...
  }
}
```

---

## 🎤 CONCERTS API

### GET /concerts

Получить все концерты.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1706184123456-concert1",
      "title": "Summer Tour 2024",
      "venue": "Madison Square Garden",
      "city": "New York",
      "date": "2024-07-15",
      "time": "20:00",
      "ticketPrice": 5000,
      "ticketUrl": "https://tickets.com/123",
      "imageUrl": "https://...",
      "description": "Epic summer concert",
      "userId": "demo-user",
      "createdAt": "2024-01-25T10:00:00.000Z",
      "updatedAt": "2024-01-25T10:00:00.000Z"
    }
  ]
}
```

---

### POST /concerts

Создать концерт.

**Body:**

```json
{
  "title": "Winter Tour 2024",
  "venue": "Arena Moscow",
  "city": "Moscow",
  "date": "2024-12-20",
  "time": "19:00",
  "ticketPrice": 3000,
  "ticketUrl": "https://...",
  "imageUrl": "https://...",
  "description": "Exclusive winter show"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-concert2",
    ...
  }
}
```

---

## 🎬 VIDEOS API

### GET /videos

Получить все видео.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1706184123456-video1",
      "title": "Official Music Video",
      "description": "Official video for Midnight Dreams",
      "thumbnailUrl": "https://...",
      "videoUrl": "https://youtube.com/watch?v=...",
      "duration": 245,
      "views": 15000,
      "likes": 850,
      "userId": "demo-user",
      "createdAt": "2024-01-25T10:00:00.000Z",
      "updatedAt": "2024-01-25T10:00:00.000Z"
    }
  ]
}
```

---

### POST /videos

Создать видео.

**Body:**

```json
{
  "title": "Behind the Scenes",
  "description": "Making of the new album",
  "thumbnailUrl": "https://...",
  "videoUrl": "https://youtube.com/...",
  "duration": 360
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-video2",
    "views": 0,
    "likes": 0,
    ...
  }
}
```

---

## 📰 NEWS API

### GET /news

Получить все новости.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1706184123456-news1",
      "title": "New Album Released!",
      "content": "We're excited to announce...",
      "imageUrl": "https://...",
      "likes": 234,
      "comments": 56,
      "userId": "demo-user",
      "createdAt": "2024-01-25T10:00:00.000Z",
      "updatedAt": "2024-01-25T10:00:00.000Z"
    }
  ]
}
```

---

### POST /news

Создать новость.

**Body:**

```json
{
  "title": "Tour Announcement",
  "content": "Join us on our world tour...",
  "imageUrl": "https://..."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-news2",
    "likes": 0,
    "comments": 0,
    ...
  }
}
```

---

## 💰 DONATIONS API

### GET /donations

Получить все донаты.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1706184123456-donation1",
      "donorName": "Иван Петров",
      "amount": 500,
      "message": "Спасибо за музыку!",
      "artistId": "demo-user",
      "createdAt": "2024-01-25T10:00:00.000Z",
      "status": "completed"
    }
  ]
}
```

---

### POST /donations

Создать донат.

**Body:**

```json
{
  "donorName": "Maria Ivanova",
  "amount": 1000,
  "message": "Love your music!"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "1706184123456-donation2",
    "status": "completed",
    ...
  }
}
```

---

## 🪙 COINS API

### GET /coins/balance

Получить баланс коинов.

**Response:**

```json
{
  "success": true,
  "data": {
    "balance": 5000,
    "userId": "demo-user"
  }
}
```

---

### GET /coins/transactions

Получить историю транзакций.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1706184123456-tx1",
      "userId": "demo-user",
      "amount": 1000,
      "type": "purchase",
      "description": "Купил 1000 коинов",
      "createdAt": "2024-01-25T10:00:00.000Z"
    },
    {
      "id": "1706184123456-tx2",
      "userId": "demo-user",
      "amount": -500,
      "type": "spend",
      "description": "Продвижение трека",
      "createdAt": "2024-01-25T11:00:00.000Z"
    }
  ]
}
```

---

### POST /coins/transactions

Добавить транзакцию (покупка/трата коинов).

**Body:**

```json
{
  "amount": 2000,
  "type": "purchase",
  "description": "Купил пакет на 2000 коинов"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "1706184123456-tx3",
      "userId": "demo-user",
      "amount": 2000,
      "type": "purchase",
      "description": "Купил пакет на 2000 коинов",
      "createdAt": "2024-01-25T12:00:00.000Z"
    },
    "balance": 6500
  }
}
```

**Типы транзакций:**
- `purchase` - покупка коинов (положительная сумма)
- `spend` - трата коинов (отрицательная сумма)
- `reward` - награда/бонус (положительная сумма)

---

## 👤 PROFILE API

### GET /profile

Получить профиль пользователя.

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "demo-user",
    "name": "John Doe",
    "avatar": "https://...",
    "bio": "Electronic music producer",
    "subscribers": 12500,
    "totalPlays": 450000,
    "totalTracks": 35,
    "updatedAt": "2024-01-25T10:00:00.000Z"
  }
}
```

---

### PUT /profile

Обновить профиль.

**Body:**

```json
{
  "name": "John Doe Jr.",
  "bio": "Award-winning producer",
  "avatar": "https://new-avatar.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "demo-user",
    "name": "John Doe Jr.",
    "bio": "Award-winning producer",
    "avatar": "https://new-avatar.jpg",
    "updatedAt": "2024-01-25T13:00:00.000Z",
    ...
  }
}
```

---

## 📊 STATS API

### GET /stats/dashboard

Получить общую статистику для дашборда.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPlays": 450000,
    "totalLikes": 12500,
    "totalDownloads": 5600,
    "tracksCount": 35,
    "coinsBalance": 5000,
    "donationsCount": 234,
    "totalDonations": 125000,
    "updatedAt": "2024-01-25T12:00:00.000Z"
  }
}
```

**Описание полей:**
- `totalPlays` - общее количество прослушиваний всех треков
- `totalLikes` - общее количество лайков
- `totalDownloads` - общее количество скачиваний
- `tracksCount` - количество треков пользователя
- `coinsBalance` - текущий баланс коинов
- `donationsCount` - количество донатов
- `totalDonations` - сумма всех донатов в рублях

---

## 🏥 HEALTH CHECK

### GET /health

Проверка работоспособности API.

**URL**: `https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-84730125/health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-25T12:00:00.000Z"
}
```

---

## 💡 Примеры использования

### JavaScript/TypeScript

```typescript
import { tracksApi, statsApi } from '@/utils/api';

// Получить все треки
const { success, data, error } = await tracksApi.getAll();
if (success) {
  console.log('Треки:', data);
}

// Создать трек
const newTrack = await tracksApi.create({
  title: 'Summer Nights',
  artist: 'DJ Mix',
  genre: 'House',
  duration: 300
});

// Получить статистику
const stats = await statsApi.getDashboard();
console.log('Всего прослушиваний:', stats.data.totalPlays);
```

---

### cURL

```bash
# Получить все треки
curl -X GET \
  'https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-84730125/api/tracks' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'X-User-Id: demo-user'

# Создать трек
curl -X POST \
  'https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-84730125/api/tracks' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'X-User-Id: demo-user' \
  -d '{
    "title": "New Track",
    "artist": "Artist Name",
    "genre": "Pop",
    "duration": 180
  }'

# Записать прослушивание
curl -X POST \
  'https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-84730125/api/analytics/track/TRACK_ID/play' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'X-User-Id: demo-user'
```

---

### Python

```python
import requests

BASE_URL = "https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-84730125/api"
HEADERS = {
    "Authorization": "Bearer YOUR_ANON_KEY",
    "X-User-Id": "demo-user",
    "Content-Type": "application/json"
}

# Получить треки
response = requests.get(f"{BASE_URL}/tracks", headers=HEADERS)
tracks = response.json()
print(tracks)

# Создать донат
donation_data = {
    "donorName": "Петр Сидоров",
    "amount": 1500,
    "message": "За отличную музыку!"
}
response = requests.post(
    f"{BASE_URL}/donations", 
    headers=HEADERS, 
    json=donation_data
)
print(response.json())
```

---

## ⚠️ Rate Limiting

В текущей версии rate limiting не установлен. Для production рекомендуется:

- Макс 100 запросов в минуту на IP
- Макс 1000 запросов в час на пользователя

---

## 🔐 Безопасность

### CORS

По умолчанию разрешены запросы с любых источников (`origin: "*"`).

Для production ограничьте:

```typescript
origin: "https://promo-music.vercel.app"
```

### User ID

Header `X-User-Id` используется для разделения данных между пользователями.

В production интегрируйте Supabase Auth для реальной аутентификации.

---

## 📝 Changelog

### v1.0.0 (2024-01-25)

- ✅ Tracks API
- ✅ Analytics API
- ✅ Concerts API
- ✅ Videos API
- ✅ News API
- ✅ Donations API
- ✅ Coins API
- ✅ Profile API
- ✅ Stats API
- ✅ Health check

---

## 🆘 Поддержка

При возникновении проблем проверьте:

1. ✅ Правильность API ключей
2. ✅ Формат заголовков запросов
3. ✅ Логи в Supabase Dashboard → Edge Functions
4. ✅ Network tab в DevTools браузера

---

**Готово! 🎉 API полностью документирован и готов к использованию!**
