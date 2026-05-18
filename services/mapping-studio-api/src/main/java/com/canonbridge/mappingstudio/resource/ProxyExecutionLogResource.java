package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.ProxyExecutionLog;
import com.canonbridge.mappingstudio.repository.ProxyExecutionLogRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/proxy")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Proxy Execution Logs", description = "Audit trail for proxy executions")
public class ProxyExecutionLogResource {

    @Inject
    ProxyExecutionLogRepository logRepository;

    @Inject
    com.canonbridge.mappingstudio.repository.MappingDraftRepository draftRepository;

    @Inject
    com.canonbridge.mappingstudio.service.MappingExecutionService executionService;

    @GET
    @Path("/{mappingId}/logs")
    @Operation(summary = "Get recent execution logs for a mapping")
    public Uni<List<ProxyExecutionLog>> getLogs(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId,
            @QueryParam("limit") @DefaultValue("20") int limit) {

        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return logRepository.findByMappingId(tenantId, mappingId, Math.min(limit, 100));
    }

    @GET
    @Path("/{mappingId}/logs/{logId}")
    @Operation(summary = "Get execution log detail")
    public Uni<Response> getLogDetail(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId,
            @PathParam("logId") UUID logId) {

        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return logRepository.findById(tenantId, logId)
            .map(log -> {
                if (log == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(log).build();
            });
    }

    @GET
    @Path("/{mappingId}/stats")
    @Operation(summary = "Get execution statistics for a mapping")
    public Uni<Response> getStats(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId) {

        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return logRepository.countByMappingAndStatus(tenantId, mappingId, "SUCCESS")
            .chain(successCount -> logRepository.countByMappingAndStatus(tenantId, mappingId, "ERROR")
                .map(errorCount -> {
                    long total = successCount + errorCount;
                    double successRate = total > 0 ? (double) successCount / total * 100 : 0;
                    return Response.ok(new java.util.HashMap<String, Object>() {{
                        put("total", total);
                        put("success", successCount);
                        put("errors", errorCount);
                        put("successRate", Math.round(successRate * 100.0) / 100.0);
                    }}).build();
                })
            );
    }

    @POST
    @Path("/{mappingId}/retry/{logId}")
    @Operation(summary = "Retry a failed proxy execution")
    public Uni<Response> retryExecution(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId,
            @PathParam("logId") UUID logId) {

        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return logRepository.findById(tenantId, logId)
            .chain(log -> {
                if (log == null) {
                    return Uni.createFrom().item(
                        Response.status(Response.Status.NOT_FOUND)
                            .entity(new java.util.HashMap<String, String>() {{ put("error", "Execution log not found"); }})
                            .build()
                    );
                }
                if (!"ERROR".equals(log.getStatus().name())) {
                    return Uni.createFrom().item(
                        Response.status(Response.Status.BAD_REQUEST)
                            .entity(new java.util.HashMap<String, String>() {{ put("error", "Only failed executions can be retried"); }})
                            .build()
                    );
                }

                // Re-execute the proxy call
                return draftRepository.findById(tenantId, mappingId)
                    .chain(draft -> {
                        if (draft == null) {
                            return Uni.createFrom().item(
                                Response.status(Response.Status.NOT_FOUND)
                                    .entity(new java.util.HashMap<String, String>() {{ put("error", "Mapping not found"); }})
                                    .build()
                            );
                        }
                        String payload = log.getRequestPayload() != null ? log.getRequestPayload() : "{}";
                        return executionService.executeMapping(draft, payload, null)
                            .map(result -> {
                                if (result.success()) {
                                    return Response.ok(new java.util.HashMap<String, Object>() {{
                                        put("status", "SUCCESS");
                                        put("message", "Retry successful");
                                        put("result", result.transformedResponse() != null ? result.transformedResponse().toString() : null);
                                    }}).build();
                                } else {
                                    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                                        .entity(new java.util.HashMap<String, Object>() {{
                                            put("status", "ERROR");
                                            put("message", "Retry failed: " + result.error());
                                        }}).build();
                                }
                            });
                    });
            });
    }
}
