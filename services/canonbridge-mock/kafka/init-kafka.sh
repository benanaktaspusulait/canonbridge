#!/bin/bash
set -e

echo "🚀 Initializing Kafka topics for CanonBridge..."

KAFKA_BROKER="${KAFKA_BROKER:-localhost:9092}"
PARTITIONS="${PARTITIONS:-3}"
REPLICATION_FACTOR="${REPLICATION_FACTOR:-1}"
RETENTION_MS="${RETENTION_MS:-604800000}"  # 7 days

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka broker to be ready..."
until kafka-topics --bootstrap-server "$KAFKA_BROKER" --list &>/dev/null; do
  echo "   Kafka not ready yet, retrying in 2 seconds..."
  sleep 2
done
echo "✅ Kafka broker is ready!"

# Function to create topic if it doesn't exist
create_topic() {
  local topic_name=$1
  local partitions=${2:-$PARTITIONS}
  local retention=${3:-$RETENTION_MS}
  
  if kafka-topics --bootstrap-server "$KAFKA_BROKER" --list | grep -q "^${topic_name}$"; then
    echo "   Topic '$topic_name' already exists, skipping..."
  else
    echo "   Creating topic: $topic_name (partitions=$partitions, retention=${retention}ms)"
    kafka-topics --bootstrap-server "$KAFKA_BROKER" \
      --create \
      --topic "$topic_name" \
      --partitions "$partitions" \
      --replication-factor "$REPLICATION_FACTOR" \
      --config retention.ms="$retention" \
      --config compression.type=snappy \
      --config min.insync.replicas=1
    echo "   ✅ Created: $topic_name"
  fi
}

echo ""
echo "📋 Creating partner raw topics..."
create_topic "partner.payflex.raw" 3 604800000
create_topic "partner.shopmax.raw" 3 604800000
create_topic "partner.fastcargo.raw" 3 604800000
create_topic "partner.acme-marketplace.raw" 3 604800000

echo ""
echo "📋 Creating canonical topics..."
create_topic "canonical.events" 5 2592000000  # 30 days
create_topic "canonical.order.created" 3 2592000000
create_topic "canonical.payment.captured" 3 2592000000
create_topic "canonical.shipment.updated" 3 2592000000

echo ""
echo "📋 Creating system topics..."
create_topic "cargo.updates" 3 604800000
create_topic "webhook.events" 3 604800000
create_topic "dlq.failed-events" 3 2592000000  # 30 days for DLQ
create_topic "outbox.events" 3 604800000

echo ""
echo "📋 Listing all topics:"
kafka-topics --bootstrap-server "$KAFKA_BROKER" --list

echo ""
echo "✅ Kafka topic initialization complete!"
echo ""
echo "📊 Topic details:"
kafka-topics --bootstrap-server "$KAFKA_BROKER" --describe
