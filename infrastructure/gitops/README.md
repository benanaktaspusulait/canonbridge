# GitOps - ArgoCD Configuration

Bu klasör ArgoCD ile declarative GitOps sync için gerekli manifest'leri içerir.

## Kurulum

1. ArgoCD'yi cluster'a kurun:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

2. Project ve Application manifest'lerini uygulayın:
```bash
kubectl apply -f infrastructure/gitops/argocd-project.yaml
kubectl apply -f infrastructure/gitops/argocd-application.yaml
```

## Nasıl Çalışır

- ArgoCD `main` branch'indeki `infrastructure/k8s/` klasörünü izler
- Değişiklikler otomatik olarak cluster'a sync edilir (`automated.selfHeal: true`)
- HPA tarafından yönetilen replica sayıları ignore edilir
- Prune policy ile artık kullanılmayan kaynaklar otomatik silinir

## Image Signing (cosign)

Production image'ları cosign ile imzalanmalıdır:

```bash
# Image imzalama
cosign sign --key cosign.key canonbridge/transformer:v1.0.0
cosign sign --key cosign.key canonbridge/business-service:v1.0.0

# Image doğrulama
cosign verify --key cosign.pub canonbridge/transformer:v1.0.0
```

Kyverno veya OPA Gatekeeper ile cluster'da imza doğrulaması zorunlu kılınabilir.
