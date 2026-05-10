# Docker Compose Local Reference

This document describes the prepared local infrastructure in [`_implementation-ready/docker-compose.yml`](../../_implementation-ready/docker-compose.yml). Application containers for the transformer, business service, frontend, and forms UI should be added after those source projects exist.

For the fastest setup, use [setup-guide.md](./setup-guide.md).

## Services

| Service | Container | Port(s) | Purpose |
|---------|-----------|---------|---------|
| Zookeeper | `etl-zookeeper` | `2181` | Kafka coordination |
| Kafka | `etl-kafka` | `9092`, `9101` | Event broker and JMX |
| PostgreSQL | `etl-postgres` | `5432` | Core relational store |
| Redis | `etl-redis` | `6379` | Cache and coordination support |
| Prometheus | `etl-prometheus` | `9090` | Metrics collection |
| Grafana | `etl-grafana` | `3001` | Dashboards, `admin/admin` locally |
| Jaeger | `etl-jaeger` | `16686`, tracing ports | Distributed tracing |
| Kafka UI | `etl-kafka-ui` | `8080` | Local Kafka inspection |

## Configuration

PostgreSQL defaults:

```bash
POSTGRES_DB=etldb
POSTGRES_USER=etluser
POSTGRES_PASSWORD=etlpass
```

Database initialization is mounted from:

```text
docker/postgres/init.sql
```

Prometheus configuration is mounted from:

```text
docker/prometheus/prometheus.yml
```

Grafana provisioning and dashboards are mounted from:

```text
docker/grafana/provisioning/
docker/grafana/dashboards/
```

## Common Commands

```bash
# Enter the prepared infrastructure package first
cd _implementation-ready

# Start local infrastructure
make up

# First-time initialization
make init

# Stop services
make down

# Show container status
make status

# Run health checks
make health

# Tail all service logs
make logs

# Open database shell
make db-shell

# List Kafka topics
make kafka-topics
```

Equivalent Docker Compose commands:

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f
docker-compose down
```

## Local URLs

| Tool | URL |
|------|-----|
| Kafka UI | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Jaeger | http://localhost:16686 |

## Health Checks

The compose file defines container-level health checks for Zookeeper, Kafka, PostgreSQL, Redis, Prometheus, Grafana, and Jaeger.

```bash
make health
docker-compose ps
docker-compose exec postgres pg_isready -U etluser -d etldb
docker-compose exec redis redis-cli ping
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

## Data and Volumes

The local stack uses named Docker volumes:

```text
zookeeper-data
zookeeper-logs
kafka-data
postgres-data
redis-data
prometheus-data
grafana-data
```

To reset local state:

```bash
make clean
make init
```

`make clean` removes local containers and volumes. Use it only when local development data can be discarded.

## Next Additions

When application code is added, extend the compose file with:

- Transformer service container and worker runtime.
- Business service container.
- Frontend and forms UI containers.
- Service-specific health endpoints.
- Application metrics scrape targets.
- Local sample data and mapping fixtures.
