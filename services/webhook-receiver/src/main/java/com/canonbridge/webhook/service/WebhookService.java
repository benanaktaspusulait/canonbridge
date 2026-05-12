package com.canonbridge.webhook.service;

import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.core.HttpHeaders;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class WebhookService {

    private static final Logger LOG = Logger.getLogger(WebhookService.class);

    @Inject
    @Channel("raw-events")
    Emitter<Record<String, String>> rawEventsEmitter;

    @Inject
    WebhookAuthService authService;

    public Uni<String> processWebhook(
            String partnerId,
            String eventType,
            String webhookKey,
            String payload,
            HttpHeaders headers) {

        // Validate webhook key
        return authService.validateWebhookKey(partnerId, webhookKey)
            .flatMap(valid -> {
                if (!valid) {
                    return Uni.createFrom().failure(new NotAuthorizedException("Invalid webhook key"));
                }

                String eventId = UUID.randomUUID().toString();
                
                // Create envelope
                JsonObject envelope = new JsonObject()
                    .put("eventId", eventId)
                    .put("partnerId", partnerId)
                    .put("eventType", eventType)
                    .put("receivedAt", Instant.now().toString())
                    .put("source", "webhook")
                    .put("payload", payload)
                    .put("headers", extractHeaders(headers));

                // Publish to Kafka
                Record<String, String> record = Record.of(partnerId + ":" + eventType, envelope.encode());
                
                return Uni.createFrom().completionStage(
                    () -> rawEventsEmitter.send(record)
                ).map(v -> {
                    LOG.infof("Webhook received: partnerId=%s, eventType=%s, eventId=%s", 
                        partnerId, eventType, eventId);
                    return eventId;
                });
            });
    }

    private JsonObject extractHeaders(HttpHeaders headers) {
        JsonObject headerObj = new JsonObject();
        headers.getRequestHeaders().forEach((key, values) -> {
            if (!key.equalsIgnoreCase("X-Webhook-Key") && 
                !key.equalsIgnoreCase("Authorization")) {
                headerObj.put(key, values.isEmpty() ? null : values.get(0));
            }
        });
        return headerObj;
    }
}
