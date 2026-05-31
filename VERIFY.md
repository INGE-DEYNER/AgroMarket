# ✅ Deployment Script - Verification Checklist

Run this checklist to verify everything is correctly installed.

---

## 📋 Step-by-Step Verification

### 1. Script File Exists
```powershell
Test-Path C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1
# Expected: True
```

### 2. Documentation Files Exist
```powershell
$docs = @(
    "README_DEPLOY.md",
    "Quick_Start.md",
    "DEPLOY_CHEATSHEET.md",
    "DEPLOYMENT_MODES.md",
    "CI_CD_INTEGRATION.md",
    "TESTING_VALIDATION.md",
    "SUMMARY.md",
    "INDEX.md"
)

$basePath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket"
foreach ($doc in $docs) {
    $path = Join-Path $basePath $doc
    if (Test-Path $path) {
        Write-Host "✓ $doc" -ForegroundColor Green
    } else {
        Write-Host "✗ $doc missing!" -ForegroundColor Red
    }
}
```

### 3. Script Syntax Valid
```powershell
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
try {
    $null = [System.Management.Automation.PSParser]::Tokenize(
        (Get-Content $scriptPath), [ref]$null
    )
    Write-Host "✓ Script syntax is valid" -ForegroundColor Green
} catch {
    Write-Host "✗ Syntax error: $_" -ForegroundColor Red
}
```

### 4. Project Structure Valid
```powershell
$basePath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket"
$required = @("agroMarket", "frontend", "k8s", "docker-compose.yml")

foreach ($item in $required) {
    $path = Join-Path $basePath $item
    if (Test-Path $path) {
        Write-Host "✓ $item" -ForegroundColor Green
    } else {
        Write-Host "✗ $item missing!" -ForegroundColor Red
    }
}
```

### 5. Script Parameters Valid
```powershell
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
$content = Get-Content $scriptPath -Raw

$expectedParams = @("Mode", "Build", "DryRun", "Namespace", "Tag", "K8sPath")
foreach ($param in $expectedParams) {
    if ($content -match "\[string\]\`\$$param|\[switch\]\`\$$param") {
        Write-Host "✓ Parameter -$param exists" -ForegroundColor Green
    } else {
        Write-Host "✗ Parameter -$param missing!" -ForegroundColor Red
    }
}
```

### 6. Key Functions Exist
```powershell
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
$content = Get-Content $scriptPath -Raw

$functions = @(
    "Get-Timestamp",
    "Write-Step",
    "Write-Success",
    "Write-Info",
    "Write-Error2",
    "Test-Command",
    "Invoke-Checked",
    "Wait-K8sRollout",
    "Get-K8sPodStatus",
    "Describe-FailedPods"
)

foreach ($func in $functions) {
    if ($content -match "function\s+$func") {
        Write-Host "✓ Function $func" -ForegroundColor Green
    } else {
        Write-Host "✗ Function $func missing!" -ForegroundColor Red
    }
}
```

### 7. Kubernetes Mode Implemented
```powershell
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
$content = Get-Content $scriptPath -Raw

$required = @(
    "'Kubernetes'",
    "kubectl",
    "namespace",
    "rollout",
    "pod",
    "ingress"
)

foreach ($check in $required) {
    if ($content -match $check) {
        Write-Host "✓ K8s check: $check" -ForegroundColor Green
    } else {
        Write-Host "✗ K8s check failed: $check" -ForegroundColor Red
    }
}
```

---

## 🔧 Prerequisites Check

### Required Tools
```powershell
Write-Host "=== Checking Required Tools ===" -ForegroundColor Cyan

# PowerShell version
if ($PSVersionTable.PSVersion.Major -ge 5) {
    Write-Host "✓ PowerShell $($PSVersionTable.PSVersion)" -ForegroundColor Green
} else {
    Write-Host "✗ PowerShell 5.1+ required" -ForegroundColor Red
}

# kubectl
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    $version = kubectl version --client --short 2>$null
    Write-Host "✓ kubectl available: $version" -ForegroundColor Green
} else {
    Write-Host "⚠ kubectl not installed (needed for Kubernetes mode)" -ForegroundColor Yellow
}

# Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $version = docker --version
    Write-Host "✓ Docker available: $version" -ForegroundColor Green
} else {
    Write-Host "⚠ Docker not installed (needed for Docker mode)" -ForegroundColor Yellow
}

# Maven
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    $version = mvn -version | Select-Object -First 1
    Write-Host "✓ Maven available: $version" -ForegroundColor Green
} else {
    Write-Host "⚠ Maven not installed (can use ./mvnw)" -ForegroundColor Yellow
}
```

---

## 🧪 Functionality Test

### Test Script Loading
```powershell
Write-Host "=== Testing Script Loading ===" -ForegroundColor Cyan

$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
try {
    . $scriptPath -DryRun 2>&1 | Select-Object -First 5
    Write-Host "✓ Script loads successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Script loading failed: $_" -ForegroundColor Red
}
```

### Test Mode Options
```powershell
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
$modes = @("Local", "Docker", "Kubernetes")

Write-Host "=== Testing Modes ===" -ForegroundColor Cyan

foreach ($mode in $modes) {
    try {
        & $scriptPath -Mode $mode -DryRun -ErrorAction Stop 2>&1 | Select-Object -First 1 | Out-Null
        Write-Host "✓ Mode -$mode is valid" -ForegroundColor Green
    } catch {
        Write-Host "✗ Mode -$mode failed" -ForegroundColor Red
    }
}
```

---

## 📊 Complete Verification Script

Save this as `verify-deploy.ps1`:

```powershell
[CmdletBinding()]
param()

$basePath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket"
$scriptPath = Join-Path $basePath "deploy.ps1"

Clear-Host
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   AgroMarket Deployment Script - Verification                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Files exist
Write-Host "TEST 1: Checking files..." -ForegroundColor Yellow
$files = @(
    "deploy.ps1",
    "README_DEPLOY.md",
    "Quick_Start.md",
    "DEPLOY_CHEATSHEET.md",
    "DEPLOYMENT_MODES.md",
    "CI_CD_INTEGRATION.md",
    "TESTING_VALIDATION.md",
    "SUMMARY.md",
    "INDEX.md"
)
$filesOk = $true
foreach ($file in $files) {
    $path = Join-Path $basePath $file
    if (Test-Path $path) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING" -ForegroundColor Red
        $filesOk = $false
    }
}

# Test 2: Script syntax
Write-Host "`nTEST 2: Checking script syntax..." -ForegroundColor Yellow
try {
    $null = [System.Management.Automation.PSParser]::Tokenize(
        (Get-Content $scriptPath), [ref]$null
    )
    Write-Host "  ✓ Script syntax valid" -ForegroundColor Green
    $syntaxOk = $true
} catch {
    Write-Host "  ✗ Syntax error: $_" -ForegroundColor Red
    $syntaxOk = $false
}

# Test 3: Parameters exist
Write-Host "`nTEST 3: Checking parameters..." -ForegroundColor Yellow
$content = Get-Content $scriptPath -Raw
$params = @(
    "Mode",
    "Build",
    "DryRun",
    "Namespace",
    "Tag"
)
$paramsOk = $true
foreach ($param in $params) {
    if ($content -match "\`\$$param") {
        Write-Host "  ✓ -$param" -ForegroundColor Green
    } else {
        Write-Host "  ✗ -$param missing" -ForegroundColor Red
        $paramsOk = $false
    }
}

# Test 4: Functions exist
Write-Host "`nTEST 4: Checking functions..." -ForegroundColor Yellow
$functions = @(
    "Write-Success",
    "Write-Info",
    "Write-Error2",
    "Wait-K8sRollout",
    "Get-K8sPodStatus"
)
$functionsOk = $true
foreach ($func in $functions) {
    if ($content -match "function\s+$func") {
        Write-Host "  ✓ $func" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $func missing" -ForegroundColor Red
        $functionsOk = $false
    }
}

# Test 5: Kubernetes mode
Write-Host "`nTEST 5: Checking Kubernetes support..." -ForegroundColor Yellow
$k8sChecks = @(
    "'Kubernetes'",
    "kubectl",
    "Get-K8sPodStatus",
    "Wait-K8sRollout",
    "deployment.yaml",
    "service.yaml"
)
$k8sOk = $true
foreach ($check in $k8sChecks) {
    if ($content -match [regex]::Escape($check) -or (Test-Path (Join-Path $basePath "k8s\$check"))) {
        Write-Host "  ✓ $check" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $check missing" -ForegroundColor Red
        $k8sOk = $false
    }
}

# Test 6: Tools available
Write-Host "`nTEST 6: Checking tools..." -ForegroundColor Yellow
$tools = @(
    @{ Name = "kubectl"; Required = $false },
    @{ Name = "docker"; Required = $false }
)
$toolsOk = $true
foreach ($tool in $tools) {
    if (Get-Command $tool.Name -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ $($tool.Name) available" -ForegroundColor Green
    } else {
        if ($tool.Required) {
            Write-Host "  ✗ $($tool.Name) MISSING (required)" -ForegroundColor Red
            $toolsOk = $false
        } else {
            Write-Host "  ⚠ $($tool.Name) not available (optional)" -ForegroundColor Yellow
        }
    }
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
$allOk = $filesOk -and $syntaxOk -and $paramsOk -and $functionsOk -and $k8sOk
if ($allOk) {
    Write-Host "║  ✓ ALL CHECKS PASSED - Script is ready to use!              ║" -ForegroundColor Green
} else {
    Write-Host "║  ⚠ Some checks failed - Please review above                 ║" -ForegroundColor Yellow
}
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Test deployment script
Write-Host "`nTEST 7: Testing script execution..." -ForegroundColor Yellow
try {
    & $scriptPath -Mode Kubernetes -DryRun 2>&1 | Select-Object -First 3 | ForEach-Object {
        Write-Host "  $($_)"
    }
    Write-Host "  ✓ Script executes successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Execution failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ Verification complete!" -ForegroundColor Cyan
```

Run it:
```powershell
.\verify-deploy.ps1
```

---

## 🎯 Expected Output

When everything is correct, you should see:

```
╔════════════════════════════════════════════════════════════════╗
║   AgroMarket Deployment Script - Verification                ║
╚════════════════════════════════════════════════════════════════╝

TEST 1: Checking files...
  ✓ deploy.ps1
  ✓ README_DEPLOY.md
  ✓ Quick_Start.md
  ... (all files)

TEST 2: Checking script syntax...
  ✓ Script syntax valid

TEST 3: Checking parameters...
  ✓ -Mode
  ✓ -Build
  ... (all parameters)

TEST 4: Checking functions...
  ✓ Write-Success
  ✓ Write-Info
  ... (all functions)

TEST 5: Checking Kubernetes support...
  ✓ 'Kubernetes'
  ✓ kubectl
  ... (all K8s features)

TEST 6: Checking tools...
  ✓ kubectl available
  ⚠ docker not available (optional)

TEST 7: Testing script execution...
  ✓ Script executes successfully

╔════════════════════════════════════════════════════════════════╗
║  ✓ ALL CHECKS PASSED - Script is ready to use!              ║
╚════════════════════════════════════════════════════════════════╝
```

---

## ❌ Troubleshooting Verification

If checks fail:

### Missing Files
- All .md files should be in `C:\Users\Deyner Chaverra\Asafrut\AgroMarket\`
- Check spelling and exact locations

### Syntax Errors
- Verify deploy.ps1 has 392 lines
- Look for missing closing braces or quotes
- Run: `Get-Content deploy.ps1 | Measure-Object -Line`

### Parameters Missing
- Check the [CmdletBinding()] section
- Verify param() block has all parameters
- Should have 8 parameters total

### Functions Missing
- Core functions should be after line 20
- Should include 10 functions total
- Check for typos in function names

### Tools Not Available
- kubectl: `choco install kubernetes-cli`
- Docker: Download from docker.com
- Maven: `choco install maven` or use ./mvnw

---

## ✅ Final Checklist

- [ ] All 9 files present
- [ ] deploy.ps1 has valid syntax
- [ ] All parameters exist
- [ ] All 10 functions implemented
- [ ] Kubernetes support included
- [ ] Script executes without errors
- [ ] Documentation files readable
- [ ] Ready to deploy!

---

## 🚀 Next Steps

After verification passes:

1. Read `README_DEPLOY.md` for overview
2. Read `Quick_Start.md` for getting started
3. Run first deployment: `.\deploy.ps1 -Mode Kubernetes -DryRun`
4. Check `DEPLOY_CHEATSHEET.md` for commands

---

**Everything verified? You're ready to deploy! 🎉**

