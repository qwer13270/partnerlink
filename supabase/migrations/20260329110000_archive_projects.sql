-- Soft-delete (archive) support for properties.
-- When a merchant "deletes" a project it is archived, not hard-deleted,
-- so all customer, commission, and KOL history is preserved.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS is_archived  BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at  TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_not_archived
  ON properties (merchant_user_id, is_archived, updated_at DESC);
