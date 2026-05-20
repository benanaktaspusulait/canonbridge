package com.canonbridge.mappingstudio.repository;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
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
public class ScheduledApiRunRepository {

    @Inject
    PgPool client;

    public Uni<Instant> findLastStartedAt(String tenantId, UUID draftId) {
        return client.preparedQuery(
                "SELECT last_started_at FROM etl_scheduled_api_runs WHERE tenant_id = $1 AND draft_id = $2"
        )
        .execute(Tuple.of(tenantId, draftId))
        .map(rows -> {
            if (rows.size() == 0) {
                return null;
            }
            Row row = rows.iterator().next();
            LocalDateTime value = row.getLocalDateTime("last_started_at");
            return value != null ? value.toInstant(ZoneOffset.UTC) : null;
        });
    }

    public Uni<JsonObject> findSummary(String tenantId, UUID draftId) {
        return client.preparedQuery(
                "SELECT run_id, tenant_id, draft_id, status, last_started_at, last_completed_at, next_run_at, " +
                "duration_ms, attempt_count, last_error, last_result, created_at, updated_at " +
                "FROM etl_scheduled_api_runs WHERE tenant_id = $1 AND draft_id = $2"
        )
        .execute(Tuple.of(tenantId, draftId))
        .map(rows -> rows.size() == 0 ? null : summaryToJson(rows.iterator().next()));
    }

    public Uni<UUID> markStarted(String tenantId, UUID draftId, Instant startedAt, Instant nextRunAt) {
        UUID runId = UUID.randomUUID();
        return client.preparedQuery(
                "INSERT INTO etl_scheduled_api_runs (" +
                "run_id, tenant_id, draft_id, status, last_started_at, next_run_at, attempt_count, created_at, updated_at" +
                ") VALUES ($1, $2, $3, 'RUNNING', $4, $5, 1, $4, $4) " +
                "ON CONFLICT (tenant_id, draft_id) DO UPDATE SET " +
                "run_id = EXCLUDED.run_id, status = 'RUNNING', last_started_at = EXCLUDED.last_started_at, " +
                "next_run_at = EXCLUDED.next_run_at, attempt_count = etl_scheduled_api_runs.attempt_count + 1, " +
                "updated_at = EXCLUDED.updated_at RETURNING attempt_count"
        )
        .execute(Tuple.of(
                runId,
                tenantId,
                draftId,
                toLocalDateTime(startedAt),
                toLocalDateTime(nextRunAt)
        ))
        .chain(rows -> {
            int attemptNumber = rows.iterator().next().getInteger("attempt_count");
            return insertHistory(runId, tenantId, draftId, startedAt, nextRunAt, attemptNumber)
                    .replaceWith(runId);
        });
    }

    private Uni<Void> insertHistory(
            UUID runId,
            String tenantId,
            UUID draftId,
            Instant startedAt,
            Instant nextRunAt,
            int attemptNumber) {
        return client.preparedQuery(
                "INSERT INTO etl_scheduled_api_run_history (" +
                "run_id, tenant_id, draft_id, status, started_at, next_run_at, attempt_number, created_at, updated_at" +
                ") VALUES ($1, $2, $3, 'RUNNING', $4, $5, $6, $4, $4)"
        )
        .execute(Tuple.of(
                runId,
                tenantId,
                draftId,
                toLocalDateTime(startedAt),
                toLocalDateTime(nextRunAt),
                attemptNumber
        ))
        .replaceWithVoid();
    }

    public Uni<Void> markCompleted(
            String tenantId,
            UUID draftId,
            UUID runId,
            Instant startedAt,
            boolean success,
            JsonNode result,
            String errorMessage) {
        Instant completedAt = Instant.now();
        long rawDurationMs = startedAt != null
                ? Math.max(0, completedAt.toEpochMilli() - startedAt.toEpochMilli())
                : 0;
        int durationMs = rawDurationMs > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) rawDurationMs;

        return client.preparedQuery(
                "UPDATE etl_scheduled_api_runs SET " +
                "status = $1, last_completed_at = $2, duration_ms = $3, last_error = $4, " +
                "last_result = $5::jsonb, updated_at = $2 " +
                "WHERE tenant_id = $6 AND draft_id = $7"
        )
        .execute(Tuples.of(
                success ? "SUCCESS" : "FAILED",
                toLocalDateTime(completedAt),
                durationMs,
                errorMessage,
                jsonValue(result),
                tenantId,
                draftId
        ))
        .replaceWithVoid()
        .chain(() -> updateHistory(runId, success, completedAt, durationMs, result, errorMessage));
    }

    public Uni<List<JsonObject>> listHistory(String tenantId, UUID draftId, int limit, int offset, String status) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        int safeOffset = Math.max(0, offset);
        String normalizedStatus = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;

        if (normalizedStatus == null) {
            return client.preparedQuery(
                    "SELECT run_id, tenant_id, draft_id, status, started_at, completed_at, next_run_at, duration_ms, " +
                    "attempt_number, error_message, result_payload, created_at, updated_at " +
                    "FROM etl_scheduled_api_run_history WHERE tenant_id = $1 AND draft_id = $2 " +
                    "ORDER BY started_at DESC LIMIT $3 OFFSET $4"
            )
            .execute(Tuple.of(tenantId, draftId, safeLimit, safeOffset))
            .map(this::historyToJsonList);
        }

        return client.preparedQuery(
                "SELECT run_id, tenant_id, draft_id, status, started_at, completed_at, next_run_at, duration_ms, " +
                "attempt_number, error_message, result_payload, created_at, updated_at " +
                "FROM etl_scheduled_api_run_history WHERE tenant_id = $1 AND draft_id = $2 AND status = $3 " +
                "ORDER BY started_at DESC LIMIT $4 OFFSET $5"
        )
        .execute(Tuple.of(tenantId, draftId, normalizedStatus, safeLimit, safeOffset))
        .map(this::historyToJsonList);
    }

    public Uni<JsonObject> findHistoryRun(String tenantId, UUID draftId, UUID runId) {
        return client.preparedQuery(
                "SELECT run_id, tenant_id, draft_id, status, started_at, completed_at, next_run_at, duration_ms, " +
                "attempt_number, error_message, result_payload, created_at, updated_at " +
                "FROM etl_scheduled_api_run_history WHERE tenant_id = $1 AND draft_id = $2 AND run_id = $3"
        )
        .execute(Tuple.of(tenantId, draftId, runId))
        .map(rows -> rows.size() == 0 ? null : historyToJson(rows.iterator().next()));
    }

    private Uni<Void> updateHistory(
            UUID runId,
            boolean success,
            Instant completedAt,
            int durationMs,
            JsonNode result,
            String errorMessage) {
        if (runId == null) {
            return Uni.createFrom().voidItem();
        }

        return client.preparedQuery(
                "UPDATE etl_scheduled_api_run_history SET " +
                "status = $1, completed_at = $2, duration_ms = $3, error_message = $4, " +
                "result_payload = $5::jsonb, updated_at = $2 WHERE run_id = $6"
        )
        .execute(Tuples.of(
                success ? "SUCCESS" : "FAILED",
                toLocalDateTime(completedAt),
                durationMs,
                errorMessage,
                jsonValue(result),
                runId
        ))
        .replaceWithVoid();
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    private Object jsonValue(JsonNode result) {
        if (result == null || result.isNull()) {
            return null;
        }
        if (result.isObject()) {
            return new JsonObject(result.toString());
        }
        if (result.isArray()) {
            return new JsonArray(result.toString());
        }
        if (result.isTextual()) {
            return new JsonObject().put("value", result.asText());
        }
        if (result.isNumber()) {
            return new JsonObject().put("value", result.numberValue());
        }
        if (result.isBoolean()) {
            return new JsonObject().put("value", result.asBoolean());
        }
        return new JsonObject().put("value", result.toString());
    }

    private JsonObject summaryToJson(Row row) {
        return new JsonObject()
                .put("runId", row.getUUID("run_id") != null ? row.getUUID("run_id").toString() : null)
                .put("tenantId", row.getString("tenant_id"))
                .put("draftId", row.getUUID("draft_id").toString())
                .put("status", row.getString("status"))
                .put("lastStartedAt", instantString(row.getLocalDateTime("last_started_at")))
                .put("lastCompletedAt", instantString(row.getLocalDateTime("last_completed_at")))
                .put("nextRunAt", instantString(row.getLocalDateTime("next_run_at")))
                .put("durationMs", row.getInteger("duration_ms"))
                .put("attemptCount", row.getInteger("attempt_count"))
                .put("lastError", row.getString("last_error"))
                .put("lastResult", jsonValue(row.getValue("last_result")))
                .put("createdAt", instantString(row.getLocalDateTime("created_at")))
                .put("updatedAt", instantString(row.getLocalDateTime("updated_at")));
    }

    private List<JsonObject> historyToJsonList(RowSet<Row> rows) {
        List<JsonObject> history = new ArrayList<>();
        for (Row row : rows) {
            history.add(historyToJson(row));
        }
        return history;
    }

    private JsonObject historyToJson(Row row) {
        return new JsonObject()
                .put("runId", row.getUUID("run_id").toString())
                .put("tenantId", row.getString("tenant_id"))
                .put("draftId", row.getUUID("draft_id").toString())
                .put("status", row.getString("status"))
                .put("startedAt", instantString(row.getLocalDateTime("started_at")))
                .put("completedAt", instantString(row.getLocalDateTime("completed_at")))
                .put("nextRunAt", instantString(row.getLocalDateTime("next_run_at")))
                .put("durationMs", row.getInteger("duration_ms"))
                .put("attemptNumber", row.getInteger("attempt_number"))
                .put("errorMessage", row.getString("error_message"))
                .put("resultPayload", jsonValue(row.getValue("result_payload")))
                .put("createdAt", instantString(row.getLocalDateTime("created_at")))
                .put("updatedAt", instantString(row.getLocalDateTime("updated_at")));
    }

    private Object jsonValue(Object value) {
        if (value instanceof JsonObject || value instanceof JsonArray) {
            return value;
        }
        if (value == null) {
            return null;
        }
        String raw = value.toString();
        try {
            return new JsonObject(raw);
        } catch (Exception ignored) {
        }
        try {
            return new JsonArray(raw);
        } catch (Exception ignored) {
            return raw;
        }
    }

    private String instantString(LocalDateTime value) {
        return value != null ? value.toInstant(ZoneOffset.UTC).toString() : null;
    }
}
