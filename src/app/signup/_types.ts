export type Role = 'kol' | 'merchant' | null
export type Step = 1 | 2 | 3

export type KolSignupDraft = {
  name: string
  email: string
  password: string
  platforms: string[]
  followerRange: string
  contentType: string
  bio: string
}
