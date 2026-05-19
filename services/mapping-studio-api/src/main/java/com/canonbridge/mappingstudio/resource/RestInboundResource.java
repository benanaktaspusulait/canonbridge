package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.validation.SourcePayloadValidator;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/rest-inbound")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "REST Inbound", description = "No-code REST inbound contract ingestion")
public class RestInboundResource {
    @Inject
    TenantContext tenantContext;

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    SourcePayloadValidator payloadValidator;

    @Inject
    KafkaProducerService kafkaProducerService;

    @POST
    @Path("/{draftId}")
    @Operation(summary = "Validate and ingest a REST inbound payload for a mapping draft")
    public Uni<Response> ingest(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("draftId") UUID draftId,
            String rawPayload) {
        tenantId = tenantContext.requireTenantId(tenantId);

        return draftRepository.findById(tenantId, draftId)
                .chain(draft -> {
                    if (draft == null) {
                        return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                    }
                    if (draft.getSourceType() != MappingDraft.SourceType.REST_API) {
                        return Uni.createFrom().item(Response.status(Response.Status.CONFLICT)
                                .entity(new ErrorResponse("Mapping draft is not configured for REST_API inbound"))
                                .build());
                    }

                    SourcePayloadValidator.ValidationResult validation =
                            payloadValidator.validate(draft.getInputSchema(), rawPayload);
                    if (!validation.valid()) {
                        return Uni.createFrom().item(Response.status(422)
                                .entity(new ValidationErrorResponse(validation.errors()))
                                .build());
                    }

                    String key = tenantId + ":" + draftId;
                    return kafkaProducerService.publishCanonicalEvent(key, rawPayload)
                            .map(ignored -> Response.accepted()
                                    .entity(new AcceptedResponse("accepted", draftId))
                                    .build());
                });
    }

    public record AcceptedResponse(String status, UUID draftId) {}
    public record ErrorResponse(String error) {}
    public record ValidationErrorResponse(java.util.List<String> errors) {}
}
