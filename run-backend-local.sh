#!/bin/bash
cd /Users/benanaktas/project/etlsolutions/services/mapping-studio-api

export DB_USERNAME=canonbridge_user
export DB_PASSWORD=canonbridge_local_dev
export DB_URL=postgresql://localhost:5432/canonbridge_db
export JDBC_DB_URL=jdbc:postgresql://localhost:5432/canonbridge_db
export REDIS_URL=redis://localhost:6379
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
export CANONBRIDGE_AUTH_ENABLED=true
export CANONBRIDGE_API_KEYS=dev-api-key
export CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
export CANONBRIDGE_TRANSFORMER_URL=http://localhost:8083
export RATELIMIT_ENABLED=false

mvn quarkus:dev -Dquarkus.http.port=8082
