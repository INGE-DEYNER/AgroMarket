# AgroMarket Setup

## Requisitos previos

- Docker Desktop en ejecución.
- PowerShell con permisos para elevar privilegios cuando se actualice el archivo `hosts` (Windows).
- `mkcert` instalado en la máquina local.
- El repositorio debe estar disponible en `C:/Users/Deyner Chaverra/Asafrut/AgroMarket`.

## Cómo ejecutar el proyecto

Recomendado: desde la raíz del proyecto ejecutar:

```powershell
.\start.ps1
```

El script:

- Verifica que Docker esté activo.
- Configura `agromarket.dev` en el archivo `hosts`.
- Genera certificados locales con `mkcert`.
- Apaga contenedores previos.
- Construye las imágenes si detecta cambios o si pasas `-Rebuild`.
- Levanta MySQL, backend y frontend.

## URLs del proyecto

- Frontend: https://agromarket.dev:8090
- Backend (interno): http://agromarket-app:8080
- Backend (expuesto por compose): http://localhost:8091
- API Docs: http://localhost:8091/swagger-ui.html

## Certificados locales

Antes de ejecutar el frontend, genera los certs locales:

```powershell
.
\scripts\generate-local-certs.ps1
```

Ese script crea estos archivos, que no se versionan:

- `frontend/certs/agromarket.dev.pem`
- `frontend/certs/agromarket.dev-key.pem`

Si no tienes `mkcert`, instálalo y ejecuta una vez:

```powershell
mkcert -install
```

## Redirect URIs de Google Console

Agrega estas URL autorizadas en Google Console:

- http://agromarket.dev:8090/login/oauth2/code/google
- http://localhost:8090/login/oauth2/code/google

El navegador seguirá entrando por HTTPS a `agromarket.dev:8090`, pero el callback OAuth debe quedar registrado en Google como HTTP para que coincida con la configuración actual. Con HSTS, el navegador normalmente levantará el callback sobre HTTPS igualmente.

## Verificaciones y comandos útiles

```powershell
curl.exe -vk -I "https://agromarket.dev:8090"
curl.exe -vk -D - -o NUL "https://agromarket.dev:8090/oauth2/authorization/google"
```

## Hosts local (recomendado para pruebas en navegador)

Añade esta línea a tu `hosts` local (requiere ejecutar como Administrador):

```text
127.0.0.1 agromarket.dev
```

## Google Cloud Console

- Confirma que la credencial OAuth2 (Client ID) tenga autorizado exactamente el redirect URI HTTPS.
- Si el redirect URI no coincide exactamente, Google rechazará la autorización.

## Cómo detener el proyecto

```powershell
docker compose down --remove-orphans
```
