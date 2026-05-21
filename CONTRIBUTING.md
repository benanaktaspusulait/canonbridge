# Contributing

CanonBridge is a proprietary project. Contributions are accepted only from authorized maintainers and approved collaborators.

## Workflow

1. Create a branch from the current integration branch.
2. Keep changes scoped to one product or technical concern.
3. Update docs when behavior, deployment, or operator workflow changes.
4. Run the relevant verification commands before opening a PR.
5. Include screenshots for UI changes and API examples for endpoint changes.

## Verification

Use the active command list in [Project Gaps](docs/project/PROJECT_GAPS.md). At minimum:

- Backend API changes: targeted Maven tests plus migration checks when schema changes.
- Transformer changes: `npm test`.
- Mapping Studio UI changes: `npm test -- --run`.
- Website changes: `npm test` and `npm run build`.
- Documentation-only changes: link and command snippets reviewed.

## Documentation Rules

- Keep active docs under `docs/` or a service-local README.
- Use [Project Gaps](docs/project/PROJECT_GAPS.md) as the active gap register.
- Add ADRs under `docs/adr/` for auth, reliability, data consistency, and deployment decisions.
