$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = 'C:\Users\Deyner Chaverra\Asafrut\AgroMarket'
$backendDir = Join-Path $repoRoot 'agroMarket'
$frontendDir = Join-Path $repoRoot 'frontend'
$backendImage = 'deydev28/agromarket:0.0.1' # Usar una etiqueta de versión específica
$frontendImage = 'deydev28/agromarket-frontend:0.0.1' # Usar una etiqueta de versión específica

function Write-Step([string]$Message) {
  Write-Host "`n[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ==> $Message" -ForegroundColor Cyan
}

function Fail([string]$Message, [int]$Code = 1) {
  Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] DEPLOY FALLIDO: $Message" -ForegroundColor Red
  exit $Code
}

try {
  Write-Step '1) cd backend y ejecutar mvnw clean verify'
  Set-Location $backendDir
  & .\mvnw clean verify
  if ($LASTEXITCODE -ne 0) { Fail 'mvnw clean verify falló' $LASTEXITCODE }

  Write-Step '2) mvnw -DskipTests package'
  & .\mvnw -DskipTests package
  if ($LASTEXITCODE -ne 0) { Fail 'mvnw package falló' $LASTEXITCODE }

  Write-Step '3) docker build backend'
  & docker build --no-cache -t $backendImage -f Dockerfile .
  if ($LASTEXITCODE -ne 0) { Fail 'docker build backend falló' $LASTEXITCODE }

  Write-Step '4) docker push backend'
  & docker push $backendImage
  if ($LASTEXITCODE -ne 0) { Fail 'docker push backend falló' $LASTEXITCODE }

  Write-Step '5) cd frontend y docker build'
  Set-Location $frontendDir
  & docker build --no-cache -t $frontendImage -f Dockerfile .
  if ($LASTEXITCODE -ne 0) { Fail 'docker build frontend falló' $LASTEXITCODE }

  Write-Step '6) docker push frontend'
  & docker push $frontendImage
  if ($LASTEXITCODE -ne 0) { Fail 'docker push frontend falló' $LASTEXITCODE }

  Write-Step '7) kubectl rollout restart backend'
  & kubectl -n default rollout restart deployment agromarket
  if ($LASTEXITCODE -ne 0) { Fail 'rollout restart backend falló' $LASTEXITCODE }

  Write-Step '8) kubectl rollout restart frontend'
  & kubectl -n default rollout restart deployment agromarket-frontend
  if ($LASTEXITCODE -ne 0) { Fail 'rollout restart frontend falló' $LASTEXITCODE }

  Write-Step '9) kubectl rollout status backend'
  & kubectl -n default rollout status deployment/agromarket --timeout=180s
  if ($LASTEXITCODE -ne 0) { Fail 'rollout status backend falló' $LASTEXITCODE }

  Write-Step '10) kubectl rollout status frontend'
  & kubectl -n default rollout status deployment/agromarket-frontend --timeout=180s
  if ($LASTEXITCODE -ne 0) { Fail 'rollout status frontend falló' $LASTEXITCODE }

  Write-Step '11) kubectl get pods -o wide'
  & kubectl -n default get pods -o wide
  if ($LASTEXITCODE -ne 0) { Fail 'kubectl get pods falló' $LASTEXITCODE }

  Write-Host 'DEPLOY COMPLETADO' -ForegroundColor Green
  exit 0
}
catch {
  Fail $_.Exception.Message
}
