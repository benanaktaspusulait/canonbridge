package com.canonbridge.billing.security;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.Config;
import org.eclipse.microprofile.config.ConfigProvider;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Startup validator that fails fast if billing-service is running in production
 * with insecure default configurations.
 *
 * Checks:
 * - Internal service secret must be set (not blank)
 * - Paddle webhook secret must be set (not blank)
 * - Database password must not be 'postgres'
 * - CORS origins must not contain localhost
 * - API keys must be configured
 */
@ApplicationScoped
public class BillingSecurityConfigurationValidator {

    private static final String DEFAULT_DB_PASSWORD = "postgres";

    void onStart(@Observes StartupEvent ignored) {
        Config config = ConfigProvider.getConfig();

        String environment = value(config, "canonbridge.security.environment", "development").toLowerCase(Locale.ROOT);
        if (!environment.equals("production") && !environment.equals("prod")) {
            return;
        }

        List<String> failures = new ArrayList<>();

        // Internal service secret
        String internalSecret = value(config, "canonbridge.billing.internal-service-secret", "");
        if (internalSecret.isBlank()) {
            failures.add("BILLING_INTERNAL_SERVICE_SECRET must be set in production for service-to-service auth");
        }

        // Paddle webhook secret
        String paddleWebhookSecret = value(config, "canonbridge.paddle.webhook-secret", "");
        if (paddleWebhookSecret.isBlank()) {
            failures.add("PADDLE_WEBHOOK_SECRET must be set in production — webhook signature verification is mandatory");
        }

        // Database password
        String dbPassword = value(config, "quarkus.datasource.password", "");
        if (dbPassword.isBlank() || DEFAULT_DB_PASSWORD.equals(dbPassword)) {
            failures.add("DB_PASSWORD must be set to a secure production password (not 'postgres')");
        }

        // CORS origins
        String corsOrigins = value(config, "quarkus.http.cors.origins", "");
        if (corsOrigins.isBlank() || corsOrigins.contains("localhost")) {
            failures.add("CORS_ALLOWED_ORIGINS must be explicit production origins (no localhost)");
        }

        // API keys
        String apiKeys = value(config, "canonbridge.billing.api-keys", "");
        if (apiKeys.isBlank()) {
            failures.add("BILLING_API_KEYS must be configured for external API access");
        }

        // V5-M4 FIX: JWT secret must be configured in production
        String jwtSecret = value(config, "canonbridge.jwt.secret", "");
        if (jwtSecret.isBlank()) {
            failures.add("JWT_SECRET_KEY must be set in production — all JWT auth will silently fail without it");
        }

        // Auth enabled
        boolean authEnabled = booleanValue(config, "canonbridge.billing.auth.enabled", true);
        if (!authEnabled) {
            failures.add("BILLING_AUTH_ENABLED must not be false in production");
        }

        if (!failures.isEmpty()) {
            throw new IllegalStateException(
                    "[billing-service] Insecure production configuration detected:\n  - "
                            + String.join("\n  - ", failures)
            );
        }
    }

    private static String value(Config config, String name, String fallback) {
        return config.getOptionalValue(name, String.class).orElse(fallback).trim();
    }

    private static boolean booleanValue(Config config, String name, boolean fallback) {
        return config.getOptionalValue(name, Boolean.class).orElse(fallback);
    }
}
