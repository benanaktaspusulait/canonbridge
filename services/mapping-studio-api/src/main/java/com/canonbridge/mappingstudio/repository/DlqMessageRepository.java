package com.canonbridge.mappingstudio.repository;

import com.canonbridge.mappingstudio.domain.DlqMessage;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class DlqMessageRepository {

    @Inject
    PgPool client;

    public Uni<List<DlqMessage>> findAll(int limit, int offset) {
        String sql = """
            SELECT id, original_topic, partition, offset, key, payload, 
                   error_message, error_stack_trace, failed_at, retry_count, 
                   status, redrive_attempted_at
            FROM dlq_messages
            ORDER BY failed_at DESC
            LIMIT $1 OFFSET $2
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(limit, offset))
            .map(this::mapRows);
    }

    public Uni<DlqMessage> findById(String id) {
        String sql = """
            SELECT id, original_topic, partition, offset, key, payload, 
                   error_message, error_stack_trace, failed_at, retry_count, 
                   status, redrive_attempted_at
            FROM dlq_messages
            WHERE id = $1
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(id))
            .map(rowSet -> {
                if (rowSet.size() == 0) {
                    return null;
                }
                return mapRow(rowSet.iterator().next());
            });
    }

    public Uni<DlqMessage> save(DlqMessage message) {
        String sql = """
            INSERT INTO dlq_messages (
                id, original_topic, partition, offset, key, payload,
                error_message, error_stack_trace, failed_at, retry_count, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
                retry_count = EXCLUDED.retry_count,
                status = EXCLUDED.status,
                redrive_attempted_at = EXCLUDED.redrive_attempted_at
            RETURNING id
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(
                message.getId(),
                message.getOriginalTopic(),
                message.getPartition(),
                message.getOffset(),
                message.getKey(),
                message.getPayload(),
                message.getErrorMessage(),
                message.getErrorStackTrace(),
                message.getFailedAt(),
                message.getRetryCount(),
                message.getStatus().name()
            ))
            .map(rowSet -> message);
    }

    public Uni<Void> updateStatus(String id, DlqMessage.DlqStatus status, Instant redriveAttemptedAt) {
        String sql = """
            UPDATE dlq_messages
            SET status = $1, redrive_attempted_at = $2
            WHERE id = $3
            """;

        return client.preparedQuery(sql)
            .execute(Tuple.of(status.name(), redriveAttemptedAt, id))
            .replaceWithVoid();
    }

    private List<DlqMessage> mapRows(RowSet<Row> rows) {
        List<DlqMessage> messages = new ArrayList<>();
        for (Row row : rows) {
            messages.add(mapRow(row));
        }
        return messages;
    }

    private DlqMessage mapRow(Row row) {
        DlqMessage message = new DlqMessage();
        message.setId(row.getString("id"));
        message.setOriginalTopic(row.getString("original_topic"));
        message.setPartition(row.getInteger("partition"));
        message.setOffset(row.getLong("offset"));
        message.setKey(row.getString("key"));
        message.setPayload(row.getString("payload"));
        message.setErrorMessage(row.getString("error_message"));
        message.setErrorStackTrace(row.getString("error_stack_trace"));
        message.setFailedAt(row.getLocalDateTime("failed_at").toInstant(java.time.ZoneOffset.UTC));
        message.setRetryCount(row.getInteger("retry_count"));
        message.setStatus(DlqMessage.DlqStatus.valueOf(row.getString("status")));
        
        if (row.getLocalDateTime("redrive_attempted_at") != null) {
            message.setRedriveAttemptedAt(row.getLocalDateTime("redrive_attempted_at").toInstant(java.time.ZoneOffset.UTC));
        }
        
        return message;
    }
}
