package com.canonbridge.mappingstudio.lifecycle;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.pgclient.PgPool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Manages graceful shutdown of the Mapping Studio API.
 * 
 * Shutdown sequence:
 * 1. Mark readiness probe as failing
 * 2. Stop accepting new HTTP requests (return 503)
 * 3. Pause Kafka message consumption (if applicable)
 * 4. Wait for in-flight requests to complete (with timeout)
 * 5. Flush Kafka producer (if applicable)
 * 6. Close database connection pools
 * 7. Log shutdown completion and exit
 */
@ApplicationScoped
public class GracefulShutdownManager {

    private static final Logger LOG = Logger.getLogger(GracefulShutdownManager.class);

    @Inject
    PgPool pgPool;

    @Inject
    Vertx vertx;

    @ConfigProperty(name = "canonbridge.shutdown.drain-timeout-seconds", defaultValue = "30")
    int drainTimeoutSeconds;

    @ConfigProperty(name = "canonbridge.shutdown.producer-flush-timeout-seconds", defaultValue = "10")
    int producerFlushTimeoutSeconds;

    private final AtomicBoolean shutdownInProgress = new AtomicBoolean(false);
    private final AtomicBoolean ready = new AtomicBoolean(true);
    private final AtomicInteger inFlightRequests = new AtomicInteger(0);
    private final CountDownLatch shutdownLatch = new CountDownLatch(1);

    void onStart(@Observes StartupEvent event) {
        LOG.info("Mapping Studio API started - graceful shutdown manager initialized");
        LOG.infof("Shutdown configuration: drain-timeout=%ds, producer-flush-timeout=%ds", 
                  drainTimeoutSeconds, producerFlushTimeoutSeconds);
        
        // Validate configuration
        if (drainTimeoutSeconds < 10 || drainTimeoutSeconds > 60) {
            LOG.warnf("Drain timeout %ds is outside recommended range [10-60]s", drainTimeoutSeconds);
        }
    }

    void onShutdown(@Observes ShutdownEvent event) {
        if (!shutdownInProgress.compareAndSet(false, true)) {
            LOG.warn("Shutdown already in progress, ignoring duplicate signal");
            return;
        }

        LOG.info("=== Graceful shutdown initiated ===");
        long shutdownStartTime = System.currentTimeMillis();

        try {
            // Step 1: Mark readiness probe as failing
            LOG.info("Step 1: Marking readiness probe as failing");
            ready.set(false);

            // Step 2: Stop accepting new HTTP requests (handled by isReady() check in filter)
            LOG.info("Step 2: Stopped accepting new HTTP requests (will return 503)");

            // Step 3: Pause Kafka message consumption (if applicable)
            // Note: Mapping Studio API currently doesn't consume Kafka messages
            // This is a placeholder for future Kafka integration
            LOG.info("Step 3: Kafka consumption pause (not applicable - no Kafka consumer)");

            // Step 4: Wait for in-flight requests to complete
            LOG.infof("Step 4: Waiting for %d in-flight requests to complete (timeout: %ds)", 
                      inFlightRequests.get(), drainTimeoutSeconds);
            
            long drainStartTime = System.currentTimeMillis();
            boolean drained = waitForInFlightRequests(drainTimeoutSeconds);
            long drainDuration = System.currentTimeMillis() - drainStartTime;
            
            if (drained) {
                LOG.infof("All in-flight requests completed in %dms", drainDuration);
            } else {
                int remaining = inFlightRequests.get();
                LOG.warnf("Drain timeout expired after %dms - %d requests interrupted", 
                          drainDuration, remaining);
            }

            // Step 5: Flush Kafka producer (if applicable)
            // Note: Mapping Studio API currently doesn't produce to Kafka
            // This is a placeholder for future Kafka integration
            LOG.info("Step 5: Kafka producer flush (not applicable - no Kafka producer)");

            // Step 6: Close database connection pools
            LOG.info("Step 6: Closing database connection pools");
            closeDatabaseConnections();

            // Step 7: Log shutdown completion
            long totalShutdownTime = System.currentTimeMillis() - shutdownStartTime;
            LOG.infof("=== Graceful shutdown completed in %dms ===", totalShutdownTime);

        } catch (Exception e) {
            LOG.error("Error during graceful shutdown", e);
        } finally {
            shutdownLatch.countDown();
        }
    }

    /**
     * Checks if the service is ready to accept requests.
     * Returns false during shutdown to fail readiness probes.
     */
    public boolean isReady() {
        return ready.get();
    }

    /**
     * Checks if shutdown is in progress.
     */
    public boolean isShuttingDown() {
        return shutdownInProgress.get();
    }

    /**
     * Increments the in-flight request counter.
     * Should be called when a request starts processing.
     */
    public void requestStarted() {
        inFlightRequests.incrementAndGet();
    }

    /**
     * Decrements the in-flight request counter.
     * Should be called when a request completes processing.
     */
    public void requestCompleted() {
        inFlightRequests.decrementAndGet();
    }

    /**
     * Gets the current count of in-flight requests.
     */
    public int getInFlightRequestCount() {
        return inFlightRequests.get();
    }

    /**
     * Waits for all in-flight requests to complete within the specified timeout.
     * 
     * @param timeoutSeconds Maximum time to wait for requests to complete
     * @return true if all requests completed, false if timeout expired
     */
    private boolean waitForInFlightRequests(int timeoutSeconds) {
        long deadline = System.currentTimeMillis() + (timeoutSeconds * 1000L);
        
        while (inFlightRequests.get() > 0) {
            long remaining = deadline - System.currentTimeMillis();
            if (remaining <= 0) {
                return false;
            }
            
            try {
                Thread.sleep(Math.min(100, remaining));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                LOG.warn("Interrupted while waiting for in-flight requests");
                return false;
            }
        }
        
        return true;
    }

    /**
     * Closes database connection pools gracefully.
     */
    private void closeDatabaseConnections() {
        try {
            // Close the reactive PostgreSQL pool
            if (pgPool != null) {
                pgPool.close().await().atMost(Duration.ofSeconds(5));
                LOG.info("Database connection pool closed successfully");
            }
        } catch (Exception e) {
            LOG.error("Error closing database connection pool", e);
        }
    }

    /**
     * Waits for shutdown to complete.
     * Used for testing purposes.
     */
    public boolean awaitShutdown(long timeout, TimeUnit unit) throws InterruptedException {
        return shutdownLatch.await(timeout, unit);
    }
}
