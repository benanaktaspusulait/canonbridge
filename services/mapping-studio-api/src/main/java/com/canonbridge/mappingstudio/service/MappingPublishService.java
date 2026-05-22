package com.canonbridge.mappingstudio.service;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.domain.MappingVersion;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.repository.MappingVersionRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Service for publishing mapping drafts as immutable versions.
 * 
 * Flow:
 * 1. Validate draft is ready (has required fields)
 * 2. Build config_json snapshot (complete runtime config)
 * 3. Compute checksum
 * 4. Get next version number
 * 5. Create immutable MappingVersion record
 * 6. Update draft status to READY_TO_PUBLISH
 */
@ApplicationScoped
public class MappingPublishService {

    private static final Logger LOG = Logger.getLogger(MappingPublishService.class);

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    MappingVersionRepository versionRepository;

    public Uni<MappingVersion> publish(MappingDraft draft, String userId, String publishNotes) {
        LOG.infof("📦 Publishing mapping: %s (partner: %s, event: %s)", 
            draft.getName(), draft.getPartnerId(), draft.getEventType());

        // Validate draft is ready
        String validationError = validateForPublish(draft);
        if (validationError != null) {
            return Uni.createFrom().failure(
                new IllegalStateException("Cannot publish: " + validationError)
            );
        }

        // Build config snapshot
        String configJson = buildConfigSnapshot(draft);
        String jsonataExpression = draft.getGeneratedJsonata() != null ? draft.getGeneratedJsonata() : "";
        String checksum = computeChecksum(configJson);

        return versionRepository.getNextVersion(draft.getTenantId(), draft.getPartnerId(), draft.getEventType())
            .chain(nextVersion -> {
                LOG.infof("📦 Creating version %d for %s/%s", nextVersion, draft.getPartnerId(), draft.getEventType());

                MappingVersion version = new MappingVersion();
                version.setTenantId(draft.getTenantId());
                version.setDraftId(draft.getId());
                version.setPartnerId(draft.getPartnerId());
                version.setEventType(draft.getEventType());
                version.setVersion(nextVersion);
                version.setName(draft.getName());
                version.setDescription(draft.getDescription());
                version.setSourceType(draft.getSourceType());
                version.setConfigJson(configJson);
                version.setJsonataExpression(jsonataExpression);
                version.setInputSchema(draft.getInputSchema());
                version.setCanonicalSchemaRef(draft.getCanonicalSchemaRef());
                version.setStatus(MappingVersion.VersionStatus.PUBLISHED);
                version.setPublishNotes(publishNotes);
                version.setChecksum(checksum);
                version.setCreatedBy(userId);

                return versionRepository.create(version);
            })
            .invoke(published -> {
                // Update draft status
                draft.setStatus(MappingDraft.DraftStatus.READY_TO_PUBLISH);
                draft.setUpdatedBy(userId);
                draftRepository.update(draft).subscribe().with(
                    updated -> LOG.infof("Draft status updated after publish"),
                    err -> LOG.warnf("Failed to update draft status: %s", err.getMessage())
                );

                // Auto-register webhook endpoint if source type is WEBHOOK
                if (draft.getSourceType() == MappingDraft.SourceType.WEBHOOK) {
                    registerWebhookEndpoint(draft);
                }
            });
    }

    private void registerWebhookEndpoint(MappingDraft draft) {
        try {
            io.vertx.core.json.JsonObject sourceConfig = new io.vertx.core.json.JsonObject(draft.getSourceConfig());
            String webhookPath = sourceConfig.getString("endpoint", "/webhook/" + draft.getPartnerId() + "/" + draft.getEventType());
            String webhookKey = "wh-" + draft.getId().toString().substring(0, 8);
            String secretHash = hashWebhookKey(webhookKey);

            String sql = "INSERT INTO webhook_endpoints (tenant_id, partner_id, draft_id, name, path, webhook_key, secret_hash, status) " +
                "VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE') " +
                "ON CONFLICT (tenant_id, path) DO UPDATE SET status = 'ACTIVE', webhook_key = EXCLUDED.webhook_key, secret_hash = EXCLUDED.secret_hash, updated_at = NOW()";

            draftRepository.getClient().preparedQuery(sql)
                .execute(io.vertx.mutiny.sqlclient.Tuple.tuple()
                    .addString(draft.getTenantId())
                    .addUUID(draft.getPartnerId())
                    .addUUID(draft.getId())
                    .addString(draft.getName() + " Webhook")
                    .addString(webhookPath)
                    .addString(webhookKey)
                    .addString(secretHash)
                )
                .subscribe().with(
                    result -> LOG.infof("Webhook endpoint registered: %s (key: %s)", webhookPath, webhookKey),
                    err -> LOG.warnf("Failed to register webhook endpoint: %s", err.getMessage())
                );
        } catch (Exception e) {
            LOG.warnf("Failed to register webhook endpoint: %s", e.getMessage());
        }
    }

    private String hashWebhookKey(String key) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(key.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return key;
        }
    }

    private String validateForPublish(MappingDraft draft) {
        if (draft.getPartnerId() == null) return "Partner ID is required";
        if (draft.getEventType() == null || draft.getEventType().isBlank()) return "Event type is required";
        if (draft.getName() == null || draft.getName().isBlank()) return "Name is required";
        if (draft.getSourceType() == null) return "Source type is required";
        if (draft.getGeneratedJsonata() == null || draft.getGeneratedJsonata().isBlank()) {
            if (draft.getMappingRules() == null || draft.getMappingRules().isBlank()) {
                return "Mapping rules or JSONata expression is required";
            }
        }
        return null;
    }

    private String buildConfigSnapshot(MappingDraft draft) {
        JsonObject config = new JsonObject();
        config.put("sourceType", draft.getSourceType().name());
        config.put("sourceConfig", draft.getSourceConfig() != null ? new JsonObject(draft.getSourceConfig()) : new JsonObject());
        config.put("mappingRules", draft.getMappingRules());
        config.put("generatedJsonata", draft.getGeneratedJsonata());
        config.put("targetSchemaJson", draft.getTargetSchemaJson());
        config.put("validationRules", draft.getValidationRules());
        config.put("canonicalSchemaRef", draft.getCanonicalSchemaRef());
        return config.encode();
    }

    private String computeChecksum(String configJson) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(configJson.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString().substring(0, 16); // Short checksum for display
        } catch (Exception e) {
            return "unknown";
        }
    }
}
