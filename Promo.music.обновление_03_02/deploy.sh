#!/bin/bash

# ========================================
# QUICK DEPLOY SCRIPT для Promo.Music
# ========================================

echo "🚀 Начинаю деплой Promo.Music на Supabase..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка установки Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI не установлен!${NC}"
    echo "Установите: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI установлен${NC}"

# Шаг 1: Проверка подключения
echo -e "\n${YELLOW}📡 Проверяю подключение к проекту...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в Supabase${NC}"
    echo "Выполните: supabase login"
    exit 1
fi

echo -e "${GREEN}✅ Подключение установлено${NC}"

# Шаг 2: Деплой SQL миграций
echo -e "\n${YELLOW}💾 Деплою SQL миграции...${NC}"
if supabase db push; then
    echo -e "${GREEN}✅ SQL миграции задеплоены${NC}"
else
    echo -e "${RED}❌ Ошибка деплоя SQL миграций${NC}"
    echo "Проверьте файлы в /supabase/migrations/"
    exit 1
fi

# Шаг 3: Установка секретов (если еще не установлены)
echo -e "\n${YELLOW}🔐 Проверяю переменные окружения...${NC}"

# Получаем список существующих секретов
EXISTING_SECRETS=$(supabase secrets list 2>&1)

if echo "$EXISTING_SECRETS" | grep -q "SUPABASE_URL"; then
    echo -e "${GREEN}✅ Секреты уже установлены${NC}"
else
    echo -e "${YELLOW}⚠️  Секреты не установлены. Установите вручную:${NC}"
    echo "supabase secrets set SUPABASE_URL=\"https://YOUR_PROJECT_ID.supabase.co\""
    echo "supabase secrets set SUPABASE_ANON_KEY=\"YOUR_ANON_KEY\""
    echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"YOUR_SERVICE_ROLE_KEY\""
fi

# Шаг 4: Деплой Edge Functions
echo -e "\n${YELLOW}⚡ Деплою Edge Functions...${NC}"
if supabase functions deploy make-server-84730125 --no-verify-jwt; then
    echo -e "${GREEN}✅ Edge Functions задеплоены${NC}"
else
    echo -e "${RED}❌ Ошибка деплоя Edge Functions${NC}"
    echo "Проверьте код в /supabase/functions/server/"
    exit 1
fi

# Шаг 5: Проверка работы
echo -e "\n${YELLOW}🔍 Проверяю работу API...${NC}"

# Получаем Project ID
PROJECT_ID=$(supabase projects list --format json | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  Не могу автоматически определить Project ID${NC}"
    echo "Проверьте вручную: https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84730125/health"
else
    HEALTH_URL="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84730125/health"
    
    # Даём время на запуск (5 секунд)
    sleep 5
    
    if curl -s "$HEALTH_URL" | grep -q "ok"; then
        echo -e "${GREEN}✅ API работает!${NC}"
        echo "URL: $HEALTH_URL"
    else
        echo -e "${YELLOW}⚠️  API не отвечает. Проверьте логи:${NC}"
        echo "supabase functions logs make-server-84730125"
    fi
fi

# Шаг 6: Вывод итоговой информации
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 ДЕПЛОЙ ЗАВЕРШЁН!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}📋 Что делать дальше:${NC}"
echo "1. Обновите /utils/supabase/info.tsx с вашими ключами"
echo "2. Проверьте таблицы в Supabase Dashboard -> Database"
echo "3. Проверьте Storage бакеты в Dashboard -> Storage"
echo "4. Посмотрите логи: supabase functions logs make-server-84730125"

echo -e "\n${YELLOW}🔗 Полезные команды:${NC}"
echo "• Логи в реальном времени: supabase functions logs make-server-84730125 --tail"
echo "• Список секретов: supabase secrets list"
echo "• Список функций: supabase functions list"
echo "• SQL Editor: Supabase Dashboard -> SQL Editor"

echo -e "\n${GREEN}Готово! 🚀${NC}\n"
