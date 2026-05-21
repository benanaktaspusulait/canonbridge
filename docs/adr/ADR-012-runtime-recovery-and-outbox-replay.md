# ADR-012: Runtime Recovery and Outbox Replay

**Status**: Accepted

## Context

Mapping Studio API now owns operational surfaces that are tightly coupled to draft, batch, scheduled-run, and canonical-event state. Operators need durable status, retry, replay, and alerting rather than one-off logs.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| Manual database repair only | Minimal code | Unsafe, slow, and hard to audit |
| Separate recovery service immediately | Clear ownership at high scale | More deployment surface before volume justifies it |
| Recovery workers inside `mapping-studio-api` | Reuses existing repositories, security, and operational context | May need extraction if recovery volume grows |

## Decision

Keep recovery workers inside `mapping-studio-api` for the current MVP/staging phase.

- Batch jobs store row-level state and expose retry/redrive APIs.
- Chunked batch upload sessions make large-file flows durable and resumable from the API contract.
- Scheduled API polling stores status and run history for interval and cron schedules.
- Outbox records start as `PENDING`, transition to `PUBLISHED` or `FAILED`, and are replayed by a background worker or manual replay API.
- Metrics, Grafana panels, and Prometheus alerts cover batch, scheduled, and outbox recovery paths.

## Consequences

- Operators have explicit recovery surfaces.
- Tests can exercise repository and recovery semantics without requiring manual DB edits.
- Future extraction remains possible if runtime recovery needs independent scaling.

## Rejected Approaches

- Treating Kafka publish success/failure as a transient log-only concern.
- Marking batch uploads complete before chunks are durable.
