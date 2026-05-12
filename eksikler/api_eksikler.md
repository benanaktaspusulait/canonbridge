# CanonBridge Mapping Studio API – Eksikler ve Geliştirme Durumu

> **Tarih:** 13 Mayıs 2026
> **Repo:** `services/mapping-studio-api`
> **Genel Durum:** %75 tamamlandı (kimlik doğrulama, veritabanı, CRUD, Kafka, outbound client eklendi)

---

## ✅ Tamamlananlar (Son güncelleme ile gelenler)

- JWT tabanlı kimlik doğrulama (auth middleware, `/auth/login`, `/auth/refresh`)
- PostgreSQL + Prisma ORM entegrasyonu
- Mapping, Partner, Schema, External Systems için tam CRUD endpoint’leri
- Tüm endpoint’lerde Ajv validasyonu
- Outbound HTTP Client (axios tabanlı) ve Credential Store (AES‑256 şifreli)
- Kafka producer/consumer (KafkaJS)
- Rate limiting (`@fastify/rate-limit`)
- Jest ile birim testler (`auth.service.spec.ts`, `transform.service.spec.ts`, vs.)
- Temel dönüşüm endpoint’leri (`POST /transform/test`, `POST /transform/generate`) zaten mevcuttu

---

## 🔴 Kritik Eksikler (Hemen yapılması gerekenler)

1. **DLQ yönetim endpoint’leri yok**
   - `GET /api/dlq` – DLQ’daki mesajları listeleme
   - `GET /api/dlq/:id` – Mesaj detayı
   - `POST /api/dlq/:id/redrive` – Mesajı tekrar işleme kuyruğuna alma
   - DLQ verilerini saklamak için `dead_letter_queue` tablosu + Prisma modeli

2. **SOAP/XML dönüşüm desteği yok**
   - `fast-xml-parser` eklenmemiş
   - XML → JSON ve JSON → SOAP zarfı dönüşüm yardımcıları yok
   - SOAP outbound çağrıları için özel bir `SoapClientService` bulunmuyor

3. **Webhook tetikleme yönetimi yok**
   - UI’dan gelen “Webhook kaynağı” seçiminde oluşturulan endpoint’ler yönetilmiyor
   - Webhook alındığında raw topic’e yazacak bir mekanizma yok

4. **Audit log eksik**
   - Mapping oluşturma, yayınlama, DLQ redrive gibi kritik işlemler kayıt altına alınmıyor

---

## 🟡 Yüksek Öncelikli Eksikler (Kısa vadede yapılmalı)

5. **Graceful shutdown mekanizması yok**
   - `SIGTERM` alınca Kafka consumer/producer’ı durdurma, in‑flight istekleri tamamlama, health endpoint’i 503 yapma

6. **Circuit breaker desteği yok**
   - Dış API çağrıları için `opossum` gibi bir kütüphane eklenmemiş
   - Konfigürasyon (`failureThreshold`, `cooldownMs`) ortam değişkenlerinden okunmuyor

7. **API dokümantasyonu eksik**
   - `@fastify/swagger` ile OpenAPI henüz oluşturulmamış
   - `/docs` endpoint’inde Swagger UI sunulmuyor

8. **Ortam değişkeni dokümantasyonu eksik**
   - `.env.example` dosyası yetersiz (bazı anahtarların açıklaması yok)
   - Konfigürasyon referans tablosu (`docs/configuration.md`) yok

---

## 🟢 Orta Öncelikli Eksikler

9. **Dockerize edilmemiş**
   - `Dockerfile` ve `docker-compose` içinde servis tanımı yok
   - CI/CD’de container build aşaması eklenmemiş

10. **Test kapsamı yetersiz**
    - Sadece birim testler var; entegrasyon testleri (Kafka, DB) ve E2E testleri yok
    - `transform.service.spec.ts` 24 dönüşüm tipinin hepsini kapsamıyor

11. **Rate limiting kuralları detaylandırılmamış**
    - Partner bazında veya endpoint bazında farklı limitler tanımlanmamış
    - Admin endpoint’leri için ayrı bir limit politikası yok

12. **Schema Registry (opsiyonel)**
    - Canonical schema’ların versiyonlu olarak saklanması ve uyumluluk kontrolü yok

---

## ⚪ Düşük Öncelikli / İyileştirme Alanları

13. **Performance monitoring**
    - Dönüşüm süresi, DB sorgu süreleri gibi metrikleri toplayan bir middleware yok

14. **WebSocket desteği (opsiyonel)**
    - UI’a canlı bildirim (ör. dönüşüm bitti, DLQ’ya mesaj düştü) göndermek için WebSocket yok

15. **GraphQL desteği**
    - İleriye dönük olarak GraphQL endpoint’i sunulabilir

---

## 🎯 Sonraki Sprint İçin Önerilen Görevler (2 hafta)

1. **DLQ endpoint’lerini yaz** (Kritik)
2. **Graceful shutdown ve circuit breaker ekle** (Yüksek)
3. **SOAP/XML dönüşüm desteğini ekle** (Kritik)
4. **API dokümantasyonu ve `.env.example` iyileştirmesi yap** (Yüksek)

Bu görevler tamamlandığında backend %90 seviyesine ulaşır ve UI + Mock ile birlikte ilk demo ve pilot müşteri için tam hazır hale gelir.