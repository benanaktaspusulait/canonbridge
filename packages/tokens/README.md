# @canonbridge/tokens

Shared CanonBridge brand tokens for the website, Mapping Studio, and future UI packages.

This package is the source of truth for color, radius, shadow, and typography token names. App-local CSS snapshots should only mirror these values so static builds can work without workspace package linking.

## Consumers

- Website snapshot: `website/app/brand-tokens.css`
- Mapping Studio snapshot: `mapping-studio-ui/src/styles/brand-tokens.css`

When a token changes here, update the consumer snapshots in the same change.
