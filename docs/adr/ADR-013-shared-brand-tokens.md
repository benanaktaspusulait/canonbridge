# ADR-013: Shared Brand Tokens for Product and Website UI

**Status**: Accepted

## Context

The marketing website and Mapping Studio were using separate color, typography, and radius choices. This made the product feel fragmented and made visual QA subjective.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| Keep per-app styling | No shared package work | Drift continues |
| Adopt a full design-system package immediately | Strong consistency | Too much process for the current repo shape |
| Add shared token source with app snapshots | Low friction, explicit source of truth | Requires keeping snapshots in sync |

## Decision

Create `@canonbridge/tokens` under `packages/tokens` and mirror a CSS snapshot into each static frontend.

Consumers:

- `website/app/brand-tokens.css`
- `mapping-studio-ui/src/styles/brand-tokens.css`

## Consequences

- Brand colors, type stacks, radius, and focus tokens have a single source.
- Static Next and Angular builds do not need workspace package linking.
- Token changes must update the source package and consumer snapshots in the same PR.
