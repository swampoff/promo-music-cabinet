#!/bin/bash

# 🔐 Setup GitHub Secrets для автоматического деплоя
# Этот скрипт помогает настроить secrets в GitHub репозитории

echo "🔐 Setup GitHub Secrets for Auto-Deploy"
echo "========================================"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Этот скрипт поможет вам настроить GitHub Secrets для автоматического деплоя.${NC}"
echo ""

# Проверка GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI не установлен.${NC}"
    echo ""
    echo "Вы можете:"
    echo "  1. Установить GitHub CLI: https://cli.github.com/"
    echo "  2. Или настроить secrets вручную в GitHub UI"
    echo ""
    echo "Для ручной настройки:"
    echo "  1. Откройте: https://github.com/YOUR-USERNAME/promo-music/settings/secrets/actions"
    echo "  2. Нажмите 'New repository secret'"
    echo "  3. Добавьте следующие secrets:"
    echo ""
    echo "Required secrets:"
    echo "  - VERCEL_TOKEN"
    echo "  - VERCEL_ORG_ID"
    echo "  - VERCEL_PROJECT_ID"
    echo "  - SUPABASE_ACCESS_TOKEN"
    echo ""
    exit 0
fi

echo -e "${GREEN}✅ GitHub CLI установлен${NC}"
echo ""

# Проверка авторизации
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 Необходима авторизация в GitHub...${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ Авторизован в GitHub${NC}"
echo ""

# Получаем информацию о репозитории
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

if [ -z "$REPO" ]; then
    echo -e "${YELLOW}⚠️  Не удалось определить репозиторий.${NC}"
    echo "Убедитесь что вы находитесь в директории git репозитория."
    exit 1
fi

echo -e "${BLUE}📦 Репозиторий: $REPO${NC}"
echo ""

# Функция для добавления secret
add_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_url=$3
    
    echo -e "${YELLOW}🔑 Настройка: $secret_name${NC}"
    echo "   $secret_description"
    
    if [ -n "$secret_url" ]; then
        echo "   Получить: $secret_url"
    fi
    
    echo ""
    read -p "   Введите значение (или 'skip' чтобы пропустить): " secret_value
    
    if [ "$secret_value" == "skip" ] || [ -z "$secret_value" ]; then
        echo -e "${YELLOW}   ⏭️  Пропущено${NC}"
        return 1
    fi
    
    if gh secret set "$secret_name" --body "$secret_value" --repo "$REPO"; then
        echo -e "${GREEN}   ✅ $secret_name установлен${NC}"
        return 0
    else
        echo -e "${RED}   ❌ Ошибка при установке $secret_name${NC}"
        return 1
    fi
    
    echo ""
}

# Настройка всех secrets
echo -e "${BLUE}Настройка Vercel Secrets:${NC}"
echo ""

add_secret "VERCEL_TOKEN" \
    "Vercel Access Token для деплоя" \
    "https://vercel.com/account/tokens"

echo ""

add_secret "VERCEL_ORG_ID" \
    "Vercel Organization ID (найдите в Project Settings)" \
    "https://vercel.com/[your-username]/[project]/settings"

echo ""

add_secret "VERCEL_PROJECT_ID" \
    "Vercel Project ID (найдите в Project Settings)" \
    "https://vercel.com/[your-username]/[project]/settings"

echo ""
echo -e "${BLUE}Настройка Supabase Secrets:${NC}"
echo ""

add_secret "SUPABASE_ACCESS_TOKEN" \
    "Supabase Access Token для деплоя Edge Functions" \
    "https://supabase.com/dashboard/account/tokens"

echo ""
echo "================================"
echo ""
echo -e "${GREEN}🎉 Настройка secrets завершена!${NC}"
echo ""
echo "Проверьте установленные secrets:"
echo "  https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "Теперь при каждом git push в main/master будет автоматический деплой!"
echo ""
