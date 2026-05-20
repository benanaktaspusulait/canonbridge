# Architecture V7: Outbound API Calling And Credential Store

This document is the active anchor for outbound-aware integration configuration. Earlier product and implementation docs link here when they describe REST, SOAP, GraphQL, gRPC, scheduled polling, API enrichment, and credential-backed calls.

## Configuration Shape

Outbound-aware mappings carry source metadata in `source_config`. The important fields are:

| Field | Purpose |
|---|---|
| `connectionId` | Links a mapping to `etl_outbound_connections`. |
| `url` / `connectionUrl` | External endpoint URL or template. |
| `method` | HTTP method used by the outbound call. |
| `requestTransformation` | Template or JSONata request builder for body/header/query data. |
| `headers` | Static or template-rendered headers. |
| `query` / `variables` | GraphQL query and variables. |
| `operation`, `soapAction`, `namespace` | SOAP operation metadata. |
| `schedule` | ISO duration, short interval, 5-field cron, or 6-field cron-with-seconds expression for scheduled polling. |

## Runtime Components

- `ExternalSystemResource` manages and tests external system connections.
- `OutboundHttpService` executes REST, SOAP, GraphQL, and gRPC-style HTTP calls with credential injection.
- `RequestTemplateService` renders request bodies and headers from visual/template config.
- `MappingExecutionService` performs request transformation, outbound call, response transformation, and response validation.
- `ScheduledApiPollerService` runs published scheduled API mappings on an interval or cron schedule and persists current state in `etl_scheduled_api_runs` plus history in `etl_scheduled_api_run_history`.
- `FileBatchResource` persists batch ingest job summaries and original rows in `etl_batch_jobs`, then exposes list/detail/retry/redrive APIs.
- `KafkaProducerService` records canonical publish attempts in `outbox_events`.
- `OutboxReplayService` replays due `PENDING`/`FAILED` outbox records with bounded attempts, backoff, metrics, and manual trigger support.

## Credential Store

Credentials live in `etl_credentials` and are referenced by `etl_outbound_connections.credential_id`.

Supported auth types:

- `API_KEY`
- `BASIC_AUTH`
- `BEARER_TOKEN`
- `OAUTH2_CLIENT_CREDENTIALS`

## Current Limits

- Batch ingest has durable job summaries, status/history, and retry/redrive APIs; chunked upload is still future work for very large files.
- REST inbound validates, transforms accepted payloads through the draft mapping, and publishes canonical payloads.
- Live Docker-backed protocol E2E exists as an opt-in Testcontainers test and should be wired into CI when Docker capacity is available.

See [Project Gaps](../project/PROJECT_GAPS.md) for the current prioritized backlog.
