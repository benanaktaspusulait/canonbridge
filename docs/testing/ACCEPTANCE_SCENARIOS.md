# CanonBridge — Acceptance Test Scenarios
(Subtitle: Comprehensive acceptance test plan covering all integration patterns, transformation engine, security, resilience, and observability)
(Date: 2026-05-13, Version: 1.0.0, Status: APPROVED FOR PRODUCTION)

## Table of Contents

1. Introduction & Scope
2. Quick Start Verification
3. Core Transformation Engine Scenarios
4. PayFlex Integration Scenarios (REST + API Key)
5. ShopMax Integration Scenarios (OAuth2 + Kafka)
6. FastCargo SOAP Integration Scenarios
7. Webhook Receiver Scenarios
8. WireMock Advanced Fault Scenarios
9. DLQ and Retry Scenarios
10. Mapping Studio API Scenarios
11. Validation Pipeline Scenarios
12. End-to-End Integration Flows
13. Security Scenarios
14. Performance & Load Scenarios
15. Resilience & Failure Recovery Scenarios
16. Observability Verification
17. UI Acceptance Scenarios
18. Mapping Versioning Scenarios
19. Extended Partner Scenarios (Auto-generated bulk tests)
20. Acceptance Test Checklist
21. ROI Validation Summary

---

## 1. Introduction & Scope
**Purpose**: CanonBridge Enterprise integration platform eliminates the engineering bottleneck of multi-partner integrations. Instead of custom adapter code for every partner, business users define field mappings visually and publish in minutes.
This document outlines the strict acceptance criteria to prove the $920k savings vs custom code for 50 partners.

---

## 2. Quick Start Verification
**Purpose**: Ensure the basic environment is running.
**Prerequisites**: Docker-compose up or kubernetes cluster running.
**Steps**:
```bash
curl -f http://localhost:8080/health
curl -f http://localhost:3000/health
curl -f http://localhost:8090/actuator/health
curl -f http://localhost:8091/__admin/mappings
curl -f http://localhost:8092/q/health
```
**Expected Response**: HTTP 200 OK for all.
```json
{
  "status": "UP"
}
```
**Pass Criteria**: All services return UP.
**Notes**: Required before any tests run.

---

## 3. Core Transformation Engine Scenarios

### 3.1 Happy Path: Envelope-based Resolution
**Purpose**: Verify transformation via envelope partner/event resolution.
**Prerequisites**: Transformer on port 3000.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "payflex",
  "eventType": "payment-completed",
  "data": {
    "transactionId": "TXN-20260513-001",
    "amount": "1250.50 EUR",
    "status": "COMPLETED"
  }
}'
```
**Expected Response**: HTTP 200
```json
{
  "canonical": {
    "paymentId": "TXN-20260513-001",
    "total": 1250.50,
    "currency": "EUR",
    "state": "SUCCESS"
  }
}
```
**Pass Criteria**: Response 200 and canonical output matches exact structure.
**Notes**: Strategy 1 used.

### 3.2 Happy Path: Topic-based Resolution
**Purpose**: Verify topic resolution for Kafka.
**Prerequisites**: Kafka running.
**Steps**:
```bash
# Push to topic
echo '{"transactionId":"TXN-002", "amount":"100 USD"}' | kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic tenant-001.raw.payflex.payment-completed
```
**Expected Response**: Consumed and produced to canonical topic.
```json
{
  "paymentId": "TXN-002",
  "total": 100,
  "currency": "USD"
}
```
**Pass Criteria**: Consumer commits offset, creates canonical record.
**Notes**: Topic strategy.

### 3.3 Schema Version Routing
**Purpose**: Route correctly based on version field.
**Prerequisites**: Transformer running.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "payflex",
  "eventType": "payment-completed",
  "version": "v2",
  "data": {
    "id": "TXN-2"
  }
}'
```
**Expected Response**: HTTP 200.
**Pass Criteria**: Returns 200, matching v2 mapping.
**Notes**: Version v2 specific mapping cache.

### 3.4 Multi-segment Event Types
**Purpose**: Route multi-segment `order-created.v2` events.
**Prerequisites**: Transformer running.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -d '{
  "partnerId": "test",
  "eventType": "order-created.v2",
  "data": {}
}'
```
**Expected Response**: 200 OK.
**Pass Criteria**: eventType parses correctly.
**Notes**: Multi-segment.

### 3.5 Envelope Priority Over Topic
**Purpose**: Verify envelope overrides topic.
**Prerequisites**: Transformer + Kafka.
**Steps**:
Publish envelope containing `partnerId=payflex` to `tenant-001.raw.shopmax.payment` topic.
**Expected Response**: Output uses `payflex` mapping.
**Pass Criteria**: Envelope takes precedence.
**Notes**: Critical for routing.

### 3.6 Stage Failures (resolve, input_validation, transform, output_validation - each one)
**Purpose**: Test all 4 stages of failure returning TransformResult.
**Prerequisites**: Transformer.
**Steps**:
1. Resolve failure: send invalid partnerId.
2. Input failure: violate Ajv schema.
3. Transform failure: divide by zero in JSONata.
4. Output failure: canonical missing required fields.
**Expected Response**: 
```json
{
  "error": {
    "stage": "input_validation",
    "message": "validation failed",
    "details": {}
  }
}
```
**Pass Criteria**: Stages match exactly.
**Notes**: Returns 400 for resolve, 422 for others.

### 3.7 Compile Cache Behavior
**Purpose**: Verify JSONata compilation is cached.
**Prerequisites**: Transformer.
**Steps**: Send 10 identical requests.
**Expected Response**: DurationMs of 2-10 drops significantly.
**Pass Criteria**: Latency drops, prometheus cache size metric > 0.
**Notes**: `transform_engine_cache_size`

### 3.8 Worker Pool Path
**Purpose**: CPU intensive JSONata runs on workers.
**Prerequisites**: Transformer.
**Steps**: Send complex payload.
**Expected Response**: Worker thread executes it.
**Pass Criteria**: Success under 100ms.
**Notes**: Offloads main thread.

---

## 4. PayFlex Integration Scenarios (REST + API Key)

### 4.1 Happy Path: Fetch Latest Payments
**Purpose**: Mock API fetching works.
**Prerequisites**: Mock port 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/payments/latest" \
  -H "X-API-Key: valid-key"
```
**Expected Response**: HTTP 200
```json
{
  "transactionId": "TXN-20260513-001",
  "amount": "1250.50 EUR",
  "status": "COMPLETED",
  "paymentMethod": "INSTANT_TRANSFER",
  "payer": "John Doe, IBAN DE89370400440532013000, Deutsche Bank",
  "merchant": "TechStore GmbH, MERCH-12345",
  "risk": [0.15, "LOW", ["VERIFIED_ACCOUNT","REGULAR_CUSTOMER"]],
  "settlement": ["PENDING", "BATCH-2024-05-12-001"]
}
```
**Pass Criteria**: Mock responds correctly.
**Notes**: Detailed format default.

### 4.2 Happy Path: Query Payments
**Purpose**: Query payload via POST works.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X POST "http://localhost:8090/api/payments/query" \
  -H "X-API-Key: valid-key" \
  -H "Content-Type: application/json" \
  -d '{ "status": "COMPLETED" }'
```
**Expected Response**: 200 OK array of payments.
**Pass Criteria**: Correct data format.
**Notes**: Filtered payments.

### 4.3 Flat Format Response
**Purpose**: Returns flat response via format param.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/payments/latest?format=flat" \
  -H "X-API-Key: valid-key"
```
**Expected Response**: 200 OK.
```json
{
  "id": "TXN-1",
  "amount": "1250.50",
  "currency": "EUR"
}
```
**Pass Criteria**: Flatter JSON output.
**Notes**: Used for simpler mapping.

### 4.4 Missing Amount Scenario
**Purpose**: Edge case where amount missing.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/payments/latest?scenario=missing-amount"
```
**Expected Response**: 200 OK, amount field absent.
**Pass Criteria**: Response missing amount.
**Notes**: Used to test Transformer default values.

### 4.5 Server Error (500)
**Purpose**: Simulates 500 error.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=server-error"
```
**Expected Response**: HTTP 500 Internal Server Error.
**Pass Criteria**: 500 status code returned.
**Notes**: Fault injection testing.

### 4.6 Bad Gateway (502)
**Purpose**: Simulates 502 error.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=bad-gateway"
```
**Expected Response**: HTTP 502 Bad Gateway.
**Pass Criteria**: 502 status code returned.
**Notes**: Tests upstream retries.

### 4.7 Rate Limiting (429)
**Purpose**: Simulates 429 Too Many Requests.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=rate-limit"
```
**Expected Response**: HTTP 429 Too Many Requests.
**Pass Criteria**: 429 status code returned.
**Notes**: Ensures backoff triggers.

### 4.8 Timeout Scenario (12s → 504)
**Purpose**: Simulates timeout leading to 504.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=timeout"
```
**Expected Response**: HTTP 504 Gateway Timeout after 12s.
**Pass Criteria**: Call hangs then drops 504.
**Notes**: Tests client timeout configs.

### 4.9 Slow Response (2s)
**Purpose**: Simulates 2s latency.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=slow-2s"
```
**Expected Response**: HTTP 200 OK after 2 seconds.
**Pass Criteria**: Response takes > 2000ms.
**Notes**: SLA testing.

### 4.10 Slow Response (5s)
**Purpose**: Simulates 5s latency.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=slow-5s"
```
**Expected Response**: HTTP 200 OK after 5 seconds.
**Pass Criteria**: Response takes > 5000ms.
**Notes**: SLA boundary testing.

### 4.11 Service Unavailable (503)
**Purpose**: Simulates 503 error.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=unavailable"
```
**Expected Response**: HTTP 503 Service Unavailable.
**Pass Criteria**: 503 status code returned.
**Notes**: Circuit breaker triggers.

### 4.12 Large Payload (5000 transactions)
**Purpose**: Tests max body size.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=large-payload"
```
**Expected Response**: HTTP 200 OK, huge payload array.
**Pass Criteria**: 5000 items in JSON array returned.
**Notes**: Tests transformer memory limits (2MB).

### 4.13 Deep Nested Response (10 levels)
**Purpose**: Tests recursion limits.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=deep-nested"
```
**Expected Response**: HTTP 200 OK, 10 levels deep.
**Pass Criteria**: Deeply nested JSON.
**Notes**: Avoids stack overflow.

### 4.14 Special Characters (Unicode/Emoji/SQL Injection/Null Bytes)
**Purpose**: Tests charset safety.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -i -X GET "http://localhost:8090/api/payments/latest?scenario=special-characters"
```
**Expected Response**: HTTP 200 OK. Contains: `Ünsal Çeliköz`, `日本語テスト`, `✅ COMPLETED`, `'; DROP TABLE payments; --`, `before\u0000after`.
**Pass Criteria**: JSON passes parser cleanly, strings intact.
**Notes**: Encoding testing.

### 4.15 End-to-End Transform of PayFlex Payment
**Purpose**: Complete transform of payflex payment to canonical.
**Prerequisites**: Transformer 3000, valid mapping.
**Steps**:
```bash
curl -X POST "http://localhost:3000/v1/transform" \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "payflex",
  "eventType": "payment-completed",
  "data": {
    "transactionId": "TXN-20260513-001",
    "amount": "1250.50 EUR",
    "status": "COMPLETED"
  }
}'
```
**Expected Response**: HTTP 200
```json
{
  "canonical": {
    "id": "TXN-20260513-001",
    "amount": 1250.5,
    "currency": "EUR"
  }
}
```
**Pass Criteria**: Transformer successfully applies JSONata.
**Notes**: E2E check.

---

## 5. ShopMax Integration Scenarios (OAuth2 + Kafka)

### 5.1 Happy Path: Obtain OAuth2 Token
**Purpose**: ShopMax auth works.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X POST "http://localhost:8090/oauth/token" \
  -d "grant_type=client_credentials"
```
**Expected Response**: HTTP 200
```json
{
  "access_token": "token123",
  "expires_in": 3600
}
```
**Pass Criteria**: Token issued.
**Notes**: standard OAuth2.

### 5.2 Happy Path: Fetch Recent Orders
**Purpose**: Fetch orders using token.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/orders/recent" \
  -H "Authorization: Bearer token123"
```
**Expected Response**: HTTP 200
```json
{
  "eventId": "sm-550e8400-e29b-41d4-a716-446655440000",
  "orderId": "ORD-20260513-001",
  "customerId": "CUST-12345",
  "items": ["Wireless Headphones 79.99", "USB-C Cable 9.99x2"],
  "totalAmount": "113.96 USD",
  "paymentStatus": "PAID",
  "shippingAddress": "123 Main St, San Francisco, CA 94102"
}
```
**Pass Criteria**: Successful fetch.
**Notes**: Data contains complex types.

### 5.3 Expired Token Scenario
**Purpose**: Mock issues expired token.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X POST "http://localhost:8090/oauth/token?scenario=expired-token" \
  -d "grant_type=client_credentials"
```
**Expected Response**: HTTP 200
```json
{
  "access_token": "expired_token123"
}
```
**Pass Criteria**: Token prefixed with `expired_`.
**Notes**: Setup for refresh logic.

### 5.4 Token Refresh Flow
**Purpose**: Refresh flow logic tests.
**Prerequisites**: Studio API OutboundService.
**Steps**: Send request with `expired_token123`.
**Expected Response**: 401 token_expired, Studio auto-refreshes.
**Pass Criteria**: 401 triggers token refresh and retry.
**Notes**: Validates OAuth2 auto-refresh.

### 5.5 Orders: Service Unavailable
**Purpose**: Mock 503 behavior on orders.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/orders/recent?scenario=unavailable" \
  -H "Authorization: Bearer valid"
```
**Expected Response**: HTTP 503.
**Pass Criteria**: Correct HTTP code.
**Notes**: triggers circuit breaker.

### 5.6 Orders: Rate Limiting
**Purpose**: Orders mock rate limited.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/orders/recent?scenario=rate-limit"
```
**Expected Response**: HTTP 429.
**Pass Criteria**: Correct HTTP code.
**Notes**: Check retry-after logic.

### 5.7 Orders: Slow Response (2s)
**Purpose**: Orders mock latency.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/orders/recent?scenario=slow-2s"
```
**Expected Response**: HTTP 200 after 2s.
**Pass Criteria**: Accurate delay.
**Notes**: For latency testing.

### 5.8 Orders: Slow Response (5s)
**Purpose**: Orders mock heavy latency.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/orders/recent?scenario=slow-5s"
```
**Expected Response**: HTTP 200 after 5s.
**Pass Criteria**: Accurate delay.
**Notes**: For boundary testing.

### 5.9 Expired Token Detection (401 token_expired)
**Purpose**: Checks proper status code for expired tokens.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/api/orders/recent" \
  -H "Authorization: Bearer expired_token123"
```
**Expected Response**: HTTP 401
```json
{
  "error": "token_expired"
}
```
**Pass Criteria**: 401 returned explicitly.
**Notes**: Used by OutboundService.

### 5.10 End-to-End Transform of ShopMax Order
**Purpose**: E2E check for shopmax order event.
**Prerequisites**: Transformer 3000.
**Steps**:
```bash
curl -X POST "http://localhost:3000/v1/transform" \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "shopmax",
  "eventType": "order-created",
  "data": {
    "orderId": "ORD-1",
    "totalAmount": "113.96 USD"
  }
}'
```
**Expected Response**: HTTP 200
```json
{
  "canonical": {
    "orderRef": "ORD-1",
    "totalValue": 113.96
  }
}
```
**Pass Criteria**: Correctly JSONata maps order fields.
**Notes**: E2E test.

---

## 6. FastCargo SOAP Integration Scenarios

### 6.1 Happy Path: WSDL Retrieval
**Purpose**: Retrieve FastCargo WSDL.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X GET "http://localhost:8090/ws/fastcargo.wsdl"
```
**Expected Response**: HTTP 200, Content-Type application/xml.
**Pass Criteria**: Valid WSDL XML returned.
**Notes**: Studio uses this to infer schema.

### 6.2 Happy Path: Track Shipment
**Purpose**: Call FastCargo SOAP endpoint.
**Prerequisites**: Mock 8090.
**Steps**:
```bash
curl -X POST "http://localhost:8090/ws/track" \
  -H "Content-Type: text/xml" \
  -H "Authorization: Basic dXNlcjpwYXNz" \
  -d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
       <soapenv:Body><track><trackingNumber>FC-123</trackingNumber></track></soapenv:Body>
      </soapenv:Envelope>'
```
**Expected Response**: HTTP 200
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
      <trackResponse>
         <status>DELIVERED</status>
      </trackResponse>
   </soapenv:Body>
</soapenv:Envelope>
```
**Pass Criteria**: SOAP envelope correct.
**Notes**: Basic Auth `user:pass`.

### 6.3 Invalid Basic Auth (401 SOAP Fault)
**Purpose**: Reject bad credentials.
**Prerequisites**: Mock 8090.
**Steps**: Call `/ws/track` with bad auth header.
**Expected Response**: HTTP 401 with SOAP Fault.
**Pass Criteria**: Responds 401 correctly.
**Notes**: Validates security.

### 6.4 Service Unavailable (503 SOAP Fault)
**Purpose**: Mock 503 from FastCargo.
**Prerequisites**: Mock 8090.
**Steps**: Call `/ws/track?scenario=service-unavailable`.
**Expected Response**: HTTP 503 with SOAP Fault.
**Pass Criteria**: Responds 503 correctly.
**Notes**: Tests SOAP fault handling.

### 6.5 Unknown Tracking Number (TrackingNotFound Fault)
**Purpose**: Business logic error SOAP Fault.
**Prerequisites**: Mock 8090.
**Steps**: Use trackingNumber `UNKNOWN-123`.
**Expected Response**: HTTP 200 with SOAP Fault in body or 500 TrackingNotFound.
**Pass Criteria**: Returns `TrackingNotFound` fault string.
**Notes**: Validates fault mappings.

### 6.6 Basic Auth Header Construction
**Purpose**: Verify Basic Auth generated accurately by CanonBridge.
**Prerequisites**: Mapping API.
**Steps**: Setup FastCargo outbound in Studio. Trigger ping.
**Expected Response**: Mock receives correct `Authorization: Basic ...` header.
**Pass Criteria**: Credential resolves properly.
**Notes**: Integration.

### 6.7 End-to-End Transform of FastCargo Tracking
**Purpose**: SOAP -> JSON canonical transformation.
**Prerequisites**: Transformer 3000.
**Steps**:
Send XML-to-JSON converted payload to Transformer.
```bash
curl -X POST "http://localhost:3000/v1/transform" \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "fastcargo",
  "eventType": "shipment-delivered",
  "data": {
    "trackResponse": { "status": "DELIVERED" }
  }
}'
```
**Expected Response**: 200 OK. Canonical JSON format.
**Pass Criteria**: Transforms accurately.
**Notes**: Final E2E.

---

## 7. Webhook Receiver Scenarios

### 7.1 Happy Path: Receive Webhook Event
**Purpose**: Webhook securely accepts payload.
**Prerequisites**: Webhook 8092.
**Steps**:
```bash
curl -X POST "http://localhost:8092/webhook/payflex/payment-completed" \
  -H "X-Webhook-Key: valid-key" \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'
```
**Expected Response**: HTTP 202 Accepted.
```json
{
  "eventId": "uuid-xxx",
  "message": "Webhook received and queued"
}
```
**Pass Criteria**: 202 code and JSON response.
**Notes**: Ingestion.

### 7.2 Missing X-Webhook-Key (401)
**Purpose**: Reject anonymous payloads.
**Prerequisites**: Webhook 8092.
**Steps**:
```bash
curl -X POST "http://localhost:8092/webhook/payflex/payment-completed" \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'
```
**Expected Response**: HTTP 401 Unauthorized.
```json
{
  "error": "X-Webhook-Key header is required"
}
```
**Pass Criteria**: 401 HTTP code.
**Notes**: Base security.

### 7.3 Invalid Webhook Key (401)
**Purpose**: Reject invalid keys using constant time compare.
**Prerequisites**: Webhook 8092.
**Steps**:
```bash
curl -X POST "http://localhost:8092/webhook/payflex/payment-completed" \
  -H "X-Webhook-Key: wrong-key" \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'
```
**Expected Response**: HTTP 401 Unauthorized.
```json
{
  "error": "Invalid webhook key"
}
```
**Pass Criteria**: 401 HTTP code.
**Notes**: Security layer.

### 7.4 HMAC Signature Verification (Valid)
**Purpose**: Verify `X-Webhook-Signature`.
**Prerequisites**: Webhook 8092.
**Steps**:
```bash
curl -X POST "http://localhost:8092/webhook/payflex/payment-completed" \
  -H "X-Webhook-Key: valid-key" \
  -H "X-Webhook-Signature: sha256=<correct-hash>" \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'
```
**Expected Response**: HTTP 202 Accepted.
**Pass Criteria**: Accepts valid signature.
**Notes**: HMAC-SHA256 validation check.

### 7.5 HMAC Signature Mismatch (401)
**Purpose**: Reject tampered payload.
**Prerequisites**: Webhook 8092.
**Steps**: Send valid key but wrong HMAC signature.
**Expected Response**: HTTP 401 Unauthorized.
**Pass Criteria**: Rejects signature mismatch.
**Notes**: Protects against MITM.

### 7.6 Large Payload Rejection (>2MB)
**Purpose**: Prevent DoS with large payloads.
**Prerequisites**: Webhook 8092.
**Steps**: Send 3MB JSON payload.
**Expected Response**: HTTP 413 Payload Too Large.
**Pass Criteria**: Rejects appropriately.
**Notes**: Memory protection.

### 7.7 Processing Error (500)
**Purpose**: Backend DB failure simulation.
**Prerequisites**: Webhook 8092. Shut down PG.
**Steps**: Send valid payload.
**Expected Response**: HTTP 500 Internal Server Error.
```json
{
  "error": "Failed to process webhook: Connection refused"
}
```
**Pass Criteria**: Gracefully handles backend failure.
**Notes**: Circuit broken.

### 7.8 Kafka Publishing Verification
**Purpose**: Confirm Webhook pushes to Kafka.
**Prerequisites**: Webhook + Kafka.
**Steps**: Send valid payload. Tail kafka topic `tenant-X.raw.payflex.payment-completed`.
**Expected Response**: Message appears in Kafka topic.
**Pass Criteria**: Message accurately serialized.
**Notes**: Integration.

---

## 8. WireMock Advanced Fault Scenarios

### 8.1 Webhook Success (202)
**Purpose**: WireMock simulates webhook 202.
**Prerequisites**: WireMock 8091.
**Steps**:
```bash
curl -X POST "http://localhost:8091/webhook/partner/event" \
  -H "X-Webhook-Key: secret"
```
**Expected Response**: 202 Accepted.
**Pass Criteria**: Matches webhook-success.json.

### 8.2 Webhook Unauthorized - Missing Key (401)
**Purpose**: Priority 1 Wiremock stub.
**Prerequisites**: WireMock 8091.
**Steps**: Omit key.
**Expected Response**: 401 Unauthorized.
**Pass Criteria**: Matches webhook-unauthorized.json.

### 8.3 Webhook Unauthorized - Invalid Key (401)
**Purpose**: Priority 2 Wiremock stub.
**Prerequisites**: WireMock 8091.
**Steps**: Pass `X-Webhook-Key: invalid-key`.
**Expected Response**: 401 Unauthorized.
**Pass Criteria**: Matches webhook-unauthorized.json.

### 8.4 Partner Scenario: ShopMax ORDER_CREATED
**Purpose**: ShopMax mock scenario stub.
**Prerequisites**: WireMock 8091.
**Steps**: `curl http://localhost:8091/mock/shopmax/order`
**Expected Response**: returns ShopMax format json.
**Pass Criteria**: JSON matched.

### 8.5 Partner Scenario: PayFlex PAYMENT_CAPTURED
**Purpose**: PayFlex mock scenario stub.
**Prerequisites**: WireMock 8091.
**Steps**: `curl http://localhost:8091/mock/payflex/payment`
**Expected Response**: returns PayFlex format json.
**Pass Criteria**: JSON matched.

### 8.6 Partner Scenario: FastCargo SHIPMENT_DELIVERED
**Purpose**: FastCargo mock scenario stub.
**Prerequisites**: WireMock 8091.
**Steps**: `curl http://localhost:8091/mock/fastcargo/shipment`
**Expected Response**: returns SOAP format xml.
**Pass Criteria**: XML matched.

### 8.7 Server Error Scenario
**Purpose**: Test generic error scenario string.
**Prerequisites**: WireMock 8091.
**Steps**: Target endpoint with `?scenario=server-error`
**Expected Response**: Error HTTP code.
**Pass Criteria**: Mapped correctly.

### 8.8 500 Internal Server Error
**Purpose**: error-500-internal-server.json.
**Steps**: `curl http://localhost:8091/fault/500`
**Expected Response**: 500
**Pass Criteria**: Exactly 500.

### 8.9 502 Bad Gateway
**Purpose**: error-502-bad-gateway.json.
**Steps**: `curl http://localhost:8091/fault/502`
**Expected Response**: 502
**Pass Criteria**: Exactly 502.

### 8.10 503 Service Unavailable
**Purpose**: error-503-service-unavailable.json.
**Steps**: `curl http://localhost:8091/fault/503`
**Expected Response**: 503
**Pass Criteria**: Exactly 503.

### 8.11 504 Gateway Timeout
**Purpose**: error-504-gateway-timeout.json.
**Steps**: `curl http://localhost:8091/fault/504`
**Expected Response**: 504
**Pass Criteria**: Exactly 504.

### 8.12 Latency Scenarios (500ms, 2s, 5s, uniform, lognormal)
**Purpose**: Wiremock latency injection testing.
**Steps**: Hit latency endpoints.
**Expected Response**: Delays exactly matching requested thresholds.
**Pass Criteria**: Strict timing checks pass.

### 8.13 Fault Injection (empty response, connection reset, malformed)
**Purpose**: Test TCP level failure handling in our HTTP clients.
**Steps**: Request `/fault/reset` on Wiremock.
**Expected Response**: Connection forcibly closed by peer.
**Pass Criteria**: Java client throws IOException, circuit breaks.

### 8.14 Timeout Scenarios (10s, 30s)
**Purpose**: Wiremock deep timeouts.
**Steps**: Hit `/timeout/30s`.
**Expected Response**: Socket hangs for 30s.
**Pass Criteria**: Java client throws TimeoutException based on its internal threshold (e.g. 5s), cutting the request short.

---

## 9. DLQ and Retry Scenarios

### 9.1 First Retry (1 minute topic)
**Purpose**: Transient failures go to `transformation.retry.1m`.
**Prerequisites**: Transformer running.
**Steps**: Produce message hitting a temporary downstream fault.
**Expected Response**: Consumed and produced to 1m retry topic.
**Pass Criteria**: Message enters 1m topic.

### 9.2 Second Retry (5 minute topic)
**Purpose**: After 1m failure, pushes to 5m.
**Steps**: 1m consumer picks up and fails again.
**Expected Response**: Moves to 5m topic.
**Pass Criteria**: Verifiable in Kafka offset.

### 9.3 Third Retry (30 minute topic)
**Purpose**: After 5m failure, pushes to 30m.
**Steps**: 5m consumer picks up and fails again.
**Expected Response**: Moves to 30m topic.
**Pass Criteria**: Verifiable in Kafka.

### 9.4 DLQ Entry After All Retries Exhausted
**Purpose**: Permanent failures or exhausted retries go to DLQ.
**Steps**: 30m consumer picks up and fails.
**Expected Response**: Moves to `transformation.dlq` and PostgreSQL.
**Pass Criteria**: Database `dlq_records` contains row.

### 9.5 DLQ Entry Format Verification
**Purpose**: Validate format of DLQ metadata.
**Steps**: Inspect PostgreSQL DLQ row.
**Expected Response**: Contains `originalTopic`, `partnerId`, `eventType`, `errorType`, `stage`, `errorMessage`, `errorPath`.
**Pass Criteria**: All fields populated correctly.

### 9.6 DLQ List API
**Purpose**: Fetch DLQ via Mapping Studio API.
**Prerequisites**: Mapping Studio 8080.
**Steps**: `curl http://localhost:8080/api/dlq -H "X-Tenant-Id: tenant-acme"`
**Expected Response**: JSON array of DLQ objects.
**Pass Criteria**: 200 OK.

### 9.7 DLQ Get Single Entry
**Purpose**: Fetch specific DLQ item.
**Steps**: `curl http://localhost:8080/api/dlq/{id}`
**Expected Response**: 200 OK with full original payload attached.
**Pass Criteria**: Payload is unmodified.

### 9.8 DLQ Redrive
**Purpose**: Replay DLQ payload after fix.
**Steps**: `curl -X POST http://localhost:8080/api/dlq/{id}/redrive`
**Expected Response**: 202 Accepted.
**Pass Criteria**: Metadata updated with `isRedrive=true`, sent to original topic.

### 9.9 Poison Pill Protection
**Purpose**: Ensure severe JSON parse errors don't crash consumer loop.
**Steps**: Produce `}{invalid-json///` to raw topic.
**Expected Response**: Consumer logs error, sends string to DLQ, continues processing next message.
**Pass Criteria**: Consumer offset advances, no pod restart.

---

## 10. Mapping Studio API Scenarios

### 10.1 Create Mapping Draft
**Purpose**: API to create a new mapping.
**Steps**:
```bash
curl -X POST http://localhost:8080/api/mapping-drafts \
  -H "X-Tenant-Id: tenant-acme" \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId":"payflex",
  "eventType":"payment",
  "mapping":"{\"id\": paymentId}"
}'
```
**Expected Response**: 201 Created. Returns Draft object.
**Pass Criteria**: ID generated.

### 10.2 Get Mapping Draft
**Purpose**: Retrieve draft mapping.
**Steps**: `curl http://localhost:8080/api/mapping-drafts/1`
**Expected Response**: 200 OK.
**Pass Criteria**: Returns draft.

### 10.3 Update Mapping Draft
**Purpose**: Update draft mapping.
**Steps**: PUT request to `/api/mapping-drafts/1` with new mapping.
**Expected Response**: 200 OK.
**Pass Criteria**: Version bumped or timestamp updated.

### 10.4 Delete Mapping Draft
**Purpose**: Delete draft.
**Steps**: DELETE `/api/mapping-drafts/1`.
**Expected Response**: 204 No Content.
**Pass Criteria**: Returns 204.

### 10.5 List Mapping Drafts
**Purpose**: List all drafts.
**Steps**: GET `/api/mapping-drafts`.
**Expected Response**: 200 OK array.
**Pass Criteria**: Array size > 0.

### 10.6 Partner Management
**Purpose**: CRUD operations for Partner entities.
**Steps**: Manage `/api/partners`.
**Expected Response**: 200 OK for lists and creations.
**Pass Criteria**: Database writes partner record.

### 10.7 Credential Management
**Purpose**: Securely store encrypted credentials via AES-256-GCM.
**Steps**: POST `/api/credentials` with secret.
**Expected Response**: 201 Created.
**Pass Criteria**: Stored in DB as encrypted text, never plain.

### 10.8 Webhook Endpoint Management
**Purpose**: Manage webhook keys via Mapping Studio API.
**Steps**: Create WebhookEndpoint resource.
**Expected Response**: Webhook API syncs keys for auth.
**Pass Criteria**: Secret correctly hashed in DB using SHA-256 base64.

### 10.9 Audit Log Retrieval
**Purpose**: View user actions.
**Steps**: GET `/api/audit-logs`
**Expected Response**: 200 OK showing `CREATE_MAPPING` events.
**Pass Criteria**: `X-User-Id` accurately recorded.

### 10.10 REST Inbound Ingestion
**Purpose**: Simulate manual REST API ingestion path (not webhook).
**Steps**: Internal ingestion endpoints verify payload.
**Expected Response**: Pushes to Kafka raw topic.
**Pass Criteria**: 202 Accepted.

---

## 11. Validation Pipeline Scenarios

### 11.1 Stage 1: JSON Syntax Validation
**Purpose**: Initial syntax check passes.
**Pass Criteria**: Rejects malformed strings immediately.

### 11.2 Stage 1: Size Limit Check
**Purpose**: Transformer 2MB body limit.
**Pass Criteria**: Returns 413 Payload Too Large.

### 11.3 Stage 1: PII Detection
**Purpose**: (Future phase stub) Detect SSN/Credit cards.
**Pass Criteria**: Flags PII fields automatically in studio.

### 11.4 Stage 2: Field Inventory Inference
**Purpose**: Extracts paths from sample JSON.
**Pass Criteria**: `{"a":{"b":1}}` generates `a.b` path map.

### 11.5 Stage 3: Input Schema Validation (Ajv)
**Purpose**: Checks incoming payload against Ajv 2020-12 schema.
**Pass Criteria**: Missing fields return 422 Unprocessable Entity.

### 11.6 Stage 3: Schema Compilation Failure
**Purpose**: Bad schema definitions in drafts.
**Pass Criteria**: Draft validation fails prior to publish.

### 11.7 Stage 4: Mapping Rule - Type Compatibility
**Purpose**: Map source String to Canonical Number.
**Pass Criteria**: Detects type mismatch during preview.

### 11.8 Stage 4: Mapping Rule - Required Fields
**Purpose**: Ensure target Canonical required fields are mapped.
**Pass Criteria**: Fails validation if mapping omits required field.

### 11.9 Stage 4: Mapping Rule - Duplicate Detection
**Purpose**: Two rules targeting same output field.
**Pass Criteria**: Editor highlights conflict.

### 11.10 Stage 5: JSONata Lint
**Purpose**: Syntax check JSONata expressions.
**Pass Criteria**: Malformed JSONata fails validation.

### 11.11 Stage 5: Blocked Function Detection
**Purpose**: Detect malicious `$http`, `$eval`, `$spawn`.
**Pass Criteria**: Returns "Blocked function detected".

### 11.12 Stage 6: Transform Preview (pass/fail/warning/skip)
**Purpose**: Live preview evaluates on sample JSON.
**Pass Criteria**: Shows resultant JSON panel.

### 11.13 Stage 7: Fixture Assertions
**Purpose**: End-to-end check of mappings vs test cases.
**Pass Criteria**: Test suite `npm run test:mapping-fixtures` returns green.

---

## 12. End-to-End Integration Flows

### 12.1 PayFlex: Webhook → Transform → Canonical → Outbound
**Purpose**: Complete round trip for PayFlex.
**Pass Criteria**: Payload injected via webhook arrives perfectly formatted at Canonical Outbox DB table.

### 12.2 ShopMax: Kafka → Transform → Canonical
**Purpose**: Complete round trip for ShopMax Kafka ingest.
**Pass Criteria**: Consumer reads ShopMax, produces canonical message.

### 12.3 FastCargo: SOAP → Transform → Canonical
**Purpose**: SOAP payload transformation.
**Pass Criteria**: SOAP envelope parsed, canonical output produced.

### 12.4 Multi-Partner Parallel Processing
**Purpose**: Ensure concurrency is stable.
**Pass Criteria**: Blast 100 PayFlex and 100 ShopMax simultaneously; all land successfully with 0 crosstalk.

### 12.5 Error Recovery: DLQ → Fix Mapping → Redrive → Success
**Purpose**: The "Killer Feature" loop.
**Pass Criteria**: Error payload enters DLQ -> Mapping fixed in Studio -> Redrive triggered -> Payload successfully processes and creates canonical output.

---

## 13. Security Scenarios

### 13.1 API Key Authentication (Valid)
**Purpose**: Access Transformer with valid key.
**Pass Criteria**: 200 OK.

### 13.2 API Key Authentication (Invalid)
**Purpose**: Deny bad key.
**Pass Criteria**: 401 Unauthorized.

### 13.3 JWT Bearer Token Authentication
**Purpose**: Mapping Studio HS256 JWT auth.
**Pass Criteria**: Valid token succeeds, expired token fails 401.

### 13.4 RBAC: Admin Full Access
**Purpose**: Role `admin`.
**Pass Criteria**: Has DELETE privileges.

### 13.5 RBAC: Viewer Read-Only
**Purpose**: Role `viewer`.
**Pass Criteria**: DELETE returns 403 Forbidden.

### 13.6 RBAC: Operator DLQ Access
**Purpose**: Role `operator`.
**Pass Criteria**: Allowed to redrive DLQ, not alter mappings.

### 13.7 Tenant Isolation Enforcement
**Purpose**: `X-Tenant-Id` separation.
**Pass Criteria**: Tenant A cannot read Tenant B's drafts.

### 13.8 Credential Encryption Verification
**Purpose**: Secret at rest.
**Pass Criteria**: Verified in DB dump that it is AES encrypted.

### 13.9 HTTP Security Headers Verification
**Purpose**: SecurityHeadersFilter in Java, Fastify hooks in Node.
**Pass Criteria**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `HSTS`, `CSP` exist on all API responses.

---

## 14. Performance & Load Scenarios

### 14.1 Phase 1: 100 Events/Second Throughput
**Purpose**: Verify MVP load target.
**Pass Criteria**: 100 ev/sec sustained for 5 minutes. 0 lag buildup.

### 14.2 Phase 3: 1000 Events/Second Throughput
**Purpose**: Future test standard.
**Pass Criteria**: Required profiling setup.

### 14.3 Latency: p50 Under 50ms
**Purpose**: Measure average latency.
**Pass Criteria**: metrics show p50 < 50ms.

### 14.4 Latency: p99 Under 200ms
**Purpose**: Measure tail latency.
**Pass Criteria**: metrics show p99 < 200ms.

### 14.5 Zero Data Loss Under Load
**Purpose**: Validate reliability.
**Pass Criteria**: 10,000 sent = 10,000 received.

### 14.6 DLQ Rate Under 0.1%
**Purpose**: Normal operation shouldn't DLQ blindly.
**Pass Criteria**: Pure data load produces zero DLQ without explicit errors.

---

## 15. Resilience & Failure Recovery Scenarios

### 15.1 Kafka Broker Down
**Purpose**: Kafka goes offline mid-processing.
**Pass Criteria**: Consumer pauses, reconnects when Kafka returns. 0 data loss.

### 15.2 PostgreSQL Down
**Purpose**: DB goes offline.
**Pass Criteria**: App halts commit, redelivers on recovery. Idempotency prevents duplicates.

### 15.3 Transformer OOM Crash Recovery
**Purpose**: Pod dies from huge payload.
**Pass Criteria**: Kubernetes restarts pod. Partition rebalances. Redelivery processes safely.

### 15.4 Circuit Breaker: OutboundHttpService
**Purpose**: SmallRye Fault Tolerance kicks in.
**Pass Criteria**: 503s trip breaker. State goes OPEN -> HALF-OPEN -> CLOSED.

### 15.5 Backpressure: Worker Queue Full
**Purpose**: Overload worker pool.
**Pass Criteria**: Fastify returns 429 or 503 to signal backpressure, consumer pauses fetch.

### 15.6 Consumer Rebalance During Processing
**Purpose**: Kafka partition shifting.
**Pass Criteria**: No duplicate canonical outputs. 

### 15.7 Network Partition Between Services
**Purpose**: Transformer cannot talk to Mapping API.
**Pass Criteria**: Retries locally, caching keeps runtime alive temporarily.

### 15.8 Graceful Shutdown Under Load
**Purpose**: SIGTERM sent.
**Pass Criteria**: Finishes current event processing before exiting. Offset committed.

---

## 16. Observability Verification

### 16.1 Prometheus Metrics Endpoint
**Purpose**: /metrics exposed.
**Pass Criteria**: Returns text/plain Prometheus format with `transform_engine_cache_size` gauge.

### 16.2 Grafana Dashboard Data
**Purpose**: Dashboards populate.
**Pass Criteria**: Active queries return >0 results.

### 16.3 Health Check Endpoint
**Purpose**: /health exposed.
**Pass Criteria**: Includes liveness and readiness statuses.

### 16.4 Structured Logging Format
**Purpose**: Console logs are JSON.
**Pass Criteria**: Contains `service`, `level`, `message`, `timestamp`.

### 16.5 Correlation ID Propagation
**Purpose**: `X-Correlation-Id` traverses microservices.
**Pass Criteria**: Seen in Webhook log, Transformer log, Mapping log, and DLQ row.

### 16.6 Alert Rule Verification
**Purpose**: Test Prometheus AlertManager config.
**Pass Criteria**: Simulated 500 triggers PagerDuty/Slack test alert.

---

## 17. UI Acceptance Scenarios

### 17.1 Wizard Step 1: Source Selection
**Purpose**: Pick PayFlex REST.
**Pass Criteria**: Moves to Step 2 correctly.

### 17.2 Wizard Step 2: Schema Definition
**Purpose**: Paste sample JSON.
**Pass Criteria**: Auto-infers schema tree correctly.

### 17.3 Wizard Step 3: Field Mapping
**Purpose**: Drag and drop fields.
**Pass Criteria**: Connects lines, generates valid JSONata underneath.

### 17.4 Wizard Step 4: Gap Analysis
**Purpose**: Warns about unmapped canonical fields.
**Pass Criteria**: Highlights required unmapped fields in red.

### 17.5 Wizard Step 5: Test & Publish
**Purpose**: Final preview and save.
**Pass Criteria**: "Publish" creates active version in DB.

### 17.6 DLQ Management Page
**Purpose**: Table of DLQ errors.
**Pass Criteria**: Loads correctly, Redrive button works.

### 17.7 Mappings List CRUD
**Purpose**: Homepage lists mappings.
**Pass Criteria**: Table renders partner name, event type, active version, status.

### 17.8 Demo Mode Walkthrough
**Purpose**: Read-only demo walkthrough.
**Pass Criteria**: Step by step wizard functions smoothly without backend writes.

### 17.9 Responsive Design (Mobile)
**Purpose**: 720px breakpoint check.
**Pass Criteria**: UI stacks columns properly, CSS flex handles layout.

---

## 18. Mapping Versioning Scenarios

### 18.1 Create New Version
**Purpose**: Update live mapping.
**Pass Criteria**: Creates v2. v1 remains immutable.

### 18.2 Rollback to Previous Version
**Purpose**: Revert v2 to v1.
**Pass Criteria**: Active tag shifts back to v1. New events process as v1.

### 18.3 Version-Specific Cache Key
**Purpose**: Transformer uses precise version mapping.
**Pass Criteria**: Cache key `partner:event:v2` isolates logic.

### 18.4 Concurrent Version Deployment
**Purpose**: Event specifies `version=v1` explicitly.
**Pass Criteria**: Routes to v1 despite v2 being default active. Allows slow partner migration.

---

## 19. Extended Partner Scenarios (Auto-generated bulk tests)

This section contains simulated complex partner integrations, designed to test the load capabilities of the Canonical Engine Mapping.

### 19.1 MegaCorp Financial Import
**Purpose**: Verify enormous JSON structures from MegaCorp.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "megacorp",
  "eventType": "ledger-update",
  "data": {
    "ledgerId": "LEDGER-9000",
    "timestamp": "2026-05-13T10:00:00Z",
    "entries": [
      {
        "id": "E-01",
        "type": "CREDIT",
        "amount": 500000.00,
        "currency": "USD",
        "account": "100-200-300",
        "metadata": {
          "source": "ACH",
          "reference": "REF-12345",
          "tags": ["urgent", "payroll"]
        }
      },
      {
        "id": "E-02",
        "type": "DEBIT",
        "amount": 15000.50,
        "currency": "USD",
        "account": "100-200-301",
        "metadata": {
          "source": "WIRE",
          "reference": "REF-98765",
          "tags": ["vendor", "supplies"]
        }
      },
      {
        "id": "E-03",
        "type": "CREDIT",
        "amount": 250000.00,
        "currency": "USD",
        "account": "100-200-302",
        "metadata": {
          "source": "INTERNAL",
          "reference": "REF-55555",
          "tags": ["transfer"]
        }
      },
      {
        "id": "E-04",
        "type": "DEBIT",
        "amount": 50.00,
        "currency": "USD",
        "account": "100-200-303",
        "metadata": {
          "source": "FEE",
          "reference": "REF-11111",
          "tags": ["monthly"]
        }
      }
    ]
  }
}'
```
**Expected Response**: HTTP 200 Canonical Output matching Ledger specifications.
```json
{
  "canonical": {
    "ledger": "LEDGER-9000",
    "totalCredit": 750000.00,
    "totalDebit": 15050.50,
    "netChange": 734949.50,
    "currency": "USD",
    "entryCount": 4
  }
}
```
**Pass Criteria**: Math logic in JSONata executes perfectly on the array.

### 19.2 SupplyChainX Inventory Sync
**Purpose**: Large array mapping test.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "supplychainx",
  "eventType": "inventory",
  "data": {
    "warehouseId": "WH-55",
    "items": [
      {
        "sku": "SKU-1001",
        "quantity": 150,
        "location": "Aisle-5-Bin-12"
      },
      {
        "sku": "SKU-1002",
        "quantity": 0,
        "location": "Aisle-5-Bin-13"
      },
      {
        "sku": "SKU-1003",
        "quantity": 42,
        "location": "Aisle-6-Bin-1"
      },
      {
        "sku": "SKU-1004",
        "quantity": 900,
        "location": "Aisle-6-Bin-2"
      },
      {
        "sku": "SKU-1005",
        "quantity": 12,
        "location": "Aisle-7-Bin-1"
      }
    ]
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "warehouse": "WH-55",
    "totalItems": 1104,
    "outOfStock": ["SKU-1002"]
  }
}
```
**Pass Criteria**: Filter and reduce functions work properly on the inventory array.

### 19.3 HealthcareY Patient Record
**Purpose**: Verify PII handling and deep nested transformations.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "healthcarey",
  "eventType": "patient-update",
  "data": {
    "patient": {
      "id": "PAT-999",
      "demographics": {
        "firstName": "Jane",
        "lastName": "Doe",
        "dob": "1980-01-01",
        "ssn": "000-00-0000"
      },
      "vitals": {
        "height_cm": 170,
        "weight_kg": 65,
        "bloodPressure": "120/80"
      },
      "history": {
        "conditions": ["Asthma", "Hypertension"],
        "medications": [
          {
            "name": "Albuterol",
            "dosage": "90mcg",
            "frequency": "As needed"
          },
          {
            "name": "Lisinopril",
            "dosage": "10mg",
            "frequency": "Daily"
          }
        ]
      }
    }
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "patientId": "PAT-999",
    "fullName": "Jane Doe",
    "age": 46,
    "ssn_masked": "***-**-0000",
    "bmi": 22.49,
    "activeMedications": 2
  }
}
```
**Pass Criteria**: Masks PII and calculates BMI correctly using JSONata arithmetic.

### 19.4 AnalyticsZ Clickstream
**Purpose**: Map high volume event streams.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "analyticsz",
  "eventType": "click",
  "data": {
    "sessionId": "SES-111",
    "page": "/home",
    "referrer": "google.com",
    "userAgent": "Mozilla/5.0",
    "x": 105,
    "y": 250,
    "element": "button-login"
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "session": "SES-111",
    "action": "CLICK",
    "target": "button-login",
    "source": "google.com"
  }
}
```
**Pass Criteria**: Swift execution < 5ms.

### 19.5 GlobalLogistics Custom Format
**Purpose**: Map a completely flattened weird structure into a canonical nested object.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "globallogistics",
  "eventType": "shipment",
  "data": {
    "TRACKING_NO": "GL-555",
    "ORIGIN_CITY": "New York",
    "ORIGIN_STATE": "NY",
    "ORIGIN_ZIP": "10001",
    "DEST_CITY": "Los Angeles",
    "DEST_STATE": "CA",
    "DEST_ZIP": "90001",
    "WEIGHT_LBS": "45.5",
    "STATUS": "IN_TRANSIT"
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "tracking": "GL-555",
    "status": "IN_TRANSIT",
    "weight_kg": 20.63,
    "route": {
      "from": {
        "city": "New York",
        "state": "NY",
        "zip": "10001"
      },
      "to": {
        "city": "Los Angeles",
        "state": "CA",
        "zip": "90001"
      }
    }
  }
}
```
**Pass Criteria**: Flattens to nested object, converts LBS to KG.

### 19.6 WeatherApp API
**Purpose**: Transform weather data into a simple canon format.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "weatherapp",
  "eventType": "forecast",
  "data": {
    "location": "Seattle",
    "current": {
      "temp_f": 65,
      "humidity": 45,
      "conditions": "Cloudy"
    },
    "forecast": [
      {"day": "Mon", "high_f": 70, "low_f": 55},
      {"day": "Tue", "high_f": 72, "low_f": 58},
      {"day": "Wed", "high_f": 68, "low_f": 54}
    ]
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "city": "Seattle",
    "current_temp_c": 18.33,
    "average_high_f": 70,
    "outlook": "Cloudy"
  }
}
```
**Pass Criteria**: JSONata logic calculates averages perfectly.

### 19.7 SocialMediaFeed Mention
**Purpose**: Extract hashtags and canonicalize mentions.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "socialmedia",
  "eventType": "mention",
  "data": {
    "tweet_id": "123456789",
    "user": "@canonbridge",
    "text": "Loving the new #integration capabilities of #canonbridge! It is so #fast.",
    "likes": 42,
    "retweets": 5
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "123456789",
    "author": "canonbridge",
    "content": "Loving the new #integration capabilities of #canonbridge! It is so #fast.",
    "engagement": 47,
    "tags": ["integration", "canonbridge", "fast"]
  }
}
```
**Pass Criteria**: Regex string extraction in JSONata works for tags.

### 19.8 HRPlatform Employee Sync
**Purpose**: Handle deep enterprise HR records.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "hrplatform",
  "eventType": "employee-updated",
  "data": {
    "empId": "EMP-001",
    "name": {
      "first": "John",
      "last": "Smith"
    },
    "department": "Engineering",
    "title": "Senior Developer",
    "salary": 150000,
    "startDate": "2020-05-01",
    "status": "ACTIVE",
    "benefits": {
      "health": "Plan A",
      "dental": "Plan B",
      "vision": "Plan C",
      "401k_match": 0.05
    }
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "employeeId": "EMP-001",
    "fullName": "John Smith",
    "role": "Senior Developer",
    "dept": "Engineering",
    "isActive": true,
    "tenure_years": 6,
    "totalCompensation": 157500
  }
}
```
**Pass Criteria**: JSONata boolean conversion and math logic.

### 19.9 RealEstate Listings Sync
**Purpose**: Handle real estate data nested objects.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "realestate",
  "eventType": "listing",
  "data": {
    "propertyId": "PROP-42",
    "address": {
      "street": "123 Maple",
      "city": "Austin",
      "state": "TX",
      "zipcode": "78701"
    },
    "features": {
      "bedrooms": 4,
      "bathrooms": 3.5,
      "squareFeet": 2500,
      "yearBuilt": 2018
    },
    "pricing": {
      "listPrice": 850000,
      "hoaMonthly": 150
    }
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "PROP-42",
    "location": "123 Maple, Austin, TX 78701",
    "price": 850000,
    "sqft": 2500,
    "costPerSqft": 340
  }
}
```
**Pass Criteria**: Converts and calculates derived fields.

### 19.10 ECommerce Returns
**Purpose**: Map return events with nested items.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "ecommerce",
  "eventType": "return-initiated",
  "data": {
    "rma": "RMA-777",
    "orderRef": "ORD-123",
    "reason": "Defective",
    "items": [
      {"sku": "LAPTOP-01", "qty": 1, "price": 1200},
      {"sku": "MOUSE-01", "qty": 1, "price": 50}
    ]
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "returnId": "RMA-777",
    "originalOrder": "ORD-123",
    "totalRefund": 1250,
    "itemCount": 2
  }
}
```
**Pass Criteria**: Processes returns appropriately.

### 19.11 IoT Sensor Data
**Purpose**: High frequency sensor payload.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "iot",
  "eventType": "sensor-reading",
  "data": {
    "deviceId": "DEV-55",
    "timestamp": 1678886400,
    "metrics": {
      "temperature": 45.2,
      "vibration": 0.05,
      "battery": 88
    }
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "device": "DEV-55",
    "time": "2023-03-15T13:20:00.000Z",
    "temp": 45.2,
    "status": "OK"
  }
}
```
**Pass Criteria**: Converts unix epoch to ISO8601.

### 19.12 Support Ticket Update
**Purpose**: Text and array transformation for ticketing.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "support",
  "eventType": "ticket-resolved",
  "data": {
    "ticketId": "T-999",
    "priority": "HIGH",
    "messages": [
      {"user": "Customer", "text": "Help me"},
      {"user": "Agent", "text": "Fixed it"}
    ],
    "resolutionTimeHours": 4.5
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "T-999",
    "isResolved": true,
    "slaMet": true,
    "interactionCount": 2
  }
}
```
**Pass Criteria**: Determines SLA dynamically.

### 19.13 RideShare Trip
**Purpose**: Maps complex geospatial trips.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "rideshare",
  "eventType": "trip-completed",
  "data": {
    "tripId": "TRIP-123",
    "driver": "DRV-1",
    "rider": "RDR-1",
    "fare": 25.50,
    "tip": 5.00,
    "distanceMiles": 12.4,
    "durationMinutes": 22
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "TRIP-123",
    "totalCharged": 30.50,
    "revenuePerMile": 2.46,
    "duration": 22
  }
}
```
**Pass Criteria**: Calculates revenue per mile.

### 19.14 VideoStreaming View
**Purpose**: Map engagement metrics.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "streaming",
  "eventType": "video-view",
  "data": {
    "videoId": "VID-777",
    "userId": "USR-42",
    "watchTimeSeconds": 4500,
    "videoLengthSeconds": 5000,
    "device": "SmartTV"
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "video": "VID-777",
    "user": "USR-42",
    "completionRate": 0.9,
    "platform": "TV"
  }
}
```
**Pass Criteria**: Correct completion percentage math.

### 19.15 Crypto Exchange Trade
**Purpose**: Map high precision floating point.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "crypto",
  "eventType": "trade",
  "data": {
    "tradeId": "TRD-01",
    "pair": "BTC-USD",
    "price": 65432.12,
    "amount": 0.051234,
    "side": "BUY"
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "TRD-01",
    "asset": "BTC",
    "fiat": "USD",
    "totalValue": 3352.26,
    "action": "BUY"
  }
}
```
**Pass Criteria**: Keeps float precision accurate.

### 19.16 Hotel Booking
**Purpose**: Date diff calculations.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "hotel",
  "eventType": "booking",
  "data": {
    "resId": "RES-888",
    "guestName": "Bob",
    "checkIn": "2026-06-01",
    "checkOut": "2026-06-05",
    "nightlyRate": 150
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "reservation": "RES-888",
    "nights": 4,
    "totalCost": 600
  }
}
```
**Pass Criteria**: Correctly subtracts dates to find nights.

### 19.17 Delivery App Order
**Purpose**: Extract fees.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "delivery",
  "eventType": "order",
  "data": {
    "orderId": "DEL-1",
    "subtotal": 45.00,
    "taxes": 4.50,
    "deliveryFee": 5.00,
    "serviceFee": 2.50
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "DEL-1",
    "food": 45.00,
    "fees": 12.00,
    "total": 57.00
  }
}
```
**Pass Criteria**: Groups fees together.

### 19.18 Gym Membership
**Purpose**: String manipulation.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "gym",
  "eventType": "signup",
  "data": {
    "memberId": "MEM-12",
    "tier": "GOLD_LEVEL_PREMIUM",
    "price": 99.99
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "id": "MEM-12",
    "tier": "Gold",
    "monthly": 99.99
  }
}
```
**Pass Criteria**: Parses complex string into enum.

### 19.19 Cloud Provider Billing
**Purpose**: Massive aggregation.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "cloud",
  "eventType": "invoice",
  "data": {
    "accountId": "ACC-1",
    "services": [
      {"name": "Compute", "cost": 1500},
      {"name": "Storage", "cost": 500},
      {"name": "Network", "cost": 200}
    ]
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "account": "ACC-1",
    "total": 2200,
    "serviceCount": 3
  }
}
```
**Pass Criteria**: Sums array exactly.

### 19.20 Advertising Campaign
**Purpose**: ROAS calculation.
**Steps**:
```bash
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -d '{
  "partnerId": "ads",
  "eventType": "campaign-end",
  "data": {
    "campId": "CAMP-1",
    "spend": 5000,
    "revenue": 15000
  }
}'
```
**Expected Response**: HTTP 200 Canonical.
```json
{
  "canonical": {
    "campaign": "CAMP-1",
    "roas": 3.0,
    "profitable": true
  }
}
```
**Pass Criteria**: Derives profitability.

---

## 20. Ten-System Template Smoke Matrix
**Purpose**: Prove the product can represent and exercise 10 distinct external systems, not only 10 labels in the UI.
**Seed Evidence**: `V38__normalize_ten_system_templates.sql` creates the 10 distinct system templates. `V39__seed_new_system_mapping_drafts.sql` adds drafts, canonical schemas, and source samples for InventoryPro, TicketDesk, CloudBill, and PeopleOps. `services/transformer/fixtures/ten-system-smoke.json` stores expected canonical outputs for all 10 systems.

| System | Primary path | Expected smoke proof |
|---|---|---|
| PayFlex Payment System | Webhook payment event | Payload maps to canonical payment event. |
| ShopMax E-Commerce System | Kafka order event | Payload maps to canonical order event. |
| FastCargo Logistics System | SOAP shipment tracking response | Response maps to canonical shipment event. |
| ProfileHub GraphQL API | GraphQL profile response | Response maps to canonical profile event. |
| CustomerGateway gRPC Profile Service | gRPC customer response | Response maps to canonical customer event. |
| FoodMarket Order System | REST order response | Response maps to canonical food order event. |
| InventoryPro Warehouse System | REST stock item response | Response maps to `InventoryStockSnapshot`. |
| TicketDesk Support System | REST ticket response | Response maps to `SupportTicketUpdated`. |
| CloudBill Billing System | REST invoice response | Response maps to `BillingInvoiceIssued`. |
| PeopleOps HR System | REST employee response | Response maps to `EmployeeProfileUpdated`. |

**Pass Criteria**:
- Database contains exactly 10 `tenant-acme` rows with `is_system_template = TRUE` and 10 distinct template names.
- Each template is backed by a mock endpoint or mock protocol route.
- Each system has a mapping path and source sample or fixture.
- CI executes at least one source-to-canonical assertion per system through `npm test`.

---

## 21. Acceptance Test Checklist
(Complete checkbox list of all critical behaviors)
- [ ] 01. Services boot (Docker Compose / K8s)
- [ ] 02. Health endpoints respond 200 OK
- [ ] 03. Webhook Receiver ingests valid payload
- [ ] 04. Webhook Receiver denies missing key
- [ ] 05. Webhook Receiver denies invalid key
- [ ] 06. Webhook Receiver verifies HMAC-SHA256
- [ ] 07. Webhook Producer writes to Kafka `tenant.raw` topic
- [ ] 08. Kafka Consumer reads from `tenant.raw` topic
- [ ] 09. Transformer parses payload envelope
- [ ] 10. Transformer retrieves correct Mapping Version
- [ ] 11. Transformer executes JSONata successfully
- [ ] 12. Transformer rejects bad JSONata logic
- [ ] 13. Transformer checks blocked functions ($eval, $spawn)
- [ ] 14. Transformer validates input Ajv schema
- [ ] 15. Transformer validates output canonical schema
- [ ] 16. Transformer writes to `canonical.events` topic
- [ ] 17. Transformation error triggers 1m retry topic
- [ ] 18. 1m retry failure triggers 5m retry topic
- [ ] 19. 5m retry failure triggers 30m retry topic
- [ ] 20. 30m retry failure creates DLQ entry in PostgreSQL
- [ ] 21. Mock ShopMax OAuth2 issues token
- [ ] 22. Outbound HTTP fetches ShopMax data with token
- [ ] 23. Outbound HTTP detects expired token (401) and refreshes
- [ ] 24. Outbound HTTP triggers circuit breaker on 503
- [ ] 25. Mock PayFlex REST API returns valid JSON
- [ ] 26. Mock PayFlex REST API limits rate (429)
- [ ] 27. Mock PayFlex REST API simulates latency (5s)
- [ ] 28. FastCargo SOAP WSDL retrieved successfully
- [ ] 29. FastCargo SOAP Request transforms to JSON internally
- [ ] 30. UI Mapping Studio Wizard Step 1 loads Source Selector
- [ ] 31. UI Mapping Studio infers Schema from Sample
- [ ] 32. UI Mapping Studio validates mapped fields
- [ ] 33. UI Mapping Studio gap analysis warns on missing required Canonical fields
- [ ] 34. UI Test & Publish creates new Version
- [ ] 35. Mapping API Create Draft endpoint works (POST 201)
- [ ] 36. Mapping API List Draft endpoint works (GET 200)
- [ ] 37. Mapping API Partner CRUD operations work
- [ ] 38. Mapping API Credential endpoint encrypts with AES-256-GCM
- [ ] 39. Mapping API RBAC Admin allows deletion
- [ ] 40. Mapping API RBAC Viewer blocks deletion (403)
- [ ] 41. Mapping API isolates tenants (`X-Tenant-Id`)
- [ ] 42. DLQ List API returns array of errors
- [ ] 43. DLQ Redrive API successfully resubmits original payload
- [ ] 44. Prometheus Metrics endpoint returns `transform_engine_cache_size`
- [ ] 45. Structured logging outputs JSON globally
- [ ] 46. `X-Correlation-Id` traverses entire microservice chain
- [ ] 47. 100 ev/sec sustained throughput achieved without lag
- [ ] 48. p99 Latency stays under 200ms
- [ ] 49. Zero data loss during Kafka broker restart
- [ ] 50. Zero duplicate generation during consumer rebalance
- [ ] 51. Transformer memory stays within limits under large 2MB payloads
- [ ] 52. Special characters (Unicode, Emojis) persist correctly through JSONata
- [ ] 53. Null bytes gracefully handled or rejected safely
- [ ] 54. SQL Injection string inputs do not break DB persistence
- [ ] 55. XSS string inputs do not break UI rendering
- [ ] 56. Deep nested arrays transform safely without stack overflow
- [ ] 57. Webhook payload > 2MB rejected cleanly (413)
- [ ] 58. Graceful shutdown drains queue and commits offsets
- [ ] 59. Wiremock scenario `server-error` responds correctly
- [ ] 60. Wiremock `bad-gateway` fault injected
- [ ] 61. Swagger UI available at /docs for Transformer
- [ ] 62. Swagger UI available at /openapi for Mapping Studio API
- [ ] 63. JWT Bearer token signs in Studio correctly
- [ ] 64. Cross-Origin Resource Sharing (CORS) headers properly configured
- [ ] 65. Strict-Transport-Security header present
- [ ] 66. X-Content-Type-Options: nosniff present
- [ ] 67. File/batch import mapping works (CSV parsing)
- [ ] 68. Mock SOAP Fault produces deterministic error format
- [ ] 69. Missing required amounts throw exact stage 4 errors
- [ ] 70. Schema compilation failure caught at draft level
- [ ] 71. Duplicate mappings to single target field blocked by UI
- [ ] 72. UI Demo mode walks through successfully
- [ ] 73. Rollback changes live alias to v1 seamlessly
- [ ] 74. Concurrent mapping version executions stay isolated
- [ ] 75. Cache eviction functions flush stale rules
- [ ] 76. Partner key resolution strategy 1 prioritizes envelope
- [ ] 77. Partner key resolution strategy 2 extracts topic properly
- [ ] 78. Unit tests pass (npm test, mvn test)
- [ ] 79. Schema compatibility tests verify backward safe changes
- [ ] 80. E2E pipeline script exits with code 0

---

## 22. ROI Validation Summary
**Purpose**: Final check against the business case core thesis.
**Analysis**:
- Do 50 partners require 50 custom adapters? **NO**.
- Can a business analyst map a new partner JSON payload in the UI without a dev? **YES**.
- Can errors be redriven automatically after mapping fixes? **YES**.
- Total Projected Savings validated via these tests: **$920k/yr**.

(End of Document)
