# Project Structure

## Backend Monorepo / Service Layout

The production backend is a small set of services, not a single transformer-only package. The current repository already contains a `services/transformer/` scaffold; the remaining backend services below are requirements for the next implementation phase.

```text
etlsolutions/
  services/
    mapping-studio-api/
      src/main/java/
        api/
        application/
        domain/
        infrastructure/
          persistence/
          security/
          audit/
      src/main/resources/
        db/migration/
        application.yaml
      pom.xml

    transformer/
      src/
        kafkaRunner.ts
        transformEngine.ts
        partnerRegistry.ts
        jsonataWorker.ts
        workerPool.ts
        httpServer.ts
        metrics.ts
        env.ts
      package.json
      Dockerfile
      k8s/

    outbound-call-manager/
      src/main/java/
        api/
        application/
        auth/
        rest/
        soap/
        security/
        persistence/
      src/main/resources/
        db/migration/
        application.yaml
      pom.xml

    webhook-receiver/
      # May be folded into mapping-studio-api for MVP.
      src/main/java/
        api/
        auth/
        producer/
      pom.xml

    scheduled-poller/
      # May be folded into outbound-call-manager for MVP.
      src/main/java/
        scheduler/
        checkpoint/
        producer/
      pom.xml

    business-consumer-service/
      src/main/java/
        consumer/
        domain/
        persistence/
        outbox/
      pom.xml

    outbox-publisher/
      src/main/java/
        publisher/
        persistence/
      pom.xml

  partners/
    <partner-id>/
      <event-type>/
        config.json
        input.v1.schema.json
        inbound.v1.jsonata
        fixtures/

  schemas/
    envelope.schema.json
    canonical/

  docs/
    implementation/11-backend-service-requirements.md
    product/03-mapping-studio-api-data-model.md
    architecture/architecture-v7-outbound.md
```

### Service Ownership

| Path | Owner | Notes |
|------|-------|-------|
| `services/mapping-studio-api` | Management backend | Stores drafts, versions, partners, credentials metadata, outbound config, fixtures, validation runs, and audit events. |
| `services/transformer` | Transformation runtime | Existing scaffold. Owns JSONata, Ajv, Kafka transform flow, retry, DLQ, and dry-run transform API. |
| `services/outbound-call-manager` | External API runtime | Owns REST/SOAP network calls, credential resolution, masking, allowlists, retry, and call history. |
| `services/webhook-receiver` | Inbound HTTP source | Converts webhook requests into raw envelopes. Can be a module inside `mapping-studio-api` for MVP. |
| `services/scheduled-poller` | Scheduled API source | Runs configured polling jobs and checkpoints. Can be a module inside `outbound-call-manager` for MVP. |
| `services/business-consumer-service` | Canonical event processing | Applies business rules, idempotency, dependencies, and domain writes. |
| `services/outbox-publisher` | Durable event publication | Publishes outbox rows to Kafka. |

## Transformer Service Package Layout

The layout below is the transformer-specific structure. It is no longer the entire backend architecture.

```text
partner-transformer-service/
  src/
    app.ts
    server.ts

    kafka/
      consumer.ts
      producer.ts
      offset-manager.ts

    workers/
      transform-worker.ts
      worker-pool.ts

    services/
      partner-resolver.ts
      mapping-cache.ts
      schema-cache.ts
      jsonata-transformer.ts
      validator.ts
      retry-handler.ts
      dlq-publisher.ts
      error-classifier.ts

    plugins/
      logger.ts
      metrics.ts
      tracing.ts
      healthcheck.ts

    types/
      envelope.ts
      errors.ts
      config.ts

  partners/
    company-a/
      order-created/
        config.json
        input.v1.schema.json
        inbound.v1.jsonata
        canonical.v1.schema.json
        fixtures/
          input-1.json
          expected-1.json

      order-line-created/
        config.json
        input.v1.schema.json
        inbound.v1.jsonata
        canonical.v1.schema.json
        fixtures/
          input-1.json
          expected-1.json

  schemas/
    envelope.schema.json
    canonical/
      order-created.v1.schema.json
      order-line-created.v1.schema.json

  test/
    mapping-fixtures.test.ts
    validator.test.ts
    error-classifier.test.ts

  docker/
    Dockerfile
    docker-compose.yml

  k8s/
    deployment.yaml
    service.yaml
    configmap.yaml

  .github/
    workflows/
      ci.yml
      deploy.yml

  package.json
  tsconfig.json
  jest.config.js
  .eslintrc.json
  .prettierrc.json
  README.md
```

## Core Modules

### Kafka Module
- Consumer setup and message handling
- Producer setup and message publishing
- Offset management
- Rebalance handling

### Workers Module
- Worker pool initialization
- Task distribution
- Worker lifecycle management
- Error handling

### Services Module
- Partner configuration resolution
- Mapping cache management
- Schema cache management
- JSONata transformation
- Validation logic
- Error classification
- DLQ publishing

### Plugins Module
- Structured logging
- Metrics collection
- Distributed tracing
- Health check endpoints

### Types Module
- Message envelope types
- Error types
- Configuration types
- Validation types

## Partner Configuration Structure

The example below is the minimal transformer configuration for a Kafka-sourced flow. Production configs can also include `source`, `triggers`, `authentication`, and `outbound` blocks for webhook, scheduled poll, REST, SOAP, and credential-backed flows. See [Architecture V7](../architecture/architecture-v7-outbound.md#40-partnerevent-configuration-update) for the full outbound-aware shape.

```json
{
  \"partnerId\": \"companyA\",
  \"eventType\": \"OrderLineCreated\",
  \"schemaVersion\": \"v1\",
  \"direction\": \"inbound\",
  \"inputSchema\": \"partners/company-a/order-line-created/input.v1.schema.json\",
  \"mapping\": \"partners/company-a/order-line-created/inbound.v1.jsonata\",
  \"canonicalSchema\": \"schemas/canonical/order-line-created.v1.schema.json\",
  \"kafka\": {
    \"inputTopic\": \"partner.raw.events\",
    \"outputTopic\": \"canonical.events\",
    \"dlqTopic\": \"transformation.dlq\",
    \"retryTopics\": [
      \"transformation.retry.1m\",
      \"transformation.retry.5m\",
      \"transformation.retry.30m\"
    ],
    \"partitionKeyPath\": \"$.entityId\"
  },
  \"processing\": {
    \"orderingRequired\": true,
    \"mode\": \"ordered\",
    \"maxRetries\": 3,
    \"workerPoolEnabled\": true
  },
  \"logging\": {
    \"logPayload\": false,
    \"maskSensitiveFields\": true
  }
}
```

## Configuration Files

### package.json
```json
{
  \"name\": \"partner-transformer-service\",
  \"version\": \"1.0.0\",
  \"description\": \"Partner event transformation service\",
  \"main\": \"dist/app.js\",
  \"scripts\": {
    \"build\": \"tsc\",
    \"start\": \"node dist/app.js\",
    \"dev\": \"ts-node src/app.ts\",
    \"test\": \"jest\",
    \"test:watch\": \"jest --watch\",
    \"lint\": \"eslint src\",
    \"format\": \"prettier --write src\",
    \"docker:build\": \"docker build -t transformer:latest .\",
    \"docker:run\": \"docker-compose up\"
  },
  \"dependencies\": {
    \"fastify\": \"^4.x\",
    \"kafkajs\": \"^2.x\",
    \"jsonata\": \"^2.x\",
    \"ajv\": \"^8.x\",
    \"pino\": \"^8.x\",
    \"prom-client\": \"^14.x\"
  },
  \"devDependencies\": {
    \"@types/node\": \"^18.x\",
    \"typescript\": \"^5.x\",
    \"jest\": \"^29.x\",
    \"@types/jest\": \"^29.x\",
    \"ts-jest\": \"^29.x\",
    \"eslint\": \"^8.x\",
    \"prettier\": \"^3.x\"
  }
}
```

### tsconfig.json
```json
{
  \"compilerOptions\": {
    \"target\": \"ES2020\",
    \"module\": \"commonjs\",
    \"lib\": [\"ES2020\"],
    \"outDir\": \"./dist\",
    \"rootDir\": \"./src\",
    \"strict\": true,
    \"esModuleInterop\": true,
    \"skipLibCheck\": true,
    \"forceConsistentCasingInFileNames\": true,
    \"resolveJsonModule\": true,
    \"declaration\": true,
    \"declarationMap\": true,
    \"sourceMap\": true
  },
  \"include\": [\"src\"],
  \"exclude\": [\"node_modules\", \"dist\", \"test\"]
}
```

---

## Next Steps

1. Review [Backend Service Requirements](./11-backend-service-requirements.md)
2. Review [Configuration](./02-configuration.md)
3. Study [Mapping Versioning](./03-mapping-versioning.md)
4. Understand [Schema Validation](./04-schema-validation.md)

---

**See Also**:
- [Architecture Overview](../architecture/01-overview.md)
- [Architecture V7 - Outbound API Calling and Credential Store](../architecture/architecture-v7-outbound.md)
- [Technology Decisions](../architecture/03-technology-decisions.md)
