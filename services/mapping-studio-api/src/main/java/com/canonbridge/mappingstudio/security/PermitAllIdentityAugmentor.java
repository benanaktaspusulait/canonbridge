package com.canonbridge.mappingstudio.security;

import io.quarkus.security.identity.AuthenticationRequestContext;
import io.quarkus.security.identity.SecurityIdentity;
import io.quarkus.security.identity.SecurityIdentityAugmentor;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * [MS-H1] FIX: No longer grants all roles to every identity.
 *
 * Previously this augmentor added all roles to every SecurityIdentity, making
 * Quarkus's built-in @RolesAllowed decorative. This was a security risk: if
 * RoleAuthorizationFilter was disabled (canonbridge.rbac.enabled=false), every
 * endpoint was wide open.
 *
 * Now this augmentor is a no-op pass-through. Quarkus's built-in auth is already
 * configured to permit all via:
 *   quarkus.http.auth.permission.permit-all.paths=/*
 *   quarkus.security.jaxrs.deny-unannotated-endpoints=false
 *
 * Actual RBAC is enforced by {@link RoleAuthorizationFilter} at the JAX-RS layer.
 * The filter ALWAYS runs when canonbridge.auth.enabled=true (regardless of rbac flag).
 */
@ApplicationScoped
public class PermitAllIdentityAugmentor implements SecurityIdentityAugmentor {

    @Override
    public Uni<SecurityIdentity> augment(SecurityIdentity identity, AuthenticationRequestContext context) {
        // Pass through without modification — Quarkus permit-all config handles CDI layer,
        // RoleAuthorizationFilter handles actual RBAC at JAX-RS layer.
        return Uni.createFrom().item(identity);
    }
}
