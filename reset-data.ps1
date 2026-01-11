# 🧹 Clean Data Script - Quick Reset
# Script xóa data nhanh để test lại

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   InvoiceRWA Data Reset" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  WARNING: This will delete ALL data except admin account!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Type 'YES' to continue"

if ($confirm -ne "YES") {
    Write-Host "❌ Cancelled" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "🧹 Cleaning database..." -ForegroundColor Yellow

cd Backend
.\venv\Scripts\Activate.ps1
python clear_data_except_admin.py

Write-Host ""
Write-Host "✅ Database cleaned!" -ForegroundColor Green
Write-Host "🔐 Admin account: admin@invoicerwa.com / Admin123!" -ForegroundColor Cyan
Write-Host ""
