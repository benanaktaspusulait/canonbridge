package com.canonbridge.webhook.service;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.PreparedQuery;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Iterator;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@QuarkusTest
class WebhookAuthServiceTest {

    @Inject
    WebhookAuthService webhookAuthService;

    @InjectMock
    PgPool pgPool;

    @Test
    void givenMatchingHashedKey_whenValidate_thenReturnsTrue() throws Exception {
        String rawKey = "my-secret-key";
        String hashedKey = hashKey(rawKey);

        PreparedQuery<RowSet<Row>> preparedQuery = Mockito.mock(PreparedQuery.class);
        RowSet<Row> rowSet = mockRowSetWithHash(hashedKey);

        Mockito.when(pgPool.preparedQuery(anyString())).thenReturn(preparedQuery);
        Mockito.when(preparedQuery.execute(any())).thenReturn(Uni.createFrom().item(rowSet));

        Boolean result = webhookAuthService
            .validateWebhookKey("partner-001", rawKey)
            .await().indefinitely();

        assertTrue(result);
    }

    @Test
    void givenWrongKey_whenValidate_thenReturnsFalse() throws Exception {
        String storedKey = "correct-key";
        String storedHash = hashKey(storedKey);

        PreparedQuery<RowSet<Row>> preparedQuery = Mockito.mock(PreparedQuery.class);
        RowSet<Row> rowSet = mockRowSetWithHash(storedHash);

        Mockito.when(pgPool.preparedQuery(anyString())).thenReturn(preparedQuery);
        Mockito.when(preparedQuery.execute(any())).thenReturn(Uni.createFrom().item(rowSet));

        Boolean result = webhookAuthService
            .validateWebhookKey("partner-001", "wrong-key")
            .await().indefinitely();

        assertFalse(result);
    }

    @Test
    void givenNoPartnerFound_whenValidate_thenReturnsFalse() {
        PreparedQuery<RowSet<Row>> preparedQuery = Mockito.mock(PreparedQuery.class);
        RowSet<Row> emptyRowSet = mockEmptyRowSet();

        Mockito.when(pgPool.preparedQuery(anyString())).thenReturn(preparedQuery);
        Mockito.when(preparedQuery.execute(any())).thenReturn(Uni.createFrom().item(emptyRowSet));

        Boolean result = webhookAuthService
            .validateWebhookKey("unknown-partner", "any-key")
            .await().indefinitely();

        assertFalse(result);
    }

    @Test
    void givenDatabaseError_whenValidate_thenThrowsException() {
        PreparedQuery<RowSet<Row>> preparedQuery = Mockito.mock(PreparedQuery.class);

        Mockito.when(pgPool.preparedQuery(anyString())).thenReturn(preparedQuery);
        Mockito.when(preparedQuery.execute(any()))
            .thenReturn(Uni.createFrom().failure(new RuntimeException("Connection refused")));

        assertThrows(RuntimeException.class, () ->
            webhookAuthService
                .validateWebhookKey("partner-001", "any-key")
                .await().indefinitely()
        );
    }

    private RowSet<Row> mockRowSetWithHash(String hash) {
        RowSet<Row> rowSet = Mockito.mock(RowSet.class);
        Row row = Mockito.mock(Row.class);
        Iterator<Row> iterator = Mockito.mock(Iterator.class);

        Mockito.when(rowSet.size()).thenReturn(1);
        Mockito.when(rowSet.iterator()).thenReturn(iterator);
        Mockito.when(iterator.hasNext()).thenReturn(true, false);
        Mockito.when(iterator.next()).thenReturn(row);
        Mockito.when(row.getString("webhook_key_hash")).thenReturn(hash);

        return rowSet;
    }

    private RowSet<Row> mockEmptyRowSet() {
        RowSet<Row> rowSet = Mockito.mock(RowSet.class);
        Iterator<Row> iterator = Mockito.mock(Iterator.class);

        Mockito.when(rowSet.size()).thenReturn(0);
        Mockito.when(rowSet.iterator()).thenReturn(iterator);
        Mockito.when(iterator.hasNext()).thenReturn(false);

        return rowSet;
    }

    private String hashKey(String key) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
}
