# Mapping Wizard Düzeltmeleri

## Yapılan Değişiklikler

### 1. Sample JSON Extraction İyileştirmesi
**Dosya**: `mapping-studio-ui/src/app/pages/mapping-wizard/mapping-wizard.component.ts`

**Sorun**: `extractSampleJson` metodu `requestTransformation.template`'i döndürüyordu (bu hedef API request'i, kaynak veri değil)

**Düzeltme**:
- `sample_payload` field'ını hem string hem object olarak kontrol et
- `source_config` içindeki tüm olası field'ları kontrol et: `sourceJson`, `sampleJson`, `sample_payload`, `payload`
- Hem string hem object tiplerini destekle
- Detaylı console logging ekle
- `requestTransformation.template` kontrolünü kaldır (yanlış veri kaynağıydı)

### 2. Field Mapping Step - JSON Parse Hataları
**Dosya**: `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step4-field-mapping/field-mapping-step.component.ts`

**Sorun**: Boş string'leri `JSON.parse()` ile parse etmeye çalışınca "Unexpected end of JSON input" hatası

**Düzeltme**:
- `extractSourceFields()`: Boş string kontrolü ekle, detaylı logging
- `extractTargetFields()`: Boş string kontrolü ekle, detaylı logging  
- `generatePreview()`: Boş string kontrolü ekle, hata mesajı göster

### 3. Request Mapping Step - Config Loading
**Dosya**: `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step2-request-mapping/request-mapping-step.component.ts`

**Düzeltme**:
- Constructor effect'e detaylı logging ekle
- Null/undefined değerleri güvenli handle et
- Config yüklendiğinde otomatik preview oluştur

### 4. Wizard Component - Request Transformation Extraction
**Dosya**: `mapping-studio-ui/src/app/pages/mapping-wizard/mapping-wizard.component.ts`

**Düzeltme**:
- `extractRequestTransformation()` metoduna detaylı logging ekle
- sourceConfig ve requestTransformation yapısını trace et

## Kalan Sorunlar

### 1. Mapping'de Sample Data Yok
**Durum**: Database'de `e87b7f54-0e6a-4606-9c43-61b0891ce2be` mapping'i için:
- `etl_sample_payloads` tablosunda kayıt yok
- `mapping_drafts.source_config` boş
- `sample_payload` field'ı yok

**Sonuç**:
- Step 3 (Sample Data): Boş geliyor
- Step 4 (Request Mapping): Endpoint seçili gelmiyor (çünkü `requestTransformation` yok)
- Step 7 (Field Mapping): Source Fields boş

**Çözüm Seçenekleri**:

#### Seçenek A: Manuel Sample Data Girişi (Hızlı)
1. Mapping'i wizard'da aç
2. Step 3'te sample JSON'ı manuel gir:
```json
{
  "format": "detailed",
  "customerId": "CUST-12345"
}
```
3. Step 4'te endpoint configuration'ı gir
4. Devam et

#### Seçenek B: Database'e Sample Data Ekle (Kalıcı)
Mapping'in draft_id'sini bulup `etl_sample_payloads` tablosuna sample ekle

#### Seçenek C: Mock Data Kullan (Test)
Wizard'a fallback mock data ekle

## Test Adımları

### 1. Browser Console'u Aç
Chrome DevTools → Console

### 2. Mapping'i Aç
```
http://localhost:4200/wizard?mappingId=e87b7f54-0e6a-4606-9c43-61b0891ce2be
```

### 3. Console Loglarını Kontrol Et

**Mapping yüklenirken**:
```
=== LOADED MAPPING ===
=== EXTRACTED SOURCE CONFIG ===
=== EXTRACTING SAMPLE JSON ===
=== EXTRACTING REQUEST TRANSFORMATION ===
=== WIZARD STATE AFTER UPDATE ===
```

**Step 3'e girerken** (Sample Data):
- Sample JSON boş mu kontrol et
- Manuel gir veya skip et

**Step 4'e girerken** (Request Mapping):
```
=== REQUEST MAPPING STEP: initialConfig effect triggered ===
Loading config: { mode, template, jsonata, headers }
```

**Step 7'ye girerken** (Field Mapping):
```
=== EXTRACTING SOURCE FIELDS ===
=== EXTRACTING TARGET FIELDS ===
```

### 4. window.debugMapping'i Kontrol Et
Console'da:
```javascript
window.debugMapping
```

Bu mapping objesini gösterir. Kontrol et:
- `sample_payload` var mı?
- `source_config` ne içeriyor?
- `source_config.requestTransformation` var mı?
- `source_config.sourceJson` veya `source_config.sampleJson` var mı?

## Örnek Sample Data

### GET Mapping için:
```json
{
  "format": "detailed",
  "customerId": "CUST-12345",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### POST Mapping için:
```json
{
  "customer_id": "CUST-12345",
  "partner_format": "detailed",
  "transaction_type": "payment",
  "amount": 150.00,
  "currency": "USD"
}
```

## Sonraki Adımlar

1. **Test Et**: Mapping'i aç ve console loglarını kontrol et
2. **Sample Data Gir**: Step 3'te manuel sample data gir
3. **Request Mapping Ayarla**: Step 4'te endpoint configuration'ı gir
4. **Field Mapping Yap**: Step 7'de field'ları map et
5. **Kaydet ve Test Et**: Postman ile proxy endpoint'i test et

## Notlar

- Tüm JSON parse işlemleri artık güvenli (boş string kontrolü var)
- Detaylı logging sayesinde sorunları trace etmek kolay
- Mapping'de veri yoksa kullanıcı manuel girebilir
- Auto-save şu an disabled (backend validation sorunları yüzünden)
