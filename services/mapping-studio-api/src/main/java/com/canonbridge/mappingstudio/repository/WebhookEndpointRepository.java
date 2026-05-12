package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.WebhookEndpoint;
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
public class WebhookEndpointRepository {

    @Inject
    PgPool client;

    public Uni<List<WebhookEndpoint>> findByTenantId(String tenantId) {
        String sql = """
            SELECT id, tenant_id, partner_id, name, path, secret_hash, target_topic,
                   status, created_at, updated_at, created_by, last_received_at, total_received
            FROM webhook_endpoints
            WHERE tenant_id = $1
            ORDER BY created_at DESC
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId))
            .map(this::mapRows);
    }

    public Uni<WebhookEndpoint> findById(String tenantId, UUID id) {
        String sql = """
            SELECT id, tenant_id, partner_id, name, path, secret_hash, target_topic,
                   status, created_at, updated_at, created_by, last_received_at, total_received
            FROM webhook_endpoints
            WHERE tenant_id = $1 AND id = $2
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId, id))
            .map(rowSet -> rowSet.size() == 0 ? null : mapRow(rowSet.iterator().next()));
    }

    public Uni<WebhookEndpoint> findByPath(String path) {
        String sql = """
            SELECT id, tenant_id, partner_id, name, path, secret_hash, target_topic,
                   status, created_at, updated_at, created_by, last_received_at, total_received
            FROM webhook_endpoints
            WHERE path = $1 AND status = 'ACTIVE'
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(path))
            .map(rowSet -> rowSet.size() == 0 ? null : mapRow(rowSet.iterator().next()));
    }

    public Uni<WebhookEndpoint> create(WebhookEndpoint endpoint) {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        String path = "/webhooks/ingest/" + id;
        String sql = """
            INSERT INTO webhook_endpoints (id, tenant_id, partner_id, name, path, secret_hash,
                target_topic, status, created_at, updated_at, created_by, total_received)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, 0)
            RETURNING id, tenant_id, partner_id, name, path, secret_hash, target_topic,
                      status, created_at, updated_at, created_by, last_received_at, total_received
            """;
        endpoint.setId(id);
        endpoint.setPath(path);
        endpoint.setCreatedAt(now);
        endpoint.setUpdatedAt(now);
        return client.preparedQuery(sql)
            .execute(Tuple.of(
                id,
                endpoint.getTenantId(),
                endpoint.getPartnerId(),
                endpoint.getName(),
                path,
                endpoint.getSecretHash(),
                endpoint.getTargetTopic(),
                endpoint.getStatus().name(),
                now,
                endpoint.getCreatedBy()
            ))
            .map(rowSet -> mapRow(rowSet.iterator().next()));
    }

    public Uni<WebhookEndpoint> updateStatus(String tenantId, UUID id, WebhookEndpoint.WebhookStatus status) {
        String sql = """
            UPDATE webhook_endpoints
            SET status = $1, updated_at = $2
            WHERE tenant_id = $3 AND id = $4
            RETURNING id, tenant_id, partner_id, name, path, secret_hash, target_topic,
                      status, created_at, updated_at, created_by, last_received_at, total_received
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(status.name(), Instant.now(), tenantId, id))
            .map(rowSet -> rowSet.size() == 0 ? null : mapRow(rowSet.iterator().next()));
    }

    public Uni<Boolean> delete(String tenantId, UUID id) {
        String sql = "DELETE FROM webhook_endpoints WHERE tenant_id = $1 AND id = $2";
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId, id))
            .map(rowSet -> rowSet.rowCount() > 0);
    }

    public Uni<Void> recordReceived(UUID id) {
        String sql = """
            UPDATE webhook_endpoints
            SET last_received_at = $1, total_received = total_received + 1
            WHERE id = $2
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(Instant.now(), id))
            .replaceWithVoid();
    }

    private List<WebhookEndpoint> mapRows(RowSet<Row> rows) {
        List<WebhookEndpoint> list = new ArrayList<>();
        for (Row row : rows) {
            list.add(mapRow(row));
        }
        return list;
    }

    private WebhookEndpoint mapRow(Row row) {
        WebhookEndpoint e = new WebhookEndpoint();
        e.setId(row.getUUID("id"));
        e.setTenantId(row.getString("tenant_id"));
        e.setPartnerId(row.getUUID("partner_id"));
        e.setName(row.getString("name"));
        e.setPath(row.getString("path"));
        e.setSecretHash(row.getString("secret_hash"));
        e.setTargetTopic(row.getString("target_topic"));
        e.setStatus(WebhookEndpoint.WebhookStatus.valueOf(row.getString("status")));
        e.setCreatedBy(row.getString("created_by"));

        LocalDateTime createdAt = row.getLocalDateTime("created_at");
        if (createdAt != null) e.setCreatedAt(createdAt.toInstant(ZoneOffset.UTC));

        LocalDateTime updatedAt = row.getLocalDateTime("updated_at");
        if (updatedAt != null) e.setUpdatedAt(updatedAt.toInstant(ZoneOffset.UTC));

        LocalDateTime lastReceived = row.getLocalDateTime("last_received_at");
        if (lastReceived != null) e.setLastReceivedAt(lastReceived.toInstant(ZoneOffset.UTC));

        Long total = row.getLong("total_received");
        e.setTotalReceived(total != null ? total : 0L);

        return e;
    }
}
