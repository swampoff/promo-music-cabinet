# 🔍 VERIFICATION CHECKLIST

После деплоя проверьте каждый пункт:

---

## ✅ 1. SQL ТАБЛИЦЫ

```sql
-- В Supabase Dashboard -> SQL Editor

-- Проверка всех таблиц
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'make_%'
ORDER BY tablename;
```

**Должно быть как минимум:**
- `make_transactions_84730125` ✅
- `make_payment_methods_84730125` ✅
- `make_withdraw_requests_84730125` ✅
- `make_user_balances_84730125` ✅
- `kv_store_84730125` ✅

---

## ✅ 2. ДЕМО ДАННЫЕ

```sql
-- Проверка баланса демо пользователя
SELECT * FROM make_user_balances_84730125 
WHERE user_id = 'artist_demo_001';
```

**Ожидается:**
```
user_id: artist_demo_001
balance: 125430
available_balance: 115430
total_income: 116750
```

---

## ✅ 3. EDGE FUNCTIONS

```bash
# Health Check
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Ожидается:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T..."
}
```

---

## ✅ 4. STORAGE BUCKETS

```bash
# В Supabase Dashboard -> Storage
# Должны быть созданы бакеты:
```

- ✅ `make-84730125-artists`
- ✅ `make-84730125-tracks`
- ✅ `make-84730125-videos`
- ✅ `make-84730125-covers`
- ✅ `make-84730125-avatars`
- ✅ `make-84730125-banners`
- ✅ `make-84730125-receipts`
- ✅ `make-84730125-documents`

---

## ✅ 5. API ENDPOINTS

### Баланс пользователя
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/balance/artist_demo_001 \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Ожидается:**
```json
{
  "success": true,
  "data": {
    "balance": 125430,
    "available_balance": 115430,
    "pending_balance": 10000
  }
}
```

### Транзакции
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/transactions/artist_demo_001 \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Создание транзакции (POST)
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/payments/transaction \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "artist_demo_001",
    "type": "income",
    "category": "donate",
    "amount": 500,
    "description": "Тестовый донат",
    "from_name": "Тестовый фанат"
  }'
```

---

## ✅ 6. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

```bash
# Проверка секретов
supabase secrets list
```

**Должны быть установлены:**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ 7. ЛОГИ

```bash
# Смотрим последние логи
supabase functions logs make-server-84730125 --limit 50

# В логах должно быть:
# ✅ Database tables initialized successfully
# ✅ Storage initialized successfully
# ✅ 200 GET /make-server-84730125/health
```

---

## ✅ 8. RLS ПОЛИТИКИ

```sql
-- Проверка политик безопасности
SELECT 
  schemaname, 
  tablename, 
  policyname 
FROM pg_policies 
WHERE tablename LIKE 'make_%'
ORDER BY tablename, policyname;
```

**Должно быть минимум 10+ политик для:**
- `transactions_select_own`
- `payment_methods_select_own`
- `withdraw_requests_select_own`
- etc.

---

## ✅ 9. ТРИГГЕРЫ И ФУНКЦИИ

```sql
-- Проверка пользовательских функций
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%84730125%'
ORDER BY routine_name;
```

**Должны быть:**
- ✅ `create_transaction_84730125`
- ✅ `create_withdraw_request_84730125`
- ✅ `get_user_stats_84730125`
- ✅ `update_user_balance_84730125`
- ✅ `update_updated_at_84730125`

---

## ✅ 10. FRONTEND ИНТЕГРАЦИЯ

В файле `/utils/supabase/info.tsx`:

```typescript
export const projectId = 'YOUR_PROJECT_ID';
export const publicAnonKey = 'YOUR_ANON_KEY';
```

---

## 🚨 TROUBLESHOOTING

### Если API не отвечает:
```bash
supabase functions logs make-server-84730125 --tail
```

### Если таблицы не созданы:
```bash
supabase db push --force
```

### Если бакеты не созданы:
Просто вызовите health endpoint - они создадутся автоматически.

### Если ошибки с правами:
```sql
-- Дать права службному ключу
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

---

## ✅ ИТОГОВЫЙ ЧЕКЛИСТ

- [ ] SQL таблицы созданы (8+ таблиц)
- [ ] Демо данные загружены
- [ ] Edge Functions задеплоены
- [ ] Storage бакеты созданы (8 бакетов)
- [ ] API health check работает
- [ ] Секреты установлены (3+ секрета)
- [ ] RLS политики активны
- [ ] Триггеры и функции работают
- [ ] Логи без ошибок
- [ ] Frontend переменные обновлены

**Если всё ✅ - поздравляю! Деплой успешен! 🎉**
