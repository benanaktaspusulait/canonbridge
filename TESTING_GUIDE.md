# CanonBridge Testing Guide

Bu doküman, mock serviceler ve mapping'lerin doğru çalışıp çalışmadığını test etmek için hazırlanmıştır.

## 📋 Genel Bakış

CanonBridge sisteminde 3 farklı entegrasyon tipi test edilebilir:

1. **Webhook** - PayFlex ödeme webhook'ları
2. **SOAP** - FastCargo kargo takip servisi
3. **Kafka** - ShopMax sipariş event'leri

## 🚀 Hızlı Başlangıç

### 1. Tüm Servisleri Başlatın

```bash
# Mock service
cd services/canonbridge-mock
docker-compose up -d

# Mapping Studio API (database migrations için)
cd services/mapping-studio-api
mvn quarkus:dev

# Transformer Service
cd services/transformer
npm install
npm run dev
```

### 2. Database Migration'ları Çalıştırın

```bash
cd services/mapping-studio-api
mvn flyway:migrate
```

Bu komut şu mapping'leri oluşturur:
- ✅ PayFlex Payment Webhook Mapping
- ✅ FastCargo SOAP Tracking Mapping
- ✅ ShopMax Kafka Order Mapping

### 3. End-to-End Test'i Çalıştırın

```bash
./scripts/test-end-to-end.sh
```

## 📝 Manuel Test Senaryoları

### Senaryo 1: PayFlex Webhook → Transformer

**Amaç**: Webhook ile gelen ödeme verisinin canonical formata dönüştürülmesi

```bash
# 1. Webhook gönder
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: payflex" \
  -H "X-Event-Type: payment.completed" \
  -d '{
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
      "orderId": "ORD-12345"
    },
    "timestamp": "2026-05-13T10:30:00Z"
  }'
```

**Beklenen Çıktı**:
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

### Senaryo 2: ShopMax Kafka → Transformer

**Amaç**: Kafka'dan gelen sipariş event'inin canonical formata dönüştürülmesi

```bash
# 1. Kafka topic'ine event gönder
cat services/canonbridge-mock/test-payloads/shopmax-order-created.json | \
  docker exec -i canonbridge-kafka kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic partner.shopmax.raw

# 2. Transformer loglarını izle
docker-compose logs -f transformer

# 3. Canonical output topic'ini consume et
docker exec -i canonbridge-kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic canonical.order.created \
  --from-beginning
```

**Beklenen Davranış**:
- Transformer, `partner.shopmax.raw` topic'inden event'i alır
- ShopMax mapping'ini kullanarak canonical formata dönüştürür
- Canonical event'i `canonical.order.created` topic'ine yazar

### Senaryo 3: FastCargo SOAP → Mock → Transformer

**Amaç**: SOAP servisten gelen XML verisinin canonical formata dönüştürülmesi

```bash
# 1. SOAP request gönder (mock service'e)
curl -X POST http://localhost:8080/ws/track \
  -H "Content-Type: text/xml" \
  --user "fastcargo-demo:fastcargo-secret" \
  -d @services/canonbridge-mock/test-payloads/fastcargo-track-in-transit.xml

# 2. Response'u transformer'a gönder
# (Bu adım normalde otomatik olur, manuel test için)
curl -X POST http://localhost:3000/v1/transform \
  -H "Content-Type: application/json" \
  -H "X-Partner-Id: fastcargo" \
  -H "X-Event-Type: shipment.status" \
  -d '{
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
  }'
```

## 🔍 Doğrulama Adımları

### 1. Mapping'lerin Varlığını Kontrol Edin

```bash
# PostgreSQL'e bağlan
docker exec -it canonbridge-postgres psql -U postgres -d canonbridge

# Mapping'leri listele
SELECT id, partner_id, event_type, name, status 
FROM mapping_drafts 
WHERE tenant_id = 'tenant-demo';
```

**Beklenen Sonuç**:
```
                  id                  |              partner_id              |    event_type     |              name               | status
--------------------------------------+--------------------------------------+-------------------+---------------------------------+--------
 77777777-7777-7777-7777-777777777777 | 11111111-1111-1111-1111-111111111111 | payment.completed | PayFlex Payment Webhook Mapping | VALID
 88888888-8888-8888-8888-888888888888 | 22222222-2222-2222-2222-222222222222 | shipment.status   | FastCargo SOAP Tracking Mapping | VALID
 99999999-9999-9999-9999-999999999999 | 33333333-3333-3333-3333-333333333333 | order.created     | ShopMax Order Created Kafka...  | VALID
```

### 2. Partner'ların Varlığını Kontrol Edin

```bash
SELECT id, external_id, name, status 
FROM partners 
WHERE tenant_id = 'tenant-demo';
```

**Beklenen Sonuç**:
```
                  id                  | external_id |           name            | status
--------------------------------------+-------------+---------------------------+--------
 11111111-1111-1111-1111-111111111111 | payflex     | PayFlex Payment Gateway   | ACTIVE
 22222222-2222-2222-2222-222222222222 | fastcargo   | FastCargo Logistics       | ACTIVE
 33333333-3333-3333-3333-333333333333 | shopmax     | ShopMax E-Commerce        | ACTIVE
```

### 3. Canonical Schema'ların Varlığını Kontrol Edin

```bash
SELECT id, name, subject, version, status 
FROM schemas 
WHERE tenant_id = 'tenant-demo' AND schema_type = 'CANONICAL';
```

**Beklenen Sonuç**:
```
                  id                  |       name        |          subject           | version | status
--------------------------------------+-------------------+----------------------------+---------+--------
 44444444-4444-4444-4444-444444444444 | PaymentCompleted  | canonical.PaymentCompleted | 1       | ACTIVE
 55555555-5555-5555-5555-555555555555 | ShipmentStatus    | canonical.ShipmentStatus   | 1       | ACTIVE
 66666666-6666-6666-6666-666666666666 | OrderCreated      | canonical.OrderCreated     | 1       | ACTIVE
```

## 🧪 Test Payload'ları

Test payload'ları `services/canonbridge-mock/test-payloads/` klasöründe bulunur:

### PayFlex
- ✅ `payflex-payment-success.json` - Başarılı ödeme
- ✅ `payflex-payment-failed.json` - Başarısız ödeme
- ✅ `payflex-refund.json` - İade

### FastCargo
- ✅ `fastcargo-track-in-transit.xml` - Transit durumu
- ✅ `fastcargo-track-delivered.xml` - Teslim edildi

### ShopMax
- ✅ `shopmax-order-created.json` - Sipariş oluşturma
- ✅ `shopmax-order-cancelled.json` - Sipariş iptal

## 📊 Beklenen Sonuçlar

### Başarılı Test Kriterleri

1. **Database Migration** ✅
   - V15 migration başarıyla çalıştı
   - 3 partner, 3 schema, 3 mapping oluşturuldu

2. **Mock Service** ✅
   - Webhook endpoint'leri yanıt veriyor
   - SOAP endpoint'leri yanıt veriyor
   - Kafka event'leri üretiliyor

3. **Transformer Service** ✅
   - Mapping'leri database'den okuyor
   - JSONata transformation çalışıyor
   - Canonical event'ler üretiliyor

4. **End-to-End Flow** ✅
   - Webhook → Transformer → Canonical Output
   - Kafka → Transformer → Canonical Output
   - SOAP → Transformer → Canonical Output

## 🐛 Troubleshooting

### Problem: Migration çalışmadı

```bash
# Migration durumunu kontrol et
cd services/mapping-studio-api
mvn flyway:info

# Migration'ı tekrar çalıştır
mvn flyway:migrate

# Eğer hata varsa, repair et
mvn flyway:repair
```

### Problem: Transformer mapping'leri bulamıyor

```bash
# Transformer'ın database bağlantısını kontrol et
curl http://localhost:3000/health/readiness

# Environment variable'ları kontrol et
echo $DATABASE_URL
echo $MAPPING_API_URL
```

### Problem: Kafka event'leri consume edilmiyor

```bash
# Kafka topic'lerini listele
docker exec canonbridge-kafka kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --list

# Consumer group'ları kontrol et
docker exec canonbridge-kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --list

# Consumer lag'i kontrol et
docker exec canonbridge-kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe --group canonbridge-transformer
```

### Problem: SOAP parsing hatası

```bash
# Transformer loglarını kontrol et
docker-compose logs transformer | grep -i soap

# XML parser'ın yüklü olduğunu kontrol et
cd services/transformer
npm list xml2js
```

## 📚 İlgili Dosyalar

- **Migration**: `services/mapping-studio-api/src/main/resources/db/migration/V15__insert_mock_service_mappings.sql`
- **Test Payloads**: `services/canonbridge-mock/test-payloads/`
- **Test Scripts**: 
  - `scripts/test-end-to-end.sh` - End-to-end test
  - `services/canonbridge-mock/scripts/test-mappings.sh` - Mock service test
- **Documentation**:
  - `services/canonbridge-mock/README.md` - Mock service detayları
  - `services/canonbridge-mock/docs/payload-catalog.md` - Payload örnekleri

## ✅ Test Checklist

Sistemi test etmek için bu adımları takip edin:

- [ ] 1. Tüm servisleri başlat (mock, mapping-api, transformer)
- [ ] 2. Database migration'ı çalıştır (V15)
- [ ] 3. Partner'ların oluşturulduğunu doğrula
- [ ] 4. Schema'ların oluşturulduğunu doğrula
- [ ] 5. Mapping'lerin oluşturulduğunu doğrula
- [ ] 6. PayFlex webhook test et
- [ ] 7. FastCargo SOAP test et
- [ ] 8. ShopMax Kafka test et
- [ ] 9. Canonical output'ları doğrula
- [ ] 10. End-to-end test script'ini çalıştır

## 🎯 Sonuç

Bu test'ler başarıyla tamamlandığında:

✅ Mock serviceler gerçekçi veri üretiyor
✅ Mapping'ler database'de tanımlı
✅ Transformer mapping'leri kullanarak dönüşüm yapıyor
✅ Canonical event'ler doğru formatta üretiliyor
✅ Sistem end-to-end çalışıyor

Artık Mapping Studio UI'dan bu mapping'leri görüntüleyebilir ve düzenleyebilirsiniz!
