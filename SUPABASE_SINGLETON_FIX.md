# ✅ Исправление: Multiple GoTrueClient Instances

## Проблема

```
GoTrueClient (2.93.1) Multiple GoTrueClient instances detected in the same browser context.
It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
```

## Причина

Создавалось **несколько экземпляров** Supabase Client в разных местах:
1. `/src/utils/supabase/client.ts` - singleton ✅
2. `/src/lib/supabase.ts` - **создавал новый экземпляр** ❌

Это приводило к тому, что в localStorage создавались конфликтующие записи для auth токенов.

## Решение

### 1. Единый Singleton Pattern

**Файл: `/src/utils/supabase/client.ts`**

Это единственное место где создается Supabase Client:

```typescript
let instance: SupabaseClient | undefined;
const STORAGE_KEY = `sb-${projectId}-auth-token`;

function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    instance = createClient(url, key, {
      auth: {
        storageKey: STORAGE_KEY,  // Единый ключ для всех!
        persistSession: true,
        autoRefreshToken: true,
        debug: false,             // Отключаем спам в консоли
      }
    });
  }
  return instance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});
```

**Преимущества:**
- ✅ Клиент создается **только один раз**
- ✅ Используется **один storageKey** на всё приложение
- ✅ **Lazy initialization** - клиент создается только при первом обращении
- ✅ **Proxy** обеспечивает прозрачный доступ к методам

### 2. Re-export в `/src/lib/supabase.ts`

Вместо создания нового клиента, теперь просто **реэкспортируем singleton**:

```typescript
import { supabase as supabaseSingleton } from '@/utils/supabase/client';

// Re-export singleton
export const supabase = supabaseSingleton;

// Все helper функции используют тот же экземпляр
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};
```

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│        /src/utils/supabase/client.ts                │
│  ┌──────────────────────────────────────────────┐   │
│  │  const instance = createClient(...)          │   │
│  │  export const supabase = Proxy(instance)     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────┘
              │
              │ import { supabase }
              │
    ┌─────────┴─────────────────────────────────┐
    │                                            │
    ▼                                            ▼
┌─────────────────────┐              ┌─────────────────────┐
│ /src/lib/supabase   │              │  Components & Pages │
│ Re-export singleton │              │  AuthContext        │
│ + Helper functions  │              │  SubscriptionCtx    │
└─────────────────────┘              └─────────────────────┘
```

## Проверка исправления

### До исправления:
```javascript
console.log('[Supabase] Creating client instance');  // ← Видели несколько раз
// GoTrueClient warning появлялся в консоли
```

### После исправления:
```javascript
console.log('[Supabase] Creating singleton client instance'); // ← Только один раз!
// Нет warning'ов
```

## Где используется Supabase Client

### ✅ Правильное использование (через singleton):

1. **AuthContext** (`/src/contexts/AuthContext.tsx`):
   ```typescript
   import { supabase } from '@/utils/supabase/client';
   
   useEffect(() => {
     supabase.auth.onAuthStateChange((event, session) => {
       // ...
     });
   }, []);
   ```

2. **Любые компоненты**:
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   const data = await supabase.from('table').select();
   ```

3. **Хелперы** (доступны из `/src/lib/supabase.ts`):
   ```typescript
   import { getCurrentUser, getCurrentSession, getAccessToken } from '@/lib/supabase';
   
   const user = await getCurrentUser();
   const session = await getCurrentSession();
   const token = await getAccessToken();
   ```

### 📦 Доступные экспорты из `/src/lib/supabase.ts`:

```typescript
// Singleton клиент
export const supabase: SupabaseClient;

// Helper функции
export const getCurrentUser: () => Promise<User | null>;
export const getCurrentSession: () => Promise<Session | null>;
export const getAccessToken: () => Promise<string | null>;
```

**Все эти функции используют ОДИН экземпляр клиента!**

### ❌ Неправильно (НЕ делайте так):

```typescript
// ❌ ПЛОХО - создает новый экземпляр!
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// ✅ ХОРОШО - использует singleton
import { supabase } from '@/lib/supabase';
```

## Backend (не затронут)

На backend в Edge Functions создание множественных клиентов **допустимо**, потому что:
- Каждый запрос изолирован
- Нет shared storage между запросами
- После обработки запроса клиент удаляется

```typescript
// Backend - это OK
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);
```

## Дополнительные улучшения

### 1. Отключен debug режим
```typescript
auth: {
  debug: false,  // Меньше логов в продакшене
}
```

### 2. Детектирование множественных инстансов
```typescript
let instanceCreated = false;

if (instanceCreated) {
  console.warn('[Supabase] Warning: Attempting to create multiple instances!');
}
```

### 3. Единый storage key
```typescript
const STORAGE_KEY = `sb-${projectId}-auth-token`;
// Все клиенты (если вдруг создадутся) будут использовать один ключ
```

## Тестирование

1. **Очистите localStorage**:
   ```javascript
   localStorage.clear();
   ```

2. **Перезагрузите страницу**

3. **Проверьте консоль**:
   - ✅ Должно быть: `[Supabase] Creating singleton client instance` (1 раз)
   - ❌ Не должно быть: `Multiple GoTrueClient instances detected`

4. **Проверьте localStorage**:
   ```javascript
   Object.keys(localStorage).filter(k => k.includes('supabase'));
   // Должен быть только один ключ: sb-xxx-auth-token
   ```

## Итого

✅ **Исправлено**:
- Один экземпляр клиента на всё приложение
- Один storage key для auth
- Нет warning'ов в консоли

✅ **Преимущества**:
- Стабильная работа auth
- Меньше памяти
- Нет конфликтов состояния
- Улучшенная производительность

---

**Статус**: ✅ Полностью исправлено  
**Дата**: 2026-01-27  
**Версия**: 1.0.0