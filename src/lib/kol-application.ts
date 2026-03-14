export type ApplicationVideo = {
  url: string
  title: string
  duration: string
}

export type NormalizedKolApplicationInput = {
  fullName: string
  platforms: string[]
  platformAccounts: Record<string, string>
  followerRange: string | null
  contentType: string | null
  bio: string
  city: string | null
  avgViews: string | null
  engagementRate: string | null
  photos: string[]
  videos: ApplicationVideo[]
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toOptionalString(value: unknown) {
  const normalized = toTrimmedString(value)
  return normalized.length > 0 ? normalized : null
}

export function toStringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, maxItems)
}

export function toVideos(value: unknown): ApplicationVideo[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const url = toTrimmedString(record.url)
      const title = toTrimmedString(record.title)
      const duration = toTrimmedString(record.duration)
      if (!url || !title) return null
      return { url, title, duration }
    })
    .filter((item): item is ApplicationVideo => Boolean(item))
    .slice(0, 3)
}

export function toPlatformAccounts(value: unknown, platforms: string[]) {
  if (!value || typeof value !== 'object') return {}

  const record = value as Record<string, unknown>
  return Object.fromEntries(
    platforms
      .map((platform) => {
        const entry = record[platform]
        const normalized = toTrimmedString(entry)
        return [platform, normalized] as const
      })
      .filter(([, entry]) => entry.length > 0),
  )
}

export function normalizeKolApplicationInput(body: Record<string, unknown>) {
  const platforms = toStringArray(body.platforms, 6)

  return {
    fullName: toTrimmedString(body.fullName),
    platforms,
    platformAccounts: toPlatformAccounts(body.platformAccounts, platforms),
    followerRange: toOptionalString(body.followerRange),
    contentType: toOptionalString(body.contentType),
    bio: toTrimmedString(body.bio),
    city: toOptionalString(body.city),
    avgViews: toOptionalString(body.avgViews),
    engagementRate: toOptionalString(body.engagementRate),
    photos: toStringArray(body.photos, 6),
    videos: toVideos(body.videos),
  } satisfies NormalizedKolApplicationInput
}
