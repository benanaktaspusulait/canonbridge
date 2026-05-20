package com.canonbridge.mappingstudio.repository;

import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@ApplicationScoped
public class BatchJobRepository {

    @Inject
    PgPool client;

    public Uni<UUID> createRunning(String tenantId, UUID draftId, int totalRows, String createdBy) {
        UUID jobId = UUID.randomUUID();
        Instant now = Instant.now();
        return client.preparedQuery(
                "INSERT INTO etl_batch_jobs (" +
                "job_id, tenant_id, draft_id, status, total_rows, created_by, created_at, updated_at" +
                ") VALUES ($1, $2, $3, 'RUNNING', $4, $5, $6, $6) " +
                "RETURNING job_id"
        )
        .execute(Tuple.of(
                jobId,
                tenantId,
                draftId,
                Math.max(0, totalRows),
                createdBy != null && !createdBy.isBlank() ? createdBy : "system",
                toLocalDateTime(now)
        ))
        .map(rows -> rows.iterator().next().getUUID("job_id"));
    }

    public Uni<Void> complete(
            String tenantId,
            UUID jobId,
            int succeededRows,
            int failedRows,
            JsonObject resultSummary,
            String errorMessage) {
        String status = statusFor(succeededRows, failedRows, errorMessage);
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE etl_batch_jobs SET " +
                "status = $1, succeeded_rows = $2, failed_rows = $3, error_message = $4, " +
                "result_summary = $5::jsonb, updated_at = $6, completed_at = $6 " +
                "WHERE tenant_id = $7 AND job_id = $8"
        )
        .execute(Tuples.of(
                status,
                Math.max(0, succeededRows),
                Math.max(0, failedRows),
                errorMessage,
                resultSummary != null ? resultSummary : new JsonObject(),
                toLocalDateTime(now),
                tenantId,
                jobId
        ))
        .replaceWithVoid();
    }

    private String statusFor(int succeededRows, int failedRows, String errorMessage) {
        if (errorMessage != null && !errorMessage.isBlank() && succeededRows == 0) {
            return "FAILED";
        }
        if (failedRows > 0) {
            return succeededRows > 0 ? "COMPLETED_WITH_ERRORS" : "FAILED";
        }
        return "COMPLETED";
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}
