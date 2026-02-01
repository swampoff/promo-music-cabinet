# 🎤 EVENT MANAGEMENT - ДОКУМЕНТАЦИЯ

## 🎯 Обзор системы

Полноценная система управления концертами и мероприятиями для артистов. Включает управление площадками, продажей билетов, командой, бюджетом, продвижением, таймингом и сбором обратной связи.

---

## 📊 Архитектура базы данных

### 🗃️ Таблицы

#### 1️⃣ **event_venues** - Площадки для мероприятий
База данных концертных площадок, клубов, арен и других локаций.

**Основные поля:**
```sql
- venue_name          - Название площадки
- venue_type          - Тип: club, concert_hall, arena, stadium, festival_ground, bar, outdoor
- city, address       - Местоположение
- capacity            - Общая вместимость
- standing_capacity   - Стоячие места
- seated_capacity     - Сидячие места
- stage_size          - Размер сцены
- equipment_available - Доступное оборудование (массив)
- has_sound_system    - Есть звук?
- has_lighting        - Есть свет?
- has_backstage       - Есть backstage?
- parking_available   - Есть парковка?
- rental_price        - Стоимость аренды
- contact_person      - Контактное лицо
- rating              - Рейтинг площадки (1-5)
```

**Примеры использования:**
```typescript
// Добавить площадку
{
  id: "venue_001",
  artist_id: "artist_123",
  venue_name: "Клуб 16 тонн",
  venue_type: "club",
  city: "Москва",
  capacity: 500,
  standing_capacity: 500,
  seated_capacity: 0,
  has_sound_system: true,
  has_lighting: true,
  rental_price: 150000,
  contact_person: "Иван Менеджеров",
  contact_phone: "+7 (495) 123-45-67"
}
```

---

#### 2️⃣ **event_tickets** - Типы билетов
Различные категории билетов на мероприятие.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- ticket_type         - early_bird, standard, vip, backstage, table, fan_zone
- ticket_name         - Название билета
- price               - Цена
- quantity_total      - Всего билетов
- quantity_sold       - Продано
- quantity_reserved   - Зарезервировано
- quantity_available  - Доступно (автоматически вычисляется)
- sale_start          - Начало продаж
- sale_end            - Окончание продаж
- is_active           - Активен?
- includes            - Что включено (массив)
- restrictions        - Ограничения (массив)
```

**Примеры использования:**
```typescript
// Создать тип билета
{
  id: "ticket_001",
  event_id: "event_123",
  ticket_type: "early_bird",
  ticket_name: "Early Bird",
  price: 1500,
  quantity_total: 100,
  sale_start: "2026-05-01T00:00:00Z",
  sale_end: "2026-05-15T23:59:59Z",
  includes: ["Скидка 30%", "Сувенир"],
  is_active: true
}
```

---

#### 3️⃣ **event_sales** - Продажи билетов
Транзакции покупки билетов.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- ticket_id           - ID типа билета
- buyer_name          - Имя покупателя
- buyer_email         - Email покупателя
- quantity            - Количество билетов
- unit_price          - Цена за билет
- total_price         - Итоговая сумма
- payment_method      - online, cash, card, bank_transfer, crypto
- payment_status      - pending, completed, failed, refunded
- promo_code          - Промокод
- discount_amount     - Сумма скидки
- service_fee         - Сервисный сбор
- sale_channel        - website, mobile_app, box_office, partner
- ticket_codes        - Коды билетов (массив)
- checked_in          - Прошел регистрацию?
- checked_in_at       - Время регистрации
```

**Примеры использования:**
```typescript
// Продажа билета
{
  id: "sale_001",
  event_id: "event_123",
  ticket_id: "ticket_001",
  buyer_name: "Петр Иванов",
  buyer_email: "petr@example.com",
  quantity: 2,
  unit_price: 1500,
  total_price: 3000,
  payment_method: "online",
  payment_status: "completed",
  sale_channel: "website",
  ticket_codes: ["ABC123", "ABC124"]
}
```

---

#### 4️⃣ **event_team** - Команда мероприятия
Персонал и команда для проведения события.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- member_name         - Имя члена команды
- role                - manager, sound_engineer, light_engineer, stage_manager, 
                        security, photographer, videographer, promoter, dj, host
- contact_phone       - Телефон
- contact_email       - Email
- compensation        - Оплата
- compensation_type   - fixed, hourly, percentage, free
- status              - invited, confirmed, declined, cancelled, completed
- arrival_time        - Время прибытия
- departure_time      - Время отъезда
```

**Примеры использования:**
```typescript
// Добавить звукорежиссера
{
  id: "team_001",
  event_id: "event_123",
  member_name: "Алексей Звукарев",
  role: "sound_engineer",
  contact_phone: "+7 (999) 888-77-66",
  compensation: 15000,
  compensation_type: "fixed",
  status: "confirmed",
  arrival_time: "2026-06-01T14:00:00Z"
}
```

---

#### 5️⃣ **event_riders** - Технические райдеры
Technical и hospitality райдеры для мероприятия.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- rider_type          - technical, hospitality, stage_plot, input_list, lighting, backline
- title               - Заголовок
- requirements        - Требования (JSON)
- equipment_list      - Список оборудования (JSON)
- hospitality_items   - Hospitality (JSON)
- special_requests    - Особые пожелания
- status              - draft, sent, approved, rejected, negotiating
- file_url            - Ссылка на файл
```

**Примеры использования:**
```typescript
// Технический райдер
{
  id: "rider_001",
  event_id: "event_123",
  rider_type: "technical",
  title: "Technical Rider - Summer Tour 2026",
  requirements: [
    { item: "Микрофон", model: "Shure SM58", quantity: 3 },
    { item: "Мониторы", model: "QSC K12", quantity: 4 }
  ],
  status: "sent"
}

// Hospitality райдер
{
  id: "rider_002",
  event_id: "event_123",
  rider_type: "hospitality",
  title: "Hospitality Rider",
  hospitality_items: [
    { item: "Вода", quantity: "10 бутылок" },
    { item: "Фрукты", quantity: "Ассорти" },
    { item: "Кофе", quantity: "Термос" }
  ]
}
```

---

#### 6️⃣ **event_budget** - Бюджет мероприятия
Детализированный бюджет по категориям.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- category            - venue_rental, equipment, sound, lighting, team, 
                        marketing, hospitality, transportation, permits, insurance
- item_name           - Название статьи
- budget_type         - expense (расход), income (доход)
- amount_planned      - Запланировано
- amount_actual       - Фактически
- status              - planned, approved, paid, pending, cancelled
- paid_at             - Дата оплаты
- invoice_number      - Номер счета
```

**Примеры использования:**
```typescript
// Расходы
{
  id: "budget_001",
  event_id: "event_123",
  category: "venue_rental",
  item_name: "Аренда Клуб 16 тонн",
  budget_type: "expense",
  amount_planned: 150000,
  amount_actual: 150000,
  status: "paid"
}

// Доходы
{
  id: "budget_002",
  event_id: "event_123",
  category: "other",
  item_name: "Продажа билетов",
  budget_type: "income",
  amount_planned: 500000,
  amount_actual: 450000,
  status: "completed"
}
```

---

#### 7️⃣ **event_promotion** - Продвижение мероприятия
Каналы продвижения и их эффективность.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- channel             - social_media, email, sms, poster, radio, tv, 
                        online_ads, press, influencer, street_team
- channel_name        - Название канала
- budget              - Бюджет на канал
- start_date          - Дата начала
- end_date            - Дата окончания
- status              - planned, active, paused, completed
- impressions         - Показы
- clicks              - Клики
- conversions         - Конверсии (продажи)
- cost_per_click      - CPC
- cost_per_conversion - CPA
- roi                 - ROI %
```

**Примеры использования:**
```typescript
// Продвижение в Instagram
{
  id: "promo_001",
  event_id: "event_123",
  channel: "social_media",
  channel_name: "Instagram Ads",
  budget: 50000,
  start_date: "2026-05-01",
  end_date: "2026-06-01",
  status: "active",
  impressions: 100000,
  clicks: 5000,
  conversions: 250,
  cost_per_click: 10,
  cost_per_conversion: 200,
  roi: 150
}
```

---

#### 8️⃣ **event_timeline** - Расписание мероприятия
Детальный тайминг события.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- timeline_type       - load_in, soundcheck, doors_open, opener, 
                        main_act, break, encore, load_out
- title               - Название этапа
- scheduled_time      - Запланированное время
- duration_minutes    - Длительность (минуты)
- actual_time         - Фактическое время
- responsible_person  - Ответственный
- status              - scheduled, in_progress, completed, cancelled, delayed
```

**Примеры использования:**
```typescript
// Расписание концерта
[
  {
    timeline_type: "load_in",
    title: "Загрузка оборудования",
    scheduled_time: "2026-06-01T14:00:00Z",
    duration_minutes: 120
  },
  {
    timeline_type: "soundcheck",
    title: "Саундчек",
    scheduled_time: "2026-06-01T17:00:00Z",
    duration_minutes: 60
  },
  {
    timeline_type: "doors_open",
    title: "Открытие дверей",
    scheduled_time: "2026-06-01T19:00:00Z"
  },
  {
    timeline_type: "main_act",
    title: "Основное выступление",
    scheduled_time: "2026-06-01T21:00:00Z",
    duration_minutes: 90
  }
]
```

---

#### 9️⃣ **event_feedback** - Отзывы о мероприятии
Обратная связь от участников.

**Основные поля:**
```sql
- event_id            - ID мероприятия
- feedback_type       - attendee, venue, team_member, sponsor, internal
- author_name         - Имя автора
- rating              - Оценка (1-5)
- comment             - Комментарий
- likes               - Что понравилось (массив)
- dislikes            - Что не понравилось (массив)
- suggestions         - Предложения
- would_attend_again  - Придет снова?
- source              - email, website, social_media, survey
- is_public           - Публичный отзыв?
```

**Примеры использования:**
```typescript
// Отзыв посетителя
{
  id: "feedback_001",
  event_id: "event_123",
  feedback_type: "attendee",
  author_name: "Анна Петрова",
  rating: 5,
  comment: "Отличный концерт! Звук был идеальный!",
  likes: ["Звук", "Атмосфера", "Локация"],
  dislikes: ["Очереди в гардероб"],
  would_attend_again: true,
  source: "email",
  is_public: true
}
```

---

#### 🔟 **event_setlists** - Сет-листы
Списки песен для выступлений.

**Основные поля:**
```sql
- event_id                 - ID мероприятия
- setlist_type             - main, opener, encore, dj_set, soundcheck
- title                    - Название сет-листа
- songs                    - Список песен (JSON)
- total_duration_minutes   - Общая длительность
- is_final                 - Финальная версия?
- performed_at             - Время выступления
```

**Примеры использования:**
```typescript
// Основной сет-лист
{
  id: "setlist_001",
  event_id: "event_123",
  setlist_type: "main",
  title: "Main Set - Moscow 01.06.2026",
  songs: [
    { position: 1, title: "Intro", duration: 2 },
    { position: 2, title: "Звёзды", duration: 4 },
    { position: 3, title: "Город", duration: 5 },
    { position: 4, title: "Мечты", duration: 4 }
  ],
  total_duration_minutes: 90,
  is_final: true
}
```

---

### 📈 Представления (Views)

#### **event_financial_summary** - Финансовая сводка
```sql
SELECT 
  event_name,
  ticket_revenue,        -- Доход от билетов
  tickets_sold,          -- Продано билетов
  expenses_planned,      -- Запланированные расходы
  expenses_actual,       -- Фактические расходы
  profit,                -- Прибыль
  marketing_budget,      -- Бюджет на маркетинг
  marketing_roi          -- ROI маркетинга
FROM event_financial_summary
WHERE artist_id = 'artist_123';
```

#### **upcoming_events** - Предстоящие мероприятия
```sql
SELECT 
  event_name,
  event_date,
  venue,
  city,
  tickets_sold,
  tickets_remaining,
  fill_rate_percent      -- Заполненность %
FROM upcoming_events
WHERE artist_id = 'artist_123';
```

#### **event_attendance_stats** - Статистика посещаемости
```sql
SELECT 
  event_name,
  venue_capacity,
  tickets_sold,
  checked_in,
  sell_through_rate,     -- Процент проданных билетов
  attendance_rate,       -- Процент пришедших
  average_rating,        -- Средний рейтинг
  feedback_count         -- Количество отзывов
FROM event_attendance_stats;
```

#### **top_venues_by_revenue** - Топ площадок по выручке
```sql
SELECT 
  venue_name,
  city,
  events_count,
  total_revenue,
  avg_revenue_per_event,
  avg_venue_rating
FROM top_venues_by_revenue
LIMIT 10;
```

---

## 🔄 Связи между таблицами

```
event_requests (базовая таблица из 001_promotion_tables.sql)
        ↓
    ┌───┴────────────────────────────┐
    ↓                                ↓
event_venues (many-to-many)    event_tickets
    ↓                                ↓
event_team                      event_sales
event_riders                         ↓
event_budget                    (checked_in)
event_promotion                      
event_timeline                  event_feedback
event_setlists                       
```

---

## 💡 Бизнес-логика

### 🎯 Workflow: Организация концерта

#### **1. Планирование**
```typescript
// Создать мероприятие
await createEvent({
  event_name: "Летний концерт",
  event_type: "concert",
  event_date: "2026-06-01",
  city: "Москва",
  venue: "Клуб 16 тонн",
  expected_audience: 500
});
```

#### **2. Бюджет**
```typescript
// Добавить бюджетные статьи
await createBudgetItems([
  { category: "venue_rental", amount_planned: 150000 },
  { category: "sound", amount_planned: 50000 },
  { category: "lighting", amount_planned: 30000 },
  { category: "team", amount_planned: 100000 }
]);
```

#### **3. Билеты**
```typescript
// Создать типы билетов
await createTickets([
  {
    ticket_type: "early_bird",
    price: 1500,
    quantity_total: 100
  },
  {
    ticket_type: "standard",
    price: 2000,
    quantity_total: 300
  },
  {
    ticket_type: "vip",
    price: 5000,
    quantity_total: 50
  }
]);
```

#### **4. Команда**
```typescript
// Собрать команду
await addTeamMembers([
  { role: "sound_engineer", member_name: "Алексей" },
  { role: "light_engineer", member_name: "Петр" },
  { role: "photographer", member_name: "Мария" }
]);
```

#### **5. Райдеры**
```typescript
// Отправить технический райдер
await createRider({
  rider_type: "technical",
  requirements: [...],
  status: "sent"
});
```

#### **6. Продвижение**
```typescript
// Запустить рекламу
await createPromotion({
  channel: "social_media",
  budget: 50000,
  start_date: "2026-05-01"
});
```

#### **7. Продажа билетов**
```typescript
// Билет куплен автоматически через форму
// Триггер автоматически обновит quantity_sold
```

#### **8. День мероприятия**
```typescript
// Расписание
await createTimeline([
  { type: "load_in", time: "14:00" },
  { type: "soundcheck", time: "17:00" },
  { type: "doors_open", time: "19:00" },
  { type: "main_act", time: "21:00" }
]);

// Check-in посетителей
await checkIn(saleId);
```

#### **9. После мероприятия**
```typescript
// Собрать фидбэк
const feedback = await getFeedback(eventId);

// Финансовый отчет
const financials = await getFinancialSummary(eventId);
```

---

## 💰 Ценообразование

### Базовые услуги Event Management

| Услуга | Цена | Описание |
|--------|------|----------|
| **Консультация** | 5,000₽ | Помощь в выборе площадки |
| **Организация концерта** | 50,000₽ | Полная организация (клуб) |
| **Организация фестиваля** | 300,000₽ | Полная организация (фестиваль) |
| **Турне (3+ города)** | 500,000₽ | Организация тура |

### Дополнительные услуги

| Услуга | Цена | Описание |
|--------|------|----------|
| Система продажи билетов | 10,000₽ | Настройка онлайн-продаж |
| Продвижение концерта | от 30,000₽ | Реклама мероприятия |
| Технический райдер | 15,000₽ | Подготовка technical rider |
| Фото/видео съемка | от 25,000₽ | Профессиональная съемка |

### Сервисные сборы

- **Билеты онлайн**: 5-10% от цены билета
- **Эквайринг**: 2-3%
- **SMS уведомления**: 5₽/шт

---

## 📊 Метрики и KPI

### Ключевые показатели

1. **Sell-through Rate** - процент проданных билетов от доступных
2. **Fill Rate** - процент заполненности площадки
3. **Attendance Rate** - процент пришедших от купивших
4. **Revenue per Head** - средняя выручка на человека
5. **Marketing ROI** - возврат инвестиций в маркетинг
6. **Profit Margin** - маржа прибыли

### Формулы

```typescript
// Sell-through Rate
sell_through_rate = (tickets_sold / capacity) * 100

// Attendance Rate
attendance_rate = (checked_in / tickets_sold) * 100

// Revenue per Head
revenue_per_head = total_revenue / tickets_sold

// Marketing ROI
marketing_roi = ((ticket_revenue / marketing_budget) - 1) * 100

// Profit Margin
profit_margin = ((revenue - expenses) / revenue) * 100
```

---

## 🚀 Примеры API Endpoints

### Мероприятия
```typescript
GET    /api/events                    - Список мероприятий
POST   /api/events                    - Создать мероприятие
GET    /api/events/:id                - Детали мероприятия
PATCH  /api/events/:id                - Обновить мероприятие
DELETE /api/events/:id                - Удалить мероприятие
```

### Площадки
```typescript
GET    /api/venues                    - Список площадок
POST   /api/venues                    - Добавить площадку
GET    /api/venues/:id                - Детали площадки
```

### Билеты
```typescript
GET    /api/events/:id/tickets        - Типы билетов
POST   /api/events/:id/tickets        - Создать тип билета
POST   /api/tickets/:id/purchase      - Купить билет
POST   /api/sales/:id/check-in        - Check-in
```

### Финансы
```typescript
GET    /api/events/:id/financial      - Финансовая сводка
GET    /api/events/:id/budget          - Бюджет
POST   /api/events/:id/budget          - Добавить статью бюджета
```

---

## 📚 Дополнительно

### Полезные ссылки

- SQL миграция: `/supabase/migrations/007_event_management_extended.sql`
- Базовая таблица: `/supabase/migrations/001_promotion_tables.sql` (event_requests)

### Демо-данные

В миграции включены 3 демо-площадки:
- Клуб 16 тонн (Москва, 500 чел)
- ГлавClub (Москва, 1500 чел)
- Космонавт (СПб, 800 чел)

---

## ✅ Чеклист внедрения

- [ ] Выполнить SQL миграцию `001_promotion_tables.sql`
- [ ] Выполнить SQL миграцию `007_event_management_extended.sql`
- [ ] Настроить RLS политики
- [ ] Создать API endpoints
- [ ] Реализовать UI компоненты
- [ ] Интегрировать платежную систему
- [ ] Настроить Email уведомления
- [ ] Добавить SMS уведомления
- [ ] Генерация QR-кодов билетов
- [ ] Мобильное приложение для check-in

---

## 🎉 Готово!

Теперь у вас полноценная система управления мероприятиями! 🚀
