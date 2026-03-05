import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { AppRole } from '@/lib/auth'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env'

function requiredRoleForPath(pathname: string): AppRole | null {
  if (pathname === '/kol' || pathname.startsWith('/kol/')) return 'kol'
  if (pathname === '/merchant' || pathname.startsWith('/merchant/')) return 'merchant'
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin'
  return null
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  destinationPath: string,
) {
  const url = new URL(destinationPath, request.url)
  const redirect = NextResponse.redirect(url)
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie)
  }
  return redirect
}

export async function middleware(request: NextRequest) {
  const requiredRole = requiredRoleForPath(request.nextUrl.pathname)
  if (!requiredRole) return NextResponse.next()

  let response = NextResponse.next({ request })

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

          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options as CookieOptions)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return redirectWithCookies(request, response, loginUrl.toString())
  }

  const role = getRoleFromUser(user)
  if (!role) {
    return redirectWithCookies(request, response, '/login')
  }

  if (role !== requiredRole) {
    return redirectWithCookies(request, response, resolveRoleHomePath(role))
  }

  return response
}

export const config = {
  matcher: ['/kol/:path*', '/merchant/:path*', '/admin/:path*'],
}
