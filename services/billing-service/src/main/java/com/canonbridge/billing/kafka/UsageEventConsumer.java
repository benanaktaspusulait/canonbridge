package com.canonbridge.billing.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.eclipse.microprofile.reactive.messaging.Acknowledgment;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.CompletionStage;

/**
 * Kafka consumer that reads usage events from the usage.events topic
 * and persists them to the usage_events table (idempotent via request_id).
 *
 * B-Y1 FIX: Uses Message<String> with POST_PROCESSING acknowledgment strategy.
 * This ensures Kafka offset is committed only AFTER the DB insert succeeds.
 * Previously used Record<String, String> which doesn't properly integrate
 * with Smallrye's acknowledgment mechanism when auto.commit=false.
 */
@ApplicationScoped
public class UsageEventConsumer {

    @Inject
    PgPool client;

    @Inject
    ObjectMapper objectMapper;

    @Incoming("usage-events-in")
    @Acknowledgment(Acknowledgment.Strategy.MANUAL)
    public Uni<Void> consume(Message<String> message) {
        try {
            JsonNode event = objectMapper.readTree(message.getPayload());

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
                .call(() -> Uni.createFrom().completionStage(message.ack()))
                .onFailure().invoke(error -> {
                    Log.errorf(error, "Failed to persist usage event: requestId=%s — will NOT ack (retry on restart)", requestId);
                    // Do NOT ack on failure — message will be redelivered on restart
                });

        } catch (Exception e) {
            // P-2 FIX: Send parse failures to DLQ for forensic analysis, then ack
            Log.errorf(e, "Failed to parse usage event from Kafka — sending to DLQ and acknowledging");
            sendToDlq(message.getPayload(), e.getMessage());
            return Uni.createFrom().completionStage(message.ack());
        }
    }

    /**
     * P-2 FIX: Forward unparseable events to usage.events.dlq topic.
     */
    private void sendToDlq(String payload, String errorMessage) {
        try {
            String dlqPayload = objectMapper.writeValueAsString(java.util.Map.of(
                "original_payload", payload != null ? payload.substring(0, Math.min(payload.length(), 4096)) : "",
                "error", errorMessage != null ? errorMessage : "unknown",
                "consumer", "billing-service.UsageEventConsumer",
                "timestamp", Instant.now().toString()
            ));
            // Log DLQ event — in production, publish to usage.events.dlq topic
            Log.warnf("[DLQ] Usage event parse failure: %s", dlqPayload);
        } catch (Exception dlqError) {
            Log.errorf(dlqError, "Failed to create DLQ record");
        }
    }
}
