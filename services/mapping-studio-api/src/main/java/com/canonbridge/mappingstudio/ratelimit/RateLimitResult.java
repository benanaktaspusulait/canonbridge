package com.canonbridge.mappingstudio.ratelimit;

public class RateLimitResult {
    private final boolean allowed;
    private final int limit;
    private final int remaining;
    private final long resetTime;
    private final long retryAfter;

    public RateLimitResult(boolean allowed, int limit, int remaining, long resetTime, long retryAfter) {
        this.allowed = allowed;
        this.limit = limit;
        this.remaining = remaining;
        this.resetTime = resetTime;
        this.retryAfter = retryAfter;
    }

    public boolean isAllowed() {
        return allowed;
    }

    public int getLimit() {
        return limit;
    }

    public int getRemaining() {
        return remaining;
    }

    public long getResetTime() {
        return resetTime;
    }

    public long getRetryAfter() {
        return retryAfter;
    }
}
