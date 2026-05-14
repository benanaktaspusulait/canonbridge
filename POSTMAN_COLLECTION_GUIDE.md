# CanonBridge API Proxy - Postman Collection Guide

## 📦 Collection Overview

Bu Postman collection, CanonBridge API Proxy sistemini test etmek için hazırlanmıştır. GET ve POST proxy örnekleri, validation testleri ve direkt Mock API çağrıları içerir.

## 🔧 Collection Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:8082` | Backend API base URL |
| `tenantId` | `tenant-acme` | Tenant identifier |
| `mappingIdPost` | `b3bb5c80-7966-4014-a2b4-235539f36b1b` | POST mapping ID |
| `mappingIdGet` | `e87b7f54-0e6a-4606-9c43-61b0891ce2be` | GET mapping ID |

## 📋 Proxy Endpoints (8 requests)

### 1. POST Proxy - Payment Query with Body ✅
**Method**: `POST`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdPost}}`  
**Body**:
```json
{
  "partner_format": "detailed",
  "customer_id": "CUST-12345"
}
```
**Description**: POST örneği - request body transformation ile

**Flow**:
1. Partner'ın eski formatında request alır
2. Request transformation uygular (customer_id → customerId, status ekler)
3. External API'yi POST ile çağırır
4. Response transformation uygular (karmaşık payment → 5 alan)
5. Partner'ın beklediği formatta response döner

---

### 2. GET Proxy - Payment Latest with Query Params ✅
**Method**: `GET`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdGet}}?format=detailed`  

**Description**: GET örneği - query parameters ile (request body yok)

**Flow**:
1. Query params'ı alır (format=detailed)
2. Query params'ı API query string'e dönüştürür
3. External API'yi GET ile çağırır
4. Response transformation uygular
5. Basitleştirilmiş response döner

**Expected Response**:
```json
{
  "paymentId": "PAY-D4271272",
  "amount": 1250.5,
  "currency": "EUR",
  "status": "COMPLETED",
  "customerEmail": "john.doe@example.com"
}
```

---

### 3. GET Proxy - Payment Latest (Flat Format)
**Method**: `GET`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdGet}}?format=flat`  

**Description**: Aynı GET proxy ama flat format ile

---

### 4. POST Proxy - Different Customer
**Method**: `POST`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdPost}}`  
**Body**:
```json
{
  "partner_format": "flat",
  "customer_id": "CUST-67890"
}
```

**Description**: Farklı customer ve flat format ile POST örneği

---

### 5. POST Proxy - Validation Error (Invalid Format) ❌
**Method**: `POST`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdPost}}`  
**Body**:
```json
{
  "partner_format": "invalid_format",
  "customer_id": "CUST-99999"
}
```

**Expected**: `400 Bad Request`  
**Reason**: `partner_format` sadece "flat" veya "detailed" olabilir

---

### 6. POST Proxy - Validation Error (Missing Required Field) ❌
**Method**: `POST`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdPost}}`  
**Body**:
```json
{
  "partner_format": "detailed"
}
```

**Expected**: `400 Bad Request`  
**Reason**: `customer_id` zorunlu alan

---

### 7. Get Mapping Proxy Info (POST)
**Method**: `GET`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdPost}}/info`  

**Description**: POST mapping hakkında bilgi alır

---

### 8. Get Mapping Proxy Info (GET)
**Method**: `GET`  
**URL**: `{{baseUrl}}/api/proxy/{{mappingIdGet}}/info`  

**Description**: GET mapping hakkında bilgi alır

---

## 🔌 Direct Mock API (3 requests)

Karşılaştırma için direkt Mock API çağrıları:

### 1. Mock API - Get Latest Payment (Detailed)
**Method**: `GET`  
**URL**: `http://localhost:8085/api/payments/latest?format=detailed`  
**Headers**: `X-API-Key: demo-api-key-12345`

**Description**: Proxy olmadan direkt API çağrısı - karmaşık response döner

---

### 2. Mock API - Get Latest Payment (Flat)
**Method**: `GET`  
**URL**: `http://localhost:8085/api/payments/latest?format=flat`  
**Headers**: `X-API-Key: demo-api-key-12345`

---

### 3. Mock API - Query Payments with Body
**Method**: `POST`  
**URL**: `http://localhost:8085/api/payments/query`  
**Headers**: `X-API-Key: demo-api-key-12345`  
**Body**:
```json
{
  "customerId": "CUST-12345",
  "status": "COMPLETED",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31"
}
```

---

## 🚀 Nasıl Kullanılır

1. **Import**: `CanonBridge_API_Proxy.postman_collection.json` dosyasını Postman'e import edin
2. **Variables**: Tüm değişkenler önceden yapılandırılmış
3. **Test**: Request'leri sırayla çalıştırın:
   - ✅ GET proxy ile query params
   - ✅ POST proxy ile request body
   - ❌ Validation hataları
   - 🔌 Direkt mock API çağrıları (karşılaştırma için)

## 🔑 Önemli Farklar

### GET Proxy vs POST Proxy

| Özellik | GET Proxy | POST Proxy |
|---------|-----------|------------|
| **Input** | Query parameters | Request body (JSON) |
| **Request Body** | Yok | Var |
| **Use Case** | Basit sorgular | Karmaşık data gönderme |
| **Example** | `?format=detailed` | `{"customer_id": "CUST-123"}` |

### Proxy vs Direct Mock API

| Özellik | Proxy | Direct Mock API |
|---------|-------|-----------------|
| **Transformation** | ✅ Request + Response | ❌ Yok |
| **Partner Format** | ✅ Eski format | ❌ Yeni format |
| **Code Change** | ❌ Sadece URL değişir | ✅ Kod değişikliği gerekir |
| **Response** | Basit (5 alan) | Karmaşık (nested objects) |

## 📊 Test Senaryoları

### ✅ Success Cases
1. GET proxy with detailed format
2. GET proxy with flat format
3. POST proxy with valid data
4. POST proxy with different customer

### ❌ Error Cases
1. Invalid format value → 400 Bad Request
2. Missing required field → 400 Bad Request
3. Invalid mapping ID → 404 Not Found

## 💡 Tips

- **Headers**: Her request'te `X-Tenant-Id` header'ı zorunlu
- **Variables**: Collection variables'ı değiştirerek farklı mapping'leri test edebilirsiniz
- **Comparison**: Proxy ve Direct API request'lerini karşılaştırarak transformation'ı görebilirsiniz
- **Validation**: Error case'leri test ederek validation kurallarını doğrulayabilirsiniz

## 🎯 Expected Results

**GET Proxy Response** (Transformed):
```json
{
  "paymentId": "PAY-XXX",
  "amount": 1250.5,
  "currency": "EUR",
  "status": "COMPLETED",
  "customerEmail": "john.doe@example.com"
}
```

**Direct Mock API Response** (Original - Complex):
```json
{
  "payment": {
    "id": "PAY-XXX",
    "amount": {
      "value": 1250.5,
      "currency": "EUR"
    },
    "status": "COMPLETED",
    ...
  },
  "merchant": { ... },
  "payer": {
    "email": "john.doe@example.com",
    ...
  },
  ...
}
```

Görüldüğü gibi proxy, karmaşık nested response'u basit 5 alana dönüştürüyor! 🎉
