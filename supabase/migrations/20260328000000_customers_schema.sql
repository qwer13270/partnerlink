-- ── Extend referral_conversions with customer contact fields ──────────────────
-- When a referral-attributed inquiry is submitted, store the visitor's contact
-- details directly on the conversion row so the merchant can see who came via KOL.
ALTER TABLE referral_conversions
  ADD COLUMN IF NOT EXISTS name              TEXT,
  ADD COLUMN IF NOT EXISTS phone             TEXT,
  ADD COLUMN IF NOT EXISTS email             TEXT,
  ADD COLUMN IF NOT EXISTS message           TEXT,
  ADD COLUMN IF NOT EXISTS deal_value        NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS deal_confirmed_at TIMESTAMPTZ;

-- ── Extend property_inquiries with deal confirmation fields ───────────────────
-- Merchant can "promote" a direct inquiry to a deal in place.
ALTER TABLE property_inquiries
  ADD COLUMN IF NOT EXISTS deal_value          NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS deal_confirmed_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kol_credit_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL;
