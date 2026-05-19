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

    public boolean verifyHmacSignature(String payload, String signatureHeader, String secretKey) {
        if (signatureHeader == null || signatureHeader.isBlank() || secretKey == null) {
            return false;
        }

        try {
            String expected = computeHmac(payload, secretKey);
            String provided = signatureHeader.startsWith("sha256=")
                    ? signatureHeader.substring(7)
                    : signatureHeader;

            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    provided.getBytes(StandardCharsets.UTF_8)
            );
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
