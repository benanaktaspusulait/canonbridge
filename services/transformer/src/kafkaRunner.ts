import { Kafka, type EachMessagePayload, logLevel as kafkaLogLevel } from 'kafkajs';
import type { TransformEngine } from './transformEngine.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';
import type { FastifyBaseLogger } from 'fastify';
import { recordKafkaMessage, recordTransform } from './metrics.js';
import type { OutboxRepository } from './outbox.js';
import type { DlqRepository } from './dlq.js';

type PublishMessage = {
  key?: string | null;
  value: string;
  headers?: Record<string, string>;
};

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

export function parseTopicPartnerKeys(topic: string): { partnerId: string; eventType: string } | undefined {
  const parts = topic.split('.');
  if (parts.length < 4 || parts[1] !== 'raw') return undefined;
  const partnerId = parts[2];
  const eventType = parts.slice(3).join('.');
  if (!partnerId || !eventType) return undefined;
  return { partnerId, eventType };
}

export function partnerKeys(
  parsed: unknown,
  topic?: string,
): { partnerId: string; eventType: string; schemaVersion?: string } | undefined {
  if (parsed !== null && typeof parsed === 'object') {
    const o = parsed as Record<string, unknown>;
    const partnerId = o.partnerId;
    const eventType = o.eventType;
    const schemaVersion = o.schemaVersion;
    if (typeof partnerId === 'string' && typeof eventType === 'string') {
      return {
        partnerId,
        eventType,
        schemaVersion: typeof schemaVersion === 'string' ? schemaVersion : undefined,
      };
    }
  }
  return topic ? parseTopicPartnerKeys(topic) : undefined;
}

// G-03: retry connect with exponential backoff
async function connectWithRetry(
  connectFn: () => Promise<void>,
  label: string,
  maxRetries: number,
  delayMs: number,
  logger: FastifyBaseLogger,
): Promise<void> {
  let attempt = 0;
  while (true) {
    try {
      await connectFn();
      return;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        logger.error({ label, attempt }, 'kafka connect failed — max retries exceeded');
        throw err;
      }
      const wait = delayMs * Math.min(Math.pow(2, attempt - 1), 16); // cap at 16× base
      logger.warn({ label, attempt, waitMs: wait }, 'kafka connect failed — retrying');
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}

export async function startKafkaConsumer(
  env: Env,
  registry: PartnerRegistry,
  engine: TransformEngine,
  logger: FastifyBaseLogger,
  outboxRepo?: OutboxRepository,
  dlqRepo?: DlqRepository,
): Promise<{ shutdown: () => Promise<void>; producer: any }> {
  // G-07: Kafka SSL/SASL config
  const kafkaConfig: import('kafkajs').KafkaConfig = {
    clientId: 'canonbridge-transformer',
    brokers: env.kafkaBrokers,
    logLevel: kafkaLogLevel.ERROR,
  };

  if (env.kafkaSslEnabled) {
    kafkaConfig.ssl = true;
  }

  if (env.kafkaSaslMechanism && env.kafkaSaslUsername && env.kafkaSaslPassword) {
    kafkaConfig.sasl = {
      mechanism: env.kafkaSaslMechanism as 'plain' | 'scram-sha-256' | 'scram-sha-512',
      username: env.kafkaSaslUsername,
      password: env.kafkaSaslPassword,
    } as import('kafkajs').SASLOptions;
  }

  const kafka = new Kafka(kafkaConfig);

  const consumer = kafka.consumer({ groupId: env.kafkaGroupId });
  const producer = kafka.producer();

  // G-03: connect with retry instead of throwing immediately
  await connectWithRetry(
    () => consumer.connect(),
    'consumer',
    env.kafkaConnectRetries,
    env.kafkaConnectRetryDelayMs,
    logger,
  );
  await connectWithRetry(
    () => producer.connect(),
    'producer',
    env.kafkaConnectRetries,
    env.kafkaConnectRetryDelayMs,
    logger,
  );

  const topics = registry.allRawTopics();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  // G-08: use explicit fallback DLQ from env, not first-loaded config
  const fallbackDlq = env.kafkaFallbackDlqTopic;

  const publish = async (topic: string, messages: PublishMessage[]): Promise<void> => {
    if (!outboxRepo) {
      await producer.send({ topic, messages });
      return;
    }

    const client = await outboxRepo.getClient();
    try {
      await client.query('BEGIN');
      for (const message of messages) {
        await outboxRepo.insert(client, {
          topic,
          key: message.key ?? null,
          value: message.value,
          headers: message.headers,
        });
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  };

  const writeDlqRecord = async (params: {
    sourceTopic: string;
    sourcePartition: number;
    sourceOffset: string;
    originalPayload?: unknown;
    rawPayload?: string;
    errorStage: string;
    errorMessage: string;
    errorDetails?: unknown;
  }): Promise<void> => {
    if (!dlqRepo) return;
    try {
      await dlqRepo.create({
        sourceTopic: params.sourceTopic,
        sourcePartition: params.sourcePartition,
        sourceOffset: params.sourceOffset,
        originalPayload: params.originalPayload,
        rawPayload: params.rawPayload,
        errorStage: params.errorStage,
        errorMessage: params.errorMessage,
        errorDetails: params.errorDetails,
      });
    } catch (err) {
      logger.error({ err, topic: params.sourceTopic, offset: params.sourceOffset }, 'failed to persist DLQ record');
    }
  };

  const run = consumer.run({
    // G-01: disable autoCommit — commit only after successful processing or DLQ write
    autoCommit: false,
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, partition, message, heartbeat } = payload;
      const offset = message.offset;

      const rawStr = message.value?.toString('utf8');
      if (rawStr === undefined) {
        logger.warn({ topic, partition, offset, partnerId: undefined, eventType: undefined }, 'empty kafka message value — skipping');
        recordKafkaMessage('skip'); // G-05: metric
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      const parsed = parseJson(rawStr);
      if (parsed === undefined) {
        logger.warn({ topic, partition, offset, partnerId: undefined, eventType: undefined }, 'invalid json — routing to fallback DLQ');
        recordKafkaMessage('dlq'); // G-05: metric
        await publish(fallbackDlq, [
          {
            value: JSON.stringify({
              error: { stage: 'resolve', message: 'invalid_json' },
              raw: rawStr.slice(0, 2048), // cap raw in DLQ payload
              meta: { topic, partition, offset },
            }),
          },
        ]);
        await writeDlqRecord({
          sourceTopic: topic,
          sourcePartition: partition,
          sourceOffset: offset,
          rawPayload: rawStr.slice(0, 2048),
          errorStage: 'resolve',
          errorMessage: 'invalid_json',
          errorDetails: { topic, partition, offset },
        });
        // G-01: commit after DLQ write so we don't reprocess
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      // Heartbeat before potentially slow transform
      await heartbeat();

      const transformStart = Date.now();
      const keys = partnerKeys(parsed, topic);
      const cfg = keys ? registry.resolve(keys.partnerId, keys.eventType, keys.schemaVersion) : undefined;
      const result = await engine.transformEnvelope(parsed, { topic, partition, offset });
      const transformDurationMs = Date.now() - transformStart;

      if (!result.ok) {
        const dlqTopic = cfg?.topics.dlq ?? fallbackDlq;
        logger.warn(
          {
            topic,
            partition,
            offset,
            stage: result.stage,
            partnerId: keys?.partnerId,
            eventType: keys?.eventType,
            durationMs: transformDurationMs,
          },
          'transform failed — routing to DLQ',
        );
        // G-05: record failed transform metric
        recordTransform('error', result.stage, keys?.partnerId ?? '', keys?.eventType ?? '', transformDurationMs);
        recordKafkaMessage('dlq');
        await publish(dlqTopic, [
          {
            value: JSON.stringify({
              original: parsed,
              error: { stage: result.stage, message: result.message, details: result.details },
              meta: { topic, partition, offset },
            }),
          },
        ]);
        await writeDlqRecord({
          sourceTopic: topic,
          sourcePartition: partition,
          sourceOffset: offset,
          originalPayload: parsed,
          errorStage: result.stage,
          errorMessage: result.message,
          errorDetails: result.details,
        });
        // G-01: commit after DLQ write
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      if (!cfg) {
        // Should not happen (transform ok implies config was found), but guard anyway
        logger.error({ topic, partition, offset, partnerId: keys?.partnerId, eventType: keys?.eventType }, 'transform ok but partner config missing — routing to fallback DLQ');
        recordKafkaMessage('dlq'); // G-05: metric
        await publish(fallbackDlq, [
          {
            value: JSON.stringify({
              original: parsed,
              error: { stage: 'resolve', message: 'partner_config_missing_post_transform' },
              meta: { topic, partition, offset },
            }),
          },
        ]);
        await writeDlqRecord({
          sourceTopic: topic,
          sourcePartition: partition,
          sourceOffset: offset,
          originalPayload: parsed,
          errorStage: 'resolve',
          errorMessage: 'partner_config_missing_post_transform',
          errorDetails: { topic, partition, offset },
        });
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      await publish(cfg.topics.canonical, [{ value: JSON.stringify(result.canonical) }]);

      // G-05: record successful transform metric
      recordTransform('ok', 'output_validation', cfg.partnerId, cfg.eventType, result.durationMs);
      recordKafkaMessage('ok');

      logger.info(
        { topic, partition, offset, partnerId: cfg.partnerId, eventType: cfg.eventType, durationMs: result.durationMs },
        'message transformed and published',
      );

      // G-01: commit only after successful canonical publish
      await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
    },
  });

  void run.catch((err) => {
    logger.error(err, 'kafka consumer run failed');
  });

  return {
    shutdown: async () => {
      try {
        await consumer.stop();
      } finally {
        await consumer.disconnect();
        await producer.disconnect();
      }
    },
    producer, // G-18: Expose producer for outbox relay
  };
}

/** KafkaJS expects the *next* offset to commit, not the current one. */
function nextOffset(offset: string): string {
  return (BigInt(offset) + 1n).toString();
}
