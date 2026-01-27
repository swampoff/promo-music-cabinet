# 🐳 Promo.Music - Docker Local Development

Полноценная локальная среда разработки с Docker для тестирования всех функций Artist Cabinet.

---

## 📋 Что это?

Docker-конфигурация разворачивает **полный стек** Promo.Music локально на вашем компьютере:

✅ **Frontend** - React приложение с Glassmorphism дизайном  
✅ **PostgreSQL** - База данных  
✅ **Supabase Auth** - Регистрация и авторизация  
✅ **Supabase Storage** - Загрузка файлов (треки, фото, видео)  
✅ **Edge Functions** - Backend API на Deno  
✅ **Realtime** - WebSocket подписки  
✅ **Supabase Studio** - Web интерфейс для управления БД  

**Никакого облака не требуется** - всё работает локально!

---

## 🚀 Quick Start

### Вариант 1️⃣: Полный стек (Production-like)

Frontend собирается в Docker контейнер (как в production):

**Linux / macOS:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**Windows:**
```powershell
.\docker-start.ps1
```

**Откройте:** http://localhost:5173

---

### Вариант 2️⃣: Development Mode (рекомендуется для разработки)

Backend в Docker, Frontend запускается через `npm run dev` с hot-reload:

**Шаг 1 - Запустить backend:**

```bash
# Linux/macOS
./docker-dev.sh

# Windows
.\docker-dev.ps1
```

**Шаг 2 - В новом терминале запустить frontend:**

```bash
npm install
npm run dev
```

**Откройте:** http://localhost:5173

---

## 🌐 Доступные сервисы

После запуска доступны:

| URL | Описание |
|-----|----------|
| http://localhost:5173 | 🎨 Frontend приложение |
| http://localhost:3001 | 🗄️ Supabase Studio (управление БД) |
| http://localhost:8000 | 🔑 Supabase API Gateway |
| http://localhost:9000 | ⚡ Edge Functions |
| localhost:5432 | 📊 PostgreSQL (для SQL клиентов) |

---

## 📝 Управление

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f frontend
docker-compose logs -f functions
docker-compose logs -f postgres
```

**Или используйте скрипты:**
```bash
./docker-logs.sh    # Linux/macOS
.\docker-logs.ps1   # Windows
```

### Остановка

```bash
# С сохранением данных
docker-compose down

# С удалением всех данных
docker-compose down -v
```

**Или используйте скрипты:**
```bash
./docker-stop.sh    # Linux/macOS
.\docker-stop.ps1   # Windows
```

### Перезапуск

```bash
# Перезапустить всё
docker-compose restart

# Перезапустить конкретный сервис
docker-compose restart frontend
```

---

## ⚙️ Конфигурация

### Переменные окружения

Файл `.env` создается автоматически из `.env.docker`.

**Основные переменные:**

```env
# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password

# Supabase URLs
SITE_URL=http://localhost:5173
API_EXTERNAL_URL=http://localhost:8000

# Auth
ENABLE_EMAIL_AUTOCONFIRM=true  # Auto-confirm emails (для разработки)
DISABLE_SIGNUP=false           # Разрешить регистрацию
```

### Переключение между Local и Production

Приложение **автоматически определяет** окружение:

**Локальный Docker** (автоматически):
```bash
# Если установлена переменная:
VITE_SUPABASE_URL=http://localhost:8000

# Или явно:
VITE_USE_LOCAL_SUPABASE=true
```

**Production Supabase:**
```bash
# Просто не указывайте VITE_SUPABASE_URL
# Приложение использует production credentials
```

---

## 🔍 Подключение к базе данных

### Через Supabase Studio (рекомендуется)

1. Откройте http://localhost:3001
2. Перейдите в **Table Editor**
3. Создавайте таблицы, выполняйте SQL

### Через psql

```bash
docker exec -it promo-music-db psql -U postgres -d postgres
```

### Через GUI клиенты (DBeaver, pgAdmin, etc.)

```
Host: localhost
Port: 5432
Database: postgres
User: postgres
Password: your-super-secret-and-long-postgres-password
```

---

## 🧪 Тестирование функций

### 1. Регистрация/Авторизация

```typescript
// В приложении автоматически использует локальный Supabase
// http://localhost:8000/auth/v1/signup
```

### 2. Загрузка файлов

```typescript
// Storage доступен на http://localhost:5000
// Автоматически настроен в приложении
```

### 3. Edge Functions

```bash
# Функции доступны на http://localhost:9000
curl http://localhost:9000/make-server-84730125/health
```

### 4. Realtime подписки

```typescript
// WebSocket соединение на ws://localhost:4000
// Работает автоматически через Kong Gateway
```

---

## 🐛 Troubleshooting

### Порт уже занят

**Ошибка:** `Error: port is already allocated`

**Linux/macOS:**
```bash
lsof -i :5173
kill -9 <PID>
```

**Windows:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Контейнеры не запускаются

```bash
# Просмотр логов
docker-compose logs

# Полная переустановка
docker-compose down -v
docker-compose up -d --build
```

### Приложение не подключается к Supabase

```bash
# Проверка Kong Gateway
curl http://localhost:8000/health

# Перезапуск сервисов
docker-compose restart kong rest auth
```

### Slow performance

**Docker Desktop → Settings → Resources:**
- Memory: 6-8 GB
- CPUs: 4

---

## 📚 Структура проекта

```
.
├── docker-compose.yml          # Production-like стек
├── docker-compose.dev.yml      # Development стек (только backend)
├── Dockerfile                  # Frontend образ
├── .env.docker                 # Шаблон переменных окружения
│
├── docker/
│   ├── nginx.conf             # Nginx конфигурация
│   └── kong/
│       └── kong.yml           # Kong API Gateway конфигурация
│
├── docker-start.sh/ps1        # Скрипты запуска
├── docker-dev.sh/ps1          # Скрипты dev-режима
├── docker-stop.sh/ps1         # Скрипты остановки
├── docker-logs.sh/ps1         # Скрипты просмотра логов
│
└── src/
    ├── config/
    │   └── environment.ts     # Автоматическое переключение окружений
    └── utils/supabase/
        └── client.ts          # Singleton Supabase клиент
```

---

## 📖 Документация

- **[DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)** - Быстрый старт за 3 минуты
- **[DOCKER_README.md](./DOCKER_README.md)** - Подробная документация со всеми деталями

---

## 🔄 Workflow для разработки

### Обычный день разработки:

```bash
# 1. Утром запустить backend
./docker-dev.sh

# 2. Запустить frontend с hot-reload
npm run dev

# 3. Работать с кодом
# Изменения применяются автоматически

# 4. Вечером остановить всё
docker-compose -f docker-compose.dev.yml down
```

### Тестирование как в production:

```bash
# 1. Собрать и запустить полный стек
./docker-start.sh

# 2. Тестировать на http://localhost:5173

# 3. Остановить
./docker-stop.sh
```

---

## 🎯 Следующие шаги

После успешного запуска локального окружения:

1. ✅ **Тестируйте** все функции приложения локально
2. ✅ **Разрабатывайте** новые фичи с hot-reload
3. ✅ **Дебажьте** проблемы без затрат на cloud
4. ✅ **Готовьте** production deployment

---

## 🆘 Поддержка

**Проблемы с Docker?**
1. Проверьте секцию Troubleshooting выше
2. Посмотрите логи: `docker-compose logs -f`
3. См. подробную документацию: [DOCKER_README.md](./DOCKER_README.md)

**Проблемы с приложением?**
1. Откройте браузер DevTools (F12)
2. Проверьте Console на ошибки
3. Проверьте Network tab для API запросов

---

## 📝 FAQ

**Q: Можно ли использовать одновременно local и production?**  
A: Нет, приложение автоматически выбирает окружение. Используйте разные `.env` файлы.

**Q: Данные сохраняются после перезапуска?**  
A: Да, если используете `docker-compose down`. Нет, если `docker-compose down -v`.

**Q: Можно ли подключиться к local БД из другого приложения?**  
A: Да, используйте `localhost:5432` с credentials из `.env`.

**Q: Как обновить Docker образы?**  
A: `docker-compose pull && docker-compose up -d --build`

**Q: Можно ли изменить порты?**  
A: Да, отредактируйте `docker-compose.yml` секцию `ports`.

---

**🎵 Promo.Music Team**  
© 2026 - Локальная разработка стала проще!
