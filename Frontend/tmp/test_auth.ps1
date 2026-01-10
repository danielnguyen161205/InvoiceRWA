$body = '{"email":"tester1@example.com","password":"Password123!","role":["SME","BUYER"]}'
try {
    $res = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/auth/register' -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop
    Write-Output "REGISTER RESPONSE:"
    $res | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output "REGISTER ERROR:"
    Write-Output $_.Exception.Message
}

$body2 = '{"email":"tester1@example.com","password":"Password123!"}'
try {
    $res2 = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/auth/login' -Method POST -Body $body2 -ContentType 'application/json' -ErrorAction Stop
    Write-Output "LOGIN RESPONSE:"
    $res2 | ConvertTo-Json -Compress | Write-Output
} catch {
    Write-Output "LOGIN ERROR:"
    Write-Output $_.Exception.Message
}
