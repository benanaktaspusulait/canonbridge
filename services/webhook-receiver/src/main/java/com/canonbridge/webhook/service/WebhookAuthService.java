package com.canonbridge.webhook.service;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Arrays;
import java.util.Optional;

@ApplicationScoped
public class WebhookAuthService {

    private static final Logger LOG = Logger.getLogger(WebhookAuthService.class);
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Inject
    PgPool client;

    public Uni<Boolean> validateWebhookKey(String partnerId, String providedKey) {
        return client.preparedQuery(
            "SELECT secret_hash FROM webhook_endpoints " +
            "WHERE partner_id = $1::uuid AND status = 'ACTIVE'"
        )
        .execute(Tuple.of(partnerId))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                LOG.warnf("No active webhook endpoint found for partner: %s", partnerId);
                return false;
            }

            String storedHash = rowSet.iterator().next().getString("secret_hash");
            String providedHash = hashKey(providedKey);

            return MessageDigest.isEqual(
                    storedHash.getBytes(StandardCharsets.UTF_8),
                    providedHash.getBytes(StandardCharsets.UTF_8)
            );
        })
        .onFailure().invoke(throwable -> LOG.error("Failed to validate webhook key", throwable));
    }

    private static final long TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes

    public boolean verifyHmacSignature(String payload, String signatureHeader, String secretKey) {
        if (signatureHeader == null || signatureHeader.isBlank() || secretKey == null) {
            return false;
        }

        try {
            String trimmed = signatureHeader.trim();
            Optional<String> stripeTimestamp = signaturePart(trimmed, "t");
            Optional<String> stripeSignature = signaturePart(trimmed, "v1");
            if (stripeSignature.isPresent()) {
                // K5: Validate timestamp tolerance to prevent replay attacks
                if (stripeTimestamp.isPresent()) {
                    long timestamp = Long.parseLong(stripeTimestamp.get());
                    long now = System.currentTimeMillis() / 1000;
                    if (Math.abs(now - timestamp) > TIMESTAMP_TOLERANCE_SECONDS) {
                        LOG.warnf("Webhook timestamp outside tolerance: t=%d, now=%d, diff=%ds",
                                timestamp, now, Math.abs(now - timestamp));
                        return false;
                    }
                }
                String signedPayload = stripeTimestamp
                        .map(timestamp -> timestamp + "." + payload)
                        .orElse(payload);
                return constantTimeEquals(computeHmac(signedPayload, secretKey), stripeSignature.get());
            }

            String provided = trimmed.startsWith("sha256=")
                    ? trimmed.substring("sha256=".length())
                    : trimmed;
            String expectedHex = computeHmac(payload, secretKey);
            String expectedBase64 = computeHmacBase64(payload, secretKey);

            return constantTimeEquals(expectedHex, provided)
                    || constantTimeEquals(expectedBase64, provided);
        } catch (Exception e) {
            LOG.error("HMAC verification failed", e);
            return false;
        }
    }

    public String computeHmac(String payload, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(keySpec);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hmacBytes.length * 2);
            for (byte b : hmacBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute HMAC-SHA256", e);
        }
    }

    public String computeHmacBase64(String payload, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(keySpec);
            return Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute HMAC-SHA256", e);
        }
    }

    private Optional<String> signaturePart(String header, String key) {
        return Arrays.stream(header.split(","))
                .map(String::trim)
                .filter(part -> part.startsWith(key + "="))
                .map(part -> part.substring((key + "=").length()))
                .filter(value -> !value.isBlank())
                .findFirst();
    }

    private boolean constantTimeEquals(String expected, String provided) {
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                provided.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String hashKey(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            LOG.error("Failed to hash key", e);
            return "";
        }
    }
}
