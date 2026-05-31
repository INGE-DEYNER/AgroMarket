[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [switch]$Apply,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ============================================================================
# Utility Functions
# ============================================================================

function Get-Timestamp {
  return (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
}

function Write-Step([string]$Message) {
  Write-Host "`n[$(Get-Timestamp)] ==> $Message" -ForegroundColor Cyan
}

function Write-Success([string]$Message) {
  Write-Host ("[$(Get-Timestamp)] OK: " + $Message) -ForegroundColor Green
}

function Write-Info([string]$Message) {
  Write-Host ("[$(Get-Timestamp)] INFO: " + $Message) -ForegroundColor Cyan
}

function Write-Warning2([string]$Message) {
  Write-Host ("[$(Get-Timestamp)] WARN: " + $Message) -ForegroundColor Yellow
}

function Write-Error2([string]$Message) {
  Write-Host ("[$(Get-Timestamp)] ERROR: " + $Message) -ForegroundColor Red
}

# Function to encode string to Base64
function ConvertTo-Base64([string]$Value) {
  if ([string]::IsNullOrEmpty($Value)) {
    return ""
  }
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  return [Convert]::ToBase64String($bytes)
}

# Function to parse .env file
function Get-EnvVariables([string]$EnvPath) {
  $env_vars = @{}

  if (-not (Test-Path $EnvPath)) {
    Write-Warning2 "Archivo $EnvPath no encontrado"
    return $env_vars
  }

  Get-Content $EnvPath | ForEach-Object {
    $line = $_.Trim()

    # Skip empty lines and comments
    if ([string]::IsNullOrEmpty($line) -or $line.StartsWith("#")) {
      return
    }

    # Parse key=value
    if ($line -match "^([^=]+)=(.*)$") {
      $key = $matches[1].Trim()
      $value = $matches[2].Trim()

      # Remove quotes if present
      if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      if ($value.StartsWith("'") -and $value.EndsWith("'")) {
        $value = $value.Substring(1, $value.Length - 2)
      }

      $env_vars[$key] = $value
    }
  }

  return $env_vars
}

# Function to create Secret YAML
function New-KubernetesSecret {
  param(
    [string]$Name,
    [string]$Namespace,
    [hashtable]$Data
  )

  $yaml = @"
apiVersion: v1
kind: Secret
metadata:
  name: $Name
  namespace: $Namespace
type: Opaque
data:
"@

  foreach ($key in $Data.Keys) {
    $encodedValue = ConvertTo-Base64 $Data[$key]
    $yaml += "`n  $key`: $encodedValue"
  }

  return $yaml
}

# ============================================================================
# Main Script
# ============================================================================

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }
$root = (Resolve-Path $root).Path

Write-Step "AgroMarket Kubernetes Secrets Generator"
Write-Host ("Raiz del proyecto: " + $root)
Write-Host "DryRun: $DryRun"
Write-Host "Apply: $Apply"
Write-Host ""

# Paths
$envPath = Join-Path $root ".env"
$envExamplePath = Join-Path $root ".env.example"
$targetEnvPath = if (Test-Path $envPath) { $envPath } else { $envExamplePath }
$secretsDir = Join-Path (Join-Path $root "k8s") "secrets"
$gitignorePath = Join-Path $root ".gitignore"
$namespace = "agromarket"

# Backend secret variables mapping
$backendRequiredVars = @{
  "DB_HOST" = $null
  "DB_PORT" = $null
  "DB_NAME" = $null
  "DB_USERNAME" = $null
  "DB_PASSWORD" = $null
  "JWT_SECRET" = $null
  "JWT_EXPIRATION" = "3600"  # default if not found
  "MAIL_HOST" = $null
  "MAIL_PORT" = $null
  "MAIL_USERNAME" = $null
  "MAIL_PASSWORD" = $null
  "GOOGLE_CLIENT_ID" = $null
  "GOOGLE_CLIENT_SECRET" = $null
  "UPLOADS_PATH" = "uploads"  # fallback name
}

# Frontend secret variables mapping
$frontendRequiredVars = @{
  "FRONTEND_BASE_URL" = $null
}

Write-Info "Leyendo variables de entorno desde: $targetEnvPath"
$envVars = Get-EnvVariables -EnvPath $targetEnvPath
Write-Success "Se leyeron $(($envVars.Keys | Measure-Object).Count) variables"

# Prepare backend secret data
Write-Step "Preparando Backend Secret (agromarket-backend-secret)"
$backendSecretData = @{}
$backendWarnings = 0
$backendProcessed = 0

foreach ($var in $backendRequiredVars.Keys) {
  if ($envVars.ContainsKey($var) -and -not [string]::IsNullOrEmpty($envVars[$var])) {
    $backendSecretData[$var] = $envVars[$var]
    Write-Success ("  OK: " + $var)
    $backendProcessed++
  } else {
    if ($null -ne $backendRequiredVars[$var]) {
      # Use default value
      $backendSecretData[$var] = $backendRequiredVars[$var]
      Write-Warning2 ("  WARN: " + $var + " (usando valor por defecto: " + $backendRequiredVars[$var] + ")")
      $backendWarnings++
    } else {
      # Variable not found and no default
      Write-Warning2 ("  WARN: " + $var + " (NO ENCONTRADA EN .env)")
      $backendWarnings++
    }
  }
}

# Prepare frontend secret data
Write-Step "Preparando Frontend Secret (agromarket-frontend-secret)"
$frontendSecretData = @{}
$frontendWarnings = 0
$frontendProcessed = 0

foreach ($var in $frontendRequiredVars.Keys) {
  if ($envVars.ContainsKey($var) -and -not [string]::IsNullOrEmpty($envVars[$var])) {
    $frontendSecretData[$var] = $envVars[$var]
    Write-Success ("  OK: " + $var)
    $frontendProcessed++
  } else {
    Write-Warning2 ("  WARN: " + $var + " (NO ENCONTRADA EN .env)")
    $frontendWarnings++
  }
}

# Generate YAML content
Write-Step "Generando YAML para Kubernetes Secrets"

$backendYaml = New-KubernetesSecret -Name "agromarket-backend-secret" -Namespace $namespace -Data $backendSecretData
$frontendYaml = New-KubernetesSecret -Name "agromarket-frontend-secret" -Namespace $namespace -Data $frontendSecretData

Write-Success "Backend Secret YAML generado ($(($backendSecretData.Keys | Measure-Object).Count) variables)"
Write-Success "Frontend Secret YAML generado ($(($frontendSecretData.Keys | Measure-Object).Count) variables)"

# Show YAML preview
if ($DryRun) {
  Write-Host "`n========== BACKEND SECRET YAML ==========" -ForegroundColor Cyan
  Write-Host $backendYaml

  Write-Host "`n========== FRONTEND SECRET YAML ==========" -ForegroundColor Cyan
  Write-Host $frontendYaml
}

# Create secrets directory and write files
if (-not $DryRun) {
  Write-Step "Escribiendo archivos YAML"

  if (-not (Test-Path $secretsDir)) {
    New-Item -ItemType Directory -Path $secretsDir -Force | Out-Null
    Write-Success "Directorio creado: $secretsDir"
  }

  # Write backend secret
  $backendSecretPath = Join-Path $secretsDir "backend-secret.yaml"
  Set-Content -Path $backendSecretPath -Value $backendYaml -Encoding UTF8
  Write-Success "Backend secret guardado: $backendSecretPath"

  # Write frontend secret
  $frontendSecretPath = Join-Path $secretsDir "frontend-secret.yaml"
  Set-Content -Path $frontendSecretPath -Value $frontendYaml -Encoding UTF8
  Write-Success "Frontend secret guardado: $frontendSecretPath"

  # Update .gitignore
  Write-Step "Actualizando .gitignore"

  $gitignoreEntry = "k8s/secrets/"

  if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw

    if ($gitignoreContent -match [regex]::Escape($gitignoreEntry)) {
      Write-Info ".gitignore ya contiene: $gitignoreEntry"
    } else {
      Add-Content -Path $gitignorePath -Value "`n$gitignoreEntry" -Encoding UTF8
      Write-Success ".gitignore actualizado con: $gitignoreEntry"
    }
  } else {
    Set-Content -Path $gitignorePath -Value $gitignoreEntry -Encoding UTF8
    Write-Success ".gitignore creado con: $gitignoreEntry"
  }
} else {
  Write-Info "[DRY-RUN] Los siguientes archivos SERAN generados (sin -DryRun):"
    Write-Host "  - $(Join-Path $secretsDir 'backend-secret.yaml')" -ForegroundColor DarkGray
    Write-Host "  - $(Join-Path $secretsDir 'frontend-secret.yaml')" -ForegroundColor DarkGray
  Write-Info "[DRY-RUN] .gitignore SERA actualizado con: k8s/secrets/"
}

# Apply secrets to Kubernetes if requested
if ($Apply -and -not $DryRun) {
  Write-Step "Aplicando Secrets a Kubernetes"

  # Check if kubectl is available
  if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error2 "kubectl no esta disponible en PATH"
    throw "kubectl not found"
  }

  # Check if namespace exists, create if needed
  Write-Info "Verificando namespace: $namespace"
  $nsExists = kubectl get namespace $namespace 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Info "Namespace no existe. Creando..."
    kubectl create namespace $namespace
    Write-Success "Namespace '$namespace' creado"
  } else {
    Write-Success "Namespace '$namespace' ya existe"
  }

  # Apply secrets
  try {
    Write-Info "Aplicando secrets desde: $secretsDir"
    kubectl apply -f $secretsDir -n $namespace
    Write-Success "Secrets aplicados correctamente"
  } catch {
    Write-Error2 "Error aplicando secrets: $_"
    throw $_
  }

  # Verify secrets
  Write-Info "Verificando secrets creados:"
  kubectl get secrets -n $namespace | Select-String "agromarket"
}

if ($Apply -and $DryRun) {
  Write-Warning2 "[DRY-RUN] Flag -Apply ignorado (incompatible con -DryRun)"
}

# Summary
Write-Step "Resumen"

Write-Host ""
Write-Host "Backend Secret (agromarket-backend-secret):" -ForegroundColor Cyan
Write-Host "  Variables procesadas: $backendProcessed"
Write-Host "  Warnings: $backendWarnings"
Write-Host "  Total: $(($backendSecretData.Keys | Measure-Object).Count) en secret"

Write-Host ""
Write-Host "Frontend Secret (agromarket-frontend-secret):" -ForegroundColor Cyan
Write-Host "  Variables procesadas: $frontendProcessed"
Write-Host "  Warnings: $frontendWarnings"
Write-Host "  Total: $(($frontendSecretData.Keys | Measure-Object).Count) en secret"

Write-Host ""
Write-Host "Resumen General:" -ForegroundColor Cyan
$totalProcessed = $backendProcessed + $frontendProcessed
$totalWarnings = $backendWarnings + $frontendWarnings
Write-Host "  Total variables procesadas: $totalProcessed"
Write-Host "  Total warnings: $totalWarnings"

if (-not $DryRun) {
  Write-Host ""
  Write-Host "Archivos generados:" -ForegroundColor Green
  Write-Host ("  OK: " + (Join-Path $secretsDir "backend-secret.yaml"))
  Write-Host ("  OK: " + (Join-Path $secretsDir "frontend-secret.yaml"))
  Write-Host "  OK: Actualizado .gitignore"
}

Write-Host ""
Write-Success "Script completado exitosamente"

# Show next steps
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
if ($DryRun) {
  Write-Host "  1. Ejecuta sin -DryRun para crear los archivos:"
  Write-Host "     .\generate-k8s-secrets.ps1"
} else {
  Write-Host "  1. Revisa los archivos generados:"
  Write-Host "     Get-Content k8s/secrets/backend-secret.yaml"
  Write-Host "     Get-Content k8s/secrets/frontend-secret.yaml"
  Write-Host ""
  Write-Host "  2. Aplica a Kubernetes:"
  Write-Host "     .\generate-k8s-secrets.ps1 -Apply"
  Write-Host ""
  Write-Host "  3. Verifica los secrets:"
  Write-Host "     kubectl get secrets -n agromarket"
  Write-Host "     kubectl describe secret agromarket-backend-secret -n agromarket"
}



