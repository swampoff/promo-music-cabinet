# 🗂️ PROMO LAB - СХЕМА БД

## 📊 Визуальная схема

```
┌──────────────────────────────────────────────────────────────┐
│                  PROMO_LAB_EXPERIMENTS                        │
│                    (Основная таблица)                         │
├──────────────────────────────────────────────────────────────┤
│ PK  id                TEXT                                   │
│     artist_id         TEXT                                   │
│                                                              │
│ 🧪 ЭКСПЕРИМЕНТ:                                              │
│     experiment_name   TEXT                                   │
│     experiment_type   TEXT (ai/viral/nft/collab/custom)      │
│     hypothesis        TEXT (что проверяем)                   │
│     description       TEXT                                   │
│                                                              │
│ 💰 БЮДЖЕТ:                                                   │
│     budget            INTEGER (рубли)                        │
│     duration_days     INTEGER (дней)                         │
│                                                              │
│ 🔄 СТАТУС:                                                   │
│     status            TEXT (draft→running→completed)         │
│                                                              │
│ 📊 ДАННЫЕ:                                                   │
│     metrics           JSONB (текущие метрики)                │
│     results           JSONB (результаты)                     │
│     learning          TEXT (выводы)                          │
│                                                              │
│     created_at        TIMESTAMP                              │
│     updated_at        TIMESTAMP                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ FK: experiment_id
                              ↓
┌──────────────────────────┬─────────────────────────────────────┐
│                          │                                     │
│                          ↓                                     ↓
│  ┌────────────────────────────────┐  ┌─────────────────────────────────┐
│  │   PROMO_LAB_EVENTS            │  │  PROMO_LAB_METRICS_DAILY        │
│  │   (События эксперимента)      │  │  (Дневная аналитика)            │
│  ├────────────────────────────────┤  ├─────────────────────────────────┤
│  │ PK  id           BIGSERIAL     │  │ PK  id           BIGSERIAL      │
│  │ FK  experiment_id              │  │ FK  experiment_id               │
│  │                                │  │     date         DATE            │
│  │ 📅 СОБЫТИЕ:                    │  │                                 │
│  │     event_type   TEXT          │  │ 📡 ОХВАТ:                       │
│  │     event_title  TEXT          │  │     reach        INTEGER        │
│  │     event_description          │  │     impressions  INTEGER        │
│  │     metrics_snapshot  JSONB    │  │     unique_views INTEGER        │
│  │                                │  │                                 │
│  │ ⚙️  КОНТЕКСТ:                   │  │ ❤️  ВОВЛЕЧЁННОСТЬ:              │
│  │     triggered_by TEXT          │  │     engagement_rate  DECIMAL    │
│  │       (auto/manual/ai)         │  │     likes        INTEGER        │
│  │     severity     TEXT          │  │     comments     INTEGER        │
│  │       (info/warning/error)     │  │     shares       INTEGER        │
│  │     attachments  TEXT[]        │  │     saves        INTEGER        │
│  │                                │  │                                 │
│  │     created_at   TIMESTAMP     │  │ 🎯 КОНВЕРСИИ:                   │
│  └────────────────────────────────┘  │     conversions      INTEGER    │
│                                      │     conversion_rate  DECIMAL    │
│                                      │     leads            INTEGER    │
│                                      │                                 │
│                                      │ 🦠 ВИРУСНОСТЬ:                  │
│                                      │     viral_coefficient DECIMAL   │
│                                      │     ugc_count         INTEGER   │
│                                      │     trending_score    INTEGER   │
│                                      │                                 │
│                                      │ 💰 СТОИМОСТЬ:                   │
│                                      │     spend        DECIMAL        │
│                                      │     cpm          DECIMAL (auto) │
│                                      │     cpc          DECIMAL (auto) │
│                                      │     cpa          DECIMAL (auto) │
│                                      │                                 │
│                                      │ 🤖 AI МЕТРИКИ:                  │
│                                      │     ai_confidence        DECIMAL│
│                                      │     prediction_accuracy  DECIMAL│
│                                      │                                 │
│                                      │ 😊 ТОНАЛЬНОСТЬ:                 │
│                                      │     sentiment_score      DECIMAL│
│                                      │     positive_mentions    INTEGER│
│                                      │     negative_mentions    INTEGER│
│                                      │                                 │
│                                      │     raw_data     JSONB          │
│                                      │     created_at   TIMESTAMP      │
│                                      │     updated_at   TIMESTAMP      │
│                                      │                                 │
│                                      │ UNIQUE (experiment_id, date)    │
│                                      └─────────────────────────────────┘
│
│                          ↓                                     ↓
│  ┌────────────────────────────────┐  ┌─────────────────────────────────┐
│  │   PROMO_LAB_INSIGHTS          │  │  PROMO_LAB_RESOURCES            │
│  │   (Инсайты и выводы)          │  │  (Ресурсы и материалы)          │
│  ├────────────────────────────────┤  ├─────────────────────────────────┤
│  │ PK  id           BIGSERIAL     │  │ PK  id           BIGSERIAL      │
│  │ FK  experiment_id              │  │ FK  experiment_id               │
│  │                                │  │                                 │
│  │ 💡 ИНСАЙТ:                     │  │ 📦 РЕСУРС:                      │
│  │     insight_type TEXT          │  │     resource_type TEXT          │
│  │       (discovery/optimization/ │  │       (creative/landing/        │
│  │        ai_recommendation)      │  │        smart_contract/influencer│
│  │     title        TEXT          │  │        ad_copy/dataset/report)  │
│  │     description  TEXT          │  │     title         TEXT          │
│  │                                │  │     description   TEXT          │
│  │ 📊 ОЦЕНКА:                     │  │                                 │
│  │     importance   TEXT          │  │ 📁 ФАЙЛЫ:                       │
│  │       (low/medium/high/critical│  │     file_url      TEXT          │
│  │     confidence   DECIMAL (%)   │  │     file_type     TEXT          │
│  │                                │  │     file_size     INTEGER       │
│  │ 🎯 ДЕЙСТВИЕ:                   │  │     metadata      JSONB         │
│  │     actionable   BOOLEAN       │  │                                 │
│  │     recommended_action  TEXT   │  │ 📈 ЭФФЕКТИВНОСТЬ:               │
│  │     action_taken       BOOLEAN │  │     performance_score  DECIMAL  │
│  │     action_result      TEXT    │  │     usage_count       INTEGER   │
│  │                                │  │                                 │
│  │ 🤖 AI:                         │  │ 🔄 СТАТУС:                      │
│  │     ai_generated  BOOLEAN      │  │     status        TEXT          │
│  │     ai_model      TEXT         │  │       (active/archived/deleted) │
│  │       (gpt-4/claude/gemini)    │  │                                 │
│  │                                │  │     created_at    TIMESTAMP     │
│  │ 📋 ДОКАЗАТЕЛЬСТВА:             │  │     updated_at    TIMESTAMP     │
│  │     supporting_metrics  JSONB  │  └─────────────────────────────────┘
│  │     evidence_urls      TEXT[]  │
│  │                                │
│  │     status       TEXT          │
│  │       (active/applied/         │
│  │        dismissed/outdated)     │
│  │                                │
│  │     created_at   TIMESTAMP     │
│  │     updated_at   TIMESTAMP     │
│  └────────────────────────────────┘
```

---

## 🔗 Связи

```
promo_lab_experiments (1) ──┬── (N) promo_lab_events
                             │      Все события эксперимента
                             │      ON DELETE CASCADE
                             │
                             ├── (N) promo_lab_metrics_daily
                             │      Статистика по дням
                             │      ON DELETE CASCADE
                             │
                             ├── (N) promo_lab_insights
                             │      Инсайты и выводы
                             │      ON DELETE CASCADE
                             │
                             └── (N) promo_lab_resources
                                    Ресурсы и материалы
                                    ON DELETE CASCADE
```

---

## 📐 Индексы

### `promo_lab_experiments`:
```sql
idx_lab_artist      ON artist_id
idx_lab_status      ON status
idx_lab_type        ON experiment_type
```

### `promo_lab_events`:
```sql
idx_lab_events_experiment   ON experiment_id
idx_lab_events_type         ON event_type
idx_lab_events_created      ON created_at DESC
idx_lab_events_severity     ON severity
```

### `promo_lab_metrics_daily`:
```sql
idx_lab_metrics_experiment  ON experiment_id
idx_lab_metrics_date        ON date DESC
idx_lab_metrics_trending    ON trending_score DESC
UNIQUE (experiment_id, date)
```

### `promo_lab_insights`:
```sql
idx_lab_insights_experiment  ON experiment_id
idx_lab_insights_type        ON insight_type
idx_lab_insights_importance  ON importance
idx_lab_insights_status      ON status
idx_lab_insights_created     ON created_at DESC
```

### `promo_lab_resources`:
```sql
idx_lab_resources_experiment ON experiment_id
idx_lab_resources_type       ON resource_type
idx_lab_resources_status     ON status
idx_lab_resources_created    ON created_at DESC
```

---

## 🎯 Views (Расширенные представления)

### 1. `promo_lab_experiments_with_stats`

```
promo_lab_experiments + АГРЕГИРОВАННАЯ СТАТИСТИКА:
├── total_reach           = SUM(metrics_daily.reach)
├── total_impressions     = SUM(metrics_daily.impressions)
├── total_conversions     = SUM(metrics_daily.conversions)
├── total_spend           = SUM(metrics_daily.spend)
├── avg_engagement_rate   = AVG(metrics_daily.engagement_rate)
├── avg_conversion_rate   = AVG(metrics_daily.conversion_rate)
├── avg_sentiment         = AVG(metrics_daily.sentiment_score)
├── roi_percentage        = ((conversions * 100 - budget) / budget) * 100
├── events_count          = COUNT(events)
├── insights_count        = COUNT(insights WHERE status = 'active')
├── resources_count       = COUNT(resources WHERE status = 'active')
└── days_running          = NOW() - created_at (или updated_at - created_at)
```

### 2. `promo_lab_top_performers`

```
Топ эксперименты (reach > 1000) с:
├── total_reach
├── total_conversions
├── avg_engagement
├── avg_viral_coefficient
├── roi
└── ORDER BY roi DESC
```

### 3. `promo_lab_active_insights`

```
Активные инсайты (actionable = TRUE) с:
├── experiment_name
├── experiment_type
├── priority_score = importance_weight * confidence
└── ORDER BY priority_score DESC
```

---

## ⚡ Триггеры и автоматизация

### 1. **Автообновление `updated_at`**
```
TRIGGER: trigger_update_lab_*_updated_at
ON: promo_lab_metrics_daily, promo_lab_insights, promo_lab_resources
WHEN: BEFORE UPDATE
```

### 2. **Автоматический расчёт метрик**
```
TRIGGER: trigger_calculate_lab_metrics
ON: promo_lab_metrics_daily
WHEN: BEFORE INSERT OR UPDATE
CALCULATES:
├── engagement_rate = ((likes + comments + shares + saves) / impressions) * 100
├── conversion_rate = (conversions / unique_views) * 100
├── cpm = spend / (impressions / 1000)
├── cpc = spend / conversions
└── cpa = spend / leads
```

### 3. **Логирование смены статуса**
```
TRIGGER: trigger_log_experiment_status
ON: promo_lab_experiments
WHEN: AFTER UPDATE (if status changed)
CREATES EVENT IN: promo_lab_events
```

---

## 🔄 Жизненный цикл эксперимента

```
┌─────────────────────┐
│  1. Создание        │
│  draft              │
└──────────┬──────────┘
           │
           ↓ Оплата
┌─────────────────────┐
│  2. Запуск          │
│  running            │
│  + EVENT 'started'  │
└──────────┬──────────┘
           │
           │ Каждый день
           ↓
┌─────────────────────┐      ┌──────────────────────┐
│  3. Сбор данных     │─────→│  AI анализирует      │
│                     │      │  Генерирует insights │
│  promo_lab_metrics_ │      └──────────────────────┘
│  daily (daily)      │
│  + События          │
│  + Ресурсы          │
└──────────┬──────────┘
           │
           │ duration_days прошло
           ↓
┌─────────────────────┐
│  4. Анализ          │
│  analyzing          │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  5. Завершение      │
│  completed          │
│  + EVENT 'completed'│
│  + Финальный отчёт  │
└─────────────────────┘
```

---

## 📊 Поток данных

### Создание эксперимента:

```
1. Frontend → POST /api/promotion/promolab/submit
   {
     experiment_name: "AI таргетинг на молодёжь",
     experiment_type: "ai_targeting",
     hypothesis: "ML алгоритмы увеличат конверсию на 30%",
     budget: 21250,  // со скидкой 15%
     duration_days: 14
   }

2. Backend создаёт запись:
   INSERT INTO promo_lab_experiments (...)
   VALUES ('exp_001', 'artist_123', ..., 'draft')

3. После оплаты → status = 'running'
   TRIGGER автоматически создаёт:
   INSERT INTO promo_lab_events (experiment_id, event_type, ...)
   VALUES ('exp_001', 'started', ...)
```

### Ежедневный сбор метрик:

```
1. Каждый день система собирает данные:
   - Из рекламных платформ (Facebook, Google, VK)
   - Из социальных сетей (Instagram, TikTok, YouTube)
   - Из аналитики (Яндекс.Метрика, Google Analytics)

2. Данные агрегируются:
   INSERT INTO promo_lab_metrics_daily (
     experiment_id, date,
     reach, impressions, likes, comments, shares,
     conversions, spend
   ) VALUES ('exp_001', '2026-01-28', 15230, 45680, 1240, 340, 567, 89, 1500)

3. TRIGGER автоматически рассчитывает:
   - engagement_rate, conversion_rate
   - cpm, cpc, cpa

4. AI анализирует данные → генерирует инсайты:
   INSERT INTO promo_lab_insights (
     experiment_id, insight_type, title,
     confidence, ai_generated, ai_model
   ) VALUES (
     'exp_001', 'optimization',
     'Время публикации 18:00-21:00 даёт +45% engagement',
     92.5, TRUE, 'gpt-4'
   )
```

### Завершение эксперимента:

```
1. После 14 дней → status = 'analyzing'

2. Система генерирует финальный отчёт:
   - Агрегирует все метрики
   - Рассчитывает ROI
   - Собирает все инсайты
   - Формирует выводы (learning)

3. Статус → 'completed'
   TRIGGER создаёт событие:
   INSERT INTO promo_lab_events (...)
   VALUES (..., 'completed', ...)
```

---

## 💾 Примеры данных

### Эксперимент AI-таргетинга:
```json
{
  "id": "exp_ai_001",
  "artist_id": "artist_123",
  "experiment_name": "AI подбор молодёжной аудитории",
  "experiment_type": "ai_targeting",
  "hypothesis": "ML алгоритмы увеличат CTR на 40% vs классический таргетинг",
  "budget": 25000,
  "duration_days": 14,
  "status": "running",
  "metrics": {
    "current_reach": 45230,
    "current_ctr": 3.8,
    "improvement_vs_baseline": 42
  }
}
```

### Метрики за день:
```json
{
  "experiment_id": "exp_ai_001",
  "date": "2026-01-28",
  "reach": 3250,
  "impressions": 8940,
  "engagement_rate": 4.2,
  "conversion_rate": 2.8,
  "viral_coefficient": 1.3,
  "ai_confidence": 87.5,
  "sentiment_score": 72.3
}
```

### AI инсайт:
```json
{
  "experiment_id": "exp_ai_001",
  "insight_type": "ai_recommendation",
  "title": "Оптимизация времени публикации",
  "description": "Модель обнаружила, что публикации в 19:00-21:00 дают на 45% больше engagement чем в другое время",
  "importance": "high",
  "confidence": 92.5,
  "recommended_action": "Сдвинуть основной объём публикаций на 19:00-21:00",
  "ai_generated": true,
  "ai_model": "gpt-4",
  "supporting_metrics": {
    "19_21_avg_engagement": 5.8,
    "other_time_avg_engagement": 4.0,
    "sample_size": 42
  }
}
```

---

## 🔧 Оптимизация производительности

### Индексы покрывают:
✅ Поиск по артисту  
✅ Фильтр по статусу  
✅ Фильтр по типу  
✅ Сортировка по дате  
✅ Агрегация метрик  
✅ Топ по трендовости  

### Partitioning (для больших объёмов):

```sql
-- Разделение promo_lab_metrics_daily по месяцам:
CREATE TABLE promo_lab_metrics_2026_01 PARTITION OF promo_lab_metrics_daily
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE promo_lab_metrics_2026_02 PARTITION OF promo_lab_metrics_daily
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

## 📚 Связанные файлы

- **SQL (базовая):** `/supabase/migrations/001_promotion_tables.sql`
- **SQL (расширенная):** `/supabase/migrations/20260128_promo_lab_extended.sql`
- **Backend:** `/supabase/functions/server/promotion-routes.tsx`
- **Frontend:** `/src/app/pages/PromotionPromoLab.tsx`
- **Документация:** `/docs/PROMO_LAB_SQL_REFERENCE.md`
- **Quick Start:** `/PROMO_LAB_SQL_QUICK_START.md`

---

**Дата создания:** 28 января 2026  
**Версия:** 1.0  
**Статус:** ✅ Production Ready
