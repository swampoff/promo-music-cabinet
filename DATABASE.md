# 🗄️ Структура базы данных promo.music

## 📌 Архитектура

В **Figma Make** используется **Key-Value Store** на базе Supabase PostgreSQL.

Вместо традиционных SQL таблиц, все данные хранятся в одной таблице `kv_store_84730125` по принципу ключ-значение:

```
┌──────────────────────────────┬────────────────────┐
│ key (TEXT, PRIMARY KEY)      │ value (TEXT)       │
├──────────────────────────────┼────────────────────┤
│ track:user-123:track-1       │ {"id":"track-1"...}│
│ profile:user-123             │ {"name":"..."...}  │
│ coins:balance:user-123       │ "5000"             │
└──────────────────────────────┴────────────────────┘
```

### ✅ Преимущества KV Store:

- **Гибкость**: Не требуется создавать миграции и схемы
- **Простота**: Нет необходимости в DDL statements
- **Прототипирование**: Идеально для быстрой разработки
- **Масштабируемость**: Легко добавлять новые типы данных

### 🔑 Формат ключей:

```
{entity_type}:{user_id}:{entity_id}
```

Примеры:
```
track:demo-user:1706184123456-abc123
concert:demo-user:1706184200000-xyz789
coins:balance:demo-user
```

---

## 📊 Структура данных по сущностям

### 1️⃣ TRACKS (Треки)

**Key format**: `track:{userId}:{trackId}`

**Value (JSON)**:
```json
{
  "id": "1706184123456-abc123",
  "title": "Midnight Dreams",
  "artist": "Александр Иванов",
  "album": "Summer Nights",
  "genre": "Electronic",
  "duration": 245,
  "coverUrl": "https://example.com/cover.jpg",
  "audioUrl": "https://example.com/track.mp3",
  "plays": 12500,
  "likes": 340,
  "downloads": 120,
  "createdAt": "2024-01-25T10:00:00.000Z",
  "updatedAt": "2024-01-25T10:00:00.000Z",
  "userId": "demo-user"
}
```

**Операции**:
```typescript
// Создать
await kv.set(`track:${userId}:${trackId}`, JSON.stringify(track));

// Получить все треки пользователя
const tracks = await kv.getByPrefix(`track:${userId}:`);

// Получить один трек
const track = await kv.get(`track:${userId}:${trackId}`);

// Удалить
await kv.del(`track:${userId}:${trackId}`);
```

---

### 2️⃣ ANALYTICS (Аналитика треков)

**Key format**: `analytics:{userId}:track:{trackId}`

**Value (JSON)**:
```json
{
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
```

**Пример**:
```typescript
const analyticsKey = `analytics:${userId}:track:${trackId}`;
const analytics = await kv.get(analyticsKey);

// Увеличить счетчик прослушиваний
const data = JSON.parse(analytics);
data.plays += 1;
await kv.set(analyticsKey, JSON.stringify(data));
```

---

### 3️⃣ CONCERTS (Концерты)

**Key format**: `concert:{userId}:{concertId}`

**Value (JSON)**:
```json
{
  "id": "1706184123456-concert1",
  "title": "Summer Electronic Festival 2024",
  "venue": "Парк Горького",
  "city": "Москва",
  "date": "2024-07-15",
  "time": "20:00",
  "ticketPrice": 2500,
  "ticketUrl": "https://tickets.com/123",
  "imageUrl": "https://example.com/concert.jpg",
  "description": "Грандиозный летний фестиваль",
  "userId": "demo-user",
  "createdAt": "2024-01-25T10:00:00.000Z",
  "updatedAt": "2024-01-25T10:00:00.000Z"
}
```

---

### 4️⃣ VIDEOS (Видео)

**Key format**: `video:{userId}:{videoId}`

**Value (JSON)**:
```json
{
  "id": "1706184123456-video1",
  "title": "Official Music Video",
  "description": "Official video for Midnight Dreams",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "videoUrl": "https://youtube.com/watch?v=...",
  "duration": 245,
  "views": 15000,
  "likes": 850,
  "userId": "demo-user",
  "createdAt": "2024-01-25T10:00:00.000Z",
  "updatedAt": "2024-01-25T10:00:00.000Z"
}
```

---

### 5️⃣ NEWS (Новости)

**Key format**: `news:{userId}:{newsId}`

**Value (JSON)**:
```json
{
  "id": "1706184123456-news1",
  "title": "Новый альбом уже доступен!",
  "content": "Рад представить вам мой новый альбом...",
  "imageUrl": "https://example.com/news.jpg",
  "likes": 234,
  "comments": 56,
  "userId": "demo-user",
  "createdAt": "2024-01-25T10:00:00.000Z",
  "updatedAt": "2024-01-25T10:00:00.000Z"
}
```

---

### 6️⃣ DONATIONS (Донаты)

**Key format**: `donation:{artistId}:{donationId}`

**Value (JSON)**:
```json
{
  "id": "1706184123456-donation1",
  "donorName": "Иван Петров",
  "amount": 500,
  "message": "Спасибо за музыку!",
  "artistId": "demo-user",
  "createdAt": "2024-01-25T10:00:00.000Z",
  "status": "completed"
}
```

---

### 7️⃣ COINS - Balance (Баланс коинов)

**Key format**: `coins:balance:{userId}`

**Value (String - число)**:
```
"5000"
```

**Пример**:
```typescript
// Получить баланс
const balance = await kv.get(`coins:balance:${userId}`);
const balanceInt = balance ? parseInt(balance) : 0;

// Обновить баланс
const newBalance = balanceInt + 1000;
await kv.set(`coins:balance:${userId}`, String(newBalance));
```

---

### 8️⃣ COINS - Transactions (Транзакции коинов)

**Key format**: `coins:tx:{userId}:{transactionId}`

**Value (JSON)**:
```json
{
  "id": "1706184123456-tx1",
  "userId": "demo-user",
  "amount": 1000,
  "type": "purchase",
  "description": "Купил 1000 коинов",
  "createdAt": "2024-01-25T10:00:00.000Z"
}
```

**Типы транзакций**:
- `purchase` - Покупка коинов (положительная сумма)
- `spend` - Трата коинов (отрицательная сумма)
- `reward` - Награда/бонус (положительная сумма)

---

### 9️⃣ PROFILE (Профиль пользователя)

**Key format**: `profile:{userId}`

**Value (JSON)**:
```json
{
  "userId": "demo-user",
  "name": "Александр Иванов",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Российский музыкант, продюсер электронной музыки",
  "subscribers": 12500,
  "totalPlays": 450000,
  "totalTracks": 35,
  "updatedAt": "2024-01-25T10:00:00.000Z"
}
```

---

## 🔍 Примеры запросов

### Получить все треки пользователя

```typescript
import * as kv from './kv_store.tsx';

const userId = 'demo-user';
const tracksRaw = await kv.getByPrefix(`track:${userId}:`);
const tracks = tracksRaw.map(t => JSON.parse(t));

console.log(`Найдено треков: ${tracks.length}`);
```

### Создать новый трек

```typescript
const trackId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const track = {
  id: trackId,
  title: 'New Song',
  artist: 'Artist Name',
  plays: 0,
  likes: 0,
  downloads: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId
};

const key = `track:${userId}:${trackId}`;
await kv.set(key, JSON.stringify(track));
```

### Обновить счетчик прослушиваний

```typescript
const trackKey = `track:${userId}:${trackId}`;
const trackData = await kv.get(trackKey);

if (trackData) {
  const track = JSON.parse(trackData);
  track.plays += 1;
  track.updatedAt = new Date().toISOString();
  
  await kv.set(trackKey, JSON.stringify(track));
}
```

### Удалить трек

```typescript
await kv.del(`track:${userId}:${trackId}`);
```

### Получить статистику дашборда

```typescript
// Получить все треки
const tracks = await kv.getByPrefix(`track:${userId}:`);

// Посчитать суммы
let totalPlays = 0;
let totalLikes = 0;

tracks.forEach(trackStr => {
  const track = JSON.parse(trackStr);
  totalPlays += track.plays || 0;
  totalLikes += track.likes || 0;
});

// Получить баланс коинов
const balance = await kv.get(`coins:balance:${userId}`);
const coinsBalance = balance ? parseInt(balance) : 0;

const stats = {
  totalPlays,
  totalLikes,
  tracksCount: tracks.length,
  coinsBalance
};
```

---

## 📐 Схема ключей (Key Schema)

```
promo-music/
├── track:{userId}:{trackId}               # Треки
├── analytics:{userId}:track:{trackId}     # Аналитика
├── concert:{userId}:{concertId}           # Концерты
├── video:{userId}:{videoId}               # Видео
├── news:{userId}:{newsId}                 # Новости
├── donation:{userId}:{donationId}         # Донаты
├── coins:balance:{userId}                 # Баланс коинов
├── coins:tx:{userId}:{transactionId}      # Транзакции коинов
└── profile:{userId}                       # Профиль пользователя
```

---

## 🔐 User Isolation

Все данные изолированы по `userId`:

```typescript
// User A
track:user-a:track-1
track:user-a:track-2

// User B  
track:user-b:track-1
track:user-b:track-2
```

Пользователи не могут видеть данные друг друга благодаря префиксам ключей.

---

## ⚡ KV Store API

Доступные функции в `/supabase/functions/server/kv_store.tsx`:

### `get(key: string): Promise<string | null>`

Получить значение по ключу.

```typescript
const value = await kv.get('track:user-123:track-1');
```

### `set(key: string, value: string): Promise<void>`

Установить значение.

```typescript
await kv.set('profile:user-123', JSON.stringify(profile));
```

### `del(key: string): Promise<void>`

Удалить значение.

```typescript
await kv.del('track:user-123:track-1');
```

### `mget(keys: string[]): Promise<(string | null)[]>`

Получить несколько значений.

```typescript
const values = await kv.mget([
  'track:user-123:track-1',
  'track:user-123:track-2'
]);
```

### `mset(entries: [string, string][]): Promise<void>`

Установить несколько значений.

```typescript
await kv.mset([
  ['track:user-123:track-1', JSON.stringify(track1)],
  ['track:user-123:track-2', JSON.stringify(track2)]
]);
```

### `mdel(keys: string[]): Promise<void>`

Удалить несколько значений.

```typescript
await kv.mdel([
  'track:user-123:track-1',
  'track:user-123:track-2'
]);
```

### `getByPrefix(prefix: string): Promise<string[]>`

Получить все значения с определенным префиксом.

```typescript
// Получить все треки пользователя
const tracks = await kv.getByPrefix('track:user-123:');
```

---

## 🎯 Best Practices

### 1. Всегда используйте префиксы с userId

```typescript
// ✅ Правильно
const key = `track:${userId}:${trackId}`;

// ❌ Неправильно
const key = `track:${trackId}`; // Нет изоляции пользователей
```

### 2. Храните JSON как строки

```typescript
// ✅ Правильно
await kv.set(key, JSON.stringify(data));
const value = await kv.get(key);
const data = JSON.parse(value);

// ❌ Неправильно
await kv.set(key, data); // Объекты нельзя хранить напрямую
```

### 3. Используйте timestamp для ID

```typescript
// ✅ Уникальный ID
const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// Например: "1706184123456-abc123xyz"

// ❌ Может быть коллизия
const id = Math.random().toString();
```

### 4. Обрабатывайте null значения

```typescript
// ✅ Правильно
const value = await kv.get(key);
if (!value) {
  return { error: 'Not found' };
}
const data = JSON.parse(value);

// ❌ Неправильно
const value = await kv.get(key);
const data = JSON.parse(value); // Может быть null
```

### 5. Используйте getByPrefix для списков

```typescript
// ✅ Эффективно
const tracks = await kv.getByPrefix(`track:${userId}:`);

// ❌ Неэффективно - нет list функции
// const tracks = await kv.list(); // НЕ СУЩЕСТВУЕТ
```

---

## 🚀 Миграция на реляционную БД (опционально)

Если в будущем потребуется перейти на традиционные SQL таблицы:

### SQL Schema для PostgreSQL

```sql
-- Треки
CREATE TABLE tracks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  genre TEXT,
  duration INTEGER,
  cover_url TEXT,
  audio_url TEXT,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Аналитика
CREATE TABLE track_analytics (
  track_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);

-- Концерты
CREATE TABLE concerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  venue TEXT,
  city TEXT,
  date DATE,
  time TIME,
  ticket_price DECIMAL,
  ticket_url TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- И так далее...
```

### Скрипт миграции KV → SQL

```typescript
async function migrateToSQL() {
  // Получить все треки из KV
  const tracksKV = await kv.getByPrefix('track:');
  
  // Вставить в SQL
  for (const trackStr of tracksKV) {
    const track = JSON.parse(trackStr);
    
    await supabase
      .from('tracks')
      .insert(track);
  }
}
```

---

## 📝 Резюме

✅ **KV Store** - гибкое решение для прототипирования  
✅ Все данные изолированы по пользователям  
✅ Простые CRUD операции через `kv_store.tsx`  
✅ Не требуется создавать миграции  
✅ Легко масштабируется  

**Идеально для Figma Make и быстрой разработки! 🚀**
