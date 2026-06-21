# deploy-hf.ps1 - Script para subir los archivos a Hugging Face

$token = Read-Host -Prompt "Introduce tu Token de Acceso de Hugging Face (con permisos de Escritura/Write)"
if ([string]::IsNullOrEmpty($token)) {
    Write-Host "El token no puede estar vacio." -ForegroundColor Red
    exit
}

# 1. Configurar la URL con el token
$gitUrl = "https://DeyDev26:$token@huggingface.co/spaces/DeyDev26/agromarket-api"

# 2. Agregar o actualizar el remoto de Hugging Face
git remote remove space 2>$null
git remote add space $gitUrl

# 3. Crear los archivos locales necesarios
$readmeContent = @"
---
title: AgroMarket API
emoji: 🍏
colorFrom: green
colorTo: green
sdk: docker
app_port: 7860
---
"@
[System.IO.File]::WriteAllText("README.md", $readmeContent)

# 4. Confirmar y subir
Write-Host "Confirmando y subiendo los archivos a Hugging Face..." -ForegroundColor Green
git rm docker-compose.yml --cached -f 2>$null
git add README.md Dockerfile my.cnf entrypoint.sh agroMarket/
git commit -m "Desplegar AgroMarket API en Hugging Face con Dockerfile y MySQL integrado"
git push space develop:main --force

# 5. Limpieza del remoto con token por seguridad
git remote remove space
Write-Host "Despliegue completado con exito!" -ForegroundColor Green
