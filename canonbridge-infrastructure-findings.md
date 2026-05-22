# CanonBridge — `infrastructure/` Audit Report (v1)

Repo: `benanaktaspusulait/canonbridge` · Path: `infrastructure/`
Tarih: 2026-05-22

Scope incelenen dosyalar:
- `docker/` (grafana dashboards + provisioning, prometheus + alerts, kafka topic init, postgres init.sql)
- `k8s/` (namespace, secrets, configmap, postgres + kafka statefulsets, business-service deployment, transformer alt klasörü kustomize seti)
- `production/` (Caddyfile, prometheus.yml)
- `scripts/deploy-k8s.sh`

Toplam **38 bulgu** tespit edildi: **9 Critical**, **12 High**, **12 Medium**, **5 Low**.

---

## 0. Yapısal / Tutarlılık Sorunları (genel)

| ID | Severity | Bulgu |
|----|----------|-------|
| **G1** | High | İki farklı namespace paralel kullanılıyor: `etl-solutions` (`namespace.yaml`, `business-service`, `postgres`, `kafka`, `configmap.yaml`, `secrets.yaml`) vs `canonbridge` (`transformer/*`). Aynı cluster'da iki ayrı isim alanı = service-discovery ve NetworkPolicy karmaşası. Tek namespace'e (`canonbridge`) konsolide edilmeli. |
| **G2** | High | `transformer/configmap.yaml` Kafka broker'ı `kafka-service.canonbridge.svc.cluster.local:9092` olarak yazıyor; ama Kafka StatefulSet `etl-solutions` namespace'inde `kafka` ve `kafka-headless` adıyla deploy ediliyor. **Mevcut hâliyle transformer Kafka'ya bağlanamaz.** |
| **G3** | High | `deploy-k8s.sh` `k8s/transformer-deployment.yaml` arıyor; gerçek path `k8s/transformer/deployment.yaml` (alt klasör + kustomize). Script ilk çalıştırmada `kubectl apply` hatası verir. Script `kubectl apply -k k8s/transformer/` olarak güncellenmeli. |
| **G4** | Medium | `configmap.yaml` içindeki `transformer-config` (NODE_ENV/KAFKA_RAW_TOPIC vs.) eski Node servisine, `transformer/configmap.yaml` ise yeni Go/TS servisine ait gibi duruyor. İki `transformer-config` ConfigMap'i ayrı namespace'lerde olsa bile bilişsel yük yaratıyor; biri silinmeli. |
| **G5** | Medium | Etiketleme tutarsız. Bazı kaynaklarda `app:` var, hiçbirinde `app.kubernetes.io/name`, `app.kubernetes.io/part-of`, `app.kubernetes.io/version` yok. Kustomize/Helm uyumu ve ServiceMonitor seçimi için standart Kubernetes recommended labels eklenmeli. |
| **G6** | Low | `infrastructure/production/` ve `infrastructure/docker/` aynı şeyi (Prometheus config) iki kez tanımlıyor — drift kaçınılmaz. Ortak base + overlay (kustomize/env vars) önerilir. |

---

## 1. Güvenlik (K — Kritik)

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **K1** | Critical | `k8s/secrets.yaml` | `POSTGRES_PASSWORD`, `JWT_SECRET`, `API_KEY_SALT`, `REDIS_PASSWORD` hepsi `changeme-in-production` placeholder ile **commit edilmiş**. Dosya repo'da olmamalı. Bu dosyayı `.gitignore`'a ekleyin; sadece `secrets.example.yaml` (boş `stringData` ile) bırakın. Production için External Secrets Operator + Vault/SOPS/SealedSecrets kullanılmalı. |
| **K2** | Critical | `k8s/transformer/secret.yaml` | Aynı şekilde `API_KEY: "change-me-in-production"` checked-in. Yorum satırı `kubectl create secret generic ...` doğru yolu söylüyor ama dosyanın kendisi repo'da. |
| **K3** | Critical | `k8s/kafka-statefulset.yaml` | `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT`. Cluster içi de olsa **mTLS/SASL yok**. Production'da SASL_SSL + ACL şart; yoksa pod-to-pod sniffing & topic hijack mümkün. |
| **K4** | Critical | `k8s/postgres-statefulset.yaml` | DB **`sslmode=disable`** ile çalışıyor (`jdbc.url=jdbc:postgresql://postgres:5432/etldb` sslmode yok). Ayrıca PG sadece 1 replika, **WAL backup, PITR, anti-affinity yok**. Single-AZ pod ölünce 100GB veri kayıp riski. |
| **K5** | Critical | tüm `Deployment`/`StatefulSet` | `securityContext` **hiçbir yerde yok**. Tüm container'lar root ile çalışıyor olabilir. `runAsNonRoot: true`, `runAsUser: 1000`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: [ALL]`, `seccompProfile: RuntimeDefault` eklenmeli. Pod-level `fsGroup` + `seccompProfile` de gerekli. |
| **K6** | Critical | `Caddyfile` | `api.{$CANONBRIDGE_DOMAIN}` ve `hooks.` bloklarında **rate limit yok**, CORS header yok, `Content-Security-Policy` yok. `Strict-Transport-Security` sadece bir snippet'te; ancak `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` yok. Webhook endpoint'i için body limit 10MB makul, ama IP allowlist veya signature middleware reverse-proxy seviyesinde yok — sadece app'e bırakılmış. |
| **K7** | Critical | `Caddyfile` | `@private_docs path /openapi* /swagger-ui* /q/openapi* /q/swagger-ui*` → `respond 404` yapılıyor ama Quarkus default'ta `/q/dev/`, `/q/info`, `/q/health-ui` gibi başka endpoint'ler de açık kalabilir. Tüm `/q/*` (sadece `/q/metrics` ve `/q/health` hariç) public'ten kapatılmalı. |
| **K8** | High | tüm namespace | **NetworkPolicy yok**. Default deny-all + explicit allow (transformer→kafka, business→postgres, prometheus→tüm `/metrics`) eklenmeli. |
| **K9** | High | tüm Deployment | `imagePullPolicy: Always` + `image: ...:latest` antipattern. `latest` tag immutability sağlamaz; rollback için `:sha-<git>` veya `:vX.Y.Z` zorunlu. Ayrıca image signing (cosign) ve `imagePullSecrets` özel registry için belirtilmemiş. |
| **K10** | High | `k8s/transformer/secret.yaml` | `optional: true` ile `API_KEY` env okunuyor — yani **secret yoksa pod yine başlar ve auth bypass olur** (transformer auth zaten API_KEY tanımsızken devre dışı kalıyordu, services audit K7 ile aynı bulgu burada infra tarafında pekişiyor). `optional: true` kaldırılmalı; pod fail-fast olmalı. |
| **K11** | High | grafana provisioning | `provisioning/datasources/prometheus.yml` ve `dashboards/default.yml` dosyalarının içeriği görüldü ama Grafana admin parolası, anonymous access ayarı vb. yok (docker-compose tarafında olabilir); yine de `GF_SECURITY_ADMIN_PASSWORD__FILE`, `GF_AUTH_ANONYMOUS_ENABLED=false` zorunluluğu README/checklist olarak burada belirtilmemiş. |

---

## 2. Yüksek Erişilebilirlik & Veri Bütünlüğü

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **A1** | Critical | `kafka-statefulset.yaml` | Kafka 3 replika ama hâlâ **ZooKeeper** kullanıyor (`KAFKA_ZOOKEEPER_CONNECT=zookeeper-0...`). ZooKeeper StatefulSet repo'da yok → cluster start-up'ta CrashLoop. CP 7.5+ ile KRaft (`KAFKA_PROCESS_ROLES=broker,controller`, `KAFKA_NODE_ID` vb.) tercih edilmeli, ya da Zookeeper StatefulSet eklenmeli. |
| **A2** | Critical | `kafka-statefulset.yaml` | `KAFKA_BROKER_ID_COMMAND="echo ${HOSTNAME##*-}"` — `BROKER_ID_COMMAND` Confluent image'ında **runtime'da değerlendirilmez**. Doğrusu: ya init container ile `broker.id` üretmek ya da KRaft tabanlı `KAFKA_NODE_ID` env'ini `valueFrom: fieldRef: metadata.name`+downward API ile set edip script'le parse etmek. Mevcut hâlde tüm broker'lar aynı `${HOSTNAME##*-}` literal'ini alabilir. |
| **A3** | High | `postgres-statefulset.yaml` | Tek replika + `volumeClaimTemplate` ama `podManagementPolicy`, `updateStrategy` yok. Backup için cronjob yok (`pg_dump`/`pgbackrest`/Velero). DR planı yok. |
| **A4** | High | `business-service-deployment.yaml` | HPA min=3 max=15 ama `PodDisruptionBudget` yok. Cluster upgrade sırasında 3 pod birden evict olabilir. Transformer'da PDB var (`minAvailable: 2`), business-service ve postgres/kafka için de eklenmeli. |
| **A5** | High | tüm Deployment | **Topology spread constraints** yok (`topologySpreadConstraints` zone bazlı). Sadece transformer'da `podAntiAffinity` var (preferred). Business-service'te o da yok. |
| **A6** | Medium | `business-service-deployment.yaml` | `startupProbe` `initialDelaySeconds: 0` ama Quarkus JIT cold start 10-20s sürebilir; `failureThreshold: 30 × 5s = 150s` tampon var, kabul edilebilir. Ama liveness `initialDelaySeconds: 30` startupProbe varsa **gereksiz** (startupProbe geçene kadar liveness çalışmaz). `initialDelaySeconds: 0` yapılmalı. |
| **A7** | Medium | `transformer/deployment.yaml` | `livenessProbe` ve `readinessProbe` aynı endpoint (`/health`). Liveness asla DB/Kafka bağımlılığını kontrol etmemeli; aksi halde downstream outage'ında pod loop'a girer. `/health/live` (sadece process) ve `/health/ready` (bağımlılıklar) ayrılmalı. |
| **A8** | Medium | `kafka-statefulset.yaml` | `livenessProbe: tcpSocket: 9092`. Broker süreç ayakta ama controller'a bağlanamıyor olabilir; `kafka-broker-api-versions` exec probe tercih edilmeli. |
| **A9** | Low | `postgres-statefulset.yaml` | `pg_isready` user/db kontrol ediyor ama `-h 127.0.0.1` yok → unix socket üzerinden gidiyor, OK; ancak `readinessProbe.initialDelaySeconds: 5` ilk init.sql çalışırken false-positive üretebilir, 15s önerilir. |

---

## 3. Gözlemlenebilirlik

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **O1** | High | `production/prometheus.yml` ve `docker/prometheus/prometheus.yml` | `mapping-studio-api` job'ı `metrics_path: /metrics` kullanıyor. Quarkus'ta default `/q/metrics`. webhook-receiver'da `/q/metrics` doğru; mapping-studio-api'de **yanlış**. Job hiç scrape edemiyor. |
| **O2** | High | `prometheus.yml` (her ikisi) | `alertmanager` config yok, `remote_write` yok. Alert'ler tetiklense kimseye gitmiyor. `alerting:` bloğu + Alertmanager service eklenmeli. |
| **O3** | High | `alerts/proxy-alerts.yml` | Sadece proxy alert'leri var; **Kafka consumer lag, DLQ size, PG replication, disk usage, HPA saturation, JVM heap, container OOM, certificate expiry** için alert yok. SRE temel set eksik. |
| **O4** | Medium | `transformer/servicemonitor.yaml` | `prometheus: kube-prometheus` label eşleşmesi cluster'a göre değişir; çoğu kurulumda `release: kube-prometheus-stack` beklenir. ServiceMonitor seçilemeyebilir. |
| **O5** | Medium | tüm Deployment | OpenTelemetry/tracing collector endpoint env (`OTEL_EXPORTER_OTLP_ENDPOINT`) hiçbir manifest'te yok. `transformer-config`'te `ENABLE_TRACING: "true"` var ama nereye export edileceği belirsiz. |
| **O6** | Medium | grafana | Dashboard JSON'ları (`proxy-performance`, `runtime-operations`, `system-overview`) commit edilmiş ama `datasource` UID'leri sabit (`PBFA97CFB590B2093` benzeri default Prometheus UID değil ise) — provisioning sırasında "datasource not found" verir. `datasource: ${DS_PROMETHEUS}` template ile parametrize edilmeli. |
| **O7** | Low | `production/prometheus.yml` | `scrape_interval: 10s` üç servis için; postgres/redis/node 15s. 10s ile cardinality yüksek metrikler (Quarkus micrometer http_server_requests_seconds_bucket) Prometheus'u doldurabilir. 15s standardı yeterli. |

---

## 4. Kaynak / Performans

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **R1** | High | tüm Deployment | CPU `limits` set edilmiş (`1000m`/`2000m`). Kubernetes CPU limits **throttling** yapıyor; latency-kritik servisler için (transformer, business-service) `limits.cpu` kaldırılıp sadece `requests` ile bırakılması önerilir (CFS throttling antipattern). Bkz. Tim Hockin / Kubecon talks. |
| **R2** | Medium | `business-service-deployment.yaml` | Quarkus JVM için `JAVA_OPTS_APPEND` ile `-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysPreTouch` env'i yok. JVM defaults `-Xmx256m` civarı seçer, 2Gi limit'in çok altında. |
| **R3** | Medium | `transformer/deployment.yaml` | `WORKER_POOL_SIZE: "4"` configmap'inde (eski). Yeni transformer-config'inde bu key yok. Worker count cluster cpu request'ine bağlanmalı (`runtime.NumCPU()` veya env). |
| **R4** | Medium | `kafka-statefulset.yaml` | `KAFKA_HEAP_OPTS` set edilmemiş. CP image default `-Xmx1G` → 4Gi memory limit'in %25'i. `-Xmx3G -Xms3G` + page cache için kalan memory bırakılmalı. |
| **R5** | Low | HPA'lar | Memory utilization metric ile autoscale **antipattern** (JVM/Node GC sonrası memory tutar, scale-down olmaz). Sadece CPU + custom metric (kafka_consumergroup_lag) önerilir. |

---

## 5. Operasyon / Script

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **S1** | High | `scripts/deploy-k8s.sh` | Yukarıda G3'te belirtildi — yanlış path. Ayrıca script `kubectl wait` çağrılarında `--timeout=300s` ile pod CrashLoop'ta olsa bile sessizce başarısız olabiliyor; `set -e` var ama `kubectl wait` non-zero dönerse `\|\| true` yok, OK. Ancak `read -p "Have you updated..."` interaktif: CI'da kullanılamaz. `--non-interactive` flag eklenmeli. |
| **S2** | Medium | `scripts/deploy-k8s.sh` | `kubectl run health-check --rm -i --restart=Never` blocking; pod silinmeden script ilerleyemez ve aynı isim ikinci çağrıda çakışır (aynı pod adı iki kez kullanılmış: TRANSFORMER ve BUSINESS health check). İkincide `AlreadyExists` hatası. Pod adlarını farklılaştırın. |
| **S3** | Medium | `scripts/deploy-k8s.sh` | Health endpoint'i `http://transformer-service:3000/health/ready` kullanıyor; ama transformer service adı `transformer` (deployment.yaml'a göre) ve port `8080`. Hem servis adı hem port yanlış. |
| **S4** | Medium | `docker/kafka/create-topics.sh` | `--replication-factor 1` hardcoded. Production compose'da 3 broker varsa RF=1 hata toleransı sıfır. Env var `REPLICATION_FACTOR` parametrize edilmeli. |
| **S5** | Low | `create-topics.sh` | Retry topic'leri (`1m/5m/30m`) doğru ama `transformation.retry` (suffix'siz) yok — services tarafında producer/consumer hangi isimleri kullanıyorsa hizalanmalı (configmap.yaml'da `KAFKA_RETRY_TOPIC: "transformation.retry"` tek isim → mismatch). |

---

## 6. Caddy / Edge

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **C1** | High | `Caddyfile` | `studio.` bloğunda `@notifications path /api/notifications/ws` matcher var ama `reverse_proxy` üzerinde WebSocket için `transport http { versions 1.1 }` veya en azından `flush_interval -1` belirtilmemiş. Caddy v2 WS'i otomatik destekler ama uzun ömürlü bağlantılarda `read_buffer`/`write_timeout` default'ları sorun çıkarabilir. |
| **C2** | Medium | `Caddyfile` | `encode zstd gzip` snippet içinde ama `Content-Type` filtresi yok — Caddy zaten heuristik uyguluyor, OK. Ancak `header -Server` yapılırken Caddy `Server: Caddy` header'ı bazı sürümlerde yine sızabilir; `header_down -Server` reverse-proxy bloğunda da gerekli. |
| **C3** | Medium | `Caddyfile` | `email {$ACME_EMAIL}` set edilmiş ama `acme_ca` veya staging fallback yok; ilk deploy rate-limit'e takılırsa Let's Encrypt prod'unda 1 hafta beklemek gerekir. CI'da `tls internal` ile smoke test önerilir. |
| **C4** | Low | `Caddyfile` | `Content-Security-Policy`, `Permissions-Policy`, `X-Frame-Options DENY` snippet'e eklenmeli (website Next.js zaten kendi CSP'sini gönderiyor olsa da edge'de fallback önemli). |

---

## 7. PostgreSQL Init

| ID | Severity | Dosya | Bulgu |
|----|----------|-------|-------|
| **P1** | Medium | `docker/postgres/init.sql` | `events_2026_05` partition manuel oluşturulmuş; otomatik partition yönetimi (`pg_partman`) yok. 2026-06'da yeni partition oluşturulmazsa insert fail. |
| **P2** | Medium | `init.sql` | `CREATE EXTENSION pg_stat_statements` var ama `shared_preload_libraries` ConfigMap'le set edilmedi; ext yüklenmez. |
| **P3** | Low | `init.sql` | `payload JSONB NOT NULL` — payload'lar üzerinde GIN index var mı (truncated)? Yoksa partner sorguları full scan. |

---

## Öncelikli Quick-Wins (1-2 günlük iş)

1. **G2 + G3 + S3**: Transformer'ı kafka'ya bağlayacak şekilde namespace/servis adı/port'larını hizalayın; `deploy-k8s.sh`'i kustomize'a (`kubectl apply -k k8s/transformer/`) çevirin.
2. **K1 + K2**: `secrets.yaml` ve `transformer/secret.yaml`'ı repo'dan kaldırın, `.example` versiyonlarını bırakın, `SealedSecrets` veya `external-secrets` kurun.
3. **K5**: Tüm Deployment/StatefulSet'lere standart `securityContext` ekleyin (tek PR'da copy-paste).
4. **K10**: `optional: true` flag'lerini kaldırın → pod fail-fast.
5. **O1**: `mapping-studio-api` Prometheus job'unu `/q/metrics`'e çevirin (iki dosyada).
6. **A1 + A2**: Kafka'yı KRaft moduna geçirin veya ZooKeeper StatefulSet ekleyin; `KAFKA_BROKER_ID_COMMAND` yerine init-container ile broker.id üretin.
7. **A6**: `business-service` `livenessProbe.initialDelaySeconds: 0` (startupProbe yeterli).
8. **R1**: `transformer` ve `business-service` Deployment'larından `resources.limits.cpu` kaldırın.

## Orta Vadeli (1-2 hafta)

- NetworkPolicy default-deny + per-service allow (K8).
- AlertManager + temel SRE alert seti (O2, O3).
- Kafka SASL_SSL + topic ACL (K3).
- PG SSL + pgbackrest + WAL-G yedek (K4, A3).
- Tek namespace'e konsolidasyon + standart label seti (G1, G5).
- Image tag immutability + cosign imza (K9).

## Uzun Vadeli

- Helm chart veya tek bir kustomize base/overlay yapısı; `production/` ve `docker/` arasındaki drift'i ortadan kaldır (G6).
- GitOps (ArgoCD/Flux) ile `deploy-k8s.sh` yerine declarative sync.
- pg_partman + WAL archiving + PITR.
- OpenTelemetry Collector deployment + tracing backend (Tempo/Jaeger).
