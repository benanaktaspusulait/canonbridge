# Logging and Masking

## Purpose

Logs must help debug partner integration failures without leaking sensitive payload data. ETL Solutions uses structured logs with correlation IDs, partner metadata, mapping versions, and masked error context.

## Required Log Fields

- `timestamp`
- `level`
- `service`
- `tenantId`
- `partnerId`
- `eventType`
- `correlationId`
- `messageId`
- `mappingVersion`
- `schemaVersion`
- `stage`
- `errorCode`

## Do Not Log

- Full raw partner payloads.
- Full canonical payloads with PII.
- API keys, secrets, tokens, credentials.
- Unmasked DLQ payload content.

## Masking Rules

Mask fields matching:

- Email, phone, address, national ID, tax ID.
- Card number, IBAN, account number.
- Auth headers and tokens.
- Tenant-defined sensitive paths.

Example:

```json
{
  "customer": {
    "email": "***@example.com",
    "phone": "***"
  }
}
```

## Log Events

- `message_received`
- `mapping_resolved`
- `input_validation_failed`
- `transformation_failed`
- `canonical_validation_failed`
- `canonical_published`
- `dlq_written`
- `retry_scheduled`
- `shutdown_started`
- `shutdown_completed`

## See Also

- [Security](./10-security.md)
- [Troubleshooting](../operations/03-troubleshooting.md)
- [Mapping Studio API and Data Model](../product/03-mapping-studio-api-data-model.md)

