# Build stage
FROM maven:3.9.9-amazoncorretto-17 AS build
WORKDIR /workspace

# Copia o pom e o código fonte do módulo plataforma
COPY plataforma/pom.xml ./
COPY plataforma/src ./src

# Baixa dependências e empacota a aplicação
RUN mvn -B -f pom.xml -Dmaven.test.skip=true package

# Runtime stage
FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

# Copia o jar gerado pelo build
COPY --from=build /workspace/target/plataforma-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
