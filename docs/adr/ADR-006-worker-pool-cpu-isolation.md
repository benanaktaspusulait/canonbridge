# ADR-006: Worker Pool for CPU-Bound Transformation Work

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

Node.js runs on a single-threaded event loop. CPU-intensive work on the main thread blocks all I/O operations — including Kafka offset commits, health checks, and metrics scraping.

JSONata transformation and Ajv schema validation are CPU-bound. For complex mappings or large payloads (>100KB), transformation can take 10–100ms. At 1,000 messages/second, this creates significant event loop blocking.

**Problem:**
```
Main thread event loop:
  → Kafka consume
  → [CPU: JSONata transform — 50ms BLOCKING]  ← blocks offset commits, health, metrics
  → Kafka produce
  → commit offset
```

During the 50ms block, no other I/O can proceed. Under high load, this degrades the entire service.

---

## Options Considered

### Option A: Direct Execution (synchronous on main thread)

**How it works:**
Transform and validate on the main event loop thread.

**Strengths:**
- Simplest code
- No serialization overhead for passing messages to workers
- Correct ordering guaranteed

**Weaknesses:**
- CPU work blocks event loop
- Health check endpoints become unresponsive during heavy load
- Prometheus scrape can miss intervals
- Kafka offset commit is delayed
- Consumer lag grows during load spikes

### Option B: Node.js Worker Threads (`worker_threads`)

**How it works:**
A pool of worker threads handles transformation. Main thread handles Kafka I/O and coordination.

```
Main thread:               Worker pool:
Kafka consume →           Worker 1: [transform]
→ send to worker pool     Worker 2: [transform]
← receive result          Worker 3: [transform]
→ produce canonical       Worker 4: [transform]
→ commit offset
```

**Strengths:**
- True CPU isolation — main event loop unblocked
- Configurable pool size (tune to available CPU cores)
- Workers can be restarted independently on crash
- Health checks, metrics, and offset commits remain responsive

**Weaknesses:**
- Message serialization overhead (structured clone between main ↔ worker)
- Ordering guarantees become more complex (messages may complete out-of-order)
- More complex graceful shutdown (drain all workers before exit)
- Debugging is harder (stack traces cross thread boundary)
- Backpressure: worker queue can fill up — needs depth monitoring

### Option C: Child Processes

**How it works:**
Fork separate Node.js processes per worker.

**Weaknesses:**
- Higher memory overhead than worker threads
- Slower IPC (JSON serialization vs. structured clone)
- Overkill for this use case

---

## Decision

**Use a configurable worker pool via `worker_threads`.**

Worker pool is the default mode. Direct mode is available for:
- Low-throughput environments (< 100 msg/sec)
- Very simple mappings with small payloads (< 10KB)
- Local development and testing

**Default configuration:**

```json
{
  "executionMode": "workerPool",
  "workerCount": 4,
  "maxInFlightMessages": 100,
  "workerIdleTimeoutMs": 30000
}
```

`workerCount` should be set to `CPU cores - 1` to leave headroom for the main thread.

---

## Consequences

**Positive:**
- Main event loop stays responsive under load — health checks always respond
- Kafka offset commits are not delayed by transformation work
- Worker pool provides natural backpressure: `worker_queue_depth` metric signals saturation
- CPU cores are fully utilized for transformation throughput

**Negative:**
- Message ordering: two messages from the same partner/event type may complete out of order if processed by different workers
- Graceful shutdown complexity: main thread must wait for all workers to drain before exiting
- Serialization overhead: ~0.1–1ms per message depending on payload size
- `worker_queue_depth` must be monitored — queue growth signals need to scale or tune

**Ordering mitigation:**
Kafka partition assignment ensures messages from the same tenant+partner are routed to the same partition. Within a single worker processing a partition sequentially, ordering is preserved. Cross-partition ordering is not guaranteed (and is not required by the architecture).

---

## Operational Guidance

| Metric | Alert Threshold | Action |
|---|---|---|
| `worker_queue_depth` | > 500 | Scale transformer pods or reduce `maxInFlightMessages` |
| `transformation_duration_ms` p99 | > 200ms | Review mapping complexity; consider increasing `workerCount` |
| Worker restart count | > 0 | Investigate worker crash logs; check for malformed payloads |
