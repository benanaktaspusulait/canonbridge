package com.canonbridge.mappingstudio.security;

import com.canonbridge.mappingstudio.auth.JwtService;
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

        if (apiKeys.isBlank() || containsToken(apiKeys, DEFAULT_API_KEY)) {
            failures.add("CANONBRIDGE_API_KEYS must be set and must not include dev-api-key");
        }
        if (jwtSecret.isBlank() || JwtService.DEFAULT_SECRET.equals(jwtSecret)) {
            failures.add("JWT_SECRET_KEY/canonbridge.jwt.secret must be set to a production secret");
        }
        if (credentialKey.isBlank() || DEFAULT_CREDENTIAL_KEY.equals(credentialKey)) {
            failures.add("CANONBRIDGE_CREDENTIAL_ENCRYPTION_KEY must be set to a production key");
        }
        if (corsOrigins.isBlank() || corsOrigins.contains("*") || corsOrigins.contains("localhost")) {
            failures.add("CORS_ALLOWED_ORIGINS must be explicit production origins only");
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

    private static boolean containsToken(String csv, String token) {
        for (String candidate : csv.split(",")) {
            if (token.equals(candidate.trim())) {
                return true;
            }
        }
        return false;
    }
}
