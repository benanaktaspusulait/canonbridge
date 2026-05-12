import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ValidateFunction } from 'ajv';
import * as ajv2020Ns from 'ajv/dist/2020.js';

// Ajv subpath default export is the Ajv2020 class; NodeNext types omit construct signature.
const Ajv2020 = ajv2020Ns.default as unknown as new (opts?: import('ajv').Options) => import('ajv').Ajv;
import addFormats from 'ajv-formats';
import jsonata from 'jsonata';
import type { PartnerMappingConfig } from './partnerRegistry.js';
import type { PartnerRegistry } from './partnerRegistry.js';
import { mappingVersion } from './partnerRegistry.js';
import type { TransformCache, Compiled, CacheEntry } from './cache.js';
import type { WorkerPool } from './workerPool.js';

function formatAjvErrors(validate: ValidateFunction): string {
  const errs = validate.errors;
  if (!errs?.length) return 'Schema validation failed';
  return new Ajv2020({ allErrors: true, strict: false }).errorsText(errs);
}

export type TransformStage = 'resolve' | 'input_validation' | 'transform' | 'output_validation';

export type TransformResult =
  | { ok: true; canonical: unknown; durationMs: number }
  | {
      ok: false;
      stage: TransformStage;
      message: string;
      details?: unknown;
      durationMs: number;
    };

/**
 * Optional metadata for envelope resolution.
 * Used when partnerId/eventType are not in the envelope root.
 */
export interface EnvelopeContext {
  /** Kafka topic name (for topic-based resolution) */
  topic?: string;
  /** Kafka partition (for logging) */
  partition?: number;
  /** Kafka offset (for logging) */
  offset?: string;
}

export class TransformEngine {
  constructor(
    private readonly mappingsRoot: string,
    private readonly registry: PartnerRegistry,
    private readonly cache: TransformCache,
    private readonly workerPool?: WorkerPool,
  ) {}

  /** Expose cache size for metrics. */
  async cacheSize(): Promise<number> {
    return this.cache.size();
  }

  /** Invalidate a single compiled entry (called after hot-reload). */
  async evict(partnerId: string, eventType: string, version = 'v1'): Promise<void> {
    await this.cache.delete(`${partnerId}:${eventType}:${version}`);
  }

  /** Invalidate all compiled entries. */
  async evictAll(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Parse partnerId and eventType from Kafka topic name.
   * Expected format: tenant-{id}.raw.{partnerId}.{eventType}
   * Example: tenant-001.raw.acme-marketplace.order-created
   * Returns: { partnerId: 'acme-marketplace', eventType: 'order-created' }
   */
  private parseTopicName(topic: string): { partnerId: string; eventType: string } | undefined {
    const parts = topic.split('.');
    if (parts.length < 4) return undefined;
    // Skip tenant prefix and 'raw' segment
    const partnerId = parts[2];
    const eventType = parts.slice(3).join('.'); // Support multi-segment event types
    if (!partnerId || !eventType) return undefined;
    return { partnerId, eventType };
  }

  /**
   * Resolve partnerId and eventType from envelope or context.
   * Strategy 1: Check envelope root for partnerId/eventType fields
   * Strategy 2: Parse from topic name if provided in context
   */
  private resolvePartnerKeys(
    envelope: Record<string, unknown>,
    context?: EnvelopeContext,
  ): { partnerId: string; eventType: string; schemaVersion?: string } | undefined {
    // Strategy 1: Root-level fields (backward compatible)
    const partnerId = envelope.partnerId;
    const eventType = envelope.eventType;
    const schemaVersion = envelope.schemaVersion;
    if (typeof partnerId === 'string' && typeof eventType === 'string') {
      return {
        partnerId,
        eventType,
        schemaVersion: typeof schemaVersion === 'string' ? schemaVersion : undefined,
      };
    }

    // Strategy 2: Topic-based resolution
    if (context?.topic) {
      return this.parseTopicName(context.topic);
    }

    return undefined;
  }

  private async compile(key: string, config: PartnerMappingConfig): Promise<Compiled> {
    const cached = await this.cache.get(key);
    if (cached) return cached;

    let inputSchema: unknown;
    let canonicalSchema: unknown;
    let mappingText: string;

    const rawEntry = this.cache.getRaw ? await this.cache.getRaw(key) : undefined;
    if (rawEntry) {
      inputSchema = rawEntry.inputSchema;
      canonicalSchema = rawEntry.canonicalSchema;
      mappingText = rawEntry.mappingText;
    } else {
      const inputSchemaPath = path.join(this.mappingsRoot, config.inputSchema);
      const canonicalSchemaPath = path.join(this.mappingsRoot, config.canonicalSchema);
      const mappingPath = path.join(this.mappingsRoot, config.mapping);

      [inputSchema, canonicalSchema, mappingText] = await Promise.all([
        readFile(inputSchemaPath, 'utf8').then(JSON.parse),
        readFile(canonicalSchemaPath, 'utf8').then(JSON.parse),
        readFile(mappingPath, 'utf8'),
      ]);
    }

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    (addFormats as unknown as (instance: import('ajv').Ajv) => void)(ajv);
    const validateInput = ajv.compile(inputSchema);
    const validateOutput = ajv.compile(canonicalSchema);
    const expression = jsonata(mappingText);

    const compiled: Compiled = {
      validateInput,
      validateOutput,
      evaluate: (input: unknown) => expression.evaluate(input) as Promise<unknown>,
      mappingText, // G-16: Store for worker pool evaluation
    };
    
    const entry: CacheEntry = {
      inputSchema,
      canonicalSchema,
      mappingText,
    };
    
    await this.cache.set(key, compiled, entry);
    return compiled;
  }

  async transformEnvelope(raw: unknown, context?: EnvelopeContext): Promise<TransformResult> {
    const start = Date.now();
    const elapsed = () => Date.now() - start;

    if (raw === null || typeof raw !== 'object') {
      return { ok: false, stage: 'resolve', message: 'Body must be a JSON object', durationMs: elapsed() };
    }
    let envelope = raw as Record<string, unknown>;

    const keys = this.resolvePartnerKeys(envelope, context);
    if (!keys) {
      return {
        ok: false,
        stage: 'resolve',
        message: 'partnerId and eventType must be in envelope root or resolvable from topic',
        durationMs: elapsed(),
      };
    }

    const { partnerId, eventType, schemaVersion } = keys;
    
    // G-10: If keys were resolved from topic, inject them into envelope for validation
    if (!envelope.partnerId || !envelope.eventType) {
      envelope = { ...envelope, partnerId, eventType };
    }
    
    const config = this.registry.resolve(partnerId, eventType, schemaVersion);
    if (!config) {
      return {
        ok: false,
        stage: 'resolve',
        message: `No inbound mapping for partnerId=${partnerId} eventType=${eventType}${schemaVersion ? ` schemaVersion=${schemaVersion}` : ''}`,
        durationMs: elapsed(),
      };
    }

    const key = `${partnerId}:${eventType}:${mappingVersion(config)}`;
    let compiled: Compiled;
    try {
      compiled = await this.compile(key, config);
    } catch (err) {
      return {
        ok: false,
        stage: 'resolve',
        message: err instanceof Error ? err.message : String(err),
        details: err,
        durationMs: elapsed(),
      };
    }

    if (!compiled.validateInput(envelope)) {
      return {
        ok: false,
        stage: 'input_validation',
        message: formatAjvErrors(compiled.validateInput),
        details: compiled.validateInput.errors,
        durationMs: elapsed(),
      };
    }

    let transformed: unknown;
    try {
      // G-16: Use worker pool for CPU-intensive JSONata evaluation if available
      // Note: Worker pool is disabled by default (WORKER_POOL_ENABLED=false)
      // For most workloads, main thread evaluation is sufficient
      if (this.workerPool && compiled.mappingText) {
        const result = await this.workerPool.evaluate(compiled.mappingText, envelope);
        if (!result.ok) {
          return {
            ok: false,
            stage: 'transform',
            message: result.error ?? 'Worker pool evaluation failed',
            durationMs: elapsed(),
          };
        }
        transformed = result.result;
      } else {
        // Fallback to main thread evaluation (default)
        transformed = await compiled.evaluate(envelope);
      }
    } catch (err) {
      return {
        ok: false,
        stage: 'transform',
        message: err instanceof Error ? err.message : String(err),
        details: err,
        durationMs: elapsed(),
      };
    }

    if (!compiled.validateOutput(transformed)) {
      return {
        ok: false,
        stage: 'output_validation',
        message: formatAjvErrors(compiled.validateOutput),
        details: compiled.validateOutput.errors,
        durationMs: elapsed(),
      };
    }

    return { ok: true, canonical: transformed, durationMs: elapsed() };
  }
}
