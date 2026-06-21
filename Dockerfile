FROM eclipse-temurin:21-jdk
WORKDIR /app
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server dos2unix && \
    rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/mysql/data /app/mysql/run /app/mysql/log /var/lib/mysql /var/run/mysqld /var/log/mysql && \
    chown -R 1000:1000 /app /var/lib/mysql /var/run/mysqld /var/log/mysql
COPY agroMarket/target/agroMarket-0.0.1-SNAPSHOT.jar app.jar
COPY my.cnf /app/mysql/my.cnf
COPY entrypoint.sh /app/entrypoint.sh
RUN dos2unix /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    chown -R 1000:1000 /app
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080
USER 1000
ENTRYPOINT ["/app/entrypoint.sh"]
