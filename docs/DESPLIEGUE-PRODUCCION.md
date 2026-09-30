# Guía de Despliegue en Producción - AgroMarket

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO (Navegador)                      │
│                              │                                  │
│                              ▼                                  │
│                   https://agro-market.app                       │
│                    (Cloudflare Pages - Frontend)                 │
│                              │                                  │
│                    Peticiones API (fetch)                        │
│                              │                                  │
│                              ▼                                  │
│                 https://api.agro-market.app                     │
│                  (Cloudflare Tunnel / Proxy)                     │
│                              │                                  │
│                              ▼                                  │
│                    Tu PC (localhost:8080)                       │
│                   (Backend Java + Spring Boot)                   │
│                              │                                  │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                        │
│              MySQL (3307)        MongoDB (27017)                │
│              (Docker local)     (Docker local)                  │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Configurar DNS en Cloudflare

En el dashboard de Cloudflare, ve a **DNS > Records** y crea estos registros:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| CNAME | `agro-market.app` | `agro-market.pages.dev` | ✅ Proxy |
| CNAME | `api.agro-market.app` | `<TUNNEL_ID>.cfargotunnel.com` | ✅ Proxy |

## 2. Crear Cloudflare Tunnel (exponer backend)

```bash
# Instalar cloudflared
# Windows: choco install cloudflared
# Mac: brew install cloudflare/cloudflare/cloudflared

# Autenticar
cloudflared tunnel login

# Crear el tunnel
cloudflared tunnel create agromarket-backend

# Ver el ID del tunnel
cloudflared tunnel list

# Configurar el DNS del tunnel
cloudflared tunnel route dns agromarket-backend api.agro-market.app
```

Copia `cloudflared-config-example.yml` a `~/.cloudflared/config.yml` y reemplaza `TU_TUNNEL_ID_AQUI` con tu ID.

## 3. Desplegar Frontend (Cloudflare Pages)

**Opción A: Conectar repositorio Git (recomendado)**
1. Ve a **Workers & Pages > Pages** en Cloudflare
2. Crea un nuevo proyecto conectando tu repositorio Git
3. Configuración de build:

## 4. Configurar MercadoPago

1. Entra a https://developers.mercadopago.com
2. Ve a **Mis aplicaciones > Credenciales**
3. Copia el **Access Token** de producción y el **Public Key**
4. Actualiza `AgroMarket/agroMarket/.env`:
   ```
   MERCADOPAGO_ACCESS_TOKEN=tu_token_real
   ```
5. Actualiza `AgroMarket/frontend/.env`:
   ```
   VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key_real
   ```
6. Configura las URLs de notificación en el panel de MP:
   - Webhook URL: `https://api.agro-market.app/api/v1/payments/webhook`
   - Success URL: `https://agro-market.app/pago-pasarela`
   - Failure URL: `https://agro-market.app/pago-pasarela`
   - Pending URL: `https://agro-market.app/pago-pasarela`

## 5. Iniciar Backend en Producción

```bash
# Desde la raiz del proyecto
cd AgroMarket

# Iniciar bases de datos
docker-compose up -d mysql mongo

# Iniciar backend (perfil prod)
cd agroMarket
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod

# En otra terminal: iniciar el tunnel
cloudflared tunnel run agromarket-backend
```

O usa el script automatizado:
```bash
cd AgroMarket
start-production.bat
```

## 6. Configurar Brevo (envío de correos)

1. Entra a https://app.brevo.com
2. Ve a **SMTP & API > API Keys**
3. Genera una nueva API Key
4. Actualiza `AgroMarket/agroMarket/.env`:
   ```
   BREVO_API_KEY=tu_nueva_key
   ```

## Variables de Entorno Requeridas

### Backend (`AgroMarket/agroMarket/.env`)

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=tu_secreto_jwt
APP_SECURITY_ID_ENCRYPTION_KEY=tu_key_aes
APP_CORS_ALLOWED_ORIGIN=https://agro-market.app
FRONTEND_URL=https://agro-market.app
GOOGLE_OAUTH2_CLIENT_ID=tu_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=tu_client_secret
GOOGLE_OAUTH2_REDIRECT_URI=https://api.agro-market.app/login/oauth2/code/google
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_real
MERCADOPAGO_WEBHOOK_URL=https://api.agro-market.app/api/v1/payments/webhook
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
BREVO_API_KEY=tu_brevo_key
BREVO_SENDER_EMAIL=noreply@agro-market.app
BREVO_SENDER_NAME=AgroMarket
```

### Frontend (`AgroMarket/frontend/.env`)

```env
VITE_API_URL=https://api.agro-market.app/api/v1
VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key_real
VITE_MERCADOPAGO_SUCCESS_URL=https://agro-market.app/pago-pasarela
VITE_MERCADOPAGO_FAILURE_URL=https://agro-market.app/pago-pasarela
VITE_MERCADOPAGO_PENDING_URL=https://agro-market.app/pago-pasarela
NODE_ENV=production
```

## Solución de Problemas

### El frontend no conecta con el backend
- Verifica que el túnel de Cloudflare esté corriendo: `cloudflared tunnel info agromarket-backend`
- Verifica que el backend esté en el puerto 8080: `netstat -ano | findstr 8080`
- Revisa CORS: el `APP_CORS_ALLOWED_ORIGIN` debe ser `https://agro-market.app`

### MercadoPago no procesa pagos
- Verifica el Access Token: `curl -H "Authorization: Bearer TU_TOKEN" https://api.mercadopago.com/users/me`
- Si devuelve 401, el token está inválido — genera uno nuevo

### Los correos no se envían
- Verifica la API Key de Brevo en https://app.brevo.com/settings/keys
- Revisa que el remitente `noreply@agro-market.app` esté verificado en Brevo

   - Build command: `npm run build`
   - Output directory: `dist`
4. Variables de entorno:
   - `VITE_API_URL` = `https://api.agro-market.app/api/v1`
   - `VITE_MERCADOPAGO_PUBLIC_KEY` = tu clave pública real
   - `NODE_ENV` = `production`
5. Dominio personalizado: `agro-market.app`

**Opción B: Con Wrangler CLI**
```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=agro-market
```

