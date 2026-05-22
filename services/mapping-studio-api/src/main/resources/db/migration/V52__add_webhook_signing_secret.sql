-- K4 FIX: Separate webhook signing secret from webhook key.
-- The webhook key is used for authentication (identity), while the signing secret
-- is used for HMAC signature verification (integrity).

ALTER TABLE webhook_endpoints
ADD COLUMN IF NOT EXISTS signing_secret_encrypted TEXT;

COMMENT ON COLUMN webhook_endpoints.signing_secret_encrypted IS 'Envelope-encrypted HMAC signing secret. Used for verifying webhook payload signatures. Separate from the webhook key (used for auth).';
