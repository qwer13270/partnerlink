import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  // Forward any Supabase errors to our error page
  if (error || errorCode) {
    const params = new URLSearchParams()
    if (errorCode) params.set('error_code', errorCode)
    if (errorDescription) params.set('error_description', errorDescription)
    return NextResponse.redirect(`${origin}/auth/error?${params}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  // Collect cookies that the server client wants to set
  const pendingCookies: Array<{ name: string; value: string; options: CookieOptions }> = []

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          pendingCookies.push(...(cookiesToSet as typeof pendingCookies))
        },
      },
    },
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.session) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const email = data.session.user.email ?? ''
  const emailParam = email ? `?email=${encodeURIComponent(email)}` : ''
  const response = NextResponse.redirect(`${origin}/auth/confirmed${emailParam}`)

  // Apply session cookies to the redirect response
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options)
  }

  return response
}
