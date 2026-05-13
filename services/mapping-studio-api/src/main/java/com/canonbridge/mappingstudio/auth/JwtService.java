package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import jakarta.enterprise.context.ApplicationScoped;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class JwtService {

    private static final String SECRET = "canonbridge-jwt-secret-key-for-development-only-change-in-production";

    public String generateToken(User user) {
        // Simple JWT-like token for MVP
        // Format: base64(userId:email:role:tenantId:expiry)
        long expiry = Instant.now().plusSeconds(8 * 3600).getEpochSecond(); // 8 hours
        String payload = user.getId() + ":" + user.getEmail() + ":" + user.getRole() + ":" + user.getTenantId() + ":" + expiry;
        return Base64.getEncoder().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    }

    public Optional<TokenClaims> validateToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            String payload = new String(Base64.getDecoder().decode(token.trim()), StandardCharsets.UTF_8);
            String[] parts = payload.split(":", 5);
            if (parts.length != 5) {
                return Optional.empty();
            }

            long expiry = Long.parseLong(parts[4]);
            if (Instant.now().getEpochSecond() >= expiry) {
                return Optional.empty();
            }

            return Optional.of(new TokenClaims(
                    UUID.fromString(parts[0]),
                    parts[1],
                    parts[2],
                    parts[3],
                    expiry
            ));
        } catch (IllegalArgumentException error) {
            return Optional.empty();
        }
    }

    public record TokenClaims(
            UUID userId,
            String email,
            String role,
            String tenantId,
            long expiry
    ) {
    }
}
