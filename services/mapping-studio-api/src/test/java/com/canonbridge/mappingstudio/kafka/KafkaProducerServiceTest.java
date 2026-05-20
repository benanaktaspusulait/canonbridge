package com.canonbridge.mappingstudio.kafka;

import com.canonbridge.mappingstudio.repository.OutboxEventRepository;
import com.canonbridge.mappingstudio.repository.OutboxEventRepository.OutboxEvent;
import com.canonbridge.mappingstudio.security.TenantContext;
import io.smallrye.mutiny.helpers.test.UniAssertSubscriber;
import io.smallrye.reactive.messaging.kafka.Record;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class KafkaProducerServiceTest {

    KafkaProducerService kafkaProducerService;
    OutboxEventRepository outboxEventRepository;
    Emitter<Record<String, String>> canonicalEventsEmitter;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        kafkaProducerService = new KafkaProducerService();
        outboxEventRepository = mock(OutboxEventRepository.class);
        canonicalEventsEmitter = mock(Emitter.class);
        TenantContext tenantContext = mock(TenantContext.class);

        when(tenantContext.defaultTenantId()).thenReturn("tenant-acme");

        kafkaProducerService.outboxEventRepository = outboxEventRepository;
        kafkaProducerService.canonicalEventsEmitter = canonicalEventsEmitter;
        kafkaProducerService.tenantContext = tenantContext;
        kafkaProducerService.canonicalTopic = "canonical.events";
    }

    @Test
    void testPublishCanonicalEvent() {
        assertNotNull(kafkaProducerService);

        String key = "test-key-123";
        String payload = "{\"orderId\":\"12345\",\"status\":\"created\"}";
        UUID eventId = UUID.randomUUID();

        when(outboxEventRepository.createPending("tenant-acme", "canonical.events", key, payload, null, null))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().item(eventId));
        when(canonicalEventsEmitter.send(any(Record.class)))
                .thenReturn(CompletableFuture.completedFuture(null));
        when(outboxEventRepository.markPublished(eventId))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().voidItem());

        kafkaProducerService.publishCanonicalEvent(key, payload)
            .subscribe().withSubscriber(UniAssertSubscriber.create())
            .awaitItem()
            .assertCompleted();

        ArgumentCaptor<Record<String, String>> recordCaptor = ArgumentCaptor.forClass(Record.class);
        verify(canonicalEventsEmitter).send(recordCaptor.capture());
        assertEquals(key, recordCaptor.getValue().key());
        assertEquals(payload, recordCaptor.getValue().value());
        verify(outboxEventRepository).markPublished(eventId);
        verify(outboxEventRepository, never()).markFailed(any(), any());
    }

    @Test
    void testPublishCanonicalEventWithMetadata() {
        assertNotNull(kafkaProducerService);

        String key = "test-key-456";
        String payload = "{\"orderId\":\"67890\",\"status\":\"shipped\"}";
        String partnerId = "shopmax";
        String eventType = "order.created";
        UUID eventId = UUID.randomUUID();

        when(outboxEventRepository.createPending("tenant-acme", "canonical.events", key, payload, partnerId, eventType))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().item(eventId));
        when(canonicalEventsEmitter.send(any(Record.class)))
                .thenReturn(CompletableFuture.completedFuture(null));
        when(outboxEventRepository.markPublished(eventId))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().voidItem());

        kafkaProducerService.publishCanonicalEvent(key, payload, partnerId, eventType)
            .subscribe().withSubscriber(UniAssertSubscriber.create())
            .awaitItem()
            .assertCompleted();

        verify(outboxEventRepository).createPending("tenant-acme", "canonical.events", key, payload, partnerId, eventType);
        verify(outboxEventRepository).markPublished(eventId);
        verify(outboxEventRepository, never()).markFailed(any(), any());
    }

    @Test
    void marksOutboxFailedWhenKafkaSendFails() {
        String key = "test-key-failed";
        String payload = "{\"orderId\":\"failed\"}";
        UUID eventId = UUID.randomUUID();
        CompletableFuture<Void> failedSend = new CompletableFuture<>();
        failedSend.completeExceptionally(new RuntimeException("broker unavailable"));

        when(outboxEventRepository.createPending("tenant-acme", "canonical.events", key, payload, null, null))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().item(eventId));
        when(canonicalEventsEmitter.send(any(Record.class))).thenReturn(failedSend);
        when(outboxEventRepository.markFailed(eq(eventId), contains("broker unavailable"), any()))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().voidItem());

        kafkaProducerService.publishCanonicalEvent(key, payload)
                .subscribe().withSubscriber(UniAssertSubscriber.create())
                .awaitFailure()
                .assertFailedWith(Throwable.class);

        verify(outboxEventRepository).markFailed(eq(eventId), contains("broker unavailable"), any());
        verify(outboxEventRepository, never()).markPublished(eventId);
    }

    @Test
    void replaysExistingOutboxEventWithoutCreatingANewRecord() {
        UUID eventId = UUID.randomUUID();
        OutboxEvent event = new OutboxEvent(
                eventId,
                "tenant-acme",
                "canonical.events",
                "replay-key",
                "{\"orderId\":\"replay\"}",
                "partner-1",
                "order.created",
                "FAILED",
                1,
                "broker down",
                java.time.Instant.now(),
                java.time.Instant.now());

        when(canonicalEventsEmitter.send(any(Record.class)))
                .thenReturn(CompletableFuture.completedFuture(null));
        when(outboxEventRepository.markPublishedAfterReplay(eventId))
                .thenReturn(io.smallrye.mutiny.Uni.createFrom().voidItem());

        kafkaProducerService.replayOutboxEvent(event)
                .subscribe().withSubscriber(UniAssertSubscriber.create())
                .awaitItem()
                .assertCompleted();

        ArgumentCaptor<Record<String, String>> recordCaptor = ArgumentCaptor.forClass(Record.class);
        verify(canonicalEventsEmitter).send(recordCaptor.capture());
        assertEquals("replay-key", recordCaptor.getValue().key());
        assertEquals("{\"orderId\":\"replay\"}", recordCaptor.getValue().value());
        verify(outboxEventRepository).markPublishedAfterReplay(eventId);
        verify(outboxEventRepository, never()).createPending(any(), any(), any(), any(), any(), any());
    }
}
