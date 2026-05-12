# Transformer Development Checklist

Bu liste, transformer servisinde kod incelemesi sonrası kalan işleri ve geliştirme sırasını takip etmek için oluşturuldu.

## Durum Özeti

| Alan | Durum | Not |
|---|---|---|
| HTTP transform endpoint | Tamamlandı | `/v1/transform` Ajv + JSONata akışını çalıştırıyor |
| JSONata batch check | Tamamlandı | Batch limit, timeout ve payload size kontrolleri var |
| Kafka consumer/producer | Tamamlandı | Manuel offset commit ve DLQ routing var |
| Topic-based resolution | Tamamlandı | Kafka topic adından partner/event çözülüyor |
| Schema versioning | Geliştirildi | `version` ve `schemaVersion` resolution desteği eklendi |
| API key auth | Geliştirildi | Admin reload dahil `/v1/*` kritik endpointlerde tutarlı |
| Metrics | Geliştirildi | Histogram bucket üretimi ve Prometheus output düzeltildi |
| Redis cache | Geliştirildi | TTL env değeri cache factory'ye bağlandı |
| Outbox repository | Kısmen düzeltildi | PostgreSQL schema init ve JSONB okuma düzeltildi |
| OpenAPI docs | Eksik | Swagger dependency var, route registration yok |
| Worker pool | Eksik | WorkerPool var, transform engine'e bağlı değil |
| Outbox runtime integration | Eksik | Repository/relay var, Kafka publish path'e bağlanmamış |
| Dokümantasyon tutarlılığı | Kısmen eksik | README güncellendi, gap/history dosyaları eski ifadeler içeriyor |

## Geliştirme Sırası

1. OpenAPI/Swagger endpointlerini ekle.
2. Worker pool entegrasyonunu gerçek transform path'e bağla.
3. Outbox runtime entegrasyonunu değerlendir; güvenli ve küçükse bağla, büyükse ayrı backlog olarak bırak.
4. README ve checklist'i son duruma göre güncelle.
5. `npm run build` ve `npm test` ile doğrula.

## Kabul Kriterleri

- Build temiz geçmeli.
- Test suite temiz geçmeli.
- Yeni davranışlar unit/integration test ile korunmalı.
- Var olan mapping fixture akışı bozulmamalı.
- Kafka DLQ/canonical routing davranışı geriye uyumlu kalmalı.

