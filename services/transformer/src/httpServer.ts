import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { TransformEngine } from './transformEngine.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';
import { checkJsonataBatch, JSONATA_BATCH_MAX_ITEMS, type JsonataBatchItem } from './jsonataCheck.js';

export async function buildServer(
  env: Env,
  _registry: PartnerRegistry,
  engine: TransformEngine,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: env.logLevel },
  });

  await app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/v1/transform', async (request, reply) => {
    const result = await engine.transformEnvelope(request.body);
    if (!result.ok) {
      const code = result.stage === 'resolve' ? 400 : 422;
      return reply.code(code).send({
        error: { stage: result.stage, message: result.message, details: result.details },
      });
    }
    return reply.send({ canonical: result.canonical });
  });

  app.post('/v1/jsonata/check-batch', async (request, reply) => {
    const body = request.body;
    if (body === null || typeof body !== 'object') {
      return reply.code(400).send({ error: { message: 'Body must be a JSON object' } });
    }
    const payload = (body as Record<string, unknown>).payload;
    const rawItems = (body as Record<string, unknown>).expressions;
    let timeoutMs = Number((body as Record<string, unknown>).timeoutMs);

    if (timeoutMs !== timeoutMs || timeoutMs <= 0) timeoutMs = 500;
    timeoutMs = Math.min(5000, Math.max(50, timeoutMs));

    if (!Array.isArray(rawItems)) {
      return reply.code(400).send({ error: { message: 'expressions must be an array' } });
    }
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
  });

  return app;
}
