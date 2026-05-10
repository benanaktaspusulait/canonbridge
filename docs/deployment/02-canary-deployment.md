# Canary Deployment

## Purpose

Canary deployment reduces risk by sending a small percentage of traffic or a limited partner/event set to a new version before full rollout.

## Strategy

```text
staging -> 5% canary -> 25% -> 50% -> 100%
```

For partner mappings, prefer partner/event scoped canaries:

- One low-risk partner.
- One event type.
- One mapping version.
- Limited replay window.

## Promotion Gates

Promote only when:

- Error rate does not increase.
- DLQ rate stays under threshold.
- Consumer lag remains stable.
- p95/p99 transformation latency stays within target.
- No new validation error pattern appears.
- Business service idempotency and outbox metrics remain healthy.

## Rollback Triggers

- DLQ spike for canary partner.
- Canonical validation failures.
- Consumer lag grows continuously.
- Pod restart loop.
- Business service write failures.
- Manual operator stop.

## Checklist

- [ ] Canary scope defined.
- [ ] Metrics dashboard open.
- [ ] Rollback command tested.
- [ ] Previous version available.
- [ ] On-call owner assigned.
- [ ] Promotion windows documented.

## See Also

- [Deployment Checklist](./01-deployment-checklist.md)
- [Rollback Procedure](./04-rollback-procedure.md)

