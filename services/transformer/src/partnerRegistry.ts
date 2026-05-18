import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

export interface PartnerMappingConfig {
  partnerId: string;
  eventType: string;
  direction?: string;
  version?: string; // G-17: Schema versioning (ADR-007)
  schemaVersion?: string;
  inputSchema: string;
  mapping: string;
  canonicalSchema: string;
  enrichmentSteps?: EnrichmentStepConfig[];
  inlineInputSchema?: unknown;
  inlineCanonicalSchema?: unknown;
  inlineMappingText?: string;
  topics: {
    raw: string;
    canonical: string;
    dlq: string;
  };
}

export interface PartnerRegistryOptions {
  databaseUrl?: string;
  tenantId?: string;
  canonicalTopic?: string;
  fallbackDlqTopic?: string;
}

export interface EnrichmentStepConfig {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  mergePath?: string;
  required?: boolean;
}

function registryKey(partnerId: string, eventType: string, version?: string): string {
  // G-17: Include version in key if provided (default to 'v1' for backward compat)
  const v = version ?? 'v1';
  return `${partnerId}:${eventType}:${v}`;
}

export function mappingVersion(config: Pick<PartnerMappingConfig, 'version' | 'schemaVersion'>): string {
  return config.version ?? config.schemaVersion ?? 'v1';
}

async function walkFiles(relDir: string, baseDir: string): Promise<string[]> {
  const absDir = path.join(baseDir, relDir);
  const entries = await readdir(absDir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const childRel = path.join(relDir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkFiles(childRel, baseDir)));
    } else {
      out.push(childRel);
    }
  }
  return out;
}

export class PartnerRegistry {
  private byKey = new Map<string, PartnerMappingConfig>();
  private byTopic = new Map<string, PartnerMappingConfig>();
  private pool: Pool | undefined;

  constructor(
    private readonly mappingsRoot: string,
    private readonly options: PartnerRegistryOptions = {},
  ) {}

  async load(): Promise<void> {
    const next = new Map<string, PartnerMappingConfig>();
    const nextByTopic = new Map<string, PartnerMappingConfig>();

    await this.loadFileConfigs(next, nextByTopic);
    await this.loadDatabaseConfigs(next, nextByTopic);

    if (next.size === 0) {
      throw new Error(`No inbound mapping configs found under ${path.join(this.mappingsRoot, 'partners', '**', 'config.json')} or mapping_drafts database source`);
    }

    // Atomic swap — only replace if load succeeded
    this.byKey = next;
    this.byTopic = nextByTopic;
  }

  private async loadFileConfigs(next: Map<string, PartnerMappingConfig>, nextByTopic: Map<string, PartnerMappingConfig>): Promise<void> {
    const partnersDir = path.join(this.mappingsRoot, 'partners');
    let files: string[];
    try {
      files = await walkFiles('', partnersDir);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && this.options.databaseUrl) {
        return;
      }
      throw error;
    }

    for (const rel of files) {
      if (path.basename(rel) !== 'config.json') continue;
      const full = path.join(partnersDir, rel);
      const raw = JSON.parse(await readFile(full, 'utf8')) as PartnerMappingConfig;
      if (!raw.partnerId || !raw.eventType || !raw.inputSchema || !raw.mapping || !raw.canonicalSchema) {
        throw new Error(`Invalid mapping config at ${full}`);
      }
      if (raw.direction && raw.direction !== 'inbound') {
        continue;
      }
      if (!raw.topics?.raw || !raw.topics?.canonical || !raw.topics?.dlq) {
        throw new Error(`Config ${full} missing topics.raw, topics.canonical, or topics.dlq`);
      }
      const key = registryKey(raw.partnerId, raw.eventType, mappingVersion(raw));
      if (next.has(key)) {
        throw new Error(`Duplicate mapping for ${key} (second file: ${full})`);
      }
      next.set(key, raw);
      nextByTopic.set(raw.topics.raw, raw);
    }
  }

  private async loadDatabaseConfigs(next: Map<string, PartnerMappingConfig>, nextByTopic: Map<string, PartnerMappingConfig>): Promise<void> {
    if (!this.options.databaseUrl) return;

    const tenantFilter = this.options.tenantId ? 'AND d.tenant_id = $1' : '';
    const params = this.options.tenantId ? [this.options.tenantId] : [];
    const result = await this.databasePool().query(
      `
      SELECT
        d.id,
        d.tenant_id,
        COALESCE(p.external_id, p.name, d.partner_id::text) AS partner_key,
        d.event_type,
        d.source_config,
        d.input_schema,
        d.target_schema_json,
        d.generated_jsonata
      FROM mapping_drafts d
      LEFT JOIN partners p ON p.id = d.partner_id AND p.tenant_id = d.tenant_id
      WHERE d.source_type = 'KAFKA'
        AND d.status IN ('DRAFT', 'VALID', 'READY_TO_PUBLISH')
        AND d.generated_jsonata IS NOT NULL
        AND d.generated_jsonata <> ''
        ${tenantFilter}
      ORDER BY d.updated_at DESC
      `,
      params,
    );

    for (const row of result.rows) {
      const sourceConfig = asObject(row.source_config);
      const rawTopic = stringValue(sourceConfig.topic) ?? `tenant-${row.tenant_id}.raw.${row.partner_key}.${row.event_type}`;
      const config: PartnerMappingConfig = {
        partnerId: stringValue(sourceConfig.partnerId) ?? String(row.partner_key),
        eventType: String(row.event_type),
        version: 'draft',
        schemaVersion: 'draft',
        inputSchema: `db://${row.id}/input-schema`,
        canonicalSchema: `db://${row.id}/canonical-schema`,
        mapping: `db://${row.id}/mapping.jsonata`,
        inlineInputSchema: asSchema(row.input_schema),
        inlineCanonicalSchema: asSchema(row.target_schema_json),
        inlineMappingText: String(row.generated_jsonata),
        topics: {
          raw: rawTopic,
          canonical: stringValue(sourceConfig.canonicalTopic) ?? this.options.canonicalTopic ?? 'canonical.events',
          dlq: stringValue(sourceConfig.dlqTopic) ?? this.options.fallbackDlqTopic ?? 'canonbridge.dlq',
        },
      };

      const key = registryKey(config.partnerId, config.eventType, mappingVersion(config));
      if (!next.has(key)) {
        next.set(key, config);
      }
      nextByTopic.set(config.topics.raw, config);
    }
  }

  private databasePool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: this.options.databaseUrl,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      });
    }
    return this.pool;
  }

  resolve(partnerId: string, eventType: string, version?: string): PartnerMappingConfig | undefined {
    return this.byKey.get(registryKey(partnerId, eventType, version));
  }

  resolveByTopic(topic: string): PartnerMappingConfig | undefined {
    return this.byTopic.get(topic);
  }

  allRawTopics(): string[] {
    const topics = new Set<string>();
    for (const c of this.byKey.values()) {
      topics.add(c.topics.raw);
    }
    return [...topics];
  }

  listPartners(): { partnerId: string; eventType: string; version?: string }[] {
    return [...this.byKey.values()].map((c) => ({ 
      partnerId: c.partnerId, 
      eventType: c.eventType,
      version: mappingVersion(c),
    }));
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asSchema(value: unknown): unknown {
  if (!value) {
    return { type: 'object', additionalProperties: true };
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return { type: 'object', additionalProperties: true };
    }
  }
  return value;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
