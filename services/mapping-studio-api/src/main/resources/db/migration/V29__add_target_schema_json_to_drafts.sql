-- Add target_schema_json column to mapping_drafts.
-- This stores the mapping-specific version of the target schema,
-- including any field customizations (added/removed fields).
-- When published, this snapshot is frozen into mapping_versions.config_json.

ALTER TABLE mapping_drafts
ADD COLUMN IF NOT EXISTS target_schema_json JSONB;

COMMENT ON COLUMN mapping_drafts.target_schema_json IS 'Mapping-specific target schema snapshot (may differ from canonical schema if fields were added/removed)';

-- Add canonical_schema_json to mapping_versions for immutable schema snapshot
ALTER TABLE mapping_versions
ADD COLUMN IF NOT EXISTS canonical_schema_json JSONB;

COMMENT ON COLUMN mapping_versions.canonical_schema_json IS 'Frozen target schema at time of publish - immutable';
