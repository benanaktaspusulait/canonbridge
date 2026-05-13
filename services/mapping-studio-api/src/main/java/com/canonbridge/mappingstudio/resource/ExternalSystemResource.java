package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.OutboundConnection;
import com.canonbridge.mappingstudio.outbound.OutboundHttpRequest;
import com.canonbridge.mappingstudio.outbound.OutboundHttpResult;
import com.canonbridge.mappingstudio.outbound.OutboundHttpService;
import com.canonbridge.mappingstudio.outbound.RequestTemplateService;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.repository.OutboundConnectionRepository;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
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

    @Inject
    OutboundHttpService outboundHttpService;

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    RequestTemplateService requestTemplateService;

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

    @POST
    @Path("/{connectionId}/test")
    @Operation(summary = "Execute a test request against an external system connection")
    public Uni<Response> test(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("connectionId") UUID connectionId,
            OutboundHttpRequest request) {
        String requiredTenantId = requireTenantId(tenantId);
        return connectionRepository.findById(requiredTenantId, connectionId)
                .chain(connection -> {
                    if (connection == null) {
                        return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                    }
                    return resolveRequestFromDraft(requiredTenantId, connection, request)
                            .chain(resolvedRequest -> outboundHttpService.execute(requiredTenantId, connection, resolvedRequest))
                            .chain(result -> recordAndRespond(requiredTenantId, connectionId, result));
                });
    }

    private Uni<OutboundHttpRequest> resolveRequestFromDraft(
            String tenantId,
            OutboundConnection connection,
            OutboundHttpRequest request
    ) {
        if (request != null && request.payload() != null) {
            return Uni.createFrom().item(request);
        }
        if (connection.draftId() == null) {
            return Uni.createFrom().item(request);
        }
        return draftRepository.findById(tenantId, connection.draftId())
                .chain(draft -> {
                    if (draft == null || draft.getSourceConfig() == null) {
                        return Uni.createFrom().item(request);
                    }
                    JsonObject sourceConfig = new JsonObject(draft.getSourceConfig());
                    JsonObject context = request != null ? request.safeContext() : new JsonObject();
                    return requestTemplateService.renderFromSourceConfig(sourceConfig, context)
                            .map(payload -> {
                                JsonObject templateHeaders = requestTemplateService.renderHeadersFromSourceConfig(sourceConfig, context);
                                JsonObject headers = request != null ? request.safeHeaders().copy() : new JsonObject();
                                headers.mergeIn(templateHeaders, false);
                                return new OutboundHttpRequest(payload, headers, context);
                            });
                });
    }

    @POST
    @Path("/test-adhoc")
    @Operation(summary = "Execute an ad-hoc test request without persisting the connection")
    public Uni<Response> testAdhoc(
            @HeaderParam("X-Tenant-Id") String tenantId,
            AdhocTestRequest request) {
        String requiredTenantId = requireTenantId(tenantId);
        if (request == null || request.connection() == null) {
            throw new BadRequestException("connection is required");
        }

        OutboundConnection connection = withTenant(requiredTenantId, request.connection());
        return outboundHttpService.execute(requiredTenantId, connection, request.request())
                .map(result -> Response.ok(result).build())
                .onFailure().recoverWithItem(throwable -> Response.status(Response.Status.BAD_GATEWAY)
                        .entity(new TriggerError(throwable.getMessage()))
                        .build());
    }

    @POST
    @Path("/{connectionId}/trigger")
    @Operation(summary = "Manually trigger an outbound REST/SOAP polling connection")
    public Uni<Response> trigger(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("connectionId") UUID connectionId,
            OutboundHttpRequest request) {
        String requiredTenantId = requireTenantId(tenantId);
        return connectionRepository.findById(requiredTenantId, connectionId)
                .chain(connection -> {
                    if (connection == null) {
                        return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                    }
                    if (connection.purpose() != OutboundConnection.ConnectionPurpose.SOURCE_PAYLOAD) {
                        return Uni.createFrom().item(Response.status(Response.Status.CONFLICT)
                                .entity(new TriggerError("Connection purpose must be SOURCE_PAYLOAD"))
                                .build());
                    }
                    if (connection.status() == OutboundConnection.ConnectionStatus.DISABLED) {
                        return Uni.createFrom().item(Response.status(Response.Status.CONFLICT)
                                .entity(new TriggerError("Connection is disabled"))
                                .build());
                    }
                    return outboundHttpService.execute(requiredTenantId, connection, request)
                            .chain(result -> recordAndRespond(requiredTenantId, connectionId, result));
                });
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

    private Uni<Response> recordAndRespond(String tenantId, UUID connectionId, OutboundHttpResult result) {
        OutboundConnection.ConnectionStatus status = result.success()
                ? OutboundConnection.ConnectionStatus.HEALTHY
                : OutboundConnection.ConnectionStatus.FAILED;
        JsonObject summary = new JsonObject()
                .put("statusCode", result.statusCode())
                .put("success", result.success())
                .put("durationMs", result.durationMs());
        return connectionRepository.recordTestResult(tenantId, connectionId, status, summary.encode())
                .replaceWith(Response.ok(result).build());
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
                connection.updatedAt(),
                connection.isSystemTemplate(),
                connection.baseUrl(),
                connection.knownEndpoints()
        );
    }

    public record TriggerError(String error) {}

    public record AdhocTestRequest(
            OutboundConnection connection,
            OutboundHttpRequest request
    ) {}
}
