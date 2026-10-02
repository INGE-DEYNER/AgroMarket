@echo off
REM Crea la migracion base a partir del esquema REAL de la base de datos.
REM
REM Por que desde la base y no desde las entidades: con ddl-auto: update, el
REM esquema de la base de datos no existe en ningun archivo. Solo esta ahi, y
REM se genera cada vez que arranca Hibernate. Si nadie lo vuelca a un archivo,
REM el dia que haya que hacer una migracion no hay contra que compararla.
REM
REM Uso:   ver-dump-esquema.cmd        (solo mira cuantas tablas hay)
REM        ver-dump-esquema.cmd -crear (lo escribe como migracion)
if not exist esquema-dump.sql (
  echo.
  echo No existe esquema-dump.sql.
  echo Generalo con:
  echo   docker exec asafrut-mysql mysqldump -uUSUARIO -pCLAVE ^
  echo     --no-data --skip-add-drop-table --compact --skip-comments ^
  echo     --skip-set-charset agromarket ^> esquema-dump.sql
  echo.
  exit /b 1
)

for /f %%n in ('find /c "CREATE TABLE" ^< esquema-dump.sql') do set TABLAS=%%n

if "%1"=="-crear" (
  if not exist agroMarket\src\main\resources\db\migration mkdir agroMarket\src\main\resources\db\migration
  copy /y esquema-dump.sql agroMarket\src\main\resources\db\migration\V1__esquema-inicial.sql >nul
  echo Escrito V1__esquema-inicial.sql con %TABLAS% tablas.
) else (
  echo El esquema tiene %TABLAS% tablas.
  echo Anade -crear para escribir la migracion.
)