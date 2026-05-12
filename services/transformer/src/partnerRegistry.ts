import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export interface PartnerMappingConfig {
  partnerId: string;
  eventType: string;
  direction?: string;
  version?: string; // G-17: Schema versioning (ADR-007)
  schemaVersion?: string;
  inputSchema: string;
  mapping: string;
  canonicalSchema: string;
  topics: {
    raw: string;
    canonical: string;
    dlq: string;
  };
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

  constructor(private readonly mappingsRoot: string) {}

  async load(): Promise<void> {
    const next = new Map<string, PartnerMappingConfig>();
    const partnersDir = path.join(this.mappingsRoot, 'partners');
    const files = await walkFiles('', partnersDir);

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
    }

    if (next.size === 0) {
      throw new Error(`No inbound mapping configs found under ${path.join(partnersDir, '**', 'config.json')}`);
    }

    // Atomic swap — only replace if load succeeded
    this.byKey = next;
  }

  resolve(partnerId: string, eventType: string, version?: string): PartnerMappingConfig | undefined {
    return this.byKey.get(registryKey(partnerId, eventType, version));
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

}
