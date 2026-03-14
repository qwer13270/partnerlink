'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error_code')
  const isOtpExpired = errorCode === 'otp_expired'

  const [email, setEmail] = useState('')
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResend = async () => {
    if (!email.trim()) return
    setResendState('sending')
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
        },
      })
      setResendState(error ? 'error' : 'sent')
    } catch {
      setResendState('error')
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-serif text-[#1A1A1A]">登入驗證發生錯誤</h1>

        {isOtpExpired ? (
          <>
            <p className="text-sm text-[#6B6560]">
              驗證連結已過期或已使用過。請輸入你的信箱重新寄送驗證信。
            </p>
            {resendState === 'sent' ? (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3">
                驗證信已重新寄出，請查收信箱。
              </p>
            ) : (
              <div className="space-y-2 text-left">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-[#E8E4DF] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#A89F97] focus:outline-none focus:border-[#1A1A1A]"
                />
                {resendState === 'error' && (
                  <p className="text-xs text-red-600">寄送失敗，請稍後再試。</p>
                )}
                <button
                  onClick={handleResend}
                  disabled={resendState === 'sending' || !email.trim()}
                  className="w-full px-5 py-3 text-sm uppercase tracking-widest bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#2A2A2A] transition-colors duration-300 disabled:opacity-50"
                >
                  {resendState === 'sending' ? '寄送中…' : '重新寄送驗證信'}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-[#6B6560]">
            很抱歉，我們在處理你的登入驗證連結時發生問題。請重新嘗試登入，或從登入頁面重新寄送驗證信。
          </p>
        )}

        <Link
          href="/login"
          className="inline-flex items-center justify-center px-5 py-3 mt-2 text-sm uppercase tracking-widest bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#2A2A2A] transition-colors duration-300"
        >
          回到登入
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-[#6B6560]">請稍候…</p>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
