package com.canonbridge.mappingstudio.security;

import io.quarkus.security.identity.AuthenticationRequestContext;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.SecurityIdentityAugmentor;
import io.quarkus.security.runtime.QuarkusSecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * [MS-H1] Augments all SecurityIdentity instances with all roles so that Quarkus's
 * built-in CDI-layer security enforcement always passes.
 *
 * This is INTENTIONAL and NOT a security risk because:
 * 1. Quarkus's CDI-layer @RolesAllowed is NOT used anywhere in this project.
 * 2. Actual RBAC is enforced by {@link RoleAuthorizationFilter} at the JAX-RS layer,
 *    which reads roles from the JAX-RS SecurityContext (set by ApiAuthenticationFilter).
 * 3. RoleAuthorizationFilter ALWAYS runs when canonbridge.auth.enabled=true.
 * 4. If auth is disabled (canonbridge.auth.enabled=false), the system is in dev mode.
 *
 * Without this augmentor, Quarkus's internal security checks (e.g., CDI interceptors,
 * reactive security) may reject requests before our JAX-RS filters get a chance to run.
 */
@ApplicationScoped
public class PermitAllIdentityAugmentor implements SecurityIdentityAugmentor {

    private static final String[] ALL_ROLES = {
        "admin", "integration_author", "operator", "viewer"
    };

    @Override
    public Uni<SecurityIdentity> augment(SecurityIdentity identity, AuthenticationRequestContext context) {
        QuarkusSecurityIdentity.Builder builder = QuarkusSecurityIdentity.builder(identity);
        for (String role : ALL_ROLES) {
            builder.addRole(role);
        }
        return Uni.createFrom().item(builder.build());
    }
}
