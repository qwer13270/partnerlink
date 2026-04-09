'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const url = new URL(window.location.href)
    const params = url.searchParams
    // Hash fragment is only visible in the browser, not on the server
    const hash = new URLSearchParams(url.hash.slice(1))

    // Handle errors from either query params or hash (Supabase puts errors in both)
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

    const finish = (email: string) => {
      if (isRecovery || next === '/auth/reset-password') {
        router.replace('/auth/reset-password')
        return
      }
      router.replace(`/auth/confirmed${email ? `?email=${encodeURIComponent(email)}` : ''}`)
    }

    if (accessToken) {
      // Implicit flow — token arrives in the hash fragment (never sent to server)
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data, error }) => {
        if (error || !data.session) { router.replace('/auth/error?error_code=session_failed'); return }
        finish(data.session.user.email ?? '')
      })
    } else if (code) {
      // PKCE flow fallback — exchange code using browser client
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error || !data.session) { router.replace('/auth/error?error_code=exchange_failed'); return }
        finish(data.session.user.email ?? '')
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
