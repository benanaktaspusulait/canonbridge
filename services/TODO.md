# Services TODO

## 🚧 Remaining Services (MVP)

### 1. business-consumer-service
**Priority**: High  
**Estimated**: 2-3 days

- [ ] Kafka consumer for canonical events
- [ ] Idempotency check (event_id deduplication)
- [ ] Business domain tables
- [ ] Transactional outbox writes
- [ ] Manual offset commit
- [ ] Ordering guarantees per entity

### 2. outbox-publisher
**Priority**: High  
**Estimated**: 1-2 days

- [ ] Poll outbox table for unpublished rows
- [ ] Reactive Kafka producer
- [ ] Mark rows as published
- [ ] Retry logic with exponential backoff
- [ ] Ordering preservation

### 3. credential-store
**Priority**: High (for outbound flows)  
**Estimated**: 2-3 days

- [ ] Encrypted credential storage (envelope encryption)
- [ ] Write-only secret fields
- [ ] Metadata-only reads
- [ ] Credential rotation
- [ ] OAuth2 token caching
- [ ] Audit logging

---

## 🔧 Integration Tasks

- [ ] Connect transformer-service to mapping-studio-api for config loading
- [ ] Connect transformer-service to outbound-call-manager for enrichment
- [ ] Connect webhook-receiver to transformer-service via Kafka
- [ ] Connect business-consumer to outbox-publisher
- [ ] End-to-end integration tests

---

## 📋 Database Migrations

- [x] Partners table
- [x] Mapping drafts table
- [x] Mapping versions table
- [x] Outbound connections table
- [x] Call history table
- [ ] Webhook endpoints table
- [ ] Credentials table
- [ ] Outbox table
- [ ] Business domain tables
- [ ] Idempotency table

---

## 🔒 Security

- [x] SSRF protection
- [x] Webhook authentication
- [x] Multi-tenancy headers
- [ ] OIDC/OAuth2 integration
- [ ] RBAC implementation
- [ ] Credential encryption
- [ ] PII masking in logs

---

## 📊 Observability

- [x] Structured JSON logging
- [x] Prometheus metrics endpoints
- [x] Health checks (liveness + readiness)
- [ ] Distributed tracing (Jaeger)
- [ ] Grafana dashboards
- [ ] Alert rules

---

## 🧪 Testing

- [ ] Unit tests for all services
- [ ] Integration tests
- [ ] Contract tests
- [ ] Load tests (k6)
- [ ] Chaos engineering tests

---

## 📚 Documentation

- [x] Service READMEs
- [x] Architecture alignment
- [ ] API documentation (complete)
- [ ] Deployment guides
- [ ] Runbooks

---

## Estimated Time to MVP: 2-3 weeks
