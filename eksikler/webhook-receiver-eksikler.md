# CanonBridge Mock Servisi – Eksikler ve Geliştirme Durumu

> **Tarih:** 13 Mayıs 2026
> **Repo:** `services/canonbridge-mock`
> **Genel Durum:** %80 tamamlandı (Spring Boot + Kafka + REST/SOAP/Webhook hepsi çalışıyor, `docker-compose.yml` mevcut)

---

## ✅ Tamamlananlar

- Spring Boot 3.4.4 + Java 21 (WAR deployment)
- **REST Mock:** PayFlex, ShopMax, FastCargo (REST endpoint)
- **SOAP Mock:** FastCargo (SOAP endpoint)
- **OAuth2 & API Key:** Kimlik doğrulama simülasyonu (`/oauth/token` vs.)
- **Kafka Event Generator:** Periyodik mock mesaj üretimi (`KafkaEventGeneratorService`)
- **Webhook Receiver:** `WebhookController.java` ile gelen webhook'ları yakalar
- **Docker Compose:** Kafka + PostgreSQL + Mock servisi tek komutla ayağa kalkıyor
- **Demo Verileri:** Örnek JSON payload'ları mevcut
- **Hata Senaryoları:** `400`, `401`, `429`, `500` durumları simüle ediliyor

---

## 🔴 Kritik Eksikler (Hemen yapılması gerekenler)

1. **`demo.sh` script'i eksik**
   - Tasarım dokümanı “beş dakikada uçtan uca demo” için bir script öngörüyor
   - QUICKSTART.md içinde manuel adımlar var, ancak tek komutla çalışan bir script yok
   - `scripts/demo.sh` oluşturulmalı

2. **WireMock'a geçiş değerlendirilmeli**
   - Tasarımda WireMock (REST + SOAP) öngörülüyor
   - Mevcut implementasyon Spring Boot controller'lar ile yapılmış
   - WireMock, gecikme simülasyonu ve hata enjeksiyonunu çok daha kolay yönetmeyi sağlar
   - Geçiş kararı verilirse `wiremock/` ve `soap-mock/` dizinleri oluşturulmalı

3. **`docs/` klasörü eksik**
   - Tasarımda `docs/scenarios.md`, `docs/payload-catalog.md`, `docs/demo-runbook.md` öngörülüyor
   - Bu dokümanlar olmadan senaristler ve satış ekibi ortamı kullanamaz

---

## 🟡 Yüksek Öncelikli Eksikler

4. **Webhook Receiver bağımsız servis değil**
   - Tasarımda Express.js tabanlı bağımsız bir Webhook Receiver öngörülüyor (port 3000)
   - Mevcut implementasyonda `WebhookController.java` Spring Boot'a gömülü
   - `webhook-receiver/` dizini ve `app.js` dosyası bulunamadı
   - **Not:** `services/webhook-receiver` repoda **Quarkus** ile ayrı bir servis olarak mevcut. Spring Boot içindeki controller ile çakışma var.

5. **Shell script'leri eksik**
   - `scripts/init-kafka.sh` – Kafka topic'lerini otomatik oluşturacak script yok
   - `scripts/send-mock-events.sh` – Periyodik event üretimi için bağımsız script yok
   - `scripts/trigger-webhook.sh` – Webhook tetikleme script'i yok
   - Mevcut durumda topic init `application.yml` içinde, event generator ise `KafkaEventGeneratorService.java` içinde

6. **Gecikme simülasyonu yok**
   - Tasarım “timeout” hata senaryosunu hedefliyor
   - WireMock'a geçişle birlikte `delay` profilleri (slow: 2s, timeout: 10s) eklenmeli

7. **Eksik hata senaryoları**
   - `502 Bad Gateway` simülasyonu yok
   - `503 Service Unavailable` simülasyonu yok
   - SOAP Fault (`Tracking Number Not Found`) implementasyonu doğrulanamadı
   - OAuth2 token expired senaryosu eksik
   - Invalid Basic Auth senaryosu eksik

---

## 🟢 Orta / Düşük Öncelikli Eksikler

8. **Payload kataloğu eksik**
   - `docs/payload-catalog.md` yok
   - Tüm mock payload'ların listelendiği bir doküman olmadan yeni senaristler payload'ları keşfedemez

9. **Senaryo dokümanı eksik**
   - `docs/scenarios.md` yok
   - Hangi senaryonun hangi endpoint'le tetiklendiği dağınık (QUICKSTART.md + API_EXAMPLES.md)

10. **Demo runbook eksik**
    - `docs/demo-runbook.md` yok
    - Satış ekibinin demo sırasında adım adım takip edeceği bir kılavuz yok

11. **Edge case payload'lar eksik**
    - Çok büyük payload (>1MB)
    - Çok derin nested yapı (>10 seviye)
    - Özel karakterler (Unicode, emoji, binary)

12. **WireMock dizinleri oluşturulmamış**
    - `wiremock/__files/` ve `wiremock/mappings/` yok
    - `soap-mock/wsdl/` yok

---

## 📋 Webhook Receiver (`services/webhook-receiver`) – Ayrı Değerlendirme

| Özellik | Durum |
|---|---|
| Quarkus Reactive RESTEasy | ✅ |
| Webhook key SHA-256 doğrulama | ✅ |
| Kafka'ya publish (Reactive) | ✅ |
| Envelope wrapping | ✅ |
| Dockerfile | ✅ |
| Birim test | ❌ |
| `README.md` | ✅ |
| WireMock'a entegrasyon | ❌ |

**Eksik:** Test yok, WireMock senaryosu ile entegre değil.

---

## 🎯 Öncelikli Aksiyon Listesi

1. **`scripts/demo.sh` yaz** – satış demosu için şart
2. **`docs/` klasörünü oluştur:** `scenarios.md`, `payload-catalog.md`, `demo-runbook.md`
3. **WireMock'a geçişi değerlendir** – REST ve SOAP mock'ları WireMock'a taşı
4. **Eksik shell script'lerini tamamla:** `init-kafka.sh`, `send-mock-events.sh`, `trigger-webhook.sh`
5. **Eksik hata senaryolarını ekle:** `502`, `503`, SOAP Fault, OAuth2 token expired, invalid Basic Auth
6. **Edge case payload'lar ekle:** büyük boyut, derin nested, özel karakterler
7. **Webhook receiver testlerini yaz**

---