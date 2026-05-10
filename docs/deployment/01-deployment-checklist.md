# Deployment Checklist

## Purpose

Use this checklist before deploying transformer, business service, Mapping Studio, or configuration artifacts.

## Pre-Deployment

- [ ] Change has owner, reviewer, and rollback plan.
- [ ] Unit, integration, and relevant E2E tests pass.
- [ ] Mapping fixtures pass for affected partners.
- [ ] JSON Schema files compile with Ajv.
- [ ] JSONata mappings parse and run against fixtures.
- [ ] Database migrations are backward-compatible.
- [ ] Secrets and config values are present in target environment.
- [ ] Dashboards and alerts exist for affected services.
- [ ] Capacity impact is understood.
- [ ] Release notes list changed partners, event types, schemas, and mapping versions.

## Deployment

- [ ] Deploy to staging first.
- [ ] Run smoke tests.
- [ ] Deploy with canary or blue-green strategy.
- [ ] Watch error rate, DLQ rate, latency, lag, and restart count.
- [ ] Keep previous version available for rollback.

## Post-Deployment

- [ ] Confirm readiness and liveness checks pass.
- [ ] Confirm consumer lag is stable.
- [ ] Confirm DLQ rate is within threshold.
- [ ] Confirm new mapping versions are active only where intended.
- [ ] Record deployment result and follow-up tasks.

## See Also

- [Canary Deployment](./02-canary-deployment.md)
- [Rollback Procedure](./04-rollback-procedure.md)
- [Monitoring Dashboards](../operations/01-monitoring-dashboards.md)

