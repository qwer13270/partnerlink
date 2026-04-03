import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const SEVEN_DAYS_AGO = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

// ── GET /api/notifications ────────────────────────────────────────────────────
// Returns the authenticated user's notifications from the last 7 days.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ notifications: [] })

  const admin = getSupabaseAdminClient()
  const { data } = await admin
    .from('notifications')
    .select('id, type, title, href, created_at')
    .eq('user_id', user.id)
    .gte('created_at', SEVEN_DAYS_AGO())
    .order('created_at', { ascending: false })
    .limit(30)

  return NextResponse.json({ notifications: data ?? [] })
}
