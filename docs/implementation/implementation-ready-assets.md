# Implementation-Ready Assets

The `_implementation-ready/` directory contains prepared infrastructure assets that can be used during implementation. These files are intentionally isolated from the root runtime path until the team decides to promote them.

This is not an active application package yet. The repository still needs service source code, package manifests, tests, and release automation before these assets should be treated as production-ready.

## Contents

| Path | Purpose |
|------|---------|
| `_implementation-ready/docker-compose.yml` | Local infrastructure stack |
| `_implementation-ready/.env.example` | Local environment template |
| `_implementation-ready/Makefile` | Convenience commands for local setup |
| `_implementation-ready/docker/` | PostgreSQL, Prometheus, and Grafana assets |
| `_implementation-ready/k8s/` | Kubernetes manifests |
| `_implementation-ready/scripts/` | Deployment helper scripts |
| `_implementation-ready/.github/workflows/` | CI/CD workflow drafts |

## Local Evaluation

Run these commands only when intentionally testing the prepared infrastructure package:

```bash
cd _implementation-ready
cp .env.example .env
make init
make health
```

This starts the local infrastructure defined by the prepared compose file. It does not start the transformer, business service, Mapping Studio UI, or forms UI until those source projects exist and are connected.

## Promotion Criteria

Before moving these files into the active root runtime path:

- Confirm service directories and package manifests exist.
- Confirm Docker build contexts match the actual service layout.
- Replace placeholder secrets, domains, image names, and resource limits.
- Run local health checks and at least one end-to-end mapping fixture.
- Update [Setup Guide](../deployment/setup-guide.md), [Docker Compose Local Reference](../deployment/DOCKER_COMPOSE_LOCAL.md), and [Implementation Status](./status.md).

## Related Docs

- [Setup Guide](../deployment/setup-guide.md)
- [Docker Compose Local Reference](../deployment/DOCKER_COMPOSE_LOCAL.md)
- [Kubernetes Deployment Guide](../deployment/KUBERNETES_DEPLOYMENT_GUIDE.md)
- [Implementation Status](./status.md)
