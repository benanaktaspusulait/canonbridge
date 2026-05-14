# CanonBridge API Proxy System

## 📖 Genel Bakış

CanonBridge API Proxy sistemi, partnerların mevcut entegrasyonlarını **kod değişikliği yapmadan** yeni API'lere geçiş yapmalarını sağlar. Sistem, eski format request'leri kabul eder, yeni API formatına çevirir, hedef API'yi çağırır ve response'u tekrar eski formata dönüştürerek döner.

## 🎯 Kullanım Senaryosu

**Sorun:** Partner eski API formatıyla çalışıyor, yeni API'ye geçmek için tüm kodunu değiştirmesi gerekiyor.

**Çözüm:** Partner sadece URL'i değiştirir, kod değişikliği yapmaz!

```bash
# Eski
POST https://old-api.com/payments/query

# Yeni (Proxy ile)
POST https://canonbridge.com/api/proxy/{mappingId}
```

## 🚀 Özellikler

### 1. Request Transformation
- Partner'ın eski formatındaki request'i yeni API formatına çevirir
- JSONata transformation engine kullanır
- Dinamik field mapping

### 2. Response Transformation
- Yeni API'nin karmaşık response'unu basit formata çevirir
- Partner'ın beklediği alanları döner
- 5 alan mapping örneği:
  - `payment.id` → `paymentId`
  - `payment.amount.value` → `amount`
  - `payment.amount.currency` → `currency`
  - `payment.status` → `status`
  - `payer.email` → `customerEmail`

### 3. Validation
- Input schema validation
- Required field kontrolü
- Enum değer kontrolü

### 4. Error Handling
- Detaylı error mesajları
- HTTP status code mapping (400, 404, 502, 504, 500)
- Error stage tracking
- Timestamp

## 📋 API Endpoints

### Execute Mapping Proxy
```http
POST /api/proxy/{mappingId}
Content-Type: application/json
X-Tenant-Id: {tenantId}

{
  "partner_format": "detailed",
  "customer_id": "CUST-12345",
  "request_id": "REQ-001"
}
```

**Response:**
```json
{
  "paymentId": "PAY-E8E7155F",
  "amount": 1250.5,
  "currency": "EUR",
  "status": "COMPLETED",
  "customerEmail": "john.doe@example.com"
}
```

### Get Mapping Info
```http
GET /api/proxy/{mappingId}/info
X-Tenant-Id: {tenantId}
```

**Response:**
```json
{
  "mappingId": "b3bb5c80-7966-4014-a2b4-235539f36b1b",
  "name": "Payment Mapping",
  "proxyEndpoint": "/api/proxy/b3bb5c80-7966-4014-a2b4-235539f36b1b",
  "sourceType": "REST_API",
  "transformationRulesCount": 5
}
```

## 🧪 Test Senaryoları

### Test 1: Detailed Format
```bash
curl -X POST http://localhost:8082/api/proxy/b3bb5c80-7966-4014-a2b4-235539f36b1b \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-acme" \
  -d '{
    "partner_format": "detailed",
    "customer_id": "CUST-12345",
    "request_id": "REQ-001"
  }'
```

### Test 2: Flat Format
```bash
curl -X POST http://localhost:8082/api/proxy/b3bb5c80-7966-4014-a2b4-235539f36b1b \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-acme" \
  -d '{
    "partner_format": "flat",
    "customer_id": "CUST-67890",
    "request_id": "REQ-002"
  }'
```

### Test 3: Validation Error
```bash
curl -X POST http://localhost:8082/api/proxy/b3bb5c80-7966-4014-a2b4-235539f36b1b \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-acme" \
  -d '{
    "partner_format": "invalid_format",
    "customer_id": "CUST-99999"
  }'
```

**Expected Error:**
```json
{
  "error": "Input validation failed: partner_format must be 'flat' or 'detailed'",
  "stage": "validation",
  "timestamp": 1715698765432
}
```

## 📊 Sistem Akışı

```
┌─────────────┐
│   Partner   │
│ Application │
└──────┬──────┘
       │ POST /api/proxy/{mappingId}
       │ (Eski Format)
       ▼
┌─────────────────────────────────┐
│   CanonBridge Proxy System      │
│                                 │
│  1. Input Validation            │
│  2. Request Transformation      │
│  3. Call Target API             │
│  4. Response Transformation     │
│  5. Return Result               │
└──────┬──────────────────────────┘
       │ GET /api/payments/latest
       │ (Yeni Format)
       ▼
┌─────────────┐
│  Target API │
│ (Mock/Real) │
└─────────────┘
```

## 🔧 Konfigürasyon

### Mapping Configuration
```json
{
  "url": "http://canonbridge-mock:8080/api/payments/latest",
  "method": "GET",
  "headers": {
    "X-API-Key": "demo-api-key-12345"
  },
  "requestTransformation": {
    "mode": "jsonata",
    "jsonata": "{\"queryParams\": {\"format\": partner_format ? partner_format : \"detailed\"}}"
  }
}
```

### Mapping Rules (Response Transformation)
```json
[
  {
    "id": "rule_payment_id",
    "sourcePath": "payment.id",
    "targetKey": "paymentId",
    "transform": "direct"
  },
  {
    "id": "rule_amount",
    "sourcePath": "payment.amount.value",
    "targetKey": "amount",
    "transform": "direct"
  },
  {
    "id": "rule_currency",
    "sourcePath": "payment.amount.currency",
    "targetKey": "currency",
    "transform": "direct"
  },
  {
    "id": "rule_status",
    "sourcePath": "payment.status",
    "targetKey": "status",
    "transform": "direct"
  },
  {
    "id": "rule_customer_email",
    "sourcePath": "payer.email",
    "targetKey": "customerEmail",
    "transform": "direct"
  }
]
```

### Validation Rules
```json
{
  "input": {
    "required": false,
    "validateSchema": true
  },
  "output": {
    "required": true,
    "validateSchema": false,
    "requiredFields": ["paymentId", "amount", "status"]
  }
}
```

### Input Schema
```json
{
  "type": "object",
  "properties": {
    "partner_format": {
      "type": "string",
      "enum": ["flat", "detailed"],
      "description": "Response format preference"
    },
    "customer_id": {
      "type": "string",
      "description": "Customer identifier"
    },
    "request_id": {
      "type": "string",
      "description": "Request tracking ID"
    }
  },
  "additionalProperties": true
}
```

## 📦 Postman Collection

Postman collection dosyası: `CanonBridge_API_Proxy.postman_collection.json`

### Collection İçeriği:
1. **Execute Mapping Proxy - Detailed Format** - Detailed format ile test
2. **Execute Mapping Proxy - Flat Format** - Flat format ile test
3. **Execute Mapping Proxy - Invalid Format** - Validation error testi
4. **Get Mapping Proxy Info** - Mapping bilgilerini getir
5. **Mock API - Get Latest Payment (Detailed)** - Direkt mock API çağrısı
6. **Mock API - Get Latest Payment (Flat)** - Direkt mock API çağrısı (flat)
7. **Mock API - Query Payments with Body** - Body ile query

### Postman Variables:
- `baseUrl`: http://localhost:8082
- `tenantId`: tenant-acme
- `mappingId`: b3bb5c80-7966-4014-a2b4-235539f36b1b

## 🎨 UI Entegrasyonu

Mapping Wizard'ın 5. adımında (Test & Publish) proxy URL otomatik gösterilir:

### Özellikler:
- ✅ Proxy URL gösterimi
- ✅ Copy to clipboard butonu
- ✅ cURL örneği
- ✅ Gradient tasarım
- ✅ Responsive

### Görünüm:
```
┌─────────────────────────────────────────────┐
│  🔗 API Proxy Endpoint                      │
│                                             │
│  http://localhost:8082/api/proxy/...       │
│  [Copy]                                     │
│                                             │
│  Example cURL Command:                      │
│  curl -X POST http://localhost:8082/...    │
└─────────────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Problem: 404 Not Found
**Çözüm:** Mapping ID'yi kontrol edin, mapping'in VALID durumda olduğundan emin olun.

### Problem: 400 Bad Request
**Çözüm:** Request body'nin input schema'ya uygun olduğunu kontrol edin.

### Problem: 502 Bad Gateway
**Çözüm:** Target API'nin erişilebilir olduğunu kontrol edin.

### Problem: Empty Response
**Çözüm:** 
1. Backend loglarını kontrol edin
2. Mapping rules'ın doğru olduğunu kontrol edin
3. Target API'nin response döndüğünü kontrol edin

## 📝 Geliştirme Notları

### Backend Files:
- `MappingProxyResource.java` - Proxy endpoint
- `MappingExecutionService.java` - Execution logic
- `WebClientProducer.java` - HTTP client

### Frontend Files:
- `test-publish-step.component.ts` - Proxy URL logic
- `test-publish-step.component.html` - UI template
- `test-publish-step.component.scss` - Styles

### Database:
- Table: `mapping_drafts`
- Key fields: `source_config`, `mapping_rules`, `validation_rules`, `input_schema`

## 🚀 Deployment

### Local Development:
```bash
# Backend
cd services/mapping-studio-api
mvn clean package -DskipTests
docker restart canonbridge-mapping-studio-api

# Frontend
cd mapping-studio-ui
npm run build
docker restart canonbridge-mapping-studio-ui
```

### Production:
1. Update environment variables
2. Configure proper API keys
3. Set up SSL/TLS
4. Configure rate limiting
5. Enable monitoring

## 📊 Metrics & Monitoring

### Key Metrics:
- Request count per mapping
- Average response time
- Error rate
- Transformation success rate

### Logging:
- Request/Response logging
- Error logging with stack traces
- Performance metrics
- Audit trail

## 🔐 Security

### Authentication:
- X-Tenant-Id header required
- API key validation for target APIs

### Authorization:
- Tenant-based access control
- Mapping ownership validation

### Data Protection:
- Input validation
- Output sanitization
- Rate limiting (TODO)
- Request size limits (TODO)

## 📚 Kaynaklar

- [JSONata Documentation](https://jsonata.org/)
- [Quarkus Reactive](https://quarkus.io/guides/getting-started-reactive)
- [Angular Signals](https://angular.io/guide/signals)
- [PrimeNG Components](https://primeng.org/)

## 🤝 Katkıda Bulunma

1. Feature branch oluşturun
2. Değişikliklerinizi yapın
3. Test edin
4. Pull request açın

## 📄 License

Internal use only - CanonBridge Platform
