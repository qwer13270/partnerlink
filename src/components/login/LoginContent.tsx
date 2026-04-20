'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import strings from '@/lib/strings'
import { ArrowRight, Eye, EyeOff, X } from 'lucide-react'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const darkLabel = 'block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2 font-body'
const darkInput = 'w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/60 transition-colors duration-200'

const STATS = [
  { value: '18+',   label: '合作商案' },
  { value: '120+',  label: '合作 KOL' },
  { value: '18.4%', label: '平均轉換率' },
]

interface Props {
  notice?: string
  email?: string
  next?: string
}

export default function LoginContent({ notice, email: emailParam = '', next: nextPath }: Props) {
  const t = strings.login
  const router = useRouter()
  const confirmEmail = emailParam
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(emailParam)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')

    const supabase = getSupabaseBrowserClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || !data.user) {
      const msg = signInError?.message ?? ''
      const translated =
        msg.toLowerCase().includes('invalid login credentials') ||
        msg.toLowerCase().includes('invalid email or password')
          ? '電子郵件或密碼錯誤，請再試一次。'
          : msg || '電子郵件或密碼錯誤，請再試一次。'
      setError(translated)
      setIsSubmitting(false)
      return
    }

    let role = getRoleFromUser(data.user)
    const signupRole = data.user.user_metadata?.signup_role

    if (!role && signupRole === 'kol' && data.session?.access_token) {
      const completeResponse = await fetch('/api/auth/complete-kol-signup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      })
      const completePayload = await completeResponse.json().catch(() => null) as { status?: string; code?: string } | null
      if (completeResponse.ok && completePayload?.status === 'approved') {
        role = 'kol'
      } else if (completePayload?.status === 'pending_admin_review') {
        router.push('/pending-approval'); return
      } else if (completePayload?.status === 'denied') {
        router.push('/pending-approval'); return
      } else if (completePayload?.code === 'MISSING_APPLICATION') {
        router.push('/pending-approval'); return
      }
    } else if (!role && signupRole === 'merchant' && data.session?.access_token) {
      const completeResponse = await fetch('/api/auth/complete-merchant-signup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      })
      const completePayload = await completeResponse.json().catch(() => null) as { status?: string; code?: string } | null
      if (completeResponse.ok && completePayload?.status === 'approved') {
        role = 'merchant'
      } else if (completePayload?.status === 'pending_admin_review') {
        router.push('/merchant-pending-approval'); return
      } else if (completePayload?.status === 'denied') {
        router.push('/merchant-pending-approval'); return
      } else if (completePayload?.code === 'MISSING_APPLICATION') {
        router.push('/merchant-pending-approval'); return
      }
    } else if (!role && data.session?.access_token) {
      const syncResponse = await fetch('/api/auth/sync-role', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      })
      if (syncResponse.ok) {
        const payload = await syncResponse.json().catch(() => null) as { role?: unknown } | null
        if (payload?.role === 'kol' || payload?.role === 'merchant' || payload?.role === 'admin') {
          role = payload.role
        }
      }
    }

    if (!role) {
      if (signupRole === 'kol') { router.push('/pending-approval'); return }
      if (signupRole === 'merchant') { router.push('/merchant-pending-approval'); return }
      await supabase.auth.signOut()
      setError('帳號尚未指派角色，請聯繫管理員。')
      setIsSubmitting(false)
      return
    }

    if (nextPath && nextPath.startsWith('/')) { window.location.href = nextPath; return }
    window.location.href = resolveRoleHomePath(role)
  }

  return (
    <div className="partnerlink-landing fixed inset-0 z-[100] flex overflow-hidden" style={{ background: '#0b0f1a' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 20% 60%, rgba(100,150,255,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(200,220,255,0.8) 0px, rgba(200,220,255,0.8) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(200,220,255,0.8) 0px, rgba(200,220,255,0.8) 1px, transparent 1px, transparent 60px)' }}
        />

        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="relative z-10">
          <Logo />
        </motion.div>

        <div className="space-y-8 relative z-10">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
            <div className="inline-flex items-center liquid-glass rounded-full px-4 py-1.5">
              <span className="text-[10px] tracking-[0.3em] text-white/60 font-body uppercase">品牌聯盟推廣平台</span>
            </div>
            <h1 className="font-heading italic text-white text-5xl leading-[0.95] tracking-tight">
              品牌推廣<br /><span className="text-white/60">新模式</span>
            </h1>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="liquid-glass rounded-xl p-4">
                <p className="font-heading italic text-white text-2xl">{s.value}</p>
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp} className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-body relative z-10">
          © {new Date().getFullYear()} PartnerLink
        </motion.p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col overflow-auto relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(100,150,255,0.05) 0%, transparent 60%)' }}
        />

        <div className="flex items-center justify-between px-8 pt-8 relative z-10">
          <Logo className="lg:hidden" size="sm" />
          <div className="hidden lg:block" />
          <Link
            href="/"
            aria-label="返回首頁"
            className="liquid-glass rounded-full flex items-center justify-center w-9 h-9 text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-16 relative z-10">
          <div className="w-full max-w-sm">

            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
              <h2 className="font-heading italic text-white text-4xl">{t.title}</h2>
              <p className="font-body text-sm text-white/60 mt-2">{t.subtitle}</p>
            </motion.div>

            {notice === 'confirm-email' && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-xs text-white/50 font-body">
                已寄送驗證信到 {confirmEmail ?? '你的信箱'}，請先完成驗證後再登入。
              </motion.p>
            )}

            {notice === 'complete-kol-application' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 liquid-glass rounded-lg px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-body">KOL 申請提醒</p>
                <p className="mt-2 text-xs leading-relaxed text-white/60 font-body">
                  登入成功後，系統才會正式送出你的 KOL 申請並進入審核流程。
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <label className={darkLabel} htmlFor="email">{t.email}</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={darkInput}
                />
              </motion.div>

              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <div className="flex items-center justify-between">
                  <label className={darkLabel} htmlFor="password">{t.password}</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors duration-200 font-body"
                  >
                    忘記密碼？
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${darkInput} pr-8`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-0 bottom-3 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 -mt-2 font-body">
                  {error}
                </motion.p>
              )}

              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative overflow-hidden w-full flex items-center justify-between px-6 py-3.5 bg-white text-black rounded-full text-sm font-body font-medium hover:bg-white/90 disabled:opacity-50 transition-colors duration-300"
                >
                  {isSubmitting && (
                    <motion.span
                      initial={{ x: '-120%' }}
                      animate={{ x: '120%' }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      className="pointer-events-none absolute inset-y-0 w-1/3 bg-black/10 blur-sm"
                    />
                  )}
                  <span>{isSubmitting ? '登入中...' : t.signIn}</span>
                  <motion.span
                    animate={isSubmitting ? { x: [0, 4, 0] } : { x: 0 }}
                    transition={isSubmitting ? { repeat: Infinity, duration: 0.7, ease: 'easeInOut' } : undefined}
                  >
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.span>
                </button>
              </motion.div>
            </form>

            <motion.p custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mt-10 text-xs text-white/50 text-center font-body">
              {t.noAccount}{' '}
              <Link href="/signup" className="text-white underline underline-offset-4 hover:text-white/70 transition-colors duration-200">
                {t.getStarted}
              </Link>
            </motion.p>

          </div>
        </div>
      </div>
    </div>
  )
}
