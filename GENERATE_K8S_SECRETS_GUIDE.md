# AgroMarket Kubernetes Secrets Generator

## Descripción

Script PowerShell que genera automáticamente los Kubernetes Secrets para AgroMarket a partir del archivo `.env` local. Codifica los valores en Base64 y crea archivos YAML listos para aplicar al cluster.

---

## Características

✅ Lee variables del archivo `.env` (o `.env.example` como fallback)  
✅ Genera dos secrets separados (backend y frontend)  
✅ Codifica valores en Base64 (requerido por Kubernetes)  
✅ Crea archivos YAML en `k8s/secrets/`  
✅ Actualiza `.gitignore` para proteger los secrets  
✅ Soporta modo DryRun para validación  
✅ Parámetro `-Apply` para aplicar directamente a Kubernetes  
✅ Warnings para variables faltantes  
✅ Compatibilidad: PowerShell 5.1 y PowerShell 7+  
✅ Logging colorizado con timestamps  

---

## Requisitos

- PowerShell 5.1 o superior
- Archivo `.env` en la raíz del proyecto (o `.env.example`)
- `kubectl` (solo si usas parámetro `-Apply`)
- Cluster Kubernetes accesible (solo si usas parámetro `-Apply`)

---

## Uso Básico

### 1. Generar archivos YAML (sin aplicar)

```powershell
.\generate-k8s-secrets.ps1
```

**Resultado**:
- Crea `k8s/secrets/backend-secret.yaml`
- Crea `k8s/secrets/frontend-secret.yaml`
- Actualiza `.gitignore`

### 2. Vista previa sin crear archivos (DryRun)

```powershell
.\generate-k8s-secrets.ps1 -DryRun
```

**Resultado**:
- Muestra los YAML en consola
- NO crea archivos

### 3. Aplicar directamente a Kubernetes

```powershell
.\generate-k8s-secrets.ps1 -Apply
```

**Resultado**:
- Crea los archivos YAML
- Crea namespace `agromarket` si no existe
- Aplica los secrets: `kubectl apply -f k8s/secrets/`
- Verifica que los secrets fueron creados

### 4. Combinar: DryRun + Apply

```powershell
.\generate-k8s-secrets.ps1 -DryRun -Apply
```

**Resultado**: `-Apply` es ignorado (no se aplican con `-DryRun`)

---

## Parámetros

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `-DryRun` | Switch | Simula sin crear archivos | `.\generate-k8s-secrets.ps1 -DryRun` |
| `-Apply` | Switch | Aplica a Kubernetes automáticamente | `.\generate-k8s-secrets.ps1 -Apply` |

---

## Secretos Generados

### Backend Secret
**Nombre**: `agromarket-backend-secret`  
**Namespace**: `agromarket`

**Variables incluidas**:
```
DB_HOST              → Base de datos host
DB_PORT              → Base de datos puerto
DB_NAME              → Nombre de BD
DB_USERNAME          → Usuario BD
DB_PASSWORD          → Contraseña BD
JWT_SECRET           → Secreto JWT
JWT_EXPIRATION       → Expiración JWT (default: 3600)
MAIL_HOST            → Host SMTP
MAIL_PORT            → Puerto SMTP
MAIL_USERNAME        → Usuario email
MAIL_PASSWORD        → Contraseña email
GOOGLE_CLIENT_ID     → Google OAuth2 Client ID
GOOGLE_CLIENT_SECRET → Google OAuth2 Client Secret
UPLOADS_PATH         → Directorio de uploads
```

### Frontend Secret
**Nombre**: `agromarket-frontend-secret`  
**Namespace**: `agromarket`

**Variables incluidas**:
```
FRONTEND_BASE_URL    → URL base del frontend
```

---

## Archivos Generados

```
k8s/secrets/
├── backend-secret.yaml   ← Secret del backend
└── frontend-secret.yaml  ← Secret del frontend
```

**Ejemplo de contenido** (backend-secret.yaml):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: agromarket-backend-secret
  namespace: agromarket
type: Opaque
data:
  DB_HOST: bG9jYWxob3N0  # localhost en Base64
  DB_PORT: MzMwNg==      # 3306 en Base64
  JWT_SECRET: Y2hhbmdlLXRoaXM=  # (valores reales en Base64)
  # ... más variables
```

---

## Flujo de Ejecución

```
START
  ↓
Leer .env (o .env.example si no existe)
  ↓
Preparar Backend Secret
  ├─ Incluir variables requeridas
  ├─ Usar defaults si están disponibles
  └─ Mostrar warnings para variables faltantes
  ↓
Preparar Frontend Secret
  ├─ Incluir variables requeridas
  └─ Mostrar warnings para variables faltantes
  ↓
Generar YAML files
  ↓
[Si DryRun]
  ├─ Mostrar YAML en consola
  └─ Terminar
  ↓
[Si no DryRun]
  ├─ Crear directorio k8s/secrets/
  ├─ Escribir backend-secret.yaml
  ├─ Escribir frontend-secret.yaml
  ├─ Actualizar .gitignore
  └─ [Si Apply]
      ├─ Verificar kubectl
      ├─ Crear namespace agromarket
      ├─ Aplicar secrets a K8s
      └─ Verificar creación
  ↓
Mostrar resumen
  ↓
END
```

---

## Salida Esperada

### Ejecución normal
```
[2026-05-29 14:30:15] ==> AgroMarket Kubernetes Secrets Generator
[2026-05-29 14:30:15] Raíz del proyecto: C:\Users\...\AgroMarket
[2026-05-29 14:30:15] DryRun: False
[2026-05-29 14:30:15] Apply: False

[2026-05-29 14:30:15] ℹ️ Leyendo variables de entorno desde: C:\...\AgroMarket\.env
[2026-05-29 14:30:15] ✓ Se leyeron 45 variables

[2026-05-29 14:30:15] ==> Preparando Backend Secret (agromarket-backend-secret)
[2026-05-29 14:30:15] ✓ DB_HOST
[2026-05-29 14:30:15] ✓ DB_PORT
[2026-05-29 14:30:15] ⚠ JWT_EXPIRATION (usando valor por defecto: 3600)
[2026-05-29 14:30:15] ⚠ GOOGLE_CLIENT_ID (NO ENCONTRADA EN .env)

[2026-05-29 14:30:15] ==> Preparando Frontend Secret (agromarket-frontend-secret)
[2026-05-29 14:30:15] ✓ FRONTEND_BASE_URL

[2026-05-29 14:30:15] ==> Generando YAML para Kubernetes Secrets
[2026-05-29 14:30:15] ✓ Backend Secret YAML generado (14 variables)
[2026-05-29 14:30:15] ✓ Frontend Secret YAML generado (1 variables)

[2026-05-29 14:30:15] ==> Escribiendo archivos YAML
[2026-05-29 14:30:15] ✓ Backend secret guardado: k8s\secrets\backend-secret.yaml
[2026-05-29 14:30:15] ✓ Frontend secret guardado: k8s\secrets\frontend-secret.yaml

[2026-05-29 14:30:15] ==> Actualizando .gitignore
[2026-05-29 14:30:15] ✓ .gitignore actualizado con: k8s/secrets/

[2026-05-29 14:30:15] ==> Resumen
Backend Secret (agromarket-backend-secret):
  Variables procesadas: 12
  Warnings: 2
  Total: 14 en secret

Frontend Secret (agromarket-frontend-secret):
  Variables procesadas: 1
  Warnings: 0
  Total: 1 en secret

Resumen General:
  Total variables procesadas: 13
  Total warnings: 2

Archivos generados:
  ✓ k8s\secrets\backend-secret.yaml
  ✓ k8s\secrets\frontend-secret.yaml
  ✓ Actualizado: .gitignore

✓ Script completado exitosamente

Próximos pasos:
  1. Revisa los archivos generados:
     Get-Content k8s/secrets/backend-secret.yaml
     Get-Content k8s/secrets/frontend-secret.yaml

  2. Aplica a Kubernetes:
     .\generate-k8s-secrets.ps1 -Apply

  3. Verifica los secrets:
     kubectl get secrets -n agromarket
     kubectl describe secret agromarket-backend-secret -n agromarket
```

### Con modo DryRun
```
[2026-05-29 14:30:15] ==> AgroMarket Kubernetes Secrets Generator
...
[2026-05-29 14:30:15] ℹ️ [DRY-RUN] Los siguientes archivos SERÍAN creados:
  - C:\...\AgroMarket\k8s\secrets\backend-secret.yaml
  - C:\...\AgroMarket\k8s\secrets\frontend-secret.yaml
[2026-05-29 14:30:15] ℹ️ [DRY-RUN] .gitignore SERÍA actualizado con: k8s/secrets/

========== BACKEND SECRET YAML ==========
apiVersion: v1
kind: Secret
metadata:
  name: agromarket-backend-secret
  namespace: agromarket
type: Opaque
data:
  DB_HOST: bG9jYWxob3N0
  DB_PORT: MzMwNg==
  ... (más variables)

========== FRONTEND SECRET YAML ==========
apiVersion: v1
kind: Secret
metadata:
  name: agromarket-frontend-secret
  namespace: agromarket
type: Opaque
data:
  FRONTEND_BASE_URL: aHR0cDovL2xvY2FsaG9zdDozMDAw
```

---

## Warnings Comunes

### Warning: Variable NO ENCONTRADA EN .env

```
[2026-05-29 14:30:15] ⚠ GOOGLE_CLIENT_ID (NO ENCONTRADA EN .env)
```

**Significado**: La variable se requiere pero no existe en `.env`

**Solución**:
1. Agregar la variable a `.env`:
   ```bash
   echo "GOOGLE_CLIENT_ID=tu-client-id" >> .env
   ```
2. Volver a ejecutar el script

### Warning: usando valor por defecto

```
[2026-05-29 14:30:15] ⚠ JWT_EXPIRATION (usando valor por defecto: 3600)
```

**Significado**: Variable no encontrada, usando valor por defecto

**Solución**: Opcional, el valor por defecto funciona pero puedes personalizar en `.env`

---

## Verificación de Secrets

### Ver lista de secrets
```powershell
kubectl get secrets -n agromarket
```

**Salida esperada**:
```
NAME                               TYPE     DATA   AGE
agromarket-backend-secret          Opaque   14     2m
agromarket-frontend-secret         Opaque   1      2m
```

### Ver detalle de un secret
```powershell
kubectl describe secret agromarket-backend-secret -n agromarket
```

### Decodificar un valor (solo para verificación)
```powershell
kubectl get secret agromarket-backend-secret -n agromarket -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

---

## Seguridad

⚠️ **IMPORTANTE**:

1. **Los archivos `k8s/secrets/*.yaml` NUNCA deben subirse a Git**
   - El script actualiza `.gitignore` automáticamente
   - Verifica que `k8s/secrets/` esté en `.gitignore`

2. **Los nombres de las variables se muestran, los valores NO**
   - El script solo muestra: `✓ DB_PASSWORD`
   - Nunca muestra el valor real (por seguridad)

3. **En producción**:
   - No uses `.env` files en el filesystem
   - Usa gestores de secretos: Kubernetes Sealed Secrets, Vault, AWS Secrets Manager
   - Implementa RBAC para limitar acceso a los secrets

---

## Troubleshooting

### Error: "kubectl no está disponible en PATH"

```
✗ kubectl no está disponible en PATH
```

**Solución**:
```powershell
# Instalar kubectl
choco install kubernetes-cli

# O verificar si está en PATH
kubectl version --client
```

### Error: "Namespace no existe y no tengo permisos para crearlo"

```
✗ Error creando namespace
```

**Solución**:
```powershell
# Crear namespace manualmente
kubectl create namespace agromarket

# O usar un namespace existente
# (Editar el script para cambiar $namespace = "otro-namespace")
```

### Los valores en YAML están vacíos

```
DB_PASSWORD: 
```

**Solución**:
1. Verifica que las variables estén en `.env`
```powershell
Get-Content .env | grep DB_PASSWORD
```

2. Las variables deben tener valores no vacíos:
```
DB_PASSWORD=tu-contraseña-real
```

### Error: "k8s/secrets/ directory does not exist"

```
✗ Error escribiendo archivos
```

**Solución**:
```powershell
# El script debería crear el directorio automáticamente
# Si no, créalo manualmente
mkdir k8s\secrets
```

---

## Casos de Uso

### 1. Configuración Inicial
```powershell
# Copiar .env.example a .env
cp .env.example .env

# Editar .env con valores reales
# ... (agregar valores)

# Generar secrets
.\generate-k8s-secrets.ps1

# Aplicar a Kubernetes
.\generate-k8s-secrets.ps1 -Apply
```

### 2. Actualizar Secrets Existentes
```powershell
# Editar .env con nuevos valores
# ... (cambiar valores)

# Regenerar secrets (generará nuevos YAML)
.\generate-k8s-secrets.ps1

# Aplicar cambios a Kubernetes
.\generate-k8s-secrets.ps1 -Apply

# K8s actualizará los secrets existentes
```

### 3. Validación sin cambios
```powershell
# Ver qué YAML se generaría
.\generate-k8s-secrets.ps1 -DryRun

# Ver detalles específicos
Get-Content k8s/secrets/backend-secret.yaml
```

### 4. Pipeline CI/CD
```powershell
# En tu pipeline
$env:KUBECONFIG = "path/to/kubeconfig"
.\generate-k8s-secrets.ps1 -Apply

# El script creará los secrets automáticamente
```

---

## Variables de Referencia

### Backend Secret - Variables Esperadas

```
DB_HOST              (requerido) - Host de la BD
DB_PORT              (requerido) - Puerto de la BD (ej: 3306)
DB_NAME              (requerido) - Nombre de la BD
DB_USERNAME          (requerido) - Usuario BD
DB_PASSWORD          (requerido) - Contraseña BD
JWT_SECRET           (requerido) - Secreto para JWT (mínimo 256 bits)
JWT_EXPIRATION       (opcional)  - Expiración JWT en segundos (default: 3600)
MAIL_HOST            (requerido) - Host SMTP
MAIL_PORT            (requerido) - Puerto SMTP (ej: 1025 para MailHog, 587 para SMTP)
MAIL_USERNAME        (requerido) - Usuario email
MAIL_PASSWORD        (requerido) - Contraseña email
GOOGLE_CLIENT_ID     (requerido) - Google OAuth2 Client ID
GOOGLE_CLIENT_SECRET (requerido) - Google OAuth2 Client Secret
UPLOADS_PATH         (requerido) - Directorio para subidas (ej: uploads)
```

### Frontend Secret - Variables Esperadas

```
FRONTEND_BASE_URL    (requerido) - URL base del frontend (ej: http://localhost:3000)
```

---

## Ejemplo Completo

### 1. Archivo .env
```dotenv
DB_HOST=mysql.agromarket.svc.cluster.local
DB_PORT=3306
DB_NAME=agromarket_db
DB_USERNAME=agromarket_user
DB_PASSWORD=super-secret-password-12345
JWT_SECRET=very-long-secret-key-minimum-256-bits-change-me-in-production
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@agromarket.com
MAIL_PASSWORD=app-specific-password
GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghij123456
UPLOADS_PATH=/app/uploads
FRONTEND_BASE_URL=https://agromarket.local
```

### 2. Ejecutar script
```powershell
.\generate-k8s-secrets.ps1 -DryRun
# Revisar salida

.\generate-k8s-secrets.ps1
# Crear archivos

.\generate-k8s-secrets.ps1 -Apply
# Aplicar a Kubernetes
```

### 3. Verificar
```powershell
kubectl get secrets -n agromarket
kubectl describe secret agromarket-backend-secret -n agromarket
```

---

## Colores en Salida

```
🔵 Cyan   (==>) Sección importante
🟢 Verde  (✓)  Éxito / Variable encontrada
🟡 Amarillo (ℹ️/⚠) Información / Warning
🔴 Rojo   (✗)  Error
```

---

## Compatibilidad

✅ PowerShell 5.1 (Windows PowerShell)  
✅ PowerShell 7+ (PowerShell Core)  
✅ Windows 7, 10, 11, Server 2016+  
✅ Linux (con PowerShell 7+)  
✅ macOS (con PowerShell 7+)  

---

## Soporte

Para reportar problemas o preguntas:
1. Ejecuta con `-DryRun` para ver el output completo
2. Verifica que `.env` tenga todas las variables
3. Asegúrate de que `kubectl` esté instalado y accesible
4. Revisa los permisos en `k8s/` directory

---

**Última actualización**: May 29, 2026  
**Versión**: 1.0  
**Estado**: Producción ✓

