# 📋 Скрипт для просмотра логов Docker контейнеров (Windows PowerShell)

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

Write-Host "📋 Просмотр логов Promo.Music" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Доступные сервисы:" -ForegroundColor Yellow
Write-Host "  1) Все сервисы" -ForegroundColor White
Write-Host "  2) Frontend" -ForegroundColor White
Write-Host "  3) Edge Functions" -ForegroundColor White
Write-Host "  4) Postgres (Database)" -ForegroundColor White
Write-Host "  5) Kong (API Gateway)" -ForegroundColor White
Write-Host "  6) Auth (GoTrue)" -ForegroundColor White
Write-Host "  7) Storage" -ForegroundColor White
Write-Host "  8) Realtime" -ForegroundColor White
Write-Host "  9) Studio" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Выберите сервис (1-9)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📋 Логи всех сервисов (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f
    }
    "2" {
        Write-Host ""
        Write-Host "📋 Логи Frontend (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f frontend
    }
    "3" {
        Write-Host ""
        Write-Host "📋 Логи Edge Functions (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f functions
    }
    "4" {
        Write-Host ""
        Write-Host "📋 Логи Postgres (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f postgres
    }
    "5" {
        Write-Host ""
        Write-Host "📋 Логи Kong API Gateway (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f kong
    }
    "6" {
        Write-Host ""
        Write-Host "📋 Логи Auth (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f auth
    }
    "7" {
        Write-Host ""
        Write-Host "📋 Логи Storage (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f storage
    }
    "8" {
        Write-Host ""
        Write-Host "📋 Логи Realtime (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f realtime
    }
    "9" {
        Write-Host ""
        Write-Host "📋 Логи Studio (Ctrl+C для выхода):" -ForegroundColor Green
        & $composeCmd logs -f studio
    }
    default {
        Write-Host "❌ Неверный выбор. Используйте числа от 1 до 9" -ForegroundColor Red
        exit 1
    }
}
