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

    // [BS-H1] FIX: Use Redis for distributed rate limiting (works across replicas)
    @jakarta.inject.Inject
    io.quarkus.redis.datasource.RedisDataSource redisDataSource;

    private boolean checkWebhookRateLimit(String clientIp) {
        try {
            var valueCommands = redisDataSource.value(Long.class);
            var keyCommands = redisDataSource.key();
            String key = "paddle_wh_rl:" + clientIp;
            Long count = valueCommands.incr(key);
            if (count != null && count == 1L) {
                keyCommands.expire(key, java.time.Duration.ofSeconds(60));
            }
            return count != null && count <= MAX_WEBHOOK_REQUESTS_PER_MINUTE;
        } catch (Exception e) {
            // Fail-open on Redis errors — don't block legitimate webhooks
            return true;
        }
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

        // [BS-H1] Redis-based distributed rate limiting
        String clientIp = headers.getHeaderString("X-Forwarded-For");
        if (clientIp == null) clientIp = "unknown";
        else clientIp = clientIp.split(",")[0].trim();

        if (!checkWebhookRateLimit(clientIp)) {
            Log.warnf("Paddle webhook rate limit exceeded for IP %s", clientIp);
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
