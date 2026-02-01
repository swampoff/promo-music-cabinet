Write-Host "🚀 Загрузка изменений в GitHub..." -ForegroundColor Cyan

# Добавляем все файлы
git add .

# Коммитим с сообщением
git commit -m "fix: vercel configuration and deployment files"

# Пушим в main
git push origin main

Write-Host "✅ Изменения загружены!" -ForegroundColor Green
Write-Host "🔄 Vercel автоматически начнет новый деплой" -ForegroundColor Yellow
Write-Host "📱 Проверьте статус на https://vercel.com/dashboard" -ForegroundColor Cyan
