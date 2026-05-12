/**
 * G-18: Outbox Pattern Implementation (ADR-005)
 * 
 * Ensures exactly-once delivery semantics by:
 * 1. Writing transformed messages to outbox table in same DB transaction
 * 2. Separate relay process reads outbox and publishes to Kafka
 * 3. Marks messages as published after successful Kafka ack
 * 
 * This prevents message loss if Kafka is unavailable during transformation.
 */

import { Pool, type PoolClient } from 'pg';

export interface OutboxMessage {
  id?: string;
  topic: string;
  key: string | null;
  value: string; // JSON serialized
  headers?: Record<string, string>;
  createdAt?: Date;
  publishedAt?: Date | null;
}

export class OutboxRepository {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  /**
   * Initialize outbox table schema.
   * Should be called on service startup.
   */
  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
      await client.query(`
        CREATE TABLE IF NOT EXISTS outbox (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          topic VARCHAR(255) NOT NULL,
          key VARCHAR(255),
          value JSONB NOT NULL,
          headers JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          published_at TIMESTAMP
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_outbox_unpublished
        ON outbox (created_at)
        WHERE published_at IS NULL
      `);
    } finally {
      client.release();
    }
  }

  /**
   * Insert a message into the outbox table.
   * Should be called within a transaction.
   */
  async insert(client: PoolClient, message: OutboxMessage): Promise<string> {
    const result = await client.query(
      `INSERT INTO outbox (topic, key, value, headers)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        message.topic,
        message.key,
        message.value,
        message.headers ? JSON.stringify(message.headers) : null,
      ],
    );
    return result.rows[0].id;
  }

  /**
   * Fetch unpublished messages for relay.
   * Limit controls batch size.
   */
  async fetchUnpublished(limit: number = 100): Promise<OutboxMessage[]> {
    const result = await this.pool.query(
      `SELECT id, topic, key, value, headers, created_at, published_at
       FROM outbox
       WHERE published_at IS NULL
       ORDER BY created_at ASC
       LIMIT $1`,
      [limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      topic: row.topic,
      key: row.key,
      value: typeof row.value === 'string' ? row.value : JSON.stringify(row.value),
      headers: row.headers
        ? (typeof row.headers === 'string' ? JSON.parse(row.headers) : row.headers)
        : undefined,
      createdAt: row.created_at,
      publishedAt: row.published_at,
    }));
  }

  /**
   * Mark a message as published.
   * Called after successful Kafka ack.
   */
  async markPublished(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE outbox SET published_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  /**
   * Mark multiple messages as published in batch.
   */
  async markPublishedBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.pool.query(
      `UPDATE outbox SET published_at = NOW() WHERE id = ANY($1)`,
      [ids],
    );
  }

  /**
   * Clean up old published messages.
   * Should be called periodically (e.g., daily cron).
   */
  async cleanupPublished(olderThanDays: number = 7): Promise<number> {
    const result = await this.pool.query(
      `DELETE FROM outbox
       WHERE published_at IS NOT NULL
       AND published_at < NOW() - ($1::int * INTERVAL '1 day')`,
      [olderThanDays],
    );
    return result.rowCount ?? 0;
  }

  /**
   * Get a client for transaction management.
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Close the connection pool.
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Get pool statistics for monitoring.
   */
  getStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

/**
 * Outbox relay process.
 * Continuously polls outbox table and publishes to Kafka.
 */
export class OutboxRelay {
  private running = false;
  private intervalHandle?: NodeJS.Timeout;

  constructor(
    private readonly outbox: OutboxRepository,
    private readonly kafkaProducer: {
      send: (params: {
        topic: string;
        messages: Array<{ key?: string | null; value: string; headers?: Record<string, string> }>;
      }) => Promise<void>;
    },
    private readonly pollIntervalMs: number = 1000,
    private readonly batchSize: number = 100,
  ) {}

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    this.intervalHandle = setInterval(() => {
      void this.poll();
    }, this.pollIntervalMs);

    console.log(`Outbox relay started (poll interval: ${this.pollIntervalMs}ms, batch size: ${this.batchSize})`);
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
    console.log('Outbox relay stopped');
  }

  private async poll(): Promise<void> {
    if (!this.running) return;

    try {
      const messages = await this.outbox.fetchUnpublished(this.batchSize);
      if (messages.length === 0) return;

      // Group messages by topic for efficient batching
      const byTopic = new Map<string, OutboxMessage[]>();
      for (const msg of messages) {
        const existing = byTopic.get(msg.topic) ?? [];
        existing.push(msg);
        byTopic.set(msg.topic, existing);
      }

      // Publish each topic batch
      const publishedIds: string[] = [];
      for (const [topic, batch] of byTopic) {
        try {
          await this.kafkaProducer.send({
            topic,
            messages: batch.map((m) => ({
              key: m.key,
              value: m.value,
              headers: m.headers,
            })),
          });

          // Collect IDs for batch update
          publishedIds.push(...batch.map((m) => m.id!));
        } catch (err) {
          console.error(`Failed to publish batch to topic ${topic}:`, err);
          // Don't mark as published on error — will retry next poll
        }
      }

      // Mark all successfully published messages
      if (publishedIds.length > 0) {
        await this.outbox.markPublishedBatch(publishedIds);
        console.log(`Published ${publishedIds.length} messages from outbox`);
      }
    } catch (err) {
      console.error('Outbox relay poll error:', err);
    }
  }
}
