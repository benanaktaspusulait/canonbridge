package com.canonbridge.billing.api;

import com.canonbridge.billing.paddle.PaddleWebhookHandler;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/webhooks/paddle")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Paddle Webhooks", description = "Paddle payment provider webhook receiver")
public class PaddleWebhookResource {

    @Inject
    PaddleWebhookHandler webhookHandler;

    @POST
    @Operation(summary = "Receive Paddle webhook events")
    public Uni<Response> handleWebhook(
            @HeaderParam("Paddle-Signature") String signature,
            String body) {

        if (signature == null || signature.isBlank()) {
            Log.warn("Paddle webhook received without signature header");
            return Uni.createFrom().item(Response.status(Response.Status.UNAUTHORIZED).build());
        }

        return webhookHandler.handle(signature, body)
            .map(handled -> {
                if (handled) {
                    return Response.ok().build();
                }
                return Response.status(Response.Status.BAD_REQUEST).build();
            })
            .onFailure().recoverWithItem(error -> {
                Log.errorf(error, "Error processing Paddle webhook");
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            });
    }
}
