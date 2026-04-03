import { pinyin } from 'pinyin-pro'

export const PROPERTY_TEMPLATE_KEY = 'tongchuang-wing' as const
export const PROPERTY_TEMPLATE_KEYS = ['tongchuang-wing', 'tongchuang-wing-commercial'] as const
export type PropertyTemplateKey = (typeof PROPERTY_TEMPLATE_KEYS)[number]

// ── Colour themes ─────────────────────────────────────────────────────────────

export const PROPERTY_THEMES = {
  'dark-gold': {
    '--p-bg':           '#0D0D0E',
    '--p-bg-card':      '#111113',
    '--p-bg-2':         '#141416',
    '--p-bg-contact':   '#1C1C1F',
    '--p-accent':       '#C9A96E',
    '--p-accent-lt':    '#E8D5AA',
    '--p-text':         '#FAFAF8',
    '--p-text-muted':   '#8A8680',
    '--p-text-warm':    '#F0EDE8',
    '--p-text-ghost':   '#5A574F',
    '--p-border':       '#1E1E20',
    '--p-ghost':        '#1C1C1E',
  },
  'ivory': {
    '--p-bg':           '#FAF8F3',
    '--p-bg-card':      '#F0EAE0',
    '--p-bg-2':         '#EEE8DC',
    '--p-bg-contact':   '#E8E0CC',
    '--p-accent':       '#8B5E2C',
    '--p-accent-lt':    '#C49A6A',
    '--p-text':         '#1A1410',
    '--p-text-muted':   '#6A5C50',
    '--p-text-warm':    '#2C2018',
    '--p-text-ghost':   '#9A8A78',
    '--p-border':       '#DDD0BC',
    '--p-ghost':        '#C8BEA8',
  },
  'graphite': {
    '--p-bg':           '#0A0E14',
    '--p-bg-card':      '#111820',
    '--p-bg-2':         '#141E28',
    '--p-bg-contact':   '#0E1820',
    '--p-accent':       '#4A9ECC',
    '--p-accent-lt':    '#8EC4E0',
    '--p-text':         '#E8EEF4',
    '--p-text-muted':   '#6A8090',
    '--p-text-warm':    '#D8E4F0',
    '--p-text-ghost':   '#4A6070',
    '--p-border':       '#1A2432',
    '--p-ghost':        '#1A2230',
  },
  'vermillion': {
    '--p-bg':           '#0E0A0A',
    '--p-bg-card':      '#151010',
    '--p-bg-2':         '#1A1212',
    '--p-bg-contact':   '#1E1414',
    '--p-accent':       '#C46058',
    '--p-accent-lt':    '#E09888',
    '--p-text':         '#FAF2F0',
    '--p-text-muted':   '#8A7472',
    '--p-text-warm':    '#F0E8E6',
    '--p-text-ghost':   '#6A5050',
    '--p-border':       '#201818',
    '--p-ghost':        '#1C1414',
  },
  'cloud': {
    '--p-bg':           '#F5F5F3',
    '--p-bg-card':      '#EDEDE8',
    '--p-bg-2':         '#E8E8E0',
    '--p-bg-contact':   '#DDE8E0',
    '--p-accent':       '#5C7A6A',
    '--p-accent-lt':    '#90AE9E',
    '--p-text':         '#1C1C1A',
    '--p-text-muted':   '#6A6A64',
    '--p-text-warm':    '#2C2C28',
    '--p-text-ghost':   '#8A8A80',
    '--p-border':       '#D8D8D0',
    '--p-ghost':        '#C8C8C0',
  },
} as const

export type PropertyThemeKey = keyof typeof PROPERTY_THEMES
export const DEFAULT_THEME_KEY: PropertyThemeKey = 'dark-gold'

export const PROPERTY_FONT_THEMES = {
  editorial: {
    '--p-font-display': 'var(--font-serif-tc-base)',
    '--p-font-body': 'var(--font-sans-tc-base)',
    '--font-serif': 'var(--font-serif-base)',
    '--font-serif-tc': 'var(--font-serif-tc-base)',
    '--font-sans': 'var(--font-sans-base)',
    '--font-sans-tc': 'var(--font-sans-tc-base)',
  },
  modern: {
    '--p-font-display': 'var(--font-sans-tc-base)',
    '--p-font-body': 'var(--font-sans-tc-base)',
    '--font-serif': 'var(--font-sans-base)',
    '--font-serif-tc': 'var(--font-sans-tc-base)',
    '--font-sans': 'var(--font-sans-base)',
    '--font-sans-tc': 'var(--font-sans-tc-base)',
  },
} as const

export type PropertyFontKey = keyof typeof PROPERTY_FONT_THEMES
export const DEFAULT_FONT_KEY: PropertyFontKey = 'editorial'

export const PROPERTY_PUBLISH_STATUSES = ['draft', 'published'] as const
export type PropertyPublishStatus = (typeof PROPERTY_PUBLISH_STATUSES)[number]

export const PROPERTY_CONTENT_GROUPS = [
  'identity_specs',
  'intro_specs',
  'feature_cards',
  'timeline_items',
  'location_points',
  'floor_plan_units',
  'team_members',
] as const
export type PropertyContentGroupKey = (typeof PROPERTY_CONTENT_GROUPS)[number]

export const PROPERTY_IMAGE_SLOTS = [
  'timeline_1',
  'timeline_2',
  'timeline_3',
  'timeline_4',
  'timeline_5',
  'timeline_6',
] as const
export type PropertyImageSlot = (typeof PROPERTY_IMAGE_SLOTS)[number]

export const TONGCHUANG_SECTION_KEYS = [
  'intro_identity',
  'intro_specs',
  'features',
  'progress',
  'location',
  'contact',
  'footer',
] as const
export type TongchuangEditableSectionKey = (typeof TONGCHUANG_SECTION_KEYS)[number]

export const PROPERTY_MODULE_TYPES = [
  ...TONGCHUANG_SECTION_KEYS,
  'image_section',
  'floor_plan',
  'surroundings',
  'team',
  'indoor_commons',
  'color_theme',
] as const
export type PropertyModuleType = (typeof PROPERTY_MODULE_TYPES)[number]

export type PropertyContentItem = {
  id?: string
  groupKey: PropertyContentGroupKey
  itemKey: string | null
  title: string | null
  body: string | null
  meta: string | null
  accent: string | null
  state: 'completed' | 'current' | 'upcoming' | null
  sortOrder: number
}

export type HeroSlide = {
  slideKey: string
  sortOrder: number
  desktop: { url: string; alt: string }
  mobile: { url: string; alt: string }
}

export type PropertyModuleSettings = {
  title?: string | null
  body?: string | null
  primaryImageSectionKey?: string | null
  secondaryImageSectionKey?: string | null
  floorPlanUnitCount?: 3 | 4 | 5
  teamMemberCount?: 4 | 5
  captions?: Record<string, string>
  themeKey?: string
  fontKey?: string
}

export type PropertyModule = {
  id: string
  moduleType: PropertyModuleType
  sortOrder: number
  isVisible: boolean
  settings: PropertyModuleSettings
}

type PropertyModuleDefinition = {
  type: PropertyModuleType
  label: string
  singleton: boolean
  pinned: boolean
  defaultVisible: boolean
  legacySectionKey: TongchuangEditableSectionKey | null
}

export const PROPERTY_MODULE_REGISTRY: Record<PropertyModuleType, PropertyModuleDefinition> = {
  intro_identity: {
    type: 'intro_identity',
    label: '物件簡介',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: 'intro_identity',
  },
  intro_specs: {
    type: 'intro_specs',
    label: '建案介紹',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: 'intro_specs',
  },
  features: {
    type: 'features',
    label: '特色亮點',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: 'features',
  },
  progress: {
    type: 'progress',
    label: '建案進度',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: 'progress',
  },
  location: {
    type: 'location',
    label: '地理位置',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: 'location',
  },
  contact: {
    type: 'contact',
    label: '聯絡區塊',
    singleton: true,
    pinned: true,
    defaultVisible: true,
    legacySectionKey: 'contact',
  },
  footer: {
    type: 'footer',
    label: '頁尾',
    singleton: true,
    pinned: true,
    defaultVisible: true,
    legacySectionKey: 'footer',
  },
  image_section: {
    type: 'image_section',
    label: '圖片模塊',
    singleton: false,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: null,
  },
  floor_plan: {
    type: 'floor_plan',
    label: '格局規劃',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: null,
  },
  surroundings: {
    type: 'surroundings',
    label: '周邊環境',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: null,
  },
  team: {
    type: 'team',
    label: '團隊介紹',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: null,
  },
  indoor_commons: {
    type: 'indoor_commons',
    label: '室內公社',
    singleton: true,
    pinned: false,
    defaultVisible: true,
    legacySectionKey: null,
  },
  color_theme: {
    type: 'color_theme',
    label: '頁面顏色',
    singleton: true,
    pinned: false,
    defaultVisible: false,
    legacySectionKey: null,
  },
}

export type TongchuangTemplateModule = {
  id: string
  moduleType: PropertyModuleType
  label: string
  isVisible: boolean
  sortOrder: number
  pinned: boolean
  sectionKey: TongchuangEditableSectionKey | null
  settings: PropertyModuleSettings
  imageSection?: {
    title: string
    body: string
    primaryImage: { sectionKey: string; url: string; alt: string } | null
    secondaryImage: { sectionKey: string; url: string; alt: string } | null
  }
}

export type TongchuangTemplateContent = {
  id: string
  slug: string
  templateKey: typeof PROPERTY_TEMPLATE_KEY
  publishStatus: PropertyPublishStatus
  name: string
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
  navLinks: Array<{ label: string; href: string }>
  images: Record<PropertyImageSlot, { url: string; alt: string }>
  heroSlides: HeroSlide[]
  imageBreaks: Partial<Record<TongchuangEditableSectionKey, Array<{ sectionKey: string; url: string; alt: string }>>>
  identitySpecs: Array<{ itemKey: string | null; title: string; body: string }>
  introSpecs: Array<{ itemKey: string | null; title: string; body: string }>
  featureCards: Array<{ itemKey: string | null; accent: string; title: string; body: string }>
  timelineItems: Array<{
    itemKey: string | null
    title: string
    meta: string
    body: string
    state: 'completed' | 'current' | 'upcoming'
    imageUrl: string
  }>
  locationPoints: Array<{
    itemKey: string | null
    title: string
    body: string
    accent: string
  }>
  floorPlanTitle: string
  floorPlanUnits: Array<{
    itemKey: string | null
    title: string
    body: string
    meta: string
    accent: string
    imageUrl: string | null
    unitNumber: string
  }>
  surroundingsTitle: string
  surroundingsImages: Array<{ sectionKey: string; url: string; alt: string; caption: string }>
  teamTitle: string
  teamMembers: Array<{
    itemKey: string | null
    name: string
    role: string
    intro: string
    imageUrl: string | null
  }>
  indoorCommonsTitle: string
  indoorAmenities: Array<{ sectionKey: string; url: string; alt: string; label: string }>
  colorTheme: PropertyThemeKey
  fontTheme: PropertyFontKey
  modules: TongchuangTemplateModule[]
}

type TongchuangTemplateSource = {
  id: string
  slug: string
  publishStatus: PropertyPublishStatus
  name: string | null
  subtitle: string | null
  districtLabel: string | null
  completionBadge: string | null
  overviewTitle: string | null
  overviewBody: string | null
  featuresTitle: string | null
  progressTitle: string | null
  progressCompletionText: string | null
  locationTitle: string | null
  contactTitle: string | null
  contactBody: string | null
  salesPhone: string | null
  footerDisclaimer: string | null
  mapLat: number | null
  mapLng: number | null
  mapZoom: number | null
}

type TongchuangImageSource = {
  sectionKey: string
  url: string
  altText: string
  sortOrder?: number
}

export const DEFAULT_PROPERTY_FIELDS = {
  name: '統創翼',
  subtitle: 'Phoenix One',
  districtLabel: '大安 · 忠孝新生 · Taipei',
  completionBadge: '2026 Q1',
  overviewTitle: '城市天際的精品美學',
  overviewBody:
    '每一個細節，都是對居住品質的極致承諾。\n鋼骨雙制震，黃金級綠建築，天際視野留白從容。',
  featuresTitle: '卓越的居住體驗',
  progressTitle: '建設進程一覽',
  progressCompletionText: '預計竣工 2026 Q1',
  locationTitle: '台北核心黃金地段',
  contactTitle: '開啟您的頂級居住旅程',
  contactBody: '專屬顧問將於 24 小時內與您聯繫，安排私人賞屋行程。',
  salesPhone: '02-2752-8628',
  footerDisclaimer:
    '本廣告圖為建築3D環境合成示意圖，實際外觀依主管機關核准圖說為準。廣告內容依相關法規規範，建案詳情請洽銷售人員確認。',
  mapLat: 25.040314,
  mapLng: 121.537053,
  mapZoom: 15,
} as const

export const DEFAULT_NAV_LINKS = [
  { label: '建案介紹', href: '#intro' },
  { label: '特色亮點', href: '#features' },
  { label: '工程進度', href: '#progress' },
  { label: '地理位置', href: '#location' },
  { label: '預約賞屋', href: '#contact' },
] as const

export const DEFAULT_PROPERTY_IMAGE_URLS: Record<PropertyImageSlot, { url: string; alt: string }> = {
  timeline_1: { url: '/images/placeholders/exterior/exterior-1.webp', alt: '建照取得' },
  timeline_2: { url: '/images/placeholders/projects/project-1.webp', alt: '動工開工' },
  timeline_3: { url: '/images/placeholders/projects/project-2.webp', alt: '基礎工程' },
  timeline_4: { url: '/images/placeholders/projects/project-3.webp', alt: '結構體工程' },
  timeline_5: { url: '/images/placeholders/interior/interior-1.webp', alt: '室內裝修' },
  timeline_6: { url: '/images/placeholders/interior/interior-3.webp', alt: '驗收交屋' },
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    slideKey: 'hero_1',
    sortOrder: 0,
    desktop: { url: '/images/properties/tongchuang-wing/1.jpg', alt: '統創翼首屏建築形象' },
    mobile: { url: '/images/properties/tongchuang-wing/3.jpg', alt: '統創翼首屏建築形象' },
  },
  {
    slideKey: 'hero_2',
    sortOrder: 1,
    desktop: { url: '/images/properties/tongchuang-wing/2.jpg', alt: '統創翼建築外觀' },
    mobile: { url: '/images/properties/tongchuang-wing/4.jpg', alt: '統創翼建築外觀' },
  },
]

export const DEFAULT_PROPERTY_CONTENT_ITEMS: PropertyContentItem[] = [
  { groupKey: 'identity_specs', itemKey: 'address', title: '地段', body: '濟南路三段 67 號', meta: null, accent: null, state: null, sortOrder: 0 },
  { groupKey: 'identity_specs', itemKey: 'product', title: '產品', body: '35–58 坪 · 2–3 房', meta: null, accent: null, state: null, sortOrder: 1 },
  { groupKey: 'identity_specs', itemKey: 'structure', title: '結構', body: 'SC 鋼骨雙制震', meta: null, accent: null, state: null, sortOrder: 2 },
  { groupKey: 'identity_specs', itemKey: 'hotline', title: '專線', body: '02-2752-8628', meta: null, accent: null, state: null, sortOrder: 3 },
  { groupKey: 'intro_specs', itemKey: 'size-plan', title: '坪數規劃', body: '30 · 42 · 50 坪', meta: null, accent: null, state: null, sortOrder: 0 },
  { groupKey: 'intro_specs', itemKey: 'layout', title: '房型配置', body: '精奢 2–3 房', meta: null, accent: null, state: null, sortOrder: 1 },
  { groupKey: 'intro_specs', itemKey: 'structure', title: '抗震結構', body: 'SC 鋼骨雙制震', meta: null, accent: null, state: null, sortOrder: 2 },
  { groupKey: 'intro_specs', itemKey: 'floors', title: '樓層', body: '地上 22 層', meta: null, accent: null, state: null, sortOrder: 3 },
  { groupKey: 'intro_specs', itemKey: 'green-building', title: '綠建築', body: '黃金級目標', meta: null, accent: null, state: null, sortOrder: 4 },
  { groupKey: 'intro_specs', itemKey: 'sales-center', title: '接待中心', body: '市民大道三段 198 號 7F', meta: null, accent: null, state: null, sortOrder: 5 },
  { groupKey: 'feature_cards', itemKey: 'feature-1', title: 'SC 鋼骨雙制震', body: '頂級鋼骨結構搭配雙重制震系統，給您和家人最安心的保障。', meta: null, accent: '01', state: null, sortOrder: 0 },
  { groupKey: 'feature_cards', itemKey: 'feature-2', title: '忠孝新生捷運', body: '步行即達，板南線與新店線交會，串聯台北全域。', meta: null, accent: '02', state: null, sortOrder: 1 },
  { groupKey: 'feature_cards', itemKey: 'feature-3', title: '城市天際視野', body: '對望空總綠地，台北盆地全景盡收眼底，留白而從容。', meta: null, accent: '03', state: null, sortOrder: 2 },
  { groupKey: 'timeline_items', itemKey: 'timeline_1', title: '建照取得', body: '建造執照核發，正式取得合法建築許可。', meta: '2022 Q4', accent: null, state: 'completed', sortOrder: 0 },
  { groupKey: 'timeline_items', itemKey: 'timeline_2', title: '動工開工', body: '開工典禮暨地基開挖作業啟動。', meta: '2023 Q2', accent: null, state: 'completed', sortOrder: 1 },
  { groupKey: 'timeline_items', itemKey: 'timeline_3', title: '基礎工程', body: '樁基礎與地下室結構完工，驗收通過。', meta: '2023 Q4', accent: null, state: 'completed', sortOrder: 2 },
  { groupKey: 'timeline_items', itemKey: 'timeline_4', title: '結構體工程', body: 'SC 鋼骨主結構持續施工中，目前進度約 60%。', meta: '2024 Q3', accent: null, state: 'current', sortOrder: 3 },
  { groupKey: 'timeline_items', itemKey: 'timeline_5', title: '室內裝修', body: '精裝修工程預計 2025 Q3 啟動。', meta: '2025 Q3', accent: null, state: 'upcoming', sortOrder: 4 },
  { groupKey: 'timeline_items', itemKey: 'timeline_6', title: '驗收交屋', body: '全棟驗收完成，預計 2026 Q1 正式交屋。', meta: '2026 Q1', accent: null, state: 'upcoming', sortOrder: 5 },
  { groupKey: 'location_points', itemKey: 'location-1', title: '忠孝新生站（板南線）', body: '3 分鐘步行', meta: null, accent: '#0070BD', state: null, sortOrder: 0 },
  { groupKey: 'location_points', itemKey: 'location-2', title: '忠孝新生站（新店線）', body: '3 分鐘步行', meta: null, accent: '#EF4723', state: null, sortOrder: 1 },
  { groupKey: 'location_points', itemKey: 'location-3', title: '帝寶商圈', body: '5 分鐘', meta: null, accent: '#C9A96E', state: null, sortOrder: 2 },
  { groupKey: 'location_points', itemKey: 'location-4', title: '元利One Park', body: '10 分鐘', meta: null, accent: '#4A7C8E', state: null, sortOrder: 3 },
  { groupKey: 'location_points', itemKey: 'location-5', title: '台北大安森林公園', body: '8 分鐘', meta: null, accent: '#6A8A60', state: null, sortOrder: 4 },
  { groupKey: 'floor_plan_units', itemKey: 'unit_a', title: 'A 型', body: '2 房 2 廳', meta: '22 坪', accent: 'NT$1,680 萬', state: null, sortOrder: 0 },
  { groupKey: 'floor_plan_units', itemKey: 'unit_b', title: 'B 型', body: '3 房 2 廳', meta: '30 坪', accent: 'NT$2,280 萬', state: null, sortOrder: 1 },
  { groupKey: 'floor_plan_units', itemKey: 'unit_c', title: 'C 型', body: '3 房 2 廳 2 衛', meta: '38 坪', accent: 'NT$2,880 萬', state: null, sortOrder: 2 },
  { groupKey: 'floor_plan_units', itemKey: 'unit_d', title: 'D 型', body: '4 房 2 廳 2 衛', meta: '48 坪', accent: 'NT$3,680 萬', state: null, sortOrder: 3 },
  { groupKey: 'team_members', itemKey: 'member_1', title: '陳志豪', body: '從業逾二十年，深耕北市精品住宅市場，主導逾 30 個指標性建案。', meta: '執行總監', accent: null, state: null, sortOrder: 0 },
  { groupKey: 'team_members', itemKey: 'member_2', title: '林雅涵', body: '專精室內設計整合與建材選配，打造細節卓越的居住空間。', meta: '設計總監', accent: null, state: null, sortOrder: 1 },
  { groupKey: 'team_members', itemKey: 'member_3', title: '王建明', body: '結構工程師出身，主導鋼骨制震工法導入，安全品質零妥協。', meta: '工程副總', accent: null, state: null, sortOrder: 2 },
  { groupKey: 'team_members', itemKey: 'member_4', title: '吳佩芸', body: '負責買方關係與交屋服務，以同理心陪伴每位客戶完成置產旅程。', meta: '客戶關係總監', accent: null, state: null, sortOrder: 3 },
  { groupKey: 'team_members', itemKey: 'member_5', title: '蔡冠宇', body: '法務與合規專家，確保每筆交易符合最高法律標準，保障買方權益。', meta: '法務長', accent: null, state: null, sortOrder: 4 },
]

const DEFAULT_MODULE_ORDER: PropertyModuleType[] = [
  'intro_identity',
  'intro_specs',
  'features',
  'progress',
  'location',
  'contact',
  'footer',
]

const IMAGE_BREAK_SECTIONS = 'intro_identity|intro_specs|features|progress|location|contact'
const IMAGE_BREAK_PATTERN = new RegExp(`^after_(${IMAGE_BREAK_SECTIONS})_(\\d+)$`)
const MODULE_IMAGE_SLOT_PATTERN = /^module_([a-f0-9-]+)_(primary|secondary)$/

export function getDefaultPropertyInsert() {
  return {
    templateKey: PROPERTY_TEMPLATE_KEY,
    publishStatus: 'draft' as const,
    ...DEFAULT_PROPERTY_FIELDS,
  }
}

export function cloneDefaultContentItems() {
  return DEFAULT_PROPERTY_CONTENT_ITEMS.map((item) => ({ ...item }))
}

export function getModuleDefinition(type: PropertyModuleType) {
  return PROPERTY_MODULE_REGISTRY[type]
}

export function createDefaultPropertyModules() {
  const firstImageModule = createImageSectionModule()
  firstImageModule.settings = {
    ...firstImageModule.settings,
    primaryImageSectionKey: 'hero_1_desktop',
    secondaryImageSectionKey: '',
  }

  const secondImageModule = createImageSectionModule()
  secondImageModule.settings = {
    ...secondImageModule.settings,
    primaryImageSectionKey: 'hero_2_desktop',
    secondaryImageSectionKey: '',
  }

  return [
    { ...firstImageModule, sortOrder: 0 },
    { ...secondImageModule, sortOrder: 1 },
    ...DEFAULT_MODULE_ORDER.map((moduleType, index) => ({
      id: crypto.randomUUID(),
      moduleType,
      sortOrder: index + 2,
      isVisible: true,
      settings: {},
    })),
  ] satisfies PropertyModule[]
}

export function createImageSectionModule() {
  const id = crypto.randomUUID()
  return {
    id,
    moduleType: 'image_section' as const,
    sortOrder: 0,
    isVisible: true,
    settings: {
      title: '',
      body: '',
      primaryImageSectionKey: getImageSectionSlotKey(id, 'primary'),
      secondaryImageSectionKey: getImageSectionSlotKey(id, 'secondary'),
    },
  }
}

export function getImageSectionSlotKey(moduleId: string, slot: 'primary' | 'secondary') {
  return `module_${moduleId}_${slot}`
}

export function parsePublishStatus(value: unknown): PropertyPublishStatus {
  return value === 'published' ? 'published' : 'draft'
}

const FLOOR_PLAN_IMAGE_PATTERN = /^floor_plan_unit_[a-e]$/
const SURROUNDINGS_IMAGE_PATTERN = /^surroundings_[1-6]$/
const TEAM_IMAGE_PATTERN = /^team_member_[1-5]$/
const INDOOR_IMAGE_PATTERN = /^indoor_[1-6]$/

export function isPropertyImageSlot(value: string): boolean {
  return (
    PROPERTY_IMAGE_SLOTS.includes(value as PropertyImageSlot) ||
    /^hero_\d+_(desktop|mobile)$/.test(value) ||
    IMAGE_BREAK_PATTERN.test(value) ||
    MODULE_IMAGE_SLOT_PATTERN.test(value) ||
    FLOOR_PLAN_IMAGE_PATTERN.test(value) ||
    SURROUNDINGS_IMAGE_PATTERN.test(value) ||
    TEAM_IMAGE_PATTERN.test(value) ||
    INDOOR_IMAGE_PATTERN.test(value)
  )
}

export function isEnglishSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function slugifyPropertyName(value: string) {
  // Transliterate CJK characters to pinyin before slugifying
  const transliterated = pinyin(value, { toneType: 'none', separator: ' ', nonZh: 'consecutive' })

  const ascii = transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return ascii || 'merchant-project'
}

export function buildTongchuangTemplateContent(
  property: TongchuangTemplateSource,
  images: TongchuangImageSource[],
  contentItems: PropertyContentItem[],
  modules: PropertyModule[] = createDefaultPropertyModules(),
): TongchuangTemplateContent {
  const grouped = groupContentItems(contentItems.length > 0 ? contentItems : cloneDefaultContentItems())
  const imageMap = new Map(images.map((image) => [image.sectionKey, image]))

  const normalizedImages = Object.fromEntries(
    Object.entries(DEFAULT_PROPERTY_IMAGE_URLS).map(([key, fallback]) => {
      const uploaded = imageMap.get(key)
      return [
        key,
        {
          url: uploaded?.url ?? fallback.url,
          alt: uploaded?.altText || fallback.alt,
        },
      ]
    }),
  ) as TongchuangTemplateContent['images']

  const heroDesktopImages = images
    .filter((img) => /^hero_\d+_desktop$/.test(img.sectionKey))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const heroSlides: HeroSlide[] = heroDesktopImages.length > 0
    ? heroDesktopImages.map((desktopImg, index) => {
        const n = desktopImg.sectionKey.match(/^hero_(\d+)_desktop$/)?.[1] ?? '1'
        const mobileImg = imageMap.get(`hero_${n}_mobile`)
        const defaultSlide = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length]
        return {
          slideKey: `hero_${n}`,
          sortOrder: desktopImg.sortOrder ?? 0,
          desktop: { url: desktopImg.url || defaultSlide.desktop.url, alt: desktopImg.altText || '' },
          mobile: mobileImg
            ? { url: mobileImg.url || defaultSlide.mobile.url, alt: mobileImg.altText || '' }
            : defaultSlide.mobile,
        }
      })
    : DEFAULT_HERO_SLIDES

  const imageBreaks: Partial<Record<TongchuangEditableSectionKey, Array<{ sectionKey: string; url: string; alt: string }>>> = {}
  for (const img of images) {
    const match = img.sectionKey.match(IMAGE_BREAK_PATTERN)
    if (match && img.url) {
      const sectionKey = match[1] as TongchuangEditableSectionKey
      if (!imageBreaks[sectionKey]) imageBreaks[sectionKey] = []
      imageBreaks[sectionKey]!.push({ sectionKey: img.sectionKey, url: img.url, alt: img.altText || '' })
    }
  }

  const normalizedModules = normalizeModules(modules)
  const templateModules = normalizedModules.map((module) => {
    const definition = getModuleDefinition(module.moduleType)
    if (module.moduleType === 'image_section') {
      const primaryKey = module.settings.primaryImageSectionKey || getImageSectionSlotKey(module.id, 'primary')
      const secondaryKey = module.settings.secondaryImageSectionKey || getImageSectionSlotKey(module.id, 'secondary')
      const primaryImage = imageMap.get(primaryKey)
      const secondaryImage = imageMap.get(secondaryKey)

      return {
        id: module.id,
        moduleType: module.moduleType,
        label: definition.label,
        isVisible: module.isVisible,
        sortOrder: module.sortOrder,
        pinned: definition.pinned,
        sectionKey: null,
        settings: {
          ...module.settings,
          primaryImageSectionKey: primaryKey,
          secondaryImageSectionKey: secondaryKey,
        },
        imageSection: {
          title: module.settings.title?.trim() ?? '',
          body: module.settings.body?.trim() ?? '',
          primaryImage: primaryImage
            ? { sectionKey: primaryKey, url: primaryImage.url, alt: primaryImage.altText || '' }
            : null,
          secondaryImage: secondaryImage
            ? { sectionKey: secondaryKey, url: secondaryImage.url, alt: secondaryImage.altText || '' }
            : null,
        },
      } satisfies TongchuangTemplateModule
    }

    return {
      id: module.id,
      moduleType: module.moduleType,
      label: definition.label,
      isVisible: module.isVisible,
      sortOrder: module.sortOrder,
      pinned: definition.pinned,
      sectionKey: definition.legacySectionKey,
      settings: module.settings,
    } satisfies TongchuangTemplateModule
  })

  return {
    id: property.id,
    slug: property.slug,
    templateKey: PROPERTY_TEMPLATE_KEY,
    publishStatus: property.publishStatus,
    name: property.name || DEFAULT_PROPERTY_FIELDS.name,
    subtitle: property.subtitle ?? DEFAULT_PROPERTY_FIELDS.subtitle,
    districtLabel: property.districtLabel ?? DEFAULT_PROPERTY_FIELDS.districtLabel,
    completionBadge: property.completionBadge ?? DEFAULT_PROPERTY_FIELDS.completionBadge,
    overviewTitle: property.overviewTitle ?? DEFAULT_PROPERTY_FIELDS.overviewTitle,
    overviewBody: property.overviewBody ?? DEFAULT_PROPERTY_FIELDS.overviewBody,
    featuresTitle: property.featuresTitle ?? DEFAULT_PROPERTY_FIELDS.featuresTitle,
    progressTitle: property.progressTitle ?? DEFAULT_PROPERTY_FIELDS.progressTitle,
    progressCompletionText:
      property.progressCompletionText ?? DEFAULT_PROPERTY_FIELDS.progressCompletionText,
    locationTitle: property.locationTitle ?? DEFAULT_PROPERTY_FIELDS.locationTitle,
    contactTitle: property.contactTitle ?? DEFAULT_PROPERTY_FIELDS.contactTitle,
    contactBody: property.contactBody ?? DEFAULT_PROPERTY_FIELDS.contactBody,
    salesPhone: property.salesPhone ?? DEFAULT_PROPERTY_FIELDS.salesPhone,
    footerDisclaimer: property.footerDisclaimer ?? DEFAULT_PROPERTY_FIELDS.footerDisclaimer,
    mapLat: coerceNumber(property.mapLat, DEFAULT_PROPERTY_FIELDS.mapLat),
    mapLng: coerceNumber(property.mapLng, DEFAULT_PROPERTY_FIELDS.mapLng),
    mapZoom: coerceNumber(property.mapZoom, DEFAULT_PROPERTY_FIELDS.mapZoom),
    navLinks: [...DEFAULT_NAV_LINKS],
    images: normalizedImages,
    heroSlides,
    imageBreaks,
    identitySpecs: grouped.identity_specs.map((item) => ({
      itemKey: item.itemKey,
      title: item.title ?? '',
      body: item.body ?? '',
    })),
    introSpecs: grouped.intro_specs.map((item) => ({
      itemKey: item.itemKey,
      title: item.title ?? '',
      body: item.body ?? '',
    })),
    featureCards: grouped.feature_cards.map((item, index) => ({
      itemKey: item.itemKey,
      accent: item.accent ?? String(index + 1).padStart(2, '0'),
      title: item.title ?? '',
      body: item.body ?? '',
    })),
    timelineItems: grouped.timeline_items.map((item, index) => {
      const sectionKey = (`timeline_${index + 1}`) as PropertyImageSlot
      return {
        itemKey: item.itemKey,
        title: item.title ?? '',
        meta: item.meta ?? '',
        body: item.body ?? '',
        state: item.state ?? 'upcoming',
        imageUrl: normalizedImages[sectionKey]?.url ?? DEFAULT_PROPERTY_IMAGE_URLS[sectionKey].url,
      }
    }),
    locationPoints: grouped.location_points.map((item) => ({
      itemKey: item.itemKey,
      title: item.title ?? '',
      body: item.body ?? '',
      accent: item.accent ?? '#C9A96E',
    })),
    floorPlanTitle: (() => {
      const mod = modules.find((m) => m.moduleType === 'floor_plan')
      return mod?.settings.title?.trim() || '格局規劃'
    })(),
    floorPlanUnits: (() => {
      const mod = modules.find((m) => m.moduleType === 'floor_plan')
      const count = mod?.settings.floorPlanUnitCount ?? 4
      const unitKeys = ['a', 'b', 'c', 'd'] as const
      return grouped.floor_plan_units.slice(0, count).map((item, index) => {
        const unitKey = unitKeys[index] ?? `unit_${index}`
        const sectionKey = `floor_plan_unit_${unitKey}`
        const uploadedImage = imageMap.get(sectionKey)
        return {
          itemKey: item.itemKey,
          title: item.title ?? '',
          body: item.body ?? '',
          meta: item.meta ?? '',
          accent: item.accent ?? '',
          imageUrl: uploadedImage?.url ?? null,
          unitNumber: String(index + 1).padStart(2, '0'),
        }
      })
    })(),
    surroundingsTitle: (() => {
      const mod = modules.find((m) => m.moduleType === 'surroundings')
      return mod?.settings.title?.trim() || '周邊環境'
    })(),
    surroundingsImages: (() => {
      const mod = modules.find((m) => m.moduleType === 'surroundings')
      const captions = mod?.settings.captions ?? {}
      const slots = ['surroundings_1', 'surroundings_2', 'surroundings_3', 'surroundings_4', 'surroundings_5', 'surroundings_6']
      return slots
        .map((sectionKey) => imageMap.get(sectionKey))
        .filter((img): img is TongchuangImageSource => !!img?.url)
        .map((img) => ({
          sectionKey: img.sectionKey,
          url: img.url,
          alt: img.altText || '',
          caption: captions[img.sectionKey] ?? '',
        }))
    })(),
    teamTitle: (() => {
      const mod = modules.find((m) => m.moduleType === 'team')
      return mod?.settings.title?.trim() || '團隊介紹'
    })(),
    teamMembers: (() => {
      const mod = modules.find((m) => m.moduleType === 'team')
      const count = mod?.settings.teamMemberCount ?? 4
      return grouped.team_members.slice(0, count).map((item, index) => {
        const sectionKey = `team_member_${index + 1}`
        const uploadedImage = imageMap.get(sectionKey)
        return {
          itemKey: item.itemKey,
          name: item.title ?? '',
          role: item.meta ?? '',
          intro: item.body ?? '',
          imageUrl: uploadedImage?.url ?? null,
        }
      })
    })(),
    indoorCommonsTitle: (() => {
      const mod = modules.find((m) => m.moduleType === 'indoor_commons')
      return mod?.settings.title?.trim() || '室內公社'
    })(),
    indoorAmenities: (() => {
      const mod = modules.find((m) => m.moduleType === 'indoor_commons')
      const labels = mod?.settings.captions ?? {}
      const slots = ['indoor_1', 'indoor_2', 'indoor_3', 'indoor_4', 'indoor_5', 'indoor_6']
      return slots
        .map((sectionKey) => imageMap.get(sectionKey))
        .filter((img): img is TongchuangImageSource => !!img?.url)
        .map((img) => ({
          sectionKey: img.sectionKey,
          url: img.url,
          alt: img.altText || '',
          label: labels[img.sectionKey] ?? '',
        }))
    })(),
    colorTheme: (() => {
      const mod = modules.find((m) => m.moduleType === 'color_theme')
      const key = mod?.settings.themeKey
      return (key && key in PROPERTY_THEMES ? key : DEFAULT_THEME_KEY) as PropertyThemeKey
    })(),
    fontTheme: (() => {
      const mod = modules.find((m) => m.moduleType === 'color_theme')
      const key = mod?.settings.fontKey
      return (key && key in PROPERTY_FONT_THEMES ? key : DEFAULT_FONT_KEY) as PropertyFontKey
    })(),
    modules: templateModules,
  }
}

export function buildDefaultProjectContentPreview() {
  return buildTongchuangTemplateContent(
    {
      id: 'template-preview',
      slug: 'tongchuang-wing',
      publishStatus: 'published',
      name: DEFAULT_PROPERTY_FIELDS.name,
      subtitle: DEFAULT_PROPERTY_FIELDS.subtitle,
      districtLabel: DEFAULT_PROPERTY_FIELDS.districtLabel,
      completionBadge: DEFAULT_PROPERTY_FIELDS.completionBadge,
      overviewTitle: DEFAULT_PROPERTY_FIELDS.overviewTitle,
      overviewBody: DEFAULT_PROPERTY_FIELDS.overviewBody,
      featuresTitle: DEFAULT_PROPERTY_FIELDS.featuresTitle,
      progressTitle: DEFAULT_PROPERTY_FIELDS.progressTitle,
      progressCompletionText: DEFAULT_PROPERTY_FIELDS.progressCompletionText,
      locationTitle: DEFAULT_PROPERTY_FIELDS.locationTitle,
      contactTitle: DEFAULT_PROPERTY_FIELDS.contactTitle,
      contactBody: DEFAULT_PROPERTY_FIELDS.contactBody,
      salesPhone: DEFAULT_PROPERTY_FIELDS.salesPhone,
      footerDisclaimer: DEFAULT_PROPERTY_FIELDS.footerDisclaimer,
      mapLat: DEFAULT_PROPERTY_FIELDS.mapLat,
      mapLng: DEFAULT_PROPERTY_FIELDS.mapLng,
      mapZoom: DEFAULT_PROPERTY_FIELDS.mapZoom,
    },
    [],
    DEFAULT_PROPERTY_CONTENT_ITEMS,
    createDefaultPropertyModules(),
  )
}

function normalizeModules(source: PropertyModule[]) {
  const input = source.length > 0 ? source : createDefaultPropertyModules()
  const dedupedSingletons = new Set<PropertyModuleType>()
  const normalModules: PropertyModule[] = []
  const pinnedModules: PropertyModule[] = []

  for (const projectModule of input) {
    const definition = getModuleDefinition(projectModule.moduleType)
    if (definition.singleton) {
      if (dedupedSingletons.has(projectModule.moduleType)) continue
      dedupedSingletons.add(projectModule.moduleType)
    }

    const normalized: PropertyModule = {
      id: projectModule.id || crypto.randomUUID(),
      moduleType: projectModule.moduleType,
      sortOrder: Number.isFinite(projectModule.sortOrder) ? projectModule.sortOrder : 0,
      isVisible: projectModule.isVisible !== false,
      settings: normalizeModuleSettings(projectModule),
    }

    if (definition.pinned) pinnedModules.push(normalized)
    else normalModules.push(normalized)
  }

  normalModules.sort((a, b) => a.sortOrder - b.sortOrder)
  pinnedModules.sort((a, b) => {
    const aIndex = DEFAULT_MODULE_ORDER.indexOf(a.moduleType)
    const bIndex = DEFAULT_MODULE_ORDER.indexOf(b.moduleType)
    return aIndex - bIndex
  })

  return [...normalModules, ...pinnedModules].map((module, index) => ({
    ...module,
    sortOrder: index,
  }))
}

function normalizeModuleSettings(projectModule: Pick<PropertyModule, 'id' | 'moduleType' | 'settings'>) {
  if (projectModule.moduleType === 'image_section') {
    return {
      title: typeof projectModule.settings.title === 'string' ? projectModule.settings.title : '',
      body: typeof projectModule.settings.body === 'string' ? projectModule.settings.body : '',
      primaryImageSectionKey:
        typeof projectModule.settings.primaryImageSectionKey === 'string'
          ? projectModule.settings.primaryImageSectionKey
          : getImageSectionSlotKey(projectModule.id, 'primary'),
      secondaryImageSectionKey:
        typeof projectModule.settings.secondaryImageSectionKey === 'string'
          ? projectModule.settings.secondaryImageSectionKey
          : getImageSectionSlotKey(projectModule.id, 'secondary'),
    }
  }

  if (projectModule.moduleType === 'floor_plan') {
    const count = projectModule.settings.floorPlanUnitCount
    return {
      title: typeof projectModule.settings.title === 'string' ? projectModule.settings.title : '格局規劃',
      floorPlanUnitCount: (count === 3 || count === 4 || count === 5) ? count : 4,
    }
  }

  if (projectModule.moduleType === 'team') {
    const count = projectModule.settings.teamMemberCount
    return {
      title: typeof projectModule.settings.title === 'string' ? projectModule.settings.title : '團隊介紹',
      teamMemberCount: (count === 4 || count === 5) ? count : 4,
    }
  }

  return {}
}

function groupContentItems(contentItems: PropertyContentItem[]) {
  const source = contentItems.length > 0 ? contentItems : cloneDefaultContentItems()

  const floorPlanUnits = source.filter((item) => item.groupKey === 'floor_plan_units').sort(bySortOrder)
  const teamMembers = source.filter((item) => item.groupKey === 'team_members').sort(bySortOrder)
  return {
    identity_specs: source.filter((item) => item.groupKey === 'identity_specs').sort(bySortOrder),
    intro_specs: source.filter((item) => item.groupKey === 'intro_specs').sort(bySortOrder),
    feature_cards: source.filter((item) => item.groupKey === 'feature_cards').sort(bySortOrder),
    timeline_items: source.filter((item) => item.groupKey === 'timeline_items').sort(bySortOrder),
    location_points: source.filter((item) => item.groupKey === 'location_points').sort(bySortOrder),
    floor_plan_units: floorPlanUnits.length > 0
      ? floorPlanUnits
      : DEFAULT_PROPERTY_CONTENT_ITEMS.filter((item) => item.groupKey === 'floor_plan_units').sort(bySortOrder),
    team_members: teamMembers.length > 0
      ? teamMembers
      : DEFAULT_PROPERTY_CONTENT_ITEMS.filter((item) => item.groupKey === 'team_members').sort(bySortOrder),
  }
}

function bySortOrder(a: { sortOrder: number }, b: { sortOrder: number }) {
  return a.sortOrder - b.sortOrder
}

function coerceNumber(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
