package com.canonbridge.mappingstudio.kafka;

import io.quarkus.arc.properties.IfBuildProperty;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Kafka Consumer Service for consuming raw partner events
 */
@ApplicationScoped
@IfBuildProperty(name = "canonbridge.raw-event-consumer.enabled", stringValue = "true")
public class KafkaConsumerService {

    private static final Logger LOG = Logger.getLogger(KafkaConsumerService.class);

    /**
     * Consume raw events from partner topics
     * 
     * @param record Kafka record containing raw event
     */
    @Incoming("raw-events")
    public void consumeRawEvent(Record<String, String> record) {
        String key = record.key();
        String payload = record.value();
        
        LOG.infof("Received raw event - key: %s, payload length: %d", key, payload != null ? payload.length() : 0);
        
        try {
            // Process the raw event
            processRawEvent(key, payload);
            
            LOG.infof("Successfully processed raw event with key: %s", key);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to process raw event with key: %s", key);
            // In production, this should be sent to DLQ
            throw new RuntimeException("Failed to process raw event", e);
        }
    }

    /**
     * [MS-M2] FIX: No-op implementation that logs and commits instead of throwing.
     * This legacy consumer is disabled by default. The transformer service owns raw-event
     * transformation, validation, DLQ routing, and canonical publish for production flows.
     */
    private void processRawEvent(String key, String payload) {
        LOG.warnf("Raw event received but this consumer is a no-op — transformer service handles processing. key=%s, length=%d",
                key, payload != null ? payload.length() : 0);
    }
}
