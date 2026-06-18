# CanonBridge Local Demo Scenario

This demo should not start with health checks. The customer-facing story starts inside CanonBridge Mapping Studio and shows how one integration changes from raw partner payloads into controlled canonical responses.

## Narrative

CanonBridge is for teams that need to onboard many partner systems without writing a custom adapter for every REST API, webhook, or Kafka topic. In this demo, we show the same idea twice:

- A REST API response is inspected, authenticated, mapped, and changed from Studio.
- A Kafka raw event is transformed into a canonical event on a downstream topic.

## Demo Flow

1. Log in to Mapping Studio.
2. Open one REST API integration: InventoryPro.
3. Show when the InventoryPro bearer token is used.
4. Show the raw response before CanonBridge changes it.
5. Show request mapping.
6. Show response mapping.
7. Run the proxy once and show the current canonical response.
8. Change the response mapping in Studio.
9. Run the same proxy call again and show that the response shape changed.
10. Move to Kafka and show raw event to canonical event.

## Pre-Demo Checklist

Use these before the meeting, not as the demo opening.

```bash
docker compose up -d postgres zookeeper kafka kafka-init redis canonbridge-mock mapping-studio-api transformer webhook-receiver mapping-studio-ui kafka-ui prometheus grafana
```

Quick checks:

```bash
curl -fsS http://localhost:4200/health
curl -fsS http://localhost:8082/health
curl -fsS http://localhost:8083/health
curl -fsS http://localhost:8085/actuator/health
```

Open these in browser tabs before starting:

- Mapping Studio UI: http://localhost:4200
- Kafka UI: http://localhost:8080
- Website, only if needed: http://localhost:8090

Import Postman collection:

```text
CanonBridge_API_Proxy.postman_collection.json
```

Do not run `Appendix - Pre-demo Checks` during the customer-facing story unless something breaks.

Token distinction for the demo:

- `authToken`: CanonBridge Studio/API token. We get this when we log in as `admin@canonbridge.io`.
- `demo-bearer-token-peopleops`: InventoryPro partner API token. This belongs to the external REST service auth config and is used when CanonBridge calls InventoryPro.

## Scene 1: Login

Open Mapping Studio:

```text
http://localhost:4200
```

Login:

- Email: `admin@canonbridge.io`
- Password: `demo123`

Postman support request:

```text
00 - Login and Opening Scene / Login as CanonBridge Admin
```

Opening line:

```text
We are now inside CanonBridge Mapping Studio. This is where integration teams configure how external systems are authenticated, called, mapped, tested, and published.
```

## Scene 2: REST API Mapping Story

Use the InventoryPro stock snapshot mapping:

```text
InventoryPro Stock Snapshot Mapping
Mapping ID: 43000000-0000-4000-8000-000000000001
Source type: REST_API
```

### Step 2.1: Show InventoryPro Auth Token

In Postman:

```text
01 - REST API Mapping Story / 1. InventoryPro auth token used by the partner REST API
```

In Studio, open the InventoryPro connection/auth area and show:

```http
Authorization: Bearer demo-bearer-token-peopleops
```

What to say:

```text
We get the CanonBridge token when we log in. Separately, CanonBridge stores the partner service token here. When CanonBridge calls InventoryPro, it sends this bearer token to the external REST API. The client calling CanonBridge does not need to know this partner token.
```

### Step 2.2: Show Raw Response Before Mapping

In Postman:

```text
01 - REST API Mapping Story / 2. RAW REST response before CanonBridge mapping
```

Equivalent curl:

```bash
curl -fsS http://localhost:8085/api/inventorypro/items/SKU-1001 \
  -H 'Authorization: Bearer demo-bearer-token-peopleops' | jq .
```

What to point out:

- This is the external partner API response.
- The response has nested `warehouse` data.
- It uses the partner's field naming and structure.
- Nothing canonical has happened yet.
- This direct raw call uses the InventoryPro bearer token shown in the previous step.

Talking point:

```text
For this demo we stay with one REST service: InventoryPro. The important point is that the partner auth token belongs to the connection config, while the CanonBridge auth token belongs to the logged-in user.
```

### Step 2.3: Show Request Mapping

In Studio, show the request/source side of the InventoryPro mapping.

Useful API support request:

```text
01 - REST API Mapping Story / 4. InventoryPro mapping detail - auth, request mapping, response mapping
```

What to show:

- Source type: `REST_API`
- Method: `GET`
- External path similar to `/api/inventorypro/items/SKU-1001`
- Connection/auth is configured separately from the client-facing proxy URL.

Talking point:

```text
The client does not need to know how this external system is called. CanonBridge owns the partner request details.
```

### Step 2.4: Show Response Mapping

In Studio, open the response mapping/canonical mapping area for the same InventoryPro mapping.

Current canonical fields to point out:

- `stockItemId`
- `sku`
- `name`
- `category`
- `availableQuantity`
- `reservedQuantity`
- `warehouseId`
- `warehouseCity`
- `reorderPoint`

Talking point:

```text
This is where we decide the response contract our internal teams or customers will consume.
```

### Step 2.5: Run CanonBridge Proxy Before the Change

In Postman:

```text
01 - REST API Mapping Story / 5. CANONBRIDGE PROXY before Studio response-mapping edit
```

Equivalent curl:

```bash
TOKEN=$(curl -fsS -X POST http://localhost:4200/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@canonbridge.io","password":"demo123"}' | jq -r .token)

curl -fsS http://localhost:8082/api/proxy/43000000-0000-4000-8000-000000000001 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-Tenant-Id: tenant-acme' | jq .
```

Token explanation:

- `Authorization: Bearer $TOKEN` is the CanonBridge user/API token from Studio login.
- The InventoryPro bearer token is not sent by the client.
- CanonBridge uses the stored InventoryPro token internally when it calls the external REST API.

Expected fields include:

```json
{
  "stockItemId": "SKU-1001",
  "warehouseCity": "London",
  "availableQuantity": 17,
  "reservedQuantity": 4
}
```

### Step 2.6: Change the Response Mapping in Studio

Make one visible, low-risk response change.

Recommended demo change:

```text
Add availableToPromise = availableQuantity - reservedQuantity
```

Alternative visible change:

```text
Rename warehouseCity to locationCity
```

Keep the external REST API, auth details, and client-facing proxy URL the same.

Talking point:

```text
We are changing the response contract from Studio. We are not writing a new adapter or redeploying a partner-specific service.
```

### Step 2.7: Run the Same Proxy Request After the Change

In Postman:

```text
01 - REST API Mapping Story / 6. CANONBRIDGE PROXY after Studio response-mapping edit
```

The URL is intentionally the same.

Expected story:

- Before edit: response has the original canonical shape.
- After edit: response includes the new mapped field or renamed field.
- External REST API did not change.
- Client integration endpoint did not change.
- Only CanonBridge mapping configuration changed.

## Scene 3: Kafka Message Story

Transition line:

```text
REST is only one kind of source. Some partners publish events to Kafka instead. CanonBridge handles those as mappings too.
```

Local active Kafka path:

```text
partner.raw.events -> transformer -> canonical.events
```

### Step 3.1: Preview the Kafka Transformation

In Postman:

```text
02 - Kafka Message Story / 1. Preview raw Kafka order event -> canonical order
```

What to show:

- Input is a raw `OrderCreated` partner event.
- Output is `CanonicalOrderCreated`.
- Cancelled line `L3` is removed.
- Empty customer email becomes `no-reply@test.com`.
- `totalAmount` becomes `250.5`.

### Step 3.2: Show the Live Kafka Topic Flow

Open terminal 1:

```bash
docker exec -it canonbridge-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic canonical.events \
  --from-beginning
```

Open terminal 2:

```bash
cat <<'JSON' | docker exec -i canonbridge-kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic partner.raw.events
{"eventId":"evt-demo-kafka-001","tenantId":"tenant-demo","partnerId":"acme-marketplace","eventType":"OrderCreated","schemaVersion":"v1","occurredAt":"2026-06-18T14:15:00.000Z","correlationId":"corr-demo-kafka-001","payload":{"order_header":{"order_id":"ORD-DEMO-KAFKA-001","order_date":"2026-06-18","status":"A","currency":"TRY"},"customer":{"full_name":"  Ada Lovelace  ","email":""},"items":[{"item_id":"L1","product_code":"P100","qty":"2","price":"100.00","status":"ACTIVE","created_at":"2026-06-18T14:16:00.000Z"},{"item_id":"L2","product_code":"P200","qty":"1","price":"50.50","status":"ACTIVE","created_at":"2026-06-18T14:17:00.000Z"},{"item_id":"L3","product_code":"P999","qty":"5","price":"1.00","status":"CANCELLED","created_at":"2026-06-18T14:18:00.000Z"}]}}
JSON
```

Expected canonical event:

```json
{
  "eventType": "CanonicalOrderCreated",
  "payload": {
    "orderId": "ORD-DEMO-KAFKA-001",
    "customerName": "Ada Lovelace",
    "customerEmail": "no-reply@test.com",
    "lines": [
      { "lineId": "L1", "productId": "P100", "quantity": 2, "lineTotal": 200 },
      { "lineId": "L2", "productId": "P200", "quantity": 1, "lineTotal": 50.5 }
    ],
    "totalAmount": 250.5
  }
}
```

### Step 3.3: Show Kafka UI

Open:

```text
http://localhost:8080
```

Show:

- `partner.raw.events`: raw partner message.
- `canonical.events`: normalized message.
- `transformation.dlq`: where failures go.

## Closing Line

```text
CanonBridge lets us keep partner-specific auth, request details, and response shapes configurable. REST payloads and Kafka messages become canonical outputs without writing a new adapter for every system.
```
