# Kubernetes Manifests

This directory contains Kubernetes manifests for deploying CanonBridge to a Kubernetes cluster.

## 📁 Files

| File | Description |
|------|-------------|
| `namespace.yaml` | Namespace definition |
| `configmap.yaml` | Configuration for all services |
| `secrets.yaml` | Secrets (passwords, tokens) |
| `postgres-statefulset.yaml` | PostgreSQL database |
| `kafka-statefulset.yaml` | Kafka cluster (3 brokers) |
| `transformer-deployment.yaml` | Transformer service + HPA |
| `business-service-deployment.yaml` | Business service + HPA |
| `ingress.yaml` | Ingress configuration |
| `monitoring.yaml` | Prometheus, Grafana |

## 🚀 Quick Deploy

### Prerequisites

```bash
# Install kubectl
brew install kubectl  # macOS
# or
apt-get install kubectl  # Ubuntu

# Install helm
brew install helm  # macOS
# or
apt-get install helm  # Ubuntu

# Configure kubectl to connect to your cluster
kubectl config use-context <your-cluster>
```

### Deploy All Services

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Create secrets (UPDATE PASSWORDS FIRST!)
kubectl apply -f secrets.yaml

# 3. Create configmaps
kubectl apply -f configmap.yaml

# 4. Deploy infrastructure
kubectl apply -f postgres-statefulset.yaml
kubectl apply -f kafka-statefulset.yaml

# 5. Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n canonbridge --timeout=300s
kubectl wait --for=condition=ready pod -l app=kafka -n canonbridge --timeout=300s

# 6. Deploy applications
kubectl apply -f transformer-deployment.yaml
kubectl apply -f business-service-deployment.yaml

# 7. Wait for applications to be ready
kubectl wait --for=condition=ready pod -l app=transformer -n canonbridge --timeout=300s
kubectl wait --for=condition=ready pod -l app=business-service -n canonbridge --timeout=300s
```

### Deploy with Script

```bash
# Use the deployment script
../scripts/deploy-k8s.sh
```

## 🔧 Configuration

### Update Secrets

**IMPORTANT**: Update passwords in `secrets.yaml` before deploying to production!

```yaml
# secrets.yaml
stringData:
  POSTGRES_PASSWORD: your-strong-password-here
  REDIS_PASSWORD: your-strong-password-here
  JWT_SECRET: your-strong-secret-here
```

### Update ConfigMaps

Edit `configmap.yaml` to customize service configuration:

```yaml
# configmap.yaml
data:
  WORKER_POOL_SIZE: "8"  # Adjust based on workload
  LOG_LEVEL: "info"      # debug, info, warn, error
```

### Resource Limits

Adjust resource requests/limits based on your workload:

```yaml
# transformer-deployment.yaml
resources:
  requests:
    memory: "2Gi"  # Increase for higher throughput
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

## 📊 Monitoring

### Check Pod Status

```bash
# All pods
kubectl get pods -n canonbridge

# Specific service
kubectl get pods -n canonbridge -l app=transformer

# Watch pods
kubectl get pods -n canonbridge -w
```

### View Logs

```bash
# Transformer logs
kubectl logs -n canonbridge -l app=transformer -f

# Business service logs
kubectl logs -n canonbridge -l app=business-service -f

# Specific pod
kubectl logs -n canonbridge <pod-name> -f
```

### Check Resources

```bash
# Resource usage
kubectl top pods -n canonbridge

# Node usage
kubectl top nodes

# HPA status
kubectl get hpa -n canonbridge
```

## 🔄 Updates

### Rolling Update

```bash
# Update image
kubectl set image deployment/transformer \
  transformer=canonbridge/transformer:v1.2.0 \
  -n canonbridge

# Check rollout status
kubectl rollout status deployment/transformer -n canonbridge

# View rollout history
kubectl rollout history deployment/transformer -n canonbridge
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/transformer -n canonbridge

# Rollback to specific revision
kubectl rollout undo deployment/transformer -n canonbridge --to-revision=2
```

## 🔍 Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n canonbridge

# Check events
kubectl get events -n canonbridge --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n canonbridge --previous
```

### Service Not Accessible

```bash
# Check service
kubectl get svc -n canonbridge

# Check endpoints
kubectl get endpoints -n canonbridge

# Test connectivity
kubectl run test --image=curlimages/curl --rm -i --restart=Never -- \
  curl -v http://transformer-service:3000/health/ready
```

### Database Issues

```bash
# Connect to PostgreSQL
kubectl exec -it postgres-0 -n canonbridge -- \
  psql -U canonbridge_user -d canonbridge_db

# Check database logs
kubectl logs postgres-0 -n canonbridge

# Check PVC
kubectl get pvc -n canonbridge
```

### Kafka Issues

```bash
# List topics
kubectl exec -it kafka-0 -n canonbridge -- \
  kafka-topics --bootstrap-server localhost:9092 --list

# Check consumer groups
kubectl exec -it kafka-0 -n canonbridge -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Check consumer lag
kubectl exec -it kafka-0 -n canonbridge -- \
  kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group transformer-group --describe
```

## 🧹 Cleanup

### Delete All Resources

```bash
# Delete all resources in namespace
kubectl delete namespace canonbridge

# Or delete individually
kubectl delete -f transformer-deployment.yaml
kubectl delete -f business-service-deployment.yaml
kubectl delete -f kafka-statefulset.yaml
kubectl delete -f postgres-statefulset.yaml
kubectl delete -f configmap.yaml
kubectl delete -f secrets.yaml
kubectl delete -f namespace.yaml
```

### Delete PVCs

```bash
# List PVCs
kubectl get pvc -n canonbridge

# Delete specific PVC
kubectl delete pvc <pvc-name> -n canonbridge

# Delete all PVCs
kubectl delete pvc --all -n canonbridge
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Deployment Guide](../docs/deployment/KUBERNETES_DEPLOYMENT_GUIDE.md)
- [Operations Runbook](../docs/operations/08-runbook.md)

## 🔐 Security Best Practices

1. **Never commit secrets to Git**
   - Use Kubernetes Secrets
   - Consider using external secret managers (AWS Secrets Manager, HashiCorp Vault)

2. **Use RBAC**
   - Create service accounts with minimal permissions
   - Use namespaces for isolation

3. **Network Policies**
   - Restrict pod-to-pod communication
   - Use network policies to control traffic

4. **Image Security**
   - Use specific image tags (not `latest`)
   - Scan images for vulnerabilities
   - Use private registries

5. **Resource Limits**
   - Always set resource requests and limits
   - Prevent resource exhaustion

## 📞 Support

For issues or questions:
- Check [Troubleshooting Guide](../docs/operations/03-troubleshooting.md)
- Review [Runbook](../docs/operations/08-runbook.md)
- Open GitHub issue

---

**Last Updated**: May 10, 2026
**Version**: 1.0.0
