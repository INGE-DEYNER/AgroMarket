# ============================================================
# Dockerfile - Backend AgroMarket (Spring Boot + Java 17)
# ============================================================
# Construye el JAR y lo ejecuta en un contenedor Alpine ligero.
#
# USO:
#   docker build -t agromarket-backend .
#   docker run -p 8080:8080 --env-file .env agromarket-backend
#
# O con docker compose:
#   docker compose up -d
# ============================================================

# Etapa 1: Compilar el JAR
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -q

# Etapa 2: Ejecutar el JAR
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar el JAR compilado desde la etapa anterior
COPY --from=builder /app/target/agromarket-*.jar app.jar

# Permisos
RUN chown appuser:appgroup /app/app.jar
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Exponer puerto
EXPOSE 8080

# Variables de entorno por defecto (sobreescribibles con --env-file)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    JAVA_OPTS="-Xms256m -Xmx512m"

# Iniciar backend
ENTRYPOINT sh -c "java $JAVA_OPTS -jar app.jar --spring.profiles.active=$SPRING_PROFILES_ACTIVE"

