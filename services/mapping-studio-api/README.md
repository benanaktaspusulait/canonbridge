# Mapping Studio API

Full reactive Quarkus service for managing mapping drafts, versions, partners, and configuration.

## Technology Stack

- **Quarkus 3.8.1** - Reactive Java framework
- **Vert.x** - Reactive runtime
- **Reactive PostgreSQL Client** - Non-blocking database access
- **Mutiny** - Reactive programming library
- **Flyway** - Database migrations
- **OpenAPI/Swagger** - API documentation

## Architecture

This service is fully reactive using:
- `io.smallrye.mutiny.Uni` for async operations
- Vert.x PgPool for reactive PostgreSQL access
- No JPA/Hibernate/Panache - direct SQL with reactive client
- RESTEasy Reactive for non-blocking HTTP

## Database Schema

### Tables
- `partners` - Partner organizations
- `mapping_drafts` - Work-in-progress mappings
- `mapping_versions` - Immutable published versions

## API Endpoints

### Partners
- `GET /api/partners` - List all partners
- `GET /api/partners/{id}` - Get partner by ID
- `GET /api/partners/external/{externalId}` - Get by external ID
- `POST /api/partners` - Create partner
- `PUT /api/partners/{id}` - Update partner
- `DELETE /api/partners/{id}` - Delete partner

### Mapping Drafts
- `GET /api/mapping-drafts` - List all drafts
- `GET /api/mapping-drafts/partner/{partnerId}` - List by partner
- `GET /api/mapping-drafts/{id}` - Get draft by ID
- `POST /api/mapping-drafts` - Create draft
- `PUT /api/mapping-drafts/{id}` - Update draft
- `DELETE /api/mapping-drafts/{id}` - Delete draft

### Mapping Versions
- `GET /api/mapping-versions` - List all versions
- `GET /api/mapping-versions/partner/{partnerId}` - List by partner
- `GET /api/mapping-versions/{id}` - Get version by ID
- `GET /api/mapping-versions/active/{partnerId}/{eventType}` - Get active version
- `POST /api/mapping-versions/{id}/deprecate` - Deprecate version

### Schemas
- `GET /api/schemas` - List all schemas
- `GET /api/schemas/type/{schemaType}` - List by schema type
- `GET /api/schemas/subject/{subject}` - List versions by subject
- `GET /api/schemas/subject/{subject}/latest` - Get latest active schema
- `GET /api/schemas/{id}` - Get schema by ID
- `POST /api/schemas` - Create schema
- `PUT /api/schemas/{id}` - Update schema
- `DELETE /api/schemas/{id}` - Delete schema

### External Systems
- `GET /api/external-systems` - List all external system connections
- `GET /api/external-systems/draft/{draftId}` - List connections by mapping draft
- `GET /api/external-systems/{connectionId}` - Get connection by ID
- `POST /api/external-systems` - Create connection
- `PUT /api/external-systems/{connectionId}` - Update connection
- `POST /api/external-systems/{connectionId}/test` - Execute a test HTTP request using the linked credential
- `DELETE /api/external-systems/{connectionId}` - Delete connection

### Runtime Operations
- `POST /api/rest-inbound/{draftId}` - Validate, transform, and publish inbound REST payloads
- `POST /api/mapping-drafts/{id}/batch/ingest` - Ingest normalized file/batch rows and publish canonical events
- `POST /api/mapping-drafts/{id}/batch/sessions` - Create a chunked upload session for large files
- `POST /api/mapping-drafts/{id}/batch/sessions/{sessionId}/chunks` - Upload or replace one rows/records chunk
- `GET /api/mapping-drafts/{id}/batch/sessions` - List chunked upload sessions
- `GET /api/mapping-drafts/{id}/batch/sessions/{sessionId}` - Get chunked upload progress and chunk metadata
- `POST /api/mapping-drafts/{id}/batch/sessions/{sessionId}/complete` - Assemble uploaded chunks and run the batch job
- `POST /api/mapping-drafts/{id}/batch/sessions/{sessionId}/cancel` - Cancel an open or failed upload session
- `GET /api/mapping-drafts/{id}/batch/jobs` - List batch jobs for a mapping
- `GET /api/mapping-drafts/{id}/batch/jobs/{jobId}` - Get batch job detail and row-level results
- `POST /api/mapping-drafts/{id}/batch/jobs/{jobId}/retry` - Retry all original rows from a batch job
- `POST /api/mapping-drafts/{id}/batch/jobs/{jobId}/redrive` - Redrive only failed rows from a batch job
- `GET /api/mapping-drafts/{id}/scheduled-runs/status` - Get scheduled API polling state and next-run contract
- `GET /api/mapping-drafts/{id}/scheduled-runs/history` - List scheduled API run history
- `GET /api/mapping-drafts/{id}/scheduled-runs/history/{runId}` - Get scheduled API run detail
- `GET /api/outbox/events` - List canonical publish outbox events
- `GET /api/outbox/stats` - Get outbox status counts
- `POST /api/outbox/replay` - Manually trigger replay for due outbox records

### Credentials
- `GET /api/credentials` - List credential metadata
- `GET /api/credentials/{credentialId}` - Get credential metadata by ID
- `POST /api/credentials` - Create credential with write-only secret
- `POST /api/credentials/{credentialId}/disable` - Disable credential

Credential secret payloads are write-only. Supported `secret` shapes:
- `API_KEY`: `{"apiKey":"...", "headerName":"X-API-Key"}`
- `BASIC_AUTH`: `{"username":"...", "password":"..."}`
- `BEARER_TOKEN`: `{"token":"..."}`
- `OAUTH2_CLIENT_CREDENTIALS`: `{"tokenUrl":"...", "clientId":"...", "clientSecret":"...", "scope":"optional"}`

### Health & Observability
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /metrics` - Prometheus metrics
- `GET /openapi` - OpenAPI spec
- `GET /swagger-ui` - Swagger UI

## Configuration

Required environment variables:

```bash
DB_URL=postgresql://localhost:5432/canonbridge
JDBC_DB_URL=jdbc:postgresql://localhost:5432/canonbridge
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_URL=redis://localhost:6379
CANONBRIDGE_API_KEYS=replace-with-a-strong-api-key
CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY=base64-encoded-32-byte-key
OIDC_ENABLED=true
OIDC_SERVER_URL=https://idp.example.com/realms/canonbridge
OIDC_CLIENT_ID=mapping-studio
OIDC_CLIENT_SECRET=replace-with-idp-client-secret
CORS_ALLOWED_ORIGINS=https://app.example.com
CANONBRIDGE_LOCAL_LOGIN_ENABLED=false
CANONBRIDGE_LOCAL_JWT_ENABLED=false
OUTBOX_REPLAY_ENABLED=true
```

Development defaults include `CANONBRIDGE_API_KEYS=dev-api-key`. Override this value outside local development.
Credential secrets use AES-256-GCM and require a base64-encoded 32-byte key in `CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY` outside local development.
Production startup fails closed when insecure defaults are detected. By default production requires OIDC, HTTPS IdP metadata, explicit CORS origins, non-default API/JWT/credential secrets, disabled bearer API-key compatibility, and disabled local login unless explicitly allowed.

### Rate Limiting Configuration

The API enforces rate limits to prevent abuse and ensure fair resource allocation:

```bash
# Enable/disable rate limiting (default: true)
RATELIMIT_ENABLED=true

# Authenticated endpoint limits (default: 100 requests per 60 seconds)
RATELIMIT_AUTHENTICATED_DEFAULT_LIMIT=100
RATELIMIT_AUTHENTICATED_WINDOW_SECONDS=60

# Unauthenticated endpoint limits (default: 10 requests per 60 seconds per IP)
RATELIMIT_UNAUTHENTICATED_DEFAULT_LIMIT=10
RATELIMIT_UNAUTHENTICATED_WINDOW_SECONDS=60

# Redis configuration for rate limit state
REDIS_URL=redis://localhost:6379
```

**Rate Limiting Behavior:**

- **Authenticated requests**: Rate limited per client identifier (JWT subject or API key)
  - Default: 100 requests per minute
  - Per-tenant overrides supported via `rate_limit_per_minute` column in `partners` table
  
- **Unauthenticated requests**: Rate limited per IP address
  - Default: 10 requests per minute
  - Uses `X-Forwarded-For` header for proxied requests

- **Algorithm**: Sliding window using Redis sorted sets
  - Prevents burst traffic at window boundaries
  - Automatic cleanup via TTL

- **Excluded endpoints**: Health, metrics, OpenAPI, and Swagger UI are not rate limited

**Rate Limit Headers:**

All API responses include rate limit information:

```
X-RateLimit-Limit: 100          # Maximum requests allowed in window
X-RateLimit-Remaining: 95       # Requests remaining in current window
X-RateLimit-Reset: 1704067200000 # Unix timestamp (ms) when limit resets
```

**Rate Limit Exceeded Response:**

When the rate limit is exceeded, the API returns HTTP 429:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Maximum 100 requests per 60 seconds allowed.",
  "limit": 100,
  "window_seconds": 60,
  "retry_after_seconds": 45
}
```

Headers:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200000
```

**Per-Tenant Rate Limit Overrides:**

Set custom rate limits for specific tenants by updating the `partners` table:

```sql
UPDATE partners 
SET rate_limit_per_minute = 500 
WHERE tenant_id = 'premium-tenant';
```

Set to `NULL` to use the default limit.

**Logging:**

Rate limit violations are logged at WARN level:

```
WARN Rate limit exceeded for client premium-api-key: 101/100 requests in 60s window
```

### Graceful Shutdown Configuration

The API supports graceful shutdown for clean deployments with zero data loss:

```bash
# Maximum time to wait for in-flight requests to complete (default: 30s, min: 10s, max: 60s)
SHUTDOWN_DRAIN_TIMEOUT=30

# Maximum time to wait for Kafka producer flush (default: 10s)
SHUTDOWN_PRODUCER_FLUSH_TIMEOUT=10
```

**Kubernetes Configuration:**

Ensure `terminationGracePeriodSeconds` exceeds the total shutdown time (drain + flush + 5s buffer):

```yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 45  # drain(30) + flush(10) + buffer(5)
      containers:
      - name: mapping-studio-api
        env:
        - name: SHUTDOWN_DRAIN_TIMEOUT
          value: "30"
        - name: SHUTDOWN_PRODUCER_FLUSH_TIMEOUT
          value: "10"
```

## Running Locally

### Development Mode
```bash
mvn quarkus:dev
```

### Build
```bash
mvn clean package
```

### Run
```bash
java -jar target/quarkus-app/quarkus-run.jar
```

### Docker
```bash
docker build -t mapping-studio-api .
docker run -p 8080:8080 \
  -e DB_URL=postgresql://host.docker.internal:5432/canonbridge \
  -e JDBC_DB_URL=jdbc:postgresql://host.docker.internal:5432/canonbridge \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e CANONBRIDGE_API_KEYS=replace-with-a-strong-api-key \
  mapping-studio-api
```

## Authentication

All `/api/*` endpoints require API credentials. Send either:

```bash
X-API-Key: dev-api-key
```

or:

```bash
Authorization: Bearer dev-api-key
```

Example:

```bash
curl http://localhost:8080/api/partners \
  -H 'X-Tenant-Id: demo-tenant' \
  -H 'X-API-Key: dev-api-key'
```

Unauthenticated requests return a consistent JSON error:

```json
{
  "error": "missing_credentials",
  "message": "Missing API credentials"
}
```

## Multi-tenancy

All requests require `X-Tenant-Id` header for tenant isolation.

Optional headers:
- `X-User-Id` - User identifier for audit trails
- `X-Correlation-Id` - Request correlation for distributed tracing

## Testing

```bash
mvn test
```

## Graceful Shutdown Behavior

The Mapping Studio API implements graceful shutdown to ensure clean deployments with zero data loss.

### Shutdown Sequence

When the API receives a `SIGTERM` or `SIGINT` signal (e.g., during Kubernetes pod termination):

1. **Readiness Probe Fails** - The `/health/ready` endpoint immediately returns `DOWN` status, causing Kubernetes to stop routing new traffic to the pod
2. **New Requests Rejected** - All new HTTP requests (except health checks) receive `503 Service Unavailable`
3. **Kafka Consumption Paused** - Kafka consumers stop polling for new messages (if applicable)
4. **In-Flight Request Drain** - The service waits for active HTTP requests to complete within the configured timeout (default: 30s)
5. **Kafka Producer Flush** - Any pending Kafka messages are flushed to ensure delivery (if applicable)
6. **Database Connections Closed** - PostgreSQL connection pool is gracefully closed
7. **Clean Exit** - The service logs shutdown completion and exits with status code 0

### Monitoring Shutdown

Check the current service status:

```bash
curl http://localhost:8080/health/status
```

Response during normal operation:
```json
{
  "ready": true,
  "shuttingDown": false,
  "inFlightRequests": 3
}
```

Response during shutdown:
```json
{
  "ready": false,
  "shuttingDown": true,
  "inFlightRequests": 1
}
```

### Shutdown Logs

The service logs detailed shutdown progress:

```
INFO  Mapping Studio API started - graceful shutdown manager initialized
INFO  Shutdown configuration: drain-timeout=30s, producer-flush-timeout=10s
...
INFO  === Graceful shutdown initiated ===
INFO  Step 1: Marking readiness probe as failing
INFO  Step 2: Stopped accepting new HTTP requests (will return 503)
INFO  Step 3: Kafka consumption pause (not applicable - no Kafka consumer)
INFO  Step 4: Waiting for 5 in-flight requests to complete (timeout: 30s)
INFO  All in-flight requests completed in 2341ms
INFO  Step 5: Kafka producer flush (not applicable - no Kafka producer)
INFO  Step 6: Closing database connection pools
INFO  Database connection pool closed successfully
INFO  === Graceful shutdown completed in 2456ms ===
```

### Interrupted Requests

If the drain timeout expires before all requests complete, the service logs the count of interrupted requests:

```
WARN  Drain timeout expired after 30000ms - 2 requests interrupted
```

These interrupted requests may result in:
- Client-side connection errors
- Incomplete transactions (rolled back by the database)
- Retry attempts from clients (ensure idempotency)

### Testing Graceful Shutdown

Test shutdown behavior locally:

```bash
# Start the service
mvn quarkus:dev

# In another terminal, send some requests
for i in {1..10}; do
  curl http://localhost:8080/api/partners \
    -H 'X-Tenant-Id: demo-tenant' \
    -H 'X-API-Key: dev-api-key' &
done

# Trigger shutdown
kill -SIGTERM $(pgrep -f quarkus)

# Observe shutdown logs and verify clean exit
```

### Best Practices

1. **Set Appropriate Timeouts** - Ensure drain timeout exceeds your longest expected request duration
2. **Monitor In-Flight Requests** - Use the `/health/status` endpoint to track active requests
3. **Configure Kubernetes Properly** - Set `terminationGracePeriodSeconds` to drain timeout + 15s buffer
4. **Implement Idempotency** - Clients should safely retry interrupted requests
5. **Test Under Load** - Verify shutdown behavior during load testing to ensure no data loss

## See Also

- [Backend Service Requirements](../../docs/implementation/11-backend-service-requirements.md)
- [Architecture Overview](../../docs/architecture/01-overview.md)
