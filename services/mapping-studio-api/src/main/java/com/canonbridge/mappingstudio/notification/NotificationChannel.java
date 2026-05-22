package com.canonbridge.mappingstudio.notification;

import io.smallrye.mutiny.Uni;

/**
 * Abstraction for external notification delivery channels (Slack, PagerDuty, email, etc.).
 */
public interface NotificationChannel {

    /**
     * Unique identifier for this channel (e.g., "slack", "pagerduty", "email").
     */
    String channelId();

    /**
     * Whether this channel is currently enabled via configuration.
     */
    boolean isEnabled();

    /**
     * Send a notification through this channel.
     *
     * @param notification the notification payload
     * @return Uni completing when the notification is sent (or fails)
     */
    Uni<Void> send(NotificationPayload notification);
}
