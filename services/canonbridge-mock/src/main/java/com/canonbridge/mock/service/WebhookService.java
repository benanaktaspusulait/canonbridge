package com.canonbridge.mock.service;

import com.canonbridge.mock.model.webhook.WebhookEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WebhookService {

    private final Deque<WebhookEvent> webhookStore = new ConcurrentLinkedDeque<>();
    private static final int MAX_STORED_WEBHOOKS = 100;

    public void storeWebhook(String type, Map<String, Object> payload) {
        var event = new WebhookEvent(
                UUID.randomUUID().toString(),
                type,
                new HashMap<>(payload),
                Instant.now()
        );

        webhookStore.addFirst(event);

        // Keep only the last MAX_STORED_WEBHOOKS
        while (webhookStore.size() > MAX_STORED_WEBHOOKS) {
            webhookStore.removeLast();
        }

        log.info("Stored webhook: type={}, id={}", type, event.id());
    }

    public List<WebhookEvent> getWebhooks(String type, int limit) {
        return webhookStore.stream()
                .filter(event -> type == null || type.equals(event.type()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public void clearWebhooks() {
        webhookStore.clear();
        log.info("Cleared all webhooks");
    }
}
