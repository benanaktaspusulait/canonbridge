package com.canonbridge.billing.paddle;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Handles incoming Paddle webhook events.
 * Verifies HMAC signature and routes events to appropriate handlers.
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

    @Inject
    PaddleConfig config;

    @Inject
    PgPool client;

    @Inject
    ObjectMapper objectMapper;

    public Uni<Boolean> handle(String signature, String body) {
        // 1. Verify signature
        if (!verifySignature(signature, body)) {
            Log.warn("Paddle webhook signature verification failed");
            return Uni.createFrom().item(false);
        }

        // 2. Parse event
        try {
            JsonNode event = objectMapper.readTree(body);
            String eventType = event.path("event_type").asText();
            JsonNode data = event.path("data");

            Log.infof("Processing Paddle webhook: %s", eventType);

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

        } catch (Exception e) {
            Log.errorf(e, "Failed to parse Paddle webhook body");
            return Uni.createFrom().item(false);
        }
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
     */
    private boolean verifySignature(String signatureHeader, String body) {
        if (config.webhookSecret() == null || config.webhookSecret().isBlank()) {
            // No secret configured — skip verification in dev/sandbox
            Log.debug("Paddle webhook secret not configured, skipping signature verification");
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
                return false;
            }

            // Compute expected signature: HMAC-SHA256(secret, timestamp + ":" + body)
            String payload = timestamp + ":" + body;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                config.webhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] computedHash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(computedHash);

            return computedHex.equals(hash);

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            Log.errorf(e, "Error verifying Paddle webhook signature");
            return false;
        }
    }

    private String mapPaddleStatus(String paddleStatus) {
        return switch (paddleStatus) {
            case "active" -> "active";
            case "trialing" -> "trialing";
            case "past_due" -> "past_due";
            case "canceled" -> "canceled";
            case "paused" -> "paused";
            default -> "active";
        };
    }
}
