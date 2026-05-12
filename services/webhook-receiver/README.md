# Webhook Receiver

Reactive Quarkus service for receiving webhook payloads from external partners and publishing to Kafka.

## Features

- **Webhook Ingestion** - Accept HTTP POST from partners
- **Authentication** - Webhook key validation with SHA-256 hashing
- **Kafka Publishing** - Reactive message publishing to raw events topic
- **Envelope Wrapping** - Standardized event envelope with metadata
- **Header Extraction** - Capture relevant HTTP headers (excluding secrets)

## Flow

1. Partner sends HTTP POST to `/webhook/{partnerId}/{eventType}`
2. Validate `X-Webhook-Key` header against stored hash
3. Wrap payload in standard envelope with metadata
4. Publish to Kafka `raw-partner-events` topic
5. Return 202 Accepted with event ID

## API Endpoints

- `POST /webhook/{partnerId}/{eventType}` - Receive webhook

Headers:
- `X-Webhook-Key` (required) - Partner webhook authentication key

## Configuration

```bash
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
DB_URL=postgresql://localhost:5432/canonbridge
```

## Running

```bash
mvn quarkus:dev
```

## See Also

- [Backend Service Requirements](../../docs/implementation/11-backend-service-requirements.md)
