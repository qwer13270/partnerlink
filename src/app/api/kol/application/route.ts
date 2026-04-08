import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

type ApplicationVideo = {
  url: string
  title: string
  duration: string
}

type CreateKolApplicationBody = {
  fullName?: unknown
  platforms?: unknown
  platformAccounts?: unknown
  followerRange?: unknown
  contentType?: unknown
  bio?: unknown
  city?: unknown
  photos?: unknown
  videos?: unknown
}

function toStringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, maxItems)
}

function toVideos(value: unknown): ApplicationVideo[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const url = typeof record.url === 'string' ? record.url.trim() : ''
      const title = typeof record.title === 'string' ? record.title.trim() : ''
      const duration = typeof record.duration === 'string' ? record.duration.trim() : ''
      if (!url || !title) return null
      return { url, title, duration }
    })
    .filter((item): item is ApplicationVideo => Boolean(item))
    .slice(0, 3)
}

function toPlatformAccounts(value: unknown, platforms: string[]) {
  if (!value || typeof value !== 'object') return {}

  const record = value as Record<string, unknown>
  return Object.fromEntries(
    platforms
      .map((platform) => {
        const entry = record[platform]
        const normalized = typeof entry === 'string' ? entry.trim() : ''
        return [platform, normalized]
      })
      .filter(([, entry]) => entry.length > 0),
  )
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const signupRole = auth.user.user_metadata?.signup_role
  if (signupRole !== 'kol' && auth.role !== 'kol') {
    return NextResponse.json({ error: 'Only KOL users can submit this application.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as CreateKolApplicationBody | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const platforms = toStringArray(body.platforms, 6)
  const platformAccounts = toPlatformAccounts(body.platformAccounts, platforms)
  const followerRange = typeof body.followerRange === 'string' ? body.followerRange.trim() : null
  const contentType = typeof body.contentType === 'string' ? body.contentType.trim() : null
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const city = typeof body.city === 'string' ? body.city.trim() : null
  const photos = toStringArray(body.photos, 6)
  const videos = toVideos(body.videos)

  const admin = getSupabaseAdminClient()

  const { data: existing, error: existingError } = await admin
    .from('kol_applications')
    .select('id,status')
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json(
      { error: `Failed to check existing application: ${existingError.message}` },
      { status: 500 },
    )
  }

  if (existing && existing.status !== 'pending_email_confirmation' && existing.status !== 'pending_admin_review') {
    return NextResponse.json(
      { error: `Application is already ${existing.status}.` },
      { status: 409 },
    )
  }

  const payload = {
    user_id: auth.user.id,
    email: auth.user.email ?? '',
    full_name: fullName || (typeof auth.user.user_metadata?.full_name === 'string' ? auth.user.user_metadata.full_name : ''),
    platforms,
    platform_accounts: platformAccounts,
    follower_range: followerRange,
    content_type: contentType,
    bio,
    city,
    photos,
    videos,
    status: 'pending_admin_review' as const,
    submitted_at: new Date().toISOString(),
  }

  const { data: application, error: upsertError } = await admin
    .from('kol_applications')
    .upsert(payload, { onConflict: 'user_id' })
    .select('id,status,submitted_at')
    .single()

  if (upsertError) {
    return NextResponse.json(
      { error: `Failed to save application: ${upsertError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, application })
}
