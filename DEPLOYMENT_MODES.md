# AgroMarket Deploy Script - Modos de Despliegue

## Descripción General

El script `deploy.ps1` ha sido completamente reescrito para soportar tres modos de despliegue con funcionalidad específica para Kubernetes que incluye:

- ✅ Verificación de kubectl y cluster
- ✅ Creación automática de namespace
- ✅ Aplicación secuencial de manifiestos
- ✅ Espera de rollouts con timeout configurable
- ✅ Verificación de salud de pods
- ✅ Logging colorizado con timestamps
- ✅ Manejo de errores con diagnostico detallado
- ✅ Resumen final con URLs de acceso

---

## Parámetros del Script

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `-Mode` | String | `Local` | Modo de despliegue: `Local`, `Docker`, `Kubernetes` |
| `-Build` | Switch | `$false` | Compilar backend antes de desplegar |
| `-DryRun` | Switch | `$false` | Simular sin aplicar cambios reales |
| `-Namespace` | String | `agromarket` | Namespace de Kubernetes (solo para modo K8s) |
| `-Tag` | String | `latest` | Tag de imagen Docker |
| `-K8sPath` | String | `k8s` | Ruta a manifiestos Kubernetes |
| `-ComposeFile` | String | `docker-compose.yml` | Archivo Docker Compose |
| `-AppDir` | String | `agroMarket` | Directorio del backend |
| `-FrontendDir` | String | `frontend` | Directorio del frontend |

---

## Modo Local

Ejecuta el backend Spring Boot localmente con Maven.

### Uso Básico

```powershell
# Ejecutar backend en local
.\deploy.ps1 -Mode Local

# Compilar y ejecutar
.\deploy.ps1 -Mode Local -Build
```

### Salida Esperada

```
[2026-05-29 10:15:23] ==> AgroMarket Deployment Helper
[2026-05-29 10:15:23] Modo        : Local
...
[2026-05-29 10:15:23] Sugerencia: en otra terminal puedes levantar el frontend con:
  cd "C:\Users\...\AgroMarket\frontend"; python -m http.server 3000
```

### Acceso

- **Backend/API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Frontend**: http://localhost:3000 (ejecutar en otra terminal)

---

## Modo Docker (Docker Compose)

Despliega todos los servicios usando Docker Compose.

### Uso Básico

```powershell
# Desplegar con Docker Compose
.\deploy.ps1 -Mode Docker

# Compilar y desplegar
.\deploy.ps1 -Mode Docker -Build
```

### Validaciones

1. ✅ Docker disponible (`docker --version`)
2. ✅ Archivo `docker-compose.yml` existe
3. ✅ Sintaxis válida de compose
4. ✅ Servicios levantados correctamente

### Servicios Levantados

- **Backend**: Spring Boot 3 en puerto 8080
- **Frontend**: Nginx en puerto 80
- **MySQL 8.4**: Base de datos en puerto 3306

### Acceso

- **Backend/API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Frontend**: http://localhost
- **MySQL**: localhost:3306

### Comandos Útiles

```powershell
# Ver logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

---

## Modo Kubernetes ⭐ (Nuevo)

Despliegue completo en cluster Kubernetes con validaciones exhaustivas.

### Requisitos Previos

1. **kubectl instalado**: `kubectl version --client`
2. **Cluster Kubernetes accesible**: `kubectl cluster-info`
3. **Permisos suficientes**: Crear namespaces y recursos

### Uso Básico

```powershell
# Despliegue en K8s (namespace default: "agromarket")
.\deploy.ps1 -Mode Kubernetes

# Especificar namespace personalizado
.\deploy.ps1 -Mode Kubernetes -Namespace prod

# Simular despliegue sin cambios reales
.\deploy.ps1 -Mode Kubernetes -DryRun

# Despliegue con validación de sintaxis
.\deploy.ps1 -Mode Kubernetes -DryRun
```

### Pasos de Ejecución

#### 1️⃣ Verificaciones Iniciales

```
[2026-05-29 10:20:15] ✓ kubectl encontrado
[2026-05-29 10:20:16] ✓ Conectado al cluster Kubernetes
[2026-05-29 10:20:16] ✓ Directorio k8s encontrado
```

#### 2️⃣ Gestión de Namespace

Se verifica que el namespace existe; si no, se crea automáticamente:

```
[2026-05-29 10:20:17] ℹ️ Verificando namespace 'agromarket'
[2026-05-29 10:20:17] ✓ Namespace 'agromarket' creado
```

#### 3️⃣ Validación de Manifiestos

Se valida la sintaxis sin aplicar cambios:

```
[2026-05-29 10:20:18] ℹ️ Validando manifiestos con --dry-run=client
[2026-05-29 10:20:20] ✓ Manifiestos validados correctamente
```

#### 4️⃣ Aplicación Secuencial

Los manifiestos se aplican en orden específico:

```
[2026-05-29 10:20:21] ℹ️ Paso 1/5: Aplicando ConfigMap y Secrets
[2026-05-29 10:20:22] ✓ ConfigMap aplicado
[2026-05-29 10:20:23] ✓ Secrets aplicados
[2026-05-29 10:20:24] ℹ️ Paso 2/5: Aplicando Deployment
[2026-05-29 10:20:25] ✓ Deployment aplicado
[2026-05-29 10:20:26] ℹ️ Paso 3/5: Aplicando Service
[2026-05-29 10:20:27] ✓ Service aplicado
[2026-05-29 10:20:28] ℹ️ Paso 4/5: Aplicando Ingress
[2026-05-29 10:20:29] ✓ Ingress aplicado
[2026-05-29 10:20:30] ℹ️ Paso 5/5: Aplicando CronJob de backup
[2026-05-29 10:20:31] ✓ CronJob de backup aplicado
```

#### 5️⃣ Espera de Rollout

```
[2026-05-29 10:20:32] ℹ️ Esperando rollout del deployment agromarket...
[2026-05-29 10:20:37] ✓ Rollout completado: deployment/agromarket
```

#### 6️⃣ Verificación de Pods

```
[2026-05-29 10:20:38] ✓ Pod agromarket-6d8f5d7c9-abc12 está Running
[2026-05-29 10:20:38] ✓ Pod agromarket-6d8f5d7c9-xyz98 está Running
[2026-05-29 10:20:38] ✓ Todos los pods están en estado Running
```

#### 7️⃣ Información de Acceso

```
[2026-05-29 10:20:39] ==> Información del Ingress
[2026-05-29 10:20:40] ✓ Ingress encontrado: agromarket-ingress
  🔒 URL: https://agromarket.local
```

#### 8️⃣ Resumen Final

```
[2026-05-29 10:20:41] ==> Resumen del despliegue
Namespace: agromarket
Pods activos:
NAME                          READY   STATUS    RESTARTS   AGE
agromarket-6d8f5d7c9-abc12   1/1     Running   0          5s
agromarket-6d8f5d7c9-xyz98   1/1     Running   0          3s

Deployments:
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
agromarket   2/2     2            2           10s

Servicios:
NAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
agromarket-service    ClusterIP   10.43.12.34     <none>        80/TCP    9s
```

### Manifiestos Aplicados (orden)

| Orden | Archivo | Propósito |
|-------|---------|----------|
| 1 | `configmap.yaml` | Configuración de aplicación (frontend_base_url, etc.) |
| 1 | `secret-example.yaml` | Secretos sensibles (DB, JWT, OAuth2) |
| 2 | `deployment.yaml` | Deployment backend + frontend (replicas, probes, recursos) |
| 3 | `service.yaml` | Service ClusterIP para acceso interno |
| 4 | `ingress.yaml` | Ingress con TLS para acceso externo |
| 5 | `mysql-backup-cronjob.yaml` | CronJob para backups automáticos (diarios 02:00) |

### Manejo de Errores

Si un pod falla durante el rollout:

```
[2026-05-29 10:20:50] ✗ Rollout del deployment falló o expiró
[2026-05-29 10:20:51] ℹ️ Obteniendo detalles de pods fallidos...
[2026-05-29 10:20:52] ✗ Describiendo pod fallido: agromarket-xyz98
Name:         agromarket-xyz98
Namespace:    agromarket
Status:       CrashLoopBackOff
...
[Eventos detallados del pod para diagnosticar]
```

### Acceso Post-Despliegue

Después del despliegue exitoso:

```powershell
# Ver logs en tiempo real
kubectl logs -f deployment/agromarket -n agromarket

# Port-forward para debug local
kubectl port-forward svc/agromarket-service 8080:80 -n agromarket

# Describir un pod específico
kubectl describe pod <pod-name> -n agromarket

# Ejecutar comando en pod
kubectl exec -it <pod-name> -n agromarket -- /bin/bash

# Ver eventos del namespace
kubectl get events -n agromarket --sort-by='.lastTimestamp'
```

---

## Troubleshooting

### "kubectl no está disponible en PATH"

```powershell
# Verificar instalación
Get-Command kubectl

# Agregar al PATH
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"
```

### "No se pudo conectar al cluster Kubernetes"

```powershell
# Verificar contexto actual
kubectl config current-context

# Listar contextos disponibles
kubectl config get-contexts

# Cambiar contexto
kubectl config use-context <context-name>
```

### "Timeout esperando rollout"

El pod está tardando más de 5 minutos en estar listo:

```powershell
# Ver logs del pod
kubectl logs -f deployment/agromarket -n agromarket

# Describir pod para diagnosticar
kubectl describe pod -n agromarket -l app=agromarket

# Verificar recursos
kubectl top nodes
kubectl top pod -n agromarket
```

### "Algunos pods no están en estado Running"

```powershell
# Ver eventos
kubectl get events -n agromarket

# Ver logs del contenedor
kubectl logs <pod-name> -n agromarket

# Verificar probes
kubectl describe pod <pod-name> -n agromarket
```

---

## Características de Logging

Todos los eventos incluyen:
- ⏰ **Timestamp**: `yyyy-MM-dd HH:mm:ss`
- 🎨 **Color**: Verde (✓), Amarillo (ℹ️), Rojo (✗), Cyan (==>)
- 📝 **Contexto**: Qué se está haciendo y por qué

```
[2026-05-29 10:20:15] ✓ Éxito - operación completada
[2026-05-29 10:20:16] ℹ️ Info - progreso de pasos
[2026-05-29 10:20:17] ✗ Error - algo salió mal
[2026-05-29 10:20:18] ==> Paso - sección importante
```

---

## Modo DryRun

Simula toda la ejecución sin hacer cambios reales:

```powershell
# Ver lo que se haría sin ejecutar
.\deploy.ps1 -Mode Kubernetes -DryRun

# Salida
[2026-05-29 10:20:15] ℹ️ [DRY-RUN] Comando no ejecutado
[2026-05-29 10:20:16] ℹ️ Validando manifiestos con --dry-run=client
[2026-05-29 10:20:18] ✓ Manifiestos validados correctamente
[2026-05-29 10:20:19] ℹ️ [DRY-RUN] Manifiestos no fueron aplicados
```

---

## Ejemplos Completos

### 1. Desarrollo Local con Build

```powershell
# Compilar backend y ejecutar localmente
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket
.\deploy.ps1 -Mode Local -Build
```

### 2. Docker Compose para Testing

```powershell
# Stack completo con Docker Compose
.\deploy.ps1 -Mode Docker -Build
```

### 3. Despliegue en Kubernetes (Staging)

```powershell
# Despliegue con validación y espera de rollout
.\deploy.ps1 -Mode Kubernetes -Namespace staging
```

### 4. Despliegue en Kubernetes (Producción)

```powershell
# Despliegue completo con namespace custom
.\deploy.ps1 -Mode Kubernetes -Namespace prod -Tag "v1.0.0"
```

### 5. Verificación Previa (DryRun)

```powershell
# Validar manifiestos sin aplicar
.\deploy.ps1 -Mode Kubernetes -DryRun -Namespace production
```

---

## Validaciones Realizadas

### Modo Local
- ✅ Backend path existe
- ✅ Maven disponible

### Modo Docker
- ✅ Backend path existe
- ✅ Docker instalado
- ✅ docker-compose.yml existe
- ✅ Sintaxis de compose válida

### Modo Kubernetes
- ✅ kubectl instalado y funcional
- ✅ Cluster Kubernetes accesible
- ✅ Directorio k8s existe
- ✅ Namespace existe o es creado
- ✅ Manifiestos válidos (dry-run)
- ✅ Pods en estado Running
- ✅ Rollout completado exitosamente

---

## Resumen de Cambios

| Aspecto | Anterior | Nuevo |
|--------|----------|-------|
| Modos soportados | 3 | 3 (mejorado) |
| Namespace | `default` (fijo) | `agromarket` (configurable) |
| Validaciones K8s | Básicas | Exhaustivas |
| Logging | Minimal | Colorizado + timestamps |
| Rollout | Manual | Automático con timeout |
| Diagnóstico | No | Detallado con describe pod |
| DryRun K8s | Parcial | Completo |
| Resumen final | No | Sí (pods, servicios, URLs) |

---

## Próximos Pasos Recomendados

1. **Revisar manifiestos K8s**:
   - Actualizar `k8s/ingress.yaml` con dominio real
   - Cambiar `k8s/secret-example.yaml` a datos reales
   - Configurar límites de recursos en `k8s/deployment.yaml`

2. **Configurar CI/CD**:
   - Integrar deploy.ps1 en pipeline
   - Automatizar builds y deploys

3. **Monitoreo**:
   - Configurar logs persistentes (ELK, Splunk)
   - Alertas de pods fallidos
   - Métricas de Performance

---

## Soporte

Para reportar problemas:

```powershell
# Obtener logs detallados
kubectl logs -f deployment/agromarket -n agromarket

# Información del cluster
kubectl get nodes
kubectl get events -n agromarket
kubectl describe node <node-name>
```

