package com.canonbridge.mappingstudio.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Arrays;

/**
 * Ensures that authenticated users can only access their own tenant's data.
 * 
 * Configuration:
 * - canonbridge.tenant.mappings=api-key:tenant-acme,another-key:tenant-other
 * - If no mapping is configured, any authenticated user can access any tenant (dev mode)
 * 
 * Runs AFTER authentication filter (priority 1001 vs 1000).
 */
@Provider
@Priority(Priorities.AUTHENTICATION + 1)
public class TenantIsolationFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(TenantIsolationFilter.class);

    @ConfigProperty(name = "canonbridge.tenant.isolation.enabled", defaultValue = "false")
    boolean isolationEnabled;

    @ConfigProperty(name = "canonbridge.tenant.mappings")
    Optional<String> tenantMappingsConfig;

    private Map<String, Set<String>> principalToTenants;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (!isolationEnabled) {
            return; // Dev mode - no isolation
        }

        String tenantId = requestContext.getHeaderString("X-Tenant-Id");
        if (tenantId == null || tenantId.isBlank()) {
            return; // Let the resource handle missing tenant
        }

        Principal principal = requestContext.getSecurityContext().getUserPrincipal();
        if (principal == null) {
            return; // Not authenticated - let auth filter handle
        }

        String principalName = principal.getName();
        Map<String, Set<String>> mappings = getPrincipalToTenants();

        if (mappings.isEmpty()) {
            return; // No mappings configured - allow all (dev mode)
        }

        Set<String> allowedTenants = mappings.get(principalName);
        if (allowedTenants == null || !allowedTenants.contains(tenantId)) {
            LOG.warnf("🚫 Tenant isolation violation: principal '%s' attempted to access tenant '%s'", 
                principalName, tenantId);
            requestContext.abortWith(
                Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied for tenant: " + tenantId + "\"}")
                    .build()
            );
        }
    }

    private Map<String, Set<String>> getPrincipalToTenants() {
        if (principalToTenants == null) {
            principalToTenants = parseMappings(tenantMappingsConfig.orElse(""));
        }
        return principalToTenants;
    }

    /**
     * Parse format: "principal1:tenant1,principal1:tenant2,principal2:tenant3"
     */
    static Map<String, Set<String>> parseMappings(String config) {
        if (config == null || config.isBlank()) {
            return Map.of();
        }

        return Arrays.stream(config.split(","))
            .map(String::trim)
            .filter(s -> s.contains(":"))
            .map(s -> s.split(":", 2))
            .collect(Collectors.groupingBy(
                parts -> parts[0].trim(),
                Collectors.mapping(parts -> parts[1].trim(), Collectors.toSet())
            ));
    }
}
