# Test Docker Login Functionality

Write-Host "Testing Docker Login System" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/users" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Check if frontend is running
Write-Host ""
Write-Host "Test 2: Checking frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -ErrorAction Stop
    Write-Host "✅ Frontend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not responding" -ForegroundColor Red
    exit 1
}

# Test 3: Test login endpoint
Write-Host ""
Write-Host "Test 3: Testing login endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "admin789"
        password = "password789"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "   User: $($result.user.username)" -ForegroundColor Green
        Write-Host "   Role: $($result.user.role)" -ForegroundColor Green
        Write-Host "   Token: $($result.token.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "❌ Login failed: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Test with student credentials
Write-Host ""
Write-Host "Test 4: Testing student login..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "student123"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Student login successful!" -ForegroundColor Green
        Write-Host "   User: $($result.user.username)" -ForegroundColor Green
        Write-Host "   Role: $($result.user.role)" -ForegroundColor Green
    } else {
        Write-Host "❌ Student login failed: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Student login request failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test with faculty credentials
Write-Host ""
Write-Host "Test 5: Testing faculty login..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "faculty456"
        password = "password456"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Faculty login successful!" -ForegroundColor Green
        Write-Host "   User: $($result.user.username)" -ForegroundColor Green
        Write-Host "   Role: $($result.user.role)" -ForegroundColor Green
    } else {
        Write-Host "❌ Faculty login failed: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Faculty login request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Green
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at: http://localhost:8080" -ForegroundColor Cyan
