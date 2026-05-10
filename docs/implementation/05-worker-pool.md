# Worker Pool

## Purpose

JSONata transformation and schema validation can become CPU-bound under high throughput. The worker pool isolates expensive transformation work from the Kafka consumer event loop so polling, heartbeats, and graceful shutdown remain responsive.

## When to Use Workers

Use workers when:

- Transformation p95/p99 latency rises under load.
- CPU usage is high while Kafka lag grows.
- Large payloads or complex JSONata expressions block the event loop.
- Multiple partners need bounded concurrency.

Avoid workers for trivial transformations until benchmarks show a need.

## Responsibilities

- Accept transformation jobs from the consumer loop.
- Execute JSONata and validation with timeout limits.
- Return canonical output or structured error.
- Enforce max concurrency per process.
- Emit worker metrics and health state.

## Sizing

| Setting | Starting Point |
|---------|----------------|
| Worker count | `max(1, cpu_count - 1)` |
| Job timeout | 5 seconds for MVP |
| Max payload size | Tenant-configured, default 1 MB |
| Queue limit | Bounded; pause Kafka when full |

## Backpressure

If the worker queue is full:

1. Pause affected Kafka partitions or partner topics.
2. Continue heartbeats.
3. Resume when queue depth drops below threshold.
4. Alert if queue stays saturated.

## Failure Handling

- Timeout -> retry if transient policy allows, otherwise DLQ.
- Worker crash -> start replacement and fail in-flight job with retryable error.
- Invalid mapping -> non-retryable DLQ.
- Memory pressure -> reject new jobs, pause consumption, alert.

## Metrics

- `worker_pool_queue_depth`
- `worker_pool_active_jobs`
- `worker_job_duration_ms`
- `worker_job_timeout_total`
- `worker_crash_total`

## See Also

- [Performance Tuning](../operations/07-performance-tuning.md)
- [Scaling](../operations/04-scaling.md)
- [Transformer Node.js Guide](./TRANSFORMER_NODEJS_GUIDE.md)

