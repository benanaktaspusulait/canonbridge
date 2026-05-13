#!/bin/bash

# Test script for mock service mappings
# This script sends test payloads to verify mappings work correctly

set -e

MOCK_BASE_URL="${MOCK_BASE_URL:-http://localhost:8080}"
WEBHOOK_BASE_URL="${WEBHOOK_BASE_URL:-http://localhost:3000}"
KAFKA_BOOTSTRAP="${KAFKA_BOOTSTRAP:-localhost:9092}"

echo "========================================="
echo "Mock Service Mapping Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test PayFlex webhook
test_payflex_webhook() {
    echo -e "${YELLOW}Test 1: PayFlex Payment Webhook${NC}"
    
    PAYLOAD='{
  "transactionId": "TXN-20260513-001",
  "merchantId": "MERCH-001",
  "amount": 149.99,
  "currency": "USD",
  "status": "SUCCESS",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "4242",
  "cardBrand": "VISA",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "billingAddress": {
    "street": "456 Payment St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "metadata": {
    "orderId": "ORD-12345",
    "invoiceNumber": "INV-67890"
  },
  "timestamp": "2026-05-13T10:30:00Z"
}'
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOCK_BASE_URL}/webhook/payflex/payment" \
        -H "Content-Type: application/json" \
        -H "X-Webhook-Key: payflex-secret-key" \
        -d "$PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "202" ]; then
        echo -e "${GREEN}✓ PayFlex webhook test passed${NC}"
        echo "Response: $BODY"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ PayFlex webhook test failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $BODY"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Function to test FastCargo SOAP
test_fastcargo_soap() {
    echo -e "${YELLOW}Test 2: FastCargo SOAP Tracking${NC}"
    
    SOAP_REQUEST='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:trac="http://fastcargo.com/tracking">
   <soapenv:Header>
      <trac:Authentication>
         <trac:username>fastcargo-demo</trac:username>
         <trac:password>fastcargo-secret</trac:password>
      </trac:Authentication>
   </soapenv:Header>
   <soapenv:Body>
      <trac:GetShipmentStatusRequest>
         <trac:trackingNumber>FC123456789</trac:trackingNumber>
      </trac:GetShipmentStatusRequest>
   </soapenv:Body>
</soapenv:Envelope>'
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOCK_BASE_URL}/ws/track" \
        -H "Content-Type: text/xml" \
        -H "SOAPAction: getShipmentStatus" \
        --user "fastcargo-demo:fastcargo-secret" \
        -d "$SOAP_REQUEST")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ FastCargo SOAP test passed${NC}"
        echo "Response (truncated): $(echo "$BODY" | head -c 200)..."
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FastCargo SOAP test failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $BODY"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Function to test ShopMax Kafka event
test_shopmax_kafka() {
    echo -e "${YELLOW}Test 3: ShopMax Kafka Order Event${NC}"
    
    KAFKA_PAYLOAD='{
  "eventId": "sm-550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-13T10:30:00Z",
  "eventType": "order.created",
  "orderId": "ORD-20260513-001",
  "customerId": "CUST-12345",
  "customerEmail": "customer@shopmax.com",
  "items": [
    {
      "sku": "PROD-001",
      "name": "Wireless Headphones",
      "category": "Electronics",
      "quantity": 1,
      "unitPrice": 79.99,
      "totalPrice": 79.99,
      "taxAmount": 6.40
    },
    {
      "sku": "PROD-002",
      "name": "USB-C Cable",
      "category": "Accessories",
      "quantity": 2,
      "unitPrice": 9.99,
      "totalPrice": 19.98,
      "taxAmount": 1.60
    }
  ],
  "subtotal": 99.97,
  "taxTotal": 8.00,
  "shippingCost": 5.99,
  "totalAmount": 113.96,
  "currency": "USD",
  "paymentMethod": "CREDIT_CARD",
  "paymentStatus": "PAID",
  "shippingAddress": {
    "recipientName": "Jane Doe",
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA",
    "phone": "+1-415-555-0123"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "shippingMethod": "STANDARD",
  "estimatedDelivery": "2026-05-17T18:00:00Z",
  "notes": "Please leave at front door",
  "source": "WEB",
  "metadata": {
    "campaignId": "SPRING2026",
    "referrer": "google_ads"
  }
}'
    
    # Check if kafka is available
    if command -v docker &> /dev/null; then
        echo "$KAFKA_PAYLOAD" | docker exec -i canonbridge-kafka kafka-console-producer.sh \
            --bootstrap-server localhost:9092 \
            --topic partner.shopmax.raw 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ ShopMax Kafka event sent successfully${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}✗ ShopMax Kafka event failed${NC}"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${YELLOW}⊘ Docker not available, skipping Kafka test${NC}"
    fi
    echo ""
}

# Function to test PayFlex failed payment
test_payflex_failed_payment() {
    echo -e "${YELLOW}Test 4: PayFlex Failed Payment${NC}"
    
    PAYLOAD='{
  "transactionId": "TXN-20260513-002",
  "merchantId": "MERCH-001",
  "amount": 299.99,
  "currency": "USD",
  "status": "FAILED",
  "paymentMethod": "CREDIT_CARD",
  "cardLast4": "0002",
  "errorCode": "INSUFFICIENT_FUNDS",
  "errorMessage": "Card declined due to insufficient funds",
  "customerEmail": "customer@example.com",
  "timestamp": "2026-05-13T10:35:00Z"
}'
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOCK_BASE_URL}/webhook/payflex/payment" \
        -H "Content-Type: application/json" \
        -H "X-Webhook-Key: payflex-secret-key" \
        -d "$PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "202" ]; then
        echo -e "${GREEN}✓ PayFlex failed payment test passed${NC}"
        echo "Response: $BODY"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ PayFlex failed payment test failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $BODY"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Function to test FastCargo delivered status
test_fastcargo_delivered() {
    echo -e "${YELLOW}Test 5: FastCargo Delivered Status${NC}"
    
    SOAP_REQUEST='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:trac="http://fastcargo.com/tracking">
   <soapenv:Header>
      <trac:Authentication>
         <trac:username>fastcargo-demo</trac:username>
         <trac:password>fastcargo-secret</trac:password>
      </trac:Authentication>
   </soapenv:Header>
   <soapenv:Body>
      <trac:GetShipmentStatusRequest>
         <trac:trackingNumber>FC987654321</trac:trackingNumber>
      </trac:GetShipmentStatusRequest>
   </soapenv:Body>
</soapenv:Envelope>'
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${MOCK_BASE_URL}/ws/track" \
        -H "Content-Type: text/xml" \
        -H "SOAPAction: getShipmentStatus" \
        --user "fastcargo-demo:fastcargo-secret" \
        -d "$SOAP_REQUEST")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "DELIVERED"; then
        echo -e "${GREEN}✓ FastCargo delivered status test passed${NC}"
        echo "Response contains DELIVERED status"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FastCargo delivered status test failed (HTTP $HTTP_CODE)${NC}"
        echo "Response: $BODY"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Run all tests
echo "Starting tests..."
echo ""

test_payflex_webhook
test_payflex_failed_payment
test_fastcargo_soap
test_fastcargo_delivered
test_shopmax_kafka

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed ✗${NC}"
    exit 1
fi
