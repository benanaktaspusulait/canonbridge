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
DB_USERNAME=postgres
DB_PASSWORD=postgres
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
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  mapping-studio-api
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

## See Also

- [Backend Service Requirements](../../docs/implementation/11-backend-service-requirements.md)
- [Architecture Overview](../../docs/architecture/01-overview.md)
