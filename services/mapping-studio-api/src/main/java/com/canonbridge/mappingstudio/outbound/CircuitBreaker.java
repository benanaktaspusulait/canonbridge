package com.canonbridge.mappingstudio.outbound;

import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Simple circuit breaker for external API calls.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail fast (503)
 * - HALF_OPEN: After cooldown, allow one test request
 * 
 * Configuration:
 * - failureThreshold: 5 consecutive failures → OPEN
 * - cooldownSeconds: 30s before HALF_OPEN
 * - Per-URL circuit (each external API has its own breaker)
 */
public class CircuitBreaker {

    private static final Logger LOG = Logger.getLogger(CircuitBreaker.class);

    public enum State { CLOSED, OPEN, HALF_OPEN }

    private final int failureThreshold;
    private final int cooldownSeconds;
    private final Map<String, CircuitState> circuits = new ConcurrentHashMap<>();

    public CircuitBreaker(int failureThreshold, int cooldownSeconds) {
        this.failureThreshold = failureThreshold;
        this.cooldownSeconds = cooldownSeconds;
    }

    public boolean isAllowed(String key) {
        CircuitState state = circuits.computeIfAbsent(key, k -> new CircuitState());
        
        switch (state.getState()) {
            case OPEN:
                if (state.cooldownExpired(cooldownSeconds)) {
                    state.transitionTo(State.HALF_OPEN);
                    LOG.infof("Circuit HALF_OPEN for: %s", key);
                    return true; // Allow one test request
                }
                LOG.warnf("Circuit OPEN for: %s (failing fast)", key);
                return false;
            case HALF_OPEN:
            case CLOSED:
                return true;
        }
        return true;
    }

    public void recordSuccess(String key) {
        CircuitState state = circuits.get(key);
        if (state != null) {
            if (state.getState() == State.HALF_OPEN) {
                state.transitionTo(State.CLOSED);
                LOG.infof("Circuit CLOSED for: %s (recovered)", key);
            }
            state.resetFailures();
        }
    }

    public void recordFailure(String key) {
        CircuitState state = circuits.computeIfAbsent(key, k -> new CircuitState());
        int failures = state.incrementFailures();
        
        // [MS-M4] FIX: If in HALF_OPEN and test request fails, go back to OPEN
        if (state.getState() == State.HALF_OPEN) {
            state.transitionTo(State.OPEN);
            LOG.warnf("Circuit re-OPENED for: %s (HALF_OPEN test request failed)", key);
            return;
        }
        
        if (failures >= failureThreshold && state.getState() == State.CLOSED) {
            state.transitionTo(State.OPEN);
            LOG.warnf("Circuit OPEN for: %s (after %d failures)", key, failures);
        }
    }

    public State getState(String key) {
        CircuitState state = circuits.get(key);
        return state != null ? state.getState() : State.CLOSED;
    }

    private static class CircuitState {
        private final AtomicReference<State> state = new AtomicReference<>(State.CLOSED);
        private final AtomicInteger failureCount = new AtomicInteger(0);
        private volatile Instant openedAt;

        State getState() { return state.get(); }

        void transitionTo(State newState) {
            state.set(newState);
            if (newState == State.OPEN) {
                openedAt = Instant.now();
            }
        }

        int incrementFailures() {
            return failureCount.incrementAndGet();
        }

        void resetFailures() {
            failureCount.set(0);
        }

        boolean cooldownExpired(int cooldownSeconds) {
            return openedAt != null && 
                Instant.now().isAfter(openedAt.plusSeconds(cooldownSeconds));
        }
    }
}
