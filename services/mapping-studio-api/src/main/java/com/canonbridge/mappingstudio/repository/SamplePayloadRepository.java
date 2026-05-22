package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.SamplePayload;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class SamplePayloadRepository {

    @Inject
    PgPool client;

    public Uni<List<SamplePayload>> findByDraft(UUID draftId, String tenantId) {
        String sql = """
                SELECT sample_id, tenant_id, draft_id, source_config_id, name, tag,
                       content_type, payload, payload_sha256, size_bytes, contains_pii,
                       created_by, created_at
                FROM etl_sample_payloads
                WHERE draft_id = $1 AND tenant_id = $2
                ORDER BY created_at DESC
                """;

        return client.preparedQuery(sql)
                .execute(Tuple.of(draftId, tenantId))
                .map(this::toSampleList);
    }

    public Uni<SamplePayload> findById(UUID sampleId, String tenantId) {
        String sql = """
                SELECT sample_id, tenant_id, draft_id, source_config_id, name, tag,
                       content_type, payload, payload_sha256, size_bytes, contains_pii,
                       created_by, created_at
                FROM etl_sample_payloads
                WHERE sample_id = $1 AND tenant_id = $2
                """;

        return client.preparedQuery(sql)
                .execute(Tuple.of(sampleId, tenantId))
                .map(rows -> rows.iterator().hasNext() ? toSample(rows.iterator().next()) : null);
    }

    public Uni<SamplePayload> create(SamplePayload sample) {
        String sql = """
                INSERT INTO etl_sample_payloads (
                    sample_id, tenant_id, draft_id, source_config_id, name, tag,
                    content_type, payload, payload_sha256, size_bytes, contains_pii,
                    created_by, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING sample_id, tenant_id, draft_id, source_config_id, name, tag,
                          content_type, payload, payload_sha256, size_bytes, contains_pii,
                          created_by, created_at
                """;

        UUID sampleId = sample.sampleId() != null ? sample.sampleId() : UUID.randomUUID();
        String payloadJson = sample.payload().encode();
        String sha256 = calculateSha256(payloadJson);
        long sizeBytes = payloadJson.getBytes().length;

        return client.preparedQuery(sql)
                .execute(SqlParams.of(
                        sampleId,
                        sample.tenantId(),
                        sample.draftId(),
                        sample.sourceConfigId(),
                        sample.name(),
                        sample.tag().name(),
                        sample.contentType(),
                        sample.payload(),
                        sha256,
                        sizeBytes,
                        sample.containsPii(),
                        sample.createdBy(),
                        Instant.now()
                ))
                .map(rows -> toSample(rows.iterator().next()));
    }

    public Uni<Void> delete(UUID sampleId, String tenantId) {
        String sql = "DELETE FROM etl_sample_payloads WHERE sample_id = $1 AND tenant_id = $2";
        
        return client.preparedQuery(sql)
                .execute(Tuple.of(sampleId, tenantId))
                .replaceWithVoid();
    }

    private List<SamplePayload> toSampleList(RowSet<Row> rows) {
        List<SamplePayload> samples = new ArrayList<>();
        for (Row row : rows) {
            samples.add(toSample(row));
        }
        return samples;
    }

    private SamplePayload toSample(Row row) {
        return new SamplePayload(
                row.getUUID("sample_id"),
                row.getString("tenant_id"),
                row.getUUID("draft_id"),
                row.getUUID("source_config_id"),
                row.getString("name"),
                SamplePayload.SampleTag.valueOf(row.getString("tag")),
                row.getString("content_type"),
                row.getJsonObject("payload"),
                row.getString("payload_sha256"),
                row.getLong("size_bytes"),
                row.getBoolean("contains_pii"),
                row.getString("created_by"),
                row.getLocalDateTime("created_at").toInstant(java.time.ZoneOffset.UTC)
        );
    }

    private String calculateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate SHA-256", e);
        }
    }
}
