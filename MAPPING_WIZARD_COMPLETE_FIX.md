# Mapping Wizard - Tam Çözüm

## Yapılan Değişiklikler

### 1. Database Seed Script
**Dosya**: `db-seed-proxy-mappings.sql`

İki mapping oluşturuldu:
- **POST Mapping** (ID: `b3bb5c80-7966-4014-a2b4-235539f36b1b`)
- **GET Mapping** (ID: `e87b7f54-0e6a-4606-9c43-61b0891ce2be`)

Her mapping'in `source_config` JSONB field'ında:
- `url`: External API URL
- `method`: HTTP method (GET/POST)
- `headers`: API headers (X-API-Key)
- **`sampleJson`**: Sample input data (OBJECT olarak)
- **`requestTransformation`**: Request transformation config
  - `mode`: 'template' veya 'jsonata'
  - `template`: Template object
  - `jsonata`: JSONata expression
  - `headers`: Additional headers

### 2. Frontend Düzeltmeleri

#### A. Sample JSON Extraction (`mapping-wizard.component.ts`)
**Sorun**: `sampleJson` object olarak geliyor ama string bekleniyor

**Çözüm**: 
- `sampleJson` öncelikli kontrol ediliyor
- Hem string hem object tipini destekliyor
- Object ise `JSON.stringify()` ile string'e çevriliyor

#### B. Request Transformation Loading (`request-mapping-step.component.ts`)
**Sorun**: Config yüklenirken null/undefined değerler hata veriyordu

**Çözüm**:
- Null-safe handling
- Detaylı console logging
- Otomatik preview generation

#### C. Field Mapping JSON Parse (`field-mapping-step.component.ts`)
**Sorun**: Boş string'leri parse etmeye çalışınca "Unexpected end of JSON input"

**Çözüm**:
- Boş string kontrolü
- Güvenli error handling
- Kullanıcı dostu hata mesajları

## Test Etme

### 1. Database'i Kontrol Et
```bash
docker exec canonbridge-postgres psql -U canonbridge_user -d canonbridge_db -c "
SELECT 
    mv.id,
    mv.name,
    mv.source_type,
    md.id as draft_id
FROM mapping_versions mv
JOIN mapping_drafts md ON mv.draft_id = md.id
WHERE mv.id IN (
    'b3bb5c80-7966-4014-a2b4-235539f36b1b',
    'e87b7f54-0e6a-4606-9c43-61b0891ce2be'
);
"
```

### 2. API'den Mapping'i Kontrol Et
```bash
# GET Mapping
curl -s -H "X-Tenant-Id: default-tenant" \
  http://localhost:8082/api/mapping-drafts/e87b7f54-0e6a-4606-9c43-61b0891ce2ba \
  | jq '.source_config | fromjson | {sampleJson, requestTransformation}'

# POST Mapping
curl -s -H "X-Tenant-Id: default-tenant" \
  http://localhost:8082/api/mapping-drafts/b3bb5c80-7966-4014-a2b4-235539f36b1a \
  | jq '.source_config | fromjson | {sampleJson, requestTransformation}'
```

### 3. UI'da Test Et

#### GET Mapping:
```
http://localhost:4200/wizard?mappingId=e87b7f54-0e6a-4606-9c43-61b0891ce2be
```

**Beklenen Sonuç**:
- ✅ Step 2: Configuration gösteriliyor
- ✅ Step 3: Sample Data dolu geliyor:
  ```json
  {
    "partner_format": "detailed",
    "limit": 10,
    "customer_id": "CUST-12345",
    "include_metadata": true
  }
  ```
- ✅ Step 4: Request Mapping dolu geliyor (queryParams template)
- ✅ Step 5: Target Schema seçili
- ✅ Step 6: Field Mapping - Source Fields dolu
- ✅ Step 7: Test & Publish

#### POST Mapping:
```
http://localhost:4200/wizard?mappingId=b3bb5c80-7966-4014-a2b4-235539f36b1b
```

**Beklenen Sonuç**:
- ✅ Step 3: Sample Data dolu:
  ```json
  {
    "customer_id": "CUST-12345",
    "partner_format": "detailed",
    "transaction_type": "payment",
    "amount": 150.00,
    "currency": "USD",
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }
  ```
- ✅ Step 4: Request Mapping dolu (POST body template)

### 4. Console Loglarını Kontrol Et

Browser Console'da göreceğin loglar:

```
=== LOADED MAPPING ===
=== EXTRACTED SOURCE CONFIG ===
=== EXTRACTING SAMPLE JSON ===
Found sampleJson in source_config (object)
=== EXTRACTING REQUEST TRANSFORMATION ===
requestTransformation found: {mode: 'template', template: {...}, ...}
=== WIZARD STATE AFTER UPDATE ===
```

Step 4'e girdiğinde:
```
=== REQUEST MAPPING STEP: initialConfig effect triggered ===
Loading config: {mode: 'template', template: {...}, jsonata: '', headers: {}}
```

Step 6'ya girdiğinde:
```
=== EXTRACTING SOURCE FIELDS ===
✅ Parsed sample JSON: {...}
✅ Extracted source fields: [{path: 'customer_id', ...}, ...]
=== EXTRACTING TARGET FIELDS ===
✅ Parsed target schema: {...}
✅ Extracted target fields: [{key: 'paymentId', ...}, ...]
```

## Proxy Endpoint'leri Test Et

### GET Mapping Test:
```bash
curl -X GET "http://localhost:8082/api/proxy/e87b7f54-0e6a-4606-9c43-61b0891ce2be?format=detailed&limit=5&customerId=CUST-12345" \
  -H "X-Tenant-Id: default-tenant"
```

### POST Mapping Test:
```bash
curl -X POST "http://localhost:8082/api/proxy/b3bb5c80-7966-4014-a2b4-235539f36b1b" \
  -H "X-Tenant-Id: default-tenant" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUST-12345",
    "partner_format": "detailed",
    "amount": 200.00,
    "currency": "EUR"
  }'
```

## Veri Yapısı

### source_config Standardı:
```json
{
  "url": "http://canonbridge-mock:8080/api/...",
  "method": "GET|POST|PUT|PATCH|DELETE",
  "headers": {
    "X-API-Key": "...",
    "Content-Type": "application/json"
  },
  "sampleJson": {
    // Sample input data (canonical format)
    "field1": "value1",
    "field2": "value2"
  },
  "requestTransformation": {
    "mode": "template",
    "template": {
      // Template for transforming canonical to external API format
      "externalField": "{{field1}}"
    },
    "jsonata": "",
    "headers": {}
  }
}
```

## Sorun Giderme

### Sorun: Step 3'te sample data boş
**Çözüm**: 
1. Console'da `window.debugMapping` yaz
2. `source_config.sampleJson` var mı kontrol et
3. Yoksa database'i yeniden seed et

### Sorun: Step 4'te endpoint seçili gelmiyor
**Çözüm**:
1. Console'da `=== EXTRACTING REQUEST TRANSFORMATION ===` logunu kontrol et
2. `source_config.requestTransformation` var mı kontrol et
3. Yoksa database'i yeniden seed et

### Sorun: Step 6'da "Unexpected end of JSON input"
**Çözüm**: 
- Bu artık düzeltildi
- Boş string kontrolü var
- Eğer hala görüyorsan, console'da detaylı log var

## Yeni Mapping Oluşturma

Yeni bir proxy mapping oluşturmak için:

```sql
INSERT INTO mapping_drafts (
    id,
    tenant_id,
    partner_id,
    event_type,
    name,
    description,
    source_type,
    source_config,
    canonical_schema_ref,
    mapping_rules,
    status,
    created_at,
    updated_at,
    created_by
) VALUES (
    'your-uuid-here',
    'default-tenant',
    'partner-uuid',
    'EventName',
    'Mapping Name',
    'Description',
    'REST_API',
    jsonb_build_object(
        'url', 'http://external-api/endpoint',
        'method', 'POST',
        'headers', jsonb_build_object(
            'Authorization', 'Bearer token'
        ),
        'sampleJson', jsonb_build_object(
            'field1', 'value1',
            'field2', 'value2'
        ),
        'requestTransformation', jsonb_build_object(
            'mode', 'template',
            'template', jsonb_build_object(
                'externalField', '{{field1}}'
            ),
            'jsonata', '',
            'headers', jsonb_build_object()
        )
    ),
    'schema-ref-uuid',
    jsonb_build_array(),
    'DRAFT',
    NOW(),
    NOW(),
    'user@example.com'
);
```

## Özet

✅ Database'e sample data eklendi (`source_config.sampleJson`)  
✅ Request transformation eklendi (`source_config.requestTransformation`)  
✅ Frontend sample JSON extraction düzeltildi  
✅ Frontend JSON parse hataları düzeltildi  
✅ Detaylı logging eklendi  
✅ Null-safe handling eklendi  

Artık mapping wizard'ı edit mode'da açtığında tüm veriler doğru şekilde yükleniyor!
