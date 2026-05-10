# Rollback Procedure

## Purpose

Rollback restores a previously healthy code version, mapping version, or configuration state.

## Rollback Types

| Type | Action |
|------|--------|
| Service image | Deploy previous container image |
| Mapping version | Reactivate previous immutable mapping version |
| Config | Restore previous config version |
| Database | Prefer forward fix; destructive rollback only with explicit approval |

## Service Rollback

1. Identify last known good image.
2. Confirm database compatibility.
3. Deploy previous image.
4. Watch readiness, lag, DLQ, and error rate.
5. Record incident timeline.

## Mapping Rollback

1. Identify affected tenant, partner, event type, and mapping version.
2. Activate previous published version.
3. Disable bad version.
4. Run fixture validation for previous version.
5. Decide whether bad messages need DLQ replay.

## Rollback Triggers

- New canonical validation failures.
- DLQ rate above threshold.
- Business writes failing.
- Severe latency regression.
- Security or data leak issue.

## See Also

- [Mapping Versioning](../implementation/03-mapping-versioning.md)
- [Troubleshooting](../operations/03-troubleshooting.md)

