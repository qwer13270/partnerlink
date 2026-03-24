-- Add 'surroundings' to the property_modules module_type check constraint
ALTER TABLE property_modules
  DROP CONSTRAINT IF EXISTS property_modules_module_type_check;

ALTER TABLE property_modules
  ADD CONSTRAINT property_modules_module_type_check
  CHECK (module_type IN (
    'intro_identity',
    'intro_specs',
    'features',
    'progress',
    'location',
    'contact',
    'footer',
    'image_section',
    'floor_plan',
    'surroundings'
  ));
