import { Kafka, type EachMessagePayload, logLevel as kafkaLogLevel } from 'kafkajs';
import type { TransformEngine } from './transformEngine.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';
import type { FastifyBaseLogger } from 'fastify';
import { recordKafkaMessage, recordTransform } from './metrics.js';

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function partnerKeys(
  parsed: unknown,
): { partnerId: string; eventType: string } | undefined {
  if (parsed === null || typeof parsed !== 'object') return undefined;
  const o = parsed as Record<string, unknown>;
  const partnerId = o.partnerId;
  const eventType = o.eventType;
  if (typeof partnerId !== 'string' || typeof eventType !== 'string') return undefined;
  return { partnerId, eventType };
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
): Promise<{ shutdown: () => Promise<void> }> {
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
        await producer.send({
          topic: fallbackDlq,
          messages: [
            {
              value: JSON.stringify({
                error: { stage: 'resolve', message: 'invalid_json' },
                raw: rawStr.slice(0, 2048), // cap raw in DLQ payload
                meta: { topic, partition, offset },
              }),
            },
          ],
        });
        // G-01: commit after DLQ write so we don't reprocess
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      // Heartbeat before potentially slow transform
      await heartbeat();

      const transformStart = Date.now();
      const keys = partnerKeys(parsed);
      const cfg = keys ? registry.resolve(keys.partnerId, keys.eventType) : undefined;
      const result = await engine.transformEnvelope(parsed);
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
        await producer.send({
          topic: dlqTopic,
          messages: [
            {
              value: JSON.stringify({
                original: parsed,
                error: { stage: result.stage, message: result.message, details: result.details },
                meta: { topic, partition, offset },
              }),
            },
          ],
        });
        // G-01: commit after DLQ write
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      if (!cfg) {
        // Should not happen (transform ok implies config was found), but guard anyway
        logger.error({ topic, partition, offset, partnerId: keys?.partnerId, eventType: keys?.eventType }, 'transform ok but partner config missing — routing to fallback DLQ');
        recordKafkaMessage('dlq'); // G-05: metric
        await producer.send({
          topic: fallbackDlq,
          messages: [
            {
              value: JSON.stringify({
                original: parsed,
                error: { stage: 'resolve', message: 'partner_config_missing_post_transform' },
                meta: { topic, partition, offset },
              }),
            },
          ],
        });
        await consumer.commitOffsets([{ topic, partition, offset: nextOffset(offset) }]);
        return;
      }

      await producer.send({
        topic: cfg.topics.canonical,
        messages: [{ value: JSON.stringify(result.canonical) }],
      });

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
  };
}

/** KafkaJS expects the *next* offset to commit, not the current one. */
function nextOffset(offset: string): string {
  return (BigInt(offset) + 1n).toString();
}
