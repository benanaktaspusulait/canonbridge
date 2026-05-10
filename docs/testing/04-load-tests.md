# Load Tests

## Purpose

Load tests prove throughput, latency, memory, and Kafka lag behavior under expected and peak workloads.

## Targets

| Metric | MVP Target | Later Target |
|--------|------------|--------------|
| Throughput | 1,000 msg/sec | 10,000+ msg/sec |
| Transformation p99 | < 100 ms | < 100 ms |
| DLQ rate | < 0.1% | < 0.1% |
| Consumer lag | Stable | Stable |

## Scenarios

- Single partner, simple mapping.
- Multiple partners, mixed event types.
- Large payloads.
- Complex JSONata expressions.
- Worker pool saturation.
- DLQ spike.

## Measurements

- Throughput.
- p50/p95/p99 latency.
- CPU and memory.
- Worker queue depth.
- Kafka lag.
- Producer error rate.
- GC pauses/event loop lag.

## See Also

- [Performance Tuning](../operations/07-performance-tuning.md)
- [Worker Pool](../implementation/05-worker-pool.md)

