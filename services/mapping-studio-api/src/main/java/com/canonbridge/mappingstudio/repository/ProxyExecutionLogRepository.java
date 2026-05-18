package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.ProxyExecutionLog;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
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
public class ProxyExecutionLogRepository {

    @Inject
    PgPool client;

    public Uni<ProxyExecutionLog> create(ProxyExecutionLog log) {
        return client.preparedQuery(
            "INSERT INTO proxy_execution_logs (" +
            "id, tenant_id, mapping_id, correlation_id, request_at, response_at, duration_ms, " +
            "status, http_status_code, error_stage, error_message, " +
            "external_api_url, external_api_method, request_size_bytes, response_size_bytes, " +
            "request_payload, response_payload, transformed_payload" +
            ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb, $18::jsonb) " +
            "RETURNING *"
        ).execute(Tuple.tuple()
            .addUUID(log.getId() != null ? log.getId() : UUID.randomUUID())
            .addString(log.getTenantId())
            .addUUID(log.getMappingId())
            .addString(log.getCorrelationId())
            .addLocalDateTime(toLocalDateTime(log.getRequestAt()))
            .addLocalDateTime(log.getResponseAt() != null ? toLocalDateTime(log.getResponseAt()) : null)
            .addInteger(log.getDurationMs())
            .addString(log.getStatus().name())
            .addInteger(log.getHttpStatusCode())
            .addString(log.getErrorStage())
            .addString(log.getErrorMessage())
            .addString(log.getExternalApiUrl())
            .addString(log.getExternalApiMethod())
            .addInteger(log.getRequestSizeBytes())
            .addInteger(log.getResponseSizeBytes())
            .addString(log.getRequestPayload())
            .addString(log.getResponsePayload())
            .addString(log.getTransformedPayload())
        ).map(rowSet -> {
            if (rowSet.size() == 0) return null;
            return toExecutionLog(rowSet.iterator().next());
        });
    }

    public Uni<List<ProxyExecutionLog>> findByMappingId(String tenantId, UUID mappingId, int limit) {
        return client.preparedQuery(
            "SELECT * FROM proxy_execution_logs WHERE tenant_id = $1 AND mapping_id = $2 " +
            "ORDER BY request_at DESC LIMIT $3"
        ).execute(Tuple.of(tenantId, mappingId, limit))
        .map(rowSet -> {
            List<ProxyExecutionLog> logs = new ArrayList<>();
            rowSet.forEach(row -> logs.add(toExecutionLog(row)));
            return logs;
        });
    }

    public Uni<ProxyExecutionLog> findById(String tenantId, UUID id) {
        return client.preparedQuery(
            "SELECT * FROM proxy_execution_logs WHERE tenant_id = $1 AND id = $2"
        ).execute(Tuple.of(tenantId, id))
        .map(rowSet -> {
            if (rowSet.size() == 0) return null;
            return toExecutionLog(rowSet.iterator().next());
        });
    }

    public Uni<Long> countByMappingAndStatus(String tenantId, UUID mappingId, String status) {
        return client.preparedQuery(
            "SELECT COUNT(*) as cnt FROM proxy_execution_logs WHERE tenant_id = $1 AND mapping_id = $2 AND status = $3"
        ).execute(Tuple.of(tenantId, mappingId, status))
        .map(rowSet -> rowSet.iterator().next().getLong("cnt"));
    }

    private ProxyExecutionLog toExecutionLog(Row row) {
        ProxyExecutionLog log = new ProxyExecutionLog();
        log.setId(row.getUUID("id"));
        log.setTenantId(row.getString("tenant_id"));
        log.setMappingId(row.getUUID("mapping_id"));
        log.setCorrelationId(row.getString("correlation_id"));
        
        if (row.getLocalDateTime("request_at") != null) {
            log.setRequestAt(row.getLocalDateTime("request_at").toInstant(ZoneOffset.UTC));
        }
        if (row.getLocalDateTime("response_at") != null) {
            log.setResponseAt(row.getLocalDateTime("response_at").toInstant(ZoneOffset.UTC));
        }
        
        log.setDurationMs(row.getInteger("duration_ms"));
        log.setStatus(ProxyExecutionLog.ExecutionStatus.valueOf(row.getString("status")));
        log.setHttpStatusCode(row.getInteger("http_status_code"));
        log.setErrorStage(row.getString("error_stage"));
        log.setErrorMessage(row.getString("error_message"));
        log.setExternalApiUrl(row.getString("external_api_url"));
        log.setExternalApiMethod(row.getString("external_api_method"));
        log.setRequestSizeBytes(row.getInteger("request_size_bytes"));
        log.setResponseSizeBytes(row.getInteger("response_size_bytes"));
        
        Object reqPayload = row.getValue("request_payload");
        log.setRequestPayload(reqPayload != null ? reqPayload.toString() : null);
        Object resPayload = row.getValue("response_payload");
        log.setResponsePayload(resPayload != null ? resPayload.toString() : null);
        Object transPayload = row.getValue("transformed_payload");
        log.setTransformedPayload(transPayload != null ? transPayload.toString() : null);
        
        return log;
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return instant != null ? LocalDateTime.ofInstant(instant, ZoneOffset.UTC) : null;
    }
}
