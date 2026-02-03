#!/bin/bash

# 🐳 Скрипт для запуска Promo.Music в Docker
# Полный локальный стек: Frontend + Supabase (DB, Auth, Storage, Functions)

set -e

echo "🎵 Promo.Music - Local Docker Setup"
echo "===================================="

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

# Создаём .env если его нет
if [ ! -f .env ]; then
    echo "📝 Создаю .env из .env.docker..."
    cp .env.docker .env
    echo "✅ Файл .env создан"
else
    echo "✅ Файл .env уже существует"
fi

# Останавливаем существующие контейнеры
echo ""
echo "🛑 Останавливаю существующие контейнеры..."
docker-compose down 2>/dev/null || true

# Очистка volumes (опционально - раскомментируйте если нужно)
# echo "🗑️  Очищаю volumes..."
# docker-compose down -v

# Собираем и запускаем контейнеры
echo ""
echo "🚀 Запускаю Docker контейнеры..."
echo ""

# Используем docker compose (новая версия) или docker-compose (старая версия)
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

echo ""
echo "⏳ Ожидаю инициализацию сервисов..."
sleep 10

echo ""
echo "✅ Promo.Music запущен!"
echo ""
echo "📍 Доступные сервисы:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 Frontend:           http://localhost:5173"
echo "🗄️  Supabase Studio:   http://localhost:3001"
echo "🔑 API Gateway:        http://localhost:8000"
echo "⚡ Edge Functions:     http://localhost:9000"
echo "📊 Database:           localhost:5432"
echo "🔐 Auth:               http://localhost:9999"
echo "📦 Storage:            http://localhost:5000"
echo "🔄 Realtime:           http://localhost:4000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Учётные данные по умолчанию:"
echo "   Postgres: postgres / your-super-secret-and-long-postgres-password"
echo "   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo ""
echo "📝 Полезные команды:"
echo "   docker-compose logs -f              # Просмотр всех логов"
echo "   docker-compose logs -f frontend     # Логи фронтенда"
echo "   docker-compose logs -f functions    # Логи Edge Functions"
echo "   docker-compose logs -f postgres     # Логи базы данных"
echo "   docker-compose ps                   # Статус контейнеров"
echo "   docker-compose down                 # Остановка всех сервисов"
echo "   docker-compose down -v              # Остановка + удаление данных"
echo ""
echo "🎯 Следующие шаги:"
echo "   1. Откройте http://localhost:5173 для доступа к приложению"
echo "   2. Откройте http://localhost:3001 для Supabase Studio"
echo "   3. Проверьте логи: docker-compose logs -f"
echo ""
echo "💡 Для остановки: docker-compose down"
echo ""
