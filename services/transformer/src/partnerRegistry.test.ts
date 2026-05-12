import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PartnerRegistry } from './partnerRegistry.js';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

describe('PartnerRegistry', () => {
  let testDir: string;
  let registry: PartnerRegistry;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `registry-test-${Date.now()}`);
    await mkdir(path.join(testDir, 'partners'), { recursive: true });
    registry = new PartnerRegistry(testDir);
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should load valid partner config', async () => {
    await mkdir(path.join(testDir, 'partners', 'partner-a'), { recursive: true });
    const config = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: {
        raw: 'partner-a.raw',
        canonical: 'partner-a.canonical',
        dlq: 'partner-a.dlq',
      },
    };

    await writeFile(path.join(testDir, 'partners', 'partner-a', 'config.json'), JSON.stringify(config));
    await registry.load();

    const partners = registry.listPartners();
    expect(partners).toHaveLength(1);
    expect(partners[0]).toEqual({ partnerId: 'partner-a', eventType: 'order-created', version: 'v1' });
    expect(registry.resolve('partner-a', 'order-created')).toEqual(config);
  });

  it('should use schemaVersion as mapping version when present', async () => {
    await mkdir(path.join(testDir, 'partners', 'partner-a'), { recursive: true });
    const config = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      schemaVersion: 'v2',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: {
        raw: 'partner-a.raw',
        canonical: 'partner-a.canonical',
        dlq: 'partner-a.dlq',
      },
    };

    await writeFile(path.join(testDir, 'partners', 'partner-a', 'config.json'), JSON.stringify(config));
    await registry.load();

    expect(registry.resolve('partner-a', 'order-created')).toBeUndefined();
    expect(registry.resolve('partner-a', 'order-created', 'v2')).toEqual(config);
    expect(registry.listPartners()[0]).toEqual({
      partnerId: 'partner-a',
      eventType: 'order-created',
      version: 'v2',
    });
  });

  it('should load multiple partner configs', async () => {
    await mkdir(path.join(testDir, 'partners/partner-a'), { recursive: true });
    await mkdir(path.join(testDir, 'partners/partner-b'), { recursive: true });

    const configA = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: { raw: 'a.raw', canonical: 'a.canonical', dlq: 'a.dlq' },
    };

    const configB = {
      partnerId: 'partner-b',
      eventType: 'user-registered',
      inputSchema: 'partner-b/input.schema.json',
      canonicalSchema: 'partner-b/canonical.schema.json',
      mapping: 'partner-b/mapping.jsonata',
      topics: { raw: 'b.raw', canonical: 'b.canonical', dlq: 'b.dlq' },
    };

    await writeFile(path.join(testDir, 'partners/partner-a', 'config.json'), JSON.stringify(configA));
    await writeFile(path.join(testDir, 'partners/partner-b', 'config.json'), JSON.stringify(configB));
    await registry.load();

    const partners = registry.listPartners();
    expect(partners).toHaveLength(2);
    const partnerKeys = partners.map(p => `${p.partnerId}:${p.eventType}`).sort();
    expect(partnerKeys).toEqual(['partner-a:order-created', 'partner-b:user-registered']);
  });

  it('should return undefined for unknown partner', async () => {
    // Create at least one config so load() doesn't throw
    await mkdir(path.join(testDir, 'partners/partner-a'), { recursive: true });
    const config = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: { raw: 'a.raw', canonical: 'a.canonical', dlq: 'a.dlq' },
    };
    await writeFile(path.join(testDir, 'partners/partner-a', 'config.json'), JSON.stringify(config));
    
    await registry.load();
    expect(registry.resolve('unknown', 'event')).toBeUndefined();
  });

  it('should collect all raw topics', async () => {
    await mkdir(path.join(testDir, 'partners/partner-a'), { recursive: true });
    await mkdir(path.join(testDir, 'partners/partner-b'), { recursive: true });

    const configA = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: { raw: 'a.raw', canonical: 'a.canonical', dlq: 'a.dlq' },
    };

    const configB = {
      partnerId: 'partner-b',
      eventType: 'user-registered',
      inputSchema: 'partner-b/input.schema.json',
      canonicalSchema: 'partner-b/canonical.schema.json',
      mapping: 'partner-b/mapping.jsonata',
      topics: { raw: 'b.raw', canonical: 'b.canonical', dlq: 'b.dlq' },
    };

    await writeFile(path.join(testDir, 'partners/partner-a', 'config.json'), JSON.stringify(configA));
    await writeFile(path.join(testDir, 'partners/partner-b', 'config.json'), JSON.stringify(configB));
    await registry.load();

    expect(registry.allRawTopics().sort()).toEqual(['a.raw', 'b.raw']);
  });

  it('should throw on duplicate partner+eventType key', async () => {
    await mkdir(path.join(testDir, 'partners/partner-a'), { recursive: true });
    await mkdir(path.join(testDir, 'partners/partner-a-dup'), { recursive: true });

    const config = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: { raw: 'a.raw', canonical: 'a.canonical', dlq: 'a.dlq' },
    };

    await writeFile(path.join(testDir, 'partners/partner-a', 'config.json'), JSON.stringify(config));
    await writeFile(path.join(testDir, 'partners/partner-a-dup', 'config.json'), JSON.stringify(config));

    await expect(registry.load()).rejects.toThrow('Duplicate mapping for partner-a:order-created');
  });

  it('should throw on missing required fields', async () => {
    await mkdir(path.join(testDir, 'partners/partner-a'), { recursive: true });

    const invalidConfig = {
      partnerId: 'partner-a',
      // eventType missing
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: { raw: 'a.raw', canonical: 'a.canonical', dlq: 'a.dlq' },
    };

    await writeFile(path.join(testDir, 'partners/partner-a', 'config.json'), JSON.stringify(invalidConfig));

    await expect(registry.load()).rejects.toThrow();
  });

  it('should reload configs atomically', async () => {
    await mkdir(path.join(testDir, 'partners/partner-a'), { recursive: true });

    const config = {
      partnerId: 'partner-a',
      eventType: 'order-created',
      inputSchema: 'partner-a/input.schema.json',
      canonicalSchema: 'partner-a/canonical.schema.json',
      mapping: 'partner-a/mapping.jsonata',
      topics: { raw: 'a.raw', canonical: 'a.canonical', dlq: 'a.dlq' },
    };

    await writeFile(path.join(testDir, 'partners/partner-a', 'config.json'), JSON.stringify(config));
    await registry.load();

    const partners1 = registry.listPartners();
    expect(partners1).toHaveLength(1);
    expect(partners1[0]).toEqual({ partnerId: 'partner-a', eventType: 'order-created', version: 'v1' });

    // Add another partner
    await mkdir(path.join(testDir, 'partners/partner-b'), { recursive: true });
    const configB = {
      partnerId: 'partner-b',
      eventType: 'user-registered',
      inputSchema: 'partner-b/input.schema.json',
      canonicalSchema: 'partner-b/canonical.schema.json',
      mapping: 'partner-b/mapping.jsonata',
      topics: { raw: 'b.raw', canonical: 'b.canonical', dlq: 'b.dlq' },
    };

    await writeFile(path.join(testDir, 'partners/partner-b', 'config.json'), JSON.stringify(configB));
    await registry.load();

    const partners2 = registry.listPartners();
    expect(partners2).toHaveLength(2);
    const partnerKeys2 = partners2.map(p => `${p.partnerId}:${p.eventType}`).sort();
    expect(partnerKeys2).toEqual(['partner-a:order-created', 'partner-b:user-registered']);
  });
});
