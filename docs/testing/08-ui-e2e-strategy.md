# UI E2E Strategy

**Status**: Active  
**Last updated**: 2026-05-21

## Scope

UI quality is split into three layers:

| Layer | Current gate | Purpose |
|---|---|---|
| Mapping Studio unit/component tests | `cd mapping-studio-ui && npm test -- --run` | Validate wizard logic, source-type coverage, JSONata helpers, and shell behavior. |
| Website smoke tests | `cd website && npm test` | Validate SEO metadata, mobile navigation, working contact flow, and static asset references. |
| Website browser + axe E2E | `cd website && npm run test:e2e` | Validate homepage render, webhook-backed form submit, i18n switch, component gallery, and axe accessibility. |
| Production build checks | `npm run build` in each frontend app | Catch framework, routing, and static export failures before image build. |

The CI workflow now runs Mapping Studio tests before the production build and adds a dedicated website lint/test/build/browser-E2E job.

## Browser E2E Backlog

Expand Playwright as additional product flows stabilize:

- Mapping wizard happy path: choose one of the 10 source types, load sample payload, map required fields, validate, and publish.
- Large-file batch flow: create an upload session, upload chunks, resume after interruption, complete, then view batch status.
- Scheduled API flow: configure cron/interval, trigger a poll, then inspect run history.
- Mapping Studio accessibility smoke: run axe on the dashboard and wizard.
- Responsive screenshot assertions for website navigation, hero, and contact form.

## Acceptance Rules

- Browser tests must use deterministic seed data.
- Tests must avoid relying on animation timing.
- Each test must leave tenant data isolated or clean up after itself.
- CI should keep browser E2E separate from unit jobs so Docker-backed protocol tests and UI browsers can be retried independently.
