# CanonBridge Mock API Examples

The mock service exposes demo external systems for Mapping Studio and end-to-end testing.

## Auth

Most REST demo systems use a bearer token:

```bash
Authorization: Bearer demo-token
```

PayFlex uses `X-API-Key`, FastCargo uses Basic Auth, and ShopMax/ProfileHub/CustomerGateway use issued OAuth-style bearer tokens.

## Example Calls

```bash
curl http://localhost:8080/api/payments/latest \
  -H "X-API-Key: demo-api-key-12345"

curl http://localhost:8080/api/foodmarket/orders/FM-1001 \
  -H "Authorization: Bearer demo-token"

curl http://localhost:8080/api/inventorypro/items/SKU-1001 \
  -H "Authorization: Bearer demo-token"

curl http://localhost:8080/api/ticketdesk/tickets/TCK-1001 \
  -H "Authorization: Bearer demo-token"

curl http://localhost:8080/api/cloudbill/invoices/INV-1001 \
  -H "Authorization: Bearer demo-token"

curl http://localhost:8080/api/peopleops/employees/EMP-1001 \
  -H "Authorization: Bearer demo-token"
```

See [Payload Catalog](./docs/payload-catalog.md), [Scenarios](./docs/scenarios.md), and [Demo Runbook](./docs/demo-runbook.md) for the fuller demo flow.
