-- Add not_interested_at to track customers who are no longer interested
-- Sits alongside visited_at and deal_confirmed_at as a terminal status

ALTER TABLE referral_conversions
  ADD COLUMN IF NOT EXISTS not_interested_at timestamptz DEFAULT NULL;

ALTER TABLE property_inquiries
  ADD COLUMN IF NOT EXISTS not_interested_at timestamptz DEFAULT NULL;
