package com.canonbridge.mappingstudio.security;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.Config;
import org.eclipse.microprofile.config.ConfigProvider;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@ApplicationScoped
public class SecurityConfigurationValidator {

    private static final String DEFAULT_API_KEY = "dev-api-key";
    private static final String DEFAULT_CREDENTIAL_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    void onStart(@Observes StartupEvent ignored) {
        Config config = ConfigProvider.getConfig();
        if (!config.getOptionalValue("canonbridge.security.fail-on-insecure-defaults", Boolean.class).orElse(true)) {
            return;
        }

        String environment = value(config, "canonbridge.security.environment", "development").toLowerCase(Locale.ROOT);
        if (!environment.equals("production") && !environment.equals("prod")) {
            return;
        }

        List<String> failures = new ArrayList<>();
        String apiKeys = value(config, "canonbridge.auth.api-keys", "");
        String jwtSecret = value(config, "canonbridge.jwt.secret", "");
        String credentialKey = value(config, "canonbridge.credentials.encryption-key", "");
        String corsOrigins = value(config, "quarkus.http.cors.origins", "");
        boolean authEnabled = booleanValue(config, "canonbridge.auth.enabled", true);
        boolean apiKeyEnabled = booleanValue(config, "canonbridge.auth.api-key.enabled", true);
        boolean localJwtEnabled = booleanValue(config, "canonbridge.auth.local-jwt.enabled", true);
        boolean localLoginEnabled = booleanValue(config, "canonbridge.auth.local-login.enabled", true);
        boolean bearerApiKeyEnabled = booleanValue(config, "canonbridge.auth.bearer-api-key.enabled", false);
        boolean oidcEnabled = booleanValue(config, "quarkus.oidc.enabled", false);
        boolean productionRequiresOidc = booleanValue(config, "canonbridge.security.production-requires-oidc", true);
        boolean requireOidcClientSecret = booleanValue(config, "canonbridge.security.require-oidc-client-secret", true);
        boolean productionAllowsLocalLogin = booleanValue(config, "canonbridge.security.production-allows-local-login", false);

        if (!authEnabled) {
            failures.add("CANONBRIDGE_AUTH_ENABLED must not be false in production");
        }
        if (apiKeyEnabled && (apiKeys.isBlank() || containsToken(apiKeys, DEFAULT_API_KEY))) {
            failures.add("CANONBRIDGE_API_KEYS must be set and must not include dev-api-key");
        }
        if (localJwtEnabled && jwtSecret.isBlank()) {
            failures.add("JWT_SECRET_KEY/canonbridge.jwt.secret must be set to a production secret");
        }
        if (bearerApiKeyEnabled) {
            failures.add("CANONBRIDGE_BEARER_API_KEY_ENABLED must remain false in production; use X-API-Key or OIDC Bearer tokens");
        }
        if (localLoginEnabled && !productionAllowsLocalLogin) {
            failures.add("CANONBRIDGE_LOCAL_LOGIN_ENABLED must be false in production unless CANONBRIDGE_PRODUCTION_ALLOWS_LOCAL_LOGIN=true is explicitly set");
        }
        if (productionRequiresOidc && !oidcEnabled) {
            failures.add("OIDC_ENABLED/quarkus.oidc.enabled must be true in production");
        }
        if (oidcEnabled) {
            String oidcServerUrl = value(config, "quarkus.oidc.auth-server-url", "");
            String oidcClientId = value(config, "quarkus.oidc.client-id", "");
            String oidcClientSecret = value(config, "quarkus.oidc.credentials.secret", "");
            if (oidcServerUrl.isBlank() || oidcServerUrl.contains("localhost") || oidcServerUrl.startsWith("http://")) {
                failures.add("OIDC_SERVER_URL/quarkus.oidc.auth-server-url must be an HTTPS production issuer URL");
            }
            if (oidcClientId.isBlank()) {
                failures.add("OIDC_CLIENT_ID/quarkus.oidc.client-id must be set in production");
            }
            if (requireOidcClientSecret && oidcClientSecret.isBlank()) {
                failures.add("OIDC_CLIENT_SECRET/quarkus.oidc.credentials.secret must be set in production");
            }
        }
        if (credentialKey.isBlank() || DEFAULT_CREDENTIAL_KEY.equals(credentialKey)) {
            failures.add("CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY must be set to a production key");
        }
        if (corsOrigins.isBlank() || corsOrigins.contains("*") || corsOrigins.contains("localhost")) {
            failures.add("CORS_ALLOWED_ORIGINS must be explicit production origins only");
        }
        // M-Y3 FIX: Check database password is not the insecure default
        String dbPassword = value(config, "quarkus.datasource.password", "");
        if (dbPassword.isBlank() || "postgres".equals(dbPassword)) {
            failures.add("DB_PASSWORD must be set to a secure production password (not 'postgres')");
        }
        if (value(config, "quarkus.swagger-ui.always-include", "false").equalsIgnoreCase("true")) {
            failures.add("Swagger UI must not be publicly included in production");
        }
        if (value(config, "canonbridge.auth.public-docs.enabled", "false").equalsIgnoreCase("true")) {
            failures.add("Public OpenAPI/Swagger docs must be disabled in production");
        }

        if (!failures.isEmpty()) {
            throw new IllegalStateException("Insecure production security configuration: " + String.join("; ", failures));
        }
    }

    private static String value(Config config, String name, String fallback) {
        return config.getOptionalValue(name, String.class).orElse(fallback).trim();
    }

    private static boolean booleanValue(Config config, String name, boolean fallback) {
        return config.getOptionalValue(name, Boolean.class).orElse(fallback);
    }

    private static boolean containsToken(String csv, String token) {
        for (String candidate : csv.split(",")) {
            if (token.equals(candidate.trim())) {
                return true;
            }
        }
        return false;
    }
}
