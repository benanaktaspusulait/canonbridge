import { loadEnv } from './env.js';
import { PartnerRegistry } from './partnerRegistry.js';
import { TransformEngine } from './transformEngine.js';
import { buildServer } from './httpServer.js';
import { startKafkaConsumer } from './kafkaRunner.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const registry = new PartnerRegistry(env.mappingsRoot);
  await registry.load();
  const engine = new TransformEngine(env.mappingsRoot, registry);
  const app = await buildServer(env, registry, engine);

  let kafkaShutdown: (() => Promise<void>) | undefined;
  if (env.kafkaEnabled) {
    // G-03: startKafkaConsumer now retries internally — if it throws, we let it bubble
    // so the process exits and the orchestrator (k8s/compose) restarts it.
    const kafka = await startKafkaConsumer(env, registry, engine, app.log);
    kafkaShutdown = kafka.shutdown;
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
    },
    'server listening',
  );

  const stop = async () => {
    app.log.info('shutdown signal received');
    await app.close();
    if (kafkaShutdown) await kafkaShutdown();
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
