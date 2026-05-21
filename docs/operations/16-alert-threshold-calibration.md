# Alert Threshold Calibration

**Status**: Active  
**Last updated**: 2026-05-21

The repository now carries default alerts for outbox replay, batch jobs, scheduled API runs, and proxy/runtime health. Staging calibration is handled by this runbook rather than being left as an undocumented follow-up.

## Initial Baseline Window

Run the platform in staging for at least 72 hours with representative partner traffic.

Capture:

- `canonbridge_outbox_replay_completed_total`
- `canonbridge_outbox_publish_failed_total`
- `canonbridge_batch_jobs_completed_total`
- `canonbridge_batch_rows_processed_total`
- `canonbridge_scheduled_runs_completed_total`
- Kafka lag and HTTP p95/p99 latency

## Default Policy

| Signal | Initial alert | Calibration rule |
|---|---|---|
| Outbox replay failures | Any replay failure in 15 minutes | Keep if failures are rare; otherwise alert on error-rate ratio. |
| Batch job failures | Any failed/error batch in 15 minutes | Raise only if expected bad partner files create noise. |
| Scheduled API run failures | Any failure in 15 minutes | Convert to per-partner ratio after staging has enough runs. |
| DLQ / invalid payload growth | Sustained increase | Use per-partner rate once tenant traffic mix is known. |

## Sign-Off

Before production:

- [ ] Staging baseline window completed.
- [ ] P1/P2 alert routes tested.
- [ ] No alert fires repeatedly during normal staging traffic.
- [ ] Tuned thresholds are committed with the release.
