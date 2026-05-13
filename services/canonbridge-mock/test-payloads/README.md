# Test Payloads for Mock Service Mappings

Bu klasör, CanonBridge mock servisleri için test payload'larını içerir. Bu payload'lar mapping-studio-api'deki mapping'lerin doğru çalıştığını test etmek için kullanılır.

## Payload Kategorileri

### PayFlex (Payment Gateway)
- `payflex-payment-success.json` - Başarılı ödeme webhook'u
- `payflex-payment-failed.json` - Başarısız ödeme webhook'u
- `payflex-refund.json` - İade işlemi webhook'u

### FastCargo (Logistics/SOAP)
- `fastcargo-track-in-transit.xml` - Transit durumundaki kargo sorgusu (SOAP)
- `fastcargo-track-delivered.xml` - Teslim edilmiş kargo sorgusu (SOAP)

### ShopMax (E-Commerce/Kafka)
- `shopmax-order-created.json` - Yeni sipariş oluşturma event'i
- `shopmax-order-cancelled.json` - Sipariş iptal event'i

## Kullanım

### PayFlex Webhook Test

```bash
# Başarılı ödeme
curl -X POST http://localhost:8080/webhook/payflex/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: payflex-secret-key" \
  -d @test-payloads/payflex-payment-success.json

# Başarısız ödeme
curl -X POST http://localhost:8080/webhook/payflex/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: payflex-secret-key" \
  -d @test-payloads/payflex-payment-failed.json

# İade
curl -X POST http://localhost:8080/webhook/payflex/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Key: payflex-secret-key" \
  -d @test-payloads/payflex-refund.json
```

### FastCargo SOAP Test

```bash
# Transit durumu
curl -X POST http://localhost:8080/ws/track \
  -H "Content-Type: text/xml" \
  -H "SOAPAction: getShipmentStatus" \
  --user "fastcargo-demo:fastcargo-secret" \
  -d @test-payloads/fastcargo-track-in-transit.xml

# Teslim edildi durumu
curl -X POST http://localhost:8080/ws/track \
  -H "Content-Type: text/xml" \
  -H "SOAPAction: getShipmentStatus" \
  --user "fastcargo-demo:fastcargo-secret" \
  -d @test-payloads/fastcargo-track-delivered.xml
```

### ShopMax Kafka Test

```bash
# Sipariş oluşturma
cat test-payloads/shopmax-order-created.json | \
  docker exec -i canonbridge-kafka kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic partner.shopmax.raw

# Sipariş iptal
cat test-payloads/shopmax-order-cancelled.json | \
  docker exec -i canonbridge-kafka kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic partner.shopmax.raw
```

## Otomatik Test

Tüm test'leri otomatik olarak çalıştırmak için:

```bash
cd services/canonbridge-mock
./scripts/test-mappings.sh
```

## Mapping Bilgileri

### PayFlex Mapping
- **Partner ID**: `11111111-1111-1111-1111-111111111111`
- **Event Type**: `payment.completed`
- **Source Type**: `WEBHOOK`
- **Canonical Schema**: `PaymentCompleted` (v1)

### FastCargo Mapping
- **Partner ID**: `22222222-2222-2222-2222-222222222222`
- **Event Type**: `shipment.status`
- **Source Type**: `SOAP`
- **Canonical Schema**: `ShipmentStatus` (v1)

### ShopMax Mapping
- **Partner ID**: `33333333-3333-3333-3333-333333333333`
- **Event Type**: `order.created`
- **Source Type**: `KAFKA`
- **Canonical Schema**: `OrderCreated` (v1)

## Beklenen Canonical Çıktılar

### PayFlex Canonical Output
```json
{
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
  "billingAddress": {...},
  "metadata": {...},
  "timestamp": "2026-05-13T10:30:00Z"
}
```

### FastCargo Canonical Output
```json
{
  "trackingNumber": "FC123456789",
  "status": "IN_TRANSIT",
  "currentLocation": {
    "facility": "Distribution Center NYC",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "timestamp": "2026-05-13T08:30:00Z"
  },
  "estimatedDelivery": "2026-05-14T18:00:00Z",
  "weight": 2.5,
  "weightUnit": "kg"
}
```

### ShopMax Canonical Output
```json
{
  "eventId": "sm-550e8400-e29b-41d4-a716-446655440000",
  "orderId": "ORD-20260513-001",
  "customerId": "CUST-12345",
  "customerEmail": "customer@shopmax.com",
  "items": [...],
  "subtotal": 99.97,
  "taxTotal": 8.00,
  "shippingCost": 5.99,
  "totalAmount": 113.96,
  "currency": "USD",
  "paymentMethod": "CREDIT_CARD",
  "paymentStatus": "PAID",
  "shippingAddress": {...},
  "timestamp": "2026-05-13T10:30:00Z"
}
```

## Troubleshooting

### Mock servis çalışmıyor
```bash
cd services/canonbridge-mock
docker-compose up -d
```

### Kafka topic yok
```bash
docker exec -it canonbridge-kafka kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create --topic partner.shopmax.raw \
  --partitions 1 --replication-factor 1
```

### Database migration çalışmadı
```bash
cd services/mapping-studio-api
mvn flyway:migrate
```

## İlgili Dosyalar

- Migration: `services/mapping-studio-api/src/main/resources/db/migration/V15__insert_mock_service_mappings.sql`
- Test Script: `services/canonbridge-mock/scripts/test-mappings.sh`
- Mock Service Docs: `services/canonbridge-mock/README.md`
- Payload Catalog: `services/canonbridge-mock/docs/payload-catalog.md`
