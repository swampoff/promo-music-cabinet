# 📝 ЗАМЕТКИ ДЛЯ БУДУЩИХ КАБИНЕТОВ

**Дата:** 27 января 2026  
**Статус:** Заметки для разработки

---

## 🎯 ПЛАН РАЗВИТИЯ ЭКОСИСТЕМЫ

### Текущий статус:
- ✅ **Кабинет Артиста** (promo.music) - ГОТОВ
  - Продвижение (7 страниц)
  - Маркетинг и продажи
  - Аналитика
  - Донаты
  - Контент
  - Уведомления (без Email)

### Планируется создать 11+ кабинетов:
1. Администратор
2. Радиостанции
3. Заведения (клубы, бары)
4. Продюсеры
5. Лейблы
6. Букеры
7. Журналисты
8. Промоутеры
9. И другие...

---

## 📧 EMAIL-ЦЕНТР - ПЕРЕНЕСТИ В КАБИНЕТ АДМИНИСТРАТОРА

### ✅ Код полностью готов и сохранён:

**Файлы:**
- `/src/app/components/email-center.tsx` - Frontend компонент (25.7 KB)
- `/supabase/functions/server/email-routes.tsx` - Backend API (8 endpoints)

**Функционал:**
1. **Настройки подписок** - кто и что будет получать
2. **История отправлений** - все отправленные email
3. **Статистика** - open rate, click rate, по типам
4. **Шаблоны** - готовые template для рассылок

**API Endpoints (8 штук):**
```
✅ GET    /email/subscriptions/:userId     - Получить настройки
✅ PUT    /email/subscriptions/:userId     - Обновить настройки  
✅ GET    /email/history/:userId            - История отправлений
✅ POST   /email/send                       - Отправить email
✅ PUT    /email/history/:emailId/opened    - Отметить открытие
✅ GET    /email/templates                  - Все шаблоны
✅ GET    /email/templates/:templateId      - Конкретный шаблон
✅ GET    /email/stats/:userId              - Статистика
```

---

## 🎯 ИСПОЛЬЗОВАНИЕ В КАБИНЕТЕ АДМИНИСТРАТОРА

### Кейсы использования:

#### 1. **Рассылка по радиостанциям** 📻
```typescript
// Пример: Новый релиз доступен для эфира
await sendEmail({
  to_list: getAllRadioEmails(),
  template: 'new_release_for_radio',
  subject: '🎵 Новый трек доступен для эфира',
  data: {
    artist_name: 'Артист',
    track_name: 'Название трека',
    genre: 'Поп',
    download_link: 'https://...',
    promo_materials: 'https://...'
  }
});
```

#### 2. **Рассылка по заведениям** 🎪
```typescript
// Пример: Артист ищет площадку для концерта
await sendEmail({
  to_list: getAllVenuesEmails({ city: 'Москва', type: 'club' }),
  template: 'concert_proposal',
  subject: '🎤 Предложение концерта',
  data: {
    artist_name: 'Артист',
    date: '2026-03-15',
    expected_audience: 500,
    tech_rider: 'https://...',
    fee: '100,000 ₽'
  }
});
```

#### 3. **Рассылка по промоутерам** 📢
```typescript
// Пример: Новая маркетинговая кампания
await sendEmail({
  to_list: getAllPromotersEmails(),
  template: 'new_campaign',
  subject: '🚀 Запущена новая кампания',
  data: {
    campaign_name: 'Summer Tour 2026',
    budget: '500,000 ₽',
    target_audience: 'Молодежь 18-25',
    platforms: ['VK', 'Instagram', 'TikTok']
  }
});
```

#### 4. **Рассылка по лейблам** 🏢
```typescript
// Пример: Артист ищет контракт
await sendEmail({
  to_list: getAllLabelsEmails(),
  template: 'label_pitch',
  subject: '🎶 Питчинг артиста',
  data: {
    artist_name: 'Артист',
    genre: 'Инди-рок',
    streams: '1M+',
    epk_link: 'https://...',
    demo_tracks: ['https://...', 'https://...']
  }
});
```

#### 5. **Массовые уведомления** 🔔
```typescript
// Пример: Обновление платформы
await sendEmail({
  to_list: getAllUsersEmails(),
  template: 'platform_update',
  subject: '✨ Новые функции promo.music',
  data: {
    features: [
      'Новый кабинет радио',
      'Интеграция с TikTok',
      'AI-подбор треков'
    ],
    release_date: '2026-02-01'
  }
});
```

---

## 🔧 ЧТО НУЖНО ДОБАВИТЬ ДЛЯ ADMIN

### 1. Расширенные возможности отправки:

```typescript
// Batch sending
POST /email/send-batch
{
  recipients: [
    { type: 'radio', filters: { city: 'Москва', genre: 'Рок' } },
    { type: 'venue', filters: { capacity: '>500' } },
    { type: 'promoter', filters: { experience: '>5 years' } }
  ],
  template_id: 'abc123',
  data: {...}
}

// Scheduled sending
POST /email/schedule
{
  send_at: '2026-02-01T10:00:00Z',
  recipients: [...],
  template_id: 'abc123'
}

// A/B Testing
POST /email/ab-test
{
  variants: [
    { subject: 'Вариант A', template: 'template_a' },
    { subject: 'Вариант B', template: 'template_b' }
  ],
  split: 50, // 50% / 50%
  recipients: [...]
}
```

### 2. Расширенная аналитика:

```typescript
// Bounce rate
// Unsubscribe rate
// Best time to send
// Segment performance
// Campaign ROI
```

### 3. Управление контактами:

```typescript
// Import/Export contacts
// Segmentation by type (radio, venues, labels)
// Contact enrichment (auto-fill data from social)
// Blacklist management
// GDPR compliance (unsubscribe, data export)
```

### 4. Template Builder:

```typescript
// Drag-and-drop builder
// Variable placeholders
// Preview before send
// Template categories
// Version history
```

---

## 📂 СТРУКТУРА КАБИНЕТА АДМИНИСТРАТОРА

```
/admin-cabinet/
  ├── dashboard/              - Главная
  ├── users/                  - Управление пользователями
  │   ├── artists/
  │   ├── radio/
  │   ├── venues/
  │   └── labels/
  ├── content-moderation/     - Модерация контента
  │   ├── tracks/
  │   ├── concerts/
  │   └── campaigns/
  ├── email-center/           - EMAIL-ЦЕНТР ← ВОТ СЮДА!
  │   ├── compose/            - Создать рассылку
  │   ├── campaigns/          - Управление кампаниями
  │   ├── templates/          - Шаблоны
  │   ├── contacts/           - База контактов
  │   ├── analytics/          - Аналитика рассылок
  │   └── settings/           - Настройки SMTP
  ├── analytics/              - Общая аналитика
  ├── payments/               - Финансы
  ├── support/                - Техподдержка
  └── settings/               - Настройки платформы
```

---

## 🚀 ИНТЕГРАЦИЯ SMTP ДЛЯ PRODUCTION

### Вариант 1: Sendgrid (Рекомендуется)
```typescript
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

await sendgrid.send({
  to: recipients,
  from: {
    email: 'noreply@promo.music',
    name: 'Promo.Music Platform'
  },
  subject,
  html: content,
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true }
  }
});
```

**Преимущества:**
- ✅ 100 emails/day бесплатно
- ✅ Отличная доставляемость
- ✅ Встроенная аналитика
- ✅ Template engine
- ✅ API очень простой

### Вариант 2: AWS SES (Для больших объёмов)
```typescript
import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'eu-west-1' });

await ses.sendEmail({
  Source: 'noreply@promo.music',
  Destination: { ToAddresses: recipients },
  Message: {
    Subject: { Data: subject },
    Body: { Html: { Data: content } }
  }
}).promise();
```

**Преимущества:**
- ✅ $0.10 за 1000 emails
- ✅ Масштабируемость
- ✅ Надёжность AWS

### Вариант 3: Mailgun (Середина)
```typescript
import mailgun from 'mailgun-js';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'promo.music'
});

await mg.messages().send({
  from: 'Promo.Music <noreply@promo.music>',
  to: recipients,
  subject,
  html: content
});
```

---

## 📊 МЕТРИКИ ДЛЯ МОНИТОРИНГА

### Email Performance:
- **Delivery Rate** - % доставленных
- **Open Rate** - % открытых (норма: 15-25%)
- **Click Rate** - % кликов (норма: 2-5%)
- **Bounce Rate** - % отказов (норма: <2%)
- **Unsubscribe Rate** - % отписок (норма: <0.5%)

### Campaign Performance:
- **ROI** - окупаемость кампании
- **Conversion Rate** - % целевых действий
- **Revenue Generated** - прибыль от рассылки
- **Cost per Acquisition** - стоимость привлечения

---

## 🔐 БЕЗОПАСНОСТЬ И COMPLIANCE

### GDPR:
- ✅ Double opt-in для подписок
- ✅ One-click unsubscribe
- ✅ Data export on request
- ✅ Right to be forgotten
- ✅ Consent tracking

### Anti-Spam:
- ✅ SPF records
- ✅ DKIM signing
- ✅ DMARC policy
- ✅ List-Unsubscribe header
- ✅ Rate limiting

---

## 💡 ДОПОЛНИТЕЛЬНЫЕ ИДЕИ

### 1. Smart Segmentation
Автоматическая сегментация по:
- Активности (active / inactive)
- Интересам (жанры, города)
- Engagement (high / medium / low)
- Lifecycle stage (new / regular / churned)

### 2. Персонализация
- Имя получателя
- История взаимодействий
- Рекомендации на основе интересов
- Локализация по городу/стране

### 3. Автоматизация
- Welcome series (новые пользователи)
- Re-engagement (неактивные)
- Birthday campaigns
- Triggered emails (events)

### 4. Integration с другими системами
- CRM (сохранять контакты)
- Analytics (треки событий)
- Social Media (синхронизация)
- Payment (транзакционные письма)

---

## ✅ ТЕКУЩИЙ СТАТУС

### Готово:
- ✅ Frontend компонент (полный UI)
- ✅ Backend API (8 endpoints)
- ✅ KV Store интеграция
- ✅ Базовая аналитика
- ✅ Template система
- ✅ История отправлений

### Нужно добавить:
- ⏳ Реальная SMTP интеграция
- ⏳ Batch sending
- ⏳ Scheduling
- ⏳ A/B testing
- ⏳ Contact management
- ⏳ Advanced analytics
- ⏳ Template builder

### Время на доработку:
**Базовая версия:** 2-3 часа (добавить SMTP)  
**Полная версия:** 1-2 недели (все фичи)

---

## 📌 ВАЖНЫЕ ПОМЕТКИ

1. **НЕ УДАЛЯТЬ** файлы:
   - `/src/app/components/email-center.tsx`
   - `/supabase/functions/server/email-routes.tsx`

2. **Код полностью рабочий** - просто не подключен SMTP

3. **При создании Admin кабинета:**
   - Скопировать файлы в новую папку
   - Добавить SMTP интеграцию
   - Расширить функционал (batch, schedule, etc)
   - Добавить contact management

4. **Для других кабинетов:**
   - Радио может использовать упрощенную версию
   - Заведения тоже могут отправлять email (подтверждения)
   - Лейблы - для коммуникации с артистами

---

## 🎯 ЗАКЛЮЧЕНИЕ

Email-центр - это **enterprise-level** модуль для массовых рассылок.  
Сейчас убираем из кабинета артиста, сохраняем для **Admin Cabinet**.

**Код готов на 80%** - осталось только добавить реальную отправку! 🚀

---

**Сохранено:** 27.01.2026  
**Автор:** AI Assistant  
**Для:** Будущий Admin Cabinet
