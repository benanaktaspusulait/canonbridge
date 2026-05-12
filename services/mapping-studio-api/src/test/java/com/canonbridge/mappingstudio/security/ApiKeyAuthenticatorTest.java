package com.canonbridge.mappingstudio.security;

import org.junit.jupiter.api.Test;

import java.util.Set;

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
}
