[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [ValidateSet('Local','DockerCompose','Kubernetes')]
  [string]$Mode = 'Local',

  [switch]$Build,
  [switch]$DryRun,
  [string]$Namespace = 'default',
  [string]$K8sPath = 'k8s',
  [string]$ComposeFile = 'docker-compose.yml',
  [string]$AppDir = 'agroMarket',
  [string]$FrontendDir = 'frontend'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Step([string]$Message) {
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Test-Command([string]$Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Checked([string]$FilePath, [string[]]$Arguments, [string]$WorkingDirectory) {
  Write-Host ("$FilePath {0}" -f ($Arguments -join ' ')) -ForegroundColor DarkGray
  if ($DryRun) { return }
  $oldLocation = Get-Location
  try {
    if ($WorkingDirectory) { Set-Location $WorkingDirectory }
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed: $FilePath $($Arguments -join ' ')"
    }
  } finally {
    Set-Location $oldLocation
  }
}

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }
$root = (Resolve-Path $root).Path
$appPath = Join-Path $root $AppDir
$frontendPath = Join-Path $root $FrontendDir
$composePath = Join-Path $root $ComposeFile
$k8sPathFull = Join-Path $root $K8sPath

Write-Step "AgroMarket deployment helper"
Write-Host "Mode     : $Mode"
Write-Host "Root     : $root"
Write-Host "App dir  : $appPath"
Write-Host "K8s path : $k8sPathFull"
Write-Host "DryRun   : $DryRun"

if (-not (Test-Path $appPath)) {
  throw "No se encontró la carpeta del backend: $appPath"
}

if ($Build) {
  Write-Step "Compilando backend"
  if (-not (Test-Command 'mvn')) {
    throw "Maven no está disponible en PATH. Instala Maven o usa .\\mvnw."
  }
  Invoke-Checked -FilePath 'mvn' -Arguments @('-q','-DskipTests','clean','package') -WorkingDirectory $appPath
}

switch ($Mode) {
  'Local' {
    Write-Step "Arranque local del backend"
    if (-not (Test-Command 'mvn')) { throw "Maven no está disponible en PATH." }
    Write-Host "Sugerencia: en otra terminal puedes levantar el frontend con:"
    Write-Host "  cd `"$frontendPath`"; python -m http.server 3000" -ForegroundColor DarkGray
    Invoke-Checked -FilePath 'mvn' -Arguments @('spring-boot:run') -WorkingDirectory $appPath
  }

  'DockerCompose' {
    Write-Step "Validando Docker Compose"
    if (-not (Test-Command 'docker')) { throw "Docker no está disponible en PATH." }
    if (-not (Test-Path $composePath)) { throw "No se encontró docker-compose.yml en $composePath" }
    Invoke-Checked -FilePath 'docker' -Arguments @('compose','-f',$composePath,'config') -WorkingDirectory $root
    Invoke-Checked -FilePath 'docker' -Arguments @('compose','-f',$composePath,'up','-d','--build') -WorkingDirectory $root
    Write-Host "\nAccesos esperados:" -ForegroundColor Green
    Write-Host "  Backend/API : http://localhost:8080"
    Write-Host "  Swagger UI  : http://localhost:8080/swagger-ui.html"
  }

  'Kubernetes' {
    Write-Step "Validando despliegue Kubernetes"
    if (-not (Test-Command 'kubectl')) { throw "kubectl no está disponible en PATH." }
    if (-not (Test-Path $k8sPathFull)) { throw "No se encontró la carpeta k8s en $k8sPathFull" }

    Invoke-Checked -FilePath 'kubectl' -Arguments @('kustomize',$k8sPathFull) -WorkingDirectory $root
    Invoke-Checked -FilePath 'kubectl' -Arguments @('apply','--dry-run=client','-k',$k8sPathFull) -WorkingDirectory $root

    if (-not $DryRun) {
      Invoke-Checked -FilePath 'kubectl' -Arguments @('apply','-k',$k8sPathFull,'-n',$Namespace) -WorkingDirectory $root
      Write-Host "\nPost-despliegue sugerido:" -ForegroundColor Green
      Write-Host "  kubectl get pods -n $Namespace"
      Write-Host "  kubectl logs -f deployment/agromarket -n $Namespace"
    }
  }
}

Write-Step "Finalizado"

