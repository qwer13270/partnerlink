import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, getSupabaseTokenVerifierClient } from '@/lib/supabase/admin'
import { normalizeKolApplicationInput } from '@/lib/kol-application'

type CreateKolApplicationPreconfirmBody = {
  userId?: unknown
  email?: unknown
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

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreateKolApplicationPreconfirmBody | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing user id or email.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  // Token verification is intentionally optional here.
  // When Supabase requires email confirmation, signUp() returns data.session = null,
  // so the client has no bearer token to send at this point in the flow.
  // In that case we fall back to the admin-side cross-check below (userId exists in auth,
  // email matches, signup_role === 'kol'). When a session IS available (no email confirmation
  // required), the client sends the token and we get strong identity proof.
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7)
    const verifier = getSupabaseTokenVerifierClient()
    const { data: { user: tokenUser }, error: tokenError } = await verifier.auth.getUser(bearerToken)
    if (tokenError || !tokenUser || tokenUser.id !== userId) {
      return NextResponse.json({ error: 'Auth token does not match claimed user.' }, { status: 401 })
    }
  }
  const { data: userResult, error: getUserError } = await admin.auth.admin.getUserById(userId)
  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: `Failed to load auth user: ${getUserError?.message ?? 'User not found.'}` },
      { status: 404 },
    )
  }

  const authUser = userResult.user
  const authEmail = (authUser.email ?? '').trim().toLowerCase()
  if (authEmail !== email) {
    return NextResponse.json({ error: 'Email does not match auth user.' }, { status: 409 })
  }

  if (authUser.user_metadata?.signup_role !== 'kol') {
    return NextResponse.json({ error: 'Auth user is not a KOL signup.' }, { status: 403 })
  }

  const { data: existing, error: existingError } = await admin
    .from('kol_applications')
    .select('id,status')
    .eq('user_id', authUser.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json(
      { error: `Failed to check existing application: ${existingError.message}` },
      { status: 500 },
    )
  }

  if (existing && (existing.status === 'approved' || existing.status === 'denied')) {
    return NextResponse.json(
      { error: `Application is already ${existing.status}.` },
      { status: 409 },
    )
  }

  const normalized = normalizeKolApplicationInput(body as Record<string, unknown>)
  const payload = {
    user_id: authUser.id,
    email: authEmail,
    full_name: normalized.fullName || (typeof authUser.user_metadata?.full_name === 'string' ? authUser.user_metadata.full_name : '') || authEmail,
    platforms: normalized.platforms,
    platform_accounts: normalized.platformAccounts,
    follower_range: normalized.followerRange,
    content_type: normalized.contentType,
    bio: normalized.bio,
    city: normalized.city,
    photos: normalized.photos,
    videos: normalized.videos,
    status: 'pending_email_confirmation' as const,
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
