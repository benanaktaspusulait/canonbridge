# Blue-Green Deployment

## Purpose

Blue-green deployment runs two production-capable environments. Traffic switches from blue to green after validation.

## When to Use

Use blue-green when:

- Deployment must switch quickly.
- Canary routing is unavailable.
- Runtime behavior is risky but easy to validate before traffic.
- Rollback must be immediate.

Avoid blue-green when Kafka consumer group ownership or database migrations cannot safely run in parallel.

## Flow

1. Deploy green environment.
2. Run startup checks.
3. Run smoke tests against green.
4. Pause or coordinate consumers if needed.
5. Switch traffic or consumer group assignment.
6. Monitor metrics.
7. Keep blue warm until confidence window passes.

## Data Compatibility

- Database migrations must support both blue and green.
- Mapping artifacts must be versioned.
- Consumer group behavior must be explicit.
- Outbox publisher must avoid double publishing.

## See Also

- [Database Migrations](./05-database-migrations.md)
- [Kubernetes Deployment Guide](./KUBERNETES_DEPLOYMENT_GUIDE.md)

