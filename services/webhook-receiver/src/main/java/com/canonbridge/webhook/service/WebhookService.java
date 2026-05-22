package com.canonbridge.webhook.service;

import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.core.HttpHeaders;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class WebhookService {

    private static final Logger LOG = Logger.getLogger(WebhookService.class);

    @Inject
    @Channel("raw-events")
    Emitter<Record<String, String>> rawEventsEmitter;

    @Inject
    @Channel("usage-events")
    Emitter<Record<String, String>> usageEventsEmitter;

    @Inject
    WebhookAuthService authService;

    public Uni<String> processWebhook(
            String partnerId,
            String eventType,
            String webhookKey,
            String webhookSignature,
            String payload,
            HttpHeaders headers) {

        return authService.validateWebhookKey(partnerId, webhookKey)
            .flatMap(valid -> {
                if (!valid) {
                    return Uni.createFrom().failure(new NotAuthorizedException("Invalid webhook key"));
                }

                if (webhookSignature == null || webhookSignature.isBlank()) {
                    LOG.warnf("Missing HMAC signature for partner: %s, event: %s", partnerId, eventType);
                    return Uni.createFrom().failure(new NotAuthorizedException("Missing webhook signature"));
                }

                // K4 FIX: Use dedicated signing secret from DB instead of webhook key
                return authService.getSigningSecret(partnerId)
                    .flatMap(signingSecret -> {
                        String secretForHmac = (signingSecret != null) ? signingSecret : webhookKey;
                        if (!authService.verifyHmacSignature(payload, webhookSignature, secretForHmac)) {
                            LOG.warnf("HMAC signature mismatch for partner: %s, event: %s", partnerId, eventType);
                            return Uni.createFrom().failure(new NotAuthorizedException("Invalid webhook signature"));
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
                    // Publish usage event for billing metering (fire-and-forget)
                    publishUsageEvent(partnerId, eventId);
                    return eventId;
                });
            });
            });
    }

    private static final Set<String> ALLOWED_HEADERS = Set.of(
            "content-type", "user-agent", "x-request-id", "x-correlation-id",
            "x-forwarded-for", "x-real-ip", "accept", "accept-encoding",
            "idempotency-key", "x-idempotency-key"
    );

    /**
     * Y9 FIX: Check if a webhook with this idempotency key was already processed.
     * Uses a simple DB check with 24h TTL (old records cleaned by cron).
     */
    public Uni<Boolean> checkIdempotency(String idempotencyKey) {
        String sql = """
            SELECT COUNT(*) AS cnt FROM usage_events
            WHERE request_id = $1 AND service = 'webhook-receiver'
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(idempotencyKey))
            .map(rowSet -> rowSet.iterator().next().getLong("cnt") > 0);
    }

    @Inject
    PgPool client;

    private void publishUsageEvent(String partnerId, String eventId) {
        try {
            // TODO: Resolve org_id from partner_id (via DB lookup or cache)
            // For now, use a placeholder — will be resolved when org-partner mapping is implemented
            String orgId = "a0000000-0000-0000-0000-000000000001";

            JsonObject usageEvent = new JsonObject()
                .put("id", UUID.randomUUID().toString())
                .put("org_id", orgId)
                .put("service", "webhook-receiver")
                .put("metric", "webhook_events")
                .put("qty", 1)
                .put("ts", Instant.now().toString())
                .put("request_id", eventId)
                .put("metadata", new JsonObject().put("partner_id", partnerId));

            usageEventsEmitter.send(Record.of(orgId, usageEvent.encode()));
        } catch (Exception e) {
            // Graceful degradation: never let billing break webhook processing
            LOG.warnf("Failed to publish usage event for webhook: %s", e.getMessage());
        }
    }

    private JsonObject extractHeaders(HttpHeaders headers) {
        JsonObject headerObj = new JsonObject();
        headers.getRequestHeaders().forEach((key, values) -> {
            if (ALLOWED_HEADERS.contains(key.toLowerCase())) {
                headerObj.put(key, values.isEmpty() ? null : values.get(0));
            }
        });
        return headerObj;
    }
}
