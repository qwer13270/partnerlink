-- Refactor customer status from multiple timestamp columns into a single status column.
-- Status values: 'inquiring' | 'visited' | 'not_interested' | 'dealt'

-- ── referral_conversions ────────────────────────────────────────────────────
ALTER TABLE referral_conversions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'inquiring';

-- Backfill from existing columns (order matters: dealt takes priority over visited)
UPDATE referral_conversions SET status = 'visited'       WHERE visited_at IS NOT NULL AND deal_confirmed_at IS NULL;
UPDATE referral_conversions SET status = 'dealt'         WHERE deal_confirmed_at IS NOT NULL;

ALTER TABLE referral_conversions DROP COLUMN IF EXISTS visited_at;

-- ── property_inquiries ──────────────────────────────────────────────────────
ALTER TABLE property_inquiries
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'inquiring';

UPDATE property_inquiries SET status = 'visited'         WHERE visited_at IS NOT NULL AND deal_confirmed_at IS NULL;
UPDATE property_inquiries SET status = 'dealt'           WHERE deal_confirmed_at IS NOT NULL;

ALTER TABLE property_inquiries DROP COLUMN IF EXISTS visited_at;
