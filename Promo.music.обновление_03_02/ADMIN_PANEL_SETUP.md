# 🚀 ADMIN PANEL - ИНСТРУКЦИЯ ПО ЗАПУСКУ

## ✅ Что создано

Полноценная админ-панель с:

✅ Отдельная структура в `/src/admin/`  
✅ Glassmorphism дизайн  
✅ Авторизация  
✅ Dashboard с виджетами  
✅ 11 разделов меню  
✅ Адаптивный layout  
✅ Мобильное меню  

---

## 📁 Структура файлов

```
/src/admin/
├── AdminApp.tsx              ✅ Главный компонент
├── index.tsx                 ✅ Точка входа
├── README.md                 ✅ Документация
├── layouts/
│   └── AdminLayout.tsx       ✅ Layout с меню
├── pages/
│   ├── AdminLogin.tsx        ✅ Страница входа
│   ├── AdminDashboard.tsx    ✅ Dashboard (полный)
│   └── index.tsx             ✅ Остальные страницы (заглушки)

/admin.html                   ✅ HTML точка входа
/ADMIN_PANEL_SETUP.md         ✅ Эта инструкция
```

---

## 🎯 Способы доступа

### Вариант 1: Отдельный HTML (рекомендуется)

**URL:** `http://localhost:5173/admin.html`

**Плюсы:**
- ✅ Полная изоляция
- ✅ Отдельная точка входа
- ✅ Легко защитить

**Готово!** Просто запустите проект.

---

### Вариант 2: Роут в основном приложении

Добавьте в `/src/app/App.tsx`:

```tsx
import AdminApp from '@/admin/AdminApp';

// В самом начале функции App():
if (window.location.pathname.startsWith('/admin')) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AdminApp />
        <Toaster />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
```

**URL:** `http://localhost:5173/admin`

**Плюсы:**
- ✅ Единая навигация
- ✅ Shared state
- ✅ Один контекст авторизации

---

### Вариант 3: Поддомен (production)

**URL:** `https://admin.promo.fm`

#### Для Vercel:

В `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/admin", "destination": "/admin.html" },
    { "source": "/admin/:path*", "destination": "/admin.html" }
  ]
}
```

#### Для Nginx:

```nginx
server {
  server_name admin.promo.fm;
  
  location / {
    root /var/www/promo-music/dist;
    try_files $uri /admin.html;
  }
  
  # Защита IP (опционально)
  allow 192.168.1.0/24;
  deny all;
}
```

---

## 🚀 Запуск

### 1. Установка зависимостей (если ещё не сделали):

```bash
npm install
```

### 2. Запуск dev сервера:

```bash
npm run dev
```

### 3. Откройте админку:

```
http://localhost:5173/admin.html
```

### 4. Войдите:

```
Email: admin@promo.fm
Password: admin123
```

---

## 🎨 Что увидите

### Страница входа:
- Glassmorphism карточка
- Поля email и пароль
- Демо-креды
- Красивые градиенты

### Dashboard:
- 4 статистические карточки с трендами
- Виджет контента (треки, видео, концерты)
- Последняя активность (5 записей)
- Быстрые действия (4 кнопки)

### Меню (11 пунктов):
1. Dashboard ✅
2. Пользователи 🚧
3. Контент 🚧
4. Финансы 🚧
5. Аналитика 🚧
6. Модерация 🚧
7. Баннеры 🚧
8. Подписки 🚧
9. Продвижение 🚧
10. Поддержка 🚧
11. Настройки 🚧

✅ = Готово  
🚧 = Заглушка

---

## 📱 Адаптивность

### Desktop (>1024px):
- Боковое меню (сворачиваемое)
- Полный layout
- Все виджеты

### Tablet (768-1024px):
- Узкое меню
- Адаптивные карточки

### Mobile (<768px):
- Hamburger меню
- Мобильный overlay
- Stack layout

---

## 🔧 Настройка vite.config.ts

Проверьте, что в `vite.config.ts` есть поддержка множественных entry points:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'), // Админка!
      },
    },
  },
});
```

---

## 🔐 Настройка авторизации (Production)

### Шаг 1: Backend endpoint

Создайте `/supabase/functions/server/admin-routes.tsx`:

```tsx
import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Проверка доступа администратора
app.get('/api/admin/check-access', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return c.json({ isAdmin: false }, 401);
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ isAdmin: false }, 401);
  }
  
  // Проверка роли в user_metadata
  const isAdmin = user.user_metadata?.role === 'admin';
  
  // Логирование попытки доступа
  console.log(`Admin access check: ${user.email} - ${isAdmin ? 'ALLOWED' : 'DENIED'}`);
  
  return c.json({ isAdmin });
});

export default app;
```

### Шаг 2: Назначение роли администратора

Через Supabase Dashboard → Authentication → Users:

1. Найдите пользователя
2. Edit User
3. Raw User Meta Data:
   ```json
   {
     "role": "admin"
   }
   ```
4. Save

### Шаг 3: SQL политика

Обновите RLS политики с проверкой роли:

```sql
CREATE POLICY admin_full_access ON your_table
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

---

## 📊 Разработка страниц

### Пример: AdminUsers

Создайте `/src/admin/pages/AdminUsers.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter } from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    // Загрузка пользователей из API
    setLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Пользователи</h1>
          <p className="text-white/60">Управление пользователями платформы</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          Добавить
        </button>
      </div>
      
      {/* Фильтры и поиск */}
      {/* Таблица пользователей */}
      {/* Пагинация */}
    </div>
  );
}
```

Замените заглушку в `/src/admin/pages/index.tsx`:

```tsx
// Удалить:
// export function AdminUsers() { ... }

// Добавить импорт:
export { AdminUsers } from './AdminUsers';
```

---

## 🎨 Кастомизация дизайна

### Изменить цветовую схему:

В `AdminLayout.tsx` и других компонентах:

```tsx
// Было:
className="bg-gradient-to-r from-purple-500 to-pink-500"

// Стало (например, синий):
className="bg-gradient-to-r from-blue-500 to-cyan-500"
```

### Добавить новый пункт меню:

В `AdminLayout.tsx`, массив `menuItems`:

```tsx
{
  id: 'reports',
  icon: FileText,
  label: 'Отчёты',
  badge: null
}
```

В `AdminApp.tsx`:

```tsx
import { AdminReports } from './pages/AdminReports';

// В renderPage():
case 'reports':
  return <AdminReports />;
```

---

## 🔒 Безопасность

### ⚠️ ОБЯЗАТЕЛЬНО:

1. **Backend авторизация** - всегда проверяйте права на сервере
2. **HTTPS** - только безопасное соединение
3. **Логирование** - записывайте все действия админов
4. **IP whitelist** - ограничьте доступ по IP (опционально)
5. **2FA** - двухфакторная аутентификация

### Пример защиты endpoint:

```tsx
const requireAdmin = async (c, next) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user || user.user_metadata?.role !== 'admin') {
    // Логируем попытку
    console.warn(`Unauthorized admin access attempt: ${c.req.url}`);
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  // Логируем успешный доступ
  console.log(`Admin action: ${user.email} accessed ${c.req.url}`);
  
  await next();
};

// Применяем ко всем admin роутам
app.use('/api/admin/*', requireAdmin);
```

---

## 📝 TODO - Приоритеты

### 🔴 Критично (сделать первым):

- [ ] Реальная авторизация с Supabase
- [ ] Backend endpoint `/api/admin/check-access`
- [ ] Назначение роли admin пользователю
- [ ] Защита всех admin API endpoints

### 🟡 Важно (следующим):

- [ ] Страница AdminUsers (таблица, поиск, редактирование)
- [ ] Страница AdminContent (модерация контента)
- [ ] Страница AdminBanners (управление баннерами)
- [ ] Real-time уведомления

### 🟢 Полезно (когда будет время):

- [ ] Экспорт данных (CSV, PDF)
- [ ] Продвинутая аналитика
- [ ] История действий администраторов
- [ ] Двухфакторная аутентификация

---

## 🐛 Troubleshooting

### Админка не открывается:

1. Проверьте URL: `http://localhost:5173/admin.html`
2. Проверьте консоль браузера на ошибки
3. Убедитесь что `npm run dev` запущен

### Не могу войти:

1. Проверьте креды: `admin@promo.fm` / `admin123`
2. Откройте консоль - там должны быть логи
3. Проверьте Network tab - идут ли запросы

### Layout сломан:

1. Проверьте что `@/styles/globals.css` импортирован
2. Проверьте что Tailwind работает
3. Проверьте что Motion установлен: `npm install motion`

### Меню не открывается на мобильном:

1. Проверьте что экран < 1024px
2. Откройте консоль - есть ли ошибки
3. Попробуйте перезагрузить страницу

---

## 📚 Полезные ссылки

- **Документация админки:** `/src/admin/README.md`
- **SQL структура:** `/SQL_README.md`
- **Основное приложение:** `/src/app/App.tsx`
- **Контексты:** `/src/contexts/`

---

## ✅ Готово к работе!

Админ-панель создана и готова к разработке.

**Следующие шаги:**

1. ✅ Запустите: `npm run dev`
2. ✅ Откройте: `http://localhost:5173/admin.html`
3. ✅ Войдите: `admin@promo.fm` / `admin123`
4. ✅ Изучите Dashboard
5. 🚀 Начните разработку конкретных страниц!

---

**Статус:** ✅ Базовая структура готова  
**Дата:** 28 января 2026  
**Версия:** 1.0

Made with ❤️ for promo.music admin team
