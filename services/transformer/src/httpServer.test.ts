import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildServer } from './httpServer.js';
import { TransformEngine } from './transformEngine.js';
import { PartnerRegistry } from './partnerRegistry.js';
import type { Env } from './env.js';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import type { FastifyInstance } from 'fastify';

describe('HTTP Server', () => {
  let testDir: string;
  let app: FastifyInstance;
  let registry: PartnerRegistry;
  let engine: TransformEngine;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `http-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    await mkdir(path.join(testDir, 'partners/test-partner'), { recursive: true });

    const inputSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['partnerId', 'eventType', 'orderId'],
      properties: {
        partnerId: { type: 'string' },
        eventType: { type: 'string' },
        orderId: { type: 'string' },
        amount: { type: 'number' },
      },
    };

    const canonicalSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['id', 'total'],
      properties: {
        id: { type: 'string' },
        total: { type: 'number' },
      },
    };

    const mapping = `{
  "id": orderId,
  "total": amount
}`;

    const config = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      inputSchema: 'partners/test-partner/input.schema.json',
      canonicalSchema: 'partners/test-partner/canonical.schema.json',
      mapping: 'partners/test-partner/mapping.jsonata',
      topics: {
        raw: 'test.raw',
        canonical: 'test.canonical',
        dlq: 'test.dlq',
      },
    };

    await writeFile(path.join(testDir, 'partners/test-partner', 'input.schema.json'), JSON.stringify(inputSchema));
    await writeFile(path.join(testDir, 'partners/test-partner', 'canonical.schema.json'), JSON.stringify(canonicalSchema));
    await writeFile(path.join(testDir, 'partners/test-partner', 'mapping.jsonata'), mapping);
    await writeFile(path.join(testDir, 'partners/test-partner', 'config.json'), JSON.stringify(config));

    registry = new PartnerRegistry(testDir);
    await registry.load();
    engine = new TransformEngine(testDir, registry);

    const env: Env = {
      mappingsRoot: testDir,
      port: 8080,
      apiKey: undefined,
      corsOrigins: [],
      kafkaEnabled: false,
      kafkaBrokers: [],
      kafkaGroupId: 'test',
      kafkaFallbackDlqTopic: 'test.dlq',
      kafkaConnectRetries: 3,
      kafkaConnectRetryDelayMs: 100,
      kafkaSslEnabled: false,
      kafkaSaslMechanism: undefined,
      kafkaSaslUsername: undefined,
      kafkaSaslPassword: undefined,
      logLevel: 'silent',
    };

    app = await buildServer(env, registry, engine);
  });

  afterEach(async () => {
    await app.close();
    await rm(testDir, { recursive: true, force: true });
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  describe('POST /v1/transform', () => {
    it('should transform valid request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/transform',
        payload: {
          partnerId: 'test-partner',
          eventType: 'order-created',
          orderId: 'ORD-123',
          amount: 99.99,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.canonical).toEqual({
        id: 'ORD-123',
        total: 99.99,
      });
    });

    it('should return 400 on missing partnerId', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/transform',
        payload: {
          eventType: 'order-created',
          orderId: 'ORD-123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 on unknown partner', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/transform',
        payload: {
          partnerId: 'unknown',
          eventType: 'order-created',
          orderId: 'ORD-123',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.error.stage).toBe('resolve');
    });

    it('should return 422 on input validation failure', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/transform',
        payload: {
          partnerId: 'test-partner',
          eventType: 'order-created',
          // orderId missing
          amount: 99.99,
        },
      });

      expect(response.statusCode).toBe(422);
      const body = response.json();
      expect(body.error.stage).toBe('input_validation');
    });
  });

  describe('POST /v1/jsonata/check-batch', () => {
    it('should validate valid expressions', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/jsonata/check-batch',
        payload: {
          payload: { orderId: 'ORD-123', amount: 99.99 },
          expressions: [
            { ruleId: 'rule-1', expression: 'orderId' },
            { ruleId: 'rule-2', expression: 'amount * 2' },
          ],
          timeoutMs: 500,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.results['rule-1']).toMatchObject({ ok: true, result: 'ORD-123' });
      expect(body.results['rule-2']).toMatchObject({ ok: true, result: 199.98 });
    });

    it('should return error for invalid expression', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/jsonata/check-batch',
        payload: {
          payload: { orderId: 'ORD-123' },
          expressions: [{ ruleId: 'rule-1', expression: 'invalid syntax [' }],
          timeoutMs: 500,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.results['rule-1'].ok).toBe(false);
      expect(body.results['rule-1'].message).toBeDefined();
    });

    it('should return 400 on too many expressions', async () => {
      const expressions = Array.from({ length: 65 }, (_, i) => ({
        ruleId: `rule-${i}`,
        expression: 'orderId',
      }));

      const response = await app.inject({
        method: 'POST',
        url: '/v1/jsonata/check-batch',
        payload: {
          payload: { orderId: 'ORD-123' },
          expressions,
          timeoutMs: 500,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      const body = response.body;
      expect(body).toContain('transform_engine_cache_size');
      expect(body).toContain('partner_registry_size');
    });
  });

  describe('POST /v1/admin/reload', () => {
    it('should reload partner configs', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/admin/reload',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.ok).toBe(true);
      expect(body.partners).toBe(1);
    });
  });

  describe('API Key Authentication', () => {
    it('should reject request without API key when auth enabled', async () => {
      const envWithAuth: Env = {
        mappingsRoot: testDir,
        port: 8080,
        apiKey: 'secret-key',
        corsOrigins: [],
        kafkaEnabled: false,
        kafkaBrokers: [],
        kafkaGroupId: 'test',
        kafkaFallbackDlqTopic: 'test.dlq',
        kafkaConnectRetries: 3,
        kafkaConnectRetryDelayMs: 100,
        kafkaSslEnabled: false,
        kafkaSaslMechanism: undefined,
        kafkaSaslUsername: undefined,
        kafkaSaslPassword: undefined,
        logLevel: 'silent',
      };

      const authApp = await buildServer(envWithAuth, registry, engine);

      const response = await authApp.inject({
        method: 'POST',
        url: '/v1/transform',
        payload: {
          partnerId: 'test-partner',
          eventType: 'order-created',
          orderId: 'ORD-123',
          amount: 99.99,
        },
      });

      expect(response.statusCode).toBe(401);
      await authApp.close();
    });

    it('should accept request with valid API key', async () => {
      const envWithAuth: Env = {
        mappingsRoot: testDir,
        port: 8080,
        apiKey: 'secret-key',
        corsOrigins: [],
        kafkaEnabled: false,
        kafkaBrokers: [],
        kafkaGroupId: 'test',
        kafkaFallbackDlqTopic: 'test.dlq',
        kafkaConnectRetries: 3,
        kafkaConnectRetryDelayMs: 100,
        kafkaSslEnabled: false,
        kafkaSaslMechanism: undefined,
        kafkaSaslUsername: undefined,
        kafkaSaslPassword: undefined,
        logLevel: 'silent',
      };

      const authApp = await buildServer(envWithAuth, registry, engine);

      const response = await authApp.inject({
        method: 'POST',
        url: '/v1/transform',
        headers: {
          'x-api-key': 'secret-key',
        },
        payload: {
          partnerId: 'test-partner',
          eventType: 'order-created',
          orderId: 'ORD-123',
          amount: 99.99,
        },
      });

      expect(response.statusCode).toBe(200);
      await authApp.close();
    });
  });
});
