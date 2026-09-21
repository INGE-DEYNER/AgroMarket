@echo off
cd /d "%~dp0"
call mvn -o -DskipTests compile > mvn-check.log 2>&1
echo EXITCODE=%ERRORLEVEL% >> mvn-check.log
