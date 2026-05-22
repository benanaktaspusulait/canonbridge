import { Kafka, type Producer } from 'kafkajs';
import { randomUUID } from 'node:crypto';
import type { Env } from './env.js';

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

  constructor(private readonly env: Env) {}

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
        console.warn(
          `[UsagePublisher] Transform request missing org_id — usage event dropped (total dropped: ${this.droppedCount})`,
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
      // V5-M5 FIX: Log dropped events with full context for recovery
      this.droppedCount++;
      if (this.env.logLevel === 'debug' || this.droppedCount % 100 === 0) {
        console.error(`[UsagePublisher] Failed to publish usage event (dropped=${this.droppedCount}):`, err);
        console.error(`[UsagePublisher] Dropped event: org=${orgId} metric=transform_requests requestId=${requestId}`);
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
        console.error('[UsagePublisher] Failed to publish usage batch:', err);
      }
    }
  }
}
