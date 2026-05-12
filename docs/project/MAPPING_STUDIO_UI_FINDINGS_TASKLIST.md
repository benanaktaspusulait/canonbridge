# Mapping Studio UI Findings Task List

Bu liste, 2026-05-12 tarihinde verilen kod analizi bulgularinin uygulanabilir task listesine cevrilmis halidir. Durumlar kod uzerinde tek tek dogrulandikca guncellenecektir.

## Legend

- `[ ]` Acik
- `[x]` Tamamlandi / dogrulandi
- `[~]` Kismen tamamlandi, ek is gerekiyor

## A. Wizard / Integration Studio

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| A1 | Kaynak tipi secimine bagli konfig alanlarini tamamla: Kafka topic/broker, Webhook URL/API key, External API auth/credential. | `integration-studio.component.html`, `integration-studio.component.ts` | P0 | [ ] | |
| A2 | Donusum tipine gore dinamik parametre label/placeholder metinlerini kullan. | `integration-studio.component.ts` | P0 | [ ] | |
| A3 | Karma donusumler icin ozel UI ekle: `enum_map` tablo, `conditional_value` IF/ELSE, `template_string` degisken secici editor. | `integration-studio.component.html` | P0 | [ ] | |
| A4 | Object/array hedefler icin nested/array alt eslestirme arayuzu ekle. | `integration-studio.component.html`, `integration-studio.models.ts` | P1 | [ ] | |
| A5 | Eksik zorunlu alan satirlarina "Hemen Esleştir" aksiyonu ekle. | `integration-studio.component.html` | P0 | [ ] | |
| A6 | Webhook secilince benzersiz URL ve masked API key uret/goster; rotate/copy akisini destekle. | `integration-studio.component.ts` | P0 | [ ] | |
| A7 | External API secildiginde Wizard icinde "Baglantiyi Test Et" akisini calistir. | `integration-studio.component.ts` | P0 | [ ] | |
| A8 | Uretilen JSONata icin opsiyonel "Uzman Modu / Onizleme" paneli ekle. | `integration-studio.component.html` | P1 | [ ] | |
| A9 | Wizard responsive davranisini dogrula; kucuk ekranlarda tek kolona dusme / yatay kaydirma sagla. | `integration-studio.component.scss`, `integration-studio-shell.scss` | P1 | [ ] | |
| A10 | Klavye kisayollari ekle: Ctrl/Cmd+S, Ctrl/Cmd+Enter, Ctrl/Cmd+Right/Left. | `integration-studio.component.ts` | P1 | [ ] | |

## B. External Systems

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| B1 | Credential Store yonetim modal/sayfasini ekle; secret alanlarini write-only ele al. | `external-systems.component.ts`, `external-systems.component.html` | P0 | [ ] | |
| B2 | Baglanti testi sonucunda donen ornek response'u yakalayip "Mapping Wizard'da kullan" akisi sun. | `external-systems.component.ts` | P0 | [ ] | |
| B3 | Dis sisteme bagli mapping'leri tabloda/detayda goster. | `external-systems.component.html` | P1 | [ ] | |
| B4 | Scheduled Poll icin cron/interval/ilk calisma konfig alanlarini tamamla. | `external-systems.component.ts`, `external-systems.component.html` | P1 | [ ] | |
| B5 | SOAP icin WSDL URL ve WSDL dosya yukleme akisini ekle. | `external-systems.component.ts`, `external-systems.component.html` | P1 | [ ] | |
| B6 | Baglanti loglari, metrikler, sparkline ve detayli log goruntuleyici sagla. | `external-systems.component.ts`, `external-systems.component.html` | P1 | [ ] | |

## C. Diger Sayfalar

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| C1 | DLQ sayfasina detay, stack/error inceleme, partner/error/date filtreleri ve redrive aksiyonlarini tamamla. | `dlq` sayfasi | P1 | [ ] | |
| C2 | Partner yonetimi CRUD ve partner detay metriklerini dogrula/tamamla. | `partners` sayfasi | P1 | [ ] | |
| C3 | Monitoring/Dashboard demo verisini servis/snapshot mantigi ve canli grafik hissiyle guclendir. | `dashboard`, `monitoring` sayfalari | P2 | [ ] | |

## D. Genel UI / UX

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| D1 | CSS degisken hatasini kontrol et; SCSS token ve CSS variable kullanimini ayir. | `styles.scss`, `styles/` | P1 | [ ] | |
| D2 | A11y kontrolu yap: ARIA label, klavye navigasyonu, focus state, overlay/dropdown odak davranisi. | Genel | P1 | [ ] | |
| D3 | Wizard auto-save akisini ekle/dogrula; draft refresh/session kaybinda korunmali. | `integration-studio.component.ts` | P0 | [ ] | |
| D4 | Mapping kurallari icin undo/redo mekanizmasi ekle. | `integration-studio.component.ts` | P1 | [ ] | |
| D5 | Empty/error state'leri dogrula ve eksikleri tamamla. | Genel | P2 | [ ] | |
| D6 | Paylasilan uygulama state'i icin merkezi Signal/RxJS servis ihtiyacini degerlendir ve ilk servis iskeletini ekle. | Genel | P2 | [ ] | |

## Oncelikli Uygulama Sirasi

1. A1, A2, A3, A5, D3
2. A8, B1, B2, C1, D4
3. A4, B4, B5, A9, D2
4. C2, C3, D1, D5, D6
