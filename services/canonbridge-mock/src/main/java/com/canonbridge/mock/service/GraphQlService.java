package com.canonbridge.mock.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class GraphQlService {

    public Map<String, Object> execute(Map<String, Object> request) {
        String query = request == null ? "" : String.valueOf(request.getOrDefault("query", ""));
        Map<String, Object> variables = request == null ? Map.of() : asMap(request.get("variables"));

        if (query.contains("customer")) {
            String customerId = String.valueOf(variables.getOrDefault("customerId", "CUST-1001"));
            return Map.of("data", Map.of("customer", customer(customerId)));
        }

        if (query.contains("inventory")) {
            String sku = String.valueOf(variables.getOrDefault("sku", "SKU-LAPTOP-001"));
            return Map.of("data", Map.of("inventory", inventory(sku)));
        }

        return Map.of("data", Map.of(
                "customer", customer("CUST-1001"),
                "inventory", inventory("SKU-LAPTOP-001")
        ));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    private Map<String, Object> customer(String customerId) {
        return Map.of(
                "id", customerId,
                "name", "Jane Smith",
                "email", "jane.smith@example.com",
                "tier", "GOLD",
                "marketingOptIn", true,
                "updatedAt", Instant.now().toString()
        );
    }

    private Map<String, Object> inventory(String sku) {
        return Map.of(
                "sku", sku,
                "available", 42,
                "reserved", 5,
                "warehouses", List.of(
                        Map.of("code", "LON-01", "available", 30),
                        Map.of("code", "MAN-02", "available", 12)
                ),
                "updatedAt", Instant.now().toString()
        );
    }
}
