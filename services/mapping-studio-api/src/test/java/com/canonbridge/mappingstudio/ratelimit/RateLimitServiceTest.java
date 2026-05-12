package com.canonbridge.mappingstudio.ratelimit;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for RateLimitService.
 * 
 * These tests verify:
 * - Rate limit enforcement
 * - Sliding window algorithm behavior
 * - Proper header values
 * - Redis state management
 */
@QuarkusTest
class RateLimitServiceTest {

    @Inject
    RateLimitService rateLimitService;

    @Inject
    RateLimitConfig config;

    private static final String TEST_CLIENT_ID = "test-client-123";

    @BeforeEach
    void setUp() {
        // Ensure rate limiting is enabled for tests
        if (!config.enabled()) {
            fail("Rate limiting must be enabled for tests");
        }
    }

    @Test
    void testRateLimitAllowsRequestsWithinLimit() {
        // Given: A client with a limit of 5 requests per 60 seconds
        int limit = 5;
        int windowSeconds = 60;
        String clientId = TEST_CLIENT_ID + "-allow";

        // When: Making requests within the limit
        for (int i = 0; i < limit; i++) {
            RateLimitResult result = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                    .await().indefinitely();

            // Then: All requests should be allowed
            assertTrue(result.isAllowed(), "Request " + (i + 1) + " should be allowed");
            assertEquals(limit, result.getLimit());
            assertEquals(limit - i - 1, result.getRemaining());
        }
    }

    @Test
    void testRateLimitBlocksRequestsExceedingLimit() {
        // Given: A client with a limit of 3 requests per 60 seconds
        int limit = 3;
        int windowSeconds = 60;
        String clientId = TEST_CLIENT_ID + "-block";

        // When: Making requests up to the limit
        for (int i = 0; i < limit; i++) {
            RateLimitResult result = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                    .await().indefinitely();
            assertTrue(result.isAllowed());
        }

        // When: Making a request exceeding the limit
        RateLimitResult blockedResult = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();

        // Then: The request should be blocked
        assertFalse(blockedResult.isAllowed(), "Request exceeding limit should be blocked");
        assertEquals(limit, blockedResult.getLimit());
        assertEquals(0, blockedResult.getRemaining());
        assertTrue(blockedResult.getRetryAfter() > 0, "Retry-After should be positive");
    }

    @Test
    void testSlidingWindowAllowsRequestsAfterOldOnesExpire() throws InterruptedException {
        // Given: A client with a limit of 2 requests per 2 seconds (short window for testing)
        int limit = 2;
        int windowSeconds = 2;
        String clientId = TEST_CLIENT_ID + "-sliding";

        // When: Making requests up to the limit
        RateLimitResult result1 = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();
        assertTrue(result1.isAllowed());

        RateLimitResult result2 = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();
        assertTrue(result2.isAllowed());

        // When: Immediately trying another request
        RateLimitResult result3 = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();
        assertFalse(result3.isAllowed(), "Should be blocked immediately");

        // When: Waiting for the window to slide (first request expires)
        Thread.sleep(2100); // Wait slightly more than window

        // Then: New request should be allowed as old requests expired
        RateLimitResult result4 = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();
        assertTrue(result4.isAllowed(), "Should be allowed after window slides");
    }

    @Test
    void testRateLimitHeadersAreCorrect() {
        // Given: A client with a limit of 10 requests
        int limit = 10;
        int windowSeconds = 60;
        String clientId = TEST_CLIENT_ID + "-headers";

        // When: Making the first request
        RateLimitResult result = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();

        // Then: Headers should reflect correct values
        assertTrue(result.isAllowed());
        assertEquals(limit, result.getLimit());
        assertEquals(limit - 1, result.getRemaining());
        assertTrue(result.getResetTime() > System.currentTimeMillis(), "Reset time should be in the future");
    }

    @Test
    void testDifferentClientsHaveIndependentLimits() {
        // Given: Two different clients with the same limit
        int limit = 3;
        int windowSeconds = 60;
        String clientId1 = TEST_CLIENT_ID + "-client1";
        String clientId2 = TEST_CLIENT_ID + "-client2";

        // When: Client 1 exhausts their limit
        for (int i = 0; i < limit; i++) {
            rateLimitService.checkRateLimit(clientId1, limit, windowSeconds).await().indefinitely();
        }
        RateLimitResult client1Blocked = rateLimitService.checkRateLimit(clientId1, limit, windowSeconds)
                .await().indefinitely();

        // Then: Client 1 should be blocked
        assertFalse(client1Blocked.isAllowed());

        // When: Client 2 makes a request
        RateLimitResult client2Result = rateLimitService.checkRateLimit(clientId2, limit, windowSeconds)
                .await().indefinitely();

        // Then: Client 2 should still be allowed
        assertTrue(client2Result.isAllowed(), "Different clients should have independent limits");
    }

    @Test
    void testRetryAfterCalculation() {
        // Given: A client with a limit of 2 requests per 60 seconds
        int limit = 2;
        int windowSeconds = 60;
        String clientId = TEST_CLIENT_ID + "-retry";

        // When: Exhausting the limit
        rateLimitService.checkRateLimit(clientId, limit, windowSeconds).await().indefinitely();
        rateLimitService.checkRateLimit(clientId, limit, windowSeconds).await().indefinitely();

        // When: Getting blocked
        RateLimitResult blockedResult = rateLimitService.checkRateLimit(clientId, limit, windowSeconds)
                .await().indefinitely();

        // Then: Retry-After should be reasonable (between 1 and windowSeconds)
        assertFalse(blockedResult.isAllowed());
        assertTrue(blockedResult.getRetryAfter() >= 1, "Retry-After should be at least 1 second");
        assertTrue(blockedResult.getRetryAfter() <= windowSeconds, 
                "Retry-After should not exceed window size");
    }
}
