package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class MappingDraftRepository {

    @Inject
    PgPool client;

    public Uni<List<MappingDraft>> findByTenantId(String tenantId) {
        return client.preparedQuery(
            "SELECT * FROM mapping_drafts WHERE tenant_id = $1 ORDER BY updated_at DESC"
        )
        .execute(Tuple.of(tenantId))
        .map(this::toMappingDraftList);
    }

    public Uni<List<MappingDraft>> findByPartner(String tenantId, UUID partnerId) {
        return client.preparedQuery(
            "SELECT * FROM mapping_drafts WHERE tenant_id = $1 AND partner_id = $2 ORDER BY updated_at DESC"
        )
        .execute(Tuple.of(tenantId, partnerId))
        .map(this::toMappingDraftList);
    }

    public Uni<MappingDraft> findById(String tenantId, UUID id) {
        return client.preparedQuery(
            "SELECT * FROM mapping_drafts WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toMappingDraft(rowSet.iterator().next());
        });
    }

    public Uni<MappingDraft> findByPartnerAndEventType(String tenantId, UUID partnerId, String eventType) {
        return client.preparedQuery(
            "SELECT * FROM mapping_drafts WHERE tenant_id = $1 AND partner_id = $2 AND event_type = $3"
        )
        .execute(Tuple.of(tenantId, partnerId, eventType))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toMappingDraft(rowSet.iterator().next());
        });
    }

    public Uni<MappingDraft> create(MappingDraft draft) {
        draft.setId(UUID.randomUUID());
        Instant now = Instant.now();
        draft.setCreatedAt(now);
        draft.setUpdatedAt(now);
        LocalDateTime dbNow = LocalDateTime.ofInstant(now, ZoneOffset.UTC);

        return client.preparedQuery(
            "INSERT INTO mapping_drafts (" +
            "id, tenant_id, partner_id, event_type, name, description, source_type, " +
            "source_config, input_schema, canonical_schema_ref, mapping_rules, " +
            "generated_jsonata, validation_rules, status, last_validated_at, " +
            "validation_result, created_at, updated_at, created_by, updated_by" +
            ") VALUES (" +
            "$1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11::jsonb, " +
            "$12, $13::jsonb, $14, $15, $16::jsonb, $17, $18, $19, $20" +
            ") RETURNING *"
        )
        .execute(Tuples.of(
            draft.getId(),
            draft.getTenantId(),
            draft.getPartnerId(),
            draft.getEventType(),
            draft.getName(),
            draft.getDescription(),
            draft.getSourceType().name(),
            draft.getSourceConfig(),
            draft.getInputSchema(),
            draft.getCanonicalSchemaRef(),
            draft.getMappingRules(),
            draft.getGeneratedJsonata(),
            draft.getValidationRules(),
            draft.getStatus().name(),
            toLocalDateTime(draft.getLastValidatedAt()),
            draft.getValidationResult(),
            dbNow,
            dbNow,
            draft.getCreatedBy(),
            draft.getUpdatedBy()
        ))
        .map(rowSet -> toMappingDraft(rowSet.iterator().next()));
    }

    public Uni<MappingDraft> update(MappingDraft draft) {
        Instant now = Instant.now();
        draft.setUpdatedAt(now);

        return client.preparedQuery(
            "UPDATE mapping_drafts SET " +
            "name = $1, description = $2, source_type = $3, source_config = $4::jsonb, " +
            "input_schema = $5::jsonb, canonical_schema_ref = $6, mapping_rules = $7::jsonb, " +
            "generated_jsonata = $8, validation_rules = $9::jsonb, status = $10, " +
            "last_validated_at = $11, validation_result = $12::jsonb, " +
            "updated_at = $13, updated_by = $14 " +
            "WHERE tenant_id = $15 AND id = $16 " +
            "RETURNING *"
        )
        .execute(Tuples.of(
            draft.getName(),
            draft.getDescription(),
            draft.getSourceType().name(),
            draft.getSourceConfig(),
            draft.getInputSchema(),
            draft.getCanonicalSchemaRef(),
            draft.getMappingRules(),
            draft.getGeneratedJsonata(),
            draft.getValidationRules(),
            draft.getStatus().name(),
            toLocalDateTime(draft.getLastValidatedAt()),
            draft.getValidationResult(),
            LocalDateTime.ofInstant(now, ZoneOffset.UTC),
            draft.getUpdatedBy(),
            draft.getTenantId(),
            draft.getId()
        ))
        .map(rowSet -> {
            if (rowSet.size() == 0) {
                return null;
            }
            return toMappingDraft(rowSet.iterator().next());
        });
    }

    public Uni<Boolean> delete(String tenantId, UUID id) {
        return client.preparedQuery(
            "DELETE FROM mapping_drafts WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rowSet -> rowSet.rowCount() > 0);
    }

    private List<MappingDraft> toMappingDraftList(RowSet<Row> rows) {
        List<MappingDraft> drafts = new ArrayList<>();
        for (Row row : rows) {
            drafts.add(toMappingDraft(row));
        }
        return drafts;
    }

    private MappingDraft toMappingDraft(Row row) {
        MappingDraft draft = new MappingDraft();
        draft.setId(row.getUUID("id"));
        draft.setTenantId(row.getString("tenant_id"));
        draft.setPartnerId(row.getUUID("partner_id"));
        draft.setEventType(row.getString("event_type"));
        draft.setName(row.getString("name"));
        draft.setDescription(row.getString("description"));
        draft.setSourceType(MappingDraft.SourceType.valueOf(row.getString("source_type")));
        
        // JSONB columns - use getValue() and convert to string
        Object sourceConfig = row.getValue("source_config");
        draft.setSourceConfig(sourceConfig != null ? sourceConfig.toString() : null);
        
        Object inputSchema = row.getValue("input_schema");
        draft.setInputSchema(inputSchema != null ? inputSchema.toString() : null);
        
        draft.setCanonicalSchemaRef(row.getString("canonical_schema_ref"));
        
        Object mappingRules = row.getValue("mapping_rules");
        draft.setMappingRules(mappingRules != null ? mappingRules.toString() : null);
        
        draft.setGeneratedJsonata(row.getString("generated_jsonata"));
        
        Object validationRules = row.getValue("validation_rules");
        draft.setValidationRules(validationRules != null ? validationRules.toString() : null);
        
        draft.setStatus(MappingDraft.DraftStatus.valueOf(row.getString("status")));
        
        if (row.getLocalDateTime("last_validated_at") != null) {
            draft.setLastValidatedAt(row.getLocalDateTime("last_validated_at").toInstant(java.time.ZoneOffset.UTC));
        }
        
        Object validationResult = row.getValue("validation_result");
        draft.setValidationResult(validationResult != null ? validationResult.toString() : null);
        
        draft.setCreatedAt(row.getLocalDateTime("created_at").toInstant(java.time.ZoneOffset.UTC));
        draft.setUpdatedAt(row.getLocalDateTime("updated_at").toInstant(java.time.ZoneOffset.UTC));
        draft.setCreatedBy(row.getString("created_by"));
        draft.setUpdatedBy(row.getString("updated_by"));
        return draft;
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}
