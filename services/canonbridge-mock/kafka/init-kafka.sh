#!/bin/bash
set -e

echo "Initializing Kafka topics for CanonBridge..."

KAFKA_BROKER="${KAFKA_BROKER:-localhost:9092}"
PARTITIONS="${PARTITIONS:-1}"
REPLICATION_FACTOR="${REPLICATION_FACTOR:-1}"
RETENTION_MS="${RETENTION_MS:-604800000}"

echo "Waiting for Kafka broker to be ready..."
until kafka-topics.sh --bootstrap-server "$KAFKA_BROKER" --list &>/dev/null; do
  echo "  Kafka not ready yet, retrying in 2 seconds..."
  sleep 2
done
echo "Kafka broker is ready!"

create_topic() {
  local topic_name=$1
  local partitions=${2:-$PARTITIONS}
  local retention=${3:-$RETENTION_MS}

  if kafka-topics.sh --bootstrap-server "$KAFKA_BROKER" --list | grep -qx "$topic_name"; then
    echo "  Topic '$topic_name' already exists, skipping..."
  else
    echo "  Creating topic: $topic_name (partitions=$partitions, retention=${retention}ms)"
    kafka-topics.sh --bootstrap-server "$KAFKA_BROKER" \
      --create \
      --topic "$topic_name" \
      --partitions "$partitions" \
      --replication-factor "$REPLICATION_FACTOR" \
      --config retention.ms="$retention"
    echo "  Created: $topic_name"
  fi
}

echo ""
echo "Creating partner raw topics..."
create_topic "partner.payflex.raw"
create_topic "partner.shopmax.raw"
create_topic "partner.fastcargo.raw"
create_topic "partner.acme-marketplace.raw"

echo ""
echo "Creating canonical topics..."
create_topic "canonical.events"
create_topic "canonical.order.created"
create_topic "canonical.payment.captured"
create_topic "canonical.shipment.updated"

echo ""
echo "Creating system topics..."
create_topic "cargo.updates"
create_topic "webhook.events"
create_topic "canonbridge.retry.demo"
create_topic "canonbridge.dlq.demo"
create_topic "dlq.failed-events"
create_topic "outbox.events"

echo ""
echo "Kafka topic initialization complete!"
kafka-topics.sh --bootstrap-server "$KAFKA_BROKER" --list
