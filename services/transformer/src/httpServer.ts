import cors from '@fastify/cors';
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import type { TransformEngine } from './transformEngine.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';
import { checkJsonataBatch, JSONATA_BATCH_MAX_ITEMS, type JsonataBatchItem } from './jsonataCheck.js';
import { renderMetrics, recordTransform, setGauge } from './metrics.js';

// G-06: API key auth hook
async function apiKeyAuth(env: Env, request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!env.apiKey) return; // auth disabled
  const provided = request.headers['x-api-key'];
  if (provided !== env.apiKey) {
    return reply.code(401).send({ error: { message: 'Unauthorized' } });
  }
}

export async function buildServer(
  env: Env,
  registry: PartnerRegistry,
  engine: TransformEngine,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: env.logLevel },
  });

  // G-06: CORS — explicit origins or allow all if empty
  const corsOrigin = env.corsOrigins.length > 0 ? env.corsOrigins : true;
  await app.register(cors, { origin: corsOrigin });

  app.get('/health', async () => ({ status: 'ok' }));

  // G-11: Fastify schema validation for /v1/transform
  app.post(
    '/v1/transform',
    {
      schema: {
        body: {
          type: 'object',
          required: ['partnerId', 'eventType'],
          properties: {
            partnerId: { type: 'string' },
            eventType: { type: 'string' },
          },
        },
      },
      preHandler: async (request, reply) => apiKeyAuth(env, request, reply),
    },
    async (request, reply) => {
      const start = Date.now();
      const result = await engine.transformEnvelope(request.body);
      const durationMs = Date.now() - start;

      const body = request.body as Record<string, unknown>;
      const partnerId = body.partnerId;
      const eventType = body.eventType;

      if (!result.ok) {
        const code = result.stage === 'resolve' ? 400 : 422;
        request.log.warn(
          { partnerId, eventType, stage: result.stage, durationMs },
          'transform failed via HTTP',
        );
        // G-05: record failed transform metric
        recordTransform('error', result.stage, String(partnerId ?? ''), String(eventType ?? ''), durationMs);
        return reply.code(code).send({
          error: { stage: result.stage, message: result.message, details: result.details },
        });
      }

      // G-05: record successful transform metric
      recordTransform('ok', 'output_validation', String(partnerId ?? ''), String(eventType ?? ''), durationMs);
      request.log.info({ partnerId, eventType, durationMs }, 'transform succeeded via HTTP');
      return reply.send({ canonical: result.canonical });
    },
  );

  // G-11: Fastify schema validation for /v1/jsonata/check-batch
  app.post(
    '/v1/jsonata/check-batch',
    {
      schema: {
        body: {
          type: 'object',
          required: ['expressions'],
          properties: {
            payload: {},
            expressions: { type: 'array' },
            timeoutMs: { type: 'number' },
          },
        },
      },
      preHandler: async (request, reply) => apiKeyAuth(env, request, reply),
    },
    async (request, reply) => {
      const body = request.body as Record<string, unknown>;
      const payload = body.payload;
      const rawItems = body.expressions as unknown[];
      let timeoutMs = Number(body.timeoutMs);

      if (timeoutMs !== timeoutMs || timeoutMs <= 0) timeoutMs = 500;
      timeoutMs = Math.min(5000, Math.max(50, timeoutMs));

      if (rawItems.length > JSONATA_BATCH_MAX_ITEMS) {
        return reply.code(400).send({
          error: { message: `At most ${JSONATA_BATCH_MAX_ITEMS} expressions per request` },
        });
      }

      const items: JsonataBatchItem[] = [];
      for (const row of rawItems) {
        if (row === null || typeof row !== 'object') {
          return reply.code(400).send({ error: { message: 'Each expression row must be an object' } });
        }
        const r = row as Record<string, unknown>;
        const ruleId = r.ruleId;
        const expression = r.expression;
        if (typeof ruleId !== 'string' || typeof expression !== 'string') {
          return reply
            .code(400)
            .send({ error: { message: 'ruleId and expression must be strings on each row' } });
        }
        items.push({ ruleId, expression });
      }

      const results = await checkJsonataBatch(payload, items, timeoutMs);
      return reply.send({ results });
    },
  );

  // G-05: Prometheus metrics endpoint
  app.get('/metrics', async (_request, reply) => {
    // Update cache size gauge on each scrape
    setGauge('transform_engine_cache_size', await engine.cacheSize());
    setGauge('partner_registry_size', registry.listPartners().length);
    return reply
      .header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
      .send(renderMetrics());
  });

  // G-02: Admin reload endpoint (no auth — internal use only, add auth in production)
  app.post('/v1/admin/reload', async (request, reply) => {
    try {
      await registry.load();
      // Evict compiled cache so next transform picks up new mapping files
      await engine.evictAll();
      app.log.info({ count: registry.listPartners().length }, 'partner configs reloaded');
      return reply.send({ ok: true, partners: registry.listPartners().length });
    } catch (err) {
      app.log.error(err, 'reload failed');
      return reply.code(500).send({
        error: { message: err instanceof Error ? err.message : String(err) },
      });
    }
  });

  return app;
}
