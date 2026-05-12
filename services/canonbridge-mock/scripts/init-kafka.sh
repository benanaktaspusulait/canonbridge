#!/bin/bash
set -e

echo "🔧 Initializing Kafka topics for CanonBridge Mock..."

KAFKA_CONTAINER="canonbridge-kafka"
BOOTSTRAP_SERVER="localhost:9092"

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
until docker exec $KAFKA_CONTAINER kafka-broker-api-versions.sh --bootstrap-server $BOOTSTRAP_SERVER > /dev/null 2>&1; do
  echo "   Kafka not ready yet, waiting..."
  sleep 2
done
echo "✅ Kafka is ready!"

# Function to create topic if it doesn't exist
create_topic() {
  local topic=$1
  local partitions=${2:-1}
  local replication=${3:-1}
  local retention=${4:-604800000}  # 7 days default
  
  echo "📝 Creating topic: $topic (partitions=$partitions, replication=$replication, retention=${retention}ms)"
  
  docker exec $KAFKA_CONTAINER kafka-topics.sh \
    --bootstrap-server $BOOTSTRAP_SERVER \
    --create \
    --if-not-exists \
    --topic $topic \
    --partitions $partitions \
    --replication-factor $replication \
    --config retention.ms=$retention \
    --config segment.ms=3600000
}

# Create topics according to design.md

# 1. PayFlex Webhook → Raw Events
create_topic "partner.payflex.raw" 1 1 604800000

# 2. FastCargo Scheduled Poll → Raw Events  
create_topic "cargo.updates" 1 1 604800000

# 3. ShopMax Kafka Direct → Raw Events
create_topic "partner.shopmax.raw" 1 1 604800000

# 4. Canonical Events (after transformation)
create_topic "canonical.payment.completed" 1 1 2592000000  # 30 days
create_topic "canonical.shipment.updated" 1 1 2592000000
create_topic "canonical.order.created" 1 1 2592000000

# 5. DLQ Topics
create_topic "dlq.transformation.failed" 1 1 2592000000
create_topic "dlq.validation.failed" 1 1 2592000000

# 6. Retry Topics
create_topic "retry.transformation" 1 1 86400000  # 1 day

echo ""
echo "✅ All topics created successfully!"
echo ""
echo "📋 Topic List:"
docker exec $KAFKA_CONTAINER kafka-topics.sh \
  --bootstrap-server $BOOTSTRAP_SERVER \
  --list

echo ""
echo "🎉 Kafka initialization complete!"
