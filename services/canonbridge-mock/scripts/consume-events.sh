#!/bin/bash

KAFKA_CONTAINER="canonbridge-kafka"
BOOTSTRAP_SERVER="localhost:9092"

echo "📊 Kafka Event Consumer"
echo "======================="
echo ""
echo "Available topics:"
echo "  1. partner.payflex.raw"
echo "  2. cargo.updates"
echo "  3. partner.shopmax.raw"
echo "  4. canonical.payment.completed"
echo "  5. canonical.shipment.updated"
echo "  6. canonical.order.created"
echo ""
echo -n "Select topic (1-6) or enter custom topic name: "
read choice

case $choice in
  1) TOPIC="partner.payflex.raw" ;;
  2) TOPIC="cargo.updates" ;;
  3) TOPIC="partner.shopmax.raw" ;;
  4) TOPIC="canonical.payment.completed" ;;
  5) TOPIC="canonical.shipment.updated" ;;
  6) TOPIC="canonical.order.created" ;;
  *) TOPIC="$choice" ;;
esac

echo ""
echo "🔍 Consuming from topic: $TOPIC"
echo "   Press Ctrl+C to stop"
echo ""

docker exec -it $KAFKA_CONTAINER kafka-console-consumer.sh \
  --bootstrap-server $BOOTSTRAP_SERVER \
  --topic $TOPIC \
  --from-beginning \
  --property print.key=true \
  --property print.timestamp=true \
  --property key.separator=" | " \
  --formatter kafka.tools.DefaultMessageFormatter
