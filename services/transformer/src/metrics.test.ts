import { describe, expect, it } from 'vitest';
import { observeHistogram, renderMetrics } from './metrics.js';

describe('metrics rendering', () => {
  it('should render cumulative histogram buckets correctly', () => {
    observeHistogram('test_duration_ms', 7, { route: 'transform' });

    const metrics = renderMetrics();

    expect(metrics).toContain('test_duration_ms_bucket{route="transform",le="0.005"} 0');
    expect(metrics).toContain('test_duration_ms_bucket{route="transform",le="0.010"} 1');
    expect(metrics).toContain('test_duration_ms_bucket{route="transform",le="0.025"} 1');
    expect(metrics).toContain('test_duration_ms_count{route="transform"} 1');
  });
});

