package com.canonbridge.mappingstudio.outbound;

import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RequestTemplateServiceTest {

    private final RequestTemplateService service = new RequestTemplateService();

    @Test
    void rendersNestedTemplateWithTypedExactPlaceholders() {
        JsonObject sourceConfig = new JsonObject()
                .put("requestTransformation", new JsonObject()
                        .put("mode", "template")
                        .put("template", new JsonObject()
                                .put("order_id", "{{canonical.orderId}}")
                                .put("amount", "{{canonical.amount}}")
                                .put("customer", new JsonObject()
                                        .put("email", "{{canonical.customer.email}}"))
                                .put("language", "tr"))
                        .put("headers", new JsonObject()
                                .put("X-Partner", "{{source.partnerId}}")));
        JsonObject context = new JsonObject()
                .put("canonical", new JsonObject()
                        .put("orderId", "ORD-123")
                        .put("amount", 42.5)
                        .put("customer", new JsonObject().put("email", "buyer@example.com")))
                .put("source", new JsonObject().put("partnerId", "payflex"));

        JsonObject rendered = service.renderFromSourceConfig(sourceConfig, context);
        JsonObject headers = service.renderHeadersFromSourceConfig(sourceConfig, context);

        assertEquals("ORD-123", rendered.getString("order_id"));
        assertEquals(42.5, rendered.getDouble("amount"));
        assertEquals("buyer@example.com", rendered.getJsonObject("customer").getString("email"));
        assertEquals("tr", rendered.getString("language"));
        assertEquals("payflex", headers.getString("X-Partner"));
    }
}
