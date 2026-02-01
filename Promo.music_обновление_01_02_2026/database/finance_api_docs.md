# 📚 PROMO.MUSIC - FINANCE MODULE API DOCUMENTATION

Полная документация REST API финансовой системы promo.music

---

## 📋 Основные категории

1. [Транзакции](#транзакции)
2. [Счета (Invoices)](#счета-invoices)
3. [Балансы](#балансы)
4. [Выплаты](#выплаты)
5. [Возвраты](#возвраты)
6. [Статистика](#статистика)
7. [Администрирование](#администрирование)

---

## 💳 Транзакции

### GET `/api/finance/transactions`

Получение списка транзакций

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
```
type: string - Тип транзакции
category: string - Категория
status: string - Статус
user_id: number - ID пользователя
date_from: date - От даты
date_to: date - До даты
amount_min: number - Мин. сумма
amount_max: number - Макс. сумма
limit: number - Лимит (default: 20)
offset: number - Смещение
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "uuid": "550e8400...",
        "transaction_type": "payment",
        "transaction_category": "campaign",
        "amount": 5000.00,
        "currency": "RUB",
        "status": "completed",
        "description": "Оплата кампании #123",
        "reference_type": "campaign",
        "reference_id": 123,
        "payment_provider": "yookassa",
        "payment_method": "card",
        "balance_before": 10000.00,
        "balance_after": 5000.00,
        "platform_commission": 250.00,
        "created_at": "2024-02-01T10:00:00Z",
        "completed_at": "2024-02-01T10:00:05Z"
      }
    ],
    "pagination": {
      "total": 500,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### GET `/api/finance/transactions/:id`

Детали транзакции

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amount": 5000.00,
    "status": "completed",
    "payment_details": {
      "card_last4": "1234",
      "card_type": "visa"
    },
    "user": {
      "name": "Иван Иванов",
      "email": "user@example.com"
    }
  }
}
```

---

### POST `/api/finance/transactions`

Создание транзакции (платеж)

**Request Body:**
```json
{
  "user_id": 1,
  "transaction_type": "payment",
  "transaction_category": "campaign",
  "amount": 5000.00,
  "currency": "RUB",
  "description": "Оплата кампании",
  "reference_type": "campaign",
  "reference_id": 123,
  "payment_provider": "yookassa",
  "payment_method": "card"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "uuid": "550e8400...",
    "status": "pending",
    "payment_url": "https://yookassa.ru/checkout/..."
  },
  "message": "Транзакция создана. Перейдите по ссылке для оплаты"
}
```

---

## 📄 Счета (Invoices)

### GET `/api/finance/invoices`

Список счетов

**Response 200:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "invoice_number": "INV-2024-00001",
        "invoice_type": "service",
        "subtotal": 10000.00,
        "tax_amount": 2000.00,
        "total_amount": 12000.00,
        "currency": "RUB",
        "status": "paid",
        "issue_date": "2024-01-01",
        "due_date": "2024-01-15",
        "paid_date": "2024-01-10",
        "line_items": [
          {
            "name": "Питчинг кампания",
            "quantity": 1,
            "price": 10000.00,
            "tax_rate": 20
          }
        ]
      }
    ]
  }
}
```

---

### POST `/api/finance/invoices`

Создание счета

**Request Body:**
```json
{
  "user_id": 1,
  "invoice_type": "service",
  "subtotal": 10000.00,
  "tax_amount": 2000.00,
  "total_amount": 12000.00,
  "description": "Счет за услуги",
  "line_items": [
    {
      "name": "Услуга 1",
      "quantity": 1,
      "price": 10000.00,
      "tax_rate": 20
    }
  ],
  "issue_date": "2024-02-01",
  "due_date": "2024-02-15"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_number": "INV-2024-00001",
    "pdf_url": "https://cdn.promo.music/invoices/INV-2024-00001.pdf"
  }
}
```

---

### PATCH `/api/finance/invoices/:id/pay`

Отметить счет как оплаченный

**Request Body:**
```json
{
  "payment_transaction_id": 123
}
```

---

## 💰 Балансы

### GET `/api/finance/balance`

Баланс текущего пользователя

**Response 200:**
```json
{
  "success": true,
  "data": {
    "entity_type": "user",
    "entity_id": 1,
    "currency": "RUB",
    "available_balance": 15000.00,
    "pending_balance": 2000.00,
    "reserved_balance": 500.00,
    "total_balance": 17500.00,
    "lifetime_income": 50000.00,
    "lifetime_expense": 32500.00,
    "last_transaction_at": "2024-02-01T10:00:00Z"
  }
}
```

---

### POST `/api/finance/balance/reserve`

Резервирование средств

**Request Body:**
```json
{
  "amount": 1000.00,
  "currency": "RUB",
  "reason": "Холд для кампании"
}
```

---

### POST `/api/finance/balance/release`

Освобождение зарезервированных средств

**Request Body:**
```json
{
  "amount": 1000.00,
  "currency": "RUB"
}
```

---

## 💸 Выплаты

### GET `/api/finance/payouts`

Список выплат

**Response 200:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": 1,
        "payout_type": "partner_commission",
        "amount": 50000.00,
        "withdrawal_fee": 1250.00,
        "net_amount": 48750.00,
        "currency": "RUB",
        "payout_method": "bank_transfer",
        "status": "completed",
        "requested_at": "2024-02-01T10:00:00Z",
        "completed_at": "2024-02-03T15:00:00Z"
      }
    ]
  }
}
```

---

### POST `/api/finance/payouts/request`

Запрос выплаты

**Request Body:**
```json
{
  "payout_type": "withdrawal",
  "amount": 10000.00,
  "currency": "RUB",
  "payout_method": "bank_transfer",
  "payout_details": {
    "bank_name": "Сбербанк",
    "account_number": "40817810123456789012",
    "bic": "044525225"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending",
    "estimated_completion": "2024-02-05T12:00:00Z"
  },
  "message": "Заявка на выплату создана"
}
```

---

### PATCH `/api/admin/finance/payouts/:id/approve`

Одобрение выплаты (админ)

**Response 200:**
```json
{
  "success": true,
  "message": "Выплата одобрена"
}
```

---

## 🔄 Возвраты

### POST `/api/finance/refunds`

Запрос возврата

**Request Body:**
```json
{
  "original_transaction_id": 123,
  "refund_amount": 5000.00,
  "refund_type": "full",
  "reason": "service_not_delivered",
  "description": "Услуга не была оказана"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending",
    "estimated_completion": "3-5 рабочих дней"
  }
}
```

---

### GET `/api/finance/refunds`

Список возвратов

---

### PATCH `/api/admin/finance/refunds/:id/approve`

Одобрение возврата (админ)

---

## 📊 Статистика

### GET `/api/finance/statistics`

Общая финансовая статистика (админ)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_payments_count": 1500,
    "total_payments_amount": 7500000.00,
    "total_refunds_count": 45,
    "total_refunds_amount": 125000.00,
    "total_payouts_count": 120,
    "total_payouts_amount": 3500000.00,
    "total_commission": 450000.00,
    "total_failed_count": 23,
    "suspicious_count": 3
  }
}
```

---

### GET `/api/finance/statistics/daily`

Статистика по дням

**Query Parameters:**
```
date_from: date
date_to: date
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "chart_data": [
      {
        "date": "2024-02-01",
        "payments_count": 45,
        "payments_sum": 225000.00,
        "refunds_count": 2,
        "refunds_sum": 10000.00,
        "commission_sum": 11250.00
      }
    ]
  }
}
```

---

### GET `/api/finance/statistics/categories`

Статистика по категориям

---

### GET `/api/finance/statistics/top-users`

Топ пользователей по тратам

**Response 200:**
```json
{
  "success": true,
  "data": {
    "top_users": [
      {
        "user_id": 1,
        "name": "Иван Иванов",
        "email": "user@example.com",
        "transactions_count": 150,
        "total_spent": 500000.00
      }
    ]
  }
}
```

---

## 🛡️ Администрирование

### GET `/api/admin/finance/transactions/suspicious`

Подозрительные транзакции

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "fraud_score": 85.5,
        "is_suspicious": true,
        "fraud_notes": "Необычная активность",
        "user": {
          "name": "Пользователь",
          "email": "user@example.com"
        }
      }
    ]
  }
}
```

---

### PATCH `/api/admin/finance/transactions/:id/review`

Проверка подозрительной транзакции

**Request Body:**
```json
{
  "is_suspicious": false,
  "notes": "Проверено, легитимная транзакция"
}
```

---

### POST `/api/admin/finance/balance/adjust`

Ручная корректировка баланса

**Request Body:**
```json
{
  "user_id": 1,
  "amount": 1000.00,
  "currency": "RUB",
  "description": "Бонус за активность",
  "internal_note": "Одобрено директором"
}
```

---

### GET `/api/admin/finance/payouts/pending`

Ожидающие выплаты

---

### GET `/api/admin/finance/refunds/pending`

Ожидающие возвраты

---

### GET `/api/admin/finance/invoices/overdue`

Просроченные счета

**Response 200:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "invoice_number": "INV-2024-00001",
        "user_name": "Иван Иванов",
        "total_amount": 12000.00,
        "due_date": "2024-01-15",
        "days_overdue": 17
      }
    ]
  }
}
```

---

### POST `/api/admin/finance/reports/tax`

Создание налогового отчета

**Request Body:**
```json
{
  "period_type": "monthly",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "report_type": "vat"
}
```

---

### GET `/api/admin/finance/audit-log`

Аудит лог финансовых операций

**Response 200:**
```json
{
  "success": true,
  "data": {
    "log_entries": [
      {
        "id": 1,
        "action_type": "transaction_completed",
        "transaction_id": 123,
        "actor_type": "user",
        "actor_id": 1,
        "description": "Транзакция завершена",
        "ip_address": "192.168.1.1",
        "created_at": "2024-02-01T10:00:00Z"
      }
    ]
  }
}
```

---

### GET `/api/admin/finance/reconciliation`

Сверка балансов

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mismatches": [
      {
        "user_id": 1,
        "name": "Пользователь",
        "current_balance": 10000.00,
        "calculated_balance": 9998.50,
        "difference": 1.50
      }
    ]
  }
}
```

---

## 🔧 Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 402 | Payment Required - Недостаточно средств |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict - Дубликат транзакции |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

**Формат ошибки:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Недостаточно средств на балансе",
    "details": {
      "required": 5000.00,
      "available": 3000.00
    }
  }
}
```

---

## 📝 Примечания

1. Все суммы в формате DECIMAL(12,2)
2. Все даты в ISO 8601 (UTC)
3. Токены обязательны для всех запросов
4. Rate limit: 100 req/min (пользователи), 1000 req/min (админы)
5. Критические операции требуют 2FA
6. Автоматическая фискализация чеков
7. Аудит логирование всех операций
8. Fraud detection на базе ML
9. Поддержка мультивалютности
10. PCI DSS compliant

---

## 🔒 Безопасность

- SSL/TLS обязателен
- Токены с ограниченным сроком действия
- IP whitelist для админских операций
- Двухфакторная аутентификация
- Шифрование чувствительных данных
- Автоматическое обнаружение фрода
- Полный аудит всех операций
- Резервное копирование каждый час

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-01  
**Status:** Production Ready 🚀
