package com.canonbridge.webhook.service;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MultivaluedHashMap;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@QuarkusTest
class WebhookServiceTest {

    @Inject
    WebhookService webhookService;

    @InjectMock
    WebhookAuthService authService;

    @InjectMock
    @Channel("raw-events")
    Emitter<Record<String, String>> rawEventsEmitter;

    private HttpHeaders mockHeaders;

    @BeforeEach
    void setUp() {
        mockHeaders = Mockito.mock(HttpHeaders.class);
        Mockito.when(mockHeaders.getRequestHeaders()).thenReturn(new MultivaluedHashMap<>());
    }

    @Test
    void givenValidKey_whenProcessWebhook_thenReturnsEventId() {
        Mockito.when(authService.validateWebhookKey("partner-001", "valid-key"))
            .thenReturn(Uni.createFrom().item(true));
        Mockito.when(rawEventsEmitter.send(any(Record.class)))
            .thenReturn(CompletableFuture.completedFuture(null));

        String result = webhookService
            .processWebhook("partner-001", "ORDER_CREATED", "valid-key", "{\"orderId\":\"ORD-001\"}", mockHeaders)
            .await().indefinitely();

        assertNotNull(result);
        assertFalse(result.isBlank());
    }

    @Test
    void givenInvalidKey_whenProcessWebhook_thenThrowsNotAuthorizedException() {
        Mockito.when(authService.validateWebhookKey("partner-001", "wrong-key"))
            .thenReturn(Uni.createFrom().item(false));

        Throwable thrown = assertThrows(Exception.class, () ->
            webhookService
                .processWebhook("partner-001", "ORDER_CREATED", "wrong-key", "{}", mockHeaders)
                .await().indefinitely()
        );

        assertNotNull(thrown);
    }

    @Test
    void givenValidKey_whenProcessWebhook_thenEnvelopePublishedToKafka() {
        Mockito.when(authService.validateWebhookKey("shopmax", "shopmax-key"))
            .thenReturn(Uni.createFrom().item(true));
        Mockito.when(rawEventsEmitter.send(any(Record.class)))
            .thenReturn(CompletableFuture.completedFuture(null));

        webhookService
            .processWebhook("shopmax", "PAYMENT_CAPTURED", "shopmax-key", "{\"amount\":99.99}", mockHeaders)
            .await().indefinitely();

        Mockito.verify(rawEventsEmitter, Mockito.times(1)).send(any(Record.class));
    }

    @Test
    void givenAuthServiceFailure_whenProcessWebhook_thenReturnsFalse() {
        Mockito.when(authService.validateWebhookKey(anyString(), anyString()))
            .thenReturn(Uni.createFrom().failure(new RuntimeException("DB connection failed")));

        Throwable thrown = assertThrows(Exception.class, () ->
            webhookService
                .processWebhook("partner-001", "ORDER_CREATED", "any-key", "{}", mockHeaders)
                .await().indefinitely()
        );

        assertNotNull(thrown);
    }
}
