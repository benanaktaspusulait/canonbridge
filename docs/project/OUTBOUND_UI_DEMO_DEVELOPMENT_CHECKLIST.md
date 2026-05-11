# Outbound UI Demo Development Checklist

**Created:** 2026-05-11  
**Scope:** Develop the outbound, credential, trigger, and external-system requirements as local Mapping Studio demo UI only. No backend/API service is created in this phase.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

## Integration Studio

- `[x]` Add Step 1 source cards for Kafka, Webhook, External API, and Manual Upload.
- `[x]` Add Webhook URL/key copy and rotate demo actions.
- `[x]` Add External API request setup panel.
- `[x]` Add credential drawer with API Key, Basic Auth, Bearer Token, and OAuth2 forms.
- `[x]` Save credentials as local demo metadata and reuse them by name.
- `[x]` Load External API demo response into the source tree after test.
- `[x]` Make Validate & Publish refresh External API demo response before running mapping when needed.
- `[x]` Keep generated JSONata/mapping engine hidden behind no-code controls, with optional engine preview only in final step.

## External Systems

- `[x]` Add list, filters, KPI strip, Add/Edit/Delete connection dialog, and demo test action.
- `[x]` Add connection detail drawer with latest calls, health explanation, and one-click retest.
- `[x]` Make demo call history update after every test.

## Documentation and Verification

- `[x]` Update docs to explicitly state this phase is UI-only demo with no API/backend creation.
- `[x]` Run Angular build.
- `[x]` Run i18n key parity check.
- `[x]` Commit and push scoped UI/demo changes.
