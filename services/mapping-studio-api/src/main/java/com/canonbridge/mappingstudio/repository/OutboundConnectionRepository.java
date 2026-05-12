package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.Credential;
import com.canonbridge.mappingstudio.domain.OutboundConnection;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
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
public class OutboundConnectionRepository {

    @Inject
    PgPool client;

    public Uni<List<OutboundConnection>> findByTenantId(String tenantId) {
        return client.preparedQuery(
                "SELECT * FROM etl_outbound_connections WHERE tenant_id = $1 ORDER BY updated_at DESC"
        )
        .execute(Tuple.of(tenantId))
        .map(this::toConnectionList);
    }

    public Uni<List<OutboundConnection>> findByDraft(String tenantId, UUID draftId) {
        return client.preparedQuery(
                "SELECT * FROM etl_outbound_connections WHERE tenant_id = $1 AND draft_id = $2 ORDER BY updated_at DESC"
        )
        .execute(Tuple.of(tenantId, draftId))
        .map(this::toConnectionList);
    }

    public Uni<OutboundConnection> findById(String tenantId, UUID connectionId) {
        return client.preparedQuery(
                "SELECT * FROM etl_outbound_connections WHERE tenant_id = $1 AND connection_id = $2"
        )
        .execute(Tuple.of(tenantId, connectionId))
        .map(rows -> rows.iterator().hasNext() ? toConnection(rows.iterator().next()) : null);
    }

    public Uni<OutboundConnection> create(OutboundConnection connection) {
        UUID connectionId = connection.connectionId() != null ? connection.connectionId() : UUID.randomUUID();
        Instant now = Instant.now();
        OutboundConnection.ConnectionPurpose purpose = connection.purpose() != null
                ? connection.purpose()
                : OutboundConnection.ConnectionPurpose.DESTINATION;
        OutboundConnection.Protocol protocol = connection.protocol() != null
                ? connection.protocol()
                : OutboundConnection.Protocol.REST;
        Credential.Environment environment = connection.environment() != null
                ? connection.environment()
                : Credential.Environment.SANDBOX;
        OutboundConnection.ConnectionStatus status = connection.status() != null
                ? connection.status()
                : OutboundConnection.ConnectionStatus.NOT_TESTED;

        return client.preparedQuery(
                "INSERT INTO etl_outbound_connections (" +
                "connection_id, tenant_id, draft_id, name, purpose, protocol, method, url, credential_id, " +
                "environment, schedule, timeout_ms, retry_policy, response_handling, status, " +
                "last_test_at, last_test_result, created_at, updated_at" +
                ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) " +
                "RETURNING *"
        )
        .execute(Tuples.of(
                connectionId,
                connection.tenantId(),
                connection.draftId(),
                connection.name(),
                purpose.name(),
                protocol.name(),
                connection.method(),
                connection.url(),
                connection.credentialId(),
                environment.name(),
                connection.schedule(),
                connection.timeoutMs() != null ? connection.timeoutMs() : 5000,
                connection.retryPolicy() != null ? connection.retryPolicy() : defaultRetryPolicy(),
                connection.responseHandling() != null ? connection.responseHandling() : new JsonObject(),
                status.name(),
                connection.lastTestAt(),
                connection.lastTestResult(),
                now,
                now
        ))
        .map(rows -> toConnection(rows.iterator().next()));
    }

    public Uni<OutboundConnection> update(String tenantId, UUID connectionId, OutboundConnection patch) {
        return findById(tenantId, connectionId).chain(existing -> {
            if (existing == null) {
                return Uni.createFrom().nullItem();
            }

            return client.preparedQuery(
                    "UPDATE etl_outbound_connections SET " +
                    "draft_id = $1, name = $2, purpose = $3, protocol = $4, method = $5, url = $6, " +
                    "credential_id = $7, environment = $8, schedule = $9, timeout_ms = $10, " +
                    "retry_policy = $11, response_handling = $12, status = $13, last_test_at = $14, " +
                    "last_test_result = $15, updated_at = $16 " +
                    "WHERE tenant_id = $17 AND connection_id = $18 RETURNING *"
            )
            .execute(Tuples.of(
                    coalesce(patch.draftId(), existing.draftId()),
                    coalesce(patch.name(), existing.name()),
                    coalesce(patch.purpose(), existing.purpose()).name(),
                    coalesce(patch.protocol(), existing.protocol()).name(),
                    coalesce(patch.method(), existing.method()),
                    coalesce(patch.url(), existing.url()),
                    coalesce(patch.credentialId(), existing.credentialId()),
                    coalesce(patch.environment(), existing.environment()).name(),
                    coalesce(patch.schedule(), existing.schedule()),
                    coalesce(patch.timeoutMs(), existing.timeoutMs()),
                    coalesce(patch.retryPolicy(), existing.retryPolicy()),
                    coalesce(patch.responseHandling(), existing.responseHandling()),
                    coalesce(patch.status(), existing.status()).name(),
                    coalesce(patch.lastTestAt(), existing.lastTestAt()),
                    coalesce(patch.lastTestResult(), existing.lastTestResult()),
                    Instant.now(),
                    tenantId,
                    connectionId
            ))
            .map(rows -> rows.iterator().hasNext() ? toConnection(rows.iterator().next()) : null);
        });
    }

    public Uni<Boolean> delete(String tenantId, UUID connectionId) {
        return client.preparedQuery(
                "DELETE FROM etl_outbound_connections WHERE tenant_id = $1 AND connection_id = $2"
        )
        .execute(Tuple.of(tenantId, connectionId))
        .map(rows -> rows.rowCount() > 0);
    }

    private List<OutboundConnection> toConnectionList(RowSet<Row> rows) {
        List<OutboundConnection> connections = new ArrayList<>();
        for (Row row : rows) {
            connections.add(toConnection(row));
        }
        return connections;
    }

    private OutboundConnection toConnection(Row row) {
        return new OutboundConnection(
                row.getUUID("connection_id"),
                row.getString("tenant_id"),
                row.getUUID("draft_id"),
                row.getString("name"),
                OutboundConnection.ConnectionPurpose.valueOf(row.getString("purpose")),
                OutboundConnection.Protocol.valueOf(row.getString("protocol")),
                row.getString("method"),
                row.getString("url"),
                row.getUUID("credential_id"),
                Credential.Environment.valueOf(row.getString("environment")),
                row.getString("schedule"),
                row.getInteger("timeout_ms"),
                row.getJsonObject("retry_policy"),
                row.getJsonObject("response_handling"),
                OutboundConnection.ConnectionStatus.valueOf(row.getString("status")),
                row.getLocalDateTime("last_test_at") != null
                        ? row.getLocalDateTime("last_test_at").toInstant(ZoneOffset.UTC)
                        : null,
                row.getString("last_test_result"),
                row.getLocalDateTime("created_at").toInstant(ZoneOffset.UTC),
                row.getLocalDateTime("updated_at").toInstant(ZoneOffset.UTC)
        );
    }

    private JsonObject defaultRetryPolicy() {
        return new JsonObject()
                .put("maxAttempts", 3)
                .put("backoff", "exponential");
    }

    private static <T> T coalesce(T value, T fallback) {
        return value != null ? value : fallback;
    }
}
