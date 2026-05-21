# Production Readiness Checklist

## Purpose

This checklist must be completed before any production deployment. It covers reliability, security, observability, operations, and team readiness.

Inspired by Google's Production Readiness Review (PRR) model, adapted for CanonBridge.

---

## How to Use

- Complete each section before the first production deployment
- Re-run sections marked **[Re-run on change]** when relevant components change
- Attach completed checklist to the deployment PR
- Unresolved items are tracked as GitHub issues before go-live

---

## 1. Architecture and Design

- [ ] Architecture review completed by senior engineer or architect
- [ ] All major decisions documented in ADRs (`docs/adr/`)
- [ ] Failure modes documented for each component (`docs/operations/09-failure-scenarios.md`)
- [ ] Data flow diagram reviewed — no unaccounted data paths
- [ ] Tenant isolation design reviewed — cross-tenant leak scenarios covered
- [ ] Capacity estimate completed for first 90 days (see section 9)

---

## 2. Reliability

### Kafka

- [ ] Replication factor: ≥ 3 for all production topics
- [ ] `min.insync.replicas`: ≥ 2
- [ ] Topic retention configured per data class (raw: 7 days, canonical: 30 days)
- [ ] Dead letter topic exists for every consumer topic
- [ ] Retry topics created: `*.retry.1m`, `*.retry.5m`, `*.retry.30m`
- [ ] Consumer group offsets initialized (no cold-start offset gap)

### Transformer Service

- [ ] Worker pool size configured (`workerCount` = vCPUs - 1)
- [ ] Execution timeout configured (default 500ms)
- [ ] Manual offset commit confirmed — auto-commit disabled
- [ ] Graceful shutdown tested: SIGTERM drains in-flight, exits in < 30s
- [ ] `terminationGracePeriodSeconds: 30` set in Kubernetes deployment
- [ ] Liveness probe configured (fails if Kafka connection lost for > 2 min)
- [ ] Readiness probe configured (fails until mapping cache warmed)

### Business Service

- [ ] Idempotency table (`processed_events`) created with correct unique index
- [ ] Outbox table created with correct indexes
- [ ] Outbox publisher configured and tested
- [ ] DB connection pool sized correctly (min: 5, max: 20, configurable)
- [ ] Transaction isolation level correct (READ COMMITTED minimum)
- [ ] Dependency ordering logic tested for out-of-order events

### Database

- [ ] Connection pooling enabled (PgBouncer or application-level)
- [ ] Slow query log enabled (threshold: 100ms)
- [ ] WAL archiving enabled (required for PITR)
- [ ] Backup schedule configured (daily full + continuous WAL)
- [ ] Backup restoration tested (last test date: _____)
- [ ] Replication configured for HA (primary + 1 replica minimum)
- [ ] Failover tested (automatic failover time measured: _____ seconds)

---

## 3. Security **[Re-run on change]**

- [ ] mTLS enabled for all service-to-service communication
- [ ] Kafka SASL/TLS configured — no plaintext connections
- [ ] Database TLS enabled — certificate verification required
- [ ] All secrets in Vault/KMS — no credentials in Git or ConfigMaps
- [ ] Production env validation passes (`node scripts/validate-production-env.mjs --env-file <env-file>`)
- [ ] RBAC roles defined and tested — no over-privileged roles
- [ ] Tenant isolation integration tests passing (all isolation test cases pass)
- [ ] PII masking rules defined for all event types with PII classification
- [ ] PII masking tested — no PII visible in log output
- [ ] JSONata execution sandbox verified (timeout, no I/O access)
- [ ] DLQ payload access restricted to `dlq_analyst` role
- [ ] Network policies applied — services limited to required egress only
- [ ] Audit log table is append-only (application user has no UPDATE/DELETE)
- [ ] Encryption at rest configured for DLQ and sample payloads
- [ ] Vulnerability scan run on container images (result: _____)
- [ ] OWASP dependency check run (result: _____)
- [ ] Secret rotation schedule documented

---

## 4. Observability **[Re-run on change]**

### Metrics

- [ ] All core metrics emitting correctly (verified in staging with load)
- [ ] Prometheus scraping all services (no missing targets)
- [ ] Recording rules deployed (high-cardinality aggregations)
- [ ] Metrics retention configured (15 days minimum in Prometheus)

### Dashboards

- [ ] System Overview dashboard deployed and verified
- [ ] Partner Health dashboard deployed and verified
- [ ] DLQ Analysis dashboard deployed and verified
- [ ] Kafka Infrastructure dashboard deployed and verified
- [ ] Mapping Studio Activity dashboard deployed and verified
- [ ] Business Service dashboard deployed and verified

### Alerting

- [ ] All P1 alerts tested (fire and notify correctly)
- [ ] All P2 alerts tested
- [ ] Alert thresholds calibrated through [Alert Threshold Calibration](./16-alert-threshold-calibration.md)
- [ ] PagerDuty integration configured for P1 alerts
- [ ] Slack integration configured for P2/P3 alerts
- [ ] Escalation policy defined (who is paged if primary on-call does not respond in 15 min)
- [ ] Alert routing tested end-to-end (alert → notification → escalation)
- [ ] Maintenance window runbook documented

### Tracing

- [ ] OpenTelemetry SDK instrumented in all services
- [ ] Trace context propagated through Kafka headers (verified in staging)
- [ ] Tail-based sampling configured (errors: 100%, normal: 1%)
- [ ] Jaeger or equivalent trace backend deployed
- [ ] Example trace reviewed end-to-end (ingress → transformer → business service)

### Logging

- [ ] Structured JSON logging enabled in all services
- [ ] Log aggregation configured (ELK / Loki / CloudWatch)
- [ ] Log retention configured (30 days hot, 1 year cold)
- [ ] Correlation ID visible in all log lines
- [ ] PII masking verified in production log samples
- [ ] Full payload logging confirmed absent

---

## 5. Deployment **[Re-run on change]**

- [ ] Kubernetes manifests validated (`kubectl apply --dry-run`)
- [ ] Resource requests and limits set on all containers
- [ ] Pod disruption budgets configured (min 1 pod available during rolling update)
- [ ] Horizontal Pod Autoscaler configured (or KEDA for lag-based scaling)
- [ ] Canary deployment strategy documented and tested
- [ ] Blue-green switchover tested in staging
- [ ] Database migration strategy tested (zero-downtime confirmed)
- [ ] Rollback procedure tested end-to-end (time to rollback: _____ minutes)
- [ ] Container images pinned to immutable digest (not `:latest`)
- [ ] Image vulnerability scan clean (or exceptions documented)
- [ ] CI/CD pipeline runs on every PR and blocks merge on failure

---

## 6. Mapping Studio **[Re-run on change]**

- [ ] RBAC permission matrix implemented and tested
- [ ] Four-eyes approval enforced for regulated tenants (publisher ≠ author)
- [ ] Audit log capturing all privileged actions
- [ ] Immutable publish confirmed (published records cannot be modified)
- [ ] Mapping rollback tested end-to-end (time to rollback: _____ seconds)
- [ ] Preview / dry-run tested with valid and invalid samples
- [ ] PII masking in preview UI verified
- [ ] Mapping version history visible with full audit trail

---

## 7. Operations Readiness

- [ ] On-call rotation established (minimum 2 people)
- [ ] Runbook reviewed by on-call team (`docs/operations/08-runbook.md`)
- [ ] Failure scenarios reviewed by on-call team (`docs/operations/09-failure-scenarios.md`)
- [ ] DR procedure tested in staging within last 90 days (test date: _____)
- [ ] RTO/RPO targets documented and achievable with current setup
- [ ] Emergency contact matrix up to date (`docs/operations/08-runbook.md`)
- [ ] Escalation chain documented and distributed to team
- [ ] Game day / chaos test scheduled for first 30 days in production

---

## 8. Developer Experience

- [ ] Local development environment documented (`docs/deployment/DOCKER_COMPOSE_LOCAL.md`)
- [ ] `docker-compose up` starts all required services without manual steps
- [ ] Example partner payloads available in `test/fixtures/`
- [ ] Mapping Studio accessible locally for end-to-end testing
- [ ] Getting started guide reviewed by a new team member

---

## 9. Capacity Planning

Complete before go-live. Review at 30/60/90 days.

| Component | Current Estimate | First 90 Days | Notes |
|---|---|---|---|
| Messages/sec (peak) | | | |
| Transformer pod count | | | |
| Transformer vCPUs per pod | | | |
| Active tenants | | | |
| Active partners | | | |
| Kafka partitions per topic | | | |
| PostgreSQL storage (GB) | | | |
| DLQ retention storage (GB) | | | |
| Kafka topic retention storage (GB) | | | |

**Scaling triggers (action required before threshold hit):**
- Kafka consumer lag sustained > 1,000 for > 10 min → add transformer pods
- Worker queue depth sustained > 500 → add pods or increase `workerCount`
- PostgreSQL storage > 70% → provision additional storage
- `processed_events` table size > 100M rows → archive and partition

---

## 10. Sign-Off

| Role | Name | Date | Notes |
|---|---|---|---|
| Engineering lead | | | |
| Platform / SRE | | | |
| Security | | | |
| Product owner | | | |

All critical items must be resolved before production deployment. Non-critical items may be tracked as post-launch issues with agreed resolution dates.

---

## See Also

- [Disaster Recovery](./06-disaster-recovery.md)
- [Failure Scenarios](./09-failure-scenarios.md)
- [Runbook](./08-runbook.md)
- [Security Controls](../implementation/10-security.md)
- [CI/CD Pipeline](../deployment/07-ci-cd-pipeline.md)
