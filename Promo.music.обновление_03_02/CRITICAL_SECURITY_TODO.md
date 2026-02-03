# 🔒 КРИТИЧЕСКИЕ ЗАДАЧИ ПО БЕЗОПАСНОСТИ

## ⚠️ ОБЯЗАТЕЛЬНО ВЫПОЛНИТЬ ПЕРЕД PRODUCTION

### 1. АУТЕНТИФИКАЦИЯ (Критичность: 🔴 ВЫСОКАЯ)

**Текущая проблема:**
```tsx
// ❌ НЕБЕЗОПАСНО - можно обойти через DevTools
localStorage.setItem('isAuthenticated', 'true');
```

**Решение:**
```tsx
// ✅ Использовать Supabase Auth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Вход
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Проверка на каждом запросе
const { data: { user } } = await supabase.auth.getUser(session.access_token);
if (!user) throw new Error('Unauthorized');
```

**Файлы для изменения:**
- `/src/app/RootApp.tsx` - заменить localStorage на Supabase Auth
- `/src/app/components/unified-login.tsx` - интегрировать реальный вход
- `/supabase/functions/server/auth-routes.tsx` - убрать deprecated endpoints

**Приоритет:** 🔴 Критичный  
**Время:** 4-6 часов  
**Статус:** ⏳ Не выполнено

---

### 2. CSRF ЗАЩИТА (Критичность: 🔴 ВЫСОКАЯ)

**Текущая проблема:**
- Все POST/PUT/DELETE запросы без CSRF токенов
- Возможна атака через сторонний сайт

**Решение:**
```tsx
// Backend: генерация токена
app.use(async (c, next) => {
  const csrfToken = crypto.randomUUID();
  c.set('csrfToken', csrfToken);
  c.header('X-CSRF-Token', csrfToken);
  await next();
});

// Backend: проверка токена
app.post('/api/*', async (c, next) => {
  const token = c.req.header('X-CSRF-Token');
  const sessionToken = c.get('csrfToken');
  
  if (!token || token !== sessionToken) {
    return c.json({ error: 'Invalid CSRF token' }, 403);
  }
  
  await next();
});

// Frontend: отправка токена
const response = await fetch('/api/tracks', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**Файлы для изменения:**
- `/supabase/functions/server/index.tsx` - добавить CSRF middleware
- Все компоненты с fetch запросами

**Приоритет:** 🔴 Критичный  
**Время:** 3-4 часа  
**Статус:** ⏳ Не выполнено

---

### 3. RATE LIMITING (Критичность: 🟠 ВЫСОКАЯ)

**Текущая проблема:**
- Можно делать неограниченное количество запросов
- DDoS атаки, спам регистраций

**Решение (Upstash Redis):**
```tsx
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

app.use('*', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || 
             c.req.header('x-forwarded-for') || 
             'unknown';
  
  const { success, limit, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return c.json({ 
      error: 'Too many requests',
      limit,
      remaining,
      retryAfter: 10
    }, 429);
  }
  
  await next();
});
```

**Альтернатива (без Redis):**
```tsx
// Простой in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}
```

**Файлы для изменения:**
- `/supabase/functions/server/index.tsx` - добавить rate limiting middleware

**Приоритет:** 🟠 Высокий  
**Время:** 2-3 часа  
**Статус:** ⏳ Не выполнено

---

### 4. ENVIRONMENT VARIABLES VALIDATION (Критичность: 🟡 СРЕДНЯЯ)

**Текущая проблема:**
```tsx
// ❌ Может быть undefined
const supabaseUrl = Deno.env.get('SUPABASE_URL');
```

**Решение:**
```tsx
// ✅ Валидация при старте
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY'
] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter(v => !Deno.env.get(v));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Вызвать ДО Deno.serve()
validateEnv();

// Type-safe env getter
function getEnv(key: typeof requiredEnvVars[number]): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}
```

**Файлы для изменения:**
- `/supabase/functions/server/index.tsx` - добавить валидацию при старте
- Все файлы с `Deno.env.get()`

**Приоритет:** 🟡 Средний  
**Время:** 1 час  
**Статус:** ⏳ Не выполнено

---

### 5. УДАЛИТЬ CONSOLE.LOG В PRODUCTION (Критичность: 🟡 СРЕДНЯЯ)

**Текущая проблема:**
- 17+ случаев `console.log()` в production
- Утечка внутренней информации

**Решение:**
```tsx
// Глобально отключить в production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // console.error оставляем для критических ошибок
}
```

**Или:**
```tsx
// Обернуть все логи
if (import.meta.env.DEV) {
  console.log('🔐 Initial auth state:', auth);
}
```

**Файлы для изменения:**
- `/src/main.tsx` - добавить глобальное отключение
- `/src/app/RootApp.tsx` - обернуть все логи в DEV check
- Все компоненты с console.log

**Приоритет:** 🟡 Средний  
**Время:** 30 минут  
**Статус:** ✅ Частично выполнено (RootApp.tsx)

---

### 6. SQL INJECTION ЗАЩИТА (Критичность: 🟢 НИЗКАЯ)

**Текущее состояние:**
✅ **УЖЕ ЗАЩИЩЕНО** - используется Supabase Client с параметризованными запросами

**Проверка:**
```tsx
// ✅ Безопасно
const { data } = await supabase
  .from('tracks')
  .select('*')
  .eq('user_id', userId); // Автоматически экранировано
```

**НЕ используйте:**
```tsx
// ❌ ОПАСНО!
const { data } = await supabase
  .rpc('raw_sql', { 
    sql: `SELECT * FROM tracks WHERE id = ${trackId}` 
  });
```

**Приоритет:** 🟢 Низкий (уже защищено)  
**Статус:** ✅ Выполнено

---

### 7. XSS ЗАЩИТА (Критичность: 🟢 НИЗКАЯ)

**Текущее состояние:**
✅ **УЖЕ ЗАЩИЩЕНО** - React автоматически экранирует

**Потенциальная уязвимость:**
```tsx
// ⚠️ Единственное использование dangerouslySetInnerHTML
// /src/app/components/ui/chart.tsx:83
<style dangerouslySetInnerHTML={{ __html: cssString }} />
```

**Проверка:**
- ✅ Используется только для CSS генерации
- ✅ Нет user input
- ✅ Безопасно

**Приоритет:** 🟢 Низкий (уже защищено)  
**Статус:** ✅ Выполнено

---

## 📋 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

### Backend
- [ ] Заменить localStorage auth на Supabase Auth
- [ ] Добавить CSRF защиту
- [ ] Добавить Rate Limiting
- [ ] Валидация environment variables
- [ ] Удалить все console.log в production
- [ ] Настроить CORS (только разрешенные домены)
- [ ] Добавить логирование ошибок (Sentry/LogRocket)

### Frontend
- [ ] Заменить localStorage auth на Supabase Auth
- [ ] Добавить CSRF токены во все запросы
- [ ] Удалить все console.log в production
- [ ] Добавить Content Security Policy
- [ ] Настроить Error Boundaries (✅ уже сделано)
- [ ] Добавить мониторинг ошибок

### Database
- [ ] Включить Row Level Security (RLS)
- [ ] Создать политики доступа
- [ ] Ограничить права Service Role Key
- [ ] Настроить бэкапы

### Infrastructure
- [ ] HTTPS everywhere
- [ ] Защита от DDoS (Cloudflare)
- [ ] Мониторинг производительности
- [ ] Логирование доступа

---

## 🚀 ПЛАН ВНЕДРЕНИЯ

### Фаза 1: Критичные исправления (1 неделя)
1. День 1-2: Supabase Auth интеграция
2. День 3: CSRF защита
3. День 4: Rate Limiting
4. День 5: Тестирование

### Фаза 2: Улучшения (1 неделя)
1. Env validation
2. Production logging
3. Error monitoring
4. Security headers

### Фаза 3: Финальная проверка (3 дня)
1. Penetration testing
2. Code review
3. Security audit
4. Deployment

---

## 📚 ПОЛЕЗНЫЕ РЕСУРСЫ

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## ⚠️ ВАЖНО!

**НЕ ДЕПЛОИТЬ В PRODUCTION БЕЗ:**
1. ✅ Supabase Auth
2. ✅ CSRF защиты
3. ✅ Rate Limiting
4. ✅ Environment validation

**Текущий security score: 4/10**  
**После исправлений: 9/10**
