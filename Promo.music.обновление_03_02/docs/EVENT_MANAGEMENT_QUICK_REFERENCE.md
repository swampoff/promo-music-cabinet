# 🎤 EVENT MANAGEMENT - QUICK REFERENCE

## 🗂️ Таблицы (10 шт)

```
1. event_venues       - Площадки и залы
2. event_tickets      - Типы билетов
3. event_sales        - Продажи билетов
4. event_team         - Команда мероприятия
5. event_riders       - Технические райдеры
6. event_budget       - Бюджет и расходы
7. event_promotion    - Продвижение
8. event_timeline     - Расписание/тайминг
9. event_feedback     - Отзывы
10. event_setlists    - Сет-листы
```

---

## 📋 Быстрые SQL запросы

### Добавить площадку
```sql
INSERT INTO event_venues (
  id, artist_id, venue_name, venue_type,
  city, capacity, rental_price
) VALUES (
  'venue_001', 'artist_123', 
  'Клуб 16 тонн', 'club',
  'Москва', 500, 150000
);
```

### Создать мероприятие (базовая таблица)
```sql
INSERT INTO event_requests (
  id, artist_id, event_name, event_type,
  city, venue, event_date, expected_audience
) VALUES (
  'event_001', 'artist_123',
  'Летний концерт', 'concert',
  'Москва', 'Клуб 16 тонн', 
  '2026-06-01', 500
);
```

### Создать тип билета
```sql
INSERT INTO event_tickets (
  id, event_id, ticket_type, ticket_name,
  price, quantity_total, sale_start
) VALUES (
  'ticket_001', 'event_001', 
  'standard', 'Обычный билет',
  2000, 300, '2026-05-01'
);
```

### Продать билет
```sql
INSERT INTO event_sales (
  id, event_id, ticket_id,
  buyer_name, buyer_email, quantity,
  unit_price, total_price, payment_status
) VALUES (
  'sale_001', 'event_001', 'ticket_001',
  'Иван Петров', 'ivan@example.com', 2,
  2000, 4000, 'completed'
);
-- Триггер автоматически обновит quantity_sold!
```

### Check-in посетителя
```sql
UPDATE event_sales
SET checked_in = true, 
    checked_in_at = NOW()
WHERE id = 'sale_001';
```

### Получить предстоящие мероприятия
```sql
SELECT * FROM upcoming_events
WHERE artist_id = 'artist_123'
ORDER BY event_date ASC;
```

### Финансовая сводка
```sql
SELECT 
  event_name,
  ticket_revenue,
  expenses_actual,
  profit,
  marketing_roi
FROM event_financial_summary
WHERE event_id = 'event_001';
```

### Статистика посещаемости
```sql
SELECT * FROM event_attendance_stats
WHERE event_id = 'event_001';
```

### Топ площадок по выручке
```sql
SELECT * FROM top_venues_by_revenue
WHERE artist_id = 'artist_123'
LIMIT 10;
```

---

## 💰 Ценообразование

### Типы билетов (примеры)

| Тип | Цена | Описание |
|-----|------|----------|
| Early Bird | 1,500₽ | Ранняя покупка (-30%) |
| Standard | 2,000₽ | Обычный билет |
| VIP | 5,000₽ | VIP зона |
| Backstage | 10,000₽ | Meet & Greet |
| Table | 15,000₽ | Столик на 4 чел |

### Услуги организации

| Услуга | Цена |
|--------|------|
| Клуб (до 500 чел) | 50,000₽ |
| Концертный зал (500-2000) | 150,000₽ |
| Арена (2000+) | 500,000₽ |
| Фестиваль | 1,000,000₽ |

### Сервисные сборы

- **Онлайн продажа**: 5-10% от цены
- **Эквайринг**: 2-3%
- **SMS уведомления**: 5₽/шт

---

## 🎯 Типы данных

### Venue Types
```
club            - Клуб
concert_hall    - Концертный зал
arena           - Арена
stadium         - Стадион
festival_ground - Фестивальная площадка
bar             - Бар
restaurant      - Ресторан
outdoor         - Открытая площадка
theater         - Театр
```

### Ticket Types
```
early_bird  - Ранняя покупка
standard    - Обычный
vip         - VIP
backstage   - Backstage pass
table       - Столик
fan_zone    - Фан-зона
seated      - Сидячие места
standing    - Стоячие места
online      - Онлайн трансляция
```

### Payment Methods
```
online        - Онлайн оплата
cash          - Наличные
card          - Карта
bank_transfer - Банковский перевод
crypto        - Криптовалюта
```

### Payment Status
```
pending   - Ожидает оплаты
completed - Оплачен
failed    - Ошибка оплаты
refunded  - Возврат
cancelled - Отменен
```

### Team Roles
```
manager         - Менеджер
sound_engineer  - Звукорежиссер
light_engineer  - Светорежиссер
stage_manager   - Директор сцены
security        - Охрана
photographer    - Фотограф
videographer    - Видеограф
promoter        - Промоутер
dj              - DJ
host            - Ведущий
backup_artist   - Бэк-вокалист
```

### Rider Types
```
technical   - Технический райдер
hospitality - Hospitality райдер
stage_plot  - Stage plot
input_list  - Input list
lighting    - Световой план
backline    - Backline оборудование
```

### Budget Categories
```
venue_rental    - Аренда площадки
equipment       - Оборудование
sound           - Звук
lighting        - Свет
team            - Команда/персонал
marketing       - Маркетинг
hospitality     - Hospitality
transportation  - Транспорт
accommodation   - Проживание
permits         - Разрешения
insurance       - Страхование
merchandise     - Мерч
```

### Timeline Types
```
load_in     - Загрузка оборудования
soundcheck  - Саундчек
doors_open  - Открытие дверей
opener      - Разогрев
main_act    - Основное выступление
break       - Перерыв
encore      - Encore
load_out    - Выгрузка
```

---

## 📊 Метрики

### Sell-through Rate
```typescript
// Процент проданных билетов
sell_through = (tickets_sold / capacity) * 100

Пример:
Продано: 350
Вместимость: 500
= (350 / 500) * 100 = 70%
```

### Attendance Rate
```typescript
// Процент пришедших
attendance = (checked_in / tickets_sold) * 100

Пример:
Пришло: 320
Продано: 350
= (320 / 350) * 100 = 91.4%
```

### Revenue per Head
```typescript
// Средняя выручка на человека
rph = total_revenue / tickets_sold

Пример:
Выручка: 700,000₽
Продано: 350
= 700,000 / 350 = 2,000₽
```

### Marketing ROI
```typescript
// Возврат инвестиций в маркетинг
roi = ((revenue / marketing_budget) - 1) * 100

Пример:
Выручка: 700,000₽
Маркетинг: 50,000₽
= ((700,000 / 50,000) - 1) * 100 = 1,300%
```

### Profit Margin
```typescript
// Маржа прибыли
margin = ((revenue - expenses) / revenue) * 100

Пример:
Выручка: 700,000₽
Расходы: 400,000₽
= ((700,000 - 400,000) / 700,000) * 100 = 42.9%
```

---

## 🚀 Workflow

### Полный цикл организации концерта

```
1. Создать мероприятие (event_requests)
   ↓
2. Выбрать площадку (event_venues)
   ↓
3. Создать бюджет (event_budget)
   ↓
4. Настроить билеты (event_tickets)
   ↓
5. Собрать команду (event_team)
   ↓
6. Отправить райдер (event_riders)
   ↓
7. Запустить продвижение (event_promotion)
   ↓
8. Продажа билетов (event_sales)
   ↓
9. Создать расписание (event_timeline)
   ↓
10. Подготовить сет-лист (event_setlists)
   ↓
11. День мероприятия (check-in)
   ↓
12. Собрать фидбэк (event_feedback)
   ↓
13. Финансовый отчет (event_financial_summary)
```

---

## 📁 Файлы

### SQL миграции
```
/supabase/migrations/001_promotion_tables.sql
/supabase/migrations/007_event_management_extended.sql
```

### Документация
```
/docs/README_EVENT_MANAGEMENT.md              - Полная документация
/docs/EVENT_MANAGEMENT_QUICK_REFERENCE.md     - Эта шпаргалка
```

---

## ⚡ Быстрый старт

### Шаг 1: Выполнить SQL
```bash
1. Открыть Supabase Dashboard
2. SQL Editor → New Query
3. Скопировать весь код из 001_promotion_tables.sql
4. Run
5. Скопировать весь код из 007_event_management_extended.sql
6. Run
```

### Шаг 2: Проверить таблицы
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'event_%';
```

### Шаг 3: Добавить демо-площадки
```sql
-- Уже включены в миграцию!
SELECT * FROM event_venues WHERE artist_id = 'demo_artist';
```

---

## 🎨 UI Компоненты (TODO)

### Страницы
```
/events                          - Список мероприятий
/events/new                      - Создать мероприятие
/events/:id                      - Детали мероприятия
/events/:id/tickets              - Управление билетами
/events/:id/team                 - Команда
/events/:id/budget               - Бюджет
/events/:id/promotion            - Продвижение
/events/:id/timeline             - Расписание
/events/:id/analytics            - Аналитика
/venues                          - База площадок
```

### Компоненты
```tsx
<EventCard />                 - Карточка мероприятия
<VenueSelector />             - Выбор площадки
<TicketBuilder />             - Конструктор билетов
<TeamManager />               - Управление командой
<BudgetTracker />             - Отслеживание бюджета
<PromotionDashboard />        - Дашборд продвижения
<TimelineEditor />            - Редактор расписания
<CheckInScanner />            - QR сканер для check-in
<FeedbackCollector />         - Сбор отзывов
<FinancialReport />           - Финансовый отчет
```

---

## 💡 Pro Tips

1. **Используйте триггеры** - quantity_sold обновляется автоматически
2. **Создавайте Early Bird** - стимулируйте ранние покупки
3. **Отслеживайте check-in** - attendance_rate покажет реальность
4. **Собирайте фидбэк** - улучшайте следующие события
5. **Анализируйте площадки** - используйте top_venues_by_revenue
6. **Контролируйте бюджет** - amount_planned vs amount_actual
7. **Измеряйте ROI** - оптимизируйте маркетинг

---

## 🔥 Hot Queries

### Сколько заработали?
```sql
SELECT 
  event_name,
  ticket_revenue,
  profit
FROM event_financial_summary
WHERE artist_id = 'artist_123'
ORDER BY profit DESC;
```

### Сколько билетов осталось?
```sql
SELECT 
  event_name,
  tickets_remaining,
  fill_rate_percent
FROM upcoming_events
WHERE artist_id = 'artist_123';
```

### Какие площадки лучшие?
```sql
SELECT 
  venue_name,
  city,
  total_revenue,
  avg_venue_rating
FROM top_venues_by_revenue
WHERE artist_id = 'artist_123'
LIMIT 5;
```

### Кто не пришел?
```sql
SELECT 
  buyer_name,
  buyer_email,
  quantity
FROM event_sales
WHERE event_id = 'event_001'
  AND payment_status = 'completed'
  AND checked_in = false;
```

---

## 📞 Support

Вопросы? Смотри:
- `/docs/README_EVENT_MANAGEMENT.md` - полная документация
- `/supabase/migrations/007_event_management_extended.sql` - SQL код

---

**✅ SQL готов! Организуй концерты как профи! 🚀**
