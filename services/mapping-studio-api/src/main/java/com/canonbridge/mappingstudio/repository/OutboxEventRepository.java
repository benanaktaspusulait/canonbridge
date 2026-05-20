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
public class OutboxEventRepository {

    @Inject
    PgPool client;

    public record OutboxEvent(
            UUID eventId,
            String tenantId,
            String topic,
            String key,
            String payload,
            String partnerId,
            String eventType,
            String status,
            int attempts,
            String lastError,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public Uni<UUID> createPending(
            String tenantId,
            String topic,
            String key,
            String payload,
            String partnerId,
            String eventType) {
        UUID eventId = UUID.randomUUID();
        Instant now = Instant.now();
        return client.preparedQuery(
                "INSERT INTO outbox_events (" +
                "event_id, tenant_id, topic, event_key, partner_id, event_type, payload, status, created_at, updated_at" +
                ") VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, 'PENDING', $8, $8) " +
                "RETURNING event_id"
        )
        .execute(Tuples.of(
                eventId,
                tenantId,
                topic,
                key,
                partnerId,
                eventType,
                jsonPayload(payload),
                toLocalDateTime(now)
        ))
        .map(rows -> rows.iterator().next().getUUID("event_id"));
    }

    public Uni<Void> markPublished(UUID eventId) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE outbox_events SET status = 'PUBLISHED', attempts = attempts + 1, " +
                "published_at = $1, updated_at = $1 WHERE event_id = $2"
        )
        .execute(Tuple.of(toLocalDateTime(now), eventId))
        .replaceWithVoid();
    }

    public Uni<Void> markPublishedAfterReplay(UUID eventId) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE outbox_events SET status = 'PUBLISHED', attempts = attempts + 1, " +
                "published_at = $1, replayed_at = $1, updated_at = $1 WHERE event_id = $2"
        )
        .execute(Tuple.of(toLocalDateTime(now), eventId))
        .replaceWithVoid();
    }

    public Uni<Void> markFailed(UUID eventId, String errorMessage) {
        return markFailed(eventId, errorMessage, null);
    }

    public Uni<Void> markFailed(UUID eventId, String errorMessage, Instant nextAttemptAt) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE outbox_events SET status = 'FAILED', attempts = attempts + 1, " +
                "last_error = $1, next_attempt_at = $2, updated_at = $3 WHERE event_id = $4"
        )
        .execute(Tuple.of(errorMessage, toLocalDateTime(nextAttemptAt), toLocalDateTime(now), eventId))
        .replaceWithVoid();
    }

    public Uni<List<OutboxEvent>> findReplayable(int limit, int maxAttempts) {
        int safeLimit = Math.max(1, Math.min(limit, 500));
        int safeMaxAttempts = Math.max(1, maxAttempts);
        return client.preparedQuery(
                "SELECT event_id, tenant_id, topic, event_key, partner_id, event_type, payload, status, attempts, " +
                "last_error, created_at, updated_at FROM outbox_events " +
                "WHERE status IN ('PENDING', 'FAILED') AND attempts < $1 " +
                "AND (next_attempt_at IS NULL OR next_attempt_at <= NOW()) " +
                "ORDER BY created_at ASC LIMIT $2"
        )
        .execute(Tuple.of(safeMaxAttempts, safeLimit))
        .map(this::toOutboxEvents);
    }

    public Uni<List<JsonObject>> list(String tenantId, String status, int limit, int offset) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        int safeOffset = Math.max(0, offset);
        String normalizedStatus = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;

        if (normalizedStatus == null) {
            return client.preparedQuery(
                    "SELECT event_id, tenant_id, topic, event_key, partner_id, event_type, payload, status, attempts, " +
                    "last_error, created_at, published_at, replayed_at, updated_at FROM outbox_events " +
                    "WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
            )
            .execute(Tuple.of(tenantId, safeLimit, safeOffset))
            .map(this::toJsonList);
        }

        return client.preparedQuery(
                "SELECT event_id, tenant_id, topic, event_key, partner_id, event_type, payload, status, attempts, " +
                "last_error, created_at, published_at, replayed_at, updated_at FROM outbox_events " +
                "WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4"
        )
        .execute(Tuple.of(tenantId, normalizedStatus, safeLimit, safeOffset))
        .map(this::toJsonList);
    }

    public Uni<JsonObject> stats(String tenantId) {
        return client.preparedQuery(
                "SELECT status, COUNT(*) AS count FROM outbox_events WHERE tenant_id = $1 GROUP BY status"
        )
        .execute(Tuple.of(tenantId))
        .map(rows -> {
            JsonObject stats = new JsonObject()
                    .put("tenantId", tenantId)
                    .put("pending", 0L)
                    .put("published", 0L)
                    .put("failed", 0L)
                    .put("total", 0L);
            long total = 0L;
            for (Row row : rows) {
                String status = row.getString("status").toLowerCase();
                long count = row.getLong("count");
                stats.put(status, count);
                total += count;
            }
            return stats.put("total", total);
        });
    }

    private Object jsonPayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return new JsonObject();
        }
        try {
            return new JsonObject(payload);
        } catch (Exception ignored) {
        }
        try {
            return new JsonArray(payload);
        } catch (Exception ignored) {
            return new JsonObject().put("value", payload);
        }
    }

    private LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    private List<OutboxEvent> toOutboxEvents(RowSet<Row> rows) {
        List<OutboxEvent> events = new ArrayList<>();
        for (Row row : rows) {
            events.add(new OutboxEvent(
                    row.getUUID("event_id"),
                    row.getString("tenant_id"),
                    row.getString("topic"),
                    row.getString("event_key"),
                    jsonPayloadString(row.getValue("payload")),
                    row.getString("partner_id"),
                    row.getString("event_type"),
                    row.getString("status"),
                    row.getInteger("attempts"),
                    row.getString("last_error"),
                    toInstant(row.getLocalDateTime("created_at")),
                    toInstant(row.getLocalDateTime("updated_at"))
            ));
        }
        return events;
    }

    private List<JsonObject> toJsonList(RowSet<Row> rows) {
        List<JsonObject> events = new ArrayList<>();
        for (Row row : rows) {
            events.add(new JsonObject()
                    .put("eventId", row.getUUID("event_id").toString())
                    .put("tenantId", row.getString("tenant_id"))
                    .put("topic", row.getString("topic"))
                    .put("key", row.getString("event_key"))
                    .put("partnerId", row.getString("partner_id"))
                    .put("eventType", row.getString("event_type"))
                    .put("payload", jsonPayload(row.getValue("payload")))
                    .put("status", row.getString("status"))
                    .put("attempts", row.getInteger("attempts"))
                    .put("lastError", row.getString("last_error"))
                    .put("createdAt", instantString(row.getLocalDateTime("created_at")))
                    .put("publishedAt", instantString(row.getLocalDateTime("published_at")))
                    .put("replayedAt", instantString(row.getLocalDateTime("replayed_at")))
                    .put("updatedAt", instantString(row.getLocalDateTime("updated_at"))));
        }
        return events;
    }

    private Object jsonPayload(Object payload) {
        if (payload instanceof JsonObject || payload instanceof JsonArray) {
            return payload;
        }
        if (payload == null) {
            return null;
        }
        String raw = payload.toString();
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

    private String jsonPayloadString(Object payload) {
        Object value = jsonPayload(payload);
        if (value instanceof JsonObject jsonObject) {
            return jsonObject.encode();
        }
        if (value instanceof JsonArray jsonArray) {
            return jsonArray.encode();
        }
        return value != null ? value.toString() : "{}";
    }

    private Instant toInstant(LocalDateTime value) {
        return value != null ? value.toInstant(ZoneOffset.UTC) : null;
    }

    private String instantString(LocalDateTime value) {
        return value != null ? value.toInstant(ZoneOffset.UTC).toString() : null;
    }
}
