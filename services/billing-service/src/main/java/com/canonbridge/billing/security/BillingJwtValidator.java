package com.canonbridge.billing.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * V5-M1 / NEW-V6-H1 / NEW-V6-M3 / NEW-V6-L1 FIX:
 * Rewritten JWT validator using Jackson for proper JSON parsing.
 *
 * Validates:
 * - HS256 signature (constant-time comparison)
 * - Expiration (exp)
 * - Not-before (nbf)
 * - Issuer (iss) — must match expected issuer
 * - Audience (aud) — if present, must include "canonbridge-billing"
 * - Roles — parsed as JSON array or single string
 */
@ApplicationScoped
public class BillingJwtValidator {

    private static final String EXPECTED_ISSUER = "canonbridge";
    private static final Set<String> ACCEPTED_AUDIENCES = Set.of("canonbridge-billing", "canonbridge");

    @ConfigProperty(name = "canonbridge.jwt.secret", defaultValue = "")
    String jwtSecret;

    @Inject
    ObjectMapper objectMapper;

    public ValidationResult validate(String token) {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            Log.warn("JWT secret not configured — cannot validate local JWTs");
            return ValidationResult.invalid();
        }

        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return ValidationResult.invalid();
            }

            // 1. Verify HS256 signature (constant-time)
            String signatureInput = parts[0] + "." + parts[1];
            byte[] expectedSig = hmacSha256(signatureInput, jwtSecret);
            byte[] actualSig = Base64.getUrlDecoder().decode(padBase64(parts[2]));

            if (!MessageDigest.isEqual(expectedSig, actualSig)) {
                Log.debug("JWT signature mismatch");
                return ValidationResult.invalid();
            }

            // 2. Parse header — verify algorithm
            JsonNode header = parseBase64Json(parts[0]);
            if (header == null || !"HS256".equals(header.path("alg").asText())) {
                Log.debug("JWT algorithm not HS256");
                return ValidationResult.invalid();
            }

            // 3. Parse payload with Jackson (proper JSON parsing)
            JsonNode payload = parseBase64Json(parts[1]);
            if (payload == null) {
                Log.debug("JWT payload parse failed");
                return ValidationResult.invalid();
            }

            // 4. Validate expiration
            long now = System.currentTimeMillis() / 1000;
            if (payload.has("exp")) {
                long exp = payload.path("exp").asLong(0);
                if (now > exp) {
                    Log.debugf("JWT expired: exp=%d now=%d", exp, now);
                    return ValidationResult.invalid();
                }
            }

            // 5. Validate not-before
            if (payload.has("nbf")) {
                long nbf = payload.path("nbf").asLong(0);
                if (now < nbf) {
                    Log.debugf("JWT not yet valid: nbf=%d now=%d", nbf, now);
                    return ValidationResult.invalid();
                }
            }

            // 6. Validate issuer (NEW-V6-H1 FIX)
            String iss = payload.path("iss").asText("");
            if (!EXPECTED_ISSUER.equals(iss)) {
                Log.debugf("JWT issuer mismatch: expected=%s got=%s", EXPECTED_ISSUER, iss);
                return ValidationResult.invalid();
            }

            // 7. Validate audience if present (NEW-V6-H1 FIX)
            if (payload.has("aud")) {
                JsonNode audNode = payload.path("aud");
                boolean audValid = false;
                if (audNode.isArray()) {
                    for (JsonNode a : audNode) {
                        if (ACCEPTED_AUDIENCES.contains(a.asText())) { audValid = true; break; }
                    }
                } else {
                    audValid = ACCEPTED_AUDIENCES.contains(audNode.asText());
                }
                if (!audValid) {
                    Log.debugf("JWT audience not accepted: %s", audNode);
                    return ValidationResult.invalid();
                }
            }

            // 8. Extract claims
            String userId = payload.path("sub").asText(null);
            String orgId = payload.has("org_id") ? payload.path("org_id").asText(null) : null;
            // Fallback: try tenant_id if org_id not present
            if (orgId == null && payload.has("tenant_id")) {
                orgId = payload.path("tenant_id").asText(null);
            }

            // 9. Parse roles (NEW-V6-L1 FIX: handle array or single string)
            Set<String> roles = parseRoles(payload);

            return ValidationResult.valid(userId != null ? userId : "unknown", orgId, roles);

        } catch (Exception e) {
            Log.debugf("JWT validation failed: %s", e.getMessage());
            return ValidationResult.invalid();
        }
    }

    /**
     * Parse roles from JWT payload. Handles:
     * - "role": "admin" (single string)
     * - "roles": ["admin", "billing_viewer"] (array)
     */
    private Set<String> parseRoles(JsonNode payload) {
        Set<String> roles = new HashSet<>();

        // Try "role" (single)
        if (payload.has("role") && !payload.path("role").isNull()) {
            String role = payload.path("role").asText();
            if (!role.isBlank()) roles.add(role);
        }

        // Try "roles" (array)
        if (payload.has("roles")) {
            JsonNode rolesNode = payload.path("roles");
            if (rolesNode.isArray()) {
                for (JsonNode r : rolesNode) {
                    String rv = r.asText();
                    if (!rv.isBlank()) roles.add(rv);
                }
            } else if (rolesNode.isTextual()) {
                roles.add(rolesNode.asText());
            }
        }

        return roles.isEmpty() ? Set.of("user") : roles;
    }

    private JsonNode parseBase64Json(String base64Part) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(padBase64(base64Part));
            return objectMapper.readTree(decoded);
        } catch (Exception e) {
            return null;
        }
    }

    private String padBase64(String base64) {
        int padding = 4 - (base64.length() % 4);
        if (padding == 4) return base64;
        return base64 + "=".repeat(padding);
    }

    private byte[] hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
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
