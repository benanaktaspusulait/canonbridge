package com.canonbridge.billing.api;

import com.canonbridge.billing.service.InvoiceService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
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
    public Uni<Response> getById(@PathParam("id") UUID id) {
        return invoiceService.getById(id)
            .map(invoice -> {
                if (invoice.isEmpty()) return Response.status(404).build();
                return Response.ok(invoice).build();
            });
    }

    @POST
    @Path("/generate")
    @Operation(summary = "Trigger monthly invoice generation (admin)")
    public Uni<Response> generate() {
        return invoiceService.generateMonthlyInvoices()
            .map(count -> Response.ok(new GenerateResult(count)).build());
    }

    public record GenerateResult(long invoicesGenerated) {}
}
