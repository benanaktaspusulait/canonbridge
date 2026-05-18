# CanonBridge 10 Sistem Destek Denetimi

**Tarih**: 2026-05-18  
**Kapsam**: Repository genelinde kaynak tipi, runtime, seed/template, test ve dokumantasyon denetimi.  
**Kisa sonuc**: 10 kaynak tipi isim olarak UI ve backend modelinde var; ancak "10 gercek sistem/template uctan uca hazir" hedefi henuz kapanmis degil. En kritik eksikler webhook runtime sema uyumsuzlugu, file/scheduled/enrichment akislari icin eksik worker baglantilari ve seed/template sayisinin 10 sisteme ulasmamasi.

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

### 2.1 Webhook endpoint semasi runtime ile uyumsuz

Risk: Webhook publish/receive akisi runtime'da kirilabilir.

Bulgular:

- `V8__create_webhook_endpoints_table.sql:7` kolonu `secret_hash` olarak olusturuyor.
- `V31__add_draft_id_to_webhook_endpoints.sql:3` sadece `webhook_key` ekliyor.
- `MappingPublishService.java:102` `webhook_key_hash` kolonuna insert/update yapiyor.
- `services/webhook-receiver/src/main/java/com/canonbridge/webhook/service/WebhookAuthService.java:26` `webhook_key_hash` seciyor.
- Ayni tabloda API repository hala `secret_hash` okuyor/yaziyor: `WebhookEndpointRepository.java:27`.

Beklenen karar: Tek kolon stratejisi secilmeli. Ya DB migration ile `webhook_key_hash` eklenmeli ve tum servisler buna gecmeli, ya da runtime kodu mevcut `secret_hash` kolonuna hizalanmali.

### 2.2 Webhook receiver testleri compile olmuyor

`services/webhook-receiver/src/test/java/com/canonbridge/webhook/service/WebhookAuthServiceTest.java` icindeki `rowSet.iterator()` mock'u Vert.x API beklentisiyle uyusmuyor. Test `Iterator<Row>` donduruyor, API `RowIterator<Row>` bekliyor. Bu yuzden `mvn test` compile asamasinda kaliyor.

### 2.3 File/batch runtime artik kismi ingest seviyesinde

UI dosya sample'ini normalize ediyor:

- XML parse: `mapping-studio-ui/src/app/pages/integration-studio/integration-studio.component.ts:2384`
- CSV parse: `mapping-studio-ui/src/app/pages/integration-studio/integration-studio.component.ts:2387`
- JSONL parse: `mapping-studio-ui/src/app/pages/integration-studio/integration-studio.component.ts:2390`

Backend tarafinda `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/resource/FileBatchResource.java` ile `POST /api/mapping-drafts/{id}/batch/ingest` eklendi. Bu endpoint normalize edilmis JSON array satirlarini mapping'den gecirir, basarili canonical payload'lari Kafka'ya publish eder ve satir bazli basari/hata raporu dondurur.

Kalan taraf: buyuk dosya upload/streaming, kalici batch job takibi ve dosya seviyesinde retry henuz yok.

### 2.4 Scheduled API poller eklendi

`services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/resource/ExternalSystemResource.java:171` manuel trigger endpoint'i sagliyor. Buna ek olarak `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/service/ScheduledApiPollerService.java` published/valid `SCHEDULED_API` draft'larini belirlenen aralikla calistirir ve basarili canonical sonucu Kafka'ya publish eder.

Kalan taraf: cron semantigi su an hafif yorumlaniyor (`PT5M`, `5m`, `*/5 * * * *`, `hourly`, `daily`). Kalici next-run/last-run DB state'i ve retry visibility eklenmeli.

### 2.5 API enrichment transformer registry'ye baglandi

Transformer enrichment adimini destekliyor:

- `services/transformer/src/transformEngine.ts:175`
- `services/transformer/src/transformEngine.ts:271`

DB registry artik `KAFKA` ve `API_ENRICHMENT` draft'larini yukluyor:

- `services/transformer/src/partnerRegistry.ts:143`
- `services/transformer/src/partnerRegistry.ts:145`

`apiEnrichment` veya direct `urlTemplate` config'i transformer `enrichmentSteps` formatina cevriliyor. Transformer enrichment URL/header template'lerinde `{field}` ve `{{field}}` placeholder'larini envelope'dan dolduruyor.

### 2.6 Mapping API proxy schema validation eklendi

`services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/service/MappingExecutionService.java:954` icindeki response validation artik inline `target_schema_json` icin recursive JSON Schema subset validation calistiriyor. Desteklenen kontroller: `type`, `required`, nested `properties`, array `items`, `enum`, `additionalProperties: false`.

Kalan taraf: `canonical_schema_ref` ile schema repository'den async fetch ederek validation yapmak ve daha genis JSON Schema keyword kapsamı eklemek.

### 2.7 Mapping rule fallback transform turlerini yitiriyor

`services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/service/MappingExecutionService.java:797` fallback JSONata uretimi basliyor. `805-807` arasi sadece `targetKey -> sourcePath` direct mapping yapiyor. `generated_jsonata` yoksa number/date/enum/default gibi donusumler uygulanmiyor.

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
- `mvn test` - `services/webhook-receiver`: compile failure; `RowIterator<Row>` mock uyumsuzlugu.

## 5. Oncelik Sirasi

1. Webhook tablo/kolon kararini verip migration + API + receiver kodunu ayni semaya hizala.
2. Webhook receiver test compile sorununu duzelt.
3. "10 kaynak tipi" mi "10 gercek external system" mi hedef oldugunu netlestir. Hedef gercek sistem ise eksik 4-5 sistem template'ini ekle.
4. File/batch icin buyuk dosya upload/streaming, kalici batch job takibi ve dosya seviyesinde retry ekle.
5. Scheduled API icin kalici next-run/last-run DB state'i ve retry visibility ekle.
6. API enrichment icin credential/header cozme ve GraphQL body template destegini genislet.
7. Mapping API proxy'de `canonical_schema_ref` icin schema repository lookup ve genis JSON Schema keyword kapsami ekle.
8. `generated_jsonata` yokken fallback rule builder'in transform/default/enum/date gibi rule turlerini desteklemesini sagla.
9. Acceptance matrix'i CI'da fail eden kanita donustur; UI'da gorunmesi yeterli sayilmasin.
10. Yeni eklenen her external system icin mock endpoint, credential seed, sample payload, mapping draft ve E2E senaryo ekle.

## 6. Kapanis Karari

Bugunku durumla platform 10 kaynak tipini isim/model olarak tasiyor; fakat uctan uca kanit ve gercek sistem sayisi acisindan hala aciklar var. Beta icin once webhook sema/test kiriklari, sonra scheduled/file/enrichment runtime baglantilari kapatilmali. "10 sistem destekliyoruz" cumlesi ancak 10 sistemin her biri icin seed + mock + mapping + runtime execution + acceptance test zinciri tamamlandiginda guvenle soylenebilir.
