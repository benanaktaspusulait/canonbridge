package com.canonbridge.mock.controller;

import com.canonbridge.mock.model.webhook.WebhookEvent;
import com.canonbridge.mock.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/payment")
    public ResponseEntity<Map<String, String>> receivePaymentWebhook(@RequestBody Map<String, Object> payload) {
        log.info("POST /webhook/payment - Received payment webhook");
        
        webhookService.storeWebhook("payment", payload);
        
        return ResponseEntity.ok(Map.of(
                "status", "received",
                "message", "Payment webhook processed successfully"
        ));
    }

    @GetMapping("/webhooks")
    public ResponseEntity<List<WebhookEvent>> listWebhooks(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /webhooks - type: {}, limit: {}", type, limit);
        
        return ResponseEntity.ok(webhookService.getWebhooks(type, limit));
    }

    @DeleteMapping("/webhooks")
    public ResponseEntity<Map<String, String>> clearWebhooks() {
        log.info("DELETE /webhooks - Clearing all webhooks");
        
        webhookService.clearWebhooks();
        
        return ResponseEntity.ok(Map.of(
                "status", "cleared",
                "message", "All webhooks cleared successfully"
        ));
    }
}
