'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, MailCheck } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const safeEmail = email?.trim() || ''

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResend = async () => {
    if (!safeEmail) return
    setResendState('sending')
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: safeEmail,
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
    <div className="fixed inset-0 z-[100] flex overflow-hidden bg-[#FAF9F6]">
      <div className="hidden lg:flex lg:w-[42%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />
        <Link href="/" className="inline-flex items-center gap-3 relative z-10">
          <span className="text-[#FAF9F6] text-lg font-semibold tracking-tight">PartnerLink</span>
          <span className="text-[#6B6560] text-sm tracking-widest">夥伴</span>
        </Link>
        <div className="space-y-4 relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">Email Verification</p>
          <h1 className="text-4xl font-serif text-[#FAF9F6] leading-[1.12]">
            完成最後一步
            <br />
            啟用你的帳號
          </h1>
          <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">
            我們已寄出驗證信。完成驗證後即可返回登入並進入對應角色的首頁。
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#3A3A3A] relative z-10">
          © {new Date().getFullYear()} PartnerLink
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-12">
        <div className="w-full max-w-md border border-[#E8E4DF] bg-white/60 backdrop-blur-sm p-8 md:p-10">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <div className="w-12 h-12 border border-[#E8E4DF] flex items-center justify-center mb-5">
              <MailCheck className="h-5 w-5 text-[#1A1A1A]" />
            </div>
            <h2 className="text-3xl font-serif text-[#1A1A1A]">請先驗證 Email</h2>
            <p className="text-sm text-[#6B6560] mt-3 leading-relaxed">
              驗證信已寄到{' '}
              {safeEmail
                ? <span className="text-[#1A1A1A]">{safeEmail}</span>
                : '你的信箱'
              }。
              完成驗證後，點擊下方按鈕回到登入頁。
            </p>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
            <Link
              href={`/login${safeEmail ? `?email=${encodeURIComponent(safeEmail)}` : ''}`}
              className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors duration-300"
            >
              <span>回到登入</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {safeEmail && (
              resendState === 'sent' ? (
                <p className="text-xs text-center text-green-700 bg-green-50 border border-green-200 px-4 py-3">
                  驗證信已重新寄出，請查收信箱。
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendState === 'sending'}
                  className="w-full px-6 py-3 border border-[#E8E4DF] text-sm text-[#6B6560] uppercase tracking-widest hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors duration-300 disabled:opacity-50"
                >
                  {resendState === 'sending' ? '寄送中…' : resendState === 'error' ? '寄送失敗，請重試' : '重新寄送驗證信'}
                </button>
              )
            )}
          </motion.div>

          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mt-5 text-xs text-[#6B6560]">
            若沒有收到信，請檢查垃圾郵件夾，或點擊上方按鈕重新寄送。
          </motion.p>
        </div>
      </div>
    </div>
  )
}
