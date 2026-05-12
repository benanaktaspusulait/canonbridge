#!/bin/bash
set -e

KAFKA_CONTAINER="canonbridge-kafka"
BOOTSTRAP_SERVER="localhost:9092"

echo "🚀 Sending mock events to Kafka topics..."

# Function to send event to Kafka
send_event() {
  local topic=$1
  local key=$2
  local payload=$3
  
  echo "📤 Sending to $topic (key: $key)"
  echo "$payload" | docker exec -i $KAFKA_CONTAINER kafka-console-producer.sh \
    --bootstrap-server $BOOTSTRAP_SERVER \
    --topic $topic \
    --property "key.separator=:" \
    --property "parse.key=true" <<< "$key:$payload"
}

# 1. PayFlex Payment Event
PAYFLEX_PAYMENT=$(cat <<EOF
{
  "eventId": "pf-$(uuidgen | tr '[:upper:]' '[:lower:]')",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "eventType": "payment.completed",
  "payload": {
    "transactionId": "TXN-$(date +%s)",
    "merchantId": "MERCH-001",
    "amount": 149.99,
    "currency": "USD",
    "status": "SUCCESS",
    "paymentMethod": "CREDIT_CARD",
    "cardLast4": "4242",
    "customerEmail": "customer@example.com"
  }
}
EOF
)
send_event "partner.payflex.raw" "payflex:payment" "$PAYFLEX_PAYMENT"

# 2. FastCargo Shipment Update
FASTCARGO_SHIPMENT=$(cat <<EOF
{
  "eventId": "fc-$(uuidgen | tr '[:upper:]' '[:lower:]')",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "eventType": "shipment.updated",
  "payload": {
    "trackingNumber": "FC$(date +%s)",
    "status": "IN_TRANSIT",
    "location": "Distribution Center - NYC",
    "estimatedDelivery": "$(date -u -d '+2 days' +%Y-%m-%dT%H:%M:%SZ)",
    "carrier": "FastCargo Express",
    "weight": 2.5,
    "dimensions": "30x20x15cm"
  }
}
EOF
)
send_event "cargo.updates" "fastcargo:shipment" "$FASTCARGO_SHIPMENT"

# 3. ShopMax Order Event
SHOPMAX_ORDER=$(cat <<EOF
{
  "eventId": "sm-$(uuidgen | tr '[:upper:]' '[:lower:]')",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "eventType": "order.created",
  "payload": {
    "orderId": "ORD-$(date +%s)",
    "customerId": "CUST-12345",
    "items": [
      {
        "sku": "PROD-001",
        "name": "Wireless Headphones",
        "quantity": 1,
        "price": 79.99
      },
      {
        "sku": "PROD-002",
        "name": "USB-C Cable",
        "quantity": 2,
        "price": 9.99
      }
    ],
    "totalAmount": 99.97,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "USA"
    }
  }
}
EOF
)
send_event "partner.shopmax.raw" "shopmax:order" "$SHOPMAX_ORDER"

echo ""
echo "✅ All mock events sent successfully!"
echo ""
echo "📊 Verify events with:"
echo "   docker exec -it $KAFKA_CONTAINER kafka-console-consumer.sh \\"
echo "     --bootstrap-server $BOOTSTRAP_SERVER \\"
echo "     --topic partner.payflex.raw \\"
echo "     --from-beginning"
