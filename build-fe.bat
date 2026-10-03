@echo off
REM Build del frontend. Sin esto no cabe en el timeout de la herramienta.
REM Uso:  start build-fe.bat  y luego  tail scripts\construccion-fe.log
cd /d "%~dp0frontend"
if "%SITE_URL%"=="" (
  npx vite build > ..\scripts\construccion-fe.log 2>&1
) else (
  npx vite build > ..\scripts\construccion-fe.log 2>&1
)
echo FINISHED >> ..\scripts\construccion-fe.log