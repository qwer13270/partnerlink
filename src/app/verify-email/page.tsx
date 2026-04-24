'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, MailCheck } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const notice = searchParams.get('notice')
  const safeEmail = email?.trim() || ''

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    const prevBody = document.body.style.backgroundColor
    const prevHtml = document.documentElement.style.backgroundColor
    document.body.style.backgroundColor = '#000'
    document.documentElement.style.backgroundColor = '#000'
    return () => {
      document.body.style.backgroundColor = prevBody
      document.documentElement.style.backgroundColor = prevHtml
    }
  }, [])

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

  const loginHref = `/login${safeEmail || notice ? `?${new URLSearchParams({
    ...(safeEmail ? { email: safeEmail } : {}),
    ...(notice ? { notice } : {}),
  }).toString()}` : ''}`

  return (
    <main className="partnerlink-landing relative -mt-16 min-h-screen overflow-hidden bg-black px-6 pt-40 pb-24 md:px-10">
      {/* radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(100,150,255,0.10) 0%, transparent 70%)',
        }}
      />
      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 30%, transparent 80%)',
        }}
      />

      <section className="relative mx-auto max-w-xl">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="liquid-glass rounded-2xl p-8 md:p-10 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="liquid-glass-strong inline-flex h-10 w-10 items-center justify-center !rounded-full text-white/85">
                <MailCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 font-body">
                  Email Verification
                </p>
                <span className="liquid-glass mt-1 inline-flex items-center gap-2 !rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/75 font-body">
                  <span className="relative inline-flex w-2 h-2 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-sky-300/80 animate-ping opacity-70" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-sky-300/80" />
                  </span>
                  Awaiting Verification
                </span>
              </div>
            </div>

            {/* Title + body */}
            <div>
              <h1 className="font-heading text-white text-3xl leading-[1.1] md:text-[2.4rem]">
                請先驗證 <span className="italic">Email</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed font-body font-light text-white/65">
                我們已將驗證信寄到你的信箱。完成驗證後，點擊下方按鈕回到登入頁進入對應角色的首頁。
              </p>
            </div>

            {/* Email chip */}
            {safeEmail && (
              <div className="liquid-glass inline-flex items-center gap-2 !rounded-full px-3 py-1.5">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/55 font-body">
                  Sent to
                </span>
                <span className="text-sm font-medium text-white/90 font-body">{safeEmail}</span>
              </div>
            )}

            {/* Actions */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <Link
                href={loginHref}
                className="group inline-flex items-center gap-2 rounded-full bg-white text-black font-body font-medium text-sm px-5 py-2.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-150"
              >
                <span>回到登入</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {safeEmail && resendState !== 'sent' && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendState === 'sending'}
                  className="liquid-glass-strong inline-flex items-center gap-2 !rounded-full px-5 py-2.5 text-sm font-body font-medium text-white hover:text-white disabled:opacity-60"
                >
                  {resendState === 'sending'
                    ? '寄送中…'
                    : resendState === 'error'
                      ? '寄送失敗，請重試'
                      : '重新寄送驗證信'}
                </button>
              )}
            </motion.div>

            {safeEmail && resendState === 'sent' && (
              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="relative inline-flex w-2 h-2 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-sky-300/80 animate-ping opacity-70" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-sky-300/80" />
                  </span>
                  <p className="text-sm font-body font-light text-white/80">
                    驗證信已重新寄出，請查收信箱。
                  </p>
                </div>
              </motion.div>
            )}

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-xs font-body text-white/50 leading-relaxed"
            >
              若沒有收到信，請檢查垃圾郵件夾，或點擊上方按鈕重新寄送。
            </motion.p>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
