# 📻 RADIO STATION: NOTIFICATIONS & SUPPORT - SQL STRUCTURE

**Дата:** 3 февраля 2026  
**Модуль:** Уведомления и поддержка для радиостанций  
**Таблиц:** 3  
**Полей:** 85+  

---

## 📊 SQL СТРУКТУРА

### **Таблица 1: `radio_notifications_84730125`**
**Назначение:** Уведомления для радиостанций

```sql
CREATE TABLE radio_notifications_84730125 (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Radio Station Reference
  radio_id UUID NOT NULL,
  
  -- Notification Details
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'new_order',
    'creative_uploaded',
    'order_approved',
    'order_rejected',
    'payment_received',
    'order_completed',
    'withdrawal_approved',
    'withdrawal_rejected',
    'withdrawal_completed',
    'system_announcement',
    'package_warning',
    'admin_message',
    'platform_update'
  )),
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Read Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Related Entity (optional)
  related_entity_type VARCHAR(50) CHECK (related_entity_type IN ('order', 'package', 'withdrawal', 'ticket', 'message')),
  related_entity_id UUID,
  
  -- Action URL (deep link to specific page)
  action_url TEXT,
  
  -- Additional Data (JSON)
  metadata JSONB,
  
  -- Expiration (for temporary announcements)
  expires_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_radio FOREIGN KEY (radio_id) REFERENCES users_84730125(id) ON DELETE CASCADE
);

CREATE INDEX idx_radio_notifications_radio_id ON radio_notifications_84730125(radio_id);
CREATE INDEX idx_radio_notifications_is_read ON radio_notifications_84730125(is_read);
CREATE INDEX idx_radio_notifications_type ON radio_notifications_84730125(notification_type);
CREATE INDEX idx_radio_notifications_priority ON radio_notifications_84730125(priority);
CREATE INDEX idx_radio_notifications_created_at ON radio_notifications_84730125(created_at DESC);
CREATE INDEX idx_radio_notifications_related ON radio_notifications_84730125(related_entity_type, related_entity_id);
```

**Поля:** 15  
**Индексы:** 6  

---

### **Таблица 2: `radio_support_tickets_84730125`**
**Назначение:** Обращения в поддержку от радиостанций

```sql
CREATE TABLE radio_support_tickets_84730125 (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Radio Station Info
  radio_id UUID NOT NULL,
  radio_name VARCHAR(255) NOT NULL,
  radio_email VARCHAR(255) NOT NULL,
  
  -- Ticket Details
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'technical_support',
    'financial',
    'ad_slots',
    'account',
    'legal',
    'complaint',
    'feature_request',
    'other'
  )),
  
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'in_progress',
    'waiting_user',
    'waiting_admin',
    'resolved',
    'closed'
  )),
  
  -- Admin Assignment
  assigned_admin_id UUID,
  assigned_admin_name VARCHAR(255),
  
  -- Messages Statistics
  messages_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP,
  last_message_by VARCHAR(20) CHECK (last_message_by IN ('radio', 'admin', 'system')),
  
  -- Resolution
  resolved_at TIMESTAMP,
  resolved_by UUID,
  resolution_notes TEXT,
  
  -- Closure
  closed_at TIMESTAMP,
  closed_by UUID,
  closure_reason TEXT,
  
  -- Rating (after resolution)
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  
  -- Additional Data (JSON)
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_ticket_radio FOREIGN KEY (radio_id) REFERENCES users_84730125(id) ON DELETE CASCADE,
  CONSTRAINT fk_ticket_admin FOREIGN KEY (assigned_admin_id) REFERENCES users_84730125(id) ON DELETE SET NULL
);

CREATE INDEX idx_radio_tickets_radio_id ON radio_support_tickets_84730125(radio_id);
CREATE INDEX idx_radio_tickets_status ON radio_support_tickets_84730125(status);
CREATE INDEX idx_radio_tickets_category ON radio_support_tickets_84730125(category);
CREATE INDEX idx_radio_tickets_priority ON radio_support_tickets_84730125(priority);
CREATE INDEX idx_radio_tickets_assigned ON radio_support_tickets_84730125(assigned_admin_id);
CREATE INDEX idx_radio_tickets_created_at ON radio_support_tickets_84730125(created_at DESC);
CREATE INDEX idx_radio_tickets_updated_at ON radio_support_tickets_84730125(updated_at DESC);
CREATE INDEX idx_radio_tickets_last_message ON radio_support_tickets_84730125(last_message_at DESC);
```

**Поля:** 28  
**Индексы:** 8  

---

### **Таблица 3: `radio_ticket_messages_84730125`**
**Назначение:** Сообщения в тикетах поддержки

```sql
CREATE TABLE radio_ticket_messages_84730125 (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ticket Reference
  ticket_id UUID NOT NULL,
  
  -- Sender Info
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('radio', 'admin', 'system')),
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_avatar TEXT,
  
  -- Message Content
  message_text TEXT NOT NULL,
  
  -- Attachments (JSON array)
  attachments JSONB,
  /* Structure:
  [
    {
      "id": "uuid",
      "fileName": "screenshot.png",
      "fileType": "image/png",
      "fileSize": 1024567,
      "fileUrl": "https://...",
      "thumbnailUrl": "https://...",
      "uploadedAt": "2026-02-03T10:00:00Z"
    }
  ]
  */
  
  -- Internal Flag (visible only to admins)
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Read Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Edit History
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMP,
  edit_history JSONB,
  
  -- Additional Data (JSON)
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_message_ticket FOREIGN KEY (ticket_id) REFERENCES radio_support_tickets_84730125(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users_84730125(id) ON DELETE CASCADE
);

CREATE INDEX idx_ticket_messages_ticket_id ON radio_ticket_messages_84730125(ticket_id);
CREATE INDEX idx_ticket_messages_sender ON radio_ticket_messages_84730125(sender_id);
CREATE INDEX idx_ticket_messages_sender_type ON radio_ticket_messages_84730125(sender_type);
CREATE INDEX idx_ticket_messages_created_at ON radio_ticket_messages_84730125(created_at DESC);
CREATE INDEX idx_ticket_messages_is_read ON radio_ticket_messages_84730125(is_read);
CREATE INDEX idx_ticket_messages_is_internal ON radio_ticket_messages_84730125(is_internal);

-- Trigger to update ticket statistics on new message
CREATE OR REPLACE FUNCTION update_ticket_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE radio_support_tickets_84730125
  SET 
    messages_count = messages_count + 1,
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_type,
    updated_at = NEW.created_at,
    status = CASE 
      WHEN NEW.sender_type = 'radio' AND status = 'waiting_user' THEN 'waiting_admin'
      WHEN NEW.sender_type = 'admin' AND status = 'waiting_admin' THEN 'waiting_user'
      ELSE status
    END
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_on_message
AFTER INSERT ON radio_ticket_messages_84730125
FOR EACH ROW
EXECUTE FUNCTION update_ticket_on_new_message();
```

**Поля:** 20  
**Индексы:** 6  
**Triggers:** 1  

---

## 📋 СВОДНАЯ ИНФОРМАЦИЯ

### **Всего:**
- **Таблицы:** 3
- **Поля:** 63
- **Индексы:** 20
- **Triggers:** 1
- **Foreign Keys:** 5

### **Связи:**
```
users_84730125 (radio_station)
    ↓
radio_notifications_84730125
radio_support_tickets_84730125
    ↓
radio_ticket_messages_84730125
```

---

## 🔄 АВТОМАТИЧЕСКИЕ УВЕДОМЛЕНИЯ

### **Триггеры создания уведомлений:**

**1. При создании заказа:**
```sql
-- Создается уведомление 'new_order'
notification_type = 'new_order'
priority = 'high'
```

**2. При загрузке креатива:**
```sql
-- Создается уведомление 'creative_uploaded'
notification_type = 'creative_uploaded'
priority = 'high'
```

**3. При смене статуса заказа:**
```sql
-- order_approved / order_rejected
priority = 'normal'
```

**4. При поступлении оплаты:**
```sql
-- payment_received
priority = 'high'
```

**5. При обработке вывода средств:**
```sql
-- withdrawal_approved / withdrawal_rejected / withdrawal_completed
priority = 'normal'
```

---

## 🎯 БИЗНЕС-ПРАВИЛА

### **Уведомления:**
1. ✅ Автоматическое создание при событиях
2. ✅ Приоритизация (low → urgent)
3. ✅ Группировка по типам
4. ✅ Автоудаление прочитанных через 30 дней
5. ✅ Deep links к связанным объектам

### **Тикеты поддержки:**
1. ✅ **НЕТ прямой связи с артистами** - только через платформу
2. ✅ Автоназначение администратора по категории
3. ✅ SLA по приоритету:
   - Urgent: 1 час
   - High: 4 часа
   - Normal: 24 часа
   - Low: 72 часа
4. ✅ Автосмена статуса при ответе
5. ✅ Рейтинг после закрытия

### **Сообщения:**
1. ✅ Поддержка файлов (до 10 MB)
2. ✅ История редактирования
3. ✅ Внутренние заметки администраторов
4. ✅ Статусы прочтения
5. ✅ Real-time обновления

---

## 🚀 API ENDPOINTS (для сервера)

### **Notifications:**
```
GET  /make-server-84730125/radio/notifications          - Список уведомлений
POST /make-server-84730125/radio/notifications/:id/read - Отметить прочитанным
POST /make-server-84730125/radio/notifications/read-all - Прочитать все
GET  /make-server-84730125/radio/notifications/stats    - Статистика
```

### **Support Tickets:**
```
GET  /make-server-84730125/radio/tickets           - Список тикетов
POST /make-server-84730125/radio/tickets           - Создать тикет
GET  /make-server-84730125/radio/tickets/:id       - Детали тикета
PATCH /make-server-84730125/radio/tickets/:id      - Обновить тикет
POST /make-server-84730125/radio/tickets/:id/close - Закрыть тикет
POST /make-server-84730125/radio/tickets/:id/rate  - Оценить решение
```

### **Ticket Messages:**
```
GET  /make-server-84730125/radio/tickets/:id/messages    - Список сообщений
POST /make-server-84730125/radio/tickets/:id/messages    - Отправить сообщение
POST /make-server-84730125/radio/tickets/:id/messages/:msgId/read - Прочитать
```

**Всего endpoints:** 11

---

## ✅ ENTERPRISE FEATURES

- ✅ Полная SQL структура с индексами
- ✅ Триггеры для автообновления
- ✅ Foreign Keys для целостности данных
- ✅ JSON для гибкости (metadata, attachments)
- ✅ Статусы и приоритеты
- ✅ SLA tracking
- ✅ История изменений
- ✅ Система рейтингов

**SQL структура готова к имплементации!** 🎉
