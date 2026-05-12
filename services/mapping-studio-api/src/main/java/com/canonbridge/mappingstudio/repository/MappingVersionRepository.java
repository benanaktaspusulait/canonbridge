package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.domain.MappingVersion;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class MappingVersionRepository {

    @Inject
    PgPool client;

    public Uni<List<MappingVersion>> findByTenantId(String tenantId) {
        return client.preparedQuery(
            "SELECT * FROM mapping_versions WHERE tenant_id = $1 ORDER BY created_at DESC"
        )
        .execute(Tuple.of(tenantId))
        .map(this::toMappingVersionList);
    }

    public Uni<List<MappingVersion>> findByPartner(String tenantId, UUID partnerId) {
        return client.preparedQuery(
            "SELECT * FROM mapping_versions WHERE tenant_id = $1 AND partner_id = $2 ORDER BY version DESC"
        )
        .execute(Tuple.of(tenantId, partnerId))
        .map(this::toMappingVersionList);
    }

    public Uni<MappingVersion> findById(String tenantId, UUID id) {
        return client.preparedQuery(
            "SELECT * FROM mapping_versions WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toMappingVersion(rowSet.iterator().next());
        });
    }

    public Uni<MappingVersion> findActiveByPartnerAndEventType(String tenantId, UUID partnerId, String eventType) {
        return client.preparedQuery(
            "SELECT * FROM mapping_versions " +
            "WHERE tenant_id = $1 AND partner_id = $2 AND event_type = $3 AND status = 'PUBLISHED' " +
            "ORDER BY version DESC LIMIT 1"
        )
        .execute(Tuple.of(tenantId, partnerId, eventType))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toMappingVersion(rowSet.iterator().next());
        });
    }

    public Uni<Integer> getNextVersion(String tenantId, UUID partnerId, String eventType) {
        return client.preparedQuery(
            "SELECT COALESCE(MAX(version), 0) + 1 as next_version " +
            "FROM mapping_versions WHERE tenant_id = $1 AND partner_id = $2 AND event_type = $3"
        )
        .execute(Tuple.of(tenantId, partnerId, eventType))
        .map(rowSet -> rowSet.iterator().next().getInteger("next_version"));
    }

    public Uni<MappingVersion> create(MappingVersion version) {
        version.setId(UUID.randomUUID());
        Instant now = Instant.now();
        version.setCreatedAt(now);
        if (version.getStatus() == MappingVersion.VersionStatus.PUBLISHED) {
            version.setPublishedAt(now);
        }

        return client.preparedQuery(
            "INSERT INTO mapping_versions (" +
            "id, tenant_id, draft_id, partner_id, event_type, version, name, description, " +
            "source_type, config_json, jsonata_expression, input_schema, canonical_schema_ref, " +
            "status, published_at, deprecated_at, publish_notes, checksum, created_at, created_by" +
            ") VALUES (" +
            "$1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12::jsonb, $13, " +
            "$14, $15, $16, $17, $18, $19, $20" +
            ") RETURNING *"
        )
        .execute(Tuple.of(
            version.getId(),
            version.getTenantId(),
            version.getDraftId(),
            version.getPartnerId(),
            version.getEventType(),
            version.getVersion(),
            version.getName(),
            version.getDescription(),
            version.getSourceType().name(),
            version.getConfigJson(),
            version.getJsonataExpression(),
            version.getInputSchema(),
            version.getCanonicalSchemaRef(),
            version.getStatus().name(),
            version.getPublishedAt(),
            version.getDeprecatedAt(),
            version.getPublishNotes(),
            version.getChecksum(),
            version.getCreatedAt(),
            version.getCreatedBy()
        ))
        .map(rowSet -> toMappingVersion(rowSet.iterator().next()));
    }

    public Uni<MappingVersion> deprecate(String tenantId, UUID id) {
        return client.preparedQuery(
            "UPDATE mapping_versions SET status = 'DEPRECATED', deprecated_at = $1 " +
            "WHERE tenant_id = $2 AND id = $3 " +
            "RETURNING *"
        )
        .execute(Tuple.of(Instant.now(), tenantId, id))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toMappingVersion(rowSet.iterator().next());
        });
    }

    private List<MappingVersion> toMappingVersionList(RowSet<Row> rows) {
        List<MappingVersion> versions = new ArrayList<>();
        for (Row row : rows) {
            versions.add(toMappingVersion(row));
        }
        return versions;
    }

    private MappingVersion toMappingVersion(Row row) {
        MappingVersion version = new MappingVersion();
        version.setId(row.getUUID("id"));
        version.setTenantId(row.getString("tenant_id"));
        version.setDraftId(row.getUUID("draft_id"));
        version.setPartnerId(row.getUUID("partner_id"));
        version.setEventType(row.getString("event_type"));
        version.setVersion(row.getInteger("version"));
        version.setName(row.getString("name"));
        version.setDescription(row.getString("description"));
        version.setSourceType(MappingDraft.SourceType.valueOf(row.getString("source_type")));
        version.setConfigJson(row.getString("config_json"));
        version.setJsonataExpression(row.getString("jsonata_expression"));
        version.setInputSchema(row.getString("input_schema"));
        version.setCanonicalSchemaRef(row.getString("canonical_schema_ref"));
        version.setStatus(MappingVersion.VersionStatus.valueOf(row.getString("status")));
        
        if (row.getLocalDateTime("published_at") != null) {
            version.setPublishedAt(row.getLocalDateTime("published_at").toInstant(java.time.ZoneOffset.UTC));
        }
        if (row.getLocalDateTime("deprecated_at") != null) {
            version.setDeprecatedAt(row.getLocalDateTime("deprecated_at").toInstant(java.time.ZoneOffset.UTC));
        }
        
        version.setPublishNotes(row.getString("publish_notes"));
        version.setChecksum(row.getString("checksum"));
        version.setCreatedAt(row.getLocalDateTime("created_at").toInstant(java.time.ZoneOffset.UTC));
        version.setCreatedBy(row.getString("created_by"));
        return version;
    }
}
