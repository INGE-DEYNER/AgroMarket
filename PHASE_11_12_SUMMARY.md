# FASE 11 y 12 - Cierre

## Fase 11 - Frontend pendiente (completada)

Cambios aplicados para cerrar inconsistencias del flujo de autenticacion:

- `frontend/js/auth.js`
  - Unificado el manejo de sesion.
  - `login()` ahora usa `api.login(correo, contrasena)` (payload correcto para backend).
  - Sincroniza `am_token` y `token` para compatibilidad con scripts existentes.
  - `clearSession()` ya no borra todo el `localStorage`, solo llaves de sesion.
  - Mantiene funciones legacy (`getCurrentUser`, `setCurrentUser`, `getUsuario`, `isLoggedIn`, etc.).

- `frontend/js/login.js`
  - OAuth callback guarda session en ambas llaves (`am_token` y `token`) y datos base de usuario (`rol`, `nombre`, `correo`).

- `frontend/login.html` y `frontend/registro.html`
  - Boton Google actualizado a `http://localhost:8080/oauth2/authorization/google`.
  - Removidos `onclick` inline en `registro.html` (incompatibles con scripts ES module).

- `agroMarket/src/main/resources/application.properties`
  - `spring.security.oauth2.client.registration.google.redirect-uri` corregido a:
    - `{baseUrl}/login/oauth2/code/{registrationId}`

## Fase 12 - Despliegue (completada)

Cambios aplicados para dejar manifiestos Kubernetes listos para entorno real:

- `k8s/deployment.yaml`
  - Corregida estructura de `strategy` (ahora en `spec`, no en `template.spec`).
  - Reemplazado `JDBC_DATABASE_URL` por `SPRING_DATASOURCE_URL`.
  - Agregadas variables requeridas para OAuth2:
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `FRONTEND_BASE_URL`
  - Agregado `imagePullPolicy: IfNotPresent`.
  - Ajustes de entorno de produccion (`APP_ENV=production`, Hikari pool vars).

- `k8s/configmap.yaml` (nuevo)
  - Configura `frontend_base_url` para inyeccion por ConfigMap.

- `k8s/secret-example.yaml` (nuevo)
  - Plantilla de secretos con llaves requeridas:
    - `db_username`, `db_password`, `jdbc_url`, `jwt_secret`
    - `google_client_id`, `google_client_secret`

- `k8s/kustomization.yaml`
  - Incluye `configmap.yaml` en recursos.

## Validacion

- Compilacion backend verificada previamente en esta sesion con Maven (`clean compile` y `package -DskipTests`).
- Cambios Fase 11 son de frontend y no afectan compilacion Java.
- Cambios Fase 12 son manifiestos Kubernetes y requieren validacion en cluster (`kubectl apply --dry-run=client -k k8s`).

