package com.canonbridge.mappingstudio.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Duration;

/**
 * Custom Prometheus metrics for proxy execution.
 * 
 * Exposed at /q/metrics in Prometheus format.
 * 
 * Metrics:
 * - proxy_requests_total{mapping_id, status} — Counter
 * - proxy_request_duration_seconds{mapping_id} — Timer/Histogram
 * - proxy_external_api_duration_seconds{mapping_id} — Timer/Histogram
 * - proxy_errors_total{mapping_id, error_stage} — Counter
 */
@ApplicationScoped
public class ProxyMetricsService {

    private final MeterRegistry registry;

    @Inject
    public ProxyMetricsService(MeterRegistry registry) {
        this.registry = registry;
    }

    public void recordProxyRequest(String mappingId, String status, long durationMs) {
        Counter.builder("proxy_requests_total")
            .description("Total proxy requests")
            .tag("mapping_id", mappingId)
            .tag("status", status)
            .register(registry)
            .increment();

        Timer.builder("proxy_request_duration_seconds")
            .description("Proxy request duration")
            .tag("mapping_id", mappingId)
            .tag("status", status)
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry)
            .record(Duration.ofMillis(durationMs));
    }

    public void recordExternalApiCall(String mappingId, long durationMs, int statusCode) {
        Timer.builder("proxy_external_api_duration_seconds")
            .description("External API call duration")
            .tag("mapping_id", mappingId)
            .tag("http_status", String.valueOf(statusCode / 100) + "xx")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry)
            .record(Duration.ofMillis(durationMs));
    }

    public void recordTransformDuration(String mappingId, String stage, long durationMs) {
        Timer.builder("proxy_transform_duration_seconds")
            .description("Transformation stage duration")
            .tag("mapping_id", mappingId)
            .tag("stage", stage)
            .register(registry)
            .record(Duration.ofMillis(durationMs));
    }

    public void recordError(String mappingId, String errorStage, String errorType) {
        Counter.builder("proxy_errors_total")
            .description("Total proxy errors")
            .tag("mapping_id", mappingId)
            .tag("error_stage", errorStage)
            .tag("error_type", errorType)
            .register(registry)
            .increment();
    }
}
