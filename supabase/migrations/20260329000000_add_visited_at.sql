-- Add visited_at to track when a customer visited the property
-- Sits between inquiry (詢問中) and deal confirmation (已成交)

ALTER TABLE referral_conversions
  ADD COLUMN IF NOT EXISTS visited_at timestamptz DEFAULT NULL;

ALTER TABLE property_inquiries
  ADD COLUMN IF NOT EXISTS visited_at timestamptz DEFAULT NULL;
