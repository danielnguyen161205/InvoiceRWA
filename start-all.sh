#!/bin/bash
# 🚀 Start All Services - InvoiceRWA (macOS/Linux)
# Script khởi động tất cả services cùng lúc

echo "================================"
echo "   Starting InvoiceRWA..."
echo "================================"
echo ""

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "⚠️  tmux not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install tmux
    else
        sudo apt-get install tmux -y
    fi
fi

# Kill existing tmux session if exists
tmux kill-session -t invoicerwa 2>/dev/null

# Create new tmux session
tmux new-session -d -s invoicerwa -n backend

# Window 1: Backend
tmux send-keys -t invoicerwa:backend "cd Backend && source venv/bin/activate && echo '🐍 Backend API Server' && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" C-m

# Window 2: Blockchain
tmux new-window -t invoicerwa -n blockchain
tmux send-keys -t invoicerwa:blockchain "cd Backend/contracts && echo '⛓️  Hardhat Local Blockchain' && npx hardhat node" C-m

# Window 3: Deploy (wait 5 seconds then deploy)
tmux new-window -t invoicerwa -n deploy
tmux send-keys -t invoicerwa:deploy "cd Backend/contracts && sleep 5 && echo '📜 Deploying Contracts...' && npx hardhat run scripts/deploy.js --network localhost && echo 'Press Enter to close...' && read" C-m

# Window 4: Frontend
tmux new-window -t invoicerwa -n frontend
tmux send-keys -t invoicerwa:frontend "cd Frontend && echo '🌐 Frontend Development Server' && npm start" C-m

# Select first window
tmux select-window -t invoicerwa:backend

echo ""
echo "================================"
echo "   ✅ ALL SERVICES STARTED!"
echo "================================"
echo ""
echo "📍 Service URLs:"
echo "   Backend API:  http://localhost:8000"
echo "   API Docs:     http://localhost:8000/docs"
echo "   Blockchain:   http://127.0.0.1:8545"
echo "   Frontend:     http://localhost:5500"
echo ""
echo "🔐 Default Admin:"
echo "   Email:    admin@invoicerwa.com"
echo "   Password: Admin123!"
echo ""
echo "💡 Commands:"
echo "   View all:     tmux attach -t invoicerwa"
echo "   Switch panes: Ctrl+B then arrow keys"
echo "   Detach:       Ctrl+B then D"
echo "   Kill all:     tmux kill-session -t invoicerwa"
echo ""

# Auto attach to tmux session
sleep 2
tmux attach -t invoicerwa
