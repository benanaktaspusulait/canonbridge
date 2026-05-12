-- Dead Letter Queue Messages Table
CREATE TABLE IF NOT EXISTS dlq_messages (
    id VARCHAR(255) PRIMARY KEY,
    original_topic VARCHAR(255) NOT NULL,
    partition INTEGER,
    offset BIGINT,
    key VARCHAR(500),
    payload TEXT NOT NULL,
    error_message TEXT,
    error_stack_trace TEXT,
    failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    retry_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'FAILED',
    redrive_attempted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_dlq_messages_status ON dlq_messages(status);
CREATE INDEX idx_dlq_messages_failed_at ON dlq_messages(failed_at DESC);
CREATE INDEX idx_dlq_messages_original_topic ON dlq_messages(original_topic);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dlq_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dlq_messages_updated_at
    BEFORE UPDATE ON dlq_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_dlq_messages_updated_at();

-- Comments
COMMENT ON TABLE dlq_messages IS 'Dead Letter Queue for failed message processing';
COMMENT ON COLUMN dlq_messages.id IS 'Unique identifier for the DLQ message';
COMMENT ON COLUMN dlq_messages.original_topic IS 'Original Kafka topic where the message came from';
COMMENT ON COLUMN dlq_messages.status IS 'Status: FAILED, REDRIVING, REDRIVEN, PERMANENTLY_FAILED';
