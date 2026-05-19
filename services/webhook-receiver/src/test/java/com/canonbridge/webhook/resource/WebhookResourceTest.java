package com.canonbridge.webhook.resource;

import com.canonbridge.webhook.service.WebhookService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.NotAuthorizedException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;

@QuarkusTest
class WebhookResourceTest {

    @InjectMock
    WebhookService webhookService;

    @Test
    void givenNoWebhookKey_thenReturn401() {
        given()
            .contentType("application/json")
            .body("{\"event\": \"order.created\"}")
        .when()
            .post("/webhook/partner-001/ORDER_CREATED")
        .then()
            .statusCode(401)
            .body("error", containsString("X-Webhook-Key header is required"));
    }

    @Test
    void givenBlankWebhookKey_thenReturn401() {
        given()
            .contentType("application/json")
            .header("X-Webhook-Key", "   ")
            .body("{\"event\": \"order.created\"}")
        .when()
            .post("/webhook/partner-001/ORDER_CREATED")
        .then()
            .statusCode(401)
            .body("error", containsString("X-Webhook-Key header is required"));
    }

    @Test
    void givenValidWebhookKey_thenReturn202() {
        String eventId = "evt-12345";
        Mockito.when(webhookService.processWebhook(anyString(), anyString(), anyString(), any(), anyString(), any()))
            .thenReturn(Uni.createFrom().item(eventId));

        given()
            .contentType("application/json")
            .header("X-Webhook-Key", "valid-secret-key")
            .body("{\"orderId\": \"ORD-001\", \"status\": \"CONFIRMED\"}")
        .when()
            .post("/webhook/partner-001/ORDER_CREATED")
        .then()
            .statusCode(202)
            .body("eventId", equalTo(eventId))
            .body("message", containsString("Webhook received"));
    }

    @Test
    void givenInvalidWebhookKey_thenReturn401() {
        Mockito.when(webhookService.processWebhook(anyString(), anyString(), anyString(), any(), anyString(), any()))
            .thenReturn(Uni.createFrom().failure(new NotAuthorizedException("Invalid webhook key")));

        given()
            .contentType("application/json")
            .header("X-Webhook-Key", "wrong-key")
            .body("{\"orderId\": \"ORD-001\"}")
        .when()
            .post("/webhook/partner-001/ORDER_CREATED")
        .then()
            .statusCode(401)
            .body("error", containsString("Invalid webhook key"));
    }

    @Test
    void givenServiceFailure_thenReturn500() {
        Mockito.when(webhookService.processWebhook(anyString(), anyString(), anyString(), any(), anyString(), any()))
            .thenReturn(Uni.createFrom().failure(new RuntimeException("Kafka unavailable")));

        given()
            .contentType("application/json")
            .header("X-Webhook-Key", "valid-key")
            .body("{\"orderId\": \"ORD-001\"}")
        .when()
            .post("/webhook/partner-001/ORDER_CREATED")
        .then()
            .statusCode(500)
            .body("error", containsString("Failed to process webhook"));
    }

    @Test
    void givenDifferentPartnerAndEventType_thenRoutedCorrectly() {
        String eventId = "evt-99999";
        Mockito.when(webhookService.processWebhook(eq("fastcargo"), eq("SHIPMENT_DELIVERED"), anyString(), any(), anyString(), any()))
            .thenReturn(Uni.createFrom().item(eventId));

        given()
            .contentType("application/json")
            .header("X-Webhook-Key", "cargo-key")
            .body("{\"trackingNumber\": \"TRACK-001\", \"status\": \"DELIVERED\"}")
        .when()
            .post("/webhook/fastcargo/SHIPMENT_DELIVERED")
        .then()
            .statusCode(202)
            .body("eventId", equalTo(eventId));
    }
}
