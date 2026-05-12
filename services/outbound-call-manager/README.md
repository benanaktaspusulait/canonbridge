# Outbound Call Manager

Full reactive Quarkus service for executing controlled REST/SOAP calls to external systems.

## Features

- **Reactive HTTP Client** - Non-blocking outbound calls using Vert.x WebClient
- **URL Validation** - SSRF protection, private IP blocking, allowlist enforcement
- **Fault Tolerance** - Circuit breaker, retry, timeout policies
- **Call History** - Audit trail with masked sensitive data
- **Multi-protocol** - REST, SOAP/XML, GraphQL support
- **Credential Integration** - Secure credential resolution

## Security

### SSRF Protection
- Private IP address blocking (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- IPv6 private address blocking
- URL allowlist enforcement
- Protocol validation (HTTP/HTTPS only)

### Data Masking
- Request/response bodies masked before storage
- Sensitive headers filtered
- Configurable field-level masking

## API Endpoints

### Internal APIs
- `POST /internal/outbound/execute` - Execute outbound call
- `POST /internal/outbound/test` - Test connection

### Health & Observability
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /metrics` - Prometheus metrics

## Configuration

```bash
# Database
DB_URL=postgresql://localhost:5432/canonbridge
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Outbound Settings
OUTBOUND_URL_ALLOWLIST=api.example.com,api.partner.com
```

## Metrics

- `outbound_call_duration_ms` - Call duration histogram
- `outbound_call_total` - Total calls counter
- `outbound_retry_total` - Retry attempts counter
- `outbound_circuit_breaker_state` - Circuit breaker state gauge

## Running

```bash
mvn quarkus:dev
```

## See Also

- [Backend Service Requirements](../../docs/implementation/11-backend-service-requirements.md)
- [Architecture V7 - Outbound](../../docs/architecture/architecture-v7-outbound.md)
