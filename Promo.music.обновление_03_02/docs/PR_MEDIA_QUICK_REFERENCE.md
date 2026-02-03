# 📰 PR И СМИ - QUICK REFERENCE

## 🗂️ Таблицы (7 шт)

```
1. media_contacts       - База журналистов и редакторов
2. press_releases       - Пресс-релизы
3. media_mentions       - Упоминания в СМИ
4. interview_requests   - Управление интервью
5. media_packages       - EPK пакеты
6. pr_campaigns         - PR кампании
7. media_monitoring     - Мониторинг упоминаний
```

---

## 📋 Быстрые SQL запросы

### Добавить медиа-контакт
```sql
INSERT INTO media_contacts (
  id, artist_id, full_name, position, 
  media_outlet, media_type, email, 
  coverage_tier, audience_size
) VALUES (
  'mc_001', 'artist_123', 'Иван Петров', 'Главный редактор',
  'Афиша Daily', 'online_media', 'i.petrov@afisha.ru',
  'national', 500000
);
```

### Создать пресс-релиз
```sql
INSERT INTO press_releases (
  id, artist_id, title, content, 
  category, release_date, status
) VALUES (
  'pr_001', 'artist_123', 
  'Новый альбом выходит 1 июня',
  '<p>Текст пресс-релиза...</p>',
  'new_release', '2026-06-01', 'published'
);
```

### Добавить упоминание в СМИ
```sql
INSERT INTO media_mentions (
  id, artist_id, media_outlet, 
  article_title, article_url, 
  published_date, sentiment, reach_estimate
) VALUES (
  'mention_001', 'artist_123', 'Афиша Daily',
  'Топ-10 альбомов июня', 'https://...',
  '2026-06-05', 'positive', 100000
);
```

### Получить все упоминания (положительные)
```sql
SELECT * FROM media_mentions
WHERE artist_id = 'artist_123'
  AND sentiment = 'positive'
ORDER BY published_date DESC;
```

### Статистика PR кампании
```sql
SELECT * FROM pr_campaign_stats
WHERE artist_id = 'artist_123'
  AND status = 'active';
```

### Топ медиа-контактов
```sql
SELECT * FROM top_media_contacts
WHERE artist_id = 'artist_123'
ORDER BY mentions_count DESC
LIMIT 10;
```

---

## 💰 Ценообразование

| Услуга | Базовая цена | FREE | START (5%) | PRO (15%) | ЭЛИТ (25%) |
|--------|--------------|------|-----------|-----------|------------|
| Пресс-релиз | 15,000₽ | 15,000₽ | 14,250₽ | 12,750₽ | 11,250₽ |
| Интервью | 25,000₽ | 25,000₽ | 23,750₽ | 21,250₽ | 18,750₽ |
| Feature | 35,000₽ | 35,000₽ | 33,250₽ | 29,750₽ | 26,250₽ |
| Podcast | 20,000₽ | 20,000₽ | 19,000₽ | 17,000₽ | 15,000₽ |
| Full PR | 150,000₽ | 150,000₽ | 142,500₽ | 127,500₽ | 112,500₽ |

---

## 🎯 Типы контента

### Media Types
```
newspaper, magazine, online_media, tv, 
radio, podcast, blog, youtube
```

### Coverage Tiers
```
local       - Локальные СМИ
regional    - Региональные СМИ
national    - Национальные СМИ
international - Международные СМИ
```

### Relationship Status
```
cold    - Холодный контакт
warm    - Теплый контакт
hot     - Горячий контакт
partner - Партнер
```

### Sentiment
```
positive - Позитивное упоминание
neutral  - Нейтральное упоминание
negative - Негативное упоминание
mixed    - Смешанное
```

### Interview Formats
```
text_email      - Текстовое (email)
text_in_person  - Текстовое (личная встреча)
video           - Видео интервью
audio           - Аудио интервью
live_stream     - Прямой эфир
podcast         - Подкаст
```

---

## 📊 Метрики

### AVE (Advertising Value Equivalency)
```typescript
// Рекламный эквивалент упоминания
ave_value = reach * CPM / 1000

Пример:
Охват: 100,000
CPM: 500₽
AVE = 100,000 * 500 / 1000 = 50,000₽
```

### Sentiment Score
```typescript
// Оценка тональности кампании
sentiment_score = (
  positive_mentions * 1.0 +
  neutral_mentions * 0.5 +
  negative_mentions * 0.0
) / total_mentions
```

### Open Rate
```typescript
open_rate = (opened_count / sent_count) * 100%
```

### Publish Rate
```typescript
publish_rate = (published_count / sent_count) * 100%
```

---

## 🚀 Workflow

### 1. Создание PR кампании
```
1. Создать кампанию (pr_campaigns)
2. Подготовить EPK (media_packages)
3. Написать пресс-релиз (press_releases)
4. Выбрать контакты (media_contacts)
5. Разослать PR
6. Организовать интервью (interview_requests)
7. Отслеживать упоминания (media_mentions)
8. Анализировать результаты (pr_campaign_stats)
```

### 2. Добавление упоминания
```
1. Найти публикацию
2. Создать запись в media_mentions
3. Указать sentiment
4. Оценить reach и AVE
5. Добавить скриншот
6. Связать с PR кампанией
```

### 3. Организация интервью
```
1. Получить запрос от СМИ
2. Создать interview_request
3. Согласовать дату/формат
4. Подготовить talking points
5. Провести интервью
6. После публикации → media_mention
```

---

## 📁 Файлы

### SQL миграции
```
/supabase/migrations/001_promotion_tables.sql
/supabase/migrations/006_media_pr_extended.sql
```

### Документация
```
/docs/README_PR_MEDIA.md          - Полная документация
/docs/PR_MEDIA_QUICK_REFERENCE.md - Эта шпаргалка
```

---

## ⚡ Быстрый старт

### Шаг 1: Выполнить SQL
```bash
1. Открыть Supabase Dashboard
2. SQL Editor → New Query
3. Скопировать весь код из 001_promotion_tables.sql
4. Run
5. Скопировать весь код из 006_media_pr_extended.sql
6. Run
```

### Шаг 2: Проверить таблицы
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'media_%'
  OR table_name LIKE 'press_%'
  OR table_name LIKE 'pr_%'
  OR table_name = 'interview_requests';
```

### Шаг 3: Добавить демо-данные
```sql
-- Демо-контакты уже включены в миграцию!
SELECT * FROM media_contacts WHERE artist_id = 'demo_artist';
```

---

## 🎨 UI Компоненты (TODO)

### Страницы
```
/promotion/pr                    - Главная PR
/promotion/pr/contacts           - База контактов
/promotion/pr/press-releases     - Пресс-релизы
/promotion/pr/mentions           - Упоминания
/promotion/pr/interviews         - Интервью
/promotion/pr/epk                - EPK пакеты
/promotion/pr/campaigns          - Кампании
/promotion/pr/monitoring         - Мониторинг
```

### Компоненты
```tsx
<MediaContactCard />          - Карточка контакта
<PressReleaseForm />          - Форма пресс-релиза
<MediaMentionList />          - Список упоминаний
<InterviewScheduler />        - Календарь интервью
<EPKBuilder />                - Конструктор EPK
<PRCampaignDashboard />       - Дашборд кампании
<SentimentChart />            - График тональности
<ReachAnalytics />            - Аналитика охвата
```

---

## 💡 Pro Tips

1. **Заполняйте все поля** - чем больше данных, тем лучше аналитика
2. **Обновляйте relationship_status** - следите за "температурой" контактов
3. **Добавляйте screenshots** - визуальное подтверждение упоминаний
4. **Считайте AVE** - показывайте ценность PR работы
5. **Используйте views** - готовые запросы для аналитики
6. **Связывайте данные** - outreach_request_id → mentions → campaigns
7. **Мониторьте sentiment** - реагируйте на негативные упоминания

---

## 🔥 Hot Keys

```
Ctrl + Shift + P  - Создать пресс-релиз
Ctrl + Shift + M  - Добавить упоминание
Ctrl + Shift + I  - Новое интервью
Ctrl + Shift + C  - Новый контакт
Ctrl + Shift + K  - Открыть кампанию
```

---

## 📞 Support

Вопросы? Смотри:
- `/docs/README_PR_MEDIA.md` - полная документация
- `/supabase/migrations/006_media_pr_extended.sql` - SQL код

---

**✅ SQL готов! Создавай PR-империю! 🚀**
