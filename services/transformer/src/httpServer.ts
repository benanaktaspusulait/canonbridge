import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
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

  // G-15: OpenAPI/Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'CanonBridge Transformer API',
        description: 'JSONata transformation engine with Ajv validation for partner data integration',
        version: '0.1.0',
      },
      servers: [
        {
          url: 'http://localhost:8080',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'transform', description: 'Data transformation endpoints' },
        { name: 'admin', description: 'Administrative operations' },
        { name: 'health', description: 'Health and monitoring' },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-Api-Key',
            in: 'header',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  app.get('/health', {
    schema: {
      tags: ['health'],
      description: 'Health check endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  }, async () => ({ status: 'ok' }));

  // G-11: Fastify schema validation for /v1/transform
  app.post(
    '/v1/transform',
    {
      schema: {
        tags: ['transform'],
        description: 'Transform partner data to canonical format using JSONata mappings',
        security: env.apiKey ? [{ apiKey: [] }] : [],
        body: {
          type: 'object',
          required: ['partnerId', 'eventType'],
          properties: {
            partnerId: { type: 'string', description: 'Partner identifier', example: 'acme-marketplace' },
            eventType: { type: 'string', description: 'Event type', example: 'order-created' },
            version: { type: 'string', description: 'Schema version (optional)', example: 'v1' },
          },
          additionalProperties: true,
        },
        response: {
          200: {
            type: 'object',
            properties: {
              canonical: { type: 'object', description: 'Transformed canonical data' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'object' },
                },
              },
            },
          },
          422: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'object' },
                },
              },
            },
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
        tags: ['transform'],
        description: 'Batch validate JSONata expressions against a payload',
        security: env.apiKey ? [{ apiKey: [] }] : [],
        body: {
          type: 'object',
          required: ['expressions'],
          properties: {
            payload: { type: 'object', description: 'Test payload for expression evaluation' },
            expressions: {
              type: 'array',
              description: 'Array of expressions to validate',
              items: {
                type: 'object',
                required: ['ruleId', 'expression'],
                properties: {
                  ruleId: { type: 'string', description: 'Unique identifier for the rule' },
                  expression: { type: 'string', description: 'JSONata expression to evaluate' },
                },
              },
              maxItems: JSONATA_BATCH_MAX_ITEMS,
            },
            timeoutMs: { type: 'number', description: 'Evaluation timeout in milliseconds', minimum: 50, maximum: 5000, default: 500 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              results: {
                type: 'object',
                description: 'Results keyed by ruleId',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    result: { description: 'Evaluation result (if ok=true)' },
                    stage: { type: 'string', description: 'Error stage (if ok=false)' },
                    message: { type: 'string', description: 'Error message (if ok=false)' },
                  },
                },
              },
            },
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
  app.get('/metrics', {
    schema: {
      tags: ['health'],
      description: 'Prometheus metrics endpoint',
      response: {
        200: {
          type: 'string',
          description: 'Prometheus text format metrics',
        },
      },
    },
  }, async (_request, reply) => {
    // Update cache size gauge on each scrape
    setGauge('transform_engine_cache_size', await engine.cacheSize());
    setGauge('partner_registry_size', registry.listPartners().length);
    return reply
      .header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
      .send(renderMetrics());
  });

  // G-02: Admin reload endpoint
  app.post(
    '/v1/admin/reload',
    {
      schema: {
        tags: ['admin'],
        description: 'Reload partner configurations and clear cache',
        security: env.apiKey ? [{ apiKey: [] }] : [],
        response: {
          200: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              partners: { type: 'number', description: 'Number of loaded partner configs' },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
      preHandler: async (request, reply) => apiKeyAuth(env, request, reply),
    },
    async (request, reply) => {
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
    },
  );

  return app;
}
