@echo off
cd /d %~dp0
mvnw.cmd -DskipTests compile > compile-final.log 2>&1
exit