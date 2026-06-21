FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY agroMarket/target/agroMarket-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
"-Djava.security.egd=file:/dev/./urandom", \
"-XX:+UseContainerSupport", \
"-XX:MaxRAMPercentage=75.0", \
"-jar", "app.jar"]
