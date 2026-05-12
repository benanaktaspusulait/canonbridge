package com.canonbridge.mock.model.shopmax;

import java.time.Instant;
import java.util.List;

public record OrderDetailedResponse(
        Order order,
        Marketplace marketplace,
        Buyer buyer,
        Address billingAddress,
        Address shippingAddress,
        List<LineItem> lineItems,
        Payment payment,
        Fulfillment fulfillment,
        Metadata metadata
) {
    public record Order(
            String id,
            String status,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record Marketplace(
            String id,
            String name,
            String region
    ) {}

    public record Buyer(
            String id,
            String name,
            String email,
            String phone
    ) {}

    public record Address(
            String street,
            String city,
            String state,
            String postalCode,
            String country
    ) {}

    public record LineItem(
            String sku,
            String productName,
            int quantity,
            Price unitPrice,
            Price totalPrice,
            Discount discount,
            Tax tax
    ) {}

    public record Price(
            Double amount,
            String currency
    ) {}

    public record Discount(
            String type,
            Double amount,
            String code
    ) {}

    public record Tax(
            String type,
            Double rate,
            Double amount
    ) {}

    public record Payment(
            Price subtotal,
            Price totalDiscount,
            Price totalTax,
            Price shippingCost,
            Price grandTotal,
            String method,
            String status
    ) {}

    public record Fulfillment(
            String method,
            String carrier,
            String trackingNumber,
            String estimatedDelivery,
            String sla
    ) {}

    public record Metadata(
            String correlationId,
            String source,
            Instant timestamp
    ) {}
}
