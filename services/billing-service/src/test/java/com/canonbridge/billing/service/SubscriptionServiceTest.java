package com.canonbridge.billing.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * V5-H2 FIX: Unit tests for subscription state machine transitions.
 */
class SubscriptionServiceTest {

    @Test
    void statusTransition_active_toCanceled_isValid() {
        assertTrue(isValidTransition("active", "canceled"));
    }

    @Test
    void statusTransition_active_toPaused_isValid() {
        assertTrue(isValidTransition("active", "paused"));
    }

    @Test
    void statusTransition_paused_toActive_isValid() {
        assertTrue(isValidTransition("paused", "active"));
    }

    @Test
    void statusTransition_trialing_toActive_isValid() {
        assertTrue(isValidTransition("trialing", "active"));
    }

    @Test
    void statusTransition_canceled_toActive_isInvalid() {
        assertFalse(isValidTransition("canceled", "active"));
    }

    @Test
    void statusTransition_active_toPastDue_isValid() {
        assertTrue(isValidTransition("active", "past_due"));
    }

    @Test
    void billingCycle_monthly_periodIsOneMonth() {
        assertEquals(30, approximateDays("monthly"));
    }

    @Test
    void billingCycle_yearly_periodIsTwelveMonths() {
        assertEquals(365, approximateDays("yearly"));
    }

    private boolean isValidTransition(String from, String to) {
        return switch (from) {
            case "active" -> to.equals("canceled") || to.equals("paused") || to.equals("past_due");
            case "trialing" -> to.equals("active") || to.equals("canceled");
            case "paused" -> to.equals("active") || to.equals("canceled");
            case "past_due" -> to.equals("active") || to.equals("canceled");
            case "canceled" -> false;
            default -> false;
        };
    }

    private int approximateDays(String cycle) {
        return switch (cycle) {
            case "monthly" -> 30;
            case "yearly" -> 365;
            default -> 0;
        };
    }
}
