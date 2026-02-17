import type { Activity } from '@/lib/types'

export const mockActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'sale-confirmed',
    message: '恭喜！潤泰敦峰成交確認，買家：黃○偉',
    messageEn: 'Congratulations! Sale confirmed for Ruentex Dufeng, buyer: Huang ○ Wei',
    timestamp: '2026-02-16T10:30:00Z',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-005',
    propertyName: '潤泰敦峰',
    propertyNameEn: 'Ruentex Dufeng',
  },
  {
    id: 'act-002',
    type: 'booking',
    message: '新預約看屋：吳○芬預約興富發天匯',
    messageEn: 'New tour booking: Wu ○ Fen booked Sinyi SkyHall',
    timestamp: '2026-02-16T09:15:00Z',
    kolId: 'kol-005',
    kolName: '吳美玲',
    kolNameEn: 'Amy Wu',
    propertyId: 'prop-004',
    propertyName: '興富發天匯',
    propertyNameEn: 'Sinyi SkyHall',
  },
  {
    id: 'act-003',
    type: 'tour-completed',
    message: '看屋完成：劉○強已完成璞真光河看屋',
    messageEn: 'Tour completed: Liu ○ Qiang finished tour at PureCity Light River',
    timestamp: '2026-02-15T16:45:00Z',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
  },
  {
    id: 'act-004',
    type: 'click',
    message: '您的璞真光河連結獲得 12 次新點擊',
    messageEn: 'Your PureCity Light River link received 12 new clicks',
    timestamp: '2026-02-15T14:20:00Z',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
  },
  {
    id: 'act-005',
    type: 'booking',
    message: '新預約看屋：周○傑預約興富發天匯',
    messageEn: 'New tour booking: Zhou ○ Jie booked Sinyi SkyHall',
    timestamp: '2026-02-15T11:30:00Z',
    kolId: 'kol-002',
    kolName: '王大明',
    kolNameEn: 'Mike Wang',
    propertyId: 'prop-004',
    propertyName: '興富發天匯',
    propertyNameEn: 'Sinyi SkyHall',
  },
  {
    id: 'act-006',
    type: 'commission-paid',
    message: '佣金已撥款：璞真光河成交佣金',
    messageEn: 'Commission paid: PureCity Light River sale commission',
    timestamp: '2026-02-14T10:00:00Z',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
  },
  {
    id: 'act-007',
    type: 'tour-completed',
    message: '看屋完成：許○雯已完成遠雄新未來看屋',
    messageEn: 'Tour completed: Xu ○ Wen finished tour at Farglory New Future',
    timestamp: '2026-02-14T15:30:00Z',
    kolId: 'kol-006',
    kolName: '蔡大衛',
    kolNameEn: 'David Tsai',
    propertyId: 'prop-002',
    propertyName: '遠雄新未來',
    propertyNameEn: 'Farglory New Future',
  },
  {
    id: 'act-008',
    type: 'sale-confirmed',
    message: '恭喜！璞真光河成交確認，買家：王○明',
    messageEn: 'Congratulations! Sale confirmed for PureCity Light River, buyer: Wang ○ Ming',
    timestamp: '2026-02-13T14:00:00Z',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
  },
  {
    id: 'act-009',
    type: 'click',
    message: '您的國泰禾連結獲得 8 次新點擊',
    messageEn: 'Your Cathay Harvest link received 8 new clicks',
    timestamp: '2026-02-13T09:45:00Z',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-003',
    propertyName: '國泰禾',
    propertyNameEn: 'Cathay Harvest',
  },
  {
    id: 'act-010',
    type: 'booking',
    message: '新預約看屋：林○玲預約國泰禾',
    messageEn: 'New tour booking: Lin ○ Ling booked Cathay Harvest',
    timestamp: '2026-02-12T16:20:00Z',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-003',
    propertyName: '國泰禾',
    propertyNameEn: 'Cathay Harvest',
  },
  {
    id: 'act-011',
    type: 'click',
    message: '您的潤泰敦峰連結獲得 15 次新點擊',
    messageEn: 'Your Ruentex Dufeng link received 15 new clicks',
    timestamp: '2026-02-12T11:00:00Z',
    kolId: 'kol-001',
    kolName: '陳莎拉',
    kolNameEn: 'Sarah Chen',
    propertyId: 'prop-005',
    propertyName: '潤泰敦峰',
    propertyNameEn: 'Ruentex Dufeng',
  },
  {
    id: 'act-012',
    type: 'tour-completed',
    message: '看屋完成：張○芳已完成璞真光河看屋',
    messageEn: 'Tour completed: Zhang ○ Fang finished tour at PureCity Light River',
    timestamp: '2026-02-11T15:00:00Z',
    kolId: 'kol-003',
    kolName: '林佳慧',
    kolNameEn: 'Lisa Lin',
    propertyId: 'prop-001',
    propertyName: '璞真建設 — 光河',
    propertyNameEn: 'PureCity — Light River',
  },
]

export function getActivitiesByKolId(kolId: string): Activity[] {
  return mockActivities.filter((a) => a.kolId === kolId)
}

export function getActivitiesByPropertyId(propertyId: string): Activity[] {
  return mockActivities.filter((a) => a.propertyId === propertyId)
}

export function getActivitiesByType(type: Activity['type']): Activity[] {
  return mockActivities.filter((a) => a.type === type)
}

export function getRecentActivities(limit: number = 5): Activity[] {
  return mockActivities.slice(0, limit)
}

// Activities for the current KOL (Sarah Chen)
export const currentKolActivities = mockActivities.filter(
  (a) => a.kolId === 'kol-001'
)
