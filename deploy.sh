#!/bin/bash

# 🚀 Скрипт автоматического деплоя Promo.Music
# Автор: AI Assistant
# Дата: 2026-01-25

echo "🎵 =========================================="
echo "🎵  PROMO.MUSIC - Автоматический Деплой"
echo "🎵 =========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка наличия Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git не установлен! Установите Git: https://git-scm.com/${NC}"
    exit 1
fi

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не установлен! Установите Node.js: https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Шаг 1/6: Создание .env файла...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  ВАЖНО: Отредактируйте .env файл и добавьте ваши Supabase credentials!${NC}"
    echo -e "${YELLOW}   Откройте .env в текстовом редакторе и замените значения.${NC}"
    read -p "Нажмите Enter когда закончите редактирование .env..."
else
    echo -e "${GREEN}✓ .env файл уже существует${NC}"
fi

echo ""
echo -e "${BLUE}📦 Шаг 2/6: Инициализация Git репозитория...${NC}"
if [ ! -d .git ]; then
    git init
    echo -e "${GREEN}✓ Git репозиторий инициализирован${NC}"
else
    echo -e "${GREEN}✓ Git репозиторий уже существует${NC}"
fi

echo ""
echo -e "${BLUE}📦 Шаг 3/6: Добавление remote origin...${NC}"
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote origin уже существует${NC}"
    git remote set-url origin https://github.com/swampoff/promofm.git
    echo -e "${GREEN}✓ Remote URL обновлен${NC}"
else
    git remote add origin https://github.com/swampoff/promofm.git
    echo -e "${GREEN}✓ Remote origin добавлен${NC}"
fi

echo ""
echo -e "${BLUE}📦 Шаг 4/6: Добавление файлов в Git...${NC}"
git add .
echo -e "${GREEN}✓ Все файлы добавлены${NC}"

echo ""
echo -e "${BLUE}📦 Шаг 5/6: Создание коммита...${NC}"
git commit -m "🎵 Initial commit: Promo.Music - Artist Cabinet

- ✨ Glassmorphism дизайн с темной темой
- 📊 Система аналитики прослушиваний
- 💰 Система донатов и коинов
- 🎧 Управление треками и видео
- 🎤 Управление концертами и новостями  
- 🚀 Готов к деплою на Vercel + Supabase
- 📱 Полностью адаптивный дизайн

Stack: React 18 + TypeScript + Vite + Tailwind v4 + Motion + Supabase"

echo -e "${GREEN}✓ Коммит создан${NC}"

echo ""
echo -e "${BLUE}📦 Шаг 6/6: Отправка в GitHub...${NC}"
git branch -M main
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "🎉 УСПЕШНО! Код загружен в GitHub!"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${BLUE}📝 Следующие шаги:${NC}"
    echo ""
    echo -e "${YELLOW}1. Откройте https://vercel.com/new${NC}"
    echo -e "${YELLOW}2. Выберите репозиторий: swampoff/promofm${NC}"
    echo -e "${YELLOW}3. Добавьте Environment Variables:${NC}"
    echo -e "   - VITE_SUPABASE_URL"
    echo -e "   - VITE_SUPABASE_ANON_KEY"
    echo -e "${YELLOW}4. Нажмите Deploy${NC}"
    echo ""
    echo -e "${BLUE}📚 Полная документация: GITHUB_DEPLOY_INSTRUCTIONS.md${NC}"
    echo ""
else
    echo -e "${RED}❌ Ошибка при push в GitHub!${NC}"
    echo -e "${YELLOW}Возможные причины:${NC}"
    echo -e "1. Нет доступа к репозиторию"
    echo -e "2. Неверный URL репозитория"
    echo -e "3. Не настроен SSH ключ или токен"
    echo ""
    echo -e "${BLUE}Попробуйте:${NC}"
    echo -e "git push -u origin main --force"
    exit 1
fi
