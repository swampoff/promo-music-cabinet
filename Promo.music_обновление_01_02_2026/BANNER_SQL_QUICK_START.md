# 🚀 БАННЕРНАЯ РЕКЛАМА - QUICK START

## 📁 Файл миграции
```
/supabase/migrations/20260127_create_banner_ads_tables.sql
```

---

## 🗄️ 3 Таблицы

### 1. `banner_ads` - Основная таблица
```sql
-- Ключевые поля:
id, user_id, campaign_name, banner_type, 
image_url, target_url, price, duration_days,
start_date, end_date, status, views, clicks
```

**Статусы:**
```
pending_moderation → payment_pending → approved → active → expired
                                       ↘ rejected
```

### 2. `banner_events` - События (показы/клики)
```sql
-- Детальные события:
id, banner_id, event_type (view/click),
user_agent, ip_address, session_id, created_at
```

### 3. `banner_analytics_daily` - Дневная статистика
```sql
-- Агрегация по дням:
id, banner_id, date,
views, clicks, unique_views, unique_clicks,
ctr, cost_per_click
```

---

## 💰 Тарифы

| Тип | Размер | Цена/день |
|-----|--------|-----------|
| Top Banner | 1920×400 | 15 000 ₽ |
| Sidebar Large | 300×600 | 12 000 ₽ |
| Sidebar Small | 300×250 | 8 000 ₽ |

**Скидки:** 7 дней (0%), 14 дней (5%), 30 дней (15%)

---

## ⚡ Автоматизация

### Триггеры:
- ✅ Автообновление `updated_at`
- ✅ Автоматический расчёт CTR

### Функции:
```sql
-- Истечение баннеров (запускать каждый час):
SELECT expire_banner_ads();
```

---

## 📊 Views

### 1. Баннеры с метриками:
```sql
SELECT * FROM banner_ads_with_stats;
-- Добавляет: ctr, cost_per_click, cost_per_day, days_remaining
```

### 2. Топ баннеры:
```sql
SELECT * FROM banner_ads_top_performers ORDER BY ctr DESC LIMIT 10;
```

---

## 🔒 RLS Политики

- ✅ Пользователи видят только свои баннеры
- ✅ Админы видят всё
- ✅ Нельзя менять статус вручную

---

## 📈 Полезные запросы

### Активные баннеры:
```sql
SELECT * FROM banner_ads
WHERE status = 'active'
  AND start_date <= NOW()
  AND end_date >= NOW();
```

### Статистика за 7 дней:
```sql
SELECT date, views, clicks, ctr
FROM banner_analytics_daily
WHERE banner_id = 'banner_123'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

### Общая статистика артиста:
```sql
SELECT 
  COUNT(*) as campaigns,
  SUM(views) as views,
  SUM(clicks) as clicks,
  SUM(price) as spent
FROM banner_ads
WHERE user_id = 'artist_123';
```

---

## 🚀 Применить миграцию

### Через Supabase Dashboard:
1. SQL Editor
2. Вставить код из файла
3. Run

### Через CLI:
```bash
supabase db push
```

### Проверить:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'banner%';
```

---

## 📱 Frontend компоненты

- `/src/app/pages/BannerHub.tsx` - Главная страница
- `/src/app/components/banner-ad-management.tsx` - Создание
- `/src/app/components/my-banner-ads.tsx` - Список
- `/src/app/components/banner-detail-modal.tsx` - Детали
- `/src/app/components/analytics-banners.tsx` - Аналитика

---

## 📚 Полная документация

**➡️ `/docs/BANNER_ADS_SQL_REFERENCE.md`**

---

## ✅ Готово!

✅ 3 таблицы  
✅ 2 views  
✅ 3 функции  
✅ 2 триггера  
✅ RLS политики  
✅ Индексы для производительности  

**Статус:** Production Ready 🚀
