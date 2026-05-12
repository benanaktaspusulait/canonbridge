package com.canonbridge.mappingstudio.repository;

import io.vertx.mutiny.sqlclient.Tuple;

final class Tuples {

    private Tuples() {
    }

    static Tuple of(Object... values) {
        Tuple tuple = Tuple.tuple();
        for (Object value : values) {
            tuple.addValue(value);
        }
        return tuple;
    }
}
