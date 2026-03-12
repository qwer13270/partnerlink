export type Role = 'kol' | 'merchant' | null
export type Step = 1 | 2 | 3

export type KolSignupDraft = {
  name: string
  email: string
  password: string
  platforms: string[]
  platformAccounts: Record<string, string>
  followerRange: string
  contentType: string
  bio: string
}

export type KolMediaDraft = {
  profilePhoto: File | null
}

export type UploadItemStatus = 'pending' | 'uploading' | 'success' | 'error'
export type UploadProgressMap = Record<string, { status: UploadItemStatus; progress: number; error?: string }>
