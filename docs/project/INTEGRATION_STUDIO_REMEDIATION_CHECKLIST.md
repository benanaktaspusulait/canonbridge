# Integration Studio Remediation Checklist

**Created:** 2026-05-11  
**Scope:** Integration Studio deep-analysis gaps, outbound API documentation alignment, and no-code wizard polish.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

## Execution Checklist

### Tracking

- `[x]` Create this Markdown checklist before implementation.
- `[x]` Update statuses as each implementation group is completed.

### High-Impact Studio Fixes

- `[x]` Render the missing Validate & Publish "Engine rule" tab so users can preview, copy, and download the generated JSONata expression.
- `[x]` Surface `testRunPending` in the UI with loading states and disabled actions during mapping/fixture test execution.
- `[x]` Use syntax-highlighted JSON output in Step 5 instead of the plain Angular `json` pipe.
- `[x]` Fix canonical key validation so implementation and i18n agree on whether nested dot paths are allowed.
- `[x]` Add export/import for the full Studio configuration, not only the generated JSONata expression.

### Medium-Impact Studio Fixes

- `[x]` Add drag-and-drop reordering for source validation rules.
- `[x]` Expose source path chips in the rule inspector and allow inserting them into the advanced expression editor.
- `[x]` Improve fixture config loading so fixture rows keep the declared paths and make the stub behavior explicit.
- `[x]` Wire webhook rotate/copy actions and make External API test clearly report demo/real execution state.
- `[x]` Use path-aware controls for transforms where the chosen source path is ambiguous.

### Documentation

- `[x]` Review `architecture-v7-outbound.md` against the outbound API, credential store, SOAP/XML, and trigger requirements.
- `[x]` Review `mapping-studio-ui-v2.md` against the Step 1 source types, credential drawer, testing, and External Systems screen requirements.
- `[x]` Add a concise implementation-status note if docs already contain the design but runtime is demo-only.

### Verification

- `[x]` Run Angular build for Mapping Studio.
- `[x]` Run a lightweight i18n sanity check.
- `[x]` Summarize touched files, verification result, and remaining risk.
