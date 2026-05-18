package com.canonbridge.webhook.service;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@ApplicationScoped
public class WebhookAuthService {

    private static final Logger LOG = Logger.getLogger(WebhookAuthService.class);

    @Inject
    PgPool client;

    public Uni<Boolean> validateWebhookKey(String partnerId, String providedKey) {
        // In production, fetch hashed key from credentials table
        // For now, simple validation
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
            
            return storedHash.equals(providedHash);
        })
        .onFailure().invoke(throwable -> LOG.error("Failed to validate webhook key", throwable));
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
