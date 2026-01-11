# Test Bank Financing APIs

Write-Host "Testing Bank Financing APIs..." -ForegroundColor Green

# Variables
$baseUrl = "http://localhost:8000/api"

Write-Host "`n=== Step 1: Get all bank users ===" -ForegroundColor Cyan
# You'll need to get actual bank user IDs from your database
# For demo purposes, assuming bank_id = 5 or similar

Write-Host "`n=== Step 2: SME sends financing request ===" -ForegroundColor Cyan
Write-Host "POST $baseUrl/bank/requests"
Write-Host "Body: { invoice_id: X, bank_ids: [1, 2, 3] }"

Write-Host "`n=== Step 3: Bank views invoices ===" -ForegroundColor Cyan
Write-Host "GET $baseUrl/bank/invoices"
Write-Host "  - Shows all APPROVED/FINANCING/FINANCED invoices"
Write-Host "  - Basic info for invoices without request"
Write-Host "  - Full info for invoices with request"

Write-Host "`n=== Step 4a: Bank accepts and finances ===" -ForegroundColor Cyan
Write-Host "POST $baseUrl/bank/requests/{request_id}/finance"
Write-Host "Body: { finance_amount: 950000000, interest_rate: 12.5 }"

Write-Host "`n=== Step 4b: Bank rejects ===" -ForegroundColor Cyan
Write-Host "POST $baseUrl/bank/requests/{request_id}/reject"
Write-Host "Body: { rejection_reason: 'High risk' }"

Write-Host "`n=== Step 5: Bank marks as financed ===" -ForegroundColor Cyan
Write-Host "POST $baseUrl/bank/requests/{request_id}/financed"

Write-Host "`n=== Step 6: SME confirms receipt ===" -ForegroundColor Cyan
Write-Host "POST $baseUrl/bank/invoices/{invoice_id}/confirm-receipt"

Write-Host "`n=== Step 7: Check final status ===" -ForegroundColor Cyan
Write-Host "GET $baseUrl/invoices/{invoice_id}"
Write-Host "  - Should show status = FINANCED"

Write-Host "`n=== API Endpoints Summary ===" -ForegroundColor Yellow
Write-Host "SME:"
Write-Host "  POST /api/bank/requests - Send request to banks"
Write-Host "  GET  /api/bank/my-requests - View my requests"
Write-Host "  POST /api/bank/invoices/{id}/confirm-receipt - Confirm receipt"
Write-Host "`nBank:"
Write-Host "  GET  /api/bank/invoices - View all invoices (with permission check)"
Write-Host "  POST /api/bank/requests/{id}/finance - Accept and finance"
Write-Host "  POST /api/bank/requests/{id}/financed - Mark as financed"
Write-Host "  POST /api/bank/requests/{id}/reject - Reject request"
