package com.canonbridge.mappingstudio.resource;

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
public class MappingProxyResource {

    private static final Logger LOG = Logger.getLogger(MappingProxyResource.class);

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    MappingExecutionService executionService;

    @POST
    @Path("/{mappingId}")
    @Operation(
        summary = "Execute mapping as API proxy",
        description = "Accepts request in original format, transforms it, calls target API, " +
                     "transforms response, and returns it in original format"
    )
    public Uni<Response> executeMapping(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("mappingId") UUID mappingId,
            @Context HttpHeaders headers,
            String requestPayload) {

        if (tenantId == null || tenantId.isBlank()) {
            return Uni.createFrom().item(
                Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("X-Tenant-Id header is required"))
                    .build()
            );
        }

        LOG.infof("🔄 Proxy request for mapping %s from tenant %s", mappingId, tenantId);

        return draftRepository.findById(tenantId, mappingId)
            .chain(draft -> {
                if (draft == null) {
                    LOG.warnf("❌ Mapping %s not found for tenant %s", mappingId, tenantId);
                    return Uni.createFrom().item(
                        Response.status(Response.Status.NOT_FOUND)
                            .entity(new ErrorResponse("Mapping not found"))
                            .build()
                    );
                }

                // Execute the mapping: request transform → API call → response transform
                return executionService.executeMapping(draft, requestPayload, headers)
                    .map(result -> {
                        if (result.success()) {
                            LOG.infof("✅ Mapping %s executed successfully", mappingId);
                            return Response.ok(result.transformedResponse()).build();
                        } else {
                            LOG.errorf("❌ Mapping %s execution failed: %s", mappingId, result.error());
                            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                                .entity(new ErrorResponse(result.error()))
                                .build();
                        }
                    })
                    .onFailure().recoverWithItem(throwable -> {
                        LOG.errorf(throwable, "❌ Unexpected error executing mapping %s", mappingId);
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity(new ErrorResponse("Mapping execution failed: " + throwable.getMessage()))
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

        if (tenantId == null || tenantId.isBlank()) {
            return Uni.createFrom().item(
                Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("X-Tenant-Id header is required"))
                    .build()
            );
        }

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

    public record ErrorResponse(String error) {}
    
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
