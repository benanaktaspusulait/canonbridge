import Fastify, { type FastifyInstance } from 'fastify';
import type { TransformEngine } from './transformEngine.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';

export async function buildServer(
  env: Env,
  _registry: PartnerRegistry,
  engine: TransformEngine,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: env.logLevel },
  });

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

  return app;
}
