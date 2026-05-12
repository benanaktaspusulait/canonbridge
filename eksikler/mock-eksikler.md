Aşağıda, `services/canonbridge-mock` için mevcut kod tabanının `design.md` ile birebir karşılaştırması yapılarak hazırlanmış detaylı eksik listesi yer almaktadır.

---

## 📊 Genel Değerlendirme

Tasarım dokümanı, WireMock (REST/SOAP) ve Express.js (Webhook) tabanlı bir mimari öngörmektedir; mevcut implementasyon ise Spring Boot üzerine inşa edilmiştir. Bu başlı başına bir sapma değil, bilinçli bir teknoloji seçimi olabilir. Ancak aradaki fark, bazı tasarım kararlarının yeniden değerlendirilmesini gerektirebilir.

---

## 🔴 Kritik Eksikler

| # | Eksik | Tasarım Referansı | Açıklama |
|---|---|---|---|
| 1 | **WireMock'a geçiş** | Bölüm 4 (Yüksek Seviye Mimari), Bölüm 5 (Dosya Yapısı) | Tasarımda REST Mock (port 8080) ve SOAP Mock (port 8081) için **WireMock** öngörülüyor. Mevcut implementasyonda REST ve SOAP endpoint'leri Spring Boot controller'lar (`PayFlexController`, `ShopMaxController`, `FastCargoSoapController`) içinde implemente edilmiş. WireMock dizinleri (`wiremock/`, `soap-mock/`) oluşturulmamış. WireMock'a geçiş, gecikme simülasyonu ve hata enjeksiyonunu çok daha kolay yönetmeyi sağlar. |
| 2 | **Webhook Receiver (Express.js) eksik** | Bölüm 4, 5 | Tasarımda bağımsız bir Express.js Webhook Receiver (port 3000) öngörülüyor. Mevcut implementasyonda webhook endpoint'i `WebhookController.java` içinde Spring Boot'a gömülü. `webhook-receiver/` dizini ve `app.js` dosyası bulunamadı. |
| 3 | **`scripts/demo.sh` eksik** | Bölüm 4, 5 | Tasarımda "Beş dakikalık satış demo akışı" için `scripts/demo.sh` öngörülüyor. Mevcut repoda `scripts/` dizini ve `demo.sh` dosyası bulunamadı. QUICKSTART.md içinde demo adımları manuel olarak listelenmiş, ancak tek komutla çalışan bir script yok. |
| 4 | **`docs/` klasörü eksik** | Bölüm 5 | Tasarımda `docs/scenarios.md`, `docs/payload-catalog.md`, `docs/demo-runbook.md` dosyaları öngörülüyor. Mevcut repoda `docs/` dizini bulunamadı. |

---

## 🟡 Yüksek Öncelikli Eksikler

| # | Eksik | Tasarım Referansı | Açıklama |
|---|---|---|---|
| 5 | **`scripts/send-mock-events.sh` eksik** | Bölüm 5 | Tasarımda periyodik event üretimi için `scripts/send-mock-events.sh` öngörülüyor. Bu dosya bulunamadı. Periyodik event üretimi şu an yalnızca `KafkaEventGeneratorService.java` (Spring Boot içinde) ile yapılıyor. Bağımsız bir shell script'i daha hafif ve esnek olabilir. |
| 6 | **`scripts/trigger-webhook.sh` eksik** | Bölüm 5 | Tasarımda webhook tetikleme için `scripts/trigger-webhook.sh` öngörülüyor. Bu dosya bulunamadı. |
| 7 | **`scripts/init-kafka.sh` eksik** | Bölüm 5 | Tasarımda Kafka topic'lerini otomatik oluşturacak `scripts/init-kafka.sh` öngörülüyor. Bu dosya bulunamadı. Topic init işlemi şu an `application.yml` içinde `spring.kafka.topics` altında tanımlanmış, ancak bağımsız bir script daha taşınabilir olabilir. |
| 8 | **Gecikme simülasyonu eksik** | Bölüm 1 (Hata senaryoları) | Tasarım "timeout" hata senaryosunu göstermeyi hedefliyor. WireMock'a geçişle birlikte `delay` profilleri (slow: 2s, timeout: 10s) eklenmeli. Mevcut implementasyonda bu profiller bulunamadı. |
| 9 | **HTTP hata kodu simülasyonu kısmi** | Bölüm 1, 7-9 | Tasarım "retry, DLQ, validation error, timeout ve authentication error gibi operasyonel durumları" hedefliyor. QUICKSTART.md'de `scenario=missing-amount` (400), `scenario=rate-limit` (429), `scenario=server-error` (500) var. Ancak `502 Bad Gateway` ve `503 Service Unavailable` senaryoları eksik. |
| 10 | **SOAP Fault senaryosu eksik** | Bölüm 8 | Tasarımda `soap:Fault` yanıtı (`Tracking Number Not Found`) öngörülüyor. Mevcut `FastCargoService.java` içinde bu senaryonun implemente edilip edilmediği doğrulanamadı. |

---

## 🟢 Orta/Düşük Öncelikli Eksikler

| # | Eksik | Tasarım Referansı | Açıklama |
|---|---|---|---|
| 11 | **`wiremock/__files/` ve `wiremock/mappings/` eksik** | Bölüm 5 | Tasarımda WireMock statik dosya ve mapping konfigürasyon dizinleri öngörülüyor. WireMock'a geçiş yapılmadığı için bu dizinler oluşturulmamış. |
| 12 | **`soap-mock/wsdl/` eksik** | Bölüm 5 | Tasarımda SOAP mock için WSDL dosyası öngörülüyor. Mevcut implementasyonda SOAP endpoint'i Spring Boot controller'da hard-coded. |
| 13 | **`webhook-receiver/webhooks/` dizini eksik** | Bölüm 5 | Tasarımda webhook payload'larının saklanacağı dizin öngörülüyor. Webhook receiver bağımsız bir servis olarak ayrılmadığı için bu dizin yok. |
| 14 | **Payload kataloğu eksik** | Bölüm 5 (`docs/payload-catalog.md`) | Tasarımda tüm mock payload'ların kataloglandığı bir doküman öngörülüyor. API_EXAMPLES.md mevcut ancak bu, payload kataloğu değil; endpoint örneklerini içeriyor. |
| 15 | **Senaryo dokümanı eksik** | Bölüm 5 (`docs/scenarios.md`) | Tasarımda detaylı senaryo açıklamaları için ayrı bir doküman öngörülüyor. Şu an senaryolar yalnızca QUICKSTART.md ve API_EXAMPLES.md içinde dağınık. |
| 16 | **Demo runbook eksik** | Bölüm 5 (`docs/demo-runbook.md`) | Tasarımda satış ekibi için adım adım demo runbook'u öngörülüyor. Bu doküman bulunamadı. |
| 17 | **Auth error simülasyonu eksik** | Bölüm 1, 7 | QUICKSTART.md'de geçersiz API Key ile `401` hatası test edilebiliyor. Ancak OAuth2 token expired ve invalid Basic Auth senaryoları eksik. |
| 18 | **Edge case: büyük payload** | Bölüm 3.2 | Tasarım "JSON/XML payload'lar alan çeşitliliği içermeli" diyor. Çok büyük (>1MB) veya çok derin (>10 seviye) nested payload senaryosu eksik. |

---

## 📋 Tasarıma Aykırılık / Sapma Özeti

| Tasarım Kararı | Mevcut Durum | Değerlendirme |
|---|---|---|
| WireMock REST + SOAP | Spring Boot controller'lar | Bilinçli tercih olabilir; WireMock daha hızlı demo ve hata simülasyonu sağlar. Geçiş değerlendirilmeli. |
| Express.js Webhook Receiver | `WebhookController.java` | Java tek başına yeterli olabilir; ancak bağımsız bir servis daha izole test imkanı sunar. |
| Shell tabanlı script'ler | Spring Boot içinde `KafkaEventGeneratorService` | Mevcut çözüm işlevsel; ancak bağımsız shell script'leri daha hafif ve demo ortamında daha esnek olabilir. |
| WireMock gecikme profilleri | Uygulanmamış | Demo için kritik değil ancak test için önemli. |
| `docs/` klasörü | Yok | Satış ve geliştirici deneyimi için önemli. |

---

## 🎯 Öncelikli Aksiyon Listesi

1. **`scripts/demo.sh` yaz.** (Kritik – satış demosu için şart)
2. **`docs/` klasörünü oluştur:** `scenarios.md`, `payload-catalog.md`, `demo-runbook.md` yaz.
3. **WireMock'a geçişi değerlendir.** REST ve SOAP mock'ları WireMock'a taşımak, gecikme ve hata simülasyonlarını çok kolaylaştıracaktır.
4. **`scripts/` altındaki eksik script'leri tamamla:** `init-kafka.sh`, `send-mock-events.sh`, `trigger-webhook.sh`.
5. **Eksik hata senaryolarını ekle:** `502`, `503`, SOAP Fault, OAuth2 token expired, invalid Basic Auth.
6. **Edge case payload'lar ekle:** büyük payload, derin nested yapı.

---

Mevcut durumda, mock servisi temel işlevselliği başarıyla sağlıyor. Özellikle REST (PayFlex, ShopMax), SOAP (FastCargo), Webhook, OAuth2 ve Kafka entegrasyonu çalışır durumda. Ancak tasarım dokümanında hedeflenen "tek komutla demo" (`demo.sh`) ve "kontrollü hata simülasyonu" (WireMock gecikme profilleri) gibi kritik özellikler henüz tam olarak hayata geçirilmemiş. Öncelikli aksiyon listesindeki ilk 3 madde tamamlandığında, mock ortamı satış demosu için tamamen hazır hale gelecektir.