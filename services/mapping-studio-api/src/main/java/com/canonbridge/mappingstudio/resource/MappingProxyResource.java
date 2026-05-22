package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.service.MappingExecutionService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.util.UUID;

/**
 * Dynamic API Proxy Resource
 * 
 * Provides a proxy endpoint for each mapping that:
 * 1. Accepts requests in the original format
 * 2. Applies request transformation
 * 3. Calls the target API
 * 4. Applies response transformation
 * 5. Returns response in the original format
 * 
 * This allows partners to migrate to new APIs without changing their code,
 * only by changing the endpoint URL.
 */
@Path("/api/proxy")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mapping Proxy", description = "Dynamic API proxy for seamless integration migration")
@jakarta.annotation.security.RolesAllowed({"admin", "integration_author", "operator", "viewer"})
public class MappingProxyResource {
    @Inject
    TenantContext tenantContext;

    private static final Logger LOG = Logger.getLogger(MappingProxyResource.class);

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    MappingExecutionService executionService;

    @Inject
    com.canonbridge.mappingstudio.repository.MappingVersionRepository versionRepository;

    @POST
    @Path("/{mappingId}")
    @Operation(
        summary = "Execute mapping as API proxy (POST)",
        description = "Accepts request in original format, transforms it, calls target API, " +
                     "transforms response, and returns it in original format"
    )
    public Uni<Response> executeMapping(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId,
            @Context HttpHeaders headers,
            String requestPayload) {

        tenantId = tenantContext.requireTenantId(tenantId);

        // Request size limit: 1MB
        if (requestPayload != null && requestPayload.length() > 1_048_576) {
            return Uni.createFrom().item(
                Response.status(Response.Status.REQUEST_ENTITY_TOO_LARGE)
                    .entity(new ErrorResponse("Request payload exceeds 1MB limit"))
                    .build()
            );
        }

        LOG.infof("🔄 Proxy POST request for mapping %s from tenant %s", mappingId, tenantId);

        return executeProxyRequest(tenantId, mappingId, headers, requestPayload);
    }

    @GET
    @Path("/{mappingId}")
    @Operation(
        summary = "Execute mapping as API proxy (GET)",
        description = "Accepts GET request with query params, transforms them, calls target API, " +
                     "transforms response, and returns it in original format"
    )
    public Uni<Response> executeMappingGet(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId,
            @Context HttpHeaders headers,
            @Context jakarta.ws.rs.core.UriInfo uriInfo) {

        tenantId = tenantContext.requireTenantId(tenantId);

        LOG.infof("🔄 Proxy GET request for mapping %s from tenant %s", mappingId, tenantId);

        // Convert query params to JSON payload
        var queryParams = uriInfo.getQueryParameters();
        var jsonPayload = new StringBuilder("{");
        boolean first = true;
        for (var entry : queryParams.entrySet()) {
            if (!first) jsonPayload.append(",");
            jsonPayload.append("\"").append(entry.getKey()).append("\":\"")
                      .append(entry.getValue().get(0)).append("\"");
            first = false;
        }
        jsonPayload.append("}");

        return executeProxyRequest(tenantId, mappingId, headers, jsonPayload.toString());
    }

    private Uni<Response> executeProxyRequest(
            String tenantId,
            UUID mappingId,
            HttpHeaders headers,
            String requestPayload) {

        // First try to find the draft (which has the full source_config for execution)
        return draftRepository.findById(tenantId, mappingId)
            .chain(draft -> {
                if (draft == null) {
                    LOG.warnf("Mapping %s not found for tenant %s", mappingId, tenantId);
                    return Uni.createFrom().item(
                        Response.status(Response.Status.NOT_FOUND)
                            .entity(new ErrorResponse("Mapping not found"))
                            .build()
                    );
                }

                // Execute using draft runtime config (auth, URL, templates, transforms).
                return executionService.executeMapping(draft, requestPayload, headers)
                    .map(result -> {
                        if (result.success()) {
                            LOG.infof("Mapping %s executed successfully", mappingId);
                            return Response.ok(result.transformedResponse()).build();
                        } else {
                            LOG.errorf("Mapping %s execution failed: %s", mappingId, result.error());
                            int statusCode = determineErrorStatus(result.error());
                            return Response.status(statusCode)
                                .entity(new ErrorDetailResponse(
                                    result.error(), "execution", result.error()
                                ))
                                .build();
                        }
                    })
                    .onFailure().recoverWithItem(throwable -> {
                        LOG.errorf(throwable, "Unexpected error executing mapping %s", mappingId);
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorDetailResponse(
                                "Mapping execution failed", "system", throwable.getMessage()
                            ))
                            .build();
                    });
            });
    }

    @GET
    @Path("/{mappingId}/info")
    @Operation(
        summary = "Get mapping proxy information",
        description = "Returns information about the mapping proxy endpoint"
    )
    public Uni<Response> getMappingInfo(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId) {

        tenantId = tenantContext.requireTenantId(tenantId);

        return draftRepository.findById(tenantId, mappingId)
            .map(draft -> {
                if (draft == null) {
                    return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("Mapping not found"))
                        .build();
                }

                var info = new MappingProxyInfo(
                    mappingId.toString(),
                    draft.getName(),
                    draft.getDescription(),
                    "/api/proxy/" + mappingId,
                    draft.getSourceType().toString(),
                    draft.getCanonicalSchemaRef(),
                    countMappingRules(draft.getMappingRules())
                );

                return Response.ok(info).build();
            });
    }

    private int countMappingRules(String mappingRulesJson) {
        if (mappingRulesJson == null || mappingRulesJson.isBlank()) {
            return 0;
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(mappingRulesJson);
            return node.isArray() ? node.size() : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private int determineErrorStatus(String error) {
        if (error == null) {
            return 500;
        }
        
        String errorLower = error.toLowerCase();
        
        // Validation errors
        if (errorLower.contains("validation") || errorLower.contains("invalid")) {
            return 400; // Bad Request
        }
        
        // Not found errors
        if (errorLower.contains("not found") || errorLower.contains("not configured")) {
            return 404; // Not Found
        }
        
        // Timeout errors
        if (errorLower.contains("timeout") || errorLower.contains("timed out")) {
            return 504; // Gateway Timeout
        }
        
        // External API errors
        if (errorLower.contains("api call failed") || errorLower.contains("connection")) {
            return 502; // Bad Gateway
        }
        
        // Default to internal server error
        return 500;
    }

    public record ErrorResponse(String error) {}
    
    public record ErrorDetailResponse(
        String error,
        String stage,
        String details,
        long timestamp
    ) {
        public ErrorDetailResponse(String error, String stage, String details) {
            this(error, stage, details, System.currentTimeMillis());
        }
    }
    
    public record MappingProxyInfo(
        String mappingId,
        String name,
        String description,
        String proxyEndpoint,
        String sourceType,
        String targetSchema,
        int transformationRulesCount
    ) {}
}
