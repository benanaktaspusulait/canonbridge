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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class BatchUploadSessionRepository {

    @Inject
    PgPool client;

    public Uni<JsonObject> createSession(
            String tenantId,
            UUID draftId,
            String fileName,
            String contentType,
            int expectedChunks,
            int expectedRows,
            JsonObject metadata,
            String createdBy) {
        UUID sessionId = UUID.randomUUID();
        Instant now = Instant.now();
        return client.preparedQuery(
                "INSERT INTO etl_batch_upload_sessions (" +
                "session_id, tenant_id, draft_id, status, file_name, content_type, expected_chunks, expected_rows, " +
                "metadata, created_by, created_at, updated_at" +
                ") VALUES ($1, $2, $3, 'OPEN', $4, $5, $6, $7, $8::jsonb, $9, $10, $10) " +
                "RETURNING *")
        .execute(SqlParams.of(
                sessionId,
                tenantId,
                draftId,
                blankToNull(fileName),
                blankToNull(contentType),
                Math.max(0, expectedChunks),
                Math.max(0, expectedRows),
                metadata != null ? metadata : new JsonObject(),
                createdBy != null && !createdBy.isBlank() ? createdBy : "system",
                toLocalDateTime(now)
        ))
        .map(rows -> toSession(rows.iterator().next()));
    }

    public Uni<List<JsonObject>> listSessions(String tenantId, UUID draftId, int limit, int offset, String status) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        int safeOffset = Math.max(0, offset);
        String normalizedStatus = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;

        if (normalizedStatus == null) {
            return client.preparedQuery(
                    "SELECT * FROM etl_batch_upload_sessions " +
                    "WHERE tenant_id = $1 AND draft_id = $2 " +
                    "ORDER BY created_at DESC LIMIT $3 OFFSET $4")
            .execute(Tuple.of(tenantId, draftId, safeLimit, safeOffset))
            .map(this::toSessionList);
        }

        return client.preparedQuery(
                "SELECT * FROM etl_batch_upload_sessions " +
                "WHERE tenant_id = $1 AND draft_id = $2 AND status = $3 " +
                "ORDER BY created_at DESC LIMIT $4 OFFSET $5")
        .execute(Tuple.of(tenantId, draftId, normalizedStatus, safeLimit, safeOffset))
        .map(this::toSessionList);
    }

    public Uni<JsonObject> findSession(String tenantId, UUID sessionId) {
        return client.preparedQuery(
                "SELECT * FROM etl_batch_upload_sessions WHERE tenant_id = $1 AND session_id = $2")
        .execute(Tuple.of(tenantId, sessionId))
        .map(rows -> rows.size() == 0 ? null : toSession(rows.iterator().next()));
    }

    public Uni<JsonObject> findSessionWithChunks(String tenantId, UUID sessionId) {
        return findSession(tenantId, sessionId)
                .chain(session -> {
                    if (session == null) {
                        return Uni.createFrom().nullItem();
                    }
                    return listChunks(tenantId, sessionId)
                            .map(chunks -> session.put("chunks", new JsonArray(chunks)));
                });
    }

    public Uni<JsonObject> upsertChunk(
            String tenantId,
            UUID sessionId,
            int chunkIndex,
            JsonArray rows,
            String checksum,
            String createdBy) {
        JsonArray safeRows = rows != null ? rows : new JsonArray();
        Instant now = Instant.now();
        return client.preparedQuery(
                "INSERT INTO etl_batch_upload_chunks (" +
                "tenant_id, session_id, chunk_index, row_count, rows, checksum, created_by, received_at, updated_at" +
                ") VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $8) " +
                "ON CONFLICT (tenant_id, session_id, chunk_index) DO UPDATE SET " +
                "row_count = EXCLUDED.row_count, rows = EXCLUDED.rows, checksum = EXCLUDED.checksum, " +
                "created_by = EXCLUDED.created_by, updated_at = EXCLUDED.updated_at " +
                "RETURNING chunk_id")
        .execute(SqlParams.of(
                tenantId,
                sessionId,
                Math.max(0, chunkIndex),
                safeRows.size(),
                safeRows,
                blankToNull(checksum),
                createdBy != null && !createdBy.isBlank() ? createdBy : "system",
                toLocalDateTime(now)
        ))
        .chain(ignored -> refreshSessionCounts(tenantId, sessionId));
    }

    public Uni<List<JsonObject>> listChunks(String tenantId, UUID sessionId) {
        return client.preparedQuery(
                "SELECT chunk_id, tenant_id, session_id, chunk_index, row_count, checksum, created_by, received_at, updated_at " +
                "FROM etl_batch_upload_chunks WHERE tenant_id = $1 AND session_id = $2 ORDER BY chunk_index ASC")
        .execute(Tuple.of(tenantId, sessionId))
        .map(rows -> {
            List<JsonObject> chunks = new ArrayList<>();
            for (Row row : rows) {
                chunks.add(new JsonObject()
                        .put("chunkId", row.getUUID("chunk_id").toString())
                        .put("tenantId", row.getString("tenant_id"))
                        .put("sessionId", row.getUUID("session_id").toString())
                        .put("chunkIndex", row.getInteger("chunk_index"))
                        .put("rowCount", row.getInteger("row_count"))
                        .put("checksum", row.getString("checksum"))
                        .put("createdBy", row.getString("created_by"))
                        .put("receivedAt", instantString(row.getLocalDateTime("received_at")))
                        .put("updatedAt", instantString(row.getLocalDateTime("updated_at"))));
            }
            return chunks;
        });
    }

    public Uni<JsonArray> rowsForSession(String tenantId, UUID sessionId) {
        return client.preparedQuery(
                "SELECT rows FROM etl_batch_upload_chunks WHERE tenant_id = $1 AND session_id = $2 ORDER BY chunk_index ASC")
        .execute(Tuple.of(tenantId, sessionId))
        .map(result -> {
            JsonArray allRows = new JsonArray();
            for (Row row : result) {
                JsonArray chunkRows = jsonArray(row.getValue("rows"));
                for (int i = 0; i < chunkRows.size(); i++) {
                    allRows.add(chunkRows.getValue(i));
                }
            }
            return allRows;
        });
    }

    public Uni<JsonObject> markProcessing(String tenantId, UUID sessionId) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE etl_batch_upload_sessions SET status = 'PROCESSING', updated_at = $3 " +
                "WHERE tenant_id = $1 AND session_id = $2 AND status IN ('OPEN', 'RECEIVING') " +
                "RETURNING *")
        .execute(SqlParams.of(tenantId, sessionId, toLocalDateTime(now)))
        .map(rows -> rows.size() == 0 ? null : toSession(rows.iterator().next()));
    }

    public Uni<JsonObject> markCompleted(String tenantId, UUID sessionId, UUID batchJobId) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE etl_batch_upload_sessions SET status = 'COMPLETED', batch_job_id = $3, " +
                "error_message = NULL, updated_at = $4, completed_at = $4 " +
                "WHERE tenant_id = $1 AND session_id = $2 RETURNING *")
        .execute(SqlParams.of(tenantId, sessionId, batchJobId, toLocalDateTime(now)))
        .map(rows -> rows.size() == 0 ? null : toSession(rows.iterator().next()));
    }

    public Uni<JsonObject> markFailed(String tenantId, UUID sessionId, String errorMessage) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE etl_batch_upload_sessions SET status = 'FAILED', error_message = $3, updated_at = $4, completed_at = $4 " +
                "WHERE tenant_id = $1 AND session_id = $2 RETURNING *")
        .execute(SqlParams.of(tenantId, sessionId, errorMessage, toLocalDateTime(now)))
        .map(rows -> rows.size() == 0 ? null : toSession(rows.iterator().next()));
    }

    public Uni<JsonObject> cancel(String tenantId, UUID sessionId) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE etl_batch_upload_sessions SET status = 'CANCELLED', updated_at = $3, completed_at = $3 " +
                "WHERE tenant_id = $1 AND session_id = $2 AND status IN ('OPEN', 'RECEIVING', 'FAILED') RETURNING *")
        .execute(SqlParams.of(tenantId, sessionId, toLocalDateTime(now)))
        .map(rows -> rows.size() == 0 ? null : toSession(rows.iterator().next()));
    }

    private Uni<JsonObject> refreshSessionCounts(String tenantId, UUID sessionId) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE etl_batch_upload_sessions s SET " +
                "status = CASE WHEN s.status = 'OPEN' THEN 'RECEIVING' ELSE s.status END, " +
                "received_chunks = counts.received_chunks, received_rows = counts.received_rows, updated_at = $3 " +
                "FROM (SELECT COUNT(*)::int AS received_chunks, COALESCE(SUM(row_count), 0)::int AS received_rows " +
                "      FROM etl_batch_upload_chunks WHERE tenant_id = $1 AND session_id = $2) counts " +
                "WHERE s.tenant_id = $1 AND s.session_id = $2 RETURNING s.*")
        .execute(SqlParams.of(tenantId, sessionId, toLocalDateTime(now)))
        .map(rows -> rows.size() == 0 ? null : toSession(rows.iterator().next()));
    }

    private List<JsonObject> toSessionList(RowSet<Row> rows) {
        List<JsonObject> sessions = new ArrayList<>();
        for (Row row : rows) {
            sessions.add(toSession(row));
        }
        return sessions;
    }

    private JsonObject toSession(Row row) {
        UUID batchJobId = row.getUUID("batch_job_id");
        return new JsonObject()
                .put("sessionId", row.getUUID("session_id").toString())
                .put("tenantId", row.getString("tenant_id"))
                .put("draftId", row.getUUID("draft_id").toString())
                .put("status", row.getString("status"))
                .put("fileName", row.getString("file_name"))
                .put("contentType", row.getString("content_type"))
                .put("expectedChunks", row.getInteger("expected_chunks"))
                .put("receivedChunks", row.getInteger("received_chunks"))
                .put("expectedRows", row.getInteger("expected_rows"))
                .put("receivedRows", row.getInteger("received_rows"))
                .put("metadata", jsonObject(row.getValue("metadata")))
                .put("batchJobId", batchJobId != null ? batchJobId.toString() : null)
                .put("errorMessage", row.getString("error_message"))
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

    private String blankToNull(String value) {
        return value != null && !value.isBlank() ? value : null;
    }

    private OffsetDateTime toLocalDateTime(Instant instant) {
        return OffsetDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    private String instantString(LocalDateTime value) {
        return value != null ? value.toInstant(ZoneOffset.UTC).toString() : null;
    }
}
