package com.canonbridge.mappingstudio.security;

import com.canonbridge.mappingstudio.auth.JwtService;
import com.canonbridge.mappingstudio.domain.User;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiKeyAuthenticatorTest {

    @Test
    void parsesCommaSeparatedApiKeys() {
        Set<String> apiKeys = ApiKeyAuthenticator.parseApiKeys(" first-key,second-key, , third-key ");

        assertEquals(Set.of("first-key", "second-key", "third-key"), apiKeys);
    }

    @Test
    void authenticatesXApiKeyHeader() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(null, " test-secret ");

        assertTrue(result.authenticated());
        assertEquals("api-key", result.principal());
    }

    @Test
    void authenticatesBearerAuthorizationHeader() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("bearer-secret"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate("Bearer bearer-secret", null);

        assertTrue(result.authenticated());
        assertEquals("api-key", result.principal());
    }

    @Test
    void authenticatesBearerLoginToken() {
        JwtService jwtService = new JwtService();
        UUID userId = UUID.randomUUID();
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"), jwtService);

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(
                "Bearer " + jwtService.generateToken(activeUser(userId)),
                null
        );

        assertTrue(result.authenticated());
        assertEquals("user:" + userId, result.principal());
    }

    @Test
    void rejectsExpiredBearerLoginToken() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"), new JwtService());
        String expiredToken = Base64.getEncoder().encodeToString(
                ("00000000-0000-0000-0000-000000000001:user@example.com:ADMIN:tenant-acme:"
                        + Instant.now().minusSeconds(60).getEpochSecond())
                        .getBytes(StandardCharsets.UTF_8)
        );

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate("Bearer " + expiredToken, null);

        assertFalse(result.authenticated());
        assertEquals("invalid_credentials", result.error());
    }

    @Test
    void rejectsMissingCredentials() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(null, null);

        assertFalse(result.authenticated());
        assertEquals("missing_credentials", result.error());
    }

    @Test
    void rejectsInvalidCredentials() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(null, "wrong-secret");

        assertFalse(result.authenticated());
        assertEquals("invalid_credentials", result.error());
    }

    @Test
    void failsClosedWhenNoApiKeysAreConfigured() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of());

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(null, "anything");

        assertFalse(result.authenticated());
        assertEquals("auth_misconfigured", result.error());
    }

    private static User activeUser(UUID userId) {
        User user = new User();
        user.setId(userId);
        user.setEmail("user@example.com");
        user.setRole("ADMIN");
        user.setTenantId("tenant-acme");
        return user;
    }
}
