package com.canonbridge.mappingstudio.credential;

import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.repository.CredentialRepository;
import io.smallrye.mutiny.Uni;
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
        if (credentialId == null) {
            return Uni.createFrom().nullItem();
        }

        return credentialRepository.findSecretById(credentialId, tenantId)
                .map(stored -> {
                    if (stored == null) {
                        throw new NotFoundException("Credential not found");
                    }
                    if (stored.status() != Credential.CredentialStatus.ACTIVE) {
                        throw new ForbiddenException("Credential is not active");
                    }
                    return new CredentialMaterial(
                            stored.credentialId(),
                            stored.tenantId(),
                            stored.authType(),
                            stored.environment(),
                            secretCodec.decrypt(stored.encryptedSecretJson())
                    );
                })
                .chain(material -> credentialRepository.updateLastUsed(credentialId, tenantId).replaceWith(material));
    }
}
