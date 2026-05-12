# Mapping Studio UI Findings Task List

Bu liste, 2026-05-12 tarihinde verilen kod analizi bulgularinin uygulanabilir task listesine cevrilmis halidir. Durumlar kod uzerinde tek tek dogrulanmis ve acik kalan maddeler ayrilmistir.

## Legend

- `[ ]` Acik
- `[x]` Tamamlandi / dogrulandi
- `[~]` Kismen tamamlandi, ek is gerekiyor

## A. Wizard / Integration Studio

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| A1 | Kaynak tipi secimine bagli konfig alanlarini tamamla: Kafka topic/broker, Webhook URL/API key, External API auth/credential. | `integration-studio.component.html`, `integration-studio.component.ts` | P0 | [x] | Kafka/Webhook/External API konfigurasyon panelleri mevcut. |
| A2 | Donusum tipine gore dinamik parametre label/placeholder metinlerini kullan. | `integration-studio.component.ts` | P0 | [x] | `paramLabelConfig` transform tipine gore label/icon uretiyor. |
| A3 | Karma donusumler icin ozel UI ekle: `enum_map` tablo, `conditional_value` IF/ELSE, `template_string` degisken secici editor. | `integration-studio.component.html` | P0 | [x] | Enum tablo, conditional blok ve template editor mevcut. |
| A4 | Object/array hedefler icin nested/array alt eslestirme arayuzu ekle. | `integration-studio.component.html`, `integration-studio.models.ts` | P1 | [ ] | Hedef model su an duz alan listesi; PostgreSQL/backend entity tasarimiyla birlikte ele alinmali. |
| A5 | Eksik zorunlu alan satirlarina "Hemen Esleştir" aksiyonu ekle. | `integration-studio.component.html` | P0 | [x] | Eksik alan aksiyonu ilgili mapping satirini aciyor. |
| A6 | Webhook secilince benzersiz URL ve masked API key uret/goster; rotate/copy akisini destekle. | `integration-studio.component.ts` | P0 | [x] | URL, masked key, copy ve rotate akisi mevcut. |
| A7 | External API secildiginde Wizard icinde "Baglantiyi Test Et" akisini calistir. | `integration-studio.component.ts` | P0 | [x] | Wizard icinde external API demo test akisi mevcut. |
| A8 | Uretilen JSONata icin opsiyonel "Uzman Modu / Onizleme" paneli ekle. | `integration-studio.component.html` | P1 | [x] | Expression/JSONata onizleme paneli mevcut. |
| A9 | Wizard responsive davranisini dogrula; kucuk ekranlarda tek kolona dusme / yatay kaydirma sagla. | `integration-studio.component.scss`, `integration-studio-shell.scss` | P1 | [x] | Shell ve studio stillerinde responsive grid/overflow kurallari mevcut. |
| A10 | Klavye kisayollari ekle: Ctrl/Cmd+S, Ctrl/Cmd+Enter, Ctrl/Cmd+Right/Left. | `integration-studio.component.ts` | P1 | [x] | Kaydet/test/adim navigasyonu ve rule undo/redo kisa yolları mevcut. |

## B. External Systems

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| B1 | Credential Store yonetim modal/sayfasini ekle; secret alanlarini write-only ele al. | `external-systems.component.ts`, `external-systems.component.html` | P0 | [x] | Credential manager modal ve write-only secret notu mevcut. |
| B2 | Baglanti testi sonucunda donen ornek response'u yakalayip "Mapping Wizard'da kullan" akisi sun. | `external-systems.component.ts` | P0 | [x] | `useSampleInStudio` sample'i Studio'ya aktariyor. |
| B3 | Dis sisteme bagli mapping'leri tabloda/detayda goster. | `external-systems.component.html` | P1 | [x] | Detay drawer'inda mapping listesi var. |
| B4 | Scheduled Poll icin cron/interval/ilk calisma konfig alanlarini tamamla. | `external-systems.component.ts`, `external-systems.component.html` | P1 | [x] | Cron, interval, ilk calisma ve checkpoint modu mevcut. |
| B5 | SOAP icin WSDL URL ve WSDL dosya yukleme akisini ekle. | `external-systems.component.ts`, `external-systems.component.html` | P1 | [x] | WSDL URL, dosya yukleme ve preview akisi mevcut. |
| B6 | Baglanti loglari, metrikler, sparkline ve detayli log goruntuleyici sagla. | `external-systems.component.ts`, `external-systems.component.html` | P1 | [x] | Sparkline, metrikler ve request/response log detaylari mevcut. |

## C. Diger Sayfalar

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| C1 | DLQ sayfasina detay, stack/error inceleme, partner/error/date filtreleri ve redrive aksiyonlarini tamamla. | `dlq` sayfasi | P1 | [x] | Filtreler, trace id, stack trace ve filtreli redrive tamamlandi. |
| C2 | Partner yonetimi CRUD ve partner detay metriklerini dogrula/tamamla. | `partners` sayfasi | P1 | [x] | Partner CRUD/detay akisi mevcut. |
| C3 | Monitoring/Dashboard demo verisini servis/snapshot mantigi ve canli grafik hissiyle guclendir. | `dashboard`, `monitoring` sayfalari | P2 | [~] | Snapshot/auto-refresh/export mevcut; Chart.js grafiklestirme opsiyonel takip isi. |

## D. Genel UI / UX

| ID | Task | Konum | Oncelik | Durum | Not |
|---|---|---|---|---|---|
| D1 | CSS degisken hatasini kontrol et; SCSS token ve CSS variable kullanimini ayir. | `styles.scss`, `styles/` | P1 | [x] | Build CSS degisken hatasi vermiyor; budget uyumu icin External Systems CSS sadeleştirildi. |
| D2 | A11y kontrolu yap: ARIA label, klavye navigasyonu, focus state, overlay/dropdown odak davranisi. | Genel | P1 | [~] | Kritik akislar klavye/tooltip/ARIA kullaniyor; tam ekran okuyucu testi ayri QA isi. |
| D3 | Wizard auto-save akisini ekle/dogrula; draft refresh/session kaybinda korunmali. | `integration-studio.component.ts` | P0 | [x] | Local draft autosave ve beforeunload korumasi mevcut. |
| D4 | Mapping kurallari icin undo/redo mekanizmasi ekle. | `integration-studio.component.ts` | P1 | [x] | Rule history, undo/redo butonlari ve kisa yollar mevcut. |
| D5 | Empty/error state'leri dogrula ve eksikleri tamamla. | Genel | P2 | [x] | DLQ/External Systems/mapping listelerinde empty/error state'ler mevcut. |
| D6 | Paylasilan uygulama state'i icin merkezi Signal/RxJS servis ihtiyacini degerlendir ve ilk servis iskeletini ekle. | Genel | P2 | [ ] | Backend/PostgreSQL entity servisleri netlesince merkezi store'a alinmali. |

## Kalan Takip Sirasi

1. A4: nested object/array mapping modeli ve PostgreSQL entity karsiligi.
2. D6: merkezi Signal/RxJS store ve backend servis sinirlari.
3. D2: tam ekran okuyucu/focus QA gecisi.
4. C3: monitoring icin opsiyonel Chart.js gorsellestirme.
