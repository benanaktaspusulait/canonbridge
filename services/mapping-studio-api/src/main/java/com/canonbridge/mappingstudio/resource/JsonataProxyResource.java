package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/jsonata")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "JSONata", description = "JSONata expression evaluation proxy")
public class JsonataProxyResource {

    @Inject
    RequestTemplateService requestTemplateService;

    @POST
    @Path("/evaluate")
    @Operation(summary = "Evaluate a JSONata expression against a payload via the transformer service")
    public Uni<Response> evaluate(JsonObject body) {
        if (body == null) {
            return Uni.createFrom().item(Response.status(400)
                    .entity(new JsonObject().put("ok", false).put("message", "Request body is required"))
                    .build());
        }

        String expression = body.getString("expression", "").trim();
        if (expression.isEmpty()) {
            return Uni.createFrom().item(Response.status(400)
                    .entity(new JsonObject().put("ok", false).put("message", "expression is required"))
                    .build());
        }

        JsonObject payload = body.getJsonObject("payload");
        int timeoutMs = body.getInteger("timeoutMs", 500);

        return requestTemplateService.evaluate(expression, payload, timeoutMs)
                .map(result -> Response.ok(
                        new JsonObject().put("ok", true).put("result", result)
                ).build())
                .onFailure().recoverWithItem(e -> Response.status(422)
                        .entity(new JsonObject().put("ok", false).put("message", e.getMessage()))
                        .build());
    }
}
