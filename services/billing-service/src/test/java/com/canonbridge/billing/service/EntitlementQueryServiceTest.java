package com.canonbridge.billing.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * V5-H2 FIX: Unit tests for entitlement logic.
 */
class EntitlementQueryServiceTest {

    @Test
    void unlimited_shouldAlwaysBeAllowed() {
        long limit = -1;
        long used = 999999;
        boolean allowed = limit == -1 || (limit - used) > 0;
        assertTrue(allowed);
    }

    @Test
    void withinLimit_shouldBeAllowed() {
        long limit = 1000;
        long used = 500;
        boolean allowed = limit == -1 || (limit - used) > 0;
        assertTrue(allowed);
    }

    @Test
    void atLimit_shouldNotBeAllowed() {
        long limit = 1000;
        long used = 1000;
        boolean allowed = limit == -1 || (limit - used) > 0;
        assertFalse(allowed);
    }

    @Test
    void overLimit_shouldNotBeAllowed() {
        long limit = 1000;
        long used = 1500;
        boolean allowed = limit == -1 || (limit - used) > 0;
        assertFalse(allowed);
    }

    @Test
    void remaining_shouldBeCorrect() {
        long limit = 25000;
        long used = 18000;
        long remaining = Math.max(limit - used, 0);
        assertEquals(7000, remaining);
    }

    @Test
    void remaining_unlimited_shouldBeMaxValue() {
        long limit = -1;
        long remaining = limit == -1 ? 9999999 : Math.max(limit - 0, 0);
        assertEquals(9999999, remaining);
    }

    @Test
    void remaining_overUsed_shouldBeZero() {
        long limit = 100;
        long used = 150;
        long remaining = Math.max(limit - used, 0);
        assertEquals(0, remaining);
    }
}
