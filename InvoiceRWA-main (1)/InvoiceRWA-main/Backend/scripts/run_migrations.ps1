<#
Simple PowerShell helper to inspect Alembic state and run stamp/upgrade accordingly.

Usage (PowerShell):
  cd Backend
  .\.venv\Scripts\Activate
  $env:DATABASE_URL='mysql://...'
  .\scripts\run_migrations.ps1

This script will:
- show `alembic current` (if any)
- if no revision is present, prompt to `stamp head` to mark DB as current (safe when DB already has schema created by create_all)
- otherwise offer to run `alembic upgrade head` to apply migrations

Be cautious: `stamp head` does NOT alter schema — it only sets Alembic's recorded revision. Use `upgrade` to apply schema migrations.
#>

Write-Host "Checking alembic current revision..."
try {
    $current = alembic current 2>&1
    Write-Host $current
} catch {
    Write-Host "Error running 'alembic current'. Ensure alembic is installed and environment is activated." -ForegroundColor Red
    exit 1
}

$hasRevision = $current -match 'Current revision for.*:'

if (-not $hasRevision) {
    Write-Host "No alembic revision found in DB. If your DB already contains the desired schema (created via create_all), you can stamp head to mark it as current. Otherwise run upgrade to apply migrations." -ForegroundColor Yellow
    $choice = Read-Host "Do you want to run 'alembic stamp head' now? (y/n)"
    if ($choice -eq 'y') {
        alembic stamp head
        Write-Host "Stamped DB to head." -ForegroundColor Green
    } else {
        Write-Host "Skipping stamp. You may run 'alembic upgrade head' when ready." -ForegroundColor Yellow
    }
} else {
    Write-Host "Alembic reports a revision. You can run 'alembic upgrade head' to apply any pending migrations." -ForegroundColor Green
    $choice = Read-Host "Run 'alembic upgrade head' now? (y/n)"
    if ($choice -eq 'y') {
        alembic upgrade head
        Write-Host "Applied migrations." -ForegroundColor Green
    } else {
        Write-Host "Skipped upgrade." -ForegroundColor Yellow
    }
}
