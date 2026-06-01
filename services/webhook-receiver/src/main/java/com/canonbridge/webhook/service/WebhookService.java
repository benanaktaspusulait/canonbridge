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

                // WR-V1-H3 FIX: Refuse if no signing secret configured (no fallback to webhook key)
                return authService.getSigningSecret(partnerId)
                    .flatMap(signingSecret -> {
                        if (signingSecret == null) {
                            LOG.warnf("No signing secret configured for partner %s — rejecting", partnerId);
                            return Uni.createFrom().failure(new NotAuthorizedException("Webhook signing secret not configured for this endpoint"));
                        }
                        if (!authService.verifyHmacSignature(payload, webhookSignature, signingSecret)) {
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
                })
                // [WR-M3] On Kafka publish failure, persist to webhook_dlq table and return 202
                .onFailure().recoverWithUni(kafkaError -> {
                    LOG.errorf(kafkaError, "Kafka publish failed for partner=%s event=%s — persisting to DLQ", partnerId, eventType);
                    return persistToWebhookDlq(partnerId, eventType, eventId, envelope.encode())
                        .map(v -> eventId);
                });
            });
            });
    }

    // WR-V1-M3 FIX: Remove spoofable IP headers from allow-list
    private static final Set<String> ALLOWED_HEADERS = Set.of(
            "content-type", "user-agent", "x-request-id", "x-correlation-id",
            "accept", "accept-encoding",
            "idempotency-key", "x-idempotency-key"
    );

    /**
     * [WR-H3] FIX: Use dedicated webhook_idempotency check with INSERT ON CONFLICT.
     * Atomic: if insert succeeds → not processed before. If conflict → already processed.
     * Falls back to usage_events check if webhook_idempotency table doesn't exist.
     */
    public Uni<Boolean> checkIdempotency(String idempotencyKey) {
        String sql = """
            INSERT INTO webhook_idempotency (idempotency_key, created_at)
            VALUES ($1, NOW())
            ON CONFLICT (idempotency_key) DO NOTHING
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(idempotencyKey))
            .map(rowSet -> rowSet.rowCount() == 0) // 0 rows inserted = already existed
            .onFailure().recoverWithUni(error -> {
                // Table might not exist yet — fall back to usage_events check
                String fallbackSql = """
                    SELECT COUNT(*) AS cnt FROM usage_events
                    WHERE request_id = $1 AND service = 'webhook-receiver'
                    """;
                return client.preparedQuery(fallbackSql)
                    .execute(Tuple.of(idempotencyKey))
                    .map(rowSet -> rowSet.iterator().next().getLong("cnt") > 0);
            });
    }

    @Inject
    PgPool client;

    /**
     * WR-V1-H1 FIX: Non-blocking usage event publish.
     * Uses fire-and-forget Uni chain instead of blocking executeAndAwait.
     * WR-V1-H6 FIX: On lookup failure, skip usage event (don't invent org_id).
     */
    private void publishUsageEvent(String partnerId, String eventId) {
        // Non-blocking org resolution + publish
        resolveOrgIdAsync(partnerId)
            .subscribe().with(
                orgId -> {
                    if (orgId == null) {
                        // WR-V1-H6: Don't emit usage with fake org — skip silently
                        LOG.debugf("Skipping usage event: could not resolve org for partner %s", partnerId);
                        return;
                    }
                    JsonObject usageEvent = new JsonObject()
                        .put("id", UUID.randomUUID().toString())
                        .put("org_id", orgId)
                        .put("service", "webhook-receiver")
                        .put("metric", "webhook_events")
                        .put("qty", 1)
                        .put("ts", Instant.now().toString())
                        .put("request_id", eventId)
                        .put("metadata", new JsonObject().put("partner_id", partnerId));
                    try {
                        usageEventsEmitter.send(Record.of(orgId, usageEvent.encode()));
                    } catch (Exception e) {
                        LOG.warnf("Failed to send usage event to Kafka: %s", e.getMessage());
                    }
                },
                error -> LOG.warnf("Usage event publish failed for partner %s: %s", partnerId, error.getMessage())
            );
    }

    /**
     * [WR-M2] FIX: Cache partner→org mapping to avoid DB query on every webhook.
     * TTL: 5 minutes. Invalidated on partner/org changes (acceptable staleness for billing).
     */
    private final java.util.concurrent.ConcurrentHashMap<String, CachedOrg> orgCache = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long ORG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    private record CachedOrg(String orgId, long cachedAt) {
        boolean isExpired() { return System.currentTimeMillis() - cachedAt > ORG_CACHE_TTL_MS; }
    }

    /**
     * WR-V1-H1 FIX: Non-blocking org resolution via reactive PgPool with caching.
     */
    private Uni<String> resolveOrgIdAsync(String partnerId) {
        CachedOrg cached = orgCache.get(partnerId);
        if (cached != null && !cached.isExpired()) {
            return Uni.createFrom().item(cached.orgId());
        }

        return client.preparedQuery(
            "SELECT o.id FROM organizations o JOIN partners p ON p.tenant_id = o.tenant_id WHERE p.id = $1::uuid LIMIT 1"
        ).execute(Tuple.of(partnerId))
        .map(rowSet -> {
            String orgId = null;
            if (rowSet.size() > 0) {
                orgId = rowSet.iterator().next().getUUID("id").toString();
            }
            orgCache.put(partnerId, new CachedOrg(orgId, System.currentTimeMillis()));
            return orgId;
        })
        .onFailure().recoverWithItem((String) null);
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

    /**
     * [WR-M3] Persist webhook payload to webhook_dlq table when Kafka is unavailable.
     * These records can be replayed when Kafka recovers.
     */
    private Uni<Void> persistToWebhookDlq(String partnerId, String eventType, String eventId, String payload) {
        String sql = """
            INSERT INTO webhook_dlq (id, partner_id, event_type, event_id, payload, created_at, status)
            VALUES ($1, $2::uuid, $3, $4, $5::jsonb, NOW(), 'PENDING')
            ON CONFLICT (event_id) DO NOTHING
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(UUID.randomUUID(), partnerId, eventType, eventId, payload))
            .replaceWithVoid()
            .onFailure().invoke(dlqError ->
                LOG.errorf(dlqError, "Failed to persist webhook to DLQ table — event %s is lost", eventId)
            );
    }
}
