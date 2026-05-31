[CmdletBinding()]
param(
  [switch]$Strict,
  [switch]$CheckTools,
  [switch]$CheckK8s,
  [switch]$CheckFiles,
  [string]$RootPath = $(if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path })
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Section([string]$Title) {
  Write-Host "`n==> $Title" -ForegroundColor Cyan
}

function Test-Command([string]$Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Assert-File([string]$Path, [string]$Label) {
  if (-not (Test-Path $Path)) {
    throw "No se encontró $Label en: $Path"
  }
  Write-Host "OK  $Label" -ForegroundColor Green
}

$root = (Resolve-Path -LiteralPath $RootPath).Path
$backend = Join-Path $root 'agroMarket'
$frontend = Join-Path $root 'frontend'
$k8s = Join-Path $root 'k8s'

Write-Section "AgroMarket predeploy check"
Write-Host "Root: $root"

if ($CheckFiles -or -not ($CheckTools -or $CheckK8s)) {
  Write-Section "Verificando archivos base"
  Assert-File (Join-Path $root 'README.md') 'README.md'
  Assert-File (Join-Path $root 'DEPLOYMENT_GUIDE.md') 'DEPLOYMENT_GUIDE.md'
  Assert-File (Join-Path $root 'OAUTH2_GUIDE.md') 'OAUTH2_GUIDE.md'
  Assert-File (Join-Path $root 'PHASE_11_12_SUMMARY.md') 'PHASE_11_12_SUMMARY.md'
  Assert-File (Join-Path $root 'NEXT_STEPS.md') 'NEXT_STEPS.md'
  Assert-File (Join-Path $root 'deploy.ps1') 'deploy.ps1'
  Assert-File (Join-Path $root 'predeploy-check.ps1') 'predeploy-check.ps1'
  Assert-File (Join-Path $backend 'pom.xml') 'Backend pom.xml'
  Assert-File (Join-Path $k8s 'kustomization.yaml') 'k8s/kustomization.yaml'
  Assert-File (Join-Path $k8s 'deployment.yaml') 'k8s/deployment.yaml'
  Assert-File (Join-Path $k8s 'service.yaml') 'k8s/service.yaml'
  Assert-File (Join-Path $k8s 'ingress.yaml') 'k8s/ingress.yaml'
  Assert-File (Join-Path $k8s 'configmap.yaml') 'k8s/configmap.yaml'
  Assert-File (Join-Path $k8s 'secret-example.yaml') 'k8s/secret-example.yaml'
  Assert-File (Join-Path $k8s 'mysql-backup-cronjob.yaml') 'k8s/mysql-backup-cronjob.yaml'
}

if ($CheckTools -or -not ($CheckFiles -or $CheckK8s)) {
  Write-Section "Verificando herramientas locales"
  foreach ($tool in @('mvn', 'kubectl', 'docker')) {
    $available = Test-Command $tool
    if ($available) {
      Write-Host "OK  $tool" -ForegroundColor Green
    } elseif ($Strict) {
      throw "$tool no está disponible en PATH"
    } else {
      Write-Host "WARN $tool no encontrado" -ForegroundColor Yellow
    }
  }
}

if ($CheckK8s -or -not ($CheckTools -or $CheckFiles)) {
  Write-Section "Validando Kubernetes"
  if (Test-Command 'kubectl') {
    try {
      $render = & kubectl kustomize $k8s 2>&1
      if ($LASTEXITCODE -ne 0) { throw ($render | Out-String) }
      Write-Host "OK  kubectl kustomize" -ForegroundColor Green
      if ($render -match 'agromarket-config' -and $render -match 'agromarket-secrets' -and $render -match 'agromarket-mysql-backup') {
        Write-Host "OK  manifests renderizados con recursos esperados" -ForegroundColor Green
      } else {
        Write-Host "WARN la renderización no mostró todos los recursos esperados" -ForegroundColor Yellow
      }
    } catch {
      if ($Strict) { throw }
      Write-Host "WARN Validación k8s falló: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  } elseif ($Strict) {
    throw "kubectl no está disponible en PATH"
  } else {
    Write-Host "WARN kubectl no encontrado; se omite validación k8s" -ForegroundColor Yellow
  }
}

Write-Section "Validación rápida de entorno"
$checks = @(
  @{ Name = 'Backend dir'; Path = $backend },
  @{ Name = 'Frontend dir'; Path = $frontend },
  @{ Name = 'K8s dir'; Path = $k8s }
)
foreach ($check in $checks) {
  if (Test-Path $check.Path) {
    Write-Host "OK  $($check.Name)" -ForegroundColor Green
  } elseif ($Strict) {
    throw "Falta $($check.Name): $($check.Path)"
  } else {
    Write-Host "WARN falta $($check.Name): $($check.Path)" -ForegroundColor Yellow
  }
}

Write-Section "Resumen"
Write-Host "Listo para continuar con despliegue manual, Docker Compose o Kubernetes." -ForegroundColor Green

