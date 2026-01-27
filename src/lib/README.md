# 📚 Supabase Client - Руководство по использованию

## Быстрый старт

### Импорт клиента

```typescript
// В любом компоненте или сервисе
import { supabase } from '@/lib/supabase';
```

## Доступные экспорты

### 1. `supabase` - Singleton клиент

Основной Supabase клиент. **Всегда используйте этот экспорт!**

```typescript
import { supabase } from '@/lib/supabase';

// Auth
const { data, error } = await supabase.auth.signIn({ email, password });

// Database
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', userId);

// Storage
const { data, error } = await supabase.storage
  .from('bucket_name')
  .upload('path/to/file', file);
```

### 2. `getCurrentUser()` - Получить текущего пользователя

```typescript
import { getCurrentUser } from '@/lib/supabase';

const user = await getCurrentUser();

if (user) {
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  console.log('Metadata:', user.user_metadata);
} else {
  console.log('Not authenticated');
}
```

**Возвращает:** `User | null`

### 3. `getCurrentSession()` - Получить текущую сессию

```typescript
import { getCurrentSession } from '@/lib/supabase';

const session = await getCurrentSession();

if (session) {
  console.log('Access token:', session.access_token);
  console.log('Refresh token:', session.refresh_token);
  console.log('Expires at:', session.expires_at);
} else {
  console.log('No active session');
}
```

**Возвращает:** `Session | null`

### 4. `getAccessToken()` - Получить access token

```typescript
import { getAccessToken } from '@/lib/supabase';

const token = await getAccessToken();

// Использовать в API запросах
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token || publicAnonKey}`,
  }
});
```

**Возвращает:** `string | null`

## Примеры использования

### Auth - Регистрация

```typescript
import { supabase } from '@/lib/supabase';

async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // Сохраняется в user_metadata
      }
    }
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return null;
  }

  return data.user;
}
```

### Auth - Вход

```typescript
import { supabase } from '@/lib/supabase';

async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    return null;
  }

  return data.session;
}
```

### Auth - Выход

```typescript
import { supabase } from '@/lib/supabase';

async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error.message);
  }
}
```

### Auth - Подписка на изменения

```typescript
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        console.log('Session:', session);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in!');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out!');
        }
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
```

### Database - SELECT

```typescript
import { supabase } from '@/lib/supabase';

// Простой запрос
const { data, error } = await supabase
  .from('pitching_requests')
  .select('*')
  .eq('artist_id', userId);

// С фильтрами
const { data, error } = await supabase
  .from('pitching_requests')
  .select('id, track_title, status, created_at')
  .eq('artist_id', userId)
  .in('status', ['pending', 'in_progress'])
  .order('created_at', { ascending: false })
  .limit(10);

// С join (если есть foreign keys)
const { data, error } = await supabase
  .from('pitching_requests')
  .select(`
    *,
    artist:artist_id (
      name,
      email
    )
  `)
  .eq('status', 'completed');
```

### Database - INSERT

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('pitching_requests')
  .insert({
    artist_id: userId,
    track_title: 'My New Track',
    pitch_type: 'radio_medium',
    price: 5000,
    status: 'pending_payment',
  })
  .select() // Возвращает созданную запись
  .single(); // Возвращает один объект, а не массив
```

### Database - UPDATE

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('pitching_requests')
  .update({
    status: 'completed',
    progress: 100,
  })
  .eq('id', requestId)
  .select()
  .single();
```

### Database - DELETE

```typescript
import { supabase } from '@/lib/supabase';

const { error } = await supabase
  .from('pitching_requests')
  .delete()
  .eq('id', requestId);
```

### Storage - Upload файла

```typescript
import { supabase } from '@/lib/supabase';

async function uploadFile(file: File, userId: string) {
  const fileName = `${userId}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('make-84730125-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }

  // Получить публичный URL (если bucket публичный)
  const { data: { publicUrl } } = supabase.storage
    .from('make-84730125-media')
    .getPublicUrl(fileName);

  // Или получить signed URL (для приватных buckets)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('make-84730125-media')
    .createSignedUrl(fileName, 60 * 60); // 1 час

  return signedData?.signedUrl;
}
```

### Storage - Скачать файл

```typescript
import { supabase } from '@/lib/supabase';

async function downloadFile(path: string) {
  const { data, error } = await supabase.storage
    .from('make-84730125-media')
    .download(path);

  if (error) {
    console.error('Download error:', error.message);
    return null;
  }

  // data это Blob
  const url = URL.createObjectURL(data);
  return url;
}
```

### Storage - Удалить файл

```typescript
import { supabase } from '@/lib/supabase';

async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('make-84730125-media')
    .remove([path]);

  if (error) {
    console.error('Delete error:', error.message);
  }
}
```

## React Hooks - Примеры

### useUser - Получить текущего пользователя

```typescript
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/supabase';

function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

// Использование
function MyComponent() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Hello, {user.email}!</div>;
}
```

### useAuth - Полноценный auth hook

```typescript
import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получить текущего пользователя
    getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Подписаться на изменения
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

## Важные заметки

### ⚠️ Singleton Pattern

**Всегда импортируйте из `/src/lib/supabase.ts` или `/src/utils/supabase/client.ts`!**

```typescript
// ✅ ПРАВИЛЬНО
import { supabase } from '@/lib/supabase';

// ❌ НЕПРАВИЛЬНО - создаст новый экземпляр!
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
```

### 🔒 Row Level Security (RLS)

Все таблицы защищены RLS. Убедитесь что:
- Пользователь авторизован
- Политики настроены правильно
- `artist_id` соответствует `auth.uid()`

### 🐛 Обработка ошибок

Всегда проверяйте `error`:

```typescript
const { data, error } = await supabase.from('table').select();

if (error) {
  console.error('Database error:', error.message);
  // Показать пользователю понятное сообщение
  return;
}

// Работаем с data
```

### 📊 TypeScript типы

```typescript
import type { User, Session } from '@supabase/supabase-js';

const user: User | null = await getCurrentUser();
const session: Session | null = await getCurrentSession();
```

## Troubleshooting

### Проблема: "Multiple GoTrueClient instances"

**Решение:** Убедитесь что используете singleton из `/src/lib/supabase.ts`

См. [`/SUPABASE_SINGLETON_FIX.md`](/SUPABASE_SINGLETON_FIX.md)

### Проблема: "Row violates row-level security policy"

**Решение:** 
1. Проверьте что пользователь авторизован
2. Убедитесь что `artist_id` = `auth.uid()`
3. Проверьте RLS политики в Supabase Dashboard

### Проблема: "Invalid JWT" / "Unauthorized"

**Решение:**
```typescript
// Получите свежий токен
const token = await getAccessToken();

// Используйте в запросах
fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Дополнительные ресурсы

- 📚 [Supabase Docs](https://supabase.com/docs)
- 🔧 [Troubleshooting](/cabinets/artist-promo-music/TROUBLESHOOTING.md)
- 🐛 [Singleton Fix](/SUPABASE_SINGLETON_FIX.md)

---

**Обновлено:** 2026-01-27  
**Версия:** 1.0.0
