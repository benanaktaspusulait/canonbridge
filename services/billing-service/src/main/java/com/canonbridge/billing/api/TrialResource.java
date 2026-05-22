package com.canonbridge.billing.api;

import com.canonbridge.billing.service.TrialService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;
import java.util.UUID;

@Path("/api/trial")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Trial", description = "Trial management")
public class TrialResource {

    @Inject
    TrialService trialService;

    @POST
    @Path("/{orgId}/start")
    @Operation(summary = "Start a 14-day Growth trial (no credit card required)")
    public Uni<Response> startTrial(@PathParam("orgId") UUID orgId) {
        return trialService.startTrial(orgId)
            .map(started -> {
                if (started) {
                    return Response.ok(Map.of("status", "trial_started", "days", 14, "plan", "growth")).build();
                }
                return Response.status(Response.Status.CONFLICT)
                    .entity(Map.of("error", "trial_already_used", "message", "This organization has already used a trial"))
                    .build();
            });
    }
}
