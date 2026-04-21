import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { completeSignupForUser } from '@/lib/server/complete-signup'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const params = url.searchParams

  const errorCode = params.get('error_code') ?? params.get('error')
  if (errorCode) {
    return redirectTo(request, `/auth/error?error_code=${encodeURIComponent(errorCode)}`)
  }

  const code = params.get('code')
  const next = params.get('next')
  const type = params.get('type')
  const isRecovery = type === 'recovery' || next === '/auth/reset-password'

  if (!code) {
    return redirectTo(request, '/auth/error?error_code=no_token')
  }

  let response = NextResponse.redirect(new URL('/', request.url))
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options as CookieOptions)
          }
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error?.message)
    return redirectTo(request, '/auth/error?error_code=exchange_failed')
  }

  const user = data.session.user

  if (isRecovery) {
    return redirectWithCookies(response, request, '/auth/reset-password')
  }

  const role = getRoleFromUser(user)
  if (role) {
    const target = next && next.startsWith('/') ? next : resolveRoleHomePath(role)
    return redirectWithCookies(response, request, target)
  }

  const urlSignupRole = params.get('signup_role')
  const metaSignupRole = user.user_metadata?.signup_role
  const signupRole =
    metaSignupRole === 'kol' || metaSignupRole === 'merchant'
      ? metaSignupRole
      : urlSignupRole === 'kol' || urlSignupRole === 'merchant'
        ? urlSignupRole
        : null

  if (signupRole) {
    const result = await completeSignupForUser(user, signupRole)

    if (result.ok && result.status === 'approved') {
      return redirectWithCookies(response, request, resolveRoleHomePath(signupRole))
    }
    if (result.ok && result.status === 'pending_admin_review') {
      return redirectWithCookies(
        response,
        request,
        signupRole === 'kol' ? '/pending-approval' : '/merchant-pending-approval',
      )
    }
    if ('status' in result && result.status === 'denied') {
      return redirectWithCookies(
        response,
        request,
        signupRole === 'kol' ? '/pending-approval' : '/merchant-pending-approval',
      )
    }
    if ('code' in result && result.code === 'INTERNAL') {
      console.error('[auth/callback] completeSignupForUser failed:', result.error)
    }
    const completePath = `/signup/complete?signup_role=${signupRole}`
    return redirectWithCookies(response, request, completePath)
  }

  const fallbackPath = urlSignupRole === 'kol' || urlSignupRole === 'merchant'
    ? `/signup/complete?signup_role=${urlSignupRole}`
    : '/signup/complete'
  return redirectWithCookies(response, request, fallbackPath)
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url))
}

function redirectWithCookies(
  source: NextResponse,
  request: NextRequest,
  path: string,
) {
  const target = NextResponse.redirect(new URL(path, request.url))
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }
  return target
}
