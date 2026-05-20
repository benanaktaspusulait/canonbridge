package com.canonbridge.mappingstudio.repository;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
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

    public Uni<Void> markStarted(String tenantId, UUID draftId, Instant startedAt, Instant nextRunAt) {
        return client.preparedQuery(
                "INSERT INTO etl_scheduled_api_runs (" +
                "tenant_id, draft_id, status, last_started_at, next_run_at, attempt_count, created_at, updated_at" +
                ") VALUES ($1, $2, 'RUNNING', $3, $4, 1, $3, $3) " +
                "ON CONFLICT (tenant_id, draft_id) DO UPDATE SET " +
                "status = 'RUNNING', last_started_at = EXCLUDED.last_started_at, next_run_at = EXCLUDED.next_run_at, " +
                "attempt_count = etl_scheduled_api_runs.attempt_count + 1, updated_at = EXCLUDED.updated_at"
        )
        .execute(Tuple.of(
                tenantId,
                draftId,
                toLocalDateTime(startedAt),
                toLocalDateTime(nextRunAt)
        ))
        .replaceWithVoid();
    }

    public Uni<Void> markCompleted(
            String tenantId,
            UUID draftId,
            Instant startedAt,
            boolean success,
            JsonNode result,
            String errorMessage) {
        Instant completedAt = Instant.now();
        int durationMs = startedAt != null
                ? Math.toIntExact(Math.max(0, completedAt.toEpochMilli() - startedAt.toEpochMilli()))
                : 0;

        return client.preparedQuery(
                "UPDATE etl_scheduled_api_runs SET " +
                "status = $1, last_completed_at = $2, duration_ms = $3, last_error = $4, " +
                "last_result = $5::jsonb, updated_at = $2 " +
                "WHERE tenant_id = $6 AND draft_id = $7"
        )
        .execute(Tuple.of(
                success ? "SUCCESS" : "FAILED",
                toLocalDateTime(completedAt),
                durationMs,
                errorMessage,
                result != null ? new JsonObject(result.toString()) : null,
                tenantId,
                draftId
        ))
        .replaceWithVoid();
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}
