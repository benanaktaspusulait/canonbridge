package com.canonbridge.mappingstudio.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class TenantContext {

    @ConfigProperty(name = "canonbridge.tenant.single-tenant.enabled", defaultValue = "true")
    boolean singleTenantEnabled;

    @ConfigProperty(name = "canonbridge.tenant.default-id", defaultValue = "tenant-acme")
    String defaultTenantId;

    public String requireTenantId(String suppliedTenantId) {
        String tenantId = trimToNull(suppliedTenantId);
        if (tenantId == null) {
            if (singleTenantEnabled) {
                return defaultTenantId;
            }
            throw new BadRequestException("X-Tenant-Id header is required");
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
