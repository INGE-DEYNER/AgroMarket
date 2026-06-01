<#
Add-Hosts.ps1
Este script añade la entrada `127.0.0.1 agromarket.dev` al archivo hosts de Windows.
Uso: ejecutar PowerShell como Administrador y lanzar:

  powershell -ExecutionPolicy Bypass -File .\scripts\add-hosts.ps1

El script hace copia de seguridad del hosts original y evita duplicados.
#>

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$backupPath = "$hostsPath.bak.$((Get-Date).ToString('yyyyMMddHHmmss'))"
$entry = "127.0.0.1 agromarket.dev"

function Require-Admin {
    $current = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($current)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Error "Este script debe ejecutarse como Administrador. Abre PowerShell como 'Ejecutar como administrador'."
        exit 1
    }
}

Require-Admin

if (-not (Test-Path $hostsPath)) {
    Write-Error "No se encontró el archivo hosts en $hostsPath"
    exit 1
}

# Crear backup
Copy-Item -Path $hostsPath -Destination $backupPath -ErrorAction Stop
Write-Host "Backup creado en: $backupPath"

# Leer contenido y comprobar existencia
$contents = Get-Content -Path $hostsPath -ErrorAction Stop
if ($contents -match 'agromarket.dev') {
    Write-Host "Ya existe una entrada para 'agromarket.dev' en hosts. No se harán cambios."
    exit 0
}

# Añadir entrada
Add-Content -Path $hostsPath -Value "`n$entry"
Write-Host "Entrada añadida: $entry"
Write-Host "Operación completada. Si el navegador ya estaba abierto, cierra y vuelve a abrirlo para que tome la nueva entrada hosts."