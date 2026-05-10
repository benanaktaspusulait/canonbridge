# Kubernetes Deployment Guide

## 🎯 Overview

Complete Kubernetes deployment configuration for the CanonBridge platform with multi-service orchestration, networking, storage, and monitoring.

## 🏗️ Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Ingress Controller (Nginx)              │  │
│  │  - TLS termination                                   │  │
│  │  - Request routing                                   │  │
│  │  - Rate limiting                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Gateway Service                     │  │
│  │  - Kong / Nginx                                      │  │
│  │  - Authentication                                    │  │
│  │  - Authorization                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Application Services                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  Frontend    │  │  Forms       │                │  │
│  │  │  (React)     │  │  (Angular)   │                │  │
│  │  │  Deployment  │  │  Deployment  │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │ Transformer  │  │  Business    │                │  │
│  │  │ (Node.js)    │  │  Service     │                │  │
│  │  │ Deployment   │  │  (Java)      │                │  │
│  │  │              │  │  Deployment  │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Infrastructure Services                 │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │  PostgreSQL  │  │   Kafka      │                │  │
│  │  │  StatefulSet │  │  StatefulSet │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   Redis      │  │  Prometheus  │                │  │
│  │  │  StatefulSet │  │  Deployment  │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   Grafana    │  │   Jaeger     │                │  │
│  │  │  Deployment  │  │  Deployment  │                │  │
│  │  └──────────────┘  └──────────────┘                │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
k8s/
├── namespace/
│   └── namespace.yaml
├── configmaps/
│   ├── app-config.yaml
│   ├── kafka-config.yaml
│   └── prometheus-config.yaml
├── secrets/
│   ├── database-secrets.yaml
│   ├── kafka-secrets.yaml
│   └── tls-secrets.yaml
├── storage/
│   ├── pvc-postgres.yaml
│   ├── pvc-kafka.yaml
│   └── pvc-redis.yaml
├── services/
│   ├── frontend-service.yaml
│   ├── forms-service.yaml
│   ├── transformer-service.yaml
│   ├── business-service.yaml
│   ├── postgres-service.yaml
│   ├── kafka-service.yaml
│   └── redis-service.yaml
├── deployments/
│   ├── frontend-deployment.yaml
│   ├── forms-deployment.yaml
│   ├── transformer-deployment.yaml
│   ├── business-deployment.yaml
│   ├── prometheus-deployment.yaml
│   ├── grafana-deployment.yaml
│   └── jaeger-deployment.yaml
├── statefulsets/
│   ├── postgres-statefulset.yaml
│   ├── kafka-statefulset.yaml
│   └── redis-statefulset.yaml
├── ingress/
│   └── ingress.yaml
├── hpa/
│   ├── transformer-hpa.yaml
│   └── business-hpa.yaml
├── rbac/
│   ├── serviceaccount.yaml
│   ├── role.yaml
│   └── rolebinding.yaml
└── kustomization.yaml
```

## 🔧 Core Manifests

### 1. Namespace

```yaml
# k8s/namespace/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: etl-solutions
  labels:
    name: etl-solutions
    environment: production
```

### 2. ConfigMap - Application Configuration

```yaml
# k8s/configmaps/app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: etl-solutions
data:
  LOG_LEVEL: "info"
  NODE_ENV: "production"
  SERVICE_PORT: "3000"
  METRICS_PORT: "9090"
  WORKER_POOL_SIZE: "4"
  KAFKA_AUTO_COMMIT: "false"
  OTEL_ENABLED: "true"
```

### 3. Secret - Database Credentials

```yaml
# k8s/secrets/database-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secrets
  namespace: etl-solutions
type: Opaque
stringData:
  POSTGRES_USER: etluser
  POSTGRES_PASSWORD: "your-secure-password-here"
  POSTGRES_DB: etldb
  DATABASE_URL: "postgresql://etluser:your-secure-password-here@postgres-service:5432/etldb"
```

### 4. PersistentVolumeClaim - PostgreSQL

```yaml
# k8s/storage/pvc-postgres.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: etl-solutions
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 50Gi
```

### 5. Service - PostgreSQL

```yaml
# k8s/services/postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: etl-solutions
  labels:
    app: postgres
spec:
  type: ClusterIP
  clusterIP: None  # Headless service for StatefulSet
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
      protocol: TCP
```

### 6. StatefulSet - PostgreSQL

```yaml
# k8s/statefulsets/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: etl-solutions
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: POSTGRES_PASSWORD
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: POSTGRES_DB
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U $POSTGRES_USER
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U $POSTGRES_USER
          initialDelaySeconds: 5
          periodSeconds: 10
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: standard
      resources:
        requests:
          storage: 50Gi
```

### 7. Deployment - Transformer Service (Node.js)

```yaml
# k8s/deployments/transformer-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: transformer
  namespace: etl-solutions
  labels:
    app: transformer
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: transformer
  template:
    metadata:
      labels:
        app: transformer
        version: v1
    spec:
      serviceAccountName: etl-solutions-service-account
      containers:
      - name: transformer
        image: etl-transformer:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        - name: KAFKA_BROKERS
          value: "kafka-service:9092"
        - name: KAFKA_INPUT_TOPIC
          value: "partner.raw.events"
        - name: KAFKA_OUTPUT_TOPIC
          value: "canonical.events"
        - name: KAFKA_DLQ_TOPIC
          value: "transformation.dlq"
        - name: WORKER_POOL_SIZE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: WORKER_POOL_SIZE
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://jaeger-service:4317"
        volumeMounts:
        - name: partner-configs
          mountPath: /app/partners
          readOnly: true
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
      volumes:
      - name: partner-configs
        configMap:
          name: partner-configs
```

### 8. Deployment - Business Service (Java)

```yaml
# k8s/deployments/business-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: business-service
  namespace: etl-solutions
  labels:
    app: business-service
    version: v1
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: business-service
  template:
    metadata:
      labels:
        app: business-service
        version: v1
    spec:
      serviceAccountName: etl-solutions-service-account
      containers:
      - name: business-service
        image: etl-business-service:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: QUARKUS_DATASOURCE_JDBC_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: DATABASE_URL
        - name: QUARKUS_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: POSTGRES_USER
        - name: QUARKUS_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: POSTGRES_PASSWORD
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-service:9092"
        - name: QUARKUS_LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        - name: QUARKUS_OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://jaeger-service:4317"
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 40
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
```

### 9. Service - Transformer

```yaml
# k8s/services/transformer-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: transformer-service
  namespace: etl-solutions
  labels:
    app: transformer
spec:
  type: ClusterIP
  selector:
    app: transformer
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
    name: http
  - port: 9090
    targetPort: 9090
    protocol: TCP
    name: metrics
```

### 10. HorizontalPodAutoscaler - Transformer

```yaml
# k8s/hpa/transformer-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: transformer-hpa
  namespace: etl-solutions
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: transformer
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

### 11. Ingress

```yaml
# k8s/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: etl-solutions-ingress
  namespace: etl-solutions
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.etl-solutions.example.com
    secretName: etl-solutions-tls-cert
  rules:
  - host: app.etl-solutions.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
      - path: /api/forms
        pathType: Prefix
        backend:
          service:
            name: forms-service
            port:
              number: 4200
      - path: /api/transform
        pathType: Prefix
        backend:
          service:
            name: transformer-service
            port:
              number: 3000
      - path: /api/business
        pathType: Prefix
        backend:
          service:
            name: business-service
            port:
              number: 8080
      - path: /metrics
        pathType: Prefix
        backend:
          service:
            name: prometheus-service
            port:
              number: 9090
      - path: /grafana
        pathType: Prefix
        backend:
          service:
            name: grafana-service
            port:
              number: 3000
```

### 12. RBAC - ServiceAccount

```yaml
# k8s/rbac/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: etl-solutions-service-account
  namespace: etl-solutions
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: etl-solutions-role
  namespace: etl-solutions
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: etl-solutions-rolebinding
  namespace: etl-solutions
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: etl-solutions-role
subjects:
- kind: ServiceAccount
  name: etl-solutions-service-account
  namespace: etl-solutions
```

## 🚀 Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace/namespace.yaml
```

### 2. Create Secrets

```bash
kubectl apply -f k8s/secrets/database-secrets.yaml
kubectl apply -f k8s/secrets/kafka-secrets.yaml
```

### 3. Create ConfigMaps

```bash
kubectl apply -f k8s/configmaps/app-config.yaml
kubectl apply -f k8s/configmaps/kafka-config.yaml
```

### 4. Create Storage

```bash
kubectl apply -f k8s/storage/
```

### 5. Create RBAC

```bash
kubectl apply -f k8s/rbac/
```

### 6. Deploy Infrastructure Services

```bash
# PostgreSQL
kubectl apply -f k8s/statefulsets/postgres-statefulset.yaml
kubectl apply -f k8s/services/postgres-service.yaml

# Kafka
kubectl apply -f k8s/statefulsets/kafka-statefulset.yaml
kubectl apply -f k8s/services/kafka-service.yaml

# Redis
kubectl apply -f k8s/statefulsets/redis-statefulset.yaml
kubectl apply -f k8s/services/redis-service.yaml
```

### 7. Deploy Application Services

```bash
# Transformer
kubectl apply -f k8s/deployments/transformer-deployment.yaml
kubectl apply -f k8s/services/transformer-service.yaml
kubectl apply -f k8s/hpa/transformer-hpa.yaml

# Business Service
kubectl apply -f k8s/deployments/business-deployment.yaml
kubectl apply -f k8s/services/business-service.yaml
kubectl apply -f k8s/hpa/business-hpa.yaml

# Frontend
kubectl apply -f k8s/deployments/frontend-deployment.yaml
kubectl apply -f k8s/services/frontend-service.yaml

# Forms
kubectl apply -f k8s/deployments/forms-deployment.yaml
kubectl apply -f k8s/services/forms-service.yaml
```

### 8. Deploy Monitoring

```bash
kubectl apply -f k8s/deployments/prometheus-deployment.yaml
kubectl apply -f k8s/deployments/grafana-deployment.yaml
kubectl apply -f k8s/deployments/jaeger-deployment.yaml
```

### 9. Deploy Ingress

```bash
kubectl apply -f k8s/ingress/ingress.yaml
```

## 📊 Verification

```bash
# Check namespace
kubectl get namespace etl-solutions

# Check pods
kubectl get pods -n etl-solutions

# Check services
kubectl get svc -n etl-solutions

# Check deployments
kubectl get deployments -n etl-solutions

# Check statefulsets
kubectl get statefulsets -n etl-solutions

# Check HPA status
kubectl get hpa -n etl-solutions

# View pod logs
kubectl logs -n etl-solutions -l app=transformer -f

# Port forward to access services
kubectl port-forward -n etl-solutions svc/grafana-service 3000:3000
kubectl port-forward -n etl-solutions svc/prometheus-service 9090:9090
```

## 🔄 Scaling

### Manual Scaling

```bash
# Scale transformer deployment
kubectl scale deployment transformer -n etl-solutions --replicas=5

# Scale business service
kubectl scale deployment business-service -n etl-solutions --replicas=4
```

### Auto-Scaling

HPA is configured to automatically scale based on CPU and memory metrics. Monitor with:

```bash
kubectl get hpa -n etl-solutions -w
```

## 🔐 Security Best Practices

1. **Network Policies**: Restrict traffic between pods
2. **Pod Security Policies**: Enforce security standards
3. **RBAC**: Limit service account permissions
4. **Secrets Management**: Use external secret management (Vault)
5. **Image Scanning**: Scan container images for vulnerabilities
6. **Resource Limits**: Set CPU/memory limits
7. **Health Checks**: Configure liveness and readiness probes

## 📋 Implementation Checklist

- [ ] Kubernetes cluster setup
- [ ] Namespace creation
- [ ] Secrets configuration
- [ ] ConfigMaps setup
- [ ] Storage provisioning
- [ ] PostgreSQL deployment
- [ ] Kafka deployment
- [ ] Redis deployment
- [ ] Transformer deployment
- [ ] Business service deployment
- [ ] Frontend deployment
- [ ] Forms deployment
- [ ] Prometheus deployment
- [ ] Grafana deployment
- [ ] Jaeger deployment
- [ ] Ingress configuration
- [ ] HPA configuration
- [ ] RBAC setup
- [ ] Network policies
- [ ] Monitoring verification

---

**See Also**: [Tech Stack](../architecture/tech-stack.md), [Deployment Checklist](./01-deployment-checklist.md)
