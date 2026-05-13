package com.canonbridge.mock.controller;

import com.canonbridge.mock.config.MockConfiguration;
import com.canonbridge.mock.model.payflex.PaymentDetailedResponse;
import com.canonbridge.mock.model.payflex.PaymentFlatResponse;
import com.canonbridge.mock.service.PayFlexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PayFlexController {

    private final MockConfiguration mockConfig;
    private final PayFlexService payFlexService;

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestPayment(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String scenario) {

        log.info("GET /api/payments/latest - format: {}, scenario: {}", format, scenario);

        // Auth check
        if (!isValidApiKey(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or missing API key"));
        }

        // Handle scenarios
        if (scenario != null) {
            return handleScenario(scenario);
        }

        // Return format
        if ("flat".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(payFlexService.getLatestPaymentFlat());
        }

        return ResponseEntity.ok(payFlexService.getLatestPaymentDetailed());
    }

    @PostMapping("/query")
    public ResponseEntity<?> queryPayments(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @RequestParam(required = false) String scenario,
            @RequestBody(required = false) Map<String, Object> queryRequest) {

        log.info("POST /api/payments/query - scenario: {}", scenario);

        // Auth check
        if (!isValidApiKey(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or missing API key"));
        }

        // Handle scenarios
        if (scenario != null) {
            return handleScenario(scenario);
        }

        return ResponseEntity.ok(payFlexService.queryPayments(queryRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @PathVariable String id,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String scenario) {

        log.info("GET /api/payments/{} - format: {}, scenario: {}", id, format, scenario);

        if (!isValidApiKey(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or missing API key"));
        }

        if (scenario != null) {
            return handleScenario(scenario);
        }

        if ("flat".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(payFlexService.getPaymentFlat(id));
        }

        return ResponseEntity.ok(payFlexService.getPaymentDetailed(id));
    }

    private boolean isValidApiKey(String apiKey) {
        return mockConfig.getPayflex().getApiKey().equals(apiKey);
    }

    private ResponseEntity<?> handleScenario(String scenario) {
        return switch (scenario) {
            case "missing-amount" -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Validation failed",
                            "message", "Required field 'amount' is missing",
                            "field", "payment.amount.value"
                    ));
            case "server-error" -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal server error",
                            "message", "An unexpected error occurred"
                    ));
            case "bad-gateway" -> ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error", "Bad gateway",
                            "message", "The upstream payment processor returned an invalid response"
                    ));
            case "rate-limit" -> ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "error", "Rate limit exceeded",
                            "message", "Too many requests. Please try again later.",
                            "retryAfter", 60
                    ));
            case "timeout" -> {
                try {
                    Thread.sleep(12000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                yield ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                        .body(Map.of("error", "Request timeout"));
            }
            case "slow-2s" -> {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                yield ResponseEntity.ok(payFlexService.getLatestPaymentDetailed());
            }
            case "slow-5s" -> {
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                yield ResponseEntity.ok(payFlexService.getLatestPaymentDetailed());
            }
            case "unavailable" -> ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "error", "Service temporarily unavailable",
                            "message", "The PayFlex payment service is currently undergoing maintenance"
                    ));
            case "large-payload" -> ResponseEntity.ok(payFlexService.getLargePayload());
            case "deep-nested" -> ResponseEntity.ok(payFlexService.getDeepNestedPayload());
            case "special-characters" -> ResponseEntity.ok(payFlexService.getSpecialCharactersPayload());
            default -> ResponseEntity.ok(payFlexService.getLatestPaymentDetailed());
        };
    }
}
