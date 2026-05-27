# AgroMarket

## Levantar la base de datos con Docker

1. Instala Docker Desktop.
2. Desde la raiz del repo ejecuta:

```powershell
docker compose up -d
```

3. Conecta MySQL Workbench con estos datos:
   - Host: `localhost`
   - Port: `3306`
   - Database: `agromarket_db`
   - User: `agromarket_user`
   - Password: `agromarket_pass`

## Levantar el backend

```powershell
cd agroMarket
$env:SPRING_PROFILES_ACTIVE='dev'
.\mvnw spring-boot:run
```

## Levantar pruebas

```powershell
cd agroMarket
.\mvnw -q test
```
