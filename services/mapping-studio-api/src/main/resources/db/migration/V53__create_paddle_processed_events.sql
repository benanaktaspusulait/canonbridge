-- B-K5: Paddle webhook event idempotency table
-- Prevents duplicate processing of the same Paddle event (replay attacks, network retries)
CREATE TABLE IF NOT EXISTS paddle_processed_events (
    event_id    VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup of old events (retention policy)
CREATE INDEX IF NOT EXISTS idx_paddle_processed_events_processed_at
    ON paddle_processed_events (processed_at);

-- Comment
COMMENT ON TABLE paddle_processed_events IS 'Idempotency table for Paddle webhook events. Prevents duplicate processing.';
