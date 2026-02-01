# 🏥 Health Check для Promo.Music Docker Stack (Windows PowerShell)

Write-Host "🏥 Promo.Music Docker - Health Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
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

# Функция проверки HTTP
function Check-Http {
    param($url, $name)
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $name`: OK" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ $name`: FAILED" -ForegroundColor Red
        return $false
    }
}

# Функция проверки контейнера
function Check-Container {
    param($container, $name)
    
    try {
        $running = docker inspect -f '{{.State.Running}}' $container 2>$null
        if ($running -eq "true") {
            Write-Host "✅ $name`: Running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $name`: Not Running" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $name`: Not Found" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 Проверка контейнеров..." -ForegroundColor Yellow
Write-Host "-------------------------"
Check-Container "promo-music-db" "PostgreSQL"
Check-Container "promo-music-kong" "Kong Gateway"
Check-Container "promo-music-auth" "GoTrue Auth"
Check-Container "promo-music-rest" "PostgREST"
Check-Container "promo-music-storage" "Storage API"
Check-Container "promo-music-functions" "Edge Functions"
Check-Container "promo-music-realtime" "Realtime"
Check-Container "promo-music-studio" "Supabase Studio"

# Проверяем frontend только если запущен
$frontendRunning = docker ps --format '{{.Names}}' | Select-String "promo-music-frontend"
if ($frontendRunning) {
    Check-Container "promo-music-frontend" "Frontend"
}

Write-Host ""
Write-Host "🌐 Проверка HTTP endpoints..." -ForegroundColor Yellow
Write-Host "----------------------------"
Check-Http "http://localhost:8000/health" "API Gateway Health"
Check-Http "http://localhost:9000/make-server-84730125/health" "Edge Functions Health"
Check-Http "http://localhost:3001/api/profile" "Supabase Studio"

# Проверяем frontend только если запущен
if ($frontendRunning) {
    Check-Http "http://localhost:5173" "Frontend"
} else {
    Write-Host "ℹ️  Frontend: Not running in Docker (development mode?)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🗄️  Проверка PostgreSQL..." -ForegroundColor Yellow
Write-Host "------------------------"
try {
    $pgReady = docker exec promo-music-db pg_isready -U postgres -h localhost 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL: Ready" -ForegroundColor Green
        
        # Проверяем таблицу kv_store
        $tableCheck = docker exec promo-music-db psql -U postgres -d postgres -c "SELECT 1 FROM kv_store_84730125 LIMIT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ KV Store Table: Exists" -ForegroundColor Green
        } else {
            Write-Host "⚠️  KV Store Table: Not Found (migrations not run?)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ PostgreSQL: Not Ready" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL: Error" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Статус всех контейнеров:" -ForegroundColor Yellow
Write-Host "-------------------------"
& $composeCmd ps

Write-Host ""
Write-Host "💾 Использование ресурсов:" -ForegroundColor Yellow
Write-Host "------------------------"
$containers = docker ps --format '{{.Names}}' | Select-String "promo-music"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $containers

Write-Host ""
Write-Host "🎯 Итог:" -ForegroundColor Yellow
Write-Host "------"
if (Check-Http "http://localhost:8000/health" "Overall Status") {
    Write-Host "✅ Система работает корректно!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Доступные URL:" -ForegroundColor Cyan
    Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   • Studio:   http://localhost:3001" -ForegroundColor White
    Write-Host "   • API:      http://localhost:8000" -ForegroundColor White
    exit 0
} else {
    Write-Host "❌ Обнаружены проблемы. Проверьте логи:" -ForegroundColor Red
    Write-Host "   docker-compose logs -f"
    exit 1
}
