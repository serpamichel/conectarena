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

# Create non-root user for security
RUN useradd -m -u 1000 appuser

# Copia o jar gerado pelo build
COPY --from=build /workspace/target/plataforma-0.0.1-SNAPSHOT.jar ./app.jar
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 8080

# Environment variables
ENV SPRING_PROFILES_ACTIVE=prod \
    DB_USERNAME=postgres \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0 -XX:+UseStringDeduplication"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
