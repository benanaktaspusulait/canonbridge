package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.repository.ProxyExecutionLogRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.HashMap;
import java.util.List;
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
            .chain(drafts -> logRepository.dashboardStats(tenantId).map(proxyStats -> {
                Map<String, Object> stats = new HashMap<>();
                stats.putAll(proxyStats);
                stats.put("activeMappings", drafts.size());
                stats.put("activePartners", drafts.stream().map(d -> d.getPartnerId()).filter(java.util.Objects::nonNull).distinct().count());
                stats.put("dlqCount", 0);
                stats.put("consumerLag", 0);
                stats.put("timestamp", System.currentTimeMillis());
                return stats;
            }))
            .chain(stats -> logRepository.topMappings(tenantId, 5).map(top -> {
                stats.put("topMappings", top);
                return stats;
            }));
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

        return logRepository.dashboardStats(tenantId).map(proxyStats -> {
            Map<String, Object> metrics = new HashMap<>();
            Map<String, Object> system = new HashMap<>();
            system.put("throughput", proxyStats.getOrDefault("messagesProcessed", 0));
            system.put("p99Latency", proxyStats.getOrDefault("p99Latency", 0));
            system.put("dlqRate", 0);
            system.put("consumerLag", 0);
            system.put("errorRate", proxyStats.getOrDefault("errorRate", 0));
            system.put("uptime", 100);
            metrics.put("system", system);
            metrics.put("window", window);
            metrics.put("timestamp", System.currentTimeMillis());
            metrics.put("prometheusUrl", "http://localhost:9090");
            metrics.put("grafanaUrl", "http://localhost:3000");
            metrics.put("grafanaDashboardUrl", "http://localhost:3000/d/proxy-performance/proxy-performance?orgId=1&kiosk");
            return metrics;
        });
    }

    @GET
    @Path("/partners/health")
    @Operation(summary = "Get mapping health metrics grouped for monitoring")
    public Uni<Map<String, Object>> getPartnerHealth(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @QueryParam("window") @DefaultValue("1h") String window) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }

        return logRepository.healthByMapping(tenantId).map(rows -> {
            List<Map<String, Object>> partners = rows.stream().map(row -> {
                long total = ((Number) row.getOrDefault("total", 0)).longValue();
                long errors = ((Number) row.getOrDefault("errors", 0)).longValue();
                double successRate = ((Number) row.getOrDefault("successRate", 0)).doubleValue();
                String status = total == 0 ? "degraded" : successRate >= 95 ? "healthy" : successRate >= 50 ? "degraded" : "down";
                Map<String, Object> item = new HashMap<>();
                item.put("partner", row.get("name") != null ? row.get("name") : row.get("partnerId"));
                item.put("status", status);
                item.put("throughput", String.valueOf(total));
                item.put("p99", row.getOrDefault("avgLatencyMs", 0) + "ms");
                item.put("dlqRate", total > 0 ? Math.round(((double) errors / total * 100) * 100.0) / 100.0 + "%" : "0%");
                item.put("lag", 0);
                item.put("uptime", successRate + "%");
                return item;
            }).toList();
            Map<String, Object> response = new HashMap<>();
            response.put("window", window);
            response.put("partners", partners);
            return response;
        });
    }
}
