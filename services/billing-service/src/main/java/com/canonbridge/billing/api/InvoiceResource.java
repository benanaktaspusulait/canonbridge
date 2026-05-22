package com.canonbridge.billing.api;

import com.canonbridge.billing.service.InvoiceService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/invoices")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Invoices", description = "Invoice management")
public class InvoiceResource {

    @Inject
    InvoiceService invoiceService;

    @Inject
    io.vertx.mutiny.pgclient.PgPool pgPool;

    @GET
    @Path("/org/{orgId}")
    @Operation(summary = "List invoices for an organization")
    public Uni<Response> listByOrg(@PathParam("orgId") UUID orgId) {
        return invoiceService.listByOrgId(orgId)
            .map(invoices -> Response.ok(invoices).build());
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get invoice details with line items")
    public Uni<Response> getById(@PathParam("id") UUID id, @Context jakarta.ws.rs.core.SecurityContext securityContext) {
        // B-V1-H4 FIX: Verify the invoice belongs to the requesting org
        return invoiceService.getById(id)
            .map(invoice -> {
                if (invoice.isEmpty()) return Response.status(404).build();
                // Org authorization check
                String invoiceOrgId = (String) invoice.get("org_id");
                if (securityContext instanceof com.canonbridge.billing.security.BillingAuthenticationFilter.BillingSecurityContext bsc) {
                    if (bsc.getOrgId() != null && !bsc.getOrgId().equals(invoiceOrgId)) {
                        return Response.status(403).entity(java.util.Map.of("error", "forbidden", "message", "Invoice belongs to a different organization")).build();
                    }
                }
                return Response.ok(invoice).build();
            });
    }

    @POST
    @Path("/generate")
    @Operation(summary = "Trigger monthly invoice generation (admin only)")
    public Uni<Response> generate(@Context jakarta.ws.rs.core.SecurityContext securityContext) {
        // B-V1-M6 FIX: Require admin role
        if (securityContext instanceof com.canonbridge.billing.security.BillingAuthenticationFilter.BillingSecurityContext bsc) {
            if (!bsc.isUserInRole("admin") && !bsc.isUserInRole("service")) {
                return Uni.createFrom().item(Response.status(403).entity(java.util.Map.of("error", "forbidden", "message", "Admin role required")).build());
            }
        }
        return invoiceService.generateMonthlyInvoices()
            .map(count -> Response.ok(new GenerateResult(count)).build());
    }

    public record GenerateResult(long invoicesGenerated) {}
}
