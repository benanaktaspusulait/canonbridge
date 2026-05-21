# i18n Contributor Guide

**Status**: Active  
**Last updated**: 2026-05-21

CanonBridge currently supports English, Turkish, German, and Spanish on the website and JSON dictionary files in Mapping Studio.

## Website

Website locale data lives in:

- `website/lib/i18n.ts`
- `website/lib/locales/tr.ts`
- `website/lib/locales/de.ts`
- `website/lib/locales/es.ts`

Rules:

- Add every new key to English first.
- Keep translation object shapes identical across locales.
- Use the `?lang=` URL parameter for deterministic links, for example `/?lang=tr`.
- Do not hardcode visible copy inside components when the text is part of the localized page experience.

## Mapping Studio

Mapping Studio locale data lives in:

- `mapping-studio-ui/public/i18n/en.json`
- `mapping-studio-ui/public/i18n/tr.json`

Rules:

- Keep key names semantic and stable.
- Prefer short labels in buttons and dense product surfaces.
- Avoid browser-only language assumptions; the runtime config file can change deployment URLs without rebuilding.

## Review Checklist

- New visible copy has an English source string.
- Existing locale files have matching keys.
- Long labels fit in mobile and dense toolbar surfaces.
- Screenshots or tests cover any new navigation or form text.
