package com.canonbridge.billing.paddle;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Handles incoming Paddle webhook events.
 * Verifies HMAC signature (constant-time) with timestamp replay protection
 * and ensures event idempotency via a processed_events table.
 *
 * Security fixes applied:
 * - B-K2: Fail-CLOSED when webhook secret is not configured (prod mandatory)
 * - B-K3: Constant-time signature comparison via MessageDigest.isEqual
 * - B-K4: Timestamp tolerance check (300s) to prevent replay attacks
 * - B-K5: Event idempotency via paddle_processed_events table
 *
 * Supported events:
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 * - subscription.past_due
 * - transaction.completed
 * - transaction.payment_failed
 */
@ApplicationScoped
public class PaddleWebhookHandler {

    /** Maximum age of a webhook timestamp before it's rejected (5 minutes). */
    private static final long TIMESTAMP_TOLERANCE_SECONDS = 300;

    @Inject
    PaddleConfig config;

    @Inject
    PgPool client;

    @Inject
    ObjectMapper objectMapper;

    @ConfigProperty(name = "canonbridge.security.environment", defaultValue = "development")
    String environment;

    public Uni<Boolean> handle(String signature, String body) {
        // 1. Verify signature (fail-closed in production)
        if (!verifySignature(signature, body)) {
            Log.warn("Paddle webhook signature verification failed");
            return Uni.createFrom().item(false);
        }

        // 2. Parse event
        try {
            JsonNode event = objectMapper.readTree(body);
            String eventType = event.path("event_type").asText();
            String eventId = event.path("event_id").asText(null);
            JsonNode data = event.path("data");

            Log.infof("Processing Paddle webhook: %s (event_id=%s)", eventType, eventId);

            // 3. Idempotency check (B-K5): skip if already processed
            if (eventId != null && !eventId.isBlank()) {
                return checkAndMarkProcessed(eventId)
                        .flatMap(alreadyProcessed -> {
                            if (alreadyProcessed) {
                                Log.infof("Paddle event already processed, skipping: %s", eventId);
                                return Uni.createFrom().item(true);
                            }
                            return routeEvent(eventType, data);
                        });
            }

            return routeEvent(eventType, data);

        } catch (Exception e) {
            Log.errorf(e, "Failed to parse Paddle webhook body");
            return Uni.createFrom().item(false);
        }
    }

    private Uni<Boolean> routeEvent(String eventType, JsonNode data) {
        return switch (eventType) {
            case "subscription.created" -> handleSubscriptionCreated(data);
            case "subscription.updated" -> handleSubscriptionUpdated(data);
            case "subscription.canceled" -> handleSubscriptionCanceled(data);
            case "subscription.past_due" -> handleSubscriptionPastDue(data);
            case "transaction.completed" -> handleTransactionCompleted(data);
            case "transaction.payment_failed" -> handlePaymentFailed(data);
            default -> {
                Log.infof("Unhandled Paddle event type: %s", eventType);
                yield Uni.createFrom().item(true);
            }
        };
    }

    /**
     * B-K5: Check if event was already processed. If not, mark it as processed.
     * Uses INSERT ON CONFLICT DO NOTHING for atomic dedupe.
     */
    private Uni<Boolean> checkAndMarkProcessed(String eventId) {
        String sql = """
            INSERT INTO paddle_processed_events (event_id, processed_at)
            VALUES ($1, NOW())
            ON CONFLICT (event_id) DO NOTHING
            """;

        return client.preparedQuery(sql)
                .execute(Tuple.of(eventId))
                .map(rowSet -> rowSet.rowCount() == 0); // 0 rows = already existed = already processed
    }

    private Uni<Boolean> handleSubscriptionCreated(JsonNode data) {
        String externalRef = data.path("id").asText();
        String customerId = data.path("customer_id").asText();
        String status = data.path("status").asText();

        // Map Paddle subscription to our internal subscription via custom_data.org_id
        String orgIdStr = data.path("custom_data").path("org_id").asText(null);
        if (orgIdStr == null) {
            Log.warnf("Paddle subscription.created missing org_id in custom_data: %s", externalRef);
            return Uni.createFrom().item(true);
        }

        String sql = """
            UPDATE subscriptions
            SET external_provider = 'paddle', external_ref = $2, status = $3
            WHERE org_id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(UUID.fromString(orgIdStr), externalRef, mapPaddleStatus(status)))
            .map(rowSet -> {
                Log.infof("Subscription created via Paddle: org=%s ref=%s", orgIdStr, externalRef);
                return true;
            });
    }

    private Uni<Boolean> handleSubscriptionUpdated(JsonNode data) {
        String externalRef = data.path("id").asText();
        String status = data.path("status").asText();

        String sql = """
            UPDATE subscriptions SET status = $2
            WHERE external_ref = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(externalRef, mapPaddleStatus(status)))
            .map(rowSet -> {
                Log.infof("Subscription updated via Paddle: ref=%s status=%s", externalRef, status);
                return true;
            });
    }

    private Uni<Boolean> handleSubscriptionCanceled(JsonNode data) {
        String externalRef = data.path("id").asText();

        String sql = """
            UPDATE subscriptions SET status = 'canceled', canceled_at = NOW()
            WHERE external_ref = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(externalRef))
            .map(rowSet -> {
                Log.infof("Subscription canceled via Paddle: ref=%s", externalRef);
                return true;
            });
    }

    private Uni<Boolean> handleSubscriptionPastDue(JsonNode data) {
        String externalRef = data.path("id").asText();

        String sql = "UPDATE subscriptions SET status = 'past_due' WHERE external_ref = $1";

        return client.preparedQuery(sql)
            .execute(Tuple.of(externalRef))
            .map(rowSet -> {
                Log.warnf("Subscription past due via Paddle: ref=%s", externalRef);
                return true;
            });
    }

    private Uni<Boolean> handleTransactionCompleted(JsonNode data) {
        // Payment successful — could create invoice record
        String transactionId = data.path("id").asText();
        Log.infof("Transaction completed: %s", transactionId);
        return Uni.createFrom().item(true);
    }

    private Uni<Boolean> handlePaymentFailed(JsonNode data) {
        String transactionId = data.path("id").asText();
        Log.warnf("Payment failed: %s", transactionId);
        return Uni.createFrom().item(true);
    }

    /**
     * Verify Paddle webhook signature using HMAC-SHA256.
     *
     * B-K2: Fail-CLOSED — if webhook secret is not configured in production, reject.
     * B-K3: Uses MessageDigest.isEqual for constant-time comparison.
     * B-K4: Validates timestamp is within TIMESTAMP_TOLERANCE_SECONDS.
     */
    private boolean verifySignature(String signatureHeader, String body) {
        if (config.webhookSecret().isEmpty() || config.webhookSecret().get().isBlank()) {
            // B-K2 FIX: Fail-CLOSED in production
            if (isProduction()) {
                Log.error("Paddle webhook secret not configured in production — rejecting webhook (fail-closed)");
                return false;
            }
            // In dev/sandbox, log a warning but allow (for local testing without Paddle)
            Log.warn("Paddle webhook secret not configured — skipping verification (non-production only)");
            return true;
        }

        try {
            // Paddle signature format: ts=TIMESTAMP;h1=HASH
            String[] parts = signatureHeader.split(";");
            String timestamp = null;
            String hash = null;

            for (String part : parts) {
                if (part.startsWith("ts=")) {
                    timestamp = part.substring(3);
                } else if (part.startsWith("h1=")) {
                    hash = part.substring(3);
                }
            }

            if (timestamp == null || hash == null) {
                Log.warn("Paddle webhook signature missing ts or h1 component");
                return false;
            }

            // B-K4 FIX: Timestamp tolerance check — reject replayed webhooks
            try {
                long webhookTimestamp = Long.parseLong(timestamp);
                long currentTimestamp = System.currentTimeMillis() / 1000;
                long age = Math.abs(currentTimestamp - webhookTimestamp);
                if (age > TIMESTAMP_TOLERANCE_SECONDS) {
                    Log.warnf("Paddle webhook timestamp too old/future: age=%ds, tolerance=%ds",
                            age, TIMESTAMP_TOLERANCE_SECONDS);
                    return false;
                }
            } catch (NumberFormatException e) {
                Log.warnf("Paddle webhook timestamp not a valid number: %s", timestamp);
                return false;
            }

            // Compute expected signature: HMAC-SHA256(secret, timestamp + ":" + body)
            String payload = timestamp + ":" + body;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                config.webhookSecret().get().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] computedHash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            // B-K3 FIX: Constant-time comparison using MessageDigest.isEqual
            byte[] receivedHash = HexFormat.of().parseHex(hash);
            return MessageDigest.isEqual(computedHash, receivedHash);

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            Log.errorf(e, "Error verifying Paddle webhook signature");
            return false;
        } catch (IllegalArgumentException e) {
            Log.warnf("Invalid hex in Paddle webhook signature: %s", e.getMessage());
            return false;
        }
    }

    private boolean isProduction() {
        return "production".equalsIgnoreCase(environment) || "prod".equalsIgnoreCase(environment);
    }

    private String mapPaddleStatus(String paddleStatus) {
        return switch (paddleStatus) {
            case "active" -> "active";
            case "trialing" -> "trialing";
            case "past_due" -> "past_due";
            case "canceled" -> "canceled";
            case "paused" -> "paused";
            default -> {
                // B-O2 FIX: Don't silently map unknown statuses to "active"
                Log.warnf("Unknown Paddle subscription status '%s' — mapping to 'unknown'", paddleStatus);
                yield "unknown";
            }
        };
    }
}
