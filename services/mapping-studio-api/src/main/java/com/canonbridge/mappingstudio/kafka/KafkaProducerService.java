package com.canonbridge.mappingstudio.kafka;

import com.canonbridge.mappingstudio.repository.OutboxEventRepository;
import com.canonbridge.mappingstudio.repository.OutboxEventRepository.OutboxEvent;
import com.canonbridge.mappingstudio.security.TenantContext;
import io.micrometer.core.instrument.MeterRegistry;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
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

    @Inject
    MeterRegistry meterRegistry;

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
                                outboxEventRepository.markFailed(
                                        eventId,
                                        throwable.getMessage(),
                                        nextAttemptAt(0)))
                        .chain(() -> outboxEventRepository.markPublished(eventId))
                        .invoke(() -> increment("canonbridge.outbox.publish.success")))
                .onFailure().invoke(throwable -> {
                    increment("canonbridge.outbox.publish.failure");
                    LOG.errorf(throwable, "Failed to publish canonical event with key: %s", resolvedKey);
                })
                .replaceWithVoid();
    }

    public Uni<Void> replayOutboxEvent(OutboxEvent event) {
        if (event == null) {
            return Uni.createFrom().voidItem();
        }
        return Uni.createFrom().completionStage(() ->
                        canonicalEventsEmitter.send(Record.of(event.key(), event.payload())))
                .onFailure().call(throwable ->
                        outboxEventRepository.markFailed(
                                event.eventId(),
                                throwable.getMessage(),
                                nextAttemptAt(event.attempts())))
                .chain(() -> outboxEventRepository.markPublishedAfterReplay(event.eventId()))
                .invoke(() -> increment("canonbridge.outbox.replay.success"))
                .onFailure().invoke(throwable -> {
                    increment("canonbridge.outbox.replay.failure");
                    LOG.errorf(throwable, "Failed to replay outbox event with id: %s", event.eventId());
                })
                .replaceWithVoid();
    }

    private Instant nextAttemptAt(int attemptsBeforeFailure) {
        long backoffSeconds = Math.min(900L, 30L * (1L << Math.min(5, Math.max(0, attemptsBeforeFailure))));
        return Instant.now().plus(Duration.ofSeconds(backoffSeconds));
    }

    private void increment(String counterName) {
        if (meterRegistry != null) {
            meterRegistry.counter(counterName).increment();
        }
    }
}
