@echo off
echo ========================================
echo InvoiceRWA - Stopping All Services
echo ========================================
echo.

echo Killing Backend and Frontend processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /FI "WINDOWTITLE eq InvoiceRWA*" /T 2>nul

echo.
echo All services stopped.
echo.
pause
