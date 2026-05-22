-- V5-L2 FIX: Add index for retention cleanup on paddle_processed_events.
-- Records older than 90 days can be safely deleted (idempotency window is 5 minutes).

CREATE INDEX IF NOT EXISTS idx_paddle_processed_events_processed_at
ON paddle_processed_events(processed_at);

COMMENT ON TABLE paddle_processed_events IS 'Paddle webhook idempotency table. Records older than 90 days should be purged by scheduled job.';
