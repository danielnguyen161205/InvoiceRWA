# Run closing fee migration
# This script adds the closing fee fields to the invoices table

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Invoice Closing Fee Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow

# Database connection parameters (update these to match your setup)
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "invoicerwa"
$DB_USER = "postgres"

Write-Host "Database: $DB_NAME" -ForegroundColor Gray
Write-Host "Host: $DB_HOST:$DB_PORT" -ForegroundColor Gray
Write-Host ""

# Prompt for password securely
$DB_PASSWORD = Read-Host "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $PlainPassword

Write-Host "Running migration..." -ForegroundColor Yellow

# Run the migration SQL file
$migrationFile = ".\Backend\db\sql\add_closing_fee.sql"

if (Test-Path $migrationFile) {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Added columns:" -ForegroundColor Green
        Write-Host "  - closing_fee (FLOAT)" -ForegroundColor Gray
        Write-Host "  - closing_fee_paid (BOOLEAN)" -ForegroundColor Gray
        Write-Host "  - invoice_closed_by_sme (BOOLEAN)" -ForegroundColor Gray
        Write-Host "  - invoice_closed_at (TIMESTAMP)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Red
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    Write-Host ""
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
