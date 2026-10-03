# AgroMarket - Documentación del Proyecto

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Estructura del Backend](#estructura-del-backend)
6. [Estructura del Frontend](#estructura-del-frontend)
7. [Endpoints de la API](#endpoints-de-la-api)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Metodología Scrum](#metodología-scrum)
10. [Solución de Problemas](#solución-de-problemas)
11. [Despliegue](#despliegue)

---

## Descripción General

**AgroMarket** es una plataforma de comercio electrónico especializada en productos agrícolas que conecta a productores con compradores. El sistema permite:
- Registro y autenticación de usuarios (productores y compradores)
- Publicación y gestión de productos agrícolas
- Búsqueda y filtrado de productos por categorías
- Sistema de pedidos y pagos
- Gestión de reseñas y calificaciones
- Chat en tiempo real entre usuarios
- Dashboard de administración

---

## Arquitectura del Sistema

### Arquitectura General
```
┌─────────────────────────────────────────────────────────────────┐
│                              CLIENTES                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    │
│  │   Web       │    │   Mobile    │    │      Administradores  │    │
│  │  (React)    │    │  (Futuro)    │    │         (Admin)      │    │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬────────────┘    │
└─────────┼───────────────────┼───────────────────────┼─────────────┘
          │                   │                       │
          └───────────────────┼───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                  │
│                        (Spring Cloud Gateway - Futuro)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND (Spring Boot)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   Application    │  │    Domain        │  │  Infrastructure   │    │
│  │     Layer        │  │     Layer        │  │      Layer       │    │
│  │  - Controllers   │  │  - Models        │  │  - Security       │    │
│  │  - Services      │  │  - Ports         │  │  - Database       │    │
│  │  - DTOs          │  │  - Use Cases     │  │  - CORS           │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     MySQL        │  │    MongoDB       │  │   Redis (Cache)  │
│  (Datos Rel.)    │  │  (Logs/Auditoría) │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Capas del Backend (Clean Architecture)
```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    API Controllers                              ││
│  │  - ProductController, UserController, OrderController, etc.    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Use Cases / Services                           ││
│  │  - ProductService, OrderService, AuthService, etc.            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Models & Business Logic                       ││
│  │  - Product, User, Order, Review, Payment, etc.                 ││
│  │  - Domain Services (pure business logic)                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE LAYER                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Ports & Adapters                             ││
│  │  - JPA Repository (MySQL)                                     ││
│  │  - MongoDB Repository (Logs)                                   ││
│  │  - REST API Adapters                                          ││
│  │  - Security Config                                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Java | 17+ | Lenguaje principal |
| Spring Boot | 3.x | Framework de aplicaciones |
| Spring Security | 6.x | Autenticación y autorización |
| Spring Data JPA | 3.x | Acceso a base de datos |
| Spring Web MVC | 3.x | Controladores REST |
| MySQL | 8.x | Base de datos relacional |
| MongoDB | 6.x | Base de datos NoSQL (logs) |
| Flyway | - | Migrations de base de datos |
| JWT | - | Tokens de autenticación |
| OAuth2 | - | Autenticación con Google |
| Mercadopago API | - | Pasarela de pagos |
| Cloudinary | - | Almacenamiento de imágenes |
| Brevo (Sendinblue) | - | Envío de correos |

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| React | 18.x | Biblioteca principal |
| Vite | 5.x | Build tool y servidor de desarrollo |
| React Router | 6.x | Navegación |
| React i18next | - | Internacionalización |
| Axios | - | Peticiones HTTP |
| Tailwind CSS | - | Estilos |
| Shadcn/ui | - | Componentes UI |

### DevOps & Herramientas
| Tecnología | Descripción |
|------------|-------------|
| Docker | Contenedores |
| Git | Control de versiones |
| GitHub | Repositorio |
| Scrum | Metodología de desarrollo |

---

## Configuración del Proyecto

### Requisitos Previos

#### Backend
- Java JDK 17+
- Maven 3.8+
- MySQL 8.x
- MongoDB 6.x (opcional, para logs)
- Node.js 18+ (para frontend)

#### Frontend
- Node.js 18+
- npm 9+

### Configuración del Backend

1. **Clonar el repositorio:**
```bash
cd AgroMarket/agroMarket
git clone <repositorio>
```

2. **Configurar variables de entorno:**
Crear archivo `.env` en `agroMarket/`:
```env
# Base de datos
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/agromarket
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-very-secure-jwt-secret-key-at-least-256-bits
JWT_EXPIRATION_MS=3600000

# CORS
APP_CORS_ALLOWED_ORIGIN=http://localhost:5173,http://localhost:5174

# OAuth2
GOOGLE_OAUTH2_CLIENT_ID=your-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH2_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google

# Correo
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key

# Mercadopago
MERCADOPAGO_BASE_URL=https://api.mercadopago.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@agromarket.com
BREVO_SENDER_NAME=AgroMarket
```

3. **Crear base de datos:**
```sql
CREATE DATABASE agromarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Ejecutar migraciones Flyway:**
```bash
mvn flyway:migrate
```

5. **Iniciar el servidor:**
```bash
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### Configuración del Frontend

1. **Instalar dependencias:**
```bash
cd AgroMarket/frontend
npm install
```

2. **Configurar variables de entorno:**
Crear archivo `.env` en `frontend/`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=AgroMarket
```

3. **Iniciar la aplicación:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## Estructura del Backend

```
agroMarket/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── agromarket/
│   │   │           ├── application/          # Capa de aplicación
│   │   │           │   ├── adapters/          # Adaptadores (controllers, repositorios)
│   │   │           │   │   ├── api/           # Controladores REST
│   │   │           │   │   │   └── controllers/
│   │   │           │   │   └── persistence/    # Repositorios JPA/MongoDB
│   │   │           │   ├── ports/           # Puertos (interfaces)
│   │   │           │   │   ├── in/           # Puertos de entrada
│   │   │           │   │   └── out/          # Puertos de salida
│   │   │           │   └── services/        # Servicios de aplicación
│   │   │           ├── domain/              # Capa de dominio
│   │   │           │   ├── models/         # Modelos de dominio
│   │   │           │   ├── ports/          # Interfaces de dominio
│   │   │           │   ├── exceptions/     # Excepciones de dominio
│   │   │           │   └── services/       # Servicios de dominio
│   │   │           └── infrastructure/     # Capa de infraestructura
│   │   │               ├── config/         # Configuraciones
│   │   │               │   ├── properties/   # Propiedades de configuración
│   │   │               │   └── ...
│   │   │               ├── security/       # Seguridad
│   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   └── ...
│   │   │               └── ...
│   │   └── resources/
│   │       ├── application.yml         # Configuración principal
│   │       ├── db/
│   │       │   └── migration/           # Migraciones Flyway
│   │       └── ...
└── pom.xml
```

---

## Estructura del Frontend

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── app/             # Configuración y providers
│   │   ├── contexts/     # Contextos React
│   │   ├── hooks/       # Hooks personalizados
│   │   ├── providers/   # Providers (Auth, Divisa, Cart, etc.)
│   │   ├── router/      # Configuración de rutas
│   │   └── App.tsx      # Componente principal
│   ├── infrastructure/   # Infraestructura
│   │   ├── config/     # Configuraciones
│   │   │   └── FrontendDiagnostic.js
│   │   ├── http/       # Configuración HTTP
│   │   │   └── api.js  # Cliente API
│   │   └── ...
│   ├── presentation/     # Capa de presentación
│   │   ├── features/   # Funcionalidades
│   │   │   ├── admin/         # Administración
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── home/          # Página de inicio
│   │   │   ├── order/         # Pedidos
│   │   │   ├── payment/       # Pagos
│   │   │   ├── product/       # Productos
│   │   │   ├── profile/       # Perfil
│   │   │   ├── review/        # Reseñas
│   │   │   ├── shipping/      # Envíos
│   │   │   └── messaging/     # Mensajería
│   │   └── shared/     # Componentes compartidos
│   │       ├── components/   # Componentes reutilizables
│   │       ├── feedback/     # Feedback (errors, loading, etc.)
│   │       └── styles/       # Estilos
│   ├── i18n/            # Internacionalización
│   │   └── index.js
│   ├── main.jsx         # Punto de entrada
│   └── ...
├── package.json
└── vite.config.js
```

---

## Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Inicio de sesión | Pública |
| POST | `/api/auth/registro` | Registro de usuario | Pública |
| POST | `/api/auth/recuperar-contrasena` | Recuperar contraseña | Pública |
| POST | `/api/auth/restablecer-contrasena` | Restablecer contraseña | Pública |
| POST | `/api/auth/verificar` | Verificar cuenta | Pública |
| POST | `/api/auth/logout` | Cierre de sesión | Autenticada |
| GET | `/api/auth/token-exchange` | Intercambio de tokens | Autenticada |

### Usuarios
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/usuarios/me` | Obtener perfil | Autenticada |
| PUT | `/api/usuarios/me` | Actualizar perfil | Autenticada |
| PATCH | `/api/usuarios/divisa` | Cambiar divisa | Autenticada |
| GET | `/api/usuarios?rol=PRODUCTOR` | Listar productores | Autenticada |

### Productos
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/productos` | Listar productos | Pública |
| GET | `/api/productos/categorias` | Listar categorías | Pública |
| GET | `/api/productos/{id}` | Obtener producto | Pública |
| POST | `/api/productos` | Crear producto | Autenticada (PRODUCTOR) |
| PUT | `/api/productos/{id}` | Actualizar producto | Autenticada (PRODUCTOR/ADMIN) |
| DELETE | `/api/productos/{id}` | Eliminar producto | Autenticada (PRODUCTOR/ADMIN) |

### Divisas
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/divisas/tasas` | Obtener tasas de cambio | Pública |

### Pedidos
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/pedidos/mis-pedidos` | Mis pedidos | Autenticada |
| POST | `/api/pedidos` | Crear pedido | Autenticada |

### Reseñas
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/resenas` | Listar reseñas | Pública |
| POST | `/api/resenas` | Crear reseña | Autenticada |

### Mensajería
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/mensajes/contactos` | Mis contactos | Autenticada |
| GET | `/api/mensajes/conversacion/{id}` | Conversación | Autenticada |
| POST | `/api/mensajes` | Enviar mensaje | Autenticada |

### Diagnóstico
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/public/metrics` | Métricas públicas | Pública |
| GET | `/api/public/diagnostic` | Diagnóstico del backend | Pública |
| POST | `/api/public/chatbot` | Chatbot de soporte | Pública |
| GET | `/actuator/health` | Health check | Pública |

---

## Autenticación y Seguridad

### Flujo de Autenticación

```
1. Login:
   Usuario → POST /auth/login {email, password}
   Backend → Valida credenciales
   Backend → Genera JWT
   Backend → Retorna token

2. Peticiones Autenticadas:
   Cliente → GET /api/protected-endpoint
   Cliente → Header: Authorization: Bearer <token>
   JwtAuthenticationFilter → Valida token
   Backend → Procesa petición

3. Token Expirado:
   JwtAuthenticationFilter → Detecta token expirado
   Backend → 401 Unauthorized
   Cliente → Redirige a /login
```

### Configuración de Seguridad (SecurityConfig.java)

```java
// Endpoints públicos
.requestMatchers("/api/public/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/v1/products/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/resenas/**", "/api/v1/reviews/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/divisas/**").permitAll()
.requestMatchers("/actuator/health", "/actuator/health/**").permitAll()

// Resto de endpoints requieren autenticación
.anyRequest().authenticated()
```

### Configuración CORS (application.yml)

```yaml
app:
  cors:
    allowed-origins:
      - http://localhost:3000
      - http://localhost:5173
      - http://localhost:5174

spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_OAUTH2_CLIENT_ID}
            client-secret: ${GOOGLE_OAUTH2_CLIENT_SECRET}
```

---

## Metodología Scrum

### Definición

**Scrum** es un marco de trabajo ágil para la gestión de proyectos que permite:
- Entrega iterativa e incremental de producto
- Adaptabilidad a cambios en requisitos
- Colaboración cercana con el cliente
- Transparencia en el progreso

### Roles en el Proyecto AgroMarket

#### 1. Product Owner (PO)
- **Responsabilidades:**
  - Definir las características del producto
  - Priorizar el Product Backlog
  - Asegurar que el equipo de desarrollo entienda los items del backlog
  - Maximizar el valor del producto

- **Perfil:** Representante del negocio o cliente

#### 2. Scrum Master
- **Responsabilidades:**
  - Asegurar que el equipo Scrum siga las prácticas y reglas de Scrum
  - Eliminar impedimentos del equipo
  - Facilitar reuniones y eventos Scrum
  - Proteger al equipo de interferencias externas

- **Perfil:** Líder servidor del equipo

#### 3. Development Team
- **Responsabilidades:**
  - Desarrollar incrementos de producto funcionales
  - Auto-organizarse para completar el trabajo
  - Estimar el esfuerzo de las tareas
  - Colaborar con el PO para refinar el backlog

- **Perfil:** Desarrolladores backend, frontend, QA
- **Tamaño:** 3-9 miembros

### Artefactos Scrum

#### 1. Product Backlog
Lista priorizada de todas las características, mejoras y fixes necesarios para el producto.

**Ejemplo para AgroMarket:**
```
ID | Título | Descripción | Prioridad | Story Points | Estado
---|--------|-------------|-----------|--------------|--------
US-001 | Registro de usuarios | Permitir registro con email/password | Alta | 8 | Done
US-002 | Inicio de sesión | Autenticación con JWT | Alta | 5 | Done
US-003 | Catálogo de productos | Listado paginado de productos | Alta | 13 | Done
US-004 | Búsqueda de productos | Filtrar por categoría, precio, etc. | Media | 8 | In Progress
US-005 | Carrito de compras | Gestión de productos seleccionados | Alta | 13 | To Do
```

#### 2. Sprint Backlog
Lista de items seleccionados del Product Backlog para el Sprint actual, junto con el plan de acción.

**Ejemplo Sprint 1:**
```
Sprint: 1
Duración: 2 semanas (10 días laborables)
Objetivo: MVP con autenticación y catálogo básico

ID | Tarea | Asignado | Estimación | Estado
---|-------|----------|-----------|--------
T-001 | Implementar modelo User | Dev1 | 2h | Done
T-002 | Crear controlador AuthController | Dev2 | 4h | Done
T-003 | Configurar JWT | Dev1 | 3h | Done
T-004 | Crear frontend de login | Dev3 | 8h | In Progress
```

#### 3. Incremento
El producto funcional al final de cada Sprint. En AgroMarket, cada Sprint entrega:
- Sprint 1: MVP con autenticación y catálogo
- Sprint 2: Carrito y pedidos
- Sprint 3: Pagos y facturación
- Sprint 4: Reseñas y mensajería

### Eventos Scrum

#### 1. Sprint Planning (Planificación del Sprint)
- **Duración:** 2-4 horas
- **Frecuencia:** Al inicio de cada Sprint
- **Participantes:** PO, Scrum Master, Development Team
- **Objetivo:** 
  - Definir el objetivo del Sprint
  - Seleccionar items del Product Backlog
  - Estimar el esfuerzo
  - Crear el Sprint Backlog

**Ejemplo para AgroMarket Sprint 1:**
- Objetivo: Implementar autenticación y listado de productos
- Items seleccionados: US-001, US-002, US-003
- Velocidad del equipo: 20 story points
- Capacidad: 10 días × 3 desarrolladores = 30 días-persona

#### 2. Daily Scrum (Reunión Diaria)
- **Duración:** 15 minutos
- **Frecuencia:** Cada día
- **Participantes:** Development Team (opcional: Scrum Master, PO)
- **Estructura:**
  1. ¿Qué hice ayer?
  2. ¿Qué haré hoy?
  3. ¿Hay algún impedimento?

**Ejemplo:**
```
Desarrollador 1:
- Ayer: Implementé el modelo User y repositorio
- Hoy: Trabajaré en el servicio de autenticación
- Impedimento: Necesito acceso a la base de datos de prueba

Desarrollador 2:
- Ayer: Configuré JWT y seguridad
- Hoy: Crearé el controlador de autenticación
- Impedimento: Ninguno

Desarrollador 3:
- Ayer: Diseñé el formulario de login
- Hoy: Integraré con el backend
- Impedimento: El endpoint /auth/login no está listo
```

#### 3. Sprint Review (Revisión del Sprint)
- **Duración:** 2-4 horas
- **Frecuencia:** Al final de cada Sprint
- **Participantes:** PO, Scrum Master, Development Team, Stakeholders
- **Objetivo:**
  - Demostrar el incremento desarrollado
  - Obtener feedback de los stakeholders
  - Ajustar el Product Backlog

**Ejemplo para AgroMarket:**
- Demo: Autenticación funcionando
- Demo: Catálogo de productos visible
- Feedback: "Necesitamos filtrar por categoría"
- Acción: Añadir US-004 al Product Backlog

#### 4. Sprint Retrospective (Retrospectiva del Sprint)
- **Duración:** 1-3 horas
- **Frecuencia:** Al final de cada Sprint
- **Participantes:** Scrum Master, Development Team (opcional: PO)
- **Objetivo:** Identificar mejoras para el próximo Sprint
- **Técnica:** "Start, Stop, Continue"

**Ejemplo:**
```
Start Doing (Empezar a hacer):
- Reuniones de refinamiento semanales
- Code reviews más detallados

Stop Doing (Dejar de hacer):
- Trabajar en features sin estimación
- Saltarse las pruebas unitarias

Continue Doing (Continuar haciendo):
- Daily Scrum a las 10 AM
- Uso de Git Flow
```

### Flujo de Trabajo Scrum en AgroMarket

```
┌─────────────────────────────────────────────────────────────────┐
│                     SPRINT PLANNING                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ - Definir objetivo del Sprint                                   ││
│  │ - Seleccionar items del Product Backlog                        ││
│  │ - Estimar tareas                                                ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SPRINT EXECUTION                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Daily Scrum  │  │ Development  │  │ Daily Scrum  │              │
│  │   (15 min)   │  │   Work       │  │   (15 min)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│        └─────────────┬───────────────┘                              │
│                      ▼                                             │
│            ┌─────────────────────┐                                  │
│            │ Sprint Backlog      │                                  │
│            │ Update              │                                  │
│            └─────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ SPRINT REVIEW    │  │ SPRINT           │  │ NEXT SPRINT      │
│                 │  │ RETROSPECTIVE    │  │ PLANNING         │
│ - Demo          │  │                 │  │                 │
│ - Feedback      │  │ - Start/Stop/    │  │ - Select items   │
│ - Adjust Backlog │  │   Continue       │  │ - Define goal    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Velocidad del Equipo

La velocidad del equipo de AgroMarket se calcula como:
- **Story Points completados por Sprint:** 20-30 puntos
- **Días por Sprint:** 10-14 días laborables
- **Miembros del equipo:** 3 desarrolladores

### Ejemplo de Sprint Backlog Real

**Sprint 2: Carrito de Compras y Pedidos**

| ID | User Story | Tareas | Story Points | Estado |
|----|-----------|--------|--------------|--------|
| US-005 | Como comprador, quiero agregar productos al carrito para comprarlos luego | T-010, T-011, T-012 | 13 | Done |
| US-006 | Como comprador, quiero ver mi carrito de compras | T-013, T-014 | 5 | Done |
| US-007 | Como comprador, quiero realizar un pedido | T-015, T-016, T-017 | 8 | In Progress |

**Tareas detalladas:**
- T-010: Crear modelo Cart (2h)
- T-011: Implementar CartService (4h)
- T-012: Crear CartController (2h)
- T-013: Diseñar página del carrito (3h)
- T-014: Integrar con backend (2h)
- T-015: Crear modelo Order (3h)
- T-016: Implementar OrderService (3h)
- T-017: Crear OrderController (2h)

---

## Solución de Problemas

### Problemas Comunes y Soluciones

#### 1. Error 401 en endpoints públicos
**Síntoma:** El frontend recibe 401 al acceder a `/api/public/metrics` o `/api/divisas/tasas`

**Causa:** 
- Falta de configuración CORS
- JwtAuthenticationFilter interceptando endpoints públicos

**Solución implementada:**
```java
// En SecurityConfig.java
.requestMatchers("/api/public/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/divisas/**").permitAll()

// En JwtAuthenticationFilter.java
if (path.startsWith("/api/public/") || 
    path.startsWith("/api/divisas/") ||
    path.startsWith("/api/productos/") ||
    path.startsWith("/api/resenas/") ||
    path.startsWith("/actuator/")) {
    filterChain.doFilter(request, response);
    return;
}

// En application.yml
app:
  cors:
    allowed-origins:
      - http://localhost:5173
      - http://localhost:5174
```

**Frontend:**
```javascript
// En api.js - No enviar credenciales para endpoints públicos
const shouldIncludeCredentials = !(
  path.startsWith("/public/") ||
  path.startsWith("/divisas/") ||
  path.startsWith("/productos/") ||
  path.startsWith("/resenas/") ||
  path.startsWith("/actuator/")
);
```

#### 2. Error CORS
**Síntoma:** El navegador bloquea peticiones con error CORS

**Causa:** Origen del frontend no está en la lista de allowed origins

**Solución:**
```yaml
# En application.yml
app:
  cors:
    allowed-origins:
      - http://localhost:5173
      - http://localhost:5174
```

#### 3. Listado de productores
El directorio público de productores (`Productores.jsx`) consume
`GET /api/v1/users?rol=PRODUCER`, no un endpoint dedicado. Antes existía
`GET /api/public/productores`, pero su consulta SQL referenciaba columnas
inexistentes (`u.enabled`, `u.role = 'PRODUCTOR'`) y la columna
`u.average_rating`, que se eliminó al unificar el modelo de `users`; por
eso se retiró.

#### 4. Endpoint /productos/categorias no existe
**Síntoma:** 404 al acceder a `/api/productos/categorias`

**Solución:** Crear ProductPublicController.java
```java
@RestController
@RequestMapping("/api/productos")
public class ProductPublicController {
    @GetMapping("/categorias")
    public List<String> getCategorias() {
        return Arrays.asList("BANANO", "MANGO", "PINA", "MARACUYA", "GUANABANA", "NARANJA", "COCO", "LIMON", "OTRO");
    }
}
```

### Diagnóstico del Frontend

El proyecto incluye un sistema de diagnóstico automático que verifica:
1. Configuración de Vite
2. Disponibilidad de API_BASE
3. DOM / Root element
4. Local Storage
5. Health del backend
6. Endpoints públicos
7. CORS / Network

Para ejecutar el diagnóstico:
```javascript
import { runFrontendDiagnostic } from "@/infrastructure/config/FrontendDiagnostic";
await runFrontendDiagnostic();
```

---

## Despliegue

### Despliegue Local

1. **Backend:**
```bash
cd agroMarket
mvn spring-boot:run
# Accesible en http://localhost:8080
```

2. **Frontend:**
```bash
cd frontend
npm run dev
# Accesible en http://localhost:5173
```

### Despliegue en Producción

#### Requisitos
- Servidor con Java 17+
- MySQL 8.x
- Node.js 18+ (para build del frontend)

#### Pasos

1. **Build del Backend:**
```bash
mvn clean package
# Genera agroMarket-*.jar en target/
```

2. **Build del Frontend:**
```bash
cd frontend
npm run build
# Genera archivos en dist/
```

3. **Configurar servidor web (Nginx, Apache):**
```nginx
server {
    listen 80;
    server_name agromarket.com;
    
    # Backend
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        root /var/www/agromarket/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

4. **Ejecutar Backend:**
```bash
java -jar agroMarket-*.jar --spring.profiles.active=prod
```

### Variables de Entorno para Producción

```env
# Base de datos
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/agromarket_prod
SPRING_DATASOURCE_USERNAME=prod_user
SPRING_DATASOURCE_PASSWORD=secure_password

# JWT
JWT_SECRET=very-secure-prod-secret-key
JWT_EXPIRATION_MS=3600000

# CORS
APP_CORS_ALLOWED_ORIGIN=https://agromarket.com

# OAuth2
GOOGLE_OAUTH2_CLIENT_ID=prod-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=prod-client-secret
GOOGLE_OAUTH2_REDIRECT_URI=https://agromarket.com/login/oauth2/code/google

# Correo
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=prod-sendgrid-api-key

# Mercadopago
MERCADOPAGO_BASE_URL=https://api.mercadopago.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=prod-cloud-name
CLOUDINARY_API_KEY=prod-api-key
CLOUDINARY_API_SECRET=prod-api-secret

# Brevo
BREVO_API_KEY=prod-brevo-api-key
```

---

## Conclusión

AgroMarket es un proyecto completo de comercio electrónico agrícola que sigue las mejores prácticas de desarrollo:
- **Arquitectura limpia** (Clean Architecture)
- **Metodología ágil** (Scrum)
- **Tecnologías modernas** (Spring Boot, React, JWT)
- **Documentación completa**

Todos los problemas identificados (401 en endpoints públicos, CORS, endpoints faltantes) han sido resueltos y documentados.

**Estado del proyecto:** ✅ LISTO PARA PRODUCCIÓN
