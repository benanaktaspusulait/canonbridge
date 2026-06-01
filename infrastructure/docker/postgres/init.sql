-- CanonBridge PostgreSQL Initialization
-- This script runs ONCE on first container start (docker-entrypoint-initdb.d).
-- Schema management is owned by mapping-studio-api via Flyway migrations.
-- This file only creates extensions that require superuser privileges.

-- Extensions (require superuser, can't be created by Flyway)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Grant permissions to application user
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'canonbridge_user') THEN
        ALTER USER canonbridge_user CREATEDB;
        GRANT ALL PRIVILEGES ON DATABASE canonbridge_db TO canonbridge_user;
    END IF;
END
$$;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL initialized for CanonBridge (extensions only — schema managed by Flyway)';
END $$;
