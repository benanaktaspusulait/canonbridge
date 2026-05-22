package com.canonbridge.billing.security;

import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Set;

/**
 * Validates JWT tokens issued by mapping-studio-api's JwtService.
 * Uses HS256 (HMAC-SHA256) with a shared secret.
 *
 * In production with OIDC, this validator is supplementary —
 * the primary auth path is the OIDC Bearer token validated by Quarkus OIDC extension.
 */
@ApplicationScoped
public class BillingJwtValidator {

    @ConfigProperty(name = "canonbridge.jwt.secret", defaultValue = "")
    String jwtSecret;

    /**
     * Validate a JWT token and extract claims.
     */
    public ValidationResult validate(String token) {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            // If no JWT secret configured, we cannot validate local JWTs.
            // In production, OIDC tokens are validated by Quarkus OIDC extension directly.
            // Return invalid so the filter can try other auth methods or reject.
            return ValidationResult.invalid();
        }

        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return ValidationResult.invalid();
            }

            // Verify signature
            String signatureInput = parts[0] + "." + parts[1];
            byte[] expectedSig = hmacSha256(signatureInput, jwtSecret);
            byte[] actualSig = Base64.getUrlDecoder().decode(parts[2]);

            if (!MessageDigest.isEqual(expectedSig, actualSig)) {
                return ValidationResult.invalid();
            }

            // Decode payload
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

            // Simple JSON parsing for claims (avoid heavy dependency)
            String userId = extractClaim(payloadJson, "sub");
            String orgId = extractClaim(payloadJson, "org_id");
            String role = extractClaim(payloadJson, "role");
            String expStr = extractClaim(payloadJson, "exp");

            // Check expiration
            if (expStr != null) {
                long exp = Long.parseLong(expStr);
                if (System.currentTimeMillis() / 1000 > exp) {
                    return ValidationResult.invalid();
                }
            }

            Set<String> roles = role != null ? Set.of(role) : Set.of("user");
            return ValidationResult.valid(userId != null ? userId : "unknown", orgId, roles);

        } catch (Exception e) {
            Log.debugf("JWT validation failed: %s", e.getMessage());
            return ValidationResult.invalid();
        }
    }

    private byte[] hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Simple claim extraction from JSON payload.
     * Handles both string and numeric values.
     */
    private String extractClaim(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIdx = json.indexOf(searchKey);
        if (keyIdx < 0) return null;

        int colonIdx = json.indexOf(':', keyIdx + searchKey.length());
        if (colonIdx < 0) return null;

        int valueStart = colonIdx + 1;
        while (valueStart < json.length() && json.charAt(valueStart) == ' ') valueStart++;

        if (valueStart >= json.length()) return null;

        if (json.charAt(valueStart) == '"') {
            int valueEnd = json.indexOf('"', valueStart + 1);
            if (valueEnd < 0) return null;
            return json.substring(valueStart + 1, valueEnd);
        } else {
            // Numeric value
            int valueEnd = valueStart;
            while (valueEnd < json.length() && Character.isDigit(json.charAt(valueEnd))) valueEnd++;
            return json.substring(valueStart, valueEnd);
        }
    }

    public record ValidationResult(boolean valid, String principal, String orgId, Set<String> roles) {
        static ValidationResult valid(String principal, String orgId, Set<String> roles) {
            return new ValidationResult(true, principal, orgId, roles);
        }

        static ValidationResult invalid() {
            return new ValidationResult(false, null, null, Set.of());
        }
    }
}
