package com.canonbridge.mappingstudio.security;

import com.canonbridge.mappingstudio.auth.JwtService;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.List;
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

    private List<ApiKeyIdentity> acceptedApiKeys;

    ApiKeyAuthenticator() {
    }

    ApiKeyAuthenticator(Set<String> acceptedApiKeys) {
        this.acceptedApiKeys = acceptedApiKeys.stream()
                .map(ApiKeyIdentity::parse)
                .toList();
        this.apiKeyEnabled = true;
        this.localJwtEnabled = true;
    }

    ApiKeyAuthenticator(Set<String> acceptedApiKeys, JwtService jwtService) {
        this.acceptedApiKeys = acceptedApiKeys.stream()
                .map(ApiKeyIdentity::parse)
                .toList();
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
                            Set.of(tokenClaims.get().role()),
                            Set.of(tokenClaims.get().tenantId())
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

        Optional<ApiKeyIdentity> identity = acceptedApiKeys.stream()
                .filter(acceptedApiKey -> constantTimeEquals(presentedCredential, acceptedApiKey.secret()))
                .findFirst();

        if (identity.isEmpty()) {
            return AuthenticationResult.failed("invalid_credentials", "Invalid API credentials");
        }

        return AuthenticationResult.authenticated(
                identity.get().principal(),
                identity.get().roles(),
                identity.get().tenantIds()
        );
    }

    static List<ApiKeyIdentity> parseApiKeys(String configuredApiKeys) {
        if (configuredApiKeys == null || configuredApiKeys.isBlank()) {
            return List.of();
        }

        String separator = configuredApiKeys.contains(";") ? ";" : ",";
        return Arrays.stream(configuredApiKeys.split(separator))
                .map(String::trim)
                .filter(candidate -> !candidate.isBlank())
                .map(ApiKeyIdentity::parse)
                .toList();
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
            Set<String> tenantIds,
            String error,
            String message
    ) {
        static AuthenticationResult authenticated(String principal, Set<String> roles, Set<String> tenantIds) {
            return new AuthenticationResult(true, principal, roles, tenantIds, null, null);
        }

        static AuthenticationResult failed(String error, String message) {
            return new AuthenticationResult(false, null, Set.of(), Set.of(), error, message);
        }
    }

    record ApiKeyIdentity(String secret, String principal, Set<String> tenantIds, Set<String> roles) {
        private static final Set<String> LEGACY_ROLES = Set.of("integration_author", "viewer");

        static ApiKeyIdentity parse(String value) {
            String[] parts = value.split(":", 4);
            if (parts.length < 4) {
                return legacy(value);
            }

            String secret = parts[0].trim();
            String principal = parts[1].trim();
            Set<String> tenantIds = splitSet(parts[2]);
            Set<String> roles = splitSet(parts[3]);
            if (secret.isBlank() || principal.isBlank() || tenantIds.isEmpty() || roles.isEmpty()) {
                throw new IllegalArgumentException("Invalid API key descriptor. Expected key:principal:tenant1|tenant2:role1|role2");
            }
            return new ApiKeyIdentity(secret, "api-key:" + principal, tenantIds, roles);
        }

        static ApiKeyIdentity legacy(String secret) {
            String trimmed = secret == null ? "" : secret.trim();
            return new ApiKeyIdentity(trimmed, "api-key", Set.of("*"), LEGACY_ROLES);
        }

        private static Set<String> splitSet(String value) {
            return Arrays.stream(value.split("[|,]"))
                    .map(String::trim)
                    .filter(candidate -> !candidate.isBlank())
                    .collect(Collectors.toUnmodifiableSet());
        }
    }
}
