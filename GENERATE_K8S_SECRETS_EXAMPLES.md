# AgroMarket Secrets Generator - Ejemplos Prácticos

## Escenario 1: Configuración Inicial (Desarrollo Local)

### Paso 1: Crear archivo .env
```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket
cp .env.example .env
```

### Paso 2: Editar .env con valores locales
```powershell
# Editar .env con tu editor favorito
notepad .env

# Contenido típico for desarrollo:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=agromarket_db
# DB_USERNAME=root
# DB_PASSWORD=password123
# JWT_SECRET=development-secret-not-for-production
# MAIL_HOST=localhost
# MAIL_PORT=1025
# GOOGLE_CLIENT_ID=xxx
# GOOGLE_CLIENT_SECRET=xxx
# UPLOADS_PATH=C:\uploads
# FRONTEND_BASE_URL=http://localhost:3000
```

### Paso 3: Validar sin crear nada
```powershell
.\generate-k8s-secrets.ps1 -DryRun
```

**Salida esperada**:
```
[2026-05-29 14:30:15] ==> AgroMarket Kubernetes Secrets Generator
[2026-05-29 14:30:15] ℹ️ Leyendo variables de entorno desde: C:\...\AgroMarket\.env
[2026-05-29 14:30:15] ✓ Se leyeron 30 variables

[2026-05-29 14:30:15] ==> Preparando Backend Secret
[2026-05-29 14:30:15] ✓ DB_HOST
[2026-05-29 14:30:15] ✓ DB_PORT
...

========== BACKEND SECRET YAML ==========
apiVersion: v1
kind: Secret
metadata:
  name: agromarket-backend-secret
  namespace: agromarket
type: Opaque
data:
  DB_HOST: bG9jYWxob3N0  # Este es Base64
  DB_PORT: MzMwNg==
  ...
```

### Paso 4: Generar archivos
```powershell
.\generate-k8s-secrets.ps1
```

### Paso 5: Verificar archivos generados
```powershell
# Ver contenido
Get-Content k8s/secrets/backend-secret.yaml
Get-Content k8s/secrets/frontend-secret.yaml

# Ver en mejor formato
cat k8s/secrets/backend-secret.yaml | more
```

### Paso 6: Aplicar a Kubernetes
```powershell
.\generate-k8s-secrets.ps1 -Apply
```

### Paso 7: Verificar en Kubernetes
```powershell
kubectl get secrets -n agromarket
kubectl describe secret agromarket-backend-secret -n agromarket
```

---

## Escenario 2: Actualizar Secrets Existentes

### Cambiar una contraseña
```powershell
# 1. Editar .env
notepad .env

# 2. Cambiar solo DB_PASSWORD
# DB_PASSWORD=nueva-contraseña-segura

# 3. Validar cambios
.\generate-k8s-secrets.ps1 -DryRun

# 4. Aplicar
.\generate-k8s-secrets.ps1 -Apply
```

**Resultado**: Kubernetes actualiza automáticamente el secret

---

## Escenario 3: Diferentes Ambientes (Staging vs Producción)

### Estructura recomendada
```
AgroMarket/
├── .env.staging        # Variables para staging
├── .env.production     # Variables para producción
├── .env.example        # Template
└── generate-k8s-secrets.ps1
```

### Para Staging
```powershell
# 1. Copiar archivo específico
cp .env.staging .env

# 2. Generar secrets
.\generate-k8s-secrets.ps1 -DryRun

# 3. Aplicar (toma namespace de .env si quieres personalizar)
.\generate-k8s-secrets.ps1 -Apply

# 4. Verificar
kubectl get secrets -n agromarket
```

### Para Producción
```powershell
# 1. Copiar archivo específico
cp .env.production .env

# 2. IMPORTANTE: Revisar DryRun primero
.\generate-k8s-secrets.ps1 -DryRun

# 3. IMPORTANTE: Revisar valores sensibles en .env
# Asegurate de que todas las variables sean valores REALES de producción

# 4. Aplicar
.\generate-k8s-secrets.ps1 -Apply

# 5. Verificar
kubectl get secrets -n agromarket
kubectl describe secret agromarket-backend-secret -n agromarket
```

---

## Escenario 4: Pipeline CI/CD integración

### GitHub Actions
```yaml
name: Deploy Secrets

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Generate K8s Secrets
        run: |
          # Crear .env desde secrets de GitHub
          echo "DB_HOST=${{ secrets.DB_HOST }}" >> .env
          echo "DB_PORT=${{ secrets.DB_PORT }}" >> .env
          echo "DB_NAME=${{ secrets.DB_NAME }}" >> .env
          # ... más variables
          
          # Ejecutar script
          pwsh ./generate-k8s-secrets.ps1 -Apply
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

### Azure DevOps
```yaml
trigger:
  - main

pool:
  vmImage: 'windows-latest'

steps:
  - task: PowerShell@2
    displayName: 'Generate K8s Secrets'
    inputs:
      targetType: 'inline'
      script: |
        # Crear .env desde variables
        "DB_HOST=$env:DB_HOST" | Out-File .env
        "DB_PORT=$env:DB_PORT" | Add-Content .env
        # ... más variables
        
        # Ejecutar script
        .\generate-k8s-secrets.ps1 -Apply
      pwsh: true
    env:
      DB_HOST: $(DB_HOST)
      DB_PASSWORD: $(DB_PASSWORD)
      KUBECONFIG: $(KUBECONFIG)
```

---

## Escenario 5: Rotación de Secretos (Cambiar todas las contraseñas)

### Generar nuevas contraseñas
```powershell
# 1. Generar nuevas contraseñas seguras
Function New-SecurePassword([int]$Length = 32) {
  $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  $password = ''
  for ($i = 0; $i -lt $Length; $i++) {
    $password += $chars[(Get-Random -Maximum $chars.Length)]
  }
  return $password
}

$newDBPassword = New-SecurePassword
$newJWTSecret = New-SecurePassword -Length 256
$newMailPassword = New-SecurePassword

Write-Host "Nueva DB Password: $newDBPassword"
Write-Host "Nuevo JWT Secret: $newJWTSecret"
Write-Host "Nueva Mail Password: $newMailPassword"
```

### 2. Actualizar .env
```powershell
# Editar manualmente los valores sensibles
notepad .env
```

### 3. Regenerar secrets
```powershell
# Validar
.\generate-k8s-secrets.ps1 -DryRun

# Aplicar
.\generate-k8s-secrets.ps1 -Apply
```

### 4. Verificar en Kubernetes
```powershell
kubectl describe secret agromarket-backend-secret -n agromarket

# Ver timestamp de actualización
kubectl get secrets agromarket-backend-secret -n agromarket -o wide
```

---

## Escenario 6: Verificar y Decodificar Valores

### Ver qué está en los secrets
```powershell
# Ver lista
kubectl get secrets -n agromarket

# Ver tipo y data
kubectl describe secret agromarket-backend-secret -n agromarket
```

### Decodificar un valor específico (SOLO PARA DEBUG)
```powershell
# Decodificar DB_PASSWORD
$encoded = kubectl get secret agromarket-backend-secret -n agromarket `
  -o jsonpath='{.data.DB_PASSWORD}'
$decoded = [System.Text.Encoding]::UTF8.GetString(
  [System.Convert]::FromBase64String($encoded)
)
Write-Host "DB_PASSWORD: $decoded"
```

### Ver todos los valores decodificados (SOLO PARA DEBUG)
```powershell
kubectl get secret agromarket-backend-secret -n agromarket -o json | `
  jq '.data | to_entries[] | {key: .key, value: (.value | @base64d)}'
```

---

## Escenario 7: Backup y Restore de Secrets

### Backup de secrets actuales
```powershell
# Exportar todos los secrets
kubectl get secrets -n agromarket -o yaml > secrets-backup.yaml

# Hacer commit a Git (SOLO si los valores están encriptados)
# git add secrets-backup.yaml
# git commit -m "Backup de secrets"

# O guardar en lugar seguro (nunca en Git!)
Copy-Item secrets-backup.yaml "D:\backups\agromarket-secrets-$(Get-Date -Format 'yyyyMMdd').yaml"
```

### Restaurar secrets
```powershell
# Aplicar desde backup
kubectl apply -f secrets-backup.yaml

# Verificar
kubectl get secrets -n agromarket
```

---

## Escenario 8: Troubleshooting - Variables Faltantes

### Problema: Variable requerida faltante
```powershell
# Salida del script
[2026-05-29 14:30:15] ⚠ GOOGLE_CLIENT_ID (NO ENCONTRADA EN .env)
[2026-05-29 14:30:15] ⚠ GOOGLE_CLIENT_SECRET (NO ENCONTRADA EN .env)
```

### Solución
```powershell
# 1. Ver qué está faltando
.\generate-k8s-secrets.ps1 -DryRun | grep "NO ENCONTRADA"

# 2. Agregar variables faltantes a .env
# (Copiar de .env.example o solicitar valores)

# 3. Verificar que se agregaron
Select-String "GOOGLE_CLIENT_ID" .env

# 4. Regenerar
.\generate-k8s-secrets.ps1 -Apply
```

---

## Escenario 9: Integración con deployment.yaml

### Ver cómo el deployment usa los secrets
```yaml
# En k8s/deployment.yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: agromarket-backend-secret  # Referencia al secret
        key: DB_USERNAME                 # Key dentro del secret
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: agromarket-backend-secret
        key: DB_PASSWORD
```

### Verificar que el pod accede correctamente
```powershell
# Ver variables en el pod
kubectl exec -it <pod-name> -n agromarket -- env | grep DB_

# Ver logs si hay problemas de conexión
kubectl logs <pod-name> -n agromarket
```

---

## Escenario 10: Uso con Docker Compose

### Generar secrets para Docker (diferente a K8s)
```powershell
# k8s secrets son para Kubernetes
# Para Docker Compose, usa archivo .env directamente

# 1. Asegurar que .env existe
Test-Path .env

# 2. Docker-compose lee .env automáticamente
docker-compose up

# 3. Las variables están disponibles en los contenedores
docker-compose exec backend env | grep DB_
```

---

## Checklist de Seguridad

```
☐ .env NO está en Git (verificar .gitignore)
☐ k8s/secrets/ NO está en Git
☐ .env tiene valores REALES para producción
☐ JWT_SECRET es lo suficientemente largo (>256 bits)
☐ Contraseñas son algo fuerte (caracteres especiales, números)
☐ NEVER mostrar outputs con valores en logs públicos
☐ Usar DryRun antes de -Apply
☐ Backup de secrets ANTES de cambios grandes
☐ Rotar secrets regularmente en producción
☐ Acceso a .env limitado (solo ambiente local de dev)
```

---

## Comandos Útiles

```powershell
# Ver estructura del script
Get-Content generate-k8s-secrets.ps1 | Select-Object -First 50

# Ver tamaño de .env
(Get-Item .env).Length

# Contar variables en .env
(Select-String "^[^#]" .env | Measure-Object).Count

# Listar todas las variables en .env
Select-String "^[^#]+" .env -o | ForEach-Object {$_.Matches.Value}

# Buscar variable específica
Select-String "DB_" .env

# Ver todos los secrets en todos los namespaces
kubectl get secrets --all-namespaces
```

---

## Referencias

- Script: `generate-k8s-secrets.ps1`
- Documentación: `GENERATE_K8S_SECRETS_GUIDE.md`
- Quick Ref: `GENERATE_K8S_SECRETS_QUICK.md`
- deployment.yaml usa: `agromarket-backend-secret` y `agromarket-frontend-secret`
- Docs K8s Secrets: https://kubernetes.io/docs/concepts/configuration/secret/

---

**Actualizado**: May 29, 2026

