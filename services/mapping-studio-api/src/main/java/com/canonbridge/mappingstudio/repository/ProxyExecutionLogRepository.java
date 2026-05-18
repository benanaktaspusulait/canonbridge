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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public Uni<Map<String, Object>> dashboardStats(String tenantId) {
        String sql = """
            SELECT
              COUNT(*) FILTER (WHERE request_at >= date_trunc('day', NOW())) AS total_today,
              COUNT(*) FILTER (WHERE request_at >= NOW() - INTERVAL '1 hour') AS total_1h,
              COUNT(*) FILTER (WHERE request_at >= NOW() - INTERVAL '1 hour' AND status IN ('ERROR', 'TIMEOUT')) AS errors_1h,
              COALESCE(ROUND(AVG(duration_ms) FILTER (WHERE request_at >= NOW() - INTERVAL '1 hour')), 0) AS avg_latency_1h
            FROM proxy_execution_logs
            WHERE tenant_id = $1
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId))
            .map(rows -> {
                Row row = rows.iterator().next();
                long total1h = row.getLong("total_1h");
                long errors1h = row.getLong("errors_1h");
                Map<String, Object> stats = new HashMap<>();
                stats.put("messagesProcessed", row.getLong("total_today"));
                stats.put("errorRate", total1h > 0 ? Math.round(((double) errors1h / total1h * 100) * 100.0) / 100.0 : 0.0);
                stats.put("p99Latency", row.getValue("avg_latency_1h"));
                return stats;
            });
    }

    public Uni<List<Map<String, Object>>> topMappings(String tenantId, int limit) {
        String sql = """
            SELECT l.mapping_id, d.name, d.partner_id, d.event_type, COUNT(*) AS call_count,
                   COUNT(*) FILTER (WHERE l.status IN ('ERROR', 'TIMEOUT')) AS error_count,
                   COALESCE(ROUND(AVG(l.duration_ms)), 0) AS avg_latency_ms
            FROM proxy_execution_logs l
            LEFT JOIN mapping_drafts d ON d.id = l.mapping_id AND d.tenant_id = l.tenant_id
            WHERE l.tenant_id = $1
            GROUP BY l.mapping_id, d.name, d.partner_id, d.event_type
            ORDER BY call_count DESC
            LIMIT $2
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId, limit))
            .map(rows -> {
                List<Map<String, Object>> result = new ArrayList<>();
                rows.forEach(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("mappingId", row.getUUID("mapping_id"));
                    item.put("name", row.getString("name"));
                    item.put("partnerId", row.getUUID("partner_id"));
                    item.put("eventType", row.getString("event_type"));
                    item.put("callCount", row.getLong("call_count"));
                    item.put("errorCount", row.getLong("error_count"));
                    item.put("avgLatencyMs", row.getValue("avg_latency_ms"));
                    result.add(item);
                });
                return result;
            });
    }

    public Uni<List<Map<String, Object>>> healthByMapping(String tenantId) {
        String sql = """
            SELECT d.id, d.name, d.partner_id, d.event_type,
                   COUNT(l.id) AS total,
                   COUNT(l.id) FILTER (WHERE l.status = 'SUCCESS') AS success,
                   COUNT(l.id) FILTER (WHERE l.status IN ('ERROR', 'TIMEOUT')) AS errors,
                   COALESCE(ROUND(AVG(l.duration_ms)), 0) AS avg_latency_ms,
                   MAX(l.request_at) FILTER (WHERE l.status = 'SUCCESS') AS last_success_at
            FROM mapping_drafts d
            LEFT JOIN proxy_execution_logs l ON l.mapping_id = d.id AND l.tenant_id = d.tenant_id
            WHERE d.tenant_id = $1
            GROUP BY d.id, d.name, d.partner_id, d.event_type
            ORDER BY errors DESC, total DESC, d.updated_at DESC
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId))
            .map(rows -> {
                List<Map<String, Object>> result = new ArrayList<>();
                rows.forEach(row -> {
                    long total = row.getLong("total");
                    long success = row.getLong("success");
                    long errors = row.getLong("errors");
                    double successRate = total > 0 ? (double) success / total * 100 : 0;
                    Map<String, Object> item = new HashMap<>();
                    item.put("mappingId", row.getUUID("id"));
                    item.put("name", row.getString("name"));
                    item.put("partnerId", row.getUUID("partner_id"));
                    item.put("eventType", row.getString("event_type"));
                    item.put("total", total);
                    item.put("success", success);
                    item.put("errors", errors);
                    item.put("successRate", Math.round(successRate * 100.0) / 100.0);
                    item.put("avgLatencyMs", row.getValue("avg_latency_ms"));
                    item.put("lastSuccessAt", row.getLocalDateTime("last_success_at"));
                    result.add(item);
                });
                return result;
            });
    }

    public Uni<List<Map<String, Object>>> executionSeries(String tenantId, UUID mappingId) {
        String sql = """
            SELECT date_trunc('hour', request_at) AS bucket,
                   COUNT(*) FILTER (WHERE status = 'SUCCESS') AS success,
                   COUNT(*) FILTER (WHERE status IN ('ERROR', 'TIMEOUT')) AS errors,
                   COALESCE(ROUND(AVG(duration_ms)), 0) AS avg_latency_ms
            FROM proxy_execution_logs
            WHERE tenant_id = $1 AND mapping_id = $2 AND request_at >= NOW() - INTERVAL '24 hours'
            GROUP BY bucket
            ORDER BY bucket ASC
            """;
        return client.preparedQuery(sql)
            .execute(Tuple.of(tenantId, mappingId))
            .map(rows -> {
                List<Map<String, Object>> result = new ArrayList<>();
                rows.forEach(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("bucket", row.getLocalDateTime("bucket"));
                    item.put("success", row.getLong("success"));
                    item.put("errors", row.getLong("errors"));
                    item.put("avgLatencyMs", row.getValue("avg_latency_ms"));
                    result.add(item);
                });
                return result;
            });
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
