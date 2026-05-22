# CanonBridge Billing Service

Internal microservice for subscription management, usage metering, and payment provider integration.

## Tech Stack

- **Runtime:** Java 21 + Quarkus 3.15.1
- **Database:** PostgreSQL 15 (shared with mapping-studio-api)
- **Cache:** Redis 7
- **Messaging:** Kafka (usage.events consumer, billing.events producer)
- **Payment:** Paddle (Merchant of Record)
- **Scheduler:** Quarkus Scheduler (cron jobs)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscriptions/{orgId}` | Get subscription for org |
| POST | `/api/subscriptions` | Create/upgrade subscription |
| POST | `/api/subscriptions/{orgId}/cancel` | Cancel subscription |
| POST | `/api/subscriptions/{orgId}/pause` | Pause subscription |
| POST | `/api/subscriptions/{orgId}/resume` | Resume subscription |
| GET | `/api/entitlements/{orgId}` | Get all entitlements |
| GET | `/api/entitlements/{orgId}/{featureKey}` | Check specific entitlement |
| POST | `/api/internal/usage/aggregate/daily` | Trigger daily aggregation |
| POST | `/api/internal/usage/aggregate/monthly` | Trigger monthly aggregation |
| GET | `/api/internal/usage/summary/{orgId}` | Get usage summary |
| POST | `/api/webhooks/paddle` | Paddle webhook receiver |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |
| GET | `/metrics` | Prometheus metrics |

## Running Locally

```bash
# Prerequisites: PostgreSQL, Redis, Kafka running (via docker-compose)
mvn quarkus:dev
```

## Configuration

Key environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | canonbridge_db | Database name |
| `DB_USERNAME` | canonbridge_user | DB username |
| `DB_PASSWORD` | - | DB password |
| `REDIS_URL` | redis://localhost:6379 | Redis URL |
| `KAFKA_BOOTSTRAP_SERVERS` | localhost:9092 | Kafka brokers |
| `PADDLE_API_KEY` | - | Paddle API key |
| `PADDLE_WEBHOOK_SECRET` | - | Paddle webhook HMAC secret |
| `PADDLE_ENVIRONMENT` | sandbox | sandbox or production |
| `PADDLE_SELLER_ID` | - | Paddle seller ID |

## Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Daily aggregation | 02:00 UTC | Rolls up usage_events → usage_aggregates_daily |
| Monthly aggregation | 04:00 UTC, 1st | Rolls up daily → usage_aggregates_monthly |

## Docker

```bash
docker build -t canonbridge/billing-service:latest .
```
