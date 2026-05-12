package com.canonbridge.mappingstudio.lifecycle;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.test.junit.QuarkusTest;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.pgclient.PgPool;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for GracefulShutdownManager.
 */
@QuarkusTest
class GracefulShutdownManagerTest {

    @Inject
    GracefulShutdownManager shutdownManager;

    @BeforeEach
    void setUp() {
        // Reset state before each test
        // Note: In a real test environment, we'd need to create a new instance
        // or use a test-specific configuration
    }

    @Test
    void testInitialState() {
        // Service should be ready initially
        assertTrue(shutdownManager.isReady(), "Service should be ready initially");
        assertFalse(shutdownManager.isShuttingDown(), "Service should not be shutting down initially");
        assertEquals(0, shutdownManager.getInFlightRequestCount(), "Should have no in-flight requests initially");
    }

    @Test
    void testRequestTracking() {
        // Track a request
        shutdownManager.requestStarted();
        assertEquals(1, shutdownManager.getInFlightRequestCount(), "Should have 1 in-flight request");

        // Track another request
        shutdownManager.requestStarted();
        assertEquals(2, shutdownManager.getInFlightRequestCount(), "Should have 2 in-flight requests");

        // Complete a request
        shutdownManager.requestCompleted();
        assertEquals(1, shutdownManager.getInFlightRequestCount(), "Should have 1 in-flight request");

        // Complete the last request
        shutdownManager.requestCompleted();
        assertEquals(0, shutdownManager.getInFlightRequestCount(), "Should have no in-flight requests");
    }

    @Test
    void testShutdownMarksServiceNotReady() throws Exception {
        // Create a test instance with mocked dependencies
        GracefulShutdownManager testManager = createTestManager();
        
        // Initially ready
        assertTrue(testManager.isReady());
        
        // Trigger shutdown
        testManager.onShutdown(new ShutdownEvent());
        
        // Should not be ready after shutdown
        assertFalse(testManager.isReady());
        assertTrue(testManager.isShuttingDown());
    }

    @Test
    void testShutdownWaitsForInFlightRequests() throws Exception {
        GracefulShutdownManager testManager = createTestManager();
        
        // Start some requests
        testManager.requestStarted();
        testManager.requestStarted();
        
        // Trigger shutdown in a separate thread
        AtomicBoolean shutdownComplete = new AtomicBoolean(false);
        Thread shutdownThread = new Thread(() -> {
            testManager.onShutdown(new ShutdownEvent());
            shutdownComplete.set(true);
        });
        shutdownThread.start();
        
        // Give shutdown time to start
        Thread.sleep(100);
        
        // Shutdown should be waiting for requests
        assertFalse(shutdownComplete.get(), "Shutdown should wait for in-flight requests");
        
        // Complete the requests
        testManager.requestCompleted();
        testManager.requestCompleted();
        
        // Wait for shutdown to complete
        shutdownThread.join(5000);
        
        // Shutdown should now be complete
        assertTrue(shutdownComplete.get(), "Shutdown should complete after requests finish");
    }

    @Test
    void testShutdownTimeoutWithInFlightRequests() throws Exception {
        // Create a test manager with a short timeout
        GracefulShutdownManager testManager = createTestManagerWithTimeout(1);
        
        // Start a request that won't complete
        testManager.requestStarted();
        
        // Trigger shutdown
        long startTime = System.currentTimeMillis();
        testManager.onShutdown(new ShutdownEvent());
        long duration = System.currentTimeMillis() - startTime;
        
        // Should have timed out after approximately 1 second
        assertTrue(duration >= 1000, "Should wait for at least the timeout period");
        assertTrue(duration < 2000, "Should not wait much longer than the timeout period");
        
        // Request should still be tracked (not completed)
        assertEquals(1, testManager.getInFlightRequestCount(), "Request should still be tracked after timeout");
    }

    @Test
    void testMultipleShutdownCallsIgnored() throws Exception {
        GracefulShutdownManager testManager = createTestManager();
        
        // First shutdown call
        testManager.onShutdown(new ShutdownEvent());
        assertTrue(testManager.isShuttingDown());
        
        // Second shutdown call should be ignored (no exception)
        testManager.onShutdown(new ShutdownEvent());
        assertTrue(testManager.isShuttingDown());
    }

    @Test
    void testStartupLogsConfiguration() {
        GracefulShutdownManager testManager = createTestManager();
        
        // Trigger startup event (should not throw exception)
        assertDoesNotThrow(() -> testManager.onStart(new StartupEvent()));
    }

    /**
     * Creates a test instance of GracefulShutdownManager with mocked dependencies.
     */
    private GracefulShutdownManager createTestManager() {
        return createTestManagerWithTimeout(30);
    }

    /**
     * Creates a test instance with a specific drain timeout.
     */
    private GracefulShutdownManager createTestManagerWithTimeout(int timeoutSeconds) {
        GracefulShutdownManager manager = new GracefulShutdownManager();
        
        // Mock dependencies
        manager.pgPool = Mockito.mock(PgPool.class);
        manager.vertx = Mockito.mock(Vertx.class);
        manager.drainTimeoutSeconds = timeoutSeconds;
        manager.producerFlushTimeoutSeconds = 5;
        
        return manager;
    }
}
