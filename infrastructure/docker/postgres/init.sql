-- ETL Solutions Database Initialization Script
-- PostgreSQL 15

-- Create extensions
-- P2: pg_stat_statements requires shared_preload_libraries='pg_stat_statements'
-- This is configured via PostgreSQL args in the StatefulSet manifest
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS etl;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set search path
SET search_path TO etl, public;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Events table (partitioned by created_at)
CREATE TABLE IF NOT EXISTS events (
    event_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    correlation_id UUID NOT NULL,
    partner_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    schema_version VARCHAR(10) NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    PRIMARY KEY (event_id, created_at),
    CONSTRAINT events_status_check CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
) PARTITION BY RANGE (created_at);

-- Create initial partitions (current + next 3 months for safety)
-- P1: Automatic partition management via CronJob (postgres-partition-manager)
CREATE TABLE events_2026_05 PARTITION OF events
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE events_2026_06 PARTITION OF events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE events_2026_07 PARTITION OF events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE events_2026_08 PARTITION OF events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(100) PRIMARY KEY,
    customer_id VARCHAR(100) NOT NULL,
    partner_id VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    order_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT orders_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

-- Idempotency table
CREATE TABLE IF NOT EXISTS idempotency_keys (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    event_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT idempotency_status_check CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED'))
);

-- Pending dependencies table
CREATE TABLE IF NOT EXISTS pending_dependencies (
    pending_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    depends_on_entity_type VARCHAR(50) NOT NULL,
    depends_on_entity_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP
);

-- Outbox table for transactional messaging
CREATE TABLE IF NOT EXISTS outbox (
    outbox_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    CONSTRAINT outbox_status_check CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
);

-- ============================================================================
-- AUDIT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit.event_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_partner_id ON events(partner_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_correlation_id ON events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_payload_gin ON events USING GIN (payload);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Idempotency indexes
CREATE INDEX IF NOT EXISTS idx_idempotency_event_id ON idempotency_keys(event_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency_keys(expires_at);

-- Pending dependencies indexes
CREATE INDEX IF NOT EXISTS idx_pending_event_id ON pending_dependencies(event_id);
CREATE INDEX IF NOT EXISTS idx_pending_depends_on ON pending_dependencies(depends_on_entity_type, depends_on_entity_id);
CREATE INDEX IF NOT EXISTS idx_pending_created_at ON pending_dependencies(created_at);

-- Outbox indexes
CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON outbox(created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox(aggregate_type, aggregate_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create monthly partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name := 'events_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := TO_CHAR(partition_date, 'YYYY-MM-DD');
    end_date := TO_CHAR(partition_date + INTERVAL '1 month', 'YYYY-MM-DD');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF events FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
    
    RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_keys
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on orders
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for pending events
CREATE OR REPLACE VIEW pending_events AS
SELECT 
    event_id,
    correlation_id,
    partner_id,
    event_type,
    entity_type,
    entity_id,
    created_at,
    retry_count
FROM events
WHERE status = 'PENDING'
ORDER BY created_at;

-- View for failed events
CREATE OR REPLACE VIEW failed_events AS
SELECT 
    event_id,
    correlation_id,
    partner_id,
    event_type,
    entity_type,
    entity_id,
    error_message,
    created_at,
    retry_count
FROM events
WHERE status = 'FAILED'
ORDER BY created_at DESC;

-- View for order statistics
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
    partner_id,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_amount,
    MIN(order_date) as first_order,
    MAX(order_date) as last_order
FROM orders
GROUP BY partner_id, status;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant permissions to canonbridge_user (from environment variable)
-- Note: The actual username comes from POSTGRES_USER environment variable
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'canonbridge_user') THEN
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA etl TO canonbridge_user;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA etl TO canonbridge_user;
        GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA etl TO canonbridge_user;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO canonbridge_user;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO canonbridge_user;
    END IF;
END
$$;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert sample partner configuration (optional)
-- This can be removed in production

COMMENT ON TABLE events IS 'Main events table storing all incoming events from partners';
COMMENT ON TABLE orders IS 'Orders table storing processed order information';
COMMENT ON TABLE order_items IS 'Order items table storing individual items in orders';
COMMENT ON TABLE idempotency_keys IS 'Idempotency keys for ensuring exactly-once processing';
COMMENT ON TABLE pending_dependencies IS 'Events waiting for dependencies to be resolved';
COMMENT ON TABLE outbox IS 'Outbox pattern table for transactional messaging';

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- Note: Autovacuum settings are managed at the database level for partitioned tables

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'ETL Solutions database initialized successfully';
    RAISE NOTICE 'Database: canonbridge_db';
    RAISE NOTICE 'User: canonbridge_user';
    RAISE NOTICE 'Schemas: etl, audit';
END $$;
