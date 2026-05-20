package com.canonbridge.mappingstudio.security;

import com.canonbridge.mappingstudio.auth.JwtService;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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

    @ConfigProperty(name = "canonbridge.auth.api-key.enabled", defaultValue = "true")
    boolean apiKeyEnabled = true;

    @ConfigProperty(name = "canonbridge.auth.local-jwt.enabled", defaultValue = "true")
    boolean localJwtEnabled = true;

    @ConfigProperty(name = "canonbridge.auth.bearer-api-key.enabled", defaultValue = "false")
    boolean bearerApiKeyEnabled = false;

    @Inject
    JwtService jwtService;

    private Set<String> acceptedApiKeys;

    ApiKeyAuthenticator() {
    }

    ApiKeyAuthenticator(Set<String> acceptedApiKeys) {
        this.acceptedApiKeys = Set.copyOf(acceptedApiKeys);
        this.apiKeyEnabled = true;
        this.localJwtEnabled = true;
    }

    ApiKeyAuthenticator(Set<String> acceptedApiKeys, JwtService jwtService) {
        this.acceptedApiKeys = Set.copyOf(acceptedApiKeys);
        this.jwtService = jwtService;
        this.apiKeyEnabled = true;
        this.localJwtEnabled = true;
    }

    @PostConstruct
    void init() {
        this.acceptedApiKeys = parseApiKeys(configuredApiKeys);
    }

    public AuthenticationResult authenticate(String authorizationHeader, String apiKeyHeader) {
        Optional<String> presentedApiKey = extractApiKeyCredential(apiKeyHeader);
        if (presentedApiKey.isPresent() && apiKeyEnabled) {
            AuthenticationResult apiKeyResult = authenticateApiKey(presentedApiKey.get());
            if (apiKeyResult.authenticated()) {
                return apiKeyResult;
            }
            if ("auth_misconfigured".equals(apiKeyResult.error())) {
                return apiKeyResult;
            }
        }

        Optional<String> bearerToken = extractBearerToken(authorizationHeader);
        if (bearerToken.isPresent()) {
            if (localJwtEnabled && jwtService != null) {
                Optional<JwtService.TokenClaims> tokenClaims = jwtService.validateToken(bearerToken.get());
                if (tokenClaims.isPresent()) {
                    return AuthenticationResult.authenticated(
                            "user:" + tokenClaims.get().userId(),
                            Set.of(tokenClaims.get().role())
                    );
                }
            }

            if (bearerApiKeyEnabled && apiKeyEnabled) {
                AuthenticationResult apiKeyResult = authenticateApiKey(bearerToken.get());
                if (apiKeyResult.authenticated()) {
                    return apiKeyResult;
                }
                if ("auth_misconfigured".equals(apiKeyResult.error())) {
                    return apiKeyResult;
                }
            }
        }

        if (!apiKeyEnabled && !localJwtEnabled) {
            return AuthenticationResult.failed("auth_misconfigured", "Authentication is enabled but no local authentication method is enabled");
        }

        if (presentedApiKey.isEmpty() && bearerToken.isEmpty()) {
            return AuthenticationResult.failed("missing_credentials", "Missing API credentials");
        }

        return AuthenticationResult.failed("invalid_credentials", "Invalid API credentials");
    }

    private AuthenticationResult authenticateApiKey(String presentedCredential) {
        if (acceptedApiKeys == null || acceptedApiKeys.isEmpty()) {
            return AuthenticationResult.failed("auth_misconfigured", "API authentication is enabled but no API keys are configured");
        }

        boolean valid = acceptedApiKeys.stream()
                .anyMatch(acceptedApiKey -> constantTimeEquals(presentedCredential, acceptedApiKey));

        if (!valid) {
            return AuthenticationResult.failed("invalid_credentials", "Invalid API credentials");
        }

        return AuthenticationResult.authenticated("api-key", Set.of("admin"));
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

    static Optional<String> extractApiKeyCredential(String apiKeyHeader) {
        if (apiKeyHeader != null && !apiKeyHeader.isBlank()) {
            return Optional.of(apiKeyHeader.trim());
        }

        return Optional.empty();
    }

    static Optional<String> extractBearerToken(String authorizationHeader) {
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
            Set<String> roles,
            String error,
            String message
    ) {
        static AuthenticationResult authenticated(String principal, Set<String> roles) {
            return new AuthenticationResult(true, principal, roles, null, null);
        }

        static AuthenticationResult failed(String error, String message) {
            return new AuthenticationResult(false, null, Set.of(), error, message);
        }
    }
}
