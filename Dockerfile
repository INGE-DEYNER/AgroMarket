# Stage 1: Build the Maven application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY agroMarket/pom.xml ./agroMarket/
COPY agroMarket/src ./agroMarket/src
RUN mvn -f agroMarket/pom.xml package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Install MySQL server and utilities
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server dos2unix && \
    rm -rf /var/lib/apt/lists/*

# Configure directories for MySQL and set permissions for UID 1000
RUN mkdir -p /app/mysql/data /app/mysql/run /app/mysql/log /var/lib/mysql /var/run/mysqld /var/log/mysql && \
    chown -R 1000:1000 /app /var/lib/mysql /var/run/mysqld /var/log/mysql

# Copy the compiled JAR from Stage 1
COPY --from=build /app/agroMarket/target/*.jar app.jar

# Copy configuration files
COPY my.cnf /app/mysql/my.cnf
COPY entrypoint.sh /app/entrypoint.sh

# Normalize line endings and make entrypoint executable, chown everything to 1000
RUN dos2unix /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    chown -R 1000:1000 /app

# Expose Hugging Face Space port
EXPOSE 7860

# Default environment variables
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=7860 \
    SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:3306/agromarket_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=utf8 \
    SPRING_DATASOURCE_USERNAME=mysql \
    SPRING_DATASOURCE_PASSWORD=AgroMarketUserPassword2026! \
    BREVO_API_KEY=mock-key \
    GOOGLE_CLIENT_ID=mock-id \
    GOOGLE_CLIENT_SECRET=mock-secret

# Run as non-root user (UID 1000 is standard for Hugging Face)
USER 1000

ENTRYPOINT ["/app/entrypoint.sh"]
