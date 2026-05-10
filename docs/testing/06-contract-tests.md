# Contract Tests

## Purpose

Contract tests protect agreements between producers, transformer, business service, Mapping Studio, and consumers.

## Contracts

- Raw event envelope.
- Partner input schema.
- Canonical event schema.
- Mapping artifact format.
- Mapping Studio API responses.
- DLQ message shape.
- Outbox event shape.

## Required Checks

- Required fields are not removed without a new version.
- New optional fields are backward-compatible.
- Published mapping package matches transformer loader expectations.
- DLQ errors include partner, event type, mapping version, stage, and correlation ID.
- Canonical schema fixtures remain valid for consumers.

## See Also

- [Message Design](../architecture/04-message-design.md)
- [Schema Validation](../implementation/04-schema-validation.md)

