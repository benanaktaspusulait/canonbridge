-- V5-M2 FIX: Rename signing_secret_encrypted to signing_secret.
-- The column currently stores plaintext (encryption is a future enhancement).
-- Renaming removes the misleading "_encrypted" suffix.

ALTER TABLE webhook_endpoints
RENAME COLUMN signing_secret_encrypted TO signing_secret;

COMMENT ON COLUMN webhook_endpoints.signing_secret IS 'HMAC signing secret for webhook payload verification. Separate from webhook key (used for auth). Future: encrypt at rest using CredentialSecretCodec.';
