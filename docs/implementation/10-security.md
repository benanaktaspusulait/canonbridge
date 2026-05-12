# Security

## Purpose

Security controls protect tenant data, partner payloads, mapping configuration, credentials, and production publish workflows. This document defines controls, rationale, and implementation requirements.

For the threat model and control selection rationale, see [ADR-009](../adr/ADR-009-security-threat-model.md).

---

## Baseline Controls

| Control | Requirement | Implementation |
|---|---|---|
| Transport encryption | TLS 1.2+ for all service-to-service | Istio mTLS or explicit TLS per service |
| Secret management | No secrets in Git or env files | Kubernetes Secrets / HashiCorp Vault |
| Tenant isolation | Enforced at every API and DB query | `tenant_id` required on all queries |
| Payload encryption at rest | AES-256 for DLQ and sample payloads | Envelope encryption per tenant key |
| Audit trail | Every privileged action logged | Immutable `audit_log` table |
| PII masking | No full payloads in logs | Log middleware with field masking |
| RBAC | Role-based permissions on all Mapping Studio actions | JWT claims + permission enforcement |

---

## Authentication

### Mapping Studio / API

- **Protocol**: OAuth 2.0 with OIDC (OpenID Connect)
- **Token format**: JWT (RS256)
- **Token lifetime**: Access token 15 minutes, refresh token 8 hours
- **Claims required**: `sub`, `tenant_id`, `roles[]`, `iat`, `exp`
- **Verification**: Public key from OIDC discovery endpoint, validated on every request

### Service-to-Service

- **Protocol**: mTLS (mutual TLS)
- **Certificate rotation**: Automated via cert-manager (Kubernetes)
- **Certificate authority**: Internal CA per environment
- **No shared passwords**: All service auth via certificates

### Kafka

- **Protocol**: SASL/SSL with per-service client certificates
- **ACLs**: Each service has read/write ACL for its specific topics only
- **Transformer**: READ on `raw.*`, WRITE on `canonical.*`, WRITE on `*.dlq`, WRITE on `*.retry.*`
- **Business service**: READ on `canonical.*`, WRITE on `business.*`
- **No wildcard ACLs in production**

---

## Authorization (RBAC)

### Roles

| Role | Description |
|---|---|
| `integration_author` | Create and edit mapping drafts |
| `integration_reviewer` | Approve drafts for publish |
| `integration_publisher` | Publish approved versions |
| `integration_operator` | Activate, rollback, view audit |
| `dlq_analyst` | Access DLQ payload content |
| `tenant_admin` | Manage tenant configuration and users |
| `platform_admin` | Cross-tenant platform management |

### Permission Matrix

| Permission | author | reviewer | publisher | operator | dlq_analyst | tenant_admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `mapping:draft:create` | ✓ | | | | | |
| `mapping:draft:update` | ✓ | | | | | |
| `mapping:draft:validate` | ✓ | ✓ | | | | |
| `mapping:review:approve` | | ✓ | | | | |
| `mapping:version:publish` | | | ✓ | | | |
| `mapping:version:activate` | | | | ✓ | | |
| `mapping:version:rollback` | | | | ✓ | | |
| `mapping:audit:read` | | | | ✓ | | ✓ |
| `dlq:payload:read` | | | | | ✓ | |
| `partner:manage` | | | | | | ✓ |
| `tenant:config:update` | | | | | | ✓ |

**Four-eyes principle**: For regulated tenants, `mapping:version:publish` requires `approved_by ≠ created_by`. Enforced at API level.

---

## Tenant Isolation

Tenant isolation is a hard requirement. One tenant must never access another's data.

### Enforcement Layers

**Layer 1: API gateway**
- JWT `tenant_id` claim extracted and bound to request context
- All downstream requests carry `tenant_id` in internal headers
- No API endpoint accepts a `tenant_id` parameter from the user — it comes from the token only

**Layer 2: Database queries**
- Every query includes `WHERE tenant_id = $tenantId`
- Repository layer enforces this — no raw SQL bypasses allowed
- Integration tests verify cross-tenant isolation

**Layer 3: Kafka**
- Topic naming: `{tenant_id}.{event_type}.{stage}` (or per-tenant topic prefix)
- Consumer group ACLs restricted per tenant
- Message envelope validates `tenantId` before processing

**Layer 4: Mapping cache**
- Cache keys include `tenantId`: `{tenantId}:{partnerId}:{eventType}:{version}`
- Cache miss with wrong tenant returns no data (not another tenant's mapping)

**Isolation test requirement:**
Before every release, automated tests must verify:
- `GET /mappings` for tenant-A token returns only tenant-A mappings
- `GET /mappings/{tenant-B-mapping-id}` with tenant-A token returns 403
- Kafka consumer for tenant-A cannot read tenant-B topic

---

## PII Handling

### Masking Policy

PII masking is configured per event type. Masking rules are defined in the mapping definition and applied by:
- Log middleware (transformer and business service)
- Mapping Studio UI (sample payload preview)
- DLQ payload display

```typescript
// Example masking configuration
const maskingRules: MaskingRule[] = [
  { path: "$.payload.customerEmail",    strategy: "EMAIL_MASK" },   // john@example.com → j***@example.com
  { path: "$.payload.phoneNumber",      strategy: "PARTIAL_MASK" }, // 555-1234-5678 → ***-***-5678
  { path: "$.payload.nationalId",       strategy: "FULL_REDACT" },  // → [REDACTED]
  { path: "$.payload.creditCardNumber", strategy: "LAST_FOUR" },    // → ****1234
  { path: "$.payload.address",          strategy: "PARTIAL_MASK" }  // partial visible
];
```

### What is Never Logged

- Full partner payloads
- Any field matching masking rules
- Kafka message values (only metadata: offset, partition, topic, size)
- JWT tokens or any authentication credentials
- Database connection strings

### DLQ Payload Access

DLQ payloads contain the original failed message, which may include PII. Access is controlled:
- Requires `dlq:payload:read` permission
- Access is logged in audit trail (who, when, which event, IP)
- Payload display in Mapping Studio UI is masked per masking rules
- Export of DLQ payloads requires additional approval for regulated tenants

---

## JSONata Sandbox

User-authored JSONata expressions execute in the transformation engine. These are treated as untrusted input.

### Sandbox Controls

| Control | Implementation |
|---|---|
| Execution timeout | 500ms default, configurable 100ms–2000ms per tenant |
| CPU time limit | Worker thread receives SIGALRM at timeout |
| Memory limit | Worker thread memory bounded by Node.js `--max-old-space-size` |
| No I/O access | JSONata engine has no built-in I/O — no custom I/O functions registered |
| No network access | Worker threads run without network module access |
| No secret access | Environment variables not exposed to worker thread execution context |
| No `require()`/`import` | Worker thread does not expose module loading to JSONata context |

### Mapping Validation Before Publish

Before a mapping can be published:
1. JSONata expression must parse without syntax errors
2. Expression must execute against at least one sample payload within timeout
3. Output must pass canonical schema validation
4. Reviewer must approve (author cannot self-approve)

---

## Encryption

### In Transit

- All HTTP: TLS 1.2+ with strong cipher suites (no RC4, no 3DES)
- Kafka: TLS 1.2+ with certificate-based auth
- Database: TLS 1.2+ with certificate verification
- Internal service mesh (if Istio): mTLS transparent to applications

### At Rest

| Data | Encryption | Key Management |
|---|---|---|
| DLQ payloads | AES-256-GCM | Per-tenant key in Vault/KMS |
| Sample payloads (Mapping Studio) | AES-256-GCM | Per-tenant key |
| Audit logs | Database encryption | Platform-level key |
| Database (full disk) | LUKS or cloud provider disk encryption | Provider-managed |
| Kafka topics (sensitive tenants) | Payload-level envelope encryption | Per-tenant key |

### Key Rotation

- Per-tenant encryption keys rotated annually (or on suspected compromise)
- Key rotation does not require payload re-encryption — envelope encryption supports key versioning
- Old key versions retained for decryption of historical data; new key version used for new writes

---

## Secret Management

### Prohibited

- No secrets in Git (`.env` files, `application.properties` with credentials, hardcoded values)
- No secrets in container images
- No secrets in Kubernetes ConfigMaps (use Secrets)
- No secrets in log output

### Required

All secrets managed via:
- **Development**: Kubernetes Secrets (base64, not encrypted at rest by default — use sealed-secrets or external-secrets)
- **Production**: HashiCorp Vault or cloud KMS (AWS Secrets Manager, GCP Secret Manager)
- **Rotation**: Automated rotation for database credentials (90-day max TTL)
- **Audit**: All secret access logged in Vault audit log

---

## Network Security

### Kubernetes Network Policy

```yaml
# Transformer service: only allow traffic from Kafka brokers and internal admin
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: transformer-ingress
spec:
  podSelector:
    matchLabels:
      app: transformer
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: prometheus   # metrics scraping
  - ports:
    - port: 8080            # health/metrics only
```

### Egress

- Transformer service: outbound to Kafka only
- Business service: outbound to Kafka + PostgreSQL only
- Mapping Studio API: outbound to PostgreSQL + Mapping cache
- No egress to public internet from any service

---

## Security Monitoring

| Signal | Alert Condition | Response |
|---|---|---|
| Failed authentication | > 10 failures in 60s for same user | Lock account, alert security team |
| Unauthorized access attempt (403) | > 5 in 60s from same IP | Rate limit, investigate |
| Cross-tenant access attempt | Any attempt | Immediate alert, incident |
| DLQ payload access | Any access | Log, review for anomalies |
| Secret rotation failure | Any failure | Alert, manual intervention |
| mTLS certificate expiry | < 7 days remaining | Rotate certificate |

---

## Security Checklist (Pre-Production)

+ [x] mTLS enabled for all service-to-service communication
+ [x] Kafka ACLs configured — no wildcard permissions
+ [x] Database: TLS enabled, no superuser credentials in application
+ [x] All secrets in Vault/KMS — no plaintext in Git or ConfigMaps
+ [x] Network policies applied — services can only reach their dependencies
+ [x] PII masking rules defined and tested for each event type
+ [x] DLQ payload access restricted to `dlq_analyst` role
+ [x] Audit log table is append-only (no UPDATE/DELETE permissions for application user)
+ [x] JSONata execution timeout configured and tested
+ [x] Tenant isolation integration tests passing
+ [x] RBAC permission matrix validated — no privilege escalation paths
+ [x] Certificate rotation automation tested (cert-manager)
+ [x] Encryption at rest confirmed for DLQ and sample payloads

---

## See Also

- [ADR-009: Security Threat Model](../adr/ADR-009-security-threat-model.md)
- [SaaS Requirements](../product/saas-requirements.md)
- [Logging and Masking](./08-logging-masking.md)
- [Data Governance](../governance/01-data-governance.md)
- [Mapping Studio API](../product/03-mapping-studio-api-data-model.md)
