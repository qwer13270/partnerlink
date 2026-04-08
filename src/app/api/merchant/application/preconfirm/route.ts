import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, getSupabaseTokenVerifierClient } from '@/lib/supabase/admin'
import { normalizeMerchantApplicationInput } from '@/lib/merchant-application'

type CreateMerchantApplicationPreconfirmBody = {
  userId?: unknown
  email?: unknown
  companyName?: unknown
  contactName?: unknown
  phone?: unknown
  city?: unknown
  projectCount?: unknown
  merchantType?: unknown
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreateMerchantApplicationPreconfirmBody | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing user id or email.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
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

  if (authUser.user_metadata?.signup_role !== 'merchant') {
    return NextResponse.json({ error: 'Auth user is not a merchant signup.' }, { status: 403 })
  }

  const { data: existing, error: existingError } = await admin
    .from('merchant_applications')
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

  const normalized = normalizeMerchantApplicationInput(body as Record<string, unknown>)
  if (!normalized.companyName || !normalized.contactName || !normalized.phone) {
    return NextResponse.json({ error: 'Missing required merchant application fields.' }, { status: 400 })
  }
  if (!normalized.merchantType) {
    return NextResponse.json({ error: 'Missing merchant type (property or shop).' }, { status: 400 })
  }

  const payload = {
    user_id: authUser.id,
    email: authEmail,
    company_name: normalized.companyName,
    contact_name: normalized.contactName,
    phone: normalized.phone,
    city: normalized.city,
    project_count: normalized.projectCount,
    merchant_type: normalized.merchantType,
    status: 'pending_email_confirmation' as const,
    submitted_at: new Date().toISOString(),
  }

  const { data: application, error: upsertError } = await admin
    .from('merchant_applications')
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
