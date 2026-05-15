package com.canonbridge.mock.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * FoodMarket Mock API - Simulates a food delivery/market order system.
 * 
 * GET /api/foodmarket/orders/{orderId} - Get order with items, categories, totals
 * 
 * Auth: Bearer token (any non-empty value accepted)
 * 
 * Response includes:
 * - Order metadata (id, status, timestamps)
 * - Customer info (name, address, phone, loyalty tier)
 * - Items array with category (FOOD/BEVERAGE/SNACK/DESSERT), unit price, quantity
 * - Payment breakdown (subtotal, tax, delivery fee, tip, discount, total)
 * - Delivery info (driver, ETA, distance)
 */
@RestController
@RequestMapping("/api/foodmarket")
@Slf4j
public class FoodMarketController {

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String orderId) {

        log.info("GET /api/foodmarket/orders/{}", orderId);

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authorization header with Bearer token is required"));
        }

        String token = authorization.substring(7).trim();
        if (token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid bearer token"));
        }

        return ResponseEntity.ok(generateOrderResponse(orderId));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false, defaultValue = "10") int limit,
            @RequestParam(required = false) String status) {

        log.info("GET /api/foodmarket/orders - limit: {}, status: {}", limit, status);

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authorization header with Bearer token is required"));
        }

        List<Map<String, Object>> orders = new ArrayList<>();
        for (int i = 0; i < Math.min(limit, 5); i++) {
            orders.add(generateOrderResponse("ORD-" + (1000 + i)));
        }
        return ResponseEntity.ok(Map.of(
                "orders", orders,
                "total", orders.size(),
                "hasMore", false
        ));
    }

    private Map<String, Object> generateOrderResponse(String orderId) {
        Instant now = Instant.now();
        Random rng = new Random(orderId.hashCode());

        // Items - mix of food and beverages
        List<Map<String, Object>> items = List.of(
                createItem("ITM-001", "Grilled Chicken Burger", "FOOD", 12.99, 2, "Main course, grilled chicken with lettuce and tomato"),
                createItem("ITM-002", "Caesar Salad", "FOOD", 8.50, 1, "Fresh romaine lettuce with caesar dressing"),
                createItem("ITM-003", "Coca-Cola 330ml", "BEVERAGE", 2.50, 3, "Chilled carbonated soft drink"),
                createItem("ITM-004", "Fresh Orange Juice", "BEVERAGE", 4.99, 1, "Freshly squeezed orange juice"),
                createItem("ITM-005", "Chocolate Brownie", "DESSERT", 6.50, 2, "Rich dark chocolate brownie with walnuts"),
                createItem("ITM-006", "Chips & Dip", "SNACK", 5.99, 1, "Tortilla chips with guacamole and salsa"),
                createItem("ITM-007", "Margherita Pizza (Large)", "FOOD", 15.99, 1, "Classic margherita with fresh mozzarella and basil"),
                createItem("ITM-008", "Sparkling Water 500ml", "BEVERAGE", 1.99, 2, "Natural mineral sparkling water")
        );

        // Calculate totals
        double subtotal = items.stream()
                .mapToDouble(i -> (double) i.get("unitPrice") * (int) i.get("quantity"))
                .sum();
        double taxRate = 0.08;
        double tax = Math.round(subtotal * taxRate * 100.0) / 100.0;
        double deliveryFee = 4.99;
        double tip = 3.50;
        double discount = 5.00;
        double total = subtotal + tax + deliveryFee + tip - discount;
        total = Math.round(total * 100.0) / 100.0;

        Map<String, Object> order = new LinkedHashMap<>();
        
        // Order metadata
        order.put("orderId", orderId);
        order.put("externalRef", "FM-" + UUID.nameUUIDFromBytes(orderId.getBytes()).toString().substring(0, 8).toUpperCase());
        order.put("status", "DELIVERED");
        order.put("createdAt", now.minus(2, ChronoUnit.HOURS).toString());
        order.put("updatedAt", now.minus(30, ChronoUnit.MINUTES).toString());
        order.put("deliveredAt", now.minus(25, ChronoUnit.MINUTES).toString());

        // Restaurant
        order.put("restaurant", Map.of(
                "id", "REST-456",
                "name", "Burger & Beyond",
                "category", "Fast Casual",
                "rating", 4.7,
                "address", Map.of(
                        "street", "42 High Street",
                        "city", "Istanbul",
                        "district", "Kadikoy",
                        "postalCode", "34710",
                        "country", "TR"
                )
        ));

        // Customer
        order.put("customer", Map.of(
                "id", "CUST-789",
                "firstName", "Ahmet",
                "lastName", "Yilmaz",
                "email", "ahmet.yilmaz@example.com",
                "phone", "+905321234567",
                "loyaltyTier", "GOLD",
                "totalOrders", 47,
                "memberSince", "2023-03-15",
                "address", Map.of(
                        "street", "Bagdat Caddesi No:123",
                        "city", "Istanbul",
                        "district", "Kadikoy",
                        "postalCode", "34728",
                        "country", "TR",
                        "notes", "3rd floor, ring bell twice"
                )
        ));

        // Items
        order.put("items", items);

        // Payment
        Map<String, Object> payment = new LinkedHashMap<>();
        payment.put("method", "CREDIT_CARD");
        payment.put("cardBrand", "Visa");
        payment.put("cardLast4", "4242");
        payment.put("currency", "TRY");
        payment.put("subtotal", subtotal);
        payment.put("taxRate", taxRate);
        payment.put("taxAmount", tax);
        payment.put("deliveryFee", deliveryFee);
        payment.put("tip", tip);
        payment.put("discount", discount);
        payment.put("discountCode", "WELCOME5");
        payment.put("total", total);
        payment.put("status", "CAPTURED");
        payment.put("paidAt", now.minus(2, ChronoUnit.HOURS).toString());
        order.put("payment", payment);

        // Delivery
        order.put("delivery", Map.of(
                "driver", Map.of(
                        "id", "DRV-321",
                        "name", "Mehmet K.",
                        "phone", "+905559876543",
                        "rating", 4.9,
                        "vehicleType", "MOTORCYCLE"
                ),
                "distance", Map.of(
                        "value", 3.2,
                        "unit", "km"
                ),
                "estimatedMinutes", 25,
                "actualMinutes", 22,
                "status", "COMPLETED",
                "trackingUrl", "https://track.foodmarket.com/delivery/" + orderId
        ));

        // Ratings
        order.put("ratings", Map.of(
                "food", 5,
                "delivery", 4,
                "overall", 4.5,
                "comment", "Great food, slightly late delivery but driver was friendly"
        ));

        return order;
    }

    private Map<String, Object> createItem(String id, String name, String category, double unitPrice, int quantity, String description) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("itemId", id);
        item.put("name", name);
        item.put("category", category);
        item.put("description", description);
        item.put("unitPrice", unitPrice);
        item.put("quantity", quantity);
        item.put("totalPrice", Math.round(unitPrice * quantity * 100.0) / 100.0);
        item.put("options", category.equals("FOOD") ? List.of(
                Map.of("name", "Extra sauce", "price", 0.50),
                Map.of("name", "No onions", "price", 0.0)
        ) : List.of());
        return item;
    }
}
