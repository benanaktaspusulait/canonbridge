# CanonBridge Mock Service - Quick Start Guide

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Docker ve Docker Compose
- Java 25 (sadece local development için)
- Maven 3.9+ (sadece local development için)
- curl, jq, xmllint (demo script için)

### Docker ile Çalıştırma (Önerilen)

```bash
# Servisi başlat
docker-compose up -d

# Logları izle
docker-compose logs -f canonbridge-mock

# Servislerin durumunu kontrol et
docker-compose ps

# Health check
curl http://localhost:8080/actuator/health
```

### Demo Script'i Çalıştırma

```bash
# 5 adımlı demo akışını çalıştır
./scripts/demo.sh
```

Demo script şunları gösterir:
1. ✅ ShopMax Kafka sipariş event'i (otomatik)
2. ✅ PayFlex REST API - Başarılı ödeme sorgusu
3. ✅ FastCargo SOAP API - Başarılı kargo takibi
4. ✅ PayFlex API - Validation hatası (DLQ testi)
5. ✅ PayFlex Webhook - Ödeme onayı
6. ✅ ShopMax OAuth2 - Token alma ve kullanma

### Manuel Test Örnekleri

#### 1. PayFlex REST API

```bash
# Başarılı ödeme sorgusu (Detailed format)
curl -X GET "http://localhost:8080/api/payments/latest" \
  -H "X-API-Key: demo-api-key-12345"

# Flat format
curl -X GET "http://localhost:8080/api/payments/latest?format=flat" \
  -H "X-API-Key: demo-api-key-12345"

# Validation hatası
curl -X POST "http://localhost:8080/api/payments/query?scenario=missing-amount" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{}'

# Rate limit hatası
curl -X POST "http://localhost:8080/api/payments/query?scenario=rate-limit" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{}'

# Server error
curl -X POST "http://localhost:8080/api/payments/query?scenario=server-error" \
  -H "X-API-Key: demo-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### 2. ShopMax OAuth2 + REST API

```bash
# Access token al
TOKEN_RESPONSE=$(curl -X POST "http://localhost:8080/oauth/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=shopmax-demo-client" \
  -d "client_secret=shopmax-demo-secret")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# Siparişleri sorgula (Detailed format)
curl -X GET "http://localhost:8080/api/orders/recent" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Compact format
curl -X GET "http://localhost:8080/api/orders/recent?format=compact" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Service unavailable
curl -X GET "http://localhost:8080/api/orders/recent?scenario=unavailable" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 3. FastCargo SOAP API

```bash
# Başarılı tracking sorgusu
curl -X POST "http://localhost:8080/ws/track" \
  -u "fastcargo-demo:fastcargo-secret" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:fc="http://fastcargo.com/tracking">
    <soap:Body>
        <fc:TrackShipmentRequest>
            <fc:trackingNumber>FC123456789</fc:trackingNumber>
        </fc:TrackShipmentRequest>
    </soap:Body>
</soap:Envelope>'

# WSDL dosyasını indir
curl -X GET "http://localhost:8080/ws/fastcargo.wsdl"

# Tracking bulunamadı (SOAP Fault)
curl -X POST "http://localhost:8080/ws/track" \
  -u "fastcargo-demo:fastcargo-secret" \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:fc="http://fastcargo.com/tracking">
    <soap:Body>
        <fc:TrackShipmentRequest>
            <fc:trackingNumber>UNKNOWN-123</fc:trackingNumber>
        </fc:TrackShipmentRequest>
    </soap:Body>
</soap:Envelope>'
```

#### 4. Webhook

```bash
# Webhook gönder
curl -X POST "http://localhost:8080/webhook/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_123456",
    "eventType": "PAYMENT_CONFIRMED",
    "paymentId": "PAY-DEMO-001",
    "merchantId": "MERCH-12345",
    "status": "CONFIRMED",
    "amount": 1250.50,
    "currency": "EUR",
    "confirmedAt": "2024-05-12T10:30:00Z"
  }'

# Webhook'ları listele
curl -X GET "http://localhost:8080/webhook/webhooks?limit=10"

# Webhook'ları temizle
curl -X DELETE "http://localhost:8080/webhook/webhooks"

# Otomatik webhook gönder
./scripts/trigger-webhook.sh
```

#### 5. Kafka Topic'leri

```bash
# Kafka container'a bağlan
docker exec -it canonbridge-kafka bash

# Topic'leri listele
kafka-topics.sh --bootstrap-server localhost:9092 --list

# ShopMax siparişlerini consume et
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic partner.shopmax.raw \
  --from-beginning

# Cargo güncellemelerini consume et
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic cargo.updates \
  --from-beginning
```

### Kafka Event Generator

Servis otomatik olarak periyodik event'ler üretir:
- **ShopMax siparişleri**: Her 30 saniyede bir
- **Cargo güncellemeleri**: Her 2 dakikada bir

Event generator'ı devre dışı bırakmak için:

```yaml
# application.yml
mock:
  kafka:
    event-generator:
      enabled: false
```

### Local Development (Docker olmadan)

```bash
# Kafka'yı ayrı başlat
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_NODE_ID=1 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
  -e CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk \
  apache/kafka:3.7.0

# Uygulamayı başlat
./mvnw spring-boot:run

# Veya JAR olarak
./mvnw clean package
java -jar target/canonbridge-mock-1.0.0.jar
```

### Ortamı Durdurma ve Temizleme

```bash
# Servisleri durdur
docker-compose down

# Volume'ları da sil (tüm veriyi temizle)
docker-compose down -v

# Sadece mock servisini yeniden başlat
docker-compose restart canonbridge-mock
```

## 📊 Endpoint'ler

### REST API Endpoints

| Endpoint | Method | Auth | Açıklama |
|----------|--------|------|----------|
| `/api/payments/latest` | GET | API Key | Son ödeme emri |
| `/api/payments/query` | POST | API Key | Ödeme sorgusu |
| `/api/orders/recent` | GET | Bearer Token | Son siparişler |
| `/oauth/token` | POST | Client Credentials | OAuth2 token |
| `/ws/track` | POST | Basic Auth | SOAP tracking |
| `/ws/fastcargo.wsdl` | GET | - | WSDL dosyası |
| `/webhook/payment` | POST | - | Payment webhook |
| `/webhook/webhooks` | GET | - | Webhook listesi |
| `/actuator/health` | GET | - | Health check |

### Kafka Topics

| Topic | Açıklama | Üretim Sıklığı |
|-------|----------|----------------|
| `partner.payflex.raw` | PayFlex raw payment events | Manuel |
| `partner.shopmax.raw` | ShopMax raw order events | 30 saniye |
| `cargo.updates` | FastCargo scheduled updates | 2 dakika |
| `canonbridge.retry.demo` | Retry policy test | Manuel |
| `canonbridge.dlq.demo` | DLQ demonstration | Manuel |

## 🔐 Demo Credentials

### PayFlex (API Key)
```
X-API-Key: demo-api-key-12345
```

### ShopMax (OAuth2)
```
client_id: shopmax-demo-client
client_secret: shopmax-demo-secret
grant_type: client_credentials
```

### FastCargo (Basic Auth)
```
username: fastcargo-demo
password: fastcargo-secret
```

## 🎯 Senaryo Parametreleri

### PayFlex Senaryoları
- `?scenario=missing-amount` - 400 Validation Error
- `?scenario=server-error` - 500 Internal Server Error
- `?scenario=rate-limit` - 429 Too Many Requests
- `?scenario=timeout` - Timeout simulation

### ShopMax Senaryoları
- `?scenario=unavailable` - 503 Service Unavailable
- `?scenario=rate-limit` - 429 Too Many Requests

### FastCargo Senaryoları
- `trackingNumber=UNKNOWN-123` - SOAP Fault (Not Found)

## 🔍 Monitoring

```bash
# Health check
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics

# Container logs
docker-compose logs -f canonbridge-mock

# Kafka logs
docker-compose logs -f kafka
```

## 🐛 Troubleshooting

### Servis başlamıyor
```bash
# Port kullanımda mı kontrol et
lsof -i :8080
lsof -i :9092

# Docker loglarını kontrol et
docker-compose logs canonbridge-mock
```

### Kafka bağlantı hatası
```bash
# Kafka hazır mı kontrol et
docker-compose ps kafka

# Kafka health check
docker exec canonbridge-kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### Event'ler üretilmiyor
```bash
# Event generator aktif mi kontrol et
curl http://localhost:8080/actuator/health | jq '.components.kafka'

# Kafka topic'leri var mı kontrol et
docker exec canonbridge-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list
```

## 📚 Daha Fazla Bilgi

- [Ana README](README.md) - Detaylı mimari ve tasarım dokümanı
- [Demo Script](scripts/demo.sh) - Otomatik demo akışı
- [Trigger Webhook](scripts/trigger-webhook.sh) - Manuel webhook tetikleme

## 🎉 Başarılı Kurulum Testi

Tüm sistemin çalıştığını doğrulamak için:

```bash
# 1. Servisleri başlat
docker-compose up -d

# 2. 30 saniye bekle (Kafka ve servis hazır olsun)
sleep 30

# 3. Demo script'i çalıştır
./scripts/demo.sh
```

Tüm adımlar ✅ ile tamamlanırsa kurulum başarılı! 🎊
