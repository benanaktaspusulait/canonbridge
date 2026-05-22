#!/bin/bash
# X-Y2: Kafka SASL_SCRAM user creation and ACL setup
# Run this script against the Kafka broker to configure per-service authorization.
#
# Prerequisites:
# - Kafka broker configured with SASL_SCRAM and AclAuthorizer
# - kubectl access to the Kafka pod or kafka-configs.sh available locally
#
# Usage:
#   ./setup-kafka-acls.sh <bootstrap-server>
#
# Example:
#   ./setup-kafka-acls.sh kafka-0.kafka-headless.canonbridge.svc.cluster.local:9092

set -euo pipefail

BOOTSTRAP_SERVER="${1:-localhost:9092}"
COMMAND_CONFIG="${2:-}" # Optional: path to admin client properties file

KAFKA_OPTS=""
if [ -n "$COMMAND_CONFIG" ]; then
  KAFKA_OPTS="--command-config $COMMAND_CONFIG"
fi

echo "=== CanonBridge Kafka ACL Setup ==="
echo "Bootstrap server: $BOOTSTRAP_SERVER"
echo ""

# ─── Create SCRAM users ───────────────────────────────────────────────────────

echo "Creating SCRAM-SHA-256 users..."

kafka-configs.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --alter --add-config 'SCRAM-SHA-256=[iterations=8192,password='"${KAFKA_MAPPING_STUDIO_PASSWORD:-$(openssl rand -hex 16)}"']' \
  --entity-type users --entity-name mapping-studio-api

kafka-configs.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --alter --add-config 'SCRAM-SHA-256=[iterations=8192,password='"${KAFKA_BILLING_SERVICE_PASSWORD:-$(openssl rand -hex 16)}"']' \
  --entity-type users --entity-name billing-service

kafka-configs.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --alter --add-config 'SCRAM-SHA-256=[iterations=8192,password='"${KAFKA_WEBHOOK_RECEIVER_PASSWORD:-$(openssl rand -hex 16)}"']' \
  --entity-type users --entity-name webhook-receiver

kafka-configs.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --alter --add-config 'SCRAM-SHA-256=[iterations=8192,password='"${KAFKA_TRANSFORMER_PASSWORD:-$(openssl rand -hex 16)}"']' \
  --entity-type users --entity-name transformer

echo "Users created."
echo ""

# ─── Create topics (if not exist) ─────────────────────────────────────────────

echo "Creating topics..."

kafka-topics.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --create --if-not-exists --topic partner.raw.events --partitions 6 --replication-factor 3
kafka-topics.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --create --if-not-exists --topic canonical.events --partitions 6 --replication-factor 3
kafka-topics.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --create --if-not-exists --topic usage.events --partitions 3 --replication-factor 3
kafka-topics.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --create --if-not-exists --topic billing.events --partitions 3 --replication-factor 3
kafka-topics.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS \
  --create --if-not-exists --topic canonbridge.dlq --partitions 3 --replication-factor 3

echo "Topics created."
echo ""

# ─── Set ACLs ─────────────────────────────────────────────────────────────────

echo "Setting ACLs..."

# mapping-studio-api: produce to canonical.events, usage.events; consume partner.raw.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:mapping-studio-api \
  --producer --topic canonical.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:mapping-studio-api \
  --producer --topic usage.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:mapping-studio-api \
  --consumer --topic partner.raw.events --group mapping-studio-api

# billing-service: consume usage.events; produce billing.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:billing-service \
  --consumer --topic usage.events --group billing-service
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:billing-service \
  --producer --topic billing.events

# webhook-receiver: produce to partner.raw.events, usage.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:webhook-receiver \
  --producer --topic partner.raw.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:webhook-receiver \
  --producer --topic usage.events

# transformer: consume partner.raw.events; produce canonical.events, usage.events, DLQ
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:transformer \
  --consumer --topic partner.raw.events --group canonbridge-transformer
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:transformer \
  --producer --topic canonical.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:transformer \
  --producer --topic usage.events
kafka-acls.sh --bootstrap-server "$BOOTSTRAP_SERVER" $KAFKA_OPTS --add \
  --allow-principal User:transformer \
  --producer --topic canonbridge.dlq

echo ""
echo "=== ACL setup complete ==="
echo ""
echo "Verify with:"
echo "  kafka-acls.sh --bootstrap-server $BOOTSTRAP_SERVER --list"
