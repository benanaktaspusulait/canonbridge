package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.Plan;
import com.canonbridge.mappingstudio.domain.PlanFeature;
import com.canonbridge.mappingstudio.repository.PlanRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/plans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Plans", description = "Pricing plan information (public)")
public class PlanResource {

    @Inject
    PlanRepository planRepository;

    @GET
    @jakarta.annotation.security.PermitAll
    @Operation(summary = "List all public pricing plans")
    public Uni<List<Plan>> listPublicPlans() {
        return planRepository.findAllPublic()
            .flatMap(plans -> {
                // Attach features to each plan
                List<Uni<Plan>> enriched = plans.stream()
                    .map(plan -> planRepository.findFeaturesByPlanId(plan.getId())
                        .map(features -> {
                            plan.setFeatures(features);
                            return plan;
                        }))
                    .toList();
                return Uni.join().all(enriched).andFailFast();
            });
    }

    @GET
    @Path("/{code}")
    @jakarta.annotation.security.PermitAll
    @Operation(summary = "Get plan details by code")
    public Uni<Response> getByCode(@PathParam("code") String code) {
        return planRepository.findByCode(code)
            .flatMap(plan -> {
                if (plan == null) {
                    return Uni.createFrom().item(Response.status(Response.Status.NOT_FOUND).build());
                }
                return planRepository.findFeaturesByPlanId(plan.getId())
                    .map(features -> {
                        plan.setFeatures(features);
                        return Response.ok(plan).build();
                    });
            });
    }

    @GET
    @Path("/{code}/features")
    @jakarta.annotation.security.PermitAll
    @Operation(summary = "Get plan features/limits by plan code")
    public Uni<Response> getFeatures(@PathParam("code") String code) {
        return planRepository.findFeaturesByPlanCode(code)
            .map(features -> {
                if (features.isEmpty()) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(features).build();
            });
    }
}
