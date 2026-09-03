@echo off
REM =============================================================================
REM Inicio de produccion - Backend Java + Cloudflare Tunnel
REM =============================================================================
REM Este script inicia:
REM   1. MySQL y MongoDB (Docker)
REM   2. El backend Java en modo produccion (perfil "prod")
REM   3. Cloudflare Tunnel para exponer api.agro-market.app
REM =============================================================================

echo.
echo ============================================
echo  INICIANDO AGROMARKET EN PRODUCCION
echo ============================================
echo.

REM Paso 1: Levantar bases de datos
echo [1/3] Iniciando MySQL y MongoDB...
cd agroMarket
docker-compose up -d mysql mongo
if %ERRORLEVEL% neq 0 (
    echo ERROR: No se pudieron iniciar los contenedores.
    echo Asegurate de tener Docker instalado y corriendo.
    goto error
)
timeout /t 5 /nobreak >nul

REM Paso 2: Iniciar backend Java
echo.
echo [2/3] Iniciando backend Java (perfil: prod)...
start "AgroMarket Backend" cmd /c "cd agroMarket && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod"
echo Esperando que el backend inicie (15 segundos)...
timeout /t 15 /nobreak >nul

REM Paso 3: Iniciar Cloudflare Tunnel
echo.
echo [3/3] Iniciando Cloudflare Tunnel...
echo Asegurate de haber creado el tunnel primero:
echo   cloudflared tunnel login
echo   cloudflared tunnel create agromarket-backend
echo   cloudflared tunnel route dns agromarket-backend api.agro-market.app
echo.
start "Cloudflare Tunnel" cmd /c "cloudflared tunnel run agromarket-backend"

echo.
echo ============================================
echo  AGROMARKET CORRIENDO EN PRODUCCION
echo ============================================
echo.
echo  Frontend:       https://agro-market.app (Cloudflare Pages)
echo  Backend API:    https://api.agro-market.app (Cloudflare Tunnel)
echo  Backend local:  http://localhost:8080
echo.
echo  Presiona Ctrl+C en cada ventana para detener.
echo.
goto end

:error
echo.
echo ERROR en el inicio. Revisa los mensajes anteriores.
pause
exit /b 1

:end

