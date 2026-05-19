package com.canonbridge.mappingstudio.security;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TenantContextTest {

    @Test
    void defaultsMissingTenantInSingleTenantMode() {
        TenantContext context = singleTenantContext();

        assertEquals("tenant-acme", context.requireTenantId(null));
        assertEquals("tenant-acme", context.requireTenantId("  "));
    }

    @Test
    void rejectsNonDefaultTenantInSingleTenantMode() {
        TenantContext context = singleTenantContext();

        assertThrows(ForbiddenException.class, () -> context.requireTenantId("tenant-other"));
    }

    @Test
    void requiresTenantWhenSingleTenantModeIsDisabled() {
        TenantContext context = new TenantContext();
        context.singleTenantEnabled = false;
        context.defaultTenantId = "tenant-acme";

        assertThrows(BadRequestException.class, () -> context.requireTenantId(null));
        assertEquals("tenant-other", context.requireTenantId(" tenant-other "));
    }

    private static TenantContext singleTenantContext() {
        TenantContext context = new TenantContext();
        context.singleTenantEnabled = true;
        context.defaultTenantId = "tenant-acme";
        return context;
    }
}
