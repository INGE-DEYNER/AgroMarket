FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src src
RUN chmod +x mvnw && ./mvnw -B -U -DskipTests clean package

FROM eclipse-temurin:17-jre-jammy
RUN useradd -m appuser
USER appuser
WORKDIR /home/appuser
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-XX:TieredStopAtLevel=1","-Xms256m","-Xmx512m","-jar","/home/appuser/app.jar"]
