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
 * Email notification channel via SMTP relay or HTTP email API (e.g., SendGrid, Mailgun).
 * 
 * Configuration:
 *   canonbridge.notifications.email.enabled=true
 *   canonbridge.notifications.email.api-url=https://api.sendgrid.com/v3/mail/send
 *   canonbridge.notifications.email.api-key=SG.xxx
 *   canonbridge.notifications.email.from=alerts@canonbridge.io
 *   canonbridge.notifications.email.to=ops-team@company.com
 */
@ApplicationScoped
public class EmailNotificationChannel implements NotificationChannel {

    private static final Logger LOG = Logger.getLogger(EmailNotificationChannel.class);
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @ConfigProperty(name = "canonbridge.notifications.email.enabled", defaultValue = "false")
    boolean enabled;

    @ConfigProperty(name = "canonbridge.notifications.email.api-url")
    Optional<String> apiUrl;

    @ConfigProperty(name = "canonbridge.notifications.email.api-key")
    Optional<String> apiKey;

    @ConfigProperty(name = "canonbridge.notifications.email.from", defaultValue = "alerts@canonbridge.io")
    String fromAddress;

    @ConfigProperty(name = "canonbridge.notifications.email.to")
    Optional<String> toAddress;

    @Override
    public String channelId() {
        return "email";
    }

    @Override
    public boolean isEnabled() {
        return enabled
                && apiUrl.isPresent() && !apiUrl.get().isBlank()
                && apiKey.isPresent() && !apiKey.get().isBlank()
                && toAddress.isPresent() && !toAddress.get().isBlank();
    }

    @Override
    public Uni<Void> send(NotificationPayload notification) {
        if (!isEnabled()) {
            return Uni.createFrom().voidItem();
        }

        String subject = "[CanonBridge %s] %s".formatted(notification.severity().name(), notification.title());
        String body = """
                Severity: %s
                Tenant: %s
                Source: %s
                Time: %s
                
                %s"""
                .formatted(
                        notification.severity().name(),
                        notification.tenantId(),
                        notification.source(),
                        notification.timestamp().toString(),
                        notification.detail());

        // SendGrid-compatible payload
        String payload = """
                {"personalizations":[{"to":[{"email":"%s"}]}],"from":{"email":"%s"},"subject":"%s","content":[{"type":"text/plain","value":"%s"}]}"""
                .formatted(
                        escapeJson(toAddress.get()),
                        escapeJson(fromAddress),
                        escapeJson(subject),
                        escapeJson(body));

        return Uni.createFrom().completionStage(() -> {
            HttpRequest request = HttpRequest.newBuilder(URI.create(apiUrl.get()))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey.get())
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();
            return HTTP_CLIENT.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        }).invoke(response -> {
            if (response.statusCode() >= 300) {
                LOG.warnf("Email API returned %d: %s", response.statusCode(), response.body());
            }
        }).onFailure().invoke(error -> LOG.errorf(error, "Failed to send email notification"))
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
