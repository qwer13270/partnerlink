// App-wide constants

export const APP_NAME = 'HomeKey 房客'
export const APP_NAME_EN = 'HomeKey'

// Currency formatting
export const CURRENCY = 'TWD'
export const CURRENCY_SYMBOL = 'NT$'
export const CURRENCY_UNIT = '萬' // 10,000 TWD

// Size unit
export const SIZE_UNIT = '坪' // ping

// Routes
export const ROUTES = {
  home: '/',
  properties: '/properties',
  kol: {
    dashboard: '/kol',
    links: '/kol/links',
    performance: '/kol/performance',
    commissions: '/kol/commissions',
  },
  admin: {
    dashboard: '/admin',
    projects: '/admin/projects',
    kols: '/admin/kols',
    referrals: '/admin/referrals',
    settings: '/admin/settings',
  },
  merchant: {
    dashboard: '/merchant',
    projects: '/merchant/projects',
    leads: '/merchant/leads',
    kols: '/merchant/kols',
  },
} as const

// Role options for demo navigation
export const DEMO_ROLES = [
  { id: 'public', icon: '🏠', labelKey: 'nav.publicView', href: '/' },
  { id: 'kol', icon: '📱', labelKey: 'nav.kolDashboard', href: '/kol' },
  { id: 'admin', icon: '⚙️', labelKey: 'nav.adminPanel', href: '/admin' },
  { id: 'merchant', icon: '🏢', labelKey: 'nav.merchantPortal', href: '/merchant' },
] as const

// Status colors
export const STATUS_COLORS = {
  'pending-tour': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'toured': 'bg-blue-100 text-blue-800 border-blue-200',
  'negotiating': 'bg-orange-100 text-orange-800 border-orange-200',
  'sale-confirmed': 'bg-green-100 text-green-800 border-green-200',
  'cancelled': 'bg-gray-100 text-gray-500 border-gray-200',
} as const

// Property status colors
export const PROPERTY_STATUS_COLORS = {
  'pre-sale': 'bg-blue-100 text-blue-800',
  'selling': 'bg-green-100 text-green-800',
  'sold-out': 'bg-gray-100 text-gray-600',
  'completed': 'bg-teal-100 text-teal-800',
} as const

// KOL tier colors
export const TIER_COLORS = {
  bronze: 'tier-bronze',
  silver: 'tier-silver',
  gold: 'tier-gold',
  platinum: 'tier-platinum',
} as const

// Commission status colors
export const COMMISSION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
} as const

// Chart colors
export const CHART_COLORS = {
  primary: '#0D9488',
  secondary: '#D4A853',
  tertiary: '#6366F1',
  quaternary: '#EC4899',
  quinary: '#8B5CF6',
} as const

// Amenity icons (Lucide icon names)
export const AMENITY_ICONS = {
  mrt: 'Train',
  school: 'School',
  park: 'Trees',
  shopping: 'ShoppingBag',
  hospital: 'Hospital',
} as const
