package com.canonbridge.mock.controller;

import com.canonbridge.mock.service.ShopMaxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class ShopMaxController {

    private final ShopMaxService shopMaxService;

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String scenario) {

        log.info("GET /api/orders/recent - format: {}, scenario: {}", format, scenario);

        // Auth check
        if (!isValidBearerToken(authorization)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or missing bearer token"));
        }

        if (isExpiredBearerToken(authorization)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "token_expired",
                            "error_description", "The access token has expired. Please obtain a new token.",
                            "hint", "Use POST /oauth/token to refresh your token"
                    ));
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

    private boolean isValidBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return false;
        }
        return authorization.length() > 7;
    }

    private boolean isExpiredBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return false;
        }
        String token = authorization.substring(7);
        return token.startsWith("expired_");
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
