import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Env {
  mappingsRoot: string;
  port: number;
  kafkaEnabled: boolean;
  kafkaBrokers: string[];
  kafkaGroupId: string;
  logLevel: string;
}

export function loadEnv(): Env {
  const defaultMappings = path.resolve(__dirname, '../../../mappings');
  return {
    mappingsRoot: process.env.MAPPINGS_ROOT ?? defaultMappings,
    port: Number.parseInt(process.env.PORT ?? '8080', 10),
    kafkaEnabled: process.env.KAFKA_ENABLED === 'true',
    kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map((s) => s.trim()),
    kafkaGroupId: process.env.KAFKA_GROUP_ID ?? 'canonbridge-transformer',
    logLevel: process.env.LOG_LEVEL ?? 'info',
  };
}
