# AUDITORÍA DE PERSISTENCIA — MySQL + MongoDB

> Revisión aplicada sobre las entidades Java, sus consumidores, la configuración de Docker y los formularios del frontend. La base se reconstruyó con los volúmenes Docker del proyecto; los servicios MySQL/Mongo instalados directamente en Windows no se tocan.

## 0. Deuda técnica conocida (NO corregida, a propósito)

### 0.1 `images.ownerId` en realidad guarda un `productId`

**Síntoma.** El endpoint de subida recibe `?productId=<id>&type=PRODUCT`
(`ImageController`), pero el documento de MongoDB guarda ese id en el campo
`ownerId`, no en `productId`. La colección `images` **no tiene ningún campo
`productId`**.

**Por qué funciona igual.** El adaptador copia el valor tal cual y nadie lee
ese campo para resolver nada: la imagen que ve el catálogo sale de
`products.image_url` (MySQL), no de Mongo. Es decir, **funciona por
coincidencia**, y el nombre del campo induce a error a quien lea el modelo.

**Origen.** El frontend antes mandaba `ownerId` con el id del usuario; cuando
se corrigió a `productId`, el backend siguió guardándolo en el mismo campo
para no romper los documentos ya escritos.

**Riesgo real.** Un `ownerId=1` en la colección significa "producto 1", no
"usuario 1". Cualquier funcionalidad futura que intente "listar las imágenes
de este usuario" devolvería imágenes de productos, no del usuario.

**Por qué no se corrige ahora.** Renombrar el campo exige migrar los
documentos existentes **y** tocar todos los sitios que lo leen y escriben.
Es un cambio de alcance mayor, igual que el del peso volumétrico.

**Cómo corregirlo cuando se decida.** Añadir `productId` al
`ImageDocument`, migrar con `$rename` conservando `ownerId` durante una
transición, actualizar `ImageUseCase` y el adaptador, y solo después dejar de
escribir `ownerId`.

### 0.2 Imágenes en base64 que quedaron huérfanas

Cuando Cloudinary no estaba configurado, `CloudinaryFileStorageAdapter` caía a
un fallback que guardaba el archivo como `data:<mime>;base64,…` dentro del
documento. Hay al menos una así en la colección (`maracuya.jpg`, ~36 KB) que
**nunca se enlazó a su producto**: `products.image_url` sigue vacío, así que el
catálogo público muestra el icono por defecto. Se conserva como respaldo hasta
que el productor vuelva a subir la foto; después puede limpiarse.

## 1. MySQL — tablas que se conservan

| Tabla | Motivo |
|---|---|
| `users` | Identidad, credenciales, roles, KYC, perfil, OAuth y 2FA. |
| `admins` | Relación administrativa 1:1 con `users`. |
| `user_addresses` | Direcciones de entrega 1:N del usuario. |
| `products` | Catálogo y datos de productores. |
| `orders`, `order_items` | Órdenes y sus partidas. |
| `payments`, `credit_cards`, `invoices` | Pagos y trazabilidad financiera; nunca PAN/CVV. |
| `shipping` | Envíos, entregas y seguimiento. |
| `return_requests`, `return_request_items`, `return_request_evidences` | Devoluciones; las evidencias son URLs, no binarios. |
| `reviews` | Reputación de productos. |
| `coupons`, `wishlists` | Descuentos y listas de favoritos. |
| `request_for_quotes`, `quote_offers` | Cotizaciones mayoristas. |
| `app_config` | Configuración de envío/mantenimiento. |
| `auth_access_events` | Auditoría de acceso; se conserva porque tiene consumidores de seguridad. |
| `password_history` | Seguridad contra reutilización de contraseñas; se conserva porque participa en el reset. |

Las tablas de negocio vacías no se eliminan: aunque hoy no tengan filas, representan functionality que el backend expone y una FUTURE inserción necesita.

## 2. MySQL — limpieza aplicada

### 2.1 Columnas eliminadas (sin consumidor o duplicadas)

| Columna eliminada | Motivo |
|---|---|
| `phone_verified` | No existía verificación de teléfono en ninguna pantalla. |
| `phone_verification_token` | Sin consumidor. |
| `phone_token_expiry` | Sin consumidor. |
| `bank_account` | Sin consumidor; además es dato financiero sensible que no debe residir en `users`. |
| `first_shipping_coupon_used` | El sistema de cupones ya tiene su propia tabla. |
| `approved` | **Duplicada**: siempre valía `true` y nunca se modificaba. Se unificó con `account_approved`. |
| `verified_producer` | **Duplicada**: el panel hacía `verified_producer OR account_approved`. Se unificó con `account_approved`. |
| `account_status` | **Derivada**: `PENDING_EMAIL`/`ACTIVE`/`REJECTED` se deducen de `email_verified` + `account_approved`. |
| `account_complete` | **Derivada**: se calcula de `id_type` + `id_number` + `birth_date` (ver `User#isAccountComplete`). Era la causa del bug "Completar cuenta reaparece al refrescar". |
| `is_company` | **Derivada**: una cuenta es empresa si tiene razón social (`User#isCompanyUser`). Podía contradecir a `company_name`. |
| `registration_date` | **Duplicada**: se llenaba siempre con el mismo valor que `created_at`. Se unificó en `created_at`. |
| `location` | **Duplicada**: texto libre que contradecía `department` + `city`. Se unificó en esas dos columnas. |
| `average_rating` | **Nunca se escribía**: no existía ningún setter en el código, siempre valía 0. La reputación real se calcula desde `reviews` en `ProductUseCase`. |
| `total_reviews` | Ídem. |
| `provider_id` | **Nunca se leía**: se escribía al login con Google, pero la búsqueda de usuario en OAuth es solo por correo (`findByEmail`); no existía `findByProviderId`. Dato escrito y jamás consultado. |
| `last_login` | Se escribía en cada login y se exponía en `UserResponse`, pero **ninguna pantalla lo mostraba**. La auditoría de accesos ya vive en `auth_access_events`, que sí tiene consumidores de seguridad. |

### 2.2 Columnas conservadas

- `active` — controla el acceso (habilitar/deshabilitar desde el panel).
- `account_approved` — **único** indicador de aprobación tras la unificación. Para `PRODUCER` es la validación que autoriza operar; `BUYER`/`ADMIN` se registran ya aprobados.
- `email_verified` — exigido por `UserService.canLogin`.
- `department`, `city`, `full_address`, `address_reference`, `postal_code` — dirección estructurada, ahora también usada como "ubicación" en el perfil y como `destination_address` en envíos.
- `auth_access_events` debe depurarse por retención (por ejemplo, 90 días); no se elimina la tabla.
- `password_history` debe conservar como máximo los hashes antiguos necesarios para impedir reutilización; no se almacena la contraseña en claro.

### 2.3 Código muerto y endpoints rotos eliminados

- `UpdateUserRequest.java` — record **idéntico** a `UpdateProfileRequest`; ambos mapeaban al mismo `UpdateProfileCommand`. Se conservó un solo tipo.
- `GET /api/public/productores` (`BackendDiagnosticController`) — consulta SQL inválida (`u.enabled` no existe, `u.role = 'PRODUCTOR'` no coincide con el enum `PRODUCER`) y **sin ningún consumidor en el frontend** (el directorio de productores usa `GET /api/v1/users?rol=PRODUCER`).
- Listas de dominio no persistidas `orderHistory` y `publishedProducts`.

Endpoints que el frontend llamaba pero **no existían** en el backend:

| Endpoint | Problema | Solución |
|---|---|---|
| `GET /cupones/todos` | `CouponController` solo exponía `/active`; el panel de cupones del admin salía vacío. | Añadido `getAll()` en toda la cadena (repositorio → adaptador → caso de uso → controlador). |
| `DELETE /cupones/{id}` | No había `@DeleteMapping`; solo `PATCH /{id}/deactivate`. | Añadido `delete(id)`. |
| `GET /facturas/pedido/{id}` | El alias declaraba `{pedidoId}` pero el parámetro era `orderId`: Spring lanzaba `MissingPathVariableException` (500). | Ruta y `@PathVariable("orderId")` alineados. |

Desajustes de contrato frontend ↔ backend (el frontend mandaba claves en español que Jackson descartaba **en silencio**):

| Operación | Antes | Ahora |
|---|---|---|
| `PUT /usuarios/me` y `/usuarios/mi-perfil` (datos) | `nombre`, `apellido`, `telefono`, `departamento` | `firstName`, `lastName`, `phone`, `department` |
| `PUT /usuarios/mi-perfil` (preferencias) | `divisaPreferida` | `preferredCurrency` |
| `PUT /usuarios/me/contrasena` (4 pantallas) | `contrasenaActual` / `nuevaContrasena` | `currentPassword` / `newPassword` |

Además `UpdateProfileRequest` y `ChangePasswordRequest` llevan `@JsonAlias` con los nombres en español, igual que ya hacía `CreditCardController.CreateCardRequest`, para que un desajuste futuro no vuelva a fallar en silencio.

### 2.4 Contrato de API afectado

`UserResponse` deja de exponer `approved`, `verifiedProducer`, `accountStatus`, `registrationDate`, `location`, `averageRating` y `totalReviews`; `location` se compone de `city` + `department` en `AdminUsuarioResponse.ubicacion`.

La reconstrucción desde cero elimina columnas antiguas que existían en el volumen anterior. `ddl-auto: update` no debe usarse como migración destructiva en producción; para una base existente se requiere una migración SQL aprobada.

### 2.5 Banco de ciudades para el formulario de residencia

El formulario de residencia pasó de dos inputs de texto libre (que permitían combinaciones imposibles, p. ej. un municipio Antioquia con país = España) a **selects encadenados** dependientes del país.

- `frontend/src/application/support/geoCatalog.js` — catálogo: 8 países; Colombia con 30 departamentos y sus municipios; el resto con sus ciudades principales. Exporta `PAISES`, `departamentosDe()`, `ciudadesDe()`, `paisPorCodigo()` y `banderaDe()`.
- `frontend/src/presentation/shared/components/SelectorResidencia.jsx` — componente reutilizable con los tres selects en cascada. Al cambiar el país se reinician departamento y ciudad, de modo que nunca queda una combinación inconsistente; los selects de nivel inferior se deshabilitan hasta que el nivel anterior esté elegido.

Vive en el código y no en la base de datos porque es **catálogo de referencia, no dato de negocio**: no tiene histórico, ni auditoría, ni relaciones. Persistirlo añadiría más de 30 filas y un endpoint de consulta para algo que solo cambia por versión del frontend.

Consumidores: `Registro.jsx` (solo productores) y `Perfil.jsx` (todos los roles). El valor persistido sigue siendo `users.country_code` + `department` + `city`; no se añadieron columnas.

## 3. MongoDB — colecciones conservadas

| Colección | Consumidor |
|---|---|
| `messages` | Mensajería entre usuarios. |
| `notifications` | Notificaciones de la plataforma. |
| `tickets` | Soporte y comunicación con administración. |
| `images` | Metadatos; el archivo binario vive fuera de Mongo. |

Estas cuatro colecciones permanecen en el código mediante sus documentos y repositorios.

## 4. MongoDB — documentos y colecciones eliminados

Se eliminaron porque no tenían ningún consumidor fuera de su propia declaración:

- `system_logs`
- `user_activity_logs`
- `user_events`
- `complex_notifications`
- `dynamic_metadata`
- `chatbot_messages`
- `chatbot_conversations`

También se eliminaron sus documentos/repositorios Java. No se eliminan datos de negocio de MySQL para ‘ahorrar espacio’ si esos módulos siguen activos.

## 5. Reglas para no volver a inflar la base

1. No guardar binarios, PAN, CVV ni passwords en claro.
2. Logs dedepuran por retención; no se conserva `stackTrace` en registros de nivel INFO.
3. Las notificaciones y tickets conservan solo datos necesarios para operar y soportar al usuario.
4. Las imágenes se almacenan como URL/metadatos, no como blobs.
5. Antes de añadir una colección o columna se debe comprobar que tenga un consumidor real.
6. Si un valor es **derivable** de otros campos, no se persiste: se calcula (`User#isAccountComplete`, `User#isCompanyUser`).
7. Si dos columnas significan lo mismo, se conserva una (`account_approved` absorbe `approved` y `verified_producer`; `created_at` absorbe `registration_date`; `department`+`city` absorben `location`).
8. Para volver a cero la demo, eliminar únicamente los volúmenes Docker `asafrut_mysql_data` y `asafrut_mongo_data` y ejecutar nuevamente `docker compose up -d`.

