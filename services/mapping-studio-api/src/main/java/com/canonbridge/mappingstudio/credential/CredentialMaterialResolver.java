package com.canonbridge.mappingstudio.credential;

import io.smallrye.mutiny.Uni;

import java.util.UUID;

public interface CredentialMaterialResolver {
    Uni<CredentialMaterial> resolve(UUID credentialId, String tenantId);
}
