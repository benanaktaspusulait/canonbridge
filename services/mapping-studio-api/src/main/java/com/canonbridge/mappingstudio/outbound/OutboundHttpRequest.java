package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonObject;

public record OutboundHttpRequest(
        JsonObject payload,
        JsonObject headers
) {
    public JsonObject safeHeaders() {
        return headers != null ? headers : new JsonObject();
    }
}
