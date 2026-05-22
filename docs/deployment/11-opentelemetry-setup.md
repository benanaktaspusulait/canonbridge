# OpenTelemetry Instrumentation (X-Y3)

## Problem

- `CorrelationIdFilter` is duplicated across services (DRY violation)
- Not all services are fully instrumented with OpenTelemetry SDK
- Distributed tracing gaps between services

## Solution

### 1. Quarkus Services (mapping-studio-api, billing-service, webhook-receiver)

Add dependency to each `pom.xml`:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
```

Add to `application.properties`:

```properties
# OpenTelemetry
quarkus.otel.enabled=${OTEL_ENABLED:true}
quarkus.otel.exporter.otlp.endpoint=${OTEL_EXPORTER_OTLP_ENDPOINT:http://localhost:4317}
quarkus.otel.exporter.otlp.protocol=${OTEL_EXPORTER_OTLP_PROTOCOL:grpc}
quarkus.otel.resource.attributes=service.name=${quarkus.application.name},service.version=${quarkus.application.version},deployment.environment=${ENVIRONMENT:development}

# Propagate trace context through Kafka
mp.messaging.outgoing.*.interceptor.classes=io.opentelemetry.instrumentation.kafkaclients.TracingProducerInterceptor
mp.messaging.incoming.*.interceptor.classes=io.opentelemetry.instrumentation.kafkaclients.TracingConsumerInterceptor

# Disable in dev/test to reduce noise
%dev.quarkus.otel.enabled=false
%test.quarkus.otel.enabled=false
```

### 2. Transformer (Node.js)

Install dependencies:

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/instrumentation-kafkajs \
  @opentelemetry/instrumentation-pg @opentelemetry/instrumentation-fastify
```

Create `src/tracing.ts`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export function initTracing(): NodeSDK | null {
  if (process.env.OTEL_ENABLED !== 'true') return null;

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'transformer',
      [ATTR_SERVICE_VERSION]: '1.0.0',
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4317',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  return sdk;
}
```

Import at the top of `src/index.ts` (must be first import):

```typescript
import { initTracing } from './tracing.js';
const otelSdk = initTracing();
// ... rest of imports
```

### 3. Lead Capture Edge (Cloudflare Workers)

Cloudflare Workers don't support the full OTEL SDK. Use lightweight trace propagation:

```typescript
// Extract trace context from incoming request
const traceparent = request.headers.get('traceparent');

// Forward to webhook with trace context
const headers: Record<string, string> = { 'Content-Type': 'application/json' };
if (traceparent) headers['traceparent'] = traceparent;
```

### 4. Collector Configuration

Deploy OpenTelemetry Collector as a sidecar or DaemonSet:

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024

exporters:
  jaeger:
    endpoint: jaeger-service:14250
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

### 5. CorrelationId Consolidation

Once OTEL is fully instrumented, the custom `CorrelationIdFilter` can be simplified:
- OTEL automatically generates and propagates `trace-id`
- The filter should read `traceparent` header and extract trace-id as correlation-id
- Remove duplicated filter code across services; use a shared library or rely on OTEL propagation

### Migration Plan

1. Add `quarkus-opentelemetry` to all Quarkus services (non-breaking, disabled by default)
2. Deploy OTEL Collector alongside Jaeger
3. Enable OTEL in staging (`OTEL_ENABLED=true`)
4. Verify traces flow end-to-end across all services
5. Enable in production
6. Simplify CorrelationIdFilter to use OTEL trace-id
