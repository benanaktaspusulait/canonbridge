import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TransformEngine } from './transformEngine.js';
import { PartnerRegistry } from './partnerRegistry.js';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

describe('TransformEngine', () => {
  let testDir: string;
  let registry: PartnerRegistry;
  let engine: TransformEngine;

  beforeEach(async () => {
    // Create temp directory for test mappings
    testDir = path.join(tmpdir(), `transformer-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
    await mkdir(path.join(testDir, 'partners/test-partner'), { recursive: true });

    // Create test schemas and mapping
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
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should transform valid envelope successfully', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    const result = await engine.transformEnvelope(envelope);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toEqual({
        id: 'ORD-123',
        total: 99.99,
      });
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('should fail on missing partnerId', async () => {
    const envelope = {
      eventType: 'order-created',
      orderId: 'ORD-123',
    };

    const result = await engine.transformEnvelope(envelope);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('resolve');
      expect(result.message).toContain('partnerId and eventType must be strings');
    }
  });

  it('should fail on unknown partner config', async () => {
    const envelope = {
      partnerId: 'unknown-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
    };

    const result = await engine.transformEnvelope(envelope);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('resolve');
      expect(result.message).toContain('No inbound mapping');
    }
  });

  it('should fail input validation when required field missing', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      // orderId missing
      amount: 99.99,
    };

    const result = await engine.transformEnvelope(envelope);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('input_validation');
      expect(result.message).toContain('orderId');
    }
  });

  it('should fail output validation when canonical schema not satisfied', async () => {
    // Create a mapping that produces invalid output (missing required 'total' field)
    const badMapping = `{ "id": orderId }`;

    await writeFile(path.join(testDir, 'partners/test-partner', 'mapping.jsonata'), badMapping);
    engine.evict('test-partner', 'order-created'); // Clear cache

    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    const result = await engine.transformEnvelope(envelope);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('output_validation');
      expect(result.message).toContain('total');
    }
  });

  it('should cache compiled mappings', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    expect(engine.cacheSize).toBe(0);

    await engine.transformEnvelope(envelope);
    expect(engine.cacheSize).toBe(1);

    // Second call should use cache
    await engine.transformEnvelope(envelope);
    expect(engine.cacheSize).toBe(1);
  });

  it('should evict cache entry', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    await engine.transformEnvelope(envelope);
    expect(engine.cacheSize).toBe(1);

    engine.evict('test-partner', 'order-created');
    expect(engine.cacheSize).toBe(0);
  });

  it('should evict all cache entries', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    await engine.transformEnvelope(envelope);
    expect(engine.cacheSize).toBe(1);

    engine.evictAll();
    expect(engine.cacheSize).toBe(0);
  });
});
