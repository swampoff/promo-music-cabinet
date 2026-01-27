#!/bin/bash

# 🏥 Health Check для Promo.Music Docker Stack

echo "🏥 Promo.Music Docker - Health Check"
echo "====================================="
echo ""

# Определяем команду compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Функция для проверки HTTP endpoint
check_http() {
    local url=$1
    local name=$2
    
    if curl -s -f -o /dev/null "$url"; then
        echo "✅ $name: OK"
        return 0
    else
        echo "❌ $name: FAILED"
        return 1
    fi
}

# Функция для проверки контейнера
check_container() {
    local container=$1
    local name=$2
    
    if [ "$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null)" = "true" ]; then
        echo "✅ $name: Running"
        return 0
    else
        echo "❌ $name: Not Running"
        return 1
    fi
}

echo "📦 Проверка контейнеров..."
echo "-------------------------"
check_container "promo-music-db" "PostgreSQL"
check_container "promo-music-kong" "Kong Gateway"
check_container "promo-music-auth" "GoTrue Auth"
check_container "promo-music-rest" "PostgREST"
check_container "promo-music-storage" "Storage API"
check_container "promo-music-functions" "Edge Functions"
check_container "promo-music-realtime" "Realtime"
check_container "promo-music-studio" "Supabase Studio"

# Проверяем frontend только если запущен
if docker ps --format '{{.Names}}' | grep -q "promo-music-frontend"; then
    check_container "promo-music-frontend" "Frontend"
fi

echo ""
echo "🌐 Проверка HTTP endpoints..."
echo "----------------------------"
check_http "http://localhost:8000/health" "API Gateway Health"
check_http "http://localhost:9000/make-server-84730125/health" "Edge Functions Health"
check_http "http://localhost:3001/api/profile" "Supabase Studio"

# Проверяем frontend только если запущен
if docker ps --format '{{.Names}}' | grep -q "promo-music-frontend"; then
    check_http "http://localhost:5173" "Frontend"
else
    echo "ℹ️  Frontend: Not running in Docker (development mode?)"
fi

echo ""
echo "🗄️  Проверка PostgreSQL..."
echo "------------------------"
if docker exec promo-music-db pg_isready -U postgres -h localhost &> /dev/null; then
    echo "✅ PostgreSQL: Ready"
    
    # Проверяем таблицу kv_store
    if docker exec promo-music-db psql -U postgres -d postgres -c "SELECT 1 FROM kv_store_84730125 LIMIT 1;" &> /dev/null; then
        echo "✅ KV Store Table: Exists"
    else
        echo "⚠️  KV Store Table: Not Found (migrations not run?)"
    fi
else
    echo "❌ PostgreSQL: Not Ready"
fi

echo ""
echo "📊 Статус всех контейнеров:"
echo "-------------------------"
$COMPOSE_CMD ps

echo ""
echo "💾 Использование ресурсов:"
echo "------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps --format '{{.Names}}' | grep promo-music)

echo ""
echo "🎯 Итог:"
echo "------"
if check_http "http://localhost:8000/health" "Overall Status" &> /dev/null; then
    echo "✅ Система работает корректно!"
    echo ""
    echo "📍 Доступные URL:"
    echo "   • Frontend: http://localhost:5173"
    echo "   • Studio:   http://localhost:3001"
    echo "   • API:      http://localhost:8000"
    exit 0
else
    echo "❌ Обнаружены проблемы. Проверьте логи:"
    echo "   docker-compose logs -f"
    exit 1
fi
