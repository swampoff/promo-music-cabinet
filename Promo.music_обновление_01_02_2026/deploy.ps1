# 🚀 Скрипт автоматического деплоя Promo.Music (Windows)
# Автор: AI Assistant
# Дата: 2026-01-25

Write-Host "🎵 ==========================================" -ForegroundColor Cyan
Write-Host "🎵  PROMO.MUSIC - Автоматический Деплой" -ForegroundColor Cyan
Write-Host "🎵 ==========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен! Установите Git: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Проверка наличия Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js не установлен! Установите Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Шаг 1/6: Создание .env файла..." -ForegroundColor Blue
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "⚠️  ВАЖНО: Отредактируйте .env файл и добавьте ваши Supabase credentials!" -ForegroundColor Yellow
    Write-Host "   Откройте .env в текстовом редакторе и замените значения." -ForegroundColor Yellow
    Read-Host "Нажмите Enter когда закончите редактирование .env"
} else {
    Write-Host "✓ .env файл уже существует" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Шаг 2/6: Инициализация Git репозитория..." -ForegroundColor Blue
if (!(Test-Path .git)) {
    git init
    Write-Host "✓ Git репозиторий инициализирован" -ForegroundColor Green
} else {
    Write-Host "✓ Git репозиторий уже существует" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Шаг 3/6: Добавление remote origin..." -ForegroundColor Blue
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "⚠️  Remote origin уже существует" -ForegroundColor Yellow
    git remote set-url origin https://github.com/swampoff/promofm.git
    Write-Host "✓ Remote URL обновлен" -ForegroundColor Green
} else {
    git remote add origin https://github.com/swampoff/promofm.git
    Write-Host "✓ Remote origin добавлен" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Шаг 4/6: Добавление файлов в Git..." -ForegroundColor Blue
git add .
Write-Host "✓ Все файлы добавлены" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Шаг 5/6: Создание коммита..." -ForegroundColor Blue
git commit -m "🎵 Initial commit: Promo.Music - Artist Cabinet

- ✨ Glassmorphism дизайн с темной темой
- 📊 Система аналитики прослушиваний
- 💰 Система донатов и коинов
- 🎧 Управление треками и видео
- 🎤 Управление концертами и новостей
- 🚀 Готов к деплою на Vercel + Supabase
- 📱 Полностью адаптивный дизайн

Stack: React 18 + TypeScript + Vite + Tailwind v4 + Motion + Supabase"

Write-Host "✓ Коммит создан" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Шаг 6/6: Отправка в GitHub..." -ForegroundColor Blue
git branch -M main
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "🎉 УСПЕШНО! Код загружен в GitHub!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Следующие шаги:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1. Откройте https://vercel.com/new" -ForegroundColor Yellow
    Write-Host "2. Выберите репозиторий: swampoff/promofm" -ForegroundColor Yellow
    Write-Host "3. Добавьте Environment Variables:" -ForegroundColor Yellow
    Write-Host "   - VITE_SUPABASE_URL"
    Write-Host "   - VITE_SUPABASE_ANON_KEY"
    Write-Host "4. Нажмите Deploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📚 Полная документация: GITHUB_DEPLOY_INSTRUCTIONS.md" -ForegroundColor Blue
    Write-Host ""
} else {
    Write-Host "❌ Ошибка при push в GitHub!" -ForegroundColor Red
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "1. Нет доступа к репозиторию"
    Write-Host "2. Неверный URL репозитория"
    Write-Host "3. Не настроен SSH ключ или токен"
    Write-Host ""
    Write-Host "Попробуйте:" -ForegroundColor Blue
    Write-Host "git push -u origin main --force"
    exit 1
}
