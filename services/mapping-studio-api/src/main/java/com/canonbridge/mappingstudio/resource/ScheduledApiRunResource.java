package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.MappingDraft;
import com.canonbridge.mappingstudio.repository.MappingDraftRepository;
import com.canonbridge.mappingstudio.repository.ScheduledApiRunRepository;
import com.canonbridge.mappingstudio.security.TenantContext;
import com.canonbridge.mappingstudio.service.ScheduledApiPollerService;
import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.Instant;
import java.util.UUID;

@Path("/api/mapping-drafts/{id}/scheduled-runs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Scheduled API Runs", description = "Scheduled API polling state and run history")
public class ScheduledApiRunResource {

    @Inject
    TenantContext tenantContext;

    @Inject
    MappingDraftRepository draftRepository;

    @Inject
    ScheduledApiRunRepository scheduledApiRunRepository;

    @Inject
    ScheduledApiPollerService scheduledApiPollerService;

    @GET
    @Path("/status")
    @Operation(summary = "Get current scheduled API polling status for a mapping")
    public Uni<Response> getStatus(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID mappingId) {
        String requiredTenantId = tenantContext.requireTenantId(tenantId);

        return scheduledDraft(requiredTenantId, mappingId)
                .chain(draft -> scheduledApiRunRepository.findSummary(requiredTenantId, mappingId)
                        .map(summary -> Response.ok(new JsonObject()
                                .put("mappingId", mappingId.toString())
                                .put("schedule", scheduleContract(draft))
                                .put("state", summary != null ? summary : idleState(requiredTenantId, mappingId)))
                                .build()))
                .onFailure(WebApplicationProblem.class)
                .recoverWithItem(error -> ((WebApplicationProblem) error).response());
    }

    @GET
    @Path("/history")
    @Operation(summary = "List scheduled API run history for a mapping")
    public Uni<Response> listHistory(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID mappingId,
            @QueryParam("limit") @DefaultValue("50") int limit,
            @QueryParam("offset") @DefaultValue("0") int offset,
            @QueryParam("status") String status) {
        String requiredTenantId = tenantContext.requireTenantId(tenantId);

        return scheduledDraft(requiredTenantId, mappingId)
                .chain(draft -> scheduledApiRunRepository.listHistory(requiredTenantId, mappingId, limit, offset, status)
                        .map(history -> Response.ok(new JsonObject()
                                .put("mappingId", mappingId.toString())
                                .put("schedule", scheduleContract(draft))
                                .put("history", new JsonArray(history))
                                .put("limit", Math.max(1, Math.min(limit, 200)))
                                .put("offset", Math.max(0, offset)))
                                .build()))
                .onFailure(WebApplicationProblem.class)
                .recoverWithItem(error -> ((WebApplicationProblem) error).response());
    }

    @GET
    @Path("/history/{runId}")
    @Operation(summary = "Get scheduled API run detail")
    public Uni<Response> getHistoryRun(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @PathParam("id") UUID mappingId,
            @PathParam("runId") UUID runId) {
        String requiredTenantId = tenantContext.requireTenantId(tenantId);

        return scheduledDraft(requiredTenantId, mappingId)
                .chain(draft -> scheduledApiRunRepository.findHistoryRun(requiredTenantId, mappingId, runId)
                        .map(run -> {
                            if (run == null) {
                                return Response.status(Response.Status.NOT_FOUND)
                                        .entity(new JsonObject().put("error", "Scheduled API run not found"))
                                        .build();
                            }
                            return Response.ok(new JsonObject()
                                    .put("mappingId", mappingId.toString())
                                    .put("schedule", scheduleContract(draft))
                                    .put("run", run))
                                    .build();
                        }))
                .onFailure(WebApplicationProblem.class)
                .recoverWithItem(error -> ((WebApplicationProblem) error).response());
    }

    private Uni<MappingDraft> scheduledDraft(String tenantId, UUID mappingId) {
        return draftRepository.findById(tenantId, mappingId)
                .chain(draft -> {
                    if (draft == null) {
                        return Uni.createFrom().failure(new NotFoundProblem("Mapping draft not found"));
                    }
                    if (draft.getSourceType() != MappingDraft.SourceType.SCHEDULED_API) {
                        return Uni.createFrom().failure(new BadRequestProblem("Mapping is not a SCHEDULED_API source mapping"));
                    }
                    return Uni.createFrom().item(draft);
                })
                .onFailure(NotFoundProblem.class).recoverWithUni(error ->
                        Uni.createFrom().failure(new WebApplicationProblem(Response.Status.NOT_FOUND, error.getMessage())))
                .onFailure(BadRequestProblem.class).recoverWithUni(error ->
                        Uni.createFrom().failure(new WebApplicationProblem(Response.Status.BAD_REQUEST, error.getMessage())));
    }

    private JsonObject scheduleContract(MappingDraft draft) {
        JsonObject sourceConfig = parseSourceConfig(draft);
        String schedule = sourceConfig.getString("schedule");
        Instant now = Instant.now();
        return new JsonObject()
                .put("expression", schedule)
                .put("description", scheduledApiPollerService.scheduleDescription(schedule))
                .put("nextRunPreviewAt", scheduledApiPollerService.nextRunAfter(schedule, now).toString())
                .put("timezone", "UTC")
                .put("supportedFormats", new JsonArray()
                        .add("ISO-8601 durations, for example PT15M")
                        .add("short intervals, for example 15m, 1h, 1d")
                        .add("5-field cron: minute hour day-of-month month day-of-week")
                        .add("6-field cron with seconds: second minute hour day-of-month month day-of-week"));
    }

    private JsonObject idleState(String tenantId, UUID mappingId) {
        return new JsonObject()
                .put("tenantId", tenantId)
                .put("draftId", mappingId.toString())
                .put("status", "IDLE")
                .put("attemptCount", 0);
    }

    private JsonObject parseSourceConfig(MappingDraft mapping) {
        try {
            return mapping.getSourceConfig() != null && !mapping.getSourceConfig().isBlank()
                    ? new JsonObject(mapping.getSourceConfig())
                    : new JsonObject();
        } catch (Exception e) {
            return new JsonObject();
        }
    }

    public static class WebApplicationProblem extends RuntimeException {
        private final Response.Status status;

        WebApplicationProblem(Response.Status status, String message) {
            super(message);
            this.status = status;
        }

        Response response() {
            return Response.status(status).entity(new JsonObject().put("error", getMessage())).build();
        }
    }

    private static class NotFoundProblem extends RuntimeException {
        NotFoundProblem(String message) {
            super(message);
        }
    }

    private static class BadRequestProblem extends RuntimeException {
        BadRequestProblem(String message) {
            super(message);
        }
    }
}
