# AgroMarket Deploy - Quick Reference

## Comandos Más Comunes

### Desarrollo Local
```powershell
# Terminal 1: Backend
.\deploy.ps1 -Mode Local

# Terminal 2: Frontend
cd frontend
python -m http.server 3000
# o
npx http-server -p 3000
```

### Docker Stack Completo
```powershell
# Levantar con build incluido
.\deploy.ps1 -Mode Docker -Build

# Ver logs en tiempo real
docker compose logs -f

# Detener
docker compose down
```

### Kubernetes - Despliegue Rápido
```powershell
# Namespace agromarket (default)
.\deploy.ps1 -Mode Kubernetes

# Namespace custom
.\deploy.ps1 -Mode Kubernetes -Namespace production

# Solo validar sin aplicar
.\deploy.ps1 -Mode Kubernetes -DryRun

# Con compilación
.\deploy.ps1 -Mode Kubernetes -Build
```

---

## Verificaciones Post-Despliegue

### Kubernetes
```powershell
# Estado de pods
kubectl get pods -n agromarket

# Logs de backend
kubectl logs -f deployment/agromarket -n agromarket

# Acceso local (port-forward)
kubectl port-forward svc/agromarket-service 8080:80 -n agromarket
# Luego: http://localhost:8080

# Ver Ingress y URL
kubectl get ingress -n agromarket

# Todos los recursos
kubectl get all -n agromarket
```

### Docker Compose
```powershell
# Ver servicios
docker compose ps

# Logs específicos
docker compose logs -f backend
docker compose logs -f mysql

# Acceso MySQL
docker exec -it <mysql_container> mysql -u root -p
```

---

## Parámetros Clave

| Parámetro | Uso |
|-----------|-----|
| `-Mode Local` | Backend con Maven (desarrollo) |
| `-Mode Docker` | Stack con Docker Compose |
| `-Mode Kubernetes` | K8s cluster completo |
| `-Build` | Compilar backend antes |
| `-DryRun` | Solo validar, no aplicar |
| `-Namespace <name>` | Namespace K8s (default: agromarket) |
| `-Tag <tag>` | Docker image tag (default: latest) |

---

## Flujo de Despliegue K8s

```
1. Verificar kubectl ✓
2. Conectar cluster ✓
3. Crear namespace si no existe ✓
4. Validar manifiestos (dry-run) ✓
5. Aplicar: ConfigMap & Secrets ✓
6. Aplicar: Deployment ✓
7. Aplicar: Service ✓
8. Aplicar: Ingress ✓
9. Aplicar: CronJob (backup) ✓
10. Esperar rollout (timeout: 300s) ✓
11. Verificar pods Running ✓
12. Mostrar URLs y resumen ✓
```

---

## Troubleshooting Rápido

### Pod no inicia
```powershell
# Ver detalles
kubectl describe pod <pod-name> -n agromarket

# Ver logs
kubectl logs <pod-name> -n agromarket

# Ver eventos
kubectl get events -n agromarket --sort-by='.lastTimestamp'
```

### Rollout timeout
```powershell
# Ver estado del deployment
kubectl rollout status deployment/agromarket -n agromarket --timeout=600s

# Ver réplicas
kubectl get rs -n agromarket

# Reintentar rollout
kubectl rollout restart deployment/agromarket -n agromarket
```

### Acceso a MySQL K8s
```powershell
# Port-forward
kubectl port-forward svc/mysql 3306:3306 -n agromarket

# Conectarse
mysql -h 127.0.0.1 -u <user> -p agromarket_db
```

### Limpiar despliegue
```powershell
# Eliminar todo el namespace
kubectl delete namespace agromarket

# Solo resources (mantener namespace)
kubectl delete all --all -n agromarket
```

---

## URLs de Acceso

### Desarrollo Local
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost:3000

### Docker Compose
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Frontend: http://localhost
- MySQL: localhost:3306

### Kubernetes
- Ingress (TLS): https://agromarket.local (update en k8s/ingress.yaml)
- Port-forward: http://localhost:8080 (después de kubectl port-forward)
- MySQL: kubectl port-forward svc/mysql 3306:3306

---

## Archivos Importantes

```
AgroMarket/
├── deploy.ps1                 ← USAR ESTE SCRIPT
├── DEPLOYMENT_MODES.md        ← Documentación completa
├── docker-compose.yml         ← Stack local
├── .env                       ← Variables de entorno
├── k8s/
│   ├── deployment.yaml        ← Configuración K8s
│   ├── service.yaml
│   ├── ingress.yaml           ← ACTUALIZAR: dominio real
│   ├── configmap.yaml
│   ├── secret-example.yaml    ← ACTUALIZAR: datos reales
│   ├── mysql-backup-cronjob.yaml
│   └── kustomization.yaml
├── agroMarket/                ← Backend Spring Boot
└── frontend/                  ← Frontend HTML/CSS/JS
```

---

## Antes de Producción

- [ ] Actualizar k8s/ingress.yaml con dominio real
- [ ] Cambiarse secret-example.yaml a datos reales
- [ ] Configurar HTTPS/TLS certificates
- [ ] Ajustar límites de recursos en deployment.yaml
- [ ] Revisar MySQL password en secrets
- [ ] Probar rollout en staging
- [ ] Configurar persistencia (PVC para backups)
- [ ] Verificar backups automáticos funcionan
- [ ] Monitoreo y logs configurados
- [ ] Runbook de incident response listo

---

## Perfil de Usuario

- 🎯 Ingeniero DevOps Senior
- 🛠️ Scripts automatizados
- 📊 Logging exhaustivo
- 🔍 Diagnóstico detallado
- ⚡ Ejecución rápida
- 🛡️ Validaciones completas
- 📖 Documentación clara

