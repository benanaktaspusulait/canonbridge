# Database Migrations

## Purpose

Database migrations must allow safe service deployment, rollback, and zero-downtime operation.

## Rules

- Prefer expand-and-contract migrations.
- Add nullable columns before writing required data.
- Backfill separately from schema deploy.
- Deploy code that can read old and new shapes.
- Drop old columns only after all services stop using them.
- Never combine risky data migration with unrelated release work.

## Expand-and-Contract Flow

1. Add new table/column/index in backward-compatible way.
2. Deploy code that writes both old and new if needed.
3. Backfill existing data.
4. Switch reads to new structure.
5. Stop writing old structure.
6. Drop old structure in a later release.

## Migration Checklist

- [ ] Migration is idempotent where possible.
- [ ] Migration has been tested on production-sized data.
- [ ] Long-running changes are split.
- [ ] Index creation is non-blocking where supported.
- [ ] Roll-forward fix is documented.
- [ ] Backup exists before risky migration.

## See Also

- [Deployment Checklist](./01-deployment-checklist.md)
- [Disaster Recovery](../operations/06-disaster-recovery.md)

---

## Service Migration Dependency Graph (X-Y4)

```
┌─────────────────────────────────────────────────────────────┐
│                  Migration Ownership                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  mapping-studio-api (OWNER)                                 │
│  ├── Flyway: migrate-at-start=true                         │
│  ├── Location: classpath:db/migration (V1..V53+)           │
│  ├── Tables owned:                                          │
│  │   ├── partners, mapping_drafts, mapping_versions        │
│  │   ├── schemas, webhook_endpoints, dlq_messages          │
│  │   ├── audit_logs, credentials, users, tenants           │
│  │   ├── organizations, org_members                        │
│  │   ├── plans, plan_features, subscriptions               │
│  │   ├── usage_events, usage_daily_aggregates              │
│  │   ├── invoices, invoice_line_items                      │
│  │   ├── api_keys, org_billing_settings                    │
│  │   └── paddle_processed_events                           │
│  └── Must be READY before dependents start                 │
│                                                             │
│  billing-service (DEPENDENT)                                │
│  ├── Flyway: migrate-at-start=false                        │
│  ├── Reads/writes: subscriptions, usage_events,            │
│  │   usage_daily_aggregates, invoices, invoice_line_items, │
│  │   org_billing_settings, paddle_processed_events, plans  │
│  └── MUST wait for mapping-studio-api readiness            │
│                                                             │
│  webhook-receiver (DEPENDENT)                               │
│  ├── Flyway: none                                          │
│  ├── Reads/writes: webhook_endpoints, usage_events         │
│  └── MUST wait for mapping-studio-api readiness            │
│                                                             │
│  transformer (INDEPENDENT)                                  │
│  ├── Own DB: dead_letter_queue (self-managed via code)     │
│  └── No Flyway dependency                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Ordering

**Cold deploy (fresh cluster):**

1. PostgreSQL must be ready (`pg_isready`)
2. `mapping-studio-api` starts → runs Flyway migrations → becomes ready
3. `billing-service` and `webhook-receiver` start (after mapping-studio-api is ready)
4. `transformer` can start independently

**Kubernetes initContainer pattern (B-Y4 fix):**

```yaml
# billing-service-deployment.yaml
spec:
  template:
    spec:
      initContainers:
      - name: wait-for-migrations
        image: busybox:1.36
        command: ['sh', '-c']
        args:
        - |
          echo "Waiting for mapping-studio-api to be ready..."
          until wget -qO- http://mapping-studio-api-service:8080/health/ready 2>/dev/null | grep -q "UP"; do
            echo "mapping-studio-api not ready yet, waiting 5s..."
            sleep 5
          done
          echo "mapping-studio-api is ready, migrations complete."
      containers:
      - name: billing-service
        # ... normal container spec
```

Apply the same pattern to `webhook-receiver-deployment.yaml`.

### Rollback Considerations

- Never drop columns in the same release that stops using them
- billing-service and webhook-receiver can safely restart without data loss (idempotent inserts)
- If a migration fails, mapping-studio-api will fail to start → dependents will wait indefinitely → alert on pod restart count

