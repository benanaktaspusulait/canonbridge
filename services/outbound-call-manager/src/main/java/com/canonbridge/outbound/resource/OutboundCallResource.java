package com.canonbridge.outbound.resource;

import com.canonbridge.outbound.domain.CallHistory;
import com.canonbridge.outbound.domain.OutboundConnection;
import com.canonbridge.outbound.service.OutboundCallService;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/internal/outbound")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Outbound Calls", description = "Internal outbound call execution")
public class OutboundCallResource {

    @Inject
    OutboundCallService callService;

    @POST
    @Path("/execute")
    @Operation(summary = "Execute an outbound call")
    public Uni<Response> execute(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-Correlation-Id") String correlationId,
            OutboundCallRequest request) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        // In production, fetch connection from repository
        OutboundConnection connection = new OutboundConnection();
        connection.setId(request.connectionId);
        connection.setBaseUrl(request.baseUrl);
        connection.setTimeoutMs(request.timeoutMs != null ? request.timeoutMs : 30000);

        return callService.executeCall(
            tenantId,
            connection,
            request.method,
            request.path,
            request.headers != null ? new JsonObject(request.headers) : null,
            request.body != null ? new JsonObject(request.body) : null,
            correlationId
        ).map(history -> {
            if (history.getSuccess()) {
                return Response.ok(history).build();
            } else {
                return Response.status(Response.Status.BAD_GATEWAY).entity(history).build();
            }
        });
    }

    @POST
    @Path("/test")
    @Operation(summary = "Test an outbound connection")
    public Uni<Response> test(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-Correlation-Id") String correlationId,
            OutboundCallRequest request) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        OutboundConnection connection = new OutboundConnection();
        connection.setId(UUID.randomUUID());
        connection.setBaseUrl(request.baseUrl);
        connection.setTimeoutMs(5000); // Short timeout for tests

        return callService.executeCall(
            tenantId,
            connection,
            "GET",
            request.path,
            null,
            null,
            correlationId
        ).map(history -> Response.ok(history).build());
    }

    public static class OutboundCallRequest {
        public UUID connectionId;
        public String baseUrl;
        public String method;
        public String path;
        public String headers;
        public String body;
        public Integer timeoutMs;
    }
}
