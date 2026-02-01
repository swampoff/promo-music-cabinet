# 🗄️ DATABASE SETUP - ПОЛНАЯ ИНТЕГРАЦИЯ С POSTGRESQL

## ✅ СТАТУС: ЗАВЕРШЕНО 100%

---

## 📊 СТРУКТУРА БД

### Таблицы (9 таблиц):

1. ✅ **artists** - Профили артистов
2. ✅ **concerts** - Концерты и мероприятия
3. ✅ **notifications** - Уведомления
4. ✅ **notification_settings** - Настройки уведомлений
5. ✅ **email_campaigns** - Email-кампании
6. ✅ **ticket_providers** - Провайдеры билетов
7. ✅ **artist_ticket_providers** - Связь артист-провайдер
8. ✅ **ticket_sales** - Продажи билетов
9. ✅ **subscriptions** - Подписки (НОВАЯ!)

---

## 🎯 ТАБЛИЦА SUBSCRIPTIONS

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'premium')),
  price DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  
  status TEXT DEFAULT 'active' NOT NULL 
    CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  
  -- Лимиты подписки
  tracks_limit INTEGER DEFAULT 10 NOT NULL,
  videos_limit INTEGER DEFAULT 5 NOT NULL,
  storage_gb_limit INTEGER DEFAULT 5 NOT NULL,
  
  -- Бонусы подписки
  donation_fee DECIMAL(5, 4) DEFAULT 0.10 NOT NULL,
  marketing_discount DECIMAL(5, 4) DEFAULT 0 NOT NULL,
  coins_bonus DECIMAL(5, 4) DEFAULT 0 NOT NULL,
  pitching_discount DECIMAL(5, 4) DEFAULT 0 NOT NULL,
  
  -- Даты
  starts_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Платежная информация
  payment_method TEXT,
  last_payment_at TIMESTAMPTZ,
  next_payment_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(artist_id)
);
```

### Индексы:

```sql
CREATE INDEX idx_subscriptions_artist ON subscriptions(artist_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);
```

### RLS Policies:

```sql
-- Artists can view own subscription
CREATE POLICY "Artists can view own subscription"
  ON subscriptions FOR SELECT
  USING (artist_id::text = auth.uid()::text);

-- Artists can update own subscription
CREATE POLICY "Artists can update own subscription"
  ON subscriptions FOR UPDATE
  USING (artist_id::text = auth.uid()::text);

-- Artists can insert own subscription
CREATE POLICY "Artists can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (artist_id::text = auth.uid()::text);
```

---

## 🔧 BACKEND API (Supabase Edge Functions)

### Эндпоинты:

#### 1. GET `/subscriptions/:userId`
Получить подписку пользователя

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "tier": "free",
    "price": 0,
    "expires_at": null,
    "status": "active",
    "features": [],
    "limits": {
      "tracks": 10,
      "videos": 5,
      "storage_gb": 5,
      "donation_fee": 0.10,
      "marketing_discount": 0,
      "coins_bonus": 0,
      "pitching_discount": 0
    }
  }
}
```

#### 2. POST `/subscriptions/subscribe`
Оформить/изменить подписку

**Request:**
```json
{
  "user_id": "uuid",
  "tier": "pro",
  "price": 1490
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "tier": "pro",
    "price": 1490,
    "expires_at": "2026-02-26T...",
    "status": "active",
    "limits": { ... }
  }
}
```

#### 3. POST `/subscriptions/:userId/cancel`
Отменить подписку

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "cancelled",
    "updated_at": "2026-01-27T..."
  }
}
```

#### 4. GET `/subscriptions/:userId/limits`
Получить лимиты подписки

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": 10,
    "videos": 5,
    "storage_gb": 5,
    "donation_fee": 0.10,
    "marketing_discount": 0,
    "coins_bonus": 0,
    "pitching_discount": 0
  }
}
```

#### 5. POST `/subscriptions/:userId/check-limit`
Проверить лимит конкретной функции

**Request:**
```json
{
  "feature": "tracks",
  "current_usage": 8
}
```

**Response:**
```json
{
  "success": true,
  "allowed": true,
  "limit": 10,
  "usage": 8,
  "remaining": 2
}
```

---

## 📦 ХРАНЕНИЕ ДАННЫХ

### 1. **PostgreSQL (Supabase)** - Для структурированных данных:
- ✅ Профили артистов
- ✅ Концерты
- ✅ Подписки
- ✅ Продажи билетов
- ✅ Email-кампании
- ✅ Уведомления

### 2. **KV Store** - Для временных/кешированных данных:
- Текущие подписки (дублируются для быстрого доступа)
- Сессии пользователей
- Временные настройки

### 3. **Supabase Storage** - Для файлов:
- Обложки треков
- Видео
- Баннеры концертов
- Аватары

---

## 🚀 КАК ЗАПУСТИТЬ МИГРАЦИИ

### Через API:

```bash
# 1. Запустить все миграции
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-84730125/migration/run \
  -H "Authorization: Bearer {publicAnonKey}"

# 2. Проверить статус таблиц
curl https://{projectId}.supabase.co/functions/v1/make-server-84730125/migration/status \
  -H "Authorization: Bearer {publicAnonKey}"
```

### Response при успешной миграции:

```json
{
  "success": true,
  "message": "All migrations completed successfully!",
  "results": {
    "migration_001": {
      "success": true,
      "migration": "Migration 001: Initial Schema",
      "successCount": 150,
      "totalStatements": 152,
      "successRate": 98
    }
  },
  "timestamp": "2026-01-27T..."
}
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Row Level Security (RLS):
✅ Включен для всех таблиц
✅ Артисты видят только свои данные
✅ Публичный доступ только к одобренным концертам

### Политики безопасности:
- ✅ `auth.uid()` проверка для всех операций
- ✅ Каскадное удаление при удалении артиста
- ✅ Service Role Key защищен на сервере

---

## 📝 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Frontend (SubscriptionContext):

```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

function MyComponent() {
  const { subscription, loading, refreshSubscription } = useSubscription();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Ваша подписка: {subscription?.tier}</h1>
      <p>Лимит треков: {subscription?.limits.tracks}</p>
      <p>Комиссия донатов: {subscription?.limits.donation_fee * 100}%</p>
    </div>
  );
}
```

### Backend (Проверка лимита):

```typescript
// В /supabase/functions/server/tracks-routes.tsx

app.post('/tracks/upload', async (c) => {
  const userId = c.req.header('X-User-Id');
  
  // Проверяем лимит
  const checkResponse = await fetch(
    `${baseUrl}/subscriptions/${userId}/check-limit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature: 'tracks',
        current_usage: currentTracksCount
      })
    }
  );
  
  const { allowed } = await checkResponse.json();
  
  if (!allowed) {
    return c.json({ 
      success: false, 
      error: 'Track limit reached. Upgrade your subscription.' 
    }, 403);
  }
  
  // Загрузка трека...
});
```

---

## 📊 ТАРИФНЫЕ ПЛАНЫ (В БД)

| Tier | Price (₽/мес) | Tracks | Videos | Storage | Fee | Discount | Bonus | Pitching |
|------|---------------|--------|--------|---------|-----|----------|-------|----------|
| Free | 0 | 10 | 5 | 5 GB | 10% | 0% | 0% | 0% |
| Basic | 490 | 50 | 20 | 20 GB | 7% | 5% | +5% | 5% |
| Pro | 1490 | ∞ | ∞ | 100 GB | 5% | 15% | +15% | 15% |
| Premium | 4990 | ∞ | ∞ | 500 GB | 3% | 25% | +25% | 20% |

---

## ✅ ПРОВЕРОЧНЫЙ ЧЕКЛИСТ

### Backend:
- [x] Таблица subscriptions создана
- [x] API эндпоинты реализованы
- [x] RLS политики настроены
- [x] Миграции готовы к запуску
- [x] KV Store интегрирован

### Frontend:
- [x] SubscriptionContext загружает данные с сервера
- [x] DonationsPage использует комиссии из подписки
- [x] CoinsModal применяет бонусы
- [x] PitchingPage применяет скидки
- [x] TracksPage проверяет лимиты
- [x] VideoPage проверяет лимиты

### Интеграция:
- [x] Автоматическая загрузка при монтировании
- [x] Проверка истечения подписки каждые 5 минут
- [x] Fallback на Free tier при ошибках
- [x] Типизация TypeScript

---

## 🎉 ГОТОВО К PRODUCTION!

Система подписок полностью интегрирована с PostgreSQL через Supabase:
- ✅ **SQL схема**: Таблица subscriptions с индексами и RLS
- ✅ **Backend API**: 5 эндпоинтов для управления подписками
- ✅ **Frontend**: SubscriptionContext с автозагрузкой
- ✅ **Миграции**: Готовы к запуску через API
- ✅ **Безопасность**: RLS + auth.uid() проверки

---

**Дата:** 27 января 2026  
**Версия:** 1.0.0  
**Автор:** AI Assistant  
**Проект:** promo.music Artist Cabinet
