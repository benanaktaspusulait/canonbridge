package com.canonbridge.mappingstudio.repository;

import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
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
public class OutboxEventRepository {

    @Inject
    PgPool client;

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

    public Uni<Void> markFailed(UUID eventId, String errorMessage) {
        Instant now = Instant.now();
        return client.preparedQuery(
                "UPDATE outbox_events SET status = 'FAILED', attempts = attempts + 1, " +
                "last_error = $1, updated_at = $2 WHERE event_id = $3"
        )
        .execute(Tuple.of(errorMessage, toLocalDateTime(now), eventId))
        .replaceWithVoid();
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
        return LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}
