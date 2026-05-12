# UI Demo Sales Readiness Task List

**Created:** 2026-05-12  
**Scope:** Make CanonBridge Mapping Studio feel complete for a sales/demo walkthrough. Backend/API work is explicitly out of scope; every item below must remain local UI/demo behavior.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

## 1. Reality Check Against Reported Gaps

- `[x]` Verify which Integration Studio gaps are already implemented in the current branch.
- `[x]` Confirm source JSON textarea, drag/drop, source type panels, field tree, target dropdown, dynamic transform panels, missing-field jump actions, fixture runner, JSONata preview, loading states, and step indicator already exist.
- `[x]` Confirm mapping fixture validation currently passes and canonical envelope fields are present in `mappings/partners/acme-marketplace/order-created/fixtures`.

## 2. Integration Studio Demo Polish

- `[x]` Add autosave status for the Studio draft so users feel changes are protected.
- `[x]` Add browser unload guard when there are unpublished local changes.
- `[x]` Add keyboard shortcuts for `Ctrl/Cmd+S` export and `Ctrl/Cmd+Enter` test mapping.
- `[x]` Add a visible publish confirmation/version summary in the final step.
- `[x]` Tighten empty/error/loading states where the current UI still feels passive.

## 3. External Systems Demo Polish

- `[x]` Add demo Credential Store summary cards.
- `[x]` Add type-specific configuration fields for Scheduled Poll and SOAP/WSDL.
- `[x]` Show sample response JSON after connection test.
- `[x]` Add "Use this sample in Mapping Studio" demo handoff.
- `[x]` Show mapped versions per external connection.
- `[x]` Expand call history with request/response/header log detail.
- `[x]` Add simple sparkline-style metric visuals.

## 4. Cross-Page Sales Readiness

- `[x]` Re-check Mappings page filters/detail actions for demo flow continuity.
- `[x]` Re-check Partners, DLQ, Monitoring, and Settings pages for broken/empty-looking actions.
- `[x]` Add missing toast/loading/empty states only where the page still feels unfinished.

## 5. Verification And Delivery

- `[x]` Run Angular build.
- `[x]` Run mapping fixture validation.
- `[x]` Run schema compatibility validation.
- `[x]` Run i18n key parity check.
- `[x]` Commit only scoped UI/demo changes.
- `[x]` Push and verify GitHub Pages deploy.
