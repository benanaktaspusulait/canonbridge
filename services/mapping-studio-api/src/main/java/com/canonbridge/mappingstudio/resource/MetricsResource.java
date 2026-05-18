package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.repository.ProxyExecutionLogRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@Path("/api/metrics")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Metrics", description = "System metrics and statistics")
public class MetricsResource {

    @Inject
    ProxyExecutionLogRepository logRepository;

    @Inject
    com.canonbridge.mappingstudio.repository.MappingDraftRepository draftRepository;

    @GET
    @Path("/dashboard")
    @Operation(summary = "Get dashboard statistics from real data")
    public Uni<Map<String, Object>> getDashboardStats(
            @HeaderParam("X-Tenant-Id") String tenantId) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return draftRepository.findByTenantId(tenantId)
            .map(drafts -> {
                Map<String, Object> stats = new HashMap<>();
                stats.put("activeMappings", drafts.size());
                stats.put("timestamp", System.currentTimeMillis());
                return stats;
            });
    }

    @GET
    @Path("/monitoring")
    @Operation(summary = "Get monitoring overview")
    public Uni<Map<String, Object>> getMonitoringMetrics(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @QueryParam("window") @DefaultValue("1h") String window) {
        
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("window", window);
        metrics.put("timestamp", System.currentTimeMillis());
        metrics.put("prometheusUrl", "http://localhost:9090");
        metrics.put("grafanaUrl", "http://localhost:3000");
        
        return Uni.createFrom().item(metrics);
    }
}
