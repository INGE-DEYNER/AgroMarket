# 🚀 AgroMarket Deploy Script - QUICK START

## What's New?

Your `deploy.ps1` has been **completely rewritten** with:

✅ **Full Kubernetes support** with real best practices  
✅ **Colorized logging** with timestamps  
✅ **Automatic namespace creation**  
✅ **Sequential manifest application**  
✅ **Rollout monitoring** with timeout handling  
✅ **Pod health verification**  
✅ **Error diagnostics**  
✅ **DryRun mode** for safe validation  
✅ **Comprehensive documentation**  

---

## 📋 File Structure

```
AgroMarket/
├── deploy.ps1                    ← Main deployment script (UPDATED ✨)
├── DEPLOYMENT_MODES.md           ← Complete reference guide
├── DEPLOY_CHEATSHEET.md          ← Quick reference
├── CI_CD_INTEGRATION.md          ← Pipeline examples
├── TESTING_VALIDATION.md         ← Testing procedures
└── Quick_Start.md                ← This file
```

---

## ⚡ Quick Start (Copy & Paste)

### For Kubernetes Deployment

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Preview what will happen (safe - no changes)
.\deploy.ps1 -Mode Kubernetes -DryRun

# Actually deploy
.\deploy.ps1 -Mode Kubernetes

# Check status
kubectl get pods -n agromarket
```

### For Docker Compose

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Deploy with Docker Compose
.\deploy.ps1 -Mode Docker -Build
```

### For Local Development

```powershell
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket

# Terminal 1: Backend
.\deploy.ps1 -Mode Local

# Terminal 2: Frontend
cd frontend
python -m http.server 3000
```

---

## 📚 Available Modes

| Mode | Use Case | Command |
|------|----------|---------|
| **Local** | Development (backend only) | `.\deploy.ps1 -Mode Local` |
| **Docker** | Full stack local testing | `.\deploy.ps1 -Mode Docker` |
| **Kubernetes** | Production-grade deployment | `.\deploy.ps1 -Mode Kubernetes` |

---

## 🔧 Key Parameters

```powershell
# Basic
.\deploy.ps1 -Mode Kubernetes

# With custom namespace
.\deploy.ps1 -Mode Kubernetes -Namespace production

# Build before deploy
.\deploy.ps1 -Mode Kubernetes -Build

# Safe preview (no changes)
.\deploy.ps1 -Mode Kubernetes -DryRun

# With custom tag
.\deploy.ps1 -Mode Kubernetes -Tag "v1.0.0"
```

---

## ✅ Pre-Flight Check

Run this first to verify everything is ready:

```powershell
# Check kubectl
kubectl version --client

# Check cluster
kubectl cluster-info

# Check docker
docker --version

# Check Maven
mvn -version
```

---

## 🎯 Kubernetes Deployment Flow

```
1. kubectl verification          ✓ Checks kubectl is available
2. Cluster connection            ✓ Verifies access
3. Namespace creation            ✓ Auto-creates if needed
4. Manifest validation           ✓ Syntax check (dry-run)
5. ConfigMap & Secrets           ✓ Apply configuration
6. Deployment                    ✓ Backend pods deploy
7. Service                       ✓ Expose service
8. Ingress                       ✓ Configure ingress
9. CronJob backup                ✓ Schedule backups
10. Rollout wait                 ✓ Monitor deployment
11. Pod health check             ✓ Verify all pods running
12. Show access URLs             ✓ Print ingress/port-forward
```

---

## 📊 Output Example

```
[2026-05-29 10:20:15] ==> AgroMarket Deployment Helper
[2026-05-29 10:20:15] Modo        : Kubernetes
[2026-05-29 10:20:16] ✓ kubectl encontrado
[2026-05-29 10:20:17] ✓ Conectado al cluster Kubernetes
[2026-05-29 10:20:18] ✓ Namespace 'agromarket' creado
[2026-05-29 10:20:20] ✓ Manifiestos validados correctamente
[2026-05-29 10:20:21] ✓ ConfigMap aplicado
[2026-05-29 10:20:22] ✓ Secrets aplicados
[2026-05-29 10:20:23] ✓ Deployment aplicado
[2026-05-29 10:20:24] ✓ Service aplicado
[2026-05-29 10:20:25] ✓ Ingress aplicado
[2026-05-29 10:20:26] ✓ CronJob de backup aplicado
[2026-05-29 10:20:37] ✓ Rollout completado: deployment/agromarket
[2026-05-29 10:20:38] ✓ Todos los pods están en estado Running
[2026-05-29 10:20:39] ==> Resumen del despliegue
Namespace: agromarket
Pods activos:
NAME                          READY   STATUS
agromarket-6d8f5d7c9-abc12   1/1     Running
agromarket-6d8f5d7c9-xyz98   1/1     Running
```

---

## 🎨 Color Legend

- 🟢 **Green (✓)** - Success / Operation completed
- 🟡 **Yellow (ℹ️)** - Info / Progress update  
- 🔴 **Red (✗)** - Error / Issue detected
- 🔵 **Cyan (==>)** - Major step / Section header

---

## 🌐 Post-Deployment Access

After successful Kubernetes deployment:

```powershell
# Method 1: Via Ingress (if configured)
# Access at: https://agromarket.local (or your domain)

# Method 2: Port-forward
kubectl port-forward svc/agromarket-service 8080:80 -n agromarket
# Then: http://localhost:8080

# Method 3: Check what's available
kubectl get ingress -n agromarket
kubectl get svc -n agromarket
```

---

## 🐛 Troubleshooting

### kubectl not found
```powershell
# Install kubectl
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/
```

### Can't connect to cluster
```powershell
# Check current context
kubectl config current-context

# List available contexts
kubectl config get-contexts

# Switch context
kubectl config use-context <context-name>
```

### Pod keep crashing
```powershell
# Check logs
kubectl logs deployment/agromarket -n agromarket

# Get pod details
kubectl describe pod <pod-name> -n agromarket

# Check events
kubectl get events -n agromarket
```

### Timeout waiting for rollout
```powershell
# Check pod status
kubectl get pods -n agromarket

# Check events
kubectl get events -n agromarket --sort-by='.lastTimestamp'

# Manually check rollout
kubectl rollout status deployment/agromarket -n agromarket
```

---

## 📖 Complete Documentation

| Document | Content |
|----------|---------|
| **DEPLOYMENT_MODES.md** | Detailed explanation of all 3 modes |
| **DEPLOY_CHEATSHEET.md** | Quick commands and examples |
| **CI_CD_INTEGRATION.md** | GitHub Actions, Azure DevOps, GitLab CI examples |
| **TESTING_VALIDATION.md** | How to test and validate the script |

---

## 🔒 Before Production

- [ ] Review `k8s/ingress.yaml` - update domain name
- [ ] Update `k8s/secret-example.yaml` - use real secrets
- [ ] Configure HTTPS/TLS certificates
- [ ] Verify database connection string
- [ ] Test rollback procedure
- [ ] Set up monitoring and alerts
- [ ] Create runbook for incidents
- [ ] Test backups restoration

---

## 🚦 Common Workflows

### Development
```powershell
.\deploy.ps1 -Mode Local
# Or
.\deploy.ps1 -Mode Docker -Build
```

### Staging
```powershell
.\deploy.ps1 -Mode Kubernetes -Namespace staging -Build
```

### Production Safe Deploy
```powershell
# Step 1: Validate
.\deploy.ps1 -Mode Kubernetes -Namespace production -DryRun

# Step 2: Deploy
.\deploy.ps1 -Mode Kubernetes -Namespace production -Tag "v1.0.0"

# Step 3: Verify
kubectl get pods -n production
```

### Rollback
```powershell
kubectl rollout undo deployment/agromarket -n production
```

---

## 📞 Support

If you encounter issues:

1. Check **TESTING_VALIDATION.md** for diagnostic procedures
2. Review logs: `kubectl logs deployment/agromarket -n agromarket`
3. Describe pod: `kubectl describe pod <pod-name> -n agromarket`
4. Check events: `kubectl get events -n agromarket`

---

## ✨ Features Highlighted

| Feature | Benefit |
|---------|---------|
| **Timestamps** | Track exactly when each step occurs |
| **Color coding** | Quick visual feedback (green/yellow/red) |
| **DryRun mode** | Validate before applying changes |
| **Auto-namespace** | No manual kubectl create namespace needed |
| **Sequential apply** | Dependencies handled correctly |
| **Rollout wait** | Knows when deployment is ready |
| **Pod health** | Verifies all pods are running |
| **Error handling** | Captures diagnostics on failure |
| **Multi-mode** | Local, Docker, and Kubernetes support |

---

## 🎓 Learning Resources

To understand the script better, read in this order:

1. **This file** - Get the overview
2. **DEPLOY_CHEATSHEET.md** - Learn common commands
3. **DEPLOYMENT_MODES.md** - Deep dive into each mode
4. **TESTING_VALIDATION.md** - Test and validate your setup
5. **CI_CD_INTEGRATION.md** - Automate everything

---

## 📝 Version Info

- **Script Version**: 2.0 (Complete Kubernetes rewrite)
- **Date Updated**: May 29, 2026
- **Author**: DevOps Team
- **PowerShell Version**: 5.1+ required
- **Supports**: Local, Docker Compose, Kubernetes

---

## 🎉 You're Ready!

```powershell
# Deploy to Kubernetes now!
cd C:\Users\Deyner Chaverra\Asafrut\AgroMarket
.\deploy.ps1 -Mode Kubernetes -DryRun    # Preview first
.\deploy.ps1 -Mode Kubernetes            # Deploy!
```

---

## Next Steps

1. ✅ Review the script: `deploy.ps1`
2. ✅ Check prerequisites: `kubectl version`, `docker --version`
3. ✅ Read `DEPLOY_CHEATSHEET.md` for quick commands
4. ✅ Test with `-DryRun` flag
5. ✅ Deploy to staging first
6. ✅ Monitor logs and pods
7. ✅ Deploy to production when ready

---

**Happy Deploying! 🚀**

