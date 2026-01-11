# 🚀 Start All Services - InvoiceRWA
# Script khởi động tất cả services cùng lúc

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Starting InvoiceRWA..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if processes are already running
$backendRunning = Get-Process | Where-Object {$_.Path -like "*python.exe*" -and $_.CommandLine -like "*uvicorn*"}
$hardhatRunning = Get-Process | Where-Object {$_.CommandLine -like "*hardhat*node*"}
$frontendRunning = Get-Process | Where-Object {$_.CommandLine -like "*live-server*"}

if ($backendRunning) {
    Write-Host "⚠️  Backend already running (PID: $($backendRunning.Id))" -ForegroundColor Yellow
}

if ($hardhatRunning) {
    Write-Host "⚠️  Hardhat node already running (PID: $($hardhatRunning.Id))" -ForegroundColor Yellow
}

if ($frontendRunning) {
    Write-Host "⚠️  Frontend already running (PID: $($frontendRunning.Id))" -ForegroundColor Yellow
}

Write-Host ""

# Start Backend
Write-Host "🚀 Starting Backend API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; .\venv\Scripts\Activate.ps1; Write-Host '🐍 Backend API Server' -ForegroundColor Green; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

# Start Hardhat Node
Write-Host "⛓️  Starting Hardhat Blockchain..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend/contracts; Write-Host '⛓️  Hardhat Local Blockchain' -ForegroundColor Yellow; npx hardhat node"

Start-Sleep -Seconds 3

# Deploy Contracts
Write-Host "📜 Deploying Smart Contracts..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend/contracts; Start-Sleep 5; Write-Host '📜 Deploying Contracts...' -ForegroundColor Cyan; npx hardhat run scripts/deploy.js --network localhost; Write-Host 'Press any key to close...' -ForegroundColor Gray; `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🌐 Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; Write-Host '🌐 Frontend Development Server' -ForegroundColor Cyan; npm start"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "   ✅ ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Service URLs:" -ForegroundColor Yellow
Write-Host "   Backend API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   Blockchain:   http://127.0.0.1:8545" -ForegroundColor Cyan
Write-Host "   Frontend:     http://localhost:5500" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Default Admin:" -ForegroundColor Yellow
Write-Host "   Email:    admin@invoicerwa.com" -ForegroundColor White
Write-Host "   Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep these terminal windows open!" -ForegroundColor Gray
Write-Host ""
