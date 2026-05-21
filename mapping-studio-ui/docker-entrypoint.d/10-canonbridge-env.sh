#!/bin/sh
set -eu

target="/usr/share/nginx/html/env.js"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

bool_value() {
  case "${1:-}" in
    true|TRUE|1|yes|YES) printf 'true' ;;
    false|FALSE|0|no|NO) printf 'false' ;;
    *) printf 'false' ;;
  esac
}

cat > "$target" <<EOF
window.CANONBRIDGE_CONFIG = {
  apiBaseUrl: "$(json_escape "${CANONBRIDGE_API_BASE_URL:-/api}")",
  websocketUrl: "$(json_escape "${CANONBRIDGE_WEBSOCKET_URL:-}")",
  authIssuer: "$(json_escape "${CANONBRIDGE_AUTH_ISSUER:-}")",
  authClientId: "$(json_escape "${CANONBRIDGE_AUTH_CLIENT_ID:-mapping-studio-ui}")",
  authRedirectUri: "$(json_escape "${CANONBRIDGE_AUTH_REDIRECT_URI:-}")",
  tenantId: "$(json_escape "${CANONBRIDGE_TENANT_ID:-tenant-acme}")",
  tenantName: "$(json_escape "${CANONBRIDGE_TENANT_NAME:-Acme Tenant}")",
  transformerApiUrl: "$(json_escape "${CANONBRIDGE_TRANSFORMER_API_URL:-}")",
  enableDemoMode: $(bool_value "${CANONBRIDGE_ENABLE_DEMO_MODE:-false}")
};
EOF
