'use client'

import type { PropertyModuleType } from '@/lib/property-template'
import type { PanelProps } from '../_types'

import { IntroIdentityPanel } from './intro-identity'
import { IntroSpecsPanel }    from './intro-specs'
import { FeaturesPanel }      from './features'
import { ProgressPanel }      from './progress'
import { LocationPanel }      from './location'
import { ContactPanel }       from './contact'
import { FooterPanel }        from './footer'
import { ImageSectionPanel }  from './image-section'
import { FloorPlanPanel }     from './floor-plan'
import { SurroundingsPanel }  from './surroundings'
import { TeamPanel }          from './team'
import { IndoorCommonsPanel } from './indoor-commons'
import { ColorThemePanel }   from './color-theme'
import { ShopHeroPanel }     from './shop-hero'
import { ShopProductsPanel } from './shop-products'
import { ShopAboutPanel }    from './shop-about'
import { ShopFeaturesPanel } from './shop-features'
import { ShopGalleryPanel }  from './shop-gallery'
import { ShopFaqPanel }      from './shop-faq'
import { ShopContactPanel }  from './shop-contact'
import { ShopFooterPanel }   from './shop-footer'

// ── Panel registry ────────────────────────────────────────────────────────────
// To add a new module:
//   1. Create _panels/<module-name>.tsx exporting a component matching PanelProps
//   2. Import it above and add one line here

const PANEL_REGISTRY: Record<PropertyModuleType, React.FC<PanelProps>> = {
  intro_identity: IntroIdentityPanel,
  intro_specs:    IntroSpecsPanel,
  features:       FeaturesPanel,
  progress:       ProgressPanel,
  location:       LocationPanel,
  contact:        ContactPanel,
  footer:         FooterPanel,
  image_section:  ImageSectionPanel,
  floor_plan:     FloorPlanPanel,
  surroundings:   SurroundingsPanel,
  team:           TeamPanel,
  indoor_commons: IndoorCommonsPanel,
  color_theme:    ColorThemePanel,
  // 商案 panels
  shop_hero:     ShopHeroPanel,
  shop_products: ShopProductsPanel,
  shop_about:    ShopAboutPanel,
  shop_features: ShopFeaturesPanel,
  shop_gallery:  ShopGalleryPanel,
  shop_faq:      ShopFaqPanel,
  shop_contact:  ShopContactPanel,
  shop_footer:   ShopFooterPanel,
}

export function SectionPanel(props: PanelProps) {
  const Panel = PANEL_REGISTRY[props.module.moduleType]
  return <Panel {...props} />
}
