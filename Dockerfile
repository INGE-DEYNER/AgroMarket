FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY agroMarket/.mvn .mvn
COPY agroMarket/mvnw .
COPY agroMarket/pom.xml .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY agroMarket/src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
