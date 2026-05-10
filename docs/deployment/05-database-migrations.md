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

