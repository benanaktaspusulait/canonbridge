#!/bin/bash

# CanonBridge Mock Demo Script
# This script demonstrates the 5-step demo flow

set -e

BASE_URL="http://localhost:8080"
PAYFLEX_API_KEY="demo-api-key-12345"
SHOPMAX_CLIENT_ID="shopmax-demo-client"
SHOPMAX_CLIENT_SECRET="shopmax-demo-secret"
FASTCARGO_USERNAME="fastcargo-demo"
FASTCARGO_PASSWORD="fastcargo-secret"
WEBHOOK_API_KEY="payflex-secret-key"

echo "=========================================="
echo "CanonBridge Mock Service Demo"
echo "=========================================="
echo ""

# Check if service is running
echo "Checking if service is running..."
if ! curl -s -f "${BASE_URL}/actuator/health" > /dev/null; then
    echo "❌ Error: CanonBridge Mock service is not running!"
    echo "Please start it with: docker-compose up -d"
    exit 1
fi
echo "✅ Service is running"
echo ""

sleep 2

# Step 1: ShopMax Kafka Order Event
echo "=========================================="
echo "Step 1: ShopMax Kafka Order Event"
echo "=========================================="
echo "Kafka events are automatically generated every 30 seconds."
echo "Check Kafka topic: partner.shopmax.raw"
echo ""
sleep 3

# Step 2: PayFlex REST Successful Response
echo "=========================================="
echo "Step 2: PayFlex REST API - Successful Payment Query"
echo "=========================================="
echo "Calling PayFlex API with valid API key..."
echo ""

PAYFLEX_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/payments/latest" \
  -H "X-API-Key: ${PAYFLEX_API_KEY}" \
  -H "Content-Type: application/json")

echo "Response:"
echo "${PAYFLEX_RESPONSE}" | jq '.'
echo ""
echo "✅ Successfully retrieved payment data"
echo ""
sleep 3

# Step 3: FastCargo SOAP Successful Response
echo "=========================================="
echo "Step 3: FastCargo SOAP API - Tracking Query"
echo "=========================================="
echo "Calling FastCargo SOAP service with Basic Auth..."
echo ""

SOAP_REQUEST='<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:fc="http://fastcargo.com/tracking">
    <soap:Body>
        <fc:TrackShipmentRequest>
            <fc:trackingNumber>FC123456789</fc:trackingNumber>
        </fc:TrackShipmentRequest>
    </soap:Body>
</soap:Envelope>'

SOAP_RESPONSE=$(curl -s -X POST "${BASE_URL}/ws/track" \
  -u "${FASTCARGO_USERNAME}:${FASTCARGO_PASSWORD}" \
  -H "Content-Type: text/xml" \
  -d "${SOAP_REQUEST}")

echo "Response:"
echo "${SOAP_RESPONSE}" | xmllint --format -
echo ""
echo "✅ Successfully retrieved tracking data"
echo ""
sleep 3

# Step 4: PayFlex Missing Amount Error
echo "=========================================="
echo "Step 4: PayFlex API - Validation Error (Missing Amount)"
echo "=========================================="
echo "Triggering validation error scenario..."
echo ""

ERROR_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/payments/query?scenario=missing-amount" \
  -H "X-API-Key: ${PAYFLEX_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response:"
echo "${ERROR_RESPONSE}" | jq '.'
echo ""
echo "✅ Validation error demonstrated (for DLQ/retry testing)"
echo ""
sleep 3

# Step 5: PayFlex Webhook
echo "=========================================="
echo "Step 5: PayFlex Payment Webhook"
echo "=========================================="
echo "Sending payment confirmation webhook..."
echo ""

WEBHOOK_PAYLOAD='{
  "eventId": "evt_'$(date +%s)'",
  "eventType": "PAYMENT_CONFIRMED",
  "paymentId": "PAY-DEMO-001",
  "merchantId": "MERCH-12345",
  "status": "CONFIRMED",
  "amount": 1250.50,
  "currency": "EUR",
  "confirmedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "signature": "demo_signature_'$(date +%s)'"
}'

WEBHOOK_RESPONSE=$(curl -s -X POST "${BASE_URL}/webhook/payment" \
  -H "X-Webhook-Key: ${WEBHOOK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${WEBHOOK_PAYLOAD}")

echo "Response:"
echo "${WEBHOOK_RESPONSE}" | jq '.'
echo ""

# List received webhooks
echo "Listing received webhooks..."
WEBHOOKS=$(curl -s -X GET "${BASE_URL}/webhooks?limit=5" \
  -H "X-Webhook-Key: ${WEBHOOK_API_KEY}")
echo "${WEBHOOKS}" | jq '.'
echo ""
echo "✅ Webhook received and stored"
echo ""

# Bonus: ShopMax OAuth2 Flow
echo "=========================================="
echo "Bonus: ShopMax OAuth2 Client Credentials Flow"
echo "=========================================="
echo "Getting access token..."
echo ""

TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/oauth/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=${SHOPMAX_CLIENT_ID}" \
  -d "client_secret=${SHOPMAX_CLIENT_SECRET}")

echo "Token Response:"
echo "${TOKEN_RESPONSE}" | jq '.'
echo ""

ACCESS_TOKEN=$(echo "${TOKEN_RESPONSE}" | jq -r '.access_token')

echo "Using access token to fetch orders..."
ORDERS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/orders/recent" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Orders Response:"
echo "${ORDERS_RESPONSE}" | jq '.'
echo ""
echo "✅ OAuth2 flow completed successfully"
echo ""

# Summary
echo "=========================================="
echo "Demo Summary"
echo "=========================================="
echo "✅ Step 1: Kafka events are being generated automatically"
echo "✅ Step 2: PayFlex REST API - Successful payment query"
echo "✅ Step 3: FastCargo SOAP API - Successful tracking query"
echo "✅ Step 4: PayFlex API - Validation error scenario"
echo "✅ Step 5: PayFlex Webhook - Payment confirmation received"
echo "✅ Bonus: ShopMax OAuth2 - Token obtained and used"
echo ""
echo "=========================================="
echo "All demo scenarios completed successfully!"
echo "=========================================="
echo ""
echo "Additional endpoints to explore:"
echo "- PayFlex flat format: GET ${BASE_URL}/api/payments/latest?format=flat"
echo "- PayFlex rate limit: POST ${BASE_URL}/api/payments/query?scenario=rate-limit"
echo "- PayFlex server error: POST ${BASE_URL}/api/payments/query?scenario=server-error"
echo "- ShopMax compact format: GET ${BASE_URL}/api/orders/recent?format=compact"
echo "- ShopMax unavailable: GET ${BASE_URL}/api/orders/recent?scenario=unavailable"
echo "- FastCargo WSDL: GET ${BASE_URL}/ws/fastcargo.wsdl with Basic Auth"
echo "- FastCargo not found: Use tracking number 'UNKNOWN-123'"
echo ""
