# 📚 РУКОВОДСТВО ПО НОВЫМ КОМПОНЕНТАМ

**Версия:** 2.0.0  
**Дата:** 29 января 2026

---

## 🎯 БЫСТРЫЙ СТАРТ

### Импорты

```tsx
// Performance хуки
import { useDebounce, useAsyncState } from '@/hooks';

// UI компоненты
import { 
  GlassCard, 
  GlassStatCard, 
  GlassButton,
  ErrorBoundary 
} from '@/app/components/ui';
```

---

## 🔄 PERFORMANCE ХУКИ

### 1. useDebounce

**Назначение:** Задерживает обновление значения для оптимизации частых событий.

**Пример: Поиск**
```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // Запрос выполнится только через 300мс после последнего ввода
      fetchSearchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Поиск..."
    />
  );
}

// ✅ Результат: 1 запрос вместо 15+
```

**Параметры:**
- `value` - значение для дебаунса
- `delay` - задержка в мс (по умолчанию 500)

---

### 2. useDebouncedCallback

**Назначение:** Создает дебаунсированную версию функции.

**Пример: Автосохранение**
```tsx
import { useDebouncedCallback } from '@/hooks';

function EditorComponent() {
  const saveDocument = useDebouncedCallback(async (content: string) => {
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }, 1000);

  return (
    <textarea
      onChange={(e) => saveDocument(e.target.value)}
      placeholder="Начните печатать..."
    />
  );
}

// ✅ Автосохранение через 1 секунду после остановки ввода
```

---

### 3. useThrottle

**Назначение:** Ограничивает частоту обновлений (не более 1 раза в N мс).

**Пример: Отслеживание прокрутки**
```tsx
import { useState, useEffect } from 'react';
import { useThrottle } from '@/hooks';

function ScrollIndicator() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScroll = useThrottle(scrollY, 100);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Обновляется максимум раз в 100мс
    updateProgressBar(throttledScroll);
  }, [throttledScroll]);

  return <div>Scroll: {throttledScroll}px</div>;
}

// ✅ Плавная работа без лагов
```

---

### 4. useAsyncState

**Назначение:** Универсальное управление асинхронными операциями.

**Пример: Загрузка данных**
```tsx
import { useEffect } from 'react';
import { useAsyncState } from '@/hooks';

interface User {
  id: string;
  name: string;
}

function UsersPage() {
  const { data, loading, error, execute } = useAsyncState<User[]>();

  useEffect(() => {
    execute(async () => {
      const response = await fetch('/api/users');
      return response.json();
    });
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**API:**
```tsx
const {
  data,          // T | null - данные
  loading,       // boolean - статус загрузки
  error,         // string | null - ошибка
  execute,       // (fn) => Promise<void> - выполнить async функцию
  reset,         // () => void - сбросить состояние
  setData,       // (data) => void - установить данные
  setError,      // (error) => void - установить ошибку
  setLoading,    // (loading) => void - установить loading
} = useAsyncState<T>();
```

---

### 5. useAsyncList

**Назначение:** Управление списками с пагинацией и бесконечной прокруткой.

**Пример: Бесконечная лента**
```tsx
import { useAsyncList } from '@/hooks';

interface Track {
  id: string;
  title: string;
}

function TracksList() {
  const { 
    items, 
    loading, 
    hasMore, 
    loadMore, 
    refresh 
  } = useAsyncList<Track>(
    async (page) => {
      const response = await fetch(`/api/tracks?page=${page}`);
      return response.json();
    },
    20 // размер страницы
  );

  return (
    <div>
      {items.map(track => (
        <div key={track.id}>{track.title}</div>
      ))}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Загрузка...' : 'Загрузить еще'}
        </button>
      )}
      
      <button onClick={refresh}>Обновить</button>
    </div>
  );
}
```

---

## 🎨 UI КОМПОНЕНТЫ

### 1. GlassCard

**Назначение:** Универсальная карточка с glassmorphism эффектом.

**Пример:**
```tsx
import { GlassCard } from '@/app/components/ui';

function MyComponent() {
  return (
    <GlassCard 
      padding="lg"      // none | sm | md | lg | xl
      border="accent"   // none | default | accent
      hover             // hover эффект
      gradient          // градиентный фон
      animated          // анимация появления
    >
      <h2>Содержимое</h2>
    </GlassCard>
  );
}
```

**Props:**
- `padding` - отступы внутри карточки
- `border` - стиль границы
- `hover` - эффект при наведении
- `gradient` - градиентный фон
- `animated` - motion анимация
- `className` - дополнительные классы

---

### 2. GlassCardHeader

**Назначение:** Заголовок для GlassCard с иконкой и действием.

**Пример:**
```tsx
import { GlassCard, GlassCardHeader } from '@/app/components/ui';
import { Music2, Plus } from 'lucide-react';

function TracksSection() {
  return (
    <GlassCard padding="lg">
      <GlassCardHeader
        title="Мои треки"
        description="Управление вашей музыкальной коллекцией"
        icon={Music2}
        iconColor="text-cyan-400"
        action={
          <button className="px-4 py-2 bg-cyan-500 rounded-lg">
            <Plus className="w-4 h-4" />
          </button>
        }
      />
      {/* Содержимое */}
    </GlassCard>
  );
}
```

---

### 3. GlassStatCard

**Назначение:** Карточка статистики с иконкой и трендом.

**Пример:**
```tsx
import { GlassStatCard } from '@/app/components/ui';
import { Eye, Heart, Users, DollarSign } from 'lucide-react';

function StatsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <GlassStatCard
        label="Просмотры"
        value={12500}
        icon={Eye}
        color="cyan"
        size="md"
        trend={{ value: 24.5, isPositive: true }}
      />
      
      <GlassStatCard
        label="Лайки"
        value={3420}
        icon={Heart}
        color="pink"
        trend={{ value: -5.2, isPositive: false }}
      />
      
      <GlassStatCard
        label="Подписчики"
        value="2.3K"
        icon={Users}
        color="purple"
      />
      
      <GlassStatCard
        label="Доход"
        value="$8,450"
        icon={DollarSign}
        color="emerald"
        trend={{ value: 18.9, isPositive: true }}
      />
    </div>
  );
}
```

**Цвета:**
- `emerald` - зеленый
- `cyan` - голубой
- `purple` - фиолетовый
- `orange` - оранжевый
- `pink` - розовый
- `blue` - синий

---

### 4. GlassButton

**Назначение:** Кнопка в стиле glassmorphism.

**Пример:**
```tsx
import { GlassButton } from '@/app/components/ui';
import { Plus, Save, Trash2 } from 'lucide-react';

function ActionButtons() {
  return (
    <div className="flex gap-3">
      <GlassButton
        variant="primary"
        size="lg"
        icon={Plus}
        onClick={() => console.log('Create')}
        fullWidth
      >
        Создать
      </GlassButton>
      
      <GlassButton
        variant="secondary"
        size="md"
        icon={Save}
      >
        Сохранить
      </GlassButton>
      
      <GlassButton
        variant="danger"
        size="sm"
        icon={Trash2}
        disabled
      >
        Удалить
      </GlassButton>
    </div>
  );
}
```

**Варианты:**
- `primary` - градиент cyan→blue
- `secondary` - прозрачный с границей
- `danger` - градиент red→pink
- `success` - градиент emerald→green

**Размеры:**
- `sm` - маленький
- `md` - средний (по умолчанию)
- `lg` - большой

---

### 5. ErrorBoundary

**Назначение:** Перехват ошибок React и отображение fallback UI.

**Пример: Глобальный**
```tsx
import { ErrorBoundary } from '@/app/components/ui';

function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
```

**Пример: Локальный**
```tsx
import { SectionErrorBoundary } from '@/app/components/ui';

function Dashboard() {
  return (
    <div>
      <SectionErrorBoundary sectionName="Статистика">
        <StatsWidget />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary sectionName="Графики">
        <ChartsWidget />
      </SectionErrorBoundary>
    </div>
  );
}
```

**Пример: Кастомный fallback**
```tsx
import { ErrorBoundary } from '@/app/components/ui';

function Page() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <h2>Что-то пошло не так :(</h2>
          <button onClick={() => window.location.reload()}>
            Обновить
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        // Логирование в Sentry/LogRocket
        console.error('Error:', error, errorInfo);
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

---

## 💡 ЛУЧШИЕ ПРАКТИКИ

### ✅ DO

```tsx
// ✅ Используйте debounce для поиска
const debouncedQuery = useDebounce(searchQuery, 300);

// ✅ Используйте GlassCard для консистентности
<GlassCard padding="lg">
  <GlassCardHeader title="Заголовок" icon={Music2} />
</GlassCard>

// ✅ Оборачивайте компоненты в ErrorBoundary
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>

// ✅ Используйте useAsyncState для загрузки данных
const { data, loading, error } = useAsyncState<User[]>();
```

### ❌ DON'T

```tsx
// ❌ Не делайте запрос на каждый символ
<input onChange={(e) => fetchResults(e.target.value)} />

// ❌ Не дублируйте Tailwind классы
<div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5...">

// ❌ Не игнорируйте ошибки
try {
  await fetchData();
} catch (e) {
  // пусто
}

// ❌ Не используйте любые типы
const data: any = await response.json();
```

---

## 🔄 МИГРАЦИЯ СТАРОГО КОДА

### До:
```tsx
function OldComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ❌ Запрос на каждый символ
  useEffect(() => {
    fetchResults(searchQuery);
  }, [searchQuery]);
  
  return (
    // ❌ Дублирование классов
    <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
      <input onChange={(e) => setSearchQuery(e.target.value)} />
    </div>
  );
}
```

### После:
```tsx
import { useDebounce } from '@/hooks';
import { GlassCard } from '@/app/components/ui';

function NewComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // ✅ Запрос только через 300мс после остановки ввода
  useEffect(() => {
    if (debouncedQuery) {
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <GlassCard padding="lg">
      <input onChange={(e) => setSearchQuery(e.target.value)} />
    </GlassCard>
  );
}
```

**Результат:**
- ✅ 1 запрос вместо 15+
- ✅ -80% кода
- ✅ Консистентный дизайн

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [React Hooks Docs](https://react.dev/reference/react)
- [Motion Docs](https://motion.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Обновлено:** 29 января 2026  
**Версия:** 2.0.0
