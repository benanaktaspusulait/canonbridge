#!/bin/bash
# Downloads self-hosted font files from Google Fonts API.
# Run this script once to populate src/assets/fonts/ with WOFF2 files.
# Requires: curl, python3

set -euo pipefail

FONT_DIR="$(dirname "$0")/../src/assets/fonts"
mkdir -p "$FONT_DIR"

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

download_font() {
  local family="$1"
  local weight="$2"
  local output="$3"

  local css
  css=$(curl -sL -H "User-Agent: $UA" "https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap")
  
  local url
  url=$(echo "$css" | python3 -c "import sys,re; m=re.search(r'url\((https://[^)]+\.woff2)\)', sys.stdin.read()); print(m.group(1) if m else '')")
  
  if [ -n "$url" ]; then
    curl -sL -o "$output" "$url"
    echo "  $(basename "$output") ✓"
  else
    echo "  $(basename "$output") ✗ (URL not found)"
  fi
}

echo "Downloading Manrope..."
for weight in 400 500 600 700 800; do
  download_font "Manrope" "$weight" "$FONT_DIR/manrope-${weight}.woff2"
done

echo "Downloading Space Grotesk..."
for weight in 500 600 700; do
  download_font "Space+Grotesk" "$weight" "$FONT_DIR/space-grotesk-${weight}.woff2"
done

echo "Downloading JetBrains Mono..."
for weight in 400 500; do
  download_font "JetBrains+Mono" "$weight" "$FONT_DIR/jetbrains-mono-${weight}.woff2"
done

echo ""
echo "Done! Font files saved to: $FONT_DIR"
