param()

$ErrorActionPreference = 'Stop'

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
  throw 'Este script debe ejecutarse como Administrador.'
}

$hostsPath = 'C:\Windows\System32\drivers\etc\hosts'
$entry = '127.0.0.1 agromarket.dev'

$hostsContent = Get-Content -Path $hostsPath -ErrorAction Stop
if ($hostsContent -notcontains $entry) {
  [System.IO.File]::AppendAllText($hostsPath, [Environment]::NewLine + $entry + [Environment]::NewLine)
  Write-Host 'Entrada agregada en el archivo hosts.' -ForegroundColor Green
} else {
  Write-Host 'La entrada agromarket.dev ya existe en hosts.' -ForegroundColor Yellow
}

Write-Host 'Abre https://agromarket.dev:8090 en tu navegador' -ForegroundColor Cyan
exit 0