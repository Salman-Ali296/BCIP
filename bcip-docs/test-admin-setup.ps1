# BCIP Admin Module - Setup Verification Script
# Run this with: .\test-admin-setup.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "BCIP Admin Module Setup Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Test 1: Check PostgreSQL
Write-Host "1. Checking PostgreSQL (port 5432)..." -ForegroundColor Yellow
try {
    $pgTest = docker ps --filter "publish=5432" --format "{{.Names}}"
    if ($pgTest) {
        Write-Host "   ✓ PostgreSQL is running: $pgTest" -ForegroundColor Green
    } else {
        Write-Host "   ✗ PostgreSQL is NOT running" -ForegroundColor Red
        Write-Host "     Run: cd bcip-ai-services; docker-compose up -d postgres" -ForegroundColor Gray
        $allGood = $false
    }
} catch {
    Write-Host "   ✗ Cannot check Docker (is Docker installed?)" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Test 2: Check Redis
Write-Host "2. Checking Redis (port 6379)..." -ForegroundColor Yellow
try {
    $redisTest = docker ps --filter "publish=6379" --format "{{.Names}}"
    if ($redisTest) {
        Write-Host "   ✓ Redis is running: $redisTest" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Redis is NOT running" -ForegroundColor Red
        Write-Host "     Run: cd bcip-ai-services; docker-compose up -d redis" -ForegroundColor Gray
        $allGood = $false
    }
} catch {
    Write-Host "   ✗ Cannot check Docker" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Test 3: Check Backend
Write-Host "3. Checking Backend API (port 4000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Backend is running and healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Backend is NOT responding" -ForegroundColor Red
    Write-Host "     Run: cd bcip-backend; npm run dev" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Test 4: Check Frontend
Write-Host "4. Checking Frontend (port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Frontend is NOT responding" -ForegroundColor Red
    Write-Host "     Run: cd bcip-frontend; npm run dev" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Test 5: Check Backend .env
Write-Host "5. Checking Backend configuration..." -ForegroundColor Yellow
if (Test-Path "bcip-backend\.env") {
    $envContent = Get-Content "bcip-backend\.env" -Raw
    if ($envContent -match "PORT=4000") {
        Write-Host "   ✓ Backend PORT=4000 configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Backend PORT not set to 4000" -ForegroundColor Yellow
        $allGood = $false
    }
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   ✓ DATABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ✗ DATABASE_URL missing" -ForegroundColor Red
        $allGood = $false
    }
    if ($envContent -match "JWT_SECRET") {
        Write-Host "   ✓ JWT_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "   ✗ JWT_SECRET missing" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ✗ bcip-backend\.env file missing!" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Test 6: Check Frontend .env.local
Write-Host "6. Checking Frontend configuration..." -ForegroundColor Yellow
if (Test-Path "bcip-frontend\.env.local") {
    $envContent = Get-Content "bcip-frontend\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_API_BASE_URL=http://localhost:4000") {
        Write-Host "   ✓ API URL points to backend (port 4000)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ API URL may not match backend port" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ bcip-frontend\.env.local file missing!" -ForegroundColor Red
    Write-Host "     Create file with: NEXT_PUBLIC_API_BASE_URL=http://localhost:4000" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Test 7: Check dependencies
Write-Host "7. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "bcip-backend\node_modules") {
    Write-Host "   ✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend dependencies missing" -ForegroundColor Red
    Write-Host "     Run: cd bcip-backend; npm install" -ForegroundColor Gray
    $allGood = $false
}
if (Test-Path "bcip-frontend\node_modules") {
    Write-Host "   ✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend dependencies missing" -ForegroundColor Red
    Write-Host "     Run: cd bcip-frontend; npm install" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Test 8: Check Prisma
Write-Host "8. Checking Prisma setup..." -ForegroundColor Yellow
if (Test-Path "bcip-backend\node_modules\.prisma") {
    Write-Host "   ✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "   ✗ Prisma Client not generated" -ForegroundColor Red
    Write-Host "     Run: cd bcip-backend; npx prisma generate" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ All checks passed! Your setup looks good." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create a SUPER_ADMIN user (see ADMIN_MODULE_STARTUP_GUIDE.md)" -ForegroundColor White
    Write-Host "2. Login at: http://localhost:3000/login" -ForegroundColor White
    Write-Host "3. Access admin panel: http://localhost:3000/admin/dashboard" -ForegroundColor White
} else {
    Write-Host "✗ Some issues found. Please fix them and run this script again." -ForegroundColor Red
    Write-Host ""
    Write-Host "See ADMIN_MODULE_STARTUP_GUIDE.md for detailed instructions." -ForegroundColor Yellow
}
Write-Host ""
