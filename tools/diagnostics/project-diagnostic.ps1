param()

Write-Host "=================================================="
Write-Host "PROJECT DIAGNOSTIC"
Write-Host "=================================================="
Write-Host ""

$ok = $true
$issues = @()

function Add-Issue {
    param([string]$Severity, [string]$Component, [string]$Problem, [string]$Recommendation)
    $global:issues += [PSCustomObject]@{
        Severity = $Severity
        Component = $Component
        Problem = $Problem
        Recommendation = $Recommendation
    }
    $global:ok = $false
}

Write-Host "[PROJECT]"
if (Test-Path ".git") { Write-Host " - Git: OK" } else { Write-Host " - Git: WARN (No .git found)"; Add-Issue "LOW" "PROJECT" "No .git folder found" "Initialize git repository if needed" }
if (Test-Path "agroMarket/.env") { Write-Host " - Backend .env: OK" } else { Write-Host " - Backend .env: FAIL"; Add-Issue "HIGH" "PROJECT" "Missing backend .env file" "Create agroMarket/.env from template" }
Write-Host ""

Write-Host "[FRONTEND]"
Push-Location "frontend"
try {
    Write-Host " - npm install..." -NoNewline
    $npmOutput = npm install 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" } else { Write-Host " FAIL"; Add-Issue "HIGH" "FRONTEND" "npm install failed" "Check package.json and run npm install manually" }
    
    Write-Host " - ESLint..." -NoNewline
    $eslintOutput = npx eslint . 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" } else { Write-Host " FAIL"; Add-Issue "HIGH" "FRONTEND" "ESLint found errors" "Run npx eslint . and fix errors" }
    
    Write-Host " - Vite Build..." -NoNewline
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" } else { Write-Host " FAIL"; Add-Issue "HIGH" "FRONTEND" "Vite build failed" "Run npm run build and check for errors" }
} finally {
    Pop-Location
}
Write-Host ""

Write-Host "[BACKEND]"
Push-Location "agroMarket"
try {
    Write-Host " - Maven Compile..." -NoNewline
    $compileOutput = .\mvnw.cmd compile 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" } else { Write-Host " FAIL"; Add-Issue "CRITICAL" "BACKEND" "Maven compilation failed" "Run mvnw compile and fix syntax errors" }
    
    Write-Host " - Maven Tests..." -NoNewline
    $testOutput = .\mvnw.cmd test 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host " OK" } else { Write-Host " FAIL"; Add-Issue "HIGH" "BACKEND" "Maven tests failed" "Run mvnw test to see failing cases" }
} finally {
    Pop-Location
}
Write-Host ""

Write-Host "[DATABASE & INTEGRATION]"
$mysqlPort = 3306
$mongoPort = 27017

$mysqlCheck = Test-NetConnection -ComputerName localhost -Port $mysqlPort
if ($mysqlCheck.TcpTestSucceeded) { Write-Host " - MySQL (3306): OK" } else { Write-Host " - MySQL (3306): FAIL"; Add-Issue "CRITICAL" "DATABASE" "MySQL is not running on port 3306" "Start MySQL service" }

$backendPort = 8080
$frontendPort = 5173

$backendCheck = Test-NetConnection -ComputerName localhost -Port $backendPort
if ($backendCheck.TcpTestSucceeded) { 
    Write-Host " - Backend URL ($backendPort): OK" 
    
    # Check Backend Diagnostic
    try {
        $backendDiag = Invoke-RestMethod -Uri "http://localhost:$backendPort/api/public/diagnostic" -Method Get -ErrorAction Stop
        if ($backendDiag.ok) {
            Write-Host " - Backend Status: OK ($($backendDiag.database))"
        } else {
            Write-Host " - Backend Status: FAIL ($($backendDiag.database))"
            Add-Issue "HIGH" "INTEGRATION" "Backend diagnostic endpoint reported failure" "Check database configuration in application-dev.yml"
        }
    } catch {
        Write-Host " - Backend Status: FAIL (Could not reach /api/public/diagnostic)"
        Add-Issue "HIGH" "INTEGRATION" "Could not reach backend diagnostic endpoint" "Ensure backend is running and diagnostic endpoint exists"
    }

} else { 
    Write-Host " - Backend URL ($backendPort): WARN (Not running)"
    Add-Issue "MEDIUM" "INTEGRATION" "Backend is not running" "Run the backend to fully test integration"
}

$frontendCheck = Test-NetConnection -ComputerName localhost -Port $frontendPort
if ($frontendCheck.TcpTestSucceeded) { 
    Write-Host " - Frontend URL ($frontendPort): OK" 
} else { 
    Write-Host " - Frontend URL ($frontendPort): WARN (Not running)"
    Add-Issue "MEDIUM" "INTEGRATION" "Frontend is not running" "Run npm run dev to fully test integration"
}
Write-Host ""

Write-Host "[FINAL RESULT]"
if ($ok) {
    Write-Host "PROJECT STATUS: OK" -ForegroundColor Green
} else {
    Write-Host "PROJECT STATUS: REQUIRES ATTENTION" -ForegroundColor Red
    Write-Host ""
    
    $issues | Sort-Object @{Expression={
        switch ($_.Severity) {
            "CRITICAL" { 1 }
            "HIGH" { 2 }
            "MEDIUM" { 3 }
            "LOW" { 4 }
        }
    }} | ForEach-Object {
        Write-Host "[$($_.Severity)] $($_.Component) - $($_.Problem)"
        Write-Host "   => $($_.Recommendation)"
    }
}
Write-Host "=================================================="
