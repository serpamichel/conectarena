FROM maven:3-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY . .
WORKDIR /app/plataforma
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/plataforma/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]