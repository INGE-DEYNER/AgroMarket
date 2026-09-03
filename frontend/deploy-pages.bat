@echo off
REM =============================================================================
REM Script de despliegue del frontend a Cloudflare Pages
REM =============================================================================
REM Requisitos:
REM   - Node.js 18+ instalado
REM   - Wrangler CLI instalado: npm install -g wrangler
REM   - Estar logueado en Cloudflare: wrangler login
REM =============================================================================

echo.
echo [1/4] Instalando dependencias...
call npm install
if %ERRORLEVEL% neq 0 goto error

echo.
echo [2/4] Compilando frontend para produccion...
call npm run build
if %ERRORLEVEL% neq 0 goto error

echo.
echo [3/4] Desplegando a Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=agro-market
if %ERRORLEVEL% neq 0 goto error

echo.
echo [4/4] Despliegue completado exitosamente!
echo.
echo Tu frontend esta disponible en: https://agro-market.app
echo.
goto end

:error
echo.
echo ERROR: El despliegue fallo. Revisa los mensajes anteriores.
exit /b 1

:end
pause

