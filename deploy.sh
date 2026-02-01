#!/bin/bash

# 🚀 Скрипт деплоя Promo.Music
# Включает деплой Edge Functions и GitHub

echo "🎵 =========================================="
echo "🎵  PROMO.MUSIC - Деплой"
echo "🎵 =========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

# Меню выбора
echo -e "${BLUE}Выберите действие:${NC}"
echo "1. Деплой Edge Functions (Supabase)"
echo "2. Деплой в GitHub"
echo "3. Оба варианта"
echo ""
read -p "Ваш выбор (1/2/3): " choice

deploy_supabase() {
    echo ""
    echo -e "${BLUE}📦 Деплой Edge Functions в Supabase...${NC}"
    echo ""

    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  Токен Supabase не найден!${NC}"
        echo ""
        echo "1. Откройте: https://supabase.com/dashboard/account/tokens"
        echo "2. Нажмите 'Generate new token'"
        echo "3. Введите токен ниже:"
        echo ""
        read -p "Токен: " token
        export SUPABASE_ACCESS_TOKEN="$token"
    fi

    echo ""
    echo "Деплой make-server-84730125..."
    supabase functions deploy make-server-84730125 --project-ref qzpmiiqfwkcnrhvubdgt

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Edge Function задеплоена!${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  ВАЖНО: Установите STORAGE_MODE=sql${NC}"
        echo "   Откройте: https://supabase.com/dashboard/project/qzpmiiqfwkcnrhvubdgt/settings/functions"
        echo "   Secrets → Add new secret:"
        echo "   Name: STORAGE_MODE"
        echo "   Value: sql"
    else
        echo -e "${RED}❌ Ошибка деплоя Edge Function${NC}"
    fi
}

deploy_github() {
    echo ""
    echo -e "${BLUE}📦 Деплой в GitHub...${NC}"

    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git не установлен!${NC}"
        return 1
    fi

    if [ ! -d .git ]; then
        git init
    fi

    git add .
    git commit -m "🎵 Update: Promo.Music

- SQL режим для мигрированных данных
- 3633 артистов, 5750 треков, 389 видео"

    git branch -M main
    git push -u origin main --force

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Код загружен в GitHub!${NC}"
    else
        echo -e "${RED}❌ Ошибка push в GitHub${NC}"
    fi
}

case $choice in
    1)
        deploy_supabase
        ;;
    2)
        deploy_github
        ;;
    3)
        deploy_supabase
        deploy_github
        ;;
    *)
        echo -e "${RED}Неверный выбор${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Готово!${NC}"
