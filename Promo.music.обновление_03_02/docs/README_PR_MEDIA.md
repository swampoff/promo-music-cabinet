# 📰 PR И СМИ - ДОКУМЕНТАЦИЯ

## 🎯 Обзор системы

Расширенная система управления PR и работой со СМИ для артистов. Включает управление медиа-контактами, пресс-релизами, упоминаниями в СМИ, интервью, EPK пакетами и PR кампаниями.

---

## 📊 Архитектура базы данных

### 🗃️ Таблицы

#### 1️⃣ **media_contacts** - База медиа-контактов
Хранение информации о журналистах, редакторах, блогерах и других медиа-персонах.

**Основные поля:**
```sql
- full_name           - ФИО контакта
- position            - Должность
- media_outlet        - Название медиа
- media_type          - Тип: newspaper, magazine, online_media, tv, radio, podcast, blog, youtube
- email, phone        - Контакты
- social_media        - Социальные сети (JSON)
- topics              - Темы интересов (массив)
- coverage_tier       - Охват: local, regional, national, international
- audience_size       - Размер аудитории
- engagement_rate     - Процент вовлеченности
- relationship_status - cold, warm, hot, partner
- last_contact_date   - Дата последнего контакта
```

**Примеры использования:**
```typescript
// Добавить медиа-контакт
{
  id: "mc_001",
  artist_id: "artist_123",
  full_name: "Иван Петров",
  position: "Главный редактор",
  media_outlet: "Афиша Daily",
  media_type: "online_media",
  email: "i.petrov@afisha.ru",
  coverage_tier: "national",
  audience_size: 500000,
  relationship_status: "warm",
  topics: ["музыка", "культура", "интервью"]
}
```

---

#### 2️⃣ **press_releases** - Пресс-релизы
Создание и распространение пресс-релизов.

**Основные поля:**
```sql
- title               - Заголовок
- subtitle            - Подзаголовок
- content             - Текст пресс-релиза (HTML)
- category            - new_release, tour_announcement, award, collaboration, statement
- release_date        - Дата публикации
- embargo_until       - Эмбарго (запрет публикации до даты)
- status              - draft, review, approved, published, archived
- media_kit_url       - Ссылка на медиа-кит
- press_photos        - Фото для прессы (массив URL)
- contact_person      - Контактное лицо
- distribution_list   - Список получателей
- sent_count          - Отправлено
- opened_count        - Открыто
- clicked_count       - Клики
- published_count     - Опубликовано
```

**Примеры использования:**
```typescript
// Создать пресс-релиз
{
  id: "pr_001",
  artist_id: "artist_123",
  title: "Новый альбом 'Звёзды' выходит 1 июня",
  subtitle: "Первый сольный альбом за 3 года",
  content: "<p>Артист объявляет о релизе...</p>",
  category: "new_release",
  release_date: "2026-05-15T10:00:00Z",
  status: "approved",
  press_photos: ["https://cdn.example.com/photo1.jpg"],
  contact_email: "press@artist.com",
  distribution_list: ["afisha@example.com", "village@example.com"]
}
```

---

#### 3️⃣ **media_mentions** - Упоминания в СМИ
Отслеживание всех упоминаний артиста в медиа.

**Основные поля:**
```sql
- media_outlet        - Название СМИ
- media_type          - Тип медиа
- article_title       - Заголовок статьи
- article_url         - Ссылка на статью
- author              - Автор
- published_date      - Дата публикации
- content_snippet     - Цитата/выдержка
- sentiment           - positive, neutral, negative, mixed
- mention_type        - feature, interview, review, news, mention, listicle
- reach_estimate      - Оценка охвата
- engagement_count    - Вовлечение (лайки, комменты)
- share_count         - Репосты
- ave_value           - Рекламный эквивалент (₽)
- screenshots         - Скриншоты (массив URL)
```

**Примеры использования:**
```typescript
// Добавить упоминание
{
  id: "mention_001",
  artist_id: "artist_123",
  media_outlet: "Афиша Daily",
  media_type: "online_media",
  article_title: "10 главных альбомов июня",
  article_url: "https://daily.afisha.ru/music/...",
  author: "Иван Петров",
  published_date: "2026-06-01",
  sentiment: "positive",
  mention_type: "listicle",
  reach_estimate: 100000,
  ave_value: 50000
}
```

---

#### 4️⃣ **interview_requests** - Управление интервью
Заявки и организация интервью.

**Основные поля:**
```sql
- media_outlet        - СМИ
- interviewer_name    - Интервьюер
- interview_format    - text_email, text_in_person, video, audio, live_stream, podcast
- topic               - Тема интервью
- questions           - Вопросы (JSON массив)
- scheduled_date      - Запланированная дата
- duration_minutes    - Длительность (минуты)
- location            - Место проведения
- is_remote           - Удаленное?
- status              - pending, accepted, declined, scheduled, completed, published
- talking_points      - Ключевые точки для обсуждения
- published_url       - Ссылка на публикацию
- views_count         - Просмотры
```

**Примеры использования:**
```typescript
// Создать заявку на интервью
{
  id: "int_001",
  artist_id: "artist_123",
  media_outlet: "The Village",
  interviewer_name: "Мария Сидорова",
  interview_format: "video",
  topic: "Творческий процесс создания альбома",
  scheduled_date: "2026-06-10T14:00:00Z",
  duration_minutes: 45,
  is_remote: true,
  status: "scheduled",
  talking_points: [
    "Вдохновение для альбома",
    "Работа с продюсером",
    "Планы на тур"
  ]
}
```

---

#### 5️⃣ **media_packages** - EPK (Electronic Press Kit)
Электронные медиа-пакеты для прессы.

**Основные поля:**
```sql
- package_name        - Название пакета
- package_type        - general, album_release, tour, event, award, custom
- bio_short           - Короткая биография
- bio_long            - Полная биография
- key_facts           - Ключевые факты (массив)
- press_photos        - Пресс-фото (JSON)
- logos               - Логотипы (JSON)
- music_samples       - Музыкальные образцы (JSON)
- video_links         - Видео (массив URL)
- press_quotes        - Цитаты прессы (JSON)
- achievements        - Достижения (массив)
- social_stats        - Статистика соцсетей (JSON)
- streaming_stats     - Статистика стриминга (JSON)
- contact_info        - Контактная информация (JSON)
- is_public           - Публичный доступ?
- public_url          - Публичная ссылка
- password_protected  - Защищен паролем?
```

**Примеры использования:**
```typescript
// Создать EPK пакет
{
  id: "epk_001",
  artist_id: "artist_123",
  package_name: "Промо-пакет 'Звёзды' 2026",
  package_type: "album_release",
  bio_short: "Артист из Москвы с 5+ лет на сцене",
  bio_long: "Полная биография...",
  key_facts: [
    "100М+ стримов",
    "5 номинаций на премии",
    "Выступал на фестивале X"
  ],
  press_photos: [
    { url: "https://...", caption: "Промо фото", size: "3000x2000" }
  ],
  social_stats: {
    instagram: 50000,
    vk: 30000,
    youtube: 20000
  },
  is_public: true,
  public_url: "https://press.artist.com/stars-2026"
}
```

---

#### 6️⃣ **pr_campaigns** - PR кампании
Управление комплексными PR кампаниями.

**Основные поля:**
```sql
- campaign_name       - Название кампании
- campaign_goal       - brand_awareness, album_launch, tour_promotion, reputation_management, crisis_management
- start_date          - Дата начала
- end_date            - Дата окончания
- budget              - Бюджет (₽)
- target_audience     - Целевая аудитория
- key_messages        - Ключевые сообщения (массив)
- target_media_outlets- Целевые СМИ (массив)
- status              - planning, active, paused, completed, archived
- kpi_goals           - KPI цели (JSON)
- actual_metrics      - Фактические метрики (JSON)
- total_reach         - Общий охват
- total_mentions      - Всего упоминаний
- total_ave_value     - Общая рекламная ценность
- sentiment_score     - Оценка тональности (0-1)
```

**Примеры использования:**
```typescript
// Создать PR кампанию
{
  id: "campaign_001",
  artist_id: "artist_123",
  campaign_name: "Запуск альбома 'Звёзды'",
  campaign_goal: "album_launch",
  start_date: "2026-05-01",
  end_date: "2026-07-01",
  budget: 500000,
  target_audience: "18-35, интересуются инди-музыкой",
  key_messages: [
    "Первый сольный альбом за 3 года",
    "Записан в берлинской студии",
    "Коллаборации с топ-продюсерами"
  ],
  target_media_outlets: [
    "Афиша Daily",
    "The Village",
    "Medialeaks"
  ],
  status: "active",
  kpi_goals: {
    mentions: 50,
    reach: 1000000,
    ave_value: 2000000,
    interviews: 10
  }
}
```

---

#### 7️⃣ **media_monitoring** - Мониторинг упоминаний
Автоматическое отслеживание упоминаний в интернете.

**Основные поля:**
```sql
- keyword             - Ключевое слово для мониторинга
- source_type         - news, social_media, blogs, forums, video, audio
- source_name         - Название источника
- found_text          - Найденный текст
- url                 - Ссылка
- author              - Автор
- sentiment           - positive, neutral, negative
- reach_estimate      - Оценка охвата
- is_verified         - Проверено?
- is_important        - Важное?
- mentioned_at        - Дата упоминания
```

---

### 📈 Представления (Views)

#### **pr_campaign_stats** - Статистика PR кампаний
```sql
SELECT 
  campaign_name,
  status,
  budget,
  mentions_count,
  total_reach,
  total_ave_value,
  sentiment_score
FROM pr_campaign_stats
WHERE artist_id = 'artist_123';
```

#### **top_media_contacts** - Топ медиа-контактов
```sql
SELECT 
  full_name,
  media_outlet,
  mentions_count,
  total_reach,
  avg_engagement
FROM top_media_contacts
WHERE artist_id = 'artist_123'
LIMIT 10;
```

#### **press_release_analytics** - Аналитика пресс-релизов
```sql
SELECT 
  title,
  sent_count,
  open_rate,
  click_rate,
  publish_rate
FROM press_release_analytics
WHERE artist_id = 'artist_123';
```

---

## 🔄 Связи между таблицами

```
media_outreach_requests (базовая таблица из 001_promotion_tables.sql)
        ↓
    ┌───┴────────────────────┐
    ↓                        ↓
media_mentions         interview_requests
    ↓                        ↓
press_releases         media_contacts
    ↓                        ↓
pr_campaigns           media_packages
    ↓
media_monitoring
```

---

## 💡 Бизнес-логика

### 🎯 Workflow: Создание PR кампании

1. **Планирование**
   ```typescript
   // 1. Создать PR кампанию
   await createPRCampaign({
     campaign_name: "Запуск альбома",
     campaign_goal: "album_launch",
     start_date: "2026-06-01",
     budget: 500000
   });
   ```

2. **Подготовка материалов**
   ```typescript
   // 2. Создать EPK пакет
   await createMediaPackage({
     package_type: "album_release",
     press_photos: [...],
     bio_short: "...",
     music_samples: [...]
   });
   
   // 3. Написать пресс-релиз
   await createPressRelease({
     title: "Новый альбом выходит 1 июня",
     category: "new_release",
     content: "..."
   });
   ```

3. **Контакты и рассылка**
   ```typescript
   // 4. Выбрать медиа-контакты
   const contacts = await getMediaContacts({
     relationship_status: ["warm", "hot", "partner"],
     coverage_tier: "national"
   });
   
   // 5. Разослать пресс-релиз
   await distributePressRelease(pressReleaseId, contacts);
   ```

4. **Интервью**
   ```typescript
   // 6. Организовать интервью
   await createInterviewRequest({
     media_outlet: "Афиша Daily",
     interview_format: "video",
     scheduled_date: "2026-06-10"
   });
   ```

5. **Мониторинг**
   ```typescript
   // 7. Отслеживать упоминания
   const mentions = await getMediaMentions({
     date_from: "2026-06-01",
     sentiment: "positive"
   });
   
   // 8. Добавлять упоминания вручную
   await createMediaMention({
     media_outlet: "The Village",
     article_title: "Топ-10 июня",
     sentiment: "positive",
     reach_estimate: 50000
   });
   ```

6. **Аналитика**
   ```typescript
   // 9. Смотреть статистику кампании
   const stats = await getPRCampaignStats(campaignId);
   
   console.log({
     mentions: stats.mentions_count,
     reach: stats.total_reach,
     ave_value: stats.total_ave_value,
     sentiment: stats.sentiment_score
   });
   ```

---

## 📊 Ценообразование

### Базовые услуги PR и СМИ

| Услуга | Цена | Описание |
|--------|------|----------|
| **Пресс-релиз** | 15,000₽ | Написание + рассылка по базе СМИ |
| **Интервью** | 25,000₽ | Организация интервью в топ-СМИ |
| **Feature статья** | 35,000₽ | Размещение материала о артисте |
| **Podcast интервью** | 20,000₽ | Запись подкаста |
| **Комплексный PR** | 150,000₽ | Полный PR сопровождение (месяц) |

### Дополнительные услуги

| Услуга | Цена | Описание |
|--------|------|----------|
| EPK пакет | 10,000₽ | Создание медиа-пакета |
| Мониторинг СМИ | 5,000₽/мес | Отслеживание упоминаний |
| Работа с контактами | 3,000₽/мес | Управление базой медиа |
| Антикризисный PR | 200,000₽ | Управление репутацией |

### Скидки по подписке

- **FREE** → 0%
- **START** (890₽/мес) → 5%
- **PRO** (2490₽/мес) → 15%
- **ЭЛИТ** (4990₽/мес) → 25%

---

## 🔐 Безопасность

### RLS (Row Level Security)

```sql
-- Пользователи видят только свои данные
ALTER TABLE media_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contacts" ON media_contacts
  FOR SELECT USING (artist_id = current_user_id());

-- Аналогично для всех таблиц
```

---

## 📈 Метрики и KPI

### Ключевые показатели

1. **Reach (Охват)** - сколько людей увидели упоминания
2. **Mentions (Упоминания)** - количество публикаций
3. **AVE (Advertising Value Equivalency)** - рекламный эквивалент
4. **Sentiment Score** - тональность (0 = негатив, 1 = позитив)
5. **Engagement Rate** - вовлеченность аудитории
6. **Publish Rate** - процент публикаций от отправленных PR

### Формулы

```typescript
// Sentiment Score (средняя оценка)
sentiment_score = AVG(
  positive → 1.0,
  neutral → 0.5,
  negative → 0.0
)

// Open Rate (процент открытий)
open_rate = (opened_count / sent_count) * 100

// ROI PR кампании
roi = (total_ave_value / budget) * 100
```

---

## 🚀 Примеры API Endpoints

### Создать медиа-контакт
```typescript
POST /api/pr/media-contacts
{
  "full_name": "Иван Петров",
  "media_outlet": "Афиша Daily",
  "email": "i.petrov@afisha.ru",
  "media_type": "online_media",
  "coverage_tier": "national"
}
```

### Получить все упоминания
```typescript
GET /api/pr/media-mentions?artist_id=123&sentiment=positive
```

### Создать пресс-релиз
```typescript
POST /api/pr/press-releases
{
  "title": "Новый альбом",
  "content": "<p>...</p>",
  "category": "new_release",
  "release_date": "2026-06-01"
}
```

### Статистика PR кампании
```typescript
GET /api/pr/campaigns/campaign_123/stats
```

---

## 📚 Дополнительно

### Полезные ссылки

- SQL миграция: `/supabase/migrations/006_media_pr_extended.sql`
- Базовая таблица: `/supabase/migrations/001_promotion_tables.sql` (media_outreach_requests)

### Демо-данные

В миграции включены 3 демо-контакта:
- Иван Петров (Афиша Daily)
- Мария Сидорова (The Village)
- Алексей Смирнов (Радио Maximum)

---

## ✅ Чеклист внедрения

- [ ] Выполнить SQL миграцию `001_promotion_tables.sql`
- [ ] Выполнить SQL миграцию `006_media_pr_extended.sql`
- [ ] Настроить RLS политики
- [ ] Создать API endpoints
- [ ] Реализовать UI компоненты
- [ ] Добавить интеграцию с Email (для рассылки PR)
- [ ] Настроить автоматический мониторинг
- [ ] Добавить экспорт в PDF (EPK пакеты)

---

## 🎉 Готово!

Теперь у вас полноценная система PR и работы со СМИ! 🚀
