package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonObject;

public record OutboundHttpRequest(
        JsonObject payload,
        JsonObject headers,
        JsonObject context
) {
    public OutboundHttpRequest(JsonObject payload, JsonObject headers) {
        this(payload, headers, null);
    }

    public JsonObject safeHeaders() {
        return headers != null ? headers : new JsonObject();
    }

    public JsonObject safeContext() {
        return context != null ? context : new JsonObject();
    }

    public OutboundHttpRequest withPayloadAndHeaders(JsonObject nextPayload, JsonObject nextHeaders) {
        return new OutboundHttpRequest(nextPayload, nextHeaders, context);
    }
}
