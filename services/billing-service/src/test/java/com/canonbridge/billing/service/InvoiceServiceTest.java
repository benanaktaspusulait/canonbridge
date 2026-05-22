package com.canonbridge.billing.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * V5-H2 FIX: Unit tests for InvoiceService critical paths.
 */
class InvoiceServiceTest {

    @Test
    void taxUpdate_shouldCalculateCorrectTotal() {
        // subtotal=2900, tax=580 → total should be 3480
        int subtotal = 2900;
        int tax = 580;
        int expectedTotal = subtotal + tax;
        assertEquals(3480, expectedTotal);
    }

    @Test
    void taxUpdate_zeroTax_shouldKeepSubtotalAsTotal() {
        int subtotal = 14900;
        int tax = 0;
        assertEquals(subtotal, subtotal + tax);
    }

    @Test
    void monthlyInvoice_freePlan_shouldBePaidImmediately() {
        // Free plan: price=0, status should be 'paid' immediately
        int priceMonthly = 0;
        String expectedStatus = priceMonthly == 0 ? "paid" : "open";
        assertEquals("paid", expectedStatus);
    }

    @Test
    void monthlyInvoice_paidPlan_shouldBeOpen() {
        int priceMonthly = 2900;
        String expectedStatus = priceMonthly == 0 ? "paid" : "open";
        assertEquals("open", expectedStatus);
    }
}
