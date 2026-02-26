import type { Referral, AdminStats, MerchantStats, KolPerformanceData } from '@/lib/types'

export const mockReferrals: Referral[] = [
  {
    id: 'ref-001',
    leadName: '王○明',
    leadPhone: '0912-***-789',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
    referralDate: '2026-02-01',
    tourDate: '2026-02-05',
    status: 'sale-confirmed',
    salePrice: 2380,
  },
  {
    id: 'ref-002',
    leadName: '李○華',
    leadPhone: '0923-***-456',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
    referralDate: '2026-02-03',
    tourDate: '2026-02-08',
    status: 'negotiating',
  },
  {
    id: 'ref-003',
    leadName: '張○芳',
    leadPhone: '0935-***-123',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
    referralDate: '2026-02-05',
    tourDate: '2026-02-10',
    status: 'toured',
  },
  {
    id: 'ref-004',
    leadName: '陳○豪',
    leadPhone: '0956-***-789',
    kolId: 'kol-002',
    kolName: '王大明',
    kolNameEn: 'Mike Wang',
    propertyId: 'prop-002',
    propertyName: '遠雄新未來',
    propertyNameEn: 'Farglory New Future',
    referralDate: '2026-02-06',
    status: 'pending-tour',
  },
  {
    id: 'ref-005',
    leadName: '林○玲',
    leadPhone: '0978-***-321',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-003',
    propertyName: '國泰禾',
    propertyNameEn: 'Cathay Harvest',
    referralDate: '2026-02-07',
    tourDate: '2026-02-12',
    status: 'negotiating',
  },
  {
    id: 'ref-006',
    leadName: '黃○偉',
    leadPhone: '0989-***-654',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-005',
    propertyName: '潤泰敦峰',
    propertyNameEn: 'Ruentex Dufeng',
    referralDate: '2026-02-08',
    tourDate: '2026-02-13',
    status: 'sale-confirmed',
    salePrice: 5800,
  },
  {
    id: 'ref-007',
    leadName: '吳○芬',
    leadPhone: '0911-***-987',
    kolId: 'kol-005',
    kolName: '吳美玲',
    kolNameEn: 'Amy Wu',
    propertyId: 'prop-004',
    propertyName: '興富發天匯',
    propertyNameEn: 'Sinyi SkyHall',
    referralDate: '2026-02-09',
    status: 'pending-tour',
  },
  {
    id: 'ref-008',
    leadName: '劉○強',
    leadPhone: '0922-***-147',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
    referralDate: '2026-02-10',
    tourDate: '2026-02-14',
    status: 'toured',
  },
  {
    id: 'ref-009',
    leadName: '許○雯',
    leadPhone: '0933-***-852',
    kolId: 'kol-006',
    kolName: '蔡大衛',
    kolNameEn: 'David Tsai',
    propertyId: 'prop-002',
    propertyName: '遠雄新未來',
    propertyNameEn: 'Farglory New Future',
    referralDate: '2026-02-11',
    status: 'cancelled',
  },
  {
    id: 'ref-010',
    leadName: '周○傑',
    leadPhone: '0944-***-963',
    kolId: 'kol-002',
    kolName: '王大明',
    kolNameEn: 'Mike Wang',
    propertyId: 'prop-004',
    propertyName: '興富發天匯',
    propertyNameEn: 'Sinyi SkyHall',
    referralDate: '2026-02-12',
    tourDate: '2026-02-15',
    status: 'negotiating',
  },
]

// Referrals for PureCity Merchant (prop-001, prop-005)
export const merchantReferrals = mockReferrals.filter(
  (r) => r.propertyId === 'prop-001' || r.propertyId === 'prop-005'
)

export const adminStats: AdminStats = {
  totalProjects: 5,
  activeKols: 8,
  referralsThisMonth: 342,
  bookingsThisMonth: 56,
  confirmedSales: 12,
  commissionPayable: null, // TBD
  referralsTrend: 15.2,
  bookingsTrend: 8.7,
}

export const merchantStats: MerchantStats = {
  activeProjects: 2,
  totalReferrals: 186,
  tourBookings: 42,
  confirmedSales: 8,
}

export const kolPerformanceData: KolPerformanceData[] = [
  {
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    referrals: 68,
    bookings: 22,
    sales: 12,
    conversionRate: 17.6,
  },
  {
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    referrals: 38,
    bookings: 15,
    sales: 5,
    conversionRate: 13.2,
  },
  {
    kolId: 'kol-005',
    kolName: '吳美玲',
    kolNameEn: 'Amy Wu',
    referrals: 42,
    bookings: 14,
    sales: 6,
    conversionRate: 14.3,
  },
  {
    kolId: 'kol-002',
    kolName: '王大明',
    kolNameEn: 'Mike Wang',
    referrals: 24,
    bookings: 10,
    sales: 3,
    conversionRate: 12.5,
  },
  {
    kolId: 'kol-007',
    kolName: '張小芬',
    kolNameEn: 'Fanny Zhang',
    referrals: 32,
    bookings: 11,
    sales: 4,
    conversionRate: 12.5,
  },
]

export function getReferralsByKolId(kolId: string): Referral[] {
  return mockReferrals.filter((r) => r.kolId === kolId)
}

export function getReferralsByPropertyId(propertyId: string): Referral[] {
  return mockReferrals.filter((r) => r.propertyId === propertyId)
}

export function getReferralsByStatus(status: Referral['status']): Referral[] {
  return mockReferrals.filter((r) => r.status === status)
}
