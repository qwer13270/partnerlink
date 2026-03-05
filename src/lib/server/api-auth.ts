import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { AppRole } from '@/lib/auth'
import { getRoleFromUser } from '@/lib/auth'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env'
import { getSupabaseTokenVerifierClient } from '@/lib/supabase/admin'

type ApiAuthResult =
  | { ok: true; user: User; role: AppRole | null }
  | { ok: false; response: NextResponse<{ error: string }> }

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7).trim()
}

export async function requireApiUser(request: NextRequest): Promise<ApiAuthResult> {
  const token = getBearerToken(request)

  if (token) {
    const verifier = getSupabaseTokenVerifierClient()
    const {
      data: { user },
      error,
    } = await verifier.auth.getUser(token)

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      }
    }

    return { ok: true, user, role: getRoleFromUser(user) }
  }

  let response = NextResponse.next()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          response = NextResponse.next()
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options as CookieOptions)
          }
        },
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true, user, role: getRoleFromUser(user) }
}

export async function requireApiRole(
  request: NextRequest,
  roles: AppRole[],
): Promise<ApiAuthResult> {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth

  if (!auth.role || !roles.includes(auth.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return auth
}
