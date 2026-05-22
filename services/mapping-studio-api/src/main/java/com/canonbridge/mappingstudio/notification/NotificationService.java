package com.canonbridge.mappingstudio.notification;

import io.smallrye.mutiny.Uni;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;

/**
 * Notification dispatcher that broadcasts events to WebSocket clients
 * and dispatches alerts to all enabled external channels (Slack, PagerDuty, email).
 */
@ApplicationScoped
public class NotificationService {

    private static final Logger LOG = Logger.getLogger(NotificationService.class);

    @Inject
    NotificationSocket socket;

    @Inject
    Instance<NotificationChannel> channels;

    public void mappingPublished(String tenantId, String mappingId, String name, Integer version) {
        socket.broadcast(new JsonObject()
            .put("type", "mapping.published")
            .put("tenantId", tenantId)
            .put("mappingId", mappingId)
            .put("name", name)
            .put("version", version)
            .put("timestamp", Instant.now().toString())
            .encode());
    }

    public void alertFired(String tenantId, String severity, String title, String detail) {
        socket.broadcast(new JsonObject()
            .put("type", "alert.fired")
            .put("tenantId", tenantId)
            .put("severity", severity)
            .put("title", title)
            .put("detail", detail)
            .put("timestamp", Instant.now().toString())
            .encode());

        // Dispatch to external notification channels
        NotificationPayload.Severity parsedSeverity = parseSeverity(severity);
        NotificationPayload payload = new NotificationPayload(
                tenantId, parsedSeverity, title, detail, "alert", Instant.now());
        dispatchToChannels(payload);
    }

    /**
     * Send a notification to all enabled external channels (Slack, PagerDuty, email).
     */
    public void notify(NotificationPayload payload) {
        // Also broadcast to WebSocket
        socket.broadcast(new JsonObject()
            .put("type", "notification." + payload.severity().name().toLowerCase())
            .put("tenantId", payload.tenantId())
            .put("title", payload.title())
            .put("detail", payload.detail())
            .put("source", payload.source())
            .put("severity", payload.severity().name())
            .put("timestamp", payload.timestamp().toString())
            .encode());

        dispatchToChannels(payload);
    }

    private void dispatchToChannels(NotificationPayload payload) {
        for (NotificationChannel channel : channels) {
            if (channel.isEnabled()) {
                channel.send(payload)
                        .subscribe().with(
                                ignored -> LOG.debugf("Notification sent via %s", channel.channelId()),
                                error -> LOG.warnf("Failed to send notification via %s: %s",
                                        channel.channelId(), error.getMessage()));
            }
        }
    }

    private static NotificationPayload.Severity parseSeverity(String severity) {
        if (severity == null) return NotificationPayload.Severity.INFO;
        return switch (severity.toUpperCase()) {
            case "CRITICAL", "ERROR" -> NotificationPayload.Severity.CRITICAL;
            case "WARNING", "WARN" -> NotificationPayload.Severity.WARNING;
            default -> NotificationPayload.Severity.INFO;
        };
    }
}
