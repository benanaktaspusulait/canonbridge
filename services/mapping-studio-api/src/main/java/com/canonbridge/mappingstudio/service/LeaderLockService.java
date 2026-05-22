package com.canonbridge.mappingstudio.service;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.util.function.Supplier;
import java.util.zip.CRC32;

@ApplicationScoped
public class LeaderLockService {

    private static final Logger LOG = Logger.getLogger(LeaderLockService.class);

    @Inject
    PgPool client;

    public <T> Uni<T> withLock(String lockName, Supplier<Uni<T>> work, T skippedResult) {
        if (client == null) {
            return work.get();
        }

        long lockId = lockId(lockName);
        return tryAcquire(lockId)
                .chain(acquired -> {
                    if (!acquired) {
                        LOG.debugf("Skipping %s because another instance holds the leader lock", lockName);
                        return Uni.createFrom().item(skippedResult);
                    }
                    return work.get()
                            .eventually(() -> release(lockId));
                });
    }

    private Uni<Boolean> tryAcquire(long lockId) {
        return client.preparedQuery("SELECT pg_try_advisory_lock($1) AS locked")
                .execute(Tuple.of(lockId))
                .map(rows -> {
                    Row row = rows.iterator().next();
                    return Boolean.TRUE.equals(row.getBoolean("locked"));
                });
    }

    private Uni<Void> release(long lockId) {
        return client.preparedQuery("SELECT pg_advisory_unlock($1)")
                .execute(Tuple.of(lockId))
                .onFailure().invoke(error -> LOG.warnf("Failed to release leader lock %d: %s", lockId, error.getMessage()))
                .onFailure().recoverWithNull()
                .replaceWithVoid();
    }

    private long lockId(String lockName) {
        CRC32 crc32 = new CRC32();
        crc32.update(lockName.getBytes(StandardCharsets.UTF_8));
        return crc32.getValue();
    }
}
