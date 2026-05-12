# Services Status

**Last Updated**: May 12, 2026

## Progress: 5/7 services (71%)

---

## ✅ Completed

### 1. mapping-studio-api (Port 8080)
- Full reactive (Vert.x + Mutiny)
- Partner, MappingDraft, MappingVersion management
- Flyway migrations, OpenAPI, health checks
- **Files**: 15+ | **Code**: ~2000 lines

### 2. outbound-call-manager (Port 8081)
- Reactive HTTP client with fault tolerance
- SSRF protection, circuit breaker, retry
- REST/SOAP support, call history
- **Files**: 10+ | **Code**: ~1500 lines

### 3. webhook-receiver (Port 8082)
- Webhook ingestion with authentication
- Kafka producer, event envelope
- **Files**: 8+ | **Code**: ~800 lines

### 4. transformer-service (Port 3000)
- Existing Node.js/TypeScript implementation
- JSONata transformation, Ajv validation
- Kafka consumer/producer, worker pool

### 5. canonbridge-mock (Port 8080)
- Spring Boot mock infrastructure
- PayFlex, FastCargo, ShopMax mocks
- Complete demo scripts and documentation
- **Files**: 40+ | **Code**: ~3000 lines

---

## 🚧 Remaining (MVP)

### 6. business-consumer-service
- Canonical event processing
- Idempotency, ordering, outbox writes
- **Estimated**: 2-3 days

### 7. outbox-publisher
- Outbox polling and publishing
- Retry logic, ordering preservation
- **Estimated**: 1-2 days

### 8. credential-store (Optional for MVP)
- Encrypted credential storage
- OAuth2 token caching
- **Estimated**: 2-3 days

---

## 🎯 What Works Now

✅ Mapping management (drafts, versions, partners)  
✅ Outbound API calls with security  
✅ Webhook ingestion  
✅ Event transformation  
✅ Complete mock infrastructure  

## 🚧 What's Missing

❌ Business event processing  
❌ Reliable event publishing (outbox)  
❌ Secure credential management  

---

**See**: [TODO.md](./TODO.md) for detailed task breakdown
