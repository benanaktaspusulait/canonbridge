import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Env {
  mappingsRoot: string;
  port: number;
  // HTTP auth
  apiKey: string | undefined;
  corsOrigins: string[];
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
  // Logging
  logLevel: string;
}

export function loadEnv(): Env {
  const defaultMappings = path.resolve(__dirname, '../../../mappings');

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
    // G-06: API key auth — undefined means auth disabled (dev/internal use)
    apiKey: process.env.API_KEY || undefined,
    // G-06: explicit CORS origins; empty = allow all (dev default)
    corsOrigins,
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
    logLevel: process.env.LOG_LEVEL ?? 'info',
  };
}
