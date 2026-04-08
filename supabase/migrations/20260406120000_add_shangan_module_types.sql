-- Add 商案 module types to the property_modules module_type check constraint
ALTER TABLE property_modules
  DROP CONSTRAINT IF EXISTS property_modules_module_type_check;

ALTER TABLE property_modules
  ADD CONSTRAINT property_modules_module_type_check
  CHECK (module_type IN (
    -- 建案 module types
    'intro_identity',
    'intro_specs',
    'features',
    'progress',
    'location',
    'contact',
    'footer',
    'image_section',
    'floor_plan',
    'surroundings',
    'team',
    'indoor_commons',
    'color_theme',
    -- 商案 module types
    'shop_hero',
    'shop_products',
    'shop_about',
    'shop_features',
    'shop_gallery',
    'shop_faq',
    'shop_contact',
    'shop_footer'
  ));
