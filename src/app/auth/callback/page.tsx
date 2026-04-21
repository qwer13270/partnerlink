'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { PENDING_SIGNUP_ROLE_KEY } from '@/components/auth/GoogleSignInButton'
import type { Session } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const url = new URL(window.location.href)
    const params = url.searchParams
    const hash = new URLSearchParams(url.hash.slice(1))

    const errorCode =
      params.get('error_code') ?? hash.get('error_code') ?? params.get('error') ?? hash.get('error')
    if (errorCode) {
      router.replace(`/auth/error?error_code=${encodeURIComponent(errorCode)}`)
      return
    }

    const supabase = getSupabaseBrowserClient()
    const code = params.get('code')
    const accessToken = hash.get('access_token')
    const refreshToken = hash.get('refresh_token') ?? ''

    const next = params.get('next')
    const tokenType = hash.get('type') ?? params.get('type')
    const isRecovery = tokenType === 'recovery'

    const routeRecovery = () => {
      router.replace('/auth/reset-password')
    }

    const routeAfterSession = async (session: Session) => {
      const user = session.user
      const token = session.access_token
      const role = getRoleFromUser(user)

      if (role) {
        if (next && next.startsWith('/')) { window.location.href = next; return }
        window.location.href = resolveRoleHomePath(role)
        return
      }

      const metaSignupRole = typeof user.user_metadata?.signup_role === 'string'
        ? user.user_metadata.signup_role
        : ''
      const storedSignupRole = (() => {
        try { return sessionStorage.getItem(PENDING_SIGNUP_ROLE_KEY) ?? '' } catch { return '' }
      })()
      const signupRole = metaSignupRole || storedSignupRole

      if (signupRole === 'kol') {
        const res = await fetch('/api/auth/complete-kol-signup', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await res.json().catch(() => null) as { status?: string; code?: string } | null
        if (res.ok && payload?.status === 'approved') {
          window.location.href = resolveRoleHomePath('kol')
          return
        }
        if (payload?.status === 'pending_admin_review' || payload?.status === 'denied') {
          router.replace('/pending-approval')
          return
        }
        if (payload?.code === 'MISSING_APPLICATION') {
          router.replace('/signup/complete')
          return
        }
        router.replace('/signup/complete')
        return
      }

      if (signupRole === 'merchant') {
        const res = await fetch('/api/auth/complete-merchant-signup', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await res.json().catch(() => null) as { status?: string; code?: string } | null
        if (res.ok && payload?.status === 'approved') {
          window.location.href = resolveRoleHomePath('merchant')
          return
        }
        if (payload?.status === 'pending_admin_review' || payload?.status === 'denied') {
          router.replace('/merchant-pending-approval')
          return
        }
        if (payload?.code === 'MISSING_APPLICATION') {
          router.replace('/signup/complete')
          return
        }
        router.replace('/signup/complete')
        return
      }

      // Brand-new OAuth user with no role and no signup_role hint.
      router.replace('/signup/complete')
    }

    const finish = async (session: Session | null, emailForRecovery: string) => {
      if (isRecovery || next === '/auth/reset-password') { routeRecovery(); return }
      if (!session) {
        router.replace(`/auth/confirmed${emailForRecovery ? `?email=${encodeURIComponent(emailForRecovery)}` : ''}`)
        return
      }
      await routeAfterSession(session)
    }

    if (accessToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data, error }) => {
        if (error || !data.session) { router.replace('/auth/error?error_code=session_failed'); return }
        void finish(data.session, data.session.user.email ?? '')
      })
    } else if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error || !data.session) { router.replace('/auth/error?error_code=exchange_failed'); return }
        void finish(data.session, data.session.user.email ?? '')
      })
    } else {
      router.replace('/auth/error?error_code=no_token')
    }
  }, [router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <p className="text-sm text-[#6B6560]">正在為你完成登入流程，請稍候…</p>
    </div>
  )
}
