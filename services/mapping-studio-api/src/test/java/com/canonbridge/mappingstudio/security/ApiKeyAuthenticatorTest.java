package com.canonbridge.mappingstudio.security;

import com.canonbridge.mappingstudio.auth.JwtService;
import com.canonbridge.mappingstudio.domain.User;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiKeyAuthenticatorTest {

    @Test
    void parsesCommaSeparatedLegacyApiKeys() {
        List<ApiKeyAuthenticator.ApiKeyIdentity> apiKeys =
                ApiKeyAuthenticator.parseApiKeys(" first-key,second-key, , third-key ");

        assertEquals(List.of("first-key", "second-key", "third-key"),
                apiKeys.stream().map(ApiKeyAuthenticator.ApiKeyIdentity::secret).toList());
    }

    @Test
    void parsesRoleAndTenantScopedApiKeyDescriptors() {
        List<ApiKeyAuthenticator.ApiKeyIdentity> apiKeys =
                ApiKeyAuthenticator.parseApiKeys("ops-secret:ops-team:tenant-acme|tenant-demo:operator|viewer;etl-secret:etl-bot:tenant-acme:integration_author");

        assertEquals("api-key:ops-team", apiKeys.get(0).principal());
        assertEquals(Set.of("tenant-acme", "tenant-demo"), apiKeys.get(0).tenantIds());
        assertEquals(Set.of("operator", "viewer"), apiKeys.get(0).roles());
    }

    @Test
    void authenticatesXApiKeyHeader() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(null, " test-secret ");

        assertTrue(result.authenticated());
        assertEquals("api-key", result.principal());
        assertEquals(Set.of("integration_author", "viewer"), result.roles());
        assertEquals(Set.of("*"), result.tenantIds());
    }

    @Test
    void authenticatesDescriptorWithConfiguredPrincipalTenantsAndRoles() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("ops-secret:ops-team:tenant-acme:operator"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(null, "ops-secret");

        assertTrue(result.authenticated());
        assertEquals("api-key:ops-team", result.principal());
        assertEquals(Set.of("tenant-acme"), result.tenantIds());
        assertEquals(Set.of("operator"), result.roles());
    }

    @Test
    void authenticatesBearerAuthorizationHeader() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("bearer-secret"));
        authenticator.bearerApiKeyEnabled = true;

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate("Bearer bearer-secret", null);

        assertTrue(result.authenticated());
        assertEquals("api-key", result.principal());
    }

    @Test
    void rejectsBearerApiKeyWhenCompatibilityModeIsDisabled() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("bearer-secret"));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate("Bearer bearer-secret", null);

        assertFalse(result.authenticated());
        assertEquals("invalid_credentials", result.error());
    }

    @Test
    void authenticatesBearerLoginToken() {
        JwtService jwtService = new JwtService("test-jwt-secret");
        UUID userId = UUID.randomUUID();
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"), jwtService);
        String token = jwtService.generateToken(activeUser(userId));

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate(
                "Bearer " + token,
                null
        );

        assertTrue(result.authenticated());
        assertEquals("user:" + userId, result.principal());
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    void rejectsTamperedBearerLoginToken() {
        JwtService jwtService = new JwtService("test-jwt-secret");
        UUID userId = UUID.randomUUID();
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"), jwtService);
        String token = jwtService.generateToken(activeUser(userId));
        String tamperedToken = token.substring(0, token.length() - 2) + "xx";

        ApiKeyAuthenticator.AuthenticationResult result = authenticator.authenticate("Bearer " + tamperedToken, null);

        assertFalse(result.authenticated());
        assertEquals("invalid_credentials", result.error());
    }

    @Test
    void rejectsExpiredBearerLoginToken() {
        ApiKeyAuthenticator authenticator = new ApiKeyAuthenticator(Set.of("test-secret"), new JwtService("test-jwt-secret"));
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
