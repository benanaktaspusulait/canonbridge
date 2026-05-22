package com.canonbridge.billing.api;

import com.canonbridge.billing.paddle.PaddleWebhookHandler;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/webhooks/paddle")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Paddle Webhooks", description = "Paddle payment provider webhook receiver")
public class PaddleWebhookResource {

    private static final int MAX_WEBHOOK_REQUESTS_PER_MINUTE = 60;
    private final java.util.concurrent.ConcurrentHashMap<String, Integer> webhookRateLimit = new java.util.concurrent.ConcurrentHashMap<>();

    // Reset rate limit counters every minute
    @jakarta.annotation.PostConstruct
    void initRateLimitReset() {
        java.util.concurrent.Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "paddle-webhook-rl-reset");
            t.setDaemon(true);
            return t;
        }).scheduleAtFixedRate(webhookRateLimit::clear, 60, 60, java.util.concurrent.TimeUnit.SECONDS);
    }

    @Inject
    PaddleWebhookHandler webhookHandler;

    @POST
    @Operation(summary = "Receive Paddle webhook events")
    public Uni<Response> handleWebhook(
            @HeaderParam("Paddle-Signature") String signature,
            @Context jakarta.ws.rs.core.HttpHeaders headers,
            String body) {

        if (signature == null || signature.isBlank()) {
            Log.warn("Paddle webhook received without signature header");
            return Uni.createFrom().item(Response.status(Response.Status.UNAUTHORIZED).build());
        }

        // B-V1-H5 FIX: Basic rate limiting on webhook endpoint (per-IP)
        String clientIp = headers.getHeaderString("X-Forwarded-For");
        if (clientIp == null) clientIp = "unknown";
        else clientIp = clientIp.split(",")[0].trim();

        int count = webhookRateLimit.merge(clientIp, 1, Integer::sum);
        if (count > MAX_WEBHOOK_REQUESTS_PER_MINUTE) {
            Log.warnf("Paddle webhook rate limit exceeded for IP %s (%d/min)", clientIp, count);
            return Uni.createFrom().item(Response.status(429).build());
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
