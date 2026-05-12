package com.canonbridge.mappingstudio.security;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class ApiKeyAuthenticator {

    @ConfigProperty(name = "canonbridge.auth.api-keys", defaultValue = "dev-api-key")
    String configuredApiKeys;

    private Set<String> acceptedApiKeys;

    ApiKeyAuthenticator() {
    }

    ApiKeyAuthenticator(Set<String> acceptedApiKeys) {
        this.acceptedApiKeys = Set.copyOf(acceptedApiKeys);
    }

    @PostConstruct
    void init() {
        this.acceptedApiKeys = parseApiKeys(configuredApiKeys);
    }

    public AuthenticationResult authenticate(String authorizationHeader, String apiKeyHeader) {
        Optional<String> presentedCredential = extractPresentedCredential(authorizationHeader, apiKeyHeader);
        if (presentedCredential.isEmpty()) {
            return AuthenticationResult.failed("missing_credentials", "Missing API credentials");
        }

        if (acceptedApiKeys == null || acceptedApiKeys.isEmpty()) {
            return AuthenticationResult.failed("auth_misconfigured", "API authentication is enabled but no API keys are configured");
        }

        boolean valid = acceptedApiKeys.stream()
                .anyMatch(acceptedApiKey -> constantTimeEquals(presentedCredential.get(), acceptedApiKey));

        if (!valid) {
            return AuthenticationResult.failed("invalid_credentials", "Invalid API credentials");
        }

        return AuthenticationResult.authenticated("api-key");
    }

    static Set<String> parseApiKeys(String configuredApiKeys) {
        if (configuredApiKeys == null || configuredApiKeys.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(configuredApiKeys.split(","))
                .map(String::trim)
                .filter(candidate -> !candidate.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    static Optional<String> extractPresentedCredential(String authorizationHeader, String apiKeyHeader) {
        if (apiKeyHeader != null && !apiKeyHeader.isBlank()) {
            return Optional.of(apiKeyHeader.trim());
        }

        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return Optional.empty();
        }

        String trimmedAuthorization = authorizationHeader.trim();
        if (!trimmedAuthorization.regionMatches(true, 0, "Bearer ", 0, "Bearer ".length())) {
            return Optional.empty();
        }

        String bearerToken = trimmedAuthorization.substring("Bearer ".length()).trim();
        if (bearerToken.isBlank()) {
            return Optional.empty();
        }

        return Optional.of(bearerToken);
    }

    private static boolean constantTimeEquals(String presentedCredential, String acceptedApiKey) {
        byte[] presentedBytes = presentedCredential.getBytes(StandardCharsets.UTF_8);
        byte[] acceptedBytes = acceptedApiKey.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(presentedBytes, acceptedBytes);
    }

    public record AuthenticationResult(
            boolean authenticated,
            String principal,
            String error,
            String message
    ) {
        static AuthenticationResult authenticated(String principal) {
            return new AuthenticationResult(true, principal, null, null);
        }

        static AuthenticationResult failed(String error, String message) {
            return new AuthenticationResult(false, null, error, message);
        }
    }
}
