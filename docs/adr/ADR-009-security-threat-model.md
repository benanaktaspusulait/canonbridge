# ADR-009: Security Threat Model and Control Selection

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team, Security Team

---

## Context

CanonBridge processes partner integration data for multiple tenants. The platform has several distinct attack surfaces:

1. **User-authored JSONata mappings** — untrusted code executing in the transformation engine
2. **Partner payloads** — untrusted external data entering the pipeline
3. **Multi-tenant data isolation** — one tenant must never access another's data
4. **Mapping Studio UI** — web-based tool with privileged publish/rollback capabilities
5. **Admin APIs** — cache invalidation, worker management
6. **Kafka topics** — should not be readable by unauthorized consumers
7. **Database** — must enforce tenant isolation at query level
8. **PII in transit and at rest** — partner payloads may contain sensitive personal data

This ADR documents the threat model and the control selection rationale.

---

## Threat Model

### T1: Malicious JSONata Mapping

**Threat:** A mapping author embeds a JSONata expression that attempts to exfiltrate data, cause infinite loops, or consume excessive CPU.

**Attack vectors:**
- Recursive JSONata that causes stack overflow
- Time complexity attacks (O(n²) expressions on large arrays)
- Attempts to call built-in JavaScript functions via JSONata extensions

**Controls:**
- Execution timeout enforced (default 500ms) — halts infinite loops
- CPU time limit per worker thread
- JSONata engine configured with no custom function registration that allows I/O
- Mapping must pass validation before publish
- Peer review required before activation (RBAC: publisher ≠ approver in regulated tenants)

### T2: Poison Pill Partner Payload

**Threat:** A malformed or adversarially crafted partner payload causes the transformer to crash, block processing, or expose internal state.

**Attack vectors:**
- Deeply nested JSON causing stack overflow in parser
- Very large payloads causing OOM
- JSON with NaN/Infinity values causing downstream corruption
- Payloads designed to trigger quadratic behavior in schema validators

**Controls:**
- Payload size limit enforced at ingestion (configurable, default 5MB)
- Envelope validation before transformation — invalid envelope goes directly to DLQ without processing
- JSON parse errors: message sent to DLQ, offset committed, processing continues
- Ajv schema validation catches type violations before business layer

### T3: Cross-Tenant Data Leakage

**Threat:** A bug or misconfiguration allows tenant A to read or write tenant B's data.

**Attack vectors:**
- Missing tenant filter in database query
- Shared Kafka topic with incorrect partition key
- Cached mapping returned for wrong tenant
- Worker thread retaining state from previous tenant's processing

**Controls:**
- `tenant_id` is a required, validated field on every event envelope
- Database queries enforce `WHERE tenant_id = $tenantId` at repository layer
- Kafka topic naming includes tenant identifier
- Mapping cache keys include `tenantId + partnerId + eventType`
- Worker threads are stateless — no cross-message state retained

### T4: Unauthorized Mapping Publish / Rollback

**Threat:** An attacker or unauthorized user publishes a malicious mapping version or rolls back to a vulnerable one.

**Controls:**
- RBAC enforced on every Mapping Studio action
- Publish requires `mapping:version:publish` permission
- Rollback requires `mapping:version:rollback` permission (separate from publish)
- Approval requires a different user from the author (four-eyes principle)
- Every action recorded in immutable audit trail with user ID, timestamp, IP

### T5: PII Exposure in Logs

**Threat:** Partner payloads containing PII (names, emails, tax IDs, account numbers) are logged and exposed to log aggregation systems.

**Controls:**
- Full payloads never logged — only envelope metadata (event ID, type, tenant, partner, size)
- PII fields masked in log output by configurable masking rules per tenant
- Mapping Studio preview UI masks PII fields in sample payload display
- DLQ payload access restricted to users with `dlq:payload:read` permission
- Audit log when DLQ payload is accessed

### T6: Secret Exposure

**Threat:** API keys, database credentials, or encryption keys are exposed in logs, error messages, or Git.

**Controls:**
- All secrets stored in managed secret store (Vault, Kubernetes Secrets, AWS Secrets Manager)
- No secrets in environment files committed to Git
- Secret values never appear in log output (redacted by log masking layer)
- Kafka credentials use mTLS — no shared passwords
- Database credentials rotated on schedule

---

## Security Controls Matrix

| Control | Technology | Scope |
|---|---|---|
| Transport encryption | mTLS | All service-to-service communication |
| Auth | OAuth 2.0 / OIDC | Mapping Studio, admin APIs |
| Authorization | RBAC (per-permission) | All Mapping Studio actions |
| Tenant isolation | Query-level enforcement | All database operations |
| Payload size limits | Ingress middleware | All Kafka messages |
| Execution timeout | Worker thread timer | JSONata execution |
| PII masking | Log middleware | All log output |
| Payload encryption at rest | AES-256 | DLQ payloads, sample payloads |
| Audit trail | Immutable audit table | All Mapping Studio actions |
| Secret management | Kubernetes Secrets / Vault | All credentials |
| Input validation | Ajv JSON Schema | All canonical events |
| DLQ access control | RBAC | DLQ payload access |

---

## Compliance Considerations

### GDPR
- Tenant-configurable payload retention (right to erasure)
- PII masking in logs (data minimization)
- Audit trail of who accessed PII data
- Data residency configurable at tenant level (Kafka topic + DB partition strategy)

### SOC 2
- Audit trail for all privileged operations
- RBAC with least-privilege principle
- Encryption in transit and at rest
- Access logs for all API calls

### OWASP Top 10 Relevance
| OWASP | Relevance | Control |
|---|---|---|
| A01 Broken Access Control | High — mapping publish/rollback | RBAC + audit |
| A02 Cryptographic Failures | High — PII payloads | Encryption at rest + TLS |
| A03 Injection | Medium — JSONata expressions | Sandboxed execution + timeout |
| A04 Insecure Design | Mitigated by this ADR | Threat modeling |
| A05 Security Misconfiguration | Medium — Kafka, K8s | Hardened defaults + IaC |
| A07 Auth Failures | High — Mapping Studio | OAuth 2.0 + RBAC |
| A09 Logging Failures | High — PII in logs | Masking layer |
