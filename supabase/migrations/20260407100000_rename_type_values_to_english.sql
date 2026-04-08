-- Rename merchant/project type values from Chinese to English
-- 商案 → shop, 建案 → property

-- 1. Drop old constraints FIRST (before data migration)
ALTER TABLE public.merchant_profiles
  DROP CONSTRAINT IF EXISTS merchant_profiles_merchant_type_check;

ALTER TABLE public.merchant_applications
  DROP CONSTRAINT IF EXISTS merchant_applications_merchant_type_check;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_type_check;
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_template_key_check;
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS properties_template_key_check;

-- 2. Migrate data
UPDATE public.merchant_profiles    SET merchant_type = 'shop'     WHERE merchant_type = '商案';
UPDATE public.merchant_profiles    SET merchant_type = 'property' WHERE merchant_type = '建案';

UPDATE public.merchant_applications SET merchant_type = 'shop'     WHERE merchant_type = '商案';
UPDATE public.merchant_applications SET merchant_type = 'property' WHERE merchant_type = '建案';

UPDATE public.projects SET type = 'shop'     WHERE type = '商案';
UPDATE public.projects SET type = 'property' WHERE type = '建案';

-- 3. Add new constraints
ALTER TABLE public.merchant_profiles
  ADD CONSTRAINT merchant_profiles_merchant_type_check
    CHECK (merchant_type IN ('property', 'shop'));

ALTER TABLE public.merchant_applications
  ADD CONSTRAINT merchant_applications_merchant_type_check
    CHECK (merchant_type IN ('property', 'shop'));

ALTER TABLE public.projects
  ADD CONSTRAINT projects_type_check
    CHECK (type IN ('property', 'shop'));
