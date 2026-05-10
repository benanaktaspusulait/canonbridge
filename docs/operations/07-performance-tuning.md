# Performance Tuning

## Purpose

This guide helps tune throughput, latency, resource usage, and Kafka lag for ETL Solutions.

## First Principles

- Measure before changing settings.
- Tune one bottleneck at a time.
- Separate partner-specific problems from platform-wide problems.
- Keep mapping complexity visible through metrics and validation runs.

## Common Bottlenecks

| Symptom | Likely Cause | Action |
|---------|--------------|--------|
| Consumer lag grows | Not enough processing capacity | Increase partitions/workers/pods |
| High p99 transform latency | Complex JSONata or large payload | Optimize mapping, enable workers |
| High CPU | CPU-bound transform/validation | Tune worker pool, scale horizontally |
| High memory | Large payloads/cache growth | Limit payload size, review cache TTL |
| DLQ spike | Bad mapping/schema change | Roll back mapping version |
| Producer latency | Kafka broker pressure | Check broker health and batching |

## Transformer Tuning

- Cache compiled JSONata expressions.
- Cache compiled Ajv validators.
- Use worker pool for CPU-heavy mappings.
- Set max payload size per tenant.
- Pause Kafka partitions when worker queue is saturated.
- Prefer simple direct mappings over complex expressions where possible.

## Kafka Tuning

- Partition by stable business key such as entity ID.
- Increase partitions for parallelism only when ordering requirements allow.
- Monitor consumer lag per topic and partition.
- Tune producer batching carefully; do not increase latency blindly.

## Database Tuning

- Index idempotency keys and outbox status fields.
- Keep transactions short.
- Process outbox in bounded batches.
- Monitor slow queries and lock waits.

## Mapping Studio Tuning

- Run inference and preview on backend workers.
- Limit sample payload size.
- Use virtualized JSON tree rendering.
- Cache canonical schemas.
- Store raw sample payloads in object storage, not large database rows.

## See Also

- [Load Tests](../testing/04-load-tests.md)
- [Worker Pool](../implementation/05-worker-pool.md)
- [Scaling](./04-scaling.md)

