package com.canonbridge.mappingstudio.kafka;

import com.canonbridge.mappingstudio.repository.OutboxEventRepository;
import com.canonbridge.mappingstudio.security.TenantContext;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

import java.util.UUID;

/**
 * Kafka Producer Service for publishing canonical events
 */
@ApplicationScoped
public class KafkaProducerService {

    private static final Logger LOG = Logger.getLogger(KafkaProducerService.class);

    @Channel("canonical-events")
    Emitter<Record<String, String>> canonicalEventsEmitter;

    @Inject
    OutboxEventRepository outboxEventRepository;

    @Inject
    TenantContext tenantContext;

    @ConfigProperty(name = "mp.messaging.outgoing.canonical-events.topic", defaultValue = "canonical.events")
    String canonicalTopic;

    /**
     * Publish a canonical event to Kafka
     * 
     * @param key Event key (typically entity ID)
     * @param payload JSON payload
     * @return Uni that completes when message is sent
     */
    public Uni<Void> publishCanonicalEvent(String key, String payload) {
        return publishCanonicalEvent(tenantContext.defaultTenantId(), key, payload, null, null);
    }

    /**
     * Publish a canonical event with metadata
     * 
     * @param key Event key
     * @param payload JSON payload
     * @param partnerId Partner identifier
     * @param eventType Event type
     * @return Uni that completes when message is sent
     */
    public Uni<Void> publishCanonicalEvent(String key, String payload, String partnerId, String eventType) {
        return publishCanonicalEvent(tenantContext.defaultTenantId(), key, payload, partnerId, eventType);
    }

    /**
     * Publish a canonical event and persist an outbox trace for recovery/audit.
     *
     * @param tenantId Tenant identifier
     * @param key Event key
     * @param payload JSON payload
     * @param partnerId Partner identifier
     * @param eventType Event type
     * @return Uni that completes when message is sent and outbox state is updated
     */
    public Uni<Void> publishCanonicalEvent(
            String tenantId,
            String key,
            String payload,
            String partnerId,
            String eventType) {
        String resolvedTenantId = tenantId != null && !tenantId.isBlank() ? tenantId : tenantContext.defaultTenantId();
        String resolvedKey = key != null && !key.isBlank() ? key : UUID.randomUUID().toString();
        String resolvedPayload = payload != null && !payload.isBlank() ? payload : "{}";
        String topic = canonicalTopic != null && !canonicalTopic.isBlank() ? canonicalTopic : "canonical.events";

        LOG.infof(
                "Publishing canonical event - tenant: %s, topic: %s, key: %s, partner: %s, type: %s",
                resolvedTenantId,
                topic,
                resolvedKey,
                partnerId,
                eventType);

        return outboxEventRepository.createPending(
                        resolvedTenantId,
                        topic,
                        resolvedKey,
                        resolvedPayload,
                        partnerId,
                        eventType)
                .chain(eventId -> Uni.createFrom().completionStage(() ->
                                canonicalEventsEmitter.send(Record.of(resolvedKey, resolvedPayload)))
                        .onFailure().call(throwable ->
                                outboxEventRepository.markFailed(eventId, throwable.getMessage()))
                        .chain(() -> outboxEventRepository.markPublished(eventId)))
                .onFailure().invoke(throwable ->
                        LOG.errorf(throwable, "Failed to publish canonical event with key: %s", resolvedKey))
                .replaceWithVoid();
    }
}
