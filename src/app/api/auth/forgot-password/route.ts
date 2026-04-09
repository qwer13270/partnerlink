import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, getSupabaseTokenVerifierClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  // Check if this email belongs to a registered platform user
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) {
    console.error('[api/auth/forgot-password] listUsers:', error.message)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }

  const userExists = data.users.some(
    (u) => (u.email ?? '').toLowerCase() === email,
  )

  if (!userExists) {
    return NextResponse.json(
      { error: 'USER_NOT_FOUND' },
      { status: 404 },
    )
  }

  // resetPasswordForEmail must use the anon key client — service role key doesn't trigger emails
  const anonClient = getSupabaseTokenVerifierClient()
  const origin = request.headers.get('origin') ?? request.nextUrl.origin
  const { error: resetError } = await anonClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })
  if (resetError) {
    console.error('[api/auth/forgot-password] resetPasswordForEmail:', resetError.message)
    return NextResponse.json({ error: `Failed to send reset email: ${resetError.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
