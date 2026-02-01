# 🐳 Docker Setup для Promo.Music Artist Cabinet

Полная локальная среда разработки и тестирования с использованием Docker.

## 📋 Содержание

- [Что включено](#что-включено)
- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Доступные сервисы](#доступные-сервисы)
- [Управление](#управление)
- [Конфигурация](#конфигурация)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Что включено

Docker Compose конфигурация разворачивает полный стек:

### Frontend
- ✅ React приложение с Vite
- ✅ Tailwind CSS v4
- ✅ Glassmorphism дизайн
- ✅ Nginx для production-режима

### Supabase Backend
- ✅ PostgreSQL 15 база данных
- ✅ GoTrue (Auth)
- ✅ PostgREST (REST API)
- ✅ Realtime subscriptions
- ✅ Storage API + Image optimization
- ✅ Edge Functions (Deno runtime)
- ✅ Kong API Gateway
- ✅ Supabase Studio (Web UI)

---

## 💻 Требования

- **Docker Desktop** 20.10+
- **Docker Compose** 2.0+
- **8GB RAM** (минимум 4GB для Docker)
- **10GB свободного места** на диске

### Установка Docker

#### Windows / macOS
Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop

#### Linux (Ubuntu/Debian)
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

---

## 🚀 Быстрый старт

### 1. Подготовка

```bash
# Клонируйте репозиторий (если ещё не клонировали)
git clone <your-repo-url>
cd artist-promo-music

# Скопируйте env файл
cp .env.docker .env
```

### 2. Запуск

#### Linux / macOS
```bash
# Сделайте скрипт исполняемым
chmod +x docker-start.sh

# Запустите
./docker-start.sh
```

#### Windows (PowerShell)
```powershell
# Запустите PowerShell как администратор
.\docker-start.ps1
```

#### Альтернатива (любая ОС)
```bash
docker-compose up -d --build
```

### 3. Ожидание инициализации

Первый запуск займёт 3-5 минут:
- Загрузка Docker образов
- Сборка frontend
- Инициализация базы данных
- Запуск миграций

### 4. Готово! 🎉

Откройте браузер:
- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:3001

---

## 🌐 Доступные сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| 🎨 **Frontend** | http://localhost:5173 | React приложение |
| 🗄️ **Supabase Studio** | http://localhost:3001 | Web интерфейс для БД |
| 🔑 **API Gateway** | http://localhost:8000 | Kong gateway (Supabase API) |
| ⚡ **Edge Functions** | http://localhost:9000 | Deno функции |
| 📊 **PostgreSQL** | localhost:5432 | База данных |
| 🔐 **Auth** | http://localhost:9999 | GoTrue auth сервис |
| 📦 **Storage** | http://localhost:5000 | File storage API |
| 🔄 **Realtime** | http://localhost:4000 | WebSocket сервис |
| 📈 **Meta** | http://localhost:8080 | DB metadata API |
| 🖼️ **ImgProxy** | http://localhost:5001 | Image optimization |

---

## 🎮 Управление

### Просмотр статуса
```bash
docker-compose ps
```

### Просмотр логов

#### Все сервисы
```bash
docker-compose logs -f
```

#### Конкретный сервис (используйте скрипты)

**Linux/macOS:**
```bash
chmod +x docker-logs.sh
./docker-logs.sh
```

**Windows:**
```powershell
.\docker-logs.ps1
```

#### Или напрямую
```bash
# Frontend
docker-compose logs -f frontend

# Edge Functions
docker-compose logs -f functions

# База данных
docker-compose logs -f postgres

# API Gateway
docker-compose logs -f kong
```

### Остановка

#### С сохранением данных
```bash
docker-compose down
```

#### С удалением данных (полная очистка)
```bash
docker-compose down -v
```

#### Используя скрипты

**Linux/macOS:**
```bash
chmod +x docker-stop.sh
./docker-stop.sh
```

**Windows:**
```powershell
.\docker-stop.ps1
```

### Перезапуск

```bash
docker-compose restart

# Или конкретный сервис
docker-compose restart frontend
```

### Пересборка

```bash
# Пересобрать frontend
docker-compose up -d --build frontend

# Пересобрать всё
docker-compose up -d --build
```

---

## ⚙️ Конфигурация

### Файл .env

Основные переменные окружения (файл `.env`):

```env
# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password

# API Keys (для разработки, НЕ используйте в production)
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long

# URLs
SITE_URL=http://localhost:5173
API_EXTERNAL_URL=http://localhost:8000
SUPABASE_PUBLIC_URL=http://localhost:8000

# Auth
DISABLE_SIGNUP=false
ENABLE_EMAIL_AUTOCONFIRM=true
```

### Изменение портов

Отредактируйте `docker-compose.yml`, секция `ports`:

```yaml
services:
  frontend:
    ports:
      - "3000:80"  # было 5173:80
```

### Настройка SMTP (email)

Раскомментируйте в `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_ADMIN_EMAIL=admin@example.com
```

И в `.env` установите:
```env
ENABLE_EMAIL_AUTOCONFIRM=false
```

---

## 🔍 Подключение к базе данных

### Через Supabase Studio
1. Откройте http://localhost:3001
2. Перейдите в **Table Editor**

### Через psql
```bash
docker exec -it promo-music-db psql -U postgres -d postgres
```

### Через GUI клиенты (DBeaver, pgAdmin и т.д.)
- **Host**: localhost
- **Port**: 5432
- **Database**: postgres
- **User**: postgres
- **Password**: your-super-secret-and-long-postgres-password

### Через код
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://localhost:8000',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)
```

---

## 🐛 Troubleshooting

### Порты заняты

**Проблема**: `Error: port is already allocated`

**Решение**:
```bash
# Найти процесс, использующий порт (например, 5173)
# Linux/macOS
lsof -i :5173
kill -9 <PID>

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Контейнеры не запускаются

**Проблема**: Контейнеры в статусе `Exit`

**Решение**:
```bash
# Просмотр логов
docker-compose logs

# Полная переустановка
docker-compose down -v
docker-compose up -d --build
```

### База данных не инициализируется

**Проблема**: Ошибки миграций

**Решение**:
```bash
# Остановить и удалить volumes
docker-compose down -v

# Запустить заново
docker-compose up -d

# Проверить логи PostgreSQL
docker-compose logs -f postgres
```

### Frontend показывает ошибки подключения

**Проблема**: Cannot connect to Supabase

**Проверка**:
1. Убедитесь, что Kong работает: http://localhost:8000/health
2. Проверьте переменные окружения в `.env`
3. Проверьте логи: `docker-compose logs -f kong`

**Решение**:
```bash
# Перезапустить Kong и зависимости
docker-compose restart kong rest auth storage
```

### Slow performance / Out of memory

**Проблема**: Docker использует слишком много ресурсов

**Решение**:

**Docker Desktop**:
1. Settings → Resources
2. Увеличьте Memory до 6-8GB
3. Увеличьте CPUs до 4

**Linux**:
```bash
# Очистка неиспользуемых образов
docker system prune -a

# Остановка ненужных контейнеров
docker-compose down
```

### Edge Functions не работают

**Проблема**: Functions возвращают 500 ошибку

**Решение**:
```bash
# Проверить логи
docker-compose logs -f functions

# Перезапустить
docker-compose restart functions

# Пересобрать (если изменили код)
docker-compose up -d --build functions
```

### Storage не загружает файлы

**Проблема**: Upload fails

**Решение**:
```bash
# Проверить permissions для volume
docker-compose logs -f storage

# Пересоздать volume
docker-compose down -v
docker-compose up -d
```

---

## 📚 Полезные команды

### Очистка Docker

```bash
# Удалить все остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка
docker system prune -a --volumes
```

### Экспорт/Импорт базы данных

**Экспорт:**
```bash
docker exec promo-music-db pg_dump -U postgres postgres > backup.sql
```

**Импорт:**
```bash
docker exec -i promo-music-db psql -U postgres postgres < backup.sql
```

### Выполнение SQL

```bash
# Из файла
docker exec -i promo-music-db psql -U postgres postgres < migration.sql

# Прямая команда
docker exec promo-music-db psql -U postgres postgres -c "SELECT * FROM kv_store_84730125 LIMIT 5;"
```

### Мониторинг ресурсов

```bash
# Статистика использования
docker stats

# Только наши контейнеры
docker stats $(docker ps --format '{{.Names}}' | grep promo-music)
```

---

## 🎯 Следующие шаги

После успешного запуска:

1. **Тестирование приложения**
   - Откройте http://localhost:5173
   - Зарегистрируйте тестового пользователя
   - Проверьте основные функции

2. **Изучение Supabase Studio**
   - http://localhost:3001
   - Просмотр таблиц
   - SQL Editor
   - API Docs

3. **Разработка**
   - Код фронтенда в `/src`
   - Edge Functions в `/supabase/functions/server`
   - Миграции в `/supabase/migrations`

4. **Production деплой**
   - См. `/DEPLOY.md`
   - Настройте production Supabase проект
   - Используйте Vercel/Netlify для фронтенда

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте секцию [Troubleshooting](#troubleshooting)
2. Просмотрите логи: `docker-compose logs -f`
3. Создайте issue в репозитории
4. Проверьте документацию Supabase: https://supabase.com/docs

---

## 📝 Changelog

### v1.0.0 (2026-01-27)
- ✅ Полная Docker конфигурация
- ✅ Все сервисы Supabase
- ✅ Автоматические скрипты запуска
- ✅ Подробная документация
- ✅ Troubleshooting guide

---

**🎵 Promo.Music Team**
