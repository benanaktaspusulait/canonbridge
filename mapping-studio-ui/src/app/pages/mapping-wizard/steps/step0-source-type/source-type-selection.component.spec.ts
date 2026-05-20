import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { SOURCE_TYPE_OPTIONS } from './source-type-selection.component';
import type { SourceType } from '../../models/mapping-wizard.models';

describe('SOURCE_TYPE_OPTIONS', () => {
  it('covers every supported backend source type exactly once', () => {
    const expected: SourceType[] = [
      'KAFKA',
      'WEBHOOK',
      'REST_API',
      'SCHEDULED_API',
      'GRAPHQL',
      'SOAP',
      'GRPC',
      'FILE_BATCH',
      'API_ENRICHMENT',
      'MANUAL'
    ];

    expect(SOURCE_TYPE_OPTIONS.map(option => option.id)).toEqual(expected);
    expect(new Set(SOURCE_TYPE_OPTIONS.map(option => option.id)).size).toBe(expected.length);
  });

  it('has display metadata for each selectable source type', () => {
    for (const option of SOURCE_TYPE_OPTIONS) {
      expect(option.icon).toMatch(/^pi /);
      expect(option.titleKey).toMatch(/^wizard\.sourceType\./);
      expect(option.descriptionKey).toMatch(/^wizard\.sourceType\./);
    }
  });
});
