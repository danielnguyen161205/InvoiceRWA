@echo off
echo ========================================
echo InvoiceRWA - Starting All Services
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/5] Setting up Backend...
cd /d "%~dp0Backend"

:: Create virtual environment if not exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install backend dependencies
echo Installing backend dependencies...
pip install -r requirements.txt -q

:: Create .env if not exists
if not exist ".env" (
    echo Creating .env file...
    (
        echo DATABASE_URL=sqlite:///./invoice_rwa.db
        echo SECRET_KEY=your-secret-key-change-this-in-production
        echo BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
        echo CONTRACT_ADDRESS=0x...
    ) > .env
)

echo [2/5] Starting Backend server...
start "InvoiceRWA Backend" cmd /k "cd /d "%~dp0Backend" && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo [3/5] Setting up Frontend...
cd /d "%~dp0Frontend"

:: Install frontend dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing frontend dependencies (this may take a while)...
    call npm install
)

echo [4/5] Starting Frontend server...
start "InvoiceRWA Frontend" cmd /k "cd /d "%~dp0Frontend" && npm start"

echo.
echo ========================================
echo [5/5] All Services Started!
echo ========================================
echo.
echo Backend API:  http://127.0.0.1:8000
echo API Docs:     http://127.0.0.1:8000/docs
echo Frontend:     Check the terminal for URL (usually http://localhost:3000)
echo.
echo Press any key to open the application in your browser...
pause >nul

:: Try to open the frontend in browser
start http://localhost:3000 2>nul
start http://127.0.0.1:8000/docs 2>nul

echo.
echo To stop all services, close the opened command windows.
echo Or run: stop_all.bat
pause
