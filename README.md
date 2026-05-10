# ETL Solutions

Enterprise-grade ETL (Extract, Transform, Load) platform for multi-partner data integration.

## Project Status

🚧 **Planning & Design Phase** - Architecture and infrastructure ready, implementation pending.

## Quick Start

📖 **[Start with Documentation](./docs/README.md)** - Complete architecture, implementation guides, and deployment instructions.

## Project Structure

```
.
├── docs/              # Complete documentation (architecture, implementation, deployment)
├── docker/            # Docker configurations (Grafana, Prometheus, PostgreSQL)
├── k8s/               # Kubernetes manifests for production deployment
├── scripts/           # Deployment and automation scripts
└── .github/           # CI/CD workflows
```

## Key Resources

| Resource | Location |
|----------|----------|
| **Documentation Hub** | [docs/README.md](./docs/README.md) |
| **Architecture Overview** | [docs/architecture/01-overview.md](./docs/architecture/01-overview.md) |
| **Getting Started** | [docs/getting-started.md](./docs/getting-started.md) |
| **Implementation Roadmap** | [docs/implementation/roadmap.md](./docs/implementation/roadmap.md) |
| **Deployment Guide** | [docs/deployment/setup-guide.md](./docs/deployment/setup-guide.md) |
| **Tech Stack** | [docs/architecture/tech-stack.md](./docs/architecture/tech-stack.md) |

## Technology Stack

- **Transformation Layer**: Node.js + JSONata
- **Business Services**: Java + Quarkus
- **Message Queue**: Apache Kafka
- **Database**: PostgreSQL
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus + Grafana
- **Frontend**: React (Mapping Studio UI)

## Architecture Highlights

- Event-driven microservices architecture
- Immutable mapping versions with semantic versioning
- Outbox pattern for reliable event publishing
- Comprehensive error handling and retry mechanisms
- Multi-tenant SaaS-ready design
- Full observability with metrics, logs, and traces

## Local Development

```bash
# Start infrastructure services
docker-compose up -d

# Access services
# - Grafana: http://localhost:3000
# - Prometheus: http://localhost:9090
# - PostgreSQL: localhost:5432
```

See [docs/deployment/setup-guide.md](./docs/deployment/setup-guide.md) for detailed setup instructions.

## Contributing

This project follows a structured documentation-first approach. All architectural decisions, implementation patterns, and operational procedures are documented in the `docs/` directory.

## License

Proprietary - All rights reserved
