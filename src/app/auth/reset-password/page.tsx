'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const email = searchParams.get('email')
  const safeEmail = email?.trim() || '你的信箱'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Placeholder: Supabase password reset logic will be added later.
    // For now, just return to login.
    router.push(`/login?email=${encodeURIComponent(safeEmail)}`)
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-serif text-[#1A1A1A]">重設密碼</h1>
          <p className="text-sm text-[#6B6560]">
            為 <span className="text-[#1A1A1A]">{safeEmail}</span> 設定一組新的登入密碼。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#8A837B] mb-2">
              新的密碼
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E8E4DF] bg-white px-3 py-2 text-sm text-[#1A1A1A] outline-none focus-visible:ring-1 focus-visible:ring-[#1A1A1A]"
              placeholder="請輸入至少 6 個字元"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || password.length < 6}
            className="w-full px-5 py-3 text-sm uppercase tracking-widest bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors duration-300"
          >
            {submitting ? '送出中…' : '更新密碼並前往登入'}
          </button>
        </form>
      </div>
    </div>
  )
}

