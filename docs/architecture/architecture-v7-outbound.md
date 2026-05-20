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
| `schedule` | Lightweight interval for scheduled polling. |

## Runtime Components

- `ExternalSystemResource` manages and tests external system connections.
- `OutboundHttpService` executes REST, SOAP, GraphQL, and gRPC-style HTTP calls with credential injection.
- `RequestTemplateService` renders request bodies and headers from visual/template config.
- `MappingExecutionService` performs request transformation, outbound call, response transformation, and response validation.
- `ScheduledApiPollerService` runs published scheduled API mappings on an interval.

## Credential Store

Credentials live in `etl_credentials` and are referenced by `etl_outbound_connections.credential_id`.

Supported auth types:

- `API_KEY`
- `BASIC_AUTH`
- `BEARER_TOKEN`
- `OAUTH2_CLIENT_CREDENTIALS`

## Current Limits

- Scheduled polling keeps run state in memory.
- REST inbound validates, transforms accepted payloads through the draft mapping, and publishes canonical payloads.
- Live Docker-backed protocol E2E should be expanded beyond the deterministic 10-system transformer smoke fixtures.

See [Project Gaps](../project/PROJECT_GAPS.md) for the current prioritized backlog.
