package com.canonbridge.mappingstudio.billing;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

import java.util.Map;
import java.util.UUID;

/**
 * Publishes usage events to the Kafka usage.events topic.
 * Each billable action (mapping run, transform, webhook delivery) should call this service.
 *
 * Events are keyed by org_id for partition affinity (all events for an org go to the same partition).
 */
@ApplicationScoped
public class UsagePublisher {

    @Channel("usage-events")
    Emitter<Record<String, String>> usageEventsEmitter;

    @Inject
    ObjectMapper objectMapper;

    @Inject
    EntitlementService entitlementService;

    /**
     * Publish a usage event and increment the entitlement counter.
     *
     * @param orgId     Organization UUID
     * @param service   Service name (e.g., "mapping-studio-api", "transformer", "webhook-receiver")
     * @param metric    Metric key (e.g., "mapping_runs", "transform_requests")
     * @param qty       Quantity consumed
     * @param requestId Unique request ID for idempotency
     */
    public Uni<Void> publish(UUID orgId, String service, String metric, int qty, String requestId) {
        return publish(orgId, service, metric, qty, requestId, Map.of());
    }

    /**
     * Publish a usage event with metadata and increment the entitlement counter.
     */
    public Uni<Void> publish(UUID orgId, String service, String metric, int qty, String requestId, Map<String, Object> metadata) {
        UsageEvent event = UsageEvent.create(orgId, service, metric, qty, requestId, metadata);

        try {
            String payload = objectMapper.writeValueAsString(event);
            String key = orgId.toString();

            return Uni.createFrom().completionStage(() ->
                    usageEventsEmitter.send(Record.of(key, payload))
                )
                .flatMap(v -> entitlementService.incrementUsage(orgId, metric, qty))
                .onFailure().invoke(error ->
                    Log.errorf(error, "Failed to publish usage event: org=%s metric=%s requestId=%s",
                        orgId, metric, requestId)
                );

        } catch (JsonProcessingException e) {
            Log.errorf(e, "Failed to serialize usage event for org=%s metric=%s", orgId, metric);
            return Uni.createFrom().voidItem();
        }
    }

    /**
     * Convenience method for publishing a single-unit usage event.
     */
    public Uni<Void> publishOne(UUID orgId, String service, String metric, String requestId) {
        return publish(orgId, service, metric, 1, requestId);
    }
}
