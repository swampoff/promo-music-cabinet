#!/bin/bash

# 🚀 Deploy Frontend to Vercel
# Этот скрипт деплоит frontend на Vercel

set -e

echo "🚀 Deploying PROMO.MUSIC Frontend to Vercel..."
echo ""

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен!"
    echo "📦 Установка Vercel CLI..."
    npm install -g vercel
fi

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден! Запустите скрипт из корня проекта."
    exit 1
fi

# Проверка environment variables
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN не установлен!"
    echo "💡 Получите токен на: https://vercel.com/account/tokens"
    echo "💡 Затем установите: export VERCEL_TOKEN=your-token"
    exit 1
fi

# Build проекта
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy на Vercel
echo "🚀 Deploying to Vercel..."

if [ "$1" == "--production" ] || [ "$1" == "--prod" ]; then
    # Production deployment
    echo "🏭 Production deployment..."
    DEPLOYMENT_URL=$(vercel --prod --token=$VERCEL_TOKEN --yes)
else
    # Preview deployment
    echo "👀 Preview deployment..."
    DEPLOYMENT_URL=$(vercel --token=$VERCEL_TOKEN --yes)
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 URL: $DEPLOYMENT_URL"
    echo ""
    
    # Проверка деплоя
    echo "🔍 Verifying deployment..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Site is accessible!"
    else
        echo "⚠️  Site returned HTTP $HTTP_CODE"
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Frontend deployment complete!"
