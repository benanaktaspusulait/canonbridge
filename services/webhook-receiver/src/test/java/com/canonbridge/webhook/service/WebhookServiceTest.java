package com.canonbridge.webhook.service;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import io.smallrye.reactive.messaging.memory.InMemoryConnector;
import io.smallrye.reactive.messaging.memory.InMemorySink;
import jakarta.enterprise.inject.Any;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MultivaluedHashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@QuarkusTest
class WebhookServiceTest {

    @Inject
    WebhookService webhookService;

    @InjectMock
    WebhookAuthService authService;

    @Inject
    @Any
    InMemoryConnector connector;

    private HttpHeaders mockHeaders;

    @BeforeEach
    void setUp() {
        mockHeaders = Mockito.mock(HttpHeaders.class);
        Mockito.when(mockHeaders.getRequestHeaders()).thenReturn(new MultivaluedHashMap<>());
        connector.<Record<String, String>>sink("raw-events").clear();
    }

    @Test
    void givenValidKey_whenProcessWebhook_thenReturnsEventId() {
        Mockito.when(authService.validateWebhookKey("partner-001", "valid-key"))
            .thenReturn(Uni.createFrom().item(true));

        String result = webhookService
            .processWebhook("partner-001", "ORDER_CREATED", "valid-key", null, "{\"orderId\":\"ORD-001\"}", mockHeaders)
            .await().indefinitely();

        assertNotNull(result);
        assertFalse(result.isBlank());
    }

    @Test
    void givenInvalidKey_whenProcessWebhook_thenThrowsNotAuthorizedException() {
        Mockito.when(authService.validateWebhookKey("partner-001", "wrong-key"))
            .thenReturn(Uni.createFrom().item(false));

        assertThrows(NotAuthorizedException.class, () ->
            webhookService
                .processWebhook("partner-001", "ORDER_CREATED", "wrong-key", null, "{}", mockHeaders)
                .await().indefinitely()
        );
    }

    @Test
    void givenValidKey_whenProcessWebhook_thenEnvelopePublishedToKafka() {
        Mockito.when(authService.validateWebhookKey("shopmax", "shopmax-key"))
            .thenReturn(Uni.createFrom().item(true));

        webhookService
            .processWebhook("shopmax", "PAYMENT_CAPTURED", "shopmax-key", null, "{\"amount\":99.99}", mockHeaders)
            .await().indefinitely();

        InMemorySink<Record<String, String>> sink = connector.sink("raw-events");
        assertEquals(1, sink.received().size());
    }

    @Test
    void givenAuthServiceFailure_whenProcessWebhook_thenThrowsException() {
        Mockito.when(authService.validateWebhookKey(anyString(), anyString()))
            .thenReturn(Uni.createFrom().failure(new RuntimeException("DB connection failed")));

        assertThrows(RuntimeException.class, () ->
            webhookService
                .processWebhook("partner-001", "ORDER_CREATED", "any-key", null, "{}", mockHeaders)
                .await().indefinitely()
        );
    }
}
