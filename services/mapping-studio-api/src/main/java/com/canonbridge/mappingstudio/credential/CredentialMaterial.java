package com.canonbridge.mappingstudio.credential;

import com.canonbridge.mappingstudio.domain.Credential;
import io.vertx.core.json.JsonObject;

import java.util.UUID;

public record CredentialMaterial(
        UUID credentialId,
        String tenantId,
        Credential.AuthType authType,
        Credential.Environment environment,
        JsonObject secret
) {
}
