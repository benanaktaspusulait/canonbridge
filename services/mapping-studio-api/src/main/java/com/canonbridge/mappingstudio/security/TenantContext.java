package com.canonbridge.mappingstudio.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * [A-V8-H2] Tenant context helper.
 *
 * In the updated architecture, tenant identity is derived from JWT claims
 * and set as a request property by {@link SingleTenantContextFilter}.
 * This class provides validation helpers for resources that need to
 * confirm tenant context is present.
 */
@ApplicationScoped
public class TenantContext {

    @ConfigProperty(name = "canonbridge.tenant.single-tenant.enabled", defaultValue = "true")
    boolean singleTenantEnabled;

    @ConfigProperty(name = "canonbridge.tenant.default-id", defaultValue = "tenant-acme")
    String defaultTenantId;

    /**
     * Validates and returns the tenant ID.
     * In single-tenant mode, always returns the default tenant.
     * In multi-tenant mode, requires a non-null tenant ID (from JWT claims).
     */
    public String requireTenantId(String tenantIdFromContext) {
        String tenantId = trimToNull(tenantIdFromContext);
        if (tenantId == null) {
            if (singleTenantEnabled) {
                return defaultTenantId;
            }
            throw new BadRequestException("Tenant context is required (derived from authentication)");
        }

        if (singleTenantEnabled && !defaultTenantId.equals(tenantId)) {
            throw new ForbiddenException("Only tenant '" + defaultTenantId + "' is available");
        }

        return tenantId;
    }

    public String defaultTenantId() {
        return defaultTenantId;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
