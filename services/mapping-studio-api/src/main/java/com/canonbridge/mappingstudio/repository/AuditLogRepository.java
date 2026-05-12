package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.AuditLog;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AuditLogRepository {

    @Inject
    PgPool client;

    public Uni<AuditLog> save(AuditLog log) {
        String sql = """
            INSERT INTO audit_logs (id, tenant_id, user_id, action, resource_type, resource_id,
                details, outcome, ip_address, correlation_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
            """;
        UUID id = UUID.randomUUID();
        log.setId(id);
        return client.preparedQuery(sql)
            .execute(Tuple.of(
                id,
                log.getTenantId(),
                log.getUserId(),
                log.getAction().name(),
                log.getResourceType(),
                log.getResourceId(),
                log.getDetails(),
                log.getOutcome().name(),
                log.getIpAddress(),
                log.getCorrelationId(),
                log.getCreatedAt()
            ))
            .map(rowSet -> log);
    }

    public Uni<List<AuditLog>> findByTenantId(String tenantId, int limit, int offset) {
        String sql = """
            SELECT id, tenant_id, user_id, action, resource_type, resource_id,
                   details, outcome, ip_address, correlation_id, created_at
            FROM audit_logs
            WHERE tenant_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId, limit, offset))
            .map(this::mapRows);
    }

    public Uni<List<AuditLog>> findByResourceId(String tenantId, String resourceId) {
        String sql = """
            SELECT id, tenant_id, user_id, action, resource_type, resource_id,
                   details, outcome, ip_address, correlation_id, created_at
            FROM audit_logs
            WHERE tenant_id = $1 AND resource_id = $2
            ORDER BY created_at DESC
            LIMIT 100
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId, resourceId))
            .map(this::mapRows);
    }

    private List<AuditLog> mapRows(RowSet<Row> rows) {
        List<AuditLog> list = new ArrayList<>();
        for (Row row : rows) {
            list.add(mapRow(row));
        }
        return list;
    }

    private AuditLog mapRow(Row row) {
        AuditLog log = new AuditLog();
        log.setId(row.getUUID("id"));
        log.setTenantId(row.getString("tenant_id"));
        log.setUserId(row.getString("user_id"));
        log.setAction(AuditLog.AuditAction.valueOf(row.getString("action")));
        log.setResourceType(row.getString("resource_type"));
        log.setResourceId(row.getString("resource_id"));
        log.setDetails(row.getString("details"));
        log.setOutcome(AuditLog.AuditOutcome.valueOf(row.getString("outcome")));
        log.setIpAddress(row.getString("ip_address"));
        log.setCorrelationId(row.getString("correlation_id"));
        LocalDateTime createdAt = row.getLocalDateTime("created_at");
        if (createdAt != null) log.setCreatedAt(createdAt.toInstant(ZoneOffset.UTC));
        return log;
    }
}
