package com.canonbridge.mappingstudio.notification;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;

/**
 * PagerDuty Events API v2 notification channel.
 * 
 * Configuration:
 *   canonbridge.notifications.pagerduty.enabled=true
 *   canonbridge.notifications.pagerduty.routing-key=<integration-key>
 */
@ApplicationScoped
public class PagerDutyNotificationChannel implements NotificationChannel {

    private static final Logger LOG = Logger.getLogger(PagerDutyNotificationChannel.class);
    private static final String EVENTS_API_URL = "https://events.pagerduty.com/v2/enqueue";
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @ConfigProperty(name = "canonbridge.notifications.pagerduty.enabled", defaultValue = "false")
    boolean enabled;

    @ConfigProperty(name = "canonbridge.notifications.pagerduty.routing-key")
    Optional<String> routingKey;

    @Override
    public String channelId() {
        return "pagerduty";
    }

    @Override
    public boolean isEnabled() {
        return enabled && routingKey.isPresent() && !routingKey.get().isBlank();
    }

    @Override
    public Uni<Void> send(NotificationPayload notification) {
        if (!isEnabled()) {
            return Uni.createFrom().voidItem();
        }

        // Only trigger PagerDuty for CRITICAL and WARNING
        if (notification.severity() == NotificationPayload.Severity.INFO) {
            return Uni.createFrom().voidItem();
        }

        String severity = notification.severity() == NotificationPayload.Severity.CRITICAL ? "critical" : "warning";

        String payload = """
                {"routing_key":"%s","event_action":"trigger","payload":{"summary":"%s","severity":"%s","source":"%s","component":"canonbridge","group":"%s","custom_details":{"detail":"%s","tenant_id":"%s","timestamp":"%s"}}}"""
                .formatted(
                        escapeJson(routingKey.get()),
                        escapeJson(notification.title()),
                        severity,
                        escapeJson(notification.source()),
                        escapeJson(notification.tenantId()),
                        escapeJson(notification.detail()),
                        escapeJson(notification.tenantId()),
                        notification.timestamp().toString());

        return Uni.createFrom().completionStage(() -> {
            HttpRequest request = HttpRequest.newBuilder(URI.create(EVENTS_API_URL))
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();
            return HTTP_CLIENT.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        }).invoke(response -> {
            if (response.statusCode() != 202) {
                LOG.warnf("PagerDuty Events API returned %d: %s", response.statusCode(), response.body());
            }
        }).onFailure().invoke(error -> LOG.errorf(error, "Failed to send PagerDuty notification"))
          .onFailure().recoverWithNull()
          .replaceWithVoid();
    }

    private static String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
