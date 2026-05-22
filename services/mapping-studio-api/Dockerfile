FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -D appuser
WORKDIR /app
COPY --from=build --chown=1001:1001 /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build --chown=1001:1001 /app/target/quarkus-app/*.jar /app/
COPY --from=build --chown=1001:1001 /app/target/quarkus-app/app/ /app/app/
COPY --from=build --chown=1001:1001 /app/target/quarkus-app/quarkus/ /app/quarkus/

EXPOSE 8080
USER 1001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/ready || exit 1

ENTRYPOINT ["java", "-jar", "/app/quarkus-run.jar"]
