package com.canonbridge.mock.controller;

import com.canonbridge.mock.auth.MockTokenService;
import com.canonbridge.mock.service.ShopMaxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class ShopMaxController {

    private final ShopMaxService shopMaxService;
    private final MockTokenService tokenService;

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String scenario) {

        log.info("GET /api/orders/recent - format: {}, scenario: {}", format, scenario);

        ResponseEntity<?> authError = validateBearer(authorization);
        if (authError != null) {
            return authError;
        }

        // Handle scenarios
        if (scenario != null) {
            return handleScenario(scenario);
        }

        // Return format
        if ("compact".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(shopMaxService.getRecentOrdersCompact());
        }

        return ResponseEntity.ok(shopMaxService.getRecentOrdersDetailed());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String id,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String scenario) {

        log.info("GET /api/orders/{} - format: {}, scenario: {}", id, format, scenario);

        ResponseEntity<?> authError = validateBearer(authorization);
        if (authError != null) {
            return authError;
        }

        if (scenario != null) {
            return handleScenario(scenario);
        }

        if ("compact".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(shopMaxService.getOrderCompact(id));
        }

        return ResponseEntity.ok(shopMaxService.getOrderDetailed(id));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) Map<String, Object> orderRequest,
            @RequestParam(required = false) String scenario) {

        log.info("POST /api/orders - scenario: {}", scenario);

        ResponseEntity<?> authError = validateBearer(authorization);
        if (authError != null) {
            return authError;
        }

        if (scenario != null) {
            return handleScenario(scenario);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(shopMaxService.createOrder(orderRequest));
    }

    @GetMapping("/products")
    public ResponseEntity<?> listProducts(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String scenario) {

        log.info("GET /api/orders/products - scenario: {}", scenario);

        ResponseEntity<?> authError = validateBearer(authorization);
        if (authError != null) {
            return authError;
        }

        if (scenario != null) {
            return handleScenario(scenario);
        }

        return ResponseEntity.ok(Map.of("products", shopMaxService.getProducts()));
    }

    private ResponseEntity<?> validateBearer(String authorization) {
        MockTokenService.BearerValidation validation = tokenService.validateBearer(authorization, "read:orders", "orders.read");
        if (validation.valid()) {
            return null;
        }

        return ResponseEntity.status(validation.status())
                .body(Map.of(
                        "error", validation.error(),
                        "error_description", validation.description(),
                        "hint", "Use POST /oauth/token with client_credentials before calling this API"
                ));
    }

    private ResponseEntity<?> handleScenario(String scenario) {
        return switch (scenario) {
            case "unavailable" -> ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "error", "Service temporarily unavailable",
                            "message", "The service is currently undergoing maintenance"
                    ));
            case "rate-limit" -> ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "error", "Rate limit exceeded",
                            "message", "Too many requests. Please try again later.",
                            "retryAfter", 60
                    ));
            case "slow-2s" -> {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                yield ResponseEntity.ok(shopMaxService.getRecentOrdersDetailed());
            }
            case "slow-5s" -> {
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                yield ResponseEntity.ok(shopMaxService.getRecentOrdersDetailed());
            }
            default -> ResponseEntity.ok(shopMaxService.getRecentOrdersDetailed());
        };
    }
}
