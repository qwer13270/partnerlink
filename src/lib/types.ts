// ---- Property / Apartment Project ----
export type PropertyStatus = 'pre-sale' | 'selling' | 'sold-out' | 'completed'

export interface UnitType {
  id: string
  name: string                    // e.g., "Type A"
  nameEn: string                  // e.g., "Type A"
  rooms: string                   // e.g., "2房1廳"
  roomsEn: string                 // e.g., "2BR 1LR"
  size: number                    // in 坪 (ping)
  price: number                   // in TWD (萬)
  isPopular?: boolean
}

export interface Amenity {
  category: 'mrt' | 'school' | 'park' | 'shopping' | 'hospital'
  name: string
  nameEn: string
  distance: string                // e.g., "步行5分鐘"
  distanceEn: string              // e.g., "5 min walk"
}

export interface TimelineMilestone {
  label: string
  labelEn: string
  date: string
  completed: boolean
}

export interface GalleryImage {
  id: string
  label: string                   // e.g., "客廳"
  labelEn: string                 // e.g., "Living Room"
}

export interface Property {
  id: string
  slug: string
  name: string                    // e.g., "璞真建設 — 光河"
  nameEn: string                  // e.g., "PureCity — Light River"
  merchant: string
  merchantEn: string
  location: string                // e.g., "新北市板橋區"
  locationEn: string
  nearestMrt: string
  nearestMrtEn: string
  mrtWalkTime: number             // in minutes
  status: PropertyStatus
  priceRange: { min: number; max: number }  // in 萬
  totalUnits: number
  floors: number
  sizeRange: { min: number; max: number }   // in 坪
  completionDate: string
  unitTypes: UnitType[]
  amenities: Amenity[]
  timeline: TimelineMilestone[]
  galleryImages: GalleryImage[]
}

// ---- KOL ----
export type KolTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface KOL {
  id: string
  name: string
  nameEn: string
  email: string
  avatar?: string
  tier: KolTier
  activeProjects: number
  totalClicks: number
  totalBookings: number
  totalSales: number
  joinedDate: string
}

export type CommissionStatus = 'pending' | 'confirmed' | 'paid'

export interface AffiliateLink {
  id: string
  kolId: string
  propertyId: string
  propertyName: string
  propertyNameEn: string
  link: string                    // e.g., "homekey.tw/p/light-river?ref=sarah_chen"
  clicks: number
  bookings: number
  confirmedSales: number
  commissionStatus: CommissionStatus
  isActive: boolean
}

// ---- Referral / Lead ----
export type LeadStatus = 'pending-tour' | 'toured' | 'negotiating' | 'sale-confirmed' | 'cancelled'

export interface Referral {
  id: string
  leadName: string                // Partially masked: "王○明"
  leadPhone?: string              // Partially masked
  kolId: string
  kolName: string
  kolNameEn: string
  propertyId: string
  propertyName: string
  propertyNameEn: string
  referralDate: string
  tourDate?: string
  status: LeadStatus
  salePrice?: number              // in 萬
  commissionRate?: number         // TBD for now
  commissionAmount?: number       // TBD for now
}

// ---- Activity ----
export type ActivityType = 'click' | 'booking' | 'tour-completed' | 'sale-confirmed' | 'commission-paid'

export interface Activity {
  id: string
  type: ActivityType
  message: string
  messageEn: string
  timestamp: string
  kolId?: string
  kolName?: string
  kolNameEn?: string
  propertyId?: string
  propertyName?: string
  propertyNameEn?: string
}

// ---- Dashboard Stats ----
export interface KolStats {
  activeProjects: number
  totalClicks: number
  totalBookings: number
  totalCommission: number | null  // null means TBD
  clicksTrend: number             // percentage change
  bookingsTrend: number
}

export interface AdminStats {
  totalProjects: number
  activeKols: number
  referralsThisMonth: number
  bookingsThisMonth: number
  confirmedSales: number
  commissionPayable: number | null
  referralsTrend: number
  bookingsTrend: number
}

export interface MerchantStats {
  activeProjects: number
  totalReferrals: number
  tourBookings: number
  confirmedSales: number
}

// ---- Chart Data ----
export interface ChartDataPoint {
  date: string
  clicks: number
  bookings: number
}

export interface KolPerformanceData {
  kolId: string
  kolName: string
  kolNameEn: string
  referrals: number
  bookings: number
  sales: number
  conversionRate: number
}

// ---- Merchant / Company ----
export interface Merchant {
  id: string
  name: string
  nameEn: string
  activeProjects: number
}
