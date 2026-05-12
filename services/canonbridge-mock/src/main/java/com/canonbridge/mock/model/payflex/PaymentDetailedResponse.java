package com.canonbridge.mock.model.payflex;

import java.time.Instant;
import java.util.List;

public record PaymentDetailedResponse(
        Payment payment,
        Merchant merchant,
        Payer payer,
        Beneficiary beneficiary,
        Risk risk,
        Settlement settlement,
        Metadata metadata
) {
    public record Payment(
            String id,
            Amount amount,
            String status,
            String type,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record Amount(
            Double value,
            String currency
    ) {}

    public record Merchant(
            String id,
            String name,
            String category,
            String reference
    ) {}

    public record Payer(
            String name,
            Account account,
            String email,
            String phone
    ) {}

    public record Beneficiary(
            String name,
            Account account,
            String bankCode
    ) {}

    public record Account(
            String iban,
            String accountNumber,
            String bankName
    ) {}

    public record Risk(
            Double score,
            String level,
            List<String> flags
    ) {}

    public record Settlement(
            String expectedDate,
            String status,
            String batchId
    ) {}

    public record Metadata(
            String correlationId,
            String traceId,
            String source,
            Instant timestamp
    ) {}
}
