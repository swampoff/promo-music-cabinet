# ⚡ БЫСТРЫЕ ИСПРАВЛЕНИЯ - 20 минут

## 🎯 КРИТИЧЕСКИЕ ФИКСЫ (обязательно перед деплоем)

### Fix #1: Подключить MyConcertsPage к App.tsx (5 мин)

```typescript
// Файл: /src/app/App.tsx

// 1. Добавить импорт (после строки 7)
import { MyConcertsPage } from '@/app/components/my-concerts-page';

// 2. Найти строку ~210-220 где рендерится ConcertsPage
// Заменить:
- {activeSection === 'concerts' && (
-   <ConcertsPage 
-     userCoins={coinsBalance} 
-     onCoinsUpdate={setCoinsBalance} 
-   />
- )}

+ {activeSection === 'concerts' && (
+   <MyConcertsPage 
+     userCoins={coinsBalance} 
+     onCoinsUpdate={setCoinsBalance} 
+   />
+ )}
```

---

### Fix #2: Добавить Toaster (5 мин)

```typescript
// Файл: /src/app/App.tsx

// 1. Добавить импорт (в начале файла)
import { Toaster } from 'sonner';

// 2. Добавить в return App() в конец (перед закрывающим </div>)
export default function App() {
  // ... существующий код ...
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* ... весь существующий код ... */}
      
      {/* ДОБАВИТЬ В САМЫЙ КОНЕЦ: */}
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}
```

---

### Fix #3: Заменить alert/confirm на toast (10 мин)

```typescript
// Файл: /src/app/components/my-concerts-page.tsx

// 1. Добавить импорт (строка 3)
import { toast } from 'sonner';

// 2. Заменить handleDelete (строки 46-58)
const handleDelete = async (id: string) => {
  // ЗАМЕНИТЬ confirm на toast
  toast.promise(
    concertsApiAdapter.delete(id),
    {
      loading: 'Удаление концерта...',
      success: () => {
        setConcerts(concerts.filter(c => c.id !== id));
        return 'Концерт успешно удалён';
      },
      error: (err) => `Ошибка удаления: ${err.error || err.message}`
    }
  );
};

// 3. Заменить handleSubmitForModeration (строки 60-68)
const handleSubmitForModeration = async (id: string) => {
  toast.promise(
    concertsApiAdapter.submit(id),
    {
      loading: 'Отправка на модерацию...',
      success: (response) => {
        if (response.data) {
          setConcerts(concerts.map(c => c.id === id ? response.data! : c));
        }
        return 'Отправлено на модерацию';
      },
      error: (err) => `Ошибка: ${err.error || err.message}`
    }
  );
};

// 4. Заменить handlePromote (строки 70-84)
const handlePromote = async (id: string) => {
  if (userCoins < 100) {
    toast.error('Недостаточно коинов для продвижения (требуется 100)');
    return;
  }

  toast.promise(
    concertsApiAdapter.promote(id, 7),
    {
      loading: 'Продвижение концерта...',
      success: (response) => {
        if (response.data) {
          setConcerts(concerts.map(c => c.id === id ? response.data! : c));
          onCoinsUpdate(userCoins - 100);
        }
        return 'Концерт успешно продвинут на 7 дней!';
      },
      error: (err) => `Ошибка продвижения: ${err.error || err.message}`
    }
  );
};
```

---

## ✅ ГОТОВО!

После этих 3 исправлений можно деплоить:

```bash
git add .
git commit -m "fix: critical fixes for concerts page"
git push
```

---

## 🎁 БОНУСНЫЕ ФИКСЫ (опционально, +30 мин)

### Bonus #1: Показать backend status

```typescript
// Файл: /src/app/components/my-concerts-page.tsx

// В return, после заголовка (после строки 141):
<div>
  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
    Мои Концерты
  </h1>
  <p className="text-gray-400 mt-2">Управление выступлениями и турами</p>
  
  {/* ДОБАВИТЬ: */}
  {backendStatus && (
    <p className="text-xs text-gray-500 mt-1">{backendStatus}</p>
  )}
</div>
```

### Bonus #2: Добавить loading state для кнопок

```typescript
// В компоненте добавить state:
const [actionLoading, setActionLoading] = useState<string | null>(null);

// Обернуть handleSubmitForModeration:
const handleSubmitForModeration = async (id: string) => {
  setActionLoading(id);
  // ... существующий код ...
  setActionLoading(null);
};

// В кнопке (строка 283-290):
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => handleSubmitForModeration(concert.id)}
  disabled={actionLoading === concert.id}
  className="flex-1 px-4 py-2 bg-purple-600/80 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
>
  {actionLoading === concert.id ? (
    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
  ) : (
    'На модерацию'
  )}
</motion.button>
```

### Bonus #3: Исправить useEffect

```typescript
// Заменить useEffect (строки 21-24):
useEffect(() => {
  let cancelled = false;
  
  const init = async () => {
    const response = await concertsApiAdapter.getAll();
    
    if (!cancelled) {
      if (response.success && response.data) {
        setConcerts(response.data);
      } else {
        setError(response.error || 'Не удалось загрузить концерты');
      }
      setLoading(false);
    }
  };
  
  init();
  checkBackendStatus();
  
  return () => {
    cancelled = true;
  };
}, []);
```

---

## 📊 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

- [ ] Fix #1: MyConcertsPage подключен к App.tsx
- [ ] Fix #2: Toaster добавлен в App.tsx
- [ ] Fix #3: alert/confirm заменены на toast
- [ ] Проверено локально: `npm run dev`
- [ ] Нет TypeScript ошибок: `npm run type-check`
- [ ] Git commit создан
- [ ] Готов к push!

---

## 🚀 ДЕПЛОЙ

```bash
# После всех фиксов:
git add .
git commit -m "fix: integrate MyConcertsPage with toast notifications"
git push origin main

# Vercel автоматически задеплоит
```

---

## 🎉 ПОСЛЕ ДЕПЛОЯ

1. Открыть приложение
2. Перейти в "Концерты"
3. Проверить что:
   - ✅ Отображаются концерты (реальные или mock)
   - ✅ При удалении показывается toast
   - ✅ При модерации показывается toast
   - ✅ При продвижении показывается toast
   - ✅ Нет alert/confirm диалогов

---

**Время на фиксы:** 20-50 минут  
**Сложность:** Легко  
**Готовность:** ✅ Готово к деплою после фиксов!
