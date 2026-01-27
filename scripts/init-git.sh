#!/bin/bash

# 🔧 Initialize Git and push to GitHub
# Инициализация git репозитория и первый push

set -e

echo "🔧 Git Repository Setup"
echo "======================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json не найден! Запустите из корня проекта.${NC}"
    exit 1
fi

# Проверка git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git не установлен!${NC}"
    echo "Установите: https://git-scm.com/downloads"
    exit 1
fi

echo -e "${GREEN}✅ Git установлен${NC}"
echo ""

# Проверка .gitignore
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}⚠️  .gitignore не найден. Создаю...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel

# Supabase
.supabase/

# TypeScript
*.tsbuildinfo
EOF
    echo -e "${GREEN}✅ .gitignore создан${NC}"
fi

echo ""

# Инициализация git (если ещё не сделано)
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📦 Инициализация git...${NC}"
    git init
    echo -e "${GREEN}✅ Git инициализирован${NC}"
else
    echo -e "${GREEN}✅ Git уже инициализирован${NC}"
fi

echo ""

# Настройка git config (опционально)
read -p "Настроить git user.name и user.email? (y/n): " setup_git_config

if [ "$setup_git_config" == "y" ] || [ "$setup_git_config" == "Y" ]; then
    read -p "Введите ваше имя: " git_name
    read -p "Введите ваш email: " git_email
    
    git config user.name "$git_name"
    git config user.email "$git_email"
    
    echo -e "${GREEN}✅ Git config настроен${NC}"
fi

echo ""

# Добавление файлов
echo -e "${BLUE}📦 Добавление файлов в git...${NC}"
git add .

# Проверка что есть что коммитить
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
else
    # Создание коммита
    echo ""
    read -p "Введите сообщение коммита (Enter для 'Initial commit: PROMO.MUSIC'): " commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Initial commit: PROMO.MUSIC готов к деплою"
    fi
    
    git commit -m "$commit_message"
    echo -e "${GREEN}✅ Коммит создан${NC}"
fi

echo ""

# Настройка remote
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -n "$CURRENT_REMOTE" ]; then
    echo -e "${BLUE}📍 Текущий remote: $CURRENT_REMOTE${NC}"
    read -p "Изменить remote URL? (y/n): " change_remote
    
    if [ "$change_remote" == "y" ] || [ "$change_remote" == "Y" ]; then
        read -p "Введите GitHub repo URL (https://github.com/username/repo.git): " repo_url
        git remote set-url origin "$repo_url"
        echo -e "${GREEN}✅ Remote URL обновлён${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Remote 'origin' не настроен${NC}"
    echo ""
    echo "Создайте новый репозиторий на GitHub:"
    echo "  https://github.com/new"
    echo ""
    read -p "Введите GitHub repo URL (https://github.com/username/repo.git): " repo_url
    
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo -e "${GREEN}✅ Remote 'origin' добавлен${NC}"
    else
        echo -e "${YELLOW}⚠️  Remote не добавлен. Добавьте позже:${NC}"
        echo "  git remote add origin https://github.com/username/repo.git"
    fi
fi

echo ""

# Push в GitHub
if git remote get-url origin &> /dev/null; then
    echo -e "${BLUE}🚀 Готов к push в GitHub${NC}"
    read -p "Выполнить git push? (y/n): " do_push
    
    if [ "$do_push" == "y" ] || [ "$do_push" == "Y" ]; then
        # Проверяем текущую ветку
        CURRENT_BRANCH=$(git branch --show-current)
        
        if [ -z "$CURRENT_BRANCH" ]; then
            # Если ветка не определена, создаём main
            git branch -M main
            CURRENT_BRANCH="main"
        fi
        
        echo -e "${BLUE}📤 Pushing to $CURRENT_BRANCH...${NC}"
        
        if git push -u origin "$CURRENT_BRANCH"; then
            echo -e "${GREEN}✅ Push successful!${NC}"
        else
            echo -e "${RED}❌ Push failed!${NC}"
            echo ""
            echo "Возможные причины:"
            echo "  1. Репозиторий не существует на GitHub"
            echo "  2. Нет прав доступа"
            echo "  3. Необходима авторизация"
            echo ""
            echo "Попробуйте:"
            echo "  git push -u origin $CURRENT_BRANCH"
        fi
    else
        echo -e "${YELLOW}⏭️  Push пропущен${NC}"
        echo ""
        echo "Выполните позже:"
        echo "  git push -u origin $(git branch --show-current || echo 'main')"
    fi
else
    echo -e "${YELLOW}⚠️  Remote не настроен. Настройте и выполните push:${NC}"
    echo "  git remote add origin https://github.com/username/repo.git"
    echo "  git push -u origin main"
fi

echo ""
echo "================================"
echo ""
echo -e "${GREEN}🎉 Git setup complete!${NC}"
echo ""
echo "Следующие шаги:"
echo "  1. Убедитесь что код на GitHub"
echo "  2. Настройте GitHub Secrets: ./scripts/setup-secrets.sh"
echo "  3. Настройте Vercel проект"
echo "  4. При следующем push автоматически задеплоится!"
echo ""
