#!/bin/bash
set -e

echo "🎬 CanonBridge Mock - Full Sales Demo"
echo "======================================"
echo ""

MOCK_URL="http://localhost:8080"
KAFKA_CONTAINER="canonbridge-kafka"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

step() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}STEP $1: $2${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

pause() {
  echo ""
  echo -e "${YELLOW}Press ENTER to continue...${NC}"
  read
}

# Check if services are running
echo "🔍 Checking if services are running..."
if ! docker ps | grep -q canonbridge-kafka; then
  echo "❌ Kafka is not running. Please start with: docker-compose up -d"
  exit 1
fi

if ! docker ps | grep -q canonbridge-mock; then
  echo "❌ CanonBridge Mock is not running. Please start with: docker-compose up -d"
  exit 1
fi

echo "✅ All services are running!"
pause

# ============================================================================
step "1" "PayFlex Webhook - Payment Completed"
# ============================================================================

echo "📝 Scenario: Customer completes payment via PayFlex"
echo "   Source: Webhook (HTTP POST)"
echo "   Target Topic: partner.payflex.raw"
echo ""

PAYMENT_PAYLOAD=$(cat <<EOF
{
  "transactionId": "TXN-$(date +%s)",
  "merchantId": "MERCH-001",
  "amount": 149.99,
  "currency": "USD",
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "4242",
  "customerEmail": "demo@example.com",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

echo "📤 Sending webhook to: $MOCK_URL/webhook/payment"
echo "$PAYMENT_PAYLOAD" | jq .

RESPONSE=$(curl -s -X POST "$MOCK_URL/webhook/payment" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: payflex-secret-key" \
  -d "$PAYMENT_PAYLOAD")

echo ""
echo "📥 Response:"
echo "$RESPONSE" | jq .

echo ""
echo "✅ Webhook received and published to Kafka!"
pause

# ============================================================================
step "2" "FastCargo SOAP - Shipment Tracking"
# ============================================================================

echo "📝 Scenario: Query shipment status via SOAP API"
echo "   Source: SOAP/XML (Scheduled Poll)"
echo "   Endpoint: /ws/track"
echo ""

TRACKING_NUMBER="FC$(date +%s)"
SOAP_REQUEST=$(cat <<EOF
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:trac="http://fastcargo.com/tracking">
   <soapenv:Header/>
   <soapenv:Body>
      <trac:GetShipmentStatusRequest>
         <trac:trackingNumber>$TRACKING_NUMBER</trac:trackingNumber>
      </trac:GetShipmentStatusRequest>
   </soapenv:Body>
</soapenv:Envelope>
EOF
)

echo "📤 Sending SOAP request to: $MOCK_URL/ws/track"
echo "$SOAP_REQUEST"

SOAP_RESPONSE=$(curl -s -X POST "$MOCK_URL/ws/track" \
  -H "Content-Type: text/xml" \
  -H "SOAPAction: getShipmentStatus" \
  -d "$SOAP_REQUEST")

echo ""
echo "📥 SOAP Response:"
echo "$SOAP_RESPONSE" | xmllint --format -

echo ""
echo "✅ SOAP response received!"
pause

# ============================================================================
step "3" "ShopMax Kafka - Direct Event Stream"
# ============================================================================

echo "📝 Scenario: ShopMax publishes order directly to Kafka"
echo "   Source: Kafka Topic (partner.shopmax.raw)"
echo "   Method: Direct Kafka Producer"
echo ""

ORDER_EVENT=$(cat <<EOF
{
  "eventId": "sm-$(uuidgen | tr '[:upper:]' '[:lower:]')",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "eventType": "order.created",
  "orderId": "ORD-$(date +%s)",
  "customerId": "CUST-12345",
  "items": [
    {
      "sku": "PROD-001",
      "name": "Wireless Headphones",
      "quantity": 1,
      "price": 79.99
    }
  ],
  "totalAmount": 79.99,
  "status": "PENDING"
}
EOF
)

echo "📤 Publishing to Kafka topic: partner.shopmax.raw"
echo "$ORDER_EVENT" | jq .

echo "$ORDER_EVENT" | docker exec -i $KAFKA_CONTAINER kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic partner.shopmax.raw

echo ""
echo "✅ Event published to Kafka!"
pause

# ============================================================================
step "4" "REST API - PayFlex Transaction Query"
# ============================================================================

echo "📝 Scenario: Query transaction details via REST API"
echo "   Source: REST GET"
echo "   Endpoint: /api/payflex/transactions/{id}"
echo ""

TRANSACTION_ID="TXN-12345"
echo "📤 Querying: $MOCK_URL/api/payments/latest"

REST_RESPONSE=$(curl -s -X GET "$MOCK_URL/api/payments/latest" \
  -H "X-API-Key: demo-api-key-12345")

echo ""
echo "📥 Response:"
echo "$REST_RESPONSE" | jq .

echo ""
echo "✅ REST API response received!"
pause

# ============================================================================
step "5" "Verify Kafka Topics"
# ============================================================================

echo "📝 Scenario: Verify all events are in Kafka topics"
echo ""

echo "📊 Listing all topics:"
docker exec $KAFKA_CONTAINER kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --list

echo ""
echo "📈 Topic message counts:"
for topic in partner.payflex.raw cargo.updates partner.shopmax.raw; do
  count=$(docker exec $KAFKA_CONTAINER kafka-run-class.sh kafka.tools.GetOffsetShell \
    --broker-list localhost:9092 \
    --topic $topic \
    --time -1 2>/dev/null | awk -F: '{sum += $3} END {print sum}')
  echo "   $topic: $count messages"
done

echo ""
echo "✅ All topics verified!"

# ============================================================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Demo Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📚 What happened:"
echo "   1. ✅ PayFlex webhook received and published to Kafka"
echo "   2. ✅ FastCargo SOAP API queried successfully"
echo "   3. ✅ ShopMax Kafka event published directly"
echo "   4. ✅ PayFlex REST API queried successfully"
echo "   5. ✅ All events verified in Kafka topics"
echo ""
echo "🔍 Next steps:"
echo "   • View webhook history: curl $MOCK_URL/webhooks"
echo "   • Consume Kafka events: ./scripts/consume-events.sh"
echo "   • Check health: curl $MOCK_URL/actuator/health"
echo ""
