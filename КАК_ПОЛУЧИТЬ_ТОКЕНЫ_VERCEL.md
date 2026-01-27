# 🔐 Как получить токены Vercel

## 📋 Что нужно получить

Для автодеплоя нужны **3 значения** от Vercel:

1. ✅ **VERCEL_TOKEN** - токен доступа к API
2. ✅ **VERCEL_ORG_ID** - ID вашей организации/аккаунта
3. ✅ **VERCEL_PROJECT_ID** - ID проекта

**Время:** 5-7 минут  
**Стоимость:** $0 (бесплатно)

---

## 🚀 Шаг 0: Подготовка

### Если у вас НЕТ аккаунта Vercel:

1. Откройте: https://vercel.com/signup
2. Нажмите **"Continue with GitHub"**
3. Авторизуйтесь через GitHub
4. ✅ Готово! Аккаунт создан

### Если у вас УЖЕ ЕСТЬ аккаунт:

1. Откройте: https://vercel.com/login
2. Войдите через GitHub
3. ✅ Готово!

---

## 🔑 Шаг 1: Получить VERCEL_TOKEN

### 1.1 Откройте страницу токенов

**Вариант A:** Прямая ссылка
```
https://vercel.com/account/tokens
```

**Вариант B:** Через меню
1. Кликните на **аватар** справа вверху
2. Выберите **"Settings"**
3. В левом меню выберите **"Tokens"**

### 1.2 Создайте новый токен

1. Нажмите кнопку **"Create Token"** (или "Create")
2. Откроется форма создания токена

### 1.3 Заполните форму

```
┌─────────────────────────────────────────────┐
│ Create Token                                 │
├─────────────────────────────────────────────┤
│                                              │
│ Token Name: *                                │
│ ┌─────────────────────────────────────────┐ │
│ │ GitHub Actions Deploy                    │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Scope: *                                     │
│ ○ Read-Only                                  │
│ ● Full Account                               │
│                                              │
│ Expiration:                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ No Expiration                            │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│          [ Cancel ]    [ Create Token ]     │
└─────────────────────────────────────────────┘
```

**Заполните так:**
- **Token Name:** `GitHub Actions Deploy` (или любое другое имя)
- **Scope:** Выберите **"Full Account"** ⚠️ ВАЖНО!
- **Expiration:** Оставьте **"No Expiration"** (или выберите срок)

### 1.4 Скопируйте токен

1. Нажмите **"Create Token"**
2. Появится окно с токеном:

```
┌─────────────────────────────────────────────┐
│ Token Created                                │
├─────────────────────────────────────────────┤
│                                              │
│ Your token has been created!                 │
│                                              │
│ ⚠️  Make sure to copy it now.               │
│    You won't be able to see it again!       │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ vercel_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234   │ │
│ │                                   [Copy] │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│                        [ Done ]              │
└─────────────────────────────────────────────┘
```

3. **Нажмите "Copy"** или выделите и скопируйте токен
4. ⚠️ **ВАЖНО:** Сохраните токен в безопасное место! Вы не сможете увидеть его снова!

**Токен выглядит так:**
```
vercel_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
```

✅ **VERCEL_TOKEN получен!**

---

## 📦 Шаг 2: Создать проект на Vercel

### 2.1 Откройте страницу создания проекта

**Вариант A:** Прямая ссылка
```
https://vercel.com/new
```

**Вариант B:** Через dashboard
1. Откройте: https://vercel.com/dashboard
2. Нажмите **"Add New..."** → **"Project"**

### 2.2 Импортируйте Git репозиторий

Если у вас УЖЕ ЕСТЬ код на GitHub:

```
┌─────────────────────────────────────────────┐
│ Import Git Repository                        │
├─────────────────────────────────────────────┤
│                                              │
│ Search repositories...                       │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔍 promo-music                           │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Your Repositories:                           │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 📁 username/promo-music        [Import] │ │
│ └─────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

1. Найдите репозиторий **"promo-music"**
2. Нажмите **"Import"**

### 2.3 Настройте проект

```
┌─────────────────────────────────────────────┐
│ Configure Project                            │
├─────────────────────────────────────────────┤
│                                              │
│ Project Name:                                │
│ ┌─────────────────────────────────────────┐ │
│ │ promo-music                              │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Framework Preset:                            │
│ ┌─────────────────────────────────────────┐ │
│ │ Vite                                 ▼  │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Root Directory: ./                           │
│                                              │
│ Build Command:                               │
│ ┌─────────────────────────────────────────┐ │
│ │ npm run build                            │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Output Directory:                            │
│ ┌─────────────────────────────────────────┐ │
│ │ dist                                     │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Install Command:                             │
│ ┌─────────────────────────────────────────┐ │
│ │ npm install                              │ │
│ └─────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

**Настройки:**
- **Project Name:** `promo-music` (или любое другое)
- **Framework Preset:** Выберите **"Vite"**
- **Root Directory:** Оставьте `./`
- **Build Command:** `npm run build` (автоматически)
- **Output Directory:** `dist` (автоматически)
- **Install Command:** `npm install` (автоматически)

### 2.4 Добавьте Environment Variables

⚠️ **ВАЖНО!** Добавьте переменные окружения:

```
┌─────────────────────────────────────────────┐
│ Environment Variables                        │
├─────────────────────────────────────────────┤
│                                              │
│ [ Add ]                                      │
│                                              │
│ Key: VITE_SUPABASE_URL                       │
│ Value: https://qzpmiiqfwkcnrhvubdgt.supabase.co
│                                              │
│ Key: VITE_SUPABASE_ANON_KEY                  │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
│                                              │
└─────────────────────────────────────────────┘
```

1. Нажмите **"Environment Variables"** (раскрыть секцию)
2. Нажмите **"Add"**
3. Добавьте **первую переменную:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://qzpmiiqfwkcnrhvubdgt.supabase.co`
   - Оставьте все окружения выбранными (Production, Preview, Development)
4. Нажмите **"Add"** снова
5. Добавьте **вторую переменную:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MTkwOTMsImV4cCI6MjA1MzI5NTA5M30.9wCGmE8k7oIcqDDLUiOZfVV-rT4S2B2KX7qC1KFG_YE`
   - Оставьте все окружения выбранными

### 2.5 Deploy!

1. Нажмите **"Deploy"**
2. Подождите 2-3 минуты
3. ✅ Проект задеплоен!

---

## 🆔 Шаг 3: Получить VERCEL_ORG_ID и VERCEL_PROJECT_ID

### 3.1 Откройте настройки проекта

После деплоя:

1. На странице проекта нажмите **"Settings"** (вкладка сверху)
2. Или откройте: `https://vercel.com/[username]/promo-music/settings`

### 3.2 Найдите ID в General Settings

```
┌─────────────────────────────────────────────┐
│ Settings → General                           │
├─────────────────────────────────────────────┤
│                                              │
│ Project Name                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ promo-music                              │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Project ID                                   │
│ ┌─────────────────────────────────────────┐ │
│ │ prj_abc123xyz456def789                   │ │
│ │                                   [Copy] │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ...                                          │
│                                              │
│ Team ID / Organization ID                    │
│ ┌─────────────────────────────────────────┐ │
│ │ team_xyz987abc654                        │ │
│ │                                   [Copy] │ │
│ └─────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

### 3.3 Скопируйте VERCEL_PROJECT_ID

1. Найдите раздел **"Project ID"**
2. Нажмите **"Copy"** справа от ID
3. Сохраните значение

**Выглядит так:**
```
prj_abc123xyz456def789ghi
```

✅ **VERCEL_PROJECT_ID получен!**

### 3.4 Скопируйте VERCEL_ORG_ID

1. Прокрутите вниз до раздела **"Team ID"** или **"Organization ID"**
2. Нажмите **"Copy"** справа от ID
3. Сохраните значение

**Выглядит так:**
```
team_xyz987abc654def321
```

**Или для личного аккаунта:**
```
prj_abc123xyz456
```

✅ **VERCEL_ORG_ID получен!**

---

## 📝 Итоговый чеклист

У вас должно быть **3 значения:**

```bash
# 1. VERCEL_TOKEN (длинный т��кен)
vercel_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789

# 2. VERCEL_ORG_ID (начинается с team_ или личный ID)
team_xyz987abc654def321

# 3. VERCEL_PROJECT_ID (начинается с prj_)
prj_abc123xyz456def789ghi
```

✅ **Все 3 токена получены!**

---

## 🔐 Куда добавить токены

### Вариант 1: Через скрипт (РЕКОМЕНДУЕТСЯ)

```bash
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

Скрипт запросит все токены и автоматически добавит их в GitHub Secrets.

### Вариант 2: Вручную в GitHub

1. Откройте репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите **"New repository secret"**
4. Добавьте по очереди:

**Секрет 1:**
- Name: `VERCEL_TOKEN`
- Secret: ваш токен `vercel_abc...`

**Секрет 2:**
- Name: `VERCEL_ORG_ID`
- Secret: ваш org ID `team_xyz...`

**Секрет 3:**
- Name: `VERCEL_PROJECT_ID`
- Secret: ваш project ID `prj_abc...`

### Вариант 3: Для локального деплоя

Добавьте в `.env`:

```bash
# .env
VERCEL_TOKEN=vercel_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
VERCEL_ORG_ID=team_xyz987abc654def321
VERCEL_PROJECT_ID=prj_abc123xyz456def789ghi
```

⚠️ **Не коммитьте `.env` в git!**

---

## 🔍 Проверка токенов

### Проверить VERCEL_TOKEN:

```bash
curl -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
     https://api.vercel.com/v2/user
```

**Должно вернуть информацию о вашем аккаунте.**

### Проверить Project доступен:

```bash
curl -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
     "https://api.vercel.com/v9/projects/YOUR_PROJECT_ID?teamId=YOUR_ORG_ID"
```

**Должно вернуть информацию о проекте.**

---

## 🐛 Troubleshooting

### ❌ "Invalid token"

**Причина:** Неправильный VERCEL_TOKEN или истёк срок

**Решение:**
1. Создайте новый токен на https://vercel.com/account/tokens
2. Убедитесь что выбрали **"Full Account"** scope
3. Скопируйте правильно (токен длинный!)

### ❌ "Project not found"

**Причина:** Неправильный VERCEL_PROJECT_ID или VERCEL_ORG_ID

**Решение:**
1. Откройте проект на Vercel
2. Settings → General
3. Скопируйте ID заново (используйте кнопку Copy!)

### ❌ "Forbidden"

**Причина:** У токена недостаточно прав

**Решение:**
1. Создайте новый токен
2. Выберите **"Full Account"** scope (НЕ Read-Only!)

### ❌ "Team not found"

**Причина:** Неправильный VERCEL_ORG_ID для личного аккаунта

**Решение:**
- Для личного аккаунта VERCEL_ORG_ID может быть пустым
- Или используйте ваш username вместо team_id

---

## 💡 Советы по безопасности

### ✅ ХОРОШО:
- Хранить токены в GitHub Secrets
- Хранить токены в `.env` (НЕ коммитить!)
- Использовать токены с ограниченным сроком действия

### ❌ ПЛОХО:
- Коммитить токены в git
- Отправлять токены в чат/email
- Делиться токенами с другими
- Хранить токены в коде

### 🔒 Best Practices:
1. **Регулярно обновляйте токены** (раз в 3-6 месяцев)
2. **Удаляйте неиспользуемые токены** на https://vercel.com/account/tokens
3. **Проверяйте Activity Log** - кто и когда использовал токен
4. **Используйте разные токены** для разных целей

---

## 🎯 Следующие шаги

После получения всех 3 токенов:

### 1. Настройте GitHub Secrets:

```bash
./scripts/setup-secrets.sh
```

### 2. Или запустите полную настройку:

```bash
./setup.sh
```

### 3. Сделайте тестовый деплой:

```bash
git push
```

**Через 2-3 минуты проект задеплоится автоматически!**

---

## 📚 Дополнительная информация

### Официальная документация:
- Vercel API: https://vercel.com/docs/rest-api
- Vercel Tokens: https://vercel.com/docs/rest-api#authentication
- Vercel CLI: https://vercel.com/docs/cli

### Лимиты Vercel (Free план):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/месяц
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Preview deployments

---

## ✅ Готово!

**У вас теперь есть все 3 токена Vercel!**

Добавьте их в GitHub Secrets и автодеплой заработает! 🚀

---

**Нужна помощь?** Откройте `/АВТОДЕПЛОЙ.md` для полной инструкции.
