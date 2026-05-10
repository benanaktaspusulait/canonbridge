# Performance Tuning

## Overview

This document provides performance tuning guidelines for the ETL Solutions platform, covering application optimization, database tuning, Kafka optimization, and infrastructure tuning.

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Throughput | 10,000 msg/sec | TBD | 🎯 Target |
| Latency (p50) | < 50ms | TBD | 🎯 Target |
| Latency (p95) | < 100ms | TBD | 🎯 Target |
| Latency (p99) | < 200ms | TBD | 🎯 Target |
| Error Rate | < 0.1% | TBD | 🎯 Target |
| CPU Usage | < 70% | TBD | 🎯 Target |
| Memory Usage | < 80% | TBD | 🎯 Target |
| Consumer Lag | < 1,000 msg | TBD | 🎯 Target |

## Application Performance

### Node.js Transformer Optimization

#### Worker Pool Tuning

```typescript
// src/workers/worker-pool.ts
import { Worker } from 'worker_threads';
import os from 'os';

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  
  constructor(
    private readonly workerScript: string,
    private readonly poolSize: number = os.cpus().length
  ) {
    this.initializeWorkers();
  }
  
  private initializeWorkers(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      this.workers.push(worker);
    }
  }
  
  async execute<T>(task: Task): Promise<T> {
    // Use round-robin or least-busy strategy
    const worker = this.getLeastBusyWorker();
    return this.executeOnWorker(worker, task);
  }
}

// Optimal pool size calculation
const CPU_BOUND_MULTIPLIER = 1.0;  // For CPU-bound work
const IO_BOUND_MULTIPLIER = 2.0;   // For I/O-bound work

const optimalPoolSize = Math.floor(
  os.cpus().length * CPU_BOUND_MULTIPLIER
);
```

#### Memory Management

```typescript
// Enable garbage collection monitoring
node --expose-gc --max-old-space-size=2048 dist/index.js

// Implement object pooling for frequently created objects
class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  
  constructor(
    private readonly factory: () => T,
    private readonly reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }
  
  acquire(): T {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj: T): void {
    this.reset(obj);
    this.inUse.delete(obj);
    this.available.push(obj);
  }
}

// Use for transformation contexts
const contextPool = new ObjectPool(
  () => ({ data: {}, metadata: {} }),
  (ctx) => { ctx.data = {}; ctx.metadata = {}; },
  100
);
```

#### Caching Strategy

```typescript
// src/cache/mapping-cache.ts
import { LRUCache } from 'lru-cache';

const mappingCache = new LRUCache<string, CompiledMapping>({
  max: 500,  // Maximum number of mappings
  maxSize: 50 * 1024 * 1024,  // 50MB
  sizeCalculation: (mapping) => JSON.stringify(mapping).length,
  ttl: 1000 * 60 * 60,  // 1 hour
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

// Schema cache
const schemaCache = new LRUCache<string, CompiledSchema>({
  max: 500,
  maxSize: 10 * 1024 * 1024,  // 10MB
  ttl: 1000 * 60 * 60,  // 1 hour
});

// Preload frequently used mappings
async function preloadCache(): Promise<void> {
  const frequentPartners = await getFrequentPartners();
  for (const partner of frequentPartners) {
    const mapping = await loadMapping(partner.id);
    mappingCache.set(partner.id, mapping);
  }
}
```

### Java Business Service Optimization

#### JVM Tuning

```bash
# JVM flags for optimal performance
JAVA_OPTS="
  -Xms2g
  -Xmx4g
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
  -XX:ParallelGCThreads=8
  -XX:ConcGCThreads=2
  -XX:InitiatingHeapOccupancyPercent=45
  -XX:+UseStringDeduplication
  -XX:+OptimizeStringConcat
  -XX:+UseCompressedOops
  -XX:+UseCompressedClassPointers
  -XX:+AlwaysPreTouch
  -XX:+DisableExplicitGC
  -Djava.security.egd=file:/dev/./urandom
"
```

#### Connection Pool Tuning

```properties
# application.properties

# HikariCP configuration
quarkus.datasource.jdbc.max-size=50
quarkus.datasource.jdbc.min-size=10
quarkus.datasource.jdbc.initial-size=10

# Connection timeout (30 seconds)
quarkus.datasource.jdbc.acquisition-timeout=30

# Idle timeout (10 minutes)
quarkus.datasource.jdbc.idle-removal-interval=10M
quarkus.datasource.jdbc.max-lifetime=30M

# Validation
quarkus.datasource.jdbc.validation-query-sql=SELECT 1
quarkus.datasource.jdbc.leak-detection-threshold=60000

# Statement cache
quarkus.datasource.jdbc.statement-cache-size=250
```

#### Batch Processing

```java
// Batch insert for better performance
@Transactional
public void saveOrders(List<Order> orders) {
    final int batchSize = 100;
    
    for (int i = 0; i < orders.size(); i++) {
        entityManager.persist(orders.get(i));
        
        if (i % batchSize == 0 && i > 0) {
            entityManager.flush();
            entityManager.clear();
        }
    }
    
    entityManager.flush();
    entityManager.clear();
}

// Batch configuration
spring.jpa.properties.hibernate.jdbc.batch_size=100
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.batch_versioned_data=true
```

## Database Performance

### PostgreSQL Tuning

#### Configuration

```conf
# postgresql.conf

# Memory settings
shared_buffers = 4GB                    # 25% of RAM
effective_cache_size = 12GB             # 75% of RAM
maintenance_work_mem = 1GB
work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1                  # For SSD
effective_io_concurrency = 200          # For SSD

# Parallel query settings
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4

# Connection settings
max_connections = 200
superuser_reserved_connections = 3

# Logging
log_min_duration_statement = 1000       # Log queries > 1s
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
```

#### Index Optimization

```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
SELECT * FROM orders WHERE customer_id = '123';

-- Create appropriate indexes
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_orders_customer_status 
ON orders(customer_id, status);

-- Partial indexes for specific conditions
CREATE INDEX CONCURRENTLY idx_orders_pending 
ON orders(created_at) WHERE status = 'PENDING';

-- Index on JSONB columns
CREATE INDEX CONCURRENTLY idx_events_payload_gin 
ON events USING GIN (payload);

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- Remove unused indexes
DROP INDEX CONCURRENTLY idx_unused_index;
```

#### Query Optimization

```sql
-- Use prepared statements
PREPARE get_order (text) AS
SELECT * FROM orders WHERE order_id = $1;

EXECUTE get_order('ORD-001');

-- Use CTEs for complex queries
WITH recent_orders AS (
    SELECT * FROM orders 
    WHERE created_at > NOW() - INTERVAL '7 days'
),
order_stats AS (
    SELECT 
        customer_id,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent
    FROM recent_orders
    GROUP BY customer_id
)
SELECT * FROM order_stats WHERE order_count > 5;

-- Avoid N+1 queries - use JOINs
SELECT 
    o.*,
    c.name as customer_name,
    array_agg(oi.product_id) as products
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.created_at > NOW() - INTERVAL '7 days'
GROUP BY o.order_id, c.name;
```

#### Partitioning

```sql
-- Partition large tables by date
CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    partner_id VARCHAR(50),
    event_type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE events_2026_05 PARTITION OF events
FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE events_2026_06 PARTITION OF events
FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Create indexes on partitions
CREATE INDEX idx_events_2026_05_partner ON events_2026_05(partner_id);
CREATE INDEX idx_events_2026_06_partner ON events_2026_06(partner_id);

-- Automatic partition creation
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name := 'events_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := TO_CHAR(partition_date, 'YYYY-MM-DD');
    end_date := TO_CHAR(partition_date + INTERVAL '1 month', 'YYYY-MM-DD');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF events FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;
```

#### Vacuum and Analyze

```sql
-- Regular vacuum and analyze
VACUUM ANALYZE orders;

-- Aggressive vacuum for heavily updated tables
VACUUM FULL ANALYZE events;

-- Auto-vacuum configuration
ALTER TABLE orders SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05,
    autovacuum_vacuum_cost_delay = 10
);

-- Monitor vacuum progress
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

## Kafka Performance

### Producer Configuration

```properties
# High-throughput producer configuration
acks=1                              # Balance between throughput and durability
compression.type=lz4                # Fast compression
batch.size=32768                    # 32KB batches
linger.ms=10                        # Wait 10ms to batch messages
buffer.memory=67108864              # 64MB buffer
max.in.flight.requests.per.connection=5

# For guaranteed ordering
enable.idempotence=true
max.in.flight.requests.per.connection=1
```

### Consumer Configuration

```properties
# High-throughput consumer configuration
fetch.min.bytes=1024                # Minimum 1KB per fetch
fetch.max.wait.ms=500               # Wait max 500ms
max.partition.fetch.bytes=1048576   # 1MB per partition
max.poll.records=500                # Process 500 records per poll

# Consumer group configuration
session.timeout.ms=30000
heartbeat.interval.ms=3000
max.poll.interval.ms=300000

# Auto-commit configuration
enable.auto.commit=false            # Manual commit for better control
```

### Broker Configuration

```properties
# Broker performance tuning
num.network.threads=8
num.io.threads=16
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# Log configuration
num.partitions=12
default.replication.factor=3
min.insync.replicas=2
log.retention.hours=168             # 7 days
log.segment.bytes=1073741824        # 1GB segments
log.retention.check.interval.ms=300000

# Compression
compression.type=lz4

# Replication
replica.lag.time.max.ms=30000
replica.fetch.max.bytes=1048576
```

### Topic Optimization

```bash
# Increase partitions for higher throughput
kafka-topics.sh --bootstrap-server localhost:9092 \
  --alter --topic partner.raw.events --partitions 20

# Configure topic-specific settings
kafka-configs.sh --bootstrap-server localhost:9092 \
  --entity-type topics --entity-name partner.raw.events \
  --alter --add-config \
  compression.type=lz4,\
  min.insync.replicas=2,\
  retention.ms=604800000,\
  segment.ms=3600000
```

## Infrastructure Tuning

### Kubernetes Resource Limits

```yaml
# Optimal resource configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: transformer
spec:
  template:
    spec:
      containers:
        - name: transformer
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "4Gi"
              cpu: "2000m"
          # CPU throttling mitigation
          env:
            - name: NODE_OPTIONS
              value: "--max-old-space-size=3072"
```

### Network Optimization

```yaml
# Network policy for optimal routing
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: transformer-network-policy
spec:
  podSelector:
    matchLabels:
      app: transformer
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: kafka
      ports:
        - protocol: TCP
          port: 9092
    - to:
        - podSelector:
            matchLabels:
              app: business-service
      ports:
        - protocol: TCP
          port: 8080
```

### Storage Optimization

```yaml
# Use high-performance storage class
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "16000"
  throughput: "1000"
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

## Monitoring Performance

### Key Metrics to Track

```promql
# Throughput
rate(transformation_success_total[5m])

# Latency percentiles
histogram_quantile(0.50, rate(transformation_duration_ms_bucket[5m]))
histogram_quantile(0.95, rate(transformation_duration_ms_bucket[5m]))
histogram_quantile(0.99, rate(transformation_duration_ms_bucket[5m]))

# Error rate
rate(transformation_error_total[5m]) / rate(transformation_success_total[5m])

# Consumer lag
kafka_consumer_lag

# CPU usage
rate(container_cpu_usage_seconds_total[5m]) * 100

# Memory usage
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Database query time
histogram_quantile(0.99, rate(pg_stat_statements_mean_exec_time_bucket[5m]))
```

## Performance Testing

### Load Test Script

```javascript
// k6 load test
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const transformDuration = new Trend('transform_duration');

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Steady state
    { duration: '2m', target: 200 },   // Spike
    { duration: '5m', target: 200 },   // Steady state
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200', 'p(99)<500'],
    'errors': ['rate<0.01'],
    'transform_duration': ['p(95)<100', 'p(99)<200'],
  },
};

export default function () {
  const payload = JSON.stringify({
    eventId: `evt-${Date.now()}-${__VU}-${__ITER}`,
    partnerId: 'test-partner',
    eventType: 'OrderCreated',
    payload: {
      order_id: `ORD-${Date.now()}`,
      customer_id: `CUST-${__VU}`,
      amount: Math.random() * 1000,
    },
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const start = Date.now();
  const res = http.post('http://transformer-service/transform', payload, params);
  const duration = Date.now() - start;

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  transformDuration.add(duration);

  sleep(0.1);
}
```

## Best Practices

### Application Level

1. **Use Connection Pooling**: Reuse connections
2. **Implement Caching**: Cache frequently accessed data
3. **Batch Operations**: Process in batches when possible
4. **Async Processing**: Use async/await for I/O operations
5. **Optimize Algorithms**: Use efficient data structures

### Database Level

1. **Create Proper Indexes**: Index frequently queried columns
2. **Optimize Queries**: Use EXPLAIN ANALYZE
3. **Partition Large Tables**: Partition by date or key
4. **Regular Maintenance**: VACUUM and ANALYZE regularly
5. **Monitor Slow Queries**: Log and optimize slow queries

### Infrastructure Level

1. **Right-Size Resources**: Don't over or under-provision
2. **Use Fast Storage**: SSD for databases and Kafka
3. **Optimize Network**: Minimize network hops
4. **Enable Compression**: Compress data in transit
5. **Monitor Continuously**: Track performance metrics

## Next Steps

1. **Baseline Performance**: Measure current performance
2. **Identify Bottlenecks**: Use profiling tools
3. **Apply Optimizations**: Implement tuning recommendations
4. **Load Test**: Verify improvements under load
5. **Monitor Continuously**: Track performance over time

## See Also

- [Scaling Guide](./04-scaling.md)
- [Monitoring Dashboards](./01-monitoring-dashboards.md)
- [Troubleshooting Guide](./03-troubleshooting.md)
- [Runbook](./08-runbook.md)

---

**Last Updated**: May 10, 2026  
**Version**: 1.0
