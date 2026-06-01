import { Kafka, type Producer } from 'kafkajs';
import { randomUUID } from 'node:crypto';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Env } from './env.js';

// [T-V1-L9] Logger interface to avoid console.* bypassing pino
interface UsageLogger {
  warn(obj: Record<string, unknown>, msg: string): void;
  error(obj: Record<string, unknown>, msg: string): void;
}

export interface UsageEvent {
  id: string;
  org_id: string;
  service: string;
  metric: string;
  qty: number;
  ts: string;
  request_id: string;
  metadata: Record<string, unknown>;
}

/**
 * Publishes usage events to the usage.events Kafka topic.
 * Used for billing metering of transform requests.
 *
 * If Kafka is not available or org_id is not provided, events are silently dropped
 * (graceful degradation — billing should never block transforms).
 */
export class UsagePublisher {
  private producer: Producer | null = null;
  private readonly topic = 'usage.events';
  private readonly service = 'transformer';
  private droppedCount = 0;
  private readonly logLevel: string;
  private logger: UsageLogger | null = null;
  // [TF-H1] File-based buffer for dropped events (replay on reconnection)
  private readonly bufferFile: string;
  private replayInProgress = false;

  constructor(private readonly env: Env) {
    this.logLevel = env.logLevel;
    this.bufferFile = path.join('/tmp', 'usage-events-buffer.jsonl');
  }

  /** Set a structured logger (call after Fastify is initialized). */
  setLogger(logger: UsageLogger): void {
    this.logger = logger;
  }

  /**
   * T-Y1: Get the count of dropped usage events (for Prometheus metrics).
   */
  getDroppedCount(): number {
    return this.droppedCount;
  }

  /**
   * Initialize with an existing Kafka producer (shared with the main consumer).
   */
  setProducer(producer: Producer): void {
    this.producer = producer;
  }

  /**
   * [T-V1-H4 FIX] Resolve org_id from API key via Redis lookup.
   * mapping-studio-api's ApiKeyService stores api_key:{hash} → org_id in Redis.
   * Returns undefined if Redis is unavailable or key not found.
   */
  resolveOrgFromApiKey?: (apiKey: string) => Promise<string | undefined>;

  /**
   * Publish a transform request usage event.
   * Fire-and-forget — errors are logged but never thrown.
   *
   * T-Y1 FIX: If orgId is missing, increment a metric counter instead of silently dropping.
   */
  async publishTransformRequest(
    orgId: string | undefined,
    requestId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!orgId) {
      // T-Y1 FIX: Track dropped usage events for alerting
      this.droppedCount++;
      if (this.droppedCount % 100 === 1 || this.env.logLevel === 'debug') {
        this.logger?.warn(
          { droppedCount: this.droppedCount },
          'Transform request missing org_id — usage event dropped',
        );
      }
      return;
    }

    if (!this.producer) return;

    const event: UsageEvent = {
      id: randomUUID(),
      org_id: orgId,
      service: this.service,
      metric: 'transform_requests',
      qty: 1,
      ts: new Date().toISOString(),
      request_id: requestId || randomUUID(),
      metadata: metadata ?? {},
    };

    try {
      await this.producer.send({
        topic: this.topic,
        messages: [
          {
            key: orgId,
            value: JSON.stringify(event),
          },
        ],
      });
    } catch (err) {
      // [TF-H1] FIX: Buffer dropped events to file for later replay
      this.droppedCount++;
      await this.bufferEvent(event).catch(() => {});
      if (this.env.logLevel === 'debug' || this.droppedCount % 100 === 0) {
        this.logger?.error(
          { droppedCount: this.droppedCount, orgId, requestId, err },
          'Failed to publish usage event — buffered to disk',
        );
      }
    }
  }

  /**
   * Publish a batch of usage events (for Kafka consumer path).
   */
  async publishBatch(events: UsageEvent[]): Promise<void> {
    if (!this.producer || events.length === 0) return;

    try {
      await this.producer.send({
        topic: this.topic,
        messages: events.map((event) => ({
          key: event.org_id,
          value: JSON.stringify(event),
        })),
      });
    } catch (err) {
      if (this.env.logLevel === 'debug') {
        this.logger?.error({ err }, 'Failed to publish usage batch');
      }
    }
  }

  // [TF-H1] Buffer event to disk for later replay
  private async bufferEvent(event: UsageEvent): Promise<void> {
    try {
      await appendFile(this.bufferFile, JSON.stringify(event) + '\n', 'utf8');
    } catch {
      // /tmp not writable — truly lost
    }
  }

  /**
   * [TF-H1] Replay buffered events from disk. Called after Kafka reconnects.
   * Fire-and-forget: best-effort replay, clears buffer after attempt.
   */
  async replayBuffered(): Promise<number> {
    if (this.replayInProgress || !this.producer) return 0;
    if (!existsSync(this.bufferFile)) return 0;

    this.replayInProgress = true;
    let replayed = 0;
    try {
      const content = await readFile(this.bufferFile, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      if (lines.length === 0) return 0;

      const messages = lines.map((line) => {
        const event = JSON.parse(line) as UsageEvent;
        return { key: event.org_id, value: line };
      });

      // Batch publish
      await this.producer.send({ topic: this.topic, messages });
      replayed = messages.length;

      // Clear buffer after successful replay
      await writeFile(this.bufferFile, '', 'utf8');
      this.logger?.warn({ replayed }, 'Replayed buffered usage events');
    } catch (err) {
      this.logger?.error({ err }, 'Failed to replay buffered usage events');
    } finally {
      this.replayInProgress = false;
    }
    return replayed;
  }
}
