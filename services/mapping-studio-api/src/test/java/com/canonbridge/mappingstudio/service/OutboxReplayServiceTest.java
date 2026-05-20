package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.OutboxEventRepository;
import com.canonbridge.mappingstudio.repository.OutboxEventRepository.OutboxEvent;
import io.smallrye.mutiny.Uni;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OutboxReplayServiceTest {

    OutboxReplayService replayService;
    OutboxEventRepository outboxEventRepository;
    KafkaProducerService kafkaProducerService;

    @BeforeEach
    void setUp() {
        replayService = new OutboxReplayService();
        outboxEventRepository = mock(OutboxEventRepository.class);
        kafkaProducerService = mock(KafkaProducerService.class);

        replayService.outboxEventRepository = outboxEventRepository;
        replayService.kafkaProducerService = kafkaProducerService;
        replayService.batchSize = 50;
        replayService.maxAttempts = 10;
    }

    @Test
    void replaysDueEvents() {
        OutboxEvent event = event("PENDING", 0);
        when(outboxEventRepository.findReplayable(50, 10)).thenReturn(Uni.createFrom().item(List.of(event)));
        when(kafkaProducerService.replayOutboxEvent(event)).thenReturn(Uni.createFrom().voidItem());

        int replayed = replayService.replayDueEvents().await().indefinitely();

        assertEquals(1, replayed);
        verify(kafkaProducerService).replayOutboxEvent(event);
    }

    @Test
    void continuesBatchWhenOneReplayFails() {
        OutboxEvent first = event("FAILED", 1);
        OutboxEvent second = event("PENDING", 0);
        when(outboxEventRepository.findReplayable(50, 10)).thenReturn(Uni.createFrom().item(List.of(first, second)));
        when(kafkaProducerService.replayOutboxEvent(first)).thenReturn(Uni.createFrom().failure(new RuntimeException("broker down")));
        when(kafkaProducerService.replayOutboxEvent(second)).thenReturn(Uni.createFrom().voidItem());

        int replayed = replayService.replayDueEvents().await().indefinitely();

        assertEquals(2, replayed);
        verify(kafkaProducerService).replayOutboxEvent(first);
        verify(kafkaProducerService).replayOutboxEvent(second);
    }

    private OutboxEvent event(String status, int attempts) {
        return new OutboxEvent(
                UUID.randomUUID(),
                "tenant-acme",
                "canonical.events",
                "event-key",
                "{\"ok\":true}",
                "partner-1",
                "order.created",
                status,
                attempts,
                null,
                Instant.now(),
                Instant.now());
    }
}
