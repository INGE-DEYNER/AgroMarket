# AgroMarket

## Setup inicial

```bash
bash scripts/setup-secrets.sh
```

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

## Modo producción (resumen mínimo)

Recomendado: ejecutar con `SPRING_PROFILES_ACTIVE=prod` y proporcionar todas las variables de entorno necesarias (no usar valores por defecto para secretos).

- Variables necesarias en producción:
  - `JDBC_DATABASE_URL` o configurar `spring.datasource.url` mediante entorno
  - `DB_USERNAME`, `DB_PASSWORD`
  - `JWT_SECRET` (no dejar valor por defecto en producción)

- Flyway: el proyecto incluye `flyway-core`. En `prod` está activado con `baseline-on-migrate=true`. Antes de cambiar producción, escribir las migraciones DDL reales en `src/main/resources/db/migration` y probar en staging.

Ejemplo de arranque en prod (Linux/macOS):

```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_USERNAME=agromarket_user
export DB_PASSWORD=securepassword
export JDBC_DATABASE_URL=jdbc:mysql://hostname:3306/agromarket_db?useSSL=false&serverTimezone=UTC
export JWT_SECRET="your-long-random-secret-here"
./mvnw -DskipTests package
java -jar target/*.jar
```

Probes y health endpoints

La aplicación expone Actuator en `/actuator`. Para Kubernetes se recomiendan las siguientes probes apuntando a la ruta de Actuator:

Liveness (comprueba que el proceso está vivo):

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

Readiness (comprueba que la app está lista y la DB accesible):

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

En `prod` Actuator está habilitado para `health,info,metrics` y las probes están activadas por `management.endpoint.health.probes.enabled=true`.

## Levantar pruebas

```powershell
cd agroMarket
.\mvnw -q test
```

Secrets y CI/CD

Para que el CI pueda publicar y desplegar, añade los siguientes `Secrets` en GitHub (Settings → Secrets → Actions):

Si prefieres usar Docker Hub o Azure ACR en lugar de GHCR, modifica `.github/workflows/ci.yml` y añade las credenciales como `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` o `AZURE_CREDENTIALS`.

El CI valida los manifiestos Kubernetes antes de aplicarlos usando `kubeval`. Para validar localmente puedes ejecutar:

```bash
# descargar kubeval y validar
curl -sL https://github.com/instrumenta/kubeval/releases/latest/download/kubeval-linux-amd64.tar.gz | tar xz
./kubeval k8s/*.yaml --strict
```

Secrets recomendados (mínimo):

- `KUBECONFIG` : base64 del kubeconfig del cluster para despliegues automáticos.
- `GHCR_TOKEN` (opcional): token con permisos `write:packages` para publicar en GHCR (si no se usa `GITHUB_TOKEN`).
- `DB_USERNAME`, `DB_PASSWORD`, `JDBC_DATABASE_URL` : credenciales de producción para la DB.
- `JWT_SECRET` : secreto JWT de producción.
- `GPG_SIGNING_KEY` / `GPG_PASSPHRASE` (opcional): para firmar releases si se desea.

El workflow `release.yml` se dispara en tags tipo `vX.Y.Z` y publica el contenedor en GHCR y crea la release con un changelog generado de los commits.
