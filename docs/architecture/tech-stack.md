# CanonBridge - Final Tech Stack

## 🎯 Confirmed Technology Stack

### **Client Layer**
```
┌─────────────────────────────────────────┐
│    Mapping Studio UI (Angular)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Angular 21   │  │ TypeScript   │   │
│  │ Framework    │  │ 5.9          │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ PrimeNG 21   │  │ Angular CDK  │   │
│  │ Components   │  │ Drag/Drop    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Framework: Angular 21.x
- Language: TypeScript 5.9.x
- UI: PrimeNG 21.x + PrimeFlex + PrimeIcons
- Interaction: Angular CDK drag-and-drop
- Forms: Angular Reactive Forms
- Client validation: Ajv + ajv-formats
- Expression preview: JSONata 2.x and highlight.js
- Testing: Vitest

**Purpose:**
- Single production UI direction for Mapping Studio and admin/demo screens
- **No-code visual mapping** - Users don't need to know JSONata
- Sample JSON upload and structure exploration
- Visual field mapping with drag-and-drop
- Automatic JSONata generation from visual mappings
- Live transformation preview
- Partner onboarding forms
- External Systems, DLQ, Monitoring, and Settings screens
- Schema management
- Fixture creation and validation testing
- Mapping version publish workflow

---

### **Transformation Layer**
```
┌─────────────────────────────────────────┐
│   Transformation (Node.js + JSONata)    │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Node.js    │  │   Fastify    │   │
│  │   20+        │  │   5.x        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   JSONata    │  │   Ajv        │   │
│  │   2.x        │  │   8.x        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   KafkaJS    │  │   Pino       │   │
│  │   2.x        │  │   8.x        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Language: TypeScript 5.x
- Runtime: Node.js 20+
- Framework: Fastify 5.x
- Transformation: JSONata 2.x
- Validation: Ajv 8.x
- Messaging: KafkaJS 2.x
- Cache/DB clients: ioredis, pg
- Logging: Pino 9.x
- Testing: Vitest

**Purpose:**
- Partner event consumption
- JSONata transformation
- Schema validation
- Kafka producer/consumer
- Error handling & DLQ
- Internal dry-run transform API

---

### **Backend Management and Runtime Services**
```
┌─────────────────────────────────────────┐
│ Backend Services (Java 21 + Quarkus)    │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Java 21    │  │   Quarkus    │   │
│  │   LTS        │  │   3.x        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Hibernate    │  │ RESTEasy /   │   │
│  │ ORM/Panache  │  │ Jackson      │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ SmallRye     │  │ PostgreSQL   │   │
│  │ Messaging    │  │ Driver       │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Language: Java 21 (LTS)
- Framework: Quarkus 3.x
- ORM: Hibernate ORM / Panache
- Messaging: SmallRye Reactive Messaging or Kafka client
- Database: PostgreSQL JDBC
- Validation: Jakarta Bean Validation
- Testing: JUnit 5 + Testcontainers

**Purpose:**
- Mapping Studio API for drafts, schemas, mappings, fixtures, publish gates, and audit
- Outbound call manager for REST/SOAP calls, credential use, retry, masking, and call history
- Webhook receiver and scheduled poller for non-Kafka source triggers
- Credential Store metadata and encrypted secret persistence
- Canonical event consumption
- Business logic processing
- Idempotency management
- Database transactions
- Outbox pattern implementation

---

### **Infrastructure & Data**
```
┌─────────────────────────────────────────┐
│      Infrastructure & Data Layer        │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Kafka 3.x  │  │  PostgreSQL  │   │
│  │   Cluster    │  │   14+        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Redis 7.x  │  │   S3/MinIO   │   │
│  │   Cache      │  │   Storage    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Prometheus  │  │   Grafana    │   │
│  │   Metrics    │  │   Dashboard  │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Message Queue: Kafka 3.x
- Database: PostgreSQL 14+
- Cache: Redis 7.x
- Storage: S3 / MinIO
- Metrics: Prometheus
- Visualization: Grafana
- Tracing: Jaeger
- Logging: ELK Stack / Loki

---

### **DevOps & Deployment**
```
┌─────────────────────────────────────────┐
│      DevOps & Deployment                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Docker     │  │  Kubernetes  │   │
│  │   Latest     │  │   1.27+      │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Terraform  │  │   GitHub     │   │
│  │   1.x        │  │   Actions    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Helm       │  │   ArgoCD     │   │
│  │   Charts     │  │   GitOps     │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Container: Docker
- Orchestration: Kubernetes 1.27+
- IaC: Terraform 1.x
- Package Manager: Helm
- GitOps: ArgoCD
- CI/CD: GitHub Actions
- Secret Management: Vault
- API Gateway: Kong / Nginx

---

## 📊 Technology Matrix

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Client** | Angular | 21.x | Mapping Studio and admin UI |
| **Client** | TypeScript | 5.9.x | Type safety |
| **Client** | PrimeNG | 21.x | UI components |
| **Client** | Angular CDK | 21.x | Drag/drop and interaction utilities |
| **Client** | Ajv | 8.x | Client-side schema validation preview |
| **Transformation** | Node.js | 20+ | Runtime |
| **Transformation** | Fastify | 5.x | HTTP framework |
| **Transformation** | JSONata | 2.x | Data transformation |
| **Transformation** | Ajv | 8.x | Schema validation |
| **Transformation** | KafkaJS | 2.x | Kafka client |
| **Services** | Java | 21 LTS | Language |
| **Services** | Quarkus | 3.x | Framework |
| **Services** | Hibernate | 6.x | ORM |
| **Services** | SmallRye Messaging / Kafka client | Latest | Kafka integration |
| **Data** | PostgreSQL | 14+ | Database |
| **Data** | Kafka | 3.x | Message queue |
| **Data** | Redis | 7.x | Cache |
| **Monitoring** | Prometheus | Latest | Metrics |
| **Monitoring** | Grafana | Latest | Visualization |
| **Monitoring** | Jaeger | Latest | Tracing |
| **DevOps** | Docker | Latest | Containerization |
| **DevOps** | Kubernetes | 1.27+ | Orchestration |
| **DevOps** | Terraform | 1.x | IaC |
| **DevOps** | GitHub Actions | Latest | CI/CD |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Mapping Studio UI   │  │  Admin Screens       │        │
│  │  (Angular 21)        │  │  (Angular 21)        │        │
│  │  - No-code mapping   │  │  - Partners/DLQ      │        │
│  │  - Visual builder    │  │  - External systems  │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway / Load Balancer                │
├─────────────────────────────────────────────────────────────┤
│  Kong / Nginx - TLS, Rate Limiting, Authentication         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Transformer Service │  │  Mapping Studio API  │        │
│  │  (Node.js + Fastify) │  │  (Java 21 + Quarkus) │        │
│  │  - JSONata / Ajv     │  │  - Drafts / publish  │        │
│  │  - Kafka / dry-run   │  │  - Credentials meta  │        │
│  │  - Retry / DLQ       │  │  - Audit             │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Outbound Manager     │  │ Business / Outbox    │        │
│  │ (Java 21 + Quarkus)  │  │ (Java 21 + Quarkus)  │        │
│  │ - REST/SOAP calls    │  │ - Business logic     │        │
│  │ - Credential use     │  │ - Idempotency        │        │
│  │ - Call history       │  │ - Outbox pattern     │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Infrastructure Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Kafka 3.x  │  │ PostgreSQL   │  │   Redis 7.x  │     │
│  │   Cluster    │  │   14+        │  │   Cache      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Prometheus   │  │   Grafana    │  │   Jaeger     │     │
│  │   Metrics    │  │   Dashboard  │  │   Tracing    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            Deployment Layer (Kubernetes)                    │
├─────────────────────────────────────────────────────────────┤
│  Docker Containers → Kubernetes Pods → Services            │
│  Terraform IaC → GitHub Actions CI/CD → ArgoCD GitOps      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Checklist

### Mapping Studio UI (Angular)
- [x] Angular 21 project setup
- [ ] TypeScript configuration
- [ ] Reactive Forms setup
- [x] PrimeNG integration
- [ ] Sample JSON upload/paste form
- [ ] JSON structure explorer
- [ ] Visual field mapping (drag-and-drop)
- [ ] Automatic JSONata generation
- [ ] Live transformation preview
- [ ] Fixture creation and validation testing
- [ ] Mapping version publish workflow
- [ ] Partner onboarding forms
- [ ] Schema management forms
- [ ] Advanced validation
- [ ] Error handling

### Transformation (Node.js + Fastify)
- [x] Node.js 20+ setup
- [x] Fastify framework setup
- [ ] TypeScript configuration
- [ ] JSONata integration
- [ ] Ajv schema validation
- [ ] KafkaJS consumer setup
- [ ] KafkaJS producer setup
- [ ] Error handling
- [ ] Logging (Pino)
- [ ] Health checks

### Mapping Studio API and Runtime Services (Java 21 + Quarkus)
- [ ] Java 21 setup
- [ ] Quarkus project creation
- [ ] Mapping Studio API endpoints
- [ ] Credential metadata and encrypted secret persistence
- [ ] Outbound call manager REST/SOAP execution
- [ ] Webhook receiver
- [ ] Scheduled poller
- [ ] Hibernate ORM setup
- [ ] PostgreSQL driver
- [ ] Kafka integration
- [ ] Transaction management
- [ ] Idempotency logic
- [ ] Outbox pattern
- [ ] Business logic

### Infrastructure
- [ ] PostgreSQL 14+ setup
- [ ] Kafka 3.x cluster setup
- [ ] Redis 7.x setup
- [ ] Prometheus setup
- [ ] Grafana setup
- [ ] Jaeger setup
- [ ] Docker configuration
- [ ] Kubernetes manifests
- [ ] Terraform IaC
- [ ] GitHub Actions workflows

---

## 🚀 Development Workflow

### Local Development

```bash
# Frontend (React)
cd frontend
npm install
npm run dev

# Mapping Studio UI (Angular)
cd mapping-studio-ui
npm install
ng serve

# Transformer (Node.js)
cd transformer
npm install
npm run dev

# Business Service (Java)
cd business-service
mvn quarkus:dev

# Infrastructure
docker-compose up -d
```

### Build & Deploy

```bash
# Build Docker images
docker build -t etl-transformer:latest ./transformer
docker build -t etl-business:latest ./business-service
docker build -t etl-frontend:latest ./frontend
docker build -t etl-mapping-studio:latest ./mapping-studio-ui

# Push to registry
docker push etl-transformer:latest
docker push etl-business:latest
docker push etl-frontend:latest
docker push etl-mapping-studio:latest

# Deploy with Kubernetes
kubectl apply -f k8s/

# Or with Terraform + ArgoCD
terraform apply
argocd app create etl-solutions --repo <repo> --path k8s/
```

---

## 📊 Performance Characteristics

| Component | Throughput | Latency | Memory | CPU |
|-----------|-----------|---------|--------|-----|
| React Frontend | N/A | < 100ms | 100-200MB | Low |
| Mapping Studio UI | N/A | < 200ms | 150-300MB | Low |
| Node.js Transformer | 10,000+ msg/sec | < 50ms p99 | 500MB-1GB | Medium |
| Java Services | 5,000+ msg/sec | < 100ms p99 | 1-2GB | Medium-High |
| PostgreSQL | 10,000+ ops/sec | < 10ms | 2-4GB | Medium |
| Kafka | 100,000+ msg/sec | < 5ms | 4-8GB | High |

---

## 🔐 Security Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Transport** | TLS 1.3 | Encryption in transit |
| **API Gateway** | Kong / Nginx | Rate limiting, auth |
| **Authentication** | OAuth 2.0 / OIDC | User authentication |
| **Authorization** | RBAC | Role-based access |
| **Secrets** | HashiCorp Vault | Secret management |
| **Database** | PostgreSQL encryption | Data at rest |
| **Audit** | Structured logging | Audit trails |
| **Monitoring** | Prometheus + Grafana | Security monitoring |

---

## 📈 Scaling Strategy

### Horizontal Scaling
- React Frontend: CDN + multiple instances
- Mapping Studio UI: Multiple instances behind load balancer
- Node.js Transformer: Kubernetes auto-scaling (CPU/Memory)
- Java Services: Kubernetes auto-scaling (CPU/Memory)
- PostgreSQL: Read replicas + connection pooling
- Kafka: Partition scaling + consumer groups
- Redis: Cluster mode

### Vertical Scaling
- Increase pod resources (CPU/Memory)
- Increase database resources
- Increase Kafka broker resources
- Increase Redis memory

---

## 🎯 Next Steps

1. **Setup Development Environment**
   - Install Node.js 18+
   - Install Java 21
   - Install Docker & Kubernetes
   - Clone repositories

2. **Initialize Projects**
   - Create React project
   - Create Angular Mapping Studio project
   - Create Node.js Fastify project
   - Create Java Quarkus project

3. **Configure Infrastructure**
   - Set up PostgreSQL
   - Set up Kafka
   - Set up Redis
   - Set up monitoring

4. **Implement Services**
   - Frontend dashboard
   - Mapping Studio UI (no-code visual mapping)
   - Transformer service
   - Business service

5. **Deploy & Test**
   - Docker containerization
   - Kubernetes deployment
   - Integration testing
   - Load testing

---

**Status**: ✅ Tech Stack Finalized
**Last Updated**: May 10, 2026
**Version**: 1.0

**Start Implementation**: Follow the checklist above
