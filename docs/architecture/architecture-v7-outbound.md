# CanonBridge Architecture V7 - Outbound API Calling and Credential Store

**Version**: 7.0  
**Last Updated**: May 11, 2026  
**Status**: Design Document  
**Scope**: Extends the existing Kafka + JSONata + Ajv architecture with outbound API calls, credential management, SOAP/XML support, and non-Kafka triggers.

> Phase notice: this document is a codable architecture specification. It defines service boundaries, runtime flows, configuration shape, security controls, APIs, tables, and operational signals. It does not claim implementation is complete.

---

## 1. Purpose

CanonBridge currently acts primarily as a passive transformation platform:

```text
Kafka raw event -> JSONata transform -> canonical event -> Kafka/business service
```

V7 turns CanonBridge into an active integration platform that can also:

- Start flows from Kafka, webhooks, scheduled polling, or manual test triggers.
- Call external HTTP(S) APIs safely during a configured integration flow.
- Inject credentials without exposing secrets to mappings, logs, users, or JSONata.
- Support REST/JSON and SOAP/XML target systems.
- Show outbound connection health to operators.

The core philosophy remains unchanged:

```text
Users see a no-code integration workflow.
The runtime preserves strict service boundaries, versioning, retries, DLQ, audit, and tenant isolation.
JSONata transforms data. It does not perform network I/O or access secrets.
```

---

## 2. High-Level Architecture Update

### 2.1 Existing flow with V7 additions

```text
Source System
  |
  | 1. Kafka message
  | 2. Webhook request
  | 3. Scheduled poll
  | 4. Manual test run
  v
+-------------------------+
| Trigger / Ingress Layer |
| - Kafka Consumer        |
| - Webhook Receiver      |
| - Scheduled Poller      |
| - Admin Test Trigger    |
+------------+------------+
             |
             v
+------------------------------+
| Transformer Service           |
| Node.js + TypeScript          |
| - Mapping cache               |
| - Schema cache                |
| - JSONata runtime             |
| - Ajv validation              |
| - Worker pool                 |
+--------------+---------------+
               |
               | optional configured outbound step
               v
+------------------------------+        +----------------------------+
| Outbound API Manager          | -----> | Credential Store           |
| outbound-call-manager         |        | encrypted DB or Vault      |
| Java / Quarkus                | <----- | Auth Manager               |
| - REST HTTP client            |        | - API key injection        |
| - SOAP/XML client             |        | - Basic auth               |
| - retry / timeout / circuit   |        | - Bearer token             |
| - response normalization      |        | - OAuth2 token cache       |
+--------------+---------------+        +----------------------------+
               |
               v
+------------------------------+
| Enriched Transformation       |
| source payload + outbound     |
| response context -> JSONata   |
+--------------+---------------+
               |
               v
+------------------------------+
| Canonical output validation   |
| canonical Kafka topic / DLQ   |
+------------------------------+
```

### 2.2 New boxes

| Component | Runtime | Responsibility |
|---|---|---|
| `outbound-call-manager` | Java / Quarkus | Executes configured outbound HTTP(S) and SOAP calls. It is not an inbound API gateway. |
| `credential-store` | PostgreSQL encrypted table and/or HashiCorp Vault | Stores and resolves credentials by reference. Secrets are never embedded in mapping artifacts. |
| Authentication Manager | Library/service inside `outbound-call-manager` | Builds request auth material: API key, Basic, Bearer, OAuth2 client credentials. |
| Webhook Receiver | Java / Quarkus or existing API layer | Accepts inbound HTTP requests and converts them into raw CanonBridge envelopes. |
| Scheduled Poller | Java / Quarkus scheduler | Starts flows by polling external APIs on cron/fixed intervals. No Airflow dependency is required for this use case. |

### 2.3 Explicit non-goals

- `outbound-call-manager` does not receive partner traffic directly.
- JSONata does not make HTTP requests.
- Mapping authors do not see raw secrets.
- External API credentials are not stored in Git, mapping JSONata, fixture files, browser local storage, or logs.

---

## 3. Core Flow Update

The V7 runtime flow is:

```text
1. Trigger starts a flow:
   - Kafka raw message consumed
   - Webhook request accepted
   - Scheduled poll fired
   - Manual test trigger requested

2. CanonBridge builds a raw event envelope:
   tenantId
   partnerId
   eventType
   direction
   sourceType
   correlationId
   idempotencyKey
   payload

3. Input schema is optionally validated with Ajv.

4. If configured, pre-transform outbound calls execute:
   - Resolve outbound definition from partner/event config
   - Fetch credential reference from Credential Store
   - Build HTTP/SOAP request
   - Apply timeout, retry, circuit breaker, and rate limit
   - Normalize response into JSON context

5. JSONata mapping is evaluated against a bounded context:
   source payload
   trigger metadata
   outbound responses

6. Canonical output is validated with Ajv.

7. Valid canonical event is produced to canonical Kafka topic.

8. Original offset or trigger checkpoint is committed only after successful produce.

9. Permanent failures go to DLQ.

10. Temporary failures go to retry or scheduled retry state.
```

### 3.1 New core flow rule

If a flow requires external data, the Transformer must request it through `outbound-call-manager`:

```text
Transformer -> outbound-call-manager -> Credential Store -> External API
```

The Transformer never receives reusable secrets. It receives only:

- Response status
- Response headers filtered by allowlist
- Response body normalized to JSON
- Timing and retry metadata
- Error metadata when the call fails

---

## 4. New Component: Outbound API Manager

### 4.1 Service name

```text
outbound-call-manager
```

Recommended runtime:

```text
Java 21 + Quarkus
```

Rationale:

- Strong HTTP client ecosystem
- Quarkus scheduler and fault tolerance support
- Good native image path if needed later
- Clear separation from JSONata execution

### 4.2 Responsibilities

`outbound-call-manager` is responsible for:

- Executing outbound HTTP(S) calls defined in published partner configuration.
- Resolving credential references at execution time.
- Applying authentication material to outbound requests.
- Enforcing URL allowlists and SSRF protections.
- Applying timeout, retry, backoff, rate limit, and circuit breaker policies.
- Capturing audit events without logging secrets or sensitive payloads.
- Emitting metrics for success rate, latency, retries, and failures.
- Normalizing JSON and SOAP/XML responses into a deterministic response envelope.

It is not responsible for:

- Running JSONata
- Owning mapping drafts
- Storing raw secrets directly in mapping artifacts
- Receiving public partner requests
- Making business decisions

### 4.3 Internal API

`outbound-call-manager` exposes internal service-to-service endpoints only.

```text
POST /internal/outbound/execute
POST /internal/outbound/test
GET  /internal/outbound/connections/{connectionId}/health
GET  /internal/outbound/calls?tenantId=...&from=...&to=...
```

`/internal/outbound/execute` request:

```json
{
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "OrderCreated",
  "mappingVersion": "v3",
  "correlationId": "corr-123",
  "idempotencyKey": "order-123:shipping-quote",
  "outboundCallId": "shippingQuote",
  "requestContext": {
    "source": {
      "orderId": "ORD-123",
      "postalCode": "EC1A 1BB"
    },
    "canonicalPartial": null
  }
}
```

Response:

```json
{
  "status": "success",
  "outboundCallId": "shippingQuote",
  "httpStatus": 200,
  "durationMs": 183,
  "attemptCount": 1,
  "response": {
    "body": {
      "serviceLevel": "EXPRESS",
      "etaDays": 2,
      "price": 12.5
    },
    "headers": {
      "x-request-id": "carrier-789"
    }
  }
}
```

Failure response:

```json
{
  "status": "failed",
  "outboundCallId": "shippingQuote",
  "httpStatus": 503,
  "durationMs": 1200,
  "attemptCount": 3,
  "errorCode": "OUTBOUND_UPSTREAM_UNAVAILABLE",
  "retryable": true,
  "message": "Carrier API returned 503 after retry policy was exhausted",
  "safeBodyPreview": "{\"error\":\"maintenance\"}"
}
```

### 4.4 Request template rendering

Outbound request definitions can reference the flow context using controlled templates:

```text
{{source.order.id}}
{{source.customer.postalCode}}
{{canonical.orderId}}
{{trigger.receivedAt}}
```

Template rendering rules:

- No arbitrary JavaScript.
- No network or file access.
- Missing required template value fails before calling the external API.
- Values are JSON-escaped for body templates and URL-encoded for path/query templates.
- Template output is logged only after masking.

### 4.5 Retry and failure rules

Default policy:

```json
{
  "timeoutMs": 3000,
  "retry": {
    "maxAttempts": 3,
    "backoff": "exponential",
    "initialDelayMs": 200,
    "maxDelayMs": 2000,
    "retryOnHttpStatus": [408, 429, 500, 502, 503, 504]
  },
  "circuitBreaker": {
    "failureRateThresholdPercent": 50,
    "minimumCalls": 20,
    "openDurationMs": 30000
  }
}
```

Permanent outbound failures go to DLQ when the outbound call is required. Optional outbound failures can continue with a null response only when the published config explicitly allows it.

---

## 5. New Component: Credential Store and Authentication Manager

### 5.1 Credential Store responsibilities

Credential Store stores secrets needed by outbound integrations:

- API keys
- Basic auth passwords
- Bearer tokens
- OAuth2 client secrets
- SOAP service credentials when needed

Credential records are referenced by ID:

```text
credentialRef: cred_carrier_a_prod
```

Published mapping artifacts store only the reference, never the secret value.

### 5.2 Storage options

Two supported implementations:

| Option | Recommended use | Notes |
|---|---|---|
| PostgreSQL encrypted table | MVP and self-contained deployments | Secret payload encrypted with AES-256-GCM envelope encryption. |
| HashiCorp Vault | Regulated or large enterprise deployments | CanonBridge stores Vault path/reference; Vault handles secret storage, rotation, and access audit. |

### 5.3 Database table specification

The product-level PostgreSQL model, including draft source configs, outbound connections, webhook endpoints, call history, and audit tables, is maintained in [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md). This architecture section shows the minimum credential-store table shape required by `outbound-call-manager`.

```sql
create table credential_records (
  credential_id          varchar(120) primary key,
  tenant_id              varchar(80) not null,
  display_name           varchar(180) not null,
  auth_type              varchar(40) not null,
  environment            varchar(40) not null,
  encrypted_secret_json  text not null,
  key_version            varchar(80) not null,
  status                 varchar(30) not null,
  rotation_due_at        timestamptz null,
  created_by             varchar(120) not null,
  created_at             timestamptz not null,
  updated_by             varchar(120) not null,
  updated_at             timestamptz not null,
  last_used_at           timestamptz null
);

create index idx_credential_records_tenant
  on credential_records (tenant_id, auth_type, status);
```

`encrypted_secret_json` is encrypted with AES-256-GCM using envelope encryption:

```text
tenant data key -> encrypted by KMS/Vault master key
secret JSON -> encrypted by tenant data key
```

### 5.4 Supported authentication methods

#### API_KEY

Secret shape:

```json
{
  "headerName": "X-API-Key",
  "apiKey": "secret-value"
}
```

Injected request:

```text
X-API-Key: secret-value
```

#### BASIC_AUTH

Secret shape:

```json
{
  "username": "carrier-user",
  "password": "secret-password"
}
```

Injected request:

```text
Authorization: Basic base64(username:password)
```

#### BEARER_TOKEN

Secret shape:

```json
{
  "token": "secret-token"
}
```

Injected request:

```text
Authorization: Bearer secret-token
```

#### OAUTH2_CLIENT_CREDENTIALS

Secret shape:

```json
{
  "tokenUrl": "https://auth.carrier.example/oauth/token",
  "clientId": "client-id",
  "clientSecret": "secret",
  "scope": "quotes.read tracking.read",
  "audience": "https://api.carrier.example"
}
```

Runtime behavior:

```text
1. Check token cache by tenantId + credentialId + scope + audience.
2. If token is valid for more than refreshSkewSeconds, reuse it.
3. Otherwise call tokenUrl with client_credentials grant.
4. Cache access_token until expires_in - refreshSkewSeconds.
5. Inject Authorization: Bearer access_token.
```

Default token cache:

```text
In-memory cache per outbound-call-manager pod.
Optional Redis cache for multi-pod token reuse.
Tokens are never persisted in the database.
```

### 5.5 Authorization rules

| Permission | Description |
|---|---|
| `credential:create` | Create credential metadata and secret value. |
| `credential:update` | Replace secret value or metadata. |
| `credential:read_metadata` | List credentials without secret values. |
| `credential:use` | Reference credential in outbound config. |
| `credential:delete` | Disable credential. Hard delete is not used in audit-sensitive environments. |

Secret value read-back is not supported. After save, the UI can show:

```text
Saved secret: ************
Last rotated: 2026-05-11
```

---

## 6. SOAP/XML Outbound Support

Some enterprise systems require SOAP/XML instead of REST/JSON. CanonBridge supports SOAP outbound calls as a request/response protocol inside `outbound-call-manager`.

### 6.1 SOAP flow

```text
1. Canonical or source JSON enters outbound request template.
2. JSON-to-XML mapping generates operation XML according to configured WSDL operation.
3. XML body is wrapped in a SOAP envelope.
4. HTTP request is sent with SOAPAction and Content-Type headers.
5. SOAP response is parsed.
6. SOAP Fault becomes OUTBOUND_SOAP_FAULT.
7. Response XML body is converted to JSON.
8. JSON response is returned to the transformation context.
```

### 6.2 SOAP configuration

```json
{
  "protocol": "SOAP",
  "wsdlRef": "s3://canonbridge/wsdl/carrier-a-tracking.wsdl",
  "service": "TrackingService",
  "port": "TrackingPort",
  "operation": "GetTrackingStatus",
  "soapAction": "urn:GetTrackingStatus",
  "xmlRequestTemplateRef": "partners/carrier-a/tracking/request.v1.xml.template",
  "responseMapping": {
    "xmlToJson": true,
    "bodyPath": "/Envelope/Body/GetTrackingStatusResponse"
  }
}
```

### 6.3 SOAP fault handling

SOAP fault response:

```json
{
  "status": "failed",
  "errorCode": "OUTBOUND_SOAP_FAULT",
  "httpStatus": 500,
  "retryable": false,
  "soapFault": {
    "faultCode": "soap:Client",
    "faultString": "Invalid tracking number"
  }
}
```

SOAP calls follow the same credential, timeout, retry, circuit breaker, audit, and metrics controls as REST calls.

---

## 7. Data Source and Trigger Architecture

This section answers: how does a transformation flow start?

CanonBridge supports four trigger families.

### 7.1 Kafka trigger

Default production trigger for event streams.

```text
Kafka raw topic -> Transformer -> canonical topic
```

Use when:

- Source system already publishes events.
- High throughput and replay are required.
- Ordering and offset control matter.

Checkpoint:

```text
Kafka offset commit after canonical produce succeeds.
```

### 7.2 Webhook Receiver

Webhook Receiver accepts HTTP requests from external systems and converts them into raw CanonBridge envelopes.

```text
External system -> Webhook Receiver -> raw Kafka topic -> Transformer
```

Responsibilities:

- Generate per-tenant/per-partner webhook endpoint.
- Authenticate inbound requests with API key or signed secret.
- Validate payload size and content type.
- Attach `tenantId`, `partnerId`, `eventType`, `sourceType=webhook`.
- Produce raw event to Kafka.

Example endpoint:

```text
POST /webhooks/{tenantSlug}/{partnerSlug}/{eventType}/{webhookId}
```

Important: Webhook Receiver is an ingress component. It is separate from `outbound-call-manager`.

### 7.3 Scheduled Poller

Scheduled Poller starts flows by calling external APIs on a configured schedule.

```text
Cron/fixed interval -> Scheduled Poller -> outbound-call-manager -> raw envelope -> Transformer
```

Use when:

- Partner does not push events.
- Partner exposes a polling API.
- CanonBridge should query every N minutes.

No separate Airflow dependency is required. CanonBridge can run scheduled polling internally using Quarkus Scheduler or Kubernetes CronJobs managed by CanonBridge configuration.

Checkpoint options:

| Mode | Description |
|---|---|
| `watermark` | Store last successful timestamp/cursor. |
| `page_token` | Store API-provided next page token. |
| `idempotency_only` | Poll fixed window and dedupe by event ID. |

### 7.4 Manual Trigger

Manual trigger supports test and operational use cases.

```text
Mapping Studio/Admin API -> dry run or controlled execution
```

Manual trigger modes:

| Mode | Produces Kafka? | Use |
|---|---:|---|
| `dry_run` | No | Mapping preview and validation. |
| `test_external_api` | No | Calls external API and shows response/error in UI. |
| `replay_to_pipeline` | Yes, permission gated | Operational replay with audit. |

### 7.5 Outbound Call Trigger

For scheduled polling and API-sourced flows, the first action may be an outbound call:

```text
Scheduled trigger -> outbound call -> response JSON -> transform -> canonical output
```

The outbound call result becomes the source payload for mapping.

---

## 8. Section 10 Update: JSONata and Outbound Responses

JSONata remains the transformation engine only. It does not:

- Call HTTP APIs
- Read credentials
- Refresh OAuth tokens
- Access Vault
- Read files

Outbound responses are prepared before JSONata evaluation and passed as data.

Recommended JSONata input context:

```json
{
  "source": {
    "order": {
      "id": "ORD-123"
    }
  },
  "trigger": {
    "sourceType": "scheduled_poll",
    "receivedAt": "2026-05-11T10:00:00Z"
  },
  "outbound": {
    "shippingQuote": {
      "status": "success",
      "httpStatus": 200,
      "body": {
        "etaDays": 2,
        "price": 12.5
      }
    }
  }
}
```

Generated JSONata example:

```jsonata
{
  "orderId": source.order.id,
  "shipping": {
    "etaDays": outbound.shippingQuote.body.etaDays,
    "price": outbound.shippingQuote.body.price
  }
}
```

Rule:

```text
JSONata can transform outbound response data, but outbound calls are executed before JSONata by a separate controlled service.
```

---

## 40. Partner/Event Configuration Update

V7 extends partner/event configuration with `source`, `triggers`, `outbound`, and `authentication` references.

### 40.1 Example configuration

```json
{
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "OrderCreated",
  "schemaVersion": "v1",
  "mappingVersion": "v3",
  "status": "active",
  "source": {
    "type": "scheduled_poll",
    "description": "Poll carrier order endpoint every 5 minutes",
    "samplePayloadRef": "partners/acme-marketplace/order-created/fixtures/valid-order.input.json"
  },
  "triggers": {
    "kafka": {
      "enabled": false,
      "topic": "tenant-001.raw.acme-marketplace.order-created"
    },
    "webhook": {
      "enabled": false,
      "webhookId": "wh_acme_order_created",
      "authMode": "API_KEY",
      "apiKeyCredentialRef": "cred_acme_webhook_ingress"
    },
    "scheduled": {
      "enabled": true,
      "schedule": "*/5 * * * *",
      "timezone": "UTC",
      "checkpoint": {
        "mode": "watermark",
        "field": "updatedSince",
        "initialValue": "2026-05-01T00:00:00Z"
      }
    },
    "manual": {
      "enabled": true,
      "allowedModes": ["dry_run", "test_external_api"]
    }
  },
  "authentication": {
    "carrierApiKey": {
      "type": "API_KEY",
      "credentialRef": "cred_carrier_a_api_key_prod",
      "inject": {
        "location": "header",
        "name": "X-API-Key"
      }
    },
    "carrierOauth": {
      "type": "OAUTH2_CLIENT_CREDENTIALS",
      "credentialRef": "cred_carrier_a_oauth_prod",
      "tokenCache": {
        "refreshSkewSeconds": 60
      }
    }
  },
  "outbound": {
    "calls": [
      {
        "id": "fetchOrders",
        "purpose": "source_payload",
        "protocol": "REST",
        "required": true,
        "authenticationRef": "carrierOauth",
        "request": {
          "method": "GET",
          "url": "https://api.carrier-a.example/v1/orders",
          "query": {
            "updatedSince": "{{checkpoint.watermark}}",
            "limit": "100"
          },
          "headers": {
            "Accept": "application/json"
          }
        },
        "response": {
          "bodyType": "json",
          "itemsPath": "$.orders",
          "nextCheckpointPath": "$.nextUpdatedSince"
        },
        "timeoutMs": 3000,
        "retry": {
          "maxAttempts": 3,
          "backoff": "exponential",
          "retryOnHttpStatus": [408, 429, 500, 502, 503, 504]
        }
      },
      {
        "id": "shippingQuote",
        "purpose": "enrichment",
        "protocol": "REST",
        "required": false,
        "authenticationRef": "carrierApiKey",
        "request": {
          "method": "POST",
          "url": "https://api.carrier-a.example/v1/quotes",
          "headers": {
            "Content-Type": "application/json"
          },
          "bodyTemplate": {
            "postalCode": "{{source.customer.postalCode}}",
            "weightKg": "{{source.package.weightKg}}"
          }
        },
        "response": {
          "bodyType": "json",
          "contextPath": "outbound.shippingQuote.body"
        },
        "timeoutMs": 2500,
        "onFailure": {
          "mode": "continue_with_null",
          "safeDefault": null
        }
      }
    ]
  },
  "schemas": {
    "input": "input.v1.schema.json",
    "canonical": "canonical.v1.schema.json"
  },
  "mapping": {
    "direction": "inbound",
    "jsonata": "inbound.v3.jsonata"
  },
  "masking": {
    "rules": [
      { "path": "$.source.customer.email", "strategy": "EMAIL_MASK" },
      { "path": "$.outbound.*.headers.authorization", "strategy": "FULL_REDACT" }
    ]
  }
}
```

### 40.2 Configuration validation rules

- Every `authenticationRef` must point to a declared `authentication` entry.
- Every declared authentication entry must reference an active credential for the same tenant.
- `url` host must match tenant/environment allowlist.
- `timeoutMs` must be between tenant minimum and maximum.
- `retry.maxAttempts` must not exceed platform maximum.
- `required=false` calls must define explicit `onFailure`.
- SOAP calls must define `wsdlRef`, `operation`, and XML request template.
- Scheduled triggers must define checkpoint behavior unless they are idempotency-only.

---

## 41. Published Artifact Layout

Recommended artifact layout:

```text
partners/{partnerId}/{eventType}/
  config.json
  input.v1.schema.json
  canonical.v1.schema.json
  inbound.v3.jsonata
  outbound/
    request-templates/
      shipping-quote.v1.json.template
      tracking-status.v1.xml.template
    wsdl/
      carrier-tracking.v1.wsdl
  fixtures/
    valid-order.input.json
    valid-order.expected.json
```

Secrets are not included in this artifact layout.

---

## 42. Observability

### 42.1 Metrics

| Metric | Type | Labels |
|---|---|---|
| `outbound_call_duration_ms` | Histogram | tenant, partner, event_type, call_id, status |
| `outbound_call_total` | Counter | tenant, partner, event_type, call_id, result, http_status |
| `outbound_retry_total` | Counter | tenant, partner, event_type, call_id, reason |
| `outbound_circuit_state` | Gauge | tenant, partner, event_type, call_id, state |
| `credential_access_total` | Counter | tenant, credential_id_hash, auth_type, result |
| `oauth_token_refresh_total` | Counter | tenant, credential_id_hash, result |
| `scheduled_poll_lag_seconds` | Gauge | tenant, partner, event_type |
| `webhook_ingress_total` | Counter | tenant, partner, event_type, result |

### 42.2 Logs

Logs may include:

- correlationId
- tenantId
- partnerId
- eventType
- outboundCallId
- durationMs
- httpStatus
- retryCount
- errorCode

Logs must not include:

- API keys
- Authorization headers
- OAuth tokens
- Basic auth username/password
- Raw unmasked response bodies
- Raw PII fields

### 42.3 Trace spans

Recommended OpenTelemetry spans:

```text
canonbridge.trigger.receive
canonbridge.input.validate
canonbridge.outbound.execute
canonbridge.credential.resolve
canonbridge.oauth.refresh
canonbridge.jsonata.evaluate
canonbridge.canonical.validate
canonbridge.kafka.produce
```

---

## 43. Failure Handling and DLQ

### 43.1 Error codes

| Code | Retryable | Destination |
|---|---:|---|
| `OUTBOUND_TIMEOUT` | Yes | retry topic or scheduled retry |
| `OUTBOUND_CONNECTION_FAILED` | Yes | retry topic or scheduled retry |
| `OUTBOUND_HTTP_429` | Yes | retry with backoff |
| `OUTBOUND_HTTP_5XX` | Yes | retry with policy |
| `OUTBOUND_HTTP_4XX` | Usually no | DLQ unless configured otherwise |
| `OUTBOUND_AUTH_FAILED` | No | DLQ and security alert |
| `OUTBOUND_CREDENTIAL_NOT_FOUND` | No | DLQ and configuration alert |
| `OUTBOUND_OAUTH_TOKEN_FAILED` | Depends on status | retry for 5xx, DLQ for 4xx |
| `OUTBOUND_SOAP_FAULT` | Depends on fault | DLQ by default |
| `OUTBOUND_RESPONSE_SCHEMA_FAILED` | No | DLQ |

### 43.2 DLQ payload for outbound failure

DLQ record must include safe metadata:

```json
{
  "errorCode": "OUTBOUND_AUTH_FAILED",
  "tenantId": "tenant-001",
  "partnerId": "acme-marketplace",
  "eventType": "OrderCreated",
  "mappingVersion": "v3",
  "outboundCallId": "shippingQuote",
  "httpStatus": 401,
  "retryable": false,
  "correlationId": "corr-123",
  "safeMessage": "External API authentication failed",
  "safeBodyPreview": "{\"error\":\"unauthorized\"}"
}
```

---

## 44. Security Controls for Outbound Integrations

### 44.1 SSRF and egress controls

Outbound requests are risky because users configure URLs. Required controls:

- Tenant/environment-level host allowlist.
- Block private IP ranges by default:
  - `127.0.0.0/8`
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
  - link-local and metadata service IPs
- Resolve DNS before connect and validate final IP.
- Revalidate after redirects.
- Disable redirects by default; allow only when configured and still allowlisted.
- Enforce HTTPS for production unless tenant admin grants exception.
- Apply Kubernetes NetworkPolicy egress from `outbound-call-manager`.

### 44.2 Secret handling

- Secrets are encrypted at rest with AES-256-GCM.
- Secrets are decrypted only inside Credential Store/Auth Manager boundary.
- Authorization headers are redacted before logging, metrics tags, traces, and error messages.
- Secret values are write-only in UI.
- Secret access emits audit event.
- Credential references are tenant-scoped.

### 44.3 Tenant isolation

- `tenantId` is mandatory in all credential and outbound call requests.
- Credential lookup always includes `tenant_id`.
- Outbound config cache keys include tenant ID.
- Cross-tenant credential reference returns `403` or `CREDENTIAL_NOT_FOUND`.

---

## 49. Security Architecture - External System Integration

This section groups credential security, authentication, PII masking, audit logging, and operational controls for external system integration.

### 49.1 Credential Store

Credential Store is the source of truth for outbound secrets. It enforces:

- RBAC on create/update/use.
- Tenant isolation.
- AES-256-GCM encryption when database-backed.
- Optional Vault path integration.
- Write-only secret values.
- Rotation metadata.
- Access audit.

### 49.2 Authentication Manager

Authentication Manager runs inside `outbound-call-manager` or as an internal library. It:

- Resolves credential references.
- Builds auth headers.
- Refreshes OAuth2 tokens.
- Maintains token cache.
- Redacts auth material from all diagnostics.
- Emits `credential.used`, `credential.oauth_token_refreshed`, and `credential.auth_failed` audit events.

### 49.3 PII masking

PII masking applies to:

- Trigger payloads
- Outbound request templates
- Outbound response previews
- Logs
- DLQ displays
- Mapping Studio sample previews

Masking rules must run before any payload preview is persisted or displayed.

Recommended mask strategies:

| Strategy | Example |
|---|---|
| `FULL_REDACT` | `[REDACTED]` |
| `EMAIL_MASK` | `j***@example.com` |
| `LAST_FOUR` | `********1234` |
| `PARTIAL_MASK` | `abc***xyz` |
| `HASH_ONLY` | stable SHA-256 hash for correlation |

### 49.4 Audit logging

New audit event types:

```text
credential.created
credential.updated
credential.disabled
credential.used
credential.oauth_token_refreshed
outbound.call.tested
outbound.call.succeeded
outbound.call.failed
outbound.config.created
outbound.config.updated
webhook.created
webhook.secret_rotated
scheduled_poll.created
scheduled_poll.checkpoint_updated
manual_trigger.executed
```

Audit records must include:

- actor type: user or service
- actor id
- tenant id
- credential id hash, not raw credential value
- partner id
- event type
- outbound call id
- result
- timestamp
- request correlation id
- safe change summary

### 49.5 Production publish gates

Before a mapping using outbound calls can be published:

- All referenced credentials exist and are active.
- URL allowlist validation passes.
- Required outbound call has a successful test in the target environment or approved exception.
- Response shape sample exists.
- Generated JSONata parses and runs against source/outbound sample context.
- Canonical output validates.
- Audit log records publish approval.

---

## 50. Implementation Milestones

### Milestone 1: Configuration and Credential Store

- Add `credential_records` table.
- Add credential metadata APIs.
- Implement AES-256-GCM envelope encryption or Vault reference mode.
- Extend partner config schema with `source`, `triggers`, `authentication`, `outbound`.

### Milestone 2: Outbound Call Manager

- Implement internal execute/test APIs.
- Implement REST JSON calls.
- Add API_KEY, BASIC_AUTH, BEARER_TOKEN.
- Add timeout, retry, allowlist, redaction, metrics.

### Milestone 3: OAuth2 and Scheduled Poller

- Implement OAuth2 client credentials token cache.
- Implement scheduled trigger and checkpoint store.
- Add retry/checkpoint safety.

### Milestone 4: SOAP/XML

- Add XML template rendering.
- Add SOAP envelope support.
- Add WSDL operation metadata support.
- Add XML-to-JSON response normalization.

### Milestone 5: Mapping Studio and Operations

- Add source type selection.
- Add credential drawer.
- Add outbound test preview.
- Add External Systems health dashboard.
- Add audit and health APIs.

---

## 51. Acceptance Criteria

The V7 architecture is complete when:

```text
1. A mapping can be triggered by Kafka, webhook, schedule, or manual test.
2. A scheduled poll can call an external API every 5 minutes without Airflow.
3. An outbound REST call can be configured without putting secrets in config.json.
4. API key, Basic auth, Bearer token, and OAuth2 client credentials are supported.
5. OAuth2 tokens refresh automatically and are not persisted as secrets.
6. SOAP request/response can be executed and normalized to JSON.
7. JSONata can transform outbound response data but cannot perform network I/O.
8. Credential access is tenant-scoped, encrypted, authorized, and audited.
9. Outbound failures are visible in DLQ, metrics, traces, and Mapping Studio.
10. Operators can see external system health and determine whether failure is upstream or CanonBridge.
```

---

## 52. Current Implementation Boundary

As of the Mapping Studio cleanup on May 11, 2026, the UI demonstrates the complete outbound-oriented workflow, but production runtime calls still require the V7 backend milestones above.

Implemented in the local UI:

- Source type cards for Kafka, webhook, external API, and manual upload.
- No-code source validation rules before transformation.
- Credential drawer UX for API key, Basic Auth, Bearer token, and OAuth2 client credentials.
- External API sample capture as a demo response, with explicit demo status messaging.
- Full Studio configuration import/export for source setup, source validation, canonical fields, rules, fixtures, credentials metadata, and webhook metadata.
- Generated transformation rule preview, copy, and download.
- External Systems operational screen for connection health in the demo app.

Still backend-bound:

- `outbound-call-manager` execute/test APIs.
- Encrypted Credential Store or Vault integration.
- Real webhook URL/key provisioning and rotation.
- Scheduled Poller execution and checkpoint persistence.
- SOAP/WSDL runtime execution.
- Server-side publish gates that verify credentials, URL allowlists, outbound samples, and audit records.

This boundary must remain visible in demos: the browser can simulate or preview, but any production publish must call the backend services specified in Sections 4, 5, 7, 40, and 49.

---

## 53. Prompt Coverage Matrix

| Requested capability | Covered section(s) | Implementation expectation |
|---|---|---|
| `outbound-call-manager` as the outbound API call manager | Sections 2, 3, 4, 40, 42, 43 | Implement as an internal Java/Quarkus service. It sends requests outward only and is not an ingress API gateway. |
| Partner config `outbound` block with URL, method, headers, timeout, retry | Section 40 | Store only published connection metadata and credential references. Validate URL allowlists and retry policy before publish. |
| Credential Store with API key, Basic, Bearer, OAuth2 client credentials | Sections 5, 40, 49 | Use encrypted PostgreSQL or Vault. Never place secret values in mapping artifacts or browser-exported config. |
| OAuth2 token acquisition and refresh | Section 5.4 | Resolve token at runtime through Authentication Manager, cache access tokens, and avoid database persistence for short-lived tokens. |
| SOAP/XML outbound support | Section 6 and Section 40 SOAP validation rules | Convert JSON to XML, wrap SOAP envelope, execute request, convert response XML back to JSON context. |
| Kafka alternatives: webhook, scheduled poller, manual trigger | Section 7 | Use Webhook Receiver for inbound HTTP, Scheduled Poller for periodic fetch, and Admin/Studio trigger for manual tests. |
| High-level architecture boxes for Outbound API Manager and Credential Store | Section 2 | Keep service boundaries explicit: Transformer evaluates mappings; outbound manager owns network I/O; credential store owns secrets. |
| Core flow step for credential resolution and outbound call | Section 3 | Execute outbound calls before JSONata evaluation and pass normalized responses into the transformation context. |
| JSONata note for outbound response transformation | Section 8 | JSONata consumes outbound response data but cannot initiate network calls or access credentials. |
| Security architecture with Credential Store, PII masking, audit logging | Section 49 | Enforce tenant-scoped access, masking policies, audit events, and publish gates. |

---

**See Also**:

- [Architecture Overview](./01-overview.md)
- [Transformation Layer](./05-transformation-layer.md)
- [Security](../implementation/10-security.md)
- [Audit Logging](../operations/16-audit-logging.md)
- [Mapping Studio Visual JSONata Design](../product/06-mapping-studio-visual-jsonata-design.md)
