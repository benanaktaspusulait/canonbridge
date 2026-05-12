package com.canonbridge.mappingstudio.auth;

import com.canonbridge.mappingstudio.domain.User;
import jakarta.enterprise.context.ApplicationScoped;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

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
}
