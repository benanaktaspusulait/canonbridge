# Sequence Diagrams

Mermaid diagrams for all critical platform flows. Render in GitHub, GitLab, or any Mermaid-compatible viewer.

---

## 1. Happy Path: Event Ingestion and Transformation

The standard flow from partner event to business domain record.

```mermaid
sequenceDiagram
    participant Partner as Partner System
    participant Ingress as Ingress Adapter
    participant KafkaRaw as Kafka<br/>raw.events
    participant Transformer as Transformer<br/>Service
    participant MappingCache as Mapping<br/>Cache
    participant KafkaCanon as Kafka<br/>canonical.events
    participant BusinessSvc as Business<br/>Consumer Service
    participant DB as PostgreSQL
    participant KafkaBiz as Kafka<br/>business.events

    Partner->>Ingress: POST /events (partner payload)
    Ingress->>Ingress: Assign eventId, wrap envelope
    Ingress->>KafkaRaw: Produce raw event
    Note over KafkaRaw: Partition by tenantId+partnerId

    KafkaRaw->>Transformer: Consume message (manual offset hold)
    Transformer->>Transformer: Parse envelope, extract tenantId/partnerId/eventType
    Transformer->>MappingCache: Get mapping (tenantId, partnerId, eventType, version)
    MappingCache-->>Transformer: JSONata expression + schemas

    Transformer->>Transformer: Validate input schema (Ajv)
    Transformer->>Transformer: Execute JSONata transformation
    Transformer->>Transformer: Validate canonical output (Ajv)

    Transformer->>KafkaCanon: Produce canonical event (with x-event-id, x-mapping-version)
    Transformer->>KafkaRaw: Commit offset
    Note over Transformer,KafkaRaw: Offset committed AFTER successful produce

    KafkaCanon->>BusinessSvc: Consume canonical event
    BusinessSvc->>DB: BEGIN TRANSACTION
    BusinessSvc->>DB: INSERT processed_events (idempotency check)
    Note over BusinessSvc,DB: If 0 rows → already processed → ROLLBACK + skip
    BusinessSvc->>DB: INSERT/UPDATE domain tables
    BusinessSvc->>DB: INSERT outbox_events (status=PENDING)
    BusinessSvc->>DB: COMMIT

    DB->>BusinessSvc: Outbox publisher polls
    BusinessSvc->>KafkaBiz: Produce business event
    BusinessSvc->>DB: UPDATE outbox_events SET status=PUBLISHED
```

---

## 2. Transformation Failure: DLQ Flow

When JSONata transformation fails permanently (bad mapping, schema mismatch).

```mermaid
sequenceDiagram
    participant KafkaRaw as Kafka<br/>raw.events
    participant Transformer as Transformer<br/>Service
    participant KafkaDLQ as Kafka<br/>transformation.dlq
    participant AlertMgr as Alertmanager

    KafkaRaw->>Transformer: Consume message
    Transformer->>Transformer: Parse envelope ✓
    Transformer->>Transformer: Load mapping ✓
    Transformer->>Transformer: Execute JSONata transformation
    Transformer->>Transformer: Validate canonical output
    Note over Transformer: Validation FAILS<br/>(schema mismatch or transform error)

    Transformer->>KafkaDLQ: Produce DLQ record
    Note over KafkaDLQ: Includes: original payload,<br/>error details, mapping version,<br/>stack trace, timestamp

    Transformer->>KafkaRaw: Commit offset
    Note over Transformer: Processing continues<br/>for next message

    KafkaDLQ->>AlertMgr: dlq_messages_total counter incremented
    Note over AlertMgr: Alert fires if DLQ rate > threshold
```

---

## 3. Retry Flow: Temporary Failure

When a downstream system is temporarily unavailable (transient network error, DB timeout).

```mermaid
sequenceDiagram
    participant KafkaRaw as Kafka<br/>raw.events
    participant Transformer as Transformer
    participant KafkaRetry1 as Kafka<br/>retry.1m
    participant KafkaRetry5 as Kafka<br/>retry.5m
    participant KafkaRetry30 as Kafka<br/>retry.30m
    participant KafkaDLQ as Kafka<br/>dlq

    KafkaRaw->>Transformer: Consume message
    Transformer->>Transformer: Transform ✓
    Transformer->>Transformer: Produce to canonical topic
    Note over Transformer: FAILS (temporary — network timeout)

    Transformer->>KafkaRetry1: Route to retry.1m topic
    Transformer->>KafkaRaw: Commit offset

    Note over KafkaRetry1: After 1 minute delay...
    KafkaRetry1->>Transformer: Re-consume
    Transformer->>Transformer: Transform + produce attempt
    Note over Transformer: FAILS again

    Transformer->>KafkaRetry5: Route to retry.5m topic
    Note over KafkaRetry5: After 5 minute delay...
    KafkaRetry5->>Transformer: Re-consume
    Note over Transformer: FAILS again

    Transformer->>KafkaRetry30: Route to retry.30m topic
    Note over KafkaRetry30: After 30 minute delay...
    KafkaRetry30->>Transformer: Re-consume
    Note over Transformer: FAILS again (permanent)

    Transformer->>KafkaDLQ: Route to DLQ (exhausted retries)
    Note over KafkaDLQ: Error type: EXHAUSTED_RETRIES<br/>Retry count: 3
```

---

## 4. Mapping Version Rollback

Operator rolls back a broken mapping version without deployment.

```mermaid
sequenceDiagram
    participant Operator as Operator
    participant MappingAPI as Mapping Studio<br/>API
    participant DB as PostgreSQL
    participant Cache as Mapping<br/>Cache
    participant Transformer as Transformer<br/>Service
    participant KafkaRaw as Kafka<br/>raw.events

    Note over KafkaRaw,Transformer: DLQ rate spike detected for partner-acme

    Operator->>MappingAPI: GET /mappings/partner-acme/order.created/versions
    MappingAPI-->>Operator: [v2.1.0 ACTIVE, v2.0.1 PUBLISHED, v2.0.0 PUBLISHED]

    Operator->>MappingAPI: POST /mappings/partner-acme/order.created/activate
    Note over Operator,MappingAPI: body: { version: "2.0.1", reason: "v2.1.0 causing DLQ spike" }

    MappingAPI->>DB: UPDATE active_mapping_versions SET active_version = v2.0.1
    MappingAPI->>DB: INSERT audit_log (operator, action=rollback, from=v2.1.0, to=v2.0.1)
    MappingAPI->>Cache: Invalidate cache for partner-acme/order.created
    MappingAPI-->>Operator: 200 OK (rollback complete)

    Note over Cache,Transformer: Next transformation request loads v2.0.1
    KafkaRaw->>Transformer: Consume message
    Transformer->>Cache: Get mapping (partner-acme, order.created)
    Cache-->>Transformer: v2.0.1 JSONata expression
    Note over Transformer: Transformation succeeds with v2.0.1

    Note over Operator: DLQ rate returns to normal<br/>Total rollback time: ~30 seconds
```

---

## 5. Mapping Publish Lifecycle

Full lifecycle from draft creation to production activation.

```mermaid
sequenceDiagram
    participant Author as Integration<br/>Engineer
    participant Reviewer as Peer<br/>Reviewer
    participant MappingUI as Mapping Studio<br/>UI
    participant MappingAPI as Mapping Studio<br/>API
    participant DB as PostgreSQL
    participant Cache as Mapping Cache

    Author->>MappingUI: Create new mapping draft
    MappingUI->>MappingAPI: POST /mappings/drafts
    MappingAPI->>DB: INSERT mapping_definitions (status=DRAFT)

    Author->>MappingUI: Upload sample input JSON
    Author->>MappingUI: Write JSONata expression
    Author->>MappingUI: Run preview (dry-run)
    MappingUI->>MappingAPI: POST /mappings/drafts/{id}/preview
    MappingAPI-->>MappingUI: Transformed output

    Author->>MappingUI: Submit for review
    MappingAPI->>DB: UPDATE mapping_definitions SET status=REVIEW

    Reviewer->>MappingUI: Review mapping + samples
    Reviewer->>MappingUI: Approve
    MappingAPI->>DB: UPDATE mapping_definitions SET approved_by=reviewer

    Author->>MappingUI: Publish version
    MappingAPI->>DB: UPDATE mapping_definitions SET status=PUBLISHED, version="2.2.0"
    Note over DB: Record is now IMMUTABLE

    Author->>MappingUI: Activate version
    MappingAPI->>DB: UPDATE active_mapping_versions SET active_version=v2.2.0
    MappingAPI->>Cache: Invalidate cache entry
    Note over Cache: Next Kafka message loads v2.2.0
```

---

## 6. Duplicate Event Handling (Idempotency)

Kafka redelivers an already-processed event. Business service handles it transparently.

```mermaid
sequenceDiagram
    participant Kafka as Kafka<br/>canonical.events
    participant BusinessSvc as Business<br/>Consumer Service
    participant DB as PostgreSQL

    Note over Kafka: Consumer rebalance or<br/>service restart causes redelivery

    Kafka->>BusinessSvc: Consume canonical event (eventId: uuid-123)
    BusinessSvc->>DB: BEGIN TRANSACTION
    BusinessSvc->>DB: INSERT INTO processed_events (event_id='uuid-123')
    Note over DB: ON CONFLICT (event_id) DO NOTHING<br/>→ 0 rows inserted

    DB-->>BusinessSvc: 0 rows affected
    BusinessSvc->>DB: ROLLBACK (nothing to do)
    BusinessSvc->>Kafka: Commit offset

    Note over BusinessSvc: Event silently skipped<br/>No duplicate record created<br/>No downstream event published
```

---

## 7. Outbox Pattern: Transactional Event Publish

Ensures domain write and event publish are always consistent.

```mermaid
sequenceDiagram
    participant BusinessSvc as Business<br/>Consumer Service
    participant DB as PostgreSQL
    participant OutboxPublisher as Outbox<br/>Publisher
    participant Kafka as Kafka<br/>business.events

    BusinessSvc->>DB: BEGIN TRANSACTION
    BusinessSvc->>DB: INSERT processed_events (event_id)
    BusinessSvc->>DB: INSERT/UPDATE domain table
    BusinessSvc->>DB: INSERT outbox_events (status=PENDING, payload)
    BusinessSvc->>DB: COMMIT

    Note over DB: All three writes are atomic.<br/>If COMMIT fails, all three are rolled back.

    loop Every 100ms
        OutboxPublisher->>DB: SELECT * FROM outbox_events WHERE status='PENDING' LIMIT 100
        DB-->>OutboxPublisher: [pending records]
        OutboxPublisher->>Kafka: Produce business event
        OutboxPublisher->>DB: UPDATE outbox_events SET status='PUBLISHED'
    end

    Note over OutboxPublisher,Kafka: If Kafka produce fails:<br/>record stays PENDING → retried next poll
    Note over OutboxPublisher,DB: If UPDATE fails after produce:<br/>event is re-published → idempotency handles duplicate
```

---

## 8. Graceful Shutdown

Service receives SIGTERM and drains in-flight messages before exit.

```mermaid
sequenceDiagram
    participant K8s as Kubernetes
    participant Transformer as Transformer<br/>Service
    participant KafkaRaw as Kafka<br/>raw.events
    participant WorkerPool as Worker Pool
    participant KafkaCanon as Kafka<br/>canonical.events

    K8s->>Transformer: SIGTERM
    Transformer->>Transformer: Set shutdown flag = true
    Transformer->>KafkaRaw: Pause consumption (stop polling)
    Note over Transformer: New messages no longer consumed

    Note over WorkerPool: In-flight transformations continue
    WorkerPool->>KafkaCanon: Complete pending produces
    WorkerPool->>KafkaRaw: Commit offsets for completed messages

    Transformer->>WorkerPool: Wait for drain (max 25 seconds)
    WorkerPool-->>Transformer: All workers idle

    Transformer->>KafkaRaw: Final offset commit
    Transformer->>Transformer: Close Kafka consumer group
    Transformer->>Transformer: Exit process (code 0)

    Note over K8s: Pod terminationGracePeriodSeconds: 30s<br/>Shutdown completes within budget
```

---

## 9. Consumer Lag Autoscaling

HPA scales transformer pods when consumer lag grows.

```mermaid
sequenceDiagram
    participant Kafka as Kafka
    participant Prometheus as Prometheus
    participant HPA as HPA<br/>(Kubernetes)
    participant Transformer as Transformer<br/>Pods

    Note over Kafka: Partner sends high-volume<br/>event burst

    Kafka->>Prometheus: consumer_lag metric = 5000 (threshold: 1000)
    Prometheus->>HPA: Expose kafka_consumer_lag metric via adapter
    HPA->>HPA: Evaluate scaling policy
    Note over HPA: currentReplicas=2, desiredReplicas=4

    HPA->>Transformer: Scale to 4 pods
    Note over Transformer: New pods join consumer group
    Note over Transformer: Rebalance: partitions redistributed

    Kafka->>Transformer: Partitions assigned to new pods
    Note over Kafka,Transformer: 4 pods consuming in parallel<br/>Lag decreases

    Kafka->>Prometheus: consumer_lag metric = 200 (below threshold)
    HPA->>Transformer: Scale back to 2 pods (cooldown period)
```

---

## See Also

- [Architecture Overview](./01-overview.md)
- [Error Handling](./07-error-handling.md)
- [Ordering and Dependencies](./08-ordering-dependencies.md)
- [Outbox Pattern](./09-outbox-pattern.md)
- [ADR-004: Manual Offset Commit](../adr/ADR-004-manual-kafka-offset-commit.md)
- [ADR-005: Outbox Pattern](../adr/ADR-005-outbox-pattern.md)
- [ADR-008: Idempotency](../adr/ADR-008-event-id-idempotency.md)
