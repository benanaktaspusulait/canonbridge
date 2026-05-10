# Kubernetes Manifests

## Purpose

This document lists the Kubernetes resources expected for CanonBridge. Full examples live in [Kubernetes Deployment Guide](./KUBERNETES_DEPLOYMENT_GUIDE.md).

## Required Resources

- Namespace: `etl-solutions`
- ConfigMaps for non-secret config.
- Secrets for credentials and tokens.
- Deployments for transformer, business service, Mapping Studio/frontend, and outbox publisher.
- StatefulSets or managed services for Kafka, PostgreSQL, and Redis when not externally managed.
- Services for internal communication.
- Ingress for public UI/API endpoints.
- HorizontalPodAutoscalers for stateless services.
- PodDisruptionBudgets for critical services.
- ServiceAccounts and RBAC.
- PersistentVolumeClaims for stateful components.

## Manifest Rules

- Set resource requests and limits.
- Define readiness, liveness, and startup probes.
- Use rolling update strategy for stateless services.
- Keep secrets out of Git.
- Label resources with `app`, `component`, `tenant` where relevant.
- Keep environment-specific values in overlays or Helm values.

## Minimum Deployment Probe Example

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 20
```

## See Also

- [Kubernetes Deployment Guide](./KUBERNETES_DEPLOYMENT_GUIDE.md)
- [Health Checks](../implementation/07-health-checks.md)

