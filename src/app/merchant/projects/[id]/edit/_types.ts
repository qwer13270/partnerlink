import {
  ImageIcon,
  Tag,
  FileText,
  Sparkles,
  Activity,
  MapPin,
  Phone,
  PanelBottom,
  LayoutTemplate,
  Trees,
  Users,
  Building2,
  Palette,
} from 'lucide-react'
import type {
  PropertyContentItem,
  PropertyModule,
  PropertyModuleType,
  TongchuangTemplateContent,
} from '@/lib/property-template'

export type { PropertyContentItem, PropertyModule }

// ── Domain types ──────────────────────────────────────────────────────────────

export type ProjectImage = {
  id: string
  sectionKey: string
  url: string
  altText: string
  storagePath?: string
  sortOrder?: number
  isPending?: boolean
}

export type ProjectDetail = {
  id: string
  slug: string
  name: string
  publishStatus: 'draft' | 'published'
  collabDescription: string
  subtitle: string
  districtLabel: string
  completionBadge: string
  overviewTitle: string
  overviewBody: string
  featuresTitle: string
  progressTitle: string
  progressCompletionText: string
  locationTitle: string
  contactTitle: string
  contactBody: string
  salesPhone: string
  footerDisclaimer: string
  mapLat: number
  mapLng: number
  mapZoom: number
  images: ProjectImage[]
  contentItems: PropertyContentItem[]
  modules: PropertyModule[]
}

// ── Panel contract ────────────────────────────────────────────────────────────

/**
 * The standardised props interface every section panel component must satisfy.
 * This type is the key to the registry pattern — `SectionPanel` dispatches to
 * `PANEL_REGISTRY[module.moduleType]` and passes PanelProps straight through,
 * so adding a new module type never touches any if-else chain.
 */
export type PanelProps = {
  project: ProjectDetail
  module: PropertyModule
  uploadingSlot: string | null
  fallbackImages: TongchuangTemplateContent['images']
  imageBreaks: TongchuangTemplateContent['imageBreaks']
  onFieldChange: <K extends keyof ProjectDetail>(key: K, value: ProjectDetail[K]) => void
  onContentItemChange: (index: number, key: keyof PropertyContentItem, value: string | null) => void
  onModuleChange: (moduleId: string, updater: (m: PropertyModule) => PropertyModule) => void
  onModuleRemove: (moduleId: string) => void
  onImageUpload: (sectionKey: string, file: File | null, sortOrder?: number) => Promise<void>
  onImageDelete: (imageId: string) => Promise<void>
}

// ── Module display metadata ───────────────────────────────────────────────────

export type ModuleMeta = {
  label: string
  desc: string
  Icon: React.FC<{ className?: string }>
}

export const MODULE_META: Record<PropertyModuleType, ModuleMeta> = {
  intro_identity:  { label: '物件簡介', desc: '案名、地段與識別條帶',   Icon: Tag         },
  intro_specs:     { label: '建案介紹', desc: '建案文案與規格內容',     Icon: FileText    },
  features:        { label: '特色亮點', desc: '賣點卡片與圖片穿插',     Icon: Sparkles    },
  progress:        { label: '建案進度', desc: '時程節點與工程圖片',     Icon: Activity    },
  location:        { label: '地理位置', desc: '地圖與周邊設施資訊',     Icon: MapPin      },
  contact:         { label: '聯絡區塊', desc: '預約賞屋文案與聯絡資訊', Icon: Phone       },
  footer:          { label: '頁尾',     desc: '頁尾與免責聲明',         Icon: PanelBottom },
  image_section:   { label: '圖片模塊', desc: '可重複插入的圖片內容區塊', Icon: ImageIcon      },
  floor_plan:      { label: '格局規劃', desc: '戶型圖與房型規格總覽',     Icon: LayoutTemplate },
  surroundings:    { label: '周邊環境', desc: '社區周邊環境照片集',         Icon: Trees          },
  team:            { label: '團隊介紹', desc: '4–5 位核心團隊成員介紹',     Icon: Users          },
  indoor_commons:  { label: '室內公社', desc: '建築內部設施照片集',           Icon: Building2      },
  color_theme:     { label: '頁面顏色', desc: '選擇整體色彩風格',             Icon: Palette        },
}

// ── Image slot labels (used in alt text and edit UI) ─────────────────────────

export const IMAGE_SLOT_LABELS: Record<string, string> = {
  hero_1_desktop: '首屏圖（桌機）',
  hero_1_mobile:  '首屏圖（手機）',
  hero_2_desktop: '第二屏圖（桌機）',
  hero_2_mobile:  '第二屏圖（手機）',
  timeline_1: '節點 1',
  timeline_2: '節點 2',
  timeline_3: '節點 3',
  timeline_4: '節點 4',
  timeline_5: '節點 5',
  timeline_6: '節點 6',
  surroundings_1: '環境照 1',
  surroundings_2: '環境照 2',
  surroundings_3: '環境照 3',
  surroundings_4: '環境照 4',
  surroundings_5: '環境照 5',
  surroundings_6: '環境照 6',
}
