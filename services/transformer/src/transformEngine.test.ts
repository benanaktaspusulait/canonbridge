import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TransformEngine } from './transformEngine.js';
import { PartnerRegistry } from './partnerRegistry.js';
import { InMemoryCache } from './cache.js';
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
      required: ['orderId'], // partnerId and eventType are optional (can come from topic)
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
    const cache = new InMemoryCache();
    engine = new TransformEngine(testDir, registry, cache);
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
      expect(result.message).toContain('partnerId and eventType');
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
    await engine.evict('test-partner', 'order-created'); // Clear cache

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

    expect(await engine.cacheSize()).toBe(0);

    await engine.transformEnvelope(envelope);
    expect(await engine.cacheSize()).toBe(1);

    // Second call should use cache
    await engine.transformEnvelope(envelope);
    expect(await engine.cacheSize()).toBe(1);
  });

  it('should evict cache entry', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    await engine.transformEnvelope(envelope);
    expect(await engine.cacheSize()).toBe(1);

    await engine.evict('test-partner', 'order-created');
    expect(await engine.cacheSize()).toBe(0);
  });

  it('should evict all cache entries', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    await engine.transformEnvelope(envelope);
    expect(await engine.cacheSize()).toBe(1);

    await engine.evictAll();
    expect(await engine.cacheSize()).toBe(0);
  });

  // G-10: Topic-based resolution tests
  it('should extract partnerId and eventType from topic when not in envelope', async () => {
    const envelope = {
      // partnerId and eventType missing from envelope
      orderId: 'ORD-123',
      amount: 99.99,
    };

    const context = { topic: 'tenant-001.raw.test-partner.order-created' };
    const result = await engine.transformEnvelope(envelope, context);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toEqual({
        id: 'ORD-123',
        total: 99.99,
      });
    }
  });

  it('should prefer envelope partnerId/eventType over topic', async () => {
    const envelope = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      orderId: 'ORD-123',
      amount: 99.99,
    };

    // Topic has different values, but envelope should take precedence
    const context = { topic: 'tenant-001.raw.wrong-partner.wrong-event' };
    const result = await engine.transformEnvelope(envelope, context);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toEqual({
        id: 'ORD-123',
        total: 99.99,
      });
    }
  });

  it('should fail when topic format is invalid', async () => {
    const envelope = {
      orderId: 'ORD-123',
      amount: 99.99,
    };

    const context = { topic: 'invalid-topic-format' };
    const result = await engine.transformEnvelope(envelope, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('resolve');
      expect(result.message).toContain('partnerId and eventType');
    }
  });

  it('should fail when no topic hint provided and envelope missing fields', async () => {
    const envelope = {
      orderId: 'ORD-123',
      amount: 99.99,
    };

    const result = await engine.transformEnvelope(envelope);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.stage).toBe('resolve');
      expect(result.message).toContain('partnerId and eventType');
    }
  });

  it('should handle multi-segment event types from topic', async () => {
    // Create a separate partner folder for multi-segment event type
    await mkdir(path.join(testDir, 'partners/test-partner-v2'), { recursive: true });

    const multiSegmentConfig = {
      partnerId: 'test-partner',
      eventType: 'order-created.v2',
      inputSchema: 'partners/test-partner/input.schema.json',
      canonicalSchema: 'partners/test-partner/canonical.schema.json',
      mapping: 'partners/test-partner/mapping.jsonata',
      topics: {
        raw: 'test.raw.v2',
        canonical: 'test.canonical.v2',
        dlq: 'test.dlq.v2',
      },
    };

    await writeFile(
      path.join(testDir, 'partners/test-partner-v2', 'config.json'),
      JSON.stringify(multiSegmentConfig),
    );
    
    // Reload registry to pick up new config
    await registry.load();
    // Create new engine with updated registry
    const cache = new InMemoryCache();
    const newEngine = new TransformEngine(testDir, registry, cache);

    const envelope = {
      orderId: 'ORD-456',
      amount: 199.99,
    };

    const context = { topic: 'tenant-001.raw.test-partner.order-created.v2' };
    const result = await newEngine.transformEnvelope(envelope, context);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toEqual({
        id: 'ORD-456',
        total: 199.99,
      });
    }
  });

  it('should resolve schemaVersion-specific mappings from the envelope', async () => {
    await mkdir(path.join(testDir, 'partners/test-partner-v2'), { recursive: true });

    const v2Mapping = `{
  "id": orderId & "-v2",
  "total": amount
}`;

    const v2Config = {
      partnerId: 'test-partner',
      eventType: 'order-created',
      schemaVersion: 'v2',
      inputSchema: 'partners/test-partner/input.schema.json',
      canonicalSchema: 'partners/test-partner/canonical.schema.json',
      mapping: 'partners/test-partner-v2/mapping.jsonata',
      topics: {
        raw: 'test.raw.v2',
        canonical: 'test.canonical.v2',
        dlq: 'test.dlq.v2',
      },
    };

    await writeFile(path.join(testDir, 'partners/test-partner-v2', 'mapping.jsonata'), v2Mapping);
    await writeFile(path.join(testDir, 'partners/test-partner-v2', 'config.json'), JSON.stringify(v2Config));
    await registry.load();

    const result = await engine.transformEnvelope({
      partnerId: 'test-partner',
      eventType: 'order-created',
      schemaVersion: 'v2',
      orderId: 'ORD-789',
      amount: 249.99,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.canonical).toEqual({
        id: 'ORD-789-v2',
        total: 249.99,
      });
    }
  });
});
