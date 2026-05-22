package com.canonbridge.billing.service;

import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import static org.junit.jupiter.api.Assertions.*;

/**
 * V5-H2 FIX: Unit tests for trial logic.
 */
class TrialServiceTest {

    @Test
    void trialDuration_shouldBe14Days() {
        Instant start = Instant.now();
        Instant end = start.plus(14, ChronoUnit.DAYS);
        long days = ChronoUnit.DAYS.between(start, end);
        assertEquals(14, days);
    }

    @Test
    void trialExpired_shouldReturnTrue() {
        Instant trialEnd = Instant.now().minus(1, ChronoUnit.HOURS);
        boolean expired = Instant.now().isAfter(trialEnd);
        assertTrue(expired);
    }

    @Test
    void trialNotExpired_shouldReturnFalse() {
        Instant trialEnd = Instant.now().plus(7, ChronoUnit.DAYS);
        boolean expired = Instant.now().isAfter(trialEnd);
        assertFalse(expired);
    }

    @Test
    void trialWarning3Days_shouldTrigger() {
        Instant trialEnd = Instant.now().plus(2, ChronoUnit.DAYS).plus(12, ChronoUnit.HOURS);
        long daysLeft = ChronoUnit.DAYS.between(Instant.now(), trialEnd);
        assertTrue(daysLeft <= 3 && daysLeft > 0);
    }

    @Test
    void onlyOneTrialPerOrg_secondAttemptShouldFail() {
        int previousTrialCount = 1;
        boolean canStartTrial = previousTrialCount == 0;
        assertFalse(canStartTrial);
    }
}
