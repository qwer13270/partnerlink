export type Role = 'kol' | 'merchant' | null
export type Step = 1 | 2 | 3

export type KolSignupDraft = {
  name: string
  username: string
  email: string
  password: string
  platforms: string[]
  followerRange: string
  contentType: string
  bio: string
}

import type { MerchantType } from '@/lib/merchant-application'
export type { MerchantType }

export type MerchantSignupDraft = {
  companyName: string
  contactName: string
  email: string
  phone: string
  password: string
  city: string
  projectCount: string
  merchantType: MerchantType
}
