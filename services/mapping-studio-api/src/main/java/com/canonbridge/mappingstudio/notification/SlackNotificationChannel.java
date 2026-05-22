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
 * Slack webhook notification channel.
 * 
 * Configuration:
 *   canonbridge.notifications.slack.enabled=true
 *   canonbridge.notifications.slack.webhook-url=https://hooks.slack.com/services/...
 *   canonbridge.notifications.slack.channel=#alerts
 */
@ApplicationScoped
public class SlackNotificationChannel implements NotificationChannel {

    private static final Logger LOG = Logger.getLogger(SlackNotificationChannel.class);
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @ConfigProperty(name = "canonbridge.notifications.slack.enabled", defaultValue = "false")
    boolean enabled;

    @ConfigProperty(name = "canonbridge.notifications.slack.webhook-url")
    Optional<String> webhookUrl;

    @ConfigProperty(name = "canonbridge.notifications.slack.channel", defaultValue = "#alerts")
    String channel;

    @Override
    public String channelId() {
        return "slack";
    }

    @Override
    public boolean isEnabled() {
        return enabled && webhookUrl.isPresent() && !webhookUrl.get().isBlank();
    }

    @Override
    public Uni<Void> send(NotificationPayload notification) {
        if (!isEnabled()) {
            return Uni.createFrom().voidItem();
        }

        String emoji = switch (notification.severity()) {
            case CRITICAL -> ":rotating_light:";
            case WARNING -> ":warning:";
            case INFO -> ":information_source:";
        };

        String payload = """
                {"channel":"%s","username":"CanonBridge","icon_emoji":":bridge_at_night:","blocks":[{"type":"section","text":{"type":"mrkdwn","text":"%s *[%s]* %s\\n%s\\n_Tenant: %s | Source: %s_"}}]}"""
                .formatted(
                        escapeJson(channel),
                        emoji,
                        notification.severity().name(),
                        escapeJson(notification.title()),
                        escapeJson(notification.detail()),
                        escapeJson(notification.tenantId()),
                        escapeJson(notification.source()));

        return Uni.createFrom().completionStage(() -> {
            HttpRequest request = HttpRequest.newBuilder(URI.create(webhookUrl.get()))
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();
            return HTTP_CLIENT.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        }).invoke(response -> {
            if (response.statusCode() != 200) {
                LOG.warnf("Slack webhook returned %d: %s", response.statusCode(), response.body());
            }
        }).onFailure().invoke(error -> LOG.errorf(error, "Failed to send Slack notification"))
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
