# Daily Verification Check Script
# Add this to Windows Task Scheduler to run daily

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath

Write-Host "Starting daily verification check..." -ForegroundColor Green

try {
    # Change to backend directory
    Push-Location $backendPath
    
    # Activate virtual environment if it exists
    if (Test-Path ".venv\Scripts\Activate.ps1") {
        Write-Host "Activating virtual environment..." -ForegroundColor Yellow
        & .venv\Scripts\Activate.ps1
    }
    
    # Run the verification check script
    Write-Host "Running verification check..." -ForegroundColor Yellow
    python scripts\daily_verification_check.py
    
    Write-Host "✅ Daily verification check completed successfully" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error during verification check: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

Write-Host "Script finished" -ForegroundColor Cyan