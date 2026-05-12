package com.canonbridge.mappingstudio.kafka;

import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

/**
 * Kafka Producer Service for publishing canonical events
 */
@ApplicationScoped
public class KafkaProducerService {

    private static final Logger LOG = Logger.getLogger(KafkaProducerService.class);

    @Channel("canonical-events")
    Emitter<Record<String, String>> canonicalEventsEmitter;

    /**
     * Publish a canonical event to Kafka
     * 
     * @param key Event key (typically entity ID)
     * @param payload JSON payload
     * @return Uni that completes when message is sent
     */
    public Uni<Void> publishCanonicalEvent(String key, String payload) {
        LOG.infof("Publishing canonical event with key: %s", key);
        
        return Uni.createFrom().completionStage(() -> canonicalEventsEmitter.send(Record.of(key, payload)))
        .onFailure().invoke(throwable -> 
            LOG.errorf(throwable, "Failed to publish canonical event with key: %s", key)
        ).replaceWithVoid();
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
        LOG.infof("Publishing canonical event - key: %s, partner: %s, type: %s", key, partnerId, eventType);
        
        return publishCanonicalEvent(key, payload);
    }
}
