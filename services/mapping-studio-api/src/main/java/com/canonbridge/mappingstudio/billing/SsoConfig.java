package com.canonbridge.mappingstudio.billing;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * TASK-027 & TASK-030: SSO configuration.
 * Google Workspace SSO is available on Growth+ plans.
 * SAML/OIDC is available on Scale+ plans.
 * SCIM provisioning is available on Enterprise.
 *
 * The actual OIDC integration is handled by Quarkus OIDC extension
 * (already configured in application.properties). This class provides
 * plan-gated feature checks.
 */
@ApplicationScoped
public class SsoConfig {

    @ConfigProperty(name = "canonbridge.sso.google.enabled", defaultValue = "false")
    boolean googleSsoEnabled;

    @ConfigProperty(name = "canonbridge.sso.saml.enabled", defaultValue = "false")
    boolean samlEnabled;

    @ConfigProperty(name = "canonbridge.sso.scim.enabled", defaultValue = "false")
    boolean scimEnabled;

    /**
     * Check if SSO is available for a given plan.
     */
    public boolean isSsoAvailable(String planCode) {
        return switch (planCode) {
            case "growth" -> googleSsoEnabled;
            case "scale", "enterprise" -> true;
            default -> false;
        };
    }

    /**
     * Check if SAML/OIDC is available for a given plan.
     */
    public boolean isSamlAvailable(String planCode) {
        return "scale".equals(planCode) || "enterprise".equals(planCode);
    }

    /**
     * Check if SCIM provisioning is available for a given plan.
     */
    public boolean isScimAvailable(String planCode) {
        return "enterprise".equals(planCode);
    }
}
