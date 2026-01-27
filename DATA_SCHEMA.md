# 📊 СХЕМА ДАННЫХ PROMO.MUSIC

## 🗄️ KV STORE STRUCTURE

Все данные хранятся в единой таблице `kv_store_84730125` с ключами в формате `prefix:id` или `prefix:userId:id`.

---

## 📋 ОСНОВНЫЕ СУЩНОСТИ

### 1️⃣ **КОНЦЕРТЫ (Concerts)**

**Key Pattern**: `concert:{concertId}`

```typescript
interface TourDate {
  // Основная информация
  id: string;                    // UUID концерта
  artist_id: string;             // ID артиста
  
  // Детали концерта
  title: string;                 // Название концерта
  city: string;                  // Город
  venue_name: string;            // Название площадки
  date: string;                  // Дата (ISO 8601)
  time: string;                  // Время (HH:MM)
  event_type: string;            // Тип (Концерт, Фестиваль, etc)
  description: string;           // Описание
  banner_image: string;          // URL баннера
  
  // Билеты
  ticket_price_from: number;     // Цена от (₽)
  ticket_price_to: number;       // Цена до (₽)
  ticket_link: string;           // Ссылка на покупку
  
  // Модерация
  moderation_status: 'draft' | 'pending' | 'approved' | 'rejected';
  moderation_comment?: string;   // Комментарий модератора
  
  // Продвижение
  is_promoted: boolean;          // Продвигается ли
  promotion_ends_at?: string;    // Дата окончания продвижения
  promotion_cost?: number;       // Стоимость продвижения в коинах
  
  // Метрики
  views: number;                 // Просмотры
  clicks: number;                // Клики по билетам
  
  // Видимость
  is_hidden: boolean;            // Скрыт ли в публичном профиле
  
  // Timestamps
  created_at: string;            // Дата создания
  updated_at: string;            // Дата обновления
}
```

**Примеры ключей**:
- `concert:tour_123abc`
- `concert:tour_456def`

---

### 2️⃣ **УВЕДОМЛЕНИЯ (Notifications)**

**Key Pattern**: `notification:{userId}:{notificationId}`

```typescript
interface Notification {
  // ID
  id: string;                    // UUID уведомления
  userId: string;                // ID пользователя
  concertId: string;             // ID связанного концерта
  
  // Тип и содержание
  type: 'reminder' | 'announcement' | 'ticket_update' | 'promotion';
  title: string;                 // Заголовок
  message: string;               // Текст сообщения
  
  // Планирование
  scheduledFor: string;          // Когда отправить (ISO 8601)
  
  // Статус
  status: 'pending' | 'sent' | 'failed';
  
  // Канал доставки
  channel: 'email' | 'push' | 'both';
  
  // Timestamps
  createdAt: string;             // Создано
  sentAt?: string;               // Отправлено
  
  // Дополнительные данные
  metadata?: {
    concert?: any;               // Данные концерта
    error?: string;              // Ошибка (если failed)
  };
}
```

**Примеры ключей**:
- `notification:artist_001:notif_abc123`
- `notification:artist_001:notif_def456`

**Типы уведомлений**:
- **reminder** - напоминание о концерте
- **announcement** - анонс новости
- **ticket_update** - обновление информации о билетах
- **promotion** - промо-акция

---

### 3️⃣ **НАСТРОЙКИ УВЕДОМЛЕНИЙ**

**Key Pattern**: `notification_settings:{userId}`

```typescript
interface NotificationSettings {
  userId: string;                // ID пользователя
  
  // Каналы доставки
  emailEnabled: boolean;         // Email включён
  pushEnabled: boolean;          // Push включён
  
  // Напоминания
  reminderDaysBefore: number[];  // Дни до концерта [7, 3, 1]
  
  // Типы уведомлений
  announcements: boolean;        // Анонсы
  promotions: boolean;           // Продвижения
  ticketUpdates: boolean;        // Обновления билетов
}
```

**Пример ключа**:
- `notification_settings:artist_001`

**Дефолтные настройки**:
```json
{
  "emailEnabled": true,
  "pushEnabled": true,
  "reminderDaysBefore": [7, 3, 1],
  "announcements": true,
  "promotions": true,
  "ticketUpdates": true
}
```

---

### 4️⃣ **EMAIL-КАМПАНИИ (Email Campaigns)**

**Key Pattern**: `campaign:{artistId}:{campaignId}`

```typescript
interface EmailCampaign {
  // ID
  id: string;                    // UUID кампании
  artistId: string;              // ID артиста
  concertId?: string;            // Привязка к концерту (опционально)
  
  // Содержание
  subject: string;               // Тема письма
  content: string;               // HTML/текст письма
  
  // Аудитория
  recipientCount: number;        // Количество получателей
  
  // Статус
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  
  // Планирование
  scheduledFor?: string;         // Запланировано на (ISO 8601)
  
  // Метрики
  sentAt?: string;               // Отправлено
  openRate?: number;             // Open Rate (0.0 - 1.0)
  clickRate?: number;            // Click Rate (0.0 - 1.0)
  
  // Timestamps
  createdAt: string;             // Создано
}
```

**Примеры ключей**:
- `campaign:artist_001:camp_abc123`
- `campaign:artist_001:camp_def456`

**Статусы**:
- **draft** - черновик
- **scheduled** - запланирована
- **sending** - отправляется
- **sent** - отправлена
- **failed** - ошибка

---

### 5️⃣ **БИЛЕТНЫЕ ПРОВАЙДЕРЫ (Ticket Providers)**

**Key Pattern**: `ticket_provider:{artistId}:{providerId}`

```typescript
interface TicketProviderConnection {
  // ID
  id: string;                    // ID провайдера (kassir, ticketland, etc)
  artistId: string;              // ID артиста
  
  // Информация
  name: string;                  // Название (Кассир.ру)
  logo?: string;                 // URL логотипа
  
  // Настройки
  apiKey: string;                // API ключ
  enabled: boolean;              // Активен ли
  commission: number;            // Комиссия в % (5, 7, 8, 10)
  
  // Timestamps
  connectedAt: string;           // Дата подключения
}
```

**Примеры ключей**:
- `ticket_provider:artist_001:kassir`
- `ticket_provider:artist_001:ticketland`

**Доступные провайдеры**:
1. **Кассир.ру** - комиссия 5%
2. **Ticketland.ru** - комиссия 7%
3. **Яндекс Афиша** - комиссия 8%
4. **TicketMaster** - комиссия 10%

---

### 6️⃣ **ПРОДАЖИ БИЛЕТОВ (Ticket Sales)**

**Key Pattern**: `ticket_sale:{concertId}:{saleId}`

```typescript
interface TicketSale {
  // ID
  id: string;                    // UUID продажи
  concertId: string;             // ID концерта
  artistId: string;              // ID артиста
  
  // Провайдер
  provider: string;              // kassir, ticketland, afisha, etc
  
  // Билеты
  quantity: number;              // Количество билетов
  price: number;                 // Цена за 1 билет (₽)
  
  // Финансы
  totalAmount: number;           // Общая сумма (₽)
  commission: number;            // Комиссия платформы (₽)
  netAmount: number;             // Чистая выручка (₽)
  
  // Покупатель
  buyerEmail?: string;           // Email покупателя
  
  // Статус
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  
  // Timestamps
  purchasedAt: string;           // Дата покупки
  
  // Дополнительно
  metadata?: {
    test?: boolean;              // Тестовая продажа
    transactionId?: string;      // ID транзакции
  };
}
```

**Примеры ключей**:
- `ticket_sale:tour_123:sale_abc123`
- `ticket_sale:tour_123:sale_def456`

**Расчёт финансов**:
```typescript
commission = totalAmount * (providerCommission / 100)
netAmount = totalAmount - commission
```

---

## 📈 ВОРОНКА ПРОДАЖ (Sales Funnel)

**Не хранится** - вычисляется на лету из нескольких источников:

```typescript
interface SalesFunnel {
  concertId: string;
  
  // Этапы воронки
  views: number;                 // Просмотры (из concert.views)
  clicks: number;                // Клики (из concert.clicks)
  cartAdds: number;              // Добавления в корзину (мок: clicks * 0.6)
  checkoutInitiated: number;     // Начало оформления (мок: cartAdds * 0.7)
  purchases: number;             // Покупки (count из ticket_sale)
  
  // Метрики
  revenue: number;               // Выручка (sum из ticket_sale)
  conversionRate: number;        // Конверсия % (purchases / views)
  averageTicketPrice: number;    // Средний чек (revenue / purchases)
}
```

**Источники данных**:
1. `views`, `clicks` - из `concert:{id}`
2. `purchases`, `revenue` - из `ticket_sale:{concertId}:*`
3. `cartAdds`, `checkoutInitiated` - вычисляются (мок для демо)

---

## 📊 СТАТИСТИКА УВЕДОМЛЕНИЙ

**Не хранится** - вычисляется из `notification:*`:

```typescript
interface NotificationStats {
  total: number;                 // Всего уведомлений
  pending: number;               // Ожидают отправки
  sent: number;                  // Отправлены
  failed: number;                // Ошибки
  
  byType: {
    reminder: number;            // Напоминания
    announcement: number;        // Анонсы
    ticket_update: number;       // Обновления билетов
    promotion: number;           // Промо
  };
}
```

---

## 🔑 KEY PATTERNS SUMMARY

| Сущность | Pattern | Пример |
|----------|---------|--------|
| Концерт | `concert:{id}` | `concert:tour_abc123` |
| Уведомление | `notification:{userId}:{id}` | `notification:artist_001:notif_123` |
| Настройки уведомлений | `notification_settings:{userId}` | `notification_settings:artist_001` |
| Email-кампания | `campaign:{artistId}:{id}` | `campaign:artist_001:camp_123` |
| Подключение провайдера | `ticket_provider:{artistId}:{providerId}` | `ticket_provider:artist_001:kassir` |
| Продажа билета | `ticket_sale:{concertId}:{id}` | `ticket_sale:tour_123:sale_456` |

---

## 🔄 ОПЕРАЦИИ С ДАННЫМИ

### **Create (Создание)**
```typescript
await kv.set(key, value);
```

### **Read (Чтение)**
```typescript
// Один объект
const concert = await kv.get('concert:tour_123');

// Все объекты с префиксом
const allConcerts = await kv.getByPrefix('concert:');
```

### **Update (Обновление)**
```typescript
const concert = await kv.get('concert:tour_123');
concert.views += 1;
await kv.set('concert:tour_123', concert);
```

### **Delete (Удаление)**
```typescript
await kv.del('concert:tour_123');
```

### **Multiple (Множественные)**
```typescript
// Чтение нескольких
const values = await kv.mget(['concert:tour_123', 'concert:tour_456']);

// Запись нескольких
await kv.mset({
  'concert:tour_123': concert1,
  'concert:tour_456': concert2
});

// Удаление нескольких
await kv.mdel(['concert:tour_123', 'concert:tour_456']);
```

---

## 🎯 ИНДЕКСЫ И ПОИСК

**Нет встроенных индексов** - все данные хранятся по ключам.

### **Поиск реализован через**:
1. `getByPrefix()` - получить все объекты с префиксом
2. `.filter()` - фильтрация в памяти на фронтенде/бэкенде
3. `.sort()` - сортировка в памяти

### **Пример поиска концертов**:
```typescript
// 1. Получить все концерты
const allConcerts = await kv.getByPrefix('concert:');

// 2. Фильтровать
const moscowConcerts = allConcerts.filter(c => c.city === 'Москва');

// 3. Сортировать
const sorted = moscowConcerts.sort((a, b) => 
  new Date(a.date).getTime() - new Date(b.date).getTime()
);
```

---

## 💡 ОПТИМИЗАЦИЯ

### **Кэширование на фронтенде**
```typescript
// useState для кэша
const [concerts, setConcerts] = useState<TourDate[]>([]);

// Загрузка один раз
useEffect(() => {
  loadConcerts();
}, []);
```

### **Batch операции**
```typescript
// Вместо нескольких set()
await kv.mset({
  'concert:tour_1': concert1,
  'concert:tour_2': concert2,
  'concert:tour_3': concert3
});
```

### **Ленивая загрузка**
```typescript
// Загружать только при необходимости
if (activeTab === 'marketing') {
  loadNotifications();
}
```

---

## 🔒 ОГРАНИЧЕНИЯ KV STORE

1. ❌ **Нет SQL запросов** - только key-value
2. ❌ **Нет JOIN'ов** - связи реализованы через ID
3. ❌ **Нет транзакций** - операции атомарны по ключу
4. ❌ **Нет индексов** - поиск через getByPrefix + filter
5. ✅ **Быстрый доступ** - O(1) по ключу
6. ✅ **Простота** - минимум настроек

---

## 📦 BACKUP & MIGRATION

### **Экспорт всех данных**
```typescript
// Получить все ключи с разными префиксами
const concerts = await kv.getByPrefix('concert:');
const notifications = await kv.getByPrefix('notification:');
const campaigns = await kv.getByPrefix('campaign:');
const sales = await kv.getByPrefix('ticket_sale:');

// Сохранить в JSON
const backup = { concerts, notifications, campaigns, sales };
```

### **Импорт данных**
```typescript
// Восстановить из backup
for (const concert of backup.concerts) {
  await kv.set(`concert:${concert.id}`, concert);
}
```

---

**Последнее обновление**: 26 января 2026

**Версия схемы**: 3.0.0
