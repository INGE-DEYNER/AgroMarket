# Generate K8s Secrets - Quick Reference

## Comando y Única Línea

```powershell
.\generate-k8s-secrets.ps1
```

---

## Opciones Comunes

### Ver qué haría (sin crear archivos)
```powershell
.\generate-k8s-secrets.ps1 -DryRun
```

### Crear archivos Y aplicar a Kubernetes
```powershell
.\generate-k8s-secrets.ps1 -Apply
```

### Todo de una vez
```powershell
# 1. Ver preview
.\generate-k8s-secrets.ps1 -DryRun

# 2. Crear archivos
.\generate-k8s-secrets.ps1

# 3. Aplicar a K8s
.\generate-k8s-secrets.ps1 -Apply
```

---

## Flujo Recomendado

```
1. Preparar .env
   └─ cp .env.example .env
   └─ Editar .env con valores reales

2. Test (sin cambios)
   └─ .\generate-k8s-secrets.ps1 -DryRun
   └─ Revisar los valores (solo nombres, no valores)

3. Generar archivos YAML
   └─ .\generate-k8s-secrets.ps1
   └─ Revisa: cat k8s/secrets/backend-secret.yaml

4. Aplicar a Kubernetes
   └─ .\generate-k8s-secrets.ps1 -Apply

5. Verificar
   └─ kubectl get secrets -n agromarket
   └─ kubectl describe secret agromarket-backend-secret -n agromarket
```

---

## Archivos Generados

```
k8s/secrets/
├── backend-secret.yaml    (14 variables)
├── frontend-secret.yaml   (1 variable)
```

## Variables por Secret

### Backend
```
✓ DB_HOST, DB_PORT, DB_NAME
✓ DB_USERNAME, DB_PASSWORD  
✓ JWT_SECRET, JWT_EXPIRATION (default: 3600)
✓ MAIL_HOST, MAIL_PORT
✓ MAIL_USERNAME, MAIL_PASSWORD
✓ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
✓ UPLOADS_PATH
```

### Frontend
```
✓ FRONTEND_BASE_URL
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "kubectl not found" | `choco install kubernetes-cli` |
| Variables vacías en YAML | Verificar `.env` tiene los valores |
| "k8s directory not found" | Crea: `mkdir k8s\secrets` |
| Permisos de namespace | `kubectl create namespace agromarket` |

---

## Verificación

```powershell
# Ver secrets creados
kubectl get secrets -n agromarket

# Ver detalle
kubectl describe secret agromarket-backend-secret -n agromarket

# Decodificar valor (para verificación)
kubectl get secret agromarket-backend-secret -n agromarket -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

---

## Importante ⚠️

- **NUNCA subir** `k8s/secrets/` a Git (está en .gitignore)
- **Valores NO se muestran** en consola (solo nombres de variables)
- **Todos los valores** se codifican en Base64 automáticamente
- **DryRun** muestra los YAML pero NO crea archivos

---

## Próximas Opciones

Después de aplicar secrets:

```powershell
# Ver deployment que usa los secrets
kubectl get deployment -n agromarket

# Ver pods que acceden a los secrets
kubectl get pods -n agromarket

# Ver logs del pod
kubectl logs -f deployment/agromarket -n agromarket
```

---

## Recordar

✅ Editar `.env` con valores reales ANTES de ejecutar  
✅ Usar `-DryRun` primero para validar  
✅ Revisar output para warnings (variables faltantes)  
✅ Los secrets se crean en namespace `agromarket`  
✅ Archivos YAML en Base64 (no legibles)  

---

**Más detalles**: Ver `GENERATE_K8S_SECRETS_GUIDE.md`

