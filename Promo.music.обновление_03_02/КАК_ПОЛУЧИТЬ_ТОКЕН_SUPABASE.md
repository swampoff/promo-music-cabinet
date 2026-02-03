# 🔐 Как получить токен Supabase

## 📋 Что нужно получить

Для деплоя Edge Functions нужен **1 токен**:

✅ **SUPABASE_ACCESS_TOKEN** - токен доступа к Supabase API

**Время:** 2-3 минуты  
**Стоимость:** $0 (бесплатно)

---

## 🚀 Шаг 0: Подготовка

### Если у вас НЕТ аккаунта Supabase:

1. Откройте: https://supabase.com/dashboard/sign-up
2. Нажмите **"Continue with GitHub"**
3. Авторизуйтесь через GitHub
4. ✅ Готово! Аккаунт создан

### Если у вас УЖЕ ЕСТЬ аккаунт:

1. Откройте: https://supabase.com/dashboard/sign-in
2. Войдите через GitHub
3. ✅ Готово!

---

## 🔑 Шаг 1: Получить SUPABASE_ACCESS_TOKEN

### 1.1 Откройте страницу токенов

**Вариант A:** Прямая ссылка (БЫСТРО!)
```
https://supabase.com/dashboard/account/tokens
```

**Вариант B:** Через меню
1. Кликните на **аватар/иконку** справа вверху
2. Выберите **"Account"**
3. В левом меню выберите **"Access Tokens"**

### 1.2 Создайте новый токен

```
┌─────────────────────────────────────────────┐
│ Access Tokens                                │
├─────────────────────────────────────────────┤
│                                              │
│ Personal access tokens function like API    │
│ keys and are used to authenticate with      │
│ Supabase CLI and Management API.            │
│                                              │
│ [ Generate New Token ]                       │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Your Tokens:                                 │
│                                              │
│ No tokens yet                                │
│                                              │
└─────────────────────────────────────────────┘
```

1. Нажмите кнопку **"Generate New Token"**
2. Откроется форма создания токена

### 1.3 Заполните форму

```
┌─────────────────────────────────────────────┐
│ Generate New Token                           │
├─────────────────────────────────────────────┤
│                                              │
│ Token Name: *                                │
│ ┌─────────────────────────────────────────┐ │
│ │ GitHub Actions Deploy                    │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Expiration:                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ 1 year                               ▼  │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│          [ Cancel ]    [ Generate Token ]   │
└─────────────────────────────────────────────┘
```

**Заполните так:**
- **Token Name:** `GitHub Actions Deploy` (или любое другое имя)
- **Expiration:** Выберите **"1 year"** или **"No expiration"**

### 1.4 Скопируйте токен

1. Нажмите **"Generate Token"**
2. Появится окно с токеном:

```
┌─────────────────────────────────────────────┐
│ Token Created                                │
├─────────────────────────────────────────────┤
│                                              │
│ Your personal access token has been created! │
│                                              │
│ ⚠️  Make sure to copy it now.               │
│    You won't be able to see it again!       │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ sbp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p   │ │
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
sbp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z
```

✅ **SUPABASE_ACCESS_TOKEN получен!**

---

## 📝 Что у вас должно быть

```bash
# SUPABASE_ACCESS_TOKEN (длинный токен, начинается с sbp_)
sbp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z
```

✅ **Токен получен!**

---

## 🔐 Куда добавить токен

### Вариант 1: Через скрипт (РЕКОМЕНДУЕТСЯ)

```bash
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

Скрипт запросит токен и автоматически добавит его в GitHub Secrets.

### Вариант 2: Вручную в GitHub

1. Откройте репозиторий на GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **"New repository secret"**
4. Добавьте секрет:
   - **Name:** `SUPABASE_ACCESS_TOKEN`
   - **Secret:** ваш токен `sbp_...`
5. Нажмите **"Add secret"**

### Вариант 3: Для локального деплоя

Добавьте в `.env`:

```bash
# .env
SUPABASE_ACCESS_TOKEN=sbp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z
```

⚠️ **Не коммитьте `.env` в git!**

---

## 🔍 Проверка токена

### Проверить что токен работает:

```bash
# Установите Supabase CLI (если ещё не установлен)
# macOS:
brew install supabase/tap/supabase

# Linux:
curl -fsSL https://cli.supabase.com/install.sh | sh

# Проверьте токен
export SUPABASE_ACCESS_TOKEN=sbp_your_token
supabase projects list
```

**Должно вернуть список ваших проектов.**

---

## 🐛 Troubleshooting

### ❌ "Invalid token" или "Unauthorized"

**Причина:** Неправильный токен или истёк срок

**Решение:**
1. Создайте новый токен на https://supabase.com/dashboard/account/tokens
2. Скопируйте правильно (токен очень длинный!)
3. Проверьте что токен начинается с `sbp_`

### ❌ "Token expired"

**Причина:** Срок действия токена истёк

**Решение:**
1. Удалите старый токен на https://supabase.com/dashboard/account/tokens
2. Создайте новый с бо́льшим сроком действия
3. Обновите токен в GitHub Secrets

### ❌ "Insufficient permissions"

**Причина:** У токена недостаточно прав (не должно происходить с Personal Access Token)

**Решение:**
1. Убедитесь что вы создали **Personal Access Token**, а не **Service Role Key**
2. Personal Access Token имеет все необходимые права

---

## ⚠️ Важное отличие от Service Role Key

### ❌ НЕ используйте SUPABASE_SERVICE_ROLE_KEY!

```bash
# ❌ ЭТО ОПАСНО! Не используйте для деплоя!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Почему:**
- Service Role Key имеет ПОЛНЫЙ доступ к вашей базе данных
- Его утечка = катастрофа для безопасности
- Используется ТОЛЬКО на backend сервере

### ✅ Используйте SUPABASE_ACCESS_TOKEN!

```bash
# ✅ ЭТО ПРАВИЛЬНО! Для деплоя Edge Functions
SUPABASE_ACCESS_TOKEN=sbp_1a2b3c4d5e6f...
```

**Почему:**
- Access Token предназначен для Management API
- Безопасен для CI/CD
- Ограниченные права (только управление проектом)

---

## 💡 Советы по безопасности

### ✅ ХОРОШО:
- Хранить токен в GitHub Secrets
- Хранить токен в `.env` (НЕ коммитить!)
- Использовать токены с ограниченным сроком действия (1 год)
- Регулярно обновлять токены

### ❌ ПЛОХО:
- Коммитить токен в git
- Отправлять токен в чат/email
- Делиться токеном с другими
- Хранить токен в коде
- Использовать Service Role Key для деплоя

### 🔒 Best Practices:
1. **Регулярно обновляйте токены** (раз в год)
2. **Удаляйте неиспользуемые токены** на https://supabase.com/dashboard/account/tokens
3. **Используйте разные токены** для разных целей (development, production)
4. **Мониторьте Activity Log** в Supabase Dashboard

---

## 📊 Управление токенами

### Просмотр всех токенов:

1. Откройте: https://supabase.com/dashboard/account/tokens
2. Вы увидите список всех токенов:

```
┌─────────────────────────────────────────────┐
│ Your Tokens:                                 │
├─────────────────────────────────────────────┤
│                                              │
│ GitHub Actions Deploy                        │
│ Created: Jan 25, 2026                        │
│ Last used: 2 hours ago                       │
│ Expires: Jan 25, 2027                        │
│                            [ Revoke ]        │
│                                              │
│ Local Development                            │
│ Created: Jan 20, 2026                        │
│ Last used: Never                             │
│ Expires: Jan 20, 2027                        │
│                            [ Revoke ]        │
│                                              │
└─────────────────────────────────────────────┘
```

### Удаление токена:

1. Найдите токен в списке
2. Нажмите **"Revoke"**
3. Подтвердите удаление

⚠️ **После удаления токен перестанет работать немедленно!**

---

## 🎯 Следующие шаги

После получения токена:

### 1. Добавьте в GitHub Secrets:

```bash
./scripts/setup-secrets.sh
```

### 2. Или запустите полную настройку:

```bash
./setup.sh
```

### 3. Проверьте что Edge Functions работают:

```bash
curl https://qzpmiiqfwkcnrhvubdgt.supabase.co/functions/v1/make-server-84730125/health
```

**Должно вернуть:**
```json
{"status":"ok","timestamp":"2026-01-25T12:00:00.000Z"}
```

---

## 📚 Дополнительная информация

### Официальная документация:
- Supabase CLI: https://supabase.com/docs/guides/cli
- Management API: https://supabase.com/docs/reference/api
- Access Tokens: https://supabase.com/docs/guides/cli/managing-access-tokens

### Что можно делать с Access Token:
- ✅ Deploy Edge Functions
- ✅ Управлять проектами
- ✅ Читать логи
- ✅ Управлять настройками
- ❌ Прямой доступ к базе данных (для этого используйте Service Role Key на backend)

### Лимиты Supabase (Free план):
- ✅ 500,000 Edge Function invocations/месяц
- ✅ 500 MB Database storage
- ✅ 2 GB File storage
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users

---

## ✅ Готово!

**У вас теперь есть SUPABASE_ACCESS_TOKEN!**

Добавьте его в GitHub Secrets вместе с токенами Vercel, и автодеплой Edge Functions заработает! 🚀

---

## 🔗 Связанные инструкции

- **Vercel токены:** `/КАК_ПОЛУЧИТЬ_ТОКЕНЫ_VERCEL.md`
- **Полная настройка:** `/АВТОДЕПЛОЙ.md`
- **Все команды:** `/КОМАНДЫ.md`

---

**Нужна помощь?** Откройте `/АВТОДЕПЛОЙ.md` для полной инструкции.
