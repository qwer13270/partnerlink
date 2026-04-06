export type ResumeMediaItem = {
  id: string
  mediaType: 'image' | 'video'
  url: string
  caption: string
  sortOrder: number
}

export type SocialLinks = {
  instagram?: string
  youtube?: string
  tiktok?: string
  facebook?: string
  website?: string
}

export type PlatformStats = {
  totalClicks: number
  totalBookings: number
  totalSales: number
  conversionRate: number
  activeProjects: number
  totalProjects: number
}

export type KolResumeData = {
  username: string
  kolId: string
  displayName: string
  bio: string
  profilePhotoUrl: string | null
  followerCount: number
  nicheTags: string[]
  socialLinks: SocialLinks
  media: ResumeMediaItem[]
  platformStats: PlatformStats
  colorTheme?: string
  collabFee?: number | null
}

export type ResumeViewerRole = 'self' | 'merchant' | 'admin' | 'public'

export const mockResumes: KolResumeData[] = [
  {
    username: 'sarah_chen',
    kolId: 'kol-001',
    displayName: '陳莎拉',
    bio: '專注於台北、新北豪宅市場的生活風格創作者。每週深度開箱預售案、建案現場走訪，影片精準傳遞買房眉角與室內設計趨勢。受眾以 28–45 歲有自購需求的高收入族群為主，每月觸及超過 12 萬潛在買家。',
    profilePhotoUrl: null,
    followerCount: 125000,
    nicheTags: ['房地產', '豪宅', '生活風格', '台北', '室內設計'],
    socialLinks: {
      instagram: 'https://instagram.com/sarah_chen',
      youtube: 'https://youtube.com/@sarah_chen',
      tiktok: 'https://tiktok.com/@sarah_chen',
    },
    media: [
      {
        id: 'm-001',
        mediaType: 'image',
        url: '/images/portfolio/sarah-01.jpg',
        caption: '台北信義區預售案現場導覽，探索頂樓戶天際線景觀。',
        sortOrder: 0,
      },
      {
        id: 'm-002',
        mediaType: 'image',
        url: '/images/portfolio/sarah-02.jpg',
        caption: '大安區 40 坪輕工業風改造實錄，空間規劃分享。',
        sortOrder: 1,
      },
      {
        id: 'm-003',
        mediaType: 'image',
        url: '/images/portfolio/sarah-03.jpg',
        caption: '新建案公設開箱：從健身房到空中花園一次看。',
        sortOrder: 2,
      },
      {
        id: 'm-004',
        mediaType: 'image',
        url: '/images/portfolio/sarah-04.jpg',
        caption: '板橋新案樣品屋實拍，坪效設計讓小空間變大。',
        sortOrder: 3,
      },
      {
        id: 'm-005',
        mediaType: 'video',
        url: '/videos/portfolio/sarah-v01.mp4',
        caption: '國泰禾商案全程紀錄片，從簽約到交屋的完整故事。',
        sortOrder: 4,
      },
      {
        id: 'm-006',
        mediaType: 'video',
        url: '/videos/portfolio/sarah-v02.mp4',
        caption: '買房前必看：預售屋合約五大眉角深度解析。',
        sortOrder: 5,
      },
    ],
    platformStats: {
      totalClicks: 1247,
      totalBookings: 38,
      totalSales: 5,
      conversionRate: 3.0,
      activeProjects: 3,
      totalProjects: 11,
    },
    collabFee: 50000,
  },
  {
    username: 'mike_wang',
    kolId: 'kol-002',
    displayName: '王大明',
    bio: '深耕桃園、新竹科技廊帶的房市評論者，專為科技業首購族提供精準的選屋建議與市場解析。',
    profilePhotoUrl: null,
    followerCount: 47000,
    nicheTags: ['房地產', '首購族', '桃園', '新竹', '科技廊帶'],
    socialLinks: {
      youtube: 'https://youtube.com/@mike_wang',
    },
    media: [
      {
        id: 'm-010',
        mediaType: 'image',
        url: '/images/portfolio/mike-01.jpg',
        caption: '竹北新案開箱，通勤族的精打細算指南。',
        sortOrder: 0,
      },
      {
        id: 'm-011',
        mediaType: 'image',
        url: '/images/portfolio/mike-02.jpg',
        caption: '桃園機捷沿線房市漲幅數據深度解析。',
        sortOrder: 1,
      },
    ],
    platformStats: {
      totalClicks: 892,
      totalBookings: 24,
      totalSales: 3,
      conversionRate: 2.7,
      activeProjects: 2,
      totalProjects: 6,
    },
    collabFee: 20000,
  },
]

export function getResumeByUsername(username: string): KolResumeData | null {
  return mockResumes.find((r) => r.username === username) ?? null
}

export function createDefaultResume(username: string): KolResumeData {
  return {
    username,
    kolId: '',
    displayName: '',
    bio: '',
    profilePhotoUrl: null,
    followerCount: 0,
    nicheTags: [],
    socialLinks: {},
    media: [],
    platformStats: {
      totalClicks: 0,
      totalBookings: 0,
      totalSales: 0,
      conversionRate: 0,
      activeProjects: 0,
      totalProjects: 0,
    },
  }
}

export function getUsernameFromEmail(email: string): string {
  return email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()
}

/** Returns the KOL's chosen username from user_metadata, falling back to email-derived. */
export function getUsernameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }): string {
  const stored = user.user_metadata?.kol_username
  if (typeof stored === 'string' && stored.length > 0) return stored
  return getUsernameFromEmail(user.email ?? '')
}
