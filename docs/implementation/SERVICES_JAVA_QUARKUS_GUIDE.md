# Business Services Implementation Guide - Java 21 + Quarkus

## 🎯 Overview

The business services layer processes canonical events, implements business logic, manages idempotency, and persists data using Java 21 with Quarkus and Spring Boot integration.

## 🏗️ Project Structure

```
business-service/
├── src/
│   ├── main/
│   │   ├── java/com/etlsolutions/
│   │   │   ├── config/
│   │   │   │   ├── KafkaConfig.java
│   │   │   │   ├── DatabaseConfig.java
│   │   │   │   ├── CacheConfig.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── domain/
│   │   │   │   ├── entity/
│   │   │   │   │   ├── CanonicalEvent.java
│   │   │   │   │   ├── ProcessedEvent.java
│   │   │   │   │   ├── OutboxEvent.java
│   │   │   │   │   └── IdempotencyKey.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── EventPayload.java
│   │   │   │   │   ├── OrderEvent.java
│   │   │   │   │   └── OrderLineEvent.java
│   │   │   │   └── repository/
│   │   │   │       ├── CanonicalEventRepository.java
│   │   │   │       ├── ProcessedEventRepository.java
│   │   │   │       ├── OutboxEventRepository.java
│   │   │   │       └── IdempotencyKeyRepository.java
│   │   │   ├── service/
│   │   │   │   ├── EventProcessingService.java
│   │   │   │   ├── OrderService.java
│   │   │   │   ├── IdempotencyService.java
│   │   │   │   ├── OutboxService.java
│   │   │   │   └── EventPublisher.java
│   │   │   ├── kafka/
│   │   │   │   ├── CanonicalEventConsumer.java
│   │   │   │   ├── OutboxEventProducer.java
│   │   │   │   └── KafkaErrorHandler.java
│   │   │   ├── rest/
│   │   │   │   ├── EventController.java
│   │   │   │   ├── HealthController.java
│   │   │   │   └── MetricsController.java
│   │   │   ├── exception/
│   │   │   │   ├── EventProcessingException.java
│   │   │   │   ├── IdempotencyException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── Application.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── db/
│   │           ├── migration/
│   │           │   ├── V1__initial_schema.sql
│   │           │   ├── V2__outbox_table.sql
│   │           │   └── V3__idempotency_table.sql
│   │           └── schema.sql
│   └── test/
│       ├── java/com/etlsolutions/
│       │   ├── service/
│       │   │   ├── EventProcessingServiceTest.java
│       │   │   ├── IdempotencyServiceTest.java
│       │   │   └── OutboxServiceTest.java
│       │   ├── kafka/
│       │   │   └── CanonicalEventConsumerTest.java
│       │   └── integration/
│       │       └── EventProcessingIntegrationTest.java
│       └── resources/
│           ├── application-test.properties
│           └── test-data.sql
├── pom.xml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 📦 Dependencies (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.etlsolutions</groupId>
    <artifactId>business-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>ETL Business Service</name>
    <description>Business logic processing service</description>

    <parent>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-bom</artifactId>
        <version>3.8.0</version>
        <relativePath/>
    </parent>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.version>3.2.0</spring-boot.version>
        <hibernate.version>6.4.0.Final</hibernate.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- Quarkus Core -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-core</artifactId>
        </dependency>

        <!-- Quarkus REST -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-rest</artifactId>
        </dependency>

        <!-- Quarkus Kafka -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-kafka-client</artifactId>
        </dependency>

        <!-- Quarkus Reactive Messaging -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-smallrye-reactive-messaging-kafka</artifactId>
        </dependency>

        <!-- Quarkus JPA/Hibernate -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-hibernate-orm</artifactId>
        </dependency>

        <!-- Quarkus PostgreSQL -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-jdbc-postgresql</artifactId>
        </dependency>

        <!-- Quarkus Connection Pooling -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-agroal</artifactId>
        </dependency>

        <!-- Quarkus Flyway (Database Migrations) -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-flyway</artifactId>
        </dependency>

        <!-- Quarkus Caching -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-cache</artifactId>
        </dependency>

        <!-- Quarkus Metrics -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-micrometer-registry-prometheus</artifactId>
        </dependency>

        <!-- Quarkus Logging -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-logging-json</artifactId>
        </dependency>

        <!-- Quarkus OpenTelemetry -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-opentelemetry</artifactId>
        </dependency>

        <!-- Quarkus Health -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-smallrye-health</artifactId>
        </dependency>

        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Jackson -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-junit5</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>io.rest-assured</groupId>
            <artifactId>rest-assured</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>testcontainers</artifactId>
            <version>1.19.0</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>1.19.0</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>kafka</artifactId>
            <version>1.19.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>io.quarkus</groupId>
                <artifactId>quarkus-maven-plugin</artifactId>
                <version>3.8.0</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>build</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## 🚀 Setup

### 1. Create Quarkus Project

```bash
mvn io.quarkus.platform:quarkus-maven-plugin:3.8.0:create \
  -DprojectGroupId=com.etlsolutions \
  -DprojectArtifactId=business-service \
  -DclassName=com.etlsolutions.Application \
  -Dextensions="rest,kafka,hibernate-orm,jdbc-postgresql,flyway,cache,micrometer-registry-prometheus,logging-json,opentelemetry,smallrye-health"

cd business-service
```

### 2. Configure application.properties

```properties
# Application
quarkus.application.name=etl-business-service
quarkus.application.version=1.0.0

# Server
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

# Database
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=etl_user
quarkus.datasource.password=etl_password
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/etl_db
quarkus.datasource.jdbc.max-size=20
quarkus.datasource.jdbc.min-size=5

# Hibernate
quarkus.hibernate-orm.database.generation=validate
quarkus.hibernate-orm.log.sql=false
quarkus.hibernate-orm.jdbc.batch-size=20
quarkus.hibernate-orm.jdbc.fetch-size=50

# Flyway
quarkus.flyway.migrate-at-start=true
quarkus.flyway.baseline-on-migrate=true

# Kafka
kafka.bootstrap.servers=localhost:9092
mp.messaging.incoming.canonical-events.connector=smallrye-kafka
mp.messaging.incoming.canonical-events.topic=canonical.events
mp.messaging.incoming.canonical-events.group.id=business-service-group
mp.messaging.incoming.canonical-events.auto.offset.reset=earliest
mp.messaging.incoming.canonical-events.value.deserializer=org.apache.kafka.common.serialization.StringDeserializer

mp.messaging.outgoing.outbox-events.connector=smallrye-kafka
mp.messaging.outgoing.outbox-events.topic=outbox.events
mp.messaging.outgoing.outbox-events.value.serializer=org.apache.kafka.common.serialization.StringSerializer

# Metrics
quarkus.micrometer.export.prometheus.enabled=true
quarkus.micrometer.binder.jvm.enabled=true
quarkus.micrometer.binder.system.enabled=true

# Logging
quarkus.log.level=INFO
quarkus.log.console.format=%d{yyyy-MM-dd HH:mm:ss,SSS} %-5p [%c{2.}] (%t) %s%e%n
quarkus.log.file.enable=true
quarkus.log.file.path=/var/log/etl/business-service.log

# OpenTelemetry
quarkus.otel.enabled=true
quarkus.otel.exporter.otlp.endpoint=http://localhost:4317
quarkus.otel.traces.exporter=otlp
quarkus.otel.metrics.exporter=otlp

# Health
quarkus.smallrye-health.root-path=/health
```

## 📋 Key Components

### 1. Domain Entity - CanonicalEvent

```java
package com.etlsolutions.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "canonical_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CanonicalEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String partnerId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private String kafkaPartitionKey;

    @Column(nullable = false)
    private Long kafkaOffset;

    @Column(nullable = false)
    private Integer kafkaPartition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum EventStatus {
        RECEIVED, PROCESSING, PROCESSED, FAILED, RETRYING
    }
}
```

### 2. Idempotency Service

```java
package com.etlsolutions.service;

import com.etlsolutions.domain.entity.IdempotencyKey;
import com.etlsolutions.domain.repository.IdempotencyKeyRepository;
import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
@Slf4j
public class IdempotencyService {
    @Inject
    IdempotencyKeyRepository idempotencyKeyRepository;

    @Transactional
    public boolean isProcessed(String idempotencyKey) {
        Optional<IdempotencyKey> existing = idempotencyKeyRepository.findByKey(idempotencyKey);
        return existing.isPresent() && existing.get().isProcessed();
    }

    @Transactional
    public void markProcessing(String idempotencyKey, String eventId) {
        IdempotencyKey key = idempotencyKeyRepository.findByKey(idempotencyKey)
            .orElseGet(() -> IdempotencyKey.builder()
                .key(idempotencyKey)
                .eventId(eventId)
                .status(IdempotencyKey.Status.PROCESSING)
                .createdAt(LocalDateTime.now())
                .build());
        
        key.setStatus(IdempotencyKey.Status.PROCESSING);
        idempotencyKeyRepository.persist(key);
    }

    @Transactional
    public void markProcessed(String idempotencyKey, String result) {
        IdempotencyKey key = idempotencyKeyRepository.findByKey(idempotencyKey)
            .orElseThrow(() -> new IllegalStateException("Idempotency key not found"));
        
        key.setStatus(IdempotencyKey.Status.PROCESSED);
        key.setResult(result);
        key.setProcessedAt(LocalDateTime.now());
        idempotencyKeyRepository.persist(key);
    }

    @Transactional
    public void markFailed(String idempotencyKey, String errorMessage) {
        IdempotencyKey key = idempotencyKeyRepository.findByKey(idempotencyKey)
            .orElseThrow(() -> new IllegalStateException("Idempotency key not found"));
        
        key.setStatus(IdempotencyKey.Status.FAILED);
        key.setErrorMessage(errorMessage);
        idempotencyKeyRepository.persist(key);
    }

    @CacheResult(cacheName = "idempotency-cache")
    public Optional<String> getResult(String idempotencyKey) {
        return idempotencyKeyRepository.findByKey(idempotencyKey)
            .filter(k -> k.isProcessed())
            .map(IdempotencyKey::getResult);
    }
}
```

### 3. Event Processing Service

```java
package com.etlsolutions.service;

import com.etlsolutions.domain.entity.CanonicalEvent;
import com.etlsolutions.domain.entity.OutboxEvent;
import com.etlsolutions.domain.repository.CanonicalEventRepository;
import com.etlsolutions.domain.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.UUID;

@ApplicationScoped
@Slf4j
public class EventProcessingService {
    @Inject
    CanonicalEventRepository canonicalEventRepository;

    @Inject
    OutboxEventRepository outboxEventRepository;

    @Inject
    IdempotencyService idempotencyService;

    @Inject
    ObjectMapper objectMapper;

    @Transactional
    public void processCanonicalEvent(CanonicalEvent event) throws Exception {
        String idempotencyKey = generateIdempotencyKey(event);

        // Check if already processed
        if (idempotencyService.isProcessed(idempotencyKey)) {
            log.info("Event already processed: {}", idempotencyKey);
            return;
        }

        try {
            idempotencyService.markProcessing(idempotencyKey, event.getId().toString());
            event.setStatus(CanonicalEvent.EventStatus.PROCESSING);
            canonicalEventRepository.persist(event);

            // Parse and validate payload
            JsonNode payload = objectMapper.readTree(event.getPayload());

            // Process based on event type
            String result = processEventByType(event.getEventType(), payload);

            // Create outbox event for publishing
            OutboxEvent outboxEvent = OutboxEvent.builder()
                .aggregateId(event.getId().toString())
                .eventType(event.getEventType())
                .payload(result)
                .status(OutboxEvent.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

            outboxEventRepository.persist(outboxEvent);

            // Mark as processed
            event.setStatus(CanonicalEvent.EventStatus.PROCESSED);
            event.setProcessedAt(LocalDateTime.now());
            canonicalEventRepository.persist(event);

            idempotencyService.markProcessed(idempotencyKey, result);
            log.info("Event processed successfully: {}", event.getId());

        } catch (Exception e) {
            log.error("Error processing event: {}", event.getId(), e);
            event.setStatus(CanonicalEvent.EventStatus.FAILED);
            event.setErrorMessage(e.getMessage());
            canonicalEventRepository.persist(event);

            idempotencyService.markFailed(idempotencyKey, e.getMessage());
            throw e;
        }
    }

    private String processEventByType(String eventType, JsonNode payload) throws Exception {
        return switch (eventType) {
            case "OrderCreated" -> processOrderCreated(payload);
            case "OrderLineCreated" -> processOrderLineCreated(payload);
            default -> throw new IllegalArgumentException("Unknown event type: " + eventType);
        };
    }

    private String processOrderCreated(JsonNode payload) throws Exception {
        // Business logic for order creation
        log.info("Processing OrderCreated event");
        return objectMapper.writeValueAsString(payload);
    }

    private String processOrderLineCreated(JsonNode payload) throws Exception {
        // Business logic for order line creation
        log.info("Processing OrderLineCreated event");
        return objectMapper.writeValueAsString(payload);
    }

    private String generateIdempotencyKey(CanonicalEvent event) {
        return event.getPartnerId() + ":" + event.getEventType() + ":" + 
               event.getKafkaPartition() + ":" + event.getKafkaOffset();
    }
}
```

### 4. Kafka Consumer

```java
package com.etlsolutions.kafka;

import com.etlsolutions.domain.entity.CanonicalEvent;
import com.etlsolutions.service.EventProcessingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.reactive.messaging.kafka.IncomingKafkaRecord;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.reactive.messaging.Incoming;

@ApplicationScoped
@Slf4j
public class CanonicalEventConsumer {
    @Inject
    EventProcessingService eventProcessingService;

    @Inject
    ObjectMapper objectMapper;

    @Incoming("canonical-events")
    public void consumeCanonicalEvent(IncomingKafkaRecord<String, String> record) {
        try {
            log.info("Received message from topic: {}, partition: {}, offset: {}",
                record.getTopic(), record.getPartition(), record.getOffset());

            CanonicalEvent event = CanonicalEvent.builder()
                .eventType(record.getHeaders().getLastHeader("event-type").value().toString())
                .partnerId(record.getHeaders().getLastHeader("partner-id").value().toString())
                .payload(record.getPayload())
                .kafkaPartitionKey(record.getKey())
                .kafkaOffset(record.getOffset())
                .kafkaPartition(record.getPartition())
                .status(CanonicalEvent.EventStatus.RECEIVED)
                .build();

            eventProcessingService.processCanonicalEvent(event);
            record.ack();

        } catch (Exception e) {
            log.error("Error processing message", e);
            record.nack(e);
        }
    }
}
```

### 5. Outbox Service

```java
package com.etlsolutions.service;

import com.etlsolutions.domain.entity.OutboxEvent;
import com.etlsolutions.domain.repository.OutboxEventRepository;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

@ApplicationScoped
@Slf4j
public class OutboxService {
    @Inject
    OutboxEventRepository outboxEventRepository;

    @Inject
    EventPublisher eventPublisher;

    @Scheduled(every = "5s")
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository
            .findByStatus(OutboxEvent.Status.PENDING);

        for (OutboxEvent event : pendingEvents) {
            try {
                eventPublisher.publish(event);
                event.setStatus(OutboxEvent.Status.PUBLISHED);
                outboxEventRepository.persist(event);
                log.info("Published outbox event: {}", event.getId());
            } catch (Exception e) {
                log.error("Error publishing outbox event: {}", event.getId(), e);
                event.setStatus(OutboxEvent.Status.FAILED);
                outboxEventRepository.persist(event);
            }
        }
    }
}
```

## 🧪 Testing

### Integration Test with Testcontainers

```java
package com.etlsolutions.integration;

import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

@QuarkusTest
@Testcontainers
public class EventProcessingIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("etl_test")
        .withUsername("test")
        .withPassword("test");

    @Container
    static KafkaContainer kafka = new KafkaContainer();

    @Test
    public void testHealthCheck() {
        given()
            .when().get("/health")
            .then()
            .statusCode(200)
            .body("status", is("UP"));
    }

    @Test
    public void testEventProcessing() {
        // Test event processing logic
    }
}
```

## 🚀 Development

```bash
# Start development mode
mvn quarkus:dev

# Run tests
mvn test

# Build native image
mvn clean package -Pnative

# Build Docker image
docker build -f src/main/docker/Dockerfile.jvm -t business-service:latest .

# Run with Docker Compose
docker-compose up
```

## 📋 Implementation Checklist

- [ ] Quarkus project setup
- [ ] PostgreSQL configuration
- [ ] Kafka consumer setup
- [ ] Domain entities
- [ ] Repository layer
- [ ] Service layer
- [ ] Idempotency implementation
- [ ] Outbox pattern
- [ ] Transaction management
- [ ] Error handling
- [ ] Metrics collection
- [ ] Health checks
- [ ] Integration tests
- [ ] Docker containerization
- [ ] Kubernetes deployment

---

**See Also**: [TECH_STACK_FINAL.md](../../TECH_STACK_FINAL.md), [Architecture Overview](../architecture/01-overview.md)
