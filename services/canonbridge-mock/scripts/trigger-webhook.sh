#!/bin/bash

# Script to manually trigger a webhook event

BASE_URL="${1:-http://localhost:8080}"
WEBHOOK_API_KEY="${WEBHOOK_API_KEY:-payflex-secret-key}"

echo "Triggering PayFlex payment webhook..."

WEBHOOK_PAYLOAD='{
  "eventId": "evt_'$(date +%s)'",
  "eventType": "PAYMENT_CONFIRMED",
  "paymentId": "PAY-'$(uuidgen | cut -d'-' -f1)'",
  "merchantId": "MERCH-12345",
  "status": "CONFIRMED",
  "amount": '$(shuf -i 100-5000 -n 1)'.50,
  "currency": "EUR",
  "confirmedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "signature": "demo_signature_'$(date +%s)'"
}'

echo "Payload:"
echo "${WEBHOOK_PAYLOAD}" | jq '.'
echo ""

RESPONSE=$(curl -s -X POST "${BASE_URL}/webhook/payment" \
  -H "X-Webhook-Key: ${WEBHOOK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "${WEBHOOK_PAYLOAD}")

echo "Response:"
echo "${RESPONSE}" | jq '.'
echo ""
echo "✅ Webhook sent successfully"
