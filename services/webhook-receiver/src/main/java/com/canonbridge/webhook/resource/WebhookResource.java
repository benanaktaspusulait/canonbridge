package com.canonbridge.webhook.resource;

import com.canonbridge.webhook.service.WebhookService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/webhook")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Webhook", description = "Webhook ingestion endpoint")
public class WebhookResource {

    @Inject
    WebhookService webhookService;

    @POST
    @Path("/{partnerId}/{eventType}")
    @Operation(summary = "Receive webhook payload from partner")
    public Uni<Response> receive(
            @PathParam("partnerId") String partnerId,
            @PathParam("eventType") String eventType,
            @HeaderParam("X-Webhook-Key") String webhookKey,
            @Context HttpHeaders headers,
            String payload) {

        if (webhookKey == null || webhookKey.isBlank()) {
            return Uni.createFrom().item(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse("X-Webhook-Key header is required"))
                    .build()
            );
        }

        return webhookService.processWebhook(partnerId, eventType, webhookKey, payload, headers)
            .map(eventId -> Response.accepted()
                .entity(new WebhookResponse(eventId, "Webhook received and queued"))
                .build())
            .onFailure(NotAuthorizedException.class)
            .recoverWithItem(Response.status(Response.Status.UNAUTHORIZED)
                .entity(new ErrorResponse("Invalid webhook key"))
                .build())
            .onFailure()
            .recoverWithItem(throwable -> Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ErrorResponse("Failed to process webhook: " + throwable.getMessage()))
                .build());
    }

    public static class WebhookResponse {
        public String eventId;
        public String message;

        public WebhookResponse() {}

        public WebhookResponse(String eventId, String message) {
            this.eventId = eventId;
            this.message = message;
        }
    }

    public static class ErrorResponse {
        public String error;

        public ErrorResponse() {}

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
