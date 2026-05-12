package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.Credential;
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
public class CredentialRepository {

    @Inject
    PgPool client;

    public Uni<List<Credential>> findByTenant(String tenantId) {
        String sql = """
                SELECT credential_id, tenant_id, display_name, auth_type, environment, status,
                       rotation_due_at, last_used_at, created_by, created_at, updated_by, updated_at
                FROM etl_credentials
                WHERE tenant_id = $1
                ORDER BY created_at DESC
                """;

        return client.preparedQuery(sql)
                .execute(Tuple.of(tenantId))
                .map(this::toCredentialList);
    }

    public Uni<Credential> findById(UUID credentialId, String tenantId) {
        String sql = """
                SELECT credential_id, tenant_id, display_name, auth_type, environment, status,
                       rotation_due_at, last_used_at, created_by, created_at, updated_by, updated_at
                FROM etl_credentials
                WHERE credential_id = $1 AND tenant_id = $2
                """;

        return client.preparedQuery(sql)
                .execute(Tuple.of(credentialId, tenantId))
                .map(rows -> rows.iterator().hasNext() ? toCredential(rows.iterator().next()) : null);
    }

    public Uni<Credential> create(Credential credential, String encryptedSecret) {
        String sql = """
                INSERT INTO etl_credentials (
                    credential_id, tenant_id, display_name, auth_type, environment, status,
                    encrypted_secret_json, rotation_due_at, created_by, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING credential_id, tenant_id, display_name, auth_type, environment, status,
                          rotation_due_at, last_used_at, created_by, created_at, updated_by, updated_at
                """;

        Instant now = Instant.now();
        return client.preparedQuery(sql)
                .execute(Tuples.of(
                        credential.credentialId() != null ? credential.credentialId() : UUID.randomUUID(),
                        credential.tenantId(),
                        credential.displayName(),
                        credential.authType().name(),
                        credential.environment().name(),
                        credential.status().name(),
                        encryptedSecret,
                        credential.rotationDueAt(),
                        credential.createdBy(),
                        now,
                        now
                ))
                .map(rows -> toCredential(rows.iterator().next()));
    }

    public Uni<Credential> updateStatus(UUID credentialId, String tenantId, Credential.CredentialStatus status, String updatedBy) {
        String sql = """
                UPDATE etl_credentials
                SET status = $1, updated_by = $2, updated_at = $3
                WHERE credential_id = $4 AND tenant_id = $5
                RETURNING credential_id, tenant_id, display_name, auth_type, environment, status,
                          rotation_due_at, last_used_at, created_by, created_at, updated_by, updated_at
                """;

        return client.preparedQuery(sql)
                .execute(Tuple.of(status.name(), updatedBy, Instant.now(), credentialId, tenantId))
                .map(rows -> rows.iterator().hasNext() ? toCredential(rows.iterator().next()) : null);
    }

    private List<Credential> toCredentialList(RowSet<Row> rows) {
        List<Credential> credentials = new ArrayList<>();
        for (Row row : rows) {
            credentials.add(toCredential(row));
        }
        return credentials;
    }

    private Credential toCredential(Row row) {
        return new Credential(
                row.getUUID("credential_id"),
                row.getString("tenant_id"),
                row.getString("display_name"),
                Credential.AuthType.valueOf(row.getString("auth_type")),
                Credential.Environment.valueOf(row.getString("environment")),
                Credential.CredentialStatus.valueOf(row.getString("status")),
                row.getLocalDateTime("rotation_due_at") != null ? 
                    row.getLocalDateTime("rotation_due_at").toInstant(java.time.ZoneOffset.UTC) : null,
                row.getLocalDateTime("last_used_at") != null ? 
                    row.getLocalDateTime("last_used_at").toInstant(java.time.ZoneOffset.UTC) : null,
                row.getString("created_by"),
                row.getLocalDateTime("created_at").toInstant(java.time.ZoneOffset.UTC),
                row.getString("updated_by"),
                row.getLocalDateTime("updated_at").toInstant(java.time.ZoneOffset.UTC)
        );
    }
}
