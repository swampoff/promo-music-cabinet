# 🚀 Интеграция Promo.music с вашей Lovable-платформой

**Подключение проекта через VS Code к вашей системе**

---

## 📦 ЧТО НУЖНО ПЕРЕДАТЬ В ВАШУ ПЛАТФОРМУ:

### 1. **Структура проекта:**

```
promo-music/
├── src/
│   ├── app/
│   │   ├── components/     # 47 UI компонентов
│   │   ├── pages/          # 15 страниц
│   │   └── App.tsx         # Главный компонент
│   ├── imports/            # Figma импорты (SVG, изображения)
│   ├── styles/
│   │   ├── theme.css       # Glassmorphism стили
│   │   ├── fonts.css       # Manrope шрифт
│   │   └── index.css       # Tailwind v4
│   └── main.tsx            # Entry point
├── supabase/
│   └── functions/
│       └── server/         # Edge Function (Hono server)
│           ├── index.tsx   # Главный файл сервера
│           ├── routes.tsx  # API роуты
│           └── kv_store.tsx # База данных
├── package.json            # Зависимости
├── vite.config.ts          # Vite конфиг
└── .env                    # Переменные окружения
```

---

## 🔑 КОНФИГУРАЦИЯ SUPABASE:

### **Файл: `.env`**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ваш-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Для Edge Functions (не включать в frontend!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ БАЗА ДАННЫХ:

### **SQL Schema (нужно создать в Supabase):**

```sql
-- Главная таблица для KV хранилища
CREATE TABLE kv_store_84730125 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Индекс для быстрого поиска по префиксу
CREATE INDEX idx_kv_store_key_prefix ON kv_store_84730125 (key text_pattern_ops);
```

---

## 📡 API ENDPOINTS:

### **Base URL:**
```
https://ваш-project-id.supabase.co/functions/v1/make-server-84730125
```

### **Endpoints:**

| Method | Path | Описание |
|--------|------|----------|
| `GET` | `/health` | Health check |
| `GET` | `/api/tracks` | Получить все треки |
| `POST` | `/api/tracks` | Создать трек |
| `GET` | `/api/tracks/:id` | Получить трек по ID |
| `PUT` | `/api/tracks/:id` | Обновить трек |
| `DELETE` | `/api/tracks/:id` | Удалить трек |
| `GET` | `/api/analytics` | Получить аналитику |
| `POST` | `/api/analytics/play` | Записать прослушивание |
| `GET` | `/api/donations` | Получить донаты |
| `POST` | `/api/donations` | Создать донат |
| `GET` | `/api/coins` | Получить баланс коинов |
| `POST` | `/api/coins/earn` | Начислить коины |
| `POST` | `/api/coins/spend` | Потратить коины |
| `GET` | `/api/concerts` | Получить концерты |
| `POST` | `/api/concerts` | Создать концерт |
| `GET` | `/api/news` | Получить новости |
| `POST` | `/api/news` | Создать новость |

---

## 🔧 ИНТЕГРАЦИЯ В ВАШУ ПЛАТФОРМУ:

### **Вариант 1: Импорт как Git репозиторий**

Если ваша платформа поддерживает Git:

```bash
# 1. Создайте GitHub репозиторий
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/promo-music.git
git push -u origin main

# 2. В вашей платформе:
# Import from GitHub → укажите URL репозитория
```

---

### **Вариант 2: Прямой импорт файлов**

Если ваша платформа работает с файловой системой:

1. **Скачайте проект из Figma Make** (ZIP)
2. **В вашей платформе:**
   - Создайте новый проект
   - Загрузите все файлы
   - Установите зависимости (см. `package.json`)

---

### **Вариант 3: API интеграция**

Если ваша платформа имеет API для импорта:

```javascript
// Псевдокод для вашей платформы
const project = {
  name: "promo-music",
  framework: "vite",
  files: [
    { path: "/src/app/App.tsx", content: "..." },
    { path: "/src/main.tsx", content: "..." },
    // ... все остальные файлы
  ],
  dependencies: {
    "react": "^18.3.1",
    "vite": "^6.0.11",
    // ... см. package.json
  },
  env: {
    "VITE_SUPABASE_URL": "https://...",
    "VITE_SUPABASE_ANON_KEY": "..."
  }
};

await yourPlatform.importProject(project);
```

---

## 📝 PACKAGE.JSON (зависимости):

```json
{
  "name": "promo-music",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.3",
    "motion": "^11.15.0",
    "recharts": "^2.15.0",
    "lucide-react": "^0.468.0",
    "sonner": "^1.7.3",
    "date-fns": "^4.1.0",
    "@supabase/supabase-js": "^2.49.8"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.11",
    "typescript": "~5.6.2",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 🎨 ВАЖНЫЕ КОНФИГУРАЦИИ:

### **vite.config.ts:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
```

### **tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🔌 ПОДКЛЮЧЕНИЕ К ВАШЕЙ ПЛАТФОРМЕ ЧЕРЕЗ VS CODE:

### **Если ваша платформа имеет VS Code Extension:**

1. **Установите расширение:**
   ```
   Ctrl+Shift+X → Найдите ваше расширение → Install
   ```

2. **Откройте проект:**
   ```bash
   code /path/to/promo-music
   ```

3. **В VS Code:**
   - Откройте Command Palette (`Ctrl+Shift+P`)
   - Найдите команду вашей платформы (например, `YourPlatform: Connect Project`)
   - Следуйте инструкциям

---

### **Если ваша платформа работает через CLI:**

```bash
# Установите CLI вашей платформы
npm install -g your-platform-cli

# В папке проекта
cd promo-music

# Подключите к платформе
your-platform init
your-platform deploy
```

---

### **Если ваша платформа имеет Web API:**

Создайте скрипт для синхронизации:

```javascript
// sync-to-platform.js
import fs from 'fs';
import path from 'path';

const PLATFORM_API = 'https://your-platform.com/api';
const API_KEY = 'your-api-key';

async function uploadFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  await fetch(`${PLATFORM_API}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: filePath,
      content: content,
    }),
  });
}

// Загрузите все файлы
const files = getAllFiles('./src');
for (const file of files) {
  await uploadFile(file);
}
```

Запустите:
```bash
node sync-to-platform.js
```

---

## 🗂️ СТРУКТУРА ДАННЫХ В KV STORE:

### **Префиксы ключей:**

| Префикс | Описание | Пример ключа |
|---------|----------|--------------|
| `track_` | Треки | `track_1`, `track_abc123` |
| `analytics_` | Аналитика | `analytics_2024-01`, `analytics_user_123` |
| `donation_` | Донаты | `donation_user123_1` |
| `coins_` | Баланс коинов | `coins_user123` |
| `concert_` | Концерты | `concert_1` |
| `news_` | Новости | `news_1` |
| `user_` | Пользователи | `user_123` |
| `playlist_` | Плейлисты | `playlist_123` |
| `comment_` | Комментарии | `comment_track_1_user_123` |

### **Примеры данных:**

```javascript
// Трек
{
  "track_1": {
    id: "1",
    title: "Моя песня",
    artist: "Артист",
    duration: 180,
    coverUrl: "https://...",
    audioUrl: "https://...",
    plays: 1500,
    likes: 230,
    createdAt: "2024-01-15T10:00:00Z"
  }
}

// Аналитика
{
  "analytics_2024-01": {
    month: "2024-01",
    totalPlays: 15000,
    uniqueListeners: 3000,
    revenue: 450,
    topTrack: "track_1",
    playsByDay: [...]
  }
}

// Донат
{
  "donation_user123_1": {
    id: "1",
    userId: "user123",
    amount: 500,
    message: "Крутая музыка!",
    timestamp: "2024-01-20T14:30:00Z"
  }
}
```

---

## 🚀 КОМАНДЫ ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ:

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
# Откроется http://localhost:5173

# Production сборка
npm run build

# Preview production сборки
npm run preview
```

---

## 🔐 НАСТРОЙКА SUPABASE ДЛЯ ВАШЕЙ ПЛАТФОРМЫ:

### **1. Создайте проект в Supabase:**

1. https://supabase.com/dashboard
2. New Project
3. Сохраните:
   - Project URL
   - Anon Key
   - Service Role Key

### **2. Создайте таблицу:**

```sql
CREATE TABLE kv_store_84730125 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### **3. Deploy Edge Function:**

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите
supabase login

# Свяжите проект
supabase link --project-ref ваш-project-id

# Deploy
supabase functions deploy server

# Установите secrets
supabase secrets set SUPABASE_URL="https://..."
supabase secrets set SUPABASE_ANON_KEY="..."
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..."
```

---

## 📤 ЭКСПОРТ ПРОЕКТА ДЛЯ ВАШЕЙ ПЛАТФОРМЫ:

### **Формат JSON (для API):**

<function_calls>
<invoke name="read">
<parameter name="path">/