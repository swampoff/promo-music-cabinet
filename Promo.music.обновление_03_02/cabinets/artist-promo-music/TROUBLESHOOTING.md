# 🔧 Troubleshooting - Artist Cabinet

## Частые проблемы и решения

### 1. "Multiple GoTrueClient instances detected"

**Симптомы:**
```
GoTrueClient (2.93.1) Multiple GoTrueClient instances detected in the same browser context.
```

**Причина:**
Создается несколько экземпляров Supabase Client в разных частях приложения.

**Решение:**
✅ **УЖЕ ИСПРАВЛЕНО!** Используется singleton pattern.

**Как проверить:**
```typescript
// Добавьте компонент в App.tsx (только для dev)
import { SupabaseHealthCheckWrapper } from '@/app/components/supabase-health-check';

function App() {
  return (
    <>
      <YourApp />
      {/* Показывает статус в правом нижнем углу */}
      <SupabaseHealthCheckWrapper />
    </>
  );
}
```

**Ручная проверка:**
```javascript
// В консоли браузера:
localStorage.clear();
location.reload();

// После загрузки проверьте консоль:
// ✅ Должно быть: "[Supabase] Creating singleton client instance" (1 раз)
// ❌ Не должно быть: "Multiple GoTrueClient instances"

// Проверьте localStorage:
Object.keys(localStorage).filter(k => k.includes('supabase'));
// Должен быть ОДИН ключ вида: sb-xxx-auth-token
```

---

### 2. "Failed to load requests" / "Database not initialized"

**Симптомы:**
- Пустые списки в Pitching, Production360
- В консоли: `database_not_initialized`

**Причина:**
Таблицы в PostgreSQL не созданы.

**Решение:**

**Вариант А - Автоматический:**
```bash
cd /cabinets/artist-promo-music
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
deno run --allow-net --allow-read --allow-env deploy-direct.ts
```

**Вариант Б - Вручную:**
1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое `database/001_promotion_tables.sql`
3. Вставьте и нажмите **Run**

**Проверка:**
```sql
-- В SQL Editor выполните:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%request%';

-- Должно вернуть 8 таблиц
```

---

### 3. Edge Function не работает

**Симптомы:**
- 404 ошибка при обращении к API
- Нет ответа от сервера

**Причина:**
Edge Function не задеплоена.

**Решение:**
```bash
# Установите Supabase CLI
npm install -g supabase

# Логин
supabase login

# Свяжите с проектом
supabase link --project-ref your-project-ref

# Деплой
supabase functions deploy make-server-84730125
```

**Проверка:**
1. Dashboard → Edge Functions
2. Должна быть функция `make-server-84730125` со статусом **Active**
3. Проверьте логи:
   ```bash
   supabase functions logs make-server-84730125
   ```

**Тестовый запрос:**
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/promotion/pitching/test-user \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Ожидаемый ответ:
# {"success":true,"data":[],"_meta":{"needsSetup":false}}
```

---

### 4. CORS ошибки

**Симптомы:**
```
Access to fetch has been blocked by CORS policy
```

**Причина:**
Edge Function не возвращает правильные CORS headers.

**Решение:**
Проверьте что в `backend/index.tsx` есть:
```typescript
import { cors } from 'npm:hono/cors';

app.use('*', cors({
  origin: '*', // или конкретный домен
  credentials: true,
}));
```

---

### 5. "Auth token missing" / Unauthorized

**Симптомы:**
- 401 ошибка при API запросах
- "Unauthorized" в ответе

**Причина:**
Не передается Bearer token или пользователь не авторизован.

**Решение:**

**Проверьте токен:**
```typescript
import { supabase } from '@/lib/supabase';

const { data: { session } } = await supabase.auth.getSession();
console.log('Access token:', session?.access_token);
```

**Убедитесь что передается токен:**
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`, // или access_token
  }
});
```

---

### 6. Slow performance / Too many requests

**Симптомы:**
- Медленная загрузка данных
- Много запросов в Network tab

**Причина:**
Множественные вызовы API, отсутствие кеширования.

**Решение:**

**1. Используйте React Query:**
```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['pitching', userId],
    queryFn: () => fetchPitchingRequests(userId),
    staleTime: 60000, // Кеш на 1 минуту
  });
}
```

**2. Дебаунс для поиска:**
```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 500);

useEffect(() => {
  // Запрос только после 500ms паузы в вводе
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

---

### 7. Storage bucket ошибки

**Симптомы:**
- "Bucket not found"
- Не загружаются изображения/файлы

**Причина:**
Storage bucket не создан.

**Решение:**

**Автоматически:**
```bash
deno run --allow-net --allow-read --allow-env deploy-direct.ts
```

**Вручную:**
1. Dashboard → Storage → **Create bucket**
2. Name: `make-84730125-media`
3. Settings:
   - Public: **No** (Private)
   - Max file size: **50 MB**
   - Allowed types: `image/*`, `video/*`, `audio/*`

**Проверка:**
```javascript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data);
// Должен быть: make-84730125-media
```

---

### 8. RLS (Row Level Security) ошибки

**Симптомы:**
- "new row violates row-level security policy"
- Не могу получить/создать данные

**Причина:**
RLS политики блокируют доступ.

**Решение:**

**Проверьте auth:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
// Должен быть UUID
```

**Проверьте политики в SQL:**
```sql
-- В SQL Editor:
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

**Временно отключите RLS (только для дебага!):**
```sql
ALTER TABLE pitching_requests DISABLE ROW LEVEL SECURITY;
-- После дебага ОБЯЗАТЕЛЬНО включите обратно:
ALTER TABLE pitching_requests ENABLE ROW LEVEL SECURITY;
```

---

## Логирование и дебаг

### Включить подробные логи

**Frontend:**
```typescript
// В .env.local добавьте:
VITE_DEBUG=true

// В коде:
if (import.meta.env.VITE_DEBUG) {
  console.log('[Debug]', data);
}
```

**Backend (Edge Function):**
```typescript
console.log('[Server]', request.method, request.url);
console.log('[Server] Body:', await request.json());
```

**Просмотр логов:**
```bash
# Realtime логи
supabase functions logs make-server-84730125 --follow

# Последние 100 записей
supabase functions logs make-server-84730125 --limit 100
```

### Browser DevTools

**Network tab:**
- Проверьте статус код (200, 401, 500)
- Проверьте Request Headers (Authorization)
- Проверьте Response body

**Console tab:**
- Фильтр по "[Supabase]" для наших логов
- Фильтр по "error" для ошибок

**Application tab → Local Storage:**
- Проверьте `sb-xxx-auth-token`
- Должен содержать `access_token`, `refresh_token`

---

## Полезные команды

```bash
# Проверить статус Supabase
supabase status

# Рестарт локального Supabase (если используется)
supabase stop
supabase start

# Обновить миграции
supabase db push

# Сгенерировать TypeScript типы
supabase gen types typescript --local > src/types/database.ts

# Проверить Edge Function локально
supabase functions serve make-server-84730125
```

---

## Получить помощь

1. **Проверьте документацию:**
   - `/cabinets/artist-promo-music/README.md`
   - `/SUPABASE_SINGLETON_FIX.md`
   - [Supabase Docs](https://supabase.com/docs)

2. **Проверьте логи:**
   - Browser Console
   - Supabase Dashboard → Edge Functions → Logs
   - Network tab в DevTools

3. **Используйте Health Check:**
   ```typescript
   import { SupabaseHealthCheckWrapper } from '@/app/components/supabase-health-check';
   ```

4. **Создайте issue:**
   - Опишите проблему
   - Приложите скриншоты
   - Скопируйте логи из консоли

---

**Последнее обновление:** 2026-01-27
