param(
  [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

function Assert-DockerRunning {
  try {
    docker info | Out-Null
  } catch {
    throw 'Docker Desktop no está corriendo. Inicia Docker y vuelve a ejecutar start.ps1.'
  }
}

function Invoke-HostsSetup {
  $hostsScript = Join-Path $projectRoot 'setup-hosts.ps1'
  if (-not (Test-Path $hostsScript)) {
    throw 'No se encontró setup-hosts.ps1 en la raíz del proyecto.'
  }

  $powershellExe = Join-Path $PSHOME 'powershell.exe'
  try {
    $process = Start-Process -FilePath $powershellExe -Verb RunAs -Wait -PassThru -ArgumentList @(
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', $hostsScript
    )

    if ($process.ExitCode -ne 0) {
      Write-Host 'No se pudo actualizar el archivo hosts automáticamente. Se continuará con el flujo usando resolución local en el navegador.' -ForegroundColor Yellow
      return $false
    }

    return $true
  } catch {
    Write-Host 'No se pudo actualizar el archivo hosts automáticamente. Se continuará con el flujo usando resolución local en el navegador.' -ForegroundColor Yellow
    return $false
  }
}

function Invoke-LocalTlsSetup {
  $tlsScript = Join-Path $projectRoot 'scripts\generate-local-certs.ps1'
  if (-not (Test-Path $tlsScript)) {
    throw 'No se encontró scripts/generate-local-certs.ps1 en la raíz del proyecto.'
  }

  & $tlsScript
}

function Test-GitChanges {
  try {
    git rev-parse --is-inside-work-tree | Out-Null
  } catch {
    return $true
  }

  $status = git status --porcelain -- docker-compose.yml .env frontend agroMarket 2>$null
  return [bool]$status
}

function Invoke-ComposeBuildIfNeeded {
  $shouldBuild = $Rebuild -or (Test-GitChanges)
  if ($shouldBuild) {
    if ($Rebuild) {
      docker compose build --no-cache
    } else {
      docker compose build
    }
  } else {
    Write-Host 'No se detectaron cambios relevantes. Se omite docker compose build.' -ForegroundColor Yellow
  }
}

function Wait-ForHealthyContainer {
  param(
    [string]$ContainerName,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $status = docker inspect --format '{{.State.Health.Status}}' $ContainerName 2>$null
    if ($status -eq 'healthy') {
      return
    }

    Start-Sleep -Seconds 3
  }

  throw "El contenedor $ContainerName no alcanzó estado healthy a tiempo."
}

function Open-AgroMarketBrowser {
  $url = 'https://agromarket.dev:8090'
  $resolverRule = '--host-resolver-rules=MAP agromarket.dev 127.0.0.1,EXCLUDE localhost'
  $browserCandidates = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
  )

  foreach ($browserPath in $browserCandidates) {
    if (Test-Path $browserPath) {
      Start-Process -FilePath $browserPath -ArgumentList @($resolverRule, $url) | Out-Null
      Write-Host "Abriendo $url en el navegador con resolución local." -ForegroundColor Cyan
      return
    }
  }

  Write-Host "No encontré Chrome ni Edge en rutas conocidas. Abre $url manualmente si ya configuraste hosts." -ForegroundColor Yellow
}

Assert-DockerRunning
$hostsUpdated = Invoke-HostsSetup
Invoke-LocalTlsSetup

docker compose down --remove-orphans
Invoke-ComposeBuildIfNeeded

docker compose up -d mysql
Wait-ForHealthyContainer -ContainerName 'agromarket-mysql'

docker compose up -d app
Start-Sleep -Seconds 45

docker compose up -d frontend
docker compose ps

if (-not $hostsUpdated) {
  Open-AgroMarketBrowser
}

Write-Host 'AgroMarket disponible en https://agromarket.dev:8090' -ForegroundColor Green