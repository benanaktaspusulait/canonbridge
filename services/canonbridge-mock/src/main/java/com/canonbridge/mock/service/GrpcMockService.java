package com.canonbridge.mock.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class GrpcMockService {

    public Map<String, Object> getCustomer(Map<String, Object> request) {
        String customerId = request == null
                ? "CUST-GRPC-1001"
                : String.valueOf(request.getOrDefault("customerId", "CUST-GRPC-1001"));

        return Map.of(
                "customerId", customerId,
                "displayName", "Ada Lovelace",
                "email", "ada.lovelace@example.com",
                "loyaltyTier", "PLATINUM",
                "riskScore", 0.08,
                "updatedAt", Instant.now().toString()
        );
    }

    public Map<String, Object> listCustomerEvents(Map<String, Object> request) {
        String customerId = request == null
                ? "CUST-GRPC-1001"
                : String.valueOf(request.getOrDefault("customerId", "CUST-GRPC-1001"));

        return Map.of(
                "customerId", customerId,
                "events", List.of(
                        Map.of("eventId", "EVT-GRPC-001", "type", "CUSTOMER_CREATED", "occurredAt", Instant.now().minusSeconds(86400).toString()),
                        Map.of("eventId", "EVT-GRPC-002", "type", "PROFILE_UPDATED", "occurredAt", Instant.now().minusSeconds(3600).toString())
                )
        );
    }
}
