-- Add 'floor_plan' to the property_modules module_type check constraint

alter table public.property_modules
  drop constraint if exists property_modules_module_type_check;

alter table public.property_modules
  add constraint property_modules_module_type_check check (
    module_type in (
      'hero',
      'intro_identity',
      'intro_specs',
      'features',
      'progress',
      'location',
      'contact',
      'footer',
      'image_section',
      'floor_plan'
    )
  );

-- Update singleton unique index to also exclude floor_plan (non-singleton repeatable types)
-- floor_plan IS a singleton, so it stays covered by the existing index logic
-- The index excludes image_section (the only non-singleton); floor_plan is singleton so no change needed.
