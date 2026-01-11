# Test Dispute Endpoint

$baseUrl = "http://127.0.0.1:8000"

# 1. Login to get token
Write-Host "1. Login..." -ForegroundColor Yellow
$loginBody = @{
    username = "manh@g.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.access_token
Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Green

# 2. Get invoices
Write-Host "`n2. Get invoices..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$invoices = Invoke-RestMethod -Uri "$baseUrl/api/invoices" -Method GET -Headers $headers
Write-Host "   Found $($invoices.invoices.Count) invoices" -ForegroundColor Green
$invoices.invoices | ForEach-Object {
    Write-Host "   - Invoice #$($_.id): $($_.invoice_no) - Status: $($_.status) - Buyer ID: $($_.buyer_id)" -ForegroundColor Cyan
}

# 3. Try to dispute an invoice (ID 41)
Write-Host "`n3. Try to dispute invoice #41..." -ForegroundColor Yellow
$disputeBody = @{
    reason_code = "QUALITY_ISSUE"
    description = "This is a test dispute submission with more than 20 characters to meet the requirement."
    invoice_status = "SUBMITTED"
} | ConvertTo-Json

Write-Host "   Request URL: $baseUrl/api/invoices/41/dispute" -ForegroundColor Gray
Write-Host "   Request Body: $disputeBody" -ForegroundColor Gray

try {
    $disputeResponse = Invoke-RestMethod -Uri "$baseUrl/api/invoices/41/dispute" -Method POST -Headers $headers -Body $disputeBody -ContentType "application/json"
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host "   Response: $($disputeResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "   Response: $responseBody" -ForegroundColor Red
}
