package com.canonbridge.mappingstudio.credential;

import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.repository.CredentialRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.UUID;

@ApplicationScoped
public class CredentialStoreService implements CredentialMaterialResolver {

    @Inject
    CredentialRepository credentialRepository;

    @Inject
    CredentialSecretCodec secretCodec;

    @Override
    public Uni<CredentialMaterial> resolve(UUID credentialId, String tenantId) {
        System.out.println("DEBUG CredentialStoreService: resolve called - credentialId: " + credentialId + ", tenantId: " + tenantId);
        if (credentialId == null) {
            System.out.println("DEBUG CredentialStoreService: credentialId is null, returning null");
            return Uni.createFrom().nullItem();
        }

        return credentialRepository.findSecretById(credentialId, tenantId)
                .map(stored -> {
                    System.out.println("DEBUG CredentialStoreService: findSecretById returned: " + (stored != null ? "found" : "null"));
                    if (stored == null) {
                        throw new NotFoundException("Credential not found");
                    }
                    if (stored.status() != Credential.CredentialStatus.ACTIVE) {
                        throw new ForbiddenException("Credential is not active");
                    }
                    System.out.println("DEBUG CredentialStoreService: Creating CredentialMaterial - authType: " + stored.authType());
                    System.out.println("DEBUG CredentialStoreService: Encrypted secret: " + stored.encryptedSecretJson());
                    JsonObject decrypted = secretCodec.decrypt(stored.encryptedSecretJson());
                    System.out.println("DEBUG CredentialStoreService: Decrypted secret: " + decrypted.encode());
                    return new CredentialMaterial(
                            stored.credentialId(),
                            stored.tenantId(),
                            stored.authType(),
                            stored.environment(),
                            decrypted
                    );
                })
                .chain(material -> credentialRepository.updateLastUsed(credentialId, tenantId).replaceWith(material));
    }
}
