package com.canonbridge.billing.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.kafka.Record;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Kafka consumer that reads usage events from the usage.events topic
 * and persists them to the usage_events table (idempotent via request_id).
 */
@ApplicationScoped
public class UsageEventConsumer {

    @Inject
    PgPool client;

    @Inject
    ObjectMapper objectMapper;

    @Incoming("usage-events-in")
    public Uni<Void> consume(Record<String, String> record) {
        try {
            JsonNode event = objectMapper.readTree(record.value());

            UUID orgId = UUID.fromString(event.path("org_id").asText());
            String service = event.path("service").asText();
            String metric = event.path("metric").asText();
            int qty = event.path("qty").asInt(1);
            String requestId = event.path("request_id").asText();
            Instant ts = Instant.parse(event.path("ts").asText());
            String metadata = event.has("metadata") ? event.path("metadata").toString() : "{}";

            String sql = """
                INSERT INTO usage_events (id, org_id, service, metric, qty, ts, request_id, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
                ON CONFLICT (request_id) DO NOTHING
                """;

            return client.preparedQuery(sql)
                .execute(Tuple.tuple()
                    .addUUID(UUID.randomUUID())
                    .addUUID(orgId)
                    .addString(service)
                    .addString(metric)
                    .addInteger(qty)
                    .addValue(LocalDateTime.ofInstant(ts, ZoneOffset.UTC))
                    .addString(requestId)
                    .addString(metadata)
                )
                .replaceWithVoid()
                .onFailure().invoke(error ->
                    Log.errorf(error, "Failed to persist usage event: requestId=%s", requestId)
                );

        } catch (Exception e) {
            Log.errorf(e, "Failed to parse usage event from Kafka: key=%s", record.key());
            return Uni.createFrom().voidItem();
        }
    }
}
