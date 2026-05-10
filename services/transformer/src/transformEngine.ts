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

function formatAjvErrors(validate: ValidateFunction): string {
  const errs = validate.errors;
  if (!errs?.length) return 'Schema validation failed';
  return new Ajv2020({ allErrors: true, strict: false }).errorsText(errs);
}

export type TransformResult =
  | { ok: true; canonical: unknown }
  | {
      ok: false;
      stage: 'resolve' | 'input_validation' | 'transform' | 'output_validation';
      message: string;
      details?: unknown;
    };

type Compiled = {
  validateInput: ValidateFunction;
  validateOutput: ValidateFunction;
  evaluate: (input: unknown) => Promise<unknown>;
};

export class TransformEngine {
  private readonly cache = new Map<string, Compiled>();

  constructor(
    private readonly mappingsRoot: string,
    private readonly registry: PartnerRegistry,
  ) {}

  private async compile(key: string, config: PartnerMappingConfig): Promise<Compiled> {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const inputSchemaPath = path.join(this.mappingsRoot, config.inputSchema);
    const canonicalSchemaPath = path.join(this.mappingsRoot, config.canonicalSchema);
    const mappingPath = path.join(this.mappingsRoot, config.mapping);

    const [inputSchema, canonicalSchema, mappingText] = await Promise.all([
      readFile(inputSchemaPath, 'utf8').then(JSON.parse),
      readFile(canonicalSchemaPath, 'utf8').then(JSON.parse),
      readFile(mappingPath, 'utf8'),
    ]);

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    (addFormats as unknown as (instance: import('ajv').Ajv) => void)(ajv);
    const validateInput = ajv.compile(inputSchema);
    const validateOutput = ajv.compile(canonicalSchema);
    const expression = jsonata(mappingText);

    const compiled: Compiled = {
      validateInput,
      validateOutput,
      evaluate: (input: unknown) => expression.evaluate(input) as Promise<unknown>,
    };
    this.cache.set(key, compiled);
    return compiled;
  }

  async transformEnvelope(raw: unknown): Promise<TransformResult> {
    if (raw === null || typeof raw !== 'object') {
      return { ok: false, stage: 'resolve', message: 'Body must be a JSON object' };
    }
    const envelope = raw as Record<string, unknown>;
    const partnerId = envelope.partnerId;
    const eventType = envelope.eventType;
    if (typeof partnerId !== 'string' || typeof eventType !== 'string') {
      return { ok: false, stage: 'resolve', message: 'partnerId and eventType must be strings' };
    }

    const config = this.registry.resolve(partnerId, eventType);
    if (!config) {
      return {
        ok: false,
        stage: 'resolve',
        message: `No inbound mapping for partnerId=${partnerId} eventType=${eventType}`,
      };
    }

    const key = `${partnerId}:${eventType}`;
    let compiled: Compiled;
    try {
      compiled = await this.compile(key, config);
    } catch (err) {
      return {
        ok: false,
        stage: 'resolve',
        message: err instanceof Error ? err.message : String(err),
        details: err,
      };
    }

    if (!compiled.validateInput(envelope)) {
      return {
        ok: false,
        stage: 'input_validation',
        message: formatAjvErrors(compiled.validateInput),
        details: compiled.validateInput.errors,
      };
    }

    let transformed: unknown;
    try {
      transformed = await compiled.evaluate(envelope);
    } catch (err) {
      return {
        ok: false,
        stage: 'transform',
        message: err instanceof Error ? err.message : String(err),
        details: err,
      };
    }

    if (!compiled.validateOutput(transformed)) {
      return {
        ok: false,
        stage: 'output_validation',
        message: formatAjvErrors(compiled.validateOutput),
        details: compiled.validateOutput.errors,
      };
    }

    return { ok: true, canonical: transformed };
  }
}
