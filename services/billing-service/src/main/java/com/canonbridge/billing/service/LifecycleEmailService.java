package com.canonbridge.billing.service;

import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.UUID;

/**
 * TASK-022: Lifecycle email service.
 * Sends transactional emails for billing events (trial, quota, payment, etc.)
 *
 * Currently logs emails. In production, integrate with Resend/SendGrid.
 */
@ApplicationScoped
public class LifecycleEmailService {

    @ConfigProperty(name = "canonbridge.email.enabled", defaultValue = "false")
    boolean emailEnabled;

    @ConfigProperty(name = "canonbridge.email.from", defaultValue = "billing@canonbridge.io")
    String fromAddress;

    public void sendWelcome(UUID orgId) {
        sendEmail(orgId, "welcome", "Welcome to CanonBridge!");
    }

    public void sendTrialStarted(UUID orgId) {
        sendEmail(orgId, "trial_started", "Your 14-day Growth trial has started");
    }

    public void sendTrialEndingWarning(UUID orgId, int daysLeft) {
        sendEmail(orgId, "trial_ending", String.format("Your trial ends in %d day(s)", daysLeft));
    }

    public void sendTrialExpired(UUID orgId) {
        sendEmail(orgId, "trial_expired", "Your trial has ended — you're now on the Free plan");
    }

    public void sendQuotaWarning(UUID orgId, String metric, int percentUsed) {
        sendEmail(orgId, "quota_warning",
            String.format("You've used %d%% of your %s quota", percentUsed, metric));
    }

    public void sendQuotaExceeded(UUID orgId, String metric) {
        sendEmail(orgId, "quota_exceeded",
            String.format("Your %s quota has been exceeded — upgrade to continue", metric));
    }

    public void sendPaymentSucceeded(UUID orgId, int amountCents) {
        sendEmail(orgId, "payment_succeeded",
            String.format("Payment of $%.2f received — thank you!", amountCents / 100.0));
    }

    public void sendPaymentFailed(UUID orgId) {
        sendEmail(orgId, "payment_failed", "Your payment failed — please update your payment method");
    }

    public void sendSubscriptionUpgraded(UUID orgId, String newPlan) {
        sendEmail(orgId, "subscription_upgraded",
            String.format("You've been upgraded to the %s plan", newPlan));
    }

    public void sendSubscriptionCanceled(UUID orgId) {
        sendEmail(orgId, "subscription_canceled", "Your subscription has been canceled");
    }

    public void sendInvoiceReady(UUID orgId, String invoiceId) {
        sendEmail(orgId, "invoice_ready", "Your invoice is ready");
    }

    public void sendRetentionDay7(UUID orgId) {
        sendEmail(orgId, "retention_day7", "How's it going? Here are some tips to get more from CanonBridge");
    }

    public void sendWinBack(UUID orgId) {
        sendEmail(orgId, "win_back", "We miss you! Here's 20% off to come back");
    }

    private void sendEmail(UUID orgId, String template, String subject) {
        if (!emailEnabled) {
            Log.debugf("[Email] Skipped (disabled): org=%s template=%s subject='%s'", orgId, template, subject);
            return;
        }

        // Production email integration via Resend API
        // Configure EMAIL_PROVIDER=resend and EMAIL_API_KEY in environment
        Log.infof("[Email] Sending '%s' to org %s: %s", template, orgId, subject);
        // TODO: Wire Resend/SendGrid HTTP client when EMAIL_ENABLED=true in production
        // For now, emails are logged. Enable by setting canonbridge.email.enabled=true + provider config.
    }
}
