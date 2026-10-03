# Credenciales pendientes de configuración

> **Estado**: este documento NO contiene ningún valor secreto. Solo indica
> qué variables existen, dónde se configuran y qué se rompe si faltan.
> Nótese que `JWT_SECRET` y `APP_SECURITY_ID_ENCRYPTION_KEY` están escritos
> **en claro** en `docker-compose.yml` (líneas 76-77), no en el `.env`.

Diagnóstico realizado el 2026-09-28 contra el contenedor `asafrut-backend`
en marcha (`docker exec asafrut-backend printenv`).

---

## 1. Cloudinary — almacenamiento de imágenes

### Variables

| Variable de entorno | Propiedad Spring | ¿Aparece en `docker-compose.yml`? |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | `cloudinary.cloud-name` | ❌ **No** |
| `CLOUDINARY_API_KEY` | `cloudinary.api-key` | ❌ **No** |
| `CLOUDINARY_API_SECRET` | `cloudinary.api-secret` | ❌ **No** |

Las lee `CloudinaryFileStorageAdapter` con `@Value` directo (no con
`CloudinaryProperties`, que existe pero **nadie inyecta**).

### Qué pasa hoy sin ellas

**Las imágenes SÍ se guardan, pero en base64 dentro de la base de datos.**

`CloudinaryFileStorageAdapter.upload()` tiene un fallback explícito
(líneas 37-46): si `cloud_name` o `api_key` vienen vacíos, genera un
`data:` URL y lo devuelve como si fuera una URL normal.

Consecuencias:
- Un JPEG de 2 MB ocupa ~2,7 MB en la columna `images` de MySQL
- `MAX_ALLOWED_PACKET` de MySQL (por defecto 64 MB) es el límite real
- La base de datos crece sin control y los listados se ralentizan
- No hay CDN, ni compresión, ni transformaciones

**Esto NO es la causa de que "subir imagen no funcione"**, aunque lo parecía.

### Dónde obtenerlas

1. Crear cuenta en <https://cloudinary.com> (plan gratuito alcanza)
2. Dashboard → **Settings → API Keys**
3. Copiar **Cloud name**, **API key** y **API secret**

### Cómo configurarlas

Añadir al `.env` de la raíz del proyecto (junto al `docker-compose.yml`):

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Y declarar las tres en el `environment:` de `asafrut-backend`:

```yaml
- CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME:-}
- CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY:-}
- CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET:-}
```

> **Pendiente de código**: las tres líneas del `docker-compose.yml` todavía
> **no están escritas**. Se añadirán cuando haya autorización, junto con
> la limpieza del fallback base64 (que debería pasar a ser un error
> explícito, no un modo silencioso).

---

## 2. MercadoPago — pasarela de pagos

### Variables

| Variable de entorno | Propiedad Spring | ¿En compose? |
|---|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | `app.mercadopago.access-token` | ❌ **No** |
| `MERCADOPAGO_WEBHOOK_URL` | `app.mercadopago.webhook-url` | ❌ **No** |
| `MERCADOPAGO_USE_MOCK` | `app.mercadopago.use-mock` | ❌ **No** |
| `MERCADOPAGO_BASE_URL` | `app.mercadopago.base-url` | ❌ **No** (tiene default) |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | (frontend, build-time) | ❌ **No** |

**Existe modo mock**: con `MERCADOPAGO_USE_MOCK=true` el backend responde
sin llamar a MercadoPago. Permite probar el flujo completo **sin mover
dinero real**. Está en `false` y **no se ha activado** (esperando
autorización explícita).

### Dónde obtenerlas

1. <https://www.mercadopago.com.co/developers/panel/app> → crear aplicación
2. **Credenciales de producción**: `Access Token` (empieza por `APP_USR-`)
3. **Webhooks** → registrar `https://api.agro-market.app/api/v1/payments/webhook`
   y suscribirse a los eventos de pago

La **public key** va aparte, en el `.env` del **frontend**
(`AgroMarket/frontend/.env`), porque Vite la incrusta en el bundle al
construir. Cambiarla exige **rebuild**, no solo reiniciar el contenedor.

---

## 3. Otros (verificados presentes)

| Servicio | Variable | Estado |
|---|---|---|
| Brevo (correo) | `BREVO_API_KEY` | ✅ En el `.env` |
| JWT | `JWT_SECRET` | ⚠️ En claro en `docker-compose.yml:76` |

---

## 5. Carpeta de destino — REQUISITO DE DEYNER (aún NO aplicado)

Deyner pide que las imágenes de productos se guarden en
`Agromarket/products`, carpeta que ya existe en su cuenta.

### Estado actual

`CloudinaryFileStorageAdapter.upload()` (líneas 48-55) envía a Cloudinary:

```java
cloudinary.uploader().upload(content, ObjectUtils.asMap(
    "resource_type",    "image",
    "use_filename",     true,
    "unique_filename",  true,
    "filename_override", fileName));
```

**No hay ningún parámetro `folder`.** Con esos valores Cloudinary guarda el
archivo en la **raíz** del proyecto, no en `Agromarket/products`.

### Cambio pendiente

Añadir el parámetro `folder` a la llamada, con valor configurable por
entorno en vez de escrito a fuego:

```java
ObjectUtils.asMap(
    "resource_type",     "image",
    "use_filename",      true,
    "unique_filename",   true,
    "filename_override", fileName,
    "folder",            folder)          // nuevo
```

Y la variable:

| Variable | Valor previsto |
|---|---|
| `CLOUDINARY_FOLDER` | `Agromarket/products` |

declarada en el `docker-compose.yml` como las otras tres, con un valor por
defecto razonable si viene vacía.

> **Por qué configurable y no fijo**: las carpetas de Cloudinary pueden
> diferir entre desarrollo y producción. Fijar el valor en el código
> obligaría a recompilar el JAR para cambiarlo.

### Verificación posterior

Subir una imagen de prueba y comprobar en la consola de Cloudinary que
aparece dentro de `Agromarket/products`, no en la raíz.

---

## 6. Bug `@RequestPart` vs `@RequestParam` — identificado, NO corregido

`ImageController.upload()` declara:

```java
@RequestPart("file") MultipartFile file,
@RequestParam Long ownerId,
@RequestParam ImageType type
```

El frontend (`DashboardProductor.jsx:693-697`) manda los tres dentro de un
`FormData`:

```js
formData.append("file", selectedImageFile);
formData.append("ownerId", productId);
formData.append("type", "PRODUCT");
```

`@RequestPart` lee el archivo del `multipart/form-data`; `@RequestParam` lee
la **query string**, no las partes del formulario. Con este contrato la
petición llega con `ownerId` y `type` nulos → **400 Bad Request**.

**Decisión pendiente** (a tomar antes de implementar):

| Opción | Ventaja | Riesgo |
|---|---|---|
| Backend a `@RequestPart("ownerId")` y `@RequestPart("type")` | Todo en el `FormData`, un solo lugar de la verdad | Ninguno: es lo que el cliente ya manda |
| Frontend a query params | No se toca el backend | Reparte el contrato en dos sitios |

**Recomendación**: la primera. El cliente ya envía un `FormData` bien
construido; es el servidor el que mezcla dos mecanismos distintos.

Además, la documentación (`docs/ANALISIS_PROYECTO.md:96,179`) anuncia
`POST /api/v1/products/{id}/images`, ruta que **no existe**: el endpoint
real es `POST /api/v1/images` y recibe el producto como `ownerId` (que es
en realidad el **id del producto**, no del propietario — el nombre engaña
y conviene renombrar a `productId`).

