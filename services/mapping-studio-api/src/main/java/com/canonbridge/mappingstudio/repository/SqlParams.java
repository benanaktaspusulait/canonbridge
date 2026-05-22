package com.canonbridge.mappingstudio.repository;

import io.vertx.mutiny.sqlclient.Tuple;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Utility for building reactive SQL parameter tuples with automatic type conversion.
 * Converts {@link Instant} values to {@link LocalDateTime} (UTC) for PostgreSQL compatibility.
 */
final class SqlParams {

    private SqlParams() {
    }

    static Tuple of(Object... values) {
        Tuple tuple = Tuple.tuple();
        for (Object value : values) {
            if (value instanceof Instant instant) {
                tuple.addValue(LocalDateTime.ofInstant(instant, ZoneOffset.UTC));
            } else {
                tuple.addValue(value);
            }
        }
        return tuple;
    }
}
