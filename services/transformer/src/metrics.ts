/**
 * G-05: Lightweight Prometheus-compatible metrics.
 *
 * We avoid adding prom-client (heavy dep) and instead maintain counters/histograms
 * manually, serialising to the Prometheus text format on demand.
 *
 * Buckets for transform_duration_seconds: 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, +Inf
 */

const DURATION_BUCKETS_MS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500];

type LabelSet = Record<string, string>;

function labelStr(labels: LabelSet): string {
  const parts = Object.entries(labels).map(([k, v]) => `${k}="${v.replace(/"/g, '\\"')}"`);
  return parts.length ? `{${parts.join(',')}}` : '';
}

// ── Counters ──────────────────────────────────────────────────────────────────

const counters = new Map<string, number>();

function counterKey(name: string, labels: LabelSet): string {
  return `${name}${labelStr(labels)}`;
}

export function incCounter(name: string, labels: LabelSet = {}): void {
  const key = counterKey(name, labels);
  counters.set(key, (counters.get(key) ?? 0) + 1);
}

// ── Histograms ────────────────────────────────────────────────────────────────

type HistogramState = {
  buckets: Map<number, number>; // upper bound → count
  infCount: number;
  sum: number;
  count: number;
};

const histograms = new Map<string, HistogramState>();

function histKey(name: string, labels: LabelSet): string {
  return `${name}${labelStr(labels)}`;
}

function getOrCreateHist(name: string, labels: LabelSet): HistogramState {
  const key = histKey(name, labels);
  let h = histograms.get(key);
  if (!h) {
    h = {
      buckets: new Map(DURATION_BUCKETS_MS.map((b) => [b, 0])),
      infCount: 0,
      sum: 0,
      count: 0,
    };
    histograms.set(key, h);
  }
  return h;
}

export function observeHistogram(name: string, valueMs: number, labels: LabelSet = {}): void {
  const h = getOrCreateHist(name, labels);
  h.sum += valueMs;
  h.count += 1;
  let placed = false;
  for (const [bound] of h.buckets) {
    if (valueMs <= bound) {
      h.buckets.set(bound, (h.buckets.get(bound) ?? 0) + 1);
      placed = true;
    }
  }
  if (!placed) h.infCount += 1;
}

// ── Gauges ────────────────────────────────────────────────────────────────────

const gauges = new Map<string, number>();

export function setGauge(name: string, value: number, labels: LabelSet = {}): void {
  gauges.set(`${name}${labelStr(labels)}`, value);
}

// ── Serialise ─────────────────────────────────────────────────────────────────

export function renderMetrics(): string {
  const lines: string[] = [];

  // Counters
  for (const [key, value] of counters) {
    lines.push(`# TYPE ${key.split('{')[0]} counter`);
    lines.push(`${key} ${value}`);
  }

  // Histograms
  for (const [key, h] of histograms) {
    const baseName = key.split('{')[0];
    const labelPart = key.includes('{') ? key.slice(key.indexOf('{')) : '';
    const innerLabels = labelPart.slice(1, -1); // strip { }

    lines.push(`# TYPE ${baseName} histogram`);

    let cumulative = 0;
    for (const [bound, cnt] of h.buckets) {
      cumulative += cnt;
      const le = (bound / 1000).toFixed(3); // ms → seconds
      const bucketLabels = innerLabels
        ? `{${innerLabels},le="${le}"}`
        : `{le="${le}"}`;
      lines.push(`${baseName}_bucket${bucketLabels} ${cumulative}`);
    }
    // +Inf bucket
    const infLabels = innerLabels ? `{${innerLabels},le="+Inf"}` : `{le="+Inf"}`;
    lines.push(`${baseName}_bucket${infLabels} ${cumulative + h.infCount}`);
    lines.push(`${baseName}_sum${labelPart} ${(h.sum / 1000).toFixed(6)}`);
    lines.push(`${baseName}_count${labelPart} ${h.count}`);
  }

  // Gauges
  for (const [key, value] of gauges) {
    lines.push(`# TYPE ${key.split('{')[0]} gauge`);
    lines.push(`${key} ${value}`);
  }

  return lines.join('\n') + '\n';
}

// ── Named metric helpers ──────────────────────────────────────────────────────

/** transform_requests_total{status="ok|error", partner, event_type} */
export function recordTransform(
  status: 'ok' | 'error',
  stage: string,
  partnerId: string,
  eventType: string,
  durationMs: number,
): void {
  incCounter('transform_requests_total', { status, stage, partner: partnerId, event_type: eventType });
  observeHistogram('transform_duration_ms', durationMs, { partner: partnerId, event_type: eventType });
}

/** kafka_messages_total{result="ok|dlq|skip"} */
export function recordKafkaMessage(result: 'ok' | 'dlq' | 'skip'): void {
  incCounter('kafka_messages_total', { result });
}
