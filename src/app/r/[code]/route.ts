import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

// Cookie names
const REF_COOKIE = 'hk_ref'   // 30-day attribution window
const SID_COOKIE = 'hk_sid'   // Long-lived session id for dedup

// ── GET /r/[code] ─────────────────────────────────────────────────────────────
// 1. Look up the referral link by short_code
// 2. Log the click (best-effort, never blocks the redirect)
// 3. Set attribution + session cookies
// 4. Redirect to the property page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const admin     = getSupabaseAdminClient()

  // ── 1. Resolve the link ──────────────────────────────────────────────────
  const { data: link } = await admin
    .from('referral_links')
    .select('id, is_active, project_id')
    .eq('short_code', code)
    .maybeSingle()

  if (!link) {
    // Unknown code — send to home
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Resolve project slug
  const { data: property } = await admin
    .from('properties')
    .select('slug')
    .eq('id', link.project_id)
    .maybeSingle()

  const destination = property?.slug
    ? `/properties/${property.slug}`
    : '/'

  // ── 2. Session id ────────────────────────────────────────────────────────
  // Re-use existing session id or mint a new one for deduplication
  const existingSessionId = request.cookies.get(SID_COOKIE)?.value ?? null
  const sessionId         = existingSessionId ?? crypto.randomUUID()
  const isNewSession      = !existingSessionId

  // ── 3. Log the click (best-effort) ──────────────────────────────────────
  if (link.is_active) {
    const ipRaw    = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                  ?? request.headers.get('x-real-ip')
                  ?? null
    const ipHash   = ipRaw ? await sha256(ipRaw) : null
    const userAgent = request.headers.get('user-agent') ?? null

    // Fire-and-forget — don't await, never delay the redirect
    admin.from('referral_clicks').insert({
      referral_link_id: link.id,
      ip_hash:          ipHash,
      user_agent:       userAgent,
      session_id:       sessionId,
    }).then(({ error }) => {
      if (error) console.error('[/r] click log error:', error.message)
    })
  }

  // ── 4. Build redirect response with cookies ──────────────────────────────
  const response = NextResponse.redirect(new URL(destination, request.url))

  // Attribution cookie — 30 days
  response.cookies.set(REF_COOKIE, code, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 30, // 30 days in seconds
  })

  // Session cookie — 2 years (only set if it didn't exist)
  if (isNewSession) {
    response.cookies.set(SID_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 365 * 2, // 2 years
    })
  }

  return response
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const hashBuf = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
