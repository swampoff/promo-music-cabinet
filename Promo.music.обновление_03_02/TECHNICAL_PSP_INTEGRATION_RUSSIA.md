# 🇷🇺 ТЕХНИЧЕСКИЙ ПЛАН: ИНТЕГРАЦИЯ С РОССИЙСКИМИ PSP

**Дата:** 1 февраля 2026  
**Задача:** Замена Stripe на российские платежные системы  
**Провайдеры:** ЮKassa, Tinkoff Kassa, Robokassa

---

## 🎯 ВЫБОР ПЛАТЕЖНОГО ПРОВАЙДЕРА

### Сравнительная таблица:

| Критерий | ЮKassa | Tinkoff Kassa | Robokassa |
|----------|---------|---------------|-----------|
| **Комиссия** | 2.8% + ₽0 | 2.5% + ₽0 | 3.5% + ₽0 |
| **Рекуррентные платежи** | ✅ Есть | ✅ Есть | ✅ Есть |
| **API качество** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Документация** | Отличная | Отличная | Средняя |
| **Поддержка** | 24/7 чат | 24/7 телефон | Email |
| **Популярность** | #1 в РФ | #2 в РФ | #3 в РФ |
| **Конверсия** | Высокая (много привязанных карт) | Высокая | Средняя |
| **Webhook** | ✅ | ✅ | ✅ |
| **Sandbox** | ✅ | ✅ | ✅ |
| **Срок подключения** | 1-3 дня | 1-3 дня | 1-5 дней |

### 🏆 РЕКОМЕНДАЦИЯ: **ЮKassa** или **Tinkoff Kassa**

**Почему ЮKassa:**
- ✅ Самый популярный сервис в РФ (50%+ рынка)
- ✅ Миллионы пользователей имеют привязанные карты (↑ конверсия)
- ✅ Отличное API и документация
- ✅ Поддержка 24/7
- ✅ Низкая комиссия (2.8%)

**Почему Tinkoff Kassa:**
- ✅ Технологичное решение от крупного банка
- ✅ Самая низкая комиссия (2.5%)
- ✅ Отличное API (одно из лучших в РФ)
- ✅ Быстрая интеграция

**РЕШЕНИЕ:** Начнем с **ЮKassa** (как основной), позже добавим **Tinkoff Kassa** (как альтернативный).

---

## 📋 ОБНОВЛЕННЫЙ ПЛАН РАЗРАБОТКИ

### 🚀 ФАЗА 1: MVP (ЯДРО СИСТЕМЫ) — 4-6 НЕДЕЛЬ

---

#### **НЕДЕЛЯ 1: ВЫБОР И РЕГИСТРАЦИЯ PSP**

##### Задачи:

**1. Регистрация в ЮKassa:**
- [ ] Перейти на [yookassa.ru](https://yookassa.ru)
- [ ] Зарегистрировать личный кабинет (требуется ИНН и ОГРН)
- [ ] Заполнить анкету (описание бизнеса, тарифы, ожидаемый оборот)
- [ ] Дождаться одобрения (1-3 дня)

**2. Получение API-ключей:**
- [ ] В личном кабинете ЮKassa: Настройки → API
- [ ] Получить `shopId` и `secretKey` для **sandbox** (тестовый режим)
- [ ] Получить `shopId` и `secretKey` для **production** (боевой режим)

**3. Изучение документации:**
- [ ] Прочитать [документацию ЮKassa](https://yookassa.ru/developers/api)
- [ ] Раздел "Создание платежа"
- [ ] Раздел "Рекуррентные платежи (автоплатежи)"
- [ ] Раздел "Webhooks (уведомления)"

**4. Создание тестового аккаунта:**
- [ ] Активировать Sandbox mode
- [ ] Получить тестовые карты для проверки:
  - `5555 5555 5555 4477` — успешная оплата
  - `5555 5555 5555 5599` — отклоненная оплата

---

#### **НЕДЕЛЯ 2: ОБНОВЛЕНИЕ СХЕМЫ БД**

##### Структура базы данных (Supabase):

```sql
-- ==================== ПОЛЬЗОВАТЕЛИ ====================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('artist', 'label', 'admin')) DEFAULT 'artist',
  
  -- ФИНАНСЫ (ФАЗА 1: прямые оплаты)
  balance DECIMAL(10, 2) DEFAULT 0.00, -- Баланс в рублях
  
  -- PROMO COINS (ФАЗА 2: скрыто до Q3 2026)
  promo_coins_enabled BOOLEAN DEFAULT FALSE, -- Доступ к коинам (Beta)
  promo_coins DECIMAL(10, 2) DEFAULT 0.00,   -- Баланс коинов
  
  -- ПОДПИСКА
  subscription_plan TEXT CHECK (subscription_plan IN ('spark', 'start', 'pro', 'elite', 'label')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial')) DEFAULT 'inactive',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  
  -- АВТОПРОДЛЕНИЕ (рекуррентные платежи)
  auto_renew_enabled BOOLEAN DEFAULT FALSE,
  payment_method_id TEXT, -- Токен карты от ЮKassa (payment_method_id)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ПОДПИСКИ ====================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  plan TEXT CHECK (plan IN ('spark', 'start', 'pro', 'elite', 'label')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  next_billing_date TIMESTAMP,
  
  price DECIMAL(10, 2) NOT NULL, -- Цена подписки
  promo_coins_included INTEGER DEFAULT 0, -- Сколько PC включено
  
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_method_id TEXT, -- Токен карты
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ТРАНЗАКЦИИ ====================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT CHECK (type IN ('income', 'expense', 'refund')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  
  -- ИНТЕГРАЦИЯ С ЮKASSA
  payment_id TEXT UNIQUE, -- ID платежа в ЮKassa
  payment_method TEXT, -- bank_card, yoo_money, qiwi, etc.
  payment_status TEXT CHECK (payment_status IN ('pending', 'succeeded', 'canceled')) DEFAULT 'pending',
  
  status TEXT CHECK (status IN ('pending', 'completed', 'rejected')) DEFAULT 'pending',
  
  -- СВЯЗЬ С КОНТЕНТОМ (для списаний за размещение)
  related_id INTEGER,
  related_type TEXT CHECK (related_type IN ('video', 'track', 'concert', 'news', 'subscription')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ТРАНЗАКЦИИ С PROMO COINS (ФАЗА 2) ====================

CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT CHECK (type IN ('purchase', 'spend', 'bonus', 'refund', 'expire')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Количество коинов
  description TEXT NOT NULL,
  
  -- СРОК ДЕЙСТВИЯ (для правила "сгорания")
  expires_at TIMESTAMP, -- Когда коины "сгорят"
  
  -- СВЯЗЬ С КОНТЕНТОМ
  related_id INTEGER,
  related_type TEXT CHECK (related_type IN ('video', 'track', 'concert', 'news')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ПЛАТЕЖНЫЕ МЕТОДЫ (ТОКЕНЫ КАРТ) ====================

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  payment_method_id TEXT UNIQUE NOT NULL, -- Токен от ЮKassa
  card_type TEXT, -- visa, mastercard, mir
  card_last4 TEXT, -- Последние 4 цифры карты
  card_expiry_year TEXT,
  card_expiry_month TEXT,
  
  is_default BOOLEAN DEFAULT FALSE, -- Основная карта
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ИНДЕКСЫ ====================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

---

#### **НЕДЕЛЯ 3-4: BACKEND API (ЮKASSA)**

##### 1. Установка SDK

```bash
# Для Node.js / TypeScript
npm install @a2seven/yoo-checkout
```

##### 2. Инициализация клиента

```typescript
// /supabase/functions/server/yookassa.ts

import { YooCheckout } from '@a2seven/yoo-checkout';

// Получаем ключи из переменных окружения
const shopId = Deno.env.get('YOOKASSA_SHOP_ID') || '';
const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY') || '';

export const yookassa = new YooCheckout({
  shopId: shopId,
  secretKey: secretKey,
});

console.log('✅ ЮKassa initialized');
```

##### 3. API: Создание платежа (первая оплата подписки)

```typescript
// /supabase/functions/server/index.tsx

import { yookassa } from './yookassa.ts';

app.post('/make-server-84730125/create-subscription', async (c) => {
  const { userId, plan, saveCard } = await c.req.json();
  
  // 1. Получить цену подписки
  const prices = {
    spark: 2500,
    start: 10000,
    pro: 35000,
    elite: 100000,
    label: 250000,
  };
  const amount = prices[plan];
  
  // 2. Создать платеж в ЮKassa
  try {
    const payment = await yookassa.createPayment({
      amount: {
        value: amount.toString(),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: 'https://promo.music/payment/success', // Куда вернуть пользователя после оплаты
      },
      description: `Подписка ${plan} на promo.music`,
      metadata: {
        userId: userId,
        plan: plan,
      },
      // АВТОПРОДЛЕНИЕ: сохранить карту
      save_payment_method: saveCard, // true/false
      capture: true, // Автоматическое списание
    });
    
    // 3. Вернуть URL для оплаты
    return c.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
    });
    
  } catch (error) {
    console.error('❌ Ошибка создания платежа:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
```

##### 4. API: Webhook (обработка уведомлений о платеже)

```typescript
// /supabase/functions/server/index.tsx

app.post('/make-server-84730125/yookassa-webhook', async (c) => {
  const notification = await c.req.json();
  
  console.log('🔔 Webhook от ЮKassa:', notification);
  
  // Проверка типа уведомления
  if (notification.event === 'payment.succeeded') {
    const payment = notification.object;
    const { userId, plan } = payment.metadata;
    
    // 1. Обновить подписку пользователя
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: plan,
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
        price: parseFloat(payment.amount.value),
        auto_renew: payment.payment_method?.saved || false,
        payment_method_id: payment.payment_method?.id || null,
      });
    
    // 2. Создать транзакцию
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'income',
      amount: parseFloat(payment.amount.value),
      description: `Оплата подписки ${plan}`,
      payment_id: payment.id,
      payment_method: payment.payment_method?.type,
      payment_status: 'succeeded',
      status: 'completed',
      related_type: 'subscription',
    });
    
    // 3. Начислить Promo Coins (если включено)
    const user = await supabase
      .from('users')
      .select('promo_coins_enabled')
      .eq('id', userId)
      .single();
    
    if (user.data?.promo_coins_enabled) {
      const coinsMap = { spark: 3, start: 15, pro: 60, elite: 200, label: 9999 };
      const coins = coinsMap[plan];
      
      await supabase.from('coin_transactions').insert({
        user_id: userId,
        type: 'purchase',
        amount: coins,
        description: `Начислено за подписку ${plan}`,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +3 месяца
      });
      
      // Обновить баланс
      await supabase.rpc('increment_promo_coins', { user_id: userId, amount: coins });
    }
    
    // 4. Отправить уведомление
    // (логика уведомлений)
    
    console.log(`✅ Подписка ${plan} активирована для пользователя ${userId}`);
  }
  
  return c.json({ success: true });
});
```

##### 5. API: Рекуррентный платеж (автопродление)

```typescript
// /supabase/functions/server/cron-renew-subscriptions.ts

import { yookassa } from './yookassa.ts';

// Эта функция вызывается CRON-задачей каждый день в 03:00
export async function renewSubscriptions() {
  console.log('🔄 Запуск автопродления подписок...');
  
  // 1. Найти подписки, которые заканчиваются завтра
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, users(*)')
    .eq('status', 'active')
    .eq('auto_renew', true)
    .lt('end_date', tomorrow.toISOString())
    .not('payment_method_id', 'is', null);
  
  if (!subscriptions || subscriptions.length === 0) {
    console.log('✅ Нет подписок для продления');
    return;
  }
  
  console.log(`📋 Найдено ${subscriptions.length} подписок для продления`);
  
  // 2. Для каждой подписки создать рекуррентный платеж
  for (const sub of subscriptions) {
    try {
      // Отправить уведомление за 3 дня (если еще не отправлено)
      // (логика уведомлений)
      
      // Создать платеж с сохраненной картой
      const payment = await yookassa.createPayment({
        amount: {
          value: sub.price.toString(),
          currency: 'RUB',
        },
        payment_method_id: sub.payment_method_id, // ← ТОКЕН КАРТЫ!
        description: `Автопродление подписки ${sub.plan}`,
        metadata: {
          userId: sub.user_id,
          subscriptionId: sub.id,
          plan: sub.plan,
        },
        capture: true, // Автоматическое списание
      });
      
      console.log(`✅ Платеж создан для пользователя ${sub.user_id}:`, payment.id);
      
      // Обновить подписку (продлить на месяц)
      await supabase
        .from('subscriptions')
        .update({
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .eq('id', sub.id);
      
    } catch (error) {
      console.error(`❌ Ошибка продления для ${sub.user_id}:`, error);
      
      // Уведомить пользователя об ошибке оплаты
      // (логика уведомлений)
      
      // Отключить автопродление
      await supabase
        .from('subscriptions')
        .update({ auto_renew: false, status: 'cancelled' })
        .eq('id', sub.id);
    }
  }
  
  console.log('✅ Автопродление завершено');
}
```

##### 6. Настройка CRON в Supabase

```sql
-- В Supabase Dashboard → Database → Cron Jobs
-- Создать задачу, которая вызывает Edge Function каждый день в 03:00

SELECT cron.schedule(
  'renew-subscriptions-daily',
  '0 3 * * *', -- Каждый день в 03:00
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT_ID].supabase.co/functions/v1/make-server-84730125/cron-renew',
    headers := '{"Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
  );
  $$
);
```

---

#### **НЕДЕЛЯ 5: FRONTEND ИНТЕГРАЦИЯ**

##### 1. API-запрос на создание подписки

```typescript
// /src/pages/Pricing.tsx

const handleSubscribe = async (plan: string) => {
  const saveCard = confirm('Сохранить карту для автоматических платежей?');
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-84730125/create-subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
          plan: plan,
          saveCard: saveCard,
        }),
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      // Перенаправить на страницу оплаты ЮKassa
      window.location.href = data.confirmationUrl;
    } else {
      toast.error('Ошибка создания платежа');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    toast.error('Ошибка соединения с сервером');
  }
};
```

##### 2. Страница успешной оплаты

```typescript
// /src/pages/PaymentSuccess.tsx

export function PaymentSuccess() {
  useEffect(() => {
    // Получить paymentId из URL
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('paymentId');
    
    // Проверить статус платежа
    // (опционально: можно полагаться на webhook)
    
    toast.success('Подписка активирована!');
    
    // Перенаправить в личный кабинет через 3 секунды
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">
        Оплата прошла успешно!
      </h1>
      <p className="text-gray-400">
        Перенаправление в личный кабинет...
      </p>
    </div>
  );
}
```

---

#### **НЕДЕЛЯ 6: ТЕСТИРОВАНИЕ**

##### Чек-лист тестирования:

**1. Создание подписки (первый платеж):**
- [ ] Тестовая карта `5555 5555 5555 4477` → успешная оплата
- [ ] Подписка создана в БД
- [ ] Транзакция создана
- [ ] Promo Coins начислены (если включено)
- [ ] Уведомление отправлено пользователю

**2. Сохранение карты для автопродления:**
- [ ] Галочка "Сохранить карту" → токен сохранен в БД
- [ ] `payment_method_id` записан в таблицу `subscriptions`

**3. Автопродление (рекуррентный платеж):**
- [ ] CRON запустился в 03:00
- [ ] Найдены подписки, заканчивающиеся завтра
- [ ] Уведомление отправлено за 3 дня
- [ ] Платеж создан с токеном карты
- [ ] Webhook обработан
- [ ] Подписка продлена на 30 дней
- [ ] Promo Coins начислены

**4. Ошибка автопродления:**
- [ ] Тестовая карта `5555 5555 5555 5599` → отклонена
- [ ] Уведомление об ошибке отправлено
- [ ] Автопродление отключено
- [ ] Подписка переведена в статус `cancelled`

**5. Возврат средств:**
- [ ] Запрос на возврат создан
- [ ] Расчет суммы корректный
- [ ] Возврат инициирован через ЮKassa API
- [ ] Webhook о возврате обработан
- [ ] Транзакция типа `refund` создана

---

## 🔐 БЕЗОПАСНОСТЬ

### 1. Хранение API-ключей

```bash
# Supabase Edge Functions → Secrets

YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

**НЕ ХРАНИТЬ** в коде или в git!

### 2. Проверка подписи Webhook

```typescript
// /supabase/functions/server/index.tsx

import crypto from 'node:crypto';

app.post('/make-server-84730125/yookassa-webhook', async (c) => {
  const notification = await c.req.json();
  const signature = c.req.header('X-YK-Signature');
  
  // Проверка подписи (защита от подделки webhook)
  const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY');
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(notification))
    .digest('hex');
  
  if (hash !== signature) {
    console.error('❌ Неверная подпись webhook!');
    return c.json({ error: 'Invalid signature' }, 403);
  }
  
  // Обработка webhook
  // ...
});
```

### 3. Защита от повторной обработки Webhook

```typescript
// Проверить, не обрабатывали ли мы этот платеж ранее
const { data: existingTx } = await supabase
  .from('transactions')
  .select('id')
  .eq('payment_id', payment.id)
  .single();

if (existingTx) {
  console.log('⚠️ Webhook уже обработан');
  return c.json({ success: true }); // 200 OK (чтобы ЮKassa не повторяла)
}
```

---

## 📊 МОНИТОРИНГ И ЛОГИРОВАНИЕ

### 1. Логи в Supabase Edge Functions

```typescript
console.log('💳 Создан платеж:', { paymentId, userId, amount });
console.log('✅ Webhook обработан:', { event: notification.event });
console.error('❌ Ошибка платежа:', { error, userId });
```

### 2. Метрики для отслеживания

```sql
-- Количество успешных платежей за сегодня
SELECT COUNT(*) FROM transactions
WHERE payment_status = 'succeeded'
AND DATE(created_at) = CURRENT_DATE;

-- Средний чек
SELECT AVG(amount) FROM transactions
WHERE payment_status = 'succeeded';

-- Конверсия автопродления
SELECT 
  COUNT(*) FILTER (WHERE auto_renew = true) * 100.0 / COUNT(*) AS conversion_rate
FROM subscriptions
WHERE status = 'active';
```

---

## 🚀 ЗАДАЧИ НА ПЕРВУЮ НЕДЕЛЮ (СЕЙЧАС)

### Для Product Manager:

1. **Сравнить тарифы ЮKassa и Tinkoff Kassa:**
   - [ ] Перейти на [yookassa.ru/pricing](https://yookassa.ru/pricing)
   - [ ] Перейти на [tinkoff.ru/kassa/pricing](https://www.tinkoff.ru/kassa/pricing)
   - [ ] Сравнить комиссии для вашего оборота
   - [ ] Выбрать основного провайдера

2. **Начать составлять Публичную оферту:**
   - [ ] Использовать черновик из `/LEGAL_TERMS_OF_SERVICE_DRAFT.md`
   - [ ] Адаптировать под вашу компанию (реквизиты, адреса)
   - [ ] Подготовить к отправке юристу

### Для Lead Developer:

1. **Изучить API документацию:**
   - [ ] [ЮKassa API](https://yookassa.ru/developers/api)
   - [ ] [Tinkoff Kassa API](https://www.tinkoff.ru/kassa/develop/api/)
   - [ ] Раздел "Рекуррентные платежи"
   - [ ] Раздел "Webhooks"

2. **Создать тестовые аккаунты:**
   - [ ] Зарегистрироваться в ЮKassa (sandbox)
   - [ ] Зарегистрироваться в Tinkoff Kassa (sandbox)
   - [ ] Получить API-ключи для тестирования

3. **"Пощупать" API:**
   - [ ] Создать тестовый платеж через Postman/curl
   - [ ] Протестировать успешную оплату
   - [ ] Протестировать отклоненную оплату
   - [ ] Протестировать рекуррентный платеж

---

## ✅ ИТОГО

```
╔══════════════════════════════════════════════════════════╗
║  ТЕХНИЧЕСКИЙ ПЛАН: ИНТЕГРАЦИЯ С ЮKASSA 🇷🇺              ║
╠══════════════════════════════════════════════════════════╣
║  ✅ Выбран провайдер: ЮKassa (основной)                 ║
║  ✅ Схема БД обновлена                                   ║
║  ✅ API эндпоинты спроектированы:                        ║
║     - POST /create-subscription (первый платеж)         ║
║     - POST /yookassa-webhook (обработка уведомлений)    ║
║     - CRON /renew-subscriptions (автопродление)         ║
║  ✅ Frontend интеграция описана                          ║
║  ✅ Чек-лист тестирования готов                          ║
║  ✅ Безопасность учтена                                  ║
║                                                          ║
║  СРОК: 4-6 недель                                        ║
║  СТАТУС: ГОТОВ К ИМПЛЕМЕНТАЦИИ! 🚀                       ║
╚══════════════════════════════════════════════════════════╝
```

**НАЧИНАЕМ С РЕГИСТРАЦИИ В ЮKASSA И ИЗУЧЕНИЯ API!** 🛠️
