package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@ApplicationScoped
public class JwtService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> JSON_MAP = new TypeReference<>() {};
    private final Set<String> revokedTokenIds = ConcurrentHashMap.newKeySet();

    @ConfigProperty(name = "canonbridge.jwt.secret")
    String jwtSecret;

    @ConfigProperty(name = "canonbridge.jwt.issuer", defaultValue = "canonbridge")
    String issuer;

    @ConfigProperty(name = "canonbridge.jwt.ttl-seconds", defaultValue = "28800")
    long ttlSeconds;

    public JwtService() {
    }

    public JwtService(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public String generateToken(User user) {
        long issuedAt = Instant.now().getEpochSecond();
        long expiry = issuedAt + resolvedTtlSeconds();
        String tokenId = UUID.randomUUID().toString();

        Map<String, Object> header = Map.of(
                "alg", "HS256",
                "typ", "JWT"
        );
        Map<String, Object> payload = Map.of(
                "iss", resolvedIssuer(),
                "sub", user.getId().toString(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "tenant_id", user.getTenantId(),
                "jti", tokenId,
                "iat", issuedAt,
                "nbf", issuedAt,
                "exp", expiry
        );

        String signingInput = base64UrlJson(header) + "." + base64UrlJson(payload);
        return signingInput + "." + sign(signingInput);
    }

    public Optional<TokenClaims> validateToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            String[] parts = token.trim().split("\\.", -1);
            if (parts.length != 3 || parts[0].isBlank() || parts[1].isBlank() || parts[2].isBlank()) {
                return Optional.empty();
            }

            String signingInput = parts[0] + "." + parts[1];
            if (!constantTimeEquals(sign(signingInput), parts[2])) {
                return Optional.empty();
            }

            Map<String, Object> header = readJson(parts[0]);
            if (!"HS256".equals(header.get("alg"))) {
                return Optional.empty();
            }

            Map<String, Object> payload = readJson(parts[1]);
            if (!resolvedIssuer().equals(payload.get("iss"))) {
                return Optional.empty();
            }

            long notBefore = longClaim(payload.get("nbf"));
            if (Instant.now().getEpochSecond() < notBefore) {
                return Optional.empty();
            }

            long expiry = longClaim(payload.get("exp"));
            if (Instant.now().getEpochSecond() >= expiry) {
                return Optional.empty();
            }

            String tokenId = stringClaim(payload.get("jti"));
            if (revokedTokenIds.contains(tokenId)) {
                return Optional.empty();
            }

            return Optional.of(new TokenClaims(
                    UUID.fromString(stringClaim(payload.get("sub"))),
                    stringClaim(payload.get("email")),
                    stringClaim(payload.get("role")),
                    stringClaim(payload.get("tenant_id")),
                    tokenId,
                    expiry
            ));
        } catch (Exception error) {
            return Optional.empty();
        }
    }

    public boolean revokeToken(String token) {
        return validateToken(token)
                .map(claims -> revokedTokenIds.add(claims.tokenId()))
                .orElse(false);
    }

    private String base64UrlJson(Map<String, Object> value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(OBJECT_MAPPER.writeValueAsBytes(value));
        } catch (Exception error) {
            throw new IllegalStateException("Unable to encode JWT", error);
        }
    }

    private Map<String, Object> readJson(String base64UrlJson) throws Exception {
        byte[] json = BASE64_URL_DECODER.decode(base64UrlJson);
        return OBJECT_MAPPER.readValue(json, JSON_MAP);
    }

    private String sign(String signingInput) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(resolvedSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception error) {
            throw new IllegalStateException("Unable to sign JWT", error);
        }
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String resolvedSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT secret is not configured");
        }
        return jwtSecret;
    }

    private String resolvedIssuer() {
        return issuer == null || issuer.isBlank() ? "canonbridge" : issuer;
    }

    private long resolvedTtlSeconds() {
        return ttlSeconds > 0 ? ttlSeconds : 28800;
    }

    private static String stringClaim(Object value) {
        if (value instanceof String stringValue && !stringValue.isBlank()) {
            return stringValue;
        }
        throw new IllegalArgumentException("Missing string claim");
    }

    private static long longClaim(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String stringValue) {
            return Long.parseLong(stringValue);
        }
        throw new IllegalArgumentException("Missing numeric claim");
    }

    public record TokenClaims(
            UUID userId,
            String email,
            String role,
            String tenantId,
            String tokenId,
            long expiry
    ) {
    }
}
