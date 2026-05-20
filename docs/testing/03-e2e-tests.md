# End-to-End Tests

## Scope

E2E tests validate the full user or message journey across services.

## Critical Journeys

- Create Mapping Studio draft from sample JSON, publish mapping v1, process sample raw event.
- Process happy-path order event from raw topic to canonical topic and business database.
- Exercise the 10 mock-backed systems over their live protocols: REST/API-key, OAuth REST, SOAP/Basic, GraphQL, gRPC-style HTTP, and bearer-token REST.
- Duplicate event is accepted once and ignored on replay.
- Invalid partner payload appears in DLQ with actionable metadata.
- DLQ event is imported as a Mapping Studio sample for a fix draft.
- Outbox `PENDING`/`FAILED` events replay to Kafka and move to `PUBLISHED`.
- Batch jobs expose durable status/history and can retry/redrive source rows.
- Scheduled API mappings expose current state, cron/interval contract, and run history.
- Rollback activates previous mapping version.

## Live Protocol E2E

The mock service includes an opt-in Docker/Testcontainers suite that starts `services/canonbridge-mock/docker-compose.yml` and checks all 10 external systems through live endpoints.

```bash
cd services/canonbridge-mock
CANONBRIDGE_PROTOCOL_E2E=true TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
  mvn -Ddocker.host=unix://${HOME}/.docker/run/docker.sock \
      -Dapi.version=1.44 \
      -Dtest=ProtocolDockerE2ETest test
```

The test is skipped during normal unit runs so local development does not start Docker unexpectedly. Docker Desktop 29+ may require the explicit `docker.host` and `api.version` Maven properties shown above.

## UI Coverage

- Sample JSON upload/paste.
- JSON tree inspection.
- Schema builder.
- Canonical mapping builder.
- Transform preview.
- Review and publish.

## Acceptance

E2E tests must run against staging-like infrastructure before GA and before high-risk Mapping Studio releases.

## See Also

- [Mapping Studio UX Flow](../product/02-mapping-studio-ux-flow.md)
- [Deployment Checklist](../deployment/01-deployment-checklist.md)
