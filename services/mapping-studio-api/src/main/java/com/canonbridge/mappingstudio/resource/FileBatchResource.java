package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.kafka.KafkaProducerService;
import com.canonbridge.mappingstudio.repository.BatchJobRepository;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.service.MappingExecutionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Path("/api/mapping-drafts/{id}/batch")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "File Batch", description = "Batch payload ingestion for FILE_BATCH mappings")
public class FileBatchResource {
    @Inject
    TenantContext tenantContext;

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    BatchJobRepository batchJobRepository;

    @Inject
    MappingExecutionService executionService;

    @Inject
    KafkaProducerService kafkaProducerService;

    @Inject
    ObjectMapper objectMapper;

    @POST
    @Path("/ingest")
    @Operation(summary = "Ingest normalized batch rows and publish canonical events")
    public Uni<Response> ingest(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @PathParam("id") UUID id,
            String requestBody) {
        String requiredTenantId = tenantContext.requireTenantId(tenantId);

        JsonNode rowsNode;
        try {
            JsonNode body = objectMapper.readTree(requestBody == null || requestBody.isBlank() ? "[]" : requestBody);
            rowsNode = extractRows(body);
        } catch (Exception e) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity(new JsonObject().put("error", "Invalid JSON batch payload: " + e.getMessage()))
                    .build());
        }

        if (rowsNode == null || !rowsNode.isArray()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity(new JsonObject().put("error", "Batch payload must be an array or contain a rows/records array"))
                    .build());
        }

        return draftRepository.findById(requiredTenantId, id)
                .chain(draft -> {
                    if (draft == null) {
                        return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND)
                                .entity(new JsonObject().put("error", "Mapping draft not found"))
                                .build());
                    }
                    if (draft.getSourceType() != MappingDraft.SourceType.FILE_BATCH) {
                        return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                                .entity(new JsonObject().put("error", "Mapping is not a FILE_BATCH source mapping"))
                                .build());
                    }
                    return batchJobRepository.createRunning(requiredTenantId, draft.getId(), rowsNode.size(), userId)
                            .chain(jobId -> {
                                if (rowsNode.isEmpty()) {
                                    return completeBatchJob(requiredTenantId, jobId, draft, new JsonArray(), null);
                                }

                                List<Uni<JsonObject>> rowJobs = new ArrayList<>();
                                for (int i = 0; i < rowsNode.size(); i++) {
                                    rowJobs.add(processRow(requiredTenantId, draft, i + 1, rowsNode.get(i)));
                                }

                                return Uni.combine().all().unis(rowJobs)
                                        .combinedWith(items -> {
                                            JsonArray results = new JsonArray();
                                            for (Object item : items) {
                                                results.add(item);
                                            }
                                            return results;
                                        })
                                        .chain(results -> completeBatchJob(requiredTenantId, jobId, draft, results, null));
                            });
                })
                .onFailure().recoverWithItem(error -> Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity(new JsonObject().put("error", "Failed to process batch job: " + error.getMessage()))
                        .build());
    }

    private Uni<Response> completeBatchJob(
            String tenantId,
            UUID jobId,
            MappingDraft draft,
            JsonArray results,
            String errorMessage) {
        JsonObject summary = batchSummary(draft, results, jobId, errorMessage);
        return batchJobRepository.complete(
                        tenantId,
                        jobId,
                        summary.getInteger("succeeded", 0),
                        summary.getInteger("failed", 0),
                        summary,
                        errorMessage)
                .replaceWith(Response.ok(summary).build());
    }

    private JsonNode extractRows(JsonNode body) {
        if (body == null) return null;
        if (body.isArray()) return body;
        if (body.has("rows")) return body.get("rows");
        if (body.has("records")) return body.get("records");
        if (body.has("payload") && body.get("payload").isArray()) return body.get("payload");
        return null;
    }

    private Uni<JsonObject> processRow(String tenantId, MappingDraft draft, int rowNumber, JsonNode row) {
        return executionService.testSourceMapping(draft, row.toString())
                .chain(result -> {
                    if (!result.success()) {
                        return Uni.createFrom().item(rowError(rowNumber, result.error()));
                    }

                    JsonNode canonicalNode = result.transformedResponse();
                    String canonicalPayload = canonicalNode != null ? canonicalNode.toString() : row.toString();
                    String key = buildMessageKey(draft, rowNumber, canonicalNode);

                    return kafkaProducerService.publishCanonicalEvent(
                                    tenantId,
                                    key,
                                    canonicalPayload,
                                    draft.getPartnerId() != null ? draft.getPartnerId().toString() : null,
                                    draft.getEventType())
                            .replaceWith(new JsonObject()
                                    .put("row", rowNumber)
                                    .put("status", "SUCCESS")
                                    .put("messageKey", key)
                                    .put("canonical", toJsonValue(canonicalNode)))
                            .onFailure().recoverWithItem(error -> rowError(rowNumber, "Publish failed: " + error.getMessage()));
                })
                .onFailure().recoverWithItem(error -> rowError(rowNumber, error.getMessage()));
    }

    private JsonObject batchSummary(MappingDraft draft, JsonArray results, UUID jobId, String errorMessage) {
        int succeeded = 0;
        int failed = 0;
        for (int i = 0; i < results.size(); i++) {
            JsonObject row = results.getJsonObject(i);
            if ("SUCCESS".equals(row.getString("status"))) {
                succeeded++;
            } else {
                failed++;
            }
        }

        return new JsonObject()
                .put("mappingId", draft.getId() != null ? draft.getId().toString() : null)
                .put("jobId", jobId != null ? jobId.toString() : null)
                .put("jobStatus", batchStatus(succeeded, failed, errorMessage))
                .put("sourceType", draft.getSourceType() != null ? draft.getSourceType().name() : null)
                .put("totalRows", results.size())
                .put("succeeded", succeeded)
                .put("failed", failed)
                .put("published", succeeded)
                .put("results", results);
    }

    private String batchStatus(int succeeded, int failed, String errorMessage) {
        if (errorMessage != null && !errorMessage.isBlank() && succeeded == 0) {
            return "FAILED";
        }
        if (failed > 0) {
            return succeeded > 0 ? "COMPLETED_WITH_ERRORS" : "FAILED";
        }
        return "COMPLETED";
    }

    private JsonObject rowError(int rowNumber, String message) {
        return new JsonObject()
                .put("row", rowNumber)
                .put("status", "ERROR")
                .put("error", message != null ? message : "Unknown row processing error");
    }

    private String buildMessageKey(MappingDraft draft, int rowNumber, JsonNode canonicalNode) {
        String discoveredKey = findText(canonicalNode, "eventId", "id", "orderId", "paymentId", "customerId");
        if (discoveredKey != null && !discoveredKey.isBlank()) {
            return discoveredKey;
        }
        String mappingId = draft.getId() != null ? draft.getId().toString() : "mapping";
        return mappingId + "-row-" + rowNumber;
    }

    private String findText(JsonNode node, String... fieldNames) {
        if (node == null || !node.isObject()) return null;
        for (String fieldName : fieldNames) {
            JsonNode value = node.get(fieldName);
            if (value != null && value.isValueNode()) {
                return value.asText();
            }
        }
        return null;
    }

    private Object toJsonValue(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isObject()) return new JsonObject(node.toString());
        if (node.isArray()) return new JsonArray(node.toString());
        if (node.isTextual()) return node.asText();
        if (node.isNumber()) return node.numberValue();
        if (node.isBoolean()) return node.asBoolean();
        return node.toString();
    }
}
