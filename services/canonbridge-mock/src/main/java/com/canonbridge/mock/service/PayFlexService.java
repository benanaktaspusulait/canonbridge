package com.canonbridge.mock.service;

import com.canonbridge.mock.model.payflex.PaymentDetailedResponse;
import com.canonbridge.mock.model.payflex.PaymentFlatResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PayFlexService {

    public PaymentDetailedResponse getLatestPaymentDetailed() {
        var now = Instant.now();
        
        return new PaymentDetailedResponse(
                new PaymentDetailedResponse.Payment(
                        "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        new PaymentDetailedResponse.Amount(1250.50, "EUR"),
                        "COMPLETED",
                        "INSTANT_TRANSFER",
                        now.minusSeconds(3600),
                        now
                ),
                new PaymentDetailedResponse.Merchant(
                        "MERCH-12345",
                        "TechStore GmbH",
                        "ELECTRONICS",
                        "ORDER-2024-05-001"
                ),
                new PaymentDetailedResponse.Payer(
                        "John Doe",
                        new PaymentDetailedResponse.Account(
                                "DE89370400440532013000",
                                "532013000",
                                "Deutsche Bank"
                        ),
                        "john.doe@example.com",
                        "+49301234567"
                ),
                new PaymentDetailedResponse.Beneficiary(
                        "TechStore GmbH",
                        new PaymentDetailedResponse.Account(
                                "DE89370400440532099999",
                                "532099999",
                                "Commerzbank"
                        ),
                        "COBADEFF"
                ),
                new PaymentDetailedResponse.Risk(
                        0.15,
                        "LOW",
                        List.of("VERIFIED_ACCOUNT", "REGULAR_CUSTOMER")
                ),
                new PaymentDetailedResponse.Settlement(
                        now.plusSeconds(86400).toString(),
                        "PENDING",
                        "BATCH-2024-05-12-001"
                ),
                new PaymentDetailedResponse.Metadata(
                        UUID.randomUUID().toString(),
                        "TRACE-" + System.currentTimeMillis(),
                        "PAYFLEX_API",
                        now
                )
        );
    }

    public PaymentFlatResponse getLatestPaymentFlat() {
        var now = Instant.now();
        
        return new PaymentFlatResponse(
                "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                1250.50,
                "EUR",
                "DE89370400440532013000",
                "DE89370400440532099999",
                "ORDER-2024-05-001",
                now.toString(),
                "LOW",
                "COMPLETED",
                "John Doe",
                "TechStore GmbH",
                now.plusSeconds(86400).toString(),
                UUID.randomUUID().toString()
        );
    }

    public List<PaymentDetailedResponse> queryPayments(Map<String, Object> queryRequest) {
        // For demo purposes, return a list with one payment
        return List.of(getLatestPaymentDetailed());
    }
}
