package com.canonbridge.mappingstudio.notification;

import java.time.Instant;

/**
 * Immutable notification payload dispatched to all enabled channels.
 */
public record NotificationPayload(
        String tenantId,
        Severity severity,
        String title,
        String detail,
        String source,
        Instant timestamp
) {
    public enum Severity {
        INFO, WARNING, CRITICAL
    }

    public static NotificationPayload info(String tenantId, String title, String detail, String source) {
        return new NotificationPayload(tenantId, Severity.INFO, title, detail, source, Instant.now());
    }

    public static NotificationPayload warning(String tenantId, String title, String detail, String source) {
        return new NotificationPayload(tenantId, Severity.WARNING, title, detail, source, Instant.now());
    }

    public static NotificationPayload critical(String tenantId, String title, String detail, String source) {
        return new NotificationPayload(tenantId, Severity.CRITICAL, title, detail, source, Instant.now());
    }
}
