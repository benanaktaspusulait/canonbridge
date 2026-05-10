# CanonBridge Mapping Studio UI - Kapsamli Gorsel JSONata Tasarimi

> Bu dokuman, CanonBridge Mapping Studio'nun kullanici arayuzunu ve JSONata
> becerilerinin gorsel olarak nasil sunulacagini tarif eder. Amac: kullanici
> JSONata bilmeden mapping tasarlayabilmeli; ileri seviye kullanici isterse
> ozel formulle JSONata yazabilmelidir.
>
> Tarih: 10 Mayis 2026

## Icindekiler

1. [Temel Prensip](#1-temel-prensip)
2. [Ekran Tasarimlari](#2-ekran-tasarimlari)
3. [Donusum Tipleri](#3-donusum-tipleri)
4. [JSONata Yeteneklerinin Gorsel Karsiliklari](#4-jsonata-yeteneklerinin-gorsel-karsiliklari)
5. [JSONata Generator Service API](#5-jsonata-generator-service-api)
6. [Kullanici Tipleri ve Izinler](#6-kullanici-tipleri-ve-izinler)
7. [Ozel Formul Modu](#7-ozel-formul-modu)
8. [Test ve Dogrulama](#8-test-ve-dogrulama)
9. [Mimari Etkisi](#9-mimari-etkisi)

## 1. Temel Prensip

```text
Kullanici JSONata bilmez, yazmaz, gormez (istemezse).
Tum temel JSONata yetenekleri gorsel secimlerle kullanilabilir.
Ileri seviye kullanicilar Ozel Formul modu ile JSONata yazabilir.
Her gorsel secim, arka planda versioned visual_config ve JSONata script'ine donusur.
```

Mapping Studio iki seviyeli bir urun deneyimi sunar:

- **No-code mod**: Business Analyst ve operasyon kullanicilari sadece alan secer, donusum tipi belirler, onizleme/test sonucunu gorur.
- **Advanced mod**: Integration Developer ve Admin rolleri JSONata script'ini gorur, editor uzerinden ozel formul yazabilir, helper function kullanimini inceleyebilir.

### JSONata Notasyonu

Bu dokumanda iki notasyon kullanilir:

- **Native JSONata**: Runtime'da dogrudan calisacak ifade.
- **Generator helper**: UI tarafinda okunurluk icin kullanilan ara kavram. Runtime'a cikmadan once native JSONata'ya compile edilmeli veya transformer runtime'a kontrollu custom function olarak register edilmelidir.

Ornek: UI'daki "Enum Esleme" paneli urun dilinde `$switch` gibi dusunulebilir, ancak generated script native JSONata lookup/conditional kullanmalidir.

## 2. Ekran Tasarimlari

### 2.1 Ana Ekran: Mapping Listesi

```text
+----------------------------------------------------------------------------+
| CanonBridge Mapping Studio                                   [Admin] [Exit] |
|                                                                            |
| Partner [CompanyA v]   Event [OrderCreated v]   Version [v3 active v]       |
|                                                                            |
| + Source Schema ----------------+  + Mapping List ------------------------+ |
| | order_header                  |  | # Target Field     Source       Act | |
| |   order_id: string            |  | 1 orderId          order_id      E  | |
| |   order_date: string          |  | 2 customerName     full_name     E  | |
| |   customer                    |  | 3 customerEmail    email         E  | |
| |     full_name                 |  | 4 orderDate        order_date    E  | |
| |     email                     |  | 5 status           status        E  | |
| |   items[]                     |  | 6 lines[]          items[]       E  | |
| |     item_id                   |  | 7 totalAmount      total         E  | |
| |     qty: string               |  |                                      | |
| +-------------------------------+  | [+ Add Mapping]                      | |
|                                    +--------------------------------------+ |
|                                                                            |
| + Target Schema: Canonical Order -----------------------------------------+ |
| | orderId: string required                                                | |
| | customerName: string required                                           | |
| | customerEmail: string optional                                          | |
| | orderDate: string ISO8601                                               | |
| | status: ACTIVE | INACTIVE | UNKNOWN                                     | |
| | lines[].lineId, productId, quantity, unitPrice                          | |
| +--------------------------------------------------------------------------+ |
|                                                                            |
| [Load Sample] [Test All] [Save Draft] [Submit Review] [Publish]             |
+----------------------------------------------------------------------------+
```

Ana ekranin asil gorevi kullaniciya uc seyi ayni anda gostermektir:

- Kaynak JSON agaci
- Canonical hedef schema
- Aktif mapping kurallari ve validasyon durumu

### 2.2 Mapping Duzenleme Ekrani

```text
+----------------------------------------------------------------------------+
| Edit Mapping: orderId                                                       |
|                                                                            |
| Source field                                                                |
| [order_header > order_id                                      Search v]     |
| or JSON path                                                                |
| [order_header.order_id                                                ]     |
|                                                                            |
| Transform type                                                              |
| [Direct Mapping                                                v]           |
|                                                                            |
| Dynamic configuration                                                       |
| Source value is copied to target without additional transformation.          |
|                                                                            |
| Target field                                                                |
| orderId: string required                                                    |
|                                                                            |
| Preview                                                                     |
| Input  { "order_header": { "order_id": "ORD-123" } }                        |
| Output { "orderId": "ORD-123" }                                             |
|                                                                            |
| [Cancel] [Test] [Save]                                                      |
+----------------------------------------------------------------------------+
```

Mapping editor tek bir hedef alanin nasil uretilecegini tanimlar. Her editor formu ayni sozlesmeyi uretir:

```json
{
  "targetPath": "orderId",
  "sourcePath": "order_header.order_id",
  "transformType": "direct",
  "config": {}
}
```

### 2.3 Donusum Tipi Secimi

Donusum tipi secicisi sunlari desteklemelidir:

- Direct mapping
- Constant value
- Format conversion
- Enum mapping
- Default value
- Conditional value
- Concatenation
- Mathematical operation
- String operation
- Array operation
- Nested object
- Lookup
- Advanced JSONata formula

## 3. Donusum Tipleri

### 3.1 Direct Mapping

Kaynak alan oldugu gibi hedef alana aktarilir.

```jsonata
order_header.order_id
```

Gorsel panel:

| Alan | Kontrol |
|------|---------|
| Source field | SourceFieldSelector |
| Target field | TargetFieldSelector |
| Null davranisi | Optional: pass-through, null, error |

### 3.2 Format Donusumu

Format donusumu tarih, sayi, metin ve boolean kategorilerini kapsar.

#### Tarih Donusumu

Gorsel panel:

| Ayar | Degerler |
|------|----------|
| Input format | ISO 8601, Unix ms, Unix seconds, custom picture |
| Output format | ISO 8601, Unix ms, custom picture |
| Timezone | Preserve, UTC, selected timezone |

Native JSONata ornegi:

```jsonata
$fromMillis($toMillis(order_header.order_date, "[Y0001]-[M01]-[D01]"))
```

Unix seconds input icin:

```jsonata
$fromMillis($number(order_header.created_at) * 1000)
```

#### Sayi Donusumu

Gorsel panel:

| Ayar | Degerler |
|------|----------|
| Target type | number, integer, decimal string |
| Rounding | floor, ceil, round, none |
| Decimal places | integer input |

Native JSONata ornegi:

```jsonata
$floor($number(item.qty))
```

Decimal output icin:

```jsonata
$round($number(item.price), 2)
```

### 3.3 Enum Esleme

Kaynak enum degerleri canonical enum degerlerine cevrilir.

Gorsel panel:

| Alan | Kontrol |
|------|---------|
| Mapping table | from/to editable rows |
| Unmatched behavior | default value, error, pass-through, null |
| Case sensitivity | checkbox |

Native JSONata ornegi:

```jsonata
(
  $mapped := $lookup({
    "A": "ACTIVE",
    "B": "INACTIVE",
    "C": "SUSPENDED"
  }, status);
  $exists($mapped) ? $mapped : "UNKNOWN"
)
```

DLQ'ya dusmesi gereken durumda generator runtime helper kullanabilir:

```jsonata
(
  $mapped := $lookup({"A": "ACTIVE", "B": "INACTIVE"}, status);
  $exists($mapped) ? $mapped : $error("Unknown status: " & status)
)
```

### 3.4 Varsayilan Deger

Kaynak alan bos, null veya eksikse alternatif deger uretilir.

Gorsel panel:

| Ayar | Degerler |
|------|----------|
| Strategy | constant, fallback field, null, error |
| Nullish values | null, empty string, missing, zero, false |
| Constant value | typed input |

Native JSONata ornegi:

```jsonata
($exists(customer.email) and customer.email != "") ? customer.email : "no-reply@test.com"
```

Fallback field ornegi:

```jsonata
($exists(customer.email) and customer.email != "") ? customer.email : customer.backup_email
```

### 3.5 Kosullu Deger

If/else, else-if zinciri ve compound condition desteklenir.

Gorsel panel:

| Alan | Kontrol |
|------|---------|
| IF field | SourceFieldSelector |
| Operator | equals, notEquals, gt, gte, lt, lte, contains, exists, regex |
| Compare value | constant or field |
| THEN result | constant, field, formula |
| ELSE result | constant, field, formula |

Native JSONata ornegi:

```jsonata
order_detail.total_amount > 1000 ? "HIGH" : "NORMAL"
```

Else-if ornegi:

```jsonata
order_detail.total_amount > 10000 ? "CRITICAL" :
order_detail.total_amount > 1000 ? "HIGH" :
order_detail.total_amount > 100 ? "MEDIUM" :
"LOW"
```

### 3.6 Alan Birlestirme

Birden fazla alan ve sabit metin tek string'e donusturulur.

Gorsel panel:

| Alan | Kontrol |
|------|---------|
| Parts | ordered field/constant rows |
| Separator | none, space, comma, dash, custom |
| Skip empty | checkbox |
| Trim result | checkbox |

Native JSONata ornegi:

```jsonata
customer.address_line1 & ", " & customer.city & ", " & customer.country
```

Bos alanlari atlama ornegi:

```jsonata
$join(
  [
    customer.address_line1,
    customer.city,
    customer.country
  ][$exists($) and $ != ""],
  ", "
)
```

### 3.7 Matematiksel Islem

Toplama, cikarma, carpma, bolme, mod, yuvarlama ve array aggregate desteklenir.

Gorsel panel:

| Ayar | Degerler |
|------|----------|
| Operation | add, subtract, multiply, divide, mod, sum, min, max, average |
| Operands | field, constant, array field |
| Output rounding | none, floor, ceil, round |
| Decimal places | integer input |

Native JSONata ornegi:

```jsonata
$round($number(item.qty) * $number(item.price), 2)
```

Array toplam ornegi:

```jsonata
$sum(order_detail.line_items.($number(price)))
```

### 3.8 String Islemi

Metin normalize etme, temizleme, parcalama ve regex islemleri desteklenir.

Gorsel panel:

| Operation | Native JSONata pattern |
|-----------|------------------------|
| Uppercase | `$uppercase(customer.name)` |
| Lowercase | `$lowercase(customer.name)` |
| Trim | `$trim(customer.name)` |
| Replace | `$replace(customer.phone, "+90", "")` |
| Substring | `$substring(product_code, 0, 8)` |
| Split | `$split(tags, ",")` |
| Length | `$length(customer.name)` |
| Contains | `$contains(customer.email, "@")` |
| Regex match | `$match(customer.email, /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)` |

Title case native JSONata'da dogrudan built-in degildir. Generator bunu ya custom helper olarak register etmeli ya da Advanced Formula altinda sinirli bir helper setiyle sunmalidir.

### 3.9 Array Islemleri

Array map, filter, sort, count, sum, distinct, first, last ve nth desteklenir.

#### Map

```jsonata
order_detail.line_items.{
  "lineId": item_identifier,
  "productId": product_code,
  "quantity": $number(qty),
  "unitPrice": $number(price),
  "lineTotal": $number(qty) * $number(price)
}
```

#### Filter + Map

```jsonata
order_detail.line_items[status = "ACTIVE"].{
  "lineId": item_identifier,
  "productId": product_code,
  "quantity": $number(qty)
}
```

#### Sort

JSONata order-by operatorunde `<` ascending, `>` descending olarak kullanilir.

```jsonata
order_detail.line_items^(<created_at)
```

Descending:

```jsonata
order_detail.line_items^(>created_at)
```

#### First, Last, Nth

```jsonata
order_detail.line_items[0].product_code
```

```jsonata
order_detail.line_items[-1].product_code
```

```jsonata
order_detail.line_items[3].product_code
```

### 3.10 Nested Object

Hedef alan object ise alt alan mapping'leri ayni editor mantigiyla tanimlanir.

```jsonata
{
  "shippingAddress": {
    "line1": delivery.address_line1,
    "city": delivery.city,
    "country": (
      $mapped := $lookup({"TR": "TURKEY", "DE": "GERMANY"}, delivery.country_code);
      $exists($mapped) ? $mapped : delivery.country_code
    )
  }
}
```

### 3.11 Lookup

Lookup iki sekilde sunulabilir:

- Static lookup: mapping config icindeki lookup tablosu.
- Managed lookup: runtime tarafinda versioned reference data.

Static lookup ornegi:

```jsonata
$lookup({
  "P100": "PRODUCT-100",
  "P200": "PRODUCT-200"
}, item.product_code)
```

Managed lookup generator helper gerektirir:

```jsonata
$lookupRef("product-catalog", item.product_code)
```

`$lookupRef` native JSONata degildir; transformer runtime'a custom function olarak eklenmelidir.

## 4. JSONata Yeteneklerinin Gorsel Karsiliklari

| # | JSONata yetenegi | Gorsel karsilik | Donusum tipi | Not |
|---|------------------|-----------------|--------------|-----|
| 1 | `field` | Kaynak alan secimi | Direct mapping | Native |
| 2 | `"string"`, `123`, `true` | Sabit deger | Constant value | Native |
| 3 | `$number(value)` | Sayi donusumu | Format conversion | Native |
| 4 | `$string(value)` | Metin donusumu | Format conversion | Native |
| 5 | `$boolean(value)` | Boolean donusumu | Format conversion | Native |
| 6 | `$toMillis(date, picture)` | Tarih parse | Format conversion | Native |
| 7 | `$fromMillis(ms, picture, timezone)` | Tarih formatla | Format conversion | Native |
| 8 | `$now()` | Simdiki zaman | Constant/date | Native |
| 9 | `$millis()` | Simdiki zaman ms | Constant/date | Native |
| 10 | `$lookup(obj, key)` | Enum/lookup | Enum mapping | Native |
| 11 | `$exists(value)` | Eksik/null kontrolu | Default/condition | Native |
| 12 | `condition ? then : else` | If/else | Conditional value | Native |
| 13 | `a & b` | Alan birlestirme | Concatenation | Native |
| 14 | `$join(array, sep)` | Dizi birlestirme | Concatenation | Native |
| 15 | `+ - * / %` | Matematik | Mathematical operation | Native |
| 16 | `$round`, `$floor`, `$ceil`, `$abs` | Yuvarlama | Mathematical operation | Native |
| 17 | `$uppercase`, `$lowercase` | Harf donusumu | String operation | Native |
| 18 | `$trim`, `$pad` | Bosluk/doldurma | String operation | Native |
| 19 | `$replace` | Degistir | String operation | Native |
| 20 | `$substring` | Alt string | String operation | Native |
| 21 | `$split` | Bol | String operation | Native |
| 22 | `$length` | Uzunluk | String operation | Native |
| 23 | `$match` | Regex eslesme | String operation | Native |
| 24 | `$contains` | Icerir | String operation | Native |
| 25 | `array.{...}` | Her elemani donustur | Array map | Native |
| 26 | `array[condition]` | Filtrele | Array filter | Native |
| 27 | `array^(<field)` | Artan sirala | Array sort | Native |
| 28 | `array^(>field)` | Azalan sirala | Array sort | Native |
| 29 | `$count(array)` | Eleman sayisi | Array count | Native |
| 30 | `$sum(array.field)` | Toplam | Array sum | Native |
| 31 | `$max`, `$min` | Maks/min | Array aggregate | Native |
| 32 | `$average` | Ortalama | Array aggregate | Native |
| 33 | `$distinct` | Tekillestir | Array distinct | Native |
| 34 | `array[n]` | Belirli indeks | Array nth | Native |
| 35 | `array[0]`, `array[-1]` | Ilk/son eleman | Array first/last | Native |
| 36 | `{ "key": value }` | Ic ice nesne | Nested object | Native |
| 37 | `$merge([obj1, obj2])` | Nesne birlestir | Nested object | Native |
| 38 | `$keys(obj)` | Alan listesi | Advanced formula | Native |
| 39 | `$type(value)` | Tip kontrolu | Advanced formula | Native |
| 40 | `$error(message)` | Hata uret | Advanced formula | Native |
| 41 | `$assert(condition, message)` | Assertion | Advanced formula | Native |
| 42 | `$eval(expr)` | Dinamik degerlendirme | Advanced formula | Riskli, varsayilan kapali |
| 43 | `$lookupRef(table, key)` | Managed reference lookup | Lookup | Custom helper |
| 44 | `$titlecase(value)` | Bas harfleri buyut | String operation | Custom helper |

## 5. JSONata Generator Service API

### 5.1 Generate Endpoint

```http
POST /api/mapping/generate
```

Request:

```json
{
  "partnerId": "companyA",
  "eventType": "OrderCreated",
  "schemaVersion": "v1",
  "mappings": [
    {
      "id": "mapping-001",
      "targetPath": "orderId",
      "sourcePath": "order_header.order_id",
      "transformType": "direct"
    },
    {
      "id": "mapping-002",
      "targetPath": "orderDate",
      "sourcePath": "order_header.order_date",
      "transformType": "formatConversion",
      "formatConfig": {
        "category": "date",
        "inputFormat": "custom:[Y0001]-[M01]-[D01]",
        "outputFormat": "iso8601",
        "timezone": "UTC"
      }
    },
    {
      "id": "mapping-003",
      "targetPath": "status",
      "sourcePath": "status",
      "transformType": "enumMapping",
      "enumConfig": {
        "mappings": [
          { "from": "A", "to": "ACTIVE" },
          { "from": "B", "to": "INACTIVE" },
          { "from": "C", "to": "SUSPENDED" }
        ],
        "unmatched": "defaultValue",
        "defaultValue": "UNKNOWN"
      }
    },
    {
      "id": "mapping-004",
      "targetPath": "customerEmail",
      "sourcePath": "customer.email",
      "transformType": "defaultValue",
      "defaultConfig": {
        "strategy": "constant",
        "constantValue": "no-reply@test.com",
        "nullishValues": ["null", "emptyString", "missing"]
      }
    },
    {
      "id": "mapping-005",
      "targetPath": "priority",
      "transformType": "conditional",
      "conditionalConfig": {
        "conditions": [
          {
            "field": "order_detail.total_amount",
            "operator": "gt",
            "value": 10000,
            "result": "CRITICAL",
            "resultType": "constant"
          },
          {
            "field": "order_detail.total_amount",
            "operator": "gt",
            "value": 1000,
            "result": "HIGH",
            "resultType": "constant"
          }
        ],
        "elseResult": "LOW",
        "elseResultType": "constant"
      }
    },
    {
      "id": "mapping-006",
      "targetPath": "fullAddress",
      "transformType": "concatenation",
      "concatConfig": {
        "parts": [
          { "type": "field", "value": "customer.address_line1" },
          { "type": "constant", "value": ", " },
          { "type": "field", "value": "customer.city" },
          { "type": "constant", "value": ", " },
          { "type": "field", "value": "customer.country" }
        ],
        "skipEmpty": true
      }
    },
    {
      "id": "mapping-007",
      "targetPath": "lines",
      "sourcePath": "order_detail.line_items",
      "transformType": "arrayMap",
      "arrayConfig": {
        "preFilter": {
          "field": "status",
          "operator": "equals",
          "value": "ACTIVE"
        },
        "sortBy": {
          "field": "created_at",
          "direction": "asc"
        },
        "childMappings": [
          {
            "targetPath": "lineId",
            "sourcePath": "item_identifier",
            "transformType": "direct"
          },
          {
            "targetPath": "quantity",
            "sourcePath": "qty",
            "transformType": "formatConversion",
            "formatConfig": {
              "category": "number",
              "targetType": "integer",
              "rounding": "floor"
            }
          },
          {
            "targetPath": "lineTotal",
            "transformType": "mathematical",
            "mathConfig": {
              "operation": "multiply",
              "operands": [
                { "type": "field", "value": "qty" },
                { "type": "field", "value": "price" }
              ],
              "decimalPlaces": 2
            }
          }
        ]
      }
    }
  ]
}
```

Response:

```json
{
  "jsonata": "{ ... }",
  "jsonataHash": "sha256:...",
  "testResult": {
    "success": true,
    "output": {},
    "validationPassed": true,
    "durationMs": 5,
    "warnings": []
  },
  "stats": {
    "totalMappings": 7,
    "directCount": 1,
    "formatCount": 1,
    "enumCount": 1,
    "defaultCount": 1,
    "conditionalCount": 1,
    "concatCount": 1,
    "arrayCount": 1
  }
}
```

### 5.2 Test Endpoint

```http
POST /api/mapping/test
```

Request:

```json
{
  "jsonata": "{...}",
  "sampleInput": {
    "order_header": {
      "order_id": "ORD-123"
    }
  },
  "canonicalSchema": "schemas/canonical/order-created.v1.schema.json"
}
```

Response:

```json
{
  "success": true,
  "output": {},
  "validationPassed": true,
  "validationErrors": [],
  "durationMs": 3
}
```

### 5.3 Save Draft Endpoint

```http
POST /api/mapping-drafts
```

Request:

```json
{
  "partnerId": "companyA",
  "eventType": "OrderCreated",
  "canonicalSchemaVersion": "v1",
  "visualConfig": {},
  "jsonataScript": "{...}",
  "fixtures": []
}
```

### 5.4 Publish Endpoint

```http
POST /api/mapping-drafts/{draftId}/publish
```

Publish isleminden once:

- JSONata syntax validation gecmeli.
- En az bir valid fixture gecmeli.
- Required canonical alanlar mapped veya waived olmali.
- Generated artifact transformer service layout ile uyumlu olmali.
- Admin veya Lead Developer onayi bulunmali.

## 6. Kullanici Tipleri ve Izinler

| Rol | Yetkiler |
|-----|----------|
| Business Analyst | Mapping listesini gorur, yeni mapping ekler, duzenler, test eder, taslak kaydeder. JSONata gormez. Yayinlayamaz. |
| Integration Developer | Business Analyst yetkileri + Advanced Formula modu + generated JSONata goruntuleme + mapping silme. |
| Lead Developer / Admin | Her sey + yayinlama onayi + version yonetimi + kullanici/izin yonetimi. |

## 7. Ozel Formul Modu

Advanced Formula modu sadece yetkili rollerde acilmalidir.

```text
+--------------------------------------------------------------------------+
| Transform type: Advanced JSONata Formula                                 |
|                                                                          |
| JSONata editor                                                           |
| 1 | order_detail.total_amount > 1000 ? "HIGH" : "NORMAL"                 |
|                                                                          |
| Source references                                                        |
| - order_detail.line_items                                                |
| - order_detail.total_amount                                              |
| - customer.email                                                         |
|                                                                          |
| [Test] [Save]                                                            |
+--------------------------------------------------------------------------+
```

Editor beklentileri:

- Syntax highlighting
- Autocomplete for source fields
- Autocomplete for approved JSONata functions
- Warnings for unsafe functions
- Read-only generated JSONata preview for no-code mappings
- Diff view between generated formula versions

`$eval` ve benzeri dinamik fonksiyonlar varsayilan olarak kapali olmalidir. Kullanilacaksa feature flag, role permission ve audit log zorunlu olmalidir.

## 8. Test ve Dogrulama

### 8.1 Test Akisi

```text
Kullanici mapping'i duzenler
        |
        v
Test butonu
        |
        v
POST /api/mapping/test
        |
        v
JSONata evaluate + canonical schema validation
        |
        v
UI sonucu gosterir
```

Sonuc durumlari:

- **Pass**: Output canonical schema'ya uygun.
- **Warning**: Output valid ancak riskli bos alan, fallback veya pass-through var.
- **Fail**: JSONata syntax/runtime hatasi veya canonical validation hatasi var.

### 8.2 Sample Veri Kaynaklari

| Kaynak | Kullanimi |
|--------|-----------|
| Manual JSON | Kullanici editor ile sample girer. |
| Uploaded sample | Partner payload dosyasi yuklenir. |
| Recent messages | Son N partner mesaji test icin kullanilir. |
| DLQ messages | Hata alan payload mapping duzeltme icin acilir. |
| Saved fixtures | Regression test senaryolari olarak saklanir. |

### 8.3 Fixture Tipleri

- Happy path
- Eksik optional alanlar
- Hatalı format
- Bos array
- Null degerler
- Cok uzun string
- Negatif sayi
- Unknown enum
- Duplicate line item

### 8.4 Quality Gates

Publish oncesi minimum gate'ler:

- JSONata syntax valid.
- Generated JSONata deterministic.
- Required canonical fields covered.
- At least one valid fixture passed.
- Invalid fixture expected failure ile passed.
- Runtime duration threshold altinda.
- PII masking preview/test loglarinda aktif.
- Audit log kaydi olustu.

## 9. Mimari Etkisi

### 9.1 Yeni UI Bilesenleri

```text
canonbridge-ui/
  src/
    components/
      layouts/
        MappingStudioLayout.tsx
      mapping/
        MappingList.tsx
        MappingEditor.tsx
        MappingRow.tsx
      selectors/
        SourceFieldSelector.tsx
        TargetFieldSelector.tsx
        TransformTypeSelector.tsx
      transforms/
        DirectMapping.tsx
        FormatConversion.tsx
        EnumMapping.tsx
        DefaultValue.tsx
        ConditionalValue.tsx
        Concatenation.tsx
        MathematicalOp.tsx
        StringOperation.tsx
        ArrayOperations.tsx
        NestedObject.tsx
        LookupMapping.tsx
        AdvancedFormula.tsx
      test/
        TestPanel.tsx
        TestResultViewer.tsx
        DiffViewer.tsx
        SampleDataManager.tsx
      common/
        FieldTree.tsx
        JsonEditor.tsx
        JsonataEditor.tsx
        ValidationBadge.tsx
```

### 9.2 Yeni Backend Bilesenleri

```text
partner-transformer-service/
  src/
    services/
      jsonata-generator.ts
      mapping-studio-api.ts
      mapping-storage.ts
      mapping-validator.ts
    routes/
      mapping-studio.routes.ts
    types/
      mapping-studio.ts
```

### 9.3 Veri Akisi

```text
User
  -> visual selections
Mapping Studio UI
  -> POST /api/mapping/generate
JSONata Generator Service
  -> generated JSONata
  -> POST /api/mapping/test
Test and Validation
  -> UI preview
User approval
  -> save draft
Admin approval
  -> publish immutable version
Transformer
  -> mapping cache refresh
```

### 9.4 Mapping Storage

```sql
CREATE TABLE mapping_definitions (
    id UUID PRIMARY KEY,
    partner_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    schema_version VARCHAR(20) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    visual_config JSONB NOT NULL,
    jsonata_script TEXT,
    jsonata_script_hash VARCHAR(64),
    author VARCHAR(100),
    published_by VARCHAR(100),
    published_at TIMESTAMP,
    git_commit_hash VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mapping_test_results (
    id UUID PRIMARY KEY,
    mapping_id UUID REFERENCES mapping_definitions(id),
    sample_input JSONB,
    sample_output JSONB,
    validation_passed BOOLEAN,
    validation_errors JSONB,
    duration_ms INTEGER,
    tested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tested_by VARCHAR(100)
);
```

### 9.5 Uygulama Sirasi

1. Visual config type modelini tanimla.
2. Direct, default, enum, conditional, string, math generatorlarini yaz.
3. Array map/filter/sort generatorlarini ekle.
4. Nested object composition'i ekle.
5. Test endpoint'i JSONata evaluate + schema validation ile bagla.
6. UI'da source tree, target schema ve mapping editor panellerini kur.
7. Advanced Formula editorunu role-gated yap.
8. Publish gate'lerini ve audit log'u ekle.

## Son Not

Mapping Studio'nun urun vaadi JSONata'yi saklamak degil, JSONata'nin gucunu guvenli ve tekrar edilebilir bir urun deneyimine cevirmektir. Business Analyst icin sistem "alan sec, kural sec, test et" kadar basit gorunmeli; Integration Developer icin ise generated JSONata, fixture, validation ve publish pipeline'i tam kontrol edilebilir olmalidir.
