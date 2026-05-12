package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.audit.AuditLogService;
import com.canonbridge.mappingstudio.domain.AuditLog;
import com.canonbridge.mappingstudio.domain.DlqMessage;
import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.DlqMessageRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;

/**
 * REST Resource for Dead Letter Queue Management
 */
@Path("/api/dlq")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "DLQ Management", description = "Dead Letter Queue message management")
public class DlqResource {

    private static final Logger LOG = Logger.getLogger(DlqResource.class);

    @Inject
    DlqMessageRepository dlqRepository;

    @Inject
    KafkaProducerService kafkaProducerService;

    @Inject
    AuditLogService auditLogService;

    @GET
    @Operation(summary = "List DLQ messages", description = "Retrieve all messages in the dead letter queue")
    public Uni<List<DlqMessage>> listDlqMessages(
            @QueryParam("limit") @DefaultValue("50") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset) {
        
        LOG.infof("Listing DLQ messages - limit: %d, offset: %d", limit, offset);
        return dlqRepository.findAll(limit, offset);
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get DLQ message", description = "Retrieve a specific DLQ message by ID")
    public Uni<Response> getDlqMessage(@PathParam("id") String id) {
        LOG.infof("Getting DLQ message: %s", id);
        
        return dlqRepository.findById(id)
            .map(message -> {
                if (message == null) {
                    return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"DLQ message not found\"}")
                        .build();
                }
                return Response.ok(message).build();
            });
    }

    @POST
    @Path("/{id}/redrive")
    @Operation(summary = "Redrive DLQ message", description = "Retry processing a failed message")
    public Uni<Response> redriveDlqMessage(
            @PathParam("id") String id,
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @HeaderParam("X-Correlation-Id") String correlationId) {
        LOG.infof("Redriving DLQ message: %s", id);
        
        return dlqRepository.findById(id)
            .flatMap(message -> {
                if (message == null) {
                    return Uni.createFrom().item(
                        Response.status(Response.Status.NOT_FOUND)
                            .entity("{\"error\":\"DLQ message not found\"}")
                            .build()
                    );
                }

                return dlqRepository.updateStatus(id, DlqMessage.DlqStatus.REDRIVING, Instant.now())
                    .flatMap(v ->
                        kafkaProducerService.publishCanonicalEvent(message.getKey(), message.getPayload())
                            .flatMap(v2 ->
                                dlqRepository.updateStatus(id, DlqMessage.DlqStatus.REDRIVEN, Instant.now())
                                    .flatMap(v3 ->
                                        auditLogService.logSuccess(
                                            tenantId, userId,
                                            AuditLog.AuditAction.DLQ_REDRIVE,
                                            "dlq_message", id,
                                            "Redrived DLQ message to topic: " + message.getOriginalTopic(),
                                            correlationId
                                        ).map(ignored -> Response.ok()
                                            .entity("{\"message\":\"Message redriven successfully\",\"id\":\"" + id + "\"}")
                                            .build())
                                    )
                            )
                    )
                    .onFailure().recoverWithItem(throwable -> {
                        LOG.errorf(throwable, "Failed to redrive message: %s", id);
                        auditLogService.logFailure(tenantId, userId, AuditLog.AuditAction.DLQ_REDRIVE,
                            "dlq_message", id, throwable.getMessage(), correlationId).subscribe().with(x -> {});
                        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                            .entity("{\"error\":\"Failed to redrive message: " + throwable.getMessage() + "\"}")
                            .build();
                    });
            });
    }

    @GET
    @Path("/stats")
    @Operation(summary = "Get DLQ statistics", description = "Retrieve statistics about DLQ messages")
    public Uni<Response> getDlqStats() {
        LOG.info("Getting DLQ statistics");
        
        // TODO: Implement statistics query
        String stats = """
            {
                "total": 0,
                "failed": 0,
                "redriving": 0,
                "redriven": 0,
                "permanentlyFailed": 0
            }
            """;
        
        return Uni.createFrom().item(Response.ok(stats).build());
    }
}
