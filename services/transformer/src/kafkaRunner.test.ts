import { describe, expect, it } from 'vitest';
import { parseTopicPartnerKeys, partnerKeys } from './kafkaRunner.js';

describe('Kafka runner partner key resolution', () => {
  it('should prefer envelope partner keys over topic keys', () => {
    expect(
      partnerKeys(
        {
          partnerId: 'envelope-partner',
          eventType: 'envelope-event',
          schemaVersion: 'v2',
        },
        'tenant-001.raw.topic-partner.topic-event',
      ),
    ).toEqual({
      partnerId: 'envelope-partner',
      eventType: 'envelope-event',
      schemaVersion: 'v2',
    });
  });

  it('should parse topic keys when envelope keys are missing', () => {
    expect(partnerKeys({ orderId: 'ORD-123' }, 'tenant-001.raw.shopmax.order-created')).toEqual({
      partnerId: 'shopmax',
      eventType: 'order-created',
    });
  });

  it('should preserve multi-segment event types from topic names', () => {
    expect(parseTopicPartnerKeys('tenant-001.raw.shopmax.order-created.v2')).toEqual({
      partnerId: 'shopmax',
      eventType: 'order-created.v2',
    });
  });

  it('should reject unsupported topic formats', () => {
    expect(parseTopicPartnerKeys('partner.shopmax.raw')).toBeUndefined();
    expect(parseTopicPartnerKeys('tenant-001.events.shopmax.order-created')).toBeUndefined();
  });
});

