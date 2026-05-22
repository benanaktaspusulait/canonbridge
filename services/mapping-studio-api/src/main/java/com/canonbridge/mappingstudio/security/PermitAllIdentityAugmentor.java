package com.canonbridge.mappingstudio.security;

import io.quarkus.security.identity.AuthenticationRequestContext;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.SecurityIdentityAugmentor;
import io.quarkus.security.runtime.QuarkusSecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Augments all SecurityIdentity instances with all roles so that Quarkus's
 * built-in @RolesAllowed enforcement always passes.
 *
 * Actual authentication and authorization is handled by our custom
 * ApiAuthenticationFilter and RoleAuthorizationFilter (JAX-RS filters).
 *
 * This is necessary because Quarkus enforces @RolesAllowed at the CDI/security
 * layer before our JAX-RS filters run, and our custom JwtService sets a JAX-RS
 * SecurityContext (not a Quarkus SecurityIdentity).
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
