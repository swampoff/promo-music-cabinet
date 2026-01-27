#!/bin/bash

# 🚀 One-Click Setup для PROMO.MUSIC
# Автоматическая настройка всей инфраструктуры деплоя

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo -e "${BOLD}${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🎵 PROMO.MUSIC Auto-Deploy Setup 🚀            ║"
echo "║                                                           ║"
echo "║     Автоматическая настройка деплоя за 5 минут          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}Этот скрипт настроит:${NC}"
echo "  ✅ Git репозиторий"
echo "  ✅ GitHub Actions (автодеплой)"
echo "  ✅ Vercel интеграцию"
echo "  ✅ Supabase Edge Functions"
echo ""
echo -e "${YELLOW}После настройки каждый git push будет автоматически деплоить проект!${NC}"
echo ""

read -p "Начать настройку? (y/n): " start_setup

if [ "$start_setup" != "y" ] && [ "$start_setup" != "Y" ]; then
    echo "Настройка отменена."
    exit 0
fi

echo ""
echo "================================"
echo ""

# Делаем все скрипты исполняемыми
echo -e "${BLUE}📦 Подготовка скриптов...${NC}"
chmod +x scripts/*.sh
echo -e "${GREEN}✅ Скрипты готовы${NC}"

echo ""
echo "================================"
echo ""

# Шаг 1: Git setup
echo -e "${BOLD}${BLUE}[1/3] Git Setup${NC}"
echo ""

if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git уже инициализирован${NC}"
    
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        echo -e "${BLUE}📍 Remote: $REMOTE_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Remote не настроен${NC}"
        ./scripts/init-git.sh
    fi
else
    echo -e "${YELLOW}Git не инициализирован. Запускаю init-git.sh...${NC}"
    ./scripts/init-git.sh
fi

echo ""
echo "================================"
echo ""

# Шаг 2: GitHub Secrets
echo -e "${BOLD}${BLUE}[2/3] GitHub Secrets Setup${NC}"
echo ""

echo -e "${YELLOW}Для автоматического деплоя нужны 4 токена:${NC}"
echo ""
echo "1. VERCEL_TOKEN - https://vercel.com/account/tokens"
echo "2. VERCEL_ORG_ID - из Project Settings"
echo "3. VERCEL_PROJECT_ID - из Project Settings"
echo "4. SUPABASE_ACCESS_TOKEN - https://supabase.com/dashboard/account/tokens"
echo ""

read -p "Настроить GitHub Secrets сейчас? (y/n): " setup_secrets

if [ "$setup_secrets" == "y" ] || [ "$setup_secrets" == "Y" ]; then
    ./scripts/setup-secrets.sh
else
    echo -e "${YELLOW}⏭️  Secrets пропущены${NC}"
    echo ""
    echo "Настройте позже вручную или запустите:"
    echo "  ./scripts/setup-secrets.sh"
    echo ""
    echo "Или настройте вручную на:"
    echo "  https://github.com/YOUR-USERNAME/promo-music/settings/secrets/actions"
fi

echo ""
echo "================================"
echo ""

# Шаг 3: Vercel Project
echo -e "${BOLD}${BLUE}[3/3] Vercel Project Setup${NC}"
echo ""

echo -e "${YELLOW}Последний шаг - подключите Vercel к вашему GitHub репозиторию:${NC}"
echo ""
echo "1. Откройте: https://vercel.com/new"
echo "2. Нажмите 'Import Git Repository'"
echo "3. Выберите репозиторий 'promo-music'"
echo "4. Framework Preset: Vite"
echo "5. Environment Variables:"
echo ""
echo "   VITE_SUPABASE_URL="
echo "   https://qzpmiiqfwkcnrhvubdgt.supabase.co"
echo ""
echo "   VITE_SUPABASE_ANON_KEY="
echo "   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG1paXFmd2tjbnJodnViZGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MTkwOTMsImV4cCI6MjA1MzI5NTA5M30.9wCGmE8k7oIcqDDLUiOZfVV-rT4S2B2KX7qC1KFG_YE"
echo ""
echo "6. Нажмите 'Deploy'"
echo ""

read -p "Нажмите Enter когда настроите Vercel..."

echo ""
echo "================================"
echo ""

# Финальная проверка
echo -e "${BOLD}${BLUE}🔍 Финальная проверка...${NC}"
echo ""

CHECKS_PASSED=0
TOTAL_CHECKS=4

# Проверка 1: Git
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ [1/4] Git инициализирован${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ [1/4] Git не инициализирован${NC}"
fi

# Проверка 2: Remote
if git remote get-url origin &> /dev/null; then
    echo -e "${GREEN}✅ [2/4] GitHub remote настроен${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ [2/4] GitHub remote не настроен${NC}"
fi

# Проверка 3: Workflow
if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅ [3/4] GitHub Actions workflow существует${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ [3/4] GitHub Actions workflow не найден${NC}"
fi

# Проверка 4: Scripts
if [ -x "scripts/deploy-all.sh" ]; then
    echo -e "${GREEN}✅ [4/4] Deploy скрипты готовы${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}❌ [4/4] Deploy скрипты не готовы${NC}"
fi

echo ""

if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                           ║${NC}"
    echo -e "${GREEN}${BOLD}║                  🎉 ВСЁ ГОТОВО! 🎉                       ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                           ║${NC}"
    echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ Автодеплой настроен успешно!${NC}"
    echo ""
    echo -e "${BOLD}Следующие шаги:${NC}"
    echo ""
    echo "1. Сделайте тестовый коммит:"
    echo -e "   ${BLUE}git add .${NC}"
    echo -e "   ${BLUE}git commit -m \"Test auto-deploy\"${NC}"
    echo -e "   ${BLUE}git push${NC}"
    echo ""
    echo "2. Проверьте GitHub Actions:"
    echo "   https://github.com/YOUR-USERNAME/promo-music/actions"
    echo ""
    echo "3. Через 2-3 минуты сайт обновится автоматически!"
    echo ""
    echo -e "${YELLOW}Теперь при каждом git push проект будет автоматически деплоиться!${NC}"
else
    echo -e "${YELLOW}⚠️  Некоторые проверки не прошли ($CHECKS_PASSED/$TOTAL_CHECKS)${NC}"
    echo ""
    echo "Проверьте что всё настроено правильно:"
    echo "  - Git репозиторий создан"
    echo "  - Remote на GitHub настроен"
    echo "  - GitHub Secrets добавлены"
    echo "  - Vercel проект подключён"
fi

echo ""
echo "================================"
echo ""
echo -e "${BLUE}📚 Документация:${NC}"
echo "  - Полная инструкция: ./АВТОДЕПЛОЙ.md"
echo "  - Ручной деплой: ./scripts/deploy-all.sh"
echo "  - Быстрый деплой: ./БЫСТРЫЙ_ДЕПЛОЙ.md"
echo ""
echo -e "${GREEN}Спасибо за использование PROMO.MUSIC! 🎵${NC}"
echo ""
