# 🛡️ ENTERPRISE ERROR HANDLING GUIDE

## 🎯 Философия

**promo.music использует подход "Graceful Degradation":**
- Никогда не показываем системные ошибки пользователю
- Всегда предоставляем пустые состояния вместо ошибок
- Логируем ошибки в консоль для отладки
- Приложение продолжает работать даже при отказе backend

## ✅ Правильный паттерн обработки fetch

### ❌ НЕПРАВИЛЬНО:
```typescript
const loadData = async () => {
  const response = await fetch(url);
  const data = await response.json();
  setData(data); // ❌ Приложение падает при ошибке
};
```

### ✅ ПРАВИЛЬНО:
```typescript
const loadData = async () => {
  try {
    // 1. Добавляем timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });
    
    clearTimeout(timeoutId);
    
    // 2. Проверяем статус
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    setData(data);
    
  } catch (err) {
    // 3. Graceful Error Handling
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[Component] ⏱️ Request timeout - using empty state');
    } else {
      console.warn('[Component] ⚠️ Failed to load data:', err);
    }
    
    // 4. Показываем пустое состояние
    setData(EMPTY_STATE);
    setError(null); // Не показываем ошибку в UI
  }
};
```

## 🔧 Исправленные компоненты

### ✅ SubscriptionContext
- Добавлен timeout (5 сек)
- Graceful error handling
- Fallback на FREE tier
- localStorage для offline работы

## 📝 Компоненты требующие проверки

Если возникнут ошибки, применить тот же паттерн к:

1. **NotificationsManager** (`/src/app/components/notifications-manager.tsx`)
2. **EmailCampaigns** (`/src/app/components/email-campaigns.tsx`)
3. **TicketingIntegration** (`/src/app/components/ticketing-integration.tsx`)
4. **MarketingAnalytics** (`/src/app/components/marketing-analytics.tsx`)
5. **BannerAdManagement** (`/src/app/components/banner-ad-management.tsx`)

## 🎨 UI для пустых состояний

### Пример Empty State компонента:
```tsx
function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-white/70 mb-2">
        {title}
      </h3>
      <p className="text-sm text-white/40 text-center max-w-md">
        {description}
      </p>
    </motion.div>
  );
}
```

### Использование:
```tsx
{loading && <Loader />}
{!loading && data.length === 0 && (
  <EmptyState
    icon={Database}
    title="Нет данных"
    description="Данные появятся здесь, когда будут добавлены"
  />
)}
{!loading && data.length > 0 && (
  <DataList data={data} />
)}
```

## 🚀 Best Practices

1. **Всегда используйте timeout**
   - Минимум: 5 секунд
   - Максимум: 30 секунд

2. **Сохраняйте данные локально**
   - localStorage для критичных данных
   - sessionStorage для временных данных

3. **Логируйте правильно**
   - `console.warn()` для ошибок, которые приложение обрабатывает
   - `console.error()` только для критических ошибок
   - Префикс компонента: `[ComponentName]`

4. **Тестируйте offline**
   - Откройте DevTools → Network → Offline
   - Приложение должно продолжать работать

## 🎯 Checklist для каждого fetch

- [ ] Добавлен timeout через AbortController
- [ ] Обработка ошибок в try/catch
- [ ] Проверка response.ok
- [ ] Fallback на пустое состояние
- [ ] Не показываем ошибку в UI (setError(null))
- [ ] Логируем в консоль с префиксом
- [ ] Есть UI для пустого состояния
- [ ] Работает без backend (graceful degradation)

## 💡 Примеры сценариев

### Сценарий 1: Сервер недоступен
```
Что происходит: Request timeout через 5 секунд
Что видит пользователь: Пустое состояние с иконкой
Что в консоли: ⏱️ Request timeout - using empty state
```

### Сценарий 2: HTTP 500 ошибка
```
Что происходит: Catch блок перехватывает ошибку
Что видит пользователь: Пустое состояние с сообщением
Что в консоли: ⚠️ Failed to load data: HTTP 500
```

### Сценарий 3: Network offline
```
Что происходит: Загрузка из localStorage
Что видит пользователь: Последние сохраненные данные
Что в консоли: 📦 Loading from localStorage
```

---

**Помни:** Приложение должно работать **ВСЕГДА**, даже без backend! 🚀
