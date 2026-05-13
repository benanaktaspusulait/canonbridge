package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.SchemaDefinition;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class SchemaRepository {

    @Inject
    PgPool client;

    public Uni<List<SchemaDefinition>> findByTenantId(String tenantId) {
        return client.preparedQuery(
                "SELECT * FROM schemas WHERE tenant_id = $1 ORDER BY updated_at DESC"
        )
        .execute(Tuple.of(tenantId))
        .map(this::toSchemaList);
    }

    public Uni<List<SchemaDefinition>> findByType(String tenantId, SchemaDefinition.SchemaType schemaType) {
        return client.preparedQuery(
                "SELECT * FROM schemas WHERE tenant_id = $1 AND schema_type = $2 ORDER BY subject, version DESC"
        )
        .execute(Tuple.of(tenantId, schemaType.name()))
        .map(this::toSchemaList);
    }

    public Uni<List<SchemaDefinition>> findBySubject(String tenantId, String subject) {
        return client.preparedQuery(
                "SELECT * FROM schemas WHERE tenant_id = $1 AND subject = $2 ORDER BY version DESC"
        )
        .execute(Tuple.of(tenantId, subject))
        .map(this::toSchemaList);
    }

    public Uni<SchemaDefinition> findById(String tenantId, UUID id) {
        return client.preparedQuery(
                "SELECT * FROM schemas WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rows -> rows.iterator().hasNext() ? toSchema(rows.iterator().next()) : null);
    }

    public Uni<SchemaDefinition> findLatestActive(String tenantId, String subject) {
        return client.preparedQuery(
                "SELECT * FROM schemas WHERE tenant_id = $1 AND subject = $2 AND status = 'ACTIVE' ORDER BY version DESC LIMIT 1"
        )
        .execute(Tuple.of(tenantId, subject))
        .map(rows -> rows.iterator().hasNext() ? toSchema(rows.iterator().next()) : null);
    }

    public Uni<SchemaDefinition> create(SchemaDefinition schema) {
        return resolveVersion(schema).chain(version -> {
            Instant now = Instant.now();
            UUID id = schema.id() != null ? schema.id() : UUID.randomUUID();
            SchemaDefinition.SchemaStatus status = schema.status() != null ? schema.status() : SchemaDefinition.SchemaStatus.DRAFT;
            SchemaDefinition.CompatibilityMode compatibilityMode = schema.compatibilityMode() != null
                    ? schema.compatibilityMode()
                    : SchemaDefinition.CompatibilityMode.BACKWARD;

            return client.preparedQuery(
                    "INSERT INTO schemas (" +
                    "id, tenant_id, name, schema_type, subject, version, schema_json, " +
                    "compatibility_mode, status, description, created_at, updated_at, created_by, updated_by" +
                    ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) " +
                    "RETURNING *"
            )
            .execute(Tuples.of(
                    id,
                    schema.tenantId(),
                    schema.name(),
                    schema.schemaType().name(),
                    schema.subject(),
                    version,
                    schema.schemaJson(),
                    compatibilityMode.name(),
                    status.name(),
                    schema.description(),
                    now,
                    now,
                    schema.createdBy(),
                    schema.updatedBy() != null ? schema.updatedBy() : schema.createdBy()
            ))
            .map(rows -> toSchema(rows.iterator().next()));
        });
    }

    public Uni<SchemaDefinition> update(String tenantId, UUID id, SchemaDefinition patch) {
        return findById(tenantId, id).chain(existing -> {
            if (existing == null) {
                return Uni.createFrom().nullItem();
            }

            Instant now = Instant.now();
            return client.preparedQuery(
                    "UPDATE schemas SET " +
                    "name = $1, schema_type = $2, subject = $3, version = $4, schema_json = $5, " +
                    "compatibility_mode = $6, status = $7, description = $8, updated_at = $9, updated_by = $10 " +
                    "WHERE tenant_id = $11 AND id = $12 RETURNING *"
            )
            .execute(Tuples.of(
                    coalesce(patch.name(), existing.name()),
                    coalesce(patch.schemaType(), existing.schemaType()).name(),
                    coalesce(patch.subject(), existing.subject()),
                    coalesce(patch.version(), existing.version()),
                    coalesce(patch.schemaJson(), existing.schemaJson()),
                    coalesce(patch.compatibilityMode(), existing.compatibilityMode()).name(),
                    coalesce(patch.status(), existing.status()).name(),
                    coalesce(patch.description(), existing.description()),
                    now,
                    patch.updatedBy(),
                    tenantId,
                    id
            ))
            .map(rows -> rows.iterator().hasNext() ? toSchema(rows.iterator().next()) : null);
        });
    }

    public Uni<Boolean> delete(String tenantId, UUID id) {
        return client.preparedQuery(
                "DELETE FROM schemas WHERE tenant_id = $1 AND id = $2"
        )
        .execute(Tuple.of(tenantId, id))
        .map(rows -> rows.rowCount() > 0);
    }

    private Uni<Integer> resolveVersion(SchemaDefinition schema) {
        if (schema.version() != null) {
            return Uni.createFrom().item(schema.version());
        }

        return client.preparedQuery(
                "SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM schemas WHERE tenant_id = $1 AND subject = $2"
        )
        .execute(Tuple.of(schema.tenantId(), schema.subject()))
        .map(rows -> rows.iterator().next().getInteger("next_version"));
    }

    private List<SchemaDefinition> toSchemaList(RowSet<Row> rows) {
        List<SchemaDefinition> schemas = new ArrayList<>();
        for (Row row : rows) {
            schemas.add(toSchema(row));
        }
        return schemas;
    }

    private SchemaDefinition toSchema(Row row) {
        return new SchemaDefinition(
                row.getUUID("id"),
                row.getString("tenant_id"),
                row.getString("name"),
                SchemaDefinition.SchemaType.valueOf(row.getString("schema_type")),
                row.getString("subject"),
                row.getInteger("version"),
                row.getString("schema_json"),
                SchemaDefinition.CompatibilityMode.valueOf(row.getString("compatibility_mode")),
                SchemaDefinition.SchemaStatus.valueOf(row.getString("status")),
                row.getString("description"), // Can be null
                row.getString("created_by"),
                row.getLocalDateTime("created_at") != null ? row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC) : Instant.now(),
                row.getString("updated_by"),
                row.getLocalDateTime("updated_at") != null ? row.getLocalDateTime("updated_at").toInstant(ZoneOffset.UTC) : Instant.now()
        );
    }

    private static <T> T coalesce(T value, T fallback) {
        return value != null ? value : fallback;
    }
}
