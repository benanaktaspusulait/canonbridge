# CanonBridge - Setup Guide

This guide uses the prepared infrastructure package in `_implementation-ready/`. Run the commands from that directory until the team promotes the compose, Makefile, and environment files into the root runtime path.

## 🚀 Quick Start (5 minutes)

### Prerequisites

Ensure you have the following installed:

```bash
# Required
- Docker Desktop (or Docker + Docker Compose)
- Git
- Make

# Optional (for development)
- Node.js 18+
- Java 21 LTS
```

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd etlsolutions
cd _implementation-ready

# 2. Initialize the project
make init

# This will:
# - Create .env file from .env.example
# - Start all Docker services
# - Create Kafka topics
# - Initialize database
```

### Verify Installation

```bash
# Check service health
make health

# Expected output:
# ✓ Kafka is running
# ✓ PostgreSQL is running
# ✓ Redis is running
# ✓ Prometheus is running
# ✓ Grafana is running
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Kafka UI** | http://localhost:8080 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin/admin |
| **Jaeger** | http://localhost:16686 | - |
| **PostgreSQL** | localhost:5432 | etluser/etlpass |
| **Redis** | localhost:6379 | - |

---

## 📚 Detailed Setup

### 1. Environment Configuration

Edit the `.env` file in `_implementation-ready/` with your configuration:

```bash
# Copy example and edit
cp .env.example .env
nano .env  # or use your preferred editor
```

Key variables to configure:

```bash
# Application
NODE_ENV=development
LOG_LEVEL=info

# Kafka
KAFKA_BROKERS=localhost:9092

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=etldb
DB_USER=etluser
DB_PASSWORD=etlpass

# Worker Pool
WORKER_POOL_SIZE=4
```

### 2. Start Services

```bash
# Start all services
make up

# Or start individual services
docker-compose up -d kafka postgres redis

# View logs
make logs

# View specific service logs
make kafka-logs
make postgres-logs
```

### 3. Create Kafka Topics

```bash
# Create required topics
make kafka-create-topics

# Verify topics
make kafka-topics

# Expected output:
# partner.raw.events
# canonical.events
# transformation.dlq
# transformation.retry
```

### 4. Initialize Database

Database is automatically initialized when PostgreSQL starts. To manually run migrations:

```bash
# Run migrations
make db-migrate

# Connect to database
make db-shell

# Inside psql:
\dt etl.*        # List tables
\d etl.events    # Describe events table
```

### 5. Verify Setup

```bash
# Check all services
make status

# Test Kafka
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Test PostgreSQL
docker-compose exec postgres psql -U etluser -d etldb -c "SELECT version();"

# Test Redis
docker-compose exec redis redis-cli ping
```

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development environment
make dev

# This starts all services and shows URLs
```

### Working with Services

```bash
# View logs
make logs                    # All services
make kafka-logs             # Kafka only
make postgres-logs          # PostgreSQL only

# Restart services
make restart                # All services
docker-compose restart kafka # Single service

# Stop services
make down                   # Stop all
docker-compose stop kafka   # Stop single service
```

### Database Operations

```bash
# Connect to database
make db-shell

# Backup database
make backup

# Restore database
make restore FILE=backups/etldb-20260510.sql

# Reset database (WARNING: deletes all data)
make db-reset
```

### Kafka Operations

```bash
# List topics
make kafka-topics

# Check consumer lag
make kafka-lag

# List consumer groups
make kafka-consumer-groups

# Produce test message
docker-compose exec kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic partner.raw.events

# Consume messages
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic canonical.events \
  --from-beginning
```

---

## 🧪 Testing

### Run Tests

```bash
# Runs service tests after service directories are implemented
make test
```

At the current stage this target is a placeholder-safe command: it will run transformer and business-service tests when those service directories exist.

### Load Testing

```bash
# Install k6 (if not already installed)
brew install k6  # macOS
# or
apt-get install k6  # Ubuntu

# Run load test
k6 run test/load/basic-load-test.js
```

---

## 📊 Monitoring

### Access Dashboards

```bash
# Open Prometheus
make prometheus

# Open Grafana
make grafana

# Open Jaeger
make jaeger

# Open Kafka UI
make kafka-ui
```

### View Metrics

```bash
# Prometheus metrics
curl http://localhost:9090/api/v1/query?query=up

# Application metrics (when services are running)
curl http://localhost:3000/metrics  # Transformer
curl http://localhost:8080/q/metrics  # Business Service
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check Docker is running
docker ps

# Check logs for errors
make logs

# Restart services
make restart

# Clean and restart
make clean
make up
```

### Port Conflicts

If ports are already in use, edit `_implementation-ready/docker-compose.yml`:

```yaml
services:
  kafka:
    ports:
      - "9093:9092"  # Change 9092 to 9093
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
make postgres-logs

# Test connection
docker-compose exec postgres pg_isready -U etluser -d etldb

# Reset database
make db-reset
```

### Kafka Issues

```bash
# Check Kafka is running
docker-compose ps kafka

# Check logs
make kafka-logs

# Restart Kafka
docker-compose restart kafka

# Recreate topics
make kafka-create-topics
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 🔧 Advanced Configuration

### Custom Docker Compose

Create `_implementation-ready/docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'

services:
  kafka:
    environment:
      KAFKA_LOG_RETENTION_HOURS: 24

  postgres:
    environment:
      POSTGRES_PASSWORD: my-custom-password
```

### Multiple Kafka Brokers

Edit `_implementation-ready/docker-compose.yml` to add more brokers:

```yaml
services:
  kafka-2:
    image: confluentinc/cp-kafka:7.5.0
    # ... configuration

  kafka-3:
    image: confluentinc/cp-kafka:7.5.0
    # ... configuration
```

### Production-like Setup

```bash
# Use production environment
cp .env.example .env.production
# Edit .env.production with production values

# Start with production config
docker-compose --env-file .env.production up -d
```

---

## 📦 Project Structure

```
etlsolutions/
├── _implementation-ready/
│   ├── docker-compose.yml      # Prepared Docker services configuration
│   ├── Makefile                # Quick commands
│   ├── .env.example            # Environment variables template
│   ├── .env                    # Local configuration
│   ├── docker/                 # Docker-related files
│   │   ├── postgres/
│   │   │   └── init.sql        # Database initialization
│   │   ├── prometheus/
│   │   │   └── prometheus.yml  # Prometheus configuration
│   │   └── grafana/
│   │       └── provisioning/   # Grafana dashboards
│   ├── k8s/                    # Prepared Kubernetes manifests
│   └── scripts/                # Utility scripts
├── src/                        # Source code (to be implemented)
├── partners/                   # Partner configurations
├── schemas/                    # JSON schemas
├── test/                       # Tests
└── docs/                       # Documentation
```

---

## 🎯 Next Steps

### For Developers

1. **Read Architecture**: [Architecture Overview](../architecture/01-overview.md)
2. **Implementation Guide**: [Transformer Guide](../implementation/TRANSFORMER_NODEJS_GUIDE.md)
3. **Start Coding**: Begin with transformer service

### For DevOps

1. **Deployment Guide**: [Kubernetes Deployment Guide](./KUBERNETES_DEPLOYMENT_GUIDE.md)
2. **Operations**: [Operations Runbook](../operations/08-runbook.md)
3. **Monitoring**: [Monitoring Dashboards](../operations/01-monitoring-dashboards.md)

### For Operations

1. **Runbook**: [Operations Runbook](../operations/08-runbook.md)
2. **Troubleshooting**: [Troubleshooting](../operations/03-troubleshooting.md)
3. **Maintenance**: [Maintenance](../operations/05-maintenance.md)

---

## 📞 Getting Help

### Documentation

- **Documentation Index**: [../README.md](../README.md)
- **Architecture**: [Architecture](../architecture/)
- **Operations**: [Operations](../operations/)

### Common Commands

```bash
# Show all available commands
make help

# Check service status
make status

# View logs
make logs

# Health check
make health
```

### Issues

If you encounter issues:

1. Check logs: `make logs`
2. Check health: `make health`
3. Review troubleshooting: [Troubleshooting](../operations/03-troubleshooting.md)
4. Open GitHub issue

---

## ✅ Setup Checklist

- [ ] Docker Desktop installed and running
- [ ] Repository cloned
- [ ] `.env` file created and configured
- [ ] Services started with `make up`
- [ ] Kafka topics created with `make kafka-create-topics`
- [ ] Database initialized (automatic)
- [ ] Health check passed with `make health`
- [ ] Accessed Kafka UI at http://localhost:8080
- [ ] Accessed Grafana at http://localhost:3000
- [ ] Read architecture documentation

---

**Infrastructure setup complete.** Application development can start after the transformer, business service, Mapping Studio UI, and tests are added.

For detailed implementation guides, see [Implementation](../implementation/)

**Last Updated**: May 10, 2026
**Version**: 1.0.0
