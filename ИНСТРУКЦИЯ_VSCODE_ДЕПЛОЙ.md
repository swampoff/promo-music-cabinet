# 🚀 Полная инструкция деплоя для VS Code

**Для GitHub Copilot и ручного деплоя**

---

## 📋 Что нужно подготовить:

- ✅ VS Code установлен
- ✅ Git установлен ([скачать](https://git-scm.com/))
- ✅ Node.js 18+ установлен ([скачать](https://nodejs.org/))
- ✅ Аккаунт GitHub ([создать](https://github.com/signup))
- ✅ Аккаунт Vercel ([создать](https://vercel.com/signup))
- ✅ Аккаунт Supabase ([создать](https://supabase.com/dashboard))

---

## 🎯 ЧАСТЬ 1: Подготовка проекта

### 1. Скачайте проект из Figma Make

1. В Figma Make нажмите **Download** или **Export**
2. Сохраните ZIP файл
3. Распакуйте в папку, например: `C:\Projects\promo-music`

---

### 2. Откройте проект в VS Code

```bash
# Откройте терминал (Win: Ctrl+`, Mac: Cmd+`)
cd C:\Projects\promo-music

# Или просто откройте папку через File > Open Folder
```

---

### 3. Установите зависимости

```bash
npm install
```

⏱️ Займёт 2-3 минуты

---

## 🎯 ЧАСТЬ 2: Git и GitHub

### 1. Инициализируйте Git (если ещё не сделано)

```bash
# Проверьте, есть ли уже git
git status

# Если ошибка "not a git repository", выполните:
git init
git add .
git commit -m "Initial commit: promo.music project"
```

---

### 2. Создайте репозиторий на GitHub

**Вариант A: Через веб-интерфейс**

1. Откройте https://github.com/new
2. **Repository name**: `promo-music` (или любое другое)
3. **Description**: `Кабинет артиста с glassmorphism`
4. **Visibility**: Public (или Private)
5. ⚠️ **НЕ ставьте галочки** на "Add README", "Add .gitignore", "Choose a license"
6. Нажмите **"Create repository"**

**Вариант B: Через GitHub CLI** (если установлен)

```bash
gh repo create promo-music --public --source=. --remote=origin --push
```

---

### 3. Подключите удалённый репозиторий

После создания репозитория GitHub покажет команды:

```bash
# Добавьте remote
git remote add origin https://github.com/ваш-username/promo-music.git

# Проверьте
git remote -v

# Push в GitHub
git branch -M main
git push -u origin main
```

⏱️ Загрузка займёт 1-2 минуты

---

## 🎯 ЧАСТЬ 3: Настройка Supabase

### 1. Создайте проект в Supabase

1. Откройте https://supabase.com/dashboard
2. Нажмите **"New project"**
3. Заполните:
   - **Name**: `promo-music`
   - **Database Password**: придумайте сложный пароль (сохраните его!)
   - **Region**: `Europe (Frankfurt)` (ближайший регион)
4. Нажмите **"Create new project"**

⏱️ Создание займёт 2-3 минуты

---

### 2. Получите Supabase токены

После создания проекта:

1. В левом меню нажмите **Settings** (⚙️ иконка внизу)
2. Выберите **API**
3. Скопируйте и сохраните:

```bash
# Project URL
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# anon/public key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Создайте `.env` файл локально

В корне проекта создайте файл `.env`:

```bash
# В VS Code создайте новый файл .env
# Или через терминал:
echo "VITE_SUPABASE_URL=ваш-url" > .env
```

Содержимое `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **НЕ коммитьте `.env` в Git!** (уже в `.gitignore`)

---

### 4. Проверьте проект локально

```bash
npm run dev
```

Откройте http://localhost:5173 - должен работать!

---

## 🎯 ЧАСТЬ 4: Деплой Supabase Edge Functions

### 1. Установите Supabase CLI

**Windows (через Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
# Или скачайте binary: https://github.com/supabase/cli/releases
```

---

### 2. Войдите в Supabase

```bash
supabase login
```

Откроется браузер → нажмите **"Authorize"**

---

### 3. Свяжите проект

```bash
# Получите Project ID из Supabase Dashboard (Settings > General > Reference ID)
supabase link --project-ref ваш-project-id
```

Введите Database Password (который создали в шаге 3.1)

---

### 4. Задеплойте Edge Functions

```bash
# Деплой всех функций
supabase functions deploy

# Или конкретно server функцию
supabase functions deploy make-server-84730125
```

⏱️ Займёт 1-2 минуты

✅ После успеха увидите:
```
Deployed Function make-server-84730125 on project ваш-project-id
```

---

### 5. Установите Supabase Secrets

```bash
# Установите URL и ключи как secrets для Edge Functions
supabase secrets set SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1..."
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."
```

**Где взять SERVICE_ROLE_KEY:**
- Supabase Dashboard → Settings → API → `service_role` key (⚠️ секретный!)

---

### 6. Проверьте Edge Function

```bash
# Health check
curl https://ваш-project-id.supabase.co/functions/v1/make-server-84730125/health
```

Должен вернуть:
```json
{"status":"ok","message":"Server is running"}
```

---

## 🎯 ЧАСТЬ 5: Деплой на Vercel

### 1. Установите Vercel CLI (опционально)

```bash
npm install -g vercel
```

---

### 2. Войдите в Vercel

```bash
vercel login
```

Выберите метод входа (Email/GitHub/GitLab)

---

### 3. Задеплойте проект

**Вариант A: Через CLI (рекомендуется)**

```bash
# Первый деплой
vercel

# Vercel задаст вопросы:
# Set up and deploy? → Y
# Which scope? → Ваш аккаунт
# Link to existing project? → N
# What's your project's name? → promo-music
# In which directory is your code located? → ./ (Enter)
# Want to modify settings? → N
```

После первого деплоя:

```bash
# Production деплой
vercel --prod
```

⏱️ Займёт 2-3 минуты

---

**Вариант B: Через веб-интерфейс**

1. Откройте https://vercel.com/new
2. Выберите **"Import Git Repository"**
3. Найдите ваш репозиторий `promo-music`
4. Нажмите **"Import"**
5. **Configure Project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (оставить как есть)
   - **Build Command**: `npm run build` (автоматически)
   - **Output Directory**: `dist` (автоматически)
6. **Environment Variables** → Добавьте:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

7. Нажмите **"Deploy"**

⏱️ Займёт 2-3 минуты

---

### 4. Получите URL сайта

После деплоя Vercel покажет:

```
✅ Production: https://promo-music.vercel.app
```

Откройте этот URL - ваш сайт LIVE! 🎉

---

## 🎯 ЧАСТЬ 6: Автоматический деплой (CI/CD)

### 1. Получите токены для GitHub Actions

#### Vercel Tokens:

1. **VERCEL_TOKEN**:
   - https://vercel.com/account/tokens
   - **Token Name**: `GitHub Actions`
   - **Scope**: Full Account
   - **Expiration**: No Expiration
   - Скопируйте токен

2. **VERCEL_ORG_ID**:
   - https://vercel.com/account
   - Прокрутите вниз → **Your ID**
   - Скопируйте (например: `sofmradio-3081`)

3. **VERCEL_PROJECT_ID**:
   - Откройте ваш проект в Vercel
   - Settings → General → **Project ID**
   - Скопируйте (например: `prj_xxxxxxxxxxxxx`)

---

#### Supabase Tokens:

1. **SUPABASE_ACCESS_TOKEN**:
   - https://supabase.com/dashboard/account/tokens
   - Нажмите **"Generate new token"**
   - **Name**: `GitHub Actions`
   - Скопируйте токен

2. **SUPABASE_PROJECT_ID**:
   - Откройте ваш проект в Supabase
   - Settings → General → **Reference ID**
   - Скопируйте (например: `abcdefghijklmnop`)

---

### 2. Добавьте секреты в GitHub

1. Откройте ваш репозиторий на GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **"New repository secret"** 5 раз и добавьте:

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | `ваш_vercel_token` |
| `VERCEL_ORG_ID` | `sofmradio-3081` |
| `VERCEL_PROJECT_ID` | `prj_xxxxxxxxxxxxx` |
| `SUPABASE_ACCESS_TOKEN` | `ваш_supabase_token` |
| `SUPABASE_PROJECT_ID` | `abcdefghijklmnop` |

---

### 3. Проверьте workflow файл

Файл уже должен существовать: `.github/workflows/deploy.yml`

Проверьте его наличие:

```bash
ls .github/workflows/deploy.yml
```

Если файла нет, он должен быть в проекте (уже создан при синхронизации из Figma Make).

---

### 4. Запустите автодеплой

**Вариант A: Через коммит**

```bash
# Сделайте любое изменение
echo "# Deploy активен" >> README.md

# Коммит и push
git add .
git commit -m "🚀 Активация автодеплоя"
git push origin main
```

**Вариант B: Вручную через GitHub**

1. Репозиторий → **Actions**
2. Слева **"Deploy to Vercel and Supabase"**
3. Справа **"Run workflow"** → **"Run workflow"**

---

### 5. Отследите деплой

1. GitHub → **Actions**
2. Кликните на запущенный workflow
3. Смотрите логи в реальном времени

⏱️ Полный деплой: 3-5 минут

---

## 🎯 ЧАСТЬ 7: Проверка и отладка

### 1. Проверьте Frontend (Vercel)

```bash
# Откройте сайт
https://promo-music.vercel.app
```

✅ Должна загрузиться главная страница с glassmorphism дизайном

---

### 2. Проверьте Backend (Supabase)

```bash
# Health check
curl https://ваш-project-id.supabase.co/functions/v1/make-server-84730125/health
```

✅ Должен вернуть `{"status":"ok"}`

---

### 3. Проверьте API

```bash
# Получить треки
curl -H "Authorization: Bearer ваш_anon_key" \
     -H "X-User-Id: demo-user" \
     https://ваш-project-id.supabase.co/functions/v1/make-server-84730125/api/tracks
```

✅ Должен вернуть список треков (или пустой массив)

---

### 4. Логи для отладки

**Frontend логи (Vercel):**
```bash
vercel logs
```

**Backend логи (Supabase):**
1. Supabase Dashboard
2. Edge Functions → **make-server-84730125**
3. Вкладка **Logs**

**Browser Console:**
- F12 → Console (должны быть логи API запросов)

---

## 🎯 ЧАСТЬ 8: Дальнейшая разработка

### Workflow разработки:

```bash
# 1. Создайте новую ветку
git checkout -b feature/new-feature

# 2. Внесите изменения в VS Code
# ... редактируйте файлы ...

# 3. Проверьте локально
npm run dev

# 4. Коммит
git add .
git commit -m "Add new feature"

# 5. Push в GitHub
git push origin feature/new-feature

# 6. Создайте Pull Request на GitHub
# 7. После мержа в main - автодеплой запустится автоматически!
```

---

### Обновление зависимостей:

```bash
# Проверить устаревшие пакеты
npm outdated

# Обновить все
npm update

# Обновить конкретный пакет
npm install react@latest
```

---

### Production сборка локально:

```bash
# Собрать
npm run build

# Предпросмотр
npm run preview
```

---

## 🐛 Частые проблемы

### ❌ `git push` не работает

**Решение:**
```bash
# Проверьте remote
git remote -v

# Если пусто, добавьте:
git remote add origin https://github.com/username/promo-music.git

# Если нужна аутентификация
git config --global credential.helper store
git push origin main
# Введите GitHub username и Personal Access Token
```

---

### ❌ Vercel деплой падает с ошибкой

**Решение:**
1. Проверьте переменные окружения в Vercel Dashboard
2. Проверьте логи: `vercel logs`
3. Попробуйте передеплоить: `vercel --prod --force`

---

### ❌ Supabase Edge Function 404

**Решение:**
```bash
# Проверьте статус
supabase functions list

# Передеплойте
supabase functions deploy make-server-84730125

# Проверьте логи
supabase functions logs make-server-84730125
```

---

### ❌ CORS ошибка

**Решение:**
- Проверьте `/supabase/functions/server/index.tsx`
- Должно быть: `origin: "*"` в cors настройках

---

### ❌ API возвращает пустые данные

**Решение:**
1. Проверьте Supabase Dashboard → Table Editor
2. Должна быть таблица `kv_store_84730125`
3. Если пустая - запустите инициализацию демо данных:
   - Откройте сайт → должны автоматически создаться данные
   - Или вызовите: `POST /api/init` endpoint

---

## 📚 Полезные ссылки

### Документация:
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)
- [Vercel](https://vercel.com/docs)

### Инструменты:
- [Git](https://git-scm.com/doc)
- [GitHub CLI](https://cli.github.com/)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Проект:
- [GitHub Repo](https://github.com/username/promo-music)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## ✅ Чек-лист успешного деплоя

- [ ] Node.js 18+ установлен
- [ ] Git установлен
- [ ] Проект скачан из Figma Make
- [ ] `npm install` выполнен успеш��о
- [ ] Git репозиторий создан
- [ ] Код залит в GitHub
- [ ] Supabase проект создан
- [ ] `.env` файл создан локально
- [ ] `npm run dev` работает локально
- [ ] Supabase CLI установлен
- [ ] Edge Functions задеплоены
- [ ] Vercel проект создан
- [ ] Frontend задеплоен на Vercel
- [ ] Environment variables добавлены в Vercel
- [ ] Сайт открывается по URL
- [ ] API health check возвращает OK
- [ ] GitHub Actions настроены
- [ ] Автодеплой работает

---

## 🎉 Готово!

Теперь у вас:

✅ **Frontend** на Vercel: `https://promo-music.vercel.app`  
✅ **Backend** на Supabase: работает  
✅ **Git** репозиторий на GitHub  
✅ **Автодеплой** через GitHub Actions  
✅ **Локальная разработка** в VS Code

---

## 💬 Нужна помощь?

1. Проверьте раздел **"Частые проблемы"** выше
2. Посмотрите логи (Vercel/Supabase/Browser Console)
3. Создайте Issue в GitHub репозитории
4. Спросите GitHub Copilot в VS Code!

---

**Сделано с ❤️ для музыкантов**

🚀 **Успешного деплоя!**
