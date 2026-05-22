package com.canonbridge.mock.auth;

import com.canonbridge.mock.config.MockConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockTokenService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final MockConfiguration mockConfig;
    private final Map<String, TokenClaims> issuedTokens = new ConcurrentHashMap<>();

    /**
     * CM-V1-H4 FIX: Evict expired tokens every 60 seconds to prevent memory leak.
     */
    @Scheduled(fixedDelay = 60000)
    public void evictExpiredTokens() {
        int before = issuedTokens.size();
        issuedTokens.entrySet().removeIf(e -> !Instant.now().isBefore(e.getValue().expiresAt()));
        int evicted = before - issuedTokens.size();
        if (evicted > 0) {
            log.debug("Evicted {} expired tokens ({} remaining)", evicted, issuedTokens.size());
        }
    }

    public IssuedToken issueToken(String clientId, String requestedScope) {
        return issueToken(clientId, requestedScope, mockConfig.getShopmax().getTokenExpirySeconds());
    }

    public IssuedToken issueExpiredToken(String clientId, String requestedScope) {
        String token = "expired_" + UUID.randomUUID().toString().replace("-", "");
        return new IssuedToken(token, -1, normalizeScope(requestedScope));
    }

    public IssuedToken issueToken(String clientId, String requestedScope, int expiresInSeconds) {
        String token = UUID.randomUUID().toString().replace("-", "");
        String scope = normalizeScope(requestedScope);
        issuedTokens.put(token, new TokenClaims(
                clientId,
                mockConfig.getTenantId(),
                parseScopes(scope),
                Instant.now().plusSeconds(expiresInSeconds)
        ));
        return new IssuedToken(token, expiresInSeconds, scope);
    }

    public BearerValidation validateBearer(String authorization, String... acceptedScopes) {
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            return BearerValidation.unauthorized("invalid_token", "Missing bearer token");
        }

        String token = authorization.substring(BEARER_PREFIX.length()).trim();
        if (token.isEmpty()) {
            return BearerValidation.unauthorized("invalid_token", "Missing bearer token");
        }
        if (token.startsWith("expired_")) {
            return BearerValidation.unauthorized("token_expired", "The access token has expired");
        }

        TokenClaims claims = issuedTokens.get(token);
        if (claims == null) {
            return BearerValidation.unauthorized("invalid_token", "Bearer token was not issued by the mock auth server");
        }
        if (!Instant.now().isBefore(claims.expiresAt())) {
            issuedTokens.remove(token);
            return BearerValidation.unauthorized("token_expired", "The access token has expired");
        }
        if (!hasAcceptedScope(claims.scopes(), acceptedScopes)) {
            return new BearerValidation(false, HttpStatus.FORBIDDEN, "insufficient_scope", "Bearer token does not include the required scope", null);
        }

        return BearerValidation.valid(claims.tenantId());
    }

    private boolean hasAcceptedScope(Set<String> tokenScopes, String... acceptedScopes) {
        if (acceptedScopes == null || acceptedScopes.length == 0) {
            return true;
        }
        return Arrays.stream(acceptedScopes).anyMatch(tokenScopes::contains);
    }

    private String normalizeScope(String requestedScope) {
        String scope = requestedScope == null || requestedScope.isBlank()
                ? mockConfig.getShopmax().getDefaultScope()
                : requestedScope;
        return parseScopes(scope).stream().collect(Collectors.joining(" "));
    }

    private Set<String> parseScopes(String scope) {
        if (scope == null || scope.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(scope.trim().split("\\s+"))
                .filter(value -> !value.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    public record IssuedToken(String accessToken, int expiresIn, String scope) {
    }

    private record TokenClaims(String clientId, String tenantId, Set<String> scopes, Instant expiresAt) {
    }

    public record BearerValidation(boolean valid, HttpStatus status, String error, String description, String tenantId) {
        private static BearerValidation valid(String tenantId) {
            return new BearerValidation(true, HttpStatus.OK, null, null, tenantId);
        }

        private static BearerValidation unauthorized(String error, String description) {
            return new BearerValidation(false, HttpStatus.UNAUTHORIZED, error, description, null);
        }
    }
}
