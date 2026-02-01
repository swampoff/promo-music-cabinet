#!/bin/bash

# 🔧 Development Mode - только backend, frontend запускается через npm run dev

set -e

echo "🔧 Promo.Music - Development Mode"
echo "===================================="
echo ""
echo "Этот режим запускает только backend сервисы (Supabase)."
echo "Frontend нужно запустить отдельно через: npm run dev"
echo ""

# Проверяем наличие .env
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
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Запускаем backend
echo ""
echo "🚀 Запускаю Supabase backend..."
echo ""

if docker compose version &> /dev/null; then
    docker compose -f docker-compose.dev.yml up -d
else
    docker-compose -f docker-compose.dev.yml up -d
fi

echo ""
echo "⏳ Ожидаю инициализацию backend..."
sleep 10

echo ""
echo "✅ Backend запущен!"
echo ""
echo "📍 Backend сервисы:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  Supabase Studio:   http://localhost:3001"
echo "🔑 API Gateway:        http://localhost:8000"
echo "⚡ Edge Functions:     http://localhost:9000"
echo "📊 Database:           localhost:5432"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎨 Запуск Frontend:"
echo "   1. Откройте новый терминал"
echo "   2. Выполните: npm install (если ещё не установлено)"
echo "   3. Выполните: npm run dev"
echo "   4. Откройте: http://localhost:5173"
echo ""
echo "📝 Полезные команды:"
echo "   docker-compose -f docker-compose.dev.yml logs -f     # Логи backend"
echo "   docker-compose -f docker-compose.dev.yml ps          # Статус"
echo "   docker-compose -f docker-compose.dev.yml down        # Остановка"
echo ""
