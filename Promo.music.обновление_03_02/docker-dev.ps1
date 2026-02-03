# 🔧 Development Mode - только backend, frontend запускается через npm run dev

Write-Host "🔧 Promo.Music - Development Mode" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Этот режим запускает только backend сервисы (Supabase)." -ForegroundColor Yellow
Write-Host "Frontend нужно запустить отдельно через: npm run dev" -ForegroundColor Yellow
Write-Host ""

# Определяем команду compose
try {
    docker-compose --version | Out-Null
    $composeCmd = "docker-compose"
} catch {
    try {
        docker compose version | Out-Null
        $composeCmd = "docker compose"
    } catch {
        Write-Host "❌ Docker Compose не найден" -ForegroundColor Red
        exit 1
    }
}

# Проверяем наличие .env
if (-not (Test-Path .env)) {
    Write-Host "📝 Создаю .env из .env.docker..." -ForegroundColor Yellow
    Copy-Item .env.docker .env
    Write-Host "✅ Файл .env создан" -ForegroundColor Green
} else {
    Write-Host "✅ Файл .env уже существует" -ForegroundColor Green
}

# Останавливаем существующие контейнеры
Write-Host ""
Write-Host "🛑 Останавливаю существующие контейнеры..." -ForegroundColor Yellow
& $composeCmd -f docker-compose.dev.yml down 2>$null

# Запускаем backend
Write-Host ""
Write-Host "🚀 Запускаю Supabase backend..." -ForegroundColor Cyan
Write-Host ""

& $composeCmd -f docker-compose.dev.yml up -d

Write-Host ""
Write-Host "⏳ Ожидаю инициализацию backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✅ Backend запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend сервисы:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🗄️  Supabase Studio:   http://localhost:3001" -ForegroundColor White
Write-Host "🔑 API Gateway:        http://localhost:8000" -ForegroundColor White
Write-Host "⚡ Edge Functions:     http://localhost:9000" -ForegroundColor White
Write-Host "📊 Database:           localhost:5432" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "🎨 Запуск Frontend:" -ForegroundColor Cyan
Write-Host "   1. Откройте новый терминал" -ForegroundColor White
Write-Host "   2. Выполните: npm install (если ещё не установлено)" -ForegroundColor White
Write-Host "   3. Выполните: npm run dev" -ForegroundColor White
Write-Host "   4. Откройте: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📝 Полезные команды:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose.dev.yml logs -f     # Логи backend"
Write-Host "   docker-compose -f docker-compose.dev.yml ps          # Статус"
Write-Host "   docker-compose -f docker-compose.dev.yml down        # Остановка"
Write-Host ""
