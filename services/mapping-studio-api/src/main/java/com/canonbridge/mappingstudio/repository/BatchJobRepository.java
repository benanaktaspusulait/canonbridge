package com.canonbridge.mappingstudio.repository;

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
public class BatchJobRepository {

    @Inject
    PgPool client;

    public Uni<UUID> createRunning(String tenantId, UUID draftId, int totalRows, String createdBy) {
        return createRunning(tenantId, draftId, totalRows, createdBy, new JsonArray(), null);
    }

    public Uni<UUID> createRunning(
            String tenantId,
            UUID draftId,
            int totalRows,
            String createdBy,
            JsonArray inputRows,
            UUID retryOfJobId) {
        UUID jobId = UUID.randomUUID();
        Instant now = Instant.now();
        return client.preparedQuery(
                "INSERT INTO etl_batch_jobs (" +
                "job_id, tenant_id, draft_id, status, total_rows, created_by, input_rows, retry_of_job_id, created_at, updated_at" +
                ") VALUES ($1, $2, $3, 'RUNNING', $4, $5, $6::jsonb, $7, $8, $8) " +
                "RETURNING job_id"
        )
        .execute(SqlParams.of(
                jobId,
                tenantId,
                draftId,
                Math.max(0, totalRows),
                createdBy != null && !createdBy.isBlank() ? createdBy : "system",
                inputRows != null ? inputRows : new JsonArray(),
                retryOfJobId,
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
        .execute(SqlParams.of(
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

    public Uni<JsonObject> findById(String tenantId, UUID jobId) {
        return client.preparedQuery(
                "SELECT job_id, tenant_id, draft_id, status, total_rows, succeeded_rows, failed_rows, " +
                "error_message, result_summary, input_rows, retry_of_job_id, created_by, created_at, updated_at, completed_at " +
                "FROM etl_batch_jobs WHERE tenant_id = $1 AND job_id = $2"
        )
        .execute(Tuple.of(tenantId, jobId))
        .map(rows -> rows.size() == 0 ? null : toJson(rows.iterator().next()));
    }

    public Uni<List<JsonObject>> listByDraft(String tenantId, UUID draftId, int limit, int offset, String status) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        int safeOffset = Math.max(0, offset);
        String normalizedStatus = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;

        if (normalizedStatus == null) {
            return client.preparedQuery(
                    "SELECT job_id, tenant_id, draft_id, status, total_rows, succeeded_rows, failed_rows, " +
                    "error_message, result_summary, input_rows, retry_of_job_id, created_by, created_at, updated_at, completed_at " +
                    "FROM etl_batch_jobs WHERE tenant_id = $1 AND draft_id = $2 " +
                    "ORDER BY created_at DESC LIMIT $3 OFFSET $4"
            )
            .execute(Tuple.of(tenantId, draftId, safeLimit, safeOffset))
            .map(this::toJsonList);
        }

        return client.preparedQuery(
                "SELECT job_id, tenant_id, draft_id, status, total_rows, succeeded_rows, failed_rows, " +
                "error_message, result_summary, input_rows, retry_of_job_id, created_by, created_at, updated_at, completed_at " +
                "FROM etl_batch_jobs WHERE tenant_id = $1 AND draft_id = $2 AND status = $3 " +
                "ORDER BY created_at DESC LIMIT $4 OFFSET $5"
        )
        .execute(Tuple.of(tenantId, draftId, normalizedStatus, safeLimit, safeOffset))
        .map(this::toJsonList);
    }

    public Uni<JsonArray> inputRowsForRetry(String tenantId, UUID jobId, boolean failedOnly) {
        return findById(tenantId, jobId)
                .map(job -> {
                    if (job == null) {
                        return null;
                    }
                    JsonArray rows = job.getJsonArray("inputRows", new JsonArray());
                    if (!failedOnly) {
                        return rows;
                    }
                    JsonArray results = job.getJsonObject("resultSummary", new JsonObject())
                            .getJsonArray("results", new JsonArray());
                    JsonArray failedRows = new JsonArray();
                    for (int i = 0; i < results.size(); i++) {
                        JsonObject result = results.getJsonObject(i);
                        if (result != null && !"SUCCESS".equals(result.getString("status"))) {
                            int rowNumber = Math.max(1, result.getInteger("row", i + 1));
                            if (rowNumber <= rows.size()) {
                                failedRows.add(rows.getValue(rowNumber - 1));
                            }
                        }
                    }
                    return failedRows;
                });
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

    private List<JsonObject> toJsonList(RowSet<Row> rows) {
        List<JsonObject> jobs = new ArrayList<>();
        for (Row row : rows) {
            jobs.add(toJson(row));
        }
        return jobs;
    }

    private JsonObject toJson(Row row) {
        return new JsonObject()
                .put("jobId", row.getUUID("job_id").toString())
                .put("tenantId", row.getString("tenant_id"))
                .put("draftId", row.getUUID("draft_id").toString())
                .put("status", row.getString("status"))
                .put("totalRows", row.getInteger("total_rows"))
                .put("succeededRows", row.getInteger("succeeded_rows"))
                .put("failedRows", row.getInteger("failed_rows"))
                .put("errorMessage", row.getString("error_message"))
                .put("resultSummary", jsonObject(row.getValue("result_summary")))
                .put("inputRows", jsonArray(row.getValue("input_rows")))
                .put("retryOfJobId", row.getUUID("retry_of_job_id") != null ? row.getUUID("retry_of_job_id").toString() : null)
                .put("createdBy", row.getString("created_by"))
                .put("createdAt", instantString(row.getLocalDateTime("created_at")))
                .put("updatedAt", instantString(row.getLocalDateTime("updated_at")))
                .put("completedAt", instantString(row.getLocalDateTime("completed_at")));
    }

    private JsonObject jsonObject(Object value) {
        if (value instanceof JsonObject jsonObject) {
            return jsonObject;
        }
        if (value == null) {
            return new JsonObject();
        }
        try {
            return new JsonObject(value.toString());
        } catch (Exception ignored) {
            return new JsonObject();
        }
    }

    private JsonArray jsonArray(Object value) {
        if (value instanceof JsonArray jsonArray) {
            return jsonArray;
        }
        if (value == null) {
            return new JsonArray();
        }
        try {
            return new JsonArray(value.toString());
        } catch (Exception ignored) {
            return new JsonArray();
        }
    }

    private String instantString(LocalDateTime value) {
        return value != null ? value.toInstant(ZoneOffset.UTC).toString() : null;
    }
}
