package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonObject;

public record OutboundHttpResult(
        int statusCode,
        boolean success,
        long durationMs,
        JsonObject headers,
        String body
) {
}
