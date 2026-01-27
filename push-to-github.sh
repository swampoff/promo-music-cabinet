#!/bin/bash

echo "🚀 Загрузка изменений в GitHub..."

# Добавляем все файлы
git add .

# Коммитим с сообщением
git commit -m "fix: vercel configuration and deployment files"

# Пушим в main
git push origin main

echo "✅ Изменения загружены!"
echo "🔄 Vercel автоматически начнет новый деплой"
echo "📱 Проверьте статус на https://vercel.com/dashboard"
