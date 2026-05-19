# CanonBridge 10 Sistem Destek Denetimi

**Tarih**: 2026-05-19  
**Kapsam**: Repository genelinde kaynak tipi, runtime, seed/template, test ve dokumantasyon denetimi.  
**Kisa sonuc**: 10 kaynak tipi isim olarak UI ve backend modelinde var; ancak "10 gercek sistem/template uctan uca hazir" hedefi henuz kapanmis degil. Webhook sema/test kiriklari kapandi; kalan ana eksikler seed/template sayisinin 10 sisteme ulasmamasi, request JSONata modunun server-side runtime'a baglanmasi ve file/scheduled/enrichment akislari icin ileri operasyonel kanitlarin tamamlanmasi.

## 1. 10 Cesit Destek Durumu

### Kaynak tipi olarak 10 cesit

UI tarafinda 10 kaynak tipi listeleniyor:

- `KAFKA` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:20`
- `WEBHOOK` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:26`
- `REST_API` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:32`
- `SCHEDULED_API` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:38`
- `GRAPHQL` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:44`
- `SOAP` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:50`
- `GRPC` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:56`
- `FILE_BATCH` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:62`
- `API_ENRICHMENT` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:68`
- `MANUAL` - `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts:74`

Backend enum ayni 10 tipi kabul ediyor: `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/domain/MappingDraft.java:141`.

Acceptance dokumani da no-code test kapsaminda 10 senaryo hedefliyor: `docs/testing/ACCEPTANCE_SCENARIOS.md:1396` ve devamindaki coverage matrisi.

### Gercek sistem/template olarak 10 sistem

Bu hedef henuz kapanmis gorunmuyor.

`services/mapping-studio-api/src/main/resources/db/migration/V23__add_tenant_acme_system_templates.sql` icinde net 5 sistem template'i var:

- PayFlex Payment System - satir 9
- ShopMax E-Commerce System - satir 43
- FastCargo Logistics System - satir 78
- ProfileHub GraphQL API - satir 110
- CustomerGateway gRPC Profile Service - satir 142

FoodMarket icin endpoint/credential patch'leri ve artik bir sistem template insert'i var:

- `services/mapping-studio-api/src/main/resources/db/migration/V27__fix_foodmarket_endpoints.sql`
- `services/mapping-studio-api/src/main/resources/db/migration/V33__add_foodmarket_credential.sql`
- `services/mapping-studio-api/src/main/resources/db/migration/V36__add_foodmarket_system_template.sql`

Bu nedenle guvenli okuma: 6 hazir mock-backed sistem template'i var. "10 gercek sistem" hedefi icin 4 yeni sistem template'i, credential, mock endpoint, fixture ve mapping ornegi daha eklenmeli.

## 2. Kritik Eksikler

### 2.1 Webhook publish/receive semasi kapandi

Webhook endpoint semasi artik `secret_hash` uzerinden hizali:

- `MappingPublishService.java` publish sirasinda `secret_hash` yazar.
- `WebhookEndpointRepository.java` API CRUD tarafinda `secret_hash` okur/yazar.
- `WebhookAuthService.java` receiver runtime tarafinda `secret_hash` secer ve dogrular.

`services/webhook-receiver` icin `mvn test` 2026-05-19 tarihinde basariyla gecti: 14 test, 0 failure, 0 error.

### 2.2 File/batch runtime artik kismi ingest seviyesinde

UI dosya sample'ini normalize ediyor:

- XML parse: `mapping-studio-ui/src/app/pages/integration-studio/integration-studio.component.ts:2384`
- CSV parse: `mapping-studio-ui/src/app/pages/integration-studio/integration-studio.component.ts:2387`
- JSONL parse: `mapping-studio-ui/src/app/pages/integration-studio/integration-studio.component.ts:2390`

Backend tarafinda `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/resource/FileBatchResource.java` ile `POST /api/mapping-drafts/{id}/batch/ingest` eklendi. Bu endpoint normalize edilmis JSON array satirlarini mapping'den gecirir, basarili canonical payload'lari Kafka'ya publish eder ve satir bazli basari/hata raporu dondurur.

Kalan taraf: buyuk dosya upload/streaming, kalici batch job takibi ve dosya seviyesinde retry henuz yok.

### 2.3 Scheduled API poller eklendi

`services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/resource/ExternalSystemResource.java:171` manuel trigger endpoint'i sagliyor. Buna ek olarak `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/service/ScheduledApiPollerService.java` published/valid `SCHEDULED_API` draft'larini belirlenen aralikla calistirir ve basarili canonical sonucu Kafka'ya publish eder.

Kalan taraf: cron semantigi su an hafif yorumlaniyor (`PT5M`, `5m`, `*/5 * * * *`, `hourly`, `daily`). Kalici next-run/last-run DB state'i ve retry visibility eklenmeli.

### 2.4 API enrichment transformer registry'ye baglandi

Transformer enrichment adimini destekliyor:

- `services/transformer/src/transformEngine.ts:175`
- `services/transformer/src/transformEngine.ts:271`

DB registry artik `KAFKA` ve `API_ENRICHMENT` draft'larini yukluyor:

- `services/transformer/src/partnerRegistry.ts:143`
- `services/transformer/src/partnerRegistry.ts:145`

`apiEnrichment` veya direct `urlTemplate` config'i transformer `enrichmentSteps` formatina cevriliyor. Transformer enrichment URL/header template'lerinde `{field}` ve `{{field}}` placeholder'larini envelope'dan dolduruyor.

### 2.5 Request donusumu JSONata modu kismi

Request donusumu icin UI ve template render akisi var; ancak no-code gap register'da `GAP-011` halen `PARTIAL`. Kalan nokta: JSONata request modunun server-side runtime execution'a baglanmasi.

### 2.6 Mapping API proxy schema validation eklendi

`services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/service/MappingExecutionService.java:954` icindeki response validation artik inline `target_schema_json` icin recursive JSON Schema subset validation calistiriyor. Desteklenen kontroller: `type`, `required`, nested `properties`, array `items`, `enum`, `additionalProperties: false`.

Kalan taraf: `canonical_schema_ref` ile schema repository'den async fetch ederek validation yapmak ve daha genis JSON Schema keyword kapsamı eklemek.

### 2.7 Mapping rule fallback transform turlerini destekliyor

`services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/service/MappingExecutionService.java:797` fallback JSONata uretimi artik visual rule metadata'sini de kullanir. Desteklenen temel transformlar: number coercion, string case/trim/substring/replace, array helpers, math helpers, default value, enum map, conditional value, date format ve template string.

Kalan taraf: fallback builder frontend `rule-to-jsonata.ts` ile ayni davranisi koruyacak sekilde unit testlerle kilitlenmeli.

## 3. Dokumantasyon Tutarsizliklari

- Root `README.md` daha once olmayan `eksikler/PROGRESS_REPORT.md`, `eksikler/FINAL_PROGRESS_REPORT.md` ve `eksikler/canonbridge-analiz-raporu.md` dosyalarina link veriyordu. Bu linkler bu rapora cevrildi.
- `docs/project/PROJECT_STATUS.md` uygulama kodu varken "Code Implementation 0%" diyordu. Bu dosya guncel durumu yanlis anlattigi icin silindi.
- `docs/ROADMAP.md` ve `docs/ROADMAP-PHASE2.md` tamamlanmis checklist/historical roadmap formatindaydi. Canli plan veya acik gap kaydi olmadiklari icin silindi.
- `docs/product/roadmap.md` deprecated gorunuyor, ama birden fazla product dokumanindan referanslandigi ve icinde product-fit analizi bulundugu icin bu temizlikte korunmali.

## 4. Test Sonuclari

Bu denetimde kosulan kontroller:

- `node scripts/no-code-acceptance-coverage.mjs --markdown`: gecti; `GAP-011` partial gorunuyor.
- `npm test` - `services/transformer`: 47 test gecti.
- `npm test` - `mapping-studio-ui`: 117 test gecti.
- `mvn test` - `services/canonbridge-mock`: 6 test gecti.
- `mvn test` - `services/mapping-studio-api`: Testcontainers Docker ortam bulamadigi icin `KafkaProducerServiceTest` hata verdi. Ozet: 56 test, 0 failure, 1 error, 35 skipped.
- Docker socket env ile tekrar `mvn test` - `services/mapping-studio-api`: ayni Testcontainers/Docker hatasi devam etti.
- `mvn test` - `services/webhook-receiver`: 14 test gecti.

## 5. Oncelik Sirasi

1. `GAP-011` icin JSONata request modunu server-side runtime execution'a bagla.
2. "10 kaynak tipi" mi "10 gercek external system" mi hedef oldugunu netlestir. Hedef gercek sistem ise eksik 4 sistem template'ini ekle.
3. File/batch icin buyuk dosya upload/streaming, kalici batch job takibi ve dosya seviyesinde retry ekle.
4. Scheduled API icin kalici next-run/last-run DB state'i ve retry visibility ekle.
5. API enrichment icin credential/header cozme ve GraphQL body template destegini genislet.
6. Mapping API proxy'de `canonical_schema_ref` icin schema repository lookup ve genis JSON Schema keyword kapsami ekle.
7. Fallback rule builder icin frontend `rule-to-jsonata.ts` ile esdeger unit testleri ekle.
8. Acceptance matrix CI gate'e baglandi: `.github/workflows/ci.yml` icinde `No-Code Acceptance Coverage` job'i `scripts/no-code-acceptance-coverage.mjs --strict --markdown` calistiriyor. Strict mod `PARTIAL`, `OPEN`, `BLOCKED`, `IN_PROGRESS` gap'lerde CI'i fail eder.
9. Yeni eklenen her external system icin mock endpoint, credential seed, sample payload, mapping draft ve E2E senaryo ekle.

## 6. Kapanis Karari

Bugunku durumla platform 10 kaynak tipini isim/model olarak tasiyor; fakat uctan uca kanit ve gercek sistem sayisi acisindan hala aciklar var. Beta icin once `GAP-011` server-side JSONata request runtime baglantisi, sonra scheduled/file/enrichment operasyonel kanitlari kapatilmali. "10 sistem destekliyoruz" cumlesi ancak 10 sistemin her biri icin seed + mock + mapping + runtime execution + acceptance test zinciri tamamlandiginda guvenle soylenebilir.
