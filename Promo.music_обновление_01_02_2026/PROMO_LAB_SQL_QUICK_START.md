# 🧪 PROMO LAB - QUICK START

## 📁 Файлы миграций

```
/supabase/migrations/001_promotion_tables.sql           (базовая)
/supabase/migrations/20260128_promo_lab_extended.sql   (расширенная)
```

---

## 🗄️ 5 Таблиц

### 1. `promo_lab_experiments` - Основная
```sql
-- Ключевые поля:
id, artist_id, experiment_name, experiment_type,
hypothesis, description, budget, duration_days,
status, metrics, results, learning
```

**Статусы:**
```
draft → running → analyzing → completed
                           ↘ failed / cancelled
```

**Типы:**
```
ai_targeting      (25000₽) - AI-таргетинг
viral_challenge   (35000₽) - Вирусный челлендж
nft_drop          (50000₽) - NFT Drop
meta_collab       (40000₽) - Мета-коллаборации
custom            (30000₽) - Кастомный
```

### 2. `promo_lab_events` - События
```sql
-- Хронология эксперимента:
id, experiment_id, event_type, event_title,
metrics_snapshot, triggered_by, severity
```

### 3. `promo_lab_metrics_daily` - Дневная аналитика
```sql
-- 20+ метрик по дням:
reach, impressions, engagement_rate, conversion_rate,
likes, comments, shares, viral_coefficient,
spend, cpm, cpc, cpa, sentiment_score
```

### 4. `promo_lab_insights` - Инсайты AI
```sql
-- Выводы и рекомендации:
id, experiment_id, insight_type, title,
importance, confidence, recommended_action,
ai_generated, ai_model
```

### 5. `promo_lab_resources` - Ресурсы
```sql
-- Креативы и материалы:
id, experiment_id, resource_type, file_url,
performance_score, usage_count
```

---

## 💰 Тарифы

| Тип | Цена | Фичи |
|-----|------|------|
| AI-таргетинг | 25 000 ₽ | ML алгоритмы, A/B тесты |
| Вирусный челлендж | 35 000 ₽ | Тренды, инфлюенсеры |
| NFT Drop | 50 000 ₽ | Коллекция, смарт-контракты |
| Мета-коллаборации | 40 000 ₽ | Партнёрства, crossover |
| Кастомный | 30 000 ₽ | Индивидуальный подход |

**Скидки:** Basic (0%), START (5%), PRO (15%), ЭЛИТ (25%)

---

## ⚡ Автоматизация

### Триггеры:
- ✅ Автообновление `updated_at`
- ✅ Автоматический расчёт метрик (engagement_rate, cpm, cpc, cpa)
- ✅ Логирование изменений статуса

### Функции:
```sql
calculate_promo_lab_metrics()      -- Расчёт всех производных метрик
log_experiment_status_change()     -- Создание события при смене статуса
update_promo_lab_updated_at()      -- Обновление временных меток
```

---

## 📊 Views

### 1. Эксперименты со статистикой:
```sql
SELECT * FROM promo_lab_experiments_with_stats;
-- Добавляет: total_reach, avg_engagement_rate, roi_percentage, days_running
```

### 2. Топ эксперименты:
```sql
SELECT * FROM promo_lab_top_performers ORDER BY roi DESC LIMIT 10;
```

### 3. Активные инсайты:
```sql
SELECT * FROM promo_lab_active_insights ORDER BY priority_score DESC;
```

---

## 🔒 RLS Политики

- ✅ Артисты видят только свои эксперименты
- ✅ Админы видят всё
- ✅ Защита через FK к `promo_lab_experiments`

---

## 📈 Полезные запросы

### Активные эксперименты:
```sql
SELECT * FROM promo_lab_experiments
WHERE artist_id = 'artist_123'
  AND status = 'running';
```

### Статистика за неделю:
```sql
SELECT date, reach, engagement_rate, viral_coefficient
FROM promo_lab_metrics_daily
WHERE experiment_id = 'exp_123'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### События эксперимента:
```sql
SELECT event_type, event_title, severity, created_at
FROM promo_lab_events
WHERE experiment_id = 'exp_123'
ORDER BY created_at DESC;
```

### AI инсайты:
```sql
SELECT title, description, confidence, recommended_action
FROM promo_lab_insights
WHERE experiment_id = 'exp_123'
  AND ai_generated = TRUE
  AND confidence >= 80
ORDER BY confidence DESC;
```

### Общая статистика:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  SUM(budget) as spent,
  AVG((metrics->>'conversions')::INTEGER) as avg_conversions
FROM promo_lab_experiments
WHERE artist_id = 'artist_123';
```

---

## 🚀 Применить миграции

### Через Supabase Dashboard:
1. SQL Editor
2. Вставить код из обоих файлов
3. Run

### Через CLI:
```bash
supabase db push
```

### Проверить:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'promo_lab%';
```

---

## 📱 Frontend компонент

- `/src/app/pages/PromotionPromoLab.tsx` - Страница PROMO Lab

---

## 📚 Полная документация

**➡️ `/docs/PROMO_LAB_SQL_REFERENCE.md`**

---

## ✅ Готово!

✅ 5 таблиц  
✅ 3 views  
✅ 3 функции  
✅ 3 триггера  
✅ RLS политики  
✅ 20+ метрик  
✅ AI инсайты  
✅ Вирусные метрики  

**Статус:** Production Ready 🚀
