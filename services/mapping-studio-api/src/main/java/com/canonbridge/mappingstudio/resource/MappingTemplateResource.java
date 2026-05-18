package com.canonbridge.mappingstudio.resource;

import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/mapping-templates")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mapping Templates", description = "Reusable mapping draft templates")
public class MappingTemplateResource {

    @GET
    @Operation(summary = "List mapping templates")
    public Uni<JsonArray> list() {
        JsonArray templates = new JsonArray()
            .add(template(
                "rest-passthrough",
                "REST passthrough",
                "REST_API",
                "For request/response mappings where the canonical payload is close to the source payload.",
                new JsonObject().put("method", "POST").put("endpoint", "/api/orders"),
                "$"
            ))
            .add(template(
                "webhook-normalizer",
                "Webhook normalizer",
                "WEBHOOK",
                "For signed partner webhooks that need lightweight canonicalization.",
                new JsonObject().put("endpoint", "/webhook/{partner}/{event}").put("signatureHeader", "X-Signature"),
                "{ \"eventType\": eventType, \"payload\": payload }"
            ))
            .add(template(
                "scheduled-api-poll",
                "Scheduled API poll",
                "SCHEDULED_API",
                "For periodic pull integrations with credential-backed upstream requests.",
                new JsonObject().put("schedule", "0 */15 * * * ?").put("url", "https://example.com/events"),
                "$.items"
            ));

        return Uni.createFrom().item(templates);
    }

    private JsonObject template(String id, String name, String sourceType, String description, JsonObject sourceConfig, String jsonata) {
        return new JsonObject()
            .put("id", id)
            .put("name", name)
            .put("description", description)
            .put("draft", new JsonObject()
                .put("name", name)
                .put("event_type", id.replace('-', '.'))
                .put("source_type", sourceType)
                .put("source_config", sourceConfig)
                .put("mapping_rules", new JsonArray())
                .put("generated_jsonata", jsonata)
                .put("validation_rules", new JsonArray()));
    }
}
