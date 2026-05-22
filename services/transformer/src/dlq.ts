import { Pool } from 'pg';

export interface DlqRecord {
  id: string;
  tenantId: string | null;
  sourceTopic: string;
  sourcePartition: number | null;
  sourceOffset: string | null;
  originalPayload: unknown;
  rawPayload: string | null;
  errorStage: string;
  errorMessage: string;
  errorDetails: unknown;
  redrivenAt: Date | null;
  redriveAttempts: number;
  createdAt: Date;
}

export type CreateDlqRecordInput = {
  tenantId?: string;
  sourceTopic: string;
  sourcePartition?: number;
  sourceOffset?: string;
  originalPayload?: unknown;
  rawPayload?: string;
  errorStage: string;
  errorMessage: string;
  errorDetails?: unknown;
};

export class DlqRepository {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      // [T-V1-L6] Reduced from 20 to 5 — multiply by services (outbox + dlq = 10 per pod).
      // Use PgBouncer for connection pooling in multi-replica deployments.
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
      await client.query(`
        CREATE TABLE IF NOT EXISTS dead_letter_queue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id VARCHAR(255),
          source_topic VARCHAR(255) NOT NULL,
          source_partition INTEGER,
          source_offset VARCHAR(100),
          original_payload JSONB,
          raw_payload TEXT,
          error_stage VARCHAR(100) NOT NULL,
          error_message TEXT NOT NULL,
          error_details JSONB,
          redriven_at TIMESTAMP,
          redrive_attempts INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_created_at
        ON dead_letter_queue (created_at DESC)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_unredriven
        ON dead_letter_queue (created_at DESC)
        WHERE redriven_at IS NULL
      `);
      // [T-V1-H5] Index for tenant-scoped queries
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_dead_letter_queue_tenant
        ON dead_letter_queue (tenant_id, created_at DESC)
      `);
    } finally {
      client.release();
    }
  }

  async create(input: CreateDlqRecordInput): Promise<string> {
    const result = await this.pool.query(
      `INSERT INTO dead_letter_queue (
        tenant_id, source_topic, source_partition, source_offset, original_payload, raw_payload,
        error_stage, error_message, error_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        input.tenantId ?? null,
        input.sourceTopic,
        input.sourcePartition ?? null,
        input.sourceOffset ?? null,
        input.originalPayload === undefined ? null : JSON.stringify(input.originalPayload),
        input.rawPayload ?? null,
        input.errorStage,
        input.errorMessage,
        input.errorDetails === undefined ? null : JSON.stringify(input.errorDetails),
      ],
    );

    return result.rows[0].id as string;
  }

  async list(limit: number, offset: number, tenantId?: string): Promise<DlqRecord[]> {
    // [T-V1-H5] Tenant-scoped queries when tenantId is provided
    const query = tenantId
      ? `SELECT id, tenant_id, source_topic, source_partition, source_offset, original_payload, raw_payload,
                error_stage, error_message, error_details, redriven_at, redrive_attempts, created_at
         FROM dead_letter_queue
         WHERE tenant_id = $3
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`
      : `SELECT id, tenant_id, source_topic, source_partition, source_offset, original_payload, raw_payload,
                error_stage, error_message, error_details, redriven_at, redrive_attempts, created_at
         FROM dead_letter_queue
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`;

    const params = tenantId ? [limit, offset, tenantId] : [limit, offset];
    const result = await this.pool.query(query, params);
    return result.rows.map(this.mapRow);
  }

  async getById(id: string, tenantId?: string): Promise<DlqRecord | undefined> {
    const query = tenantId
      ? `SELECT id, tenant_id, source_topic, source_partition, source_offset, original_payload, raw_payload,
                error_stage, error_message, error_details, redriven_at, redrive_attempts, created_at
         FROM dead_letter_queue
         WHERE id = $1 AND tenant_id = $2`
      : `SELECT id, tenant_id, source_topic, source_partition, source_offset, original_payload, raw_payload,
                error_stage, error_message, error_details, redriven_at, redrive_attempts, created_at
         FROM dead_letter_queue
         WHERE id = $1`;

    const params = tenantId ? [id, tenantId] : [id];
    const result = await this.pool.query(query, params);
    if (result.rows.length === 0) return undefined;
    return this.mapRow(result.rows[0]);
  }

  async markRedriven(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE dead_letter_queue
       SET redriven_at = NOW(), redrive_attempts = redrive_attempts + 1
       WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private mapRow(row: Record<string, unknown>): DlqRecord {
    return {
      id: String(row.id),
      tenantId: row.tenant_id === null ? null : String(row.tenant_id),
      sourceTopic: String(row.source_topic),
      sourcePartition: row.source_partition === null ? null : Number(row.source_partition),
      sourceOffset: row.source_offset === null ? null : String(row.source_offset),
      originalPayload: row.original_payload ?? null,
      rawPayload: row.raw_payload === null ? null : String(row.raw_payload),
      errorStage: String(row.error_stage),
      errorMessage: String(row.error_message),
      errorDetails: row.error_details ?? null,
      redrivenAt: (row.redriven_at as Date | null) ?? null,
      redriveAttempts: Number(row.redrive_attempts ?? 0),
      createdAt: row.created_at as Date,
    };
  }
}
