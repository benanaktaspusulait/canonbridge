package com.canonbridge.mock.model.webhook;

import java.time.Instant;
import java.util.Map;

public record WebhookEvent(
        String id,
        String type,
        Map<String, Object> payload,
        Instant receivedAt
) {}
