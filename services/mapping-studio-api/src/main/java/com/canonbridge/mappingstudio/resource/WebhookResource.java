package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.WebhookEndpoint;
import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.WebhookEndpointRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Path("/api/webhooks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Webhooks", description = "Webhook endpoint management and ingestion")
public class WebhookResource {
    @Inject
    TenantContext tenantContext;

    private static final Logger LOG = Logger.getLogger(WebhookResource.class);

    @Inject
    WebhookEndpointRepository webhookRepository;

    @Inject
    KafkaProducerService kafkaProducerService;

    @GET
    @Operation(summary = "List webhook endpoints")
    public Uni<List<WebhookEndpoint>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return webhookRepository.findByTenantId(tenantId);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a webhook endpoint by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return webhookRepository.findById(tenantId, id)
            .map(endpoint -> {
                if (endpoint == null) {
                    return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Webhook endpoint not found\"}")
                        .build();
                }
                return Response.ok(endpoint).build();
            });
    }

    @POST
    @Operation(summary = "Register a new webhook endpoint")
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            WebhookEndpoint endpoint) {
        tenantId = tenantContext.requireTenantId(tenantId);
        if (endpoint.getName() == null || endpoint.getName().isBlank()) {
            throw new BadRequestException("Webhook name is required");
        }

        endpoint.setTenantId(tenantId);
        endpoint.setCreatedBy(userId);

        if (endpoint.getTargetTopic() == null) {
            endpoint.setTargetTopic("partner.webhook.raw");
        }

        return webhookRepository.create(endpoint)
            .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @PUT
    @Path("/{id}/status")
    @Operation(summary = "Update webhook endpoint status (ACTIVE, INACTIVE, SUSPENDED)")
    public Uni<Response> updateStatus(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id,
            WebhookStatusRequest request) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return webhookRepository.updateStatus(tenantId, id, request.status())
            .map(updated -> {
                if (updated == null) {
                    return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Webhook endpoint not found\"}")
                        .build();
                }
                return Response.ok(updated).build();
            });
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a webhook endpoint")
    public Uni<Response> delete(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID id) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return webhookRepository.delete(tenantId, id)
            .map(deleted -> {
                if (!deleted) {
                    return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Webhook endpoint not found\"}")
                        .build();
                }
                return Response.noContent().build();
            });
    }

    @POST
    @Path("/ingest/{endpointId}")
    @Consumes(MediaType.WILDCARD)
    @Operation(summary = "Ingest a webhook payload and publish to Kafka")
    public Uni<Response> ingest(
            @PathParam("endpointId") UUID endpointId,
            @HeaderParam("X-Webhook-Signature") String signature,
            String rawBody) {
        LOG.infof("Webhook ingest received for endpoint: %s", endpointId);

        return webhookRepository.findByPath("/webhooks/ingest/" + endpointId)
            .flatMap(endpoint -> {
                if (endpoint == null) {
                    return Uni.createFrom().item(
                        Response.status(Response.Status.NOT_FOUND)
                            .entity("{\"error\":\"Webhook endpoint not found\"}")
                            .build()
                    );
                }
                if (endpoint.getStatus() != WebhookEndpoint.WebhookStatus.ACTIVE) {
                    return Uni.createFrom().item(
                        Response.status(Response.Status.FORBIDDEN)
                            .entity("{\"error\":\"Webhook endpoint is not active\"}")
                            .build()
                    );
                }

                if (endpoint.getSecretHash() != null && !endpoint.getSecretHash().isBlank()) {
                    if (!verifySignature(rawBody, signature, endpoint.getSecretHash())) {
                        return Uni.createFrom().item(
                            Response.status(Response.Status.UNAUTHORIZED)
                                .entity("{\"error\":\"Invalid webhook signature\"}")
                                .build()
                        );
                    }
                }

                String messageKey = endpoint.getTenantId() + ":" + endpointId;
                return kafkaProducerService.publishCanonicalEvent(messageKey, rawBody)
                    .flatMap(v -> webhookRepository.recordReceived(endpointId))
                    .map(v -> Response.accepted()
                        .entity("{\"status\":\"accepted\",\"endpoint_id\":\"" + endpointId + "\"}")
                        .build())
                    .onFailure().recoverWithItem(throwable -> {
                        LOG.errorf(throwable, "Failed to process webhook for endpoint: %s", endpointId);
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity("{\"error\":\"Failed to process webhook payload\"}")
                            .build();
                    });
            });
    }

    private boolean verifySignature(String body, String signature, String secretHash) {
        if (signature == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(secretHash.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
            String computed = "sha256=" + HexFormat.of().formatHex(hash);
            return MessageDigest.isEqual(
                computed.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            LOG.errorf(e, "Failed to verify webhook signature");
            return false;
        }
    }

    public record WebhookStatusRequest(WebhookEndpoint.WebhookStatus status) {}
}
