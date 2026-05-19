# CanonBridge 10 System Support Audit

**Date**: 2026-05-19  
**Scope**: Source types, runtime paths, mock systems, database templates, and test evidence.

## Result

CanonBridge now exposes 10 distinct mock-backed external system templates for the single tenant demo path. The platform also models 10 integration source types in the UI and backend enum.

The remaining risk is not system count; it is depth of proof. Several systems are template/mock ready, while only the core demo systems have richer mapping, fixture, and acceptance coverage.

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
- `services/canonbridge-mock/src/main/java/com/canonbridge/mock/controller/AdditionalSystemsController.java`

## Support Depth

| Area | Status | Notes |
|---|---|---|
| Source type model | Done | UI and backend both carry 10 source types. |
| Mock-backed systems | Done | 10 distinct system templates after `V38`. |
| Request transformation | Done | `GAP-011` is now closed in the no-code gap register. |
| Core demo mappings | Partial | PayFlex, ShopMax, FastCargo, ProfileHub, CustomerGateway, and FoodMarket have stronger seeds than the four new template systems. |
| Runtime proof per system | Partial | New systems have mock endpoints and connection templates, but no dedicated mapping draft, fixture, and E2E scenario yet. |
| Production proof | Partial | Integration tests still depend on Docker/Testcontainers availability. |

## Remaining Actions

1. Add mapping drafts, schemas, and sample payloads for InventoryPro, TicketDesk, CloudBill, and PeopleOps.
2. Extend `docs/testing/ACCEPTANCE_SCENARIOS.md` with one E2E scenario per new system.
3. Add a database or smoke-test check that asserts exactly 10 distinct `is_system_template = TRUE` names for `tenant-acme`.
4. Add UI coverage for selecting each template in the mapping wizard.
5. Keep [Project Gaps](./PROJECT_GAPS.md) as the single living gap register for production readiness.
