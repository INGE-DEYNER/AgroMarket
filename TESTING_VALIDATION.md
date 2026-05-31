# Script Validation & Testing

## Quick Validation

Run this to verify the script syntax is correct:

```powershell
# Test script syntax without execution
Test-Path C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1

# Check PowerShell syntax
Get-Command Test-PSScriptFileForSyntaxErrors -ErrorAction SilentlyContinue

# If available, validate syntax
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
Test-PSScriptFileForSyntaxErrors -Path $scriptPath
```

---

## Pre-Flight Checks

Run before any deployment:

```powershell
# 1. Verify prerequisites
Write-Host "=== Pre-Flight Checks ===" -ForegroundColor Cyan

# Check file exists
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
if (Test-Path $scriptPath) {
    Write-Host "✓ deploy.ps1 found" -ForegroundColor Green
} else {
    Write-Host "✗ deploy.ps1 not found" -ForegroundColor Red
    exit 1
}

# Check kubectl availability (for Kubernetes mode)
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    $kubectlVersion = kubectl version --client --short
    Write-Host "✓ kubectl available: $kubectlVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ kubectl not available (required for -Mode Kubernetes)" -ForegroundColor Yellow
}

# Check Docker availability (for Docker mode)
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Host "✓ Docker available: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Docker not available (required for -Mode Docker)" -ForegroundColor Yellow
}

# Check Maven availability (for -Build flag)
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    $mvnVersion = mvn -version | Select-Object -First 1
    Write-Host "✓ Maven available: $mvnVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Maven not available (use with ./mvnw or ./mvnw.cmd)" -ForegroundColor Yellow
}

# Check project structure
$projectRoot = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket"
@("agroMarket", "frontend", "k8s", "docker-compose.yml") | ForEach-Object {
    $path = Join-Path $projectRoot $_
    if (Test-Path $path) {
        Write-Host "✓ $_ found" -ForegroundColor Green
    } else {
        Write-Host "✗ $_ not found" -ForegroundColor Red
    }
}

Write-Host ""
```

---

## Test Mode - DryRun

### Test Kubernetes Mode (No Changes)

```powershell
# This will validate everything but NOT apply any changes
.\deploy.ps1 `
    -Mode Kubernetes `
    -Namespace agromarket `
    -DryRun `
    -Verbose
```

Expected output:
```
[2026-05-29 HH:MM:SS] ==> AgroMarket Deployment Helper
[2026-05-29 HH:MM:SS] Modo        : Kubernetes
[2026-05-29 HH:MM:SS] Namespace   : agromarket
[2026-05-29 HH:MM:SS] DryRun      : True
...
[2026-05-29 HH:MM:SS] ✓ kubectl encontrado
[2026-05-29 HH:MM:SS] ℹ️ Validando manifiestos con --dry-run=client
[2026-05-29 HH:MM:SS] ✓ Manifiestos validados correctamente
[2026-05-29 HH:MM:SS] ℹ️ [DRY-RUN] Manifiestos no fueron aplicados
```

---

## Usage Examples

### Example 1: Local Development

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Start backend locally
.\deploy.ps1 -Mode Local

# In another terminal: Start frontend
cd frontend
python -m http.server 3000
```

### Example 2: Docker Stack Testing

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Build and deploy
.\deploy.ps1 -Mode Docker -Build

# Verify services
docker compose ps

# View logs
docker compose logs -f
```

### Example 3: Kubernetes Staging

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Preview what will happen
.\deploy.ps1 -Mode Kubernetes -Namespace staging -DryRun

# Actual deployment
.\deploy.ps1 -Mode Kubernetes -Namespace staging -Build
```

### Example 4: Kubernetes Production

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Validate (no changes)
.\deploy.ps1 -Mode Kubernetes -Namespace production -DryRun

# Deploy
.\deploy.ps1 -Mode Kubernetes -Namespace production -Tag "v1.0.0"

# Verify
kubectl get pods -n production
kubectl get svc -n production
```

---

## Automated Testing Script

Save this as `test-deploy.ps1`:

```powershell
[CmdletBinding()]
param(
    [string]$ProjectPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket"
)

$ErrorActionPreference = 'Stop'
$WarningPreference = 'Continue'

function Test-Prerequisites {
    Write-Host "`n=== Testing Prerequisites ===" -ForegroundColor Cyan
    
    $passed = 0
    $failed = 0
    
    # Test script exists
    $scriptPath = Join-Path $ProjectPath "deploy.ps1"
    if (Test-Path $scriptPath) {
        Write-Host "✓ deploy.ps1 exists" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "✗ deploy.ps1 not found" -ForegroundColor Red
        $failed++
    }
    
    # Test project structure
    @("agroMarket", "frontend", "k8s", "docker-compose.yml") | ForEach-Object {
        $path = Join-Path $ProjectPath $_
        if (Test-Path $path) {
            Write-Host "✓ $_ exists" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "✗ $_ missing" -ForegroundColor Red
            $failed++
        }
    }
    
    # Test commands availability
    $commands = @("kubectl", "docker", "mvn")
    $commands | ForEach-Object {
        if (Get-Command $_ -ErrorAction SilentlyContinue) {
            Write-Host "✓ $_ available" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "⚠ $_ not available" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nResults: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    return $failed -eq 0
}

function Test-ScriptSyntax {
    Write-Host "`n=== Testing Script Syntax ===" -ForegroundColor Cyan
    
    $scriptPath = Join-Path $ProjectPath "deploy.ps1"
    
    try {
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $scriptPath), [ref]$null)
        Write-Host "✓ Syntax is valid" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Syntax error: $_" -ForegroundColor Red
        return $false
    }
}

function Test-LocalMode {
    Write-Host "`n=== Testing Local Mode (DryRun) ===" -ForegroundColor Cyan
    
    $scriptPath = Join-Path $ProjectPath "deploy.ps1"
    
    try {
        & $scriptPath -Mode Local -DryRun 2>&1 | Select-Object -First 10
        Write-Host "✓ Local mode is configurable" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Local mode error: $_" -ForegroundColor Red
        return $false
    }
}

function Test-DockerMode {
    Write-Host "`n=== Testing Docker Mode (DryRun) ===" -ForegroundColor Cyan
    
    $scriptPath = Join-Path $ProjectPath "deploy.ps1"
    
    try {
        & $scriptPath -Mode Docker -DryRun 2>&1 | Select-Object -First 10
        Write-Host "✓ Docker mode is configurable" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Docker mode error: $_" -ForegroundColor Red
        return $false
    }
}

function Test-K8sMode {
    Write-Host "`n=== Testing Kubernetes Mode (DryRun) ===" -ForegroundColor Cyan
    
    $scriptPath = Join-Path $ProjectPath "deploy.ps1"
    
    try {
        & $scriptPath -Mode Kubernetes -DryRun 2>&1 | Select-Object -First 10
        Write-Host "✓ Kubernetes mode is configurable" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ Kubernetes mode error: $_" -ForegroundColor Red
        return $false
    }
}

# Run all tests
$results = @()
$results += Test-Prerequisites
$results += Test-ScriptSyntax
$results += Test-LocalMode
$results += Test-DockerMode
$results += Test-K8sMode

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$passed = ($results | Where-Object { $_ -eq $true }).Count
$total = $results.Count

if ($passed -eq $total) {
    Write-Host "✓ All tests passed ($passed/$total)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed ($passed/$total)" -ForegroundColor Red
    exit 1
}
```

Run the test:
```powershell
.\test-deploy.ps1
```

---

## Performance Testing

Measure deployment times:

```powershell
$scriptPath = "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1"
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# Run deployment
& $scriptPath -Mode Kubernetes -Namespace staging -DryRun

$stopwatch.Stop()
Write-Host "Total time: $($stopwatch.Elapsed.TotalSeconds) seconds" -ForegroundColor Cyan
```

---

## Monitor Deployment Real-Time

```powershell
# Terminal 1: Deploy
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket
.\deploy.ps1 -Mode Kubernetes -Namespace agromarket

# Terminal 2: Watch pods
kubectl get pods -n agromarket -w

# Terminal 3: Watch logs
kubectl logs -f deployment/agromarket -n agromarket
```

---

## Health Checks Post-Deployment

```powershell
function Test-DeploymentHealth {
    param([string]$Namespace = "agromarket")
    
    Write-Host "=== Deployment Health Check ===" -ForegroundColor Cyan
    
    # Check pods
    $pods = kubectl get pods -n $Namespace -o json | ConvertFrom-Json
    $unhealthy = $pods.items | Where-Object { $_.status.phase -ne "Running" }
    
    if ($unhealthy) {
        Write-Host "✗ Unhealthy pods detected:" -ForegroundColor Red
        $unhealthy | ForEach-Object { Write-Host "  - $($_.metadata.name): $($_.status.phase)" }
    } else {
        Write-Host "✓ All pods healthy" -ForegroundColor Green
    }
    
    # Check services
    $svcs = kubectl get svc -n $Namespace --no-headers
    Write-Host "`nServices:" -ForegroundColor Cyan
    Write-Host $svcs
    
    # Check endpoints
    Write-Host "`nEndpoints:" -ForegroundColor Cyan
    kubectl get endpoints -n $Namespace
}

Test-DeploymentHealth -Namespace agromarket
```

---

## Continuous Monitoring Script

```powershell
# Save as monitor-deployment.ps1
param(
    [string]$Namespace = "agromarket",
    [int]$IntervalSeconds = 10,
    [int]$MaxWaitMinutes = 10
)

$startTime = Get-Date
$maxWait = [timespan]::FromMinutes($MaxWaitMinutes)

while ((Get-Date) - $startTime -lt $maxWait) {
    Clear-Host
    Write-Host "Deployment Monitor - $Namespace" -ForegroundColor Cyan
    Write-Host "Time elapsed: $((Get-Date) - $startTime)"
    
    Write-Host "`nPods:" -ForegroundColor Cyan
    kubectl get pods -n $Namespace --no-headers
    
    Write-Host "`nDeployments:" -ForegroundColor Cyan
    kubectl get deployments -n $Namespace --no-headers
    
    $ready = kubectl get deployments -n $Namespace -o json | ConvertFrom-Json
    $ready = $ready.items[0].status.readyReplicas -eq $ready.items[0].spec.replicas
    
    if ($ready) {
        Write-Host "`n✓ Deployment ready!" -ForegroundColor Green
        break
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}
```

---

## Debugging Script Issues

If something goes wrong:

```powershell
# 1. Enable verbose output
$VerbosePreference = "Continue"
& "C:\Users\Deyner Chaverra\Asafrut\AgroMarket\deploy.ps1" `
    -Mode Kubernetes `
    -Verbose

# 2. Enable debug output
$DebugPreference = "Continue"

# 3. Check script errors
$Error | ForEach-Object {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Line: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host "Text: $($_.InvocationInfo.Line)" -ForegroundColor Red
}

# 4. Check kubectl connectivity
kubectl cluster-info
kubectl get nodes
kubectl auth can-i create deployments --namespace agromarket
```

---

## Logs Collection for Support

When reporting issues, collect:

```powershell
# Create diagnostic bundle
$diagnosticPath = "$PWD\azure-diag-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
mkdir $diagnosticPath

# Kubernetes info
kubectl cluster-info >> "$diagnosticPath\cluster-info.txt"
kubectl get nodes >> "$diagnosticPath\nodes.txt"
kubectl get namespaces >> "$diagnosticPath\namespaces.txt"
kubectl get pods -n agromarket >> "$diagnosticPath\pods.txt"
kubectl describe pod -n agromarket >> "$diagnosticPath\pods-describe.txt"
kubectl logs -n agromarket --all-containers=true >> "$diagnosticPath\logs.txt"

# Docker info (if applicable)
docker --version >> "$diagnosticPath\docker-info.txt"
docker compose ps >> "$diagnosticPath\compose-services.txt"

# System info
powershell -Command "Get-Host | Format-List" >> "$diagnosticPath\powershell-info.txt"
powershell -Command "Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'" >> "$diagnosticPath\os-info.txt"

# Compress
Compress-Archive -Path $diagnosticPath -DestinationPath "$diagnosticPath.zip"

Write-Host "Diagnostic bundle created: $diagnosticPath.zip"
```

---

## Performance Baselines

Expected deployment times:
- **Syntax validation**: < 1 second
- **Prerequisites check**: < 2 seconds  
- **Manifest validation (dry-run)**: 3-5 seconds
- **Manifest application**: 2-3 seconds
- **Pod startup**: 10-30 seconds
- **Rollout status**: 20-60 seconds
- **Total deployment**: ~60-120 seconds

If deployment is significantly slower, check:
- Cluster resources (`kubectl top nodes`)
- Pod logs (`kubectl logs deployment/agromarket`)
- ImagePullBackOff issues

