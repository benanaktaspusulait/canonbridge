# Kafka Security Configuration (X-Y2)

## Problem

All services connect to Kafka via `PLAINTEXT` with no authentication.
Any service can read/write any topic — no topic-level authorization.

## Solution: SASL_SCRAM + ACL

### 1. Broker Configuration

```properties
# server.properties (per broker)
listeners=SASL_PLAINTEXT://0.0.0.0:9092
security.inter.broker.protocol=SASL_PLAINTEXT
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-256
sasl.enabled.mechanisms=SCRAM-SHA-256

# ACL authorizer
authorizer.class.name=kafka.security.authorizer.AclAuthorizer
super.users=User:admin
allow.everyone.if.no.acl.found=false
```

### 2. Create Service Users

```bash
# Create users for each service
kafka-configs.sh --bootstrap-server localhost:9092 \
  --alter --add-config 'SCRAM-SHA-256=[password=<secure-password>]' \
  --entity-type users --entity-name mapping-studio-api

kafka-configs.sh --bootstrap-server localhost:9092 \
  --alter --add-config 'SCRAM-SHA-256=[password=<secure-password>]' \
  --entity-type users --entity-name billing-service

kafka-configs.sh --bootstrap-server localhost:9092 \
  --alter --add-config 'SCRAM-SHA-256=[password=<secure-password>]' \
  --entity-type users --entity-name webhook-receiver

kafka-configs.sh --bootstrap-server localhost:9092 \
  --alter --add-config 'SCRAM-SHA-256=[password=<secure-password>]' \
  --entity-type users --entity-name transformer
```

### 3. ACL Configuration

```bash
# mapping-studio-api: produce to canonical.events, usage.events; consume raw-events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:mapping-studio-api \
  --producer --topic canonical.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:mapping-studio-api \
  --producer --topic usage.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:mapping-studio-api \
  --consumer --topic partner.raw.events --group mapping-studio-api

# billing-service: consume usage.events; produce billing.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:billing-service \
  --consumer --topic usage.events --group billing-service
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:billing-service \
  --producer --topic billing.events

# webhook-receiver: produce to partner.raw.events, usage.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:webhook-receiver \
  --producer --topic partner.raw.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:webhook-receiver \
  --producer --topic usage.events

# transformer: consume partner.raw.events; produce canonical.events, usage.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:transformer \
  --consumer --topic partner.raw.events --group transformer
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:transformer \
  --producer --topic canonical.events
kafka-acls.sh --bootstrap-server localhost:9092 --add \
  --allow-principal User:transformer \
  --producer --topic usage.events
```

### 4. Service Configuration

Add to each service's `application.properties` (Quarkus):

```properties
kafka.security.protocol=${KAFKA_SECURITY_PROTOCOL:PLAINTEXT}
kafka.sasl.mechanism=${KAFKA_SASL_MECHANISM:}
kafka.sasl.jaas.config=${KAFKA_SASL_JAAS_CONFIG:}
```

For production:

```bash
KAFKA_SECURITY_PROTOCOL=SASL_PLAINTEXT
KAFKA_SASL_MECHANISM=SCRAM-SHA-256
KAFKA_SASL_JAAS_CONFIG='org.apache.kafka.common.security.scram.ScramLoginModule required username="billing-service" password="<secure-password>";'
```

For transformer (Node.js), add to Kafka client config:

```typescript
const kafka = new Kafka({
  brokers: env.kafkaBrokers,
  sasl: env.kafkaSaslEnabled ? {
    mechanism: 'scram-sha-256',
    username: env.kafkaUsername,
    password: env.kafkaPassword,
  } : undefined,
});
```

### 5. Migration Plan

1. **Phase 1**: Add SASL users and ACLs with `allow.everyone.if.no.acl.found=true`
2. **Phase 2**: Update all services to use SASL credentials
3. **Phase 3**: Set `allow.everyone.if.no.acl.found=false` (enforce)
4. **Phase 4**: Switch to `SASL_SSL` for encryption in transit

### Rollback

Set `allow.everyone.if.no.acl.found=true` to immediately restore open access.
