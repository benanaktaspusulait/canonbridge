# Docker Compose - Local Development Setup

## 🎯 Overview

Complete Docker Compose configuration for local development environment with all services, databases, and monitoring tools.

## 📁 Directory Structure

```
docker-compose/
├── docker-compose.yml
├── docker-compose.override.yml
├── .env
├── .env.example
├── services/
│   ├── transformer/
│   │   └── Dockerfile
│   ├── business-service/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   └── forms/
│       └── Dockerfile
├── config/
│   ├── postgres/
│   │   ├── init.sql
│   │   └── postgresql.conf
│   ├── kafka/
│   │   └── server.properties
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   └── provisioning/
│   │       ├── dashboards/
│   │       └── datasources/
│   └── jaeger/
│       └── jaeger-config.yml
├── volumes/
│   ├── postgres_data/
│   ├── kafka_data/
│   ├── redis_data/
│   ├── prometheus_data/
│   └── grafana_data/
└── scripts/
    ├── init-kafka.sh
    ├── init-postgres.sh
    └── health-check.sh
```

## 🐳 Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.9'

services:
  # ============================================
  # PostgreSQL Database
  # ============================================
  postgres:
    image: postgres:15-alpine
    container_name: etl-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-etl_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-etl_password}
      POSTGRES_DB: ${POSTGRES_DB:-etl_db}
      POSTGRES_INITDB_ARGS: "-c max_connections=200 -c shared_buffers=256MB"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
      - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-etl_user}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Kafka Broker
  # ============================================
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: etl-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
      - zookeeper_logs:/var/lib/zookeeper/log
    networks:
      - etl-network
    restart: unless-stopped

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: etl-kafka
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_LOG_RETENTION_HOURS: 168
      KAFKA_LOG_SEGMENT_BYTES: 1073741824
    ports:
      - "9092:9092"
      - "29092:29092"
    volumes:
      - kafka_data:/var/lib/kafka/data
      - ./scripts/init-kafka.sh:/docker-entrypoint-initdb.d/init-kafka.sh
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions.sh", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Redis Cache
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: etl-redis
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Transformer Service (Node.js)
  # ============================================
  transformer:
    build:
      context: ./services/transformer
      dockerfile: Dockerfile
    container_name: etl-transformer
    depends_on:
      kafka:
        condition: service_healthy
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
      KAFKA_BROKERS: kafka:9092
      KAFKA_INPUT_TOPIC: partner.raw.events
      KAFKA_OUTPUT_TOPIC: canonical.events
      KAFKA_DLQ_TOPIC: transformation.dlq
      KAFKA_CONSUMER_GROUP: transformer-service
      SERVICE_PORT: 3000
      WORKER_POOL_SIZE: 4
      OTEL_ENABLED: "true"
      OTEL_EXPORTER_OTLP_ENDPOINT: http://jaeger:4317
    ports:
      - "3000:3000"
      - "9090:9090"
    volumes:
      - ./services/transformer/src:/app/src
      - ./services/transformer/partners:/app/partners
      - transformer_node_modules:/app/node_modules
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Business Service (Java/Quarkus)
  # ============================================
  business-service:
    build:
      context: ./services/business-service
      dockerfile: Dockerfile
    container_name: etl-business-service
    depends_on:
      kafka:
        condition: service_healthy
      postgres:
        condition: service_healthy
    environment:
      QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://postgres:5432/etl_db
      QUARKUS_DATASOURCE_USERNAME: ${POSTGRES_USER:-etl_user}
      QUARKUS_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-etl_password}
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      QUARKUS_LOG_LEVEL: INFO
      QUARKUS_OTEL_ENABLED: "true"
      QUARKUS_OTEL_EXPORTER_OTLP_ENDPOINT: http://jaeger:4317
    ports:
      - "8080:8080"
      - "8081:8081"
    volumes:
      - business_service_target:/app/target
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 15s
      timeout: 5s
      retries: 5
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Frontend (React)
  # ============================================
  frontend:
    build:
      context: ./services/frontend
      dockerfile: Dockerfile
    container_name: etl-frontend
    environment:
      VITE_API_URL: http://localhost:3001
      VITE_TRANSFORMER_URL: http://localhost:3000
      VITE_BUSINESS_URL: http://localhost:8080
    ports:
      - "5173:5173"
    volumes:
      - ./services/frontend/src:/app/src
      - frontend_node_modules:/app/node_modules
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Forms (Angular)
  # ============================================
  forms:
    build:
      context: ./services/forms
      dockerfile: Dockerfile
    container_name: etl-forms
    environment:
      API_URL: http://localhost:3001
    ports:
      - "4200:4200"
    volumes:
      - ./services/forms/src:/app/src
      - forms_node_modules:/app/node_modules
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Prometheus Metrics
  # ============================================
  prometheus:
    image: prom/prometheus:latest
    container_name: etl-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Grafana Dashboards
  # ============================================
  grafana:
    image: grafana/grafana:latest
    container_name: etl-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_INSTALL_PLUGINS: grafana-piechart-panel
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Jaeger Tracing
  # ============================================
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: etl-jaeger
    environment:
      COLLECTOR_OTLP_ENABLED: "true"
    ports:
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"
      - "14268:14268"
      - "14250:14250"
      - "9411:9411"
      - "4317:4317"
    networks:
      - etl-network
    restart: unless-stopped

  # ============================================
  # Kafka UI (Optional)
  # ============================================
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: etl-kafka-ui
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    ports:
      - "8888:8080"
    depends_on:
      - kafka
    networks:
      - etl-network
    restart: unless-stopped

volumes:
  postgres_data:
  zookeeper_data:
  zookeeper_logs:
  kafka_data:
  redis_data:
  prometheus_data:
  grafana_data:
  transformer_node_modules:
  frontend_node_modules:
  forms_node_modules:
  business_service_target:

networks:
  etl-network:
    driver: bridge
```

## 🔧 Environment Configuration

```bash
# .env
# PostgreSQL
POSTGRES_USER=etl_user
POSTGRES_PASSWORD=etl_password
POSTGRES_DB=etl_db

# Grafana
GRAFANA_PASSWORD=admin

# Kafka
KAFKA_BROKERS=kafka:9092
KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181

# Services
NODE_ENV=development
LOG_LEVEL=debug
WORKER_POOL_SIZE=4

# Monitoring
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository>
cd docker-compose
cp .env.example .env
```

### 2. Start All Services

```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f transformer
docker-compose logs -f business-service
```

### 3. Initialize Kafka Topics

```bash
# Create topics
docker-compose exec kafka kafka-topics --create \
  --topic partner.raw.events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

docker-compose exec kafka kafka-topics --create \
  --topic canonical.events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1

docker-compose exec kafka kafka-topics --create \
  --topic transformation.dlq \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
```

### 4. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Forms | http://localhost:4200 | - |
| Transformer API | http://localhost:3000 | - |
| Business Service | http://localhost:8080 | - |
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger | http://localhost:16686 | - |
| Kafka UI | http://localhost:8888 | - |
| PostgreSQL | localhost:5432 | etl_user/etl_password |
| Redis | localhost:6379 | - |

## 📊 Health Checks

```bash
# Check all services
docker-compose ps

# Check service health
docker-compose exec postgres pg_isready -U etl_user
docker-compose exec kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092
docker-compose exec redis redis-cli ping
docker-compose exec transformer curl http://localhost:3000/health
docker-compose exec business-service curl http://localhost:8080/health
```

## 🧪 Testing

### Send Test Message to Kafka

```bash
# Produce message
docker-compose exec kafka kafka-console-producer \
  --topic partner.raw.events \
  --bootstrap-server localhost:9092 \
  --property "parse.key=true" \
  --property "key.separator=:"

# In the prompt, type:
# key:{"eventType":"OrderCreated","partnerId":"company-a","data":{}}
```

### Monitor Kafka Topics

```bash
# List topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Consume messages
docker-compose exec kafka kafka-console-consumer \
  --topic canonical.events \
  --bootstrap-server localhost:9092 \
  --from-beginning

# Monitor DLQ
docker-compose exec kafka kafka-console-consumer \
  --topic transformation.dlq \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

## 🔍 Debugging

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f transformer
docker-compose logs -f business-service

# Last 100 lines
docker-compose logs --tail=100 transformer
```

### Execute Commands in Container

```bash
# PostgreSQL
docker-compose exec postgres psql -U etl_user -d etl_db

# Redis
docker-compose exec redis redis-cli

# Kafka
docker-compose exec kafka bash
```

### Inspect Network

```bash
# Check network
docker network inspect docker-compose_etl-network

# Test connectivity
docker-compose exec transformer ping kafka
docker-compose exec transformer ping postgres
```

## 🧹 Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Prune unused Docker resources
docker system prune -a
```

## 📋 Implementation Checklist

- [ ] Docker and Docker Compose installed
- [ ] Clone repository
- [ ] Configure .env file
- [ ] Build service images
- [ ] Start all services
- [ ] Initialize Kafka topics
- [ ] Verify all services are healthy
- [ ] Access Grafana dashboard
- [ ] Send test messages
- [ ] Monitor logs
- [ ] Test transformations
- [ ] Verify database connectivity
- [ ] Check metrics in Prometheus
- [ ] View traces in Jaeger

## 🔗 Related Documentation

- [Kubernetes Deployment Guide](./KUBERNETES_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](./01-deployment-checklist.md)
- [Tech Stack Final](../../TECH_STACK_FINAL.md)

---

**Status**: ✅ Complete  
**Last Updated**: May 10, 2026  
**Version**: 1.0
