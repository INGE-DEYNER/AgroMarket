# 🌾 AgroMarket - Plataforma de Comercio Agrícola

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com)
[![Version](https://img.shields.io/badge/version-0.0.1-blue)](https://github.com)
[![Java](https://img.shields.io/badge/Java-17-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-green)](https://spring.io/)

AgroMarket es una plataforma de comercio electrónico diseñada para facilitar la compra y venta de productos agrícolas entre productores y compradores, eliminando intermediarios.

## 🚀 Quick Start (5 minutos)

### Opción 1: Docker (Recomendado)

```bash
cd AgroMarket

# Copiar configuración
cp agroMarket/.env.example agroMarket/.env

# Iniciar servicios
docker-compose up -d

# Acceso:
# - Backend: http://localhost:8080
# - API Docs: http://localhost:8080/swagger-ui.html
```

### Opción 2: Desarrollo Local

```bash
# 1. Copiar .env
cp agroMarket/.env.example agroMarket/.env

# 2. Iniciar solo MySQL
docker-compose up -d mysql

# 3. Compilar & ejecutar backend
cd agroMarket
mvn clean package -DskipTests
mvn spring-boot:run

# 4. Frontend (opcional, en otra terminal)
cd ../frontend
python -m http.server 3000
```

---

## 📋 Setup Completo

Ver **`DEPLOYMENT_GUIDE.md`** para instrucciones paso-a-paso:
- Setup local development
- OAuth2 Google configuration
- Docker deployment
- Kubernetes deployment
- Troubleshooting
- Production checklist

---

## ✨ Características Principales

### Autenticación
- ✅ Email + contraseña
- ✅ **OAuth2 Google** (nuevo en Fase 10)
- ✅ JWT tokens
- ✅ Rate limiting

### Catálogo
- ✅ Gestión de productos
- ✅ Sistema de reseñas
- ✅ Búsqueda y filtros
- ✅ **Caché Caffeine** (Fase 7)

### Compras
- ✅ Carrito de compras
- ✅ Gestión de pedidos
- ✅ Seguimiento de envíos
- ✅ Recuperación de contraseña

### Seguridad & Performance
- ✅ **Validaciones DTO completas** (Fase 8)
- ✅ Compresión gzip
- ✅ Connection pooling Hikari
- ✅ Índices optimizados

---

## 📊 Fases Completadas

| # | Descripción | Estado | Doc |
|---|---|---|---|
| 7 | Caché Caffeine distribuido | ✅ | `CacheConfig.java` |
| 8 | Validaciones DTO completas | ✅ | DTOs en `src/main/java/com/agromarket/application/dto/` |
| 9 | Configuración .env.example | ✅ | `.env.example` |
| 10 | OAuth2 Google integration | ✅ | `OAUTH2_GUIDE.md` |

### 📖 Fase 7 - Caché Caffeine (Completa) ✅

**7 cachés configurados** con TTLs estratégicos:
- productoCache (10+30 min)
- catalogoCache (15 min)
- misProductosCache (5 min)
- resenaCache (20 min)
- usuarioCache (30 min)
- pedidosCache (10 min)
- statsCache (60 min)

**Invalidación automática** en crear/actualizar/eliminar.

**Ubicación**: `src/main/java/com/agromarket/infrastructure/config/CacheConfig.java`

### 📖 Fase 8 - Validaciones DTO (Completa) ✅

**DTOs validados** con mensajes en español:
- CrearProductoRequest: nombre 3-100, desc ≤500, precio>0
- CrearResenaRequest: comentario 10-500, calificación 1-5
- CrearPedidoRequest: cantidad 1-1000
- PasswordResetConfirmRequest: token + contraseña segura
- EnviarMensajeRequest: contenido 1-1000

**Ubicación**: `src/main/java/com/agromarket/application/dto/`

### 📖 Fase 9 - Configuración (Completa) ✅

**Variables de entorno documentadas**:
- Database (credentials, pool)
- JWT (secret, expiration)
- OAuth2 (Google)
- Mail, Uploads, Cache
- Rate limiting, CORS
- Logging, Compression

**Ubicación**: `.env.example` (48 líneas)

### 📖 Fase 10 - OAuth2 Google (Completa) ✅

**Flujo completamente integrado**:
1. Usuario click "Continuar con Google"
2. Spring OAuth2 redirige a Google
3. Usuario autoriza
4. Backend crea/actualiza usuario
5. JWT generado localmente
6. Redirect a dashboard

**Cambios principales**:
- `SecurityConfig.java`: OAuth2 habilitado
- `OAuth2LoginSuccessHandler.java`: Manejo del callback
- `AuthServiceImpl.java`: Creación de usuario auto
- `login.js`: Captura de token desde URL
- `application.properties`: Config OAuth2

**Documentación detallada**: `OAUTH2_GUIDE.md`, `PHASE_10_SUMMARY.md`

---

## 🔧 Tech Stack

### Backend
```
Spring Boot 3.3.5 + Spring Security 6.x + Spring Data JPA
│
├─ Database: MySQL 8.4 + Hibernate
├─ Cache: Caffeine
├─ JWT: JJWT 0.12.3
├─ Rate Limiting: Bucket4j
├─ OAuth2: Spring Security oauth2-client
├─ Validation: Jakarta Validation
├─ Mapping: MapStruct
└─ API Docs: SpringDoc OpenAPI (Swagger)
```

### Frontend
```
Vanilla HTML5/CSS3/JavaScript (ES6+)
│
├─ API Client: Fetch API
├─ Auth: JWT in localStorage
└─ No frameworks (lightweight)
```

### Infrastructure
```
MySQL 8.4 + Docker + Kubernetes (opcional)
```

---

## 📁 Estructura del Proyecto

```
AgroMarket/
├── agroMarket/                    # Backend (Spring Boot)
│   ├── src/main/java/com/agromarket/
│   │   ├── application/           # DTOs, Mappers, Services
│   │   ├── domain/                # Entities, Enums
│   │   ├── infrastructure/        # Config, Security, Persistence
│   │   └── AgroMarketApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties # Config (variables de entorno)
│   │   └── db/migration/         # Flyway SQL scripts
│   ├── pom.xml                   # Maven dependencies
│   ├── Dockerfile                # Build de imagen Docker
│   └── uploads/                  # Archivos subidos por usuarios
│
├── frontend/                      # Frontend (HTML/CSS/JS)
│   ├── *.html                    # Páginas
│   ├── css/                      # Estilos
│   ├── js/                       # Scripts
│   │   ├── api.js               # Cliente HTTP
│   │   ├── auth.js              # Gestión de autenticación
│   │   └── *.js                 # Lógica por página
│   └── uploads/
│
├── k8s/                          # Manifests Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
│
├── infra/
│   └── backup/                   # Scripts de backup
│
├── scripts/
│   └── setup-secrets.sh          # Setup de secretos
│
├── docker-compose.yml            # Composición de servicios
├── .env.example                  # Template de variables
├── DEPLOYMENT_GUIDE.md           # 📖 Guía de despliegue
├── OAUTH2_GUIDE.md              # 📖 Guía de OAuth2
├── PHASE_10_SUMMARY.md          # 📖 Resumen Fase 10
├── README.md                     # Este archivo
└── LICENSE
```

---

## ⚙️ Configuration

### Variables de Entorno (`.env`)

```env
# Database
DB_USERNAME=agromarket_user
DB_PASSWORD=agromarket_pass
DB_HIKARI_MAX_POOL=20
DB_HIKARI_MIN_IDLE=5

# JWT
JWT_SECRET=change-this-min-256-bits

# OAuth2 Google (Required for Fase 10)
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
FRONTEND_BASE_URL=http://localhost:3000

# Mail (optional)
MAIL_HOST=localhost
MAIL_PORT=1025

# Application
UPLOADS_PATH=uploads
APP_ENV=development
```

**Ver `.env.example` para referencia completa.**

---

## 🔐 Autenticación OAuth2 Google

### Setup (5 minutos)

1. **Google Cloud Console**:
   - Ve a https://console.cloud.google.com/
   - Crea OAuth2 credentials (Web application)
   - Add redirect URIs:
     ```
     http://localhost:8080/login/oauth2/code/google
     ```

2. **Configura `.env`**:
   ```env
   GOOGLE_CLIENT_ID=copy_from_console
   GOOGLE_CLIENT_SECRET=copy_from_console
   FRONTEND_BASE_URL=http://localhost:3000
   ```

3. **Prueba en navegador**:
   - Ve a `http://localhost:3000/login.html`
   - Click "Continuar con Google"
   - Debería redirigirte a tu dashboard

**Documentación completa**: Ver `OAUTH2_GUIDE.md`

---

## 🚀 Deployment

### Docker (Local/Staging)

```bash
docker-compose up -d

# Logs
docker-compose logs -f app
docker-compose logs -f mysql

# Stop
docker-compose down
```

### Kubernetes (Production)

```bash
# Primero, crear secrets
kubectl create secret generic agromarket-secrets \
  --from-literal=google-client-id=YOUR_ID \
  --from-literal=google-client-secret=YOUR_SECRET \
  --from-literal=jwt-secret=YOUR_JWT_SECRET

# Deployar
kubectl apply -k k8s/

# Verifica
kubectl get pods -n agromarket
kubectl logs -f deployment/agromarket-app -n agromarket
```

**Ver `DEPLOYMENT_GUIDE.md` para instrucciones completas.**

---

## 🧪 Build & Test

```bash
# Compile
mvn clean compile

# Package
mvn package -DskipTests

# Run tests (if exist)
mvn test

# Docker build
docker build -f agroMarket/Dockerfile -t agromarket:latest agroMarket/
docker run -p 8080:8080 agromarket:latest
```

---

## 📚 Documentación

| Documento | Contenido |
|-----------|-----------|
| **DEPLOYMENT_GUIDE.md** | Setup local, Docker, Kubernetes, producción, troubleshooting |
| **OAUTH2_GUIDE.md** | Flujo OAuth2, debugging, extensiones (Facebook, GitHub) |
| **PHASE_10_SUMMARY.md** | Resumen de cambios y estado final de Fase 10 |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |

---

## 📞 Soporte

### Problemas Comunes

**Backend no inicia:**
```bash
# Verifica MySQL
docker-compose logs mysql

# Verifica puertos
lsof -i :8080

# Verifica .env
cat agroMarket/.env
```

**OAuth2 no funciona:**
- Verifica `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en .env
- Revisa que redirect URI esté en Google Console
- Check browser console para errores de JavaScript

**Token expira rápido:**
- Revisa `JWT_SECRET` es consistente entre reinicios
- Aumenta `agromarket.jwt.expiration-ms` en `application.properties`

Ver `DEPLOYMENT_GUIDE.md` para más troubleshooting.

---

## 📈 Performance

### Configuración Optimizada

| Aspecto | Valor |
|--------|-------|
| Connection Pool (Hikari) | 20 máximo, 5 mínimo |
| Batch Size (Hibernate) | 20 |
| Caché TTL | 5-30 minutos |
| Compresión | gzip para > 1KB |
| Índices | ID, email, status |

### Expected Performance
- API response: < 200ms (cached) / < 500ms (uncached)
- Page load: < 2s

---

## 🛡️ Security

- ✅ JWT tokens con expiración
- ✅ Rate limiting (`RateLimitingFilter.java`)
- ✅ CORS configurado por origen
- ✅ Password bcrypt encoded
- ✅ Input validation en DTOs
- ✅ OAuth2 con PKCE automático
- ✅ State parameter para CSRF prevention

---

## 📝 Roadmap

- [ ] Tests unitarios & integración
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (Prometheus)
- [ ] Centralized logging (ELK)
- [ ] Multi-idioma (i18n)
- [ ] Facturación electrónica
- [ ] Analytics

---

## 📄 License

proyectoMIT License. Ver `LICENSE` para más detalles.

---

## 👥 Autor

**Deyner Chaverra** - Desarrollo principal

---

**Last Updated**: May 29, 2026  
**Current Version**: 0.0.1-SNAPSHOT  
**Status**: In Development - MVP Complete ✅

**Próximos pasos**: QA Testing → Production Deployment


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
