# Docker Compose Local Reference

This document describes the root [`docker-compose.yml`](../../docker-compose.yml) stack used for local development.

For the full setup walkthrough, use [setup-guide.md](./setup-guide.md).

## Services

| Service | Purpose |
|---|---|
| `postgres` | Mapping Studio API database |
| `zookeeper` | Kafka coordination |
| `kafka` | Raw/canonical event broker |
| `redis` | Cache support |
| `mapping-studio-api` | Quarkus management API |
| `transformer` | Node.js/Fastify transformation runtime |
| `webhook-receiver` | Partner webhook ingestion |
| `canonbridge-mock` | Mock external systems |
| `mapping-studio-ui` | Angular Mapping Studio |
| `prometheus` | Metrics collection |
| `grafana` | Local dashboards |

## Common Commands

```bash
cp .env.example .env
docker compose up -d postgres kafka zookeeper redis canonbridge-mock
docker compose up -d mapping-studio-api transformer webhook-receiver mapping-studio-ui
docker compose ps
docker compose logs -f mapping-studio-api
docker compose down
```

## Useful URLs

| Tool | URL |
|---|---|
| Mapping Studio UI | http://localhost:4200 |
| Mapping Studio API health | http://localhost:8082/health |
| Transformer health | http://localhost:8083/health |
| Mock service health | http://localhost:8085/actuator/health |
| Kafka UI | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

## Reset Local State

```bash
docker compose down -v
docker compose up -d postgres kafka zookeeper redis canonbridge-mock
```

Use the volume reset only when local database and Kafka state can be discarded.
