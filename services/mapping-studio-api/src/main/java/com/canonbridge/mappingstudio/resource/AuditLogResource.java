package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.AuditLog;
import com.canonbridge.mappingstudio.repository.AuditLogRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/audit-logs")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Audit Logs", description = "Audit log query endpoints")
public class AuditLogResource {
    @Inject
    TenantContext tenantContext;

    @Inject
    AuditLogRepository auditLogRepository;

    @GET
    @Operation(summary = "List audit log entries for tenant")
    public Uni<List<AuditLog>> list(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @QueryParam("limit") @DefaultValue("100") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return auditLogRepository.findByTenantId(tenantId, limit, offset);
    }

    @GET
    @Path("/resource/{resourceId}")
    @Operation(summary = "Get audit logs for a specific resource")
    public Uni<List<AuditLog>> getByResource(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("resourceId") String resourceId) {
        tenantId = tenantContext.requireTenantId(tenantId);
        return auditLogRepository.findByResourceId(tenantId, resourceId);
    }
}
