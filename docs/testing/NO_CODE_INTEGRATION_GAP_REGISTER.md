# No-Code Integration Gap Register

Bu kayıt, `ACCEPTANCE_SCENARIOS.md` içindeki no-code API integration iddiasına göre mevcut ürün boşluklarını ve çözüm durumunu izler.

## Durum Etiketleri

| Etiket | Anlamı |
|---|---|
| `DONE` | Kod veya dokümanla kapatıldı ve doğrulandı |
| `IN_PROGRESS` | Üzerinde çalışılıyor |
| `PARTIAL` | Ana parça var, runtime veya test kanıtı eksik |
| `OPEN` | Henüz çözülmedi |
| `BLOCKED` | Dış bağımlılık veya ürün kararı gerekiyor |

## Gap Listesi

| ID | Eksik | Etki | Durum | Çözüm / sonraki adım |
|---|---|---|---|---|
| GAP-001 | Backend `SourceType` enum'u no-code integration iddiasındaki tipleri kapsamıyordu; seed data içinde `SOAP` vardı ama enum'da yoktu. | Mapping draft/version okuma sırasında `SourceType.valueOf("SOAP")` patlayabilirdi. | `DONE` | `REST_API`, `SOAP`, `FILE_BATCH`, `API_ENRICHMENT` enum'a eklendi; UI service type union genişletildi. |
| GAP-002 | Mapping Studio source picker sadece Kafka, Webhook, External API ve Manual gösteriyordu. | Ürün ekranı “her integration tipi” iddiasını göstermiyordu. | `DONE` | REST inbound, SOAP/XML, File/Batch ve API Enrichment kartları eklendi. |
| GAP-003 | Studio config/export/autosave yeni integration metadata'sını taşımıyordu. | No-code kurulum export/import veya backend draft payload'ında kayboluyordu. | `DONE` | REST, SOAP, file/batch ve enrichment config snapshot alanları eklendi. |
| GAP-004 | SOAP/XML sample doğrudan field tree'ye dönüştürülemiyordu. | SOAP demo için kullanıcı önce manuel JSON normalize etmek zorundaydı. | `DONE` | XML sample upload sırasında browser-side JSON tree'ye normalize ediliyor. |
| GAP-005 | CSV/JSONL batch sample doğrudan field tree'ye dönüştürülemiyordu. | File/batch source yalnızca kavramsal kalıyordu. | `DONE` | CSV ve JSONL upload normalization eklendi; CSV delimiter/header metadata'sı taşınıyor. |
| GAP-006 | Inbound REST runtime contract ayrı endpoint olarak modellenmiş değil. | REST inbound şimdilik transformer dry-run / generic inbound pattern üzerinden kanıtlanıyor. | `DONE` | `POST /api/rest-inbound/{draftId}` eklendi; REST_API draft'ı input schema'ya göre validate ediyor, draft mapping ile canonical payload'a dönüştürüyor ve canonical ingest akışına alıyor. |
| GAP-007 | Outbound REST polling runtime scheduler yok. | External API bağlantısı ve test metadata'sı var ama schedule runtime kanıtı sınırlı. | `DONE` | `POST /api/external-systems/{connectionId}/trigger` manual trigger eklendi; `SOURCE_PAYLOAD` outbound bağlantıları runtime HTTP çağrısı ve test-result kaydı üretiyor. |
| GAP-008 | API enrichment runtime step'i metadata olarak var ama transformer flow'a bağlanmış değil. | Multi-step integration iddiası UI/config seviyesinde; runtime eksik. | `DONE` | Transformer mapping config `enrichmentSteps` destekliyor; transform öncesi HTTP enrichment çağrısı yapılıp response payload'a merge ediliyor. |
| GAP-009 | DLQ -> fix draft import akışı dokümanda var, UI/API'da tam workflow olarak bağlanmalı. | Hata düzeltme döngüsü manuel kalabilir. | `DONE` | DLQ row/drawer aksiyonundan payload ve hata context'i Integration Studio'ya sample olarak taşınıyor. |
| GAP-010 | Acceptance coverage raporu otomatik üretilmiyor. | Hangi integration tipinin `PROVEN/PARTIAL` olduğu manuel kalıyor. | `DONE` | `scripts/no-code-acceptance-coverage.mjs` register'dan JSON veya Markdown coverage matrix üretiyor ve açık gap kaldığında non-zero çıkıyor. |
| GAP-011 | Request dönüşümü için Wizard'da ayrı bir sekme/adım yok. Kullanıcı dış API'ye gidecek request gövdesini görsel olarak tanımlayamıyor. | Kritik: outbound/API enrichment akışları response mapping yapabilse bile request body/header/query üretimi hâlâ manuel veya runtime'a gömülü kalır; bu da "tamamen kodsuz entegrasyon" iddiasını eksik bırakır. | `DONE` | Mapping adımına `Response Dönüşümü` / `Request Dönüşümü` sekmeleri eklendi; template JSON + `{{ }}` placeholder preview/save/backend render tamamlandı. JSONata request modu server-side runtime'a bağlandı: `POST /api/jsonata/evaluate` proxy endpoint eklendi (`JsonataProxyResource`), `RequestTemplateService.evaluateBlocking()` metodu eklendi, UI `JsonataCheckService.evaluate()` ile backend'i çağırıyor, wizard preview JSONata modunda gerçek transformer sonucu gösteriyor. |

## İlk Kapatılan Set

Bu turda GAP-001 ile GAP-005 ve GAP-009 kapatıldı. Bu set, no-code product surface'i genişletti:

- Backend mapping model artık REST, SOAP, file/batch ve enrichment source type'larını temsil edebiliyor.
- UI source picker ürün iddiasındaki ana integration tiplerini gösteriyor.
- Export/import/autosave draft payload'ı yeni metadata'yı koruyor.
- SOAP/XML, CSV ve JSONL sample'ları kod yazmadan mapping field tree'ye dönüştürülebiliyor.
- DLQ payload'u tek aksiyonla Integration Studio fix draft sample'ına dönüşebiliyor.

## Sıradaki Teknik Öncelik

Sıradaki kritik ürün işi, request dönüşümünün JSONata modunu server-side runtime'a bağlamak. Bu kapandıktan sonra kalite işi, yeni runtime yüzeylerini e2e ortamında Kafka/topic assertion'larıyla kanıtlamak ve manual trigger endpoint'ini zamanlanmış poller job'a genişletmek.

## Doğrulama Notu

- Mapping Studio UI production build geçti.
- Mapping Studio API tenant/security test seti ve `mvn clean -DskipTests package` geçti.
- Mapping Studio API `mvn test` 2026-05-20 tarihinde geçici yerel PostgreSQL ile geçti: 74 test, 0 failure, 0 error.
- Mapping Studio API seçili recovery/security testleri geçti: `mvn -Dtest=ApiKeyAuthenticatorTest,ApiAuthenticationFilterTest,KafkaProducerServiceTest,ScheduleExpressionTest,OutboxReplayServiceTest test` -> 27 test, 0 failure, 0 error.
- CanonBridge mock `mvn test` geçti; `ProtocolDockerE2ETest` normal unit koşuda skip olur, `CANONBRIDGE_PROTOCOL_E2E=true` ile 10 canlı protokol kontrolünü Docker/Testcontainers üzerinde koşturur.
- Webhook receiver `mvn test` 2026-05-19 tarihinde geçti: 14 test, 0 failure, 0 error.
- GAP-011 kapatıldı: `node scripts/no-code-acceptance-coverage.mjs --markdown` artık tüm gap'ler için `DONE` döndürmelidir.
- Yeni doğrulama komutları: `npm test -- --run src/transformEngine.test.ts`, `./mvnw test -Dtest=SourcePayloadValidatorTest`, `node scripts/no-code-acceptance-coverage.mjs --markdown`.
