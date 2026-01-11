# Run bank financing migration on MySQL
# Run this when you have internet connection to Aiven Cloud

Write-Host "🔧 Running Bank Financing Migration..." -ForegroundColor Green

# Set DATABASE_URL
$env:DATABASE_URL = "mysql://avnadmin:AVNS_Ulfgj5QiKBfkQbkOBDM@mysql-bfd5202-nguyenthai161205-25d3.l.aivencloud.com:22740/invoicedb?ssl_mode=REQUIRED"

# Test connection first
Write-Host "`n📡 Testing database connection..." -ForegroundColor Cyan
try {
    python -c "from sqlalchemy import create_engine; import os; engine = create_engine(os.getenv('DATABASE_URL')); conn = engine.connect(); print('✅ Connected successfully'); conn.close()"
} catch {
    Write-Host "❌ Cannot connect to database. Check your internet connection." -ForegroundColor Red
    Write-Host "`nAlternative: Run the SQL manually on Aiven console:" -ForegroundColor Yellow
    Write-Host "File: Backend/manual_migration_bank.sql" -ForegroundColor Yellow
    exit 1
}

# Run migration
Write-Host "`n🔄 Running Alembic migration..." -ForegroundColor Cyan
python -m alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Migration failed. You may need to run SQL manually." -ForegroundColor Yellow
    Write-Host "See: Backend/manual_migration_bank.sql" -ForegroundColor Yellow
}

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart the backend server" -ForegroundColor White
Write-Host "2. Test the new bank APIs" -ForegroundColor White
Write-Host "3. Check README_BANK_API_TESTING.md for examples" -ForegroundColor White
