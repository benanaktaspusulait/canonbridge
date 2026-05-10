# ADR-001: Apache Kafka for Event Streaming

**Status**: Accepted
**Date**: 2024-01
**Deciders**: Platform Architecture Team

---

## Context

CanonBridge needs a message broker to decouple partner event ingestion from transformation and downstream consumption. The broker must handle:

- High-throughput partner event ingestion (target: 10,000+ msg/sec)
- Multiple independent consumers reading the same events (transformer, audit, monitoring)
- Event replay for debugging, backfill, and mapping version rollback
- Backpressure signaling via consumer lag metrics
- Long-term retention for audit and compliance
- At-least-once delivery guarantees
- Multi-tenant isolation at the topic level

The platform is specifically designed as an **event transformation pipeline**, not a command/task queue.

---

## Options Considered

### Option A: Apache Kafka

**Strengths:**
- Log-based storage — consumers can replay from any offset
- Consumer groups allow independent scaling of each consuming service
- Consumer lag is a first-class observable metric (backpressure visibility)
- Topic retention configurable per tenant/use-case
- Exactly-once semantics available when needed
- Battle-tested at high throughput (millions of msg/sec per partition)
- Native multi-consumer: transformer + audit + monitoring all read same topic independently

**Weaknesses:**
- Higher operational complexity than RabbitMQ
- Requires ZooKeeper or KRaft for cluster coordination
- Not optimal for RPC-style request/reply patterns
- Ordering guarantees are per-partition only (not global)
- Consumer rebalancing introduces temporary pause

### Option B: RabbitMQ

**Strengths:**
- Simpler operational model
- Native routing via exchange types (direct, topic, fanout, headers)
- Good for short-lived tasks and command patterns
- Lower latency for small messages
- Mature management UI

**Weaknesses:**
- Messages are consumed and removed — no replay without separate archive
- Consumer groups are not a native concept
- Backpressure is indirect (queue depth monitoring, flow control)
- Less suitable for audit/compliance scenarios requiring historical replay
- Scaling consumers requires explicit configuration, not partition-based

### Option C: AWS SQS / GCP Pub/Sub

**Strengths:**
- Fully managed, no operational overhead
- Built-in dead-letter queues
- Auto-scaling

**Weaknesses:**
- Vendor lock-in
- No log-based replay (SQS messages deleted after consumption)
- Cost unpredictable at high volume
- Harder to run locally or on-premise
- Multi-tenancy isolation requires multiple queues

---

## Decision

**Use Apache Kafka.**

The deciding factors:

1. **Replay is non-negotiable** — when a mapping version is rolled back, all affected events must be reprocessable. Kafka's log retention makes this straightforward. RabbitMQ has no equivalent.

2. **Multiple consumers per event stream** — transformer, audit service, and monitoring all need to process the same raw events independently without coordination. Kafka's consumer groups provide this natively.

3. **Consumer lag as backpressure** — the platform's scaling strategy is consumer lag-driven. Kafka makes lag a first-class metric. RabbitMQ queue depth is a weaker signal.

4. **Audit and compliance** — raw partner events must be retained for investigation and replay. Kafka's configurable retention (by time or size) directly supports this.

---

## Consequences

**Positive:**
- Independent replay from any offset enables mapping rollback without data loss
- Multiple services consume same topic without interference
- Consumer lag drives autoscaling decisions
- Long retention supports audit and compliance requirements
- Partition-based scaling: add partitions to increase throughput

**Negative:**
- Operational complexity: cluster management, replication factor, partition strategy
- KRaft or ZooKeeper required for coordination
- Consumer group rebalancing introduces brief pauses (mitigated by incremental rebalancing)
- Per-partition ordering only — global ordering across tenants not guaranteed

**Mitigations:**
- Use managed Kafka (Confluent Cloud, MSK, or Strimzi on Kubernetes) to reduce ops burden
- Partition by tenant+partner for ordering guarantees within a data stream
- Monitor consumer rebalance duration as an SLA metric

---

## Rejected Approaches

**Pure HTTP ingestion with database queue**: Synchronous ingestion would create a scaling bottleneck and lose the decoupling between partner latency and processing latency.

**Managed SQS**: Replay requirement eliminates SQS. Point-in-time replay from arbitrary offsets is fundamental to the mapping rollback feature.
