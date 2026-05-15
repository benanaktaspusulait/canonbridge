package com.canonbridge.mock.controller;

import com.canonbridge.mock.config.MockConfiguration;
import com.canonbridge.mock.model.webhook.WebhookEvent;
import com.canonbridge.mock.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private static final String WEBHOOK_KEY_HEADER = "X-Webhook-Key";

    private final MockConfiguration mockConfig;
    private final WebhookService webhookService;

    @PostMapping("/webhook/payment")
    public ResponseEntity<Map<String, String>> receivePaymentWebhook(
            @RequestHeader(value = WEBHOOK_KEY_HEADER, required = false) String webhookKey,
            @RequestBody Map<String, Object> payload) {
        log.info("POST /webhook/payment - Received payment webhook");

        if (!isValidWebhookKey(webhookKey)) {
            return unauthorized();
        }
        
        webhookService.storeWebhook("payment", payload);
        
        return ResponseEntity.ok(Map.of(
                "status", "received",
                "message", "Payment webhook processed successfully"
        ));
    }

    @GetMapping("/webhooks")
    public ResponseEntity<?> listWebhooks(
            @RequestHeader(value = WEBHOOK_KEY_HEADER, required = false) String webhookKey,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /webhooks - type: {}, limit: {}", type, limit);

        if (!isValidWebhookKey(webhookKey)) {
            return unauthorized();
        }
        
        return ResponseEntity.ok(webhookService.getWebhooks(type, limit));
    }

    @DeleteMapping("/webhooks")
    public ResponseEntity<Map<String, String>> clearWebhooks(
            @RequestHeader(value = WEBHOOK_KEY_HEADER, required = false) String webhookKey) {
        log.info("DELETE /webhooks - Clearing all webhooks");

        if (!isValidWebhookKey(webhookKey)) {
            return unauthorized();
        }
        
        webhookService.clearWebhooks();
        
        return ResponseEntity.ok(Map.of(
                "status", "cleared",
                "message", "All webhooks cleared successfully"
        ));
    }

    private boolean isValidWebhookKey(String webhookKey) {
        return mockConfig.getWebhook().getApiKey().equals(webhookKey);
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "Invalid or missing webhook key",
                        "hint", "Send X-Webhook-Key before using this mock endpoint"
                ));
    }
}
