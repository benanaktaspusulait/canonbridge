package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import io.smallrye.common.annotation.Blocking;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
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
    @Blocking
    @Operation(summary = "Evaluate a JSONata expression against a payload via the transformer service")
    public Response evaluate(JsonObject body) {
        if (body == null) {
            return Response.status(400)
                    .entity(new JsonObject().put("ok", false).put("message", "Request body is required"))
                    .build();
        }

        String expression = body.getString("expression", "").trim();
        if (expression.isEmpty()) {
            return Response.status(400)
                    .entity(new JsonObject().put("ok", false).put("message", "expression is required"))
                    .build();
        }

        JsonObject payload = body.getJsonObject("payload");
        int timeoutMs = body.getInteger("timeoutMs", 500);

        try {
            JsonObject result = requestTemplateService.evaluateBlocking(expression, payload, timeoutMs);
            return Response.ok(new JsonObject().put("ok", true).put("result", result.getValue("result"))).build();
        } catch (BadRequestException e) {
            return Response.status(422)
                    .entity(new JsonObject().put("ok", false).put("message", e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(500)
                    .entity(new JsonObject().put("ok", false).put("message", "Internal error: " + e.getMessage()))
                    .build();
        }
    }
}
