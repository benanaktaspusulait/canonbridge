import { Kafka, type EachMessagePayload, logLevel as kafkaLogLevel } from 'kafkajs';
import type { TransformEngine } from './transformEngine.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';
import type { FastifyBaseLogger } from 'fastify';

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

export async function startKafkaConsumer(
  env: Env,
  registry: PartnerRegistry,
  engine: TransformEngine,
  logger: FastifyBaseLogger,
): Promise<{ shutdown: () => Promise<void> }> {
  const kafka = new Kafka({
    clientId: 'canonbridge-transformer',
    brokers: env.kafkaBrokers,
    logLevel: kafkaLogLevel.ERROR,
  });
  const consumer = kafka.consumer({ groupId: env.kafkaGroupId });
  const producer = kafka.producer();

  await consumer.connect();
  await producer.connect();

  const topics = registry.allRawTopics();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  const run = consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      const { topic, partition, message } = payload;
      const rawStr = message.value?.toString('utf8');
      if (rawStr === undefined) {
        logger.warn({ topic, partition }, 'empty kafka message value');
        return;
      }

      const parsed = parseJson(rawStr);
      if (parsed === undefined) {
        const dlq = registry.fallbackDlqTopic();
        await producer.send({
          topic: dlq,
          messages: [
            {
              value: JSON.stringify({
                error: { stage: 'resolve', message: 'invalid_json' },
                raw: rawStr,
                meta: { topic, partition, offset: message.offset },
              }),
            },
          ],
        });
        return;
      }

      const keys = partnerKeys(parsed);
      const cfg = keys ? registry.resolve(keys.partnerId, keys.eventType) : undefined;
      const result = await engine.transformEnvelope(parsed);

      if (!result.ok) {
        const dlqTopic = cfg?.topics.dlq ?? registry.fallbackDlqTopic();
        await producer.send({
          topic: dlqTopic,
          messages: [
            {
              value: JSON.stringify({
                original: parsed,
                error: { stage: result.stage, message: result.message, details: result.details },
                meta: { topic, partition, offset: message.offset },
              }),
            },
          ],
        });
        return;
      }

      if (!cfg) {
        logger.error({ topic }, 'transform ok but partner config missing');
        return;
      }

      await producer.send({
        topic: cfg.topics.canonical,
        messages: [{ value: JSON.stringify(result.canonical) }],
      });
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
