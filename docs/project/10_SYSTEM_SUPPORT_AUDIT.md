# CanonBridge 10 System Support Audit

**Date**: 2026-05-20  
**Scope**: Source types, runtime paths, mock systems, database templates, and test evidence.

## Result

CanonBridge now exposes 10 distinct mock-backed external system templates for the single tenant demo path. The platform also models 10 integration source types in the UI and backend enum.

The remaining risk is not system count, seed coverage, or live protocol coverage. The four newest systems now have mapping drafts, canonical schemas, and source samples, transformer `npm test` includes one deterministic source-to-canonical smoke fixture for each of the 10 systems, and `ProtocolDockerE2ETest` exercises all 10 mock systems through Docker Compose/Testcontainers.

## 10 Source Types

The Mapping Studio source picker and backend `SourceType` enum both include:

1. `KAFKA`
2. `WEBHOOK`
3. `REST_API`
4. `SCHEDULED_API`
5. `GRAPHQL`
6. `SOAP`
7. `GRPC`
8. `FILE_BATCH`
9. `API_ENRICHMENT`
10. `MANUAL`

Evidence:

- `mapping-studio-ui/src/app/pages/mapping-wizard/steps/step0-source-type/source-type-selection.component.ts`
- `services/mapping-studio-api/src/main/java/com/canonbridge/mappingstudio/domain/MappingDraft.java`

## 10 External System Templates

`V38__normalize_ten_system_templates.sql` removes duplicate post-consolidation templates and adds the missing systems. The intended single-tenant template set is:

1. PayFlex Payment System
2. ShopMax E-Commerce System
3. FastCargo Logistics System
4. ProfileHub GraphQL API
5. CustomerGateway gRPC Profile Service
6. FoodMarket Order System
7. InventoryPro Warehouse System
8. TicketDesk Support System
9. CloudBill Billing System
10. PeopleOps HR System

Evidence:

- `services/mapping-studio-api/src/main/resources/db/migration/V38__normalize_ten_system_templates.sql`
- `services/mapping-studio-api/src/main/resources/db/migration/V39__seed_new_system_mapping_drafts.sql`
- `services/canonbridge-mock/src/main/java/com/canonbridge/mock/controller/AdditionalSystemsController.java`

## Seed Coverage

| System | Template | Mapping draft / sample evidence |
|---|---|---|
| PayFlex Payment System | Present | Existing PayFlex webhook mapping seeds. |
| ShopMax E-Commerce System | Present | Existing ShopMax Kafka mapping seeds. |
| FastCargo Logistics System | Present | Existing FastCargo SOAP mapping seeds. |
| ProfileHub GraphQL API | Present | Existing GraphQL connection and mock coverage. |
| CustomerGateway gRPC Profile Service | Present | Existing gRPC connection and mock coverage. |
| FoodMarket Order System | Present | Existing FoodMarket system template and mock coverage. |
| InventoryPro Warehouse System | Present | `V39` InventoryPro stock mapping draft and sample payload. |
| TicketDesk Support System | Present | `V39` TicketDesk ticket mapping draft and sample payload. |
| CloudBill Billing System | Present | `V39` CloudBill invoice mapping draft and sample payload. |
| PeopleOps HR System | Present | `V39` PeopleOps employee profile mapping draft and sample payload. |

## Support Depth

| Area | Status | Notes |
|---|---|---|
| Source type model | Done | UI and backend both carry 10 source types. |
| Mock-backed systems | Done | 10 distinct system templates after `V38`, with a `V39` guard for both row count and distinct names. |
| Request transformation | Done | `GAP-011` is now closed in the no-code gap register. |
| Mapping seeds | Done | The four newest REST systems now have partners, schemas, drafts, connection links, and source samples in `V39`. |
| Runtime proof per system | Done | `services/transformer/fixtures/ten-system-smoke.json` covers all 10 systems and is wired into `npm test`. |
| Production proof | Done | `ProtocolDockerE2ETest` starts the mock Docker Compose stack and calls all 10 systems through live protocol endpoints. |

## Remaining Actions

1. Run the opt-in Docker/Testcontainers protocol E2E in CI once Docker capacity is available.
2. Add UI coverage for selecting each template in the mapping wizard.
3. Keep [Project Gaps](./PROJECT_GAPS.md) as the single living gap register for production readiness.
