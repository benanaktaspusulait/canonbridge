package com.canonbridge.mappingstudio.repository;

import io.vertx.mutiny.sqlclient.Tuple;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

final class Tuples {

    private Tuples() {
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
