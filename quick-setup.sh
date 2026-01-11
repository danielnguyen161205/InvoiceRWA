#!/bin/bash
# Quick Start Script for macOS/Linux - InvoiceRWA

echo "================================"
echo "   InvoiceRWA Quick Setup"
echo "================================"
echo ""

# Check Python
echo "🔍 Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Found: $PYTHON_VERSION"
else
    echo "❌ Python not found! Please install Python 3.11+"
    echo "macOS: brew install python@3.11"
    echo "Ubuntu: sudo apt install python3.11 python3.11-venv python3-pip"
    exit 1
fi

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Found: $NODE_VERSION"
else
    echo "❌ Node.js not found! Please install Node.js 20+"
    echo "macOS: brew install node"
    echo "Ubuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs"
    exit 1
fi

# Check Git
echo "🔍 Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Found: $GIT_VERSION"
else
    echo "❌ Git not found! Please install Git"
    echo "macOS: brew install git"
    echo "Ubuntu: sudo apt install git"
    exit 1
fi

echo ""
echo "================================"
echo "   Setting up Backend..."
echo "================================"

# Setup Backend
cd Backend

echo "📦 Creating virtual environment..."
python3 -m venv venv

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete!"

# Setup Smart Contracts
echo ""
echo "================================"
echo "   Setting up Smart Contracts..."
echo "================================"

cd contracts
echo "📥 Installing contract dependencies..."
npm install

echo "🔨 Compiling contracts..."
npx hardhat compile

echo "✅ Smart contracts setup complete!"

# Setup Frontend
cd ../..
cd Frontend

echo ""
echo "================================"
echo "   Setting up Frontend..."
echo "================================"

echo "📥 Installing frontend dependencies..."
npm install

echo "🎨 Building CSS..."
npm run build:css

echo "✅ Frontend setup complete!"

# Done
cd ..
echo ""
echo "================================"
echo "   ✅ SETUP COMPLETE!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Start Backend:    cd Backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "2. Start Blockchain: cd Backend/contracts && npx hardhat node"
echo "3. Deploy Contracts: cd Backend/contracts && npx hardhat run scripts/deploy.js --network localhost"
echo "4. Start Frontend:   cd Frontend && npm start"
echo ""
echo "📖 Full guide: DEPLOYMENT_GUIDE.md"
echo "🌐 API Docs: http://localhost:8000/docs"
echo "🖥️  Frontend: http://localhost:5500"
echo ""
