# 🚀 Инструкция по загрузке в GitHub и деплою на Vercel

## ✅ Что уже сделано

AI Assistant подготовил:
- ✓ Все файлы проекта готовы
- ✓ `.gitignore` создан  
- ✓ `.env.example` создан
- ✓ `tsconfig.json` создан
- ✓ `vercel.json` настроен
- ✓ `package.json` готов

## 📝 Шаг 1: Загрузка в GitHub (2 способа)

### Способ А: Через Git CLI (рекомендуется - 1 минута)

```bash
# 1. Инициализируйте Git репозиторий
git init

# 2. Добавьте remote
git remote add origin https://github.com/swampoff/promofm.git

# 3. Создайте .env файл (не коммитится)
cp .env.example .env
# Отредактируйте .env и добавьте ваши Supabase credentials

# 4. Добавьте все файлы
git add .

# 5. Создайте коммит
git commit -m "🎵 Initial commit: promo.music artist cabinet"

# 6. Запушьте в GitHub
git branch -M main
git push -u origin main
```

### Способ Б: Через Vercel CLI (деплой сразу)

```bash
# 1. Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# 2. Создайте .env файл
cp .env.example .env
# Отредактируйте .env

# 3. Залогиньтесь в Vercel
vercel login

# 4. Деплой (первый раз - создаст проект)
vercel

# 5. После первого деплоя, добавьте env переменные:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 6. Production деплой
vercel --prod
```

---

## 📝 Шаг 2: Подключить к Vercel (через UI)

### A. Если использовали Способ А (Git CLI):

1. Откройте https://vercel.com/new
2. Выберите **Import Git Repository**
3. Найдите `swampoff/promofm`
4. **НЕ НАЖИМАЙТЕ DEPLOY ЕЩЁ!**
5. Добавьте Environment Variables:

| Name | Value | Source |
|------|-------|--------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJ...` | Supabase Dashboard → Settings → API → `anon` `public` key |

6. Нажмите **Deploy** 🚀

### B. Если использовали Способ Б (Vercel CLI):

✅ Уже задеплоено! Проверьте Dashboard.

---

## 📝 Шаг 3: Деплой Supabase Edge Functions

```bash
# 1. Установите Supabase CLI (если еще не установлен)
npm install -g supabase

# 2. Залогиньтесь
supabase login

# 3. Привяжите к вашему проекту
supabase link --project-ref YOUR_PROJECT_ID

# 4. Деплой Edge Function
supabase functions deploy make-server-84730125
```

**ИЛИ через Supabase Dashboard:**

1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Edge Functions**
4. Нажмите **New Function**
5. Название: `make-server-84730125`
6. Скопируйте код из `/supabase/functions/server/index.tsx`
7. Также создайте файлы:
   - `routes.tsx` (из `/supabase/functions/server/routes.tsx`)
   - `kv_store.tsx` (из `/supabase/functions/server/kv_store.tsx`)
8. Нажмите **Deploy**

---

## 📝 Шаг 4: Проверка работы

### 1. Откройте ваш сайт

```
https://promofm.vercel.app
```

(или ваш кастомный домен)

### 2. Нажмите кнопку "Загрузить демо-данные"

Это создаст:
- 🎵 5 треков
- 🎬 5 видео
- 🎤 3 концерта
- 📰 5 новостей
- 💰 Донаты
- 📊 Аналитику

### 3. Проверьте что всё работает:

- ✅ Главная страница загружается
- ✅ Статистика отображается
- ✅ Треки воспроизводятся
- ✅ Видео работают
- ✅ Графики отрисовываются
- ✅ Навигация работает

---

## 🔧 Troubleshooting

### ❌ Ошибка: "API returns 404"

**Решение:**
1. Убедитесь что Edge Function задеплоена в Supabase
2. Проверьте название функции: `make-server-84730125`
3. Проверьте что роуты начинаются с `/make-server-84730125`

### ❌ Ошибка: "CORS error"

**Решение:**
Проверьте что в `/supabase/functions/server/index.tsx` есть:
```typescript
app.use('*', cors({ origin: '*' }))
```

### ❌ Ошибка: "Environment variables not found"

**Решение:**
1. В Vercel: Settings → Environment Variables
2. Добавьте:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy проект

### ❌ Ошибка: "Module not found"

**Решение:**
```bash
npm install
npm run build
vercel --prod
```

---

## 🎯 Финальный чек-лист

- [ ] Git репозиторий создан и запушен
- [ ] Vercel проект создан
- [ ] Environment Variables добавлены в Vercel
- [ ] Supabase Edge Function задеплоена
- [ ] Сайт открывается
- [ ] Демо-данные загружены
- [ ] Всё работает!

---

## 📞 Где получить credentials

### Supabase URL и ANON KEY:

1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект
3. **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Vercel Project ID (для API):

1. Откройте ваш проект в Vercel
2. **Settings** → **General**
3. Скопируйте **Project ID**

---

## 🎉 Готово!

После выполнения всех шагов ваш сайт будет доступен по адресу:

```
https://promofm.vercel.app
```

**Автоматический деплой:**
- Каждый push в `main` branch автоматически деплоится
- Vercel показывает превью для pull requests
- Логи доступны в Vercel Dashboard

---

**Возникли проблемы?**

Проверьте логи:
- Frontend: Browser Console
- Backend: Supabase Dashboard → Edge Functions → Logs
- Deploy: Vercel Dashboard → Deployments → View Logs
