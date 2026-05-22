package com.canonbridge.mock.service;

import com.canonbridge.mock.config.MockConfiguration;
import com.canonbridge.mock.model.webhook.WebhookEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WebhookService {

    private final Deque<WebhookEvent> webhookStore = new ConcurrentLinkedDeque<>();
    private static final int MAX_STORED_WEBHOOKS = 100;

    private final Path storageDir;
    private final ObjectMapper objectMapper;

    public WebhookService(MockConfiguration mockConfig) {
        this.storageDir = Path.of(mockConfig.getWebhook().getStorageDir());
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        try {
            Files.createDirectories(storageDir);
            log.info("Webhook storage directory: {}", storageDir);
        } catch (IOException e) {
            log.warn("Could not create webhook storage directory {}: {}", storageDir, e.getMessage());
        }
    }

    public void storeWebhook(String type, Map<String, Object> payload) {
        var event = new WebhookEvent(
                UUID.randomUUID().toString(),
                type,
                new HashMap<>(payload),
                Instant.now()
        );

        webhookStore.addFirst(event);
        while (webhookStore.size() > MAX_STORED_WEBHOOKS) {
            webhookStore.removeLast();
        }

        persistToDisk(event);
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

    private void persistToDisk(WebhookEvent event) {
        try {
            // CM-V1-H2 FIX: Replace all filesystem-unsafe characters
            String safeTs = event.receivedAt().toString().replace(':', '-').replace('.', '-');
            String filename = safeTs + "_" + event.type() + "_" + event.id() + ".json";
            Path file = storageDir.resolve(filename);
            Files.writeString(file, objectMapper.writeValueAsString(event));
        } catch (IOException e) {
            log.warn("Could not persist webhook to disk: {}", e.getMessage());
        }
    }
}
