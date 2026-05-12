package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.OutboundConnection;
import com.canonbridge.mappingstudio.repository.OutboundConnectionRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/external-systems")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "External Systems", description = "External system connection management operations")
public class ExternalSystemResource {

    @Inject
    OutboundConnectionRepository connectionRepository;

    @GET
    @Operation(summary = "List all external system connections for tenant")
    public Uni<List<OutboundConnection>> list(@HeaderParam("X-Tenant-Id") String tenantId) {
        return connectionRepository.findByTenantId(requireTenantId(tenantId));
    }

    @GET
    @Path("/draft/{draftId}")
    @Operation(summary = "List external system connections by mapping draft")
    public Uni<List<OutboundConnection>> listByDraft(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("draftId") UUID draftId) {
        return connectionRepository.findByDraft(requireTenantId(tenantId), draftId);
    }

    @GET
    @Path("/{connectionId}")
    @Operation(summary = "Get external system connection by ID")
    public Uni<Response> get(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("connectionId") UUID connectionId) {
        return connectionRepository.findById(requireTenantId(tenantId), connectionId)
                .map(this::okOrNotFound);
    }

    @POST
    @Operation(summary = "Create an external system connection")
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            OutboundConnection connection) {
        return connectionRepository.create(withTenant(requireTenantId(tenantId), connection))
                .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @PUT
    @Path("/{connectionId}")
    @Operation(summary = "Update an external system connection")
    public Uni<Response> update(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("connectionId") UUID connectionId,
            OutboundConnection connection) {
        String requiredTenantId = requireTenantId(tenantId);
        return connectionRepository.update(requiredTenantId, connectionId, withTenant(requiredTenantId, connection))
                .map(this::okOrNotFound);
    }

    @DELETE
    @Path("/{connectionId}")
    @Operation(summary = "Delete an external system connection")
    public Uni<Response> delete(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("connectionId") UUID connectionId) {
        return connectionRepository.delete(requireTenantId(tenantId), connectionId)
                .map(deleted -> deleted ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build());
    }

    private String requireTenantId(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new BadRequestException("X-Tenant-Id header is required");
        }
        return tenantId;
    }

    private Response okOrNotFound(OutboundConnection connection) {
        if (connection == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(connection).build();
    }

    private OutboundConnection withTenant(String tenantId, OutboundConnection connection) {
        return new OutboundConnection(
                connection.connectionId(),
                tenantId,
                connection.draftId(),
                connection.name(),
                connection.purpose(),
                connection.protocol(),
                connection.method(),
                connection.url(),
                connection.credentialId(),
                connection.environment(),
                connection.schedule(),
                connection.timeoutMs(),
                connection.retryPolicy(),
                connection.responseHandling(),
                connection.status(),
                connection.lastTestAt(),
                connection.lastTestResult(),
                connection.createdAt(),
                connection.updatedAt()
        );
    }
}
