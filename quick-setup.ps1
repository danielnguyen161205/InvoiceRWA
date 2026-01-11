# 🚀 Quick Start Script - InvoiceRWA
# Script tự động cài đặt toàn bộ dự án

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   InvoiceRWA Quick Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Python
Write-Host "🔍 Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.11+" -ForegroundColor Red
    Write-Host "Download: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 20+" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra Git
Write-Host "🔍 Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found! Please install Git" -ForegroundColor Red
    Write-Host "Download: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Setting up Backend..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Setup Backend
Set-Location Backend

Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv

Write-Host "🔌 Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

Write-Host "📥 Installing Python dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "✅ Backend setup complete!" -ForegroundColor Green

# Setup Smart Contracts
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Setting up Smart Contracts..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Set-Location contracts
Write-Host "📥 Installing contract dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Compiling contracts..." -ForegroundColor Yellow
npx hardhat compile

Write-Host "✅ Smart contracts setup complete!" -ForegroundColor Green

# Setup Frontend
Set-Location ..
Set-Location ..
Set-Location Frontend

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Setting up Frontend..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "📥 Installing frontend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🎨 Building CSS..." -ForegroundColor Yellow
npm run build:css

Write-Host "✅ Frontend setup complete!" -ForegroundColor Green

# Hoàn tất
Set-Location ..
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "   ✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start Backend:    cd Backend && uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host "2. Start Blockchain: cd Backend/contracts && npx hardhat node" -ForegroundColor Cyan
Write-Host "3. Deploy Contracts: cd Backend/contracts && npx hardhat run scripts/deploy.js --network localhost" -ForegroundColor Cyan
Write-Host "4. Start Frontend:   cd Frontend && npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Full guide: DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host "🌐 API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "🖥️  Frontend: http://localhost:5500" -ForegroundColor Yellow
Write-Host ""
