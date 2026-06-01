package com.canonbridge.mock.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
public class AdditionalSystemsController {

    // [CM-M1] FIX: Use MockTokenService for consistent auth across all controllers
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.canonbridge.mock.auth.MockTokenService tokenService;

    @GetMapping("/inventorypro/items/{sku}")
    public ResponseEntity<?> getInventoryItem(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String sku) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        log.info("GET /api/inventorypro/items/{}", sku);
        return ResponseEntity.ok(inventoryItem(sku));
    }

    @GetMapping("/inventorypro/stock")
    public ResponseEntity<?> listInventoryStock(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "WH-LON-01") String warehouse) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        return ResponseEntity.ok(Map.of(
                "warehouseId", warehouse,
                "items", List.of(inventoryItem("SKU-1001"), inventoryItem("SKU-1002")),
                "generatedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/ticketdesk/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String ticketId) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        log.info("GET /api/ticketdesk/tickets/{}", ticketId);
        return ResponseEntity.ok(ticket(ticketId));
    }

    @GetMapping("/ticketdesk/tickets")
    public ResponseEntity<?> listTickets(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "OPEN") String status) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        return ResponseEntity.ok(Map.of(
                "status", status,
                "tickets", List.of(ticket("TCK-1001"), ticket("TCK-1002")),
                "hasMore", false
        ));
    }

    @GetMapping("/cloudbill/invoices/{invoiceId}")
    public ResponseEntity<?> getInvoice(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String invoiceId) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        log.info("GET /api/cloudbill/invoices/{}", invoiceId);
        return ResponseEntity.ok(invoice(invoiceId));
    }

    @GetMapping("/cloudbill/usage")
    public ResponseEntity<?> listUsage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "ACCT-9001") String accountId) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        return ResponseEntity.ok(Map.of(
                "accountId", accountId,
                "period", "2026-05",
                "usage", List.of(
                        Map.of("metric", "compute.hours", "quantity", 1420.5, "unit", "hour"),
                        Map.of("metric", "storage.gb", "quantity", 870.0, "unit", "GB")
                )
        ));
    }

    @GetMapping("/peopleops/employees/{employeeId}")
    public ResponseEntity<?> getEmployee(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String employeeId) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        log.info("GET /api/peopleops/employees/{}", employeeId);
        return ResponseEntity.ok(employee(employeeId));
    }

    @GetMapping("/peopleops/employees")
    public ResponseEntity<?> listEmployees(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "Engineering") String department) {
        ResponseEntity<?> authError = requireBearer(authorization);
        if (authError != null) {
            return authError;
        }

        return ResponseEntity.ok(Map.of(
                "department", department,
                "employees", List.of(employee("EMP-1001"), employee("EMP-1002")),
                "snapshotAt", Instant.now().toString()
        ));
    }

    private ResponseEntity<?> requireBearer(String authorization) {
        if (tokenService != null) {
            var validation = tokenService.validateBearer(authorization, "read:orders", "orders.read");
            if (!validation.valid()) {
                return ResponseEntity.status(validation.status())
                        .body(Map.of("error", validation.error(), "description", validation.description()));
            }
            return null;
        }
        // Fallback: accept any non-empty bearer (backward compat if tokenService not injected)
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.substring(7).isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authorization header with Bearer token is required"));
        }
        return null;
    }

    private Map<String, Object> inventoryItem(String sku) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("sku", sku);
        item.put("name", sku.endsWith("2") ? "Industrial Sensor Pack" : "Replacement Motor Assembly");
        item.put("category", "MRO");
        item.put("availableQuantity", sku.endsWith("2") ? 82 : 17);
        item.put("reservedQuantity", sku.endsWith("2") ? 8 : 4);
        item.put("warehouse", Map.of("id", "WH-LON-01", "city", "London", "country", "GB"));
        item.put("reorderPoint", 20);
        item.put("updatedAt", Instant.now().minus(15, ChronoUnit.MINUTES).toString());
        return item;
    }

    private Map<String, Object> ticket(String ticketId) {
        Map<String, Object> ticket = new LinkedHashMap<>();
        ticket.put("ticketId", ticketId);
        ticket.put("status", ticketId.endsWith("2") ? "PENDING_CUSTOMER" : "OPEN");
        ticket.put("priority", ticketId.endsWith("2") ? "MEDIUM" : "HIGH");
        ticket.put("subject", ticketId.endsWith("2") ? "Invoice export question" : "Webhook retries failing");
        ticket.put("customer", Map.of("id", "CUST-4421", "name", "Northstar Retail", "tier", "ENTERPRISE"));
        ticket.put("assignee", Map.of("id", "USR-19", "name", "Selin Kaya"));
        ticket.put("tags", List.of("integration", "partner-api"));
        ticket.put("updatedAt", Instant.now().minus(45, ChronoUnit.MINUTES).toString());
        return ticket;
    }

    private Map<String, Object> invoice(String invoiceId) {
        List<Map<String, Object>> lines = new ArrayList<>();
        lines.add(Map.of("sku", "CB-EVENTS", "description", "Processed events", "quantity", 125000, "amount", 875.0));
        lines.add(Map.of("sku", "CB-CONNECTORS", "description", "Active connectors", "quantity", 10, "amount", 300.0));

        Map<String, Object> invoice = new LinkedHashMap<>();
        invoice.put("invoiceId", invoiceId);
        invoice.put("accountId", "ACCT-9001");
        invoice.put("currency", "USD");
        invoice.put("status", "ISSUED");
        invoice.put("periodStart", "2026-05-01");
        invoice.put("periodEnd", "2026-05-31");
        invoice.put("lines", lines);
        invoice.put("totalAmount", 1175.0);
        invoice.put("dueDate", "2026-06-15");
        return invoice;
    }

    private Map<String, Object> employee(String employeeId) {
        Map<String, Object> employee = new LinkedHashMap<>();
        employee.put("employeeId", employeeId);
        employee.put("externalRef", "PO-" + employeeId);
        employee.put("firstName", employeeId.endsWith("2") ? "Maya" : "Deniz");
        employee.put("lastName", employeeId.endsWith("2") ? "Patel" : "Arslan");
        employee.put("email", employeeId.toLowerCase() + "@example.com");
        employee.put("department", "Engineering");
        employee.put("title", employeeId.endsWith("2") ? "Data Engineer" : "Integration Lead");
        employee.put("employmentStatus", "ACTIVE");
        employee.put("updatedAt", Instant.now().minus(1, ChronoUnit.HOURS).toString());
        return employee;
    }
}
