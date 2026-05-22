package com.canonbridge.mappingstudio.billing;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Manages organization-scoped API keys.
 * Keys are generated with a prefix (cb_live_ or cb_test_) and stored as SHA-256 hashes.
 * The raw key is only shown once at creation time.
 */
@ApplicationScoped
public class ApiKeyService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String KEY_PREFIX_LIVE = "cb_live_";
    private static final String KEY_PREFIX_TEST = "cb_test_";

    @Inject
    PgPool client;

    /**
     * Generate a new API key for an organization.
     * Returns the raw key (only shown once) and the created record.
     */
    public Uni<ApiKeyCreateResult> createKey(UUID orgId, String name, List<String> scopes, UUID createdBy) {
        String rawKey = generateRawKey(KEY_PREFIX_LIVE);
        String keyHash = hashKey(rawKey);
        String prefix = rawKey.substring(0, 12);

        String sql = """
            INSERT INTO api_keys (id, org_id, key_hash, key_prefix, name, scopes, created_by)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
            RETURNING id, org_id, key_prefix, name, scopes, created_at
            """;

        String scopesJson = "[" + String.join(",", scopes.stream().map(s -> "\"" + s + "\"").toList()) + "]";

        return client.preparedQuery(sql)
            .execute(Tuple.tuple()
                .addUUID(UUID.randomUUID())
                .addUUID(orgId)
                .addString(keyHash)
                .addString(prefix)
                .addString(name)
                .addString(scopesJson)
                .addUUID(createdBy)
            )
            .map(rowSet -> {
                Row row = rowSet.iterator().next();
                return new ApiKeyCreateResult(
                    rawKey,
                    row.getUUID("id"),
                    row.getString("key_prefix"),
                    row.getString("name"),
                    row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC)
                );
            });
    }

    /**
     * Resolve an API key to its organization ID.
     * Used by auth interceptors to map API key → org.
     */
    public Uni<UUID> resolveOrgId(String rawKey) {
        String keyHash = hashKey(rawKey);
        String sql = """
            SELECT org_id FROM api_keys
            WHERE key_hash = $1 AND revoked_at IS NULL
              AND (expires_at IS NULL OR expires_at > NOW())
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(keyHash))
            .flatMap(rowSet -> {
                if (rowSet.size() == 0) return Uni.createFrom().nullItem();
                UUID orgId = rowSet.iterator().next().getUUID("org_id");
                // Update last_used_at (fire-and-forget)
                client.preparedQuery("UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1")
                    .execute(Tuple.of(keyHash)).subscribe().with(v -> {}, e -> {});
                return Uni.createFrom().item(orgId);
            });
    }

    /**
     * List API keys for an organization (masked, no raw key).
     */
    public Uni<List<Map<String, Object>>> listByOrgId(UUID orgId) {
        String sql = """
            SELECT id, key_prefix, name, scopes, last_used_at, expires_at, created_at, revoked_at
            FROM api_keys WHERE org_id = $1 ORDER BY created_at DESC
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(orgId))
            .map(rowSet -> {
                List<Map<String, Object>> keys = new ArrayList<>();
                for (Row row : rowSet) {
                    Map<String, Object> key = new LinkedHashMap<>();
                    key.put("id", row.getUUID("id").toString());
                    key.put("prefix", row.getString("key_prefix"));
                    key.put("name", row.getString("name"));
                    key.put("scopes", row.getString("scopes"));
                    key.put("last_used_at", row.getLocalDateTime("last_used_at") != null
                        ? row.getLocalDateTime("last_used_at").toInstant(ZoneOffset.UTC).toString() : null);
                    key.put("created_at", row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC).toString());
                    key.put("revoked", row.getLocalDateTime("revoked_at") != null);
                    keys.add(key);
                }
                return keys;
            });
    }

    /**
     * Revoke an API key.
     */
    public Uni<Boolean> revokeKey(UUID orgId, UUID keyId) {
        String sql = "UPDATE api_keys SET revoked_at = NOW() WHERE id = $1 AND org_id = $2 AND revoked_at IS NULL";
        return client.preparedQuery(sql)
            .execute(Tuple.of(keyId, orgId))
            .map(r -> r.rowCount() > 0);
    }

    private String generateRawKey(String prefix) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return prefix + HexFormat.of().formatHex(bytes);
    }

    private String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    public record ApiKeyCreateResult(String rawKey, UUID id, String prefix, String name, java.time.Instant createdAt) {}
}
