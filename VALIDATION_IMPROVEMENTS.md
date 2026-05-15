# Request Validation Improvements - Step 4

## Özet

Wizard'ın 4. adımında (Request Validation) form validasyonu ve backend hata yönetimi iyileştirildi. Artık kullanıcılar boş veya hatalı gönderim yapamazlar ve tüm hatalar açık bir şekilde gösterilir.

## Yapılan İyileştirmeler

### 1. Frontend Validasyon Kontrolleri

#### Component Logic (`request-mapping-step.component.ts`)

**hasBlockingErrors() - Geliştirildi:**
```typescript
hasBlockingErrors = computed(() => {
  // Required field kontrolü
  if (this.requiredFieldErrors().length > 0) return true;
  
  // Backend validation hataları kontrolü
  if (this.backendValidationErrors().length > 0) return true;
  
  // Validation yapılmamışsa ve field varsa engelle
  const hasIncludedFields = this.fieldMappings().some(m => m.included);
  if (hasIncludedFields && !this.backendValidationDone()) return true;
  
  return false;
});
```

**onNext() - Validation Kontrolü Eklendi:**
- Form geçerli değilse işlem yapılmaz
- Validation yapılmamışsa otomatik olarak çalıştırılır
- Blocking error varsa ilerleme engellenir

**getNextButtonTooltip() - Yeni Metod:**
- Required field hataları için detaylı mesaj
- Backend validation hataları için sayı
- Validation yapılmamışsa uyarı
- JSON/JSONata hataları için açıklama

**validateFieldConstraints() - İyileştirildi:**
- Required field kontrolü eklendi
- Daha açıklayıcı hata mesajları

**validateWithBackend() - Hata Yönetimi:**
- Başarılı validation için console log
- Hata durumunda detaylı console warn
- Network hatası için generic error mesajı

### 2. Backend Validation İyileştirmeleri

#### RequestValidationService.java

**Daha İyi Hata Mesajları:**

```java
// REQUIRED
"Field 'email' is required but is missing or empty"

// RANGE
"Field 'age' value 150.00 exceeds the maximum allowed value of 120.00"

// LENGTH
"Field 'username' length (2 characters) is below the minimum required length of 3 characters"

// PATTERN
"Field 'email' value 'invalid' does not match the required pattern: ^[a-z]+@[a-z]+\.[a-z]+$"

// ENUM
"Field 'status' value 'INVALID' is not valid. Allowed values are: ACTIVE, INACTIVE, PENDING"

// TYPE_MISMATCH
"Field 'age' must be a number, but received string"
```

**checkType() - Geliştirildi:**
- Array ve object type kontrolü eklendi
- Daha kullanıcı dostu tip isimleri
- String.format ile tutarlı mesajlar

**Pattern Validation:**
- PatternSyntaxException yakalanıyor
- Geçersiz regex için hata mesajı

#### MappingDraftResource.java

**validate-request Endpoint İyileştirildi:**

```java
// Payload kontrolü
if (payload == null) {
  return error response with message
}

// Rules kontrolü
if (rules == null || rules.isEmpty()) {
  return success with "No validation rules defined"
}

// Response'a ek alanlar
{
  "valid": true/false,
  "errors": [...],
  "totalErrors": 3,
  "message": "Validation failed with 3 error(s)"
}
```

### 3. UI/UX İyileştirmeleri

#### HTML Template (`request-mapping-step.component.html`)

**Validation Summary - Yeniden Tasarlandı:**
```html
<div class="validation-summary error">
  <div class="summary-header">
    <i class="pi pi-exclamation-triangle"></i>
    <span class="summary-title">3 validation issues found</span>
    <span class="summary-subtitle">Please fix these issues before proceeding</span>
  </div>
  <ul class="summary-list">
    <li class="summary-item type-required">
      <div class="err-icon">
        <i class="pi pi-exclamation-circle"></i>
      </div>
      <div class="err-content">
        <span class="err-field">email</span>
        <span class="err-message">Field 'email' is required but is missing or empty</span>
      </div>
    </li>
  </ul>
</div>
```

**Validation Warning - Yeni:**
```html
<div class="validation-warning">
  <i class="pi pi-info-circle"></i>
  <span>Please click "Validate" to check your request payload before proceeding</span>
</div>
```

**Next Button Tooltip:**
- Dinamik tooltip mesajları
- Hatanın türüne göre açıklama

#### CSS Styling (`request-mapping-step.component.scss`)

**Hata Tiplerine Göre Renkler:**
- `type-required`: Kırmızı (critical)
- `type-type_mismatch`: Kırmızı (critical)
- `type-range`, `type-length`: Turuncu (warning)
- `type-pattern`, `type-enum`: Mor (validation)
- `type-constraint`: Turuncu (warning)

**İyileştirilmiş Layout:**
- Icon + content layout
- Daha iyi spacing
- Beyaz background kartlar
- Responsive tasarım

### 4. TypeScript Interface Güncellemeleri

#### mapping.service.ts

```typescript
export interface RequestValidationResponse {
  valid: boolean;
  errors: ValidationError[];
  totalErrors?: number;  // Yeni
  message?: string;      // Yeni
}
```

## Kullanım Senaryoları

### Senaryo 1: Required Field Eksik
1. Kullanıcı bir field'ı required olarak işaretler
2. Field'ı request'e dahil etmez (checkbox unchecked)
3. **Sonuç:** 
   - Kırmızı hata mesajı gösterilir
   - Next butonu disabled olur
   - Tooltip: "Required fields are excluded: email"

### Senaryo 2: Type Mismatch
1. Kullanıcı bir field'ı "number" olarak işaretler
2. Sample data'da string değer var
3. Validate butonuna tıklar
4. **Sonuç:**
   - Backend "Field 'age' must be a number, but received string" hatası döner
   - Hata listede gösterilir
   - Next butonu disabled olur

### Senaryo 3: Range Validation
1. Kullanıcı age field'ına min=18, max=120 constraint ekler
2. Sample data'da age=150 var
3. Validate butonuna tıklar
4. **Sonuç:**
   - "Field 'age' value 150.00 exceeds the maximum allowed value of 120.00"
   - Turuncu warning rengi ile gösterilir

### Senaryo 4: Pattern Validation
1. Kullanıcı email field'ına regex pattern ekler: `^[a-z]+@[a-z]+\.[a-z]+$`
2. Sample data'da "invalid-email" var
3. Validate butonuna tıklar
4. **Sonuç:**
   - "Field 'email' value 'invalid-email' does not match the required pattern"
   - Mor validation rengi ile gösterilir

### Senaryo 5: Validation Yapılmamış
1. Kullanıcı field'ları seçer ve constraint ekler
2. Validate butonuna tıklamadan Next'e basar
3. **Sonuç:**
   - Otomatik olarak validation çalışır
   - Hata varsa gösterilir, yoksa bir sonraki adıma geçer

## Test Edilmesi Gerekenler

### Frontend Tests
- [ ] Required field excluded olduğunda Next butonu disabled olmalı
- [ ] Validation yapılmadan Next'e basıldığında otomatik validation çalışmalı
- [ ] Backend validation hataları doğru gösterilmeli
- [ ] Tooltip mesajları doğru görünmeli
- [ ] Validation success mesajı gösterilmeli

### Backend Tests
- [ ] Payload null olduğunda uygun hata dönmeli
- [ ] Rules boş olduğunda success dönmeli
- [ ] Required field validation çalışmalı
- [ ] Type mismatch validation çalışmalı
- [ ] Range validation (min/max) çalışmalı
- [ ] Length validation (minLength/maxLength) çalışmalı
- [ ] Pattern validation çalışmalı
- [ ] Enum validation çalışmalı
- [ ] Nested field validation çalışmalı

### Integration Tests
- [ ] Frontend'den gönderilen validation request backend'de doğru işlenmeli
- [ ] Backend'den dönen hatalar frontend'de doğru gösterilmeli
- [ ] Network hatası durumunda generic error gösterilmeli

## Örnek Validation Request/Response

### Request
```json
{
  "payload": {
    "email": "test@example.com",
    "age": 25,
    "username": "john"
  },
  "rules": [
    {
      "field": "email",
      "required": true,
      "type": "string",
      "pattern": "^[a-z]+@[a-z]+\\.[a-z]+$"
    },
    {
      "field": "age",
      "required": true,
      "type": "number",
      "minValue": 18,
      "maxValue": 120
    },
    {
      "field": "username",
      "required": true,
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    }
  ]
}
```

### Response (Success)
```json
{
  "valid": true,
  "errors": [],
  "totalErrors": 0,
  "message": "Validation successful - all fields are valid"
}
```

### Response (Errors)
```json
{
  "valid": false,
  "errors": [
    {
      "field": "email",
      "type": "REQUIRED",
      "message": "Field 'email' is required but is missing or empty"
    },
    {
      "field": "age",
      "type": "RANGE",
      "message": "Field 'age' value 150.00 exceeds the maximum allowed value of 120.00"
    },
    {
      "field": "username",
      "type": "LENGTH",
      "message": "Field 'username' length (2 characters) is below the minimum required length of 3 characters"
    }
  ],
  "totalErrors": 3,
  "message": "Validation failed with 3 error(s)"
}
```

## Sonuç

Bu iyileştirmelerle birlikte:
- ✅ Kullanıcılar boş gönderim yapamaz
- ✅ Tüm validation hataları açıkça gösterilir
- ✅ Backend'den gelen hatalar kullanıcı dostu
- ✅ Form validation Next butonunu kontrol eder
- ✅ Validation yapılmadan ilerleme engellenir
- ✅ Hata tipleri görsel olarak ayrıştırılır
- ✅ Tooltip'ler kullanıcıya rehberlik eder
