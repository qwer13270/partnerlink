'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export const PENDING_SIGNUP_ROLE_KEY = 'partnerlink:pending_signup_role'

// Flip to true once Google OAuth is configured in Supabase + Google Cloud
// (see docs/GOOGLE-OAUTH-SETUP.md). While false, the button renders disabled
// with a "coming soon" label so the UI already shows the option.
const GOOGLE_OAUTH_ENABLED = false

interface Props {
  mode: 'signin' | 'signup'
  signupRole?: 'kol' | 'merchant'
  className?: string
  nextPath?: string
}

export default function GoogleSignInButton({ mode, signupRole, className, nextPath }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    if (signupRole) {
      try { sessionStorage.setItem(PENDING_SIGNUP_ROLE_KEY, signupRole) } catch {}
    } else {
      try { sessionStorage.removeItem(PENDING_SIGNUP_ROLE_KEY) } catch {}
    }

    const supabase = getSupabaseBrowserClient()
    const origin = window.location.origin
    const callbackUrl = new URL('/auth/callback', origin)
    if (nextPath) callbackUrl.searchParams.set('next', nextPath)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: { prompt: 'select_account' },
      },
    })

    if (oauthError) {
      setError(oauthError.message || '無法連線至 Google，請稍後再試。')
      setLoading(false)
    }
  }

  const label = mode === 'signin' ? '使用 Google 登入' : '使用 Google 繼續'

  if (!GOOGLE_OAUTH_ENABLED) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          title="即將推出"
          aria-disabled="true"
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-white/10 bg-white/5 text-sm font-body text-white/40 cursor-not-allowed"
        >
          <GoogleLogo muted />
          <span>{label}</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 ml-1">即將推出</span>
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-sm font-body text-white transition-colors duration-200"
      >
        <GoogleLogo />
        <span>{loading ? '連線中…' : label}</span>
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 font-body">{error}</p>
      )}
    </div>
  )
}

function GoogleLogo({ muted = false }: { muted?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={muted ? { opacity: 0.5, filter: 'grayscale(1)' } : undefined}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.8 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.8 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.7 0 10.8-2.1 14.7-5.5l-6.8-5.6c-2 1.4-4.6 2.3-7.9 2.3-5.3 0-9.7-3.3-11.3-8l-6.6 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2.1 4-3.9 5.3l6.8 5.6c-.5.4 7.4-5.4 7.4-14.9 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}
