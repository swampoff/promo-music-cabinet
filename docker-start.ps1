# 🐳 Скрипт для запуска Promo.Music в Docker (Windows PowerShell)
# Полный локальный стек: Frontend + Supabase (DB, Auth, Storage, Functions)

Write-Host "🎵 Promo.Music - Local Docker Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Проверяем наличие Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Проверяем наличие Docker Compose
try {
    docker-compose --version | Out-Null
    $composeCmd = "docker-compose"
} catch {
    try {
        docker compose version | Out-Null
        $composeCmd = "docker compose"
    } catch {
        Write-Host "❌ Docker Compose не установлен" -ForegroundColor Red
        exit 1
    }
}

# Создаём .env если его нет
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
& $composeCmd down 2>$null

# Очистка volumes (опционально - раскомментируйте если нужно)
# Write-Host "🗑️  Очищаю volumes..." -ForegroundColor Yellow
# & $composeCmd down -v

# Собираем и запускаем контейнеры
Write-Host ""
Write-Host "🚀 Запускаю Docker контейнеры..." -ForegroundColor Cyan
Write-Host ""

& $composeCmd up -d --build

Write-Host ""
Write-Host "⏳ Ожидаю инициализацию сервисов..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✅ Promo.Music запущен!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Доступные сервисы:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🎨 Frontend:           http://localhost:5173" -ForegroundColor White
Write-Host "🗄️  Supabase Studio:   http://localhost:3001" -ForegroundColor White
Write-Host "🔑 API Gateway:        http://localhost:8000" -ForegroundColor White
Write-Host "⚡ Edge Functions:     http://localhost:9000" -ForegroundColor White
Write-Host "📊 Database:           localhost:5432" -ForegroundColor White
Write-Host "🔐 Auth:               http://localhost:9999" -ForegroundColor White
Write-Host "📦 Storage:            http://localhost:5000" -ForegroundColor White
Write-Host "🔄 Realtime:           http://localhost:4000" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Учётные данные по умолчанию:" -ForegroundColor Cyan
Write-Host "   Postgres: postgres / your-super-secret-and-long-postgres-password"
Write-Host "   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Write-Host ""
Write-Host "📝 Полезные команды:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f              # Просмотр всех логов"
Write-Host "   docker-compose logs -f frontend     # Логи фронтенда"
Write-Host "   docker-compose logs -f functions    # Логи Edge Functions"
Write-Host "   docker-compose logs -f postgres     # Логи базы данных"
Write-Host "   docker-compose ps                   # Статус контейнеров"
Write-Host "   docker-compose down                 # Остановка всех сервисов"
Write-Host "   docker-compose down -v              # Остановка + удаление данных"
Write-Host ""
Write-Host "🎯 Следующие шаги:" -ForegroundColor Cyan
Write-Host "   1. Откройте http://localhost:5173 для доступа к приложению"
Write-Host "   2. Откройте http://localhost:3001 для Supabase Studio"
Write-Host "   3. Проверьте логи: docker-compose logs -f"
Write-Host ""
Write-Host "💡 Для остановки: docker-compose down" -ForegroundColor Yellow
Write-Host ""
