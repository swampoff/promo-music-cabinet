#!/bin/bash

# 🚀 Deploy Backend to Supabase
# Этот скрипт деплоит Edge Functions на Supabase

set -e

echo "🚀 Deploying PROMO.MUSIC Backend to Supabase..."
echo ""

# Проверка Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI не установлен!"
    echo "📦 Установка Supabase CLI..."
    
    # Определяем OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install supabase/tap/supabase
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://cli.supabase.com/install.sh | sh
    else
        echo "❌ Неподдерживаемая ОС. Установите Supabase CLI вручную:"
        echo "https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

# Проверка что мы в правильной директории
if [ ! -d "supabase/functions" ]; then
    echo "❌ supabase/functions не найден! Запустите скрипт из корня проекта."
    exit 1
fi

# Проверка environment variables
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "⚠️  SUPABASE_ACCESS_TOKEN не установлен!"
    echo "💡 Получите токен на: https://supabase.com/dashboard/account/tokens"
    echo "💡 Затем установите: export SUPABASE_ACCESS_TOKEN=your-token"
    exit 1
fi

# Supabase Project ID
PROJECT_ID="qzpmiiqfwkcnrhvubdgt"

# Login to Supabase
echo "🔐 Logging in to Supabase..."
supabase login

# Link project
echo "🔗 Linking to project $PROJECT_ID..."
supabase link --project-ref $PROJECT_ID

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."
echo ""

supabase functions deploy make-server-84730125 --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Edge Functions deployed successfully!"
    echo ""
    
    # Verify deployment
    echo "🔍 Verifying deployment..."
    HEALTH_URL="https://$PROJECT_ID.supabase.co/functions/v1/make-server-84730125/health"
    
    sleep 2  # Ждём пока функция станет доступна
    
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
    
    if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
        echo "✅ Backend is healthy!"
        echo "📊 Response: $HEALTH_RESPONSE"
    else
        echo "⚠️  Health check returned unexpected response:"
        echo "$HEALTH_RESPONSE"
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Backend deployment complete!"
echo ""
echo "📍 Edge Function URL:"
echo "https://$PROJECT_ID.supabase.co/functions/v1/make-server-84730125"
