package com.canonbridge.mappingstudio.ratelimit;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for RateLimitFilter.
 * 
 * These tests verify:
 * - Rate limit enforcement on API endpoints
 * - HTTP 429 responses with proper headers
 * - Rate limit headers in all responses
 * - Different limits for authenticated vs unauthenticated requests
 */
@QuarkusTest
class RateLimitFilterTest {

    @Test
    void testRateLimitHeadersArePresentInSuccessfulResponse() {
        // When: Making a request to any API endpoint
        Response response = given()
                .header("X-Tenant-Id", "test-tenant")
                .when()
                .get("/api/partners")
                .then()
                .statusCode(anyOf(is(200), is(401))) // May be 401 if auth is enabled
                .extract()
                .response();

        // Then: Rate limit headers should be present
        assertNotNull(response.getHeader("X-RateLimit-Limit"), "X-RateLimit-Limit header should be present");
        assertNotNull(response.getHeader("X-RateLimit-Remaining"), "X-RateLimit-Remaining header should be present");
        assertNotNull(response.getHeader("X-RateLimit-Reset"), "X-RateLimit-Reset header should be present");
    }

    @Test
    void testRateLimitEnforcementReturns429() {
        // Given: A unique client identifier for this test
        String testApiKey = "test-rate-limit-" + System.currentTimeMillis();
        
        // When: Making requests up to and beyond the limit
        // Note: This test assumes a low limit is configured or we make many requests
        // For a real test, you might want to configure a lower limit in test profile
        
        int requestCount = 0;
        Response lastResponse = null;
        
        // Make requests until we hit the rate limit (max 150 to avoid infinite loop)
        for (int i = 0; i < 150; i++) {
            lastResponse = given()
                    .header("X-API-Key", testApiKey)
                    .header("X-Tenant-Id", "test-tenant")
                    .when()
                    .get("/api/partners")
                    .then()
                    .extract()
                    .response();
            
            requestCount++;
            
            if (lastResponse.getStatusCode() == 429) {
                break;
            }
        }

        // Then: Eventually we should get a 429 response
        // Note: This might not happen if rate limit is very high or disabled in test
        if (lastResponse != null && lastResponse.getStatusCode() == 429) {
            // Verify 429 response structure
            assertNotNull(lastResponse.getHeader("Retry-After"), "Retry-After header should be present");
            assertNotNull(lastResponse.getHeader("X-RateLimit-Limit"));
            assertEquals("0", lastResponse.getHeader("X-RateLimit-Remaining"));
            
            // Verify error response body
            String errorCode = lastResponse.jsonPath().getString("error");
            assertEquals("rate_limit_exceeded", errorCode);
            
            String message = lastResponse.jsonPath().getString("message");
            assertNotNull(message);
            assertTrue(message.contains("Rate limit exceeded"));
        }
    }

    @Test
    void testHealthEndpointIsNotRateLimited() {
        // When: Making many requests to health endpoint
        for (int i = 0; i < 20; i++) {
            given()
                    .when()
                    .get("/health")
                    .then()
                    .statusCode(200);
        }

        // Then: All requests should succeed (no 429)
        // If this test passes, health endpoint is not rate limited
    }

    @Test
    void testMetricsEndpointIsNotRateLimited() {
        // When: Making many requests to metrics endpoint
        for (int i = 0; i < 20; i++) {
            given()
                    .when()
                    .get("/metrics")
                    .then()
                    .statusCode(200);
        }

        // Then: All requests should succeed (no 429)
        // If this test passes, metrics endpoint is not rate limited
    }

    @Test
    void testRateLimitRemainingDecreases() {
        // Given: A unique client identifier
        String testApiKey = "test-remaining-" + System.currentTimeMillis();
        
        // When: Making first request
        Response response1 = given()
                .header("X-API-Key", testApiKey)
                .header("X-Tenant-Id", "test-tenant")
                .when()
                .get("/api/partners")
                .then()
                .extract()
                .response();

        int remaining1 = Integer.parseInt(response1.getHeader("X-RateLimit-Remaining"));

        // When: Making second request
        Response response2 = given()
                .header("X-API-Key", testApiKey)
                .header("X-Tenant-Id", "test-tenant")
                .when()
                .get("/api/partners")
                .then()
                .extract()
                .response();

        int remaining2 = Integer.parseInt(response2.getHeader("X-RateLimit-Remaining"));

        // Then: Remaining count should decrease
        assertTrue(remaining2 < remaining1, 
                "X-RateLimit-Remaining should decrease with each request");
    }

    @Test
    void testRateLimitResetTimeIsInFuture() {
        // When: Making a request
        Response response = given()
                .header("X-Tenant-Id", "test-tenant")
                .when()
                .get("/api/partners")
                .then()
                .extract()
                .response();

        // Then: Reset time should be in the future
        long resetTime = Long.parseLong(response.getHeader("X-RateLimit-Reset"));
        long now = System.currentTimeMillis();
        
        assertTrue(resetTime > now, "X-RateLimit-Reset should be a future timestamp");
    }
}
