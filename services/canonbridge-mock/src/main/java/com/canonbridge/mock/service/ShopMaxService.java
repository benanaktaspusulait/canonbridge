package com.canonbridge.mock.service;

import com.canonbridge.mock.model.shopmax.OrderCompactResponse;
import com.canonbridge.mock.model.shopmax.OrderDetailedResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ShopMaxService {

    public List<OrderDetailedResponse> getRecentOrdersDetailed() {
        var now = Instant.now();
        
        var order = new OrderDetailedResponse(
                new OrderDetailedResponse.Order(
                        "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        "CONFIRMED",
                        now.minusSeconds(7200),
                        now
                ),
                new OrderDetailedResponse.Marketplace(
                        "SHOPMAX-EU",
                        "ShopMax Europe",
                        "EU-WEST"
                ),
                new OrderDetailedResponse.Buyer(
                        "BUYER-98765",
                        "Jane Smith",
                        "jane.smith@example.com",
                        "+44207123456"
                ),
                new OrderDetailedResponse.Address(
                        "123 Oxford Street",
                        "London",
                        "Greater London",
                        "W1D 1BS",
                        "GB"
                ),
                new OrderDetailedResponse.Address(
                        "456 Baker Street",
                        "London",
                        "Greater London",
                        "NW1 6XE",
                        "GB"
                ),
                List.of(
                        new OrderDetailedResponse.LineItem(
                                "SKU-LAPTOP-001",
                                "Premium Laptop 15 inch",
                                1,
                                new OrderDetailedResponse.Price(899.99, "GBP"),
                                new OrderDetailedResponse.Price(899.99, "GBP"),
                                new OrderDetailedResponse.Discount("PERCENTAGE", 50.0, "SPRING10"),
                                new OrderDetailedResponse.Tax("VAT", 0.20, 169.99)
                        ),
                        new OrderDetailedResponse.LineItem(
                                "SKU-MOUSE-002",
                                "Wireless Mouse",
                                2,
                                new OrderDetailedResponse.Price(29.99, "GBP"),
                                new OrderDetailedResponse.Price(59.98, "GBP"),
                                null,
                                new OrderDetailedResponse.Tax("VAT", 0.20, 11.99)
                        )
                ),
                new OrderDetailedResponse.Payment(
                        new OrderDetailedResponse.Price(959.97, "GBP"),
                        new OrderDetailedResponse.Price(50.0, "GBP"),
                        new OrderDetailedResponse.Price(181.98, "GBP"),
                        new OrderDetailedResponse.Price(9.99, "GBP"),
                        new OrderDetailedResponse.Price(1101.94, "GBP"),
                        "CREDIT_CARD",
                        "PAID"
                ),
                new OrderDetailedResponse.Fulfillment(
                        "STANDARD_SHIPPING",
                        "Royal Mail",
                        "RM123456789GB",
                        now.plusSeconds(259200).toString(),
                        "3_DAYS"
                ),
                new OrderDetailedResponse.Metadata(
                        UUID.randomUUID().toString(),
                        "SHOPMAX_API",
                        now
                )
        );

        return List.of(order);
    }

    public List<OrderCompactResponse> getRecentOrdersCompact() {
        var now = Instant.now();
        
        var order = new OrderCompactResponse(
                "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "Jane Smith",
                "456 Baker Street, London, NW1 6XE, GB",
                List.of(
                        new OrderCompactResponse.CompactLine("SKU-LAPTOP-001", 1, 899.99),
                        new OrderCompactResponse.CompactLine("SKU-MOUSE-002", 2, 29.99)
                ),
                1101.94,
                "GBP",
                now.toString(),
                "CONFIRMED"
        );

        return List.of(order);
    }

    public OrderDetailedResponse getOrderDetailed(String orderId) {
        OrderDetailedResponse order = getRecentOrdersDetailed().getFirst();
        return withOrderId(order, orderId);
    }

    public OrderCompactResponse getOrderCompact(String orderId) {
        OrderCompactResponse order = getRecentOrdersCompact().getFirst();
        return new OrderCompactResponse(
                orderId,
                order.buyer(),
                order.ship_to(),
                order.lines(),
                order.gross(),
                order.cur(),
                order.ts(),
                order.status()
        );
    }

    public Map<String, Object> createOrder(Map<String, Object> orderRequest) {
        var orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        var response = new LinkedHashMap<String, Object>();
        response.put("id", orderId);
        response.put("status", "CONFIRMED");
        response.put("createdAt", Instant.now().toString());
        response.put("source", "SHOPMAX_API");
        response.put("request", orderRequest == null ? Map.of() : orderRequest);
        return response;
    }

    public List<Map<String, Object>> getProducts() {
        return List.of(
                Map.of(
                        "sku", "SKU-LAPTOP-001",
                        "name", "Premium Laptop 15 inch",
                        "category", "Electronics",
                        "price", Map.of("amount", 899.99, "currency", "GBP"),
                        "stock", 42
                ),
                Map.of(
                        "sku", "SKU-MOUSE-002",
                        "name", "Wireless Mouse",
                        "category", "Accessories",
                        "price", Map.of("amount", 29.99, "currency", "GBP"),
                        "stock", 280
                ),
                Map.of(
                        "sku", "SKU-DOCK-003",
                        "name", "USB-C Docking Station",
                        "category", "Accessories",
                        "price", Map.of("amount", 119.00, "currency", "GBP"),
                        "stock", 65
                )
        );
    }

    private OrderDetailedResponse withOrderId(OrderDetailedResponse response, String orderId) {
        return new OrderDetailedResponse(
                new OrderDetailedResponse.Order(
                        orderId,
                        response.order().status(),
                        response.order().createdAt(),
                        response.order().updatedAt()
                ),
                response.marketplace(),
                response.buyer(),
                response.billingAddress(),
                response.shippingAddress(),
                response.lineItems(),
                response.payment(),
                response.fulfillment(),
                response.metadata()
        );
    }
}
