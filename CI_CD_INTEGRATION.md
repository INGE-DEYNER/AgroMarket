# CI/CD Integration Guide

## GitHub Actions Example

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main, staging]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PowerShell
        run: |
          $PSVersionTable.PSVersion
          Get-Command kubectl -ErrorAction SilentlyContinue
        shell: powershell
      
      - name: Deploy with Script
        run: |
          $environment = "${{ github.event.inputs.environment || 'staging' }}"
          $mode = "Kubernetes"
          
          if ("${{ github.event_name }}" -eq "push") {
            $environment = switch ("${{ github.ref }}") {
              "refs/heads/main" { "production" }
              default { "staging" }
            }
          }
          
          Write-Host "Deploying to $environment"
          
          .\deploy.ps1 `
            -Mode $mode `
            -Namespace $environment `
            -Build `
            -Tag "${{ github.sha }}"
        shell: powershell
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
      
      - name: Verify Deployment
        if: success()
        run: |
          kubectl get pods -n staging
          kubectl get svc -n staging
        shell: powershell
      
      - name: Rollback on Failure
        if: failure()
        run: |
          kubectl rollout undo deployment/agromarket -n staging
          kubectl rollout status deployment/agromarket -n staging
        shell: powershell
```

---

## Azure DevOps Example

```yaml
trigger:
  branches:
    include:
      - main
      - staging
  paths:
    include:
      - agroMarket/
      - frontend/
      - k8s/
      - deploy.ps1

pool:
  vmImage: 'windows-latest'

variables:
  imageName: 'agromarket'
  imageTag: '$(Build.BuildId)'

stages:
  - stage: Build
    displayName: 'Build'
    jobs:
      - job: BuildJob
        displayName: 'Build and Test'
        steps:
          - checkout: self
          
          - task: Maven@3
            inputs:
              mavenPomFile: 'agroMarket/pom.xml'
              goals: 'clean package -DskipTests'
              publishJUnitResults: true
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: '$(Build.ArtifactStagingDirectory)'

  - stage: DeployStaging
    displayName: 'Deploy to Staging'
    dependsOn: Build
    condition: succeeded()
    jobs:
      - deployment: DeployToK8s
        displayName: 'Deploy to Kubernetes'
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self
                
                - task: PowerShell@2
                  displayName: 'Deploy with Script'
                  inputs:
                    targetType: 'inline'
                    script: |
                      .\deploy.ps1 `
                        -Mode Kubernetes `
                        -Namespace staging `
                        -Tag $(imageTag) `
                        -Build
                    pwsh: true
                
                - task: PowerShell@2
                  displayName: 'Verify Deployment'
                  inputs:
                    targetType: 'inline'
                    script: |
                      kubectl get pods -n staging
                      kubectl logs -f deployment/agromarket -n staging --tail=50
                    pwsh: true

  - stage: DeployProduction
    displayName: 'Deploy to Production'
    dependsOn: DeployStaging
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployProdK8s
        displayName: 'Deploy to Production K8s'
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self
                
                - task: PowerShell@2
                  displayName: 'Deploy to Production'
                  inputs:
                    targetType: 'inline'
                    script: |
                      .\deploy.ps1 `
                        -Mode Kubernetes `
                        -Namespace production `
                        -Tag $(imageTag) `
                        -DryRun
                      
                      # Manual approval via pipeline
                      Write-Host "Review output above, then manually approve in pipeline"
                    pwsh: true
```

---

## GitLab CI Example

```yaml
stages:
  - build
  - deploy-staging
  - deploy-prod

variables:
  IMAGE_TAG: $CI_COMMIT_SHA
  DEPLOY_SCRIPT: "./deploy.ps1"

build:
  stage: build
  image: maven:3.9-eclipse-temurin-21
  script:
    - cd agroMarket
    - mvn clean package -DskipTests
  artifacts:
    paths:
      - agroMarket/target/*.jar
    expire_in: 1 day

deploy_staging:
  stage: deploy-staging
  image: windows/servercore:ltsc2022
  script:
    - $env:KUBECONFIG = $KUBECONFIG_STAGING
    - .\deploy.ps1 -Mode Kubernetes -Namespace staging -Tag $IMAGE_TAG -Build
    - kubectl get pods -n staging
  only:
    - staging
  when: on_success

deploy_prod:
  stage: deploy-prod
  image: windows/servercore:ltsc2022
  script:
    - $env:KUBECONFIG = $KUBECONFIG_PRODUCTION
    - .\deploy.ps1 -Mode Kubernetes -Namespace production -Tag $IMAGE_TAG -DryRun
    - Write-Host "MANUAL APPROVAL REQUIRED"
  only:
    - main
  when: manual
```

---

## Local Development Workflow

### Using script.local.sh (Linux/Mac)

```bash
#!/bin/bash
set -e

export ENVIRONMENT=${1:-staging}
export VERSION=$(git rev-parse --short HEAD)

echo "🚀 Deploying AgroMarket to $ENVIRONMENT"

# Build backend
echo "📦 Building backend..."
cd agroMarket
mvn clean package -DskipTests
cd ..

# Deploy
echo "🐳 Deploying to Kubernetes..."
kubectl config use-context $ENVIRONMENT
kubectl create namespace agromarket --dry-run=client -o yaml | kubectl apply -f -

# Apply manifests
kubectl apply -f k8s/configmap.yaml -n agromarket
kubectl apply -f k8s/secret-example.yaml -n agromarket
kubectl apply -f k8s/deployment.yaml -n agromarket
kubectl apply -f k8s/service.yaml -n agromarket
kubectl apply -f k8s/ingress.yaml -n agromarket

# Wait for rollout
kubectl rollout status deployment/agromarket -n agromarket

echo "✅ Deployment complete!"
echo "🌐 Access at: kubectl port-forward svc/agromarket-service 8080:80 -n agromarket"
```

---

## Monitoring Post-Deployment

### Prometheus Rules

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: agromarket-alerts
  namespace: agromarket
spec:
  groups:
    - name: agromarket
      interval: 30s
      rules:
        - alert: AgromarketPodCrashing
          expr: rate(kube_pod_container_status_restarts_total{pod=~"agromarket-.*"}[15m]) > 0
          for: 5m
          annotations:
            summary: "Agromarket pod is crashing"
            
        - alert: AgromarketHighMemory
          expr: container_memory_usage_bytes{pod=~"agromarket-.*"} / container_spec_memory_limit_bytes > 0.9
          for: 5m
          annotations:
            summary: "Agromarket memory usage above 90%"
            
        - alert: AgromarketHighCPU
          expr: rate(container_cpu_usage_seconds_total{pod=~"agromarket-.*"}[5m]) > 0.8
          for: 5m
          annotations:
            summary: "Agromarket CPU usage above 80%"
```

---

## Backup Strategy

### Automated Daily Backups

```powershell
# CronJob en k8s/mysql-backup-cronjob.yaml
# Ejecuta diariamente a las 02:00 UTC

# Restaurar desde backup
kubectl exec -it <mysql-pod> -- mysql -u root -p agromarket_db < backup.sql

# Listar backups en PVC
kubectl exec -it <backup-pod> -- ls -lah /backups/
```

---

## Troubleshooting in Pipeline

### PowerShell Error Handling

```powershell
$ErrorActionPreference = 'Stop'

try {
    .\deploy.ps1 -Mode Kubernetes -Namespace staging
} catch {
    Write-Error "Deployment failed: $_"
    
    # Collect diagnostic info
    kubectl describe pod -n staging
    kubectl logs -n staging --all-containers=true --tail=100
    
    # Rollback
    kubectl rollout undo deployment/agromarket -n staging
    
    exit 1
}
```

### Validation Checklist

```powershell
# Pre-deployment validation
@(
    "kubectl version --client",
    "kubectl cluster-info",
    "kubectl get nodes",
    "kubectl get namespace agromarket",
    "kubectl get secrets -n agromarket"
) | ForEach-Object {
    Write-Host "Checking: $_"
    Invoke-Expression $_
}
```

---

## Environment Variables

### .env.staging
```
SPRING_PROFILES_ACTIVE=prod
APP_ENV=staging
DB_HOST=mysql.agromarket.svc.cluster.local
DB_PORT=3306
DB_NAME=agromarket_db
JWT_EXPIRATION=86400
LOG_LEVEL=INFO
```

### .env.production
```
SPRING_PROFILES_ACTIVE=prod
APP_ENV=production
DB_HOST=mysql.agromarket.svc.cluster.local
DB_PORT=3306
DB_NAME=agromarket_db
JWT_EXPIRATION=3600
LOG_LEVEL=WARN
ENABLE_METRICS=true
```

---

## Commands for CI/CD Workers

### Setup Agent on Windows

```powershell
# Install kubectl
choco install kubernetes-cli -y

# Install Docker
choco install docker-desktop -y

# Verify
kubectl version --client
docker --version
powershell -Version
```

### Setup Agent on Linux

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify
kubectl version --client
docker --version
```

---

## Rollback Procedure

```powershell
# Quick rollback (previous revision)
kubectl rollout undo deployment/agromarket -n production

# Rollback to specific revision
kubectl rollout history deployment/agromarket -n production
kubectl rollout undo deployment/agromarket --to-revision=2 -n production

# Verify rollback
kubectl rollout status deployment/agromarket -n production
kubectl logs -f deployment/agromarket -n production
```

---

## Performance Optimization

### Resource Limits Tuning

```yaml
resources:
  requests:
    cpu: "250m"      # Minimum required
    memory: "256Mi"  # Minimum required
  limits:
    cpu: "1000m"     # Maximum allowed
    memory: "1Gi"    # Maximum allowed
```

### Auto-scaling (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agromarket-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agromarket
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

