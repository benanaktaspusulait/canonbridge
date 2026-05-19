# Transformer Kubernetes Manifests

Production-ready Kubernetes manifests for the CanonBridge Transformer service.

## Prerequisites

- Kubernetes 1.24+
- kubectl configured
- Kafka cluster accessible from the cluster
- (Optional) Prometheus Operator for ServiceMonitor

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Configure Secrets

**Option A: From file (recommended for production)**

```bash
kubectl create secret generic transformer-secret \
  --from-literal=API_KEY=your-secure-api-key-here \
  --from-literal=KAFKA_SASL_USERNAME=your-kafka-username \
  --from-literal=KAFKA_SASL_PASSWORD=your-kafka-password \
  -n canonbridge
```

**Option B: Apply the example secret (dev only)**

```bash
# Edit secret.yaml first to set your values
kubectl apply -f secret.yaml
```

### 3. Update ConfigMap

Edit `configmap.yaml` to match your environment:

- `KAFKA_BROKERS`: Your Kafka broker addresses
- `KAFKA_SSL_ENABLED`: Set to `"true"` for production
- `KAFKA_SASL_MECHANISM`: Set to `scram-sha-512` for production
- `CORS_ORIGINS`: Comma-separated allowed origins

### 4. Deploy

**Option A: Using kubectl**

```bash
kubectl apply -f .
```

**Option B: Using kustomize**

```bash
kubectl apply -k .
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n canonbridge -l app=transformer

# Check service
kubectl get svc -n canonbridge transformer

# Check HPA
kubectl get hpa -n canonbridge transformer-hpa

# View logs
kubectl logs -n canonbridge -l app=transformer --tail=100 -f
```

## Manifests Overview

| File | Description |
|------|-------------|
| `namespace.yaml` | Creates `canonbridge` namespace |
| `configmap.yaml` | Environment configuration (non-sensitive) |
| `secret.yaml` | Sensitive configuration (API keys, passwords) |
| `deployment.yaml` | Main deployment with 3 replicas, health checks, resource limits |
| `service.yaml` | ClusterIP service + headless service |
| `hpa.yaml` | Horizontal Pod Autoscaler (3-20 replicas based on CPU/memory) |
| `poddisruptionbudget.yaml` | Ensures minimum 2 pods during disruptions |
| `servicemonitor.yaml` | Prometheus Operator integration for metrics |
| `kustomization.yaml` | Kustomize configuration for overlays |

## Configuration

### Environment Variables

All environment variables are defined in `configmap.yaml` and `secret.yaml`. See the transformer [README.md](../../../services/transformer/README.md) for the service-level configuration list.

### Resource Limits

Default resource allocation per pod:

- **Requests:** 250m CPU, 512Mi memory
- **Limits:** 1000m CPU, 1Gi memory

Adjust in `deployment.yaml` based on your workload.

### Scaling

**Manual scaling:**

```bash
kubectl scale deployment transformer -n canonbridge --replicas=5
```

**Autoscaling (HPA):**

- Min replicas: 3
- Max replicas: 20
- Target CPU: 70%
- Target Memory: 80%

Edit `hpa.yaml` to adjust thresholds.

## Health Checks

The deployment includes three types of probes:

- **Liveness:** Restarts pod if unhealthy (checks `/health`)
- **Readiness:** Removes pod from service if not ready (checks `/health`)
- **Startup:** Allows 150s for initial startup (30 failures × 5s)

## Monitoring

### Prometheus Metrics

Metrics are exposed at `GET /metrics` on port 8080.

**With Prometheus Operator:**

```bash
kubectl apply -f servicemonitor.yaml
```

**Manual Prometheus scrape config:**

```yaml
- job_name: 'transformer'
  kubernetes_sd_configs:
    - role: pod
      namespaces:
        names:
          - canonbridge
  relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      action: keep
      regex: transformer
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
      action: replace
      target_label: __metrics_path__
      regex: (.+)
    - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
      action: replace
      regex: ([^:]+)(?::\d+)?;(\d+)
      replacement: $1:$2
      target_label: __address__
```

### Key Metrics

- `transform_requests_total{status, stage, partner, event_type}` - Transform request counter
- `transform_duration_ms{partner, event_type}` - Transform duration histogram
- `kafka_messages_total{result}` - Kafka message counter (ok/dlq/skip)
- `transform_engine_cache_size` - Compiled mapping cache size
- `partner_registry_size` - Number of loaded partner configs

## Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod -n canonbridge -l app=transformer

# Check logs
kubectl logs -n canonbridge -l app=transformer --tail=100
```

Common issues:
- Missing secrets (API_KEY, Kafka credentials)
- Kafka connection failure (check KAFKA_BROKERS)
- Missing mappings volume

### High memory usage

Increase memory limits in `deployment.yaml`:

```yaml
resources:
  limits:
    memory: "2Gi"  # Increase from 1Gi
```

### Kafka connection issues

1. Verify Kafka brokers are accessible:

```bash
kubectl run -it --rm debug --image=busybox --restart=Never -n canonbridge -- \
  nc -zv kafka-service.canonbridge.svc.cluster.local 9092
```

2. Check SSL/SASL configuration in `configmap.yaml`
3. Verify secrets contain correct Kafka credentials

### Slow startup

Increase startup probe failure threshold in `deployment.yaml`:

```yaml
startupProbe:
  failureThreshold: 60  # Increase from 30
```

## Production Checklist

- [ ] Set strong `API_KEY` in secret
- [ ] Configure Kafka SSL/SASL credentials
- [ ] Set `KAFKA_SSL_ENABLED=true` in configmap
- [ ] Configure CORS origins in configmap
- [ ] Adjust resource limits based on load testing
- [ ] Set up Prometheus monitoring
- [ ] Configure log aggregation (e.g., Loki, ELK)
- [ ] Set up alerts for pod failures, high error rates
- [ ] Test rolling updates and rollbacks
- [ ] Verify PodDisruptionBudget during node drains
- [ ] Document runbook for common issues

## Updating

### Rolling Update

```bash
# Update image tag
kubectl set image deployment/transformer \
  transformer=canonbridge/transformer:v1.2.3 \
  -n canonbridge

# Watch rollout
kubectl rollout status deployment/transformer -n canonbridge
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/transformer -n canonbridge

# Rollback to specific revision
kubectl rollout undo deployment/transformer --to-revision=2 -n canonbridge
```

### Config Changes

After updating `configmap.yaml` or `secret.yaml`:

```bash
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Restart pods to pick up new config
kubectl rollout restart deployment/transformer -n canonbridge
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f .

# Or using kustomize
kubectl delete -k .

# Delete namespace (removes everything)
kubectl delete namespace canonbridge
```
