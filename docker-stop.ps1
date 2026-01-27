# 🛑 Скрипт для остановки Promo.Music Docker контейнеров (Windows PowerShell)

Write-Host "🛑 Останавливаю Promo.Music Docker контейнеры..." -ForegroundColor Yellow
Write-Host ""

# Определяем команду docker compose
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

# Выбор режима остановки
Write-Host "Выберите режим остановки:" -ForegroundColor Cyan
Write-Host "1) Остановить контейнеры (данные сохраняются)" -ForegroundColor White
Write-Host "2) Остановить контейнеры + удалить volumes (полная очистка)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Ваш выбор (1 или 2)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🛑 Останавливаю контейнеры..." -ForegroundColor Yellow
        & $composeCmd down
        Write-Host "✅ Контейнеры остановлены (данные сохранены)" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "🗑️  Останавливаю контейнеры и удаляю volumes..." -ForegroundColor Yellow
        & $composeCmd down -v
        Write-Host "✅ Контейнеры остановлены и данные удалены" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Неверный выбор. Используйте 1 или 2" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📊 Статус контейнеров:" -ForegroundColor Cyan
& $composeCmd ps
Write-Host ""
Write-Host "💡 Для повторного запуска используйте: .\docker-start.ps1" -ForegroundColor Yellow
Write-Host ""
