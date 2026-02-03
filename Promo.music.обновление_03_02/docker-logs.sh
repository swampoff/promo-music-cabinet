#!/bin/bash

# 📋 Скрипт для просмотра логов Docker контейнеров

set -e

# Используем docker compose (новая версия) или docker-compose (старая версия)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📋 Просмотр логов Promo.Music"
echo "=============================="
echo ""
echo "Доступные сервисы:"
echo "  1) Все сервисы"
echo "  2) Frontend"
echo "  3) Edge Functions"
echo "  4) Postgres (Database)"
echo "  5) Kong (API Gateway)"
echo "  6) Auth (GoTrue)"
echo "  7) Storage"
echo "  8) Realtime"
echo "  9) Studio"
echo ""
read -p "Выберите сервис (1-9): " choice

case $choice in
    1)
        echo ""
        echo "📋 Логи всех сервисов (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f
        ;;
    2)
        echo ""
        echo "📋 Логи Frontend (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f frontend
        ;;
    3)
        echo ""
        echo "📋 Логи Edge Functions (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f functions
        ;;
    4)
        echo ""
        echo "📋 Логи Postgres (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f postgres
        ;;
    5)
        echo ""
        echo "📋 Логи Kong API Gateway (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f kong
        ;;
    6)
        echo ""
        echo "📋 Логи Auth (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f auth
        ;;
    7)
        echo ""
        echo "📋 Логи Storage (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f storage
        ;;
    8)
        echo ""
        echo "📋 Логи Realtime (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f realtime
        ;;
    9)
        echo ""
        echo "📋 Логи Studio (Ctrl+C для выхода):"
        $COMPOSE_CMD logs -f studio
        ;;
    *)
        echo "❌ Неверный выбор. Используйте числа от 1 до 9"
        exit 1
        ;;
esac
