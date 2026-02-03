# 🐳 Docker Setup - Навигация по документации

Полный индекс всех файлов и документации для Docker локального окружения Promo.Music.

---

## 🚀 С чего начать?

### Если вы впервые:
👉 **[DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)** - Запуск за 3 минуты

### Если нужна полная инструкция:
👉 **[README_DOCKER.md](./README_DOCKER.md)** - Основное руководство

### Если нужны все детали:
👉 **[DOCKER_README.md](./DOCKER_README.md)** - Энциклопедия

### После установки:
👉 **[DOCKER_SETUP_COMPLETE.md](./DOCKER_SETUP_COMPLETE.md)** - Что делать дальше

---

## 📁 Структура файлов

### 🔧 Конфигурационные файлы

| Файл | Описание |
|------|----------|
| `docker-compose.yml` | Production-like стек (Frontend + Backend) |
| `docker-compose.dev.yml` | Development стек (только Backend) |
| `Dockerfile` | Frontend образ с Nginx |
| `.env.docker` | Шаблон переменных окружения |
| `.dockerignore` | Исключения для Docker build |

### 📂 Конфигурации сервисов

| Файл | Описание |
|------|----------|
| `docker/nginx.conf` | Nginx конфигурация для frontend |
| `docker/kong/kong.yml` | Kong API Gateway роутинг |

### 🎮 Скрипты управления

| Скрипт | Linux/macOS | Windows | Описание |
|--------|-------------|---------|----------|
| Запуск полного стека | `./docker-start.sh` | `.\docker-start.ps1` | Production режим |
| Запуск только backend | `./docker-dev.sh` | `.\docker-dev.ps1` | Development режим |
| Остановка | `./docker-stop.sh` | `.\docker-stop.ps1` | Остановка контейнеров |
| Логи | `./docker-logs.sh` | `.\docker-logs.ps1` | Просмотр логов |
| Health Check | `./docker-health-check.sh` | `.\docker-health-check.ps1` | Проверка работы |

### 📚 Документация

| Файл | Для кого | Размер |
|------|----------|--------|
| `DOCKER_QUICKSTART.md` | Новички | Quick (3 мин) |
| `README_DOCKER.md` | Все | Средний (10 мин) |
| `DOCKER_README.md` | Продвинутые | Полный (30 мин) |
| `DOCKER_SETUP_COMPLETE.md` | После установки | Справочник |
| `DOCKER_INDEX.md` | Навигация | Этот файл |

### 🔨 Исходный код

| Файл | Описание |
|------|----------|
| `src/config/environment.ts` | Автопереключение local/production |
| `src/utils/supabase/client.ts` | Singleton Supabase клиент с Docker support |

---

## 📖 Быстрые ссылки

### Установка
- [Quick Start за 3 минуты](./DOCKER_QUICKSTART.md#быстрый-запуск)
- [Development режим](./README_DOCKER.md#2️⃣-development-mode-рекомендуется)
- [Production режим](./README_DOCKER.md#1️⃣-полный-стек-production-like)

### Управление
- [Запуск](./DOCKER_README.md#запуск)
- [Остановка](./DOCKER_README.md#остановка)
- [Просмотр логов](./DOCKER_README.md#просмотр-логов)
- [Перезапуск](./DOCKER_README.md#перезапуск)

### Конфигурация
- [Переменные окружения](./README_DOCKER.md#переменные-окружения)
- [Переключение local/production](./README_DOCKER.md#переключение-между-local-и-production)
- [Изменение портов](./DOCKER_README.md#изменение-портов)
- [Настройка SMTP](./DOCKER_README.md#настройка-smtp-email)

### Подключение к БД
- [Через Supabase Studio](./DOCKER_README.md#через-supabase-studio-рекомендуется)
- [Через psql](./DOCKER_README.md#через-psql)
- [Через GUI клиенты](./DOCKER_README.md#через-gui-клиенты-dbeaver-pgadmin-и-тд)

### Troubleshooting
- [Порты заняты](./DOCKER_README.md#порты-заняты)
- [Контейнеры не запускаются](./DOCKER_README.md#контейнеры-не-запускаются)
- [БД не инициализируется](./DOCKER_README.md#база-данных-не-инициализируется)
- [Frontend ошибки](./DOCKER_README.md#frontend-показывает-ошибки-подключения)
- [Slow performance](./DOCKER_README.md#slow-performance--out-of-memory)

---

## 🎯 Workflow схемы

### Первый запуск

```
1. Установить Docker Desktop
   ↓
2. ./docker-start.sh (или .ps1)
   ↓
3. Дождаться инициализации (~3-5 мин)
   ↓
4. Открыть http://localhost:5173
   ↓
5. ✅ Готово!
```

### Ежедневная разработка

```
Утро:
./docker-dev.sh        → Запустить backend
npm run dev            → Запустить frontend

Работа:
Код → Сохранить → Hot-reload автоматически

Вечер:
Ctrl+C                 → Остановить frontend
docker-compose down    → Остановить backend
```

### Production тестирование

```
./docker-start.sh      → Собрать полный стек
↓
Тестирование на http://localhost:5173
↓
./docker-stop.sh       → Остановить
```

---

## 🌐 Карта сервисов

```
┌─────────────────────────────────────────┐
│         Docker Network                   │
├─────────────────────────────────────────┤
│                                          │
│  Frontend (5173)                         │
│     ↓                                    │
│  Kong Gateway (8000) ← Главный роутер    │
│     ├── /auth → GoTrue (9999)           │
│     ├── /rest → PostgREST (3000)        │
│     ├── /storage → Storage (5000)       │
│     ├── /realtime → Realtime (4000)     │
│     └── /functions → Edge Functions     │
│                      (9000)              │
│                                          │
│  PostgreSQL (5432) ← База данных        │
│                                          │
│  Supabase Studio (3001) ← Web UI        │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📊 Спецификации

### Системные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 cores | 4 cores |
| Disk | 5 GB | 10 GB |
| Docker | 20.10+ | Latest |

### Используемые порты

| Порт | Сервис | Протокол |
|------|--------|----------|
| 5173 | Frontend | HTTP |
| 3001 | Supabase Studio | HTTP |
| 8000 | Kong Gateway | HTTP |
| 9000 | Edge Functions | HTTP |
| 5432 | PostgreSQL | TCP |
| 9999 | GoTrue Auth | HTTP |
| 3000 | PostgREST | HTTP |
| 5000 | Storage API | HTTP |
| 4000 | Realtime | WebSocket |

### Docker образы

| Сервис | Образ | Версия |
|--------|-------|--------|
| PostgreSQL | supabase/postgres | 15.1.0.117 |
| Auth | supabase/gotrue | v2.132.3 |
| REST | postgrest/postgrest | v12.0.1 |
| Realtime | supabase/realtime | v2.25.35 |
| Storage | supabase/storage-api | v0.43.11 |
| Functions | supabase/edge-runtime | v1.42.1 |
| Kong | kong | 2.8.1 |
| Studio | supabase/studio | 20240101-8e4a094 |
| ImgProxy | darthsim/imgproxy | v3.8.0 |

---

## 🔐 Credentials (Development)

### PostgreSQL
```
Host: localhost
Port: 5432
Database: postgres
User: postgres
Password: your-super-secret-and-long-postgres-password
```

### Supabase API
```
URL: http://localhost:8000
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Key: (см. .env файл)
```

⚠️ **ВАЖНО**: Эти credentials ТОЛЬКО для локальной разработки!  
НЕ используйте их в production!

---

## 🎓 Обучающие материалы

### Видео гайды (планируется)
- [ ] Установка Docker Desktop
- [ ] Первый запуск Promo.Music
- [ ] Development workflow
- [ ] Работа с Supabase Studio
- [ ] Debugging с Docker

### Tutorials
- [x] Quick Start Guide
- [x] Development Mode Guide
- [x] Production Build Guide
- [x] Troubleshooting Guide
- [ ] Advanced Configuration

---

## 🆘 Получить помощь

### Проверьте сначала:
1. [Troubleshooting](./DOCKER_README.md#troubleshooting)
2. [FAQ](./README_DOCKER.md#faq)
3. Логи: `./docker-logs.sh`
4. Health check: `./docker-health-check.sh`

### Всё ещё не работает?
1. Создайте issue с:
   - Вывод `docker-compose logs`
   - Вывод `docker-compose ps`
   - Ваша ОС и версия Docker
2. Проверьте существующие issues
3. Спросите в сообществе

---

## 📝 Changelog

### v1.0.0 (2026-01-27)
- ✅ Полная Docker конфигурация
- ✅ Production и Development режимы
- ✅ Автоматические скрипты управления
- ✅ Health check система
- ✅ Подробная документация на русском
- ✅ Автопереключение окружений
- ✅ Singleton Supabase клиент

---

## 🎵 Promo.Music Team

**Версия документации:** 1.0.0  
**Дата:** 27 января 2026  
**Статус:** ✅ Production Ready

---

## 📌 Quick Commands Reference

```bash
# Запуск
./docker-start.sh              # Production mode
./docker-dev.sh                # Development mode

# Управление
docker-compose ps              # Статус
docker-compose logs -f         # Логи
docker-compose down            # Остановка
./docker-health-check.sh       # Проверка

# Очистка
docker-compose down -v         # Удалить данные
docker system prune -a         # Полная очистка Docker

# Frontend (dev mode)
npm run dev                    # Hot-reload режим
npm run build                  # Production сборка
```

---

**🚀 Готовы начать? → [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)**
