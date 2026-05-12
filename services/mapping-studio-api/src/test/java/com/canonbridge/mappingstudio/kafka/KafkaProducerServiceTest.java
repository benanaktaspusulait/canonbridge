package com.canonbridge.mappingstudio.kafka;

import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.helpers.test.UniAssertSubscriber;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@QuarkusTest
class KafkaProducerServiceTest {

    @Inject
    KafkaProducerService kafkaProducerService;

    @Test
    void testPublishCanonicalEvent() {
        assertNotNull(kafkaProducerService);

        String key = "test-key-123";
        String payload = "{\"orderId\":\"12345\",\"status\":\"created\"}";

        kafkaProducerService.publishCanonicalEvent(key, payload)
            .subscribe().withSubscriber(UniAssertSubscriber.create())
            .awaitItem()
            .assertCompleted();
    }

    @Test
    void testPublishCanonicalEventWithMetadata() {
        assertNotNull(kafkaProducerService);

        String key = "test-key-456";
        String payload = "{\"orderId\":\"67890\",\"status\":\"shipped\"}";
        String partnerId = "shopmax";
        String eventType = "order.created";

        kafkaProducerService.publishCanonicalEvent(key, payload, partnerId, eventType)
            .subscribe().withSubscriber(UniAssertSubscriber.create())
            .awaitItem()
            .assertCompleted();
    }
}
