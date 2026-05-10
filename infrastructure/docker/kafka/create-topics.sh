#!/usr/bin/env bash
set -euo pipefail

BOOTSTRAP_SERVER="${BOOTSTRAP_SERVER:-kafka:29092}"

echo "Waiting for Kafka at ${BOOTSTRAP_SERVER}..."
cub kafka-ready -b "${BOOTSTRAP_SERVER}" 1 60

create_topic() {
  local topic="$1"
  local partitions="$2"
  local retention_ms="$3"

  kafka-topics \
    --bootstrap-server "${BOOTSTRAP_SERVER}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions "${partitions}" \
    --replication-factor 1 \
    --config "retention.ms=${retention_ms}"
}

create_topic "partner.raw.events" 6 604800000
create_topic "canonical.events" 6 604800000
create_topic "transformation.retry.1m" 6 86400000
create_topic "transformation.retry.5m" 6 86400000
create_topic "transformation.retry.30m" 6 86400000
create_topic "transformation.dlq" 6 1209600000
create_topic "business.events" 6 604800000

echo "Kafka topics are ready."
