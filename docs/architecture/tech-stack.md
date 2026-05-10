# CanonBridge - Final Tech Stack

## 🎯 Confirmed Technology Stack

### **Frontend Layer**
```
┌─────────────────────────────────────────┐
│         Frontend (Node.js + React)      │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   React 18   │  │   Vite 4     │   │
│  │   TypeScript │  │   Build Tool │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Redux      │  │   Material   │   │
│  │   Toolkit    │  │   UI         │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Language: TypeScript 5.x
- Framework: React 18.x
- Build: Vite 4.x
- State: Redux Toolkit 1.x
- UI: Material-UI 5.x
- HTTP: Axios 1.x
- Testing: Vitest + Cypress

**Purpose:**
- Dashboard and monitoring
- Partner management
- Mapping visualization
- Configuration UI
- Real-time metrics

---

### **Mapping Studio UI (Angular)**
```
┌─────────────────────────────────────────┐
│    Mapping Studio UI (Angular)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Angular 17  │  │  TypeScript  │   │
│  │  Framework   │  │  5.x         │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Reactive    │  │  Angular     │   │
│  │  Forms       │  │  Material    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  RxJS        │  │  Validators  │   │
│  │  Observables │  │  & Guards    │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Framework: Angular 17.x
- Language: TypeScript 5.x
- Forms: Reactive Forms
- UI: Angular Material
- State: NgRx (optional)
- HTTP: HttpClient
- Testing: Jasmine + Karma

**Purpose:**
- **No-code visual mapping** - Users don't need to know JSONata
- Sample JSON upload and structure exploration
- Visual field mapping with drag-and-drop
- Automatic JSONata generation from visual mappings
- Live transformation preview
- Partner onboarding forms
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
│  │   18+        │  │   4.x        │   │
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
- Runtime: Node.js 18+
- Framework: Fastify 4.x
- Transformation: JSONata 2.x
- Validation: Ajv 8.x
- Messaging: KafkaJS 2.x
- Logging: Pino 8.x
- Testing: Jest 29.x

**Purpose:**
- Partner event consumption
- JSONata transformation
- Schema validation
- Kafka producer/consumer
- Error handling & DLQ

---

### **Business Services Layer**
```
┌─────────────────────────────────────────┐
│   Business Services (Java 21 + Quarkus) │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Java 21    │  │   Quarkus    │   │
│  │   LTS        │  │   3.x        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Spring     │  │   Hibernate  │   │
│  │   Boot 3.x   │  │   ORM        │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   Kafka      │  │   PostgreSQL │   │
│  │   Streams    │  │   Driver     │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Stack:**
- Language: Java 21 (LTS)
- Framework: Quarkus 3.x
- Spring: Spring Boot 3.x
- ORM: Hibernate 6.x
- Messaging: Kafka Streams
- Database: PostgreSQL JDBC
- Validation: Jakarta Bean Validation
- Testing: JUnit 5 + Testcontainers

**Purpose:**
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
| **Frontend** | React | 18.x | Dashboard, monitoring |
| **Frontend** | TypeScript | 5.x | Type safety |
| **Frontend** | Vite | 4.x | Build tool |
| **Frontend** | Material-UI | 5.x | UI components |
| **Mapping Studio** | Angular | 17.x | No-code visual mapping |
| **Mapping Studio** | Reactive Forms | Latest | Form handling |
| **Mapping Studio** | Angular Material | Latest | UI components |
| **Transformation** | Node.js | 18+ | Runtime |
| **Transformation** | Fastify | 4.x | HTTP framework |
| **Transformation** | JSONata | 2.x | Data transformation |
| **Transformation** | Ajv | 8.x | Schema validation |
| **Transformation** | KafkaJS | 2.x | Kafka client |
| **Services** | Java | 21 LTS | Language |
| **Services** | Quarkus | 3.x | Framework |
| **Services** | Spring Boot | 3.x | Spring integration |
| **Services** | Hibernate | 6.x | ORM |
| **Services** | Kafka Streams | Latest | Stream processing |
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
│  │  React Dashboard     │  │  Mapping Studio UI   │        │
│  │  (Node.js + React)   │  │  (Angular 17)        │        │
│  │  - Monitoring        │  │  - No-code mapping   │        │
│  │  - Partner mgmt      │  │  - Visual builder    │        │
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
│  │  Transformer Service │  │  Business Service    │        │
│  │  (Node.js + Fastify) │  │  (Java 21 + Quarkus) │        │
│  │  - JSONata           │  │  - Business Logic    │        │
│  │  - Ajv Validation    │  │  - Idempotency       │        │
│  │  - Kafka Consumer    │  │  - Outbox Pattern    │        │
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

### Frontend (React + Node.js)
- [ ] React 18 project setup
- [ ] TypeScript configuration
- [ ] Vite build configuration
- [ ] Redux Toolkit setup
- [ ] Material-UI integration
- [ ] API client (Axios)
- [ ] Authentication integration
- [ ] Dashboard components
- [ ] Real-time metrics display
- [ ] Partner management UI

### Mapping Studio UI (Angular)
- [ ] Angular 17 project setup
- [ ] TypeScript configuration
- [ ] Reactive Forms setup
- [ ] Angular Material integration
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
- [ ] Node.js 18+ setup
- [ ] Fastify framework setup
- [ ] TypeScript configuration
- [ ] JSONata integration
- [ ] Ajv schema validation
- [ ] KafkaJS consumer setup
- [ ] KafkaJS producer setup
- [ ] Error handling
- [ ] Logging (Pino)
- [ ] Health checks

### Business Services (Java 21 + Quarkus)
- [ ] Java 21 setup
- [ ] Quarkus project creation
- [ ] Spring Boot integration
- [ ] Hibernate ORM setup
- [ ] PostgreSQL driver
- [ ] Kafka Streams setup
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
