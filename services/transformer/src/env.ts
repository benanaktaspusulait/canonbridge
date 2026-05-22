import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Env {
  mappingsRoot: string;
  port: number;
  mappingDatabaseUrl?: string;
  mappingDatabaseTenantId?: string;
  // HTTP auth
  apiKey: string | undefined;
  apiKeys?: string[];
  /** [T-V1-H3] Explicit opt-in to disable auth (must be set to 'true') */
  authDisabled: boolean;
  corsOrigins: string[];
  httpBodyLimitBytes?: number;
  docsEnabled?: boolean;
  // Kafka
  kafkaEnabled: boolean;
  kafkaBrokers: string[];
  kafkaGroupId: string;
  kafkaFallbackDlqTopic: string;
  kafkaConnectRetries: number;
  kafkaConnectRetryDelayMs: number;
  // G-07: Kafka SSL/SASL
  kafkaSslEnabled: boolean;
  kafkaSaslMechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512' | undefined;
  kafkaSaslUsername: string | undefined;
  kafkaSaslPassword: string | undefined;
  // G-09: Redis cache
  redisUrl: string | undefined;
  redisCacheTtlSeconds: number;
  // G-16: Worker pool
  workerPoolEnabled: boolean;
  workerPoolSize: number;
  // G-18: Outbox pattern
  outboxEnabled: boolean;
  outboxDatabaseUrl: string | undefined;
  outboxPollIntervalMs: number;
  outboxBatchSize: number;
  // DLQ persistence
  dlqDatabaseUrl: string | undefined;
  // DLQ redrive limits
  dlqMaxRedriveAttempts: number;
  // Logging
  logLevel: string;
  // [T-V1-M9] Transform payload size cap
  transformMaxPayloadBytes: number;
  // [T-V1-H1] Enrichment URL allow-list
  enrichmentAllowedHosts: string[];
  enrichmentMaxTimeoutMs: number;
}

export function loadEnv(): Env {
  const defaultMappings = path.resolve(__dirname, '..');

  const corsRaw = process.env.CORS_ORIGINS ?? '';
  const corsOrigins = corsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // G-07: Kafka SASL mechanism
  const saslMech = process.env.KAFKA_SASL_MECHANISM?.toLowerCase();
  let kafkaSaslMechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512' | undefined;
  if (saslMech === 'plain' || saslMech === 'scram-sha-256' || saslMech === 'scram-sha-512') {
    kafkaSaslMechanism = saslMech;
  }

  return {
    mappingsRoot: process.env.MAPPINGS_ROOT ?? defaultMappings,
    port: Number.parseInt(process.env.PORT ?? '8080', 10),
    mappingDatabaseUrl: process.env.MAPPING_DATABASE_URL || process.env.DATABASE_URL || undefined,
    mappingDatabaseTenantId: process.env.MAPPING_DATABASE_TENANT_ID || undefined,
    // G-06: API key auth — undefined means auth disabled (dev/internal use)
    apiKey: process.env.API_KEY || undefined,
    apiKeys: (process.env.API_KEYS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    // [T-V1-H3] Explicit opt-in to disable auth — treat missing NODE_ENV as production
    authDisabled: process.env.AUTH_DISABLED === 'true',
    // G-06: explicit CORS origins; empty = allow all (dev default)
    corsOrigins,
    httpBodyLimitBytes: Number.parseInt(process.env.HTTP_BODY_LIMIT_BYTES ?? String(20 * 1024 * 1024), 10),
    // [T-V1-H3] Docs only enabled with explicit opt-in or AUTH_DISABLED=true
    docsEnabled: process.env.TRANSFORMER_DOCS_ENABLED === 'true' || process.env.AUTH_DISABLED === 'true',
    // Kafka
    kafkaEnabled: process.env.KAFKA_ENABLED === 'true',
    kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map((s) => s.trim()),
    kafkaGroupId: process.env.KAFKA_GROUP_ID ?? 'canonbridge-transformer',
    // G-08: explicit fallback DLQ topic instead of first-loaded config
    kafkaFallbackDlqTopic: process.env.KAFKA_FALLBACK_DLQ_TOPIC ?? 'canonbridge.dlq',
    // G-03: retry config for initial Kafka connect
    kafkaConnectRetries: Number.parseInt(process.env.KAFKA_CONNECT_RETRIES ?? '10', 10),
    kafkaConnectRetryDelayMs: Number.parseInt(process.env.KAFKA_CONNECT_RETRY_DELAY_MS ?? '3000', 10),
    // G-07: Kafka SSL/SASL
    kafkaSslEnabled: process.env.KAFKA_SSL_ENABLED === 'true',
    kafkaSaslMechanism,
    kafkaSaslUsername: process.env.KAFKA_SASL_USERNAME || undefined,
    kafkaSaslPassword: process.env.KAFKA_SASL_PASSWORD || undefined,
    // G-09: Redis cache (optional, defaults to in-memory)
    redisUrl: process.env.REDIS_URL || undefined,
    redisCacheTtlSeconds: Number.parseInt(process.env.REDIS_CACHE_TTL_SECONDS ?? '3600', 10),
    // G-16: Worker pool for CPU-intensive JSONata evaluations
    workerPoolEnabled: process.env.WORKER_POOL_ENABLED === 'true',
    workerPoolSize: Number.parseInt(process.env.WORKER_POOL_SIZE ?? '0', 10), // 0 = auto (CPU count - 1)
    // G-18: Outbox pattern for exactly-once delivery
    outboxEnabled: process.env.OUTBOX_ENABLED === 'true',
    outboxDatabaseUrl: process.env.OUTBOX_DATABASE_URL || undefined,
    outboxPollIntervalMs: Number.parseInt(process.env.OUTBOX_POLL_INTERVAL_MS ?? '1000', 10),
    outboxBatchSize: Number.parseInt(process.env.OUTBOX_BATCH_SIZE ?? '100', 10),
    dlqDatabaseUrl: process.env.DLQ_DATABASE_URL || process.env.OUTBOX_DATABASE_URL || undefined,
    // [T-V1-H5] DLQ redrive max attempts
    dlqMaxRedriveAttempts: Number.parseInt(process.env.DLQ_MAX_REDRIVE_ATTEMPTS ?? '5', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    // [T-V1-M9] Transform payload size cap (default 2MB, same as JSONata check)
    transformMaxPayloadBytes: Number.parseInt(process.env.TRANSFORM_MAX_PAYLOAD_BYTES ?? '2000000', 10),
    // [T-V1-H1] Enrichment URL allow-list and timeout cap
    enrichmentAllowedHosts: (process.env.ENRICHMENT_ALLOWED_HOSTS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    enrichmentMaxTimeoutMs: Number.parseInt(process.env.ENRICHMENT_MAX_TIMEOUT_MS ?? '10000', 10),
  };
}
