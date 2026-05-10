# Platform Upgrade Strategy

## Purpose

Define how CanonBridge platform versions are upgraded in production with zero downtime, backward-compatible mappings, and safe database migrations.

---

## Upgrade Method: Rolling Update

All CanonBridge services use Kubernetes RollingUpdate strategy.

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0   # Never reduce below desired replica count
      maxSurge: 1         # Allow one extra pod during rollout
```

**Effect:** Old pods receive SIGTERM and drain gracefully (see graceful shutdown in [Sequence Diagrams](../architecture/11-sequence-diagrams.md#8-graceful-shutdown)) while new pods start. At no point are zero pods running.

**Downtime: Zero.**

---

## Upgrade Procedure

### Standard Upgrade

```bash
# 1. Update image tag in Helm values
# values-production.yaml:
#   transformer:
#     image:
#       tag: "1.3.0"  # was 1.2.0

# 2. Run helm upgrade
helm upgrade canonbridge ./helm/canonbridge \
  --namespace canonbridge \
  --values values-production.yaml \
  --atomic \
  --timeout 5m

# --atomic: rolls back automatically if any pod fails to become Ready
# --timeout: maximum wait time for rollout

# 3. Monitor rollout
kubectl rollout status deployment/transformer -n canonbridge
kubectl rollout status deployment/business-service -n canonbridge
```

### Upgrade with Database Migration

Database migrations run as a Kubernetes Job before the new application pods start.

```yaml
# helm/canonbridge/templates/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: canonbridge-migration-{{ .Values.image.tag }}
  annotations:
    "helm.sh/hook": pre-upgrade
    "helm.sh/hook-weight": "-1"
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  template:
    spec:
      containers:
      - name: flyway
        image: flyway/flyway:{{ .Values.flyway.version }}
        command: ["flyway", "migrate"]
        env:
        - name: FLYWAY_URL
          value: "jdbc:postgresql://$(DB_HOST):$(DB_PORT)/$(DB_NAME)"
      restartPolicy: Never
  backoffLimit: 0  # Fail fast — do not retry broken migration
```

**Migration rules:**
- Every release that changes the DB schema ships a Flyway migration script
- Migration scripts are forward-only (no destructive changes in normal flow)
- Rollback scripts exist for every migration (used in emergency rollback only)
- If migration fails, Helm upgrade is aborted (`--atomic`) — new pods do not start
- Old pods continue running on the previous schema version

---

## Database Migration Best Practices

### Zero-Downtime Schema Changes

| Change Type | Safe? | Strategy |
|---|---|---|
| Add nullable column | Yes | Add column, no data migration needed |
| Add column with default | Yes | Add with `DEFAULT` — PostgreSQL handles atomically |
| Add index | Yes (with `CONCURRENTLY`) | `CREATE INDEX CONCURRENTLY` — does not lock table |
| Add NOT NULL column | No (naive) | Add nullable first → backfill → add NOT NULL constraint |
| Rename column | No (naive) | Add new column → dual-write period → migrate → remove old |
| Remove column | No (naive) | Remove from application first → deploy → then drop column |
| Change column type | Rarely safe | Application-level migration required |

**Expand-contract pattern for breaking changes:**
1. **Expand**: Add new column/table alongside old (application writes to both)
2. **Migrate**: Backfill data from old to new
3. **Contract**: Remove old column/table after consumers are updated

### Migration Tooling

Flyway is the standard migration tool. Scripts are stored in `src/main/resources/db/migration/`:

```
V1__initial_schema.sql
V2__add_pending_events_table.sql
V3__add_mapping_audit_table.sql
V4__add_index_on_processed_events_event_id.sql
```

---

## Canary Deployment (Advanced)

For high-risk upgrades, a canary approach routes a fraction of traffic to the new version before full rollout.

```
Production traffic
        │
        ├─ 90% ──► v1.2.0 pods (stable)
        └─ 10% ──► v1.3.0 pods (canary)
```

**Implementation via Argo Rollouts:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: transformer
spec:
  strategy:
    canary:
      steps:
      - setWeight: 10        # 10% to new version
      - pause: {duration: 5m}
      - analysis:            # Auto-check metrics
          templates:
          - templateName: transformation-error-rate
      - setWeight: 50        # 50% if analysis passes
      - pause: {duration: 5m}
      - setWeight: 100       # Full rollout
```

**Canary promotion criteria:**
- DLQ rate does not increase by more than 0.1% compared to stable version
- Transformation p99 does not increase by more than 50ms
- No increase in consumer lag trend

**Canary abort criteria:**
- DLQ rate spike > 1% above baseline → automatic rollback

---

## Mapping Compatibility

New platform versions must be backward-compatible with existing mappings.

**Compatibility contract:**
- JSONata engine version is pinned in the platform (not upgraded without testing)
- If JSONata engine is upgraded, full mapping regression test suite runs in CI
- Any mapping expression that worked in v1.x must work in v1.(x+1) — no breaking changes without major version bump
- Breaking JSONata engine change = major platform version = separate migration guide

**Compatibility test in CI:**

```yaml
# .github/workflows/mapping-compat.yml
- name: Run mapping compatibility tests
  run: |
    # Execute all fixture-based mapping tests
    # against the new platform version
    npm run test:mappings
    # Any failure blocks the release
```

---

## Rollback

If an upgrade causes production issues, rollback restores the previous version.

### Application Rollback

```bash
# Immediate rollback to previous Helm release
helm rollback canonbridge -n canonbridge

# Verify rollback completed
kubectl rollout status deployment/transformer -n canonbridge
```

**Rollback time: < 3 minutes** (Kubernetes applies previous deployment spec; pods restart with old image).

### Database Rollback

If a migration was applied and must be undone:

```bash
# Run the rollback script for the specific migration
flyway -target=<previous_version> repair
```

**Note:** Rollback scripts must be written alongside every migration script. If no rollback script exists, the only option is point-in-time database recovery. This is why expansion-first (expand-contract) patterns are preferred — the old schema is still present and functional.

---

## Version Support Policy

| Release type | Support period | Migration path |
|---|---|---|
| Patch (1.x.y → 1.x.z) | Until next minor | Automatic, no action |
| Minor (1.x → 1.y) | 6 months after next minor | Upgrade guide provided |
| Major (1.x → 2.x) | 12 months after major release | Migration guide + parallel run period |

Customer installs on EOL (end-of-life) versions are eligible for paid upgrade assistance.

---

## Configuration Changes Without Restart

Most operational parameters can be updated without a pod restart:

```bash
# Update a runtime configuration parameter
curl -X POST https://transformer.internal/admin/config/reload \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"WORKER_COUNT": 8, "WORKER_TASK_TIMEOUT_MS": 750}'
```

| Parameter | Reload? | Notes |
|---|---|---|
| `WORKER_COUNT` | Yes | Takes effect on next cycle |
| `WORKER_TASK_TIMEOUT_MS` | Yes | Applies to new tasks |
| `CB_FAILURE_THRESHOLD` | Yes | Circuit breaker config |
| `PARTNER_MAX_IN_FLIGHT` | Yes | Rate limiting |
| `WORKER_MAX_OLD_SPACE_MB` | No — restart required | JVM/V8 heap |
| `KAFKA_BROKERS` | No — restart required | Connection pool |
| `DB_HOST` | No — restart required | Connection pool |

---

## See Also

- [CI/CD Pipeline](./07-ci-cd-pipeline.md)
- [Rollback Procedure](./04-rollback-procedure.md)
- [Database Migrations](./05-database-migrations.md)
- [Canary Deployment](./02-canary-deployment.md)
- [Sequence Diagrams — Graceful Shutdown](../architecture/11-sequence-diagrams.md#8-graceful-shutdown)
