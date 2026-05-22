/**
 * X-Y3: OpenTelemetry distributed tracing for transformer service.
 *
 * Must be imported FIRST in index.ts before any other imports
 * to ensure all modules are properly instrumented.
 *
 * Enabled via OTEL_ENABLED=true environment variable.
 * Exports traces to OTEL_EXPORTER_OTLP_ENDPOINT (default: http://localhost:4317).
 *
 * Auto-instruments:
 * - Fastify HTTP server
 * - KafkaJS producer/consumer
 * - pg (PostgreSQL) client
 * - Node.js core (http, dns, etc.)
 */

let sdk: unknown = null;

export function initTracing(): void {
  if (process.env.OTEL_ENABLED !== 'true') {
    return;
  }

  try {
    // Dynamic imports to avoid requiring OTEL deps when tracing is disabled
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resource } = require('@opentelemetry/resources');

    const resource = new Resource({
      'service.name': 'transformer',
      'service.version': '1.0.0',
      'deployment.environment': process.env.NODE_ENV ?? 'development',
    });

    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4317',
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable fs instrumentation (too noisy)
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    });

    (sdk as { start: () => void }).start();
    console.log('[Tracing] OpenTelemetry initialized — exporting to', process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4317');
  } catch (err) {
    // If OTEL packages are not installed, log and continue without tracing
    console.warn('[Tracing] OpenTelemetry packages not available — tracing disabled:', (err as Error).message);
  }
}

export async function shutdownTracing(): Promise<void> {
  if (sdk && typeof (sdk as { shutdown: () => Promise<void> }).shutdown === 'function') {
    await (sdk as { shutdown: () => Promise<void> }).shutdown();
  }
}
