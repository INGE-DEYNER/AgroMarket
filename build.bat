@echo off
REM Build del backend sin depender del timeout de la herramienta.
REM Uso:  start build /b  y luego  tail scripts\ver-construccion.log
cd /d "%~dp0"
docker compose build asafrut-backend > scripts\construccion.log 2>&1
echo FINISHED >> scripts\construccion.log