# 🐳 Docker Cheat Sheet - Promo.Music

Быстрая шпаргалка по всем командам Docker для Promo.Music.

---

## 🚀 Запуск

### Production Mode (полный стек)
```bash
# Linux/macOS
./docker-start.sh

# Windows
.\docker-start.ps1

# Или напрямую
docker-compose up -d --build
```

### Development Mode (только backend)
```bash
# Linux/macOS
./docker-dev.sh

# Windows
.\docker-dev.ps1

# Или напрямую
docker-compose -f docker-compose.dev.yml up -d
```

### Frontend (dev mode)
```bash
npm install
npm run dev
```

---

## 🛑 Остановка

```bash
# С сохранением данных
docker-compose down
./docker-stop.sh

# С удалением данных
docker-compose down -v

# Только frontend (dev mode)
Ctrl + C
```

---

## 📋 Просмотр логов

```bash
# Интерактивный выбор
./docker-logs.sh              # Linux/macOS
.\docker-logs.ps1             # Windows

# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f frontend
docker-compose logs -f functions
docker-compose logs -f postgres
docker-compose logs -f kong

# Последние N строк
docker-compose logs --tail=100 functions
```

---

## 🔍 Статус и мониторинг

```bash
# Список контейнеров
docker-compose ps

# Health check
./docker-health-check.sh      # Linux/macOS
.\docker-health-check.ps1     # Windows

# Health endpoints
curl http://localhost:8000/health
curl http://localhost:9000/make-server-84730125/health

# Использование ресурсов
docker stats

# Информация о контейнере
docker inspect promo-music-db
docker inspect promo-music-kong
```

---

## 🔄 Перезапуск

```bash
# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart frontend
docker-compose restart functions
docker-compose restart postgres
docker-compose restart kong

# Пересборка и перезапуск
docker-compose up -d --build
```

---

## 🗄️ Работа с PostgreSQL

### Подключение через psql
```bash
# Войти в контейнер
docker exec -it promo-music-db psql -U postgres -d postgres

# Выполнить SQL команду
docker exec promo-music-db psql -U postgres -d postgres -c "SELECT * FROM kv_store_84730125 LIMIT 5;"

# Выполнить SQL файл
docker exec -i promo-music-db psql -U postgres -d postgres < migration.sql
```

### Бэкап и восстановление
```bash
# Экспорт (backup)
docker exec promo-music-db pg_dump -U postgres postgres > backup.sql

# Импорт (restore)
docker exec -i promo-music-db psql -U postgres postgres < backup.sql
```

### GUI клиенты
```
Host: localhost
Port: 5432
Database: postgres
User: postgres
Password: your-super-secret-and-long-postgres-password
```

---

## 📦 Storage и файлы

```bash
# Список buckets
curl http://localhost:8000/storage/v1/bucket

# Статус Storage
curl http://localhost:9000/make-server-84730125/storage/status

# Список файлов в bucket
curl "http://localhost:8000/storage/v1/object/list/make-84730125-concert-banners" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🧹 Очистка

```bash
# Остановка с сохранением данных
docker-compose down

# Остановка + удаление volumes (БД и Storage)
docker-compose down -v

# Удаление неиспользуемых образов
docker image prune -a

# Удаление неиспользуемых контейнеров
docker container prune

# Удаление неиспользуемых volumes
docker volume prune

# Полная очистка Docker
docker system prune -a --volumes

# Очистка только Promo.Music
docker-compose down -v
docker rmi $(docker images -q 'promo-music*')
```

---

## 🔧 Debugging

### Войти в контейнер
```bash
# PostgreSQL
docker exec -it promo-music-db bash

# Edge Functions
docker exec -it promo-music-functions bash

# Frontend (если запущен)
docker exec -it promo-music-frontend sh
```

### Просмотр переменных окружения
```bash
# Все env контейнера
docker exec promo-music-functions env

# Конкретная переменная
docker exec promo-music-functions printenv SUPABASE_URL
```

### Проверка сети
```bash
# Список сетей
docker network ls

# Информация о сети
docker network inspect promo-music-network

# Проверка подключения между контейнерами
docker exec promo-music-kong ping postgres
docker exec promo-music-functions curl http://kong:8000/health
```

---

## 📊 Volumes

```bash
# Список volumes
docker volume ls

# Информация о volume
docker volume inspect promo-music_postgres-data
docker volume inspect promo-music_storage-data

# Удалить конкретный volume
docker volume rm promo-music_postgres-data

# Бэкап volume
docker run --rm -v promo-music_postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## 🌐 Сетевые команды

```bash
# Проверка портов
netstat -tulpn | grep :5173
lsof -i :5173                 # macOS/Linux
Get-NetTCPConnection -LocalPort 5173  # Windows PowerShell

# Убить процесс на порту
# Linux/macOS
lsof -ti :5173 | xargs kill -9

# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Тест доступности
curl http://localhost:5173
curl http://localhost:8000/health
curl http://localhost:9000/make-server-84730125/health
```

---

## 🔄 Обновление

```bash
# Обновить Docker образы
docker-compose pull

# Пересобрать с обновлениями
docker-compose up -d --build

# Обновить конкретный сервис
docker-compose pull postgres
docker-compose up -d postgres
```

---

## 🎯 Переменные окружения

### Просмотр
```bash
cat .env
```

### Редактирование
```bash
# Linux/macOS
nano .env
vim .env

# Windows
notepad .env
```

### Основные переменные
```env
# Database
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password

# URLs
SITE_URL=http://localhost:5173
API_EXTERNAL_URL=http://localhost:8000

# Auth
ENABLE_EMAIL_AUTOCONFIRM=true
DISABLE_SIGNUP=false

# Vite (Frontend)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📱 Quick URLs

```
Frontend:         http://localhost:5173
Supabase Studio:  http://localhost:3001
API Gateway:      http://localhost:8000
Edge Functions:   http://localhost:9000
PostgreSQL:       localhost:5432
```

---

## 🧪 Testing endpoints

```bash
# Health checks
curl http://localhost:8000/health
curl http://localhost:9000/make-server-84730125/health

# API examples
curl http://localhost:9000/make-server-84730125/concerts \
  -H "Authorization: Bearer YOUR_ANON_KEY"

curl http://localhost:9000/make-server-84730125/notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY"

curl http://localhost:9000/make-server-84730125/storage/status
```

---

## 📚 Документация

```bash
# Открыть документацию
cat DOCKER_QUICKSTART.md       # Quick start
cat README_DOCKER.md           # Основное руководство
cat DOCKER_README.md           # Подробная энциклопедия
cat DOCKER_INDEX.md            # Навигация
```

---

## 🆘 Troubleshooting Quick Fixes

### Порт занят
```bash
# Linux/macOS
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Контейнеры не запускаются
```bash
docker-compose down -v
docker-compose up -d --build
```

### База данных не работает
```bash
docker-compose logs -f postgres
docker-compose restart postgres
```

### Storage не инициализируется
```bash
docker-compose logs -f storage
docker-compose restart storage functions
```

### Kong Gateway ошибки
```bash
docker-compose logs -f kong
docker-compose restart kong
```

---

## 💾 Backup & Restore

### Полный бэкап
```bash
# PostgreSQL
docker exec promo-music-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Volumes
docker run --rm -v promo-music_postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_$(date +%Y%m%d).tar.gz /data
  
docker run --rm -v promo-music_storage-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/storage_$(date +%Y%m%d).tar.gz /data
```

### Восстановление
```bash
# PostgreSQL
docker exec -i promo-music-db psql -U postgres postgres < backup.sql

# Volumes (нужно остановить контейнеры)
docker-compose down
docker run --rm -v promo-music_postgres-data:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/postgres_backup.tar.gz --strip 1"
docker-compose up -d
```

---

## 🎯 One-liners

```bash
# Быстрый перезапуск всего стека
docker-compose down && docker-compose up -d --build

# Очистка и свежий старт
docker-compose down -v && docker-compose up -d

# Логи последних 100 строк всех сервисов
docker-compose logs --tail=100

# Проверка всех health endpoints
for port in 8000 9000; do curl -s http://localhost:$port/health; done

# Удалить все остановленные контейнеры и unused образы
docker system prune -a

# Мониторинг ресурсов Promo.Music контейнеров
watch -n 1 'docker stats --no-stream | grep promo-music'
```

---

## 🔗 Полезные ссылки

- [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - Быстрый старт
- [README_DOCKER.md](./README_DOCKER.md) - Основное руководство
- [DOCKER_README.md](./DOCKER_README.md) - Полная документация
- [DOCKER_INDEX.md](./DOCKER_INDEX.md) - Навигация

---

**🎵 Promo.Music - Docker Cheat Sheet**  
**Версия:** 1.0.0  
**Дата:** 27 января 2026
