# 🧪 PROMO LAB - SQL СТРУКТУРА

## 📋 Обзор

Полная SQL структура для системы экспериментального продвижения PROMO Lab с AI-таргетингом, вирусным маркетингом, NFT и детальной аналитикой.

**Файлы миграций:**
- `/supabase/migrations/001_promotion_tables.sql` (базовая таблица)
- `/supabase/migrations/20260128_promo_lab_extended.sql` (расширенная система)

---

## 🗄️ Таблицы

### 1️⃣ **`promo_lab_experiments`** - Основная таблица экспериментов

Хранит информацию о запущенных экспериментах.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | TEXT | Primary key |
| `artist_id` | TEXT | ID артиста |
| `experiment_name` | TEXT | Название эксперимента |
| `experiment_type` | TEXT | Тип (см. ниже) |
| `hypothesis` | TEXT | Гипотеза (что хотим проверить) |
| `description` | TEXT | Подробное описание |
| `budget` | INTEGER | Бюджет в рублях |
| `duration_days` | INTEGER | Длительность (дней) |
| `status` | TEXT | Статус (см. ниже) |
| `metrics` | JSONB | Текущие метрики |
| `results` | JSONB | Результаты |
| `learning` | TEXT | Выводы и обучение |
| `created_at` | TIMESTAMP | Дата создания |
| `updated_at` | TIMESTAMP | Дата обновления |

#### Типы экспериментов (`experiment_type`):

```
ai_targeting      → AI-таргетинг (ML алгоритмы подбора аудитории)
viral_challenge   → Вирусный челлендж (создание трендов)
nft_drop          → NFT Drop (запуск коллекции NFT)
meta_collab       → Мета-коллаборации (неожиданные партнёрства)
custom            → Кастомный эксперимент (уникальная идея)
```

#### Статусы эксперимента (`status`):

```
draft      → Черновик (создан, но не запущен)
running    → Идёт эксперимент (активно)
analyzing  → Анализ результатов
completed  → Завершён успешно
failed     → Не удалось
cancelled  → Отменён
```

#### Индексы:
- `idx_lab_artist` - поиск по артисту
- `idx_lab_status` - фильтр по статусу
- `idx_lab_type` - фильтр по типу

---

### 2️⃣ **`promo_lab_events`** - События эксперимента

Хранит все важные события в жизненном цикле эксперимента.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | BIGSERIAL | Primary key (автоинкремент) |
| `experiment_id` | TEXT | FK → promo_lab_experiments(id) |
| `event_type` | TEXT | Тип события (см. ниже) |
| `event_title` | TEXT | Заголовок события |
| `event_description` | TEXT | Описание |
| `metrics_snapshot` | JSONB | Снимок метрик на момент события |
| `triggered_by` | TEXT | Кто/что вызвало: `auto`, `manual`, `ai` |
| `severity` | TEXT | Важность: `info`, `warning`, `success`, `error` |
| `attachments` | TEXT[] | Ссылки на файлы (скриншоты, видео) |
| `created_at` | TIMESTAMP | Время события |

#### Типы событий (`event_type`):

```
started         → Эксперимент запущен
milestone       → Промежуточная веха достигнута
insight         → Получен новый инсайт
optimization    → Произведена оптимизация
pause           → Приостановлен
resume          → Возобновлён
completed       → Завершён
failed          → Провалился
cancelled       → Отменён
external_event  → Внешнее событие (упоминание в медиа, вирусность)
```

#### Индексы:
- `idx_lab_events_experiment` - события конкретного эксперимента
- `idx_lab_events_type` - фильтр по типу
- `idx_lab_events_created` - сортировка по времени
- `idx_lab_events_severity` - фильтр по важности

**💡 Используется для:**
- Хронологии событий
- Отслеживания прогресса
- Анализа причин успеха/провала

---

### 3️⃣ **`promo_lab_metrics_daily`** - Дневная аналитика

Детальная статистика эксперимента по дням.

#### Категории метрик:

##### **📡 Охват:**
| Поле | Тип | Описание |
|------|-----|----------|
| `reach` | INTEGER | Охват (всего людей) |
| `impressions` | INTEGER | Показы |
| `unique_views` | INTEGER | Уникальные просмотры |

##### **❤️ Вовлечённость:**
| Поле | Тип | Описание |
|------|-----|----------|
| `engagement_rate` | DECIMAL(5,2) | Вовлечённость (%) - автоматически |
| `likes` | INTEGER | Лайки |
| `comments` | INTEGER | Комментарии |
| `shares` | INTEGER | Репосты |
| `saves` | INTEGER | Сохранения |

##### **🎯 Конверсии:**
| Поле | Тип | Описание |
|------|-----|----------|
| `conversions` | INTEGER | Конверсии (клики, переходы, подписки) |
| `conversion_rate` | DECIMAL(5,2) | Конверсия (%) - автоматически |
| `leads` | INTEGER | Лиды |

##### **🦠 Вирусность (для viral_challenge):**
| Поле | Тип | Описание |
|------|-----|----------|
| `viral_coefficient` | DECIMAL(5,2) | K-factor (вирусный коэффициент) |
| `ugc_count` | INTEGER | User-generated контент |
| `trending_score` | INTEGER | Трендовость (0-100) |

##### **💰 Стоимость:**
| Поле | Тип | Описание |
|------|-----|----------|
| `spend` | DECIMAL(10,2) | Потрачено за день (₽) |
| `cpm` | DECIMAL(10,2) | Cost per mille - автоматически |
| `cpc` | DECIMAL(10,2) | Cost per click - автоматически |
| `cpa` | DECIMAL(10,2) | Cost per acquisition - автоматически |

##### **🤖 AI метрики (для ai_targeting):**
| Поле | Тип | Описание |
|------|-----|----------|
| `ai_confidence` | DECIMAL(5,2) | Уверенность AI (0-100) |
| `prediction_accuracy` | DECIMAL(5,2) | Точность предсказаний (%) |

##### **😊 Тональность:**
| Поле | Тип | Описание |
|------|-----|----------|
| `sentiment_score` | DECIMAL(5,2) | Тональность (-100 до +100) |
| `positive_mentions` | INTEGER | Позитивные упоминания |
| `negative_mentions` | INTEGER | Негативные упоминания |

#### Дополнительно:
- `raw_data` JSONB - для любых кастомных метрик
- `date` DATE - дата статистики
- `UNIQUE(experiment_id, date)` - одна запись на день на эксперимент

#### Индексы:
- `idx_lab_metrics_experiment` - метрики эксперимента
- `idx_lab_metrics_date` - сортировка по дате
- `idx_lab_metrics_trending` - сортировка по трендовости

**💡 Автоматический расчёт:**
```sql
-- При INSERT/UPDATE автоматически рассчитываются:
engagement_rate = ((likes + comments + shares + saves) / impressions) * 100
conversion_rate = (conversions / unique_views) * 100
cpm = spend / (impressions / 1000)
cpc = spend / conversions
cpa = spend / leads
```

---

### 4️⃣ **`promo_lab_insights`** - Инсайты и выводы

AI и человеческие инсайты из экспериментов.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | BIGSERIAL | Primary key |
| `experiment_id` | TEXT | FK → promo_lab_experiments(id) |
| `insight_type` | TEXT | Тип инсайта (см. ниже) |
| `title` | TEXT | Заголовок |
| `description` | TEXT | Описание |
| `importance` | TEXT | `low`, `medium`, `high`, `critical` |
| `confidence` | DECIMAL(5,2) | Уверенность (0-100%) |
| `supporting_metrics` | JSONB | Подтверждающие метрики |
| `evidence_urls` | TEXT[] | Ссылки на доказательства |
| `actionable` | BOOLEAN | Можно ли применить |
| `recommended_action` | TEXT | Рекомендуемое действие |
| `action_taken` | BOOLEAN | Действие выполнено |
| `action_result` | TEXT | Результат действия |
| `ai_generated` | BOOLEAN | Создано AI |
| `ai_model` | TEXT | Модель AI (GPT-4, Claude и т.д.) |
| `status` | TEXT | `active`, `applied`, `dismissed`, `outdated` |

#### Типы инсайтов (`insight_type`):

```
discovery          → Открытие (новый паттерн, закономерность)
optimization       → Рекомендация по оптимизации
warning            → Предупреждение (риск)
success_pattern    → Успешный паттерн (повторить)
failure_pattern    → Провальный паттерн (избегать)
ai_recommendation  → Рекомендация AI
market_trend       → Рыночный тренд
```

#### Индексы:
- `idx_lab_insights_experiment` - инсайты эксперимента
- `idx_lab_insights_type` - фильтр по типу
- `idx_lab_insights_importance` - фильтр по важности
- `idx_lab_insights_status` - фильтр по статусу
- `idx_lab_insights_created` - сортировка по дате

**💡 Используется для:**
- Обучения на результатах
- AI-рекомендаций
- Базы знаний

---

### 5️⃣ **`promo_lab_resources`** - Ресурсы эксперимента

Все материалы и активы эксперимента.

#### Основные поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | BIGSERIAL | Primary key |
| `experiment_id` | TEXT | FK → promo_lab_experiments(id) |
| `resource_type` | TEXT | Тип ресурса (см. ниже) |
| `title` | TEXT | Название |
| `description` | TEXT | Описание |
| `file_url` | TEXT | URL файла |
| `file_type` | TEXT | MIME type (`image/png`, `video/mp4`) |
| `file_size` | INTEGER | Размер в байтах |
| `metadata` | JSONB | Дополнительные данные |
| `performance_score` | DECIMAL(5,2) | Эффективность (0-100) |
| `usage_count` | INTEGER | Сколько раз использован |
| `status` | TEXT | `active`, `archived`, `deleted` |

#### Типы ресурсов (`resource_type`):

```
creative        → Креатив (изображение, видео, дизайн)
landing_page    → Лендинг пейдж
smart_contract  → Смарт-контракт (для NFT)
influencer      → Инфлюенсер (профиль, контакты)
ad_copy         → Рекламный текст
dataset         → Датасет (для AI)
documentation   → Документация
report          → Отчёт
other           → Другое
```

#### Индексы:
- `idx_lab_resources_experiment` - ресурсы эксперимента
- `idx_lab_resources_type` - фильтр по типу
- `idx_lab_resources_status` - фильтр по статусу
- `idx_lab_resources_created` - сортировка по дате

**💡 Используется для:**
- Хранения креативов и материалов
- A/B тестирования (через performance_score)
- Архива эксперимента

---

## ⚡ Автоматизация

### 🔄 Триггеры

#### 1. **Автообновление `updated_at`**
```sql
-- На таблицах: promo_lab_metrics_daily, promo_lab_insights, promo_lab_resources
CREATE TRIGGER trigger_update_lab_*_updated_at
  BEFORE UPDATE
  EXECUTE FUNCTION update_promo_lab_updated_at();
```

#### 2. **Автоматический расчёт метрик**
```sql
CREATE TRIGGER trigger_calculate_lab_metrics
  BEFORE INSERT OR UPDATE ON promo_lab_metrics_daily
  EXECUTE FUNCTION calculate_promo_lab_metrics();
```
Автоматически рассчитывает:
- `engagement_rate`
- `conversion_rate`
- `cpm`, `cpc`, `cpa`

#### 3. **Логирование изменений статуса**
```sql
CREATE TRIGGER trigger_log_experiment_status
  AFTER UPDATE ON promo_lab_experiments
  EXECUTE FUNCTION log_experiment_status_change();
```
Автоматически создаёт событие в `promo_lab_events` при смене статуса.

---

### 🛠️ Функции

#### 1. **`calculate_promo_lab_metrics()`**
Автоматически рассчитывает все производные метрики.

#### 2. **`log_experiment_status_change()`**
Создаёт событие при изменении статуса эксперимента.

#### 3. **`update_promo_lab_updated_at()`**
Обновляет поле `updated_at` при изменении записи.

---

## 📊 Views (Представления)

### 1. **`promo_lab_experiments_with_stats`**

Эксперименты с агрегированной статистикой:

```sql
SELECT * FROM promo_lab_experiments_with_stats;
```

**Дополнительные поля:**
- `total_reach` - общий охват
- `total_impressions` - всего показов
- `total_conversions` - всего конверсий
- `total_spend` - всего потрачено
- `avg_engagement_rate` - средняя вовлечённость
- `avg_conversion_rate` - средняя конверсия
- `avg_sentiment` - средняя тональность
- `roi_percentage` - ROI в процентах
- `events_count` - количество событий
- `insights_count` - количество активных инсайтов
- `resources_count` - количество ресурсов
- `days_running` - дней с начала

---

### 2. **`promo_lab_top_performers`**

Топ эксперименты по эффективности:

```sql
SELECT * FROM promo_lab_top_performers
ORDER BY roi DESC
LIMIT 10;
```

**Поля:**
- `id`, `artist_id`, `experiment_name`, `experiment_type`
- `status`, `budget`
- `total_reach`, `total_conversions`
- `avg_engagement`, `avg_viral_coefficient`
- `roi` - ROI в процентах
- `created_at`

**Фильтр:** Минимум 1000 охвата для попадания в топ.

---

### 3. **`promo_lab_active_insights`**

Активные инсайты с приоритетом:

```sql
SELECT * FROM promo_lab_active_insights
ORDER BY priority_score DESC;
```

**Дополнительные поля:**
- `experiment_name`
- `experiment_type`
- `experiment_status`
- `priority_score` - расчётный приоритет (importance × confidence)

---

## 🔒 Row Level Security (RLS)

### Политики безопасности:

Все новые таблицы защищены RLS:

#### Для обычных пользователей:

1. **SELECT** - Видят только свои эксперименты (через FK):
```sql
USING (
  EXISTS (
    SELECT 1 FROM promo_lab_experiments
    WHERE id = [table].experiment_id
    AND artist_id = auth.uid()::TEXT
  )
)
```

2. **INSERT** - Могут добавлять данные в свои эксперименты
3. **UPDATE** - Могут обновлять свои данные
4. **DELETE** - Могут удалять свои ресурсы (только `promo_lab_resources`)

#### Для администраторов:

**ALL** - Полный доступ ко всем данным:
```sql
USING (auth.uid()->>'role' = 'admin')
```

---

## 💰 Тарифы (из кода)

### Типы экспериментов:

| Тип | Название | Базовая цена | Описание |
|-----|----------|--------------|----------|
| `ai_targeting` | AI-таргетинг | **25 000 ₽** | ML алгоритмы, A/B тесты, авто-оптимизация |
| `viral_challenge` | Вирусный челлендж | **35 000 ₽** | Креатив, сиды с инфлюенсерами, tracking |
| `nft_drop` | NFT Drop | **50 000 ₽** | Коллекция, смарт-контракты, маркетинг |
| `meta_collab` | Мета-коллаборации | **40 000 ₽** | Crossover контент, новая аудитория |
| `custom` | Кастомный | **30 000 ₽** | Индивидуальный подход, консультация |

### Скидки по подписке:

Применяется `subscription.limits.marketing_discount`:

| Подписка | Скидка |
|----------|--------|
| Basic | 0% |
| START | 5% |
| PRO | 15% |
| ЭЛИТ | 25% |

**Пример расчёта:**
```
AI-таргетинг (PRO подписка):
Базовая цена = 25 000 ₽
Скидка 15% = 3 750 ₽
Итого = 21 250 ₽
```

---

## 📈 Примеры запросов

### Получить все эксперименты артиста:
```sql
SELECT * FROM promo_lab_experiments
WHERE artist_id = 'artist_123'
ORDER BY created_at DESC;
```

### Активные эксперименты:
```sql
SELECT * FROM promo_lab_experiments
WHERE artist_id = 'artist_123'
  AND status = 'running';
```

### Статистика эксперимента за последние 7 дней:
```sql
SELECT 
  date,
  reach,
  impressions,
  engagement_rate,
  conversion_rate,
  viral_coefficient
FROM promo_lab_metrics_daily
WHERE experiment_id = 'exp_123'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### События эксперимента:
```sql
SELECT 
  event_type,
  event_title,
  severity,
  created_at
FROM promo_lab_events
WHERE experiment_id = 'exp_123'
ORDER BY created_at DESC;
```

### Активные инсайты эксперимента:
```sql
SELECT 
  insight_type,
  title,
  description,
  importance,
  confidence,
  recommended_action
FROM promo_lab_insights
WHERE experiment_id = 'exp_123'
  AND status = 'active'
  AND actionable = TRUE
ORDER BY 
  (CASE importance
    WHEN 'critical' THEN 4
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 1
  END) DESC;
```

### Общая статистика артиста:
```sql
SELECT 
  COUNT(*) as total_experiments,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'running') as running,
  SUM(budget) as total_budget,
  AVG(
    CASE 
      WHEN budget > 0 THEN 
        ((metrics->>'conversions')::INTEGER * 100 - budget)::DECIMAL / budget * 100
      ELSE 0
    END
  ) as avg_roi
FROM promo_lab_experiments
WHERE artist_id = 'artist_123';
```

### Топ 5 эксперименов по вирусности:
```sql
SELECT 
  e.experiment_name,
  AVG(m.viral_coefficient) as avg_viral,
  AVG(m.trending_score) as avg_trending,
  SUM(m.ugc_count) as total_ugc
FROM promo_lab_experiments e
JOIN promo_lab_metrics_daily m ON m.experiment_id = e.id
WHERE e.artist_id = 'artist_123'
  AND e.experiment_type = 'viral_challenge'
GROUP BY e.id, e.experiment_name
ORDER BY avg_viral DESC
LIMIT 5;
```

### AI инсайты с высокой уверенностью:
```sql
SELECT 
  i.title,
  i.description,
  i.confidence,
  i.recommended_action,
  e.experiment_name
FROM promo_lab_insights i
JOIN promo_lab_experiments e ON e.id = i.experiment_id
WHERE e.artist_id = 'artist_123'
  AND i.ai_generated = TRUE
  AND i.confidence >= 80
  AND i.status = 'active'
ORDER BY i.confidence DESC;
```

---

## 🔧 Интеграция с Backend

### API endpoints в `/supabase/functions/server/promotion-routes.tsx`:

1. **GET `/api/promotion/promolab/:artistId`** - Получить эксперименты
2. **POST `/api/promotion/promolab/submit`** - Создать эксперимент
3. **GET `/api/promotion/promolab/:id/metrics`** - Метрики эксперимента
4. **GET `/api/promotion/promolab/:id/events`** - События
5. **GET `/api/promotion/promolab/:id/insights`** - Инсайты
6. **POST `/api/promotion/promolab/:id/insight`** - Добавить инсайт
7. **GET `/api/promotion/promolab/:id/resources`** - Ресурсы
8. **POST `/api/promotion/promolab/:id/resource`** - Добавить ресурс

---

## 🎯 Workflow эксперимента

```
1. Создание эксперимента
   ↓ status = 'draft'
   
2. Артист оплачивает
   ↓ Создаётся запись в promotion_transactions
   
3. Эксперимент запускается
   ↓ status = 'running'
   ↓ Создаётся событие 'started'
   
4. Идёт эксперимент (14-30 дней)
   ↓ Каждый день добавляется статистика в promo_lab_metrics_daily
   ↓ AI генерирует инсайты в promo_lab_insights
   ↓ Важные события логируются в promo_lab_events
   
5. Анализ результатов
   ↓ status = 'analyzing'
   
6. Завершение
   ↓ status = 'completed' (или 'failed')
   ↓ Создаётся событие 'completed'
   ↓ Генерируется финальный отчёт
```

---

## 📱 Интеграция с Frontend

### Компонент:

**`/src/app/pages/PromotionPromoLab.tsx`** - Страница PROMO Lab

**Функционал:**
- ✅ Создание эксперимента (5 типов)
- ✅ Список экспериментов
- ✅ Статусы и прогресс
- ✅ Расчёт стоимости со скидкой по подписке

---

## 🚀 Миграции

### Применить обе миграции:

#### 1. Базовая (уже должна быть):
```sql
-- Из /supabase/migrations/001_promotion_tables.sql
-- Создаёт promo_lab_experiments
```

#### 2. Расширенная:
```sql
-- Из /supabase/migrations/20260128_promo_lab_extended.sql
-- Создаёт 4 дополнительные таблицы + views + функции
```

### Через Supabase Dashboard:
1. SQL Editor
2. Вставить код
3. Run

### Через CLI:
```bash
supabase db push
```

---

## ✅ Проверка установки

```sql
-- Проверить таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'promo_lab%'
ORDER BY table_name;

-- Ожидается:
-- promo_lab_events
-- promo_lab_experiments
-- promo_lab_insights
-- promo_lab_metrics_daily
-- promo_lab_resources

-- Проверить views
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'promo_lab%';

-- Ожидается:
-- promo_lab_active_insights
-- promo_lab_experiments_with_stats
-- promo_lab_top_performers

-- Проверить функции
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%promo_lab%';

-- Ожидается:
-- calculate_promo_lab_metrics
-- log_experiment_status_change
-- update_promo_lab_updated_at
```

---

## 📚 Связанные файлы

- **SQL (базовая):** `/supabase/migrations/001_promotion_tables.sql`
- **SQL (расширенная):** `/supabase/migrations/20260128_promo_lab_extended.sql`
- **Backend:** `/supabase/functions/server/promotion-routes.tsx`
- **Frontend:** `/src/app/pages/PromotionPromoLab.tsx`

---

## 🎉 Готово!

SQL структура полностью готова к использованию. Система поддерживает:

✅ 5 типов экспериментов  
✅ Детальную аналитику (20+ метрик)  
✅ AI инсайты и рекомендации  
✅ Вирусные метрики (K-factor, trending)  
✅ Управление ресурсами  
✅ Хронологию событий  
✅ ROI и cost метрики  
✅ Автоматический расчёт показателей  
✅ Row Level Security  
✅ Views для быстрой аналитики  

---

**Дата создания:** 28 января 2026  
**Версия:** 1.0  
**Статус:** ✅ Production Ready
