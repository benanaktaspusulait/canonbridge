package com.canonbridge.mappingstudio.resource;

import com.canonbridge.mappingstudio.domain.OrgMember;
import com.canonbridge.mappingstudio.domain.Organization;
import com.canonbridge.mappingstudio.repository.OrgMemberRepository;
import com.canonbridge.mappingstudio.repository.OrganizationRepository;
import com.canonbridge.mappingstudio.repository.PlanRepository;
import com.canonbridge.mappingstudio.repository.SubscriptionRepository;
import com.canonbridge.mappingstudio.domain.Subscription;
import com.canonbridge.mappingstudio.security.TenantContext;
import io.smallrye.mutiny.Uni;
import io.vertx.pgclient.PgException;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/organizations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Organizations", description = "Organization and team management")
@jakarta.annotation.security.RolesAllowed({"admin", "integration_author", "operator", "viewer"})
public class OrganizationResource {

    @Inject
    TenantContext tenantContext;

    @Inject
    OrganizationRepository organizationRepository;

    @Inject
    OrgMemberRepository orgMemberRepository;

    @Inject
    PlanRepository planRepository;

    @Inject
    SubscriptionRepository subscriptionRepository;

    @GET
    @Operation(summary = "List organizations for the current user")
    public Uni<List<Organization>> listForUser(@HeaderParam("X-User-Id") String userId) {
        if (userId == null || userId.isBlank()) {
            return Uni.createFrom().failure(new BadRequestException("X-User-Id header is required"));
        }
        return organizationRepository.findByUserId(UUID.fromString(userId));
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get organization by ID")
    public Uni<Response> getById(@PathParam("id") UUID id) {
        return organizationRepository.findById(id)
            .map(org -> {
                if (org == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(org).build();
            });
    }

    @POST
    @Operation(summary = "Create a new organization")
    @jakarta.annotation.security.RolesAllowed({"admin", "integration_author"})
    public Uni<Response> create(
            @HeaderParam("X-Tenant-Id") String tenantId,
            @HeaderParam("X-User-Id") String userId,
            @Valid Organization org) {
        tenantId = tenantContext.requireTenantId(tenantId);
        org.setTenantId(tenantId);

        if (userId != null && !userId.isBlank()) {
            org.setOwnerUserId(UUID.fromString(userId));
        }

        String finalTenantId = tenantId;
        return organizationRepository.create(org)
            .flatMap(created -> {
                // Add creator as owner
                if (userId != null && !userId.isBlank()) {
                    UUID uid = UUID.fromString(userId);
                    return orgMemberRepository.addMember(created.getId(), uid, OrgMember.OrgRole.OWNER, null)
                        .flatMap(member -> assignFreePlan(created.getId()))
                        .map(sub -> created);
                }
                return assignFreePlan(created.getId()).map(sub -> created);
            })
            .map(created -> Response.status(Response.Status.CREATED).entity(created).build())
            .onFailure(OrganizationResource::isUniqueConstraintViolation)
            .recoverWithItem(error -> Response.status(Response.Status.CONFLICT)
                .entity(new ErrorResponse("Organization slug already exists"))
                .build());
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update organization")
    @jakarta.annotation.security.RolesAllowed({"admin"})
    public Uni<Response> update(@PathParam("id") UUID id, @Valid Organization org) {
        org.setId(id);
        return organizationRepository.update(org)
            .map(updated -> {
                if (updated == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(updated).build();
            })
            .onFailure(OrganizationResource::isUniqueConstraintViolation)
            .recoverWithItem(error -> Response.status(Response.Status.CONFLICT)
                .entity(new ErrorResponse("Organization slug already exists"))
                .build());
    }

    // --- Members ---

    @GET
    @Path("/{orgId}/members")
    @Operation(summary = "List organization members")
    public Uni<List<OrgMember>> listMembers(@PathParam("orgId") UUID orgId) {
        return orgMemberRepository.findByOrgId(orgId);
    }

    @POST
    @Path("/{orgId}/members")
    @Operation(summary = "Add a member to the organization")
    @jakarta.annotation.security.RolesAllowed({"admin"})
    public Uni<Response> addMember(
            @PathParam("orgId") UUID orgId,
            @HeaderParam("X-User-Id") String invitedByStr,
            AddMemberRequest request) {
        UUID invitedBy = invitedByStr != null ? UUID.fromString(invitedByStr) : null;
        OrgMember.OrgRole role = request.role() != null
            ? OrgMember.OrgRole.fromDbValue(request.role())
            : OrgMember.OrgRole.MEMBER;

        return orgMemberRepository.addMember(orgId, request.userId(), role, invitedBy)
            .map(member -> Response.status(Response.Status.CREATED).entity(member).build())
            .onFailure(OrganizationResource::isUniqueConstraintViolation)
            .recoverWithItem(error -> Response.status(Response.Status.CONFLICT)
                .entity(new ErrorResponse("User is already a member of this organization"))
                .build());
    }

    @DELETE
    @Path("/{orgId}/members/{userId}")
    @Operation(summary = "Remove a member from the organization")
    @jakarta.annotation.security.RolesAllowed({"admin"})
    public Uni<Response> removeMember(@PathParam("orgId") UUID orgId, @PathParam("userId") UUID userId) {
        return orgMemberRepository.removeMember(orgId, userId)
            .map(removed -> {
                if (!removed) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.noContent().build();
            });
    }

    // --- Subscription ---

    @GET
    @Path("/{orgId}/subscription")
    @Operation(summary = "Get organization subscription")
    public Uni<Response> getSubscription(@PathParam("orgId") UUID orgId) {
        return subscriptionRepository.findByOrgId(orgId)
            .map(sub -> {
                if (sub == null) {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
                return Response.ok(sub).build();
            });
    }

    // --- Helpers ---

    private Uni<Subscription> assignFreePlan(UUID orgId) {
        return planRepository.findByCode("free")
            .flatMap(freePlan -> {
                if (freePlan == null) {
                    return Uni.createFrom().nullItem();
                }
                Subscription sub = new Subscription();
                sub.setOrgId(orgId);
                sub.setPlanId(freePlan.getId());
                sub.setStatus(Subscription.SubscriptionStatus.ACTIVE);
                sub.setBillingCycle(Subscription.BillingCycle.MONTHLY);
                return subscriptionRepository.create(sub);
            });
    }

    private static boolean isUniqueConstraintViolation(Throwable error) {
        return error instanceof PgException pgException
                && "23505".equals(pgException.getSqlState());
    }

    public record ErrorResponse(String message) {}
    public record AddMemberRequest(UUID userId, String role) {}
}
