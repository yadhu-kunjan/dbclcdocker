# PowerShell script to test login endpoints
# Run with: .\test-login.ps1

$baseUrl = 'http://localhost:3001/api'

Write-Host "=== Testing Student Login ==="
$studentBody = @{
    username = 'student123'
    password = 'password123'
    role = 'student'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $studentBody -ContentType 'application/json'
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Server Response: $($_.ErrorDetails.Message)"
    }
}

Write-Host "`n=== Testing Admin Login ==="
$adminBody = @{
    username = 'admin789'
    password = 'password789'
    role = 'admin'
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminBody -ContentType 'application/json'
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Server Response: $($_.ErrorDetails.Message)"
    }
}