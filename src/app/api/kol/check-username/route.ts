import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username') ?? ''

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ available: false, error: 'Invalid format.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  // Calls a Postgres function that queries auth.users metadata (service role only)
  const { data, error } = await admin.rpc('check_kol_username_taken', { p_username: username })

  if (error) {
    return NextResponse.json({ error: 'Failed to check username.' }, { status: 500 })
  }

  return NextResponse.json({ available: !data })
}
