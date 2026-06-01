param(
  [string]$Domain = 'agromarket.dev'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$certDir = Join-Path $projectRoot 'frontend\certs'
$certFile = Join-Path $certDir "$Domain.pem"
$keyFile = Join-Path $certDir "$Domain-key.pem"

function Get-MkcertPath {
  $mkcert = Get-Command mkcert -ErrorAction SilentlyContinue
  if ($mkcert) {
    return $mkcert.Source
  }

  $wingetLink = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\mkcert.exe'
  if (Test-Path $wingetLink) {
    return $wingetLink
  }

  throw 'mkcert no está instalado. Instálalo y ejecuta: mkcert -install. Después vuelve a correr scripts/generate-local-certs.ps1.'
}

New-Item -ItemType Directory -Force -Path $certDir | Out-Null
$mkcertPath = Get-MkcertPath

& $mkcertPath -install | Out-Null
& $mkcertPath -cert-file $certFile -key-file $keyFile $Domain localhost 127.0.0.1 ::1

Write-Host "Certificado generado en: $certFile" -ForegroundColor Green
Write-Host "Clave generada en: $keyFile" -ForegroundColor Green