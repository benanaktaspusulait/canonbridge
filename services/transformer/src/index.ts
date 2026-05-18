import { loadEnv } from './env.js';
import { PartnerRegistry } from './partnerRegistry.js';
import { TransformEngine } from './transformEngine.js';
import { buildServer } from './httpServer.js';
import { startKafkaConsumer } from './kafkaRunner.js';
import { createCache } from './cache.js';
import { WorkerPool } from './workerPool.js';
import { OutboxRepository, OutboxRelay } from './outbox.js';
import { DlqRepository } from './dlq.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const registry = new PartnerRegistry(env.mappingsRoot, {
    databaseUrl: env.mappingDatabaseUrl,
    tenantId: env.mappingDatabaseTenantId,
    canonicalTopic: 'canonical.events',
    fallbackDlqTopic: env.kafkaFallbackDlqTopic,
  });
  await registry.load();
  
  // G-09: Create cache (Redis or in-memory based on REDIS_URL)
  const cache = createCache(env.redisUrl, env.redisCacheTtlSeconds);
  
  // G-16: Create worker pool for CPU-intensive JSONata evaluations
  let workerPool: WorkerPool | undefined;
  if (env.workerPoolEnabled) {
    workerPool = new WorkerPool(env.workerPoolSize || undefined);
    await workerPool.start();
  }
  
  const engine = new TransformEngine(env.mappingsRoot, registry, cache, workerPool);
  
  // G-18: Initialize outbox pattern if enabled
  let outboxRepo: OutboxRepository | undefined;
  let outboxRelay: OutboxRelay | undefined;
  if (env.outboxEnabled && !env.outboxDatabaseUrl) {
    throw new Error('OUTBOX_DATABASE_URL is required when OUTBOX_ENABLED=true');
  }
  if (env.outboxEnabled && env.outboxDatabaseUrl) {
    outboxRepo = new OutboxRepository(env.outboxDatabaseUrl);
    await outboxRepo.initialize();
    // Outbox relay will be started after Kafka producer is available
  }

  let dlqRepo: DlqRepository | undefined;
  if (env.dlqDatabaseUrl) {
    dlqRepo = new DlqRepository(env.dlqDatabaseUrl);
    await dlqRepo.initialize();
  }

  let kafkaProducer:
    | {
        send: (params: {
          topic: string;
          messages: Array<{ key?: string | null; value: string; headers?: Record<string, string> }>;
        }) => Promise<void>;
      }
    | undefined;

  const app = await buildServer(
    env,
    registry,
    engine,
    dlqRepo
      ? {
          repository: dlqRepo,
          redrivePublish: async (topic, payload) => {
            if (!kafkaProducer) {
              throw new Error('Kafka producer is not available for redrive');
            }
            await kafkaProducer.send({
              topic,
              messages: [{ value: JSON.stringify(payload) }],
            });
          },
        }
      : undefined,
  );

  let kafkaShutdown: (() => Promise<void>) | undefined;
  if (env.kafkaEnabled) {
    // G-03: startKafkaConsumer now retries internally — if it throws, we let it bubble
    // so the process exits and the orchestrator (k8s/compose) restarts it.
    const kafka = await startKafkaConsumer(env, registry, engine, app.log, outboxRepo, dlqRepo);
    kafkaShutdown = kafka.shutdown;
    kafkaProducer = kafka.producer;
    
    // G-18: Start outbox relay if enabled
    if (outboxRepo && kafka.producer) {
      outboxRelay = new OutboxRelay(
        outboxRepo,
        kafka.producer,
        env.outboxPollIntervalMs,
        env.outboxBatchSize,
        app.log,
      );
      await outboxRelay.start();
    }
    
    app.log.info({ topics: registry.allRawTopics() }, 'kafka consumer started');
  }

  await app.listen({ port: env.port, host: '0.0.0.0' });
  app.log.info(
    {
      port: env.port,
      mappingsRoot: env.mappingsRoot,
      partners: registry.listPartners().length,
      authEnabled: env.apiKey !== undefined,
      kafkaEnabled: env.kafkaEnabled,
      cacheType: env.redisUrl ? 'redis' : 'in-memory',
      workerPoolEnabled: env.workerPoolEnabled,
      workerPoolSize: workerPool?.size,
      outboxEnabled: env.outboxEnabled,
    },
    'server listening',
  );

  const stop = async () => {
    app.log.info('shutdown signal received');
    await app.close();
    if (outboxRelay) await outboxRelay.stop();
    if (kafkaShutdown) await kafkaShutdown();
    if (workerPool) await workerPool.shutdown();
    await cache.close(); // G-09: Close Redis connection
    await registry.close();
    if (outboxRepo) await outboxRepo.close();
    if (dlqRepo) await dlqRepo.close();
    app.log.info('shutdown complete');
  };

  process.on('SIGINT', () => {
    void stop().then(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    void stop().then(() => process.exit(0));
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
