#!/bin/bash

# 🚀 Deploy Everything (Frontend + Backend)
# Полный деплой PROMO.MUSIC

set -e

echo "🚀 Full Deployment: PROMO.MUSIC"
echo "================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка что мы в корне проекта
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Запустите скрипт из корня проекта!${NC}"
    exit 1
fi

# Проверка environment variables
MISSING_VARS=0

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN не установлен${NC}"
    MISSING_VARS=1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN не установлен${NC}"
    MISSING_VARS=1
fi

if [ $MISSING_VARS -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Некоторые environment variables отсутствуют!${NC}"
    echo ""
    echo "Установите их:"
    echo "  export VERCEL_TOKEN=your-vercel-token"
    echo "  export SUPABASE_ACCESS_TOKEN=your-supabase-token"
    echo ""
    echo "Получить токены:"
    echo "  Vercel: https://vercel.com/account/tokens"
    echo "  Supabase: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

# Делаем скрипты исполняемыми
chmod +x scripts/deploy-frontend.sh
chmod +x scripts/deploy-backend.sh

# 1. Deploy Backend first
echo -e "${GREEN}[1/2] Deploying Backend to Supabase...${NC}"
echo ""

if ./scripts/deploy-backend.sh; then
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
else
    echo -e "${RED}❌ Backend deployment failed!${NC}"
    exit 1
fi

echo ""
echo "================================"
echo ""

# 2. Deploy Frontend
echo -e "${GREEN}[2/2] Deploying Frontend to Vercel...${NC}"
echo ""

# Проверяем флаг production
PROD_FLAG=""
if [ "$1" == "--production" ] || [ "$1" == "--prod" ]; then
    PROD_FLAG="--production"
fi

if ./scripts/deploy-frontend.sh $PROD_FLAG; then
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
else
    echo -e "${RED}❌ Frontend deployment failed!${NC}"
    exit 1
fi

echo ""
echo "================================"
echo ""
echo -e "${GREEN}🎉 FULL DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "✅ Backend: https://qzpmiiqfwkcnrhvubdgt.supabase.co/functions/v1/make-server-84730125"
echo "✅ Frontend: Check Vercel output above"
echo ""
echo "🔍 Verify everything is working:"
echo "  curl https://qzpmiiqfwkcnrhvubdgt.supabase.co/functions/v1/make-server-84730125/health"
echo ""
