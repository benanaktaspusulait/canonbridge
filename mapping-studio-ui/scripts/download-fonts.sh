#!/bin/bash
# Downloads self-hosted font files from Google Fonts API.
# Run this script once to populate src/assets/fonts/ with WOFF2 files.
# Requires: curl

set -euo pipefail

FONT_DIR="$(dirname "$0")/../src/assets/fonts"
mkdir -p "$FONT_DIR"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

echo "Downloading Manrope..."
for weight in 400 500 600 700 800; do
  curl -sL -H "User-Agent: $UA" \
    "https://fonts.googleapis.com/css2?family=Manrope:wght@${weight}&display=swap" \
    | grep -oP 'url\(\K[^)]+' \
    | head -1 \
    | xargs -I{} curl -sL -o "$FONT_DIR/manrope-${weight}.woff2" "{}"
  echo "  manrope-${weight}.woff2 ✓"
done

echo "Downloading Space Grotesk..."
for weight in 500 600 700; do
  curl -sL -H "User-Agent: $UA" \
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}&display=swap" \
    | grep -oP 'url\(\K[^)]+' \
    | head -1 \
    | xargs -I{} curl -sL -o "$FONT_DIR/space-grotesk-${weight}.woff2" "{}"
  echo "  space-grotesk-${weight}.woff2 ✓"
done

echo "Downloading JetBrains Mono..."
for weight in 400 500; do
  curl -sL -H "User-Agent: $UA" \
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@${weight}&display=swap" \
    | grep -oP 'url\(\K[^)]+' \
    | head -1 \
    | xargs -I{} curl -sL -o "$FONT_DIR/jetbrains-mono-${weight}.woff2" "{}"
  echo "  jetbrains-mono-${weight}.woff2 ✓"
done

echo ""
echo "Done! Font files saved to: $FONT_DIR"
echo "Verify files exist and commit them to the repository."
